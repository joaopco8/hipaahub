export const dynamic = 'force-dynamic';

import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/utils/supabase/queries';

/** GET /api/reviews/quarterly/[id] — full review with sections, attendees, decisions, action items */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { data: review } = await (supabase as any)
      .from('quarterly_reviews')
      .select('*')
      .eq('id', params.id)
      .eq('org_id', (org as any).id)
      .single();
    if (!review) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const [attendeesRes, sectionsRes, actionItemsRes] = await Promise.all([
      (supabase as any).from('quarterly_review_attendees').select('*').eq('review_id', params.id),
      (supabase as any).from('quarterly_review_sections').select('*').eq('review_id', params.id).order('section_order'),
      (supabase as any).from('quarterly_review_action_items').select('*').eq('review_id', params.id).order('created_at'),
    ]);

    const sections = sectionsRes.data ?? [];
    const decisionsRes = await (supabase as any)
      .from('quarterly_review_decisions')
      .select('*')
      .eq('review_id', params.id);

    // Attach decisions to sections
    const sectionsWithDecisions = sections.map((s: any) => ({
      ...s,
      decisions: (decisionsRes.data ?? []).filter((d: any) => d.section_id === s.id),
    }));

    return NextResponse.json({
      review,
      attendees: attendeesRes.data ?? [],
      sections: sectionsWithDecisions,
      action_items: actionItemsRes.data ?? [],
      org: { name: (org as any).name },
    });
  } catch (e) {
    console.error('[reviews/quarterly GET id]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/** PATCH /api/reviews/quarterly/[id] — update review metadata */
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
    if (!org) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const body = await request.json();
    const allowed = ['meeting_date', 'meeting_time', 'meeting_location', 'duration_minutes', 'notes_for_attendees', 'elapsed_seconds'];
    const patch: Record<string, any> = { updated_at: new Date().toISOString() };
    for (const k of allowed) if (k in body) patch[k] = body[k];

    const { data: review, error } = await (supabase as any)
      .from('quarterly_reviews')
      .update(patch)
      .eq('id', params.id)
      .eq('org_id', (org as any).id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ review });
  } catch (e) {
    console.error('[reviews/quarterly PATCH id]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
