export const dynamic = 'force-dynamic';

import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/utils/supabase/queries';

/** PATCH /api/calendar/events/[id] — update an event */
export async function PATCH(
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

    const body = await request.json();
    const allowed = ['title', 'event_type', 'status', 'due_date', 'end_date', 'assigned_to', 'notes', 'recurrence', 'recurrence_interval_days', 'location'];
    const patch: Record<string, any> = { updated_at: new Date().toISOString() };
    for (const k of allowed) {
      if (k in body) patch[k] = body[k];
    }

    const { data: event, error } = await (supabase as any)
      .from('compliance_calendar_events')
      .update(patch)
      .eq('id', params.id)
      .eq('org_id', (org as any).id)
      .select()
      .single();

    if (error) throw error;

    // Log status change if status was updated
    if ('status' in body) {
      await (supabase as any).from('calendar_event_activity').insert({
        event_id: params.id,
        user_id: user.id,
        action: 'status_changed',
        note: `Status changed to ${body.status}`,
      });
    }

    return NextResponse.json({ event });
  } catch (e) {
    console.error('[calendar/events PATCH]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/** DELETE /api/calendar/events/[id] — delete a custom event only */
export async function DELETE(
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

    // Only allow deleting custom events
    const { data: existing } = await (supabase as any)
      .from('compliance_calendar_events')
      .select('id, event_type, is_auto_generated')
      .eq('id', params.id)
      .eq('org_id', (org as any).id)
      .single();

    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (existing.is_auto_generated) {
      return NextResponse.json({ error: 'Auto-generated events cannot be deleted. Use snooze instead.' }, { status: 403 });
    }

    const { error } = await (supabase as any)
      .from('compliance_calendar_events')
      .delete()
      .eq('id', params.id)
      .eq('org_id', (org as any).id);

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[calendar/events DELETE]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/** GET /api/calendar/events/[id] — get event with activity log */
export async function GET(
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

    const { data: event, error } = await (supabase as any)
      .from('compliance_calendar_events')
      .select('*')
      .eq('id', params.id)
      .eq('org_id', (org as any).id)
      .single();

    if (error || !event) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const { data: activity } = await (supabase as any)
      .from('calendar_event_activity')
      .select('*')
      .eq('event_id', params.id)
      .order('created_at', { ascending: false });

    return NextResponse.json({ event, activity: activity ?? [] });
  } catch (e) {
    console.error('[calendar/events GET id]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
