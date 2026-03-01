// GET /api/training/invites-list
// Returns all employee invites + stats for the authenticated user's organization.
// Used by the client-side EmployeeInvitesSection for live refresh.

import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabase = createClient();
    const user = await getUser(supabase);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!org) {
      return NextResponse.json({ invites: [], stats: { total: 0, completed: 0, pending: 0, expired: 0, compliancePercent: 0 } });
    }

    const supabaseAdmin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabaseAdmin
      .from('employee_invites')
      .select('id, name, email, role_title, status, invited_at, completed_at, quiz_score, certificate_id, token_expires_at')
      .eq('organization_id', org.id)
      .order('invited_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch invites:', error.message);
      return NextResponse.json({ error: 'Failed to fetch invites' }, { status: 500 });
    }

    const invites = data || [];
    const total = invites.length;
    const completed = invites.filter((i: any) => i.status === 'completed').length;
    const pending = invites.filter((i: any) => i.status === 'invited').length;
    const expired = invites.filter((i: any) => i.status === 'expired').length;
    const compliancePercent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return NextResponse.json({
      invites,
      stats: { total, completed, pending, expired, compliancePercent },
    });
  } catch (error: any) {
    console.error('Error fetching invites list:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
