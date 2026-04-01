'use server';

import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { revalidatePath } from 'next/cache';
import { canTransition, requiresSignature, type PolicyStatus } from '@/lib/policy-transitions';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/png',
  'image/jpeg',
  'image/jpg'
];

export interface PolicyAttachment {
  id: string;
  policy_id: number;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  description: string | null;
  uploaded_at: string;
  uploaded_by: string;
}

export interface AdditionalDocument {
  id: string;
  name: string;
  description: string | null;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  category: string | null;
  tags: string[] | null;
  uploaded_at: string;
  uploaded_by: string;
}

/**
 * Get all attachments for a specific policy
 */
export async function getPolicyAttachments(policyId: number): Promise<PolicyAttachment[]> {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data: organization } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!organization) {
    throw new Error('Organization not found');
  }

  // Note: policy_attachments table exists but may not be in TypeScript types yet
  const { data, error } = await (supabase as any)
    .from('policy_attachments' as any)
    .select('*')
    .eq('organization_id', organization.id)
    .eq('policy_id', policyId)
    .is('deleted_at', null)
    .order('uploaded_at', { ascending: false });

  if (error) {
    console.error('Error fetching policy attachments:', error);
    throw new Error('Failed to fetch policy attachments');
  }

  return data || [];
}

/**
 * Upload attachment for a policy
 */
export async function uploadPolicyAttachment(
  policyId: number,
  file: File,
  description?: string
): Promise<PolicyAttachment> {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Validate file
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Allowed: PDF, DOC, DOCX, TXT, PNG, JPEG, JPG');
  }

  const { data: organization } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!organization) {
    throw new Error('Organization not found');
  }

  // Upload to Supabase Storage
  const fileExt = file.name.split('.').pop();
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 100);
  const storagePath = `${organization.id}/policies/${policyId}/${timestamp}-${safeName}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('documents')
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: false
    });

  if (uploadError) {
    console.error('File upload error:', uploadError);
    throw new Error(`Failed to upload file: ${uploadError.message}`);
  }

  // Save metadata to database
  const { data: attachment, error: dbError } = await supabase
    .from('policy_attachments' as any)
    .insert({
      organization_id: organization.id,
      policy_id: policyId,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      storage_path: storagePath,
      storage_bucket: 'documents',
      description: description || null,
      uploaded_by: user.id
    })
    .select()
    .single();

  if (dbError) {
    // Clean up uploaded file if DB insert fails
    await supabase.storage.from('documents').remove([storagePath]);
    console.error('Database error:', dbError);
    throw new Error('Failed to save attachment metadata');
  }

  revalidatePath('/dashboard/policies');
  return attachment;
}

/**
 * Delete a policy attachment
 */
export async function deletePolicyAttachment(attachmentId: string): Promise<void> {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Get attachment to delete file from storage
  const { data: attachment, error: fetchError } = await supabase
    .from('policy_attachments' as any)
    .select('storage_path, storage_bucket')
    .eq('id', attachmentId)
    .single();

  if (fetchError || !attachment) {
    throw new Error('Attachment not found');
  }

  // Soft delete in database
  const { error: deleteError } = await supabase
    .from('policy_attachments' as any)
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', attachmentId);

  if (deleteError) {
    console.error('Delete error:', deleteError);
    throw new Error('Failed to delete attachment');
  }

  // Delete file from storage
  await supabase.storage
    .from(attachment.storage_bucket)
    .remove([attachment.storage_path]);

  revalidatePath('/dashboard/policies');
}

/**
 * Get all additional documents
 */
export async function getAdditionalDocuments(): Promise<AdditionalDocument[]> {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data: organization } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!organization) {
    throw new Error('Organization not found');
  }

  const { data, error } = await supabase
    .from('additional_documents' as any)
    .select('*')
    .eq('organization_id', organization.id)
    .is('deleted_at', null)
    .order('uploaded_at', { ascending: false });

  if (error) {
    console.error('Error fetching additional documents:', error);
    throw new Error('Failed to fetch additional documents');
  }

  return data || [];
}

/**
 * Upload additional document
 */
export async function uploadAdditionalDocument(
  file: File,
  name: string,
  description?: string,
  category?: string,
  tags?: string[]
): Promise<AdditionalDocument> {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Validate file
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Allowed: PDF, DOC, DOCX, TXT, PNG, JPEG, JPG');
  }

  const { data: organization } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!organization) {
    throw new Error('Organization not found');
  }

  // Upload to Supabase Storage
  const fileExt = file.name.split('.').pop();
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 100);
  const storagePath = `${organization.id}/additional/${timestamp}-${safeName}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('documents')
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: false
    });

  if (uploadError) {
    console.error('File upload error:', uploadError);
    throw new Error(`Failed to upload file: ${uploadError.message}`);
  }

  // Save metadata to database
  const { data: document, error: dbError } = await supabase
    .from('additional_documents' as any)
    .insert({
      organization_id: organization.id,
      name,
      description: description || null,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      storage_path: storagePath,
      storage_bucket: 'documents',
      category: category || null,
      tags: tags || null,
      uploaded_by: user.id
    })
    .select()
    .single();

  if (dbError) {
    // Clean up uploaded file if DB insert fails
    await supabase.storage.from('documents').remove([storagePath]);
    console.error('Database error:', dbError);
    throw new Error('Failed to save document metadata');
  }

  revalidatePath('/dashboard/policies');
  return document;
}

