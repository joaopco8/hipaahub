export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { diffTexts } from '@/lib/policy-diff';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const versionAId = searchParams.get('a');
  const versionBId = searchParams.get('b');

  if (!versionAId || !versionBId) {
    return NextResponse.json(
      { error: 'Query params a and b (version IDs) are required' },
      { status: 400 }
    );
  }

  const { data: organization } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!organization) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
  }

  // Fetch both versions, verifying org ownership
  const [{ data: versionA }, { data: versionB }] = await Promise.all([
    (supabase as any)
      .from('policy_versions')
      .select('id, version_number, content_snapshot')
      .eq('id', versionAId)
      .eq('organization_id', organization.id)
      .single(),
    (supabase as any)
      .from('policy_versions')
      .select('id, version_number, content_snapshot')
      .eq('id', versionBId)
      .eq('organization_id', organization.id)
      .single(),
  ]);

  if (!versionA || !versionB) {
    return NextResponse.json({ error: 'One or both versions not found' }, { status: 404 });
  }

  const result = diffTexts(versionA.content_snapshot || '', versionB.content_snapshot || '');

  return NextResponse.json({
    lines: result.lines,
    added: result.added,
    removed: result.removed,
    stats: result.stats,
    versionA: { id: versionA.id, version_number: versionA.version_number },
    versionB: { id: versionB.id, version_number: versionB.version_number },
  });
}
