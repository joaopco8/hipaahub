'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export type ClinicType = 'medical' | 'dental' | 'mental-health' | 'therapy';

export interface OrganizationData {
  name: string;
  legal_name: string;
  dba?: string;
  type: ClinicType;
  state: string;
  address_street: string;
  address_city: string;
  address_state: string;
  address_zip: string;
  security_officer_name: string;
  security_officer_email: string;
  security_officer_role: string;
  privacy_officer_name: string;
  privacy_officer_email: string;
  privacy_officer_role: string;
  employeeCount: number;
  has_employees: boolean;
  uses_contractors: boolean;
  stores_phi_electronically: boolean;
  uses_cloud_services: boolean;
  // US HIPAA Required Fields
  ein?: string;
  npi?: string;
  state_license_number?: string;
  state_tax_id?: string;
  ceo_name?: string;
  ceo_title?: string;
  authorized_representative_name?: string;
  authorized_representative_title?: string;
  // Conditional Fields
  performs_laboratory_tests?: boolean;
  clia_certificate_number?: string;
  serves_medicare_patients?: boolean;
  medicare_provider_number?: string;
  // Optional but Recommended
  phone_number?: string;
  email_address?: string;
  website?: string;
  accreditation_status?: string;
  types_of_services?: string;
  insurance_coverage?: string;
  // Additional metadata fields
  practice_type_primary?: string;
  specialties?: string[];
  number_of_locations?: number;
  multi_state_operations?: boolean;
  remote_workforce?: boolean;
  ehr_system?: string;
  email_provider?: string;
  cloud_storage_provider?: string;
  uses_vpn?: boolean;
  vpn_provider?: string;
  device_types?: string[];
  security_officer_role_other?: string;
  privacy_officer_role_other?: string;
  primary_contact_name?: string;
  compliance_contact_email?: string;
  compliance_contact_phone?: string;
}

export interface RiskAssessmentData {
  answers: Record<string, string>;
  riskLevel: 'low' | 'medium' | 'high';
  totalRiskScore: number;
  maxPossibleScore: number;
  riskPercentage: number;
}

export interface StaffMemberData {
  email: string;
  role: 'staff' | 'admin';
}

/**
 * Clear all onboarding data for the current user
 * This is used when retaking the onboarding
 */
export async function clearOnboardingData() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Delete in order to respect foreign key constraints
  // 1. Delete action items (depends on risk_assessment)
  const { error: actionItemsError } = await supabase
    .from('action_items')
    .delete()
    .eq('user_id', user.id);

  if (actionItemsError) {
    console.error('Error deleting action items:', actionItemsError);
    // Continue anyway, might not exist
  }

  // 2. Delete risk assessment
  const { error: riskAssessmentError } = await supabase
    .from('risk_assessments')
    .delete()
    .eq('user_id', user.id);

  if (riskAssessmentError) {
    console.error('Error deleting risk assessment:', riskAssessmentError);
    // Continue anyway, might not exist
  }

  // 3. Delete staff members
  const { error: staffMembersError } = await supabase
    .from('staff_members')
    .delete()
    .eq('user_id', user.id);

  if (staffMembersError) {
    console.error('Error deleting staff members:', staffMembersError);
    // Continue anyway, might not exist
  }

  // 4. Delete compliance commitment
  const { error: commitmentError } = await supabase
    .from('compliance_commitments')
    .delete()
    .eq('user_id', user.id);

  if (commitmentError) {
    console.error('Error deleting compliance commitment:', commitmentError);
    // Continue anyway, might not exist
  }

  // Note: We keep the organization as it might be useful to preserve

  revalidatePath('/dashboard');
}

