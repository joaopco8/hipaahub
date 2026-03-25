/**
 * Remediation Recommendations Config
 *
 * Maps risk assessment question IDs to pre-written remediation recommendations.
 * These are displayed in the gap report grouped by priority (High first).
 *
 * risk_level:
 *   'high'   — Critical HIPAA requirement; OCR-fine-level risk (severityWeight 5)
 *   'medium' — Important safeguard; significant compliance gap (severityWeight 3–4)
 *   'low'    — Best-practice; minor gap unlikely to trigger direct penalty alone
 *
 * required_standard: human-readable description of the compliant state
 */

export type RiskLevel = 'high' | 'medium' | 'low';

export interface Remediation {
  /** Short action title */
  title: string;
  /** Full recommendation text shown in the gap report */
  recommendation: string;
  /** Description of what "compliant" looks like */
  required_standard: string;
  /** HIPAA citation */
  hipaa_citation: string;
  /** Risk severity */
  risk_level: RiskLevel;
}

export const REMEDIATIONS: Record<string, Remediation> = {
  // ── Administrative Safeguards ────────────────────────────────────────────

  'security-officer': {
    title: 'Designate a Security Officer',
    recommendation:
      'Formally appoint an individual as Security Officer in writing. Document their responsibilities, authority, and contact information. Update the designation annually or when the role changes.',
    required_standard: 'Formal written designation with documented responsibilities and authority',
    hipaa_citation: '45 CFR §164.308(a)(2)',
    risk_level: 'high',
  },
  'privacy-officer': {
    title: 'Designate a Privacy Officer',
    recommendation:
      'Appoint a Privacy Officer responsible for developing and enforcing privacy policies, handling patient access requests, and managing breach notifications. Document this role formally.',
    required_standard: 'Formally designated Privacy Officer with documented role',
    hipaa_citation: '45 CFR §164.530(a)',
    risk_level: 'high',
  },
  'risk-assessment-conducted': {
    title: 'Conduct Annual Security Risk Analysis',
    recommendation:
      'Schedule and complete a comprehensive Security Risk Analysis (SRA) covering all ePHI systems. Document threats, vulnerabilities, likelihood, and impact. Re-run after any significant system change.',
    required_standard: 'Annual SRA with comprehensive documentation of threats and vulnerabilities',
    hipaa_citation: '45 CFR §164.308(a)(1)(ii)(A)',
    risk_level: 'high',
  },
  'risk-management-plan': {
    title: 'Create a Risk Management Plan',
    recommendation:
      'Develop a written Risk Management Plan that prioritizes identified risks and documents mitigation strategies with owners and timelines. Review quarterly and update after each SRA.',
    required_standard: 'Written plan with prioritized risks, mitigation strategies, owners, and timelines',
    hipaa_citation: '45 CFR §164.308(a)(1)(ii)(B)',
    risk_level: 'high',
  },
  'sanction-policy': {
    title: 'Implement a Sanction Policy',
    recommendation:
      'Draft and publish a written Sanction Policy specifying disciplinary actions for HIPAA violations. Include progressive discipline steps. Train all workforce members on consequences.',
    required_standard: 'Written policy with defined disciplinary actions, communicated to all staff',
    hipaa_citation: '45 CFR §164.308(a)(1)(ii)(C)',
    risk_level: 'medium',
  },
  'information-system-activity-review': {
    title: 'Establish Activity Review Procedures',
    recommendation:
      'Implement procedures to regularly review audit logs, access reports, and security incident tracking. Define review frequency (weekly or monthly) and document findings.',
    required_standard: 'Regular review of audit logs and access reports with documented procedures',
    hipaa_citation: '45 CFR §164.308(a)(1)(ii)(D)',
    risk_level: 'medium',
  },
  'workforce-authorization': {
    title: 'Implement Workforce Access Authorization',
    recommendation:
      'Create a formal process to authorize workforce access to ePHI based on job role. Use role-based access control (RBAC) and maintain an up-to-date access list.',
    required_standard: 'Formal authorization process with role-based access controls',
    hipaa_citation: '45 CFR §164.308(a)(3)(ii)(A)',
    risk_level: 'medium',
  },
  'workforce-supervision': {
    title: 'Establish Workforce Supervision Procedures',
    recommendation:
      'Document procedures for supervising workforce members who access ePHI. Include monitoring mechanisms and escalation procedures for policy violations.',
    required_standard: 'Documented supervision procedures with monitoring mechanisms',
    hipaa_citation: '45 CFR §164.308(a)(3)(ii)(B)',
    risk_level: 'medium',
  },
  'workforce-clearance': {
    title: 'Implement Workforce Clearance Procedures',
    recommendation:
      'Establish background check and clearance procedures appropriate to the level of ePHI access each role requires. Document the clearance process and maintain records.',
    required_standard: 'Documented clearance procedures proportional to ePHI access level',
    hipaa_citation: '45 CFR §164.308(a)(3)(ii)(C)',
    risk_level: 'low',
  },
  'workforce-termination': {
    title: 'Formalize Termination Procedures',
    recommendation:
      'Create a checklist-based termination procedure: revoke all ePHI system access on last day, collect devices, change shared credentials, and document completion.',
    required_standard: 'Documented checklist that revokes all access on or before the last day of employment',
    hipaa_citation: '45 CFR §164.308(a)(3)(ii)(D)',
    risk_level: 'high',
  },
  'access-control-policies': {
    title: 'Document Access Control Policies',
    recommendation:
      'Write access control policies defining minimum necessary access, role-based permissions, and procedures for requesting and revoking access. Review annually.',
    required_standard: 'Written policies covering minimum necessary access and role-based permissions',
    hipaa_citation: '45 CFR §164.308(a)(4)(ii)(A)',
    risk_level: 'medium',
  },
  'access-authorization': {
    title: 'Implement Access Authorization Procedures',
    recommendation:
      'Create formal procedures for granting access to ePHI systems. Require manager or security officer approval. Log all access grants.',
    required_standard: 'Formal approval workflow for ePHI access with documented logs',
    hipaa_citation: '45 CFR §164.308(a)(4)(ii)(B)',
    risk_level: 'medium',
  },
  'access-termination': {
    title: 'Automate Access Termination',
    recommendation:
      'Implement automatic or same-day revocation of ePHI access when employment ends or role changes. Conduct quarterly access reviews to catch stale accounts.',
    required_standard: 'Immediate access revocation on termination with quarterly access reviews',
    hipaa_citation: '45 CFR §164.308(a)(4)(ii)(C)',
    risk_level: 'medium',
  },
  'security-awareness-training': {
    title: 'Establish Security Awareness Training Program',
    recommendation:
      'Create an annual security awareness training program covering phishing, password security, and HIPAA basics. Track completion and maintain records for 6 years.',
    required_standard: 'Annual training for all workforce members with completion tracking',
    hipaa_citation: '45 CFR §164.308(a)(5)(i)',
    risk_level: 'medium',
  },
  'initial-hipaa-training': {
    title: 'Require Initial HIPAA Training for New Hires',
    recommendation:
      'Deliver HIPAA training to all new workforce members within 30 days of hire. Include role-specific training for staff who handle ePHI. Document and retain completion records.',
    required_standard: 'HIPAA training completed within 30 days of hire with retained records',
    hipaa_citation: '45 CFR §164.308(a)(5)(ii)(A)',
    risk_level: 'medium',
  },
  'annual-hipaa-training': {
    title: 'Implement Annual HIPAA Refresher Training',
    recommendation:
      'Schedule annual HIPAA refresher training for all staff. Update content when regulations or organizational policies change. Maintain training logs for 6 years.',
    required_standard: 'Annual refresher training with updated content and retained records',
    hipaa_citation: '45 CFR §164.308(a)(5)(ii)(A)',
    risk_level: 'low',
  },
  'role-specific-training': {
    title: 'Add Role-Specific HIPAA Training',
    recommendation:
      'Supplement general HIPAA training with role-specific modules for clinical staff, IT, billing, and administrative roles. Document completion separately.',
    required_standard: 'Role-specific training modules for all workforce roles with ePHI access',
    hipaa_citation: '45 CFR §164.308(a)(5)(ii)(B)',
    risk_level: 'low',
  },
  'incident-reporting-training': {
    title: 'Train Staff on Incident Reporting',
    recommendation:
      'Ensure all workforce members know how and to whom to report suspected security incidents or unauthorized access. Include incident reporting in annual training.',
    required_standard: 'All staff trained on incident reporting procedures with clear escalation contacts',
    hipaa_citation: '45 CFR §164.308(a)(5)(ii)(C)',
    risk_level: 'medium',
  },
  'incident-response-plan': {
    title: 'Create Incident Response Plan',
    recommendation:
      'Develop a written Incident Response Plan with defined roles, communication procedures, containment steps, and post-incident review. Test the plan annually via tabletop exercises.',
    required_standard: 'Written plan with defined roles, containment steps, and annual testing',
    hipaa_citation: '45 CFR §164.308(a)(6)(i)',
    risk_level: 'high',
  },
  'incident-detection-analysis': {
    title: 'Implement Incident Detection Capabilities',
    recommendation:
      'Deploy logging, alerting, and monitoring tools to detect potential security incidents. Define what constitutes a reportable incident and document detection procedures.',
    required_standard: 'Active monitoring with defined incident detection and classification procedures',
    hipaa_citation: '45 CFR §164.308(a)(6)(ii)',
    risk_level: 'high',
  },
  'breach-notification-procedures': {
    title: 'Document Breach Notification Procedures',
    recommendation:
      'Create step-by-step procedures for notifying affected patients (within 60 days), HHS OCR, and media (if 500+ in state) following a breach. Assign an owner for each notification type.',
    required_standard: 'Documented procedures for patient, HHS, and media notification within HIPAA timelines',
    hipaa_citation: '45 CFR §164.404, §164.405, §164.406',
    risk_level: 'high',
  },
  'incident-mitigation-recovery': {
    title: 'Define Incident Mitigation and Recovery',
    recommendation:
      'Document procedures to contain, eradicate, and recover from security incidents. Include rollback steps, evidence preservation, and lessons-learned review.',
    required_standard: 'Documented containment, eradication, and recovery procedures',
    hipaa_citation: '45 CFR §164.308(a)(6)(ii)',
    risk_level: 'medium',
  },
  'business-associates': {
    title: 'Execute BAAs with All Business Associates',
    recommendation:
      'Identify every vendor with access to ePHI. Execute a HIPAA-compliant Business Associate Agreement (BAA) with each one before sharing ePHI. Maintain a vendor inventory.',
    required_standard: 'Signed BAAs with all vendors who access, store, or transmit ePHI',
    hipaa_citation: '45 CFR §164.308(b)(1)',
    risk_level: 'high',
  },
  'baa-monitoring': {
    title: 'Monitor Business Associate Compliance',
    recommendation:
      'Establish procedures to monitor BA compliance: review BAA terms annually, request security attestations, and investigate reported incidents from BAs.',
    required_standard: 'Annual BAA review and BA compliance monitoring procedures',
    hipaa_citation: '45 CFR §164.308(b)(2)',
    risk_level: 'medium',
  },
  'baa-breach-notification': {
    title: 'Require BA Breach Notification in BAAs',
    recommendation:
      'Ensure all BAAs contractually require BAs to notify you of breaches within 60 days. Review existing BAAs and update any missing this clause.',
    required_standard: 'BAAs include contractual breach notification requirements within 60 days',
    hipaa_citation: '45 CFR §164.308(b)(1)(ii)',
    risk_level: 'high',
  },
  'contingency-plan': {
    title: 'Develop a Contingency Plan',
    recommendation:
      'Create a formal Contingency Plan covering data backup, disaster recovery, emergency operations, testing, and applications criticality analysis. Review and test annually.',
    required_standard: 'Written plan covering backup, recovery, emergency ops, and application criticality',
    hipaa_citation: '45 CFR §164.308(a)(7)(i)',
    risk_level: 'medium',
  },
  'data-backup-procedures': {
    title: 'Implement Automated Data Backup',
    recommendation:
      'Configure automated, encrypted daily backups of all ePHI. Test restores quarterly. Store backups off-site or in a separate cloud region. Document the backup schedule.',
    required_standard: 'Automated encrypted backups with quarterly restore tests and off-site storage',
    hipaa_citation: '45 CFR §164.308(a)(7)(ii)(A)',
    risk_level: 'high',
  },
  'disaster-recovery-testing': {
    title: 'Test Disaster Recovery Plan',
    recommendation:
      'Conduct annual disaster recovery tabletop exercises or full tests. Document recovery time objectives (RTO) and recovery point objectives (RPO). Update the plan after each test.',
    required_standard: 'Annual DR tests with documented RTO/RPO and plan updates',
    hipaa_citation: '45 CFR §164.308(a)(7)(ii)(B)',
    risk_level: 'medium',
  },
  'privacy-policy': {
    title: 'Publish and Maintain Privacy Notices',
    recommendation:
      'Create and post a Notice of Privacy Practices (NPP) in your facility and on your website. Provide it to all new patients. Update when policies change.',
    required_standard: 'Current NPP posted, provided to patients, and updated when policies change',
    hipaa_citation: '45 CFR §164.520',
    risk_level: 'high',
  },
  'breach-history': {
    title: 'Document All Past Breaches',
    recommendation:
      'Maintain a written log of all past security incidents and breaches. Ensure historical breaches were properly reported to HHS. Use findings to improve controls.',
    required_standard: 'Complete breach log with proper HHS reporting for all historical breaches',
    hipaa_citation: '45 CFR §164.414',
    risk_level: 'high',
  },

  // ── Physical Safeguards ──────────────────────────────────────────────────

  'facility-access-policies': {
    title: 'Document Facility Access Policies',
    recommendation:
      'Create written policies controlling physical access to areas containing ePHI systems. Define who may enter, under what conditions, and how access is logged.',
    required_standard: 'Written policies with controlled access, visitor logs, and key/badge management',
    hipaa_citation: '45 CFR §164.310(a)(1)',
    risk_level: 'medium',
  },
  'facility-security-plan': {
    title: 'Implement Facility Security Plan',
    recommendation:
      'Document safeguards to prevent unauthorized physical access to ePHI: badge readers, visitor logs, locked server rooms, alarm systems. Review annually.',
    required_standard: 'Documented physical security controls with annual review',
    hipaa_citation: '45 CFR §164.310(a)(2)(ii)',
    risk_level: 'medium',
  },
  'access-control-surveillance': {
    title: 'Install Access Control and Surveillance',
    recommendation:
      'Deploy badge readers or equivalent controls at ePHI-area entrances. Consider surveillance cameras for server rooms. Log all physical access events.',
    required_standard: 'Electronic or keyed access controls with access logging at ePHI locations',
    hipaa_citation: '45 CFR §164.310(a)(2)(iii)',
    risk_level: 'medium',
  },
  'workstation-use-policy': {
    title: 'Define Workstation Use Policy',
    recommendation:
      'Create a written policy specifying proper use of workstations that access ePHI: screen positioning, lock policy, prohibited uses, and clean desk requirements.',
    required_standard: 'Written workstation use policy communicated to all workforce members',
    hipaa_citation: '45 CFR §164.310(b)',
    risk_level: 'medium',
  },
  'device-inventory': {
    title: 'Maintain Device and Media Inventory',
    recommendation:
      'Create and maintain a complete inventory of all devices and media that store ePHI (workstations, laptops, USB drives, portable hard drives). Update when devices are added or removed.',
    required_standard: 'Up-to-date inventory of all ePHI-containing devices and media',
    hipaa_citation: '45 CFR §164.310(d)(1)',
    risk_level: 'medium',
  },
  'device-disposal': {
    title: 'Implement Secure Device Disposal',
    recommendation:
      'Establish procedures for secure disposal: wipe drives with DoD-standard tools, physically destroy media, or use a certified media destruction vendor. Document every disposal.',
    required_standard: 'Documented disposal procedures with certificates of destruction',
    hipaa_citation: '45 CFR §164.310(d)(2)(i)',
    risk_level: 'medium',
  },
  'device-reuse': {
    title: 'Sanitize Devices Before Reuse',
    recommendation:
      'Remove all ePHI before reassigning workstations, laptops, or other media. Document sanitization using NIST 800-88 guidelines. Verify sanitization before redeployment.',
    required_standard: 'Documented sanitization per NIST 800-88 before any device reuse',
    hipaa_citation: '45 CFR §164.310(d)(2)(ii)',
    risk_level: 'medium',
  },
  'portable-device-security': {
    title: 'Secure Portable Devices',
    recommendation:
      'Enforce encryption and remote wipe on all portable devices (laptops, tablets, phones) that access ePHI. Enroll in MDM. Define acceptable use policies.',
    required_standard: 'Encryption and remote-wipe capability on all portable ePHI devices',
    hipaa_citation: '45 CFR §164.310(d)(1)',
    risk_level: 'medium',
  },
  'environmental-controls': {
    title: 'Install Environmental Controls',
    recommendation:
      'Deploy temperature monitoring, humidity controls, and smoke/fire detection in server rooms or areas housing ePHI systems. Set up alerting for threshold violations.',
    required_standard: 'Temperature, humidity, and fire monitoring with alerting in ePHI server areas',
    hipaa_citation: '45 CFR §164.310(a)(2)(i)',
    risk_level: 'low',
  },
  'workstation-physical-security': {
    title: 'Secure Workstations Physically',
    recommendation:
      'Position workstations so screens are not visible from public areas. Use cable locks for portable workstations. Enforce screen lock after 5 minutes of inactivity.',
    required_standard: 'Screen privacy, cable locks, and automatic screen lock on all ePHI workstations',
    hipaa_citation: '45 CFR §164.310(b)',
    risk_level: 'low',
  },

  // ── Technical Safeguards ─────────────────────────────────────────────────

  'unique-user-ids': {
    title: 'Enforce Unique User IDs',
    recommendation:
      'Ensure every workforce member has a unique, personal login for all ePHI systems. Prohibit shared accounts. Audit for shared credentials immediately.',
    required_standard: 'Unique individual user accounts for all ePHI system users; no shared accounts',
    hipaa_citation: '45 CFR §164.312(a)(2)(i)',
    risk_level: 'high',
  },
  'automatic-logoff': {
    title: 'Configure Automatic Logoff',
    recommendation:
      'Set automatic session timeout on all ePHI systems to 15 minutes (5 minutes for clinical workstations). Require re-authentication after timeout. Document the policy.',
    required_standard: 'Automatic session timeout ≤15 minutes on all ePHI systems',
    hipaa_citation: '45 CFR §164.312(a)(2)(iii)',
    risk_level: 'medium',
  },
  'encryption-at-rest': {
    title: 'Encrypt ePHI at Rest',
    recommendation:
      'Enable AES-256 encryption for all ePHI stored on servers, databases, and end-user devices. Use cloud provider encryption or dedicated encryption tools. Document encryption coverage.',
    required_standard: 'AES-256 encryption for all ePHI at rest on all storage systems',
    hipaa_citation: '45 CFR §164.312(a)(2)(iv)',
    risk_level: 'high',
  },
  'encryption-in-transit': {
    title: 'Encrypt ePHI in Transit',
    recommendation:
      'Enforce TLS 1.2+ for all ePHI transmission. Disable unencrypted protocols (HTTP, FTP, SMTP). Use VPN for remote access. Verify encryption with regular TLS scans.',
    required_standard: 'TLS 1.2+ enforced for all ePHI transmission; no unencrypted channels',
    hipaa_citation: '45 CFR §164.312(e)(2)(ii)',
    risk_level: 'high',
  },
  'audit-log-configuration': {
    title: 'Configure Comprehensive Audit Logs',
    recommendation:
      'Enable audit logging on all ePHI systems: login/logout, access, modifications, and deletions. Ensure logs capture user, timestamp, action, and resource. Centralize log collection.',
    required_standard: 'Audit logs enabled on all ePHI systems capturing user, timestamp, action, and resource',
    hipaa_citation: '45 CFR §164.312(b)',
    risk_level: 'high',
  },
  'audit-log-review': {
    title: 'Regularly Review Audit Logs',
    recommendation:
      'Review audit logs at least monthly (weekly for high-risk systems). Investigate anomalies. Document reviews and retain logs per your retention policy.',
    required_standard: 'Monthly minimum audit log review with documented findings',
    hipaa_citation: '45 CFR §164.308(a)(1)(ii)(D)',
    risk_level: 'high',
  },
  'audit-log-retention': {
    title: 'Enforce Audit Log Retention Policy',
    recommendation:
      'Retain audit logs for a minimum of 6 years per HIPAA documentation requirements. Configure log rotation to archive rather than delete. Test log retrieval quarterly.',
    required_standard: 'Audit logs retained for ≥6 years with tested retrieval',
    hipaa_citation: '45 CFR §164.312(b)',
    risk_level: 'medium',
  },
  'audit-log-protection': {
    title: 'Protect Audit Log Integrity',
    recommendation:
      'Restrict write access to audit logs to system accounts only. Use immutable storage or WORM volumes. Alert on any log tampering or unexpected deletions.',
    required_standard: 'Audit logs protected from modification or deletion with tamper alerting',
    hipaa_citation: '45 CFR §164.312(b)',
    risk_level: 'medium',
  },
  'firewall-implementation': {
    title: 'Deploy and Configure Firewalls',
    recommendation:
      'Install network firewalls segmenting ePHI systems from general internet access. Define allow-list rules for required traffic only. Review firewall rules quarterly.',
    required_standard: 'Firewalls deployed with minimal allow-list rules and quarterly review',
    hipaa_citation: '45 CFR §164.312(e)(1)',
    risk_level: 'high',
  },
  'firewall-rules': {
    title: 'Review and Harden Firewall Rules',
    recommendation:
      'Audit current firewall rules. Remove any "permit any" rules. Restrict ePHI system access to necessary IP ranges and ports only. Document rule rationale.',
    required_standard: 'Minimal allow-list rules with no "permit any" and documented rationale',
    hipaa_citation: '45 CFR §164.312(e)(1)',
    risk_level: 'medium',
  },
  'multi-factor-authentication': {
    title: 'Enforce Multi-Factor Authentication',
    recommendation:
      'Enable MFA for all ePHI system access, especially remote access and admin accounts. Use authenticator apps or hardware tokens. Disable SMS-only MFA for sensitive accounts.',
    required_standard: 'MFA required for all remote ePHI access and administrative accounts',
    hipaa_citation: '45 CFR §164.312(d)',
    risk_level: 'medium',
  },
  'role-based-access-control': {
    title: 'Implement Role-Based Access Control',
    recommendation:
      'Assign ePHI access based on job function following least-privilege principles. Define roles formally. Conduct quarterly access reviews and remove unnecessary privileges.',
    required_standard: 'Least-privilege RBAC with documented role definitions and quarterly reviews',
    hipaa_citation: '45 CFR §164.312(a)(1)',
    risk_level: 'medium',
  },
  'antivirus-software': {
    title: 'Deploy Antivirus / EDR on All Endpoints',
    recommendation:
      'Install and maintain antivirus or EDR (Endpoint Detection & Response) on all workstations and servers that access ePHI. Keep definitions updated automatically. Review alerts daily.',
    required_standard: 'AV/EDR deployed on all ePHI endpoints with automatic updates',
    hipaa_citation: '45 CFR §164.308(a)(5)(ii)(B)',
    risk_level: 'medium',
  },
  'malware-scanning': {
    title: 'Perform Regular Malware Scans',
    recommendation:
      'Schedule weekly full-system malware scans on all ePHI systems. Review scan results and remediate findings within defined SLAs. Document scan history.',
    required_standard: 'Weekly scheduled scans with documented results and remediation tracking',
    hipaa_citation: '45 CFR §164.308(a)(5)(ii)(B)',
    risk_level: 'medium',
  },
  'patch-management': {
    title: 'Establish Patch Management Program',
    recommendation:
      'Implement a formal patch management program: scan for vulnerabilities monthly, patch critical CVEs within 30 days, test patches before production deployment. Document all patching.',
    required_standard: 'Critical patches applied within 30 days with documented patch testing',
    hipaa_citation: '45 CFR §164.308(a)(1)(ii)(A)',
    risk_level: 'medium',
  },
  'system-patching': {
    title: 'Keep ePHI Systems Patched',
    recommendation:
      'Apply OS and application security patches on all ePHI systems within 30 days of release (critical: 14 days). Retire or isolate systems that can no longer be patched.',
    required_standard: 'All ePHI systems patched within 30 days; critical patches within 14 days',
    hipaa_citation: '45 CFR §164.308(a)(1)(ii)(A)',
    risk_level: 'medium',
  },
  'email-security': {
    title: 'Secure Email Communications',
    recommendation:
      'Enable TLS for email transport. Implement email filtering (spam, phishing). Use secure messaging or encrypted email for sending ePHI. Train staff on phishing recognition.',
    required_standard: 'TLS-encrypted email with filtering; encrypted channels for ePHI transmission',
    hipaa_citation: '45 CFR §164.312(e)(2)(ii)',
    risk_level: 'medium',
  },
  'vpn-remote-access': {
    title: 'Require VPN for Remote ePHI Access',
    recommendation:
      'Deploy VPN for all remote access to ePHI systems. Require MFA for VPN login. Restrict remote access to known devices via device certificates. Log all remote sessions.',
    required_standard: 'VPN required for all remote ePHI access with MFA and device controls',
    hipaa_citation: '45 CFR §164.312(a)(2)(iv)',
    risk_level: 'medium',
  },
  'mobile-device-management': {
    title: 'Deploy Mobile Device Management',
    recommendation:
      'Enroll all mobile devices accessing ePHI in MDM. Enforce encryption, screen lock, and remote wipe. Define an acceptable use policy for mobile ePHI access.',
    required_standard: 'All mobile ePHI devices enrolled in MDM with encryption and remote wipe',
    hipaa_citation: '45 CFR §164.310(d)(1)',
    risk_level: 'medium',
  },
  'data-loss-prevention': {
    title: 'Implement Data Loss Prevention Controls',
    recommendation:
      'Deploy DLP tools to monitor and block unauthorized ePHI exfiltration via email, USB, or cloud uploads. Define and enforce policies on acceptable data transfer methods.',
    required_standard: 'DLP controls monitoring and blocking unauthorized ePHI transfers',
    hipaa_citation: '45 CFR §164.312(a)(1)',
    risk_level: 'medium',
  },
  'encryption-email': {
    title: 'Encrypt Emails Containing ePHI',
    recommendation:
      'Configure automatic encryption for emails containing ePHI using a secure email gateway or encrypted messaging platform. Never send unencrypted ePHI via standard email.',
    required_standard: 'All emails with ePHI automatically encrypted before transmission',
    hipaa_citation: '45 CFR §164.312(e)(2)(ii)',
    risk_level: 'high',
  },
  'secure-file-transfer': {
    title: 'Use Secure File Transfer Protocols',
    recommendation:
      'Replace FTP with SFTP or FTPS for all file transfers involving ePHI. Use HTTPS APIs with TLS 1.2+ for system integrations. Disable legacy insecure protocols.',
    required_standard: 'All file transfers use SFTP/FTPS/HTTPS; legacy insecure protocols disabled',
    hipaa_citation: '45 CFR §164.312(e)(2)(ii)',
    risk_level: 'medium',
  },
  'application-security': {
    title: 'Secure ePHI Applications',
    recommendation:
      'Conduct application security reviews of all custom software handling ePHI. Follow OWASP Top 10 guidelines. Perform annual penetration testing or code review.',
    required_standard: 'Annual security review of custom ePHI applications following OWASP guidelines',
    hipaa_citation: '45 CFR §164.312(c)(1)',
    risk_level: 'medium',
  },
  'database-security': {
    title: 'Secure ePHI Databases',
    recommendation:
      'Encrypt ePHI databases at rest. Restrict database access to application service accounts only. Enable database audit logging. Patch database engines promptly.',
    required_standard: 'Encrypted databases with restricted access, audit logging, and current patches',
    hipaa_citation: '45 CFR §164.312(a)(2)(iv)',
    risk_level: 'high',
  },
  'penetration-testing': {
    title: 'Conduct Annual Penetration Testing',
    recommendation:
      'Perform annual external and internal penetration tests on ePHI systems. Remediate critical findings within 30 days. Document test scope, findings, and remediation.',
    required_standard: 'Annual penetration tests with documented findings and 30-day critical remediation',
    hipaa_citation: '45 CFR §164.308(a)(1)(ii)(A)',
    risk_level: 'medium',
  },
  'vulnerability-scanning': {
    title: 'Implement Vulnerability Scanning',
    recommendation:
      'Run automated vulnerability scans on ePHI systems at least monthly. Prioritize and remediate findings based on CVSS score. Track remediation in a ticketing system.',
    required_standard: 'Monthly vulnerability scans with risk-based remediation tracking',
    hipaa_citation: '45 CFR §164.308(a)(1)(ii)(A)',
    risk_level: 'medium',
  },
  'backup-encryption': {
    title: 'Encrypt All ePHI Backups',
    recommendation:
      'Enable encryption on all backup storage. Use AES-256 for backup files. Manage encryption keys separately from backup data. Verify encryption on each backup job.',
    required_standard: 'All backups encrypted with AES-256 and separately managed keys',
    hipaa_citation: '45 CFR §164.312(a)(2)(iv)',
    risk_level: 'high',
  },
  'lost-stolen-device-procedures': {
    title: 'Document Lost/Stolen Device Procedures',
    recommendation:
      'Create a written procedure for lost or stolen devices: immediate remote wipe, password reset, breach assessment, and incident documentation. Train all staff to report immediately.',
    required_standard: 'Written procedure with immediate remote wipe and breach assessment steps',
    hipaa_citation: '45 CFR §164.310(d)(2)',
    risk_level: 'high',
  },

  // ── General / Policy ─────────────────────────────────────────────────────

  'security-policy-document': {
    title: 'Create Comprehensive Security Policy',
    recommendation:
      'Develop a written HIPAA Security Policy covering all required addressable and required specifications. Review and update annually or after significant changes.',
    required_standard: 'Written Security Policy reviewed annually covering all HIPAA Security Rule requirements',
    hipaa_citation: '45 CFR §164.316(a)',
    risk_level: 'high',
  },
  'policy-review-update': {
    title: 'Establish Policy Review Schedule',
    recommendation:
      'Create a formal policy review calendar. Review all HIPAA policies at least annually. Document reviews and update policies when regulatory or operational changes occur.',
    required_standard: 'Annual policy review documented with update history',
    hipaa_citation: '45 CFR §164.316(b)(1)(ii)',
    risk_level: 'low',
  },
  'phi-disclosure-logging': {
    title: 'Log All PHI Disclosures',
    recommendation:
      'Maintain an accounting of disclosures for all PHI released. Log who received it, what was disclosed, when, and for what purpose. Provide accounting to patients on request.',
    required_standard: 'Complete disclosure log available for patient requests covering the prior 6 years',
    hipaa_citation: '45 CFR §164.528',
    risk_level: 'medium',
  },
  'minimum-necessary-policy': {
    title: 'Enforce Minimum Necessary Standard',
    recommendation:
      'Document and enforce minimum necessary access policies: only share the minimum PHI required for each task. Train all workforce on minimum necessary principles.',
    required_standard: 'Documented minimum necessary policies with workforce training and enforcement',
    hipaa_citation: '45 CFR §164.502(b)',
    risk_level: 'medium',
  },
  'patient-complaint-procedures': {
    title: 'Implement Patient Complaint Process',
    recommendation:
      'Create a documented process for receiving and resolving patient privacy complaints. Designate a contact person. Track and document all complaints and resolutions.',
    required_standard: 'Documented complaint process with designated contact and resolution tracking',
    hipaa_citation: '45 CFR §164.530(d)',
    risk_level: 'low',
  },
  'compliance-officer-designation': {
    title: 'Designate a Compliance Officer',
    recommendation:
      'Formally designate an individual responsible for overall HIPAA compliance program management. Document the role and ensure they have sufficient authority and resources.',
    required_standard: 'Formally designated Compliance Officer with documented authority',
    hipaa_citation: '45 CFR §164.530(a)',
    risk_level: 'medium',
  },
  'ongoing-compliance-monitoring': {
    title: 'Establish Ongoing Compliance Monitoring',
    recommendation:
      'Implement periodic internal audits of HIPAA compliance (at least annually). Track findings in an issue register. Report compliance status to leadership quarterly.',
    required_standard: 'Annual internal audits with tracked findings and quarterly leadership reporting',
    hipaa_citation: '45 CFR §164.308(a)(1)(ii)(D)',
    risk_level: 'medium',
  },

  // Fallback for unmapped question IDs
  '_default': {
    title: 'Address Identified Gap',
    recommendation:
      'Review the identified compliance gap and implement appropriate controls. Consult the HIPAA Security Rule guidance for the relevant standard.',
    required_standard: 'Full compliance with applicable HIPAA standard',
    hipaa_citation: '45 CFR §164.300 et seq.',
    risk_level: 'medium',
  },
};

/** Returns the remediation for a question ID, falling back to _default */
export function getRemediation(questionId: string): Remediation {
  return REMEDIATIONS[questionId] ?? REMEDIATIONS['_default'];
}
