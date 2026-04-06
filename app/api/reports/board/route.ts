export const dynamic = 'force-dynamic';

import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/utils/supabase/queries';
import { getPolicyDocumentsCount } from '@/utils/supabase/queries';

function getPeriodBounds(periodParam: string): { start: Date; end: Date; label: string } {
  const now = new Date();
  const currentQ = Math.floor(now.getMonth() / 3) + 1;
  const currentYear = now.getFullYear();

  if (periodParam.match(/^q[1-4]-\d{4}$/i)) {
    const q = parseInt(periodParam[1]);
    const year = parseInt(periodParam.split('-')[1]);
    return {
      start: new Date(year, (q - 1) * 3, 1),
      end: new Date(year, q * 3, 0),
      label: `Q${q} ${year}`,
    };
  }
  if (periodParam.match(/^\d{4}-\d{2}$/)) {
    const [year, month] = periodParam.split('-').map(Number);
    return {
      start: new Date(year, month - 1, 1),
      end: new Date(year, month, 0),
      label: new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    };
  }
  if (periodParam.match(/^\d{4}$/)) {
    const year = parseInt(periodParam);
    return { start: new Date(year, 0, 1), end: new Date(year, 11, 31), label: String(year) };
  }
  // Default: current quarter
  return {
    start: new Date(currentYear, (currentQ - 1) * 3, 1),
    end: new Date(currentYear, currentQ * 3, 0),
    label: `Q${currentQ} ${currentYear}`,
  };
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const user = await getUser(supabase);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const periodParam = searchParams.get('period') ?? 'current';
    const { start: periodStart, end: periodEnd, label: periodLabel } = getPeriodBounds(periodParam);
    const ps = periodStart.toISOString().split('T')[0];
    const pe = periodEnd.toISOString().split('T')[0];

    const { data: org } = await supabase.from('organizations').select('*').eq('user_id', user.id).single();
    if (!org) return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    const orgId = (org as any).id;

    const in90 = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

    const [
      riskResult,
      { total: policiesTotal, completed: policiesActive },
      trainingsResult,
      staffResult,
      mitigationResult,
      breachResult,
      incidentResult,
      baasResult,
      employeesResult,
      scoreHistoryResult,
      regulatoryResult,
      policyDocsResult,
      scheduleResult,
    ] = await Promise.all([
      supabase.from('risk_assessments').select('risk_percentage, created_at, risk_level').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      getPolicyDocumentsCount(supabase, user.id),
      (supabase as any).from('training_records').select('id, completion_status, completed_at').eq('user_id', user.id),
      supabase.from('staff_members').select('id, name, role').eq('user_id', user.id),
      (supabase as any).from('mitigation_items').select('id, title, priority, status, due_date, updated_at').eq('organization_id', orgId),
      (supabase as any).from('breach_incidents').select('id, title, status, ocr_notification_required, discovered_at, phi_involved').eq('organization_id', orgId).gte('discovered_at', ps).lte('discovered_at', pe),
      (supabase as any).from('incident_logs').select('id, title, status, date_discovered, type').eq('organization_id', orgId).gte('date_discovered', ps).lte('date_discovered', pe),
      (supabase as any).from('baas').select('id, vendor_name, service_type, status, expiration_date').eq('organization_id', orgId),
      (supabase as any).from('employees').select('id, name, role, training_completed_at, training_expires_at').eq('organization_id', orgId),
      (supabase as any).from('compliance_score_history').select('score, tier, period_label, period_start').eq('org_id', orgId).order('period_start', { ascending: false }).limit(8),
      (supabase as any).from('regulatory_updates').select('id, title, description, impact_level, action_taken, update_date').or(`org_id.eq.${orgId},org_id.is.null`).gte('update_date', ps).lte('update_date', pe).order('update_date', { ascending: false }),
      (supabase as any).from('generated_policy_documents').select('id, policy_type, status, created_at, version').eq('user_id', user.id),
      (supabase as any).from('report_schedules').select('*').eq('org_id', orgId).eq('is_active', true).maybeSingle(),
    ]);

    const ra = riskResult.data as any;
    const trainings: any[] = trainingsResult.data ?? [];
    const staff: any[] = staffResult.data ?? [];
    const mitigation: any[] = mitigationResult.data ?? [];
    const breaches: any[] = breachResult.data ?? [];
    const incidents: any[] = incidentResult.data ?? [];
    const baas: any[] = baasResult.data ?? [];
    const employees: any[] = employeesResult.data ?? [];
    const scoreHistory: any[] = (scoreHistoryResult.data ?? []).reverse();
    const regUpdates: any[] = regulatoryResult.data ?? [];
    const policyDocs: any[] = policyDocsResult.data ?? [];
    const schedule = scheduleResult.data;

    // Compute score
    const riskScore = ra?.risk_percentage != null ? Number(ra.risk_percentage) : null;
    const trainingCompleted = trainings.filter(t => t.completion_status === 'completed').length;
    const trainingTotal = trainings.length;
    const trainingPct = trainingTotal > 0 ? Math.round((trainingCompleted / trainingTotal) * 100) : 0;
    let score = 0; let factors = 0;
    if (riskScore != null) { score += Math.max(0, 100 - riskScore); factors++; }
    if (policiesTotal > 0) { score += Math.round((policiesActive / policiesTotal) * 100); factors++; }
    if (trainingTotal > 0) { score += trainingPct; factors++; }
    const complianceScore = factors > 0 ? Math.round(score / factors) : 0;
    const complianceTier = complianceScore >= 80 ? 'Protected' : complianceScore >= 50 ? 'Partial' : 'At Risk';
    const prevScore = scoreHistory.length >= 2 ? scoreHistory[scoreHistory.length - 2].score : null;
    const scoreTrend = prevScore != null ? complianceScore - prevScore : 0;

    // BAA
    const baasActive = baas.filter(b => b.status === 'active').length;
    const baasExpiringSoon = baas.filter(b => b.status === 'active' && b.expiration_date && new Date(b.expiration_date) <= in90).length;
    const baasExpired = baas.filter(b => b.status === 'expired').length;

    // Mitigation
    const openItems = mitigation.filter(m => ['open', 'in_progress'].includes(m.status));

    // Employees
    const now = new Date();
    const in90d = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    const staffList = employees.map(e => ({
      name: e.name || 'Unknown',
      role: e.role || '—',
      lastTrained: e.training_completed_at ? new Date(e.training_completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null,
      expires: e.training_expires_at ? new Date(e.training_expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null,
      expiresRaw: e.training_expires_at,
      status: !e.training_completed_at ? 'Not Assigned' :
        !e.training_expires_at ? 'Current' :
        new Date(e.training_expires_at) < now ? 'Overdue' :
        new Date(e.training_expires_at) <= in90d ? 'Due Soon' : 'Current',
    }));
    const totalStaff = employees.length || staff.length;
    const compliantStaff = staffList.filter(s => s.status === 'Current').length || trainingCompleted;
    const overdueStaff = staffList.filter(s => s.status === 'Overdue').length;

    // Upcoming events
    const in90Time = in90.getTime();
    const upcoming: any[] = [];
    const urgency = (d: Date) => d.getTime() - now.getTime() < 30 * 86400000 ? 'critical' : d.getTime() - now.getTime() < 60 * 86400000 ? 'warning' : 'normal';
    employees.filter(e => e.training_expires_at).forEach(e => {
      const d = new Date(e.training_expires_at);
      if (d >= now && d.getTime() <= in90Time) upcoming.push({ date: e.training_expires_at, description: `Training expires: ${e.name || 'Staff'}`, type: 'training', urgency: urgency(d) });
    });
    baas.filter(b => b.expiration_date && b.status === 'active').forEach(b => {
      const d = new Date(b.expiration_date);
      if (d >= now && d.getTime() <= in90Time) upcoming.push({ date: b.expiration_date, description: `BAA renewal: ${b.vendor_name}`, type: 'baa', urgency: urgency(d) });
    });
    openItems.filter(m => m.due_date).forEach(m => {
      const d = new Date(m.due_date);
      if (d >= now && d.getTime() <= in90Time) upcoming.push({ date: m.due_date, description: `Mitigation due: ${m.title}`, type: 'mitigation', urgency: urgency(d) });
    });
    upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Policy list
    const POLICY_NAMES: Record<string, string> = {
      privacy_policy: 'Notice of Privacy Practices',
      security_policy: 'Information Security Policy',
      breach_notification: 'Breach Notification Policy',
      workforce_training: 'Workforce Training Policy',
      access_management: 'Access Management Policy',
      device_media: 'Device & Media Controls Policy',
      business_associates: 'Business Associate Policy',
      incident_response: 'Incident Response Policy',
      risk_management: 'Risk Management Policy',
    };
    const policies = policyDocs.map(d => ({
      name: POLICY_NAMES[d.policy_type] || d.policy_type,
      status: d.status === 'finalized' ? 'Active' : d.status === 'draft' ? 'Draft' : 'In Review',
      version: d.version || 'v1.0',
      lastReviewed: d.created_at ? new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
      nextReview: d.created_at ? new Date(new Date(d.created_at).getTime() + 365 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
      nextReviewRaw: d.created_at ? new Date(new Date(d.created_at).getTime() + 365 * 86400000).toISOString() : null,
    }));

    const o = org as any;
    const autoStatement = `During ${periodLabel}, ${o.name || 'this organization'} maintained a ${complianceTier.toLowerCase()} compliance posture with a score of ${complianceScore}/100. ${policiesActive} of ${policiesTotal} required HIPAA policies are active and current. ${trainingPct}% of staff have completed annual training. ${baasActive} of ${baas.length} Business Associate Agreements are active. ${openItems.length} risk item(s) are open and being actively managed. ${breaches.filter(b => b.ocr_notification_required).length === 0 ? 'No breach incidents requiring OCR notification occurred this period.' : `${breaches.filter(b => b.ocr_notification_required).length} breach incident(s) requiring OCR notification occurred this period.`}`;

    return NextResponse.json({
      period: { label: periodLabel, start: ps, end: pe },
      org: {
        name: o.name || o.legal_name || 'Organization',
        address: [o.address_street, o.address_city, o.address_state].filter(Boolean).join(', ') || '',
        complianceOfficer: o.security_officer_name || o.privacy_officer_name || 'Compliance Officer',
        complianceOfficerEmail: o.security_officer_email || '',
      },
      executiveSummary: {
        complianceScore,
        complianceTier,
        scoreTrend,
        staffTrainingPct: trainingPct,
        staffCompliant: compliantStaff,
        staffTotal: totalStaff || trainingTotal,
        baasActive,
        baasTotal: baas.length,
        baasExpiringSoon,
        baasExpired,
        openRiskItems: openItems.length,
        highRiskItems: openItems.filter(m => m.priority === 'high').length,
        mediumRiskItems: openItems.filter(m => m.priority === 'medium').length,
        lowRiskItems: openItems.filter(m => m.priority === 'low').length,
      },
      scoreHistory,
      regulatoryActivity: {
        incidents: breaches.length + incidents.length,
        breachesRequiringOCR: breaches.filter(b => b.ocr_notification_required).length,
        ocrInquiries: 0,
        incidentList: [...breaches.map(b => ({ date: b.discovered_at, title: b.title, type: 'Breach', status: b.status, phiInvolved: b.phi_involved ? 'Yes' : 'No', ocrRequired: b.ocr_notification_required ? 'Yes' : 'No' })), ...incidents.map(i => ({ date: i.date_discovered, title: i.title, type: i.type || 'Incident', status: i.status, phiInvolved: '—', ocrRequired: '—' }))],
        regulatoryUpdates: regUpdates,
      },
      policies,
      training: {
        totalStaff,
        compliantStaff,
        overdue: overdueStaff,
        newThisPeriod: employees.filter(e => e.training_completed_at && new Date(e.training_completed_at) >= periodStart && new Date(e.training_completed_at) <= periodEnd).length,
        certificatesIssued: trainings.filter(t => t.completed_at && new Date(t.completed_at) >= periodStart && new Date(t.completed_at) <= periodEnd).length,
        staffList: staffList.sort((a, b) => (a.status === 'Overdue' ? -1 : b.status === 'Overdue' ? 1 : 0)).slice(0, 10),
        totalStaffCount: staffList.length,
      },
      baas: {
        active: baasActive,
        total: baas.length,
        expiringSoon: baasExpiringSoon,
        expired: baasExpired,
        vendorList: baas.map(b => ({
          name: b.vendor_name,
          serviceType: b.service_type || '—',
          status: b.status === 'active' ? (b.expiration_date && new Date(b.expiration_date) <= in90 ? 'Expiring Soon' : 'Active') : b.status === 'expired' ? 'Expired' : 'Not Signed',
          expirationDate: b.expiration_date ? new Date(b.expiration_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
        })).sort((a: any, b: any) => {
          const order: Record<string, number> = { 'Expired': 0, 'Expiring Soon': 1, 'Not Signed': 2, 'Active': 3 };
          return (order[a.status] ?? 4) - (order[b.status] ?? 4);
        }),
      },
      riskAssessment: {
        lastCompleted: ra?.created_at ? new Date(ra.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Not completed',
        conductedBy: 'HIPAA Hub Platform',
        score: riskScore ?? 0,
        tier: ra?.risk_level ?? 'Not assessed',
        nextReview: ra?.created_at ? new Date(new Date(ra.created_at).getTime() + 365 * 86400000).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—',
        openItems: openItems.map(m => ({ description: m.title, priority: m.priority || 'medium', status: m.status, dueDate: m.due_date ? new Date(m.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—' })),
        closedThisPeriod: mitigation.filter(m => m.status === 'completed' && m.updated_at && new Date(m.updated_at) >= periodStart).length,
      },
      incidents: {
        total: breaches.length + incidents.length,
        requireOCR: breaches.filter(b => b.ocr_notification_required).length,
        ocrInquiries: 0,
        list: [...breaches.map(b => ({ date: b.discovered_at ? new Date(b.discovered_at).toLocaleDateString() : '—', type: 'Breach Incident', status: b.status, phiInvolved: b.phi_involved ? 'Yes' : 'No', ocrRequired: b.ocr_notification_required ? 'Yes' : 'No' })), ...incidents.map(i => ({ date: i.date_discovered ? new Date(i.date_discovered).toLocaleDateString() : '—', type: i.type || 'Security Incident', status: i.status, phiInvolved: '—', ocrRequired: '—' }))],
      },
      upcomingEvents: upcoming,
      complianceOfficerStatement: autoStatement,
      schedule: schedule ?? null,
    });
  } catch (err: any) {
    console.error('Board report error:', err);
    return NextResponse.json({ error: err.message || 'Failed to generate report' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const user = await getUser(supabase);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action } = body;

    const { data: org } = await supabase.from('organizations').select('id').eq('user_id', user.id).single();
    if (!org) return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    const orgId = (org as any).id;

    if (action === 'save_schedule') {
      const { frequency, send_on_day, recipients, sections_config } = body;
      // Upsert schedule
      const { data: existing } = await (supabase as any).from('report_schedules').select('id').eq('org_id', orgId).maybeSingle();
      if (existing?.id) {
        await (supabase as any).from('report_schedules').update({ frequency, send_on_day, recipients, sections_config, is_active: true }).eq('id', existing.id);
      } else {
        await (supabase as any).from('report_schedules').insert({ org_id: orgId, frequency, send_on_day, recipients, sections_config });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