// Auto-save Organization Data (partial save)
export async function autoSaveOrganizationData(data: Partial<OrganizationData & {
  practice_type_primary?: string;
  specialties?: string[];
  number_of_locations?: number;
  multi_state_operations?: boolean;
  remote_workforce?: boolean;
  ehr_system?: string;
  email_provider?: string;
  cloud_storage_provider?: string;
  uses_vpn?: boolean;
  vpn_provider?: string;
  device_types?: string[];
  security_officer_role_other?: string;
  privacy_officer_role_other?: string;
  primary_contact_name?: string;
  compliance_contact_email?: string;
  compliance_contact_phone?: string;
}>) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'User not authenticated' };
  }

  // Use RPC function to bypass RLS and ensure all data is saved
  // This function handles INSERT/UPDATE automatically
  const stateValue = data.state?.trim() || data.address_state?.trim() || 'CA';
  
  // Prepare complete data object with all fields including metadata
  const jsonData: any = {
    name: data.name || 'Unnamed Organization',
    legal_name: data.legal_name || data.name || 'Unnamed Organization',
    dba: data.dba || null,
    type: data.type || data.practice_type_primary || 'medical',
    state: stateValue,
    employee_count: data.employeeCount || 1,
    address_street: data.address_street || null,
    address_city: data.address_city || null,
    address_state: data.address_state || data.state || null,
    address_zip: data.address_zip || null,
    security_officer_name: data.security_officer_name || null,
    security_officer_email: data.security_officer_email || null,
    security_officer_role: data.security_officer_role || null,
    privacy_officer_name: data.privacy_officer_name || null,
    privacy_officer_email: data.privacy_officer_email || null,
    privacy_officer_role: data.privacy_officer_role || null,
    has_employees: data.has_employees ?? true,
    uses_contractors: data.uses_contractors ?? false,
    stores_phi_electronically: data.stores_phi_electronically ?? true,
    uses_cloud_services: data.uses_cloud_services ?? false,
    // US HIPAA Required Legal Identifiers
    ein: data.ein || null,
    npi: data.npi || null,
    state_license_number: data.state_license_number || null,
    state_tax_id: data.state_tax_id || null,
    // Authorized Representative / CEO
    authorized_representative_name: data.authorized_representative_name || null,
    authorized_representative_title: data.authorized_representative_title || null,
    ceo_name: data.ceo_name || null,
    ceo_title: data.ceo_title || null,
    // Conditional Fields
    performs_laboratory_tests: data.performs_laboratory_tests ?? false,
    clia_certificate_number: data.clia_certificate_number || null,
    serves_medicare_patients: data.serves_medicare_patients ?? false,
    medicare_provider_number: data.medicare_provider_number || null,
    // Optional but Recommended
    phone_number: data.phone_number || null,
    email_address: data.email_address || null,
    website: data.website || null,
    accreditation_status: data.accreditation_status || null,
    types_of_services: data.types_of_services || null,
    insurance_coverage: data.insurance_coverage || null,
    // Additional metadata fields (stored in onboarding_metadata JSONB column)
    practice_type_primary: data.practice_type_primary || null,
    specialties: data.specialties || null,
    number_of_locations: data.number_of_locations || null,
    multi_state_operations: data.multi_state_operations ?? null,
    remote_workforce: data.remote_workforce ?? null,
    ehr_system: data.ehr_system || null,
    email_provider: data.email_provider || null,
    cloud_storage_provider: data.cloud_storage_provider || null,
    uses_vpn: data.uses_vpn ?? null,
    vpn_provider: data.vpn_provider || null,
    device_types: data.device_types || null,
    security_officer_role_other: data.security_officer_role_other || null,
    privacy_officer_role_other: data.privacy_officer_role_other || null,
    primary_contact_name: data.primary_contact_name || null,
    compliance_contact_email: data.compliance_contact_email || null,
    compliance_contact_phone: data.compliance_contact_phone || null
  };

  try {
    // Use RPC function which handles RLS properly
    // Note: RPC function exists but may not be in TypeScript types yet
    const { data: result, error: rpcError } = await (supabase as any)
      .rpc('upsert_organization_jsonb', {
        p_data: jsonData
      })
      .single();
    
    if (rpcError) {
      console.error('Auto-save RPC error:', rpcError);
      return { success: false, error: rpcError.message };
    }
    
    // Save additional metadata fields that aren't in organizations table
    // These can be stored in a separate metadata table or JSONB column if needed
    // For now, we'll save the core organization data
    
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Auto-save error:', error);
    return { success: false, error: error.message || 'Failed to save organization data' };
  }
}