/**
 * Delete an additional document
 */
export async function deleteAdditionalDocument(documentId: string): Promise<void> {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Get document to delete file from storage
  const { data: document, error: fetchError } = await supabase
    .from('additional_documents' as any)
    .select('storage_path, storage_bucket')
    .eq('id', documentId)
    .single();

  if (fetchError || !document) {
    throw new Error('Document not found');
  }

  // Soft delete in database
  const { error: deleteError } = await supabase
    .from('additional_documents' as any)
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', documentId);

  if (deleteError) {
    console.error('Delete error:', deleteError);
    throw new Error('Failed to delete document');
  }

  // Delete file from storage
  await supabase.storage
    .from(document.storage_bucket)
    .remove([document.storage_path]);

  revalidatePath('/dashboard/policies');
}

// ─── Generated Policy Documents ───────────────────────────────────────────────

export interface GeneratedPolicyStatus {
  policy_id: number;
  generated_at: string;
  last_generated_at: string;
  generation_count: number;
  policy_status?: string;
  signed_by?: string | null;
  signed_at?: string | null;
  signature_name?: string | null;
  next_review_date?: string | null;
}

/**
 * Mark a policy as generated (upsert — updates count on regeneration)
 */
export async function markPolicyAsGenerated(
  policyNumericId: number,
  policyName: string,
  contentSnapshot?: string
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

  // Check if already exists
  const { data: existing } = await (supabase as any)
    .from('generated_policy_documents')
    .select('id, generation_count')
    .eq('organization_id', organization.id)
    .eq('policy_id', policyNumericId)
    .maybeSingle();

  if (existing) {
    // Update: increment count + update timestamp
    await (supabase as any)
      .from('generated_policy_documents')
      .update({
        generation_count: existing.generation_count + 1,
        last_generated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id);
  } else {
    // Insert first time
    await (supabase as any)
      .from('generated_policy_documents')
      .insert({
        organization_id: organization.id,
        policy_id: policyNumericId,
        policy_name: policyName,
        generated_by: user.id
      });
  }

  // NOTE: We intentionally do NOT save the plain-text document content to policy_versions.
  // policy_versions is only for HTML editor content saved via saveEditorDraft.
  // Mixing plain-text view snapshots would corrupt the editor on next open.

  revalidatePath('/dashboard/policies');
}

/**
 * Get generation status for all policies of the current organization
 */
export async function getPolicyGenerationStatus(): Promise<Map<number, GeneratedPolicyStatus>> {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) return new Map();

  const { data: organization } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!organization) return new Map();

  const { data } = await (supabase as any)
    .from('generated_policy_documents')
    .select('policy_id, generated_at, last_generated_at, generation_count, policy_status, signed_by, signed_at, signature_name, next_review_date')
    .eq('organization_id', organization.id);

  const map = new Map<number, GeneratedPolicyStatus>();
  if (data) {
    for (const row of data) {
      map.set(row.policy_id, row);
    }
  }

  return map;
}

// ─── Policy Status & Version History ──────────────────────────────────────────

/**
 * Update policy status. When activating ('active'), requires electronic signature.
 * Validates the transition using the allowed transitions from lib/policy-transitions.
 */
export async function updatePolicyStatus(
  policyNumericId: number,
  newStatus: 'draft' | 'active' | 'in_review' | 'archived',
  signatureName?: string,
  nextReviewDate?: string,
  ip?: string
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

  // Fetch current status to validate transition
  const { data: currentDoc } = await (supabase as any)
    .from('generated_policy_documents')
    .select('policy_status')
    .eq('organization_id', organization.id)
    .eq('policy_id', policyNumericId)
    .maybeSingle();

  const currentStatus: PolicyStatus = (currentDoc?.policy_status as PolicyStatus) ?? 'draft';

  if (!canTransition(currentStatus, newStatus as PolicyStatus)) {
    throw new Error('Transition not allowed');
  }

  const updatePayload: Record<string, any> = {
    policy_status: newStatus,
    updated_at: new Date().toISOString(),
  };

  if (requiresSignature(currentStatus, newStatus as PolicyStatus)) {
    if (!signatureName) throw new Error('Electronic signature required to activate a policy');
    updatePayload.signed_by = user.id;
    updatePayload.signed_at = new Date().toISOString();
    updatePayload.signature_name = signatureName;
    // Default next review: 1 year from today
    updatePayload.next_review_date = nextReviewDate
      || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    updatePayload.last_reviewed_at = new Date().toISOString();
    if (ip) {
      (updatePayload as any).signature_ip = ip;
    }
  }

  const { error } = await (supabase as any)
    .from('generated_policy_documents')
    .update(updatePayload)
    .eq('organization_id', organization.id)
    .eq('policy_id', policyNumericId);

  if (error) throw new Error('Failed to update policy status');

  revalidatePath('/dashboard/policies');
}

