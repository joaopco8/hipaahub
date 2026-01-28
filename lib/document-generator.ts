/**
 * Document Generator
 * Processes document templates and replaces placeholders with organization data
 * Now supports conditional rendering based on compliance_state
 */

import { ComplianceState, isControlMissing, getGapAcknowledgmentStatement, getRemediationCommitmentStatement } from './compliance-state';

export interface OrganizationData {
  name: string;
  legal_name: string;
  dba?: string | null;
  type: string;
  state: string;
  address_street?: string | null;
  address_city?: string | null;
  address_state?: string | null;
  address_zip?: string | null;
  security_officer_name?: string | null;
  security_officer_email?: string | null;
  security_officer_role?: string | null;
  privacy_officer_name?: string | null;
  privacy_officer_email?: string | null;
  privacy_officer_role?: string | null;
  employee_count?: number | null;
  assessment_date?: string | null;
  next_review_date?: string | null;
  // US HIPAA Required Fields
  ein?: string | null;
  npi?: string | null;
  state_license_number?: string | null;
  clia_certificate_number?: string | null;
  medicare_provider_number?: string | null;
  state_tax_id?: string | null;
  authorized_representative_name?: string | null;
  authorized_representative_title?: string | null;
  ceo_name?: string | null;
  ceo_title?: string | null;
  // Optional but Recommended
  phone_number?: string | null;
  email_address?: string | null;
  website?: string | null;
  accreditation_status?: string | null;
  types_of_services?: string | null;
  insurance_coverage?: string | null;
  performs_laboratory_tests?: boolean | null;
  serves_medicare_patients?: boolean | null;
  // Dynamic policy ID for current document
  current_policy_id?: string;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  content: string;
}

/**
 * Replace placeholders in template with organization data and compliance state
 * Supports conditional rendering: {{#IF_CONTROL}}...{{/IF_CONTROL}} and {{#IF_NOT_CONTROL}}...{{/IF_NOT_CONTROL}}
 */
