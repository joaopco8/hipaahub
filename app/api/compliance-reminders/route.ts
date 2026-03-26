/**
 * POST /api/compliance-reminders
 *
 * Scans all orgs and sends:
 *   - Risk Assessment expiration alert (90 days before annual renewal due)
 *   - Policy review due alert (60 days before next_review_date on any policy)
 *   - Mitigation overdue notifications (any open/in_progress item past due_date)
 *
 * Intended for daily cron. Requires CRON_SECRET.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

const FROM = process.env.RESEND_FROM_EMAIL ?? 'noreply@hipaahubhealth.com';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://app.hipaahubhealth.com';
const CRON_SECRET = process.env.CRON_SECRET;

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let emailsSent = 0;
  const errors: string[] = [];

  // ── 1. Risk Assessment Expiration ─────────────────────────────────────────
  // Fetch all risk assessments. Annual review is required every 12 months.
  // Alert at 90 days before the anniversary of the last assessment.
  try {
    const { data: assessments } = await (supabase as any)
      .from('risk_assessments')
      .select('id, organization_id, created_at, updated_at')
      .order('created_at', { ascending: false });

    // Group by org — use the most recent assessment per org
    const latestByOrg: Record<string, any> = {};
    for (const a of assessments ?? []) {
      if (!latestByOrg[a.organization_id]) {
        latestByOrg[a.organization_id] = a;
      }
    }

    for (const [orgId, assessment] of Object.entries(latestByOrg) as [string, any][]) {
      const assessmentDate = new Date(assessment.updated_at ?? assessment.created_at);
      const dueDate = new Date(assessmentDate);
      dueDate.setFullYear(dueDate.getFullYear() + 1);
      dueDate.setHours(0, 0, 0, 0);

      const daysLeft = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (daysLeft !== 90) continue; // only alert exactly 90 days before

      const { data: orgData } = await supabase
        .from('organizations')
        .select('name, user_id')
        .eq('id', orgId)
        .single();
      if (!orgData) continue;

      const { data: adminUser } = await supabase.auth.admin.getUserById(orgData.user_id);
      const adminEmail = adminUser?.user?.email;
      if (!adminEmail) continue;

      const subject = `[HIPAA Hub] Risk Assessment renewal due in 90 days — ${orgData.name}`;
      const html = `
        <div style="font-family:sans-serif;max-width:560px;margin:auto;color:#0e274e">
          <div style="background:#0e274e;padding:16px 24px">
            <p style="color:#fff;margin:0;font-size:13px;font-weight:300">HIPAA Hub — Compliance Reminder</p>
          </div>
          <div style="padding:32px 24px">
            <h2 style="font-weight:300;font-size:22px;margin:0 0 16px">Risk Assessment renewal due in 90 days</h2>
            <p style="color:#555;font-size:14px;line-height:1.6;font-weight:300">
              Your Security Risk Analysis for <strong>${orgData.name}</strong> was last completed on
              <strong>${assessmentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>.
              HIPAA requires an annual review — your next assessment is due by
              <strong>${dueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>.
            </p>
            <p style="margin:24px 0 0">
              <a href="${SITE_URL}/dashboard/risk-assessment"
                 style="background:#00bceb;color:#fff;padding:12px 24px;text-decoration:none;font-size:13px;font-weight:300">
                Start Risk Assessment →
              </a>
            </p>
          </div>
          <div style="background:#f3f5f9;padding:16px 24px">
            <p style="color:#999;font-size:11px;font-weight:300;margin:0">HIPAA Hub · This is an automated compliance reminder</p>
          </div>
        </div>`;

      try {
        await sendEmail(adminEmail, subject, html);
        emailsSent++;
      } catch (e) {
        errors.push(`Risk assessment reminder failed for ${orgId}`);
      }
    }
  } catch (e) {
    errors.push('Risk assessment reminders error');
  }

  // ── 2. Policy Review Due ──────────────────────────────────────────────────
  // Alert at 60 days before next_review_date on any generated policy
  try {
    const { data: policies } = await (supabase as any)
      .from('policy_generation_status')
      .select('id, policy_document_id, organization_id, next_review_date, policy_status')
      .not('next_review_date', 'is', null)
      .neq('policy_status', 'archived');

    // Group policies by org that are due in exactly 60 days
    const orgPoliciesDue: Record<string, { orgId: string; policies: any[] }> = {};
    for (const policy of policies ?? []) {
      const reviewDate = new Date(policy.next_review_date);
      reviewDate.setHours(0, 0, 0, 0);
      const daysLeft = Math.ceil((reviewDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (daysLeft !== 60) continue;

      if (!orgPoliciesDue[policy.organization_id]) {
        orgPoliciesDue[policy.organization_id] = { orgId: policy.organization_id, policies: [] };
      }
      orgPoliciesDue[policy.organization_id].policies.push(policy);
    }

    for (const { orgId, policies: duePolicies } of Object.values(orgPoliciesDue)) {
      const { data: orgData } = await supabase
        .from('organizations')
        .select('name, user_id')
        .eq('id', orgId)
        .single();
      if (!orgData) continue;

      const { data: adminUser } = await supabase.auth.admin.getUserById(orgData.user_id);
      const adminEmail = adminUser?.user?.email;
      if (!adminEmail) continue;

      const policyCount = duePolicies.length;
      const subject = `[HIPAA Hub] ${policyCount} policy review${policyCount > 1 ? 's' : ''} due in 60 days`;
      const policyList = duePolicies
        .map((p: any) => `<li style="font-size:13px;color:#555;font-weight:300;margin-bottom:4px">Policy ID: ${p.policy_document_id} — review by ${new Date(p.next_review_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</li>`)
        .join('');

      const html = `
        <div style="font-family:sans-serif;max-width:560px;margin:auto;color:#0e274e">
          <div style="background:#0e274e;padding:16px 24px">
            <p style="color:#fff;margin:0;font-size:13px;font-weight:300">HIPAA Hub — Policy Review Reminder</p>
          </div>
          <div style="padding:32px 24px">
            <h2 style="font-weight:300;font-size:22px;margin:0 0 16px">Policy reviews due in 60 days</h2>
            <p style="color:#555;font-size:14px;line-height:1.6;font-weight:300">
              The following ${policyCount > 1 ? 'policies require' : 'policy requires'} review within 60 days for <strong>${orgData.name}</strong>:
            </p>
            <ul style="margin:16px 0;padding-left:20px">${policyList}</ul>
            <p style="margin:24px 0 0">
              <a href="${SITE_URL}/dashboard/policies"
                 style="background:#00bceb;color:#fff;padding:12px 24px;text-decoration:none;font-size:13px;font-weight:300">
                Review Policies →
              </a>
            </p>
          </div>
          <div style="background:#f3f5f9;padding:16px 24px">
            <p style="color:#999;font-size:11px;font-weight:300;margin:0">HIPAA Hub · This is an automated compliance reminder</p>
          </div>
        </div>`;

      try {
        await sendEmail(adminEmail, subject, html);
        emailsSent++;
      } catch (e) {
        errors.push(`Policy review reminder failed for ${orgId}`);
      }
    }
  } catch (e) {
    errors.push('Policy review reminders error');
  }

  // ── 3. Mitigation Overdue ─────────────────────────────────────────────────
  // Find open/in_progress mitigation items with due_date < today
  // Group by org and send a daily digest of overdue items
  try {
    const { data: overdueItems } = await (supabase as any)
      .from('mitigation_items')
      .select('id, title, priority, due_date, org_id, status')
      .in('status', ['open', 'in_progress'])
      .not('due_date', 'is', null)
      .lt('due_date', today.toISOString().split('T')[0]);

    // Group by org
    const orgOverdue: Record<string, any[]> = {};
    for (const item of overdueItems ?? []) {
      if (!orgOverdue[item.org_id]) orgOverdue[item.org_id] = [];
      orgOverdue[item.org_id].push(item);
    }

    for (const [orgId, items] of Object.entries(orgOverdue)) {
      const { data: orgData } = await supabase
        .from('organizations')
        .select('name, user_id')
        .eq('id', orgId)
        .single();
      if (!orgData) continue;

      const { data: adminUser } = await supabase.auth.admin.getUserById(orgData.user_id);
      const adminEmail = adminUser?.user?.email;
      if (!adminEmail) continue;

      // Only send on Mondays to avoid daily noise
      const isMonday = today.getDay() === 1;
      if (!isMonday) continue;

      const subject = `[HIPAA Hub] ${items.length} overdue mitigation task${items.length > 1 ? 's' : ''} — ${orgData.name}`;
      const rows = items
        .map((item: any) => {
          const daysOverdue = Math.ceil((today.getTime() - new Date(item.due_date).getTime()) / (1000 * 60 * 60 * 24));
          return `<tr>
            <td style="padding:8px;border-bottom:1px solid #eee;font-size:13px">${item.title}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;font-size:13px;text-transform:capitalize">${item.priority}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;font-size:13px;color:#dc2626">${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue</td>
          </tr>`;
        })
        .join('');

      const html = `
        <div style="font-family:sans-serif;max-width:600px;margin:auto;color:#0e274e">
          <div style="background:#0e274e;padding:16px 24px">
            <p style="color:#fff;margin:0;font-size:13px;font-weight:300">HIPAA Hub — Overdue Mitigation Alert</p>
          </div>
          <div style="padding:32px 24px">
            <h2 style="font-weight:300;font-size:20px;margin:0 0 8px">${orgData.name} — Overdue Tasks</h2>
            <p style="color:#555;font-size:13px;font-weight:300;margin:0 0 24px">
              ${items.length} mitigation task${items.length > 1 ? 's' : ''} past their due date.
            </p>
            <table style="width:100%;border-collapse:collapse">
              <thead>
                <tr style="background:#f3f5f9">
                  <th style="padding:8px;text-align:left;font-size:11px;color:#999;font-weight:400">Task</th>
                  <th style="padding:8px;text-align:left;font-size:11px;color:#999;font-weight:400">Priority</th>
                  <th style="padding:8px;text-align:left;font-size:11px;color:#999;font-weight:400">Overdue</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
            <p style="margin:24px 0 0">
              <a href="${SITE_URL}/dashboard/mitigation"
                 style="background:#00bceb;color:#fff;padding:12px 24px;text-decoration:none;font-size:13px;font-weight:300">
                View Mitigation Board →
              </a>
            </p>
          </div>
          <div style="background:#f3f5f9;padding:16px 24px">
            <p style="color:#999;font-size:11px;font-weight:300;margin:0">HIPAA Hub · Weekly overdue digest</p>
          </div>
        </div>`;

      try {
        await sendEmail(adminEmail, subject, html);
        emailsSent++;
      } catch (e) {
        errors.push(`Mitigation overdue digest failed for ${orgId}`);
      }
    }
  } catch (e) {
    errors.push('Mitigation overdue check error');
  }

  return NextResponse.json({
    ok: true,
    emails_sent: emailsSent,
    errors: errors.length > 0 ? errors : undefined,
  });
}
