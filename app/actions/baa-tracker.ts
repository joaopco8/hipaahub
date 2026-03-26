'use server';

import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { revalidatePath } from 'next/cache';

// ─── Types ────────────────────────────────────────────────────

export type BAAStatus = 'active' | 'expiring_soon' | 'expired' | 'not_signed';

export interface Vendor {
  id: string;
  org_id?: string;
  organization_id: string;
  vendor_name: string;
  service_type: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  notes: string | null;
  start_date: string | null;
  created_at: string;
}

export interface BAA {
  id: string;
  vendor_id: string;
  org_id: string;
  signed_date: string | null;
  expiration_date: string | null;
  no_expiration: boolean;
  status: BAAStatus;
  document_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface VendorWithBAA extends Vendor {
  baa: BAA | null;
  computed_status: BAAStatus;
  days_until_expiration: number | null;
}

// ─── Helpers ────────────────────────────────────────────────

async function getOrgId(userId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', userId)
    .single();
  return data?.id as string | undefined;
}

function computeBAAStatus(baa: BAA | null): { status: BAAStatus; days: number | null } {
  if (!baa) return { status: 'not_signed', days: null };
  if (baa.no_expiration) return { status: 'active', days: null };

  const expDate = baa.expiration_date ? new Date(baa.expiration_date) : null;
  if (!expDate) return { status: 'active', days: null };

  const today = new Date();
  const days = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (days < 0) return { status: 'expired', days };
  if (days <= 90) return { status: 'expiring_soon', days };
  return { status: 'active', days };
}

// ─── Vendors ─────────────────────────────────────────────────

export async function getVendorsWithBAA(): Promise<VendorWithBAA[]> {
  const supabase = createClient();
  const user = await getUser(supabase);
  if (!user) throw new Error('Unauthorized');
  const orgId = await getOrgId(user.id);
  if (!orgId) return [];

  const { data: vendors, error: vendorErr } = await (supabase as any)
    .from('vendors')
    .select('*')
    .eq('organization_id', orgId)
    .order('vendor_name');
  if (vendorErr) throw new Error(vendorErr.message);

  const { data: baas } = await (supabase as any)
    .from('baas')
    .select('*')
    .eq('org_id', orgId);

  const baaByVendor: Record<string, BAA> = {};
  for (const b of (baas ?? []) as BAA[]) {
    baaByVendor[b.vendor_id] = b;
  }

  return (vendors ?? []).map((v: Vendor) => {
    const baa = baaByVendor[v.id] ?? null;
    const { status, days } = computeBAAStatus(baa);
    return { ...v, baa, computed_status: status, days_until_expiration: days };
  });
}

export async function createVendor(payload: {
  vendor_name: string;
  service_type: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
  start_date?: string;
}): Promise<string> {
  const supabase = createClient();
  const user = await getUser(supabase);
  if (!user) throw new Error('Unauthorized');
  const orgId = await getOrgId(user.id);
  if (!orgId) throw new Error('No organization found');

  const { data, error } = await (supabase as any)
    .from('vendors')
    .insert({
      vendor_name: payload.vendor_name,
      service_type: payload.service_type,
      contact_name: payload.contact_name ?? null,
      contact_email: payload.contact_email ?? null,
      contact_phone: payload.contact_phone ?? null,
      notes: payload.notes ?? null,
      start_date: payload.start_date ?? null,
      organization_id: orgId,
      created_by: user.id,
    })
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/policies/vendors');
  return data.id;
}

export async function updateVendor(
  id: string,
  payload: Partial<Pick<Vendor, 'vendor_name' | 'service_type' | 'contact_name' | 'contact_email' | 'contact_phone' | 'notes' | 'start_date'>>
): Promise<void> {
  const supabase = createClient();
  const user = await getUser(supabase);
  if (!user) throw new Error('Unauthorized');
  const orgId = await getOrgId(user.id);
  if (!orgId) throw new Error('No organization found');

  const { error } = await (supabase as any)
    .from('vendors')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('organization_id', orgId);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/policies/vendors');
}

export async function deleteVendor(id: string): Promise<void> {
  const supabase = createClient();
  const user = await getUser(supabase);
  if (!user) throw new Error('Unauthorized');
  const orgId = await getOrgId(user.id);

  const { error } = await (supabase as any)
    .from('vendors')
    .delete()
    .eq('id', id)
    .eq('organization_id', orgId);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/policies/vendors');
}

// ─── BAAs ────────────────────────────────────────────────────

export async function upsertBAA(payload: {
  vendor_id: string;
  signed_date?: string;
  expiration_date?: string;
  no_expiration?: boolean;
  document_url?: string;
}): Promise<void> {
  const supabase = createClient();
  const user = await getUser(supabase);
  if (!user) throw new Error('Unauthorized');
  const orgId = await getOrgId(user.id);
  if (!orgId) throw new Error('No organization found');

  // Compute status
  const noExp = payload.no_expiration ?? false;
  let status: BAAStatus = 'not_signed';
  if (payload.signed_date || payload.document_url) {
    if (noExp || !payload.expiration_date) {
      status = 'active';
    } else {
      const days = Math.ceil(
        (new Date(payload.expiration_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      status = days < 0 ? 'expired' : days <= 90 ? 'expiring_soon' : 'active';
    }
  }

  // Check if BAA already exists for this vendor
  const { data: existing } = await (supabase as any)
    .from('baas')
    .select('id')
    .eq('vendor_id', payload.vendor_id)
    .eq('org_id', orgId)
    .single();

  if (existing) {
    const { error } = await (supabase as any)
      .from('baas')
      .update({
        signed_date: payload.signed_date ?? null,
        expiration_date: payload.expiration_date ?? null,
        no_expiration: noExp,
        document_url: payload.document_url ?? null,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await (supabase as any)
      .from('baas')
      .insert({
        vendor_id: payload.vendor_id,
        org_id: orgId,
        created_by: user.id,
        signed_date: payload.signed_date ?? null,
        expiration_date: payload.expiration_date ?? null,
        no_expiration: noExp,
        document_url: payload.document_url ?? null,
        status,
      });
    if (error) throw new Error(error.message);
  }

  revalidatePath('/dashboard/policies/vendors');
}

// ─── Stats ───────────────────────────────────────────────────

export interface BAAStats {
  total_vendors: number;
  active: number;
  expiring_soon: number;
  expired: number;
  not_signed: number;
}

export async function getBAAStats(): Promise<BAAStats> {
  const vendors = await getVendorsWithBAA();
  const stats: BAAStats = { total_vendors: vendors.length, active: 0, expiring_soon: 0, expired: 0, not_signed: 0 };
  for (const v of vendors) {
    stats[v.computed_status]++;
  }
  return stats;
}
