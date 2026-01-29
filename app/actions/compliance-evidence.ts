'use server';

import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';

export type EvidenceType = 
  // 18 Critical Documents from Master Catalog
  | 'sra_report'
  | 'incident_response_plan'
  | 'access_control_policy'
  | 'training_logs'
  | 'business_associate_agreements'
  | 'audit_logs'
  | 'encryption_configuration'
  | 'backup_recovery_tests'
  | 'mfa_configuration'
  | 'device_control_inventory'
  | 'employee_termination_checklist'
  | 'breach_log'
  | 'vulnerability_scan_reports'
  | 'penetration_test_report'
  | 'cloud_security_configuration'
  | 'vendor_soc2_report'
  | 'risk_remediation_plan'
  | 'sanction_documentation'
  // Legacy types (for backward compatibility)
  | 'security_risk_analysis'
  | 'penetration_test'
  | 'vulnerability_scan'
  | 'policy_procedure'
  | 'workforce_training_log'
  | 'signed_acknowledgment'
  | 'system_settings_screenshot'
  | 'mfa_configuration_proof'
  | 'encryption_configuration_proof'
  | 'audit_log'
  | 'backup_log'
  | 'incident_report'
  | 'business_associate_agreement'
  | 'vendor_security_attestation'
  | 'access_control_export'
  | 'termination_checklist'
  | 'hipaa_training_certificate'
  | 'incident_response_drill_record'
  | 'system_architecture_diagram'
  | 'other';

export type EvidenceStatus = 'VALID' | 'EXPIRED' | 'MISSING' | 'REQUIRES_REVIEW' | 'ARCHIVED';

export type HIPAACategory = 
  | 'Administrative Safeguards'
  | 'Physical Safeguards'
  | 'Technical Safeguards'
  | 'Breach Response'
  | 'Workforce Compliance'
  | 'Vendor Compliance'
  | 'Audit & Logging'
  | 'Risk Management'
  | 'Privacy Rule'
  | 'Security Rule';

export interface ComplianceEvidence {
  id: string;
  organization_id: string;
  title: string;
  description?: string;
  evidence_type: EvidenceType;
  evidence_field_id?: string; // Links to evidence field from evidence_fields_config
  hipaa_category: HIPAACategory[];
  hipaa_safeguard?: string[];
  hipaa_rule_citation?: string[];
  related_question_ids?: string[];
  related_document_ids?: string[];
  file_url?: string;
  file_name?: string;
  file_type?: string;
  file_size?: number;
  storage_bucket?: string;
  uploaded_by: string;
  upload_date: string;
  ip_address?: string;
  user_agent?: string;
  attestation_signed: boolean;
  attestation_signed_by?: string;
  attestation_signed_at?: string;
  attestation_ip_address?: string;
  validity_period_days?: number;
  validity_start_date?: string;
  validity_end_date?: string;
  review_due_date?: string;
  last_reviewed_at?: string;
  last_reviewed_by?: string;
  status: EvidenceStatus;
  legal_weight?: string;
  audit_trail?: any[];
  retention_until?: string;
  tags?: string[];
  notes?: string;
  external_reference?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface CreateEvidenceInput {
  title: string;
  description?: string;
  evidence_type: EvidenceType;
  evidence_field_id?: string; // Links to evidence field from evidence_fields_config
  catalog_id?: string;
  capture_type?: 'document_upload' | 'external_link' | 'attestation' | 'system_generated' | 'screenshot';
  external_link?: string;
  frequency?: 'annually' | 'quarterly' | 'monthly' | 'continuously' | 'on_hire' | 'on_termination' | 'on_incident' | 'on_risk_identified' | 'on_violation' | 'on_contract';
  required_signatures?: string[];
  ocr_expectations?: string;
  hipaa_category: HIPAACategory[];
  hipaa_safeguard?: string[];
  hipaa_rule_citation?: string[];
  related_question_ids?: string[];
  related_document_ids?: string[];
  file_url?: string;
  file_name?: string;
  file_type?: string;
  file_size?: number;
  storage_bucket?: string;
  validity_period_days?: number;
  validity_start_date?: string;
  review_due_date?: string;
  tags?: string[];
  notes?: string;
  external_reference?: string;
  attestation_signed?: boolean;
}

/**
 * Get all compliance evidence for the current user's organization
 */
export async function getAllComplianceEvidence(): Promise<ComplianceEvidence[]> {
  const supabase = createClient() as any; // Note: compliance_evidence table exists but may not be in TypeScript types yet
  const user = await getUser(supabase);

  if (!user) {
    return [];
  }

  // Get organization
  const { data: organization } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!organization) {
    return [];
  }

