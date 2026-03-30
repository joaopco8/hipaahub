'use server';

import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { revalidatePath } from 'next/cache';
import { markPolicyAsGenerated, savePolicyVersion } from './policy-documents';

/**
 * Fetch the latest saved editor content for a policy.
 * Returns null if no saved version exists.
 */
export async function getLatestEditorContent(
  policyId: number
): Promise<{ content: string; versionNumber: number } | null> {
  const supabase = createClient();
  const user = await getUser(supabase);
  if (!user) return null;

  const { data: organization } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .single();
  if (!organization) return null;

  const { data } = await (supabase as any)
    .from('policy_versions')
    .select('content_snapshot, version_number')
    .eq('organization_id', organization.id)
    .eq('policy_id', policyId)
    .order('version_number', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data?.content_snapshot) return null;

  return {
    content: data.content_snapshot,
    versionNumber: data.version_number,
  };
}

/**
 * Save a draft of the policy editor content.
 * Creates a new version and marks the policy as generated.
 */
export async function saveEditorDraft(
  policyId: number,
  policyName: string,
  content: string
): Promise<{ versionNumber: number }> {
  const supabase = createClient();
  const user = await getUser(supabase);
  if (!user) throw new Error('Unauthorized');

  const { data: organization } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .single();
  if (!organization) throw new Error('Organization not found');

  // Get next version number
  const { data: lastVersion } = await (supabase as any)
    .from('policy_versions')
    .select('version_number')
    .eq('organization_id', organization.id)
    .eq('policy_id', policyId)
    .order('version_number', { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextVersion = (lastVersion?.version_number || 0) + 1;

  // Save version
  const { error: insertError } = await (supabase as any)
    .from('policy_versions')
    .insert({
      organization_id: organization.id,
      policy_id: policyId,
      policy_name: policyName,
      version_number: nextVersion,
      content_snapshot: content.substring(0, 50000),
      status: 'draft',
      generated_by: user.id,
    });

  if (insertError) throw new Error('Failed to save version');

  // Mark as generated in the generated_policy_documents table
  const { data: existing } = await (supabase as any)
    .from('generated_policy_documents')
    .select('id, generation_count')
    .eq('organization_id', organization.id)
    .eq('policy_id', policyId)
    .maybeSingle();

  if (existing) {
    await (supabase as any)
      .from('generated_policy_documents')
      .update({
        generation_count: existing.generation_count + 1,
        last_generated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
  } else {
    await (supabase as any)
      .from('generated_policy_documents')
      .insert({
        organization_id: organization.id,
        policy_id: policyId,
        policy_name: policyName,
        generated_by: user.id,
      });
  }

  revalidatePath('/dashboard/policies');
  revalidatePath(`/dashboard/policies/${policyId}/edit`);

  return { versionNumber: nextVersion };
}

/**
 * Activate a policy with an electronic signature.
 */
export async function activatePolicyWithSignature(
  policyId: number,
  policyName: string,
  signatureName: string,
  effectiveDate?: string,
  reviewDate?: string
): Promise<void> {
  const supabase = createClient();
  const user = await getUser(supabase);
  if (!user) throw new Error('Unauthorized');

  const { data: organization } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .single();
  if (!organization) throw new Error('Organization not found');

  const now = new Date().toISOString();
  const defaultReviewDate = new Date(
    Date.now() + 365 * 24 * 60 * 60 * 1000
  )
    .toISOString()
    .split('T')[0];

  const { error } = await (supabase as any)
    .from('generated_policy_documents')
    .update({
      policy_status: 'active',
      signed_by: user.id,
      signed_at: now,
      signature_name: signatureName,
      next_review_date: reviewDate || defaultReviewDate,
      last_reviewed_at: now,
      updated_at: now,
    })
    .eq('organization_id', organization.id)
    .eq('policy_id', policyId);

  if (error) throw new Error('Failed to activate policy');

  // Also save a version noting activation
  const { data: lastVersion } = await (supabase as any)
    .from('policy_versions')
    .select('version_number')
    .eq('organization_id', organization.id)
    .eq('policy_id', policyId)
    .order('version_number', { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextVersion = (lastVersion?.version_number || 0) + 1;
  await (supabase as any)
    .from('policy_versions')
    .insert({
      organization_id: organization.id,
      policy_id: policyId,
      policy_name: policyName,
      version_number: nextVersion,
      status: 'active',
      notes: `Activated by ${signatureName} on ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
      generated_by: user.id,
      signature_name: signatureName,
      signed_at: now,
    });

  revalidatePath('/dashboard/policies');
  revalidatePath(`/dashboard/policies/${policyId}/edit`);
}

/**
 * Archive a policy.
 */
export async function archivePolicy(policyId: number): Promise<void> {
  const supabase = createClient();
  const user = await getUser(supabase);
  if (!user) throw new Error('Unauthorized');

  const { data: organization } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .single();
  if (!organization) throw new Error('Organization not found');

  const { error } = await (supabase as any)
    .from('generated_policy_documents')
    .update({
      policy_status: 'archived',
      updated_at: new Date().toISOString(),
    })
    .eq('organization_id', organization.id)
    .eq('policy_id', policyId);

  if (error) throw new Error('Failed to archive policy');

  revalidatePath('/dashboard/policies');
  revalidatePath(`/dashboard/policies/${policyId}/edit`);
}
