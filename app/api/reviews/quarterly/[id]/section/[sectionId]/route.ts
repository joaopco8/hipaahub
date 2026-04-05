export const dynamic = 'force-dynamic';

import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/utils/supabase/queries';

/** PATCH /api/reviews/quarterly/[id]/section/[sectionId] — update section notes/status */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; sectionId: string } }
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
    const now = new Date().toISOString();
    const patch: Record<string, any> = { updated_at: now };

    if ('discussion_notes' in body) patch.discussion_notes = body.discussion_notes;
    if ('status' in body) {
      patch.status = body.status;
      if (body.status === 'complete') patch.completed_at = now;
    }

    const { data: section, error } = await (supabase as any)
      .from('quarterly_review_sections')
      .update(patch)
      .eq('id', params.sectionId)
      .eq('review_id', params.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ section });
  } catch (e) {
    console.error('[reviews/quarterly section PATCH]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