  // Get client IP and user agent (for audit trail)
  const forwardedFor = typeof window !== 'undefined' ? 
    (await fetch('/api/get-client-info').then(r => r.json()).catch(() => ({}))).ip : 
    'server';

  // Load all evidence (excluding soft-deleted)
  // Note: compliance_evidence table exists but may not be in TypeScript types yet
  const { data: evidence, error } = await (supabase as any)
    .from('compliance_evidence')
    .select('*')
    .eq('organization_id', organization.id)
    .is('deleted_at', null)
    .order('upload_date', { ascending: false });

  if (error) {
    console.error('Error loading compliance evidence:', error);
    return [];
  }

  return evidence || [];
}

/**
 * Get evidence by ID
 */
export async function getEvidenceById(evidenceId: string): Promise<ComplianceEvidence | null> {
  const supabase = createClient() as any; // Note: compliance_evidence table exists but may not be in TypeScript types yet
  const user = await getUser(supabase);

  if (!user) {
    return null;
  }

  // Get organization
  const { data: organization } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!organization) {
    return null;
  }

  const { data: evidence, error } = await supabase
    .from('compliance_evidence')
    .select('*')
    .eq('id', evidenceId)
    .eq('organization_id', organization.id)
    .is('deleted_at', null)
    .single();

  if (error) {
    console.error('Error loading evidence:', error);
    return null;
  }

  return evidence;
}

/**
 * Create new compliance evidence
 */
