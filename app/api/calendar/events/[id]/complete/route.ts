export const dynamic = 'force-dynamic';

import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/utils/supabase/queries';

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function nextOccurrenceDate(dueDate: Date, recurrence: string, intervalDays?: number): Date | null {
  switch (recurrence) {
    case 'annual':
      return addMonths(dueDate, 12);
    case 'quarterly':
      return addMonths(dueDate, 3);
    case 'monthly':
      return addMonths(dueDate, 1);
    case 'custom':
      return intervalDays ? addDays(dueDate, intervalDays) : null;
    default:
      return null;
  }
}

/** POST /api/calendar/events/[id]/complete — mark event complete, schedule next occurrence */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const user = await getUser(supabase);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('user_id', user.id)
      .single();
    if (!org) return NextResponse.json({ error: 'Organization not found' }, { status: 404 });

    const { data: event, error: fetchErr } = await (supabase as any)
      .from('compliance_calendar_events')
      .select('*')
      .eq('id', params.id)
      .eq('org_id', (org as any).id)
      .single();

    if (fetchErr || !event) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const now = new Date().toISOString();

    // Mark complete
    await (supabase as any)
      .from('compliance_calendar_events')
      .update({
        status: 'complete',
        completed_at: now,
        completed_by: user.id,
        updated_at: now,
      })
      .eq('id', params.id);

    // Log activity
    await (supabase as any).from('calendar_event_activity').insert({
      event_id: params.id,
      user_id: user.id,
      action: 'completed',
      note: `Marked complete by user`,
    });

    // Schedule next occurrence if recurring
    const dueDate = new Date(event.due_date);
    const nextDate = nextOccurrenceDate(dueDate, event.recurrence, event.recurrence_interval_days);
    let nextEvent = null;

    if (nextDate) {
      const { data: created } = await (supabase as any)
        .from('compliance_calendar_events')
        .insert({
          org_id: (org as any).id,
          title: event.title,
          event_type: event.event_type,
          status: 'upcoming',
          due_date: nextDate.toISOString().split('T')[0],
          assigned_to: event.assigned_to,
          notes: event.notes,
          recurrence: event.recurrence,
          recurrence_interval_days: event.recurrence_interval_days,
          source_type: event.source_type,
          source_id: event.source_id,
          is_auto_generated: event.is_auto_generated,
          parent_event_id: event.id,
        })
        .select()
        .single();
      nextEvent = created;

      if (created) {
        await (supabase as any).from('calendar_event_activity').insert({
          event_id: created.id,
          user_id: user.id,
          action: 'created',
          note: `Auto-created as next occurrence after completing parent event`,
        });
      }
    }

    // Downstream sync: update source records
    if (event.source_type === 'baa' && event.source_id) {
      await (supabase as any)
        .from('baas')
        .update({ status: 'active', updated_at: now })
        .eq('id', event.source_id)
        .eq('org_id', (org as any).id);
    } else if (event.source_type === 'policy' && event.source_id) {
      const nextReview = nextDate ?? addMonths(dueDate, 12);
      await (supabase as any)
        .from('policy_generation_status')
        .update({ next_review_date: nextReview.toISOString().split('T')[0], updated_at: now })
        .eq('policy_document_id', event.source_id)
        .eq('organization_id', (org as any).id);
    } else if (event.source_type === 'training' && event.source_id) {
      const nextExpiry = nextDate ?? addMonths(dueDate, 12);
      await (supabase as any)
        .from('training_assignments')
        .update({ expires_at: nextExpiry.toISOString(), updated_at: now })
        .eq('id', event.source_id)
        .eq('org_id', (org as any).id);
    }

    return NextResponse.json({
      ok: true,
      next_event: nextEvent,
      next_date: nextDate ? nextDate.toISOString().split('T')[0] : null,
    });
  } catch (e) {
    console.error('[calendar/complete POST]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
