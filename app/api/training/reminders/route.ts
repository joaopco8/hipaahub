/**
 * POST /api/training/reminders
 *
 * Scans all active orgs on Practice+ and sends renewal reminder emails:
 *   - 60 days before expiration
 *   - 30 days before expiration
 *   - 7 days before expiration
 *   - day of expiration → marks status "expired"
 *
 * Also sends a weekly admin digest with all expiring/expired assignments.
 *
 * Intended to be called by a cron job (e.g. daily at 08:00 UTC).
 * Requires CRON_SECRET header for security.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

const FROM = process.env.RESEND_FROM_EMAIL ?? 'noreply@hipaahubhealth.com';

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
}
const CRON_SECRET = process.env.CRON_SECRET;

const REMINDER_WINDOWS = [60, 30, 7]; // days before expiration

interface AssignmentRow {
  id: string;
  expires_at: string;
  status: string;
  employee: {
    first_name: string;
    last_name: string;
    email: string;
    org_id: string;
  };
  module: {
    module_name: string;
  };
}

interface OrgRow {
  id: string;
  name: string;
  user_id: string;
}

export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Fetch all active/in_progress assignments that haven't expired yet
  const { data: assignments, error } = await (supabase as any)
    .from('training_assignments')
    .select(`
      id, expires_at, status,
      employee:employees(first_name, last_name, email, org_id),
      module:training_modules(module_name)
    `)
    .in('status', ['completed', 'in_progress', 'not_started'])
    .not('expires_at', 'is', null);

  if (error) {
    console.error('Reminders fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let emailsSent = 0;
  let expired = 0;
  const adminDigestMap: Record<string, { org: OrgRow; items: AssignmentRow[] }> = {};

  for (const row of (assignments ?? []) as AssignmentRow[]) {
    const expiresAt = new Date(row.expires_at);
    expiresAt.setHours(0, 0, 0, 0);
    const daysLeft = Math.ceil((expiresAt.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft <= 0 && row.status !== 'expired') {
      // Mark as expired
      await (supabase as any)
        .from('training_assignments')
        .update({ status: 'expired' })
        .eq('id', row.id);
      expired++;
    }

    // Send reminder if daysLeft is exactly one of our windows
    if (REMINDER_WINDOWS.includes(daysLeft)) {
      const emp = row.employee;
      const moduleName = row.module?.module_name ?? 'HIPAA Training';
      const subject =
        daysLeft === 7
          ? `Action Required: "${moduleName}" expires in 7 days`
          : daysLeft === 30
          ? `Reminder: "${moduleName}" expiring in 30 days`
          : `Heads up: "${moduleName}" renewal due in 60 days`;

      const html = `
        <div style="font-family:sans-serif;max-width:560px;margin:auto;color:#0e274e">
          <div style="background:#0e274e;padding:16px 24px">
            <p style="color:#fff;margin:0;font-size:13px;font-weight:300">HIPAA Hub — Training Reminder</p>
          </div>
          <div style="padding:32px 24px">
            <h2 style="font-weight:300;font-size:22px;margin:0 0 16px">${subject}</h2>
            <p style="color:#555;font-size:14px;line-height:1.6;font-weight:300">
              Hi ${emp.first_name},<br/><br/>
              Your certification for <strong>${moduleName}</strong> is set to expire on
              <strong>${expiresAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>
              (${daysLeft} day${daysLeft !== 1 ? 's' : ''} from now).
            </p>
            <p style="color:#555;font-size:14px;line-height:1.6;font-weight:300">
              Please contact your administrator to renew your training before it expires.
            </p>
          </div>
          <div style="background:#f3f5f9;padding:16px 24px">
            <p style="color:#999;font-size:11px;font-weight:300;margin:0">
              HIPAA Hub · This is an automated compliance reminder
            </p>
          </div>
        </div>`;

      try {
        await sendEmail(emp.email, subject, html);
        emailsSent++;
      } catch (e) {
        console.error(`Failed to send reminder to ${emp.email}:`, e);
      }
    }

    // Collect for admin digest (expiring ≤30 days or expired)
    if (daysLeft <= 30) {
      const orgId = row.employee?.org_id;
      if (orgId) {
        if (!adminDigestMap[orgId]) {
          // Lazy-load org admin info
          const { data: orgData } = await supabase
            .from('organizations')
            .select('id, name, user_id')
            .eq('id', orgId)
            .single();
          if (orgData) adminDigestMap[orgId] = { org: orgData as OrgRow, items: [] };
        }
        if (adminDigestMap[orgId]) adminDigestMap[orgId].items.push(row);
      }
    }
  }

  // Send weekly admin digest (run this on Mondays — check day of week)
  const isMonday = today.getDay() === 1;
  let digestsSent = 0;

  if (isMonday) {
    for (const { org, items } of Object.values(adminDigestMap)) {
      if (!items.length) continue;

      // Get admin email
      const { data: adminUser } = await supabase.auth.admin.getUserById(org.user_id);
      const adminEmail = adminUser?.user?.email;
      if (!adminEmail) continue;

      const rows = items
        .map((a) => {
          const daysLeft = Math.ceil(
            (new Date(a.expires_at).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );
          return `<tr>
            <td style="padding:8px;border-bottom:1px solid #eee;font-size:13px">${a.employee.first_name} ${a.employee.last_name}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;font-size:13px">${a.module?.module_name ?? 'Training'}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;font-size:13px;color:${daysLeft <= 7 ? '#dc2626' : daysLeft <= 30 ? '#d97706' : '#555'}">${daysLeft <= 0 ? 'Expired' : `${daysLeft} days`}</td>
          </tr>`;
        })
        .join('');

      const html = `
        <div style="font-family:sans-serif;max-width:600px;margin:auto;color:#0e274e">
          <div style="background:#0e274e;padding:16px 24px">
            <p style="color:#fff;margin:0;font-size:13px;font-weight:300">HIPAA Hub — Weekly Compliance Digest</p>
          </div>
          <div style="padding:32px 24px">
            <h2 style="font-weight:300;font-size:20px;margin:0 0 8px">${org.name} — Training Status</h2>
            <p style="color:#555;font-size:13px;font-weight:300;margin:0 0 24px">
              ${items.length} employee training${items.length !== 1 ? 's' : ''} expiring or expired.
            </p>
            <table style="width:100%;border-collapse:collapse">
              <thead>
                <tr style="background:#f3f5f9">
                  <th style="padding:8px;text-align:left;font-size:11px;color:#999;font-weight:400">Employee</th>
                  <th style="padding:8px;text-align:left;font-size:11px;color:#999;font-weight:400">Module</th>
                  <th style="padding:8px;text-align:left;font-size:11px;color:#999;font-weight:400">Status</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
          <div style="background:#f3f5f9;padding:16px 24px">
            <p style="color:#999;font-size:11px;font-weight:300;margin:0">HIPAA Hub · Weekly compliance digest</p>
          </div>
        </div>`;

      try {
        await sendEmail(
          adminEmail,
          `[HIPAA Hub] Weekly Training Digest — ${items.length} item${items.length !== 1 ? 's' : ''} need attention`,
          html
        );
        digestsSent++;
      } catch (e) {
        console.error(`Failed to send digest to ${adminEmail}:`, e);
      }
    }
  }

  return NextResponse.json({
    ok: true,
    emails_sent: emailsSent,
    expired_updated: expired,
    digests_sent: digestsSent,
  });
}
