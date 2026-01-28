'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export interface OrganizationFormData {
  // Identity
  legal_name: string;
  dba?: string;
  practice_type_primary: 'medical' | 'dental' | 'behavioral-health' | 'laboratory' | 'imaging' | 'telemedicine' | 'hospital' | 'multi-specialty';
  specialties?: string[]; // Multiple specialties
  state: string;
  country: 'US'; // HIPAA is only for United States
  
  // Address (juridically critical - validated by country)
  address_street: string;
  address_city: string;
  address_state: string;
  address_zip: string;
  
  // Security Officer (HIPAA requires names)
  security_officer_name: string;
  security_officer_email: string;
  security_officer_role: 'hipaa-security-officer' | 'compliance-manager' | 'practice-administrator' | 'it-director' | 'ceo' | 'managing-director' | 'other';
  security_officer_role_other?: string; // If "other" selected
  
  // Privacy Officer (can be same person)
  privacy_officer_name: string;
  privacy_officer_email: string;
  privacy_officer_role: 'hipaa-privacy-officer' | 'compliance-manager' | 'practice-administrator' | 'ceo' | 'managing-director' | 'other';
  privacy_officer_role_other?: string; // If "other" selected
  
  // Organization structure (enhanced)
  employee_count: number;
  has_employees: boolean;
  uses_contractors: boolean;
  number_of_locations?: number;
  multi_state_operations?: boolean;
  remote_workforce?: boolean;
  
  // Technology (separated)
  stores_phi_electronically: boolean;
  ehr_system?: string; // Epic, Cerner, Athena, etc.
  email_provider?: string; // Outlook, Gmail, etc.
  cloud_storage_provider?: string; // AWS, Azure, Google Cloud, etc.
  uses_vpn?: boolean;
  vpn_provider?: string;
  device_types?: string[]; // laptops, mobiles, tablets, etc.
  
  // Optional contact information
  primary_contact_name?: string;
  compliance_contact_email?: string;
  compliance_contact_phone?: string;
  
  // US HIPAA Required Legal Identifiers
  ein?: string;
  npi?: string;
  state_license_number?: string;
  clia_certificate_number?: string;
  medicare_provider_number?: string;
  state_tax_id?: string;
  
  // Authorized Representative / CEO
  authorized_representative_name?: string;
  authorized_representative_title?: string;
  ceo_name?: string;
  ceo_title?: string;
  
  // Optional but Recommended
  phone_number?: string;
  email_address?: string;
  website?: string;
  accreditation_status?: string;
  types_of_services?: string;
  insurance_coverage?: string;
  performs_laboratory_tests?: boolean;
  serves_medicare_patients?: boolean;
  
  // Backward compatibility fields
  type?: 'medical' | 'dental' | 'mental-health' | 'therapy'; // Deprecated, use practice_type_primary
  uses_cloud_services?: boolean; // Deprecated, use cloud_storage_provider
  security_officer_role?: string; // Deprecated, use security_officer_role_type
  privacy_officer_role?: string; // Deprecated, use privacy_officer_role_type
}

export async function updateOrganization(data: OrganizationFormData) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Use RPC function to bypass schema cache issues
  // SECURITY: Do NOT send user_id - the RPC function uses auth.uid() internally
  
  // Debug: Log the incoming data
  console.log('📝 Organization update data received:', {
    ein: data.ein,
    npi: data.npi,
    clia_certificate_number: data.clia_certificate_number,
    medicare_provider_number: data.medicare_provider_number,
    performs_laboratory_tests: data.performs_laboratory_tests,
    serves_medicare_patients: data.serves_medicare_patients
  });
  
  const jsonData = {
    name: data.legal_name, // Keep name for backward compatibility
    legal_name: data.legal_name,
    dba: data.dba || null,
    type: data.practice_type_primary || data.type || 'medical', // Backward compatibility
    practice_type_primary: data.practice_type_primary,
    specialties: data.specialties || null,
    state: data.state,
    country: data.country || 'US',
    address_street: data.address_street,
    address_city: data.address_city,
    address_state: data.address_state,
    address_zip: data.address_zip,
    security_officer_name: data.security_officer_name,
    security_officer_email: data.security_officer_email,
    security_officer_role: data.security_officer_role_other || data.security_officer_role || 'HIPAA Security Officer', // Backward compatibility
    security_officer_role_type: data.security_officer_role,
    security_officer_role_other: data.security_officer_role_other || null,
    privacy_officer_name: data.privacy_officer_name,
    privacy_officer_email: data.privacy_officer_email,
    privacy_officer_role: data.privacy_officer_role_other || data.privacy_officer_role || 'HIPAA Privacy Officer', // Backward compatibility
    privacy_officer_role_type: data.privacy_officer_role,
    privacy_officer_role_other: data.privacy_officer_role_other || null,
    employee_count: data.employee_count,
    has_employees: data.has_employees,
    uses_contractors: data.uses_contractors,
    number_of_locations: data.number_of_locations || 1,
    multi_state_operations: data.multi_state_operations || false,
    remote_workforce: data.remote_workforce || false,
    stores_phi_electronically: data.stores_phi_electronically,
    uses_cloud_services: data.cloud_storage_provider ? true : (data.uses_cloud_services || false), // Backward compatibility
    ehr_system: data.ehr_system || null,
    email_provider: data.email_provider || null,
    cloud_storage_provider: data.cloud_storage_provider || null,
    uses_vpn: data.uses_vpn || false,
    vpn_provider: data.vpn_provider || null,
    device_types: data.device_types || null,
    primary_contact_name: data.primary_contact_name || null,
    compliance_contact_email: data.compliance_contact_email || null,
    compliance_contact_phone: data.compliance_contact_phone || null,
    // US HIPAA Required Legal Identifiers - preserve values
    ein: data.ein && String(data.ein).trim() !== '' ? String(data.ein).trim() : null,
    npi: data.npi && String(data.npi).trim() !== '' ? String(data.npi).trim() : null,
    state_license_number: data.state_license_number !== undefined && data.state_license_number !== null ? String(data.state_license_number).trim() : null,
    clia_certificate_number: data.clia_certificate_number !== undefined && data.clia_certificate_number !== null ? String(data.clia_certificate_number).trim() : null,
    medicare_provider_number: data.medicare_provider_number !== undefined && data.medicare_provider_number !== null ? String(data.medicare_provider_number).trim() : null,
    state_tax_id: data.state_tax_id || null,
    // Authorized Representative / CEO
    authorized_representative_name: data.authorized_representative_name || null,
    authorized_representative_title: data.authorized_representative_title || null,
    ceo_name: data.ceo_name || null,
    ceo_title: data.ceo_title || null,
    // Optional but Recommended
    phone_number: data.phone_number || null,
    email_address: data.email_address || null,
    website: data.website || null,
    accreditation_status: data.accreditation_status || null,
    types_of_services: data.types_of_services || null,
    insurance_coverage: data.insurance_coverage || null,
    performs_laboratory_tests: data.performs_laboratory_tests || false,
    serves_medicare_patients: data.serves_medicare_patients || false,
  };

  // Call RPC function with ONLY p_data
  // The function uses auth.uid() internally for security
  const { data: rpcResult, error: rpcError } = await supabase.rpc('upsert_organization_jsonb', {
    p_data: jsonData
  });

  if (rpcError) {
    console.error('Failed to update organization:', rpcError);
    throw new Error(`Failed to update organization: ${rpcError.message}. Please ensure migrations have been executed.`);
  }

  // RPC returns a table, so we get the first row if it's an array
  const organization = Array.isArray(rpcResult) ? rpcResult[0] : rpcResult;
  
  if (!organization || typeof organization !== 'object' || !organization.id) {
    throw new Error('Failed to update organization: Invalid response from RPC function');
  }

  revalidatePath('/dashboard/organization');
  revalidatePath('/dashboard');
  return organization;
}

