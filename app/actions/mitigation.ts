'use server';

import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { revalidatePath } from 'next/cache';

export type MitigationStatus = 'open' | 'in_progress' | 'done' | 'ignored';
export type MitigationPriority = 'high' | 'medium' | 'low';

export interface MitigationItem {
  id: string;
  org_id: string;
  created_by: string;
  source: 'risk_assessment' | 'manual' | 'asset' | 'incident';
  source_id: string | null;
  title: string;
  description: string | null;
  priority: MitigationPriority;
  status: MitigationStatus;
  assignee_id: string | null;
  due_date: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  assignee?: { id: string; email: string; full_name: string | null } | null;
  comments_count?: number;
}

export interface MitigationComment {
  id: string;
  item_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  user?: { email: string; full_name: string | null };
}

async function getOrgId(userId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('user_id', userId)
    .single();
  return data as { id: string; name: string } | null;
}

// ─── CRUD ────────────────────────────────────────────────────

export async function getMitigationItems(filters?: {
  status?: MitigationStatus;
  priority?: MitigationPriority;
}): Promise<MitigationItem[]> {
  const supabase = createClient();
  const user = await getUser(supabase);
  if (!user) throw new Error('Unauthorized');
  const org = await getOrgId(user.id);
  if (!org) return [];

  let query = (supabase as any)
    .from('mitigation_items')
    .select(`
      *,
      assignee:auth.users!assignee_id(id, email, raw_user_meta_data)
    `)
    .eq('org_id', org.id);

  if (filters?.status) query = query.eq('status', filters.status);
  if (filters?.priority) query = query.eq('priority', filters.priority);

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw new Error(error.message);

  // Get comment counts in parallel
  const ids = (data ?? []).map((d: any) => d.id);
  const { data: commentCounts } = await (supabase as any)
    .from('mitigation_comments')
    .select('item_id')
    .in('item_id', ids);

  const countMap: Record<string, number> = {};
  for (const c of (commentCounts ?? [])) {
    countMap[c.item_id] = (countMap[c.item_id] ?? 0) + 1;
  }

  return (data ?? []).map((item: any) => ({
    ...item,
    comments_count: countMap[item.id] ?? 0,
    assignee: item.assignee
      ? {
          id: item.assignee.id,
          email: item.assignee.email,
          full_name: item.assignee.raw_user_meta_data?.full_name ?? null,
        }
      : null,
  }));
}

export async function getMitigationItem(id: string): Promise<{
  item: MitigationItem;
  comments: MitigationComment[];
} | null> {
  const supabase = createClient();
  const user = await getUser(supabase);
  if (!user) throw new Error('Unauthorized');
  const org = await getOrgId(user.id);
  if (!org) return null;

  const [{ data: item }, { data: comments }] = await Promise.all([
    (supabase as any)
      .from('mitigation_items')
      .select('*')
      .eq('id', id)
      .eq('org_id', org.id)
      .single(),
    (supabase as any)
      .from('mitigation_comments')
      .select('*, user:auth.users!user_id(email, raw_user_meta_data)')
      .eq('item_id', id)
      .order('created_at'),
  ]);

  if (!item) return null;

  return {
    item,
    comments: (comments ?? []).map((c: any) => ({
      ...c,
      user: c.user
        ? { email: c.user.email, full_name: c.user.raw_user_meta_data?.full_name ?? null }
        : null,
    })),
  };
}