/**
 * Save a version snapshot of a policy to policy_versions
 */
export async function savePolicyVersion(
  policyNumericId: number,
  policyName: string,
  contentSnapshot: string,
  status: string = 'draft'
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

  // Get next version number
  const { data: lastVersion } = await (supabase as any)
    .from('policy_versions')
    .select('version_number')
    .eq('organization_id', organization.id)
    .eq('policy_id', policyNumericId)
    .order('version_number', { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextVersion = (lastVersion?.version_number || 0) + 1;

  await (supabase as any)
    .from('policy_versions')
    .insert({
      organization_id: organization.id,
      policy_id: policyNumericId,
      policy_name: policyName,
      version_number: nextVersion,
      content_snapshot: contentSnapshot.substring(0, 50000), // cap at 50k chars
      status,
      generated_by: user.id,
    });
}

/**
 * Get version history for a policy
 */
export async function getPolicyVersionHistory(policyNumericId: number) {
  const supabase = createClient();
  const user = await getUser(supabase);
  if (!user) return [];

  const { data: organization } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .single();
  if (!organization) return [];

  const { data } = await (supabase as any)
    .from('policy_versions')
    .select('id, version_number, status, signature_name, signed_at, next_review_date, notes, created_at, generated_by')
    .eq('organization_id', organization.id)
    .eq('policy_id', policyNumericId)
    .order('version_number', { ascending: false });

  return data || [];
}

// ─── Version Restore & Content Fetch ──────────────────────────────────────────

/**
 * Restore an old version: fetch its content_snapshot, save as a new version (status='draft').
 * Never deletes anything — creates a new version record.
 */
export async function restorePolicyVersion(
  policyNumericId: number,
  versionId: string
): Promise<{ newVersionNumber: number }> {
  const supabase = createClient();
  const user = await getUser(supabase);
  if (!user) throw new Error('Unauthorized');

  const { data: organization } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .single();
  if (!organization) throw new Error('Organization not found');

  // Fetch the version to restore
  const { data: version, error: fetchError } = await (supabase as any)
    .from('policy_versions')
    .select('content_snapshot, version_number, policy_name')
    .eq('id', versionId)
    .eq('organization_id', organization.id)
    .single();

  if (fetchError || !version) throw new Error('Version not found');

  // Get next version number
  const { data: lastVersion } = await (supabase as any)
    .from('policy_versions')
    .select('version_number')
    .eq('organization_id', organization.id)
    .eq('policy_id', policyNumericId)
    .order('version_number', { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextVersion = (lastVersion?.version_number || 0) + 1;

  const { error: insertError } = await (supabase as any)
    .from('policy_versions')
    .insert({
      organization_id: organization.id,
      policy_id: policyNumericId,
      policy_name: version.policy_name,
      version_number: nextVersion,
      content_snapshot: version.content_snapshot,
      status: 'draft',
      notes: `Restored from v${version.version_number}`,
      generated_by: user.id,
    });

  if (insertError) throw new Error('Failed to restore version');

  revalidatePath(`/dashboard/policies/${policyNumericId}/history`);
  return { newVersionNumber: nextVersion };
}

/**
 * Get the full content snapshot of a specific version (for diff computation).
 */
export async function getPolicyVersionContent(
  versionId: string
): Promise<{ content_snapshot: string; version_number: number; policy_name: string } | null> {
  const supabase = createClient();
  const user = await getUser(supabase);
  if (!user) return null;

  const { data: organization } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .single();
  if (!organization) return null;

  const { data, error } = await (supabase as any)
    .from('policy_versions')
    .select('content_snapshot, version_number, policy_name')
    .eq('id', versionId)
    .eq('organization_id', organization.id)
    .single();

  if (error || !data) return null;

  return {
    content_snapshot: data.content_snapshot ?? '',
    version_number: data.version_number,
    policy_name: data.policy_name,
  };
}

// ─── File Download ─────────────────────────────────────────────────────────────

/**
 * Get signed URL for downloading a file
 */
export async function getFileDownloadUrl(
  storagePath: string,
  bucket: string = 'documents',
  expiresIn: number = 3600
): Promise<string | null> {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    return null;
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(storagePath, expiresIn);

  if (error || !data) {
    console.error('Error creating signed URL:', error);
    return null;
  }

  return data.signedUrl;
}
