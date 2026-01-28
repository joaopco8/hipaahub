/**
 * Evidence Catalog - Master Catalog of 18 Critical HIPAA Documents
 * 
 * This catalog defines all evidence types that a clinic must maintain,
 * including purpose, frequency, retention, and mapping to HIPAA policies.
 */

export type EvidenceFrequency = 
  | 'annually'
  | 'quarterly'
  | 'monthly'
  | 'continuously'
  | 'on_hire'
  | 'on_termination'
  | 'on_incident'
  | 'on_risk_identified'
  | 'on_violation'
  | 'on_contract';

export type EvidenceCaptureType = 
  | 'document_upload'
  | 'external_link'
  | 'attestation'
  | 'system_generated'
  | 'screenshot';

export interface EvidenceCatalogItem {
  id: string;
  name: string;
  purpose: string;
  frequency: EvidenceFrequency;
  retention_years: number;
  capture_types: EvidenceCaptureType[];
  required_signatures: string[]; // e.g., ['Security Officer', 'CEO']
  hipaa_documents: string[]; // Policy IDs that require this evidence
  ocr_expectations: string; // What OCR expects to see
  example_file_names?: string[];
  notes?: string;
}

/**
 * Master Catalog of 18 Critical HIPAA Evidence Documents
 */
export const EVIDENCE_CATALOG: EvidenceCatalogItem[] = [
  {
    id: 'sra_report',
    name: 'Security Risk Analysis (SRA) Report',
    purpose: 'Annual assessment of security risks to PHI',
    frequency: 'annually',
    retention_years: 7,
    capture_types: ['document_upload', 'attestation'],
    required_signatures: ['Security Officer', 'CEO'],
    hipaa_documents: ['POL-002', 'MST-001'],
    ocr_expectations: 'Comprehensive risk assessment covering all systems, identified risks, risk levels, and remediation plans',
    example_file_names: ['SRA_Report_2025.pdf', 'Security_Risk_Analysis_2025.docx'],
  },
  {
    id: 'incident_response_plan',
    name: 'Incident Response Plan',
    purpose: 'Documented procedures for responding to security incidents',
    frequency: 'annually',
    retention_years: 7,
    capture_types: ['document_upload', 'attestation'],
    required_signatures: ['Security Officer'],
    hipaa_documents: ['POL-007', 'MST-001'],
    ocr_expectations: 'Written plan with procedures for detection, containment, eradication, recovery, and post-incident review',
  },
  {
    id: 'access_control_policy',
    name: 'Access Control Policy',
    purpose: 'Role-based access control documentation',
    frequency: 'annually',
    retention_years: 7,
    capture_types: ['document_upload', 'screenshot', 'system_generated'],
    required_signatures: ['Security Officer', 'IT Director'],
    hipaa_documents: ['POL-004', 'MST-001'],
    ocr_expectations: 'Policy document plus proof of implementation (screenshots, access control exports)',
  },
  {
    id: 'training_logs',
    name: 'Training Logs',
    purpose: 'Documentation of HIPAA training for all workforce members',
    frequency: 'continuously',
    retention_years: 7,
    capture_types: ['system_generated', 'document_upload'],
    required_signatures: ['Training Coordinator', 'Privacy Officer'],
    hipaa_documents: ['POL-005', 'MST-001'],
    ocr_expectations: 'Records showing who trained, when, topics covered, completion status, and attestations',
  },
  {
    id: 'business_associate_agreements',
    name: 'Business Associate Agreements (BAAs)',
    purpose: 'Contracts with vendors who handle PHI',
    frequency: 'on_contract',
    retention_years: 7,
    capture_types: ['document_upload', 'external_link'],
    required_signatures: ['Authorized Representative', 'Business Associate'],
    hipaa_documents: ['POL-008', 'MST-001'],
    ocr_expectations: 'Signed BAA for each vendor with PHI access, including subcontractor agreements',
    notes: 'Retention: 7 years after contract termination',
  },
  {
    id: 'audit_logs',
    name: 'Audit Logs',
    purpose: 'System logs of access and modifications to PHI',
    frequency: 'continuously',
    retention_years: 7,
    capture_types: ['system_generated', 'document_upload'],
    required_signatures: ['Security Officer'],
    hipaa_documents: ['POL-009', 'MST-001'],
    ocr_expectations: 'Logs showing user, timestamp, action, data accessed, IP address, and result',
  },
  {
    id: 'encryption_configuration',
    name: 'Encryption Configuration Report',
    purpose: 'Proof of encryption for PHI at rest and in transit',
    frequency: 'annually',
    retention_years: 7,
    capture_types: ['screenshot', 'document_upload', 'attestation'],
    required_signatures: ['Security Officer', 'IT Director'],
    hipaa_documents: ['POL-004', 'MST-001'],
    ocr_expectations: 'Screenshots or reports showing encryption enabled, algorithms used, key management',
  },
  {
    id: 'backup_recovery_tests',
    name: 'Backup & Recovery Test Results',
    purpose: 'Documentation of backup and recovery testing',
    frequency: 'quarterly',
    retention_years: 7,
    capture_types: ['document_upload', 'system_generated', 'attestation'],
    required_signatures: ['IT Director', 'Security Officer'],
    hipaa_documents: ['POL-003', 'MST-001'],
    ocr_expectations: 'Test results showing successful backup and recovery, test dates, testers, outcomes',
  },
  {
    id: 'mfa_configuration',
    name: 'MFA Configuration Proof',
    purpose: 'Proof of multi-factor authentication implementation',
    frequency: 'annually',
    retention_years: 7,
    capture_types: ['screenshot', 'document_upload', 'attestation'],
    required_signatures: ['Security Officer'],
    hipaa_documents: ['POL-004', 'MST-001'],
    ocr_expectations: 'Screenshots or configuration reports showing MFA enabled for all systems with PHI access',
  },
  {
    id: 'device_control_inventory',
    name: 'Device Control Inventory',
    purpose: 'Inventory of all devices that store or access PHI',
    frequency: 'quarterly',
    retention_years: 7,
    capture_types: ['document_upload', 'system_generated'],
    required_signatures: ['IT Director'],
    hipaa_documents: ['POL-003', 'MST-001'],
    ocr_expectations: 'List of devices, device types, locations, encryption status, access controls',
  },
  {
    id: 'employee_termination_checklist',
    name: 'Employee Termination Checklist',
    purpose: 'Documentation of access removal when employees leave',
    frequency: 'on_termination',
    retention_years: 7,
    capture_types: ['document_upload', 'system_generated'],
    required_signatures: ['HR Director', 'IT Director', 'Security Officer'],
    hipaa_documents: ['POL-004', 'POL-006', 'MST-001'],
    ocr_expectations: 'Checklist showing all access removed, devices returned, accounts disabled, date completed',
  },
  {
    id: 'breach_log',
    name: 'Breach Log',
    purpose: 'Registry of all security incidents and breaches',
    frequency: 'on_incident',
    retention_years: 7,
    capture_types: ['document_upload', 'system_generated'],
    required_signatures: ['Security Officer', 'Privacy Officer'],
    hipaa_documents: ['POL-007', 'MST-001'],
    ocr_expectations: 'Log entry for each incident with date, description, individuals affected, notification status',
  },
  {
    id: 'vulnerability_scan_reports',
    name: 'Vulnerability Scan Reports',
    purpose: 'Reports from security vulnerability scanning',
    frequency: 'annually',
    retention_years: 7,
    capture_types: ['document_upload', 'external_link'],
    required_signatures: ['Security Officer'],
    hipaa_documents: ['POL-002', 'POL-003', 'MST-001'],
    ocr_expectations: 'Scan results showing vulnerabilities found, risk levels, remediation status',
  },
  {
    id: 'penetration_test_report',
    name: 'Penetration Test Report',
    purpose: 'Results from security penetration testing',
    frequency: 'annually',
    retention_years: 7,
    capture_types: ['document_upload', 'external_link'],
    required_signatures: ['Security Officer', 'External Tester'],
    hipaa_documents: ['POL-002', 'POL-003', 'MST-001'],
    ocr_expectations: 'Test report showing methodology, findings, exploited vulnerabilities, remediation recommendations',
  },
  {
    id: 'cloud_security_configuration',
    name: 'Cloud Security Configuration',
    purpose: 'Documentation of cloud security settings',
    frequency: 'annually',
    retention_years: 7,
    capture_types: ['screenshot', 'document_upload', 'attestation'],
    required_signatures: ['Security Officer', 'IT Director'],
    hipaa_documents: ['POL-004', 'POL-008', 'MST-001'],
    ocr_expectations: 'Configuration reports or screenshots showing security settings, access controls, encryption',
  },
  {
    id: 'vendor_soc2_report',
    name: 'Vendor SOC2 Report',
    purpose: 'Vendor security attestation (SOC2 Type II)',
    frequency: 'annually',
    retention_years: 7,
    capture_types: ['external_link', 'document_upload'],
    required_signatures: ['Vendor', 'Security Officer'],
    hipaa_documents: ['POL-008', 'MST-001'],
    ocr_expectations: 'Current SOC2 Type II report from vendor, or link to vendor portal with access',
    notes: 'Must be current (within 12 months)',
  },
  {
    id: 'risk_remediation_plan',
    name: 'Risk Remediation Plan',
    purpose: 'Plan to address identified security risks',
    frequency: 'on_risk_identified',
    retention_years: 7,
    capture_types: ['document_upload', 'attestation'],
    required_signatures: ['Security Officer', 'CEO'],
    hipaa_documents: ['POL-003', 'POL-002', 'MST-001'],
    ocr_expectations: 'Documented plan with risk description, remediation steps, timeline, responsible party, status',
  },
  {
    id: 'sanction_documentation',
    name: 'Sanction Documentation',
    purpose: 'Documentation of disciplinary actions for policy violations',
    frequency: 'on_violation',
    retention_years: 7,
    capture_types: ['document_upload'],
    required_signatures: ['HR Director', 'Security Officer'],
    hipaa_documents: ['POL-006', 'MST-001'],
    ocr_expectations: 'Documentation of violation, investigation, disciplinary action taken, date, outcome',
  },
];