// Load saved Organization Data
export async function loadSavedOrganizationData() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  const { data: organization } = await supabase
    .from('organizations')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!organization) {
    return null;
  }

  // Extract metadata if it exists
  const metadata = ((organization as any).onboarding_metadata) || {};

  return {
    name: organization.name || '',
    legal_name: organization.legal_name || organization.name || '',
    dba: organization.dba || '',
    type: organization.type as ClinicType,
    state: organization.state || '',
    address_street: organization.address_street || '',
    address_city: organization.address_city || '',
    address_state: organization.address_state || organization.state || '',
    address_zip: organization.address_zip || '',
    security_officer_name: organization.security_officer_name || '',
    security_officer_email: organization.security_officer_email || '',
    security_officer_role: organization.security_officer_role || '',
    privacy_officer_name: organization.privacy_officer_name || '',
    privacy_officer_email: organization.privacy_officer_email || '',
    privacy_officer_role: organization.privacy_officer_role || '',
    employeeCount: organization.employee_count || 1,
    has_employees: organization.has_employees ?? true,
    uses_contractors: organization.uses_contractors ?? false,
    stores_phi_electronically: organization.stores_phi_electronically ?? true,
    uses_cloud_services: organization.uses_cloud_services ?? false,
    // US HIPAA Required Legal Identifiers
    ein: (organization as any).ein || '',
    npi: (organization as any).npi || '',
    state_license_number: (organization as any).state_license_number || '',
    state_tax_id: (organization as any).state_tax_id || '',
    // Authorized Representative / CEO
    authorized_representative_name: (organization as any).authorized_representative_name || '',
    authorized_representative_title: (organization as any).authorized_representative_title || '',
    ceo_name: (organization as any).ceo_name || '',
    ceo_title: (organization as any).ceo_title || '',
    // Conditional Fields
    performs_laboratory_tests: (organization as any).performs_laboratory_tests ?? false,
    clia_certificate_number: (organization as any).clia_certificate_number || '',
    serves_medicare_patients: (organization as any).serves_medicare_patients ?? false,
    medicare_provider_number: (organization as any).medicare_provider_number || '',
    // Optional but Recommended
    phone_number: (organization as any).phone_number || '',
    email_address: (organization as any).email_address || '',
    website: (organization as any).website || '',
    accreditation_status: (organization as any).accreditation_status || '',
    types_of_services: (organization as any).types_of_services || '',
    insurance_coverage: (organization as any).insurance_coverage || '',
    // Metadata fields
    practice_type_primary: metadata.practice_type_primary || organization.type || '',
    specialties: metadata.specialties || [],
    number_of_locations: metadata.number_of_locations || 1,
    multi_state_operations: metadata.multi_state_operations ?? false,
    remote_workforce: metadata.remote_workforce ?? false,
    ehr_system: metadata.ehr_system || 'not-applicable',
    email_provider: metadata.email_provider || 'not-specified',
    cloud_storage_provider: metadata.cloud_storage_provider || 'not-using-cloud',
    uses_vpn: metadata.uses_vpn ?? false,
    vpn_provider: metadata.vpn_provider || 'not-specified',
    device_types: metadata.device_types || [],
    security_officer_role_other: metadata.security_officer_role_other || '',
    privacy_officer_role_other: metadata.privacy_officer_role_other || '',
    primary_contact_name: metadata.primary_contact_name || '',
    compliance_contact_email: metadata.compliance_contact_email || '',
    compliance_contact_phone: metadata.compliance_contact_phone || ''
  };
}

