export const dynamic = 'force-dynamic';

import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/utils/supabase/queries';

/** POST /api/reviews/quarterly/[id]/decisions — add a decision */
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
    if (!org) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const { section_id, decision_text, decided_by_name } = await request.json();
    if (!section_id || !decision_text) {
      return NextResponse.json({ error: 'section_id and decision_text are required' }, { status: 400 });
    }

    const { data: decision, error } = await (supabase as any)
      .from('quarterly_review_decisions')
      .insert({
        review_id: params.id,
        section_id,
        decision_text,
        decided_by_name: decided_by_name ?? null,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ decision }, { status: 201 });
  } catch (e) {
    console.error('[reviews/quarterly decisions POST]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/** DELETE /api/reviews/quarterly/[id]/decisions?decision_id=xxx */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const user = await getUser(supabase);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decisionId = new URL(request.url).searchParams.get('decision_id');
    if (!decisionId) return NextResponse.json({ error: 'decision_id required' }, { status: 400 });

    await (supabase as any)
      .from('quarterly_review_decisions')
      .delete()
      .eq('id', decisionId)
      .eq('review_id', params.id);

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