/**
 * Get evidence catalog item by ID
 */
export function getEvidenceCatalogItem(id: string): EvidenceCatalogItem | undefined {
  return EVIDENCE_CATALOG.find(item => item.id === id);
}

/**
 * Get evidence catalog items by HIPAA document
 */
export function getEvidenceByHIPAADocument(documentId: string): EvidenceCatalogItem[] {
  return EVIDENCE_CATALOG.filter(item => 
    item.hipaa_documents.includes(documentId)
  );
}

/**
 * Get evidence catalog items by frequency
 */
export function getEvidenceByFrequency(frequency: EvidenceFrequency): EvidenceCatalogItem[] {
  return EVIDENCE_CATALOG.filter(item => item.frequency === frequency);
}

/**
 * Calculate next review date based on frequency
 */
export function calculateNextReviewDate(
  frequency: EvidenceFrequency,
  lastReviewDate: Date = new Date()
): Date {
  const next = new Date(lastReviewDate);
  
  switch (frequency) {
    case 'annually':
      next.setFullYear(next.getFullYear() + 1);
      break;
    case 'quarterly':
      next.setMonth(next.getMonth() + 3);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'continuously':
      // For continuous, review every 90 days
      next.setDate(next.getDate() + 90);
      break;
    default:
      // For event-based frequencies, set to 1 year as default
      next.setFullYear(next.getFullYear() + 1);
  }
  
  return next;
}

/**
 * Calculate expiration date based on frequency and upload date
 */
export function calculateExpirationDate(
  frequency: EvidenceFrequency,
  uploadDate: Date
): Date | null {
  // For event-based frequencies, evidence doesn't expire
  if (['on_hire', 'on_termination', 'on_incident', 'on_risk_identified', 'on_violation', 'on_contract'].includes(frequency)) {
    return null; // No expiration for event-based evidence
  }
  
  return calculateNextReviewDate(frequency, uploadDate);
}

/**
 * Get all evidence types that should be reviewed soon (within 30 days)
 */
export function getEvidenceDueForReview(
  evidenceItems: Array<{ frequency: EvidenceFrequency; review_due_date?: string | null }>
): number {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  
  return evidenceItems.filter(item => {
    if (!item.review_due_date) return false;
    const reviewDate = new Date(item.review_due_date);
    return reviewDate <= thirtyDaysFromNow && reviewDate > new Date();
  }).length;
}
