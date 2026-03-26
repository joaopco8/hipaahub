import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const user = await getUser(supabase);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { incidentId, title } = await request.json();
    if (!incidentId || !title) return NextResponse.json({ ok: false });

    const { data: org } = await supabase
      .from('organizations')
      .select('name, user_id')
      .eq('user_id', user.id)
      .single();
    if (!org) return NextResponse.json({ ok: false });

    const { data: adminUser } = await supabase.auth.admin.getUserById(org.user_id);
    const adminEmail = adminUser?.user?.email;
    if (!adminEmail || !process.env.RESEND_API_KEY) return NextResponse.json({ ok: true });

    const FROM = process.env.RESEND_FROM_EMAIL ?? 'noreply@hipaahubhealth.com';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://app.hipaahubhealth.com';

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM,
        to: adminEmail,
        subject: `[HIPAA Hub] New Incident Logged: ${title}`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:auto;color:#0e274e">
            <div style="background:#0e274e;padding:16px 24px">
              <p style="color:#fff;margin:0;font-size:13px;font-weight:300">HIPAA Hub — Incident Alert</p>
            </div>
            <div style="padding:32px 24px">
              <h2 style="font-weight:300;font-size:20px;margin:0 0 16px">New Incident Logged</h2>
              <p style="color:#555;font-size:14px;font-weight:300">
                A new incident has been logged for <strong>${org.name}</strong>:
              </p>
              <p style="color:#0e274e;font-size:16px;font-weight:400;margin:16px 0;padding:12px;background:#f3f5f9">
                ${title}
              </p>
              <p style="color:#555;font-size:13px;font-weight:300">
                Please review this incident and take appropriate action.
              </p>
              <p style="margin:24px 0 0">
                <a href="${siteUrl}/dashboard/breach-notifications/incidents"
                   style="background:#00bceb;color:#fff;padding:12px 24px;text-decoration:none;font-size:13px;font-weight:300">
                  Review Incident →
                </a>
              </p>
            </div>
            <div style="background:#f3f5f9;padding:16px 24px">
              <p style="color:#999;font-size:11px;font-weight:300;margin:0">
                HIPAA Hub · ${org.name} · This is an automated notification
              </p>
            </div>
          </div>`,
      }),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Incident notification error:', error);
    return NextResponse.json({ ok: false });
  }
}
