/**
 * Organization Form Constants and Validations
 * HIPAA-compliant organization data structure
 */

export const PRACTICE_TYPES = [
  { value: 'medical', label: 'Medical Practice' },
  { value: 'dental', label: 'Dental Practice' },
  { value: 'behavioral-health', label: 'Behavioral Health' },
  { value: 'laboratory', label: 'Laboratory' },
  { value: 'imaging', label: 'Imaging Center' },
  { value: 'telemedicine', label: 'Telemedicine' },
  { value: 'hospital', label: 'Hospital' },
  { value: 'multi-specialty', label: 'Multi-Specialty Clinic' },
] as const;

export const MEDICAL_SPECIALTIES = [
  'Cardiology',
  'Psychiatry',
  'Pediatrics',
  'Internal Medicine',
  'Family Medicine',
  'Orthopedics',
  'Dermatology',
  'Neurology',
  'Oncology',
  'Endocrinology',
  'Gastroenterology',
  'Pulmonology',
  'Rheumatology',
  'Urology',
  'Gynecology',
  'Ophthalmology',
  'Otolaryngology',
  'Emergency Medicine',
  'Anesthesiology',
  'Radiology',
  'Pathology',
  'Surgery',
  'Physical Therapy',
  'Occupational Therapy',
  'Speech Therapy',
  'Behavioral Health',
  'Substance Abuse Treatment',
  'Other',
] as const;

export const OFFICER_ROLES = {
  security: [
    { value: 'hipaa-security-officer', label: 'HIPAA Security Officer' },
    { value: 'compliance-manager', label: 'Compliance Manager' },
    { value: 'practice-administrator', label: 'Practice Administrator' },
    { value: 'it-director', label: 'IT Director' },
    { value: 'ceo', label: 'CEO / Managing Director' },
    { value: 'managing-director', label: 'Managing Director' },
    { value: 'other', label: 'Other (specify)' },
  ],
  privacy: [
    { value: 'hipaa-privacy-officer', label: 'HIPAA Privacy Officer' },
    { value: 'compliance-manager', label: 'Compliance Manager' },
    { value: 'practice-administrator', label: 'Practice Administrator' },
    { value: 'ceo', label: 'CEO / Managing Director' },
    { value: 'managing-director', label: 'Managing Director' },
    { value: 'other', label: 'Other (specify)' },
  ],
} as const;

export const EHR_SYSTEMS = [
  'Epic',
  'Cerner',
  'Athenahealth',
  'Allscripts',
  'eClinicalWorks',
  'NextGen',
  'Greenway Health',
  'Practice Fusion',
  'AdvancedMD',
  'DrChrono',
  'SimplePractice',
  'TherapyNotes',
  'Other',
] as const;

export const EMAIL_PROVIDERS = [
  'Microsoft Outlook / Office 365',
  'Google Workspace / Gmail',
  'ProtonMail',
  'Zoho Mail',
  'Other',
] as const;

export const CLOUD_STORAGE_PROVIDERS = [
  'Amazon Web Services (AWS)',
  'Microsoft Azure',
  'Google Cloud Platform',
  'Dropbox Business',
  'Box',
  'OneDrive for Business',
  'Other',
] as const;

export const VPN_PROVIDERS = [
  'Cisco AnyConnect',
  'Palo Alto GlobalProtect',
  'Fortinet FortiGate',
  'OpenVPN',
  'Microsoft VPN',
  'Other',
] as const;

export const DEVICE_TYPES = [
  'Desktop Computers',
  'Laptops',
  'Tablets',
  'Smartphones',
  'Medical Devices',
  'Servers',
] as const;

export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
] as const;

/**
 * Validate US ZIP code format
 */
export function validateUSZIP(zip: string): boolean {
  // 5 digits or 9 digits (XXXXX or XXXXX-XXXX)
  return /^\d{5}(-\d{4})?$/.test(zip);
}

/**
 * Validate US state code
 */
export function validateUSState(state: string): boolean {
  return US_STATES.includes(state as any);
}

/**
 * Validate address consistency for US organizations
 */
export function validateUSAddress(
  country: string,
  state: string,
  addressState: string,
  zip: string
): { valid: boolean; error?: string } {
  if (country !== 'US') {
    return { valid: true }; // Only validate US addresses
  }

  if (!validateUSState(state)) {
    return { valid: false, error: `Invalid US state code: ${state}` };
  }

  if (!validateUSState(addressState)) {
    return { valid: false, error: `Invalid US address state code: ${addressState}` };
  }

  if (!validateUSZIP(zip)) {
    return { valid: false, error: 'Invalid US ZIP code format. Must be 5 digits or 9 digits (XXXXX or XXXXX-XXXX)' };
  }

  // State and address state should match (or at least both be valid US states)
  if (state !== addressState) {
    // This is a warning, not an error - organizations can have addresses in different states
    // But we should log it
    console.warn(`Organization state (${state}) differs from address state (${addressState})`);
  }

  return { valid: true };
}

/**
 * Validate CLIA certificate (only valid for US)
 */
export function validateCLIA(country: string, cliaNumber?: string): { valid: boolean; error?: string } {
  if (cliaNumber && country !== 'US') {
    return { valid: false, error: 'CLIA Certificate Number is only valid for US organizations' };
  }
  return { valid: true };
}
