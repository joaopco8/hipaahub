export const dynamic = 'force-dynamic';

import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/utils/supabase/queries';

const FROM = process.env.RESEND_FROM_EMAIL ?? 'noreply@hipaahubhealth.com';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://app.hipaahubhealth.com';

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
}

/** POST /api/reviews/quarterly/[id]/send-pre-brief — send pre-meeting email to attendees */
export async function POST(
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

    const { data: review } = await (supabase as any)
      .from('quarterly_reviews')
      .select('*')
      .eq('id', params.id)
      .eq('org_id', (org as any).id)
      .single();
    if (!review) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const { data: attendees } = await (supabase as any)
      .from('quarterly_review_attendees')
      .select('name, email')
      .eq('review_id', params.id)
      .not('email', 'is', null);

    const meetingDateStr = review.meeting_date
      ? new Date(review.meeting_date + 'T12:00:00').toLocaleDateString('en-US', {
          weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
        })
      : `${review.quarter} ${review.year}`;

    const prepareUrl = `${SITE_URL}/dashboard/quarterly-review/${params.id}/prepare`;
    const orgName = (org as any).name ?? 'Your Organization';
    let sent = 0;

    for (const attendee of attendees ?? []) {
      if (!attendee.email) continue;
      const html = `
        <div style="font-family:sans-serif;max-width:560px;margin:auto;color:#0e274e">
          <div style="background:#0e274e;padding:16px 24px">
            <p style="color:#fff;margin:0;font-size:13px;font-weight:300">HIPAA Hub — Pre-Meeting Brief</p>
          </div>
          <div style="padding:32px 24px">
            <h2 style="font-weight:300;font-size:22px;margin:0 0 8px">
              ${review.quarter} ${review.year} Compliance Review
            </h2>
            <p style="color:#555;font-size:14px;font-weight:300;margin:0 0 24px">
              <strong>${orgName}</strong> · ${meetingDateStr}
              ${review.meeting_time ? ` at ${review.meeting_time}` : ''}
              ${review.meeting_location ? ` · ${review.meeting_location}` : ''}
            </p>
            <p style="color:#555;font-size:14px;line-height:1.6;font-weight:300">
              Hi ${attendee.name},<br><br>
              This is your pre-meeting brief for the upcoming ${review.quarter} ${review.year} Compliance Review.
              Please review the preparation materials before the meeting.
            </p>
            ${review.notes_for_attendees ? `
            <div style="background:#f3f5f9;border-left:3px solid #00bceb;padding:12px 16px;margin:16px 0">
              <p style="font-size:13px;color:#555;font-weight:300;margin:0">${review.notes_for_attendees}</p>
            </div>` : ''}
            <p style="margin:24px 0 0">
              <a href="${prepareUrl}"
                 style="background:#00bceb;color:#fff;padding:12px 24px;text-decoration:none;font-size:13px;font-weight:300">
                View Pre-Meeting Brief →
              </a>
            </p>
          </div>
          <div style="background:#f3f5f9;padding:16px 24px">
            <p style="color:#999;font-size:11px;font-weight:300;margin:0">
              HIPAA Hub · ${orgName} Compliance Calendar
            </p>
          </div>
        </div>`;

      await sendEmail(
        attendee.email,
        `[HIPAA Hub] ${review.quarter} ${review.year} Compliance Review — ${meetingDateStr} Pre-Brief`,
        html
      ).catch(() => null);
      sent++;
    }

    // Mark pre-brief as sent
    await (supabase as any)
      .from('quarterly_reviews')
      .update({ pre_brief_sent_at: new Date().toISOString() })
      .eq('id', params.id);

    return NextResponse.json({ ok: true, sent });
  } catch (e) {
    console.error('[reviews/quarterly send-pre-brief POST]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