// Save Organization
export async function saveOrganization(data: OrganizationData) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Use RPC function to bypass schema cache issues
  // This is the most reliable way to save organization data
  // SECURITY: Do NOT send user_id - the RPC function uses auth.uid() internally
  
  // VALIDAÇÃO: Garantir que state sempre tenha um valor (obrigatório no banco)
  const stateValue = data.state?.trim() || data.address_state?.trim() || 'CA';
  
  const jsonData = {
    name: data.name || 'Unnamed Organization',
    legal_name: data.legal_name || data.name || 'Unnamed Organization',
    dba: data.dba || null,
    type: data.type || 'medical',
    state: stateValue, // SEMPRE terá um valor (validado acima)
    employee_count: data.employeeCount || 1,
    address_street: data.address_street || null,
    address_city: data.address_city || null,
    address_state: data.address_state || data.state || null, // address_state pode usar state como fallback
    address_zip: data.address_zip || null,
    security_officer_name: data.security_officer_name || null,
    security_officer_email: data.security_officer_email || null,
    security_officer_role: data.security_officer_role || null,
    privacy_officer_name: data.privacy_officer_name || null,
    privacy_officer_email: data.privacy_officer_email || null,
    privacy_officer_role: data.privacy_officer_role || null,
    has_employees: data.has_employees ?? true,
    uses_contractors: data.uses_contractors ?? false,
    stores_phi_electronically: data.stores_phi_electronically ?? true,
    uses_cloud_services: data.uses_cloud_services ?? false,
    // US HIPAA Required Legal Identifiers
    ein: data.ein || null,
    npi: data.npi || null,
    state_license_number: data.state_license_number || null,
    state_tax_id: data.state_tax_id || null,
    // Authorized Representative / CEO
    authorized_representative_name: data.authorized_representative_name || null,
    authorized_representative_title: data.authorized_representative_title || null,
    ceo_name: data.ceo_name || null,
    ceo_title: data.ceo_title || null,
    // Conditional Fields
    performs_laboratory_tests: data.performs_laboratory_tests ?? false,
    clia_certificate_number: data.clia_certificate_number || null,
    serves_medicare_patients: data.serves_medicare_patients ?? false,
    medicare_provider_number: data.medicare_provider_number || null,
    // Optional but Recommended
    phone_number: data.phone_number || null,
    email_address: data.email_address || null,
    website: data.website || null,
    accreditation_status: data.accreditation_status || null,
    types_of_services: data.types_of_services || null,
    insurance_coverage: data.insurance_coverage || null,
    // Additional metadata fields
    practice_type_primary: data.practice_type_primary || data.type || null,
    specialties: data.specialties || null,
    number_of_locations: data.number_of_locations || null,
    multi_state_operations: data.multi_state_operations ?? null,
    remote_workforce: data.remote_workforce ?? null,
    ehr_system: data.ehr_system || null,
    email_provider: data.email_provider || null,
    cloud_storage_provider: data.cloud_storage_provider || null,
    uses_vpn: data.uses_vpn ?? null,
    vpn_provider: data.vpn_provider || null,
    device_types: data.device_types || null,
    security_officer_role_other: data.security_officer_role_other || null,
    privacy_officer_role_other: data.privacy_officer_role_other || null,
    primary_contact_name: data.primary_contact_name || null,
    compliance_contact_email: data.compliance_contact_email || null,
    compliance_contact_phone: data.compliance_contact_phone || null
  };

  // Use RPC function with SECURITY DEFINER to bypass RLS
  // This function uses auth.uid() internally for security
  console.log('🔄 Saving organization via RPC function...');
  console.log('📦 Data being sent:', JSON.stringify(jsonData, null, 2));
  
  // Note: RPC function exists but may not be in TypeScript types yet
  const { data: result, error: rpcError } = await (supabase as any)
    .rpc('upsert_organization_jsonb', {
      p_data: jsonData
    });
  
  if (rpcError) {
    console.error('❌ Error saving organization via RPC:', rpcError);
    console.error('❌ Error details:', JSON.stringify(rpcError, null, 2));
    throw new Error(`Falha ao criar organização: ${rpcError.message}`);
  }
  
  // A função retorna JSONB, então pode vir como array ou objeto
  const organization = Array.isArray(result) ? result[0] : result;
  
  if (!organization || !organization.id) {
    console.error('❌ Invalid result from RPC:', result);
    throw new Error('Falha ao salvar organização: Resultado inválido retornado');
  }
  
  console.log('✅ Organization saved successfully via RPC:', organization.id);
  
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/organization');
  return organization;
}

