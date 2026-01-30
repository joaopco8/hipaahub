/**
 * Question-to-Document Binding System
 * Maps each onboarding question to specific fields in HIPAA documents
 * 
 * This is the core data model for dynamic document generation.
 * Every question MUST declare which document fields it affects.
 */

export type ComplianceStatus = 'COMPLIANT' | 'PARTIAL' | 'NON_COMPLIANT';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface QuestionAnswer {
  question_id: string;
  selected_option: string;
  compliance_status: ComplianceStatus;
  risk_level: RiskLevel;
  evidence_files: Array<{
    file_id: string;
    file_name: string;
    uploaded_at: string;
  }>;
  attestation_signed: boolean;
  timestamp: string;
  ip_address: string;
}

export interface DocumentFieldBinding {
  document_name: string;
  field_name: string;
  priority: number; // Lower = higher priority for conflict resolution
}

export interface QuestionBinding {
  question_id: string;
  affects: DocumentFieldBinding[];
  legal_statements: {
    COMPLIANT: string;
    PARTIAL: string;
    NON_COMPLIANT: string;
  };
}

/**
 * Document Field Names (Injection Points)
 * These are the dynamic fields that will be replaced in document templates
 */
export const DOCUMENT_FIELDS = {
  // Master Policy
  SRA_STATEMENT: 'SRA_STATEMENT',
  SECURITY_POSTURE: 'SECURITY_POSTURE',
  AUDIT_EVIDENCE_LIST: 'AUDIT_EVIDENCE_LIST',
  INCIDENT_DEFENSIBILITY: 'INCIDENT_DEFENSIBILITY',
  
  // SRA Policy
  SRA_FREQUENCY: 'SRA_FREQUENCY',
  SRA_SCOPE: 'SRA_SCOPE',
  SRA_DOCUMENTATION: 'SRA_DOCUMENTATION',
  
  // Risk Management Plan
  RISK_MGMT_ACTIONS: 'RISK_MGMT_ACTIONS',
  REMEDIATION_COMMITMENTS: 'REMEDIATION_COMMITMENTS',
  
  // Access Control Policy
  ACCESS_CONTROL_STATUS: 'ACCESS_CONTROL_STATUS',
  ACCESS_PROCEDURES: 'ACCESS_PROCEDURES',
  
  // Training Policy
  TRAINING_STATUS: 'TRAINING_STATUS',
  TRAINING_FREQUENCY: 'TRAINING_FREQUENCY',
  
  // Sanction Policy
  SANCTIONS_APPLIED: 'SANCTIONS_APPLIED',
  
  // Incident Response Policy
  INCIDENT_PROCEDURES: 'INCIDENT_PROCEDURES',
  BREACH_NOTIFICATION_STATUS: 'BREACH_NOTIFICATION_STATUS',
  
  // Business Associate Policy
  VENDOR_RISK: 'VENDOR_RISK',
  BAA_STATUS: 'BAA_STATUS',
  
  // Audit Logs Policy
  AUDIT_REVIEW_STATUS: 'AUDIT_REVIEW_STATUS',
  LOG_RETENTION: 'LOG_RETENTION',
} as const;

/**
 * Question-to-Document Binding Map
 * First 50 questions mapped to document fields
 */
