export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: organization } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!organization) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
  }

  const { data: versions, error } = await (supabase as any)
    .from('policy_versions')
    .select('id, version_number, status, signature_name, signed_at, next_review_date, notes, created_at, generated_by')
    .eq('organization_id', organization.id)
    .eq('policy_id', params.id)
    .order('version_number', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch versions' }, { status: 500 });
  }

  return NextResponse.json({ versions: versions ?? [] });
}