// Auto-save Risk Assessment Answers (partial save)
export async function autoSaveRiskAssessmentAnswers(answers: Record<string, string>) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'User not authenticated' };
  }

  // Get organization_id (required for saving)
  const { data: organization, error: orgError } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  // If no organization exists yet, we can't save (user needs to complete organization step first)
  if (orgError || !organization) {
    console.warn('Cannot auto-save: organization not found. User should complete organization step first.');
    return { success: false, error: 'Organization not found. Please complete organization setup first.' };
  }
  
  const organizationId = organization.id;

  // Check if onboarding_risk_assessments table exists, otherwise use risk_assessments
  let existingRiskAssessment = null;
  let tableName = 'onboarding_risk_assessments';
  
  const { data: onboardingData, error: onboardingError } = await supabase
    .from('onboarding_risk_assessments' as any)
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!onboardingError && onboardingData) {
    existingRiskAssessment = onboardingData;
    tableName = 'onboarding_risk_assessments';
  } else {
    // Fallback to risk_assessments if onboarding table doesn't exist
    const { data: regularData, error: regularError } = await supabase
      .from('risk_assessments')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (!regularError && regularData) {
      existingRiskAssessment = regularData;
      tableName = 'risk_assessments';
    }
  }
  
  const riskAssessmentData: any = {
    user_id: user.id,
    organization_id: organizationId,
    answers: answers,
    updated_at: new Date().toISOString()
  };

  // Only include risk level/score if assessment is complete
  // For auto-save, we just save the answers

  let result;
  if (existingRiskAssessment?.id) {
    // UPDATE
    // Note: tableName may reference a table that's not in TypeScript types yet
    const { data, error } = await (supabase as any)
      .from(tableName)
      .update(riskAssessmentData)
      .eq('user_id', user.id)
      .eq('id', existingRiskAssessment.id)
      .select()
      .single();
    
    if (error) {
      console.error('Auto-save error:', error);
      return { success: false, error: error.message };
    }
    result = data;
  } else {
    // INSERT with minimal data (answers only)
    riskAssessmentData.risk_level = 'low'; // Default, will be recalculated on completion
    riskAssessmentData.total_risk_score = 0;
    riskAssessmentData.max_possible_score = 0;
    riskAssessmentData.risk_percentage = 0;
    
    // Note: tableName may reference a table that's not in TypeScript types yet
    const { data, error } = await (supabase as any)
      .from(tableName)
      .insert(riskAssessmentData)
      .select()
      .single();
    
    if (error) {
      console.error('Auto-save error:', error);
      return { success: false, error: error.message };
    }
    result = data;
  }

  return { success: true, data: result };
}

// Load saved Risk Assessment Answers
export async function loadSavedRiskAssessmentAnswers() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  // Try onboarding_risk_assessments first, then risk_assessments
  let riskAssessment = null;
  
  const { data: onboardingData, error: onboardingError } = await supabase
    .from('onboarding_risk_assessments' as any)
    .select('id, answers')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!onboardingError && onboardingData) {
    riskAssessment = onboardingData;
  } else {
    // Fallback to risk_assessments if onboarding table doesn't exist or has no data
    const { data: regularData, error: regularError } = await supabase
      .from('risk_assessments')
      .select('id, answers')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (!regularError && regularData) {
      riskAssessment = regularData;
    }
  }

  if (!riskAssessment || !riskAssessment.answers) {
    return null;
  }

  return {
    id: riskAssessment.id,
    answers: riskAssessment.answers as Record<string, string>
  };
}

// Load evidence data for risk assessment answers
export async function loadRiskAssessmentEvidence(riskAssessmentId?: string) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return {};
  }

  // Get organization
  const { data: organization } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!organization) {
    return {};
  }

  // Get risk assessment ID if not provided
  let assessmentId = riskAssessmentId;
  if (!assessmentId) {
    const { data: assessment } = await supabase
      .from('onboarding_risk_assessments' as any)
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (assessment) {
      assessmentId = assessment.id;
    }
  }

  if (!assessmentId) {
    return {};
  }

  // Load evidence records
  // Note: risk_assessment_evidence table exists but may not be in TypeScript types yet
  const { data: evidenceRecords, error } = await (supabase as any)
    .from('risk_assessment_evidence')
    .select('question_id, evidence_data, uploaded_at, uploaded_by, uploaded_ip')
    .eq('risk_assessment_id', assessmentId)
    .eq('organization_id', organization.id);

  if (error || !evidenceRecords) {
    return {};
  }

  // Transform evidence data to match expected format
  const evidenceData: Record<string, {
    files: Array<{ file_id: string; file_name: string; uploaded_at: string }>;
    attestation_signed: boolean;
    timestamp: string;
    ip_address: string;
  }> = {};

  for (const record of evidenceRecords) {
    const evidence = record.evidence_data as any;
    const files: Array<{ file_id: string; file_name: string; uploaded_at: string }> = [];

    // Extract files from evidence_data
    if (evidence?.documents) {
      for (const doc of evidence.documents) {
        files.push({
          file_id: doc.file_id || doc.id || '',
          file_name: doc.file_name || doc.name || 'Document',
          uploaded_at: doc.uploaded_at || record.uploaded_at || new Date().toISOString()
        });
      }
    }

    if (evidence?.screenshots) {
      for (const screenshot of evidence.screenshots) {
        files.push({
          file_id: screenshot.file_id || screenshot.id || '',
          file_name: screenshot.file_name || screenshot.name || 'Screenshot',
          uploaded_at: screenshot.uploaded_at || record.uploaded_at || new Date().toISOString()
        });
      }
    }

    evidenceData[record.question_id] = {
      files,
      attestation_signed: evidence?.attestations?.length > 0 || false,
      timestamp: record.uploaded_at || new Date().toISOString(),
      ip_address: record.uploaded_ip || 'unknown'
    };
  }

  return evidenceData;
}

