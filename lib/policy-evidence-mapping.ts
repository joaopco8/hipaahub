/**
 * Policy Evidence Mapping
 * 
 * Defines exactly where each evidence should be injected in each of the 9 HIPAA policy documents.
 * This mapping drives the automatic evidence referencing system.
 * 
 * Based on: Evidence Injection Logic for Policy Documents specification
 */

export interface EvidenceInjectionPoint {
  evidence_id: string;
  evidence_name: string;
  injection_type: 'link' | 'link_with_date' | 'screenshot' | 'attestation';
  template_text: string;
  position: string; // e.g., 'after_paragraph_2', 'start_of_section', 'end_of_section'
  priority: 'high' | 'medium' | 'low';
  date_field?: string; // e.g., 'Last_SRA_Date', 'Latest_Log_Date'
}

export interface PolicySection {
  section_id: string;
  section_title: string;
  evidence_injections: EvidenceInjectionPoint[];
}

export interface PolicyEvidenceMapping {
  policy_id: string;
  policy_name: string;
  sections: PolicySection[];
}

/**
 * Complete mapping of all 9 policies and their evidence injection points
 */
export const POLICY_EVIDENCE_MAPPINGS: PolicyEvidenceMapping[] = [
  // ================================
  // 1. HIPAA Security & Privacy Master Policy (MST-001)
  // ================================
  {
    policy_id: 'MST-001',
    policy_name: 'HIPAA Security & Privacy Master Policy',
    sections: [
      {
        section_id: '1.1',
        section_title: 'Document Control & Governance',
        evidence_injections: [
          {
            evidence_id: 'security_officer_designation',
            evidence_name: 'Security Officer Designation Document',
            injection_type: 'link',
            template_text: 'This policy is maintained by {{Security_Officer_Name}}, designated Security Officer [Reference: {{evidence_link}}]',
            position: 'after_paragraph_2',
            priority: 'high'
          },
          {
            evidence_id: 'privacy_officer_designation',
            evidence_name: 'Privacy Officer Designation Document',
            injection_type: 'link',
            template_text: 'Privacy Officer {{Privacy_Officer_Name}} is responsible for privacy compliance [Reference: {{evidence_link}}]',
            position: 'after_paragraph_3',
            priority: 'high'
          }
        ]
      },
      {
        section_id: '2',
        section_title: 'Security Risk Analysis & Management',
        evidence_injections: [
          {
            evidence_id: 'sra_report',
            evidence_name: 'Security Risk Analysis (SRA) Report',
            injection_type: 'link_with_date',
            template_text: 'The organization conducts annual security risk assessments as documented in [Reference: Security Risk Analysis Report - {{Last_SRA_Date}}] {{evidence_link}}',
            position: 'start_of_section',
            priority: 'high',
            date_field: 'Last_SRA_Date'
          },
          {
            evidence_id: 'risk_management_plan',
            evidence_name: 'Risk Management Plan',
            injection_type: 'link_with_date',
            template_text: 'Identified risks are managed through our documented Risk Management Plan [Reference: Risk Management Plan - Updated {{Last_RMP_Date}}] {{evidence_link}}',
            position: 'after_paragraph_1',
            priority: 'high',
            date_field: 'Last_RMP_Date'
          }
        ]
      },
      {
        section_id: '3',
        section_title: 'Sanctions & Discipline',
        evidence_injections: [
          {
            evidence_id: 'sanction_policy',
            evidence_name: 'Sanction Policy Document',
            injection_type: 'link',
            template_text: 'Workforce members who violate HIPAA policies are subject to disciplinary action as outlined in [Reference: Sanction Policy Document] {{evidence_link}}',
            position: 'start_of_section',
            priority: 'high'
          }
        ]
      },
      {
        section_id: '4',
        section_title: 'Training & Awareness',
        evidence_injections: [
          {
            evidence_id: 'workforce_training_policy',
            evidence_name: 'Workforce Training Policy Document',
            injection_type: 'link',
            template_text: 'All workforce members receive mandatory HIPAA training as documented in [Reference: Workforce Training Policy] {{evidence_link}}',
            position: 'start_of_section',
            priority: 'high'
          },
          {
            evidence_id: 'training_completion_logs',
            evidence_name: 'Training Completion Logs',
            injection_type: 'link',
            template_text: 'Training completion records are maintained and available for audit [Reference: Training Completion Logs] {{evidence_link}}',
            position: 'after_paragraph_2',
            priority: 'high'
          }
        ]
      },
      {
        section_id: '5',
        section_title: 'Incident Response',
        evidence_injections: [
          {
            evidence_id: 'incident_response_plan',
            evidence_name: 'Incident Response & Breach Notification Plan',
            injection_type: 'link',
            template_text: 'Security incidents are managed according to our documented Incident Response Plan [Reference: Incident Response & Breach Notification Plan] {{evidence_link}}',
            position: 'start_of_section',
            priority: 'high'
          }
        ]
      },
      {
        section_id: '6',
        section_title: 'Audit & Documentation',
        evidence_injections: [
          {
            evidence_id: 'audit_logs_sample',
            evidence_name: 'Audit Logs Sample Export',
            injection_type: 'link_with_date',
            template_text: 'All access to PHI is logged and monitored [Reference: Audit Logs Sample - {{Latest_Log_Date}}] {{evidence_link}}',
            position: 'start_of_section',
            priority: 'high',
            date_field: 'Latest_Log_Date'
          },
          {
            evidence_id: 'system_access_logs',
            evidence_name: 'System Access Logs (EHR/EMR)',
            injection_type: 'link_with_date',
            template_text: 'Clinical systems maintain detailed access logs [Reference: System Access Logs - {{Latest_Log_Date}}] {{evidence_link}}',
            position: 'after_paragraph_1',
            priority: 'medium',
            date_field: 'Latest_Log_Date'
          }
        ]
      },
      {
        section_id: '7',
        section_title: 'Privacy Practices',
        evidence_injections: [
          {
            evidence_id: 'privacy_notice',
            evidence_name: 'Privacy Notice (Notice of Privacy Practices)',
            injection_type: 'link_with_date',
            template_text: 'Patients receive our Notice of Privacy Practices [Reference: Privacy Notice - Effective {{NPP_Date}}] {{evidence_link}}',
            position: 'start_of_section',
            priority: 'high',
            date_field: 'NPP_Date'
          },
          {
            evidence_id: 'authorization_consent_forms',
            evidence_name: 'Authorization & Consent Forms',
            injection_type: 'link',
            template_text: 'Patient authorizations are documented [Reference: Authorization & Consent Forms] {{evidence_link}}',
            position: 'after_paragraph_1',
            priority: 'medium'
          }
        ]
      }
    ]
  },

  // ================================
  // 2. Security Risk Analysis (SRA) Policy (POL-002)
  // ================================
  {
    policy_id: 'POL-002',
    policy_name: 'Security Risk Analysis (SRA) Policy',
    sections: [
      {
        section_id: '2.1',
        section_title: 'SRA Process & Methodology',
        evidence_injections: [
          {
            evidence_id: 'sra_report',
            evidence_name: 'Security Risk Analysis (SRA) Report',
            injection_type: 'link_with_date',
            template_text: 'The most recent SRA was conducted on {{Last_SRA_Date}} [Reference: Security Risk Analysis Report] {{evidence_link}}',
            position: 'start_of_section',
            priority: 'high',
            date_field: 'Last_SRA_Date'
          }
        ]
      },
      {
        section_id: '2.2',
        section_title: 'Risk Identification & Documentation',
        evidence_injections: [
          {
            evidence_id: 'vulnerability_scan_report',
            evidence_name: 'Vulnerability Scan Report',
            injection_type: 'link_with_date',
            template_text: 'Vulnerability scans are conducted to identify technical risks [Reference: Vulnerability Scan Report - {{Latest_Scan_Date}}] {{evidence_link}}',
            position: 'start_of_section',
            priority: 'low',
            date_field: 'Latest_Scan_Date'
          },
          {
            evidence_id: 'penetration_test_report',
            evidence_name: 'Penetration Test Report',
            injection_type: 'link_with_date',
            template_text: 'Penetration testing is performed to validate security controls [Reference: Penetration Test Report - {{Latest_Pentest_Date}}] {{evidence_link}}',
            position: 'after_paragraph_1',
            priority: 'low',
            date_field: 'Latest_Pentest_Date'
          }
        ]
      },
      {
        section_id: '2.3',
        section_title: 'Risk Documentation & Tracking',
        evidence_injections: [
          {
            evidence_id: 'device_inventory',
            evidence_name: 'Device Inventory List',
            injection_type: 'link_with_date',
            template_text: 'All devices storing or accessing PHI are documented [Reference: Device Inventory - Updated {{Inventory_Date}}] {{evidence_link}}',
            position: 'start_of_section',
            priority: 'low',
            date_field: 'Inventory_Date'
          }
        ]
      }
    ]
  },

  // ================================
  // 3. Risk Management Plan (POL-003)
  // ================================
  {
    policy_id: 'POL-003',
    policy_name: 'Risk Management Plan Policy',
    sections: [
      {
        section_id: '1',
        section_title: 'Risk Identification',
        evidence_injections: [
          {
            evidence_id: 'sra_report',
            evidence_name: 'Security Risk Analysis (SRA) Report',
            injection_type: 'link_with_date',
            template_text: 'Risks identified in our SRA [Reference: Security Risk Analysis Report - {{Last_SRA_Date}}] {{evidence_link}} are addressed in this plan',
            position: 'start_of_section',
            priority: 'high',
            date_field: 'Last_SRA_Date'
          }
        ]
      },
      {
        section_id: '2',
        section_title: 'Risk Prioritization & Mitigation',
        evidence_injections: [
          {
            evidence_id: 'risk_management_plan',
            evidence_name: 'Risk Management Plan',
            injection_type: 'link_with_date',
            template_text: 'This plan was last updated on {{Last_RMP_Date}} [Reference: Risk Management Plan] {{evidence_link}}',
            position: 'start_of_section',
            priority: 'high',
            date_field: 'Last_RMP_Date'
          }
        ]
      },
      {
        section_id: '3',
        section_title: 'Technical Controls Implementation',
        evidence_injections: [
          {
            evidence_id: 'encryption_configuration',
            evidence_name: 'Encryption Configuration Screenshot',
            injection_type: 'screenshot',
            template_text: 'Encryption is enabled for all PHI [Reference: Encryption Configuration - Verified {{Encryption_Verify_Date}}] {{evidence_link}}',
            position: 'start_of_section',
            priority: 'medium',
            date_field: 'Encryption_Verify_Date'
          },
          {
            evidence_id: 'firewall_configuration',
            evidence_name: 'Firewall Configuration Screenshot',
            injection_type: 'screenshot',
            template_text: 'Network firewall is configured and monitored [Reference: Firewall Configuration - {{Firewall_Config_Date}}] {{evidence_link}}',
            position: 'after_paragraph_1',
            priority: 'medium',
            date_field: 'Firewall_Config_Date'
          },
          {
            evidence_id: 'antivirus_configuration',
            evidence_name: 'Antivirus Configuration Screenshot',
            injection_type: 'screenshot',
            template_text: 'Antivirus software is installed and updated [Reference: Antivirus Configuration - {{Antivirus_Update_Date}}] {{evidence_link}}',
            position: 'after_paragraph_2',
            priority: 'medium',
            date_field: 'Antivirus_Update_Date'
          },
          {
            evidence_id: 'patch_management_log',
            evidence_name: 'Patch Management Log',
            injection_type: 'link_with_date',
            template_text: 'Software patches are applied regularly [Reference: Patch Management Log - Latest {{Latest_Patch_Date}}] {{evidence_link}}',
            position: 'after_paragraph_3',
            priority: 'medium',
            date_field: 'Latest_Patch_Date'
          },
          {
            evidence_id: 'backup_recovery_test',
            evidence_name: 'Backup & Recovery Test Report',
            injection_type: 'link_with_date',
            template_text: 'Backups are tested quarterly [Reference: Backup & Recovery Test Report - {{Latest_Backup_Test_Date}}] {{evidence_link}}',
            position: 'after_paragraph_4',
            priority: 'medium',
            date_field: 'Latest_Backup_Test_Date'
          }
        ]
      },
      {
        section_id: '4',
        section_title: 'Physical Controls Implementation',
        evidence_injections: [
          {
            evidence_id: 'physical_access_control',
            evidence_name: 'Physical Access Control Policy',
            injection_type: 'link',
            template_text: 'Physical access is controlled per [Reference: Physical Access Control Policy] {{evidence_link}}',
            position: 'start_of_section',
            priority: 'medium'
          },
          {
            evidence_id: 'visitor_log',
            evidence_name: 'Visitor Log Sample',
            injection_type: 'link_with_date',
            template_text: 'Visitor access is logged [Reference: Visitor Log Sample - {{Latest_Visitor_Log_Date}}] {{evidence_link}}',
            position: 'after_paragraph_1',
            priority: 'medium',
            date_field: 'Latest_Visitor_Log_Date'
          },
          {
            evidence_id: 'data_destruction_policy',
            evidence_name: 'Data Destruction & Disposal Policy',
            injection_type: 'link',
            template_text: 'PHI disposal follows [Reference: Data Destruction & Disposal Policy] {{evidence_link}}',
            position: 'after_paragraph_2',
            priority: 'medium'
          }
        ]
      },
      {
        section_id: '5',
        section_title: 'Access Controls Implementation',
        evidence_injections: [
          {
            evidence_id: 'rbac_configuration',
            evidence_name: 'Role-Based Access Control (RBAC) Configuration',
            injection_type: 'screenshot',
            template_text: 'Access is controlled by role [Reference: RBAC Configuration - {{RBAC_Config_Date}}] {{evidence_link}}',
            position: 'start_of_section',
            priority: 'medium',
            date_field: 'RBAC_Config_Date'
          },
          {
            evidence_id: 'access_review_documentation',
            evidence_name: 'Access Review Documentation',
            injection_type: 'link_with_date',
            template_text: 'Access is reviewed quarterly [Reference: Access Review Documentation - {{Latest_Access_Review_Date}}] {{evidence_link}}',
            position: 'after_paragraph_1',
            priority: 'medium',
            date_field: 'Latest_Access_Review_Date'
          },
          {
            evidence_id: 'password_policy_configuration',
            evidence_name: 'Password Policy Configuration',
            injection_type: 'screenshot',
            template_text: 'Password policy enforces strong credentials [Reference: Password Policy Configuration] {{evidence_link}}',
            position: 'after_paragraph_2',
            priority: 'medium'
          },
          {
            evidence_id: 'session_timeout_configuration',
            evidence_name: 'Session Timeout Configuration',
            injection_type: 'screenshot',
            template_text: 'Sessions timeout automatically [Reference: Session Timeout Configuration] {{evidence_link}}',
            position: 'after_paragraph_3',
            priority: 'medium'
          }
        ]
      },
      {
        section_id: '6',
        section_title: 'Vendor Risk Management',
        evidence_injections: [
          {
            evidence_id: 'vendor_security_assessment',
            evidence_name: 'Vendor Security Assessment Report',
            injection_type: 'link_with_date',
            template_text: 'Vendors are assessed for security [Reference: Vendor Security Assessment - {{Latest_Assessment_Date}}] {{evidence_link}}',
            position: 'start_of_section',
            priority: 'medium',
            date_field: 'Latest_Assessment_Date'
          },
          {
            evidence_id: 'vendor_compliance_monitoring',
            evidence_name: 'Vendor Compliance Monitoring Log',
            injection_type: 'link_with_date',
            template_text: 'Vendor compliance is monitored [Reference: Vendor Compliance Monitoring Log - {{Latest_Monitoring_Date}}] {{evidence_link}}',
            position: 'after_paragraph_1',
            priority: 'medium',
            date_field: 'Latest_Monitoring_Date'
          }
        ]
      }
    ]
  },

  // ================================
  // 4. Access Control Policy (POL-004)
  // ================================
  {
    policy_id: 'POL-004',
    policy_name: 'Access Control Policy',
    sections: [
      {
        section_id: '1',
        section_title: 'Access Control Framework',
        evidence_injections: [
          {
            evidence_id: 'rbac_configuration',
            evidence_name: 'Role-Based Access Control (RBAC) Configuration',
            injection_type: 'screenshot',
            template_text: 'Access is implemented through role-based controls [Reference: RBAC Configuration - {{RBAC_Config_Date}}] {{evidence_link}}',
            position: 'start_of_section',
            priority: 'medium',
            date_field: 'RBAC_Config_Date'
          }
        ]
      },
      {
        section_id: '2',
        section_title: 'Authentication & Authorization',
        evidence_injections: [
          {
            evidence_id: 'mfa_configuration',
            evidence_name: 'MFA Configuration Screenshot',
            injection_type: 'screenshot',
            template_text: 'Multi-factor authentication is required [Reference: MFA Configuration - {{MFA_Config_Date}}] {{evidence_link}}',
            position: 'start_of_section',
            priority: 'medium',
            date_field: 'MFA_Config_Date'
          },
          {
            evidence_id: 'password_policy_configuration',
            evidence_name: 'Password Policy Configuration',
            injection_type: 'screenshot',
            template_text: 'Password policies enforce [Reference: Password Policy Configuration] {{evidence_link}}',
            position: 'after_paragraph_1',
            priority: 'medium'
          },
          {
            evidence_id: 'session_timeout_configuration',
            evidence_name: 'Session Timeout Configuration',
            injection_type: 'screenshot',
            template_text: 'Sessions timeout after inactivity [Reference: Session Timeout Configuration] {{evidence_link}}',
            position: 'after_paragraph_2',
            priority: 'medium'
          }
        ]
      },
      {
        section_id: '3',
        section_title: 'Access Review & Termination',
        evidence_injections: [
          {
            evidence_id: 'access_review_documentation',
            evidence_name: 'Access Review Documentation',
            injection_type: 'link_with_date',
            template_text: 'Access is reviewed quarterly [Reference: Access Review Documentation - {{Latest_Access_Review_Date}}] {{evidence_link}}',
            position: 'start_of_section',
            priority: 'medium',
            date_field: 'Latest_Access_Review_Date'
          },
          {
            evidence_id: 'employee_termination_checklist',
            evidence_name: 'Employee Termination Checklist',
            injection_type: 'link_with_date',
            template_text: 'Access is removed upon termination [Reference: Employee Termination Checklist - {{Latest_Termination_Date}}] {{evidence_link}}',
            position: 'after_paragraph_1',
            priority: 'medium',
            date_field: 'Latest_Termination_Date'
          }
        ]
      },
      {
        section_id: '4',
        section_title: 'Workstation & Remote Access Security',
        evidence_injections: [
          {
            evidence_id: 'workstation_security_configuration',
            evidence_name: 'Workstation Security Configuration',
            injection_type: 'screenshot',
            template_text: 'Workstations are secured per [Reference: Workstation Security Configuration] {{evidence_link}}',
            position: 'start_of_section',
            priority: 'medium'
          },
          {
            evidence_id: 'remote_access_policy',
            evidence_name: 'Remote Access Policy',
            injection_type: 'link',
            template_text: 'Remote access is controlled per [Reference: Remote Access Policy] {{evidence_link}}',
            position: 'after_paragraph_1',
            priority: 'medium'
          }
        ]
      },
      {
        section_id: '5',
        section_title: 'Encryption & Data Protection',
        evidence_injections: [
          {
            evidence_id: 'encryption_configuration',
            evidence_name: 'Encryption Configuration Screenshot',
            injection_type: 'screenshot',
            template_text: 'Encryption is enabled [Reference: Encryption Configuration - {{Encryption_Verify_Date}}] {{evidence_link}}',
            position: 'start_of_section',
            priority: 'medium',
            date_field: 'Encryption_Verify_Date'
          },
          {
            evidence_id: 'email_encryption_configuration',
            evidence_name: 'Email Encryption Configuration Proof',
            injection_type: 'screenshot',
            template_text: 'Email encryption is enabled [Reference: Email Encryption Configuration - {{Email_Encryption_Date}}] {{evidence_link}}',
            position: 'after_paragraph_1',
            priority: 'medium',
            date_field: 'Email_Encryption_Date'
          }
        ]
      }
    ]
  },

  // ================================
  // 5. Workforce Training Policy (POL-005)
  // ================================
  {
    policy_id: 'POL-005',
    policy_name: 'Workforce Training Policy',
    sections: [
      {
        section_id: '1',
        section_title: 'Training Requirements',
        evidence_injections: [
          {
            evidence_id: 'workforce_training_policy',
            evidence_name: 'Workforce Training Policy Document',
            injection_type: 'link',
            template_text: 'Training requirements are documented in [Reference: Workforce Training Policy] {{evidence_link}}',
            position: 'start_of_section',
            priority: 'high'
          }
        ]
      },
      {
        section_id: '2',
        section_title: 'Training Completion & Documentation',
        evidence_injections: [
          {
            evidence_id: 'training_completion_logs',
            evidence_name: 'Training Completion Logs',
            injection_type: 'link_with_date',
            template_text: 'Training completion is tracked [Reference: Training Completion Logs - {{Latest_Training_Date}}] {{evidence_link}}',
            position: 'start_of_section',
            priority: 'high',
            date_field: 'Latest_Training_Date'
          }
        ]
      },
      {
        section_id: '3',
        section_title: 'Training Records & Retention',
        evidence_injections: [
          {
            evidence_id: 'training_completion_logs',
            evidence_name: 'Training Completion Logs',
            injection_type: 'link',
            template_text: 'Training records are retained for 7 years [Reference: Training Completion Logs] {{evidence_link}}',
            position: 'start_of_section',
            priority: 'high'
          }
        ]
      }
    ]
  },

  // ================================
  // 6. Sanction Policy (POL-006)
  // ================================
  {
    policy_id: 'POL-006',
    policy_name: 'Sanction Policy',
    sections: [
      {
        section_id: '1',
        section_title: 'Sanctions & Discipline Framework',
        evidence_injections: [
          {
            evidence_id: 'sanction_policy',
            evidence_name: 'Sanction Policy Document',
            injection_type: 'link',
            template_text: 'Disciplinary procedures are documented in [Reference: Sanction Policy Document] {{evidence_link}}',
            position: 'start_of_section',
            priority: 'high'
          }
        ]
      },
      {
        section_id: '2',
        section_title: 'Enforcement & Documentation',
        evidence_injections: [
          {
            evidence_id: 'employee_termination_checklist',
            evidence_name: 'Employee Termination Checklist',
            injection_type: 'link',
            template_text: 'Termination procedures are documented [Reference: Employee Termination Checklist] {{evidence_link}}',
            position: 'start_of_section',
            priority: 'medium'
          }
        ]
      }
    ]
  },

  // ================================
  // 7. Incident Response & Breach Notification (POL-007)
  // ================================
  {
    policy_id: 'POL-007',
    policy_name: 'Incident Response & Breach Notification Policy',
    sections: [
      {
        section_id: '1',
        section_title: 'Incident Response Framework',
        evidence_injections: [
          {
            evidence_id: 'incident_response_plan',
            evidence_name: 'Incident Response & Breach Notification Plan',
            injection_type: 'link',
            template_text: 'Incident response procedures are documented in [Reference: Incident Response & Breach Notification Plan] {{evidence_link}}',
            position: 'start_of_section',
            priority: 'high'
          },
          {
            evidence_id: 'incident_detection_procedures',
            evidence_name: 'Incident Detection Procedures',
            injection_type: 'link',
            template_text: 'Incident detection procedures are documented in [Reference: Incident Detection Procedures] {{evidence_link}}',
            position: 'after_paragraph_1',
            priority: 'medium'
          },
          {
            evidence_id: 'incident_response_team',
            evidence_name: 'Incident Response Team Roster',
            injection_type: 'link_with_date',
            template_text: 'Incident response team members are [Reference: Incident Response Team Roster - {{Team_Update_Date}}] {{evidence_link}}',
            position: 'after_paragraph_2',
            priority: 'medium',
            date_field: 'Team_Update_Date'
          }
        ]
      },
      {
        section_id: '2',
        section_title: 'Incident Logging & Documentation',
        evidence_injections: [
          {
            evidence_id: 'breach_log',
            evidence_name: 'Breach Log / Incident Record',
            injection_type: 'link',
            template_text: 'All incidents are logged [Reference: Breach Log / Incident Record] {{evidence_link}}',
            position: 'start_of_section',
            priority: 'high'
          }
        ]
      },
      {
        section_id: '3',
        section_title: 'Breach Notification Procedures',
        evidence_injections: [
          {
            evidence_id: 'breach_notification_letter',
            evidence_name: 'Breach Notification Letter',
            injection_type: 'link',
            template_text: 'Breach notification letters follow this template [Reference: Breach Notification Letter] {{evidence_link}}',
            position: 'start_of_section',
            priority: 'medium'
          },
          {
            evidence_id: 'hhs_breach_notification',
            evidence_name: 'HHS Breach Notification Documentation',
            injection_type: 'link',
            template_text: 'HHS notification is documented [Reference: HHS Breach Notification Documentation] {{evidence_link}}',
            position: 'after_paragraph_1',
            priority: 'medium'
          }
        ]
      },
      {
        section_id: '4',
        section_title: 'Post-Incident Review',
        evidence_injections: [
          {
            evidence_id: 'post_incident_review',
            evidence_name: 'Post-Incident Review Report',
            injection_type: 'link_with_date',
            template_text: 'Post-incident reviews are conducted [Reference: Post-Incident Review Report - {{Latest_Review_Date}}] {{evidence_link}}',
            position: 'start_of_section',
            priority: 'low',
            date_field: 'Latest_Review_Date'
          }
        ]
      },
      {
        section_id: '5',
        section_title: 'Vendor Incident Reporting',
        evidence_injections: [
          {
            evidence_id: 'vendor_incident_reporting',
            evidence_name: 'Vendor Incident Reporting Agreement',
            injection_type: 'link',
            template_text: 'Vendors are required to report incidents per [Reference: Vendor Incident Reporting Agreement] {{evidence_link}}',
            position: 'start_of_section',
            priority: 'medium'
          }
        ]
      }
    ]
  },

  // ================================
  // 8. Business Associate Management (POL-008)
  // ================================
  {
    policy_id: 'POL-008',
    policy_name: 'Business Associate Management Policy',
    sections: [
      {
        section_id: '1',
        section_title: 'Business Associate Requirements',
        evidence_injections: [
          {
            evidence_id: 'executed_baa',
            evidence_name: 'Executed Business Associate Agreement (BAA)',
            injection_type: 'link_with_date',
            template_text: 'All business associates have executed BAAs [Reference: Executed BAA - {{Latest_BAA_Date}}] {{evidence_link}}',
            position: 'start_of_section',
            priority: 'high',
            date_field: 'Latest_BAA_Date'
          }
        ]
      },
      {
        section_id: '2',
        section_title: 'Vendor Assessment & Due Diligence',
        evidence_injections: [
          {
            evidence_id: 'vendor_security_assessment',
            evidence_name: 'Vendor Security Assessment Report',
            injection_type: 'link_with_date',
            template_text: 'Vendors are assessed for security [Reference: Vendor Security Assessment Report - {{Latest_Assessment_Date}}] {{evidence_link}}',
            position: 'start_of_section',
            priority: 'medium',
            date_field: 'Latest_Assessment_Date'
          },
          {
            evidence_id: 'vendor_soc2_report',
            evidence_name: 'Vendor SOC2 Report or Security Certification',
            injection_type: 'link_with_date',
            template_text: 'Vendor security certifications are reviewed [Reference: Vendor SOC2 Report - {{Latest_SOC2_Date}}] {{evidence_link}}',
            position: 'after_paragraph_1',
            priority: 'medium',
            date_field: 'Latest_SOC2_Date'
          }
        ]
      },
      {
        section_id: '3',
        section_title: 'Vendor Monitoring & Compliance',
        evidence_injections: [
          {
            evidence_id: 'vendor_compliance_monitoring',
            evidence_name: 'Vendor Compliance Monitoring Log',
            injection_type: 'link_with_date',
            template_text: 'Vendor compliance is monitored [Reference: Vendor Compliance Monitoring Log - {{Latest_Monitoring_Date}}] {{evidence_link}}',
            position: 'start_of_section',
            priority: 'medium',
            date_field: 'Latest_Monitoring_Date'
          }
        ]
      },
      {
        section_id: '4',
        section_title: 'Cloud Service Providers',
        evidence_injections: [
          {
            evidence_id: 'cloud_provider_info',
            evidence_name: 'Cloud Service Provider Information',
            injection_type: 'link',
            template_text: 'Cloud services are documented [Reference: Cloud Service Provider Information] {{evidence_link}}',
            position: 'start_of_section',
            priority: 'medium'
          },
          {
            evidence_id: 'cloud_encryption_documentation',
            evidence_name: 'Cloud Provider Encryption Documentation',
            injection_type: 'link',
            template_text: 'Cloud encryption is documented [Reference: Cloud Provider Encryption Documentation] {{evidence_link}}',
            position: 'after_paragraph_1',
            priority: 'medium'
          },
          {
            evidence_id: 'cloud_data_deletion_policy',
            evidence_name: 'Cloud Data Deletion & Portability Policy',
            injection_type: 'link',
            template_text: 'Cloud data handling is documented [Reference: Cloud Data Deletion & Portability Policy] {{evidence_link}}',
            position: 'after_paragraph_2',
            priority: 'medium'
          }
        ]
      },
      {
        section_id: '5',
        section_title: 'Subcontractor Management',
        evidence_injections: [
          {
            evidence_id: 'ba_subcontractor_agreements',
            evidence_name: 'Business Associate Subcontractor Agreements',
            injection_type: 'link',
            template_text: 'Subcontractors have agreements [Reference: Business Associate Subcontractor Agreements] {{evidence_link}}',
            position: 'start_of_section',
            priority: 'medium'
          }
        ]
      },
      {
        section_id: '6',
        section_title: 'Incident Reporting from Vendors',
        evidence_injections: [
          {
            evidence_id: 'vendor_incident_reporting',
            evidence_name: 'Vendor Incident Reporting Agreement',
            injection_type: 'link',
            template_text: 'Vendors must report incidents per [Reference: Vendor Incident Reporting Agreement] {{evidence_link}}',
            position: 'start_of_section',
            priority: 'medium'
          }
        ]
      }
    ]
  },

  // ================================
  // 9. Audit Logs & Documentation Retention (POL-009)
  // ================================
  {
    policy_id: 'POL-009',
    policy_name: 'Audit Logs & Documentation Retention Policy',
    sections: [
      {
        section_id: '1',
        section_title: 'Audit Logging Requirements',
        evidence_injections: [
          {
            evidence_id: 'audit_logs_sample',
            evidence_name: 'Audit Logs Sample Export',
            injection_type: 'link_with_date',
            template_text: 'Audit logs are maintained [Reference: Audit Logs Sample - {{Latest_Log_Date}}] {{evidence_link}}',
            position: 'start_of_section',
            priority: 'high',
            date_field: 'Latest_Log_Date'
          },
          {
            evidence_id: 'system_access_logs',
            evidence_name: 'System Access Logs (EHR/EMR)',
            injection_type: 'link_with_date',
            template_text: 'Clinical system access logs are maintained [Reference: System Access Logs - {{Latest_Log_Date}}] {{evidence_link}}',
            position: 'after_paragraph_1',
            priority: 'medium',
            date_field: 'Latest_Log_Date'
          }
        ]
      },
      {
        section_id: '2',
        section_title: 'Log Retention & Archival',
        evidence_injections: [
          {
            evidence_id: 'audit_logs_sample',
            evidence_name: 'Audit Logs Sample Export',
            injection_type: 'link',
            template_text: 'Logs are retained for 7 years [Reference: Audit Logs Sample] {{evidence_link}}',
            position: 'start_of_section',
            priority: 'high'
          }
        ]
      },
      {
        section_id: '3',
        section_title: 'Log Review & Monitoring',
        evidence_injections: [
          {
            evidence_id: 'audit_logs_sample',
            evidence_name: 'Audit Logs Sample Export',
            injection_type: 'link_with_date',
            template_text: 'Logs are reviewed for anomalies [Reference: Audit Logs Sample - {{Latest_Review_Date}}] {{evidence_link}}',
            position: 'start_of_section',
            priority: 'high',
            date_field: 'Latest_Review_Date'
          }
        ]
      },
      {
        section_id: '4',
        section_title: 'Documentation Retention Schedule',
        evidence_injections: [
          {
            evidence_id: 'data_destruction_policy',
            evidence_name: 'Data Destruction & Disposal Policy',
            injection_type: 'link',
            template_text: 'Documentation is disposed per [Reference: Data Destruction & Disposal Policy] {{evidence_link}}',
            position: 'start_of_section',
            priority: 'medium'
          }
        ]
      }
    ]
  }
];

