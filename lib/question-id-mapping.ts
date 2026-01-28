/**
 * Question ID Mapping
 * Maps current question IDs to Evidence-Driven System question IDs
 * 
 * Current system uses IDs like: 'security-officer', 'privacy-officer'
 * Evidence system uses IDs like: 'ADM-001', 'ADM-002'
 */

export const QUESTION_ID_MAP: Record<string, string> = {
  // Administrative Safeguards
  'security-officer': 'ADM-001',
  'privacy-officer': 'ADM-002',
  'risk-assessment-conducted': 'ADM-003',
  'risk-management-plan': 'ADM-004',
  'sanction-policy': 'ADM-005',
  'information-system-activity-review': 'ADM-006',
  'workforce-authorization': 'ADM-007',
  'workforce-supervision': 'ADM-008',
  'workforce-clearance': 'ADM-009',
  'workforce-termination': 'ADM-010',
  'access-establishment': 'ADM-011',
  'access-authorization': 'ADM-012',
  'access-establishment-modification': 'ADM-013',
  'security-awareness-training': 'ADM-014',
  'initial-hipaa-training': 'ADM-015',
  'annual-hipaa-training': 'ADM-016',
  'role-specific-training': 'ADM-017',
  'incident-reporting-training': 'ADM-018',
  'incident-response-plan': 'ADM-019',
  'incident-response-procedures': 'ADM-020',
  'breach-notification-procedures': 'ADM-021',
  'incident-mitigation': 'ADM-022',
  'business-associate-agreements': 'ADM-023',
  'business-associate-monitoring': 'ADM-024',
  'business-associate-incident-notification': 'ADM-025',
  'contingency-plan': 'ADM-026',
  'data-backup-procedures': 'ADM-027',
  'disaster-recovery-testing': 'ADM-028',
  
  // Physical Safeguards
  'facility-access-controls': 'PHY-001',
  'visitor-access-controls': 'PHY-002',
  'facility-security-plan': 'PHY-003',
  'workstation-security': 'PHY-004',
  'workstation-use-policy': 'PHY-005',
  'workstation-positioning': 'PHY-006',
  'media-inventory': 'PHY-007',
  'media-disposal': 'PHY-008',
  'media-reuse': 'PHY-009',
  'portable-device-security': 'PHY-010',
  'paper-record-storage': 'PHY-011',
  'paper-record-destruction': 'PHY-012',
  'environmental-controls': 'PHY-013',
  'fire-detection-suppression': 'PHY-014',
  'flood-water-protection': 'PHY-015',
  'backup-power': 'PHY-016',
  'network-cabling-security': 'PHY-017',
  'utilities-disposal': 'PHY-018',
  
  // Technical Safeguards
  'unique-user-ids': 'TECH-001',
  'emergency-access': 'TECH-002',
  'session-timeout': 'TECH-003',
  're-authentication': 'TECH-004',
  'audit-log-configuration': 'TECH-005',
  'audit-log-retention': 'TECH-006',
  'audit-log-review': 'TECH-007',
  'audit-log-protection': 'TECH-008',
  'data-integrity-controls': 'TECH-009',
  'data-validation': 'TECH-010',
  'encryption-at-rest': 'TECH-011',
  'encryption-in-transit': 'TECH-012',
  'email-security': 'TECH-013',
  'remote-access-vpn': 'TECH-014',
  'multi-factor-authentication': 'TECH-015',
  'password-policy': 'TECH-016',
  'role-based-access-control': 'TECH-017',
  'access-recertification': 'TECH-018',
  'antivirus-anti-malware': 'TECH-019',
  'malware-scanning': 'TECH-020',
  'patch-management': 'TECH-021',
  'system-patching': 'TECH-022',
  'firmware-updates': 'TECH-023',
  'firewall': 'TECH-024',
  'firewall-rules': 'TECH-025',
  'network-segmentation': 'TECH-026',
  'intrusion-detection': 'TECH-027',
  'wireless-encryption': 'TECH-028',
  'wireless-security': 'TECH-029',
  'rogue-wireless-detection': 'TECH-030',
};

/**
 * Get evidence question ID from current question ID
 */
export function getEvidenceQuestionId(currentQuestionId: string): string | null {
  return QUESTION_ID_MAP[currentQuestionId] || null;
}

/**
 * Get current question ID from evidence question ID
 */
export function getCurrentQuestionId(evidenceQuestionId: string): string | null {
  const entry = Object.entries(QUESTION_ID_MAP).find(([_, evId]) => evId === evidenceQuestionId);
  return entry ? entry[0] : null;
}
