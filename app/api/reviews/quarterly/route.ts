export const dynamic = 'force-dynamic';

import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/utils/supabase/queries';

const AGENDA_SECTIONS = [
  { type: 'roll_call',             label: 'Roll Call',                     order: 1 },
  { type: 'compliance_score',      label: 'Compliance Score Review',       order: 2 },
  { type: 'policy_status',         label: 'Policy Status Update',          order: 3 },
  { type: 'training_status',       label: 'Staff Training Status',         order: 4 },
  { type: 'baa_vendor',            label: 'BAA & Vendor Review',           order: 5 },
  { type: 'risk_assessment',       label: 'Risk Assessment & Open Items',  order: 6 },
  { type: 'incidents',             label: 'Incident Review',               order: 7 },
  { type: 'calendar_events',       label: 'Upcoming Calendar Events',      order: 8 },
  { type: 'previous_action_items', label: 'Previous Action Items',         order: 9 },
];

/** GET /api/reviews/quarterly — list all reviews for the org */
export async function GET(_req: NextRequest) {
  try {
    const supabase = createClient();
    const user = await getUser(supabase);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('user_id', user.id)
      .single();
    if (!org) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const { data: reviews } = await (supabase as any)
      .from('quarterly_reviews')
      .select('*')
      .eq('org_id', (org as any).id)
      .neq('status', 'cancelled')
      .order('year', { ascending: false })
      .order('quarter', { ascending: false });

    // For each review, fetch attendees and action item counts
    const enriched = await Promise.all(
      (reviews ?? []).map(async (r: any) => {
        const [attendeesRes, actionItemsRes] = await Promise.all([
          (supabase as any)
            .from('quarterly_review_attendees')
            .select('id, name, was_present')
            .eq('review_id', r.id),
          (supabase as any)
            .from('quarterly_review_action_items')
            .select('id, status')
            .eq('review_id', r.id),
        ]);
        return {
          ...r,
          attendees: attendeesRes.data ?? [],
          action_items: actionItemsRes.data ?? [],
        };
      })
    );

    return NextResponse.json({ reviews: enriched });
  } catch (e) {
    console.error('[reviews/quarterly GET]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/** POST /api/reviews/quarterly — schedule a new review */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const user = await getUser(supabase);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: org } = await supabase
      .from('organizations')
      .select('id, name')
      .eq('user_id', user.id)
      .single();
    if (!org) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const body = await request.json();
    const {
      quarter, year, meeting_date, meeting_time, meeting_location,
      duration_minutes, notes_for_attendees, agenda_config, attendees,
    } = body;

    if (!quarter || !year) {
      return NextResponse.json({ error: 'quarter and year are required' }, { status: 400 });
    }

    // Compute period dates
    const qNum = parseInt(quarter.replace('Q', ''));
    const period_start = new Date(year, (qNum - 1) * 3, 1).toISOString().split('T')[0];
    const period_end = new Date(year, qNum * 3, 0).toISOString().split('T')[0];

    const { data: review, error } = await (supabase as any)
      .from('quarterly_reviews')
      .insert({
        org_id: (org as any).id,
        quarter,
        year,
        period_start,
        period_end,
        status: 'scheduled',
        meeting_date: meeting_date ?? null,
        meeting_time: meeting_time ?? null,
        meeting_location: meeting_location ?? null,
        duration_minutes: duration_minutes ?? 60,
        notes_for_attendees: notes_for_attendees ?? null,
        agenda_config: agenda_config ?? {},
        facilitated_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    // Create sections
    const selectedSections = agenda_config?.sections
      ? AGENDA_SECTIONS.filter(s => agenda_config.sections.includes(s.type))
      : AGENDA_SECTIONS;

    await (supabase as any).from('quarterly_review_sections').insert(
      selectedSections.map(s => ({
        review_id: review.id,
        section_type: s.type,
        section_label: s.label,
        section_order: s.order,
        status: 'pending',
      }))
    );

    // Add attendees
    if (attendees?.length) {
      await (supabase as any).from('quarterly_review_attendees').insert(
        attendees.map((a: any) => ({
          review_id: review.id,
          name: a.name,
          email: a.email ?? null,
          role: a.role ?? null,
          user_id: a.user_id ?? null,
        }))
      );
    }

    return NextResponse.json({ review }, { status: 201 });
  } catch (e) {
    console.error('[reviews/quarterly POST]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