export async function getOrganizationData() {
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

  if (error) {
    console.error('Error fetching organization data:', error);
    return null;
  }

  if (!organization) {
    console.log('No organization found for user:', user.id);
    return null;
  }

  // Parse JSON fields if they come as strings
  // Handle specialties (can be array, JSON string, or null)
  if (organization.specialties) {
    if (typeof organization.specialties === 'string') {
      try {
        organization.specialties = JSON.parse(organization.specialties);
      } catch (e) {
        // If parsing fails, try to split by comma or keep as is
        organization.specialties = organization.specialties.includes(',') 
          ? organization.specialties.split(',').map(s => s.trim())
          : [organization.specialties];
      }
    }
  } else {
    organization.specialties = [];
  }

  // Handle device_types (can be array, JSON string, or null)
  if (organization.device_types) {
    if (typeof organization.device_types === 'string') {
      try {
        organization.device_types = JSON.parse(organization.device_types);
      } catch (e) {
        // If parsing fails, try to split by comma or keep as is
        organization.device_types = organization.device_types.includes(',')
          ? organization.device_types.split(',').map(d => d.trim())
          : [organization.device_types];
      }
    }
  } else {
    organization.device_types = [];
  }

  // Extract metadata from onboarding_metadata JSONB column if it exists
  const metadata = (organization.onboarding_metadata as any) || {};
  
  // Merge metadata fields into organization object
  if (metadata.specialties && (!organization.specialties || organization.specialties.length === 0)) {
    organization.specialties = Array.isArray(metadata.specialties) ? metadata.specialties : [];
  }
  if (metadata.device_types && (!organization.device_types || organization.device_types.length === 0)) {
    organization.device_types = Array.isArray(metadata.device_types) ? metadata.device_types : [];
  }
  if (metadata.primary_contact_name && !organization.primary_contact_name) {
    organization.primary_contact_name = metadata.primary_contact_name;
  }
  if (metadata.compliance_contact_email && !organization.compliance_contact_email) {
    organization.compliance_contact_email = metadata.compliance_contact_email;
  }
  if (metadata.compliance_contact_phone && !organization.compliance_contact_phone) {
    organization.compliance_contact_phone = metadata.compliance_contact_phone;
  }

  // Debug: Log organization data structure
  if (process.env.NODE_ENV === 'development') {
    console.log('Organization data fetched:', {
      id: organization.id,
      name: organization.name,
      legal_name: organization.legal_name,
      has_address: !!organization.address_street,
      has_security_officer: !!organization.security_officer_name,
      has_privacy_officer: !!organization.privacy_officer_name,
      specialties: organization.specialties,
      device_types: organization.device_types,
      primary_contact_name: organization.primary_contact_name,
      compliance_contact_email: organization.compliance_contact_email,
      compliance_contact_phone: organization.compliance_contact_phone
    });
  }

  return organization;
}

/**
 * Get compliance state from risk assessment answers
 */
export async function getComplianceState() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  // Get risk assessment from onboarding_risk_assessments table
  const { data: riskAssessment, error } = await supabase
    .from('onboarding_risk_assessments')
    .select('answers')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching risk assessment:', error);
    return null;
  }

  if (!riskAssessment || !riskAssessment.answers) {
    return null;
  }

  // Normalize compliance state from answers
  const { normalizeComplianceState } = await import('@/lib/compliance-state');
  const answers = riskAssessment.answers as Record<string, string>;
  return normalizeComplianceState(answers);
}

