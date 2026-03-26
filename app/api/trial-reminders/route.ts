/**
 * POST /api/trial-reminders
 *
 * Sends trial expiration sequence emails:
 *   - Day 7 of trial:  "You're 7 days into your trial"
 *   - Day 12 of trial: "2 days left — upgrade before losing access"
 *   - Day 14 of trial: "Your trial ends today"
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

function trialEmailHtml(title: string, body: string, ctaText: string, ctaUrl: string): string {
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
        <p style="color:#999;font-size:11px;font-weight:300;margin:0">HIPAA Hub · Reply to this email with any questions</p>
      </div>
    </div>`;
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Fetch all trialing subscriptions
  const { data: trials, error } = await supabase
    .from('subscriptions')
    .select('id, user_id, trial_start, trial_end, status')
    .eq('status', 'trialing')
    .not('trial_start', 'is', null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let emailsSent = 0;

  for (const trial of trials ?? []) {
    if (!trial.trial_start) continue;
    const trialStart = new Date(trial.trial_start);
    trialStart.setHours(0, 0, 0, 0);
    const daysIntoTrial = Math.floor((today.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24));

    if (![7, 12, 14].includes(daysIntoTrial)) continue;

    const { data: userData } = await supabase.auth.admin.getUserById(trial.user_id);
    const userEmail = userData?.user?.email;
    const userName = userData?.user?.user_metadata?.full_name ?? 'there';
    if (!userEmail) continue;

    const { data: orgData } = await supabase
      .from('organizations')
      .select('name')
      .eq('user_id', trial.user_id)
      .single();
    const orgName = orgData?.name ?? 'your practice';

    let subject = '';
    let html = '';

    if (daysIntoTrial === 7) {
      subject = `[HIPAA Hub] You're 1 week into your trial`;
      html = trialEmailHtml(
        `Hi ${userName}, you're 1 week in`,
        `<p style="color:#555;font-size:14px;line-height:1.6;font-weight:300">
          You've been building your HIPAA compliance program for <strong>${orgName}</strong> for 7 days.
          Here's what you can do before your trial ends:
        </p>
        <ul style="color:#555;font-size:13px;line-height:1.8;font-weight:300;padding-left:20px">
          <li>Activate all 9 required HIPAA policies</li>
          <li>Complete your Security Risk Assessment</li>
          <li>Upload compliance evidence to the Evidence Center</li>
          <li>Generate your Audit Export package</li>
        </ul>
        <p style="color:#555;font-size:13px;font-weight:300;margin-top:16px">
          Activate your plan before the trial ends to keep everything you've built.
        </p>`,
        'See plans →',
        `${SITE_URL}/select-plan`
      );
    } else if (daysIntoTrial === 12) {
      subject = `[HIPAA Hub] 2 days left — don't lose your compliance work`;
      html = trialEmailHtml(
        `2 days left in your trial`,
        `<p style="color:#555;font-size:14px;line-height:1.6;font-weight:300">
          Your HIPAA Hub trial for <strong>${orgName}</strong> ends in <strong>2 days</strong>.
        </p>
        <p style="color:#555;font-size:14px;line-height:1.6;font-weight:300">
          Everything you've built — your policies, risk assessment, evidence documents, and audit package — will be locked when the trial expires.
          Activate a plan today to keep access and continue protecting your practice.
        </p>`,
        'Activate your plan →',
        `${SITE_URL}/select-plan`
      );
    } else if (daysIntoTrial === 14) {
      subject = `[HIPAA Hub] Your trial ends today`;
      html = trialEmailHtml(
        `Your trial ends today`,
        `<p style="color:#555;font-size:14px;line-height:1.6;font-weight:300">
          Your free trial for <strong>${orgName}</strong> ends today.
        </p>
        <p style="color:#555;font-size:14px;line-height:1.6;font-weight:300">
          To keep access to your compliance dashboard, policies, and audit package, activate a plan now.
          Your data will be preserved — you won't lose anything you've built.
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
