export const dynamic = 'force-dynamic';

/**
 * POST /api/calendar/generate
 *
 * Auto-generates compliance calendar events from existing data sources:
 * - Policies (policy reviews)
 * - Training assignments (training renewals)
 * - BAAs (renewal events)
 * - Organizations (risk assessment)
 * - Quarterly reviews (current year)
 *
 * Deduplicates by source_type + source_id + due_date.
 * Safe to call multiple times — will upsert, not duplicate.
 */

import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/utils/supabase/queries';

const CRON_SECRET = process.env.CRON_SECRET;

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

async function upsertEvent(
  supabase: any,
  orgId: string,
  event: {
    title: string;
    event_type: string;
    due_date: string;
    recurrence: string;
    source_type?: string;
    source_id?: string;
    notes?: string;
    assigned_to?: string;
  }
) {
  // Check for existing event with same source
  if (event.source_type && event.source_id) {
    const { data: existing } = await supabase
      .from('compliance_calendar_events')
      .select('id, due_date, status')
      .eq('org_id', orgId)
      .eq('source_type', event.source_type)
      .eq('source_id', event.source_id)
      .not('status', 'in', '("complete","cancelled")')
      .maybeSingle();

    if (existing) {
      // Update due date if changed
      if (existing.due_date !== event.due_date) {
        await supabase
          .from('compliance_calendar_events')
          .update({ due_date: event.due_date, title: event.title, updated_at: new Date().toISOString() })
          .eq('id', existing.id);
      }
      return;
    }
  }

  await supabase.from('compliance_calendar_events').insert({
    org_id: orgId,
    title: event.title,
    event_type: event.event_type,
    status: 'upcoming',
    due_date: event.due_date,
    recurrence: event.recurrence,
    source_type: event.source_type ?? null,
    source_id: event.source_id ?? null,
    notes: event.notes ?? null,
    assigned_to: event.assigned_to ?? null,
    is_auto_generated: true,
  });
}

