export const dynamic = 'force-dynamic';

import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/utils/supabase/queries';

/** GET /api/calendar/events — list all events for the authenticated user's org */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    let query = (supabase as any)
      .from('compliance_calendar_events')
      .select('*')
      .eq('org_id', (org as any).id)
      .neq('status', 'cancelled')
      .order('due_date', { ascending: true });

    if (from) query = query.gte('due_date', from);
    if (to) query = query.lte('due_date', to);

    const { data: events, error } = await query;
    if (error) throw error;

    return NextResponse.json({ events: events ?? [] });
  } catch (e) {
    console.error('[calendar/events GET]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/** POST /api/calendar/events — create a new event */
export async function POST(request: NextRequest) {
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
    const { title, event_type, due_date, end_date, assigned_to, notes, recurrence, recurrence_interval_days, location, source_type, source_id } = body;

    if (!title || !due_date) {
      return NextResponse.json({ error: 'title and due_date are required' }, { status: 400 });
    }

    const { data: event, error } = await (supabase as any)
      .from('compliance_calendar_events')
      .insert({
        org_id: (org as any).id,
        title,
        event_type: event_type ?? 'custom',
        status: 'upcoming',
        due_date,
        end_date: end_date ?? null,
        assigned_to: assigned_to ?? null,
        notes: notes ?? null,
        recurrence: recurrence ?? 'none',
        recurrence_interval_days: recurrence_interval_days ?? null,
        location: location ?? null,
        source_type: source_type ?? null,
        source_id: source_id ?? null,
        is_auto_generated: false,
      })
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await (supabase as any).from('calendar_event_activity').insert({
      event_id: event.id,
      user_id: user.id,
      action: 'created',
      note: 'Event created manually',
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (e) {
    console.error('[calendar/events POST]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