export async function createComplianceEvidence(
  input: CreateEvidenceInput
): Promise<{ success: boolean; evidence_id?: string; error?: string }> {
  const supabase = createClient() as any; // Note: compliance_evidence table exists but may not be in TypeScript types yet
  const user = await getUser(supabase);

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Get organization
  const { data: organization } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!organization) {
    return { success: false, error: 'Organization not found' };
  }

  // Log what we're about to save
  console.log('💾 Creating evidence with:', {
    title: input.title,
    evidence_type: input.evidence_type,
    related_document_ids: input.related_document_ids,
    organization_id: organization.id,
    file_name: input.file_name,
    file_url: input.file_url
  });

  // Insert evidence
  const { data: evidence, error } = await supabase
    .from('compliance_evidence')
    .insert({
      organization_id: organization.id,
      title: input.title,
      description: input.description,
      evidence_type: input.evidence_type,
      evidence_field_id: input.evidence_field_id,
      catalog_id: input.catalog_id,
      capture_type: input.capture_type || 'document_upload',
      external_link: input.external_link,
      frequency: input.frequency,
      required_signatures: input.required_signatures || [],
      ocr_expectations: input.ocr_expectations,
      hipaa_category: input.hipaa_category,
      hipaa_safeguard: input.hipaa_safeguard || [],
      hipaa_rule_citation: input.hipaa_rule_citation || [],
      related_question_ids: input.related_question_ids || [],
      related_document_ids: input.related_document_ids || [],
      file_url: input.file_url,
      file_name: input.file_name,
      file_type: input.file_type,
      file_size: input.file_size,
      storage_bucket: input.storage_bucket || 'evidence',
      uploaded_by: user.id,
      validity_period_days: input.validity_period_days,
      validity_start_date: input.validity_start_date || new Date().toISOString().split('T')[0],
      review_due_date: input.review_due_date,
      tags: input.tags || [],
      notes: input.notes,
      external_reference: input.external_reference,
      attestation_signed: input.attestation_signed || false,
      status: 'VALID',
    })
    .select('id, related_document_ids')
    .single();

  if (error) {
    console.error('Error creating evidence:', error);
    return { success: false, error: error.message };
  }

  console.log('✅ Evidence created successfully:', {
    evidence_id: evidence.id,
    related_document_ids: evidence.related_document_ids,
    title: input.title
  });

  // Create mappings if provided
  if (evidence && input.related_question_ids && input.related_question_ids.length > 0) {
    const questionMappings = input.related_question_ids.map((qId, index) => ({
      evidence_id: evidence.id,
      question_id: qId,
      question_sequence: index,
      mapped_by: user.id,
    }));

    await supabase
      .from('evidence_question_mapping')
      .insert(questionMappings);
  }

  if (evidence && input.related_document_ids && input.related_document_ids.length > 0) {
    const documentMappings = input.related_document_ids.map((docId) => ({
      evidence_id: evidence.id,
      document_id: docId,
      mapped_by: user.id,
    }));

    const { error: mappingError } = await supabase
      .from('evidence_document_mapping')
      .insert(documentMappings);
    
    if (mappingError) {
      console.error('Error creating document mappings:', mappingError);
    } else {
      console.log(`✅ Created ${documentMappings.length} document mappings for evidence ${evidence.id}`);
      console.log('Mapped documents:', input.related_document_ids);
    }
  }

  if (evidence && input.hipaa_safeguard && input.hipaa_safeguard.length > 0) {
    const safeguardMappings = input.hipaa_safeguard.map((safeguard) => ({
      evidence_id: evidence.id,
      safeguard_code: safeguard,
      mapped_by: user.id,
    }));

    await supabase
      .from('evidence_safeguard_mapping')
      .insert(safeguardMappings);
  }

  return { success: true, evidence_id: evidence.id };
}

/**
 * Update compliance evidence
 */
