/**
 * Generate Action Items from Risk Assessment Answers
 * 
 * This function analyzes risk assessment answers and generates
 * actionable items that need to be completed for HIPAA compliance.
 */

export interface ActionItemData {
  itemKey: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium';
  category: string;
}

/**
 * Generate action items based on risk assessment answers
 */
export function generateActionItems(
  answers: Record<string, string>
): ActionItemData[] {
  const items: ActionItemData[] = [];

  // CRITICAL PRIORITY ITEMS

  // Security Officer
  if (answers['security-officer'] === 'no' || answers['security-officer'] === 'informal') {
    items.push({
      itemKey: 'security-officer',
      title: 'Designate Security Officer',
      description: 'HIPAA requires a formally designated Security Officer to oversee compliance. Assign a specific person to this role and document the designation.',
      priority: 'critical',
      category: 'Administrative'
    });
  }

  // Security Policy
  if (answers['security-policy'] === 'no' || answers['security-policy'] === 'partial' || answers['security-policy'] === 'yes-outdated') {
    items.push({
      itemKey: 'security-policy',
      title: 'Create Security Policy',
      description: 'A written HIPAA Security Policy is required to document your security measures. This must be comprehensive and current.',
      priority: answers['security-policy'] === 'no' ? 'critical' : 'high',
      category: 'Policies'
    });
  }

  // Privacy Policy
  if (answers['privacy-policy'] !== 'yes') {
    items.push({
      itemKey: 'privacy-policy',
      title: 'Create Privacy Policy',
      description: 'A HIPAA Privacy Policy is required to inform patients of their rights regarding their protected health information.',
      priority: 'critical',
      category: 'Policies'
    });
  }

  // Risk Assessment
  if (answers['risk-assessment-conducted'] === 'no' || answers['risk-assessment-conducted'] === 'yes-old') {
    items.push({
      itemKey: 'risk-assessment-conducted',
      title: 'Conduct Security Risk Assessment',
      description: 'A formal Security Risk Assessment must be conducted at least annually. Document findings and remediation plans.',
      priority: 'critical',
      category: 'Administrative'
    });
  }

  // Incident Response Plan
  if (answers['incident-response'] !== 'yes') {
    items.push({
      itemKey: 'incident-response',
      title: 'Create Incident Response Plan',
      description: 'A documented plan for responding to security incidents and data breaches is required by HIPAA.',
      priority: 'critical',
      category: 'Policies'
    });
  }

  // Encryption at Rest
  if (answers['encryption-at-rest'] === 'no' || answers['encryption-at-rest'] === 'yes-some') {
    items.push({
      itemKey: 'encryption-at-rest',
      title: 'Implement Data Encryption at Rest',
      description: 'Encrypt all electronic Protected Health Information (ePHI) when stored. This is a critical safeguard.',
      priority: 'critical',
      category: 'Security'
    });
  }

  // Encryption in Transit
  if (answers['encryption-in-transit'] === 'no' || answers['encryption-in-transit'] === 'yes-some') {
    items.push({
      itemKey: 'encryption-in-transit',
      title: 'Implement Data Encryption in Transit',
      description: 'Encrypt all ePHI when transmitted over networks (email, cloud, etc.). This prevents unauthorized access during transmission.',
      priority: 'critical',
      category: 'Security'
    });
  }

  // Business Associate Agreements
  if (answers['business-associates'] === 'no' || answers['business-associates'] === 'yes-some') {
    items.push({
      itemKey: 'business-associates',
      title: 'Sign Business Associate Agreements',
      description: 'Business Associate Agreements (BAAs) are required with all vendors who handle PHI. Ensure all vendors have signed BAAs.',
      priority: 'critical',
      category: 'Contracts'
    });
  }

  // Cloud BAAs
  if (answers['cloud-services'] === 'yes' && (answers['cloud-baa'] === 'no' || answers['cloud-baa'] === 'yes-some')) {
    items.push({
      itemKey: 'cloud-baa',
      title: 'Sign BAA with Cloud Provider',
      description: 'If you use cloud services to store or process PHI, you must have BAAs and verify HIPAA-compliant configurations.',
      priority: 'critical',
      category: 'Contracts'
    });
  }

  // HIGH PRIORITY ITEMS

  // Workforce Training
  if (answers['workforce-training'] === 'no' || answers['workforce-training'] === 'yes-some') {
    items.push({
      itemKey: 'workforce-training',
      title: 'Train Staff on HIPAA',
      description: 'All employees must complete HIPAA security awareness training and sign attestations. Document all training.',
      priority: 'high',
      category: 'Training'
    });
  }

  // Access Management
  if (answers['access-management'] === 'no' || answers['access-management'] === 'yes-informal') {
    items.push({
      itemKey: 'access-management',
      title: 'Implement Access Controls',
      description: 'Establish formal procedures to authorize and supervise workforce access to PHI. Document access policies.',
      priority: 'high',
      category: 'Security'
    });
  }

  // Access Review
  if (answers['access-review'] === 'no' || answers['access-review'] === 'yes-occasional') {
    items.push({
      itemKey: 'access-review',
      title: 'Implement Access Review Process',
      description: 'Regularly review and update workforce access to PHI, especially when employees leave or change roles.',
      priority: 'high',
      category: 'Security'
    });
  }

  // Contingency Plan
  if (answers['contingency-plan'] === 'no' || answers['contingency-plan'] === 'yes-untested') {
    items.push({
      itemKey: 'contingency-plan',
      title: 'Create Contingency Plan',
      description: 'Develop and test a Contingency Plan for data backup and disaster recovery. Regular testing is required.',
      priority: 'high',
      category: 'Administrative'
    });
  }

  // Audit Logs
  if (answers['audit-logs'] === 'no' || answers['audit-logs'] === 'yes-basic') {
    items.push({
      itemKey: 'audit-logs',
      title: 'Implement Audit Logging',
      description: 'Maintain comprehensive audit logs of who accessed PHI and when. This is critical for breach investigations.',
      priority: 'high',
      category: 'Security'
    });
  }

  // Email Security
  if (answers['email-security'] === 'no' || answers['email-security'] === 'yes-sometimes') {
    items.push({
      itemKey: 'email-security',
      title: 'Implement Email Encryption',
      description: 'Use encrypted email when sending PHI to patients or other providers. Unencrypted email is a compliance risk.',
      priority: 'high',
      category: 'Security'
    });
  }

  // MEDIUM PRIORITY ITEMS

  // Workforce Clearance
  if (answers['workforce-clearance'] === 'no' || answers['workforce-clearance'] === 'yes-some') {
    items.push({
      itemKey: 'workforce-clearance',
      title: 'Implement Background Checks',
      description: 'Perform background checks or verify credentials before granting access to PHI, especially for new hires.',
      priority: 'medium',
      category: 'Administrative'
    });
  }

  // Facility Access
  if (answers['facility-access'] === 'no' || answers['facility-access'] === 'yes-partial') {
    items.push({
      itemKey: 'facility-access',
      title: 'Strengthen Physical Security',
      description: 'Implement physical controls to limit access to areas where PHI is stored (locks, badges, etc.).',
      priority: 'medium',
      category: 'Security'
    });
  }

  // Workstation Security
  if (answers['workstation-security'] === 'no' || answers['workstation-security'] === 'yes-some') {
    items.push({
      itemKey: 'workstation-security',
      title: 'Secure Workstations',
      description: 'Ensure all workstations that access PHI are secured and restricted from unauthorized access.',
      priority: 'medium',
      category: 'Security'
    });
  }

  // Device Controls
  if (answers['device-controls'] === 'no') {
    items.push({
      itemKey: 'device-controls',
      title: 'Implement Device Controls',
      description: 'Establish controls for the receipt and removal of hardware and electronic media containing PHI.',
      priority: 'medium',
      category: 'Security'
    });
  }

  // Media Disposal
  if (answers['media-disposal'] === 'no' || answers['media-disposal'] === 'yes-informal') {
    items.push({
      itemKey: 'media-disposal',
      title: 'Implement Secure Disposal Procedures',
      description: 'Establish secure disposal procedures for PHI (both paper and electronic media). Document the process.',
      priority: 'medium',
      category: 'Security'
    });
  }

  // Access Control (Technical)
  if (answers['access-control'] === 'no' || answers['access-control'] === 'yes-shared') {
    items.push({
      itemKey: 'access-control',
      title: 'Implement Unique User IDs',
      description: 'Ensure all systems accessing PHI have unique user IDs and authentication controls. Eliminate shared accounts.',
      priority: 'medium',
      category: 'Security'
    });
  }

  // Emergency Access
  if (answers['emergency-access'] === 'no' || answers['emergency-access'] === 'yes-informal') {
    items.push({
      itemKey: 'emergency-access',
      title: 'Document Emergency Access Procedures',
      description: 'Establish documented procedures for emergency access to PHI when needed for patient care.',
      priority: 'medium',
      category: 'Administrative'
    });
  }

  // Automatic Logoff
  if (answers['automatic-logoff'] === 'no' || answers['automatic-logoff'] === 'yes-some') {
    items.push({
      itemKey: 'automatic-logoff',
      title: 'Implement Automatic Logoff',
      description: 'Configure systems to automatically log off users after periods of inactivity to prevent unauthorized access.',
      priority: 'medium',
      category: 'Security'
    });
  }

  // Integrity Controls
  if (answers['integrity-controls'] === 'no') {
    items.push({
      itemKey: 'integrity-controls',
      title: 'Implement Integrity Controls',
      description: 'Establish controls to ensure ePHI is not improperly altered or destroyed.',
      priority: 'medium',
      category: 'Security'
    });
  }

  // Password Policy
  if (answers['password-policy'] === 'no' || answers['password-policy'] === 'yes-policy') {
    items.push({
      itemKey: 'password-policy',
      title: 'Enforce Strong Password Policy',
      description: 'Implement and enforce strong password policies (complexity, expiration, etc.) using system-enforced controls.',
      priority: 'medium',
      category: 'Security'
    });
  }

  // Backup Verification
  if (answers['backup-verification'] === 'no' || answers['backup-verification'] === 'yes-occasional') {
    items.push({
      itemKey: 'backup-verification',
      title: 'Test Backup and Recovery',
      description: 'Regularly test your data backup and recovery procedures to ensure they work when needed.',
      priority: 'medium',
      category: 'Administrative'
    });
  }

  // BAA Monitoring
  if (answers['business-associates'] !== 'no' && answers['baa-monitoring'] === 'no') {
    items.push({
      itemKey: 'baa-monitoring',
      title: 'Monitor Business Associate Compliance',
      description: 'Establish processes to monitor and ensure your Business Associates comply with their BAAs.',
      priority: 'medium',
      category: 'Administrative'
    });
  }

  // Sort by priority (critical first, then high, then medium)
  const priorityOrder = { critical: 0, high: 1, medium: 2 };
  return items.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}








