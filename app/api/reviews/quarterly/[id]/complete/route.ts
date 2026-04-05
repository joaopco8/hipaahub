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

function nextQuarter(quarter: string, year: number): { quarter: string; year: number } {
  const q = parseInt(quarter.replace('Q', ''));
  if (q === 4) return { quarter: 'Q1', year: year + 1 };
  return { quarter: `Q${q + 1}`, year };
}

function firstMondayOfMonth(year: number, month: number): Date {
  const d = new Date(year, month, 1);
  const day = d.getDay();
  const offset = day === 0 ? 1 : day === 1 ? 0 : 8 - day;
  d.setDate(1 + offset);
  return d;
}

/** PATCH /api/reviews/quarterly/[id]/complete — close the review */
export async function PATCH(
  request: NextRequest,
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

    const orgId = (org as any).id;
    const orgName = (org as any).name ?? 'Your Organization';

    const body = await request.json().catch(() => ({}));
    const { compliance_score, compliance_tier, elapsed_seconds } = body;

    const now = new Date().toISOString();

    // Fetch the review
    const { data: review } = await (supabase as any)
      .from('quarterly_reviews')
      .select('*')
      .eq('id', params.id)
      .eq('org_id', orgId)
      .single();
    if (!review) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Calculate elapsed minutes
    const elapsedMins = elapsed_seconds
      ? Math.round(elapsed_seconds / 60)
      : review.started_at
        ? Math.round((Date.now() - new Date(review.started_at).getTime()) / 60000)
        : null;

    // Mark review complete
    await (supabase as any)
      .from('quarterly_reviews')
      .update({
        status: 'complete',
        completed_at: now,
        duration_minutes: elapsedMins,
        compliance_score_at_review: compliance_score ?? null,
        compliance_tier_at_review: compliance_tier ?? null,
        updated_at: now,
      })
      .eq('id', params.id)
      .eq('org_id', orgId);

    // Record compliance score snapshot
    if (compliance_score != null) {
      await (supabase as any).from('compliance_score_history').insert({
        org_id: orgId,
        score: compliance_score,
        tier: compliance_tier,
        source: 'quarterly_review_snapshot',
        review_id: params.id,
        recorded_at: now,
      }).select().maybeSingle().catch(() => null); // gracefully fail if table doesn't match
    }

    // Promote action items to mitigation_items
    const { data: actionItems } = await (supabase as any)
      .from('quarterly_review_action_items')
      .select('*')
      .eq('review_id', params.id)
      .eq('status', 'open');

    const createdMitigationIds: string[] = [];
    for (const item of actionItems ?? []) {
      const { data: mit } = await (supabase as any)
        .from('mitigation_items')
        .insert({
          org_id: orgId,
          created_by: user.id,
          source: 'quarterly_review',
          source_id: params.id,
          title: item.title,
          priority: item.priority ?? 'medium',
          status: 'open',
          due_date: item.due_date ?? null,
          description: `Created from ${review.quarter} ${review.year} Compliance Review`,
        })
        .select('id')
        .single();

      if (mit?.id) {
        createdMitigationIds.push(mit.id);
        // Link back
        await (supabase as any)
          .from('quarterly_review_action_items')
          .update({ mitigation_item_id: mit.id })
          .eq('id', item.id);
      }
    }

    // Auto-schedule next quarter review
    const { quarter: nextQ, year: nextYear } = nextQuarter(review.quarter, review.year);
    const existing = await (supabase as any)
      .from('quarterly_reviews')
      .select('id')
      .eq('org_id', orgId)
      .eq('quarter', nextQ)
      .eq('year', nextYear)
      .maybeSingle();

    let nextReview = null;
    if (!existing.data) {
      const qNum = parseInt(nextQ.replace('Q', ''));
      // Schedule on first Monday of last month of quarter
      const lastMonth = (qNum - 1) * 3 + 2;
      const nextMeetingDate = firstMondayOfMonth(nextYear, lastMonth);
      const periodStart = new Date(nextYear, (qNum - 1) * 3, 1).toISOString().split('T')[0];
      const periodEnd = new Date(nextYear, qNum * 3, 0).toISOString().split('T')[0];

      const { data: created } = await (supabase as any)
        .from('quarterly_reviews')
        .insert({
          org_id: orgId,
          quarter: nextQ,
          year: nextYear,
          period_start: periodStart,
          period_end: periodEnd,
          status: 'scheduled',
          meeting_date: nextMeetingDate.toISOString().split('T')[0],
          facilitated_by: user.id,
        })
        .select()
        .single();
      nextReview = created;

      // Copy sections from this review
      const { data: sections } = await (supabase as any)
        .from('quarterly_review_sections')
        .select('section_type, section_label, section_order')
        .eq('review_id', params.id);

      if (sections?.length && created) {
        await (supabase as any).from('quarterly_review_sections').insert(
          sections.map((s: any) => ({
            review_id: created.id,
            section_type: s.section_type,
            section_label: s.section_label,
            section_order: s.section_order,
            status: 'pending',
          }))
        );
      }
    }

    // Notify admin about completion and next review
    try {
      const { data: adminUser } = await supabase.auth.admin.getUserById(user.id);
      const adminEmail = adminUser?.user?.email;
      if (adminEmail && nextReview) {
        const nextDateStr = nextReview.meeting_date
          ? new Date(nextReview.meeting_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
          : `${nextQ} ${nextYear}`;
        await sendEmail(
          adminEmail,
          `[HIPAA Hub] ${review.quarter} ${review.year} review complete — ${nextQ} ${nextYear} review scheduled`,
          `<div style="font-family:sans-serif;max-width:560px;margin:auto;color:#0e274e">
            <div style="background:#0e274e;padding:16px 24px">
              <p style="color:#fff;margin:0;font-size:13px;font-weight:300">HIPAA Hub — Quarterly Review</p>
            </div>
            <div style="padding:32px 24px">
              <h2 style="font-weight:300;font-size:22px;margin:0 0 16px">${review.quarter} ${review.year} Review Complete</h2>
              <p style="color:#555;font-size:14px;line-height:1.6;font-weight:300">
                Your ${review.quarter} ${review.year} compliance review has been recorded for <strong>${orgName}</strong>.
                ${createdMitigationIds.length} action item${createdMitigationIds.length !== 1 ? 's' : ''}
                ${createdMitigationIds.length !== 1 ? 'have' : 'has'} been added to your compliance tracker.
              </p>
              <p style="color:#555;font-size:14px;line-height:1.6;font-weight:300;margin-top:12px">
                Your <strong>${nextQ} ${nextYear}</strong> compliance review has been automatically scheduled for
                <strong>${nextDateStr}</strong>. You can adjust the date in HIPAA Hub.
              </p>
              <p style="margin:24px 0 0">
                <a href="${SITE_URL}/dashboard/quarterly-review"
                   style="background:#00bceb;color:#fff;padding:12px 24px;text-decoration:none;font-size:13px;font-weight:300">
                  View Quarterly Reviews →
                </a>
              </p>
            </div>
            <div style="background:#f3f5f9;padding:16px 24px">
              <p style="color:#999;font-size:11px;font-weight:300;margin:0">HIPAA Hub · Automated compliance notification</p>
            </div>
          </div>`
        );
      }
    } catch (_) {}

    return NextResponse.json({
      ok: true,
      mitigation_items_created: createdMitigationIds.length,
      next_review: nextReview,
    });
  } catch (e) {
    console.error('[reviews/quarterly complete PATCH]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