export async function updateComplianceEvidence(
  evidenceId: string,
  updates: Partial<CreateEvidenceInput>
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient() as any; // Note: compliance_evidence table exists but may not be in TypeScript types yet
  const user = await getUser(supabase);

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Get organization
  const { data: organization } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!organization) {
    return { success: false, error: 'Organization not found' };
  }

  // Update evidence
  const { error } = await supabase
    .from('compliance_evidence')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', evidenceId)
    .eq('organization_id', organization.id);

  if (error) {
    console.error('Error updating evidence:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Delete (soft delete) compliance evidence
 */
export async function deleteComplianceEvidence(
  evidenceId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient() as any; // Note: compliance_evidence table exists but may not be in TypeScript types yet
  const user = await getUser(supabase);

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Get organization
  const { data: organization } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!organization) {
    return { success: false, error: 'Organization not found' };
  }

  // Soft delete
  const { error } = await supabase
    .from('compliance_evidence')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', evidenceId)
    .eq('organization_id', organization.id);

  if (error) {
    console.error('Error deleting evidence:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Get evidence by document ID
 * Searches both the mapping table and the related_document_ids field
 */
export async function getEvidenceByDocumentId(
  documentId: string
): Promise<ComplianceEvidence[]> {
  console.log('🔍 getEvidenceByDocumentId called with documentId:', documentId);
  const supabase = createClient() as any; // Note: compliance_evidence table exists but may not be in TypeScript types yet
  const user = await getUser(supabase);

  if (!user) {
    console.log('❌ No user found in getEvidenceByDocumentId');
    return [];
  }

  // Get organization
  const { data: organization } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!organization) {
    console.log('❌ No organization found in getEvidenceByDocumentId');
    return [];
  }

  console.log('✅ Organization found:', organization.id);

  // Method 1: Get evidence from mapping table (legacy)
  const { data: mappings, error: mappingError } = await supabase
    .from('evidence_document_mapping')
    .select('evidence_id')
    .eq('document_id', documentId);

  if (mappingError) {
    console.error('Error loading evidence mappings:', mappingError);
  }

  const mappedEvidenceIds = mappings?.map((m: any) => m.evidence_id) || [];
  console.log(`📋 Found ${mappedEvidenceIds.length} evidence IDs from mapping table for document ${documentId}`);

  // Method 2: Get evidence where documentId is in related_document_ids array
  // Try both .contains() and manual filtering as fallback
  let directEvidence: ComplianceEvidence[] = [];
  
  // First try: Use .contains() operator
  const { data: directEvidenceData, error: directError } = await supabase
    .from('compliance_evidence')
    .select('*')
    .eq('organization_id', organization.id)
    .contains('related_document_ids', [documentId])
    .is('deleted_at', null)
    .eq('status', 'VALID');

  if (directError) {
    console.warn('⚠️ .contains() query failed, trying manual filter:', directError.message);
  }

  // Always do manual filtering as well to ensure we catch everything
  const { data: allEvidence, error: allError } = await supabase
    .from('compliance_evidence')
    .select('*')
    .eq('organization_id', organization.id)
    .is('deleted_at', null)
    .eq('status', 'VALID');
  
  if (!allError && allEvidence) {
    // Filter manually in JavaScript (more reliable)
    const manuallyFiltered = allEvidence.filter((ev: any) => {
      if (!ev.related_document_ids || !Array.isArray(ev.related_document_ids)) {
        return false;
      }
      return ev.related_document_ids.includes(documentId);
    });
    
    console.log(`📊 Manual filter found ${manuallyFiltered.length} evidence items with documentId ${documentId}`);
    if (manuallyFiltered.length > 0) {
      console.log('Evidence titles (manual):', manuallyFiltered.map((e: any) => e.title));
      console.log('Evidence related_document_ids (manual):', manuallyFiltered.map((e: any) => e.related_document_ids));
    }
    
    // Use manual filter result (more reliable)
    directEvidence = manuallyFiltered;
  } else if (!directError && directEvidenceData) {
    // Use .contains() result if it worked
    directEvidence = directEvidenceData || [];
    console.log(`✅ Found ${directEvidence.length} evidence items with .contains() query`);
    if (directEvidence.length > 0) {
      console.log('Evidence titles (.contains):', directEvidence.map(e => e.title));
      console.log('Evidence related_document_ids (.contains):', directEvidence.map(e => e.related_document_ids));
    }
  }
  
  if (directEvidence.length === 0) {
    console.log(`⚠️ No evidence found for document ${documentId}. Checking all evidence in organization...`);
    if (allEvidence) {
      console.log(`Total evidence in organization: ${allEvidence.length}`);
      console.log('Sample evidence related_document_ids:', allEvidence.slice(0, 3).map((e: any) => ({
        title: e.title,
        related_document_ids: e.related_document_ids
      })));
    }
  }

  // Combine both methods
  let allEvidenceIds = new Set(mappedEvidenceIds);
  const directEvidenceIds = directEvidence.map(e => e.id);
  directEvidenceIds.forEach(id => allEvidenceIds.add(id));

  // If we have mapped evidence IDs that aren't already in directEvidence, fetch them
  let mappedEvidence: ComplianceEvidence[] = [];
  const missingIds = Array.from(allEvidenceIds).filter((id: any) => !directEvidenceIds.includes(id));
  
  if (missingIds.length > 0) {
    const { data: evidence, error } = await supabase
      .from('compliance_evidence')
      .select('*')
      .eq('organization_id', organization.id)
      .in('id', missingIds)
      .is('deleted_at', null)
      .eq('status', 'VALID')
      .order('upload_date', { ascending: false });

    if (error) {
      console.error('Error loading mapped evidence by document:', error);
    } else {
      mappedEvidence = evidence || [];
    }
  }

  // Combine direct evidence and mapped evidence, removing duplicates
  const combinedEvidence = [
    ...directEvidence,
    ...mappedEvidence
  ];

  // Remove duplicates by ID
  const uniqueEvidence = Array.from(
    new Map(combinedEvidence.map(e => [e.id, e])).values()
  );

  // Sort by upload date (newest first)
  uniqueEvidence.sort((a, b) => {
    const dateA = new Date(a.upload_date).getTime();
    const dateB = new Date(b.upload_date).getTime();
    return dateB - dateA;
  });

  console.log(`📊 Final evidence count for document ${documentId}: ${uniqueEvidence.length}`);
  if (uniqueEvidence.length > 0) {
    console.log('Final evidence titles:', uniqueEvidence.map(e => e.title));
  }

  return uniqueEvidence;
}

/**
 * Get evidence by field ID (evidence_field_id)
 */
export async function getEvidenceByFieldId(
  fieldId: string
): Promise<ComplianceEvidence[]> {
  const supabase = createClient() as any; // Note: compliance_evidence table exists but may not be in TypeScript types yet
  const user = await getUser(supabase);

  if (!user) {
    return [];
  }

  // Get organization
  const { data: organization } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!organization) {
    return [];
  }

  // Get evidence by field_id
  const { data: evidence, error } = await supabase
    .from('compliance_evidence')
    .select('*')
    .eq('organization_id', organization.id)
    .eq('evidence_field_id', fieldId)
    .is('deleted_at', null)
    .order('upload_date', { ascending: false });

  if (error) {
    console.error('Error loading evidence by field_id:', error);
    return [];
  }

  return evidence || [];
}

/**
 * Get evidence by question ID
 */
export async function getEvidenceByQuestionId(
  questionId: string
): Promise<ComplianceEvidence[]> {
  const supabase = createClient() as any; // Note: compliance_evidence table exists but may not be in TypeScript types yet
  const user = await getUser(supabase);

  if (!user) {
    return [];
  }

  // Get organization
  const { data: organization } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!organization) {
    return [];
  }

  // Get evidence mapped to this question
  const { data: mappings, error: mappingError } = await supabase
    .from('evidence_question_mapping')
    .select('evidence_id')
    .eq('question_id', questionId);

  if (mappingError || !mappings || mappings.length === 0) {
    return [];
  }

  const evidenceIds = mappings.map((m: any) => m.evidence_id);

  const { data: evidence, error } = await supabase
    .from('compliance_evidence')
    .select('*')
    .eq('organization_id', organization.id)
    .in('id', evidenceIds)
    .is('deleted_at', null)
    .eq('status', 'VALID')
    .order('upload_date', { ascending: false });

  if (error) {
    console.error('Error loading evidence by question:', error);
    return [];
  }

  return evidence || [];
}

/**
 * Get evidence by HIPAA safeguard
 */
export async function getEvidenceBySafeguard(
  safeguardCode: string
): Promise<ComplianceEvidence[]> {
  const supabase = createClient() as any; // Note: compliance_evidence table exists but may not be in TypeScript types yet
  const user = await getUser(supabase);

  if (!user) {
    return [];
  }

  // Get organization
  const { data: organization } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!organization) {
    return [];
  }

  // Get evidence mapped to this safeguard
  const { data: mappings, error: mappingError } = await supabase
    .from('evidence_safeguard_mapping')
    .select('evidence_id')
    .eq('safeguard_code', safeguardCode);

  if (mappingError || !mappings || mappings.length === 0) {
    return [];
  }

  const evidenceIds = mappings.map((m: any) => m.evidence_id);

  const { data: evidence, error } = await supabase
    .from('compliance_evidence')
    .select('*')
    .eq('organization_id', organization.id)
    .in('id', evidenceIds)
    .is('deleted_at', null)
    .eq('status', 'VALID')
    .order('upload_date', { ascending: false });

  if (error) {
    console.error('Error loading evidence by safeguard:', error);
    return [];
  }

  return evidence || [];
}

