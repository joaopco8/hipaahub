/**
 * Organization Data Validation
 * Validates that organization data is complete before generating documents
 */

import { OrganizationData } from './document-generator';

export interface ValidationResult {
  isValid: boolean;
  missingFields: string[];
  errors: string[];
}

/**
 * Validate organization data for document generation
 */
export function validateOrganizationData(organization: OrganizationData | null): ValidationResult {
  const missingFields: string[] = [];
  const errors: string[] = [];

  if (!organization) {
    return {
      isValid: false,
      missingFields: ['Organization data not found'],
      errors: ['Organization data is required to generate documents. Please complete the organization setup first.']
    };
  }

  // Required fields for document generation (US HIPAA Requirements)
  
  // Basic Organization Information
  if (!organization.name && !organization.legal_name) {
    missingFields.push('Organization Name');
    errors.push('Organization name or legal name is required');
  }

  if (!organization.legal_name) {
    missingFields.push('Organization Legal Name');
    errors.push('Legal name is required for HIPAA compliance documents');
  }

  if (!organization.state) {
    missingFields.push('State');
    errors.push('State is required for legal compliance');
  }

  // Complete Business Address (Obrigatório)
  if (!organization.address_street || !organization.address_city || !organization.address_state || !organization.address_zip) {
    missingFields.push('Complete Business Address');
    errors.push('Complete business address (street, city, state, ZIP) is required for HIPAA documents');
  }

  // US Legal Identifiers (Obrigatórios)
  if (!organization.ein || organization.ein.trim() === '') {
    missingFields.push('EIN (Employer Identification Number)');
    errors.push('EIN is required for all HIPAA compliance documents in the US');
  } else if (!/^\d{2}-\d{7}$/.test(organization.ein)) {
    errors.push('EIN must be in format XX-XXXXXXX (9 digits)');
  }

  if (!organization.npi || organization.npi.trim() === '') {
    missingFields.push('NPI (National Provider Identifier)');
    errors.push('NPI is required for healthcare providers');
  } else if (!/^\d{10}$/.test(organization.npi)) {
    errors.push('NPI must be 10 digits');
  }

  if (!organization.state_license_number || organization.state_license_number.trim() === '') {
    missingFields.push('State License Number');
    errors.push('State License Number is required for operation in the state');
  }

  if (!organization.state_tax_id || organization.state_tax_id.trim() === '') {
    missingFields.push('State Tax ID');
    errors.push('State Tax ID is required for state tax purposes');
  }

  // Conditional Requirements
  if (organization.performs_laboratory_tests && (!organization.clia_certificate_number || organization.clia_certificate_number.trim() === '')) {
    missingFields.push('CLIA Certificate Number');
    errors.push('CLIA Certificate Number is required if your organization performs laboratory tests');
  }

  if (organization.serves_medicare_patients && (!organization.medicare_provider_number || organization.medicare_provider_number.trim() === '')) {
    missingFields.push('Medicare Provider Number');
    errors.push('Medicare Provider Number is required if your organization serves Medicare patients');
  }

  // Officers (HIPAA requires names)
  if (!organization.security_officer_name || organization.security_officer_name.trim() === '') {
    missingFields.push('Security Officer Name');
    errors.push('Security Officer name is required by HIPAA regulations');
  }

  if (!organization.security_officer_email || organization.security_officer_email.trim() === '') {
    missingFields.push('Security Officer Email');
    errors.push('Security Officer email is required for contact information');
  }

  if (!organization.privacy_officer_name || organization.privacy_officer_name.trim() === '') {
    missingFields.push('Privacy Officer Name');
    errors.push('Privacy Officer name is required by HIPAA regulations');
  }

  if (!organization.privacy_officer_email || organization.privacy_officer_email.trim() === '') {
    missingFields.push('Privacy Officer Email');
    errors.push('Privacy Officer email is required for contact information');
  }

  // Authorized Representative / CEO
  if (!organization.ceo_name && !organization.authorized_representative_name) {
    missingFields.push('CEO / Authorized Representative Name');
    errors.push('CEO or Authorized Representative name is required for document approval');
  }

  if (!organization.ceo_title && !organization.authorized_representative_title) {
    missingFields.push('CEO / Authorized Representative Title');
    errors.push('CEO or Authorized Representative title is required');
  }

  // Recommended fields (warnings, not blocking errors)
  if (!organization.phone_number || organization.phone_number.trim() === '') {
    errors.push('Phone number is highly recommended for OCR contact');
  }

  if (!organization.email_address || organization.email_address.trim() === '') {
    errors.push('Primary email address is highly recommended for official notifications');
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
    errors
  };
}

/**
 * Get user-friendly field names for display
 */
export function getFieldDisplayName(field: string): string {
  const fieldMap: Record<string, string> = {
    'Organization Name': 'Organization Name',
    'State': 'State',
    'Security Officer Name': 'Security Officer Name',
    'Security Officer Email': 'Security Officer Email',
    'Privacy Officer Name': 'Privacy Officer Name',
    'Privacy Officer Email': 'Privacy Officer Email',
    'Address': 'Complete Address',
  };

  return fieldMap[field] || field;
}
