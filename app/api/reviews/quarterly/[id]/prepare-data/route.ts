export const dynamic = 'force-dynamic';

/**
 * GET /api/reviews/quarterly/[id]/prepare-data
 * Returns all compliance data needed to populate the pre-meeting brief.
 */

import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/utils/supabase/queries';

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

    const orgId = (org as any).id;

    // Verify review belongs to this org
    const { data: review } = await (supabase as any)
      .from('quarterly_reviews')
      .select('*')
      .eq('id', params.id)
      .eq('org_id', orgId)
      .single();
    if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 });

    // ── Parallel data fetch ────────────────────────────────────────────────
    const [
      riskRes,
      policiesRes,
      trainingsRes,
      employeesRes,
      baasRes,
      mitigationRes,
      incidentsRes,
      calendarRes,
      prevActionItemsRes,
    ] = await Promise.all([
      // Risk assessment
      (supabase as any)
        .from('risk_assessments')
        .select('risk_percentage, risk_level, created_at, updated_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),

      // Policies
      (supabase as any)
        .from('policy_generation_status')
        .select('id, policy_document_id, policy_status, next_review_date')
        .eq('organization_id', orgId),

      // Training
      (supabase as any)
        .from('training_assignments')
        .select('id, employee_id, status, expires_at, completed_at')
        .eq('org_id', orgId),

      // Employees
      (supabase as any)
        .from('employees')
        .select('id, name, role_group')
        .eq('org_id', orgId),

      // BAAs
      (supabase as any)
        .from('baas')
        .select('id, vendor_name, status, expiration_date, no_expiration')
        .eq('org_id', orgId),

      // Mitigation items
      (supabase as any)
        .from('mitigation_items')
        .select('id, title, priority, status, due_date, created_at')
        .eq('org_id', orgId)
        .in('status', ['open', 'in_progress']),

      // Incidents
      (supabase as any)
        .from('breach_incidents')
        .select('id, title, status, discovered_at, severity')
        .eq('organization_id', orgId)
        .order('discovered_at', { ascending: false })
        .limit(20),

      // Calendar events (next 90 days)
      (supabase as any)
        .from('compliance_calendar_events')
        .select('id, title, event_type, due_date, status')
        .eq('org_id', orgId)
        .gte('due_date', new Date().toISOString().split('T')[0])
        .lte('due_date', new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0])
        .not('status', 'in', '("complete","cancelled")')
        .order('due_date', { ascending: true })
        .limit(15),

      // Previous review action items
      (supabase as any)
        .from('quarterly_review_action_items')
        .select('id, title, status, assigned_to_name, due_date, priority, review_id')
        .neq('review_id', params.id)
        .in('review_id',
          (await (supabase as any)
            .from('quarterly_reviews')
            .select('id')
            .eq('org_id', orgId)
            .eq('status', 'complete')
          ).data?.map((r: any) => r.id) ?? []
        )
        .order('created_at', { ascending: false })
        .limit(20),
    ]);

    const today = new Date();

    // ── Compliance score calculation ───────────────────────────────────────
    const risk = riskRes.data;
    const policies = policiesRes.data ?? [];
    const activePolicies = policies.filter((p: any) => p.policy_status === 'active');
    const trainings = trainingsRes.data ?? [];
    const completedTraining = trainings.filter((t: any) => t.status === 'completed');
    const overdueTraining = trainings.filter((t: any) =>
      t.expires_at && new Date(t.expires_at) < today && t.status !== 'completed'
    );

    let score = 0; let factors = 0;
    const riskScore = risk?.risk_percentage != null ? Number(risk.risk_percentage) : null;
    if (riskScore != null) { score += Math.max(0, 100 - riskScore); factors++; }
    if (policies.length > 0) { score += Math.round((activePolicies.length / Math.max(policies.length, 9)) * 100); factors++; }
    if (trainings.length > 0) { score += Math.round((completedTraining.length / trainings.length) * 100); factors++; }
    const complianceScore = factors > 0 ? Math.round(score / factors) : 0;
    const complianceTier = complianceScore >= 80 ? 'Protected' : complianceScore >= 50 ? 'Partial' : 'At Risk';

    // ── BAA analysis ───────────────────────────────────────────────────────
    const baas = baasRes.data ?? [];
    const expiredBaas = baas.filter((b: any) =>
      !b.no_expiration && b.expiration_date && new Date(b.expiration_date) < today
    );
    const expiringBaas = baas.filter((b: any) => {
      if (b.no_expiration || !b.expiration_date) return false;
      const d = new Date(b.expiration_date);
      const daysUntil = Math.ceil((d.getTime() - today.getTime()) / 86400000);
      return daysUntil >= 0 && daysUntil <= 90;
    });

    // ── Quarter period for incident filtering ──────────────────────────────
    const qNum = parseInt(review.quarter.replace('Q', ''));
    const qStart = new Date(review.year, (qNum - 1) * 3, 1);
    const qEnd = new Date(review.year, qNum * 3, 0);
    const quarterIncidents = (incidentsRes.data ?? []).filter((i: any) => {
      const d = new Date(i.discovered_at);
      return d >= qStart && d <= qEnd;
    });

    return NextResponse.json({
      review,
      compliance: {
        score: complianceScore,
        tier: complianceTier,
        breakdown: {
          policies: { active: activePolicies.length, total: Math.max(policies.length, 9) },
          risk: { percentage: riskScore, lastAssessed: risk?.created_at ?? null },
          training: { completed: completedTraining.length, total: trainings.length, overdue: overdueTraining.length },
          baas: { total: baas.length, expired: expiredBaas.length, expiring: expiringBaas.length },
        },
      },
      mitigation: {
        open: (mitigationRes.data ?? []).filter((m: any) => m.status === 'open'),
        in_progress: (mitigationRes.data ?? []).filter((m: any) => m.status === 'in_progress'),
        overdue: (mitigationRes.data ?? []).filter((m: any) =>
          m.due_date && new Date(m.due_date) < today
        ),
      },
      incidents: {
        quarter: quarterIncidents,
        recent: (incidentsRes.data ?? []).slice(0, 5),
      },
      baas: {
        expired: expiredBaas,
        expiring: expiringBaas,
      },
      training: {
        overdue: overdueTraining,
        employees: employeesRes.data ?? [],
      },
      calendar_events: calendarRes.data ?? [],
      previous_action_items: prevActionItemsRes.data ?? [],
    });
  } catch (e) {
    console.error('[reviews/quarterly prepare-data GET]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