export async function POST(request: NextRequest) {
  // Allow both authenticated users and cron
  const authHeader = request.headers.get('authorization');
  const isCron = CRON_SECRET && authHeader === `Bearer ${CRON_SECRET}`;

  const supabase = createClient();

  let orgIds: string[] = [];

  if (isCron) {
    // Generate for all orgs
    const { data: orgs } = await supabase.from('organizations').select('id');
    orgIds = (orgs ?? []).map((o: any) => o.id);
  } else {
    const user = await getUser(supabase);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('user_id', user.id)
      .single();
    if (!org) return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    orgIds = [(org as any).id];
  }

  let generated = 0;

  for (const orgId of orgIds) {
    try {
      const in12Months = addMonths(new Date(), 12);

      // ── 1. Policy Reviews ──────────────────────────────────────────────────
      const { data: policies } = await (supabase as any)
        .from('policy_generation_status')
        .select('id, policy_document_id, next_review_date')
        .eq('organization_id', orgId)
        .not('next_review_date', 'is', null)
        .lte('next_review_date', in12Months.toISOString().split('T')[0]);

      for (const p of policies ?? []) {
        // Get policy title
        const { data: doc } = await (supabase as any)
          .from('policy_documents')
          .select('title')
          .eq('id', p.policy_document_id)
          .single();

        const title = doc?.title ? `${doc.title} — Annual Review Due` : 'Policy — Annual Review Due';
        await upsertEvent(supabase as any, orgId, {
          title,
          event_type: 'policy_review',
          due_date: p.next_review_date,
          recurrence: 'annual',
          source_type: 'policy',
          source_id: p.policy_document_id,
        });
        generated++;
      }

      // ── 2. Training Renewals ───────────────────────────────────────────────
      const { data: trainings } = await (supabase as any)
        .from('training_assignments')
        .select('id, employee_id, expires_at')
        .eq('org_id', orgId)
        .not('expires_at', 'is', null)
        .lte('expires_at', in12Months.toISOString());

      for (const t of trainings ?? []) {
        const { data: emp } = await (supabase as any)
          .from('employees')
          .select('name')
          .eq('id', t.employee_id)
          .single();
        const name = emp?.name ?? 'Employee';
        const dueDate = new Date(t.expires_at).toISOString().split('T')[0];
        await upsertEvent(supabase as any, orgId, {
          title: `${name} — HIPAA Training Renewal`,
          event_type: 'training_renewal',
          due_date: dueDate,
          recurrence: 'annual',
          source_type: 'training',
          source_id: t.id,
        });
        generated++;
      }

      // ── 3. BAA Renewals ────────────────────────────────────────────────────
      const { data: baas } = await (supabase as any)
        .from('baas')
        .select('id, vendor_name, expiration_date')
        .eq('org_id', orgId)
        .not('expiration_date', 'is', null)
        .lte('expiration_date', in12Months.toISOString().split('T')[0]);

      for (const baa of baas ?? []) {
        await upsertEvent(supabase as any, orgId, {
          title: `${baa.vendor_name} — BAA Renewal Required`,
          event_type: 'baa_renewal',
          due_date: baa.expiration_date,
          recurrence: 'none',
          source_type: 'baa',
          source_id: baa.id,
        });
        generated++;
      }

      // ── 4. Risk Assessment ─────────────────────────────────────────────────
      const { data: orgData } = await (supabase as any)
        .from('organizations')
        .select('id, next_risk_assessment_date')
        .eq('id', orgId)
        .single();

      if (orgData?.next_risk_assessment_date) {
        const riskDate = orgData.next_risk_assessment_date;
        if (riskDate <= in12Months.toISOString().split('T')[0]) {
          await upsertEvent(supabase as any, orgId, {
            title: 'Annual Security Risk Assessment',
            event_type: 'risk_assessment',
            due_date: riskDate,
            recurrence: 'annual',
            source_type: 'organization',
            source_id: orgId,
          });
          generated++;
        }
      } else {
        // Generate from last risk assessment date
        const { data: lastRA } = await (supabase as any)
          .from('risk_assessments')
          .select('created_at, updated_at')
          .eq('organization_id', orgId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (lastRA) {
          const lastDate = new Date(lastRA.updated_at ?? lastRA.created_at);
          const nextDate = addMonths(lastDate, 12);
          await upsertEvent(supabase as any, orgId, {
            title: 'Annual Security Risk Assessment',
            event_type: 'risk_assessment',
            due_date: nextDate.toISOString().split('T')[0],
            recurrence: 'annual',
            source_type: 'organization',
            source_id: orgId,
          });
          generated++;
        }
      }

      // ── 5. Quarterly Reviews ───────────────────────────────────────────────
      const year = new Date().getFullYear();
      for (let q = 1; q <= 4; q++) {
        const month = (q - 1) * 3;
        const qDate = new Date(year, month + 2, 15); // Mid last month of quarter
        const qDateStr = qDate.toISOString().split('T')[0];

        const { data: existing } = await (supabase as any)
          .from('compliance_calendar_events')
          .select('id')
          .eq('org_id', orgId)
          .eq('event_type', 'quarterly_review')
          .eq('due_date', qDateStr)
          .maybeSingle();

        if (!existing) {
          await (supabase as any).from('compliance_calendar_events').insert({
            org_id: orgId,
            title: `Q${q} ${year} Compliance Review`,
            event_type: 'quarterly_review',
            status: 'upcoming',
            due_date: qDateStr,
            recurrence: 'quarterly',
            is_auto_generated: true,
          });
          generated++;
        }
      }

      // ── 6. Mitigation Deadlines ────────────────────────────────────────────
      const { data: mitigations } = await (supabase as any)
        .from('mitigation_items')
        .select('id, title, due_date, assigned_to')
        .eq('organization_id', orgId)
        .not('due_date', 'is', null)
        .in('status', ['open', 'in_progress'])
        .lte('due_date', in12Months.toISOString().split('T')[0]);

      for (const m of mitigations ?? []) {
        await upsertEvent(supabase as any, orgId, {
          title: `${m.title} — Deadline`,
          event_type: 'mitigation_deadline',
          due_date: m.due_date,
          recurrence: 'none',
          source_type: 'mitigation',
          source_id: m.id,
          assigned_to: m.assigned_to ?? undefined,
        });
        generated++;
      }
    } catch (e) {
      console.error(`[calendar/generate] Failed for org ${orgId}:`, e);
    }
  }

  return NextResponse.json({ ok: true, generated });
}