/**
 * Get evidence statistics
 */
export async function getEvidenceStatistics(): Promise<{
  total: number;
  by_status: Record<EvidenceStatus, number>;
  by_type: Record<EvidenceType, number>;
  by_category: Record<HIPAACategory, number>;
  expiring_soon: number; // Within 30 days
  requires_review: number;
}> {
  const supabase = createClient() as any; // Note: compliance_evidence table exists but may not be in TypeScript types yet
  const user = await getUser(supabase);

  if (!user) {
    return {
      total: 0,
      by_status: {} as Record<EvidenceStatus, number>,
      by_type: {} as Record<EvidenceType, number>,
      by_category: {} as Record<HIPAACategory, number>,
      expiring_soon: 0,
      requires_review: 0,
    };
  }

  // Get organization
  const { data: organization } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!organization) {
    return {
      total: 0,
      by_status: {} as Record<EvidenceStatus, number>,
      by_type: {} as Record<EvidenceType, number>,
      by_category: {} as Record<HIPAACategory, number>,
      expiring_soon: 0,
      requires_review: 0,
    };
  }

  const { data: evidence, error } = await supabase
    .from('compliance_evidence')
    .select('status, evidence_type, hipaa_category, validity_end_date, review_due_date')
    .eq('organization_id', organization.id)
    .is('deleted_at', null);

  if (error || !evidence) {
    return {
      total: 0,
      by_status: {} as Record<EvidenceStatus, number>,
      by_type: {} as Record<EvidenceType, number>,
      by_category: {} as Record<HIPAACategory, number>,
      expiring_soon: 0,
      requires_review: 0,
    };
  }

  const stats = {
    total: evidence.length,
    by_status: {} as Record<EvidenceStatus, number>,
    by_type: {} as Record<EvidenceType, number>,
    by_category: {} as Record<HIPAACategory, number>,
    expiring_soon: 0,
    requires_review: 0,
  };

  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  for (const ev of evidence) {
    // Count by status
    stats.by_status[ev.status as EvidenceStatus] = 
      (stats.by_status[ev.status as EvidenceStatus] || 0) + 1;

    // Count by type
    stats.by_type[ev.evidence_type as EvidenceType] = 
      (stats.by_type[ev.evidence_type as EvidenceType] || 0) + 1;

    // Count by category
    if (ev.hipaa_category && Array.isArray(ev.hipaa_category)) {
      for (const cat of ev.hipaa_category) {
        stats.by_category[cat as HIPAACategory] = 
          (stats.by_category[cat as HIPAACategory] || 0) + 1;
      }
    }

    // Count expiring soon
    if (ev.validity_end_date) {
      const endDate = new Date(ev.validity_end_date);
      if (endDate <= thirtyDaysFromNow && endDate > new Date()) {
        stats.expiring_soon++;
      }
    }

    // Count requires review
    if (ev.review_due_date) {
      const reviewDate = new Date(ev.review_due_date);
      if (reviewDate <= new Date()) {
        stats.requires_review++;
      }
    }
  }

  return stats;
}

/**
 * Sign attestation for evidence
 */
export async function signEvidenceAttestation(
  evidenceId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient() as any; // Note: compliance_evidence table exists but may not be in TypeScript types yet
  const user = await getUser(supabase);

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Get organization
  const { data: organization } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!organization) {
    return { success: false, error: 'Organization not found' };
  }

  // Update evidence with attestation
  const { error } = await supabase
    .from('compliance_evidence')
    .update({
      attestation_signed: true,
      attestation_signed_by: user.id,
      attestation_signed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', evidenceId)
    .eq('organization_id', organization.id);

  if (error) {
    console.error('Error signing attestation:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
