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

/** POST /api/reviews/quarterly/[id]/action-items — create action item */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const user = await getUser(supabase);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('user_id', user.id)
      .single();
    if (!org) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Fetch review for context
    const { data: review } = await (supabase as any)
      .from('quarterly_reviews')
      .select('quarter, year')
      .eq('id', params.id)
      .eq('org_id', (org as any).id)
      .single();
    if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 });

    const { title, section_id, assigned_to_name, assigned_to_email, due_date, priority } = await request.json();
    if (!title) return NextResponse.json({ error: 'title is required' }, { status: 400 });

    const { data: item, error } = await (supabase as any)
      .from('quarterly_review_action_items')
      .insert({
        review_id: params.id,
        section_id: section_id ?? null,
        title,
        assigned_to_name: assigned_to_name ?? null,
        due_date: due_date ?? null,
        priority: priority ?? 'medium',
        status: 'open',
      })
      .select()
      .single();

    if (error) throw error;

    // Email assignee if email provided
    if (assigned_to_email && assigned_to_name) {
      const dueDateStr = due_date
        ? new Date(due_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        : 'No due date set';
      const priorityLabel = (priority ?? 'medium').toUpperCase();
      await sendEmail(
        assigned_to_email,
        `[HIPAA Hub] Action item assigned: ${title}`,
        `<div style="font-family:sans-serif;max-width:560px;margin:auto;color:#0e274e">
          <div style="background:#0e274e;padding:16px 24px">
            <p style="color:#fff;margin:0;font-size:13px;font-weight:300">HIPAA Hub — Action Item Assigned</p>
          </div>
          <div style="padding:32px 24px">
            <h2 style="font-weight:300;font-size:20px;margin:0 0 16px">New action item assigned to you</h2>
            <p style="color:#555;font-size:14px;font-weight:300;margin:0 0 4px">
              An action item was assigned to you during the
              <strong>${review.quarter} ${review.year} Compliance Review</strong>:
            </p>
            <div style="background:#f3f5f9;padding:16px;margin:16px 0;border-left:3px solid #00bceb">
              <p style="font-size:15px;font-weight:400;margin:0 0 8px;color:#0e274e">${title}</p>
              <p style="font-size:12px;color:#999;margin:0">Due: ${dueDateStr} · Priority: ${priorityLabel}</p>
            </div>
            <p style="margin:24px 0 0">
              <a href="${SITE_URL}/dashboard/mitigation"
                 style="background:#00bceb;color:#fff;padding:12px 24px;text-decoration:none;font-size:13px;font-weight:300">
                View in HIPAA Hub →
              </a>
            </p>
          </div>
          <div style="background:#f3f5f9;padding:16px 24px">
            <p style="color:#999;font-size:11px;font-weight:300;margin:0">HIPAA Hub · Compliance action item notification</p>
          </div>
        </div>`
      ).catch(() => {});
    }

    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    console.error('[reviews/quarterly action-items POST]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/** DELETE /api/reviews/quarterly/[id]/action-items?item_id=xxx */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const user = await getUser(supabase);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const itemId = new URL(request.url).searchParams.get('item_id');
    if (!itemId) return NextResponse.json({ error: 'item_id required' }, { status: 400 });

    await (supabase as any)
      .from('quarterly_review_action_items')
      .delete()
      .eq('id', itemId)
      .eq('review_id', params.id);

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
