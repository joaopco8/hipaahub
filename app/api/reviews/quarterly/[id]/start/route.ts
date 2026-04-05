export const dynamic = 'force-dynamic';

import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/utils/supabase/queries';

/** PATCH /api/reviews/quarterly/[id]/start — begin the meeting */
export async function PATCH(
  _req: NextRequest,
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

    const now = new Date().toISOString();

    const { data: review, error } = await (supabase as any)
      .from('quarterly_reviews')
      .update({ status: 'in_progress', started_at: now, updated_at: now })
      .eq('id', params.id)
      .eq('org_id', (org as any).id)
      .in('status', ['scheduled', 'in_progress'])
      .select()
      .single();

    if (error) throw error;
    if (!review) return NextResponse.json({ error: 'Review not found or already complete' }, { status: 404 });

    return NextResponse.json({ review });
  } catch (e) {
    console.error('[reviews/quarterly start PATCH]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