export async function createMitigationItem(payload: {
  title: string;
  description?: string;
  priority?: MitigationPriority;
  source?: MitigationItem['source'];
  source_id?: string;
  assignee_id?: string;
  due_date?: string;
}): Promise<MitigationItem> {
  const supabase = createClient();
  const user = await getUser(supabase);
  if (!user) throw new Error('Unauthorized');
  const org = await getOrgId(user.id);
  if (!org) throw new Error('No organization found');

  const { data, error } = await (supabase as any)
    .from('mitigation_items')
    .insert({
      title: payload.title,
      description: payload.description ?? null,
      priority: payload.priority ?? 'medium',
      source: payload.source ?? 'manual',
      source_id: payload.source_id ?? null,
      assignee_id: payload.assignee_id ?? null,
      due_date: payload.due_date ?? null,
      org_id: org.id,
      created_by: user.id,
      status: 'open',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Send email to assignee if set
  if (payload.assignee_id && payload.assignee_id !== user.id) {
    await sendAssignmentEmail(payload.assignee_id, data, org.name).catch(console.error);
  }

  revalidatePath('/dashboard/mitigation');
  return data;
}

export async function updateMitigationItem(
  id: string,
  payload: Partial<Pick<MitigationItem, 'title' | 'description' | 'priority' | 'status' | 'assignee_id' | 'due_date'>>
): Promise<void> {
  const supabase = createClient();
  const user = await getUser(supabase);
  if (!user) throw new Error('Unauthorized');
  const org = await getOrgId(user.id);
  if (!org) throw new Error('No organization');

  // Get current item to detect assignee/status changes
  const { data: current } = await (supabase as any)
    .from('mitigation_items')
    .select('assignee_id, status, title')
    .eq('id', id)
    .eq('org_id', org.id)
    .single();

  const { error } = await (supabase as any)
    .from('mitigation_items')
    .update(payload)
    .eq('id', id)
    .eq('org_id', org.id);
  if (error) throw new Error(error.message);

  // Notify new assignee
  if (payload.assignee_id && payload.assignee_id !== current?.assignee_id) {
    const item = { ...current, ...payload };
    await sendAssignmentEmail(payload.assignee_id, item, org.name).catch(console.error);
  }

  // Notify admin when done
  if (payload.status === 'done' && current?.status !== 'done') {
    await sendDoneNotification(user.id, current?.title ?? payload.title ?? '', org.name).catch(console.error);
  }

  revalidatePath('/dashboard/mitigation');
}

export async function deleteMitigationItem(id: string): Promise<void> {
  const supabase = createClient();
  const user = await getUser(supabase);
  if (!user) throw new Error('Unauthorized');
  const org = await getOrgId(user.id);
  if (!org) throw new Error('No organization');

  const { error } = await (supabase as any)
    .from('mitigation_items')
    .delete()
    .eq('id', id)
    .eq('org_id', org.id);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/mitigation');
}

export async function addComment(itemId: string, comment: string): Promise<void> {
  const supabase = createClient();
  const user = await getUser(supabase);
  if (!user) throw new Error('Unauthorized');

  const { error } = await (supabase as any)
    .from('mitigation_comments')
    .insert({ item_id: itemId, user_id: user.id, comment });
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/mitigation');
}

// ─── Auto-create from Risk Assessment gaps ───────────────────

export async function autoCreateFromRiskGaps(
  gaps: Array<{ title: string; description: string; priority: MitigationPriority; source_id?: string }>
): Promise<number> {
  const supabase = createClient();
  const user = await getUser(supabase);
  if (!user) throw new Error('Unauthorized');
  const org = await getOrgId(user.id);
  if (!org) throw new Error('No organization');

  const rows = gaps.map((g) => ({
    title: g.title,
    description: g.description,
    priority: g.priority,
    source: 'risk_assessment' as const,
    source_id: g.source_id ?? null,
    org_id: org.id,
    created_by: user.id,
    status: 'open' as const,
  }));

  const { data, error } = await (supabase as any)
    .from('mitigation_items')
    .insert(rows)
    .select('id');
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/mitigation');
  return data?.length ?? 0;
}

// ─── Stats ────────────────────────────────────────────────────

export async function getMitigationStats() {
  const supabase = createClient();
  const user = await getUser(supabase);
  if (!user) throw new Error('Unauthorized');
  const org = await getOrgId(user.id);
  if (!org) return { open: 0, in_progress: 0, done: 0, overdue: 0 };

  const { data } = await (supabase as any)
    .from('mitigation_items')
    .select('status, due_date')
    .eq('org_id', org.id);

  const today = new Date();
  const stats = { open: 0, in_progress: 0, done: 0, overdue: 0 };
  for (const item of (data ?? []) as any[]) {
    if (item.status in stats) (stats as any)[item.status]++;
    if (item.due_date && item.status !== 'done' && new Date(item.due_date) < today) {
      stats.overdue++;
    }
  }
  return stats;
}

// ─── Email helpers ───────────────────────────────────────────

async function sendAssignmentEmail(assigneeId: string, item: any, orgName: string) {
  const supabase = createClient();
  const { data: u } = await supabase.auth.admin.getUserById(assigneeId);
  const email = u?.user?.email;
  if (!email || !process.env.RESEND_API_KEY) return;

  const FROM = process.env.RESEND_FROM_EMAIL ?? 'noreply@hipaahubhealth.com';
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: FROM,
      to: email,
      subject: `[HIPAA Hub] You've been assigned: ${item.title}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:auto;color:#0e274e">
          <div style="background:#0e274e;padding:16px 24px">
            <p style="color:#fff;margin:0;font-size:13px;font-weight:300">HIPAA Hub — Mitigation Assignment</p>
          </div>
          <div style="padding:32px 24px">
            <h2 style="font-weight:300;font-size:20px;margin:0 0 16px">You've been assigned a compliance task</h2>
            <p style="color:#555;font-size:14px;font-weight:300"><strong>${item.title}</strong></p>
            ${item.description ? `<p style="color:#555;font-size:13px;font-weight:300">${item.description}</p>` : ''}
            ${item.due_date ? `<p style="color:#555;font-size:13px;font-weight:300">Due: <strong>${new Date(item.due_date).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</strong></p>` : ''}
            <p style="color:#555;font-size:13px;font-weight:300">Priority: <strong style="text-transform:capitalize">${item.priority}</strong></p>
          </div>
          <div style="background:#f3f5f9;padding:16px 24px">
            <p style="color:#999;font-size:11px;font-weight:300;margin:0">HIPAA Hub · ${orgName}</p>
          </div>
        </div>`,
    }),
  });
}

async function sendDoneNotification(adminId: string, title: string, orgName: string) {
  const supabase = createClient();
  const { data: u } = await supabase.auth.admin.getUserById(adminId);
  const email = u?.user?.email;
  if (!email || !process.env.RESEND_API_KEY) return;

  const FROM = process.env.RESEND_FROM_EMAIL ?? 'noreply@hipaahubhealth.com';
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: FROM,
      to: email,
      subject: `[HIPAA Hub] Mitigation item completed: ${title}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:auto;color:#0e274e">
          <div style="background:#0e274e;padding:16px 24px">
            <p style="color:#fff;margin:0;font-size:13px;font-weight:300">HIPAA Hub — Mitigation Update</p>
          </div>
          <div style="padding:32px 24px">
            <h2 style="font-weight:300;font-size:20px;margin:0 0 16px">✓ Task Completed</h2>
            <p style="color:#555;font-size:14px;font-weight:300"><strong>${title}</strong> has been marked as done.</p>
          </div>
          <div style="background:#f3f5f9;padding:16px 24px">
            <p style="color:#999;font-size:11px;font-weight:300;margin:0">HIPAA Hub · ${orgName}</p>
          </div>
        </div>`,
    }),
  });
}
