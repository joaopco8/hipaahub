import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';

export interface ActivityEvent {
  id: string;
  type:
    | 'policy_activated'
    | 'policy_draft'
    | 'training_completed'
    | 'training_invited'
    | 'incident_opened'
    | 'incident_closed'
    | 'vendor_added'
    | 'evidence_uploaded'
    | 'risk_assessment_completed'
    | 'asset_added';
  title: string;
  description: string;
  date: Date;
  link?: string;
}

export async function getRecentActivity(limit = 10): Promise<ActivityEvent[]> {
  const supabase = createClient();
  const user = await getUser(supabase);
  if (!user) return [];

  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!org) return [];
  const orgId = (org as any).id;

  const events: ActivityEvent[] = [];

  // Fetch all sources in parallel
  const [
    policiesResult,
    trainingResult,
    invitesResult,
    incidentsResult,
    vendorsResult,
    evidenceResult,
    riskResult,
    assetsResult,
  ] = await Promise.allSettled([
    (supabase as any)
      .from('generated_policy_documents')
      .select('policy_id, policy_name, policy_status, last_generated_at, created_at')
      .eq('organization_id', orgId)
      .order('last_generated_at', { ascending: false })
      .limit(20),

    (supabase as any)
      .from('training_records')
      .select('id, full_name, training_date, completion_status')
      .eq('user_id', user.id)
      .eq('completion_status', 'completed')
      .order('training_date', { ascending: false })
      .limit(10),

    (supabase as any)
      .from('employee_invites')
      .select('id, name, invited_at')
      .eq('organization_id', orgId)
      .order('invited_at', { ascending: false })
      .limit(10),

    (supabase as any)
      .from('incident_logs')
      .select('id, incident_title, status, date_discovered, created_at')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(10),

    (supabase as any)
      .from('vendors')
      .select('id, vendor_name, created_at')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(10),

    (supabase as any)
      .from('compliance_evidence')
      .select('id, title, created_at')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(10),

    (supabase as any)
      .from('risk_assessment_history')
      .select('id, assessed_at, risk_level')
      .eq('user_id', user.id)
      .order('assessed_at', { ascending: false })
      .limit(5),

    (supabase as any)
      .from('assets')
      .select('id, asset_name, created_at')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  // Policies
  if (policiesResult.status === 'fulfilled' && policiesResult.value.data) {
    for (const p of policiesResult.value.data) {
      const date = p.last_generated_at || p.created_at;
      if (!date) continue;
      events.push({
        id: `policy-${p.policy_id}`,
        type: p.policy_status === 'active' ? 'policy_activated' : 'policy_draft',
        title: p.policy_status === 'active' ? 'Policy activated' : 'Policy updated',
        description: p.policy_name,
        date: new Date(date),
        link: '/dashboard/policies',
      });
    }
  }

  // Training completions
  if (trainingResult.status === 'fulfilled' && trainingResult.value.data) {
    for (const t of trainingResult.value.data) {
      if (!t.training_date) continue;
      events.push({
        id: `training-${t.id}`,
        type: 'training_completed',
        title: 'Training completed',
        description: t.full_name,
        date: new Date(t.training_date),
        link: '/dashboard/training',
      });
    }
  }

  // Employee invites
  if (invitesResult.status === 'fulfilled' && invitesResult.value.data) {
    for (const inv of invitesResult.value.data) {
      if (!inv.invited_at) continue;
      events.push({
        id: `invite-${inv.id}`,
        type: 'training_invited',
        title: 'Employee invited',
        description: inv.name,
        date: new Date(inv.invited_at),
        link: '/dashboard/training',
      });
    }
  }

  // Incidents
  if (incidentsResult.status === 'fulfilled' && incidentsResult.value.data) {
    for (const inc of incidentsResult.value.data) {
      const date = inc.created_at || inc.date_discovered;
      if (!date) continue;
      events.push({
        id: `incident-${inc.id}`,
        type: inc.status === 'closed' ? 'incident_closed' : 'incident_opened',
        title: inc.status === 'closed' ? 'Incident closed' : 'Incident logged',
        description: inc.incident_title || 'Security incident',
        date: new Date(date),
        link: '/dashboard/breach-notifications/incidents',
      });
    }
  }

  // Vendors
  if (vendorsResult.status === 'fulfilled' && vendorsResult.value.data) {
    for (const v of vendorsResult.value.data) {
      if (!v.created_at) continue;
      events.push({
        id: `vendor-${v.id}`,
        type: 'vendor_added',
        title: 'Vendor registered',
        description: v.vendor_name,
        date: new Date(v.created_at),
        link: '/dashboard/policies/vendors',
      });
    }
  }

  // Evidence
  if (evidenceResult.status === 'fulfilled' && evidenceResult.value.data) {
    for (const e of evidenceResult.value.data) {
      if (!e.created_at) continue;
      events.push({
        id: `evidence-${e.id}`,
        type: 'evidence_uploaded',
        title: 'Evidence uploaded',
        description: e.title,
        date: new Date(e.created_at),
        link: '/dashboard/evidence',
      });
    }
  }

  // Risk Assessment
  if (riskResult.status === 'fulfilled' && riskResult.value.data) {
    for (const r of riskResult.value.data) {
      const date = r.assessed_at;
      if (!date) continue;
      events.push({
        id: `risk-${r.id}`,
        type: 'risk_assessment_completed',
        title: 'Risk Assessment updated',
        description: 'Annual HIPAA Risk Assessment',
        date: new Date(date),
        link: '/dashboard/risk-assessment',
      });
    }
  }

  // Assets
  if (assetsResult.status === 'fulfilled' && assetsResult.value.data) {
    for (const a of assetsResult.value.data) {
      if (!a.created_at) continue;
      events.push({
        id: `asset-${a.id}`,
        type: 'asset_added',
        title: 'Asset registered',
        description: a.asset_name,
        date: new Date(a.created_at),
        link: '/dashboard/assets',
      });
    }
  }

  // Sort by date descending and take top N
  return events
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit);
}
