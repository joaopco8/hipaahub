/**
 * POST /api/calendar/cron
 *
 * Daily cron job that:
 * 1. Updates event statuses (overdue / due_soon / upcoming)
 * 2. Sends notification emails based on days-until-due
 * 3. Auto-generates events from data sources
 *
 * Requires CRON_SECRET in Authorization header.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

const CRON_SECRET = process.env.CRON_SECRET;
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

function notificationEmailHtml(eventTitle: string, dueDate: string, eventType: string, daysUntil: number, orgName: string): string {
  const urgency = daysUntil <= 7 ? 'CRITICAL' : daysUntil <= 30 ? 'URGENT' : 'REMINDER';
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:auto;color:#0e274e">
      <div style="background:#0e274e;padding:16px 24px">
        <p style="color:#fff;margin:0;font-size:13px;font-weight:300">HIPAA Hub — Compliance Calendar ${urgency}</p>
      </div>
      <div style="padding:32px 24px">
        <h2 style="font-weight:300;font-size:22px;margin:0 0 16px">${eventTitle}</h2>
        <p style="color:#555;font-size:14px;line-height:1.6;font-weight:300">
          This compliance event for <strong>${orgName}</strong> is due in <strong>${daysUntil} day${daysUntil !== 1 ? 's' : ''}</strong>.
        </p>
        <table style="width:100%;margin:16px 0;border-collapse:collapse">
          <tr>
            <td style="padding:8px;font-size:12px;color:#999;font-weight:300;width:100px">Due date</td>
            <td style="padding:8px;font-size:13px;font-weight:400">${new Date(dueDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</td>
          </tr>
          <tr>
            <td style="padding:8px;font-size:12px;color:#999;font-weight:300">Type</td>
            <td style="padding:8px;font-size:13px;font-weight:400;text-transform:capitalize">${eventType.replace(/_/g, ' ')}</td>
          </tr>
        </table>
        <p style="margin:24px 0 0">
          <a href="${SITE_URL}/dashboard/calendar"
             style="background:#00bceb;color:#fff;padding:12px 24px;text-decoration:none;font-size:13px;font-weight:300">
            View in Compliance Calendar →
          </a>
        </p>
        <p style="margin:16px 0 0;font-size:12px;color:#999;font-weight:300">
          You can snooze this deadline from the calendar if you need to reschedule.
        </p>
      </div>
      <div style="background:#f3f5f9;padding:16px 24px">
        <p style="color:#999;font-size:11px;font-weight:300;margin:0">HIPAA Hub · Automated Compliance Calendar Reminder</p>
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
  const todayStr = today.toISOString().split('T')[0];

  const in30 = new Date(today);
  in30.setDate(in30.getDate() + 30);
  const in30Str = in30.toISOString().split('T')[0];

  let statusUpdated = 0;
  let notificationsSent = 0;
  const errors: string[] = [];

  // ── Step 1: Trigger event generation ──────────────────────────────────────
  try {
    await fetch(`${SITE_URL}/api/calendar/generate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${CRON_SECRET ?? ''}` },
    });
  } catch (e) {
    errors.push('Failed to trigger event generation');
  }

  // ── Step 2: Update statuses ────────────────────────────────────────────────
  try {
    // Mark overdue
    const { count: overdueCount } = await (supabase as any)
      .from('compliance_calendar_events')
      .update({ status: 'overdue', updated_at: new Date().toISOString() })
      .lt('due_date', todayStr)
      .not('status', 'in', '("complete","cancelled","snoozed","overdue")')
      .select('id', { count: 'exact', head: true });

    statusUpdated += overdueCount ?? 0;

    // Mark due_soon (within 30 days)
    const { count: dueSoonCount } = await (supabase as any)
      .from('compliance_calendar_events')
      .update({ status: 'due_soon', updated_at: new Date().toISOString() })
      .gte('due_date', todayStr)
      .lte('due_date', in30Str)
      .eq('status', 'upcoming')
      .select('id', { count: 'exact', head: true });

    statusUpdated += dueSoonCount ?? 0;

    // Reset snoozed events that have passed their snooze_until
    await (supabase as any)
      .from('compliance_calendar_events')
      .update({ status: 'upcoming', snoozed_until: null, updated_at: new Date().toISOString() })
      .eq('status', 'snoozed')
      .lt('snoozed_until', todayStr);
  } catch (e) {
    errors.push('Status update failed');
  }

  // ── Step 3: Send notifications ─────────────────────────────────────────────
  try {
    // Get all orgs with notification preferences
    const { data: allOrgs } = await supabase.from('organizations').select('id, name, user_id');

    for (const org of allOrgs ?? []) {
      try {
        // Get notification prefs (or use defaults)
        const { data: prefs } = await (supabase as any)
          .from('calendar_notification_preferences')
          .select('*')
          .eq('org_id', org.id)
          .maybeSingle();

        const notificationsEnabled = prefs?.notifications_enabled ?? true;
        if (!notificationsEnabled) continue;

        const alertDays: number[] = prefs?.alert_days ?? [90, 60, 30, 7, 1];

        // Get admin email
        const { data: adminUser } = await supabase.auth.admin.getUserById(org.user_id);
        const adminEmail = adminUser?.user?.email;
        if (!adminEmail) continue;

        // Get events due in exactly the alert days
        for (const days of alertDays) {
          const targetDate = new Date(today);
          targetDate.setDate(targetDate.getDate() + days);
          const targetStr = targetDate.toISOString().split('T')[0];

          const { data: dueEvents } = await (supabase as any)
            .from('compliance_calendar_events')
            .select('*')
            .eq('org_id', org.id)
            .eq('due_date', targetStr)
            .not('status', 'in', '("complete","cancelled","snoozed")');

          for (const event of dueEvents ?? []) {
            const subject = `[HIPAA Hub] ${event.title} is due in ${days} day${days !== 1 ? 's' : ''}`;
            const html = notificationEmailHtml(event.title, event.due_date, event.event_type, days, org.name ?? 'your organization');
            try {
              await sendEmail(adminEmail, subject, html);
              notificationsSent++;
            } catch (_) {}
          }
        }

        // 1 day overdue alert
        const { data: overdueEvents } = await (supabase as any)
          .from('compliance_calendar_events')
          .select('*')
          .eq('org_id', org.id)
          .eq('status', 'overdue');

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        for (const event of (overdueEvents ?? []).filter((e: any) => e.due_date === yesterdayStr)) {
          const subject = `[HIPAA Hub] OVERDUE: ${event.title}`;
          const html = notificationEmailHtml(event.title, event.due_date, event.event_type, -1, org.name ?? 'your organization');
          try {
            await sendEmail(adminEmail, subject, html);
            notificationsSent++;
          } catch (_) {}
        }
      } catch (e) {
        errors.push(`Notification failed for org ${org.id}`);
      }
    }
  } catch (e) {
    errors.push('Notification loop failed');
  }

  return NextResponse.json({
    ok: true,
    status_updated: statusUpdated,
    notifications_sent: notificationsSent,
    errors: errors.length ? errors : undefined,
  });
}