// Save Risk Assessment
export async function saveRiskAssessment(data: RiskAssessmentData) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Get organization_id
  const { data: organization } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!organization) {
    throw new Error('Organization not found. Please complete organization setup first.');
  }

  // Delete existing action items before saving new risk assessment
  // This ensures old action items are removed when retaking assessment
  // Note: action_items table may not exist yet, so we ignore errors
  try {
    await supabase
      .from('action_items')
      .delete()
      .eq('user_id', user.id);
  } catch (err) {
    // Ignore errors if table doesn't exist
    console.log('Note: action_items table may not exist, skipping cleanup');
  }

  // Verificar se já existe uma risk assessment para este usuário
  const { data: existingRiskAssessment } = await supabase
    .from('onboarding_risk_assessments' as any)
    .select('id')
    .eq('user_id', user.id)
    .single();
  
  const riskAssessmentData = {
    user_id: user.id,
    organization_id: organization.id,
    answers: data.answers,
    risk_level: data.riskLevel,
    total_risk_score: Number(data.totalRiskScore.toFixed(2)),
    max_possible_score: Number(data.maxPossibleScore.toFixed(2)),
    risk_percentage: Number(data.riskPercentage.toFixed(2)),
    updated_at: new Date().toISOString()
  };
  
  let riskAssessment;
  let error;
  
  if (existingRiskAssessment?.id) {
    // UPDATE
    const { data: updated, error: updateError } = await supabase
      .from('onboarding_risk_assessments' as any)
      .update(riskAssessmentData)
      .eq('user_id', user.id)
      .eq('id', existingRiskAssessment.id)
      .select()
      .single();
    riskAssessment = updated;
    error = updateError;
  } else {
    // INSERT
    const { data: inserted, error: insertError } = await supabase
      .from('onboarding_risk_assessments' as any)
      .insert(riskAssessmentData)
      .select()
      .single();
    riskAssessment = inserted;
    error = insertError;
  }

  if (error) {
    console.error('Error saving risk assessment:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    console.error('Data being saved:', {
      user_id: user.id,
      organization_id: organization.id,
      risk_level: data.riskLevel,
      total_risk_score: data.totalRiskScore,
      max_possible_score: data.maxPossibleScore,
      risk_percentage: data.riskPercentage
    });
    throw new Error(`Failed to save risk assessment: ${error.message || 'Unknown error'}`);
  }

  revalidatePath('/dashboard');
  return riskAssessment;
}

// Save Staff Members
export async function saveStaffMembers(staff: StaffMemberData[]) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Get organization_id
  const { data: organization } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!organization) {
    throw new Error('Organization not found. Please complete organization setup first.');
  }

  // Delete existing staff members for this user
  await supabase
    .from('staff_members')
    .delete()
    .eq('user_id', user.id);

  // Insert new staff members
  if (staff.length > 0) {
    const staffToInsert = staff.map(member => ({
      user_id: user.id,
      organization_id: organization.id,
      email: member.email,
      role: member.role
    }));

    const { data: savedStaff, error } = await supabase
      .from('staff_members')
      .insert(staffToInsert)
      .select();

    if (error) {
      console.error('Error saving staff members:', error);
      throw new Error('Failed to save staff members');
    }

    revalidatePath('/dashboard');
    return savedStaff;
  }

  revalidatePath('/dashboard');
  return [];
}

