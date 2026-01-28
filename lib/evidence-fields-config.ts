/**
 * Evidence Fields Configuration
 * Complete list of 48 evidence upload fields for HIPAA compliance
 */

export interface EvidenceFieldConfig {
  id: string;
  name: string;
  category: string;
  evidence_type: 'document' | 'screenshot' | 'log' | 'link' | 'attestation';
  required: boolean;
  frequency?: 'annually' | 'quarterly' | 'monthly' | 'continuously' | 'on_event';
  retention_years: number;
  related_policies: string[];
  description?: string;
  
  // 🔴 NÍVEL 1 - Evidence Guidance (OCR Audit-Ready)
  ocr_guidance?: {
    what_ocr_expects: string;
    acceptable_examples: string[];
    common_mistakes: string[];
    who_provides: string;
    evidence_strength: 'strong' | 'acceptable' | 'weak';
  };
}

export const EVIDENCE_FIELDS: EvidenceFieldConfig[] = [
  // ADMINISTRATIVE SAFEGUARDS
  {
    id: 'security_officer_designation',
    name: 'Security Officer Designation Document',
    category: 'Administrative Safeguards',
    evidence_type: 'document',
    required: true,
    frequency: 'on_event',
    retention_years: 7,
    related_policies: ['MST-001', 'POL-002'],
    description: 'Written designation of Security Officer with name, title, responsibilities, and authority',
    ocr_guidance: {
      what_ocr_expects: 'Written, signed document formally designating a specific person as the HIPAA Security Officer with defined responsibilities',
      acceptable_examples: [
        'Signed appointment letter naming Security Officer',
        'Board resolution or executive memo designating Security Officer',
        'Job description explicitly listing HIPAA Security Officer role',
        'Organizational chart showing Security Officer position'
      ],
      common_mistakes: [
        'No written designation (verbal assignment is insufficient)',
        'Missing signature or date',
        'Security Officer role combined with too many other duties',
        'No documentation of authority to implement security measures'
      ],
      who_provides: 'Practice Owner, CEO, or Board of Directors',
      evidence_strength: 'strong'
    }
  },
  {
    id: 'privacy_officer_designation',
    name: 'Privacy Officer Designation Document',
    category: 'Administrative Safeguards',
    evidence_type: 'document',
    required: true,
    frequency: 'on_event',
    retention_years: 7,
    related_policies: ['MST-001', 'POL-007'],
    description: 'Written designation of Privacy Officer with name, title, responsibilities, and authority'
  },
  {
    id: 'sra_report',
    name: 'Security Risk Analysis (SRA) Report',
    category: 'Administrative Safeguards',
    evidence_type: 'document',
    required: true,
    frequency: 'annually',
    retention_years: 7,
    related_policies: ['POL-002', 'MST-001'],
    description: 'Annual comprehensive security risk assessment documenting all identified risks and vulnerabilities',
    ocr_guidance: {
      what_ocr_expects: 'Documented, comprehensive analysis of security risks to ePHI with identified vulnerabilities, likelihood, impact, and mitigation plans',
      acceptable_examples: [
        'Formal SRA report with methodology, findings, risk ratings, and action plan',
        'HIPAA Hub generated SRA export with all safeguards assessed',
        'Third-party risk assessment report specific to your organization',
        'Spreadsheet-based SRA with all HIPAA safeguards documented'
      ],
      common_mistakes: [
        'Generic template SRA not customized to organization',
        'SRA older than 12-15 months',
        'Missing risk mitigation plans or follow-up actions',
        'Incomplete assessment (missing technical or physical safeguards)'
      ],
      who_provides: 'Security Officer, Compliance Officer, or External Consultant',
      evidence_strength: 'strong'
    }
  },
  {
    id: 'risk_management_plan',
    name: 'Risk Management Plan',
    category: 'Administrative Safeguards',
    evidence_type: 'document',
    required: true,
    frequency: 'quarterly',
    retention_years: 7,
    related_policies: ['POL-003', 'MST-001'],
    description: 'Documented plan for identifying, assessing, and mitigating security risks to PHI'
  },
  {
    id: 'sanction_policy',
    name: 'Sanction Policy Document',
    category: 'Administrative Safeguards',
    evidence_type: 'document',
    required: true,
    frequency: 'annually',
    retention_years: 7,
    related_policies: ['POL-006', 'MST-001', 'POL-005'],
    description: 'Policy outlining disciplinary procedures for HIPAA violations'
  },
  {
    id: 'audit_logs_sample',
    name: 'Audit Logs Sample Export',
    category: 'Administrative Safeguards',
    evidence_type: 'log',
    required: true,
    frequency: 'continuously',
    retention_years: 7,
    related_policies: ['POL-009', 'MST-001'],
    description: 'Sample export of system audit logs showing access and modifications to PHI',
    ocr_guidance: {
      what_ocr_expects: 'System-generated logs showing who accessed ePHI, what they accessed, when, and what actions they took (view, modify, delete, print)',
      acceptable_examples: [
        'EHR system audit log export showing user access history',
        'Database access logs with user IDs, timestamps, and actions',
        'System security log showing PHI-related activities',
        'Network access logs for systems containing ePHI'
      ],
      common_mistakes: [
        'No audit logging capability (OCR requires this)',
        'Logs that don\'t capture sufficient detail (who, what, when)',
        'Missing logs for critical periods',
        'Logs not reviewed regularly for suspicious activity'
      ],
      who_provides: 'IT Administrator or EHR System Admin',
      evidence_strength: 'strong'
    }
  },
  {
    id: 'incident_response_plan',
    name: 'Incident Response & Breach Notification Plan',
    category: 'Administrative Safeguards',
    evidence_type: 'document',
    required: true,
    frequency: 'annually',
    retention_years: 7,
    related_policies: ['POL-007', 'MST-001'],
    description: 'Documented procedures for responding to security incidents and breaches',
    ocr_guidance: {
      what_ocr_expects: 'Documented plan detailing step-by-step procedures for identifying, containing, investigating, and reporting security incidents and breaches',
      acceptable_examples: [
        'Incident Response Plan with breach notification timelines',
        'HIPAA Hub generated Incident Response Policy',
        'Flowchart showing incident escalation and response procedures',
        'Written plan with contact list for incident response team'
      ],
      common_mistakes: [
        'Plan doesn\'t include breach notification timelines (60 days to affected individuals)',
        'Missing procedures for different types of incidents',
        'No designated incident response team or roles',
        'Plan not tested or reviewed annually'
      ],
      who_provides: 'Security Officer or Privacy Officer',
      evidence_strength: 'acceptable'
    }
  },
  {
    id: 'workforce_training_policy',
    name: 'Workforce Training Policy Document',
    category: 'Administrative Safeguards',
    evidence_type: 'document',
    required: true,
    frequency: 'annually',
    retention_years: 7,
    related_policies: ['POL-005', 'MST-001', 'POL-006'],
    description: 'Policy documenting HIPAA training requirements for all workforce members'
  },

  // TECHNICAL SAFEGUARDS
  {
    id: 'encryption_configuration',
    name: 'Encryption Configuration Screenshot',
    category: 'Technical Safeguards',
    evidence_type: 'screenshot',
    required: true,
    frequency: 'annually',
    retention_years: 7,
    related_policies: ['POL-004', 'MST-001'],
    description: 'Screenshot or documentation showing encryption enabled for PHI at rest and in transit',
    ocr_guidance: {
      what_ocr_expects: 'Technical proof that data containing ePHI is encrypted both at rest (storage) and in transit (transmission)',
      acceptable_examples: [
        'Database encryption settings screenshot showing enabled status',
        'Server/system configuration showing encryption protocols (TLS 1.2+, AES-256)',
        'Cloud provider security report confirming encryption',
        'Network administrator report documenting encryption status'
      ],
      common_mistakes: [
        'Policy document only, no technical verification',
        'Screenshots without clear indication encryption is active',
        'Missing proof for both at-rest AND in-transit',
        'Outdated encryption protocols (SSL, TLS 1.0/1.1)'
      ],
      who_provides: 'IT Administrator, Cloud Provider, or EHR Vendor',
      evidence_strength: 'strong'
    }
  },
  {
    id: 'email_encryption',
    name: 'Email Encryption Configuration Proof',
    category: 'Technical Safeguards',
    evidence_type: 'screenshot',
    required: true,
    frequency: 'annually',
    retention_years: 7,
    related_policies: ['POL-004', 'MST-001', 'POL-002'],
    description: 'Proof that email containing PHI is encrypted'
  },
  {
    id: 'mfa_configuration',
    name: 'MFA Configuration Screenshot',
    category: 'Technical Safeguards',
    evidence_type: 'screenshot',
    required: true,
    frequency: 'annually',
    retention_years: 7,
    related_policies: ['POL-004', 'MST-001'],
    description: 'Screenshot showing multi-factor authentication enabled for systems with PHI access',
    ocr_guidance: {
      what_ocr_expects: 'Technical proof that MFA is enforced on systems accessing ePHI, not just policy statements',
      acceptable_examples: [
        'Screenshot of MFA settings showing enabled status in EHR/EMR system',
        'System security report confirming MFA enforcement',
        'Admin panel screenshot showing MFA requirements for users',
        'Vendor documentation with your organization\'s MFA configuration'
      ],
      common_mistakes: [
        'Only providing written policy without technical proof',
        'Screenshots that don\'t clearly show MFA is enabled',
        'Missing timestamps or organizational identifiers',
        'Providing MFA for non-PHI systems instead of PHI systems'
      ],
      who_provides: 'IT Administrator or EHR Vendor',
      evidence_strength: 'strong'
    }
  },
  {
    id: 'device_inventory',
    name: 'Device Inventory List',
    category: 'Technical Safeguards',
    evidence_type: 'document',
    required: true,
    frequency: 'quarterly',
    retention_years: 7,
    related_policies: ['POL-003', 'MST-001', 'POL-004'],
    description: 'Inventory of all devices that store or access PHI'
  },
  {
    id: 'firewall_configuration',
    name: 'Firewall Configuration Screenshot',
    category: 'Technical Safeguards',
    evidence_type: 'screenshot',
    required: true,
    frequency: 'annually',
    retention_years: 7,
    related_policies: ['POL-004', 'MST-001', 'POL-002', 'POL-003'],
    description: 'Screenshot or documentation of firewall rules and configuration'
  },
  {
    id: 'antivirus_configuration',
    name: 'Antivirus Configuration Screenshot',
    category: 'Technical Safeguards',
    evidence_type: 'screenshot',
    required: true,
    frequency: 'annually',
    retention_years: 7,
    related_policies: ['POL-003', 'MST-001', 'POL-002'],
    description: 'Screenshot showing antivirus software installed and updated on all systems'
  },
  {
    id: 'backup_recovery_test',
    name: 'Backup & Recovery Test Report',
    category: 'Technical Safeguards',
    evidence_type: 'document',
    required: true,
    frequency: 'quarterly',
    retention_years: 7,
    related_policies: ['POL-003', 'MST-001', 'POL-002', 'POL-007'],
    description: 'Documentation of backup and recovery testing with test dates and results'
  },
  {
    id: 'patch_management_log',
    name: 'Patch Management Log',
    category: 'Technical Safeguards',
    evidence_type: 'log',
    required: true,
    frequency: 'monthly',
    retention_years: 7,
    related_policies: ['POL-003', 'MST-001', 'POL-002', 'POL-009'],
    description: 'Log showing software patches and updates applied to systems'
  },
  {
    id: 'vulnerability_scan',
    name: 'Vulnerability Scan Report',
    category: 'Technical Safeguards',
    evidence_type: 'document',
    required: false,
    frequency: 'annually',
    retention_years: 7,
    related_policies: ['POL-002', 'POL-003', 'MST-001'],
    description: 'Report from security vulnerability scanning showing identified vulnerabilities'
  },
  {
    id: 'penetration_test',
    name: 'Penetration Test Report',
    category: 'Technical Safeguards',
    evidence_type: 'document',
    required: false,
    frequency: 'annually',
    retention_years: 7,
    related_policies: ['POL-002', 'POL-003', 'MST-001'],
    description: 'Results from security penetration testing'
  },

  // PHYSICAL SAFEGUARDS
  {
    id: 'physical_access_control',
    name: 'Physical Access Control Policy',
    category: 'Physical Safeguards',
    evidence_type: 'document',
    required: true,
    frequency: 'annually',
    retention_years: 7,
    related_policies: ['POL-004', 'MST-001', 'POL-002'],
    description: 'Policy documenting physical access controls to facilities and equipment'
  },
  {
    id: 'visitor_log',
    name: 'Visitor Log Sample',
    category: 'Physical Safeguards',
    evidence_type: 'log',
    required: true,
    frequency: 'continuously',
    retention_years: 7,
    related_policies: ['POL-004', 'MST-001', 'POL-009'],
    description: 'Sample visitor log showing access to facilities where PHI is stored'
  },
  {
    id: 'data_destruction_policy',
    name: 'Data Destruction & Disposal Policy',
    category: 'Physical Safeguards',
    evidence_type: 'document',
    required: true,
    frequency: 'annually',
    retention_years: 7,
    related_policies: ['POL-003', 'MST-001', 'POL-009'],
    description: 'Policy for secure destruction and disposal of PHI and devices containing PHI'
  },
  {
    id: 'workstation_security',
    name: 'Workstation Security Configuration',
    category: 'Physical Safeguards',
    evidence_type: 'screenshot',
    required: true,
    frequency: 'annually',
    retention_years: 7,
    related_policies: ['POL-004', 'MST-001', 'POL-002'],
    description: 'Documentation of workstation security measures and configurations'
  },
  {
    id: 'remote_access_policy',
    name: 'Remote Access Policy',
    category: 'Physical Safeguards',
    evidence_type: 'document',
    required: true,
    frequency: 'annually',
    retention_years: 7,
    related_policies: ['POL-004', 'MST-001', 'POL-002'],
    description: 'Policy for secure remote access to systems containing PHI'
  },

  // ACCESS CONTROL
  {
    id: 'rbac_configuration',
    name: 'Role-Based Access Control (RBAC) Configuration',
    category: 'Access Control',
    evidence_type: 'screenshot',
    required: true,
    frequency: 'annually',
    retention_years: 7,
    related_policies: ['POL-004', 'MST-001', 'POL-002'],
    description: 'Screenshot or documentation showing role-based access control implementation'
  },
  {
    id: 'access_review',
    name: 'Access Review Documentation',
    category: 'Access Control',
    evidence_type: 'document',
    required: true,
    frequency: 'quarterly',
    retention_years: 7,
    related_policies: ['POL-004', 'MST-001', 'POL-009'],
    description: 'Documentation of periodic access reviews and access control audits'
  },
  {
    id: 'termination_checklist',
    name: 'Employee Termination Checklist',
    category: 'Access Control',
    evidence_type: 'document',
    required: true,
    frequency: 'on_event',
    retention_years: 7,
    related_policies: ['POL-004', 'POL-006', 'MST-001'],
    description: 'Checklist documenting removal of access when employees leave'
  },
  {
    id: 'password_policy',
    name: 'Password Policy Configuration',
    category: 'Access Control',
    evidence_type: 'screenshot',
    required: true,
    frequency: 'annually',
    retention_years: 7,
    related_policies: ['POL-004', 'MST-001', 'POL-002'],
    description: 'Screenshot or documentation of password policy settings (length, complexity, expiration)'
  },
  {
    id: 'session_timeout',
    name: 'Session Timeout Configuration',
    category: 'Access Control',
    evidence_type: 'screenshot',
    required: true,
    frequency: 'annually',
    retention_years: 7,
    related_policies: ['POL-004', 'MST-001', 'POL-002'],
    description: 'Screenshot showing session timeout settings for systems with PHI access'
  },

  // VENDOR & BUSINESS ASSOCIATE
  {
    id: 'baa_executed',
    name: 'Executed Business Associate Agreement (BAA)',
    category: 'Vendor & Business Associate',
    evidence_type: 'document',
    required: true,
    frequency: 'on_event',
    retention_years: 7,
    related_policies: ['POL-008', 'MST-001'],
    description: 'Signed BAA for each vendor with PHI access',
    ocr_guidance: {
      what_ocr_expects: 'Fully executed (signed by both parties) Business Associate Agreement for EVERY vendor that creates, receives, maintains, or transmits ePHI on your behalf',
      acceptable_examples: [
        'Signed BAA with EHR vendor (practice management system)',
        'Signed BAA with cloud storage provider (if storing PHI)',
        'Signed BAA with medical billing company',
        'Signed BAA with IT support vendor accessing PHI systems'
      ],
      common_mistakes: [
        'Missing BAA for key vendors (e.g., EHR, billing, cloud backup)',
        'Unsigned or partially signed BAAs',
        'BAA that doesn\'t meet HIPAA requirements (use HIPAA-compliant template)',
        'Relying on vendor\'s "Terms of Service" instead of formal BAA'
      ],
      who_provides: 'Privacy Officer, Practice Administrator, or Legal',
      evidence_strength: 'strong'
    }
  },
  {
    id: 'vendor_security_assessment',
    name: 'Vendor Security Assessment Report',
    category: 'Vendor & Business Associate',
    evidence_type: 'document',
    required: true,
    frequency: 'annually',
    retention_years: 7,
    related_policies: ['POL-008', 'MST-001', 'POL-002'],
    description: 'Security assessment of vendors who handle PHI'
  },
  {
    id: 'vendor_soc2',
    name: 'Vendor SOC2 Report or Security Certification',
    category: 'Vendor & Business Associate',
    evidence_type: 'link',
    required: false,
    frequency: 'annually',
    retention_years: 7,
    related_policies: ['POL-008', 'MST-001', 'POL-002'],
    description: 'SOC2 Type II report or other security certification from vendor'
  },
  {
    id: 'vendor_compliance_monitoring',
    name: 'Vendor Compliance Monitoring Log',
    category: 'Vendor & Business Associate',
    evidence_type: 'log',
    required: true,
    frequency: 'quarterly',
    retention_years: 7,
    related_policies: ['POL-008', 'MST-001', 'POL-009'],
    description: 'Log documenting ongoing monitoring of vendor compliance'
  },
  {
    id: 'vendor_incident_agreement',
    name: 'Vendor Incident Reporting Agreement',
    category: 'Vendor & Business Associate',
    evidence_type: 'document',
    required: true,
    frequency: 'on_event',
    retention_years: 7,
    related_policies: ['POL-008', 'POL-007', 'MST-001'],
    description: 'Agreement requiring vendors to report security incidents'
  },

  // CLOUD & HOSTING
  {
    id: 'cloud_provider_info',
    name: 'Cloud Service Provider Information',
    category: 'Cloud & Hosting',
    evidence_type: 'document',
    required: false,
    frequency: 'annually',
    retention_years: 7,
    related_policies: ['POL-008', 'MST-001', 'POL-002'],
    description: 'Documentation of cloud service provider and services used'
  },
  {
    id: 'cloud_encryption',
    name: 'Cloud Provider Encryption Documentation',
    category: 'Cloud & Hosting',
    evidence_type: 'document',
    required: false,
    frequency: 'annually',
    retention_years: 7,
    related_policies: ['POL-004', 'POL-008', 'MST-001', 'POL-002'],
    description: 'Documentation of encryption provided by cloud service provider'
  },
  {
    id: 'cloud_data_deletion',
    name: 'Cloud Data Deletion & Portability Policy',
    category: 'Cloud & Hosting',
    evidence_type: 'document',
    required: false,
    frequency: 'annually',
    retention_years: 7,
    related_policies: ['POL-008', 'MST-001', 'POL-009'],
    description: 'Policy for data deletion and portability when terminating cloud services'
  },

  // INCIDENT RESPONSE
  {
    id: 'incident_detection',
    name: 'Incident Detection Procedures',
    category: 'Incident Response',
    evidence_type: 'document',
    required: true,
    frequency: 'annually',
    retention_years: 7,
    related_policies: ['POL-007', 'MST-001', 'POL-009'],
    description: 'Documented procedures for detecting security incidents'
  },
  {
    id: 'ir_team_roster',
    name: 'Incident Response Team Roster',
    category: 'Incident Response',
    evidence_type: 'document',
    required: true,
    frequency: 'annually',
    retention_years: 7,
    related_policies: ['POL-007', 'MST-001', 'POL-002'],
    description: 'List of incident response team members with roles and contact information'
  },
  {
    id: 'breach_log',
    name: 'Breach Log / Incident Record',
    category: 'Incident Response',
    evidence_type: 'log',
    required: true,
    frequency: 'on_event',
    retention_years: 7,
    related_policies: ['POL-007', 'MST-001', 'POL-009'],
    description: 'Registry of all security incidents and breaches'
  },
  {
    id: 'breach_notification_letter',
    name: 'Breach Notification Letter',
    category: 'Incident Response',
    evidence_type: 'document',
    required: false,
    frequency: 'on_event',
    retention_years: 7,
    related_policies: ['POL-007', 'MST-001', 'POL-009'],
    description: 'Sample breach notification letter sent to affected individuals'
  },
  {
    id: 'hhs_breach_notification',
    name: 'HHS Breach Notification Documentation',
    category: 'Incident Response',
    evidence_type: 'document',
    required: false,
    frequency: 'on_event',
    retention_years: 7,
    related_policies: ['POL-007', 'MST-001', 'POL-009'],
    description: 'Documentation of breach notification sent to HHS Secretary'
  },
  {
    id: 'post_incident_review',
    name: 'Post-Incident Review Report',
    category: 'Incident Response',
    evidence_type: 'document',
    required: false,
    frequency: 'on_event',
    retention_years: 7,
    related_policies: ['POL-007', 'MST-001', 'POL-003'],
    description: 'Report documenting lessons learned and improvements after security incident'
  },

  // WORKFORCE & TRAINING
  {
    id: 'training_completion_logs',
    name: 'Training Completion Logs',
    category: 'Workforce & Training',
    evidence_type: 'log',
    required: true,
    frequency: 'continuously',
    retention_years: 7,
    related_policies: ['POL-005', 'MST-001'],
    description: 'Records showing who trained, when, topics covered, and completion status',
    ocr_guidance: {
      what_ocr_expects: 'Documented proof that ALL workforce members received HIPAA training, including dates, topics covered, and acknowledgment of completion',
      acceptable_examples: [
        'HIPAA Hub training completion report showing all staff members',
        'Training platform export with employee names, dates, and topics',
        'Signed training acknowledgment forms from each employee',
        'Spreadsheet tracking training dates with employee signatures'
      ],
      common_mistakes: [
        'Missing training records for terminated employees (must retain for 7 years)',
        'Generic training without HIPAA-specific content',
        'No proof of annual refresher training',
        'Training logs without employee signatures or acknowledgments'
      ],
      who_provides: 'Privacy Officer, HR, or Training Coordinator',
      evidence_strength: 'strong'
    }
  },

  // PRIVACY & PATIENT RIGHTS
  {
    id: 'privacy_notice',
    name: 'Privacy Notice (Notice of Privacy Practices)',
    category: 'Privacy & Patient Rights',
    evidence_type: 'document',
    required: true,
    frequency: 'annually',
    retention_years: 7,
    related_policies: ['MST-001', 'POL-009'],
    description: 'Notice of Privacy Practices provided to patients'
  },
  {
    id: 'authorization_consent',
    name: 'Authorization & Consent Forms',
    category: 'Privacy & Patient Rights',
    evidence_type: 'document',
    required: true,
    frequency: 'on_event',
    retention_years: 7,
    related_policies: ['MST-001', 'POL-009'],
    description: 'Sample authorization and consent forms for uses and disclosures of PHI'
  },

  // ADDITIONAL
  {
    id: 'subcontractor_agreements',
    name: 'Business Associate Subcontractor Agreements',
    category: 'Additional',
    evidence_type: 'document',
    required: false,
    frequency: 'on_event',
    retention_years: 7,
    related_policies: ['POL-008', 'MST-001', 'POL-009'],
    description: 'Agreements with subcontractors of business associates'
  },
  {
    id: 'ehr_access_logs',
    name: 'System Access Logs (EHR/EMR)',
    category: 'Additional',
    evidence_type: 'log',
    required: false,
    frequency: 'continuously',
    retention_years: 7,
    related_policies: ['POL-009', 'MST-001', 'POL-004'],
    description: 'Access logs from Electronic Health Records or Electronic Medical Records systems'
  },
  {
    id: 'breach_response_timeline',
    name: 'Data Breach Response Timeline Documentation',
    category: 'Additional',
    evidence_type: 'document',
    required: false,
    frequency: 'on_event',
    retention_years: 7,
    related_policies: ['POL-007', 'MST-001', 'POL-009'],
    description: 'Timeline documenting breach response activities and notification timeline'
  },
];

/**
 * Get evidence fields by category
 */
export function getEvidenceFieldsByCategory(category: string): EvidenceFieldConfig[] {
  return EVIDENCE_FIELDS.filter(field => field.category === category);
}

/**
 * Get evidence fields by policy
 */
export function getEvidenceFieldsByPolicy(policyId: string): EvidenceFieldConfig[] {
  return EVIDENCE_FIELDS.filter(field => field.related_policies.includes(policyId));
}

/**
 * Get required evidence fields only
 */
export function getRequiredEvidenceFields(): EvidenceFieldConfig[] {
  return EVIDENCE_FIELDS.filter(field => field.required);
}

/**
 * Get all categories
 */
export function getEvidenceCategories(): string[] {
  return Array.from(new Set(EVIDENCE_FIELDS.map(field => field.category)));
}