export function processDocumentTemplate(
  template: string,
  organization: OrganizationData,
  complianceState?: ComplianceState
): string {
  const today = new Date();
  const nextYear = new Date();
  nextYear.setFullYear(today.getFullYear() + 1);

  // Format DBA (Doing Business As) - show only if exists
  const dbaDisplay = organization.dba ? ` (DBA: ${organization.dba})` : '';
  
  // Default values for placeholders
  const replacements: Record<string, string> = {
    '{{Organization_Name}}': organization.name || organization.legal_name || 'Organization',
    '{{Organization_Legal_Name}}': organization.legal_name || organization.name || 'Organization',
    '{{Organization_Legal_Name_With_DBA}}': organization.legal_name ? `${organization.legal_name}${dbaDisplay}` : (organization.name || 'Organization'),
    '{{Legal_Name}}': organization.legal_name || organization.name || 'Organization',
    '{{DBA}}': organization.dba || '',
    '{{Practice_Type}}': organization.type || 'Not Specified',
    '{{Security_Officer_Name}}': organization.security_officer_name || 'Not Assigned',
    '{{Security_Officer_Email}}': organization.security_officer_email || 'Not Assigned',
    '{{Security_Officer_Role}}': organization.security_officer_role || 'Security Officer',
    '{{Privacy_Officer_Name}}': organization.privacy_officer_name || 'Not Assigned',
    '{{Privacy_Officer_Email}}': organization.privacy_officer_email || 'Not Assigned',
    '{{Privacy_Officer_Role}}': organization.privacy_officer_role || 'Privacy Officer',
    '{{CEO_Name}}': organization.ceo_name || organization.authorized_representative_name || organization.security_officer_name || 'Chief Executive Officer',
    '{{CEO_Title}}': organization.ceo_title || organization.authorized_representative_title || 'Chief Executive Officer',
    '{{Authorized_Representative_Name}}': organization.authorized_representative_name || organization.ceo_name || organization.security_officer_name || 'Not Assigned',
    '{{Authorized_Representative_Title}}': organization.authorized_representative_title || organization.ceo_title || 'Authorized Representative',
    '{{Assessment_Date}}': organization.assessment_date 
      ? new Date(organization.assessment_date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      : today.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
    '{{Next_Review_Date}}': organization.next_review_date
      ? new Date(organization.next_review_date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      : nextYear.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
    '{{Effective_Date}}': organization.assessment_date 
      ? (() => {
          const date = new Date(organization.assessment_date);
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const year = date.getFullYear();
          return `${month}/${day}/${year}`;
        })()
      : (() => {
          const month = String(today.getMonth() + 1).padStart(2, '0');
          const day = String(today.getDate()).padStart(2, '0');
          const year = today.getFullYear();
          return `${month}/${day}/${year}`;
        })(),
    '{{Organization_Address}}': formatAddress(organization),
    '{{Full_Address}}': formatFullAddress(organization),
    '{{Organization_State}}': organization.state || organization.address_state || 'N/A',
    '{{Employee_Count}}': organization.employee_count?.toString() || 'N/A',
    // US HIPAA Required Fields
    '{{EIN}}': organization.ein || 'Not Provided',
    '{{NPI}}': organization.npi || 'Not Provided',
    '{{State_License_Number}}': organization.state_license_number || 'Not Provided',
    '{{CLIA_Certificate_Number}}': organization.clia_certificate_number || (organization.performs_laboratory_tests ? 'Required - Not Provided' : 'N/A'),
    '{{Medicare_Provider_Number}}': organization.medicare_provider_number || (organization.serves_medicare_patients ? 'Required - Not Provided' : 'N/A'),
    '{{State_Tax_ID}}': organization.state_tax_id || 'Not Provided',
    '{{Policy_ID}}': organization.current_policy_id || 'MST-001',
    '{{Phone_Number}}': organization.phone_number || 'Not Provided',
    '{{Email_Address}}': organization.email_address || organization.security_officer_email || 'Not Provided',
    '{{Website}}': organization.website || 'Not Provided',
    '{{Accreditation_Status}}': organization.accreditation_status || 'Not Provided',
    '{{Types_of_Services}}': organization.types_of_services || 'Not Provided',
    '{{Insurance_Coverage}}': organization.insurance_coverage || 'Not Provided',
  };

  let processed = template;
  
  // Process organization-specific conditional blocks first
  processed = processOrganizationConditionalBlocks(processed, organization);
  
  // Replace all placeholders
  Object.entries(replacements).forEach(([placeholder, value]) => {
    const regex = new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g');
    processed = processed.replace(regex, value);
  });

  // Process conditional blocks based on compliance_state
  if (complianceState) {
    processed = processConditionalBlocks(processed, complianceState, organization);
    // Replace compliance state placeholders
    processed = replaceComplianceStatePlaceholders(processed, complianceState);
  }

  return processed;
}

/**
 * Process organization-specific conditional blocks
 * Supports: {{#IF_DBA}}...{{/IF_DBA}}, {{#IF_CLIA}}...{{/IF_CLIA}}, etc.
 */
function processOrganizationConditionalBlocks(
  template: string,
  organization: OrganizationData
): string {
  let processed = template;
  
  // IF_DBA / IF_NOT_DBA
  const dbaBlockRegex = /\{\{#IF_DBA\}\}([\s\S]*?)\{\{\/IF_DBA\}\}/g;
  processed = processed.replace(dbaBlockRegex, (match, content) => {
    return organization.dba ? content : '';
  });
  
  const ifNotDbaRegex = /\{\{#IF_NOT_DBA\}\}([\s\S]*?)\{\{\/IF_NOT_DBA\}\}/g;
  processed = processed.replace(ifNotDbaRegex, (match, content) => {
    return !organization.dba ? content : '';
  });
  
  // IF_CLIA / IF_NOT_CLIA
  const cliaBlockRegex = /\{\{#IF_CLIA\}\}([\s\S]*?)\{\{\/IF_CLIA\}\}/g;
  processed = processed.replace(cliaBlockRegex, (match, content) => {
    return organization.clia_certificate_number ? content : '';
  });
  
  const ifNotCliaRegex = /\{\{#IF_NOT_CLIA\}\}([\s\S]*?)\{\{\/IF_NOT_CLIA\}\}/g;
  processed = processed.replace(ifNotCliaRegex, (match, content) => {
    return !organization.clia_certificate_number ? content : '';
  });
  
  // IF_MEDICARE / IF_NOT_MEDICARE
  const medicareBlockRegex = /\{\{#IF_MEDICARE\}\}([\s\S]*?)\{\{\/IF_MEDICARE\}\}/g;
  processed = processed.replace(medicareBlockRegex, (match, content) => {
    return organization.medicare_provider_number ? content : '';
  });
  
  const ifNotMedicareRegex = /\{\{#IF_NOT_MEDICARE\}\}([\s\S]*?)\{\{\/IF_NOT_MEDICARE\}\}/g;
  processed = processed.replace(ifNotMedicareRegex, (match, content) => {
    return !organization.medicare_provider_number ? content : '';
  });
  
  // IF_ACCREDITATION / IF_NOT_ACCREDITATION
  const accreditationBlockRegex = /\{\{#IF_ACCREDITATION\}\}([\s\S]*?)\{\{\/IF_ACCREDITATION\}\}/g;
  processed = processed.replace(accreditationBlockRegex, (match, content) => {
    return organization.accreditation_status ? content : '';
  });
  
  const ifNotAccreditationRegex = /\{\{#IF_NOT_ACCREDITATION\}\}([\s\S]*?)\{\{\/IF_NOT_ACCREDITATION\}\}/g;
  processed = processed.replace(ifNotAccreditationRegex, (match, content) => {
    return !organization.accreditation_status ? content : '';
  });
  
  // IF_SERVICES / IF_NOT_SERVICES
  const servicesBlockRegex = /\{\{#IF_SERVICES\}\}([\s\S]*?)\{\{\/IF_SERVICES\}\}/g;
  processed = processed.replace(servicesBlockRegex, (match, content) => {
    return organization.types_of_services ? content : '';
  });
  
  const ifNotServicesRegex = /\{\{#IF_NOT_SERVICES\}\}([\s\S]*?)\{\{\/IF_NOT_SERVICES\}\}/g;
  processed = processed.replace(ifNotServicesRegex, (match, content) => {
    return !organization.types_of_services ? content : '';
  });
  
  // IF_INSURANCE / IF_NOT_INSURANCE
  const insuranceBlockRegex = /\{\{#IF_INSURANCE\}\}([\s\S]*?)\{\{\/IF_INSURANCE\}\}/g;
  processed = processed.replace(insuranceBlockRegex, (match, content) => {
    return organization.insurance_coverage ? content : '';
  });
  
  const ifNotInsuranceRegex = /\{\{#IF_NOT_INSURANCE\}\}([\s\S]*?)\{\{\/IF_NOT_INSURANCE\}\}/g;
  processed = processed.replace(ifNotInsuranceRegex, (match, content) => {
    return !organization.insurance_coverage ? content : '';
  });
  
  return processed;
}

/**
 * Replace compliance state placeholders in template
 * Supports: {{password_min_length}}, {{session_timeout_minutes}}, etc.
 */
function replaceComplianceStatePlaceholders(
  template: string,
  complianceState: ComplianceState
): string {
  let processed = template;
  
  // Map of placeholder names to compliance state keys
  const placeholderMap: Record<string, keyof ComplianceState> = {
    'password_min_length': 'password_min_length',
    'session_timeout_minutes': 'session_timeout_minutes',
    'log_retention_years': 'log_retention_years',
    'training_passing_score': 'training_passing_score',
    'breach_notification_timeline_days': 'breach_notification_timeline_days',
  };

  Object.entries(placeholderMap).forEach(([placeholder, stateKey]) => {
    const value = complianceState[stateKey];
    if (typeof value === 'number') {
      const regex = new RegExp(`\\{\\{${placeholder}\\}\\}`, 'g');
      processed = processed.replace(regex, value.toString());
    }
  });

  return processed;
}

/**
 * Process conditional blocks in template
 * Supports:
 * - {{#IF_MFA_ENABLED}}...{{/IF_MFA_ENABLED}}
 * - {{#IF_NOT_MFA_ENABLED}}...{{/IF_NOT_MFA_ENABLED}}
 * - {{#IF_ENCRYPTION_AT_REST}}...{{/IF_ENCRYPTION_AT_REST}}
 * - {{#GAP_ACKNOWLEDGMENT:control_name:timeline}} - Inserts gap acknowledgment
 * - {{#REMEDIATION_COMMITMENT:control_name:priority:timeline}} - Inserts remediation commitment
 */
function processConditionalBlocks(
  template: string,
  complianceState: ComplianceState,
  organization: OrganizationData
): string {
  let processed = template;

  // Map of control names to compliance state keys
  const controlMap: Record<string, keyof ComplianceState> = {
    'MFA_ENABLED': 'mfa_enabled',
    'ENCRYPTION_AT_REST': 'encryption_at_rest',
    'ENCRYPTION_IN_TRANSIT': 'encryption_in_transit',
    'BACKUPS_ENABLED': 'backups_enabled',
    'AUDIT_LOGS_ENABLED': 'audit_logs_enabled',
    'SIEM_ENABLED': 'siem_enabled',
    'WORKFORCE_TRAINING': 'workforce_training',
    'SECURITY_POLICY_EXISTS': 'security_policy_exists',
    'INCIDENT_RESPONSE_PLAN': 'incident_response_plan',
    'DISASTER_RECOVERY_PLAN': 'disaster_recovery_plan',
    'RISK_MANAGEMENT_PLAN': 'risk_management_plan',
    'BUSINESS_ASSOCIATE_AGREEMENTS': 'business_associate_agreements',
    'PASSWORD_POLICY_ENFORCED': 'password_policy_enforced',
    'SESSION_TIMEOUT': 'session_timeout_minutes',
    'UNIQUE_USER_IDS': 'unique_user_ids',
    'PHYSICAL_ACCESS_CONTROLS': 'physical_access_controls',
    'WORKSTATION_LOCKING': 'workstation_locking',
    'DEVICE_ENCRYPTION': 'device_encryption',
    'FIREWALL_ENABLED': 'firewall_enabled',
    'VPN_REQUIRED': 'vpn_required',
    'WIRELESS_ENCRYPTION': 'wireless_encryption',
  };

  // Process IF blocks: {{#IF_CONTROL}}...{{/IF_CONTROL}}
  const ifBlockRegex = /\{\{#IF_([A-Z_]+)\}\}([\s\S]*?)\{\{\/IF_\1\}\}/g;
  processed = processed.replace(ifBlockRegex, (match, controlName, content) => {
    const stateKey = controlMap[controlName];
    if (!stateKey) return match; // Unknown control, keep original
    
    const value = complianceState[stateKey];
    if (typeof value === 'boolean') {
      return value ? content : '';
    }
    if (typeof value === 'string') {
      return value !== 'none' && value !== 'never' && value !== '' ? content : '';
    }
    if (typeof value === 'number') {
      return value > 0 ? content : '';
    }
    if (Array.isArray(value)) {
      return value.length > 0 ? content : '';
    }
    return value !== null ? content : '';
  });

  // Process IF_NOT blocks: {{#IF_NOT_CONTROL}}...{{/IF_NOT_CONTROL}}
  const ifNotBlockRegex = /\{\{#IF_NOT_([A-Z_]+)\}\}([\s\S]*?)\{\{\/IF_NOT_\1\}\}/g;
  processed = processed.replace(ifNotBlockRegex, (match, controlName, content) => {
    const stateKey = controlMap[controlName];
    if (!stateKey) return match; // Unknown control, keep original
    
    if (isControlMissing(complianceState, stateKey)) {
      return content;
    }
    return '';
  });

  // Process GAP_ACKNOWLEDGMENT: {{#GAP_ACKNOWLEDGMENT:control_name:timeline}}
  const gapAckRegex = /\{\{#GAP_ACKNOWLEDGMENT:([^:]+):([^}]+)\}\}/g;
  processed = processed.replace(gapAckRegex, (match, controlName, timeline) => {
    return getGapAcknowledgmentStatement(controlName, timeline);
  });

  // Process REMEDIATION_COMMITMENT: {{#REMEDIATION_COMMITMENT:control_name:priority:timeline}}
  const remediationRegex = /\{\{#REMEDIATION_COMMITMENT:([^:]+):([^:]+):([^}]+)\}\}/g;
  processed = processed.replace(remediationRegex, (match, controlName, priority, timeline) => {
    return getRemediationCommitmentStatement(
      controlName,
      priority as 'critical' | 'high' | 'medium' | 'low',
      timeline
    );
  });

  return processed;
}

/**
 * Format organization address
 */
function formatAddress(org: OrganizationData): string {
  const parts: string[] = [];
  
  if (org.address_street) parts.push(org.address_street);
  if (org.address_city) parts.push(org.address_city);
  if (org.address_state) parts.push(org.address_state);
  if (org.address_zip) parts.push(org.address_zip);
  
  return parts.length > 0 ? parts.join(', ') : 'Address not provided';
}

/**
 * Format full address with line breaks for documents
 */
function formatFullAddress(org: OrganizationData): string {
  const parts: string[] = [];
  
  if (org.address_street) parts.push(org.address_street);
  if (org.address_city) {
    const cityStateZip = [org.address_city];
    if (org.address_state) cityStateZip.push(org.address_state);
    if (org.address_zip) cityStateZip.push(org.address_zip);
    parts.push(cityStateZip.join(', '));
  }
  
  return parts.length > 0 ? parts.join('\n') : 'Address not provided';
}

/**
 * Get document template by ID
 */
export function getDocumentTemplate(documentId: string): string | null {
  // This will be populated with actual templates
  const templates: Record<string, string> = {
    'hipaa-security-privacy-master-policy': '', // Will be populated
  };

  return templates[documentId] || null;
}