// Save Compliance Commitment
export async function saveComplianceCommitment() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Get organization_id
  const { data: organization } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!organization) {
    throw new Error('Organization not found. Please complete organization setup first.');
  }

  // Verificar se já existe um commitment para este usuário
  const { data: existingCommitment, error: checkError } = await supabase
    .from('compliance_commitments')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();
  
  // Ignorar erro se não encontrar (é esperado na primeira vez)
  if (checkError && checkError.code !== 'PGRST116') {
    console.error('Error checking existing commitment:', checkError);
    throw new Error(`Falha ao verificar commitment existente: ${checkError.message}`);
  }
  
  const commitmentData = {
    user_id: user.id,
    organization_id: organization.id,
    committed: true,
    committed_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  let commitment;
  let error;
  
  if (existingCommitment?.id) {
    // UPDATE
    const { data: updated, error: updateError } = await supabase
      .from('compliance_commitments')
      .update(commitmentData)
      .eq('user_id', user.id)
      .eq('id', existingCommitment.id)
      .select()
      .single();
    commitment = updated;
    error = updateError;
  } else {
    // INSERT
    const { data: inserted, error: insertError } = await supabase
      .from('compliance_commitments')
      .insert(commitmentData)
      .select()
      .single();
    commitment = inserted;
    error = insertError;
  }

  if (error) {
    console.error('Error saving compliance commitment:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    throw new Error(`Failed to save compliance commitment: ${error.message || 'Unknown error'}`);
  }

  revalidatePath('/dashboard');
  return commitment;
}

// Get Organization
export async function getOrganization() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  const { data: organization, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error || !organization) {
    return null;
  }

  return organization;
}

// Get Risk Assessment
export async function getRiskAssessment() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  const { data: riskAssessment, error } = await supabase
    .from('risk_assessments')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error || !riskAssessment) {
    return null;
  }

  return riskAssessment;
}

// Get Staff Members
export async function getStaffMembers() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  const { data: staff, error } = await supabase
    .from('staff_members')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error) {
    return [];
  }

  return staff || [];
}

// Get Compliance Commitment
export async function getComplianceCommitment() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  const { data: commitment, error } = await supabase
    .from('compliance_commitments')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error || !commitment) {
    return null;
  }

  return commitment;
}

// Generate and Save Action Items
export async function generateAndSaveActionItems() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Get organization and risk assessment
  const { data: organization } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!organization) {
    throw new Error('Organization not found');
  }

  // Get risk assessment from onboarding_risk_assessments table
  const { data: riskAssessment, error: riskError } = await supabase
    .from('onboarding_risk_assessments' as any)
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (riskError && riskError.code !== 'PGRST116') {
    console.error('Error fetching risk assessment:', riskError);
    throw new Error(`Failed to fetch risk assessment: ${riskError.message}`);
  }

  if (!riskAssessment || !riskAssessment.answers) {
    throw new Error('Risk assessment not found. Please complete the risk assessment step first.');
  }

  // Generate action items
  const { generateActionItems } = await import('@/lib/generate-action-items');
  const answers = riskAssessment.answers as Record<string, string>;
  const actionItems = generateActionItems(answers);

  if (actionItems.length === 0) {
    return [];
  }

  // Delete existing action items for this user
  await supabase
    .from('action_items')
    .delete()
    .eq('user_id', user.id);

  // Insert new action items
  // Note: risk_assessment_id might be optional or reference onboarding_risk_assessments
  const itemsToInsert = actionItems.map(item => ({
    user_id: user.id,
    organization_id: organization.id,
    risk_assessment_id: riskAssessment.id, // This should reference onboarding_risk_assessments.id
    item_key: item.itemKey,
    title: item.title,
    description: item.description,
    priority: item.priority,
    category: item.category,
    status: 'pending'
  }));

  // Note: action_items table exists but may have type mismatches
  const { data: savedItems, error } = await (supabase as any)
    .from('action_items')
    .insert(itemsToInsert)
    .select();

  if (error) {
    console.error('Error saving action items:', error);
    throw new Error('Failed to save action items');
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/action-items');
  return savedItems;
}