/**
 * Get evidence injection points for a specific policy
 */
export function getEvidenceInjectionPointsForPolicy(policyId: string): PolicyEvidenceMapping | undefined {
  return POLICY_EVIDENCE_MAPPINGS.find(mapping => mapping.policy_id === policyId);
}

/**
 * Get evidence injection points for a specific policy section
 */
export function getEvidenceInjectionPointsForSection(
  policyId: string,
  sectionId: string
): EvidenceInjectionPoint[] {
  const policyMapping = getEvidenceInjectionPointsForPolicy(policyId);
  if (!policyMapping) return [];

  const section = policyMapping.sections.find(s => s.section_id === sectionId);
  return section?.evidence_injections || [];
}

/**
 * Get all high-priority evidence for a policy
 */
export function getHighPriorityEvidenceForPolicy(policyId: string): EvidenceInjectionPoint[] {
  const policyMapping = getEvidenceInjectionPointsForPolicy(policyId);
  if (!policyMapping) return [];

  const allInjections = policyMapping.sections.flatMap(section => section.evidence_injections);
  return allInjections.filter(injection => injection.priority === 'high');
}

/**
 * Get all evidence IDs required for a policy
 */
export function getAllEvidenceIdsForPolicy(policyId: string): string[] {
  const policyMapping = getEvidenceInjectionPointsForPolicy(policyId);
  if (!policyMapping) return [];

  const allInjections = policyMapping.sections.flatMap(section => section.evidence_injections);
  const uniqueIds = new Set(allInjections.map(injection => injection.evidence_id));
  return Array.from(uniqueIds);
}

/**
 * Check if policy has all required evidence
 */
export function checkPolicyEvidenceCompleteness(
  policyId: string,
  availableEvidenceIds: string[]
): {
  complete: boolean;
  missing: string[];
  coverage_percent: number;
} {
  const highPriorityEvidence = getHighPriorityEvidenceForPolicy(policyId);
  const requiredIds = highPriorityEvidence.map(e => e.evidence_id);
  const uniqueRequiredIds = Array.from(new Set(requiredIds));
  
  const missing = uniqueRequiredIds.filter(id => !availableEvidenceIds.includes(id));
  const coverage_percent = uniqueRequiredIds.length === 0 
    ? 100 
    : Math.round(((uniqueRequiredIds.length - missing.length) / uniqueRequiredIds.length) * 100);

  return {
    complete: missing.length === 0,
    missing,
    coverage_percent
  };
}
