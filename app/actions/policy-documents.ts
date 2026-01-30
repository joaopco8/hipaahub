'use server';

import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { revalidatePath } from 'next/cache';

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
