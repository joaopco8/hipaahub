/**
 * OCR Risk Context for Action Items
 * Explains why each action item matters in an audit
 */

export interface ActionItemOCRContext {
  ocr_risk_if_ignored: string;
  hipaa_citation: string;
  audit_impact: 'critical' | 'high' | 'medium';
  evidence_required: string[];
  real_world_example?: string;
}

/**
 * OCR Risk Context Database
 * Maps action item keys to their OCR audit context
 */
export const ACTION_ITEMS_OCR_CONTEXT: Record<string, ActionItemOCRContext> = {
  // Administrative Safeguards
  'sra-required': {
    ocr_risk_if_ignored: 'Failure to conduct a Security Risk Analysis is the #1 reason clinics fail OCR audits. OCR will cite this as immediate non-compliance.',
    hipaa_citation: '§164.308(a)(1)(ii)(A)',
    audit_impact: 'critical',
    evidence_required: ['Completed SRA Report', 'Risk register with mitigation plans', 'Documentation of risk assessment methodology'],
    real_world_example: 'In 75% of OCR enforcement actions, missing or inadequate SRA was a primary violation.'
  },
  'security-officer-required': {
    ocr_risk_if_ignored: 'OCR always asks "Who is your designated Security Officer?" Not having one formally designated is automatic non-compliance.',
    hipaa_citation: '§164.308(a)(2)',
    audit_impact: 'critical',
    evidence_required: ['Written designation letter', 'Job description or appointment memo', 'Signature of appointing authority'],
    real_world_example: 'Small practices are often cited for not formally designating officers, even when someone performs the role informally.'
  },
  'privacy-officer-required': {
    ocr_risk_if_ignored: 'Privacy Officer designation is legally required. Lack of designation shows organizational non-commitment to compliance.',
    hipaa_citation: '§164.530(a)(1)',
    audit_impact: 'critical',
    evidence_required: ['Written designation letter', 'Job description', 'Contact information on file'],
    real_world_example: 'OCR enforcement actions frequently cite missing Privacy Officer designation as a foundational failure.'
  },
  'incident-response-plan': {
    ocr_risk_if_ignored: 'Without a documented incident response plan, you cannot prove you have procedures to handle breaches. This is cited in most breach investigations.',
    hipaa_citation: '§164.308(a)(6)',
    audit_impact: 'critical',
    evidence_required: ['Incident Response Plan document', 'Breach notification procedures', 'Incident response team roster'],
    real_world_example: 'When breaches occur, OCR looks for documented response procedures. Missing plans result in higher penalties.'
  },

  // Technical Safeguards
  'encryption-at-rest': {
    ocr_risk_if_ignored: 'Unencrypted PHI is considered "unsecured" under the Breach Notification Rule. Any loss of unencrypted data is presumed a breach requiring notification.',
    hipaa_citation: '§164.312(a)(2)(iv)',
    audit_impact: 'critical',
    evidence_required: ['Encryption configuration screenshot', 'System security report', 'Vendor documentation of encryption'],
    real_world_example: 'Stolen laptops or lost devices without encryption trigger mandatory breach notifications and OCR investigations.'
  },
  'encryption-in-transit': {
    ocr_risk_if_ignored: 'Transmitting PHI over unsecured channels (no TLS/SSL) exposes data to interception. OCR considers this a security violation.',
    hipaa_citation: '§164.312(e)(1)',
    audit_impact: 'critical',
    evidence_required: ['Network configuration showing TLS 1.2+', 'Email encryption settings', 'VPN configuration if applicable'],
    real_world_example: 'Emailing PHI without encryption is a common violation found in OCR audits.'
  },
  'mfa-enforcement': {
    ocr_risk_if_ignored: 'Multi-factor authentication is increasingly expected by OCR. Password-only access to PHI is considered inadequate protection.',
    hipaa_citation: '§164.312(d) - Person or Entity Authentication',
    audit_impact: 'high',
    evidence_required: ['MFA configuration screenshot', 'System security settings', 'User access policy requiring MFA'],
    real_world_example: 'Recent OCR settlements have included MFA implementation as corrective action. Not having MFA shows lack of reasonable safeguards.'
  },
  'audit-logging': {
    ocr_risk_if_ignored: 'Without audit logs, you cannot detect or investigate unauthorized access. OCR considers this a failure of access controls.',
    hipaa_citation: '§164.312(b)',
    audit_impact: 'high',
    evidence_required: ['Sample audit log export', 'Log retention policy', 'Evidence of log review procedures'],
    real_world_example: 'In breach investigations, OCR requests audit logs. If you can\'t provide them, you can\'t prove what happened.'
  },

  // Training & Workforce
  'workforce-training': {
    ocr_risk_if_ignored: 'Untrained workforce is the leading cause of breaches. OCR requires documented training for ALL workforce members.',
    hipaa_citation: '§164.530(b)',
    audit_impact: 'high',
    evidence_required: ['Training completion records', 'Training materials', 'Employee acknowledgment signatures', 'Training dates and topics'],
    real_world_example: 'OCR audits always request training records. Missing or incomplete training documentation results in findings.'
  },
  'annual-training-refresh': {
    ocr_risk_if_ignored: 'One-time training is insufficient. OCR expects ongoing training, especially when policies change or new threats emerge.',
    hipaa_citation: '§164.530(b)(1)',
    audit_impact: 'medium',
    evidence_required: ['Annual training completion records', 'Updated training materials', 'Documentation of policy changes training'],
    real_world_example: 'Practices with outdated training (>2 years old) are cited for inadequate workforce safeguards.'
  },

  // Business Associates
  'baa-ehr-vendor': {
    ocr_risk_if_ignored: 'Missing BAA with your EHR vendor is one of the most common OCR findings. Without a BAA, you\'re in violation the moment they access PHI.',
    hipaa_citation: '§164.308(b)(1)',
    audit_impact: 'critical',
    evidence_required: ['Fully executed BAA', 'Vendor contact information', 'Date of execution'],
    real_world_example: 'OCR routinely cites missing BAAs as fundamental compliance failures. This is top 5 most common violations.'
  },
  'baa-billing-company': {
    ocr_risk_if_ignored: 'Billing companies handle massive amounts of PHI. Without a BAA, you\'re directly liable for their security practices.',
    hipaa_citation: '§164.308(b)(1)',
    audit_impact: 'critical',
    evidence_required: ['Fully executed BAA', 'Data security addendum', 'Breach notification agreement'],
    real_world_example: 'When billing vendor breaches occur, practices without BAAs face direct OCR enforcement.'
  },
  'baa-cloud-storage': {
    ocr_risk_if_ignored: 'Cloud providers storing PHI must have a BAA. Relying on standard Terms of Service is insufficient.',
    hipaa_citation: '§164.308(b)(1)',
    audit_impact: 'high',
    evidence_required: ['Signed BAA from cloud provider', 'Configuration showing encryption', 'Data residency documentation'],
    real_world_example: 'Dropbox, Google Drive personal accounts without BAAs are cited as HIPAA violations.'
  },

  // Access Controls
  'role-based-access': {
    ocr_risk_if_ignored: 'Minimum necessary rule violations are common. Everyone having access to all PHI is a security violation.',
    hipaa_citation: '§164.308(a)(4)',
    audit_impact: 'medium',
    evidence_required: ['Access control matrix', 'User role definitions', 'Evidence of access restrictions by role'],
    real_world_example: 'OCR expects you to document and enforce minimum necessary access. Front desk shouldn\'t see all clinical records.'
  },
  'access-termination': {
    ocr_risk_if_ignored: 'Terminated employees with continued system access are high-risk. OCR considers this a critical access control failure.',
    hipaa_citation: '§164.308(a)(3)(ii)(C)',
    audit_impact: 'high',
    evidence_required: ['Termination checklist', 'Access revocation logs', 'HR termination documentation'],
    real_world_example: 'Breaches by former employees with active access result in severe OCR penalties.'
  },
  'quarterly-access-review': {
    ocr_risk_if_ignored: 'Access creep over time violates minimum necessary. Regular reviews catch inappropriate access before it becomes a breach.',
    hipaa_citation: '§164.308(a)(4)(ii)(C)',
    audit_impact: 'medium',
    evidence_required: ['Access review reports', 'Documentation of reviews conducted', 'Evidence of access modifications'],
    real_world_example: 'OCR expects periodic access reviews. Practices without documented reviews are cited for inadequate access controls.'
  },

  // Physical Safeguards
  'workstation-security': {
    ocr_risk_if_ignored: 'Unsecured workstations allow unauthorized viewing of PHI. Screen locks and positioning are basic safeguards.',
    hipaa_citation: '§164.310(c)',
    audit_impact: 'medium',
    evidence_required: ['Workstation security policy', 'Screen lock settings screenshot', 'Physical security measures documentation'],
    real_world_example: 'Visitors seeing PHI on unattended screens violates HIPAA. OCR cites this in physical site reviews.'
  },
  'device-disposal': {
    ocr_risk_if_ignored: 'Improper disposal of devices with PHI (throwing away hard drives, donating computers) causes data breaches.',
    hipaa_citation: '§164.310(d)(2)(i)',
    audit_impact: 'high',
    evidence_required: ['Data destruction policy', 'Certificates of destruction', 'Device inventory with disposal records'],
    real_world_example: 'OCR has cited practices for dumpster-diving breaches. All devices must be properly sanitized before disposal.'
  }
};

/**
 * Get OCR context for an action item
 */
export function getOCRContext(itemKey: string): ActionItemOCRContext | null {
  return ACTION_ITEMS_OCR_CONTEXT[itemKey] || null;
}

/**
 * Get all action items with critical audit impact
 */
export function getCriticalAuditItems(): string[] {
  return Object.entries(ACTION_ITEMS_OCR_CONTEXT)
    .filter(([_, context]) => context.audit_impact === 'critical')
    .map(([key, _]) => key);
}
