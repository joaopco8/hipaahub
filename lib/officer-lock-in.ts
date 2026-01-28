/**
 * Officer Lock-in System
 * Ensures Security and Privacy Officers appear in ALL generated documents
 */

export interface OfficerInfo {
  security_officer_name: string;
  security_officer_email: string;
  security_officer_role?: string;
  security_officer_phone?: string;
  privacy_officer_name: string;
  privacy_officer_email: string;
  privacy_officer_role?: string;
  privacy_officer_phone?: string;
  designation_date?: string;
}

/**
 * Generate standard officer block for documents
 */
export function generateOfficerBlock(officers: OfficerInfo): string {
  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                          DESIGNATED HIPAA OFFICERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HIPAA Security Officer:
Name:       ${officers.security_officer_name}
${officers.security_officer_role ? `Title:      ${officers.security_officer_role}\n` : ''}Email:      ${officers.security_officer_email}
${officers.security_officer_phone ? `Phone:      ${officers.security_officer_phone}\n` : ''}

HIPAA Privacy Officer:
Name:       ${officers.privacy_officer_name}
${officers.privacy_officer_role ? `Title:      ${officers.privacy_officer_role}\n` : ''}Email:      ${officers.privacy_officer_email}
${officers.privacy_officer_phone ? `Phone:      ${officers.privacy_officer_phone}\n` : ''}${officers.designation_date ? `\nOfficers Designated: ${officers.designation_date}\n` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
}

/**
 * Generate footer with officer contact info
 */
export function generateOfficerFooter(officers: OfficerInfo): string {
  return `
For questions regarding this document or HIPAA compliance matters:

Security Officer: ${officers.security_officer_name} - ${officers.security_officer_email}
Privacy Officer: ${officers.privacy_officer_name} - ${officers.privacy_officer_email}
`;
}

/**
 * Generate signature block for attestations
 */
export function generateOfficerSignatureBlock(officers: OfficerInfo, signatureDate: string): string {
  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                                SIGNATURES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Reviewed and Approved by:

__________________________________________    ___________________
${officers.security_officer_name}                        Date
HIPAA Security Officer
${officers.security_officer_email}

__________________________________________    ___________________
${officers.privacy_officer_name}                         Date
HIPAA Privacy Officer
${officers.privacy_officer_email}

Signed: ${signatureDate}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
}

/**
 * Documents that MUST include officer information
 */
export const OFFICER_REQUIRED_DOCUMENTS = [
  'Security Risk Analysis (SRA) Report',
  'Incident Response Plan',
  'Breach Notification Plan',
  'HIPAA Privacy Policy',
  'HIPAA Security Policy',
  'Workforce Training Policy',
  'Business Associate Agreement Template',
  'Audit Export Cover Page',
  'Risk Management Plan',
  'Sanction Policy'
];

/**
 * Validate that officers are properly designated
 */
export function validateOfficerDesignation(officers: Partial<OfficerInfo>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!officers.security_officer_name || officers.security_officer_name.trim() === '') {
    errors.push('Security Officer name is required');
  }
  if (!officers.security_officer_email || !officers.security_officer_email.includes('@')) {
    errors.push('Valid Security Officer email is required');
  }
  if (!officers.privacy_officer_name || officers.privacy_officer_name.trim() === '') {
    errors.push('Privacy Officer name is required');
  }
  if (!officers.privacy_officer_email || !officers.privacy_officer_email.includes('@')) {
    errors.push('Valid Privacy Officer email is required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
