/**
 * POST /api/expire-trials
 *
 * Expires organizations whose 14-day trial has ended.
 * Runs hourly via Vercel Cron (vercel.json).
 * Requires CRON_SECRET header.
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

  const adminSupabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const now = new Date().toISOString();

  // Find all orgs in trial with expired trial_ends_at
  const { data: expiredOrgs, error } = await adminSupabase
    .from('organizations')
    .select('id, user_id, trial_started_at, trial_ends_at')
    .eq('subscription_status', 'trial')
    .lt('trial_ends_at', now);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let expired = 0;

  for (const org of expiredOrgs ?? []) {
    // Update status to expired
    await adminSupabase
      .from('organizations')
      .update({ subscription_status: 'expired' })
      .eq('id', org.id);

    // Log event
    await adminSupabase.from('subscription_events').insert({
      org_id: org.id,
      event_type: 'trial_expired',
      from_status: 'trial',
      to_status: 'expired',
    });

    // Send Email 4: trial expired
    try {
      const { data: userData } = await adminSupabase.auth.admin.getUserById(org.user_id);
      const userEmail = userData?.user?.email;
      const firstName = userData?.user?.user_metadata?.full_name?.split(' ')[0] ?? 'there';

      if (userEmail) {
        await sendEmail(
          userEmail,
          'Your HIPAA Hub trial has ended',
          `<div style="font-family:sans-serif;max-width:560px;margin:auto;color:#0e274e">
            <div style="background:#0e274e;padding:16px 24px">
              <p style="color:#fff;margin:0;font-size:13px;font-weight:300">HIPAA Hub</p>
            </div>
            <div style="padding:32px 24px">
              <h2 style="font-weight:300;font-size:22px;margin:0 0 16px">Hi ${firstName}, your trial ended today.</h2>
              <p style="color:#555;font-size:14px;line-height:1.6;font-weight:300">
                Your data is safe. Your policies, Risk Assessment, and documents are all there waiting for you.
              </p>
              <p style="color:#555;font-size:14px;line-height:1.6;font-weight:300;margin-top:16px">
                To access your account and unlock exports and downloads, choose a plan:
              </p>
              <ul style="color:#555;font-size:13px;line-height:1.8;font-weight:300;padding-left:20px">
                <li>Solo — $69/month (1-5 staff)</li>
                <li>Practice — $197/month (2-15 staff, includes training tracker)</li>
                <li>Clinic — $397/month (15-50 staff, multi-location)</li>
              </ul>
              <p style="margin:28px 0 0">
                <a href="${SITE_URL}/select-plan"
                   style="background:#00bceb;color:#fff;padding:12px 28px;text-decoration:none;font-size:13px;font-weight:300;display:inline-block">
                  Choose your plan →
                </a>
              </p>
              <p style="color:#888;font-size:12px;font-weight:300;margin-top:24px;border-top:1px solid #eee;padding-top:16px">
                If HIPAA Hub was not the right fit, I would genuinely appreciate knowing why — just hit reply.
              </p>
            </div>
            <div style="background:#f3f5f9;padding:16px 24px">
              <p style="color:#999;font-size:11px;font-weight:300;margin:0">HIPAA Hub · hipaahubhealth.com</p>
            </div>
          </div>`
        );
      }
    } catch { /* non-critical */ }

    expired++;
  }

  console.log(`Expired ${expired} trials at ${now}`);
  return NextResponse.json({ ok: true, expired });
}

// Also support GET for Vercel Cron (which sends GET requests)
export async function GET(request: NextRequest) {
  return POST(request);
}
