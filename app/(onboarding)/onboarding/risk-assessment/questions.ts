/**
 * HIPAA Security Risk Assessment Questions
 * 
 * Based on: HIPAA Security Risk Assessment (SRA) Questionnaire v2.0
 * Enterprise-Grade, Audit-Ready, OCR-Defensible
 * 
 * Questions organized by HIPAA Security Rule categories:
 * - Administrative Safeguards (45 CFR §164.308)
 * - Physical Safeguards (45 CFR §164.310)
 * - Technical Safeguards (45 CFR §164.312)
 * 
 * Each question includes:
 * - Question ID for tracking
 * - HIPAA Rule citation
 * - Risk domain (Confidentiality, Integrity, Availability)
 * - Severity weight (1-5, where 5 = OCR fine-level risk)
 * - Answer options with numeric risk scores (0-5)
 * - Help text explaining why OCR cares
 */

export interface Question {
  id: string;
  category: 'administrative' | 'physical' | 'technical';
  categoryLabel: string;
  text: string;
  options: { value: string; label: string; riskScore: number }[];
  skipIf?: { questionId: string; answer: string };
  helpText?: string;
  hipaaCitation?: string;
  severityWeight?: number;
}

export const QUESTIONS: Question[] = [
  // ============================================================================
  // SECTION 1: ADMINISTRATIVE SAFEGUARDS (45 CFR §164.308)
  // ============================================================================

  // 1.1 Security Management Program
  {
    id: 'security-officer',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Has your organization formally designated a Security Officer with documented responsibility for developing, implementing, and maintaining HIPAA security policies and procedures?',
    options: [
      { value: 'yes', label: 'Yes, formally designated with documented role, responsibilities, and authority', riskScore: 0 },
      { value: 'informal', label: 'Yes, designated but responsibilities are informal or not fully documented', riskScore: 2 },
      { value: 'no', label: 'No designated Security Officer, or role is unclear and undocumented', riskScore: 5 }
    ],
    helpText: 'The OCR requires a single point of accountability for HIPAA compliance. Without a designated Security Officer, there is no clear responsibility for implementing, monitoring, and enforcing security controls. This is a foundational requirement that OCR auditors verify immediately. Lack of a Security Officer is a critical finding that can result in fines of $100–$50,000 per violation.',
    hipaaCitation: '45 CFR §164.308(a)(2)',
    severityWeight: 5
  },
  {
    id: 'privacy-officer',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Has your organization formally designated a Privacy Officer responsible for developing and implementing privacy policies, handling patient requests, and managing breach notifications?',
    options: [
      { value: 'yes', label: 'Yes, formally designated with documented role and responsibilities', riskScore: 0 },
      { value: 'informal', label: 'Yes, designated but responsibilities are informal or not fully documented', riskScore: 2 },
      { value: 'no', label: 'No designated Privacy Officer, or role is unclear and undocumented', riskScore: 5 }
    ],
    helpText: 'The Privacy Officer is the primary contact for patient privacy rights, access requests, and breach notifications. OCR auditors verify that this role exists and has the authority to enforce privacy policies. Absence of a Privacy Officer is a critical finding.',
    hipaaCitation: '45 CFR §164.530(a)',
    severityWeight: 5
  },
  {
    id: 'risk-assessment-conducted',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization conduct a comprehensive Security Risk Analysis at least annually, or more frequently if significant system changes occur?',
    options: [
      { value: 'yes-current', label: 'Yes, formal SRA conducted annually or after significant changes with comprehensive documentation', riskScore: 0 },
      { value: 'yes-old', label: 'SRA conducted but not annually, or documentation is incomplete. Last SRA is over 12 months old', riskScore: 3 },
      { value: 'no', label: 'No formal SRA conducted, or SRA is significantly outdated (>2 years)', riskScore: 5 }
    ],
    helpText: 'The SRA is the cornerstone of HIPAA compliance. OCR auditors expect to see evidence of a documented, comprehensive assessment of threats and vulnerabilities. Failure to conduct an SRA or failure to update it annually is a critical violation that demonstrates lack of security management. OCR fines for this violation range from $100–$50,000 per violation.',
    hipaaCitation: '45 CFR §164.308(a)(1)(ii)(A)',
    severityWeight: 5
  },
  {
    id: 'risk-management-plan',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization have a documented Risk Management Plan that addresses identified vulnerabilities and specifies remediation timelines and responsible parties?',
    options: [
      { value: 'yes', label: 'Yes, documented plan with specific remediation actions, timelines, responsible parties, and tracking mechanism', riskScore: 0 },
      { value: 'partial', label: 'Plan exists but is incomplete, lacks specific timelines, or tracking is informal', riskScore: 2 },
      { value: 'no', label: 'No documented plan, or plan does not address identified risks', riskScore: 5 }
    ],
    helpText: 'Identifying risks is only half the battle. OCR expects organizations to have a formal plan to remediate identified vulnerabilities. Without a documented plan, the SRA becomes meaningless. This is a critical finding.',
    hipaaCitation: '45 CFR §164.308(a)(1)(ii)(B)',
    severityWeight: 5
  },
  {
    id: 'sanction-policy',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization have a documented Sanction Policy that specifies disciplinary actions for workforce members who violate HIPAA security and privacy policies?',
    options: [
      { value: 'yes', label: 'Yes, documented policy with progressive discipline (warning, suspension, termination). Policy is communicated to all staff', riskScore: 0 },
      { value: 'partial', label: 'Policy exists but is informal or not consistently applied. Not all staff are aware of policy', riskScore: 2 },
      { value: 'no', label: 'No documented sanction policy, or policy is not enforced', riskScore: 4 }
    ],
    helpText: 'Without enforcement mechanisms, security policies are meaningless. OCR expects organizations to demonstrate that they hold employees accountable for violations. Lack of a sanction policy suggests that the organization does not take security seriously.',
    hipaaCitation: '45 CFR §164.308(a)(1)(ii)(C)',
    severityWeight: 4
  },
  {
    id: 'information-system-activity-review',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization regularly review information system activity (audit logs, access reports, system events) to identify and investigate unauthorized access or security incidents?',
    options: [
      { value: 'yes-regular', label: 'Yes, formal process for reviewing logs at least monthly. Unauthorized access is investigated and documented', riskScore: 0 },
      { value: 'yes-occasional', label: 'Logs are reviewed but not regularly, or review is not documented. Investigation process is informal', riskScore: 2 },
      { value: 'no', label: 'No regular log review, or logs are not maintained', riskScore: 5 }
    ],
    helpText: 'Log review is critical for detecting unauthorized access and insider threats. OCR auditors expect to see evidence of active monitoring and investigation. Failure to review logs is a critical finding that suggests the organization cannot detect breaches.',
    hipaaCitation: '45 CFR §164.308(a)(1)(ii)(D)',
    severityWeight: 4
  },

  // 1.2 Workforce Security
  {
    id: 'workforce-authorization',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization have documented procedures for authorizing workforce members to access PHI based on their job function and the principle of minimum necessary access?',
    options: [
      { value: 'yes', label: 'Yes, documented procedures with role-based access control (RBAC). Access is granted based on job function and minimum necessary principle', riskScore: 0 },
      { value: 'partial', label: 'Procedures exist but are informal or not consistently applied. Some users have excessive access', riskScore: 2 },
      { value: 'no', label: 'No documented procedures. Access is granted ad hoc without consideration of job function', riskScore: 5 }
    ],
    helpText: 'The principle of minimum necessary access is fundamental to HIPAA. OCR expects organizations to limit access to PHI based on job function. Failure to enforce this principle is a critical finding that can result in unauthorized access and breaches.',
    hipaaCitation: '45 CFR §164.308(a)(3)(ii)(A)',
    severityWeight: 4
  },
  {
    id: 'workforce-supervision',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization have procedures to supervise workforce members and monitor their access to PHI to ensure compliance with security policies?',
    options: [
      { value: 'yes', label: 'Yes, formal supervision procedures with regular monitoring of access logs and user activity. Anomalies are investigated', riskScore: 0 },
      { value: 'partial', label: 'Supervision is informal or inconsistent. Monitoring is not regular or not documented', riskScore: 2 },
      { value: 'no', label: 'No supervision procedures or monitoring', riskScore: 5 }
    ],
    helpText: 'Supervision and monitoring are critical for detecting insider threats and unauthorized access. OCR auditors expect to see evidence of active oversight. Lack of supervision is a critical finding.',
    hipaaCitation: '45 CFR §164.308(a)(3)(ii)(B)',
    severityWeight: 4
  },
  {
    id: 'workforce-clearance',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization conduct background checks or other clearance procedures before granting workforce members access to PHI?',
    options: [
      { value: 'yes-all', label: 'Yes, background checks conducted for all staff with PHI access. Process is documented and consistent', riskScore: 0 },
      { value: 'yes-some', label: 'Background checks conducted for some positions but not all. Process is inconsistent', riskScore: 2 },
      { value: 'no', label: 'No background checks conducted', riskScore: 3 }
    ],
    helpText: 'Background checks help identify individuals with a history of dishonesty or criminal activity. While not explicitly required by HIPAA, OCR expects organizations to have some vetting process. Lack of background checks suggests inadequate workforce security.',
    hipaaCitation: '45 CFR §164.308(a)(3)(ii)(C)',
    severityWeight: 3
  },
  {
    id: 'workforce-termination',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization have documented procedures for promptly revoking access to PHI when workforce members are terminated or change roles?',
    options: [
      { value: 'yes', label: 'Yes, formal procedures with immediate access revocation upon termination. Process is documented and tracked', riskScore: 0 },
      { value: 'partial', label: 'Procedures exist but access revocation is delayed or inconsistent. Not all systems are updated promptly', riskScore: 2 },
      { value: 'no', label: 'No procedures. Access is not revoked promptly, or former employees retain access', riskScore: 5 }
    ],
    helpText: 'Former employees with access to PHI are a major breach risk. OCR auditors specifically look for evidence that access is revoked immediately upon termination. Failure to revoke access is a critical finding that can result in significant fines, especially if a breach occurs.',
    hipaaCitation: '45 CFR §164.308(a)(3)(ii)(D)',
    severityWeight: 5
  },

  // 1.3 Information Access Management
  {
    id: 'access-control-policies',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization have documented policies that define who can access PHI, under what circumstances, and what level of access is permitted?',
    options: [
      { value: 'yes', label: 'Yes, comprehensive policies with role-based access control (RBAC) and clear access levels', riskScore: 0 },
      { value: 'partial', label: 'Policies exist but are incomplete or not consistently applied', riskScore: 2 },
      { value: 'no', label: 'No documented policies', riskScore: 5 }
    ],
    helpText: 'Access control policies are the foundation of information security. OCR expects organizations to have clear, documented policies that define who can access what. Lack of policies is a critical finding.',
    hipaaCitation: '45 CFR §164.308(a)(4)(ii)(A)',
    severityWeight: 4
  },
  {
    id: 'access-authorization',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization have procedures to authorize and supervise access to PHI, including procedures for granting, modifying, and revoking access?',
    options: [
      { value: 'yes', label: 'Yes, formal procedures with documented approval process. Access changes are tracked and audited', riskScore: 0 },
      { value: 'partial', label: 'Procedures exist but are informal or not consistently followed. Tracking is incomplete', riskScore: 2 },
      { value: 'no', label: 'No procedures. Access is granted ad hoc without approval or tracking', riskScore: 5 }
    ],
    helpText: 'Access authorization is critical for preventing unauthorized access. OCR auditors expect to see evidence of a formal approval process and tracking mechanism. Lack of procedures is a critical finding.',
    hipaaCitation: '45 CFR §164.308(a)(4)(ii)(B)',
    severityWeight: 4
  },
  {
    id: 'access-termination',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization have procedures to promptly terminate or modify access to PHI when it is no longer needed for job function?',
    options: [
      { value: 'yes', label: 'Yes, formal procedures with prompt termination upon role change or termination', riskScore: 0 },
      { value: 'partial', label: 'Procedures exist but termination is delayed or inconsistent', riskScore: 2 },
      { value: 'no', label: 'No procedures. Access is not terminated promptly', riskScore: 5 }
    ],
    helpText: 'Timely access termination is critical for preventing unauthorized access. OCR auditors expect to see evidence of prompt action. Failure to terminate access is a critical finding.',
    hipaaCitation: '45 CFR §164.308(a)(4)(ii)(C)',
    severityWeight: 4
  },

  // 1.4 Security Awareness and Training
  {
    id: 'security-awareness-training',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization have a documented Security Awareness and Training Program that covers HIPAA requirements, security policies, and best practices?',
    options: [
      { value: 'yes', label: 'Yes, comprehensive program with annual training for all staff. Training covers HIPAA, policies, and best practices', riskScore: 0 },
      { value: 'partial', label: 'Training program exists but is incomplete or not annual. Not all staff are trained', riskScore: 2 },
      { value: 'no', label: 'No formal training program, or training is minimal and infrequent', riskScore: 4 }
    ],
    helpText: 'Training is critical for reducing human error and insider threats. OCR auditors expect to see evidence of a formal, documented training program with annual updates. Lack of training is a common finding in OCR audits.',
    hipaaCitation: '45 CFR §164.308(a)(5)(i)',
    severityWeight: 4
  },
  {
    id: 'initial-hipaa-training',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization require all new workforce members to complete HIPAA security and privacy training before accessing PHI?',
    options: [
      { value: 'yes', label: 'Yes, all new staff complete training before access is granted. Training is documented and tracked', riskScore: 0 },
      { value: 'partial', label: 'Training is required but not always completed before access. Documentation is incomplete', riskScore: 2 },
      { value: 'no', label: 'No requirement for initial training', riskScore: 4 }
    ],
    helpText: 'Initial training is critical for ensuring that new staff understand HIPAA requirements before accessing PHI. OCR auditors expect to see evidence of training completion. Lack of initial training is a common finding.',
    hipaaCitation: '45 CFR §164.308(a)(5)(ii)(A)',
    severityWeight: 4
  },
  {
    id: 'annual-hipaa-training',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization require all workforce members to complete annual HIPAA security and privacy training refresher?',
    options: [
      { value: 'yes', label: 'Yes, all staff complete annual refresher training. Training is documented and tracked', riskScore: 0 },
      { value: 'partial', label: 'Training is required but not all staff complete it annually. Documentation is incomplete', riskScore: 2 },
      { value: 'no', label: 'No annual refresher training required', riskScore: 3 }
    ],
    helpText: 'Annual training ensures that staff remain aware of HIPAA requirements and organizational policies. OCR auditors expect to see evidence of annual training completion. Lack of annual training is a common finding.',
    hipaaCitation: '45 CFR §164.308(a)(5)(ii)(A)',
    severityWeight: 3
  },
  {
    id: 'role-specific-training',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization provide role-specific security training for staff with elevated access or special responsibilities (e.g., IT staff, Security Officer, Privacy Officer)?',
    options: [
      { value: 'yes', label: 'Yes, role-specific training provided to all staff with elevated access. Training is documented and current', riskScore: 0 },
      { value: 'partial', label: 'Training provided to some staff but not all. Training is not regularly updated', riskScore: 2 },
      { value: 'no', label: 'No role-specific training provided', riskScore: 3 }
    ],
    helpText: 'Staff with elevated access require more specialized training to understand their security responsibilities. OCR auditors expect to see evidence of role-specific training. Lack of specialized training is a finding.',
    hipaaCitation: '45 CFR §164.308(a)(5)(ii)(B)',
    severityWeight: 3
  },
  {
    id: 'incident-reporting-training',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization train all workforce members on how to recognize and report security incidents, suspicious activity, and potential breaches?',
    options: [
      { value: 'yes', label: 'Yes, all staff trained on incident reporting procedures. Training includes examples and clear reporting channels', riskScore: 0 },
      { value: 'partial', label: 'Training provided but not comprehensive. Reporting procedures are not clear to all staff', riskScore: 2 },
      { value: 'no', label: 'No training on incident reporting', riskScore: 4 }
    ],
    helpText: 'Early detection and reporting of security incidents is critical for minimizing breach impact. OCR auditors expect to see evidence that staff know how to report incidents. Lack of training is a critical finding.',
    hipaaCitation: '45 CFR §164.308(a)(5)(ii)(C)',
    severityWeight: 4
  },

  // 1.5 Security Incident Procedures
  {
    id: 'incident-response-plan',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization have a documented Incident Response Plan that defines procedures for detecting, responding to, and reporting security incidents and breaches?',
    options: [
      { value: 'yes', label: 'Yes, comprehensive plan with defined procedures, roles, timelines, and escalation paths. Plan is tested regularly', riskScore: 0 },
      { value: 'partial', label: 'Plan exists but is incomplete or not regularly tested. Procedures are not clear', riskScore: 2 },
      { value: 'no', label: 'No incident response plan', riskScore: 5 }
    ],
    helpText: 'An incident response plan is critical for minimizing breach impact and demonstrating compliance. OCR auditors expect to see a comprehensive, tested plan. Lack of a plan is a critical finding that can result in significant fines.',
    hipaaCitation: '45 CFR §164.308(a)(6)(i)',
    severityWeight: 5
  },
  {
    id: 'incident-detection-analysis',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization have procedures to detect security incidents, analyze them to determine if they constitute a breach, and document findings?',
    options: [
      { value: 'yes', label: 'Yes, formal procedures with documented analysis process. Breach determination is made within 60 days', riskScore: 0 },
      { value: 'partial', label: 'Procedures exist but analysis is not always documented. Breach determination is delayed', riskScore: 2 },
      { value: 'no', label: 'No formal procedures. Incidents are not analyzed or documented', riskScore: 5 }
    ],
    helpText: 'Timely detection and analysis of incidents is critical for breach notification compliance. OCR auditors expect to see evidence of a formal analysis process. Failure to analyze incidents is a critical finding.',
    hipaaCitation: '45 CFR §164.308(a)(6)(ii)',
    severityWeight: 5
  },
  {
    id: 'breach-notification-procedures',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization have documented procedures for notifying affected individuals, the HHS Secretary, and the media (if applicable) of breaches within 60 days of discovery?',
    options: [
      { value: 'yes', label: 'Yes, comprehensive procedures with templates, timelines, and escalation paths. Procedures are tested', riskScore: 0 },
      { value: 'partial', label: 'Procedures exist but are incomplete or not regularly tested. Timelines are not clear', riskScore: 2 },
      { value: 'no', label: 'No procedures. Breach notification is ad hoc', riskScore: 5 }
    ],
    helpText: 'Breach notification is a mandatory requirement under the HITECH Act. OCR auditors expect to see evidence of a formal notification process. Failure to notify or delayed notification is a critical finding that can result in significant fines.',
    hipaaCitation: '45 CFR §164.404, §164.405, §164.406',
    severityWeight: 5
  },
  {
    id: 'incident-mitigation-recovery',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization have procedures to mitigate the impact of security incidents and recover systems to normal operations?',
    options: [
      { value: 'yes', label: 'Yes, formal procedures with defined mitigation steps and recovery timelines. Procedures are tested', riskScore: 0 },
      { value: 'partial', label: 'Procedures exist but are informal or not regularly tested. Recovery timelines are not defined', riskScore: 2 },
      { value: 'no', label: 'No procedures. Incident response is ad hoc', riskScore: 4 }
    ],
    helpText: 'Quick incident mitigation and recovery minimize breach impact and demonstrate organizational competence. OCR auditors expect to see evidence of a formal process. Lack of procedures is a finding.',
    hipaaCitation: '45 CFR §164.308(a)(6)(ii)',
    severityWeight: 4
  },

  // 1.6 Business Associate Management
  {
    id: 'business-associates',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization have Business Associate Agreements (BAAs) with all vendors, contractors, and service providers that create, receive, maintain, or transmit PHI?',
    options: [
      { value: 'yes-all', label: 'Yes, BAAs in place with all vendors who handle PHI. BAAs include required security obligations', riskScore: 0 },
      { value: 'yes-some', label: 'BAAs in place with some vendors but not all. Some BAAs lack required security obligations', riskScore: 3 },
      { value: 'no', label: 'No BAAs in place, or BAAs with vendors who handle PHI are missing', riskScore: 5 }
    ],
    helpText: 'BAAs are legally required for all vendors who handle PHI. OCR auditors specifically look for evidence of BAAs. Lack of BAAs is a critical finding that can result in significant fines. OCR has fined organizations $100,000+ for missing BAAs.',
    hipaaCitation: '45 CFR §164.308(b)(1)',
    severityWeight: 5
  },
  {
    id: 'baa-monitoring',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization have procedures to monitor and ensure that Business Associates comply with their BAAs and HIPAA security requirements?',
    options: [
      { value: 'yes', label: 'Yes, formal monitoring procedures with regular audits and compliance verification. Documentation is maintained', riskScore: 0 },
      { value: 'partial', label: 'Monitoring procedures exist but are informal or infrequent. Documentation is incomplete', riskScore: 2 },
      { value: 'no', label: 'No monitoring procedures. Business Associates are not regularly assessed', riskScore: 4 }
    ],
    helpText: 'Organizations are responsible for ensuring that their vendors comply with HIPAA. OCR auditors expect to see evidence of active monitoring. Lack of monitoring is a finding that can result in fines.',
    hipaaCitation: '45 CFR §164.308(b)(2)',
    severityWeight: 4
  },
  {
    id: 'baa-breach-notification',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization have procedures requiring Business Associates to notify you immediately of any security incidents or breaches involving PHI?',
    options: [
      { value: 'yes', label: 'Yes, BAAs require immediate notification. Procedures define notification process and timelines', riskScore: 0 },
      { value: 'partial', label: 'Notification requirement exists but is not clearly defined. Timelines are not specified', riskScore: 2 },
      { value: 'no', label: 'No notification requirement. Business Associates are not required to report incidents', riskScore: 5 }
    ],
    helpText: 'Organizations must be immediately notified of vendor breaches to comply with breach notification requirements. OCR auditors expect to see this requirement in BAAs. Lack of notification procedures is a critical finding.',
    hipaaCitation: '45 CFR §164.308(b)(1)(ii)',
    severityWeight: 5
  },

  // 1.7 Contingency Planning
  {
    id: 'contingency-plan',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization have a documented Contingency Plan that addresses data backup, disaster recovery, and business continuity?',
    options: [
      { value: 'yes', label: 'Yes, comprehensive plan with backup procedures, recovery timelines, and regular testing', riskScore: 0 },
      { value: 'partial', label: 'Plan exists but is incomplete or not regularly tested. Recovery timelines are not defined', riskScore: 2 },
      { value: 'no', label: 'No contingency plan', riskScore: 4 }
    ],
    helpText: 'A contingency plan is critical for ensuring business continuity and data availability. OCR auditors expect to see a comprehensive, tested plan. Lack of a plan is a finding.',
    hipaaCitation: '45 CFR §164.308(a)(7)(i)',
    severityWeight: 4
  },
  {
    id: 'data-backup-procedures',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization have documented procedures for regularly backing up all PHI, including frequency, storage location, and recovery procedures?',
    options: [
      { value: 'yes', label: 'Yes, daily or more frequent backups. Backups are stored offsite and tested regularly', riskScore: 0 },
      { value: 'partial', label: 'Backups are performed but not frequently enough. Testing is infrequent', riskScore: 2 },
      { value: 'no', label: 'No regular backups, or backups are not tested', riskScore: 5 }
    ],
    helpText: 'Regular backups are critical for data recovery and business continuity. OCR auditors expect to see evidence of frequent, tested backups. Lack of backups is a critical finding.',
    hipaaCitation: '45 CFR §164.308(a)(7)(ii)(A)',
    severityWeight: 5
  },
  {
    id: 'disaster-recovery-testing',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization regularly test its Disaster Recovery Plan to ensure that systems can be recovered and operations restored within acceptable timeframes?',
    options: [
      { value: 'yes', label: 'Yes, plan is tested at least annually. Test results are documented and recovery timelines are verified', riskScore: 0 },
      { value: 'partial', label: 'Plan is tested but not annually. Test results are not fully documented', riskScore: 2 },
      { value: 'no', label: 'Plan is not tested, or testing is infrequent', riskScore: 4 }
    ],
    helpText: 'Testing ensures that the disaster recovery plan actually works. OCR auditors expect to see evidence of regular testing. Lack of testing is a finding.',
    hipaaCitation: '45 CFR §164.308(a)(7)(ii)(B)',
    severityWeight: 4
  },
  {
    id: 'privacy-policy',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Do you provide patients with a Notice of Privacy Practices (NPP) that informs them of their rights regarding their PHI?',
    options: [
      { value: 'yes', label: 'Yes, NPP provided to all patients', riskScore: 0 },
      { value: 'no', label: 'No Notice of Privacy Practices', riskScore: 5 }
    ],
    helpText: 'The Privacy Rule requires Covered Entities to provide patients with a Notice of Privacy Practices that explains their rights and how PHI is used and disclosed.',
    hipaaCitation: '45 CFR §164.520',
    severityWeight: 5
  },
  {
    id: 'breach-history',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Have you experienced a security incident or data breach involving unsecured PHI in the past 24 months?',
    options: [
      { value: 'no', label: 'No known breaches or incidents', riskScore: 0 },
      { value: 'yes-reported', label: 'Yes, reported to HHS within 60 days and documented', riskScore: 1 },
      { value: 'yes-unreported', label: 'Yes, but not reported to HHS within 60 days', riskScore: 5 }
    ],
    helpText: 'The Breach Notification Rule requires notification to HHS within 60 days of discovery. OCR reviews breach history during audits. Unreported breaches indicate serious compliance failures.',
    hipaaCitation: '45 CFR §164.404',
    severityWeight: 5
  },
  {
    id: 'documentation-retention',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Do you maintain and retain all HIPAA compliance documentation (policies, training logs, risk analyses, BAAs, incident reports) for a minimum of 6 years?',
    options: [
      { value: 'yes', label: 'Yes, all documentation retained for 6+ years', riskScore: 0 },
      { value: 'partial', label: 'Some documentation retained, but incomplete', riskScore: 2 },
      { value: 'no', label: 'No systematic documentation retention', riskScore: 4 }
    ],
    helpText: 'HIPAA requires retention of all compliance documentation for at least 6 years. This is critical for audit preparedness.',
    hipaaCitation: '45 CFR §164.316(b)(1)',
    severityWeight: 4
  },

  // ============================================================================
  // SECTION 2: PHYSICAL SAFEGUARDS (45 CFR §164.310)
  // ============================================================================

  // 2.1 Facility Access Controls
  {
    id: 'facility-access-policies',
    category: 'physical',
    categoryLabel: 'Physical Safeguards',
    text: 'Does your organization have documented policies that define who is authorized to access facilities where PHI is stored or processed?',
    options: [
      { value: 'yes', label: 'Yes, comprehensive policies with access levels defined. Policies are documented and enforced', riskScore: 0 },
      { value: 'partial', label: 'Policies exist but are informal or not consistently enforced', riskScore: 2 },
      { value: 'no', label: 'No documented policies. Access is not controlled', riskScore: 4 }
    ],
    helpText: 'Physical access control is the first line of defense against unauthorized access to PHI. OCR auditors expect to see evidence of controlled access. Lack of policies is a finding.',
    hipaaCitation: '45 CFR §164.310(a)(1)',
    severityWeight: 4
  },
  {
    id: 'visitor-access-logging',
    category: 'physical',
    categoryLabel: 'Physical Safeguards',
    text: 'Does your organization have procedures for controlling and logging visitor access to areas where PHI is stored or processed?',
    options: [
      { value: 'yes', label: 'Yes, all visitors are logged and escorted. Access is restricted to necessary areas', riskScore: 0 },
      { value: 'partial', label: 'Visitor procedures exist but are not consistently followed. Logging is incomplete', riskScore: 2 },
      { value: 'no', label: 'No visitor control procedures. Visitors have unrestricted access', riskScore: 3 }
    ],
    helpText: 'Visitor access is a common source of unauthorized access to PHI. OCR auditors expect to see evidence of visitor control. Lack of procedures is a finding.',
    hipaaCitation: '45 CFR §164.310(a)(2)(i)',
    severityWeight: 3
  },
  {
    id: 'facility-security-plan',
    category: 'physical',
    categoryLabel: 'Physical Safeguards',
    text: 'Does your organization have a documented Facility Security Plan that addresses physical security measures, emergency procedures, and security monitoring?',
    options: [
      { value: 'yes', label: 'Yes, comprehensive plan with security measures, emergency procedures, and monitoring', riskScore: 0 },
      { value: 'partial', label: 'Plan exists but is incomplete or not regularly updated', riskScore: 2 },
      { value: 'no', label: 'No facility security plan', riskScore: 4 }
    ],
    helpText: 'A facility security plan demonstrates organizational commitment to physical security. OCR auditors expect to see a comprehensive plan. Lack of a plan is a finding.',
    hipaaCitation: '45 CFR §164.310(a)(2)(ii)',
    severityWeight: 4
  },
  {
    id: 'access-control-surveillance',
    category: 'physical',
    categoryLabel: 'Physical Safeguards',
    text: 'Does your organization use access controls (locks, badges, biometrics) and surveillance (cameras) to monitor and restrict access to areas where PHI is stored?',
    options: [
      { value: 'yes', label: 'Yes, access controls and surveillance in place for all areas with PHI. Systems are monitored', riskScore: 0 },
      { value: 'partial', label: 'Some areas have access controls or surveillance but not all. Monitoring is inconsistent', riskScore: 2 },
      { value: 'no', label: 'No access controls or surveillance', riskScore: 4 }
    ],
    helpText: 'Physical access controls and surveillance are critical for preventing unauthorized access. OCR auditors expect to see evidence of these measures. Lack of controls is a finding.',
    hipaaCitation: '45 CFR §164.310(a)(2)(i)',
    severityWeight: 4
  },

  // 2.2 Workstation Security
  {
    id: 'workstation-use-policy',
    category: 'physical',
    categoryLabel: 'Physical Safeguards',
    text: 'Does your organization have a documented Workstation Use Policy that defines authorized uses, security requirements, and user responsibilities?',
    options: [
      { value: 'yes', label: 'Yes, comprehensive policy with authorized uses, security requirements, and user responsibilities', riskScore: 0 },
      { value: 'partial', label: 'Policy exists but is incomplete or not consistently enforced', riskScore: 2 },
      { value: 'no', label: 'No workstation use policy', riskScore: 4 }
    ],
    helpText: 'A workstation use policy establishes expectations for secure use of systems. OCR auditors expect to see a documented policy. Lack of a policy is a finding.',
    hipaaCitation: '45 CFR §164.310(b)',
    severityWeight: 4
  },
  {
    id: 'workstation-security',
    category: 'physical',
    categoryLabel: 'Physical Safeguards',
    text: 'Are all workstations that access PHI physically secured to prevent unauthorized use (e.g., locked when unattended, positioned to prevent viewing)?',
    options: [
      { value: 'yes', label: 'Yes, all workstations are secured. Screens are positioned to prevent viewing. Workstations lock when unattended', riskScore: 0 },
      { value: 'partial', label: 'Some workstations are secured but not all. Security measures are inconsistent', riskScore: 2 },
      { value: 'no', label: 'Workstations are not physically secured', riskScore: 3 }
    ],
    helpText: 'Physical workstation security prevents unauthorized access and shoulder surfing. OCR auditors expect to see evidence of security measures. Lack of measures is a finding.',
    hipaaCitation: '45 CFR §164.310(b)',
    severityWeight: 3
  },
  {
    id: 'workstation-positioning',
    category: 'physical',
    categoryLabel: 'Physical Safeguards',
    text: 'Are workstations that display PHI positioned to prevent viewing by unauthorized individuals (e.g., positioned away from public areas, screens angled away from visitors)?',
    options: [
      { value: 'yes', label: 'Yes, all workstations are positioned to prevent unauthorized viewing', riskScore: 0 },
      { value: 'partial', label: 'Most workstations are positioned appropriately but some are not', riskScore: 1 },
      { value: 'no', label: 'Workstations are positioned in public areas where PHI can be viewed', riskScore: 2 }
    ],
    helpText: 'Workstation positioning prevents accidental disclosure of PHI. OCR auditors may observe this during facility tours. Poor positioning is a minor finding.',
    hipaaCitation: '45 CFR §164.310(b)',
    severityWeight: 2
  },

  // 2.3 Device and Media Controls
  {
    id: 'device-inventory',
    category: 'physical',
    categoryLabel: 'Physical Safeguards',
    text: 'Does your organization maintain an inventory of all hardware and electronic media that stores or processes PHI, including location and status?',
    options: [
      { value: 'yes', label: 'Yes, comprehensive inventory with location, status, and ownership. Inventory is regularly updated', riskScore: 0 },
      { value: 'partial', label: 'Inventory exists but is incomplete or not regularly updated', riskScore: 2 },
      { value: 'no', label: 'No inventory maintained', riskScore: 4 }
    ],
    helpText: 'Device inventory is critical for tracking PHI and preventing loss. OCR auditors expect to see a comprehensive, current inventory. Lack of inventory is a finding.',
    hipaaCitation: '45 CFR §164.310(c)(1)',
    severityWeight: 4
  },
  {
    id: 'device-disposal',
    category: 'physical',
    categoryLabel: 'Physical Safeguards',
    text: 'Does your organization have documented procedures for securely disposing of hardware and electronic media containing PHI (e.g., degaussing, physical destruction)?',
    options: [
      { value: 'yes', label: 'Yes, documented procedures using approved methods (degaussing, destruction). Disposal is verified', riskScore: 0 },
      { value: 'partial', label: 'Procedures exist but are not consistently followed. Verification is incomplete', riskScore: 2 },
      { value: 'no', label: 'No disposal procedures. Devices are discarded without secure destruction', riskScore: 4 }
    ],
    helpText: 'Improper device disposal is a common source of breaches. OCR auditors expect to see evidence of secure disposal procedures. Lack of procedures is a critical finding.',
    hipaaCitation: '45 CFR §164.310(c)(2)(i)',
    severityWeight: 4
  },
  {
    id: 'device-reuse',
    category: 'physical',
    categoryLabel: 'Physical Safeguards',
    text: 'Does your organization have procedures for securely wiping or destroying data before reusing or repurposing hardware that previously stored PHI?',
    options: [
      { value: 'yes', label: 'Yes, all data is securely wiped before reuse. Wiping is verified and documented', riskScore: 0 },
      { value: 'partial', label: 'Wiping procedures exist but are not consistently followed. Verification is incomplete', riskScore: 2 },
      { value: 'no', label: 'No wiping procedures. Devices are reused with data intact', riskScore: 4 }
    ],
    helpText: 'Reusing devices without secure data destruction is a major breach risk. OCR auditors expect to see evidence of secure wiping. Lack of procedures is a critical finding.',
    hipaaCitation: '45 CFR §164.310(c)(2)(ii)',
    severityWeight: 4
  },
  {
    id: 'portable-device-security',
    category: 'physical',
    categoryLabel: 'Physical Safeguards',
    text: 'Does your organization have procedures for securing portable devices (laptops, tablets, USB drives) that may contain PHI, including encryption and tracking?',
    options: [
      { value: 'yes', label: 'Yes, all portable devices are encrypted and tracked. Policies restrict PHI on portable devices', riskScore: 0 },
      { value: 'partial', label: 'Some devices are encrypted or tracked but not all. Policies are not consistently enforced', riskScore: 3 },
      { value: 'no', label: 'No encryption or tracking. Portable devices are not secured', riskScore: 5 }
    ],
    helpText: 'Lost or stolen portable devices are a major source of breaches. OCR auditors specifically look for encryption and tracking. Lack of controls is a critical finding that can result in significant fines.',
    hipaaCitation: '45 CFR §164.310(c)(1)',
    severityWeight: 5
  },
  {
    id: 'paper-records-storage',
    category: 'physical',
    categoryLabel: 'Physical Safeguards',
    text: 'Does your organization have procedures for securely storing paper records containing PHI (e.g., locked cabinets, restricted access)?',
    options: [
      { value: 'yes', label: 'Yes, paper records are stored in locked cabinets with restricted access', riskScore: 0 },
      { value: 'partial', label: 'Records are stored but security measures are inconsistent', riskScore: 2 },
      { value: 'no', label: 'Paper records are not securely stored', riskScore: 3 }
    ],
    helpText: 'Paper records are often overlooked but are a significant breach risk. OCR auditors expect to see evidence of secure storage. Lack of controls is a finding.',
    hipaaCitation: '45 CFR §164.310(a)(2)(i)',
    severityWeight: 3
  },
  {
    id: 'paper-records-destruction',
    category: 'physical',
    categoryLabel: 'Physical Safeguards',
    text: 'Does your organization have procedures for securely destroying paper records containing PHI (e.g., shredding, incineration)?',
    options: [
      { value: 'yes', label: 'Yes, all paper records are shredded or incinerated. Destruction is verified and documented', riskScore: 0 },
      { value: 'partial', label: 'Destruction procedures exist but are not consistently followed', riskScore: 2 },
      { value: 'no', label: 'No destruction procedures. Records are discarded without shredding', riskScore: 3 }
    ],
    helpText: 'Improper paper record destruction is a common source of breaches. OCR auditors expect to see evidence of secure destruction. Lack of procedures is a finding.',
    hipaaCitation: '45 CFR §164.310(c)(2)',
    severityWeight: 3
  },
  {
    id: 'media-disposal',
    category: 'physical',
    categoryLabel: 'Physical Safeguards',
    text: 'Do you have procedures for secure disposal of PHI (paper and electronic media)?',
    options: [
      { value: 'yes-secure', label: 'Yes, secure disposal procedures', riskScore: 0 },
      { value: 'yes-informal', label: 'Yes, but informal', riskScore: 2 },
      { value: 'no', label: 'No disposal procedures', riskScore: 5 }
    ],
    helpText: 'Secure disposal of PHI is required to prevent unauthorized access. OCR auditors expect to see documented disposal procedures.',
    hipaaCitation: '45 CFR §164.310(c)(2)',
    severityWeight: 4
  },

  // ============================================================================
  // SECTION 3: TECHNICAL SAFEGUARDS (45 CFR §164.312)
  // ============================================================================

  // 3.1 Access Control
  {
    id: 'unique-user-ids',
    category: 'technical',
    categoryLabel: 'Technical Safeguards',
    text: 'Does your organization require unique user IDs for all individuals accessing PHI systems, and prohibit shared accounts?',
    options: [
      { value: 'yes', label: 'Yes, all users have unique IDs. Shared accounts are prohibited and do not exist', riskScore: 0 },
      { value: 'partial', label: 'Most users have unique IDs but some shared accounts exist', riskScore: 3 },
      { value: 'no', label: 'Shared accounts are common. Unique IDs are not enforced', riskScore: 5 }
    ],
    helpText: 'Unique user IDs are critical for accountability and audit trails. OCR auditors specifically look for shared accounts. Shared accounts prevent attribution of actions to individuals and are a critical finding.',
    hipaaCitation: '45 CFR §164.312(a)(2)(i)',
    severityWeight: 5
  },
  {
    id: 'emergency-access',
    category: 'technical',
    categoryLabel: 'Technical Safeguards',
    text: 'Does your organization have documented procedures for emergency access to PHI systems when normal access controls cannot be used (e.g., system failure, medical emergency)?',
    options: [
      { value: 'yes', label: 'Yes, documented procedures with approval requirements and audit logging', riskScore: 0 },
      { value: 'partial', label: 'Procedures exist but are informal or not consistently followed', riskScore: 2 },
      { value: 'no', label: 'No emergency access procedures', riskScore: 3 }
    ],
    helpText: 'Emergency access procedures are necessary for patient care but must be controlled. OCR auditors expect to see documented procedures with audit trails. Lack of procedures is a finding.',
    hipaaCitation: '45 CFR §164.312(a)(2)(i)',
    severityWeight: 3
  },
  {
    id: 'automatic-logoff',
    category: 'technical',
    categoryLabel: 'Technical Safeguards',
    text: 'Does your organization configure systems to automatically log off users after a period of inactivity (e.g., 15 minutes)?',
    options: [
      { value: 'yes', label: 'Yes, all systems have automatic logoff configured (15 minutes or less)', riskScore: 0 },
      { value: 'partial', label: 'Most systems have logoff but timeout is too long (>30 minutes) or not all systems are configured', riskScore: 2 },
      { value: 'no', label: 'No automatic logoff. Users remain logged in indefinitely', riskScore: 4 }
    ],
    helpText: 'Automatic logoff prevents unauthorized access to unattended workstations. OCR auditors expect to see this control implemented. Lack of logoff is a finding.',
    hipaaCitation: '45 CFR §164.312(a)(2)(i)',
    severityWeight: 4
  },
  {
    id: 'session-timeout',
    category: 'technical',
    categoryLabel: 'Technical Safeguards',
    text: 'Does your organization require users to re-authenticate after session timeout or when accessing sensitive functions?',
    options: [
      { value: 'yes', label: 'Yes, re-authentication is required after timeout or for sensitive functions', riskScore: 0 },
      { value: 'partial', label: 'Re-authentication is required for some functions but not all', riskScore: 2 },
      { value: 'no', label: 'No re-authentication required', riskScore: 3 }
    ],
    helpText: 'Re-authentication adds an additional layer of security. OCR auditors expect to see this control for sensitive functions. Lack of re-authentication is a finding.',
    hipaaCitation: '45 CFR §164.312(a)(2)(i)',
    severityWeight: 3
  },

  // 3.2 Audit Controls
  {
    id: 'audit-log-configuration',
    category: 'technical',
    categoryLabel: 'Technical Safeguards',
    text: 'Does your organization configure systems to generate comprehensive audit logs that record all access to PHI, including who, what, when, and where?',
    options: [
      { value: 'yes', label: 'Yes, comprehensive logging of all PHI access. Logs include user, action, timestamp, and resource', riskScore: 0 },
      { value: 'partial', label: 'Logging is configured but is incomplete or does not capture all required information', riskScore: 2 },
      { value: 'no', label: 'No audit logging or logging is minimal', riskScore: 5 }
    ],
    helpText: 'Audit logs are critical for detecting unauthorized access and investigating breaches. OCR auditors expect to see comprehensive logging. Lack of logging is a critical finding.',
    hipaaCitation: '45 CFR §164.312(b)',
    severityWeight: 5
  },
  {
    id: 'audit-log-retention',
    category: 'technical',
    categoryLabel: 'Technical Safeguards',
    text: 'Does your organization retain audit logs for a minimum of six (6) years as required by HIPAA?',
    options: [
      { value: 'yes', label: 'Yes, all audit logs are retained for at least 6 years', riskScore: 0 },
      { value: 'partial', label: 'Logs are retained but retention period is less than 6 years', riskScore: 2 },
      { value: 'no', label: 'Logs are not retained or retention period is very short', riskScore: 4 }
    ],
    helpText: 'Six-year retention is a HIPAA requirement. OCR auditors verify retention periods. Failure to retain logs is a finding.',
    hipaaCitation: '45 CFR §164.316(b)(1)',
    severityWeight: 4
  },
  {
    id: 'audit-log-review',
    category: 'technical',
    categoryLabel: 'Technical Safeguards',
    text: 'Does your organization regularly review and analyze audit logs to identify unauthorized access, suspicious activity, or security incidents?',
    options: [
      { value: 'yes', label: 'Yes, logs are reviewed at least monthly. Unauthorized access is investigated and documented', riskScore: 0 },
      { value: 'partial', label: 'Logs are reviewed but not regularly. Investigation is not always documented', riskScore: 2 },
      { value: 'no', label: 'Logs are not reviewed or review is very infrequent', riskScore: 5 }
    ],
    helpText: 'Log review is critical for detecting breaches. OCR auditors expect to see evidence of regular review and investigation. Lack of review is a critical finding.',
    hipaaCitation: '45 CFR §164.312(b)',
    severityWeight: 5
  },
  {
    id: 'audit-log-protection',
    category: 'technical',
    categoryLabel: 'Technical Safeguards',
    text: 'Does your organization protect audit logs from unauthorized access, modification, or deletion (e.g., read-only storage, separate system)?',
    options: [
      { value: 'yes', label: 'Yes, logs are stored in read-only format or on separate system. Access is restricted', riskScore: 0 },
      { value: 'partial', label: 'Logs are protected but protection is not comprehensive', riskScore: 2 },
      { value: 'no', label: 'Logs are not protected. Users can modify or delete logs', riskScore: 4 }
    ],
    helpText: 'Unprotected logs can be tampered with to cover up unauthorized access. OCR auditors expect to see evidence of log protection. Lack of protection is a finding.',
    hipaaCitation: '45 CFR §164.312(b)',
    severityWeight: 4
  },

  // 3.3 Integrity Controls
  {
    id: 'data-integrity-verification',
    category: 'technical',
    categoryLabel: 'Technical Safeguards',
    text: 'Does your organization implement controls to verify that PHI has not been improperly altered or destroyed (e.g., checksums, digital signatures, version control)?',
    options: [
      { value: 'yes', label: 'Yes, integrity controls are implemented for critical data', riskScore: 0 },
      { value: 'partial', label: 'Some integrity controls are in place but not comprehensive', riskScore: 2 },
      { value: 'no', label: 'No integrity controls. Data alterations cannot be detected', riskScore: 3 }
    ],
    helpText: 'Integrity controls detect unauthorized modification of PHI. OCR auditors expect to see evidence of controls. Lack of controls is a finding.',
    hipaaCitation: '45 CFR §164.312(c)(1)',
    severityWeight: 3
  },

  // 3.4 Encryption and Transmission Security
  {
    id: 'encryption-at-rest',
    category: 'technical',
    categoryLabel: 'Technical Safeguards',
    text: 'Does your organization encrypt all ePHI when stored on servers, databases, and storage devices using industry-standard encryption (AES-256 or equivalent)?',
    options: [
      { value: 'yes-all', label: 'Yes, all ePHI is encrypted at rest using AES-256 or equivalent', riskScore: 0 },
      { value: 'yes-some', label: 'Most ePHI is encrypted but some data is not. Encryption strength may be weak', riskScore: 3 },
      { value: 'no', label: 'No encryption at rest. ePHI is stored in plaintext', riskScore: 5 }
    ],
    helpText: 'Encryption at rest is the most effective control for protecting stored PHI. OCR auditors specifically look for this control. Lack of encryption is a critical finding that can result in significant fines.',
    hipaaCitation: '45 CFR §164.312(a)(2)(ii)',
    severityWeight: 5
  },
  {
    id: 'encryption-in-transit',
    category: 'technical',
    categoryLabel: 'Technical Safeguards',
    text: 'Does your organization encrypt all ePHI when transmitted over networks (email, internet, cloud) using industry-standard encryption (TLS 1.2+ or equivalent)?',
    options: [
      { value: 'yes-all', label: 'Yes, all ePHI is encrypted in transit using TLS 1.2+ or equivalent', riskScore: 0 },
      { value: 'yes-some', label: 'Most ePHI is encrypted but some transmissions are not. Encryption may be weak', riskScore: 3 },
      { value: 'no', label: 'No encryption in transit. ePHI is transmitted in plaintext', riskScore: 5 }
    ],
    helpText: 'Encryption in transit is critical for protecting ePHI during transmission. OCR auditors specifically look for this control. Lack of encryption is a critical finding.',
    hipaaCitation: '45 CFR §164.312(c)(2)',
    severityWeight: 5
  },
  {
    id: 'email-security',
    category: 'technical',
    categoryLabel: 'Technical Safeguards',
    text: 'Does your organization use encrypted email or secure messaging when sending PHI to patients or other providers?',
    options: [
      { value: 'yes-always', label: 'Yes, all PHI emails are encrypted or sent via secure messaging', riskScore: 0 },
      { value: 'yes-sometimes', label: 'Most PHI emails are encrypted but some are not', riskScore: 2 },
      { value: 'no', label: 'PHI is sent via unencrypted email', riskScore: 4 }
    ],
    helpText: 'Unencrypted email is a common source of breaches. OCR auditors expect to see evidence of encrypted email. Lack of encryption is a finding.',
    hipaaCitation: '45 CFR §164.312(c)(2)',
    severityWeight: 4
  },
  {
    id: 'vpn-remote-access',
    category: 'technical',
    categoryLabel: 'Technical Safeguards',
    text: 'Does your organization require VPN (Virtual Private Network) for all remote access to PHI systems?',
    options: [
      { value: 'yes', label: 'Yes, VPN is required for all remote access. VPN uses strong encryption', riskScore: 0 },
      { value: 'partial', label: 'VPN is required but not consistently enforced. Encryption may be weak', riskScore: 2 },
      { value: 'no', label: 'No VPN requirement. Remote access is not encrypted', riskScore: 4 }
    ],
    helpText: 'VPN protects remote access from interception. OCR auditors expect to see VPN requirements for remote access. Lack of VPN is a finding.',
    hipaaCitation: '45 CFR §164.312(a)(2)(ii)',
    severityWeight: 4
  },

  // 3.5 Access Controls and Authentication
  {
    id: 'multi-factor-authentication',
    category: 'technical',
    categoryLabel: 'Technical Safeguards',
    text: 'Does your organization require multi-factor authentication (MFA) for all access to PHI systems, especially remote access?',
    options: [
      { value: 'yes', label: 'Yes, MFA is required for all access, especially remote access', riskScore: 0 },
      { value: 'partial', label: 'MFA is required for some access but not all', riskScore: 2 },
      { value: 'no', label: 'No MFA requirement. Single-factor authentication is used', riskScore: 4 }
    ],
    helpText: 'MFA significantly reduces the risk of unauthorized access due to stolen credentials. OCR auditors increasingly expect to see MFA. Lack of MFA is a finding.',
    hipaaCitation: '45 CFR §164.312(a)(2)(i)',
    severityWeight: 4
  },
  {
    id: 'password-policy',
    category: 'technical',
    categoryLabel: 'Technical Safeguards',
    text: 'Does your organization enforce strong password policies (minimum length, complexity, expiration) for all PHI systems?',
    options: [
      { value: 'yes-enforced', label: 'Yes, strong password policies are enforced (min 12 characters, complexity, 90-day expiration)', riskScore: 0 },
      { value: 'yes-policy', label: 'Password policies are in place but are weak or not consistently enforced', riskScore: 2 },
      { value: 'no', label: 'No password policies. Weak passwords are allowed', riskScore: 3 }
    ],
    helpText: 'Strong passwords are critical for preventing unauthorized access. OCR auditors expect to see evidence of password policies. Weak passwords are a finding.',
    hipaaCitation: '45 CFR §164.312(a)(2)(i)',
    severityWeight: 3
  },
  {
    id: 'role-based-access-control',
    category: 'technical',
    categoryLabel: 'Technical Safeguards',
    text: 'Does your organization implement Role-Based Access Control (RBAC) to limit access to PHI based on job function and the principle of minimum necessary access?',
    options: [
      { value: 'yes', label: 'Yes, RBAC is implemented for all systems. Access is limited to minimum necessary', riskScore: 0 },
      { value: 'partial', label: 'RBAC is implemented but not consistently. Some users have excessive access', riskScore: 2 },
      { value: 'no', label: 'No RBAC. All users have the same access level', riskScore: 4 }
    ],
    helpText: 'RBAC is fundamental to the principle of minimum necessary access. OCR auditors expect to see RBAC implementation. Lack of RBAC is a finding.',
    hipaaCitation: '45 CFR §164.312(a)(2)(i)',
    severityWeight: 4
  },
  {
    id: 'access-review-recertification',
    category: 'technical',
    categoryLabel: 'Technical Safeguards',
    text: 'Does your organization regularly review and recertify user access rights to ensure they are still appropriate for current job functions?',
    options: [
      { value: 'yes', label: 'Yes, access is reviewed at least quarterly. Inappropriate access is promptly removed', riskScore: 0 },
      { value: 'partial', label: 'Access is reviewed but not regularly. Removal of inappropriate access is delayed', riskScore: 2 },
      { value: 'no', label: 'No regular access review. Users may have access to systems they no longer need', riskScore: 3 }
    ],
    helpText: 'Regular access review prevents unauthorized access due to role changes. OCR auditors expect to see evidence of review. Lack of review is a finding.',
    hipaaCitation: '45 CFR §164.308(a)(3)(ii)(B)',
    severityWeight: 3
  },

  // 3.6 Malware Protection
  {
    id: 'antivirus-software',
    category: 'technical',
    categoryLabel: 'Technical Safeguards',
    text: 'Does your organization install and maintain current antivirus and anti-malware software on all systems that access PHI?',
    options: [
      { value: 'yes', label: 'Yes, antivirus is installed on all systems and is current', riskScore: 0 },
      { value: 'partial', label: 'Antivirus is installed but not on all systems or is not current', riskScore: 2 },
      { value: 'no', label: 'No antivirus software installed', riskScore: 4 }
    ],
    helpText: 'Malware is a common source of breaches. OCR auditors expect to see evidence of antivirus protection. Lack of protection is a finding.',
    hipaaCitation: '45 CFR §164.308(a)(5)(ii)(B)',
    severityWeight: 4
  },
  {
    id: 'malware-scanning',
    category: 'technical',
    categoryLabel: 'Technical Safeguards',
    text: 'Does your organization perform regular malware scans and keep antivirus/anti-malware definitions current?',
    options: [
      { value: 'yes', label: 'Yes, scans are performed at least weekly and definitions are updated daily', riskScore: 0 },
      { value: 'partial', label: 'Scans are performed but not frequently. Definitions are not always current', riskScore: 2 },
      { value: 'no', label: 'Scans are not performed or definitions are outdated', riskScore: 4 }
    ],
    helpText: 'Regular scanning and updates are critical for malware detection. OCR auditors expect to see evidence of regular scans. Lack of scans is a finding.',
    hipaaCitation: '45 CFR §164.308(a)(5)(ii)(B)',
    severityWeight: 4
  },

  // 3.7 Patch Management
  {
    id: 'patch-management',
    category: 'technical',
    categoryLabel: 'Technical Safeguards',
    text: 'Does your organization have a documented Patch Management Program that ensures all systems are updated with security patches promptly?',
    options: [
      { value: 'yes', label: 'Yes, documented program with defined patch schedule and testing procedures', riskScore: 0 },
      { value: 'partial', label: 'Program exists but is not comprehensive or not consistently followed', riskScore: 2 },
      { value: 'no', label: 'No patch management program. Systems are not regularly updated', riskScore: 4 }
    ],
    helpText: 'Unpatched systems are vulnerable to known exploits. OCR auditors expect to see evidence of a patch management program. Lack of a program is a finding.',
    hipaaCitation: '45 CFR §164.308(a)(1)(ii)(B)',
    severityWeight: 4
  },
  {
    id: 'system-patching',
    category: 'technical',
    categoryLabel: 'Technical Safeguards',
    text: 'Are all operating systems and applications that access PHI patched within a reasonable timeframe (e.g., 30 days for non-critical, 7 days for critical)?',
    options: [
      { value: 'yes', label: 'Yes, all systems are patched within defined timeframes', riskScore: 0 },
      { value: 'partial', label: 'Most systems are patched but some are delayed', riskScore: 2 },
      { value: 'no', label: 'Many systems are not patched or patches are significantly delayed', riskScore: 4 }
    ],
    helpText: 'Timely patching is critical for preventing exploitation of known vulnerabilities. OCR auditors expect to see evidence of timely patching. Delayed patching is a finding.',
    hipaaCitation: '45 CFR §164.308(a)(1)(ii)(B)',
    severityWeight: 4
  },

  // 3.8 Firewall and Network Security
  {
    id: 'firewall-implementation',
    category: 'technical',
    categoryLabel: 'Technical Safeguards',
    text: 'Does your organization implement firewalls to protect PHI systems from unauthorized network access?',
    options: [
      { value: 'yes', label: 'Yes, firewalls are implemented and configured to restrict traffic', riskScore: 0 },
      { value: 'partial', label: 'Firewalls are implemented but configuration may be weak', riskScore: 2 },
      { value: 'no', label: 'No firewalls or firewalls are not properly configured', riskScore: 5 }
    ],
    helpText: 'Firewalls are a fundamental network security control. OCR auditors expect to see evidence of firewall implementation. Lack of firewalls is a critical finding.',
    hipaaCitation: '45 CFR §164.312(a)(2)(ii)',
    severityWeight: 5
  },
  {
    id: 'firewall-rules',
    category: 'technical',
    categoryLabel: 'Technical Safeguards',
    text: 'Are firewall rules configured to allow only necessary traffic and deny all other traffic (default deny principle)?',
    options: [
      { value: 'yes', label: 'Yes, firewall rules follow default deny principle. Only necessary traffic is allowed', riskScore: 0 },
      { value: 'partial', label: 'Firewall rules are configured but may allow unnecessary traffic', riskScore: 2 },
      { value: 'no', label: 'Firewall rules are permissive. Unnecessary traffic is allowed', riskScore: 4 }
    ],
    helpText: 'Proper firewall configuration is critical for network security. OCR auditors expect to see evidence of restrictive rules. Permissive rules are a finding.',
    hipaaCitation: '45 CFR §164.312(a)(2)(ii)',
    severityWeight: 4
  },
  {
    id: 'network-segmentation',
    category: 'technical',
    categoryLabel: 'Technical Safeguards',
    text: 'Does your organization implement network segmentation to isolate PHI systems from less secure networks (e.g., guest network, internet)?',
    options: [
      { value: 'yes', label: 'Yes, PHI systems are on a separate network segment with restricted access', riskScore: 0 },
      { value: 'partial', label: 'Network segmentation exists but is not comprehensive', riskScore: 2 },
      { value: 'no', label: 'No network segmentation. PHI systems are on the same network as other systems', riskScore: 3 }
    ],
    helpText: 'Network segmentation limits the impact of a breach. OCR auditors expect to see evidence of segmentation. Lack of segmentation is a finding.',
    hipaaCitation: '45 CFR §164.312(a)(2)(ii)',
    severityWeight: 3
  },

  // 3.9 Wireless Network Security
  {
    id: 'wireless-encryption',
    category: 'technical',
    categoryLabel: 'Technical Safeguards',
    text: 'Are all wireless networks that may transmit PHI encrypted using WPA2 or WPA3 with strong encryption?',
    options: [
      { value: 'yes', label: 'Yes, all wireless networks use WPA2 or WPA3 with strong encryption', riskScore: 0 },
      { value: 'partial', label: 'Wireless networks are encrypted but may use weaker encryption (WEP)', riskScore: 2 },
      { value: 'no', label: 'Wireless networks are not encrypted or use very weak encryption', riskScore: 4 }
    ],
    helpText: 'Unencrypted wireless networks are vulnerable to eavesdropping. OCR auditors expect to see evidence of wireless encryption. Lack of encryption is a finding.',
    hipaaCitation: '45 CFR §164.312(c)(2)',
    severityWeight: 4
  },
  {
    id: 'cloud-services',
    category: 'technical',
    categoryLabel: 'Technical Safeguards',
    text: 'Do you use cloud services (Google Drive, Dropbox, AWS, Azure, etc.) to store or process PHI?',
    options: [
      { value: 'yes', label: 'Yes', riskScore: 0 },
      { value: 'no', label: 'No', riskScore: 0 }
    ]
  },
  {
    id: 'cloud-baa',
    category: 'technical',
    categoryLabel: 'Technical Safeguards',
    text: 'Do your cloud service providers have Business Associate Agreements and HIPAA-compliant configurations?',
    options: [
      { value: 'yes-all', label: 'Yes, all providers compliant', riskScore: 0 },
      { value: 'yes-some', label: 'Some providers compliant', riskScore: 3 },
      { value: 'no', label: 'No BAAs or compliance verification', riskScore: 5 }
    ],
    skipIf: { questionId: 'cloud-services', answer: 'no' },
    helpText: 'Cloud providers must have BAAs and HIPAA-compliant configurations. OCR auditors verify this. Lack of BAAs is a critical finding.',
    hipaaCitation: '45 CFR §164.308(b)',
    severityWeight: 5
  },
  {
    id: 'backup-verification',
    category: 'technical',
    categoryLabel: 'Technical Safeguards',
    text: 'Do you perform regular data backups and test your backup and recovery procedures to ensure ePHI can be restored?',
    options: [
      { value: 'yes-regular', label: 'Yes, regular backups and tested recovery procedures', riskScore: 0 },
      { value: 'yes-occasional', label: 'Yes, backups performed but recovery rarely tested', riskScore: 2 },
      { value: 'no', label: 'No regular backups or recovery testing', riskScore: 4 }
    ],
    helpText: 'Regular data backups and recovery testing are required as part of the Contingency Plan. Untested backups may not work when needed.',
    hipaaCitation: '45 CFR §164.308(a)(7)(ii)(A)',
    severityWeight: 4
  },
  {
    id: 'data-validation-verification',
    category: 'technical',
    categoryLabel: 'Technical Safeguards',
    text: 'Does your organization implement data validation and verification controls to ensure PHI accuracy and completeness?',
    options: [
      { value: 'yes', label: 'Yes, validation controls are implemented for all critical data entry points', riskScore: 0 },
      { value: 'partial', label: 'Some validation controls exist but not comprehensive', riskScore: 2 },
      { value: 'no', label: 'No data validation controls', riskScore: 3 }
    ],
    helpText: 'Data validation ensures PHI integrity and accuracy. OCR auditors expect to see evidence of validation controls. Lack of controls is a finding.',
    hipaaCitation: '45 CFR §164.312(c)(1)',
    severityWeight: 3
  },
  {
    id: 'wireless-access-point-security',
    category: 'technical',
    categoryLabel: 'Technical Safeguards',
    text: 'Are wireless access points configured with strong security settings, including MAC address filtering and hidden SSID where appropriate?',
    options: [
      { value: 'yes', label: 'Yes, all access points have strong security configurations', riskScore: 0 },
      { value: 'partial', label: 'Some access points are secured but not all', riskScore: 2 },
      { value: 'no', label: 'Access points are not properly secured', riskScore: 3 }
    ],
    helpText: 'Wireless access point security prevents unauthorized network access. OCR auditors expect to see evidence of secure configurations. Lack of security is a finding.',
    hipaaCitation: '45 CFR §164.312(c)(2)',
    severityWeight: 3
  },
  {
    id: 'rogue-wireless-network-detection',
    category: 'technical',
    categoryLabel: 'Technical Safeguards',
    text: 'Does your organization have procedures to detect and disable unauthorized (rogue) wireless networks?',
    options: [
      { value: 'yes', label: 'Yes, regular scanning and monitoring for rogue networks. Unauthorized networks are immediately disabled', riskScore: 0 },
      { value: 'partial', label: 'Some monitoring exists but not comprehensive or regular', riskScore: 2 },
      { value: 'no', label: 'No rogue network detection procedures', riskScore: 3 }
    ],
    helpText: 'Rogue wireless networks are a major security risk. OCR auditors expect to see evidence of detection and response procedures. Lack of procedures is a finding.',
    hipaaCitation: '45 CFR §164.312(a)(2)(ii)',
    severityWeight: 3
  },
  {
    id: 'intrusion-detection-prevention',
    category: 'technical',
    categoryLabel: 'Technical Safeguards',
    text: 'Does your organization implement intrusion detection and prevention systems (IDS/IPS) to monitor and protect PHI systems?',
    options: [
      { value: 'yes', label: 'Yes, IDS/IPS implemented and actively monitored. Alerts are investigated promptly', riskScore: 0 },
      { value: 'partial', label: 'IDS/IPS exists but monitoring is not regular or alerts are not always investigated', riskScore: 2 },
      { value: 'no', label: 'No intrusion detection or prevention systems', riskScore: 4 }
    ],
    helpText: 'IDS/IPS systems detect and prevent unauthorized access attempts. OCR auditors expect to see evidence of these controls. Lack of systems is a finding.',
    hipaaCitation: '45 CFR §164.312(a)(2)(ii)',
    severityWeight: 4
  },
  {
    id: 'firmware-updates',
    category: 'technical',
    categoryLabel: 'Technical Safeguards',
    text: 'Does your organization regularly update firmware on network devices, servers, and other hardware that processes PHI?',
    options: [
      { value: 'yes', label: 'Yes, firmware updates are applied regularly and tracked', riskScore: 0 },
      { value: 'partial', label: 'Some firmware updates are applied but not consistently', riskScore: 2 },
      { value: 'no', label: 'Firmware is not regularly updated', riskScore: 3 }
    ],
    helpText: 'Outdated firmware can contain security vulnerabilities. OCR auditors expect to see evidence of regular firmware updates. Lack of updates is a finding.',
    hipaaCitation: '45 CFR §164.308(a)(1)(ii)(B)',
    severityWeight: 3
  },

  // ============================================================================
  // SECTION 4: WORKFORCE & TRAINING (Additional Questions)
  // ============================================================================

  {
    id: 'workforce-security-awareness',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization conduct regular security awareness campaigns to keep workforce members informed about current threats and best practices?',
    options: [
      { value: 'yes', label: 'Yes, regular campaigns with updates on current threats and best practices', riskScore: 0 },
      { value: 'partial', label: 'Some awareness activities but not regular or comprehensive', riskScore: 2 },
      { value: 'no', label: 'No security awareness campaigns', riskScore: 3 }
    ],
    helpText: 'Security awareness campaigns help maintain workforce vigilance. OCR auditors expect to see evidence of ongoing awareness activities. Lack of campaigns is a finding.',
    hipaaCitation: '45 CFR §164.308(a)(5)(i)',
    severityWeight: 3
  },
  {
    id: 'phishing-social-engineering-training',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization provide specific training on recognizing and responding to phishing attacks and social engineering attempts?',
    options: [
      { value: 'yes', label: 'Yes, comprehensive training with examples and regular updates', riskScore: 0 },
      { value: 'partial', label: 'Some training provided but not comprehensive or regular', riskScore: 2 },
      { value: 'no', label: 'No specific phishing or social engineering training', riskScore: 4 }
    ],
    helpText: 'Phishing is a leading cause of breaches. OCR auditors expect to see evidence of specific training on this threat. Lack of training is a finding.',
    hipaaCitation: '45 CFR §164.308(a)(5)(ii)(B)',
    severityWeight: 4
  },
  {
    id: 'acceptable-use-policy',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization have a documented Acceptable Use Policy that defines authorized and prohibited uses of systems and data?',
    options: [
      { value: 'yes', label: 'Yes, comprehensive policy that is communicated to all staff and enforced', riskScore: 0 },
      { value: 'partial', label: 'Policy exists but is incomplete or not consistently enforced', riskScore: 2 },
      { value: 'no', label: 'No acceptable use policy', riskScore: 3 }
    ],
    helpText: 'An acceptable use policy sets clear expectations for system usage. OCR auditors expect to see a documented policy. Lack of a policy is a finding.',
    hipaaCitation: '45 CFR §164.308(a)(5)(i)',
    severityWeight: 3
  },
  {
    id: 'personal-device-policy',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization have a documented policy governing the use of personal devices (BYOD) for accessing PHI?',
    options: [
      { value: 'yes', label: 'Yes, comprehensive policy with security requirements and restrictions', riskScore: 0 },
      { value: 'partial', label: 'Policy exists but is incomplete or not consistently enforced', riskScore: 2 },
      { value: 'no', label: 'No personal device policy, or personal devices are prohibited', riskScore: 3 }
    ],
    helpText: 'Personal devices pose significant security risks. OCR auditors expect to see a documented policy if personal devices are allowed. Lack of a policy is a finding.',
    hipaaCitation: '45 CFR §164.308(a)(5)(i)',
    severityWeight: 3
  },
  {
    id: 'mobile-device-management',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization use Mobile Device Management (MDM) or similar solutions to secure and manage mobile devices that access PHI?',
    options: [
      { value: 'yes', label: 'Yes, MDM implemented for all mobile devices with PHI access', riskScore: 0 },
      { value: 'partial', label: 'MDM used for some devices but not all', riskScore: 2 },
      { value: 'no', label: 'No MDM solution. Mobile devices are not centrally managed', riskScore: 4 }
    ],
    helpText: 'MDM solutions provide essential security controls for mobile devices. OCR auditors expect to see MDM for devices accessing PHI. Lack of MDM is a finding.',
    hipaaCitation: '45 CFR §164.310(c)(1)',
    severityWeight: 4
  },
  {
    id: 'lost-stolen-device-procedures',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization have documented procedures for responding to lost or stolen devices that may contain PHI, including remote wipe capabilities?',
    options: [
      { value: 'yes', label: 'Yes, comprehensive procedures with remote wipe and incident response', riskScore: 0 },
      { value: 'partial', label: 'Procedures exist but are incomplete or remote wipe is not available', riskScore: 2 },
      { value: 'no', label: 'No procedures for lost or stolen devices', riskScore: 5 }
    ],
    helpText: 'Lost or stolen devices are a major breach risk. OCR auditors expect to see evidence of remote wipe capabilities and response procedures. Lack of procedures is a critical finding.',
    hipaaCitation: '45 CFR §164.310(c)(1)',
    severityWeight: 5
  },
  {
    id: 'workforce-exit-procedures',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization have comprehensive exit procedures that include returning devices, revoking access, and conducting exit interviews?',
    options: [
      { value: 'yes', label: 'Yes, comprehensive procedures with device return, access revocation, and exit interviews', riskScore: 0 },
      { value: 'partial', label: 'Procedures exist but are incomplete or not consistently followed', riskScore: 2 },
      { value: 'no', label: 'No formal exit procedures', riskScore: 4 }
    ],
    helpText: 'Exit procedures prevent unauthorized access and data loss. OCR auditors expect to see evidence of comprehensive exit procedures. Lack of procedures is a finding.',
    hipaaCitation: '45 CFR §164.308(a)(3)(ii)(D)',
    severityWeight: 4
  },
  {
    id: 'workforce-compliance-monitoring',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization monitor workforce compliance with security policies through audits, reviews, or other mechanisms?',
    options: [
      { value: 'yes', label: 'Yes, regular monitoring with documented audits and reviews', riskScore: 0 },
      { value: 'partial', label: 'Some monitoring exists but not regular or comprehensive', riskScore: 2 },
      { value: 'no', label: 'No compliance monitoring', riskScore: 3 }
    ],
    helpText: 'Compliance monitoring ensures policies are followed. OCR auditors expect to see evidence of monitoring activities. Lack of monitoring is a finding.',
    hipaaCitation: '45 CFR §164.308(a)(1)(ii)(D)',
    severityWeight: 3
  },
  {
    id: 'workforce-feedback-reporting',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization have mechanisms for workforce members to report security concerns, violations, or suggestions anonymously?',
    options: [
      { value: 'yes', label: 'Yes, multiple reporting channels including anonymous options', riskScore: 0 },
      { value: 'partial', label: 'Reporting channels exist but may not be anonymous or well-publicized', riskScore: 2 },
      { value: 'no', label: 'No formal reporting mechanisms', riskScore: 3 }
    ],
    helpText: 'Reporting mechanisms encourage workforce members to report security issues. OCR auditors expect to see evidence of accessible reporting channels. Lack of mechanisms is a finding.',
    hipaaCitation: '45 CFR §164.308(a)(5)(ii)(C)',
    severityWeight: 3
  },
  {
    id: 'workforce-termination-for-cause',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization have specific procedures for immediately revoking access when workforce members are terminated for cause (e.g., policy violation)?',
    options: [
      { value: 'yes', label: 'Yes, immediate revocation procedures with security escort if needed', riskScore: 0 },
      { value: 'partial', label: 'Procedures exist but may not be immediate or comprehensive', riskScore: 2 },
      { value: 'no', label: 'No specific procedures for termination for cause', riskScore: 4 }
    ],
    helpText: 'Termination for cause requires immediate access revocation to prevent retaliation or data theft. OCR auditors expect to see evidence of immediate procedures. Lack of procedures is a finding.',
    hipaaCitation: '45 CFR §164.308(a)(3)(ii)(D)',
    severityWeight: 4
  },

  // ============================================================================
  // SECTION 5: THIRD-PARTY / BUSINESS ASSOCIATE RISK (Additional Questions)
  // ============================================================================

  {
    id: 'vendor-risk-assessment',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization conduct risk assessments of vendors and Business Associates before entering into agreements?',
    options: [
      { value: 'yes', label: 'Yes, comprehensive risk assessment for all vendors handling PHI', riskScore: 0 },
      { value: 'partial', label: 'Risk assessments conducted for some vendors but not all', riskScore: 2 },
      { value: 'no', label: 'No vendor risk assessments conducted', riskScore: 4 }
    ],
    helpText: 'Vendor risk assessments identify potential security risks before engagement. OCR auditors expect to see evidence of assessments. Lack of assessments is a finding.',
    hipaaCitation: '45 CFR §164.308(b)(1)',
    severityWeight: 4
  },
  {
    id: 'vendor-security-questionnaire',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization require vendors to complete security questionnaires or provide security documentation before engagement?',
    options: [
      { value: 'yes', label: 'Yes, comprehensive questionnaires required for all vendors handling PHI', riskScore: 0 },
      { value: 'partial', label: 'Questionnaires required for some vendors but not all', riskScore: 2 },
      { value: 'no', label: 'No security questionnaires required', riskScore: 3 }
    ],
    helpText: 'Security questionnaires help assess vendor security posture. OCR auditors expect to see evidence of vendor security evaluation. Lack of questionnaires is a finding.',
    hipaaCitation: '45 CFR §164.308(b)(1)',
    severityWeight: 3
  },
  {
    id: 'vendor-audit-certification',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization require vendors to provide security certifications, audit reports, or third-party assessments (e.g., SOC 2, HITRUST)?',
    options: [
      { value: 'yes', label: 'Yes, certifications or audit reports required and reviewed', riskScore: 0 },
      { value: 'partial', label: 'Certifications requested but not required or not reviewed', riskScore: 2 },
      { value: 'no', label: 'No certification or audit requirements', riskScore: 3 }
    ],
    helpText: 'Third-party certifications provide independent verification of vendor security. OCR auditors expect to see evidence of certification review. Lack of requirements is a finding.',
    hipaaCitation: '45 CFR §164.308(b)(2)',
    severityWeight: 3
  },
  {
    id: 'vendor-data-handling-security',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Do your BAAs specify how vendors must handle, store, and transmit PHI, including encryption and access control requirements?',
    options: [
      { value: 'yes', label: 'Yes, BAAs include specific security requirements for data handling', riskScore: 0 },
      { value: 'partial', label: 'BAAs include some security requirements but not comprehensive', riskScore: 2 },
      { value: 'no', label: 'BAAs do not specify data handling security requirements', riskScore: 4 }
    ],
    helpText: 'BAAs must specify security requirements for PHI handling. OCR auditors verify BAA content. Lack of security specifications is a finding.',
    hipaaCitation: '45 CFR §164.308(b)(1)',
    severityWeight: 4
  },
  {
    id: 'vendor-subcontractor-management',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Do your BAAs require vendors to ensure their subcontractors also comply with HIPAA and have BAAs?',
    options: [
      { value: 'yes', label: 'Yes, BAAs require vendor to ensure subcontractor compliance', riskScore: 0 },
      { value: 'partial', label: 'BAAs mention subcontractors but requirements are not clear', riskScore: 2 },
      { value: 'no', label: 'BAAs do not address subcontractor requirements', riskScore: 3 }
    ],
    helpText: 'Subcontractors must also comply with HIPAA. OCR auditors verify that BAAs address subcontractor requirements. Lack of requirements is a finding.',
    hipaaCitation: '45 CFR §164.308(b)(1)',
    severityWeight: 3
  },
  {
    id: 'vendor-compliance-monitoring',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization regularly monitor and audit vendor compliance with BAAs and HIPAA requirements?',
    options: [
      { value: 'yes', label: 'Yes, regular monitoring and audits with documented findings', riskScore: 0 },
      { value: 'partial', label: 'Some monitoring exists but not regular or comprehensive', riskScore: 2 },
      { value: 'no', label: 'No vendor compliance monitoring or audits', riskScore: 4 }
    ],
    helpText: 'Organizations are responsible for ensuring vendor compliance. OCR auditors expect to see evidence of active monitoring. Lack of monitoring is a finding.',
    hipaaCitation: '45 CFR §164.308(b)(2)',
    severityWeight: 4
  },
  {
    id: 'vendor-data-return-destruction',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Do your BAAs specify procedures for returning or securely destroying PHI when vendor relationships end?',
    options: [
      { value: 'yes', label: 'Yes, BAAs include specific return/destruction procedures', riskScore: 0 },
      { value: 'partial', label: 'BAAs mention return/destruction but procedures are not specific', riskScore: 2 },
      { value: 'no', label: 'BAAs do not address data return or destruction', riskScore: 3 }
    ],
    helpText: 'BAAs must specify how PHI is handled when relationships end. OCR auditors verify this requirement. Lack of procedures is a finding.',
    hipaaCitation: '45 CFR §164.308(b)(1)',
    severityWeight: 3
  },
  {
    id: 'cloud-service-provider-security',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Do you verify that cloud service providers implement appropriate security controls, including encryption, access controls, and audit logging?',
    options: [
      { value: 'yes', label: 'Yes, comprehensive verification of security controls', riskScore: 0 },
      { value: 'partial', label: 'Some verification exists but not comprehensive', riskScore: 2 },
      { value: 'no', label: 'No verification of cloud provider security controls', riskScore: 4 }
    ],
    helpText: 'Cloud providers must implement appropriate security controls. OCR auditors expect to see evidence of verification. Lack of verification is a finding.',
    hipaaCitation: '45 CFR §164.308(b)(1)',
    severityWeight: 4
  },
  {
    id: 'vendor-contract-review',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization regularly review and update BAAs to ensure they reflect current HIPAA requirements and security best practices?',
    options: [
      { value: 'yes', label: 'Yes, BAAs reviewed regularly and updated as needed', riskScore: 0 },
      { value: 'partial', label: 'BAAs reviewed occasionally but not regularly', riskScore: 2 },
      { value: 'no', label: 'BAAs are not regularly reviewed or updated', riskScore: 3 }
    ],
    helpText: 'BAAs must reflect current HIPAA requirements. OCR auditors expect to see evidence of regular review. Lack of review is a finding.',
    hipaaCitation: '45 CFR §164.308(b)(1)',
    severityWeight: 3
  },
  {
    id: 'vendor-termination-transition',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization have procedures for securely transitioning PHI when vendor relationships end or are terminated?',
    options: [
      { value: 'yes', label: 'Yes, comprehensive transition procedures with data return/destruction', riskScore: 0 },
      { value: 'partial', label: 'Procedures exist but are incomplete', riskScore: 2 },
      { value: 'no', label: 'No transition procedures', riskScore: 3 }
    ],
    helpText: 'Secure transition procedures prevent data loss or unauthorized access. OCR auditors expect to see evidence of procedures. Lack of procedures is a finding.',
    hipaaCitation: '45 CFR §164.308(b)(1)',
    severityWeight: 3
  },
  {
    id: 'vendor-performance-metrics-slas',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Do your BAAs include performance metrics or SLAs related to security and HIPAA compliance?',
    options: [
      { value: 'yes', label: 'Yes, BAAs include security performance metrics and SLAs', riskScore: 0 },
      { value: 'partial', label: 'BAAs include some metrics but not comprehensive', riskScore: 1 },
      { value: 'no', label: 'BAAs do not include performance metrics or SLAs', riskScore: 2 }
    ],
    helpText: 'Performance metrics help monitor vendor security compliance. While not required, they demonstrate due diligence. Lack of metrics is a minor finding.',
    hipaaCitation: '45 CFR §164.308(b)(2)',
    severityWeight: 2
  },
  {
    id: 'vendor-insurance-liability',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Do your BAAs require vendors to maintain cyber liability insurance and specify liability for breaches?',
    options: [
      { value: 'yes', label: 'Yes, BAAs require insurance and specify liability', riskScore: 0 },
      { value: 'partial', label: 'BAAs mention insurance but requirements are not specific', riskScore: 1 },
      { value: 'no', label: 'BAAs do not address insurance or liability', riskScore: 2 }
    ],
    helpText: 'Cyber liability insurance helps mitigate financial risk. While not required by HIPAA, it demonstrates risk management. Lack of requirements is a minor finding.',
    hipaaCitation: '45 CFR §164.308(b)(1)',
    severityWeight: 2
  },
  {
    id: 'vendor-incident-response-plan',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Do your BAAs require vendors to have incident response plans and specify notification timelines for security incidents?',
    options: [
      { value: 'yes', label: 'Yes, BAAs require incident response plans and specify notification timelines', riskScore: 0 },
      { value: 'partial', label: 'BAAs mention incident response but requirements are not specific', riskScore: 2 },
      { value: 'no', label: 'BAAs do not address vendor incident response requirements', riskScore: 3 }
    ],
    helpText: 'Vendors must have incident response capabilities. OCR auditors expect to see this requirement in BAAs. Lack of requirements is a finding.',
    hipaaCitation: '45 CFR §164.308(b)(1)(ii)',
    severityWeight: 3
  },
  {
    id: 'vendor-security-training',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Do your BAAs require vendors to provide HIPAA security training to their workforce members who handle PHI?',
    options: [
      { value: 'yes', label: 'Yes, BAAs require vendor workforce training', riskScore: 0 },
      { value: 'partial', label: 'BAAs mention training but requirements are not specific', riskScore: 1 },
      { value: 'no', label: 'BAAs do not address vendor training requirements', riskScore: 2 }
    ],
    helpText: 'Vendor workforce training is important for PHI security. While not explicitly required, it demonstrates due diligence. Lack of requirements is a minor finding.',
    hipaaCitation: '45 CFR §164.308(b)(1)',
    severityWeight: 2
  },
  {
    id: 'contractor-agreements',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Do you have written agreements with contractors and temporary staff that specify HIPAA security obligations?',
    options: [
      { value: 'yes', label: 'Yes, all contractors have written agreements with HIPAA obligations', riskScore: 0 },
      { value: 'partial', label: 'Some contractors have agreements but not all', riskScore: 2 },
      { value: 'no', label: 'No written agreements with contractors', riskScore: 4 }
    ],
    helpText: 'Contractors must comply with HIPAA. OCR auditors expect to see written agreements. Lack of agreements is a finding.',
    hipaaCitation: '45 CFR §164.308(b)(1)',
    severityWeight: 4
  },
  {
    id: 'confidentiality-agreements',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Do all workforce members, including contractors and volunteers, sign confidentiality agreements that include HIPAA obligations?',
    options: [
      { value: 'yes', label: 'Yes, all workforce members sign confidentiality agreements', riskScore: 0 },
      { value: 'partial', label: 'Most workforce members sign agreements but not all', riskScore: 2 },
      { value: 'no', label: 'No confidentiality agreements required', riskScore: 3 }
    ],
    helpText: 'Confidentiality agreements reinforce HIPAA obligations. OCR auditors expect to see evidence of signed agreements. Lack of agreements is a finding.',
    hipaaCitation: '45 CFR §164.308(a)(3)(ii)(A)',
    severityWeight: 3
  },
  {
    id: 'volunteer-intern-agreements',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Do volunteers and interns who may access PHI sign agreements specifying HIPAA obligations and receive training?',
    options: [
      { value: 'yes', label: 'Yes, all volunteers and interns sign agreements and receive training', riskScore: 0 },
      { value: 'partial', label: 'Some volunteers/interns have agreements but not all', riskScore: 2 },
      { value: 'no', label: 'No agreements or training for volunteers/interns', riskScore: 3 }
    ],
    helpText: 'Volunteers and interns must also comply with HIPAA. OCR auditors expect to see evidence of agreements and training. Lack of agreements is a finding.',
    hipaaCitation: '45 CFR §164.308(a)(3)(ii)(A)',
    severityWeight: 3
  },

  // ============================================================================
  // SECTION 6: INCIDENT RESPONSE & BREACH HANDLING (Additional Questions)
  // ============================================================================

  {
    id: 'incident-response-team',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization have a designated Incident Response Team with defined roles and responsibilities?',
    options: [
      { value: 'yes', label: 'Yes, formal team with defined roles, contact information, and escalation procedures', riskScore: 0 },
      { value: 'partial', label: 'Team exists but roles are not clearly defined or contact information is not current', riskScore: 2 },
      { value: 'no', label: 'No designated incident response team', riskScore: 4 }
    ],
    helpText: 'An incident response team ensures coordinated response to security incidents. OCR auditors expect to see evidence of a designated team. Lack of a team is a finding.',
    hipaaCitation: '45 CFR §164.308(a)(6)(i)',
    severityWeight: 4
  },
  {
    id: 'incident-response-plan-testing',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization regularly test the Incident Response Plan through tabletop exercises or simulations?',
    options: [
      { value: 'yes', label: 'Yes, plan is tested at least annually with documented results and improvements', riskScore: 0 },
      { value: 'partial', label: 'Plan is tested but not regularly or results are not documented', riskScore: 2 },
      { value: 'no', label: 'Plan is not tested', riskScore: 3 }
    ],
    helpText: 'Testing ensures the incident response plan actually works. OCR auditors expect to see evidence of regular testing. Lack of testing is a finding.',
    hipaaCitation: '45 CFR §164.308(a)(6)(i)',
    severityWeight: 3
  },
  {
    id: 'breach-assessment-procedures',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization have documented procedures for assessing whether a security incident constitutes a breach under HIPAA?',
    options: [
      { value: 'yes', label: 'Yes, comprehensive procedures with documented assessment criteria and process', riskScore: 0 },
      { value: 'partial', label: 'Procedures exist but are incomplete or not consistently followed', riskScore: 2 },
      { value: 'no', label: 'No documented breach assessment procedures', riskScore: 5 }
    ],
    helpText: 'Breach assessment is critical for determining notification requirements. OCR auditors expect to see evidence of a formal assessment process. Lack of procedures is a critical finding.',
    hipaaCitation: '45 CFR §164.402',
    severityWeight: 5
  },
  {
    id: 'breach-notification-timeline',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization have procedures to ensure breach notifications are sent within 60 days of discovery as required by HIPAA?',
    options: [
      { value: 'yes', label: 'Yes, procedures ensure notifications within 60 days with tracking and verification', riskScore: 0 },
      { value: 'partial', label: 'Procedures exist but may not ensure 60-day timeline', riskScore: 2 },
      { value: 'no', label: 'No procedures to ensure 60-day notification timeline', riskScore: 5 }
    ],
    helpText: 'The 60-day notification requirement is mandatory. OCR auditors verify compliance with this timeline. Failure to meet the timeline is a critical finding.',
    hipaaCitation: '45 CFR §164.404(b)',
    severityWeight: 5
  },
  {
    id: 'hhs-breach-notification',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization have procedures for notifying the HHS Secretary of breaches affecting 500 or more individuals within 60 days?',
    options: [
      { value: 'yes', label: 'Yes, procedures ensure HHS notification within 60 days for large breaches', riskScore: 0 },
      { value: 'partial', label: 'Procedures exist but may not ensure timely HHS notification', riskScore: 2 },
      { value: 'no', label: 'No procedures for HHS notification', riskScore: 5 }
    ],
    helpText: 'HHS notification is mandatory for large breaches. OCR auditors verify compliance. Failure to notify HHS is a critical finding.',
    hipaaCitation: '45 CFR §164.408',
    severityWeight: 5
  },
  {
    id: 'media-notification',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization have procedures for notifying media outlets of breaches affecting 500 or more individuals in a state or jurisdiction?',
    options: [
      { value: 'yes', label: 'Yes, procedures ensure media notification for large breaches as required', riskScore: 0 },
      { value: 'partial', label: 'Procedures exist but may not ensure timely media notification', riskScore: 2 },
      { value: 'no', label: 'No procedures for media notification', riskScore: 5 }
    ],
    helpText: 'Media notification is mandatory for large breaches. OCR auditors verify compliance. Failure to notify media is a critical finding.',
    hipaaCitation: '45 CFR §164.406',
    severityWeight: 5
  },
  {
    id: 'breach-documentation',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization maintain comprehensive documentation of all security incidents and breach assessments, including rationale for breach determinations?',
    options: [
      { value: 'yes', label: 'Yes, all incidents and assessments are thoroughly documented', riskScore: 0 },
      { value: 'partial', label: 'Some documentation exists but is incomplete', riskScore: 2 },
      { value: 'no', label: 'Incident and breach documentation is minimal or missing', riskScore: 4 }
    ],
    helpText: 'Documentation is critical for audit defense. OCR auditors expect to see comprehensive incident documentation. Lack of documentation is a finding.',
    hipaaCitation: '45 CFR §164.308(a)(6)(ii)',
    severityWeight: 4
  },
  {
    id: 'breach-remediation-tracking',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization track remediation actions taken in response to security incidents and breaches?',
    options: [
      { value: 'yes', label: 'Yes, all remediation actions are tracked and documented', riskScore: 0 },
      { value: 'partial', label: 'Some tracking exists but not comprehensive', riskScore: 2 },
      { value: 'no', label: 'No tracking of remediation actions', riskScore: 3 }
    ],
    helpText: 'Tracking remediation actions demonstrates organizational response. OCR auditors expect to see evidence of tracking. Lack of tracking is a finding.',
    hipaaCitation: '45 CFR §164.308(a)(6)(ii)',
    severityWeight: 3
  },
  {
    id: 'post-breach-risk-assessment',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization conduct a post-breach risk assessment to identify contributing factors and prevent future incidents?',
    options: [
      { value: 'yes', label: 'Yes, comprehensive post-breach assessments with documented findings and improvements', riskScore: 0 },
      { value: 'partial', label: 'Some assessment occurs but not comprehensive or not documented', riskScore: 2 },
      { value: 'no', label: 'No post-breach risk assessments conducted', riskScore: 3 }
    ],
    helpText: 'Post-breach assessments help prevent future incidents. OCR auditors expect to see evidence of assessments. Lack of assessments is a finding.',
    hipaaCitation: '45 CFR §164.308(a)(1)(ii)(A)',
    severityWeight: 3
  },
  {
    id: 'incident-communication-plan',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization have a communication plan for notifying affected individuals, including templates and procedures for different breach scenarios?',
    options: [
      { value: 'yes', label: 'Yes, comprehensive communication plan with templates and procedures', riskScore: 0 },
      { value: 'partial', label: 'Communication plan exists but is incomplete or not tested', riskScore: 2 },
      { value: 'no', label: 'No communication plan for breach notifications', riskScore: 4 }
    ],
    helpText: 'A communication plan ensures timely and appropriate breach notifications. OCR auditors expect to see evidence of a plan. Lack of a plan is a finding.',
    hipaaCitation: '45 CFR §164.404',
    severityWeight: 4
  },

  // ============================================================================
  // SECTION 7: PHYSICAL SAFEGUARDS (Additional Questions)
  // ============================================================================

  {
    id: 'environmental-controls',
    category: 'physical',
    categoryLabel: 'Physical Safeguards',
    text: 'Does your organization maintain environmental controls (temperature, humidity, power) to protect equipment and data storage systems?',
    options: [
      { value: 'yes', label: 'Yes, comprehensive environmental controls with monitoring', riskScore: 0 },
      { value: 'partial', label: 'Some environmental controls exist but not comprehensive', riskScore: 2 },
      { value: 'no', label: 'No environmental controls or monitoring', riskScore: 3 }
    ],
    helpText: 'Environmental controls protect equipment and data. OCR auditors expect to see evidence of controls. Lack of controls is a finding.',
    hipaaCitation: '45 CFR §164.310(a)(2)(ii)',
    severityWeight: 3
  },
  {
    id: 'fire-suppression-detection',
    category: 'physical',
    categoryLabel: 'Physical Safeguards',
    text: 'Does your organization have fire suppression and detection systems to protect areas where PHI is stored?',
    options: [
      { value: 'yes', label: 'Yes, fire suppression and detection systems in place and tested regularly', riskScore: 0 },
      { value: 'partial', label: 'Some fire protection exists but not comprehensive or not tested', riskScore: 2 },
      { value: 'no', label: 'No fire suppression or detection systems', riskScore: 3 }
    ],
    helpText: 'Fire protection is critical for data availability. OCR auditors expect to see evidence of fire protection. Lack of protection is a finding.',
    hipaaCitation: '45 CFR §164.310(a)(2)(ii)',
    severityWeight: 3
  },
  {
    id: 'flood-water-damage-prevention',
    category: 'physical',
    categoryLabel: 'Physical Safeguards',
    text: 'Does your organization have measures to prevent flood and water damage to areas where PHI is stored?',
    options: [
      { value: 'yes', label: 'Yes, comprehensive flood and water damage prevention measures', riskScore: 0 },
      { value: 'partial', label: 'Some measures exist but not comprehensive', riskScore: 1 },
      { value: 'no', label: 'No flood or water damage prevention measures', riskScore: 2 }
    ],
    helpText: 'Flood and water damage prevention protects data availability. OCR auditors may check for these measures. Lack of measures is a minor finding.',
    hipaaCitation: '45 CFR §164.310(a)(2)(ii)',
    severityWeight: 2
  },
  {
    id: 'power-utilities',
    category: 'physical',
    categoryLabel: 'Physical Safeguards',
    text: 'Does your organization have backup power systems (UPS, generators) to maintain operations during power outages?',
    options: [
      { value: 'yes', label: 'Yes, backup power systems in place and tested regularly', riskScore: 0 },
      { value: 'partial', label: 'Some backup power exists but not comprehensive or not tested', riskScore: 2 },
      { value: 'no', label: 'No backup power systems', riskScore: 3 }
    ],
    helpText: 'Backup power ensures system availability during outages. OCR auditors expect to see evidence of backup power. Lack of backup power is a finding.',
    hipaaCitation: '45 CFR §164.310(a)(2)(ii)',
    severityWeight: 3
  },
  {
    id: 'cabling-infrastructure-security',
    category: 'physical',
    categoryLabel: 'Physical Safeguards',
    text: 'Is network cabling and infrastructure physically secured to prevent unauthorized access or tampering?',
    options: [
      { value: 'yes', label: 'Yes, cabling is secured in locked conduits or protected areas', riskScore: 0 },
      { value: 'partial', label: 'Some cabling is secured but not all', riskScore: 1 },
      { value: 'no', label: 'Cabling is not secured and accessible to unauthorized individuals', riskScore: 2 }
    ],
    helpText: 'Secured cabling prevents network interception. OCR auditors may check for cabling security. Lack of security is a minor finding.',
    hipaaCitation: '45 CFR §164.310(a)(2)(i)',
    severityWeight: 2
  },
  {
    id: 'secure-disposal-utilities',
    category: 'physical',
    categoryLabel: 'Physical Safeguards',
    text: 'Does your organization use secure disposal services or certified vendors for destroying PHI (paper and electronic)?',
    options: [
      { value: 'yes', label: 'Yes, certified disposal services with documentation and verification', riskScore: 0 },
      { value: 'partial', label: 'Some secure disposal but not all or not certified', riskScore: 2 },
      { value: 'no', label: 'No secure disposal services. Disposal is not verified', riskScore: 4 }
    ],
    helpText: 'Certified disposal services ensure proper PHI destruction. OCR auditors expect to see evidence of secure disposal. Lack of secure disposal is a finding.',
    hipaaCitation: '45 CFR §164.310(c)(2)',
    severityWeight: 4
  },
  {
    id: 'workstation-physical-security',
    category: 'physical',
    categoryLabel: 'Physical Safeguards',
    text: 'Are workstations that access PHI physically secured with locks, cables, or other measures to prevent theft?',
    options: [
      { value: 'yes', label: 'Yes, all workstations are physically secured', riskScore: 0 },
      { value: 'partial', label: 'Some workstations are secured but not all', riskScore: 2 },
      { value: 'no', label: 'Workstations are not physically secured', riskScore: 3 }
    ],
    helpText: 'Physical workstation security prevents theft and unauthorized access. OCR auditors expect to see evidence of security measures. Lack of measures is a finding.',
    hipaaCitation: '45 CFR §164.310(b)',
    severityWeight: 3
  },

  // ============================================================================
  // SECTION 8: TECHNICAL SAFEGUARDS (Additional Questions)
  // ============================================================================

  {
    id: 'data-loss-prevention',
    category: 'technical',
    categoryLabel: 'Technical Safeguards',
    text: 'Does your organization implement Data Loss Prevention (DLP) solutions to monitor and prevent unauthorized PHI exfiltration?',
    options: [
      { value: 'yes', label: 'Yes, DLP solutions implemented and actively monitored', riskScore: 0 },
      { value: 'partial', label: 'Some DLP controls exist but not comprehensive', riskScore: 2 },
      { value: 'no', label: 'No DLP solutions implemented', riskScore: 3 }
    ],
    helpText: 'DLP solutions help prevent unauthorized data exfiltration. OCR auditors increasingly expect to see DLP. Lack of DLP is a finding.',
    hipaaCitation: '45 CFR §164.312(a)(2)(ii)',
    severityWeight: 3
  },
  {
    id: 'secure-file-transfer',
    category: 'technical',
    categoryLabel: 'Technical Safeguards',
    text: 'Does your organization use secure file transfer methods (SFTP, encrypted file sharing) when transferring PHI?',
    options: [
      { value: 'yes', label: 'Yes, all file transfers use secure methods', riskScore: 0 },
      { value: 'partial', label: 'Most transfers are secure but some are not', riskScore: 2 },
      { value: 'no', label: 'File transfers are not secured', riskScore: 4 }
    ],
    helpText: 'Secure file transfer prevents interception of PHI. OCR auditors expect to see evidence of secure transfer methods. Lack of security is a finding.',
    hipaaCitation: '45 CFR §164.312(c)(2)',
    severityWeight: 4
  },
  {
    id: 'application-security',
    category: 'technical',
    categoryLabel: 'Technical Safeguards',
    text: 'Does your organization implement application security controls, including secure coding practices and vulnerability assessments?',
    options: [
      { value: 'yes', label: 'Yes, comprehensive application security with regular assessments', riskScore: 0 },
      { value: 'partial', label: 'Some application security exists but not comprehensive', riskScore: 2 },
      { value: 'no', label: 'No application security controls or assessments', riskScore: 3 }
    ],
    helpText: 'Application security prevents exploitation of vulnerabilities. OCR auditors expect to see evidence of security controls. Lack of controls is a finding.',
    hipaaCitation: '45 CFR §164.308(a)(1)(ii)(B)',
    severityWeight: 3
  },
  {
    id: 'database-security',
    category: 'technical',
    categoryLabel: 'Technical Safeguards',
    text: 'Are databases containing PHI secured with access controls, encryption, and regular security assessments?',
    options: [
      { value: 'yes', label: 'Yes, comprehensive database security with access controls and encryption', riskScore: 0 },
      { value: 'partial', label: 'Some database security exists but not comprehensive', riskScore: 2 },
      { value: 'no', label: 'Databases are not properly secured', riskScore: 4 }
    ],
    helpText: 'Database security is critical for protecting PHI. OCR auditors expect to see evidence of comprehensive security. Lack of security is a finding.',
    hipaaCitation: '45 CFR §164.312(a)(2)(ii)',
    severityWeight: 4
  },
  {
    id: 'api-security',
    category: 'technical',
    categoryLabel: 'Technical Safeguards',
    text: 'If your organization uses APIs to access or transmit PHI, are they secured with authentication, encryption, and rate limiting?',
    options: [
      { value: 'yes', label: 'Yes, APIs are secured with authentication, encryption, and rate limiting', riskScore: 0 },
      { value: 'partial', label: 'Some API security exists but not comprehensive', riskScore: 2 },
      { value: 'no', label: 'APIs are not secured or not applicable', riskScore: 3 }
    ],
    helpText: 'API security prevents unauthorized access to PHI. OCR auditors expect to see evidence of API security. Lack of security is a finding.',
    hipaaCitation: '45 CFR §164.312(a)(2)(ii)',
    severityWeight: 3
  },
  {
    id: 'security-information-event-management',
    category: 'technical',
    categoryLabel: 'Technical Safeguards',
    text: 'Does your organization use Security Information and Event Management (SIEM) or similar solutions to aggregate and analyze security logs?',
    options: [
      { value: 'yes', label: 'Yes, SIEM implemented with active monitoring and alerting', riskScore: 0 },
      { value: 'partial', label: 'Some log aggregation exists but not comprehensive SIEM', riskScore: 2 },
      { value: 'no', label: 'No SIEM or log aggregation solution', riskScore: 3 }
    ],
    helpText: 'SIEM solutions help detect security incidents. OCR auditors increasingly expect to see SIEM. Lack of SIEM is a finding.',
    hipaaCitation: '45 CFR §164.312(b)',
    severityWeight: 3
  },
  {
    id: 'penetration-testing',
    category: 'technical',
    categoryLabel: 'Technical Safeguards',
    text: 'Does your organization conduct regular penetration testing or security assessments of systems that access PHI?',
    options: [
      { value: 'yes', label: 'Yes, regular penetration testing with documented findings and remediation', riskScore: 0 },
      { value: 'partial', label: 'Some testing occurs but not regular or comprehensive', riskScore: 2 },
      { value: 'no', label: 'No penetration testing or security assessments', riskScore: 3 }
    ],
    helpText: 'Penetration testing identifies security vulnerabilities. OCR auditors expect to see evidence of regular testing. Lack of testing is a finding.',
    hipaaCitation: '45 CFR §164.308(a)(1)(ii)(A)',
    severityWeight: 3
  },
  {
    id: 'vulnerability-scanning',
    category: 'technical',
    categoryLabel: 'Technical Safeguards',
    text: 'Does your organization perform regular vulnerability scans of systems and networks that process PHI?',
    options: [
      { value: 'yes', label: 'Yes, regular vulnerability scans with documented findings and remediation', riskScore: 0 },
      { value: 'partial', label: 'Some scanning occurs but not regular or comprehensive', riskScore: 2 },
      { value: 'no', label: 'No vulnerability scanning performed', riskScore: 4 }
    ],
    helpText: 'Vulnerability scanning identifies security weaknesses. OCR auditors expect to see evidence of regular scanning. Lack of scanning is a finding.',
    hipaaCitation: '45 CFR §164.308(a)(1)(ii)(A)',
    severityWeight: 4
  },
  {
    id: 'change-management',
    category: 'technical',
    categoryLabel: 'Technical Safeguards',
    text: 'Does your organization have a documented change management process for systems that access PHI, including testing and approval?',
    options: [
      { value: 'yes', label: 'Yes, formal change management process with testing and approval', riskScore: 0 },
      { value: 'partial', label: 'Some change management exists but not formal or comprehensive', riskScore: 2 },
      { value: 'no', label: 'No formal change management process', riskScore: 3 }
    ],
    helpText: 'Change management prevents unauthorized or risky system changes. OCR auditors expect to see evidence of a formal process. Lack of a process is a finding.',
    hipaaCitation: '45 CFR §164.308(a)(1)(ii)(B)',
    severityWeight: 3
  },
  {
    id: 'configuration-management',
    category: 'technical',
    categoryLabel: 'Technical Safeguards',
    text: 'Does your organization maintain secure configuration baselines and monitor systems for configuration drift?',
    options: [
      { value: 'yes', label: 'Yes, secure baselines defined and monitored for compliance', riskScore: 0 },
      { value: 'partial', label: 'Some configuration management exists but not comprehensive', riskScore: 2 },
      { value: 'no', label: 'No configuration management or baseline monitoring', riskScore: 3 }
    ],
    helpText: 'Configuration management ensures systems remain secure. OCR auditors expect to see evidence of configuration controls. Lack of controls is a finding.',
    hipaaCitation: '45 CFR §164.308(a)(1)(ii)(B)',
    severityWeight: 3
  },
  {
    id: 'backup-encryption',
    category: 'technical',
    categoryLabel: 'Technical Safeguards',
    text: 'Are all backups of PHI encrypted to prevent unauthorized access if backup media is lost or stolen?',
    options: [
      { value: 'yes', label: 'Yes, all backups are encrypted', riskScore: 0 },
      { value: 'partial', label: 'Some backups are encrypted but not all', riskScore: 2 },
      { value: 'no', label: 'Backups are not encrypted', riskScore: 4 }
    ],
    helpText: 'Backup encryption protects PHI if backup media is lost. OCR auditors expect to see evidence of encryption. Lack of encryption is a finding.',
    hipaaCitation: '45 CFR §164.312(a)(2)(ii)',
    severityWeight: 4
  },
  {
    id: 'backup-storage-location',
    category: 'technical',
    categoryLabel: 'Technical Safeguards',
    text: 'Are backups stored in a secure, offsite location separate from primary systems?',
    options: [
      { value: 'yes', label: 'Yes, backups stored in secure offsite location', riskScore: 0 },
      { value: 'partial', label: 'Some backups stored offsite but not all or location not secure', riskScore: 2 },
      { value: 'no', label: 'Backups are not stored offsite', riskScore: 3 }
    ],
    helpText: 'Offsite backup storage protects against disasters. OCR auditors expect to see evidence of offsite storage. Lack of offsite storage is a finding.',
    hipaaCitation: '45 CFR §164.308(a)(7)(ii)(A)',
    severityWeight: 3
  },
  {
    id: 'key-management',
    category: 'technical',
    categoryLabel: 'Technical Safeguards',
    text: 'Does your organization have secure procedures for managing encryption keys, including generation, storage, rotation, and destruction?',
    options: [
      { value: 'yes', label: 'Yes, comprehensive key management with secure storage and rotation', riskScore: 0 },
      { value: 'partial', label: 'Some key management exists but not comprehensive', riskScore: 2 },
      { value: 'no', label: 'No formal key management procedures', riskScore: 4 }
    ],
    helpText: 'Key management is critical for encryption security. OCR auditors expect to see evidence of secure key management. Lack of procedures is a finding.',
    hipaaCitation: '45 CFR §164.312(a)(2)(ii)',
    severityWeight: 4
  },
  {
    id: 'secure-coding-standards',
    category: 'technical',
    categoryLabel: 'Technical Safeguards',
    text: 'If your organization develops custom applications, are secure coding standards followed and code reviews conducted?',
    options: [
      { value: 'yes', label: 'Yes, secure coding standards followed with code reviews', riskScore: 0 },
      { value: 'partial', label: 'Some secure coding practices but not comprehensive', riskScore: 2 },
      { value: 'no', label: 'No secure coding standards or not applicable', riskScore: 3 }
    ],
    helpText: 'Secure coding prevents application vulnerabilities. OCR auditors expect to see evidence of secure coding practices. Lack of practices is a finding.',
    hipaaCitation: '45 CFR §164.308(a)(1)(ii)(B)',
    severityWeight: 3
  },
  {
    id: 'third-party-security-assessments',
    category: 'technical',
    categoryLabel: 'Technical Safeguards',
    text: 'Does your organization engage third-party security firms to conduct independent security assessments?',
    options: [
      { value: 'yes', label: 'Yes, regular third-party assessments with documented findings', riskScore: 0 },
      { value: 'partial', label: 'Some third-party assessments but not regular', riskScore: 1 },
      { value: 'no', label: 'No third-party security assessments', riskScore: 2 }
    ],
    helpText: 'Third-party assessments provide independent security validation. While not required, they demonstrate due diligence. Lack of assessments is a minor finding.',
    hipaaCitation: '45 CFR §164.308(a)(1)(ii)(A)',
    severityWeight: 2
  },
  {
    id: 'security-policy-document',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization have a comprehensive, written HIPAA Security Policy document that addresses all required safeguards?',
    options: [
      { value: 'yes', label: 'Yes, comprehensive written policy covering all safeguards', riskScore: 0 },
      { value: 'partial', label: 'Policy exists but is incomplete or not comprehensive', riskScore: 2 },
      { value: 'no', label: 'No written security policy document', riskScore: 4 }
    ],
    helpText: 'A written security policy is the foundation of HIPAA compliance. OCR auditors expect to see a comprehensive policy document. Lack of a policy is a finding.',
    hipaaCitation: '45 CFR §164.308(a)(1)(i)',
    severityWeight: 4
  },
  {
    id: 'policy-review-update',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization regularly review and update security and privacy policies to reflect current threats and regulatory changes?',
    options: [
      { value: 'yes', label: 'Yes, policies reviewed and updated at least annually', riskScore: 0 },
      { value: 'partial', label: 'Policies reviewed occasionally but not regularly', riskScore: 2 },
      { value: 'no', label: 'Policies are not regularly reviewed or updated', riskScore: 3 }
    ],
    helpText: 'Regular policy review ensures policies remain current and effective. OCR auditors expect to see evidence of review. Lack of review is a finding.',
    hipaaCitation: '45 CFR §164.308(a)(1)(i)',
    severityWeight: 3
  },
  {
    id: 'policy-communication',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Are security and privacy policies communicated to all workforce members, and do you maintain documentation of policy acknowledgment?',
    options: [
      { value: 'yes', label: 'Yes, policies communicated to all staff with documented acknowledgment', riskScore: 0 },
      { value: 'partial', label: 'Policies communicated but acknowledgment not documented for all', riskScore: 2 },
      { value: 'no', label: 'Policies are not communicated or acknowledgment is not documented', riskScore: 3 }
    ],
    helpText: 'Policy communication ensures workforce awareness. OCR auditors expect to see evidence of communication and acknowledgment. Lack of communication is a finding.',
    hipaaCitation: '45 CFR §164.308(a)(5)(i)',
    severityWeight: 3
  },
  {
    id: 'risk-assessment-scope',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your Security Risk Analysis cover all systems, applications, and locations where PHI is created, received, maintained, or transmitted?',
    options: [
      { value: 'yes', label: 'Yes, comprehensive scope covering all PHI systems and locations', riskScore: 0 },
      { value: 'partial', label: 'SRA covers most systems but may miss some locations or applications', riskScore: 2 },
      { value: 'no', label: 'SRA scope is incomplete or does not cover all PHI systems', riskScore: 4 }
    ],
    helpText: 'A comprehensive SRA must cover all PHI systems. OCR auditors verify SRA scope. Incomplete scope is a finding.',
    hipaaCitation: '45 CFR §164.308(a)(1)(ii)(A)',
    severityWeight: 4
  },
  {
    id: 'risk-assessment-documentation',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Is your Security Risk Analysis thoroughly documented, including identified threats, vulnerabilities, risks, and remediation plans?',
    options: [
      { value: 'yes', label: 'Yes, comprehensive documentation with all required elements', riskScore: 0 },
      { value: 'partial', label: 'Documentation exists but is incomplete or lacks some elements', riskScore: 2 },
      { value: 'no', label: 'SRA documentation is minimal or missing', riskScore: 4 }
    ],
    helpText: 'SRA documentation is critical for audit defense. OCR auditors expect comprehensive documentation. Lack of documentation is a finding.',
    hipaaCitation: '45 CFR §164.308(a)(1)(ii)(A)',
    severityWeight: 4
  },
  {
    id: 'access-request-procedures',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization have documented procedures for handling patient requests to access, amend, or receive copies of their PHI?',
    options: [
      { value: 'yes', label: 'Yes, comprehensive procedures with defined timelines and processes', riskScore: 0 },
      { value: 'partial', label: 'Procedures exist but are incomplete or timelines not defined', riskScore: 2 },
      { value: 'no', label: 'No documented procedures for patient access requests', riskScore: 3 }
    ],
    helpText: 'Patient access rights are a core HIPAA requirement. OCR auditors expect to see documented procedures. Lack of procedures is a finding.',
    hipaaCitation: '45 CFR §164.524',
    severityWeight: 3
  },
  {
    id: 'minimum-necessary-policy',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization have a documented Minimum Necessary Policy that limits PHI access and disclosure to the minimum needed?',
    options: [
      { value: 'yes', label: 'Yes, comprehensive policy with clear guidelines and enforcement', riskScore: 0 },
      { value: 'partial', label: 'Policy exists but guidelines are not clear or not consistently enforced', riskScore: 2 },
      { value: 'no', label: 'No minimum necessary policy', riskScore: 4 }
    ],
    helpText: 'The minimum necessary principle is fundamental to HIPAA. OCR auditors expect to see a documented policy. Lack of a policy is a finding.',
    hipaaCitation: '45 CFR §164.502(b)',
    severityWeight: 4
  },
  {
    id: 'phi-disclosure-logging',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization maintain logs of PHI disclosures, including accounting of disclosures to patients upon request?',
    options: [
      { value: 'yes', label: 'Yes, comprehensive disclosure logging with accounting procedures', riskScore: 0 },
      { value: 'partial', label: 'Some disclosure logging exists but not comprehensive', riskScore: 2 },
      { value: 'no', label: 'No disclosure logging or accounting procedures', riskScore: 3 }
    ],
    helpText: 'Disclosure accounting is required by HIPAA. OCR auditors expect to see evidence of logging. Lack of logging is a finding.',
    hipaaCitation: '45 CFR §164.528',
    severityWeight: 3
  },
  {
    id: 'patient-complaint-procedures',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization have documented procedures for receiving, investigating, and responding to patient privacy complaints?',
    options: [
      { value: 'yes', label: 'Yes, comprehensive procedures with investigation and response processes', riskScore: 0 },
      { value: 'partial', label: 'Procedures exist but are incomplete or not consistently followed', riskScore: 2 },
      { value: 'no', label: 'No documented complaint procedures', riskScore: 3 }
    ],
    helpText: 'Patient complaint procedures are required by HIPAA. OCR auditors expect to see documented procedures. Lack of procedures is a finding.',
    hipaaCitation: '45 CFR §164.530(d)',
    severityWeight: 3
  },
  {
    id: 'workforce-clearance-procedures',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization have documented procedures for determining appropriate clearance levels for workforce members based on their job functions?',
    options: [
      { value: 'yes', label: 'Yes, formal clearance procedures with defined levels and processes', riskScore: 0 },
      { value: 'partial', label: 'Procedures exist but are informal or not consistently applied', riskScore: 2 },
      { value: 'no', label: 'No clearance procedures. Access is granted without clearance determination', riskScore: 3 }
    ],
    helpText: 'Clearance procedures ensure appropriate access levels. OCR auditors expect to see evidence of procedures. Lack of procedures is a finding.',
    hipaaCitation: '45 CFR §164.308(a)(3)(ii)(C)',
    severityWeight: 3
  },
  {
    id: 'security-control-testing',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization regularly test security controls to ensure they are functioning as intended and effectively protecting PHI?',
    options: [
      { value: 'yes', label: 'Yes, regular testing of security controls with documented results', riskScore: 0 },
      { value: 'partial', label: 'Some testing occurs but not regular or comprehensive', riskScore: 2 },
      { value: 'no', label: 'Security controls are not regularly tested', riskScore: 3 }
    ],
    helpText: 'Control testing ensures security measures are effective. OCR auditors expect to see evidence of testing. Lack of testing is a finding.',
    hipaaCitation: '45 CFR §164.308(a)(1)(ii)(B)',
    severityWeight: 3
  },
  {
    id: 'compliance-officer-designation',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Has your organization designated a Compliance Officer or assigned compliance responsibilities to ensure ongoing HIPAA compliance?',
    options: [
      { value: 'yes', label: 'Yes, Compliance Officer designated with documented responsibilities', riskScore: 0 },
      { value: 'partial', label: 'Compliance responsibilities assigned but not formally designated', riskScore: 1 },
      { value: 'no', label: 'No Compliance Officer or assigned compliance responsibilities', riskScore: 2 }
    ],
    helpText: 'A Compliance Officer helps ensure ongoing compliance. While not explicitly required, it demonstrates organizational commitment. Lack of designation is a minor finding.',
    hipaaCitation: '45 CFR §164.308(a)(2)',
    severityWeight: 2
  },
  {
    id: 'ongoing-compliance-monitoring',
    category: 'administrative',
    categoryLabel: 'Administrative Safeguards',
    text: 'Does your organization have an ongoing compliance monitoring program that regularly assesses HIPAA compliance and identifies areas for improvement?',
    options: [
      { value: 'yes', label: 'Yes, comprehensive monitoring program with regular assessments and improvement tracking', riskScore: 0 },
      { value: 'partial', label: 'Some monitoring exists but not comprehensive or regular', riskScore: 2 },
      { value: 'no', label: 'No ongoing compliance monitoring program', riskScore: 3 }
    ],
    helpText: 'Ongoing compliance monitoring ensures continuous improvement. OCR auditors expect to see evidence of active monitoring. Lack of monitoring is a finding.',
    hipaaCitation: '45 CFR §164.308(a)(1)(ii)(D)',
    severityWeight: 3
  }
];
