/**
 * POST /api/baa/reminders
 *
 * Scans all BAAs across Practice+ orgs and sends expiration alerts:
 *   - 90 days: first warning
 *   - 60 days: second warning
 *   - 30 days: urgent warning
 *   - Day of: status auto-changes to expired + immediate alert
 *
 * Intended for daily cron. Requires CRON_SECRET.
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
const WINDOWS = [90, 60, 30];

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Fetch all BAAs with expiration dates
  const { data: baas, error } = await (supabase as any)
    .from('baas')
    .select('id, vendor_id, org_id, expiration_date, status, no_expiration')
    .eq('no_expiration', false)
    .not('expiration_date', 'is', null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let emailsSent = 0;
  let expired = 0;

  for (const baa of (baas ?? []) as any[]) {
    const expDate = new Date(baa.expiration_date);
    expDate.setHours(0, 0, 0, 0);
    const daysLeft = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // Auto-expire
    if (daysLeft <= 0 && baa.status !== 'expired') {
      await (supabase as any)
        .from('baas')
        .update({ status: 'expired', updated_at: new Date().toISOString() })
        .eq('id', baa.id);
      expired++;
    }

    if (!WINDOWS.includes(daysLeft) && daysLeft !== 0) continue;

    // Get vendor name
    const { data: vendor } = await (supabase as any)
      .from('vendors')
      .select('vendor_name, service_type')
      .eq('id', baa.vendor_id)
      .single();

    // Get org admin email
    const { data: orgData } = await supabase
      .from('organizations')
      .select('name, user_id')
      .eq('id', baa.org_id)
      .single();
    if (!orgData) continue;

    const { data: adminUser } = await supabase.auth.admin.getUserById(orgData.user_id);
    const adminEmail = adminUser?.user?.email;
    if (!adminEmail) continue;

    const vendorName = vendor?.vendor_name ?? 'Unknown Vendor';
    const urgency =
      daysLeft <= 0 ? 'EXPIRED — Immediate Action Required' :
      daysLeft <= 30 ? `Urgent: expires in ${daysLeft} days` :
      `Expires in ${daysLeft} days`;

    const subject = `[HIPAA Hub] BAA Alert: ${vendorName} — ${urgency}`;
    const html = `
      <div style="font-family:sans-serif;max-width:560px;margin:auto;color:#0e274e">
        <div style="background:#0e274e;padding:16px 24px">
          <p style="color:#fff;margin:0;font-size:13px;font-weight:300">HIPAA Hub — BAA Expiration Alert</p>
        </div>
        <div style="padding:32px 24px">
          <h2 style="font-weight:300;font-size:22px;margin:0 0 16px">${subject.replace('[HIPAA Hub] ', '')}</h2>
          <p style="color:#555;font-size:14px;line-height:1.6;font-weight:300">
            The Business Associate Agreement with <strong>${vendorName}</strong>
            ${daysLeft <= 0
              ? 'has <strong>expired</strong>. You must renew or terminate data sharing with this vendor immediately to remain HIPAA compliant.'
              : `is set to expire on <strong>${expDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong> (${daysLeft} day${daysLeft !== 1 ? 's' : ''} from now). Please renew the BAA before the expiration date.`}
          </p>
          <p style="margin:24px 0 0">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://app.hipaahubhealth.com'}/dashboard/policies/vendors"
               style="background:#00bceb;color:#fff;padding:12px 24px;text-decoration:none;font-size:13px;font-weight:300">
              Manage BAAs →
            </a>
          </p>
        </div>
        <div style="background:#f3f5f9;padding:16px 24px">
          <p style="color:#999;font-size:11px;font-weight:300;margin:0">HIPAA Hub · This is an automated compliance alert</p>
        </div>
      </div>`;

    try {
      await sendEmail(adminEmail, subject, html);
      emailsSent++;
    } catch (e) {
      console.error(`Failed to send BAA alert to ${adminEmail}:`, e);
    }
  }

  return NextResponse.json({ ok: true, emails_sent: emailsSent, expired_updated: expired });
}
