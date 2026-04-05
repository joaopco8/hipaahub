export const dynamic = 'force-dynamic';

import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/utils/supabase/queries';

/** POST /api/calendar/events/[id]/snooze — snooze an event to a new date */
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

    const { snooze_until, reason } = await request.json();
    if (!snooze_until) {
      return NextResponse.json({ error: 'snooze_until date is required' }, { status: 400 });
    }

    const now = new Date().toISOString();

    const { data: event, error } = await (supabase as any)
      .from('compliance_calendar_events')
      .update({
        due_date: snooze_until,
        snoozed_until: snooze_until,
        snooze_reason: reason ?? null,
        status: 'snoozed',
        updated_at: now,
      })
      .eq('id', params.id)
      .eq('org_id', (org as any).id)
      .select()
      .single();

    if (error) throw error;

    await (supabase as any).from('calendar_event_activity').insert({
      event_id: params.id,
      user_id: user.id,
      action: 'snoozed',
      note: `Snoozed until ${snooze_until}${reason ? ` — ${reason}` : ''}`,
    });

    return NextResponse.json({ event });
  } catch (e) {
    console.error('[calendar/snooze POST]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