export const QUESTION_DOCUMENT_BINDINGS: QuestionBinding[] = [
  // Question 1: Security Officer
  {
    question_id: 'security-officer',
    affects: [
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 1 },
      { document_name: 'SRAPolicy', field_name: 'SRA_STATEMENT', priority: 2 },
      { document_name: 'RiskManagementPlan', field_name: 'RISK_MGMT_ACTIONS', priority: 3 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization has formally designated a Security Officer with documented responsibility for developing, implementing, and maintaining HIPAA security policies and procedures. The Security Officer has explicit authority and is empowered to make decisions regarding security matters.',
      PARTIAL: 'The organization has designated a Security Officer, however the responsibilities are informal or not fully documented. The organization is committed to formalizing the Security Officer role and documenting all responsibilities and authorities.',
      NON_COMPLIANT: 'The organization has identified the absence of a formally designated Security Officer and has committed to designating a qualified individual with documented responsibilities and authority for HIPAA security compliance. This designation will be completed within 30 days.',
    },
  },
  
  // Question 2: Privacy Officer
  {
    question_id: 'privacy-officer',
    affects: [
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 1 },
      { document_name: 'IncidentResponsePolicy', field_name: 'BREACH_NOTIFICATION_STATUS', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization has formally designated a Privacy Officer responsible for developing and implementing privacy policies, handling patient requests, and managing breach notifications. The Privacy Officer has explicit authority and serves as the primary contact for privacy-related matters.',
      PARTIAL: 'The organization has designated a Privacy Officer, however the responsibilities are informal or not fully documented. The organization is committed to formalizing the Privacy Officer role and documenting all responsibilities.',
      NON_COMPLIANT: 'The organization has identified the absence of a formally designated Privacy Officer and has committed to designating a qualified individual with documented responsibilities for HIPAA privacy compliance. This designation will be completed within 30 days.',
    },
  },
  
  // Question 3: Risk Assessment Conducted (SRA)
  {
    question_id: 'risk-assessment-conducted',
    affects: [
      { document_name: 'MasterPolicy', field_name: 'SRA_STATEMENT', priority: 1 },
      { document_name: 'SRAPolicy', field_name: 'SRA_FREQUENCY', priority: 1 },
      { document_name: 'SRAPolicy', field_name: 'SRA_DOCUMENTATION', priority: 1 },
      { document_name: 'RiskManagementPlan', field_name: 'RISK_MGMT_ACTIONS', priority: 2 },
      { document_name: 'AuditLogsPolicy', field_name: 'AUDIT_EVIDENCE_LIST', priority: 3 },
      { document_name: 'IncidentResponsePolicy', field_name: 'INCIDENT_DEFENSIBILITY', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization conducts a comprehensive Security Risk Analysis (SRA) at least annually, or more frequently if significant system changes occur. The SRA includes comprehensive documentation of threats, vulnerabilities, and risk assessments. The most recent SRA was conducted with full documentation and is current.',
      PARTIAL: 'The organization conducts Security Risk Analyses, however the frequency does not meet the annual requirement or documentation is incomplete. The last SRA is over 12 months old. The organization has committed to conducting a comprehensive SRA within 60 days and establishing an annual review schedule.',
      NON_COMPLIANT: 'The organization has identified the absence of a current formal Security Risk Analysis. The organization has formally committed to conducting a comprehensive SRA within 90 days and establishing procedures for annual reviews. This commitment includes documentation of all identified risks and vulnerabilities.',
    },
  },
  
  // Question 4: Risk Management Plan
  {
    question_id: 'risk-management-plan',
    affects: [
      { document_name: 'RiskManagementPlan', field_name: 'RISK_MGMT_ACTIONS', priority: 1 },
      { document_name: 'MasterPolicy', field_name: 'SRA_STATEMENT', priority: 2 },
      { document_name: 'AuditLogsPolicy', field_name: 'AUDIT_EVIDENCE_LIST', priority: 3 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization maintains a documented Risk Management Plan that addresses all identified vulnerabilities and specifies remediation actions, timelines, responsible parties, and tracking mechanisms. The plan is actively monitored and updated as risks are mitigated.',
      PARTIAL: 'The organization has a Risk Management Plan, however it is incomplete, lacks specific timelines, or tracking is informal. The organization has committed to enhancing the plan with specific remediation actions, timelines, and responsible parties within 45 days.',
      NON_COMPLIANT: 'The organization has identified the absence of a documented Risk Management Plan that addresses identified risks. The organization has formally committed to developing a comprehensive Risk Management Plan within 60 days, including specific remediation actions, timelines, and responsible parties.',
    },
  },
  
  // Question 5: Sanction Policy
  {
    question_id: 'sanction-policy',
    affects: [
      { document_name: 'SanctionPolicy', field_name: 'SANCTIONS_APPLIED', priority: 1 },
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 2 },
      { document_name: 'WorkforceTrainingPolicy', field_name: 'TRAINING_STATUS', priority: 3 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization maintains a documented Sanction Policy that specifies progressive disciplinary actions (warning, suspension, termination) for workforce members who violate HIPAA security and privacy policies. The policy is communicated to all staff and is consistently enforced.',
      PARTIAL: 'The organization has a Sanction Policy, however it is informal or not consistently applied. Not all staff are aware of the policy. The organization has committed to formalizing the policy, ensuring all staff are trained on it, and applying it consistently within 30 days.',
      NON_COMPLIANT: 'The organization has identified the absence of a documented Sanction Policy or that the policy is not enforced. The organization has formally committed to developing and implementing a comprehensive Sanction Policy with progressive discipline within 45 days, and ensuring all staff are trained on the policy.',
    },
  },
  
  // Question 6: Information System Activity Review
  {
    question_id: 'information-system-activity-review',
    affects: [
      { document_name: 'AuditLogsPolicy', field_name: 'AUDIT_REVIEW_STATUS', priority: 1 },
      { document_name: 'IncidentResponsePolicy', field_name: 'INCIDENT_PROCEDURES', priority: 2 },
      { document_name: 'AuditLogsPolicy', field_name: 'AUDIT_EVIDENCE_LIST', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization has a formal process for regularly reviewing information system activity, including audit logs, access reports, and system events, at least monthly. Unauthorized access is promptly investigated and documented. The review process is comprehensive and systematic.',
      PARTIAL: 'The organization reviews logs but not regularly, or the review is not documented. The investigation process is informal. The organization has committed to establishing a formal monthly review process with documentation and systematic investigation procedures within 45 days.',
      NON_COMPLIANT: 'The organization has identified the absence of regular log review procedures or that logs are not maintained. The organization has formally committed to implementing a comprehensive log review process, including regular monthly reviews, documentation, and investigation procedures within 60 days.',
    },
  },
  
  // Question 7: Workforce Authorization
  {
    question_id: 'workforce-authorization',
    affects: [
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_CONTROL_STATUS', priority: 1 },
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_PROCEDURES', priority: 1 },
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization has documented procedures for authorizing workforce members to access PHI based on their job function and the principle of minimum necessary access. Access is granted through role-based access control (RBAC) and is consistently applied.',
      PARTIAL: 'The organization has authorization procedures, however they are informal or not consistently applied. Some users have excessive access. The organization has committed to formalizing procedures, implementing RBAC consistently, and reviewing all user access within 60 days.',
      NON_COMPLIANT: 'The organization has identified the absence of documented authorization procedures or that access is granted ad hoc without consideration of job function. The organization has formally committed to developing and implementing comprehensive authorization procedures based on job function and minimum necessary access within 90 days.',
    },
  },
  
  // Question 8: Workforce Supervision
  {
    question_id: 'workforce-supervision',
    affects: [
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_PROCEDURES', priority: 1 },
      { document_name: 'AuditLogsPolicy', field_name: 'AUDIT_REVIEW_STATUS', priority: 2 },
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 3 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization has formal supervision procedures with regular monitoring of access logs and user activity. Anomalies are promptly investigated and documented. The supervision process ensures compliance with security policies.',
      PARTIAL: 'The organization has supervision procedures, however they are informal or inconsistent. Monitoring is not regular or not documented. The organization has committed to formalizing supervision procedures and establishing regular monitoring with documentation within 45 days.',
      NON_COMPLIANT: 'The organization has identified the absence of supervision procedures or monitoring. The organization has formally committed to developing and implementing comprehensive supervision and monitoring procedures within 60 days, including regular review of access logs and user activity.',
    },
  },
  
  // Question 9: Workforce Clearance
  {
    question_id: 'workforce-clearance',
    affects: [
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_PROCEDURES', priority: 2 },
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 3 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization conducts background checks for all staff with PHI access. The process is documented and consistently applied. This vetting process helps ensure workforce security.',
      PARTIAL: 'The organization conducts background checks for some positions but not all. The process is inconsistent. The organization has committed to establishing a comprehensive background check process for all staff with PHI access within 60 days.',
      NON_COMPLIANT: 'The organization has identified the absence of background check procedures. The organization has formally committed to developing and implementing a comprehensive background check process for all staff with PHI access within 90 days.',
    },
  },
  
  // Question 10: Workforce Termination
  {
    question_id: 'workforce-termination',
    affects: [
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_PROCEDURES', priority: 1 },
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_CONTROL_STATUS', priority: 1 },
      { document_name: 'IncidentResponsePolicy', field_name: 'INCIDENT_PROCEDURES', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization has formal procedures for promptly revoking access to PHI when workforce members are terminated or change roles. Access revocation is immediate upon termination, and the process is documented and tracked across all systems.',
      PARTIAL: 'The organization has termination procedures, however access revocation is delayed or inconsistent. Not all systems are updated promptly. The organization has committed to establishing immediate access revocation procedures across all systems within 30 days.',
      NON_COMPLIANT: 'The organization has identified the absence of procedures for prompt access revocation or that former employees retain access. The organization has formally committed to developing and implementing comprehensive access revocation procedures with immediate action upon termination within 45 days.',
    },
  },
  
  // Question 11: Access Control Policies
  {
    question_id: 'access-control-policies',
    affects: [
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_CONTROL_STATUS', priority: 1 },
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_PROCEDURES', priority: 1 },
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization maintains comprehensive documented policies that define who can access PHI, under what circumstances, and what level of access is permitted. Policies include role-based access control (RBAC) and clear access levels.',
      PARTIAL: 'The organization has access control policies, however they are incomplete or not consistently applied. The organization has committed to enhancing policies with comprehensive RBAC and clear access levels within 60 days.',
      NON_COMPLIANT: 'The organization has identified the absence of documented access control policies. The organization has formally committed to developing comprehensive access control policies with RBAC and clear access levels within 90 days.',
    },
  },
  
  // Question 12: Access Authorization
  {
    question_id: 'access-authorization',
    affects: [
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_PROCEDURES', priority: 1 },
      { document_name: 'AuditLogsPolicy', field_name: 'AUDIT_REVIEW_STATUS', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization has formal procedures to authorize and supervise access to PHI, including procedures for granting, modifying, and revoking access. Access changes are tracked and audited.',
      PARTIAL: 'The organization has authorization procedures, however they are informal or not consistently followed. Tracking is incomplete. The organization has committed to formalizing procedures and implementing comprehensive tracking within 45 days.',
      NON_COMPLIANT: 'The organization has identified the absence of authorization procedures or that access is granted ad hoc without approval or tracking. The organization has formally committed to developing and implementing comprehensive authorization procedures with tracking within 90 days.',
    },
  },
  
  // Question 13: Access Termination
  {
    question_id: 'access-termination',
    affects: [
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_PROCEDURES', priority: 1 },
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_CONTROL_STATUS', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization has formal procedures to promptly terminate or modify access to PHI when it is no longer needed for job function. Termination occurs immediately upon role change or termination.',
      PARTIAL: 'The organization has termination procedures, however termination is delayed or inconsistent. The organization has committed to establishing immediate termination procedures within 30 days.',
      NON_COMPLIANT: 'The organization has identified the absence of procedures for prompt access termination. The organization has formally committed to developing and implementing comprehensive access termination procedures with immediate action within 45 days.',
    },
  },
  
  // Question 14: Security Awareness Training
  {
    question_id: 'security-awareness-training',
    affects: [
      { document_name: 'WorkforceTrainingPolicy', field_name: 'TRAINING_STATUS', priority: 1 },
      { document_name: 'WorkforceTrainingPolicy', field_name: 'TRAINING_FREQUENCY', priority: 1 },
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization maintains a documented Security Awareness and Training Program that covers HIPAA requirements, security policies, and best practices. The program includes annual training for all staff, and training is comprehensive and current.',
      PARTIAL: 'The organization has a training program, however it is incomplete or not annual. Not all staff are trained. The organization has committed to enhancing the program with comprehensive annual training for all staff within 60 days.',
      NON_COMPLIANT: 'The organization has identified the absence of a formal training program or that training is minimal and infrequent. The organization has formally committed to developing and implementing a comprehensive Security Awareness and Training Program with annual training for all staff within 90 days.',
    },
  },
  
  // Question 15: Initial HIPAA Training
  {
    question_id: 'initial-hipaa-training',
    affects: [
      { document_name: 'WorkforceTrainingPolicy', field_name: 'TRAINING_STATUS', priority: 1 },
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_PROCEDURES', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization requires all new workforce members to complete HIPAA security and privacy training before accessing PHI. Training is documented and tracked, and access is not granted until training is completed.',
      PARTIAL: 'The organization requires initial training, however it is not always completed before access is granted. Documentation is incomplete. The organization has committed to enforcing training completion before access within 30 days.',
      NON_COMPLIANT: 'The organization has identified the absence of a requirement for initial training. The organization has formally committed to implementing a requirement for all new staff to complete HIPAA training before accessing PHI within 60 days.',
    },
  },
  
  // Question 16: Annual HIPAA Training
  {
    question_id: 'annual-hipaa-training',
    affects: [
      { document_name: 'WorkforceTrainingPolicy', field_name: 'TRAINING_FREQUENCY', priority: 1 },
      { document_name: 'WorkforceTrainingPolicy', field_name: 'TRAINING_STATUS', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization requires all workforce members to complete annual HIPAA security and privacy training refresher. Training is documented and tracked, and all staff complete training annually.',
      PARTIAL: 'The organization requires annual training, however not all staff complete it annually. Documentation is incomplete. The organization has committed to ensuring all staff complete annual training within 60 days.',
      NON_COMPLIANT: 'The organization has identified the absence of annual refresher training requirements. The organization has formally committed to implementing annual training requirements for all staff within 90 days.',
    },
  },
  
  // Question 17: Role-Specific Training
  {
    question_id: 'role-specific-training',
    affects: [
      { document_name: 'WorkforceTrainingPolicy', field_name: 'TRAINING_STATUS', priority: 1 },
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization provides role-specific security training for staff with elevated access or special responsibilities, including IT staff, Security Officer, and Privacy Officer. Training is documented and current.',
      PARTIAL: 'The organization provides role-specific training to some staff but not all. Training is not regularly updated. The organization has committed to providing comprehensive role-specific training to all staff with elevated access within 60 days.',
      NON_COMPLIANT: 'The organization has identified the absence of role-specific training. The organization has formally committed to developing and implementing role-specific training for all staff with elevated access within 90 days.',
    },
  },
  
  // Question 18: Incident Reporting Training
  {
    question_id: 'incident-reporting-training',
    affects: [
      { document_name: 'WorkforceTrainingPolicy', field_name: 'TRAINING_STATUS', priority: 1 },
      { document_name: 'IncidentResponsePolicy', field_name: 'INCIDENT_PROCEDURES', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization trains all workforce members on how to recognize and report security incidents, suspicious activity, and potential breaches. Training includes examples and clear reporting channels.',
      PARTIAL: 'The organization provides incident reporting training, however it is not comprehensive. Reporting procedures are not clear to all staff. The organization has committed to enhancing training with comprehensive procedures and clear reporting channels within 45 days.',
      NON_COMPLIANT: 'The organization has identified the absence of training on incident reporting. The organization has formally committed to developing and implementing comprehensive incident reporting training for all staff within 60 days.',
    },
  },
  
  // Question 19: Incident Response Plan
  {
    question_id: 'incident-response-plan',
    affects: [
      { document_name: 'IncidentResponsePolicy', field_name: 'INCIDENT_PROCEDURES', priority: 1 },
      { document_name: 'MasterPolicy', field_name: 'INCIDENT_DEFENSIBILITY', priority: 1 },
      { document_name: 'RiskManagementPlan', field_name: 'RISK_MGMT_ACTIONS', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization maintains a documented Incident Response Plan that defines procedures for detecting, responding to, and reporting security incidents and breaches. The plan includes defined procedures, roles, timelines, and escalation paths, and is tested regularly.',
      PARTIAL: 'The organization has an incident response plan, however it is incomplete or not regularly tested. Procedures are not clear. The organization has committed to enhancing the plan with comprehensive procedures and regular testing within 60 days.',
      NON_COMPLIANT: 'The organization has identified the absence of an incident response plan. The organization has formally committed to developing and implementing a comprehensive Incident Response Plan with defined procedures, roles, timelines, and escalation paths within 90 days.',
    },
  },
  
  // Question 20: Incident Detection and Analysis
  {
    question_id: 'incident-detection-analysis',
    affects: [
      { document_name: 'IncidentResponsePolicy', field_name: 'INCIDENT_PROCEDURES', priority: 1 },
      { document_name: 'AuditLogsPolicy', field_name: 'AUDIT_REVIEW_STATUS', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization has formal procedures to detect security incidents, analyze them to determine if they constitute a breach, and document findings. Breach determination is made within 60 days, and the analysis process is documented.',
      PARTIAL: 'The organization has detection and analysis procedures, however analysis is not always documented. Breach determination is delayed. The organization has committed to formalizing procedures with comprehensive documentation and timely breach determination within 45 days.',
      NON_COMPLIANT: 'The organization has identified the absence of formal procedures for incident detection and analysis or that incidents are not analyzed or documented. The organization has formally committed to developing and implementing comprehensive detection and analysis procedures within 90 days.',
    },
  },
  
  // Question 21: Breach Notification Procedures
  {
    question_id: 'breach-notification-procedures',
    affects: [
      { document_name: 'IncidentResponsePolicy', field_name: 'BREACH_NOTIFICATION_STATUS', priority: 1 },
      { document_name: 'IncidentResponsePolicy', field_name: 'INCIDENT_PROCEDURES', priority: 1 },
      { document_name: 'MasterPolicy', field_name: 'INCIDENT_DEFENSIBILITY', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization maintains documented procedures for notifying affected individuals, the HHS Secretary, and the media (if applicable) of breaches within 60 days of discovery. Procedures include templates, timelines, and escalation paths, and are tested regularly.',
      PARTIAL: 'The organization has breach notification procedures, however they are incomplete or not regularly tested. Timelines are not clear. The organization has committed to enhancing procedures with comprehensive templates, clear timelines, and regular testing within 60 days.',
      NON_COMPLIANT: 'The organization has identified the absence of breach notification procedures or that notification is ad hoc. The organization has formally committed to developing and implementing comprehensive breach notification procedures with templates, timelines, and escalation paths within 90 days.',
    },
  },
  
  // Question 22: Incident Mitigation and Recovery
  {
    question_id: 'incident-mitigation-recovery',
    affects: [
      { document_name: 'IncidentResponsePolicy', field_name: 'INCIDENT_PROCEDURES', priority: 1 },
      { document_name: 'RiskManagementPlan', field_name: 'RISK_MGMT_ACTIONS', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization has formal procedures to mitigate the impact of security incidents and recover systems to normal operations. Procedures include defined mitigation steps and recovery timelines, and are tested regularly.',
      PARTIAL: 'The organization has mitigation and recovery procedures, however they are informal or not regularly tested. Recovery timelines are not defined. The organization has committed to formalizing procedures with defined steps and timelines within 45 days.',
      NON_COMPLIANT: 'The organization has identified the absence of mitigation and recovery procedures or that incident response is ad hoc. The organization has formally committed to developing and implementing comprehensive mitigation and recovery procedures within 90 days.',
    },
  },
  
  // Question 23: Business Associates
  {
    question_id: 'business-associates',
    affects: [
      { document_name: 'BusinessAssociatePolicy', field_name: 'BAA_STATUS', priority: 1 },
      { document_name: 'BusinessAssociatePolicy', field_name: 'VENDOR_RISK', priority: 1 },
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization maintains Business Associate Agreements (BAAs) with all vendors, contractors, and service providers that create, receive, maintain, or transmit PHI. BAAs include all required security obligations and are current.',
      PARTIAL: 'The organization has BAAs with some vendors but not all. Some BAAs lack required security obligations. The organization has committed to ensuring all vendors who handle PHI have current BAAs with required security obligations within 60 days.',
      NON_COMPLIANT: 'The organization has identified the absence of BAAs with vendors who handle PHI or that BAAs are missing. The organization has formally committed to developing and executing BAAs with all vendors who handle PHI, including all required security obligations, within 90 days.',
    },
  },
  
  // Question 24: BAA Monitoring
  {
    question_id: 'baa-monitoring',
    affects: [
      { document_name: 'BusinessAssociatePolicy', field_name: 'VENDOR_RISK', priority: 1 },
      { document_name: 'AuditLogsPolicy', field_name: 'AUDIT_EVIDENCE_LIST', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization has formal procedures to monitor and ensure that Business Associates comply with their BAAs and HIPAA security requirements. Monitoring includes regular audits and compliance verification, and documentation is maintained.',
      PARTIAL: 'The organization has monitoring procedures, however they are informal or infrequent. Documentation is incomplete. The organization has committed to formalizing monitoring procedures with regular audits and comprehensive documentation within 60 days.',
      NON_COMPLIANT: 'The organization has identified the absence of monitoring procedures or that Business Associates are not regularly assessed. The organization has formally committed to developing and implementing comprehensive monitoring procedures with regular audits within 90 days.',
    },
  },
  
  // Question 25: BAA Breach Notification
  {
    question_id: 'baa-breach-notification',
    affects: [
      { document_name: 'BusinessAssociatePolicy', field_name: 'BAA_STATUS', priority: 1 },
      { document_name: 'IncidentResponsePolicy', field_name: 'BREACH_NOTIFICATION_STATUS', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization has procedures requiring Business Associates to notify immediately of any security incidents or breaches involving PHI. BAAs include notification requirements, and procedures define notification process and timelines.',
      PARTIAL: 'The organization has notification requirements, however they are not clearly defined. Timelines are not specified. The organization has committed to enhancing BAAs with clear notification requirements and defined timelines within 45 days.',
      NON_COMPLIANT: 'The organization has identified the absence of notification requirements or that Business Associates are not required to report incidents. The organization has formally committed to adding immediate notification requirements to all BAAs within 60 days.',
    },
  },
  
  // Question 26: Contingency Plan
  {
    question_id: 'contingency-plan',
    affects: [
      { document_name: 'RiskManagementPlan', field_name: 'RISK_MGMT_ACTIONS', priority: 1 },
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization maintains a documented Contingency Plan that addresses data backup, disaster recovery, and business continuity. The plan includes backup procedures, recovery timelines, and is tested regularly.',
      PARTIAL: 'The organization has a contingency plan, however it is incomplete or not regularly tested. Recovery timelines are not defined. The organization has committed to enhancing the plan with comprehensive procedures and regular testing within 60 days.',
      NON_COMPLIANT: 'The organization has identified the absence of a contingency plan. The organization has formally committed to developing and implementing a comprehensive Contingency Plan with backup procedures, recovery timelines, and testing within 90 days.',
    },
  },
  
  // Question 27: Data Backup Procedures
  {
    question_id: 'data-backup-procedures',
    affects: [
      { document_name: 'RiskManagementPlan', field_name: 'RISK_MGMT_ACTIONS', priority: 1 },
      { document_name: 'AuditLogsPolicy', field_name: 'LOG_RETENTION', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization has documented procedures for regularly backing up all PHI, including frequency (daily or more frequent), storage location, and recovery procedures. Backups are stored offsite and tested regularly.',
      PARTIAL: 'The organization performs backups, however they are not frequent enough or testing is infrequent. The organization has committed to establishing daily backups with regular testing within 45 days.',
      NON_COMPLIANT: 'The organization has identified the absence of regular backups or that backups are not tested. The organization has formally committed to implementing daily backup procedures with offsite storage and regular testing within 60 days.',
    },
  },
  
  // Question 28: Disaster Recovery Testing
  {
    question_id: 'disaster-recovery-testing',
    affects: [
      { document_name: 'RiskManagementPlan', field_name: 'RISK_MGMT_ACTIONS', priority: 1 },
      { document_name: 'AuditLogsPolicy', field_name: 'AUDIT_EVIDENCE_LIST', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization regularly tests its Disaster Recovery Plan at least annually to ensure that systems can be recovered and operations restored within acceptable timeframes. Test results are documented and recovery timelines are verified.',
      PARTIAL: 'The organization tests the disaster recovery plan, however not annually. Test results are not fully documented. The organization has committed to establishing annual testing with comprehensive documentation within 60 days.',
      NON_COMPLIANT: 'The organization has identified that the disaster recovery plan is not tested or testing is infrequent. The organization has formally committed to implementing annual disaster recovery testing with comprehensive documentation within 90 days.',
    },
  },
  
  // Question 29: Privacy Policy (NPP)
  {
    question_id: 'privacy-policy',
    affects: [
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization provides all patients with a Notice of Privacy Practices (NPP) that informs them of their rights regarding their PHI, as required by the Privacy Rule.',
      PARTIAL: 'The organization has partially implemented a Notice of Privacy Practices but may need improvements to fully comply with 45 CFR §164.520.',
      NON_COMPLIANT: 'The organization has identified the absence of a Notice of Privacy Practices. The organization has formally committed to developing and providing an NPP to all patients within 30 days, as required by 45 CFR §164.520.',
    },
  },
  
  // Question 30: Breach History
  {
    question_id: 'breach-history',
    affects: [
      { document_name: 'IncidentResponsePolicy', field_name: 'INCIDENT_DEFENSIBILITY', priority: 1 },
      { document_name: 'MasterPolicy', field_name: 'INCIDENT_DEFENSIBILITY', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization has not experienced any known security incidents or data breaches involving unsecured PHI in the past 24 months.',
      PARTIAL: 'The organization has experienced security incidents or breaches, however they were reported to HHS within 60 days and are documented. The organization has implemented additional safeguards to prevent recurrence.',
      NON_COMPLIANT: 'The organization has identified that security incidents or breaches occurred but were not reported to HHS within 60 days. The organization has formally committed to reporting all breaches in compliance with the Breach Notification Rule and implementing comprehensive incident response procedures.',
    },
  },
  
  // Question 31: Documentation Retention
  {
    question_id: 'documentation-retention',
    affects: [
      { document_name: 'AuditLogsPolicy', field_name: 'LOG_RETENTION', priority: 1 },
      { document_name: 'MasterPolicy', field_name: 'AUDIT_EVIDENCE_LIST', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization maintains and retains all HIPAA compliance documentation, including policies, training logs, risk analyses, BAAs, and incident reports, for a minimum of 6 years as required by HIPAA.',
      PARTIAL: 'The organization retains some documentation, however retention is incomplete. The organization has committed to establishing systematic documentation retention for all compliance documents for 6+ years within 30 days.',
      NON_COMPLIANT: 'The organization has identified the absence of systematic documentation retention. The organization has formally committed to implementing comprehensive documentation retention procedures for all HIPAA compliance documents for a minimum of 6 years within 60 days.',
    },
  },
  
  // Question 32: Facility Access Policies
  {
    question_id: 'facility-access-policies',
    affects: [
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_CONTROL_STATUS', priority: 1 },
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization maintains documented policies that define who is authorized to access facilities where PHI is stored or processed. Policies include access levels defined, are documented, and enforced.',
      PARTIAL: 'The organization has facility access policies, however they are informal or not consistently enforced. The organization has committed to formalizing policies and ensuring consistent enforcement within 45 days.',
      NON_COMPLIANT: 'The organization has identified the absence of documented facility access policies or that access is not controlled. The organization has formally committed to developing and implementing comprehensive facility access policies with defined access levels within 60 days.',
    },
  },
  
  // Question 33: Visitor Access Logging
  {
    question_id: 'visitor-access-logging',
    affects: [
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_PROCEDURES', priority: 2 },
      { document_name: 'AuditLogsPolicy', field_name: 'AUDIT_REVIEW_STATUS', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization has procedures for controlling and logging visitor access to areas where PHI is stored or processed. All visitors are logged and escorted, and access is restricted to necessary areas.',
      PARTIAL: 'The organization has visitor procedures, however they are not consistently followed. Logging is incomplete. The organization has committed to formalizing procedures and ensuring consistent logging within 30 days.',
      NON_COMPLIANT: 'The organization has identified the absence of visitor control procedures or that visitors have unrestricted access. The organization has formally committed to developing and implementing comprehensive visitor control and logging procedures within 45 days.',
    },
  },
  
  // Question 34: Facility Security Plan
  {
    question_id: 'facility-security-plan',
    affects: [
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 2 },
      { document_name: 'RiskManagementPlan', field_name: 'RISK_MGMT_ACTIONS', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization maintains a documented Facility Security Plan that addresses physical security measures, emergency procedures, and security monitoring. The plan is comprehensive and regularly updated.',
      PARTIAL: 'The organization has a facility security plan, however it is incomplete or not regularly updated. The organization has committed to enhancing the plan with comprehensive security measures and regular updates within 60 days.',
      NON_COMPLIANT: 'The organization has identified the absence of a facility security plan. The organization has formally committed to developing and implementing a comprehensive Facility Security Plan with security measures, emergency procedures, and monitoring within 90 days.',
    },
  },
  
  // Question 35: Access Control and Surveillance
  {
    question_id: 'access-control-surveillance',
    affects: [
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_CONTROL_STATUS', priority: 1 },
      { document_name: 'AuditLogsPolicy', field_name: 'AUDIT_REVIEW_STATUS', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization uses access controls (locks, badges, biometrics) and surveillance (cameras) to monitor and restrict access to areas where PHI is stored. Systems are in place for all areas with PHI and are actively monitored.',
      PARTIAL: 'The organization has access controls or surveillance in some areas but not all. Monitoring is inconsistent. The organization has committed to implementing comprehensive access controls and surveillance for all areas with PHI within 60 days.',
      NON_COMPLIANT: 'The organization has identified the absence of access controls or surveillance. The organization has formally committed to implementing comprehensive access controls and surveillance systems for all areas where PHI is stored within 90 days.',
    },
  },
  
  // Question 36: Workstation Use Policy
  {
    question_id: 'workstation-use-policy',
    affects: [
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_PROCEDURES', priority: 1 },
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization maintains a documented Workstation Use Policy that defines authorized uses, security requirements, and user responsibilities. The policy is comprehensive and consistently enforced.',
      PARTIAL: 'The organization has a workstation use policy, however it is incomplete or not consistently enforced. The organization has committed to enhancing the policy and ensuring consistent enforcement within 45 days.',
      NON_COMPLIANT: 'The organization has identified the absence of a workstation use policy. The organization has formally committed to developing and implementing a comprehensive Workstation Use Policy with authorized uses, security requirements, and user responsibilities within 60 days.',
    },
  },
  
  // Question 37: Workstation Security
  {
    question_id: 'workstation-security',
    affects: [
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_CONTROL_STATUS', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'All workstations that access PHI are physically secured to prevent unauthorized use. Workstations are locked when unattended, and screens are positioned to prevent viewing by unauthorized individuals.',
      PARTIAL: 'Some workstations are secured but not all. Security measures are inconsistent. The organization has committed to securing all workstations with PHI access within 30 days.',
      NON_COMPLIANT: 'The organization has identified that workstations are not physically secured. The organization has formally committed to implementing physical security measures for all workstations that access PHI within 45 days.',
    },
  },
  
  // Question 38: Workstation Positioning
  {
    question_id: 'workstation-positioning',
    affects: [
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_CONTROL_STATUS', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'All workstations that display PHI are positioned to prevent viewing by unauthorized individuals. Workstations are positioned away from public areas, and screens are angled away from visitors.',
      PARTIAL: 'Most workstations are positioned appropriately but some are not. The organization has committed to repositioning all workstations to prevent unauthorized viewing within 30 days.',
      NON_COMPLIANT: 'The organization has identified that workstations are positioned in public areas where PHI can be viewed. The organization has committed to repositioning all workstations to prevent unauthorized viewing within 30 days.',
    },
  },
  
  // Question 39: Device Inventory
  {
    question_id: 'device-inventory',
    affects: [
      { document_name: 'AuditLogsPolicy', field_name: 'AUDIT_EVIDENCE_LIST', priority: 2 },
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 3 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization maintains a comprehensive inventory of all hardware and electronic media that stores or processes PHI, including location and status. The inventory is regularly updated.',
      PARTIAL: 'The organization has a device inventory, however it is incomplete or not regularly updated. The organization has committed to maintaining a comprehensive inventory with regular updates within 45 days.',
      NON_COMPLIANT: 'The organization has identified the absence of a device inventory. The organization has formally committed to developing and maintaining a comprehensive inventory of all hardware and electronic media that stores or processes PHI within 60 days.',
    },
  },
  
  // Question 40: Device Disposal
  {
    question_id: 'device-disposal',
    affects: [
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_PROCEDURES', priority: 2 },
      { document_name: 'AuditLogsPolicy', field_name: 'AUDIT_EVIDENCE_LIST', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization has documented procedures for securely disposing of hardware and electronic media containing PHI using approved methods (degaussing, physical destruction). Disposal is verified and documented.',
      PARTIAL: 'The organization has disposal procedures, however they are not consistently followed. Verification is incomplete. The organization has committed to formalizing procedures and ensuring consistent verification within 45 days.',
      NON_COMPLIANT: 'The organization has identified the absence of disposal procedures or that devices are discarded without secure destruction. The organization has formally committed to developing and implementing comprehensive secure disposal procedures within 60 days.',
    },
  },
  
  // Question 41: Portable Device Security
  {
    question_id: 'portable-device-security',
    affects: [
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_CONTROL_STATUS', priority: 1 },
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization has procedures for securing portable devices (laptops, tablets, USB drives) that may contain PHI, including encryption and tracking. All portable devices are encrypted and tracked, and policies restrict PHI on portable devices.',
      PARTIAL: 'The organization has some security measures for portable devices, however not all devices are encrypted or tracked. Policies are not consistently enforced. The organization has committed to implementing comprehensive encryption and tracking for all portable devices within 60 days.',
      NON_COMPLIANT: 'The organization has identified the absence of encryption or tracking for portable devices or that portable devices are not secured. The organization has formally committed to implementing comprehensive encryption and tracking for all portable devices that may contain PHI within 90 days.',
    },
  },
  
  // Question 42: Unique User IDs
  {
    question_id: 'unique-user-ids',
    affects: [
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_CONTROL_STATUS', priority: 1 },
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_PROCEDURES', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization assigns unique user IDs to all workforce members who access PHI. Shared accounts are prohibited, and user IDs are not shared.',
      PARTIAL: 'The organization assigns user IDs, however some shared accounts exist or user IDs are shared. The organization has committed to eliminating shared accounts and ensuring unique user IDs for all staff within 45 days.',
      NON_COMPLIANT: 'The organization has identified the absence of unique user IDs or that shared accounts are used. The organization has formally committed to implementing unique user IDs for all workforce members and eliminating shared accounts within 60 days.',
    },
  },
  
  // Question 43: Emergency Access Procedures
  {
    question_id: 'emergency-access-procedures',
    affects: [
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_PROCEDURES', priority: 1 },
      { document_name: 'IncidentResponsePolicy', field_name: 'INCIDENT_PROCEDURES', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization has documented procedures for obtaining necessary PHI during an emergency. Procedures include authorization, access methods, and documentation requirements.',
      PARTIAL: 'The organization has emergency access procedures, however they are informal or not fully documented. The organization has committed to formalizing procedures with comprehensive documentation within 30 days.',
      NON_COMPLIANT: 'The organization has identified the absence of emergency access procedures. The organization has formally committed to developing and implementing comprehensive emergency access procedures within 45 days.',
    },
  },
  
  // Question 44: Automatic Logoff
  {
    question_id: 'automatic-logoff',
    affects: [
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_CONTROL_STATUS', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization has implemented automatic logoff or session timeout for all systems that access PHI. Sessions automatically terminate after a period of inactivity.',
      PARTIAL: 'The organization has automatic logoff for some systems but not all. The organization has committed to implementing automatic logoff for all systems with PHI access within 30 days.',
      NON_COMPLIANT: 'The organization has identified the absence of automatic logoff or session timeout. The organization has formally committed to implementing automatic logoff for all systems that access PHI within 45 days.',
    },
  },
  
  // Question 45: Encryption at Rest
  {
    question_id: 'encryption-at-rest',
    affects: [
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 1 },
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_CONTROL_STATUS', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization encrypts all ePHI at rest using industry-standard encryption (AES-256 or equivalent). Encryption is implemented for all systems and storage media that contain ePHI.',
      PARTIAL: 'The organization encrypts some ePHI at rest but not all. The organization has committed to implementing encryption for all ePHI at rest within 90 days.',
      NON_COMPLIANT: 'The organization has identified that ePHI is not encrypted at rest. The organization has formally committed to implementing encryption for all ePHI at rest using industry-standard encryption (AES-256 or equivalent) within 120 days.',
    },
  },
  
  // Question 46: Encryption in Transit
  {
    question_id: 'encryption-in-transit',
    affects: [
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 1 },
      { document_name: 'IncidentResponsePolicy', field_name: 'INCIDENT_DEFENSIBILITY', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization encrypts all ePHI in transit using industry-standard encryption (TLS 1.2+ or equivalent). Encryption is implemented for all transmissions of ePHI over open networks.',
      PARTIAL: 'The organization encrypts some ePHI in transit but not all. The organization has committed to implementing encryption for all ePHI in transit within 60 days.',
      NON_COMPLIANT: 'The organization has identified that ePHI is not encrypted in transit. The organization has formally committed to implementing encryption for all ePHI in transit using industry-standard encryption (TLS 1.2+ or equivalent) within 90 days.',
    },
  },
  
  // Question 47: Audit Logs
  {
    question_id: 'audit-logs',
    affects: [
      { document_name: 'AuditLogsPolicy', field_name: 'AUDIT_REVIEW_STATUS', priority: 1 },
      { document_name: 'AuditLogsPolicy', field_name: 'LOG_RETENTION', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization maintains audit logs that record all access to and modifications of ePHI. Logs include user ID, timestamp, action, and data accessed. Logs are retained for at least 6 years.',
      PARTIAL: 'The organization maintains some audit logs, however they are incomplete or not retained for the required period. The organization has committed to implementing comprehensive audit logging with 6-year retention within 60 days.',
      NON_COMPLIANT: 'The organization has identified the absence of audit logs or that logs are not maintained. The organization has formally committed to implementing comprehensive audit logging for all access to and modifications of ePHI with 6-year retention within 90 days.',
    },
  },
  
  // Question 48: Integrity Controls
  {
    question_id: 'integrity-controls',
    affects: [
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 2 },
      { document_name: 'AuditLogsPolicy', field_name: 'AUDIT_REVIEW_STATUS', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization has implemented integrity controls to ensure that ePHI is not improperly altered or destroyed. Controls include checksums, digital signatures, or equivalent mechanisms.',
      PARTIAL: 'The organization has some integrity controls, however they are not comprehensive. The organization has committed to implementing comprehensive integrity controls within 60 days.',
      NON_COMPLIANT: 'The organization has identified the absence of integrity controls. The organization has formally committed to implementing integrity controls to ensure ePHI is not improperly altered or destroyed within 90 days.',
    },
  },
  
  // Question 49: Password Policy
  {
    question_id: 'password-policy',
    affects: [
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_PROCEDURES', priority: 1 },
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization has a documented password policy that requires strong passwords (minimum length, complexity, expiration). The policy is enforced and all users are required to comply.',
      PARTIAL: 'The organization has a password policy, however it is not comprehensive or not consistently enforced. The organization has committed to enhancing the policy and ensuring consistent enforcement within 30 days.',
      NON_COMPLIANT: 'The organization has identified the absence of a password policy or that weak passwords are allowed. The organization has formally committed to developing and implementing a comprehensive password policy with strong password requirements within 45 days.',
    },
  },
  
  // Question 50: Multi-Factor Authentication
  {
    question_id: 'multi-factor-authentication',
    affects: [
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_CONTROL_STATUS', priority: 1 },
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization requires multi-factor authentication (MFA) for all remote access to systems containing ePHI. MFA is implemented and enforced for all remote users.',
      PARTIAL: 'The organization requires MFA for some remote access but not all. The organization has committed to implementing MFA for all remote access to systems with ePHI within 60 days.',
      NON_COMPLIANT: 'The organization has identified the absence of multi-factor authentication for remote access. The organization has formally committed to implementing MFA for all remote access to systems containing ePHI within 90 days.',
    },
  },
  
  // ============================================================================
  // QUESTIONS 51-100: Additional Technical, Workforce, Vendor, and Incident Questions
  // ============================================================================
  
  // Question 51: Email Security
  {
    question_id: 'email-security',
    affects: [
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 1 },
      { document_name: 'IncidentResponsePolicy', field_name: 'INCIDENT_DEFENSIBILITY', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization uses encrypted email or secure messaging when sending PHI to patients or other providers. All PHI emails are encrypted or sent via secure messaging.',
      PARTIAL: 'The organization encrypts most PHI emails but some are not encrypted. The organization has committed to implementing encryption for all PHI emails within 60 days.',
      NON_COMPLIANT: 'The organization has identified that PHI is sent via unencrypted email. The organization has formally committed to implementing encrypted email or secure messaging for all PHI transmissions within 90 days.',
    },
  },
  
  // Question 52: VPN Remote Access
  {
    question_id: 'vpn-remote-access',
    affects: [
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_CONTROL_STATUS', priority: 1 },
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization requires VPN (Virtual Private Network) for all remote access to PHI systems. VPN uses strong encryption and is consistently enforced.',
      PARTIAL: 'The organization requires VPN but it is not consistently enforced or encryption may be weak. The organization has committed to enforcing VPN requirements with strong encryption within 60 days.',
      NON_COMPLIANT: 'The organization has identified the absence of VPN requirements or that remote access is not encrypted. The organization has formally committed to implementing VPN with strong encryption for all remote access within 90 days.',
    },
  },
  
  // Question 53: Role-Based Access Control
  {
    question_id: 'role-based-access-control',
    affects: [
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_CONTROL_STATUS', priority: 1 },
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_PROCEDURES', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization implements Role-Based Access Control (RBAC) to limit access to PHI based on job function and the principle of minimum necessary access. RBAC is implemented for all systems and access is limited to minimum necessary.',
      PARTIAL: 'The organization implements RBAC but not consistently. Some users have excessive access. The organization has committed to implementing comprehensive RBAC and reviewing all user access within 60 days.',
      NON_COMPLIANT: 'The organization has identified the absence of RBAC or that all users have the same access level. The organization has formally committed to implementing comprehensive RBAC with minimum necessary access within 90 days.',
    },
  },
  
  // Question 54: Access Review Recertification
  {
    question_id: 'access-review-recertification',
    affects: [
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_PROCEDURES', priority: 1 },
      { document_name: 'AuditLogsPolicy', field_name: 'AUDIT_REVIEW_STATUS', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization regularly reviews and recertifies user access rights at least quarterly to ensure they are still appropriate for current job functions. Inappropriate access is promptly removed.',
      PARTIAL: 'The organization reviews access but not regularly. Removal of inappropriate access is delayed. The organization has committed to establishing quarterly access reviews with prompt removal within 45 days.',
      NON_COMPLIANT: 'The organization has identified the absence of regular access review or that users may have access to systems they no longer need. The organization has formally committed to implementing quarterly access review and recertification procedures within 90 days.',
    },
  },
  
  // Question 55: Antivirus Software
  {
    question_id: 'antivirus-software',
    affects: [
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 2 },
      { document_name: 'RiskManagementPlan', field_name: 'RISK_MGMT_ACTIONS', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization installs and maintains current antivirus and anti-malware software on all systems that access PHI. Antivirus is installed on all systems and is current.',
      PARTIAL: 'The organization has antivirus installed but not on all systems or it is not current. The organization has committed to ensuring all systems have current antivirus within 30 days.',
      NON_COMPLIANT: 'The organization has identified the absence of antivirus software. The organization has formally committed to installing and maintaining current antivirus on all systems that access PHI within 60 days.',
    },
  },
  
  // Question 56: Malware Scanning
  {
    question_id: 'malware-scanning',
    affects: [
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 2 },
      { document_name: 'AuditLogsPolicy', field_name: 'AUDIT_EVIDENCE_LIST', priority: 3 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization performs regular malware scans at least weekly and keeps antivirus/anti-malware definitions updated daily. Scanning is comprehensive and definitions are current.',
      PARTIAL: 'The organization performs scans but not frequently enough or definitions are not always current. The organization has committed to establishing weekly scans with daily definition updates within 30 days.',
      NON_COMPLIANT: 'The organization has identified that scans are not performed or definitions are outdated. The organization has formally committed to implementing regular malware scanning with current definitions within 60 days.',
    },
  },
  
  // Question 57: Patch Management
  {
    question_id: 'patch-management',
    affects: [
      { document_name: 'RiskManagementPlan', field_name: 'RISK_MGMT_ACTIONS', priority: 1 },
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization maintains a documented Patch Management Program that ensures all systems are updated with security patches promptly. The program includes defined patch schedule and testing procedures.',
      PARTIAL: 'The organization has a patch management program but it is not comprehensive or not consistently followed. The organization has committed to enhancing the program with comprehensive procedures within 60 days.',
      NON_COMPLIANT: 'The organization has identified the absence of a patch management program or that systems are not regularly updated. The organization has formally committed to developing and implementing a comprehensive Patch Management Program within 90 days.',
    },
  },
  
  // Question 58: System Patching
  {
    question_id: 'system-patching',
    affects: [
      { document_name: 'RiskManagementPlan', field_name: 'RISK_MGMT_ACTIONS', priority: 1 },
      { document_name: 'AuditLogsPolicy', field_name: 'AUDIT_EVIDENCE_LIST', priority: 3 },
    ],
    legal_statements: {
      COMPLIANT: 'All operating systems and applications that access PHI are patched within reasonable timeframes (30 days for non-critical, 7 days for critical). All systems are patched within defined timeframes.',
      PARTIAL: 'Most systems are patched but some are delayed. The organization has committed to ensuring all systems are patched within defined timeframes within 45 days.',
      NON_COMPLIANT: 'The organization has identified that many systems are not patched or patches are significantly delayed. The organization has formally committed to implementing timely patching procedures for all systems within 90 days.',
    },
  },
  
  // Question 59: Firewall Implementation
  {
    question_id: 'firewall-implementation',
    affects: [
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 1 },
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_CONTROL_STATUS', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization implements firewalls to protect PHI systems from unauthorized network access. Firewalls are implemented and configured to restrict traffic appropriately.',
      PARTIAL: 'The organization has firewalls implemented but configuration may be weak. The organization has committed to enhancing firewall configuration within 60 days.',
      NON_COMPLIANT: 'The organization has identified the absence of firewalls or that firewalls are not properly configured. The organization has formally committed to implementing and properly configuring firewalls for all PHI systems within 90 days.',
    },
  },
  
  // Question 60: Firewall Rules
  {
    question_id: 'firewall-rules',
    affects: [
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_CONTROL_STATUS', priority: 1 },
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'Firewall rules are configured to allow only necessary traffic and deny all other traffic (default deny principle). Only necessary traffic is allowed.',
      PARTIAL: 'Firewall rules are configured but may allow unnecessary traffic. The organization has committed to reviewing and tightening firewall rules to follow default deny principle within 45 days.',
      NON_COMPLIANT: 'The organization has identified that firewall rules are permissive or that unnecessary traffic is allowed. The organization has formally committed to implementing default deny firewall rules within 60 days.',
    },
  },
  
  // Question 61: Network Segmentation
  {
    question_id: 'network-segmentation',
    affects: [
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_CONTROL_STATUS', priority: 2 },
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization implements network segmentation to isolate PHI systems from less secure networks. PHI systems are on a separate network segment with restricted access.',
      PARTIAL: 'The organization has network segmentation but it is not comprehensive. The organization has committed to implementing comprehensive network segmentation within 90 days.',
      NON_COMPLIANT: 'The organization has identified the absence of network segmentation or that PHI systems are on the same network as other systems. The organization has formally committed to implementing network segmentation to isolate PHI systems within 120 days.',
    },
  },
  
  // Question 62: Wireless Encryption
  {
    question_id: 'wireless-encryption',
    affects: [
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 1 },
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_CONTROL_STATUS', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'All wireless networks that may transmit PHI are encrypted using WPA2 or WPA3 with strong encryption. All wireless networks use strong encryption.',
      PARTIAL: 'Wireless networks are encrypted but may use weaker encryption (WEP). The organization has committed to upgrading all wireless networks to WPA2 or WPA3 within 60 days.',
      NON_COMPLIANT: 'The organization has identified that wireless networks are not encrypted or use very weak encryption. The organization has formally committed to implementing WPA2 or WPA3 encryption for all wireless networks within 90 days.',
    },
  },
  
  // Question 63: Cloud Services
  {
    question_id: 'cloud-services',
    affects: [
      { document_name: 'BusinessAssociatePolicy', field_name: 'VENDOR_RISK', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization uses cloud services and has appropriate BAAs and security configurations in place.',
      PARTIAL: 'The organization uses cloud services but may need improvements to BAAs or security configurations.',
      NON_COMPLIANT: 'The organization does not use cloud services for PHI storage or processing.',
    },
  },
  
  // Question 64: Cloud BAA
  {
    question_id: 'cloud-baa',
    affects: [
      { document_name: 'BusinessAssociatePolicy', field_name: 'BAA_STATUS', priority: 1 },
      { document_name: 'BusinessAssociatePolicy', field_name: 'VENDOR_RISK', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'All cloud service providers have Business Associate Agreements and HIPAA-compliant configurations. All providers are compliant.',
      PARTIAL: 'Some cloud providers are compliant but not all. The organization has committed to ensuring all cloud providers have BAAs and compliant configurations within 60 days.',
      NON_COMPLIANT: 'The organization has identified the absence of BAAs or compliance verification for cloud providers. The organization has formally committed to executing BAAs and verifying HIPAA-compliant configurations for all cloud providers within 90 days.',
    },
  },
  
  // Question 65: Backup Verification
  {
    question_id: 'backup-verification',
    affects: [
      { document_name: 'RiskManagementPlan', field_name: 'RISK_MGMT_ACTIONS', priority: 1 },
      { document_name: 'AuditLogsPolicy', field_name: 'AUDIT_EVIDENCE_LIST', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization performs regular data backups and tests backup and recovery procedures to ensure ePHI can be restored. Backups are regular and recovery is tested.',
      PARTIAL: 'The organization performs backups but recovery is rarely tested. The organization has committed to establishing regular backup testing procedures within 45 days.',
      NON_COMPLIANT: 'The organization has identified the absence of regular backups or recovery testing. The organization has formally committed to implementing regular backups with tested recovery procedures within 90 days.',
    },
  },
  
  // Question 66: Data Validation Verification
  {
    question_id: 'data-validation-verification',
    affects: [
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 2 },
      { document_name: 'AuditLogsPolicy', field_name: 'AUDIT_REVIEW_STATUS', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization implements data validation and verification controls to ensure PHI accuracy and completeness. Validation controls are implemented for all critical data entry points.',
      PARTIAL: 'The organization has some validation controls but they are not comprehensive. The organization has committed to implementing comprehensive validation controls within 60 days.',
      NON_COMPLIANT: 'The organization has identified the absence of data validation controls. The organization has formally committed to implementing data validation and verification controls for all critical data entry points within 90 days.',
    },
  },
  
  // Question 67: Wireless Access Point Security
  {
    question_id: 'wireless-access-point-security',
    affects: [
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_CONTROL_STATUS', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'All wireless access points are configured with strong security settings, including MAC address filtering and hidden SSID where appropriate. All access points have strong security configurations.',
      PARTIAL: 'Some access points are secured but not all. The organization has committed to securing all access points with strong security configurations within 45 days.',
      NON_COMPLIANT: 'The organization has identified that access points are not properly secured. The organization has committed to configuring all access points with strong security settings within 60 days.',
    },
  },
  
  // Question 68: Rogue Wireless Network Detection
  {
    question_id: 'rogue-wireless-network-detection',
    affects: [
      { document_name: 'AuditLogsPolicy', field_name: 'AUDIT_REVIEW_STATUS', priority: 2 },
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 3 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization has procedures to detect and disable unauthorized (rogue) wireless networks. Regular scanning and monitoring occur, and unauthorized networks are immediately disabled.',
      PARTIAL: 'The organization has some monitoring but it is not comprehensive or regular. The organization has committed to establishing regular scanning and monitoring procedures within 60 days.',
      NON_COMPLIANT: 'The organization has identified the absence of rogue network detection procedures. The organization has formally committed to developing and implementing comprehensive detection and response procedures within 90 days.',
    },
  },
  
  // Question 69: Intrusion Detection Prevention
  {
    question_id: 'intrusion-detection-prevention',
    affects: [
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 1 },
      { document_name: 'AuditLogsPolicy', field_name: 'AUDIT_REVIEW_STATUS', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization implements intrusion detection and prevention systems (IDS/IPS) to monitor and protect PHI systems. Systems are implemented and actively monitored, and alerts are investigated promptly.',
      PARTIAL: 'The organization has IDS/IPS but monitoring is not regular or alerts are not always investigated. The organization has committed to establishing regular monitoring with prompt investigation within 60 days.',
      NON_COMPLIANT: 'The organization has identified the absence of intrusion detection or prevention systems. The organization has formally committed to implementing IDS/IPS with active monitoring within 90 days.',
    },
  },
  
  // Question 70: Firmware Updates
  {
    question_id: 'firmware-updates',
    affects: [
      { document_name: 'RiskManagementPlan', field_name: 'RISK_MGMT_ACTIONS', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization regularly updates firmware on network devices, servers, and other hardware that processes PHI. Firmware updates are applied regularly and tracked.',
      PARTIAL: 'The organization applies some firmware updates but not consistently. The organization has committed to establishing regular firmware update procedures within 60 days.',
      NON_COMPLIANT: 'The organization has identified that firmware is not regularly updated. The organization has formally committed to implementing regular firmware update procedures with tracking within 90 days.',
    },
  },
  
  // Question 71: Workforce Security Awareness
  {
    question_id: 'workforce-security-awareness',
    affects: [
      { document_name: 'WorkforceTrainingPolicy', field_name: 'TRAINING_STATUS', priority: 1 },
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization conducts regular security awareness campaigns to keep workforce members informed about current threats and best practices. Campaigns are regular and comprehensive.',
      PARTIAL: 'The organization has some awareness activities but they are not regular or comprehensive. The organization has committed to establishing regular security awareness campaigns within 60 days.',
      NON_COMPLIANT: 'The organization has identified the absence of security awareness campaigns. The organization has formally committed to developing and implementing regular security awareness campaigns within 90 days.',
    },
  },
  
  // Question 72: Phishing Social Engineering Training
  {
    question_id: 'phishing-social-engineering-training',
    affects: [
      { document_name: 'WorkforceTrainingPolicy', field_name: 'TRAINING_STATUS', priority: 1 },
      { document_name: 'IncidentResponsePolicy', field_name: 'INCIDENT_PROCEDURES', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization provides specific training on recognizing and responding to phishing attacks and social engineering attempts. Training is comprehensive with examples and regular updates.',
      PARTIAL: 'The organization provides some training but it is not comprehensive or regular. The organization has committed to enhancing training with comprehensive content and regular updates within 60 days.',
      NON_COMPLIANT: 'The organization has identified the absence of specific phishing or social engineering training. The organization has formally committed to developing and implementing comprehensive training on phishing and social engineering within 90 days.',
    },
  },
  
  // Question 73: Acceptable Use Policy
  {
    question_id: 'acceptable-use-policy',
    affects: [
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_PROCEDURES', priority: 1 },
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization maintains a documented Acceptable Use Policy that defines authorized and prohibited uses of systems and data. The policy is comprehensive, communicated to all staff, and enforced.',
      PARTIAL: 'The organization has an acceptable use policy but it is incomplete or not consistently enforced. The organization has committed to enhancing the policy and ensuring consistent enforcement within 45 days.',
      NON_COMPLIANT: 'The organization has identified the absence of an acceptable use policy. The organization has formally committed to developing and implementing a comprehensive Acceptable Use Policy within 60 days.',
    },
  },
  
  // Question 74: Personal Device Policy
  {
    question_id: 'personal-device-policy',
    affects: [
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_PROCEDURES', priority: 1 },
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization maintains a documented policy governing the use of personal devices (BYOD) for accessing PHI. The policy is comprehensive with security requirements and restrictions.',
      PARTIAL: 'The organization has a personal device policy but it is incomplete or not consistently enforced. The organization has committed to enhancing the policy and ensuring consistent enforcement within 45 days.',
      NON_COMPLIANT: 'The organization has identified the absence of a personal device policy or that personal devices are used without proper controls. The organization has formally committed to developing and implementing a comprehensive personal device policy within 60 days.',
    },
  },
  
  // Question 75: Mobile Device Management
  {
    question_id: 'mobile-device-management',
    affects: [
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_CONTROL_STATUS', priority: 1 },
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization uses Mobile Device Management (MDM) or similar solutions to secure and manage mobile devices that access PHI. MDM is implemented for all mobile devices with PHI access.',
      PARTIAL: 'The organization uses MDM for some devices but not all. The organization has committed to implementing MDM for all mobile devices with PHI access within 60 days.',
      NON_COMPLIANT: 'The organization has identified the absence of MDM or that mobile devices are not centrally managed. The organization has formally committed to implementing MDM for all mobile devices that access PHI within 90 days.',
    },
  },
  
  // Question 76: Lost Stolen Device Procedures
  {
    question_id: 'lost-stolen-device-procedures',
    affects: [
      { document_name: 'IncidentResponsePolicy', field_name: 'INCIDENT_PROCEDURES', priority: 1 },
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_CONTROL_STATUS', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization has documented procedures for responding to lost or stolen devices that may contain PHI, including remote wipe capabilities. Procedures are comprehensive with remote wipe and incident response.',
      PARTIAL: 'The organization has procedures but they are incomplete or remote wipe is not available. The organization has committed to enhancing procedures with remote wipe capabilities within 45 days.',
      NON_COMPLIANT: 'The organization has identified the absence of procedures for lost or stolen devices. The organization has formally committed to developing and implementing comprehensive procedures with remote wipe capabilities within 60 days.',
    },
  },
  
  // Question 77: Workforce Exit Procedures
  {
    question_id: 'workforce-exit-procedures',
    affects: [
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_PROCEDURES', priority: 1 },
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_CONTROL_STATUS', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization has comprehensive exit procedures that include returning devices, revoking access, and conducting exit interviews. Procedures are comprehensive and consistently followed.',
      PARTIAL: 'The organization has exit procedures but they are incomplete or not consistently followed. The organization has committed to enhancing procedures and ensuring consistent execution within 30 days.',
      NON_COMPLIANT: 'The organization has identified the absence of formal exit procedures. The organization has formally committed to developing and implementing comprehensive exit procedures including device return, access revocation, and exit interviews within 60 days.',
    },
  },
  
  // Question 78: Workforce Compliance Monitoring
  {
    question_id: 'workforce-compliance-monitoring',
    affects: [
      { document_name: 'AuditLogsPolicy', field_name: 'AUDIT_REVIEW_STATUS', priority: 1 },
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization monitors workforce compliance with security policies through audits, reviews, or other mechanisms. Monitoring is regular with documented audits and reviews.',
      PARTIAL: 'The organization has some monitoring but it is not regular or comprehensive. The organization has committed to establishing regular monitoring with comprehensive documentation within 60 days.',
      NON_COMPLIANT: 'The organization has identified the absence of compliance monitoring. The organization has formally committed to developing and implementing comprehensive compliance monitoring procedures within 90 days.',
    },
  },
  
  // Question 79: Workforce Feedback Reporting
  {
    question_id: 'workforce-feedback-reporting',
    affects: [
      { document_name: 'WorkforceTrainingPolicy', field_name: 'TRAINING_STATUS', priority: 2 },
      { document_name: 'IncidentResponsePolicy', field_name: 'INCIDENT_PROCEDURES', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization has mechanisms for workforce members to report security concerns, violations, or suggestions anonymously. Multiple reporting channels including anonymous options are available.',
      PARTIAL: 'The organization has reporting channels but they may not be anonymous or well-publicized. The organization has committed to enhancing reporting mechanisms with anonymous options within 30 days.',
      NON_COMPLIANT: 'The organization has identified the absence of formal reporting mechanisms. The organization has formally committed to developing and implementing comprehensive reporting mechanisms with anonymous options within 60 days.',
    },
  },
  
  // Question 80: Workforce Termination for Cause
  {
    question_id: 'workforce-termination-for-cause',
    affects: [
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_PROCEDURES', priority: 1 },
      { document_name: 'SanctionPolicy', field_name: 'SANCTIONS_APPLIED', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization has specific procedures for immediately revoking access when workforce members are terminated for cause. Procedures include immediate revocation with security escort if needed.',
      PARTIAL: 'The organization has procedures but they may not be immediate or comprehensive. The organization has committed to enhancing procedures to ensure immediate access revocation within 30 days.',
      NON_COMPLIANT: 'The organization has identified the absence of specific procedures for termination for cause. The organization has formally committed to developing and implementing immediate access revocation procedures for terminations for cause within 45 days.',
    },
  },
  
  // Question 81: Vendor Risk Assessment
  {
    question_id: 'vendor-risk-assessment',
    affects: [
      { document_name: 'BusinessAssociatePolicy', field_name: 'VENDOR_RISK', priority: 1 },
      { document_name: 'RiskManagementPlan', field_name: 'RISK_MGMT_ACTIONS', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization conducts risk assessments of vendors and Business Associates before entering into agreements. Comprehensive risk assessment is conducted for all vendors handling PHI.',
      PARTIAL: 'The organization conducts risk assessments for some vendors but not all. The organization has committed to conducting comprehensive risk assessments for all vendors handling PHI within 60 days.',
      NON_COMPLIANT: 'The organization has identified the absence of vendor risk assessments. The organization has formally committed to developing and implementing comprehensive vendor risk assessment procedures within 90 days.',
    },
  },
  
  // Question 82: Vendor Security Questionnaire
  {
    question_id: 'vendor-security-questionnaire',
    affects: [
      { document_name: 'BusinessAssociatePolicy', field_name: 'VENDOR_RISK', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization requires vendors to complete security questionnaires or provide security documentation before engagement. Comprehensive questionnaires are required for all vendors handling PHI.',
      PARTIAL: 'The organization requires questionnaires for some vendors but not all. The organization has committed to requiring comprehensive questionnaires for all vendors handling PHI within 60 days.',
      NON_COMPLIANT: 'The organization has identified the absence of security questionnaire requirements. The organization has formally committed to developing and implementing comprehensive security questionnaire requirements within 90 days.',
    },
  },
  
  // Question 83: Vendor Audit Certification
  {
    question_id: 'vendor-audit-certification',
    affects: [
      { document_name: 'BusinessAssociatePolicy', field_name: 'VENDOR_RISK', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization requires vendors to provide security certifications, audit reports, or third-party assessments (e.g., SOC 2, HITRUST). Certifications or audit reports are required and reviewed.',
      PARTIAL: 'The organization requests certifications but they are not required or not reviewed. The organization has committed to requiring and reviewing certifications for all vendors handling PHI within 60 days.',
      NON_COMPLIANT: 'The organization has identified the absence of certification or audit requirements. The organization has formally committed to developing and implementing certification and audit review requirements within 90 days.',
    },
  },
  
  // Question 84: Vendor Data Handling Security
  {
    question_id: 'vendor-data-handling-security',
    affects: [
      { document_name: 'BusinessAssociatePolicy', field_name: 'BAA_STATUS', priority: 1 },
      { document_name: 'BusinessAssociatePolicy', field_name: 'VENDOR_RISK', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'BAAs specify how vendors must handle, store, and transmit PHI, including encryption and access control requirements. BAAs include specific security requirements for data handling.',
      PARTIAL: 'BAAs include some security requirements but they are not comprehensive. The organization has committed to enhancing BAAs with comprehensive data handling security requirements within 60 days.',
      NON_COMPLIANT: 'The organization has identified that BAAs do not specify data handling security requirements. The organization has formally committed to updating all BAAs with comprehensive data handling security requirements within 90 days.',
    },
  },
  
  // Question 85: Vendor Subcontractor Management
  {
    question_id: 'vendor-subcontractor-management',
    affects: [
      { document_name: 'BusinessAssociatePolicy', field_name: 'BAA_STATUS', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'BAAs require vendors to ensure their subcontractors also comply with HIPAA and have BAAs. BAAs require vendor to ensure subcontractor compliance.',
      PARTIAL: 'BAAs mention subcontractors but requirements are not clear. The organization has committed to clarifying subcontractor requirements in all BAAs within 60 days.',
      NON_COMPLIANT: 'The organization has identified that BAAs do not address subcontractor requirements. The organization has formally committed to updating all BAAs with clear subcontractor compliance requirements within 90 days.',
    },
  },
  
  // Question 86: Vendor Compliance Monitoring
  {
    question_id: 'vendor-compliance-monitoring',
    affects: [
      { document_name: 'BusinessAssociatePolicy', field_name: 'VENDOR_RISK', priority: 1 },
      { document_name: 'AuditLogsPolicy', field_name: 'AUDIT_EVIDENCE_LIST', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization regularly monitors and audits vendor compliance with BAAs and HIPAA requirements. Monitoring and audits are regular with documented findings.',
      PARTIAL: 'The organization has some monitoring but it is not regular or comprehensive. The organization has committed to establishing regular monitoring and audits with comprehensive documentation within 60 days.',
      NON_COMPLIANT: 'The organization has identified the absence of vendor compliance monitoring or audits. The organization has formally committed to developing and implementing comprehensive vendor compliance monitoring and audit procedures within 90 days.',
    },
  },
  
  // Question 87: Vendor Data Return Destruction
  {
    question_id: 'vendor-data-return-destruction',
    affects: [
      { document_name: 'BusinessAssociatePolicy', field_name: 'BAA_STATUS', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'BAAs specify procedures for returning or securely destroying PHI when vendor relationships end. BAAs include specific return/destruction procedures.',
      PARTIAL: 'BAAs mention return/destruction but procedures are not specific. The organization has committed to enhancing BAAs with specific return/destruction procedures within 60 days.',
      NON_COMPLIANT: 'The organization has identified that BAAs do not address data return or destruction. The organization has formally committed to updating all BAAs with specific return/destruction procedures within 90 days.',
    },
  },
  
  // Question 88: Cloud Service Provider Security
  {
    question_id: 'cloud-service-provider-security',
    affects: [
      { document_name: 'BusinessAssociatePolicy', field_name: 'VENDOR_RISK', priority: 1 },
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization verifies that cloud service providers implement appropriate security controls, including encryption, access controls, and audit logging. Verification is comprehensive.',
      PARTIAL: 'The organization has some verification but it is not comprehensive. The organization has committed to establishing comprehensive verification procedures within 60 days.',
      NON_COMPLIANT: 'The organization has identified the absence of verification of cloud provider security controls. The organization has formally committed to developing and implementing comprehensive verification procedures within 90 days.',
    },
  },
  
  // Question 89: Vendor Contract Review
  {
    question_id: 'vendor-contract-review',
    affects: [
      { document_name: 'BusinessAssociatePolicy', field_name: 'BAA_STATUS', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization regularly reviews and updates BAAs to ensure they reflect current HIPAA requirements and security best practices. BAAs are reviewed regularly and updated as needed.',
      PARTIAL: 'The organization reviews BAAs occasionally but not regularly. The organization has committed to establishing regular BAA review procedures within 60 days.',
      NON_COMPLIANT: 'The organization has identified that BAAs are not regularly reviewed or updated. The organization has formally committed to implementing regular BAA review and update procedures within 90 days.',
    },
  },
  
  // Question 90: Vendor Termination Transition
  {
    question_id: 'vendor-termination-transition',
    affects: [
      { document_name: 'BusinessAssociatePolicy', field_name: 'BAA_STATUS', priority: 1 },
      { document_name: 'IncidentResponsePolicy', field_name: 'INCIDENT_PROCEDURES', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization has procedures for securely transitioning PHI when vendor relationships end or are terminated. Procedures are comprehensive with data return/destruction.',
      PARTIAL: 'The organization has procedures but they are incomplete. The organization has committed to enhancing procedures with comprehensive data return/destruction within 60 days.',
      NON_COMPLIANT: 'The organization has identified the absence of transition procedures. The organization has formally committed to developing and implementing comprehensive secure transition procedures within 90 days.',
    },
  },
  
  // Question 91: Vendor Performance Metrics SLAs
  {
    question_id: 'vendor-performance-metrics-slas',
    affects: [
      { document_name: 'BusinessAssociatePolicy', field_name: 'VENDOR_RISK', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'BAAs include performance metrics or SLAs related to security and HIPAA compliance. BAAs include security performance metrics and SLAs.',
      PARTIAL: 'BAAs include some metrics but they are not comprehensive. The organization has committed to enhancing BAAs with comprehensive security metrics within 60 days.',
      NON_COMPLIANT: 'The organization has identified that BAAs do not include performance metrics or SLAs. The organization has committed to adding security performance metrics to all BAAs within 90 days.',
    },
  },
  
  // Question 92: Vendor Insurance Liability
  {
    question_id: 'vendor-insurance-liability',
    affects: [
      { document_name: 'BusinessAssociatePolicy', field_name: 'VENDOR_RISK', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'BAAs require vendors to maintain cyber liability insurance and specify liability for breaches. BAAs require insurance and specify liability.',
      PARTIAL: 'BAAs mention insurance but requirements are not specific. The organization has committed to enhancing BAAs with specific insurance and liability requirements within 60 days.',
      NON_COMPLIANT: 'The organization has identified that BAAs do not address insurance or liability. The organization has committed to adding insurance and liability requirements to all BAAs within 90 days.',
    },
  },
  
  // Question 93: Vendor Incident Response Plan
  {
    question_id: 'vendor-incident-response-plan',
    affects: [
      { document_name: 'BusinessAssociatePolicy', field_name: 'BAA_STATUS', priority: 1 },
      { document_name: 'IncidentResponsePolicy', field_name: 'INCIDENT_PROCEDURES', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'BAAs require vendors to have incident response plans and specify notification timelines for security incidents. BAAs require incident response plans and specify notification timelines.',
      PARTIAL: 'BAAs mention incident response but requirements are not specific. The organization has committed to enhancing BAAs with specific incident response requirements within 60 days.',
      NON_COMPLIANT: 'The organization has identified that BAAs do not address vendor incident response requirements. The organization has formally committed to adding incident response requirements to all BAAs within 90 days.',
    },
  },
  
  // Question 94: Vendor Security Training
  {
    question_id: 'vendor-security-training',
    affects: [
      { document_name: 'BusinessAssociatePolicy', field_name: 'VENDOR_RISK', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'BAAs require vendors to provide HIPAA security training to their workforce members who handle PHI. BAAs require vendor workforce training.',
      PARTIAL: 'BAAs mention training but requirements are not specific. The organization has committed to enhancing BAAs with specific training requirements within 60 days.',
      NON_COMPLIANT: 'The organization has identified that BAAs do not address vendor training requirements. The organization has committed to adding training requirements to all BAAs within 90 days.',
    },
  },
  
  // Question 95: Contractor Agreements
  {
    question_id: 'contractor-agreements',
    affects: [
      { document_name: 'BusinessAssociatePolicy', field_name: 'BAA_STATUS', priority: 1 },
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_PROCEDURES', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization has written agreements with contractors and temporary staff that specify HIPAA security obligations. All contractors have written agreements with HIPAA obligations.',
      PARTIAL: 'The organization has agreements with some contractors but not all. The organization has committed to ensuring all contractors have written agreements with HIPAA obligations within 60 days.',
      NON_COMPLIANT: 'The organization has identified the absence of written agreements with contractors. The organization has formally committed to developing and executing written agreements with all contractors specifying HIPAA obligations within 90 days.',
    },
  },
  
  // Question 96: Confidentiality Agreements
  {
    question_id: 'confidentiality-agreements',
    affects: [
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_PROCEDURES', priority: 1 },
      { document_name: 'WorkforceTrainingPolicy', field_name: 'TRAINING_STATUS', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'All workforce members, including contractors and volunteers, sign confidentiality agreements that include HIPAA obligations. All workforce members sign confidentiality agreements.',
      PARTIAL: 'Most workforce members sign agreements but not all. The organization has committed to ensuring all workforce members sign confidentiality agreements within 30 days.',
      NON_COMPLIANT: 'The organization has identified the absence of confidentiality agreement requirements. The organization has formally committed to developing and implementing confidentiality agreement requirements for all workforce members within 60 days.',
    },
  },
  
  // Question 97: Volunteer Intern Agreements
  {
    question_id: 'volunteer-intern-agreements',
    affects: [
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_PROCEDURES', priority: 1 },
      { document_name: 'WorkforceTrainingPolicy', field_name: 'TRAINING_STATUS', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'Volunteers and interns who may access PHI sign agreements specifying HIPAA obligations and receive training. All volunteers and interns sign agreements and receive training.',
      PARTIAL: 'Some volunteers/interns have agreements but not all. The organization has committed to ensuring all volunteers and interns sign agreements and receive training within 30 days.',
      NON_COMPLIANT: 'The organization has identified the absence of agreements or training for volunteers/interns. The organization has formally committed to developing and implementing agreements and training for all volunteers and interns within 60 days.',
    },
  },
  
  // Question 98: Incident Response Team
  {
    question_id: 'incident-response-team',
    affects: [
      { document_name: 'IncidentResponsePolicy', field_name: 'INCIDENT_PROCEDURES', priority: 1 },
      { document_name: 'MasterPolicy', field_name: 'INCIDENT_DEFENSIBILITY', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization has a designated Incident Response Team with defined roles and responsibilities. The team is formal with defined roles, contact information, and escalation procedures.',
      PARTIAL: 'The organization has a team but roles are not clearly defined or contact information is not current. The organization has committed to formalizing the team with clear roles and current contact information within 30 days.',
      NON_COMPLIANT: 'The organization has identified the absence of a designated incident response team. The organization has formally committed to designating and formalizing an Incident Response Team with defined roles and responsibilities within 60 days.',
    },
  },
  
  // Question 99: Incident Response Plan Testing
  {
    question_id: 'incident-response-plan-testing',
    affects: [
      { document_name: 'IncidentResponsePolicy', field_name: 'INCIDENT_PROCEDURES', priority: 1 },
      { document_name: 'AuditLogsPolicy', field_name: 'AUDIT_EVIDENCE_LIST', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization regularly tests the Incident Response Plan through tabletop exercises or simulations. The plan is tested at least annually with documented results and improvements.',
      PARTIAL: 'The organization tests the plan but not regularly or results are not documented. The organization has committed to establishing annual testing with comprehensive documentation within 60 days.',
      NON_COMPLIANT: 'The organization has identified that the incident response plan is not tested. The organization has formally committed to implementing annual testing of the Incident Response Plan with documented results within 90 days.',
    },
  },
  
  // Question 100: Breach Assessment Procedures
  {
    question_id: 'breach-assessment-procedures',
    affects: [
      { document_name: 'IncidentResponsePolicy', field_name: 'BREACH_NOTIFICATION_STATUS', priority: 1 },
      { document_name: 'IncidentResponsePolicy', field_name: 'INCIDENT_PROCEDURES', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization has documented procedures for assessing whether a security incident constitutes a breach under HIPAA. Procedures are comprehensive with documented assessment criteria and process.',
      PARTIAL: 'The organization has procedures but they are incomplete or not consistently followed. The organization has committed to enhancing procedures with comprehensive documentation within 45 days.',
      NON_COMPLIANT: 'The organization has identified the absence of documented breach assessment procedures. The organization has formally committed to developing and implementing comprehensive breach assessment procedures within 60 days.',
    },
  },
  
  // Question 101: Breach Notification Timeline
  {
    question_id: 'breach-notification-timeline',
    affects: [
      { document_name: 'IncidentResponsePolicy', field_name: 'BREACH_NOTIFICATION_STATUS', priority: 1 },
      { document_name: 'MasterPolicy', field_name: 'INCIDENT_DEFENSIBILITY', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization has procedures to ensure breach notifications are sent within 60 days of discovery as required by HIPAA. Procedures ensure notifications within 60 days with tracking and verification.',
      PARTIAL: 'The organization has procedures but they may not ensure 60-day timeline. The organization has committed to enhancing procedures to ensure 60-day notification timeline within 30 days.',
      NON_COMPLIANT: 'The organization has identified the absence of procedures to ensure 60-day notification timeline. The organization has formally committed to developing and implementing procedures to ensure 60-day notification timeline within 60 days.',
    },
  },
  
  // Question 102: HHS Breach Notification
  {
    question_id: 'hhs-breach-notification',
    affects: [
      { document_name: 'IncidentResponsePolicy', field_name: 'BREACH_NOTIFICATION_STATUS', priority: 1 },
      { document_name: 'MasterPolicy', field_name: 'INCIDENT_DEFENSIBILITY', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization has procedures for notifying the HHS Secretary of breaches affecting 500 or more individuals within 60 days. Procedures ensure HHS notification within 60 days for large breaches.',
      PARTIAL: 'The organization has procedures but they may not ensure timely HHS notification. The organization has committed to enhancing procedures to ensure timely HHS notification within 30 days.',
      NON_COMPLIANT: 'The organization has identified the absence of procedures for HHS notification. The organization has formally committed to developing and implementing HHS notification procedures within 60 days.',
    },
  },
  
  // Question 103: Media Notification
  {
    question_id: 'media-notification',
    affects: [
      { document_name: 'IncidentResponsePolicy', field_name: 'BREACH_NOTIFICATION_STATUS', priority: 1 },
      { document_name: 'MasterPolicy', field_name: 'INCIDENT_DEFENSIBILITY', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization has procedures for notifying media outlets of breaches affecting 500 or more individuals in a state or jurisdiction. Procedures ensure media notification for large breaches as required.',
      PARTIAL: 'The organization has procedures but they may not ensure timely media notification. The organization has committed to enhancing procedures to ensure timely media notification within 30 days.',
      NON_COMPLIANT: 'The organization has identified the absence of procedures for media notification. The organization has formally committed to developing and implementing media notification procedures within 60 days.',
    },
  },
  
  // Question 104: Breach Documentation
  {
    question_id: 'breach-documentation',
    affects: [
      { document_name: 'AuditLogsPolicy', field_name: 'AUDIT_EVIDENCE_LIST', priority: 1 },
      { document_name: 'IncidentResponsePolicy', field_name: 'INCIDENT_DEFENSIBILITY', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization maintains comprehensive documentation of all security incidents and breach assessments, including rationale for breach determinations. All incidents and assessments are thoroughly documented.',
      PARTIAL: 'The organization has some documentation but it is incomplete. The organization has committed to enhancing documentation procedures to ensure comprehensive incident and breach documentation within 45 days.',
      NON_COMPLIANT: 'The organization has identified that incident and breach documentation is minimal or missing. The organization has formally committed to developing and implementing comprehensive documentation procedures within 90 days.',
    },
  },
  
  // Question 105: Breach Remediation Tracking
  {
    question_id: 'breach-remediation-tracking',
    affects: [
      { document_name: 'RiskManagementPlan', field_name: 'REMEDIATION_COMMITMENTS', priority: 1 },
      { document_name: 'AuditLogsPolicy', field_name: 'AUDIT_EVIDENCE_LIST', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization tracks remediation actions taken in response to security incidents and breaches. All remediation actions are tracked and documented.',
      PARTIAL: 'The organization has some tracking but it is not comprehensive. The organization has committed to enhancing tracking procedures to ensure comprehensive remediation tracking within 45 days.',
      NON_COMPLIANT: 'The organization has identified the absence of tracking of remediation actions. The organization has formally committed to developing and implementing comprehensive remediation tracking procedures within 90 days.',
    },
  },
  
  // Question 106: Post-Breach Risk Assessment
  {
    question_id: 'post-breach-risk-assessment',
    affects: [
      { document_name: 'SRAPolicy', field_name: 'SRA_STATEMENT', priority: 1 },
      { document_name: 'RiskManagementPlan', field_name: 'RISK_MGMT_ACTIONS', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization conducts a post-breach risk assessment to identify contributing factors and prevent future incidents. Assessments are comprehensive with documented findings and improvements.',
      PARTIAL: 'The organization conducts some assessment but it is not comprehensive or not documented. The organization has committed to enhancing post-breach assessment procedures within 60 days.',
      NON_COMPLIANT: 'The organization has identified the absence of post-breach risk assessments. The organization has formally committed to developing and implementing comprehensive post-breach risk assessment procedures within 90 days.',
    },
  },
  
  // Question 107: Incident Communication Plan
  {
    question_id: 'incident-communication-plan',
    affects: [
      { document_name: 'IncidentResponsePolicy', field_name: 'BREACH_NOTIFICATION_STATUS', priority: 1 },
      { document_name: 'IncidentResponsePolicy', field_name: 'INCIDENT_PROCEDURES', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization has a communication plan for notifying affected individuals, including templates and procedures for different breach scenarios. The plan is comprehensive with templates and procedures.',
      PARTIAL: 'The organization has a communication plan but it is incomplete or not tested. The organization has committed to enhancing the plan with comprehensive templates and testing within 60 days.',
      NON_COMPLIANT: 'The organization has identified the absence of a communication plan for breach notifications. The organization has formally committed to developing and implementing a comprehensive communication plan with templates and procedures within 90 days.',
    },
  },
  
  // Question 108: Environmental Controls
  {
    question_id: 'environmental-controls',
    affects: [
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 3 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization maintains environmental controls (temperature, humidity, power) to protect equipment and data storage systems. Controls are comprehensive with monitoring.',
      PARTIAL: 'The organization has some environmental controls but they are not comprehensive. The organization has committed to enhancing environmental controls within 90 days.',
      NON_COMPLIANT: 'The organization has identified the absence of environmental controls or monitoring. The organization has committed to implementing comprehensive environmental controls with monitoring within 120 days.',
    },
  },
  
  // Question 109: Fire Suppression Detection
  {
    question_id: 'fire-suppression-detection',
    affects: [
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 3 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization has fire suppression and detection systems to protect areas where PHI is stored. Systems are in place and tested regularly.',
      PARTIAL: 'The organization has some fire protection but it is not comprehensive or not tested. The organization has committed to enhancing fire protection with regular testing within 60 days.',
      NON_COMPLIANT: 'The organization has identified the absence of fire suppression or detection systems. The organization has committed to implementing comprehensive fire suppression and detection systems within 90 days.',
    },
  },
  
  // Question 110: Flood Water Damage Prevention
  {
    question_id: 'flood-water-damage-prevention',
    affects: [
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 3 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization has measures to prevent flood and water damage to areas where PHI is stored. Measures are comprehensive.',
      PARTIAL: 'The organization has some measures but they are not comprehensive. The organization has committed to enhancing flood and water damage prevention measures within 90 days.',
      NON_COMPLIANT: 'The organization has identified the absence of flood or water damage prevention measures. The organization has committed to implementing comprehensive prevention measures within 120 days.',
    },
  },
  
  // Question 111: Power Utilities
  {
    question_id: 'power-utilities',
    affects: [
      { document_name: 'RiskManagementPlan', field_name: 'RISK_MGMT_ACTIONS', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization has backup power systems (UPS, generators) to maintain operations during power outages. Systems are in place and tested regularly.',
      PARTIAL: 'The organization has some backup power but it is not comprehensive or not tested. The organization has committed to enhancing backup power systems with regular testing within 60 days.',
      NON_COMPLIANT: 'The organization has identified the absence of backup power systems. The organization has committed to implementing comprehensive backup power systems within 90 days.',
    },
  },
  
  // Question 112: Cabling Infrastructure Security
  {
    question_id: 'cabling-infrastructure-security',
    affects: [
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_CONTROL_STATUS', priority: 3 },
    ],
    legal_statements: {
      COMPLIANT: 'Network cabling and infrastructure are physically secured to prevent unauthorized access or tampering. Cabling is secured in locked conduits or protected areas.',
      PARTIAL: 'Some cabling is secured but not all. The organization has committed to securing all network cabling within 60 days.',
      NON_COMPLIANT: 'The organization has identified that cabling is not secured and accessible to unauthorized individuals. The organization has committed to securing all network cabling within 90 days.',
    },
  },
  
  // Question 113: Secure Disposal Utilities
  {
    question_id: 'secure-disposal-utilities',
    affects: [
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_PROCEDURES', priority: 2 },
      { document_name: 'AuditLogsPolicy', field_name: 'AUDIT_EVIDENCE_LIST', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization uses secure disposal services or certified vendors for destroying PHI (paper and electronic). Services are certified with documentation and verification.',
      PARTIAL: 'The organization uses some secure disposal but not all or not certified. The organization has committed to using certified disposal services for all PHI within 60 days.',
      NON_COMPLIANT: 'The organization has identified the absence of secure disposal services or that disposal is not verified. The organization has formally committed to implementing certified secure disposal services with verification within 90 days.',
    },
  },
  
  // Question 114: Workstation Physical Security
  {
    question_id: 'workstation-physical-security',
    affects: [
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_CONTROL_STATUS', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'Workstations that access PHI are physically secured with locks, cables, or other measures to prevent theft. All workstations are physically secured.',
      PARTIAL: 'Some workstations are secured but not all. The organization has committed to securing all workstations within 30 days.',
      NON_COMPLIANT: 'The organization has identified that workstations are not physically secured. The organization has committed to implementing physical security measures for all workstations within 60 days.',
    },
  },
  
  // Question 115: Data Loss Prevention
  {
    question_id: 'data-loss-prevention',
    affects: [
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 1 },
      { document_name: 'AuditLogsPolicy', field_name: 'AUDIT_REVIEW_STATUS', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization implements Data Loss Prevention (DLP) solutions to monitor and prevent unauthorized PHI exfiltration. DLP solutions are implemented and actively monitored.',
      PARTIAL: 'The organization has some DLP controls but they are not comprehensive. The organization has committed to implementing comprehensive DLP solutions within 90 days.',
      NON_COMPLIANT: 'The organization has identified the absence of DLP solutions. The organization has formally committed to implementing comprehensive DLP solutions to monitor and prevent unauthorized PHI exfiltration within 120 days.',
    },
  },
  
  // Question 116: Secure File Transfer
  {
    question_id: 'secure-file-transfer',
    affects: [
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 1 },
      { document_name: 'IncidentResponsePolicy', field_name: 'INCIDENT_DEFENSIBILITY', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization uses secure file transfer methods (SFTP, encrypted file sharing) when transferring PHI. All file transfers use secure methods.',
      PARTIAL: 'The organization uses secure methods for most transfers but some are not. The organization has committed to ensuring all file transfers use secure methods within 60 days.',
      NON_COMPLIANT: 'The organization has identified that file transfers are not secured. The organization has formally committed to implementing secure file transfer methods for all PHI transfers within 90 days.',
    },
  },
  
  // Question 117: Application Security
  {
    question_id: 'application-security',
    affects: [
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 2 },
      { document_name: 'RiskManagementPlan', field_name: 'RISK_MGMT_ACTIONS', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization implements application security controls, including secure coding practices and vulnerability assessments. Application security is comprehensive with regular assessments.',
      PARTIAL: 'The organization has some application security but it is not comprehensive. The organization has committed to implementing comprehensive application security controls within 90 days.',
      NON_COMPLIANT: 'The organization has identified the absence of application security controls or assessments. The organization has formally committed to implementing comprehensive application security controls with regular assessments within 120 days.',
    },
  },
  
  // Question 118: Database Security
  {
    question_id: 'database-security',
    affects: [
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_CONTROL_STATUS', priority: 1 },
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'Databases containing PHI are secured with access controls, encryption, and regular security assessments. Database security is comprehensive with access controls and encryption.',
      PARTIAL: 'The organization has some database security but it is not comprehensive. The organization has committed to implementing comprehensive database security with access controls, encryption, and regular assessments within 90 days.',
      NON_COMPLIANT: 'The organization has identified that databases are not properly secured. The organization has formally committed to implementing comprehensive database security including access controls, encryption, and regular assessments within 120 days.',
    },
  },
  
  // Question 119: API Security
  {
    question_id: 'api-security',
    affects: [
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_CONTROL_STATUS', priority: 2 },
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'APIs used to access or transmit PHI are secured with authentication, encryption, and rate limiting. APIs are secured with authentication, encryption, and rate limiting.',
      PARTIAL: 'The organization has some API security but it is not comprehensive. The organization has committed to implementing comprehensive API security with authentication, encryption, and rate limiting within 90 days.',
      NON_COMPLIANT: 'The organization has identified that APIs are not secured or that APIs are used without proper security. The organization has formally committed to implementing comprehensive API security including authentication, encryption, and rate limiting within 120 days.',
    },
  },
  
  // Question 120: Security Information Event Management
  {
    question_id: 'security-information-event-management',
    affects: [
      { document_name: 'AuditLogsPolicy', field_name: 'AUDIT_REVIEW_STATUS', priority: 1 },
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization uses Security Information and Event Management (SIEM) or similar solutions to aggregate and analyze security logs. SIEM is implemented with active monitoring and alerting.',
      PARTIAL: 'The organization has some log aggregation but not comprehensive SIEM. The organization has committed to implementing comprehensive SIEM with active monitoring within 90 days.',
      NON_COMPLIANT: 'The organization has identified the absence of SIEM or log aggregation solution. The organization has formally committed to implementing SIEM or comprehensive log aggregation solution within 120 days.',
    },
  },
  
  // Question 121: Penetration Testing
  {
    question_id: 'penetration-testing',
    affects: [
      { document_name: 'SRAPolicy', field_name: 'SRA_STATEMENT', priority: 1 },
      { document_name: 'RiskManagementPlan', field_name: 'RISK_MGMT_ACTIONS', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization conducts regular penetration testing or security assessments of systems that access PHI. Testing is regular with documented findings and remediation.',
      PARTIAL: 'The organization conducts some testing but it is not regular or comprehensive. The organization has committed to establishing regular penetration testing with comprehensive documentation within 90 days.',
      NON_COMPLIANT: 'The organization has identified the absence of penetration testing or security assessments. The organization has formally committed to implementing regular penetration testing with documented findings and remediation within 120 days.',
    },
  },
  
  // Question 122: Vulnerability Scanning
  {
    question_id: 'vulnerability-scanning',
    affects: [
      { document_name: 'SRAPolicy', field_name: 'SRA_STATEMENT', priority: 1 },
      { document_name: 'RiskManagementPlan', field_name: 'RISK_MGMT_ACTIONS', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization performs regular vulnerability scans of systems and networks that process PHI. Scanning is regular with documented findings and remediation.',
      PARTIAL: 'The organization performs some scanning but it is not regular or comprehensive. The organization has committed to establishing regular vulnerability scanning with comprehensive documentation within 60 days.',
      NON_COMPLIANT: 'The organization has identified the absence of vulnerability scanning. The organization has formally committed to implementing regular vulnerability scanning with documented findings and remediation within 90 days.',
    },
  },
  
  // Question 123: Change Management
  {
    question_id: 'change-management',
    affects: [
      { document_name: 'RiskManagementPlan', field_name: 'RISK_MGMT_ACTIONS', priority: 1 },
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization has a documented change management process for systems that access PHI, including testing and approval. The process is formal with testing and approval.',
      PARTIAL: 'The organization has some change management but it is not formal or comprehensive. The organization has committed to formalizing change management with comprehensive testing and approval procedures within 60 days.',
      NON_COMPLIANT: 'The organization has identified the absence of a formal change management process. The organization has formally committed to developing and implementing a formal change management process with testing and approval within 90 days.',
    },
  },
  
  // Question 124: Configuration Management
  {
    question_id: 'configuration-management',
    affects: [
      { document_name: 'RiskManagementPlan', field_name: 'RISK_MGMT_ACTIONS', priority: 1 },
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization maintains secure configuration baselines and monitors systems for configuration drift. Secure baselines are defined and monitored for compliance.',
      PARTIAL: 'The organization has some configuration management but it is not comprehensive. The organization has committed to implementing comprehensive configuration management with baseline monitoring within 90 days.',
      NON_COMPLIANT: 'The organization has identified the absence of configuration management or baseline monitoring. The organization has formally committed to implementing comprehensive configuration management with secure baselines and monitoring within 120 days.',
    },
  },
  
  // Question 125: Backup Encryption
  {
    question_id: 'backup-encryption',
    affects: [
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 1 },
      { document_name: 'RiskManagementPlan', field_name: 'RISK_MGMT_ACTIONS', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'All backups of PHI are encrypted to prevent unauthorized access if backup media is lost or stolen. All backups are encrypted.',
      PARTIAL: 'Some backups are encrypted but not all. The organization has committed to encrypting all backups within 60 days.',
      NON_COMPLIANT: 'The organization has identified that backups are not encrypted. The organization has formally committed to implementing encryption for all backups within 90 days.',
    },
  },
  
  // Question 126: Backup Storage Location
  {
    question_id: 'backup-storage-location',
    affects: [
      { document_name: 'RiskManagementPlan', field_name: 'RISK_MGMT_ACTIONS', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'Backups are stored in a secure, offsite location separate from primary systems. Backups are stored in secure offsite location.',
      PARTIAL: 'Some backups are stored offsite but not all or location is not secure. The organization has committed to storing all backups in secure offsite locations within 60 days.',
      NON_COMPLIANT: 'The organization has identified that backups are not stored offsite. The organization has committed to implementing secure offsite backup storage within 90 days.',
    },
  },
  
  // Question 127: Key Management
  {
    question_id: 'key-management',
    affects: [
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 1 },
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_CONTROL_STATUS', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization has secure procedures for managing encryption keys, including generation, storage, rotation, and destruction. Key management is comprehensive with secure storage and rotation.',
      PARTIAL: 'The organization has some key management but it is not comprehensive. The organization has committed to implementing comprehensive key management with secure storage and rotation within 90 days.',
      NON_COMPLIANT: 'The organization has identified the absence of formal key management procedures. The organization has formally committed to developing and implementing comprehensive key management procedures including generation, storage, rotation, and destruction within 120 days.',
    },
  },
  
  // Question 128: Secure Coding Standards
  {
    question_id: 'secure-coding-standards',
    affects: [
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 2 },
      { document_name: 'RiskManagementPlan', field_name: 'RISK_MGMT_ACTIONS', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'If the organization develops custom applications, secure coding standards are followed and code reviews are conducted. Secure coding standards are followed with code reviews.',
      PARTIAL: 'The organization has some secure coding practices but they are not comprehensive. The organization has committed to implementing comprehensive secure coding standards with code reviews within 90 days.',
      NON_COMPLIANT: 'The organization has identified the absence of secure coding standards or code reviews. The organization has formally committed to developing and implementing secure coding standards with code reviews within 120 days.',
    },
  },
  
  // Question 129: Third-Party Security Assessments
  {
    question_id: 'third-party-security-assessments',
    affects: [
      { document_name: 'SRAPolicy', field_name: 'SRA_STATEMENT', priority: 2 },
      { document_name: 'AuditLogsPolicy', field_name: 'AUDIT_EVIDENCE_LIST', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization engages third-party security firms to conduct independent security assessments. Assessments are regular with documented findings.',
      PARTIAL: 'The organization engages third-party assessments but not regularly. The organization has committed to establishing regular third-party security assessments within 90 days.',
      NON_COMPLIANT: 'The organization has identified the absence of third-party security assessments. The organization has committed to engaging third-party security firms for regular independent assessments within 120 days.',
    },
  },
  
  // Question 130: Security Policy Document
  {
    question_id: 'security-policy-document',
    affects: [
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization has a comprehensive, written HIPAA Security Policy document that addresses all required safeguards. The policy is comprehensive and covers all safeguards.',
      PARTIAL: 'The organization has a policy but it is incomplete or not comprehensive. The organization has committed to enhancing the policy to cover all required safeguards within 60 days.',
      NON_COMPLIANT: 'The organization has identified the absence of a written security policy document. The organization has formally committed to developing and implementing a comprehensive written HIPAA Security Policy document within 90 days.',
    },
  },
  
  // Question 131: Policy Review Update
  {
    question_id: 'policy-review-update',
    affects: [
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization regularly reviews and updates security and privacy policies to reflect current threats and regulatory changes. Policies are reviewed and updated at least annually.',
      PARTIAL: 'The organization reviews policies occasionally but not regularly. The organization has committed to establishing annual policy review and update procedures within 60 days.',
      NON_COMPLIANT: 'The organization has identified that policies are not regularly reviewed or updated. The organization has formally committed to implementing annual policy review and update procedures within 90 days.',
    },
  },
  
  // Question 132: Policy Communication
  {
    question_id: 'policy-communication',
    affects: [
      { document_name: 'WorkforceTrainingPolicy', field_name: 'TRAINING_STATUS', priority: 1 },
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'Security and privacy policies are communicated to all workforce members, and documentation of policy acknowledgment is maintained. Policies are communicated to all staff with documented acknowledgment.',
      PARTIAL: 'Policies are communicated but acknowledgment is not documented for all. The organization has committed to ensuring all staff acknowledge policies with documentation within 30 days.',
      NON_COMPLIANT: 'The organization has identified that policies are not communicated or acknowledgment is not documented. The organization has formally committed to implementing policy communication and acknowledgment procedures within 60 days.',
    },
  },
  
  // Question 133: Risk Assessment Scope
  {
    question_id: 'risk-assessment-scope',
    affects: [
      { document_name: 'SRAPolicy', field_name: 'SRA_SCOPE', priority: 1 },
      { document_name: 'SRAPolicy', field_name: 'SRA_STATEMENT', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'The Security Risk Analysis covers all systems, applications, and locations where PHI is created, received, maintained, or transmitted. The scope is comprehensive covering all PHI systems and locations.',
      PARTIAL: 'The SRA covers most systems but may miss some locations or applications. The organization has committed to expanding SRA scope to cover all PHI systems and locations within 60 days.',
      NON_COMPLIANT: 'The organization has identified that SRA scope is incomplete or does not cover all PHI systems. The organization has formally committed to conducting a comprehensive SRA covering all PHI systems and locations within 90 days.',
    },
  },
  
  // Question 134: Risk Assessment Documentation
  {
    question_id: 'risk-assessment-documentation',
    affects: [
      { document_name: 'SRAPolicy', field_name: 'SRA_DOCUMENTATION', priority: 1 },
      { document_name: 'AuditLogsPolicy', field_name: 'AUDIT_EVIDENCE_LIST', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'The Security Risk Analysis is thoroughly documented, including identified threats, vulnerabilities, risks, and remediation plans. Documentation is comprehensive with all required elements.',
      PARTIAL: 'Documentation exists but is incomplete or lacks some elements. The organization has committed to enhancing SRA documentation to include all required elements within 60 days.',
      NON_COMPLIANT: 'The organization has identified that SRA documentation is minimal or missing. The organization has formally committed to developing comprehensive SRA documentation including all threats, vulnerabilities, risks, and remediation plans within 90 days.',
    },
  },
  
  // Question 135: Access Request Procedures
  {
    question_id: 'access-request-procedures',
    affects: [
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization has documented procedures for handling patient requests to access, amend, or receive copies of their PHI. Procedures are comprehensive with defined timelines and processes.',
      PARTIAL: 'The organization has procedures but they are incomplete or timelines are not defined. The organization has committed to enhancing procedures with comprehensive timelines and processes within 45 days.',
      NON_COMPLIANT: 'The organization has identified the absence of documented procedures for patient access requests. The organization has formally committed to developing and implementing comprehensive patient access request procedures within 60 days.',
    },
  },
  
  // Question 136: Minimum Necessary Policy
  {
    question_id: 'minimum-necessary-policy',
    affects: [
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_CONTROL_STATUS', priority: 1 },
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization has a documented Minimum Necessary Policy that limits PHI access and disclosure to the minimum needed. The policy is comprehensive with clear guidelines and enforcement.',
      PARTIAL: 'The organization has a policy but guidelines are not clear or not consistently enforced. The organization has committed to enhancing the policy with clear guidelines and consistent enforcement within 45 days.',
      NON_COMPLIANT: 'The organization has identified the absence of a minimum necessary policy. The organization has formally committed to developing and implementing a comprehensive Minimum Necessary Policy with clear guidelines and enforcement within 60 days.',
    },
  },
  
  // Question 137: PHI Disclosure Logging
  {
    question_id: 'phi-disclosure-logging',
    affects: [
      { document_name: 'AuditLogsPolicy', field_name: 'AUDIT_REVIEW_STATUS', priority: 1 },
      { document_name: 'AuditLogsPolicy', field_name: 'LOG_RETENTION', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization maintains logs of PHI disclosures, including accounting of disclosures to patients upon request. Disclosure logging is comprehensive with accounting procedures.',
      PARTIAL: 'The organization has some disclosure logging but it is not comprehensive. The organization has committed to implementing comprehensive disclosure logging with accounting procedures within 60 days.',
      NON_COMPLIANT: 'The organization has identified the absence of disclosure logging or accounting procedures. The organization has formally committed to implementing comprehensive PHI disclosure logging with accounting procedures within 90 days.',
    },
  },
  
  // Question 138: Patient Complaint Procedures
  {
    question_id: 'patient-complaint-procedures',
    affects: [
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization has documented procedures for receiving, investigating, and responding to patient privacy complaints. Procedures are comprehensive with investigation and response processes.',
      PARTIAL: 'The organization has procedures but they are incomplete or not consistently followed. The organization has committed to enhancing procedures with comprehensive investigation and response processes within 45 days.',
      NON_COMPLIANT: 'The organization has identified the absence of documented complaint procedures. The organization has formally committed to developing and implementing comprehensive patient complaint procedures within 60 days.',
    },
  },
  
  // Question 139: Workforce Clearance Procedures
  {
    question_id: 'workforce-clearance-procedures',
    affects: [
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_PROCEDURES', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization has documented procedures for determining appropriate clearance levels for workforce members based on their job functions. Procedures are formal with defined levels and processes.',
      PARTIAL: 'The organization has procedures but they are informal or not consistently applied. The organization has committed to formalizing procedures with defined clearance levels within 45 days.',
      NON_COMPLIANT: 'The organization has identified the absence of clearance procedures or that access is granted without clearance determination. The organization has formally committed to developing and implementing comprehensive clearance procedures within 60 days.',
    },
  },
  
  // Question 140: Security Control Testing
  {
    question_id: 'security-control-testing',
    affects: [
      { document_name: 'RiskManagementPlan', field_name: 'RISK_MGMT_ACTIONS', priority: 1 },
      { document_name: 'AuditLogsPolicy', field_name: 'AUDIT_EVIDENCE_LIST', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization regularly tests security controls to ensure they are functioning as intended and effectively protecting PHI. Testing is regular with documented results.',
      PARTIAL: 'The organization conducts some testing but it is not regular or comprehensive. The organization has committed to establishing regular security control testing with comprehensive documentation within 60 days.',
      NON_COMPLIANT: 'The organization has identified that security controls are not regularly tested. The organization has formally committed to implementing regular security control testing with documented results within 90 days.',
    },
  },
  
  // Question 141: Compliance Officer Designation
  {
    question_id: 'compliance-officer-designation',
    affects: [
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization has designated a Compliance Officer or assigned compliance responsibilities to ensure ongoing HIPAA compliance. A Compliance Officer is designated with documented responsibilities.',
      PARTIAL: 'The organization has assigned compliance responsibilities but not formally designated. The organization has committed to formally designating a Compliance Officer with documented responsibilities within 30 days.',
      NON_COMPLIANT: 'The organization has identified the absence of a Compliance Officer or assigned compliance responsibilities. The organization has committed to designating a Compliance Officer with documented responsibilities within 60 days.',
    },
  },
  
  // Question 142: Ongoing Compliance Monitoring
  {
    question_id: 'ongoing-compliance-monitoring',
    affects: [
      { document_name: 'AuditLogsPolicy', field_name: 'AUDIT_REVIEW_STATUS', priority: 1 },
      { document_name: 'MasterPolicy', field_name: 'SECURITY_POSTURE', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization has an ongoing compliance monitoring program that regularly assesses HIPAA compliance and identifies areas for improvement. The program is comprehensive with regular assessments and improvement tracking.',
      PARTIAL: 'The organization has some monitoring but it is not comprehensive or regular. The organization has committed to establishing comprehensive ongoing compliance monitoring with regular assessments within 60 days.',
      NON_COMPLIANT: 'The organization has identified the absence of an ongoing compliance monitoring program. The organization has formally committed to developing and implementing a comprehensive ongoing compliance monitoring program within 90 days.',
    },
  },
  
  // Question 143: Session Timeout
  {
    question_id: 'session-timeout',
    affects: [
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_CONTROL_STATUS', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization requires users to re-authenticate after session timeout or when accessing sensitive functions. Re-authentication is required after timeout or for sensitive functions.',
      PARTIAL: 'The organization requires re-authentication for some functions but not all. The organization has committed to implementing re-authentication for all sensitive functions within 30 days.',
      NON_COMPLIANT: 'The organization has identified the absence of re-authentication requirements. The organization has formally committed to implementing re-authentication requirements after session timeout and for sensitive functions within 45 days.',
    },
  },
  
  // Question 144: Audit Log Configuration
  {
    question_id: 'audit-log-configuration',
    affects: [
      { document_name: 'AuditLogsPolicy', field_name: 'AUDIT_REVIEW_STATUS', priority: 1 },
      { document_name: 'AuditLogsPolicy', field_name: 'LOG_RETENTION', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization configures systems to generate comprehensive audit logs that record all access to PHI, including who, what, when, and where. Comprehensive logging of all PHI access is configured with logs including user, action, timestamp, and resource.',
      PARTIAL: 'The organization has logging configured but it is incomplete or does not capture all required information. The organization has committed to enhancing logging to capture all required information within 60 days.',
      NON_COMPLIANT: 'The organization has identified the absence of audit logging or that logging is minimal. The organization has formally committed to implementing comprehensive audit logging for all PHI access within 90 days.',
    },
  },
  
  // Question 145: Audit Log Retention
  {
    question_id: 'audit-log-retention',
    affects: [
      { document_name: 'AuditLogsPolicy', field_name: 'LOG_RETENTION', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization retains audit logs for a minimum of six (6) years as required by HIPAA. All audit logs are retained for at least 6 years.',
      PARTIAL: 'The organization retains logs but retention period is less than 6 years. The organization has committed to extending retention to 6 years for all audit logs within 60 days.',
      NON_COMPLIANT: 'The organization has identified that logs are not retained or retention period is very short. The organization has formally committed to implementing 6-year retention for all audit logs within 90 days.',
    },
  },
  
  // Question 146: Audit Log Review (already covered by information-system-activity-review)
  // Question 147: Audit Log Protection
  {
    question_id: 'audit-log-protection',
    affects: [
      { document_name: 'AuditLogsPolicy', field_name: 'AUDIT_REVIEW_STATUS', priority: 1 },
      { document_name: 'AuditLogsPolicy', field_name: 'LOG_RETENTION', priority: 1 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization protects audit logs from unauthorized access, modification, or deletion. Logs are stored in read-only format or on separate system, and access is restricted.',
      PARTIAL: 'The organization has some log protection but it is not comprehensive. The organization has committed to implementing comprehensive log protection with read-only storage or separate systems within 60 days.',
      NON_COMPLIANT: 'The organization has identified that logs are not protected or that users can modify or delete logs. The organization has formally committed to implementing comprehensive log protection including read-only storage or separate systems within 90 days.',
    },
  },
  
  // Question 148: Device Reuse
  {
    question_id: 'device-reuse',
    affects: [
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_PROCEDURES', priority: 2 },
      { document_name: 'AuditLogsPolicy', field_name: 'AUDIT_EVIDENCE_LIST', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization has procedures for securely wiping or destroying data before reusing or repurposing hardware that previously stored PHI. All data is securely wiped before reuse, and wiping is verified and documented.',
      PARTIAL: 'The organization has wiping procedures but they are not consistently followed or verification is incomplete. The organization has committed to ensuring consistent wiping procedures with verification within 45 days.',
      NON_COMPLIANT: 'The organization has identified the absence of wiping procedures or that devices are reused with data intact. The organization has formally committed to implementing comprehensive secure data wiping procedures with verification before device reuse within 60 days.',
    },
  },
  
  // Question 149: Paper Records Storage
  {
    question_id: 'paper-records-storage',
    affects: [
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_CONTROL_STATUS', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization has procedures for securely storing paper records containing PHI. Paper records are stored in locked cabinets with restricted access.',
      PARTIAL: 'The organization stores records but security measures are inconsistent. The organization has committed to ensuring all paper records are stored in locked cabinets with restricted access within 30 days.',
      NON_COMPLIANT: 'The organization has identified that paper records are not securely stored. The organization has committed to implementing secure storage procedures for all paper records within 60 days.',
    },
  },
  
  // Question 150: Paper Records Destruction
  {
    question_id: 'paper-records-destruction',
    affects: [
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_PROCEDURES', priority: 2 },
      { document_name: 'AuditLogsPolicy', field_name: 'AUDIT_EVIDENCE_LIST', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization has procedures for securely destroying paper records containing PHI. All paper records are shredded or incinerated, and destruction is verified and documented.',
      PARTIAL: 'The organization has destruction procedures but they are not consistently followed. The organization has committed to ensuring consistent secure destruction procedures with verification within 30 days.',
      NON_COMPLIANT: 'The organization has identified the absence of destruction procedures or that records are discarded without shredding. The organization has formally committed to implementing comprehensive secure destruction procedures for all paper records within 60 days.',
    },
  },
  
  // Question 151: Media Disposal
  {
    question_id: 'media-disposal',
    affects: [
      { document_name: 'AccessControlPolicy', field_name: 'ACCESS_PROCEDURES', priority: 2 },
      { document_name: 'AuditLogsPolicy', field_name: 'AUDIT_EVIDENCE_LIST', priority: 2 },
    ],
    legal_statements: {
      COMPLIANT: 'The organization has procedures for secure disposal of PHI (paper and electronic media). Secure disposal procedures are comprehensive and consistently followed.',
      PARTIAL: 'The organization has disposal procedures but they are informal. The organization has committed to formalizing secure disposal procedures within 45 days.',
      NON_COMPLIANT: 'The organization has identified the absence of disposal procedures. The organization has formally committed to developing and implementing comprehensive secure disposal procedures for all PHI (paper and electronic media) within 90 days.',
    },
  },
];

/**
 * Get binding for a specific question
 */
export function getQuestionBinding(questionId: string): QuestionBinding | null {
  return QUESTION_DOCUMENT_BINDINGS.find(b => b.question_id === questionId) || null;
}

/**
 * Get all document fields affected by a question
 */
export function getDocumentFieldsForQuestion(questionId: string): DocumentFieldBinding[] {
  const binding = getQuestionBinding(questionId);
  return binding?.affects || [];
}

/**
 * Get legal statement for a question based on compliance status
 */
export function getLegalStatement(
  questionId: string,
  complianceStatus: ComplianceStatus
): string | null {
  const binding = getQuestionBinding(questionId);
  return binding?.legal_statements[complianceStatus] || null;
}
