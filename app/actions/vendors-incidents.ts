'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Generate action items for vendors with BAA issues
 */
export async function generateVendorActionItems(organizationId: string) {
  const supabase = createClient();
  
  // Get vendors with BAA issues
  const { data: vendors, error } = await (supabase as any)
    .from('vendors')
    .select('*')
    .eq('organization_id', organizationId);

  if (error || !vendors) return;

  const today = new Date();
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  for (const vendor of vendors) {
    // Check for missing BAA
    if (!vendor.baa_signed) {
      await createActionItemIfNotExists(
        supabase,
        organizationId,
        `vendor-baa-missing-${vendor.id}`,
        `BAA Missing: ${vendor.vendor_name}`,
        `Vendor ${vendor.vendor_name} does not have a signed BAA. This is required for HIPAA compliance.`,
        'critical',
        'Contracts'
      );
    }

    // Check for expired BAA
    if (vendor.baa_expiration_date) {
      const expirationDate = new Date(vendor.baa_expiration_date);
      if (expirationDate < today) {
        await createActionItemIfNotExists(
          supabase,
          organizationId,
          `vendor-baa-expired-${vendor.id}`,
          `BAA Expired: ${vendor.vendor_name}`,
          `The BAA for ${vendor.vendor_name} expired on ${expirationDate.toLocaleDateString()}. Renew immediately.`,
          'critical',
          'Contracts'
        );
      } else if (expirationDate <= thirtyDaysFromNow) {
        await createActionItemIfNotExists(
          supabase,
          organizationId,
          `vendor-baa-expiring-${vendor.id}`,
          `BAA Expiring Soon: ${vendor.vendor_name}`,
          `The BAA for ${vendor.vendor_name} expires on ${expirationDate.toLocaleDateString()}. Renew within 30 days.`,
          'high',
          'Contracts'
        );
      }
    }
  }
}

/**
 * Generate action items for incidents
 */
export async function generateIncidentActionItems(organizationId: string) {
  const supabase = createClient();
  
  // Get open incidents
  const { data: incidents, error } = await (supabase as any)
    .from('incident_logs')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('status', 'open');

  if (error || !incidents) return;

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  for (const incident of incidents) {
    // High severity open incidents
    if (incident.severity === 'high') {
      await createActionItemIfNotExists(
        supabase,
        organizationId,
        `incident-high-severity-${incident.id}`,
        `High Severity Incident: ${incident.incident_title}`,
        `A high severity incident requires immediate attention. Review and update status.`,
        'critical',
        'Administrative'
      );
    }

    // Incidents older than 7 days and still open
    const discoveredDate = new Date(incident.date_discovered);
    if (discoveredDate < sevenDaysAgo) {
      await createActionItemIfNotExists(
        supabase,
        organizationId,
        `incident-stale-${incident.id}`,
        `Stale Incident: ${incident.incident_title}`,
        `This incident has been open for more than 7 days. Review and update status or close.`,
        'high',
        'Administrative'
      );
    }
  }
}

/**
 * Helper function to create action item if it doesn't exist
 */
async function createActionItemIfNotExists(
  supabase: any,
  organizationId: string,
  itemKey: string,
  title: string,
  description: string,
  priority: 'critical' | 'high' | 'medium',
  category: string
) {
  // Get user_id from organization
  const { data: orgData } = await supabase
    .from('organizations')
    .select('user_id')
    .eq('id', organizationId)
    .single();

  if (!orgData) return;

  // Check if action item already exists
  const { data: existing } = await supabase
    .from('action_items')
    .select('id')
    .eq('user_id', orgData.user_id)
    .eq('item_key', itemKey)
    .eq('status', 'pending')
    .single();

  if (existing) return; // Already exists

  // Create new action item
  await supabase
    .from('action_items')
    .insert({
      user_id: orgData.user_id,
      organization_id: organizationId,
      item_key: itemKey,
      title,
      description,
      priority,
      category,
      status: 'pending'
    });

  revalidatePath('/dashboard/action-items');
  revalidatePath('/dashboard');
}
