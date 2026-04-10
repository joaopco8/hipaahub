/**
 * POST /api/trial-reminders
 *
 * Sends trial expiration sequence emails:
 *   - Day 7:  "You're 1 week in"
 *   - Day 12: "2 days left"
 *   - Day 14: "Your trial ends today"
 *
 * Runs daily at 10:00 UTC via Vercel Cron. Requires CRON_SECRET.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const FROM = process.env.RESEND_FROM_EMAIL ?? 'noreply@hipaahubhealth.com';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hipaahubhealth.com';
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

function emailHtml(title: string, body: string, ctaText: string, ctaUrl: string): string {
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:auto;color:#0e274e">
      <div style="background:#0e274e;padding:16px 24px">
        <p style="color:#fff;margin:0;font-size:13px;font-weight:300">HIPAA Hub</p>
      </div>
      <div style="padding:32px 24px">
        <h2 style="font-weight:300;font-size:22px;margin:0 0 16px">${title}</h2>
        ${body}
        <p style="margin:28px 0 0">
          <a href="${ctaUrl}"
             style="background:#00bceb;color:#fff;padding:12px 28px;text-decoration:none;font-size:13px;font-weight:300;display:inline-block">
            ${ctaText}
          </a>
        </p>
      </div>
      <div style="background:#f3f5f9;padding:16px 24px">
        <p style="color:#999;font-size:11px;font-weight:300;margin:0">HIPAA Hub · hipaahubhealth.com</p>
      </div>
    </div>`;
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 });
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Fetch all orgs still in trial with a known start date
  const { data: orgs, error } = await (admin as any)
    .from('organizations')
    .select('id, user_id, name, trial_started_at')
    .eq('subscription_status', 'trial')
    .not('trial_started_at', 'is', null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let emailsSent = 0;

  for (const org of orgs ?? []) {
    const trialStart = new Date(org.trial_started_at);
    trialStart.setHours(0, 0, 0, 0);
    const daysIntoTrial = Math.floor(
      (today.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (![7, 12, 14].includes(daysIntoTrial)) continue;

    const { data: userData } = await admin.auth.admin.getUserById(org.user_id);
    const userEmail = userData?.user?.email;
    if (!userEmail) continue;

    const firstName = userData?.user?.user_metadata?.full_name?.split(' ')[0] ?? 'there';
    const orgName = org.name ?? 'your practice';

    let subject = '';
    let html = '';

    if (daysIntoTrial === 7) {
      subject = `You're 1 week into your HIPAA Hub trial`;
      html = emailHtml(
        `Hi ${firstName}, you're 1 week in`,
        `<p style="color:#555;font-size:14px;line-height:1.6;font-weight:300">
          You've been building your HIPAA compliance program for <strong>${orgName}</strong> for 7 days.
          Here's what to do before your trial ends:
        </p>
        <ul style="color:#555;font-size:13px;line-height:1.8;font-weight:300;padding-left:20px">
          <li>Activate all 9 required HIPAA policies</li>
          <li>Complete your Security Risk Assessment</li>
          <li>Upload evidence to the Evidence Center</li>
          <li>Generate your Audit Export package</li>
        </ul>
        <p style="color:#555;font-size:13px;font-weight:300;margin-top:16px">
          Activate your plan before the trial ends to keep everything you've built.
        </p>`,
        'See plans →',
        `${SITE_URL}/select-plan`
      );
    } else if (daysIntoTrial === 12) {
      subject = `2 days left — don't lose your compliance work`;
      html = emailHtml(
        `2 days left in your trial`,
        `<p style="color:#555;font-size:14px;line-height:1.6;font-weight:300">
          Your HIPAA Hub trial for <strong>${orgName}</strong> ends in <strong>2 days</strong>.
        </p>
        <p style="color:#555;font-size:14px;line-height:1.6;font-weight:300">
          Everything you've built — policies, risk assessment, evidence documents, and audit package — will be locked when the trial expires.
          Activate a plan today to keep access and protect your practice.
        </p>`,
        'Activate your plan →',
        `${SITE_URL}/select-plan`
      );
    } else if (daysIntoTrial === 14) {
      subject = `Your HIPAA Hub trial ends today`;
      html = emailHtml(
        `Your trial ends today, ${firstName}`,
        `<p style="color:#555;font-size:14px;line-height:1.6;font-weight:300">
          Your free trial for <strong>${orgName}</strong> ends today.
        </p>
        <p style="color:#555;font-size:14px;line-height:1.6;font-weight:300">
          To keep access to your compliance dashboard, policies, and audit package, activate a plan now.
          Your data will be preserved — nothing you've built will be lost.
        </p>`,
        'Keep my compliance program →',
        `${SITE_URL}/select-plan`
      );
    }

    try {
      await sendEmail(userEmail, subject, html);
      emailsSent++;
    } catch (e) {
      console.error(`Failed to send trial reminder to ${userEmail}:`, e);
    }
  }

  return NextResponse.json({ ok: true, emails_sent: emailsSent });
}

export async function GET(request: NextRequest) {
  return POST(request);
}
