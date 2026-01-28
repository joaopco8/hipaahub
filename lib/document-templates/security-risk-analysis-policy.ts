/**
 * Security Risk Analysis (SRA) Policy Template - ELITE VERSION
 * Policy ID: POL-002
 * Pages: 12-18 (ELITE standard)
 * 
 * Comprehensive, defensible SRA policy with detailed methodology, examples,
 * and strong legal defensibility.
 */

export const SECURITY_RISK_ANALYSIS_POLICY_TEMPLATE = `
POLICY 2: SECURITY RISK ANALYSIS (SRA) POLICY

Pages: 12-18

Document Control

Field
Value
Policy ID
{{Policy_ID}}
Title
Security Risk Analysis (SRA) Policy
Effective Date
{{Effective_Date}}
Last Reviewed
{{Assessment_Date}}
Next Review Date
{{Next_Review_Date}}
Policy Owner
{{Security_Officer_Name}}, {{Security_Officer_Role}}
Legal Basis
45 CFR §164.308(a)(1)(ii)(A)
Document Classification
Confidential - Internal Use Only


═══════════════════════════════════════════════════════════════
EXECUTIVE SUMMARY
═══════════════════════════════════════════════════════════════

This Security Risk Analysis (SRA) Policy establishes comprehensive procedures for {{Organization_Legal_Name}} to conduct formal, documented assessments of threats and vulnerabilities to the confidentiality, integrity, and availability of Protected Health Information (PHI) and Electronic Protected Health Information (ePHI).

45 CFR §164.308(a)(1)(ii)(A) requires covered entities to conduct a comprehensive risk analysis that identifies the location of PHI and ePHI, identifies potential threats and vulnerabilities, assesses the likelihood and impact of potential threats, evaluates the sufficiency of existing security controls, and documents findings and recommendations.

The SRA is the foundational document that identifies security gaps, prioritizes risks, and informs the development of the Risk Management Plan. Without a documented SRA, the organization cannot demonstrate compliance with HIPAA Security Rule requirements and is vulnerable to OCR enforcement actions.

Recent OCR enforcement actions have demonstrated that organizations without comprehensive, documented SRAs face significant penalties:
• $3.5 million settlement for failure to conduct Security Risk Analysis
• $1.5 million settlement for inadequate Security Risk Analysis
• $650,000 settlement for failure to update Security Risk Analysis after system changes

This policy ensures that {{Organization_Legal_Name}} conducts comprehensive, documented SRAs that meet OCR requirements and provide strong legal defensibility.


═══════════════════════════════════════════════════════════════
1. PURPOSE AND LEGAL REQUIREMENT
═══════════════════════════════════════════════════════════════

1.1 Purpose

The purpose of this Security Risk Analysis (SRA) Policy is to establish comprehensive procedures for {{Organization_Legal_Name}} to conduct a formal, documented assessment of threats and vulnerabilities to the confidentiality, integrity, and availability of Protected Health Information (PHI) and Electronic Protected Health Information (ePHI).

The SRA serves multiple critical functions:

a) Compliance Demonstration: Demonstrates to OCR that the organization has identified and assessed all security risks

b) Risk Prioritization: Identifies which risks pose the greatest threat to PHI and ePHI, enabling the organization to allocate resources effectively

c) Control Evaluation: Evaluates whether existing security controls are sufficient to protect PHI and ePHI

d) Gap Identification: Identifies gaps in security controls that need to be addressed

e) Risk Management Foundation: Provides the foundation for the Risk Management Plan, which specifies how identified risks will be addressed

f) Continuous Improvement: Enables the organization to continuously improve its security posture

g) Audit Defense: Provides defensible documentation for OCR audits and investigations

1.2 Legal Authority

45 CFR §164.308(a)(1)(ii)(A) requires covered entities to conduct a comprehensive risk analysis that includes:

• Identification of the location of PHI and ePHI
• Identification of potential threats and vulnerabilities
• Analysis of the likelihood and impact of potential threats
• Analysis of the sufficiency of security measures already in place
• Documentation of findings and recommendations

The OCR has stated that the Security Risk Analysis is "the foundation of the Security Rule" and that organizations that fail to conduct comprehensive SRAs are subject to significant enforcement actions.

1.3 OCR Enforcement Context

Recent OCR enforcement actions demonstrate the critical importance of comprehensive SRAs:

• Case 1: $3.5 million settlement for failure to conduct Security Risk Analysis
  - Organization had no documented SRA
  - OCR found multiple security vulnerabilities
  - Organization could not demonstrate compliance

• Case 2: $1.5 million settlement for inadequate Security Risk Analysis
  - Organization had SRA but it was incomplete
  - SRA did not cover all systems containing ePHI
  - SRA did not identify all threats and vulnerabilities

• Case 3: $650,000 settlement for failure to update Security Risk Analysis
  - Organization had initial SRA but did not update it after system changes
  - New EHR system was not included in SRA
  - OCR found security vulnerabilities in new system

These enforcement actions demonstrate that:
• SRAs must be comprehensive and cover all systems containing ePHI
• SRAs must be updated when systems change
• SRAs must be documented in detail
• SRAs must identify all threats and vulnerabilities
• SRAs must evaluate the sufficiency of existing controls

{{SRA_STATEMENT}}

The SRA is the foundational document that identifies security gaps, prioritizes risks, and informs the development of the Risk Management Plan. Without a documented SRA, the organization cannot demonstrate compliance with HIPAA Security Rule requirements and is vulnerable to OCR enforcement actions.

{{SRA_DOCUMENTATION}}


═══════════════════════════════════════════════════════════════
2. SRA FREQUENCY AND SCOPE
═══════════════════════════════════════════════════════════════

2.1 Annual Requirement

{{SRA_FREQUENCY}}

{{SRA_STATEMENT}}

The organization conducts a comprehensive Security Risk Analysis at least annually. The annual SRA is scheduled to be completed by {{Next_Review_Date}} and covers all systems, locations, and processes that create, receive, maintain, or transmit PHI or ePHI.

The annual SRA process includes:
• Planning and preparation (2 weeks)
• Asset inventory and data mapping (2-4 weeks)
• Threat and vulnerability identification (2-3 weeks)
• Risk assessment and prioritization (1-2 weeks)
• Control evaluation (1-2 weeks)
• Documentation and reporting (1-2 weeks)
• Review and approval (1 week)

Total timeline: 10-16 weeks from initiation to completion.

2.2 Trigger-Based SRAs

Additional SRAs are conducted whenever significant changes occur that could affect the security of PHI or ePHI. Trigger events include:

2.2.1 Significant System Changes

• Implementation of new EHR system
• Migration to new EHR system
• Implementation of new cloud-based services
• Implementation of new network infrastructure
• Major software upgrades or system replacements
• Implementation of new telehealth platforms
• Implementation of new patient portals
• Implementation of new mobile applications

Example: When {{Organization_Legal_Name}} migrated from [Previous EHR] to [New EHR] on [Date], a comprehensive SRA was conducted to assess security risks associated with the new system, including data migration, user access, encryption, backup procedures, and integration with other systems.

2.2.2 Security Incidents or Breaches

• Any security incident that results in unauthorized access to PHI
• Any breach of unsecured PHI
• Ransomware or malware infections
• Phishing attacks that result in compromised credentials
• Physical theft or loss of devices containing ePHI

Example: When a laptop containing ePHI was stolen on [Date], an immediate SRA was conducted to assess:
• What data was on the laptop
• Whether the data was encrypted
• Who had access to the laptop
• Whether similar vulnerabilities exist in other systems
• What additional controls are needed to prevent similar incidents

2.2.3 New Threats or Vulnerabilities

• Discovery of new malware or attack vectors
• Public disclosure of security vulnerabilities in systems used by the organization
• Industry alerts about new threats
• OCR guidance about new threats

Example: When the WannaCry ransomware attack occurred in May 2017, {{Organization_Legal_Name}} conducted an immediate SRA to assess:
• Whether systems were vulnerable to the attack
• Whether patches were up to date
• Whether backup systems were adequate
• Whether incident response procedures were sufficient

2.2.4 Regulatory Changes

• Changes to HIPAA regulations
• New OCR guidance
• Changes to state privacy laws
• New industry standards or frameworks

2.2.5 Organizational Changes

• Expansion of operations (new locations, new services)
• Contraction of operations (closing locations, discontinuing services)
• Mergers or acquisitions
• Changes in organizational structure
• Changes in workforce size

2.2.6 Business Associate Changes

• Addition of new Business Associates
• Changes to existing Business Associate relationships
• Termination of Business Associate relationships
• Business Associate security incidents

2.2.7 Audit Findings

• Internal audit findings that identify security gaps
• External audit findings that identify security gaps
• OCR audit findings
• Third-party security assessment findings

2.2.8 Time-Based Triggers

• More than 12 months have passed since the last SRA
• More than 6 months have passed since the last SRA and significant changes have occurred

2.3 Scope of SRA

The SRA covers all systems, locations, and processes that create, receive, maintain, or transmit PHI or ePHI, including:

2.3.1 Clinical Information Systems

• Electronic Health Record (EHR) systems
  - Primary EHR system: [System Name]
  - Backup EHR system: [System Name]
  - Historical EHR systems: [System Names]
  
• Laboratory information systems
  - Laboratory information system: [System Name]
  - Laboratory interfaces: [Interface Names]
  
• Imaging systems
  - Picture Archiving and Communication System (PACS): [System Name]
  - Radiology Information System (RIS): [System Name]
  - Imaging interfaces: [Interface Names]
  
• Pharmacy systems
  - Pharmacy information system: [System Name]
  - E-prescribing system: [System Name]
  
• Other clinical systems
  - [List other clinical systems]

2.3.2 Administrative Systems

• Billing and revenue cycle management systems
  - Practice management system: [System Name]
  - Billing system: [System Name]
  - Claims processing system: [System Name]
  
• Scheduling systems
  - Appointment scheduling system: [System Name]
  - Patient portal: [System Name]
  
• Human resources systems
  - HR information system: [System Name]
  - Payroll system: [System Name]
  
• Financial systems
  - Accounting system: [System Name]
  - Accounts payable system: [System Name]
  
• Other administrative systems
  - [List other administrative systems]

2.3.3 Network Infrastructure

• Servers
  - File servers: [Server Names]
  - Database servers: [Server Names]
  - Application servers: [Server Names]
  - Backup servers: [Server Names]
  
• Network devices
  - Firewalls: [Device Names]
  - Routers: [Device Names]
  - Switches: [Device Names]
  - Wireless access points: [Device Names]
  
• Security systems
  - Intrusion detection systems: [System Names]
  - Security information and event management (SIEM): [System Name]
  - Vulnerability scanning systems: [System Name]
  
• Remote access systems
  - VPN systems: [System Names]
  - Remote desktop systems: [System Names]
  - Citrix or similar systems: [System Names]

2.3.4 Physical Locations

• Primary office locations
  - [Location Name and Address]
  - [Location Name and Address]
  
• Satellite clinics
  - [Location Name and Address]
  - [Location Name and Address]
  
• Remote work locations
  - Employee home offices
  - Temporary work locations
  
• Data centers
  - On-premises data center: [Location]
  - Cloud data centers: [Provider Names]
  
• Storage facilities
  - Off-site backup storage: [Location]
  - Paper record storage: [Location]

2.3.5 Mobile Devices and Remote Access

• Organization-owned mobile devices
  - Laptops: [Count and Types]
  - Tablets: [Count and Types]
  - Smartphones: [Count and Types]
  
• Personally-owned mobile devices (BYOD)
  - Devices used for work purposes
  - Mobile device management (MDM) systems
  
• Remote access systems
  - VPN access
  - Remote desktop access
  - Cloud-based access

2.3.6 Cloud-Based Services and SaaS Applications

• Cloud storage services
  - [Service Name and Provider]
  - [Service Name and Provider]
  
• Software as a Service (SaaS) applications
  - [Application Name and Provider]
  - [Application Name and Provider]
  
• Infrastructure as a Service (IaaS)
  - [Service Name and Provider]
  
• Platform as a Service (PaaS)
  - [Service Name and Provider]

2.3.7 Business Associate Systems

• Business Associate systems that access PHI
  - [Business Associate Name and System]
  - [Business Associate Name and System]
  
• Third-party integrations
  - [Integration Name and Provider]
  - [Integration Name and Provider]

2.3.8 Email and Communication Systems

• Email systems
  - Primary email system: [System Name]
  - Email encryption: [System Name]
  
• Secure messaging systems
  - [System Name]
  - [System Name]
  
• Fax systems
  - [System Name]
  - [System Name]

2.3.9 Backup and Disaster Recovery Systems

• Backup systems
  - [System Name and Location]
  - [System Name and Location]
  
• Disaster recovery systems
  - [System Name and Location]
  - [System Name and Location]
  
• Business continuity systems
  - [System Name and Location]


═══════════════════════════════════════════════════════════════
3. SRA METHODOLOGY
═══════════════════════════════════════════════════════════════

3.1 Assessment Team

The SRA is conducted by a team led by the Security Officer ({{Security_Officer_Name}}) and including representatives from:

3.1.1 Core Team Members

• Security Officer ({{Security_Officer_Name}}, {{Security_Officer_Role}}) - Team Leader
  - Overall responsibility for SRA
  - Coordinates team activities
  - Ensures comprehensive coverage
  - Reviews and approves findings
  - Reports to CEO and Board

• IT/Systems Administration
  - Database administrators
  - Network engineers
  - Systems administrators
  - Help desk staff
  - Responsibilities: Technical assessment, system inventory, vulnerability assessment

• Clinical Leadership
  - Chief Medical Officer (or equivalent)
  - Clinical department heads
  - Responsibilities: Clinical system assessment, workflow analysis, user access review

• Administrative Leadership
  - Chief Financial Officer
  - Operations director
  - Office managers
  - Responsibilities: Administrative system assessment, process analysis, resource allocation

• Compliance/Privacy
  - Privacy Officer ({{Privacy_Officer_Name}})
  - Compliance staff (if applicable)
  - Responsibilities: Privacy risk assessment, regulatory compliance review

3.1.2 External Resources

• External security consultants or auditors (as needed)
  - Used for complex technical assessments
  - Used for independent validation
  - Used for specialized expertise

• Legal counsel (as needed)
  - Used for regulatory interpretation
  - Used for risk assessment from legal perspective

3.1.3 Team Meetings

The team meets weekly during the SRA process to:
• Review progress
• Discuss findings
• Share information
• Coordinate assessments
• Resolve issues
• Ensure comprehensive coverage

Meeting minutes are documented and retained for minimum 6 years.

3.2 Assessment Process

The SRA follows a structured methodology based on NIST Special Publication 800-30 (Guide for Conducting Risk Assessments) and NIST Special Publication 800-66 (An Introductory Resource Guide for Implementing the HIPAA Security Rule). The methodology includes six sequential steps:

3.2.1 Step 1: Asset Inventory

The assessment team identifies and inventories all systems, data repositories, and locations that contain PHI or ePHI. For each asset, the team documents:

• Asset Name and Description
  - What is the asset?
  - What is its purpose?
  - What type of asset is it (system, location, device, database)?

• Asset Owner or Custodian
  - Who is responsible for the asset?
  - Who manages the asset on a day-to-day basis?
  - Who should be contacted about the asset?

• Location (Physical or Virtual)
  - Where is the asset located?
  - Is it on-premises, cloud-based, or hybrid?
  - What is the physical address (if applicable)?
  - What is the cloud provider and region (if applicable)?

• Data Classification
  - What type of data does the asset contain (PHI, ePHI, sensitive, public)?
  - What is the sensitivity level (high, medium, low)?
  - What types of PHI are stored (demographics, clinical, financial)?

• Number of Individuals Affected
  - How many patients' PHI is stored in the asset?
  - What is the scope of impact if the asset is compromised?

• Business Criticality
  - Is the asset essential for patient care (critical)?
  - Is the asset important for operations (important)?
  - Is the asset non-essential (non-essential)?

• System Dependencies
  - What other systems depend on this asset?
  - What systems does this asset depend on?
  - What is the impact if this asset fails?

• Access Methods
  - How is the asset accessed (desktop, web, mobile, API)?
  - Who has access to the asset?
  - What are the access controls?

• Backup and Recovery
  - Is the asset backed up?
  - How often is it backed up?
  - Where are backups stored?
  - What is the recovery time objective (RTO)?
  - What is the recovery point objective (RPO)?

Example Asset Inventory Entry:

Asset Name: Primary EHR System
Description: Cloud-based electronic health record system used for all clinical documentation
Owner: IT Director
Custodian: Clinical Systems Administrator
Location: Cloud (AWS us-east-1)
Data Classification: ePHI (High Sensitivity)
Number of Individuals Affected: Approximately 15,000 active patients
Business Criticality: Essential (Critical)
System Dependencies: Laboratory system, imaging system, billing system
Access Methods: Web-based application, mobile app
Backup and Recovery: Daily backups, 4-hour RTO, 24-hour RPO

3.2.2 Step 2: Threat Identification

The team identifies potential threats to the confidentiality, integrity, and availability of PHI, including:

3.2.2.1 External Threats

• Cyber Attacks
  - Hackers attempting to gain unauthorized access
  - Malware (viruses, trojans, ransomware)
  - Phishing attacks
  - Denial-of-service (DoS) attacks
  - SQL injection attacks
  - Cross-site scripting (XSS) attacks
  - Man-in-the-middle attacks
  - Advanced persistent threats (APTs)

• Data Breaches
  - Unauthorized access to systems
  - Unauthorized disclosure of PHI
  - Theft of devices containing ePHI
  - Loss of devices containing ePHI

• Third-Party Risks
  - Business Associate security incidents
  - Cloud service provider security incidents
  - Vendor security vulnerabilities
  - Supply chain attacks

3.2.2.2 Internal Threats

• Unauthorized Access
  - Workforce members accessing PHI outside their job function
  - Workforce members accessing PHI of patients not under their care
  - Workforce members accessing PHI of family members, friends, or celebrities
  - Shared or compromised user credentials
  - Excessive user privileges

• Negligence
  - Failure to lock workstations
  - Failure to log off systems
  - Failure to follow security procedures
  - Failure to report security incidents
  - Inadequate training

• Insider Threats
  - Malicious workforce members
  - Disgruntled employees
  - Employees with financial difficulties
  - Employees with access to sensitive information

3.2.2.3 Environmental Threats

• Natural Disasters
  - Fire
  - Flood
  - Earthquake
  - Tornado
  - Hurricane
  - Power outages
  - Network outages

• Equipment Failures
  - Server failures
  - Storage failures
  - Network device failures
  - Power supply failures
  - Cooling system failures

• Infrastructure Failures
  - Internet connectivity failures
  - Cloud service outages
  - Data center outages
  - Telecommunications failures

3.2.2.4 Regulatory Threats

• Compliance Violations
  - Failure to comply with HIPAA requirements
  - Failure to comply with state privacy laws
  - OCR enforcement actions
  - State attorney general enforcement actions

• Audit Findings
  - Internal audit findings
  - External audit findings
  - OCR audit findings
  - Third-party security assessment findings

3.2.3 Step 3: Vulnerability Assessment

The team identifies weaknesses in existing security controls that could be exploited by threats, including:

3.2.3.1 Access Control Vulnerabilities

• Weak or missing access controls
  - Lack of role-based access control
  - Excessive user privileges
  - Shared user accounts
  - Default passwords
  - Weak password policies
  - Lack of multi-factor authentication
  - Inadequate session management

• User Account Management Vulnerabilities
  - Accounts not terminated upon employee departure
  - Accounts with excessive privileges
  - Lack of regular access reviews
  - Inadequate user provisioning procedures

3.2.3.2 Encryption Vulnerabilities

• Unencrypted data transmission
  - Email without encryption
  - Unencrypted file transfers
  - Unencrypted remote access
  - Unencrypted cloud storage

• Unencrypted data storage
  - Unencrypted databases
  - Unencrypted file servers
  - Unencrypted portable devices
  - Unencrypted backup media

3.2.3.3 System Vulnerabilities

• Outdated or unpatched systems
  - Operating systems not updated
  - Applications not patched
  - Security software not updated
  - Firmware not updated

• Configuration Vulnerabilities
  - Default configurations
  - Weak security settings
  - Inadequate firewall rules
  - Inadequate network segmentation

3.2.3.4 Physical Security Vulnerabilities

• Inadequate physical access controls
  - Lack of visitor logs
  - Lack of badge systems
  - Unlocked server rooms
  - Unsecured workstations
  - Unsecured storage areas

• Inadequate workstation security
  - Workstations not locked
  - Workstations left unattended
  - Workstations in public areas
  - Lack of screen locks

3.2.3.5 Audit and Monitoring Vulnerabilities

• Insufficient audit logging
  - Systems without audit logging
  - Incomplete audit logs
  - Audit logs not reviewed
  - Audit logs not retained

• Inadequate monitoring
  - Lack of automated monitoring
  - Lack of security alerts
  - Lack of intrusion detection
  - Lack of security information and event management (SIEM)

3.2.3.6 Workforce Training Vulnerabilities

• Lack of workforce training
  - Workforce members not trained
  - Training not current
  - Training not role-specific
  - Training not effective

• Lack of security awareness
  - Workforce members not aware of threats
  - Workforce members not aware of procedures
  - Workforce members not reporting incidents

3.2.3.7 Incident Response Vulnerabilities

• Inadequate incident response procedures
  - Lack of incident response plan
  - Lack of incident response team
  - Lack of incident response procedures
  - Lack of incident response testing

• Inadequate breach notification procedures
  - Lack of breach notification procedures
  - Lack of breach notification templates
  - Lack of breach notification testing

3.2.3.8 Backup and Recovery Vulnerabilities

• Inadequate backup procedures
  - Lack of regular backups
  - Backups not tested
  - Backups not stored securely
  - Backups not encrypted

• Inadequate disaster recovery
  - Lack of disaster recovery plan
  - Disaster recovery plan not tested
  - Inadequate recovery time objectives
  - Inadequate recovery point objectives

3.2.4 Step 4: Likelihood and Impact Analysis

The team assesses the likelihood and potential impact of each threat-vulnerability combination using a risk matrix. The assessment considers:

3.2.4.1 Likelihood Assessment

Likelihood is assessed based on:
• Historical data (have similar incidents occurred?)
• Threat intelligence (are threats active?)
• System exposure (how exposed is the system?)
• Control effectiveness (how effective are existing controls?)
• Threat actor capability (how capable are threat actors?)

Likelihood Levels:

• High: The threat is likely to occur within the next 12 months (probability > 50%)
  - Example: Phishing attacks (occurring daily)
  - Example: Workforce members accessing PHI outside job function (occurring monthly)
  
• Medium: The threat may occur within the next 12 months (probability 10-50%)
  - Example: Ransomware attack (occurring quarterly in healthcare industry)
  - Example: Physical theft of device (occurring annually)
  
• Low: The threat is unlikely to occur within the next 12 months (probability < 10%)
  - Example: Natural disaster (occurring every 5-10 years)
  - Example: Advanced persistent threat (occurring rarely for small organizations)

3.2.4.2 Impact Assessment

Impact is assessed based on:
• Number of individuals affected
• Type of information compromised
• Potential harm to individuals
• Potential regulatory penalties
• Potential business impact
• Potential reputational damage

Impact Levels:

• High: The threat would result in significant harm to patients or the organization
  - Breach affecting 100+ individuals
  - Financial loss > $100,000
  - Regulatory fines > $100,000
  - Loss of accreditation
  - Significant reputational damage
  - Example: Ransomware attack encrypting all ePHI
  - Example: Unauthorized disclosure of PHI to media
  
• Medium: The threat would result in moderate harm
  - Breach affecting 10-100 individuals
  - Financial loss $10,000-$100,000
  - Regulatory fines $10,000-$100,000
  - Minor regulatory findings
  - Moderate reputational damage
  - Example: Unauthorized access to PHI of 50 patients
  - Example: Loss of unencrypted laptop with ePHI of 25 patients
  
• Low: The threat would result in minimal harm
  - Breach affecting < 10 individuals
  - Financial loss < $10,000
  - No regulatory implications
  - Minimal reputational damage
  - Example: Unauthorized access to PHI of 1 patient (no disclosure)
  - Example: Minor policy violation with no patient harm

3.2.4.3 Risk Matrix

Risks are categorized using the following risk matrix:

Likelihood | Impact | Risk Level | Priority | Remediation Timeline
----------|--------|------------|----------|-------------------
High      | High   | Critical (5)| 1       | 30 days
High      | Medium | High (4)   | 2       | 90 days
High      | Low    | Medium (3)  | 3       | 180 days
Medium    | High   | High (4)    | 2       | 90 days
Medium    | Medium | Medium (3)  | 3       | 180 days
Medium    | Low    | Low (2)     | 4       | 1 year
Low       | High   | Medium (3)  | 3       | 180 days
Low       | Medium | Low (2)     | 4       | 1 year
Low       | Low    | Low (1)     | 5       | 1 year

3.2.4.4 Risk Scoring Examples

Example 1: Unencrypted Laptop with ePHI
• Threat: Theft or loss of laptop
• Vulnerability: Laptop not encrypted
• Likelihood: Medium (laptops are stolen/lost regularly)
• Impact: High (laptop contains ePHI of 500+ patients)
• Risk Level: High (4)
• Priority: 2
• Remediation Timeline: 90 days

Example 2: Weak Password Policy
• Threat: Unauthorized access via password guessing
• Vulnerability: Weak password policy (8 characters, no complexity)
• Likelihood: High (password attacks are common)
• Impact: Medium (could lead to unauthorized access)
• Risk Level: High (4)
• Priority: 2
• Remediation Timeline: 90 days

Example 3: Lack of Multi-Factor Authentication for Remote Access
• Threat: Unauthorized remote access
• Vulnerability: No MFA for remote access
• Likelihood: High (remote access attacks are common)
• Impact: High (could lead to breach of all ePHI)
• Risk Level: Critical (5)
• Priority: 1
• Remediation Timeline: 30 days

3.2.5 Step 5: Control Sufficiency Analysis

The team evaluates the sufficiency of existing security controls to mitigate identified risks. For each control, the team assesses:

3.2.5.1 Control Implementation

• Is the control implemented?
  - Yes: Control is fully implemented
  - Partial: Control is partially implemented
  - No: Control is not implemented
  - N/A: Control is not applicable

• How is the control implemented?
  - Technical implementation (software, hardware)
  - Administrative implementation (policies, procedures)
  - Physical implementation (locks, barriers)

3.2.5.2 Control Effectiveness

• Is the control effective?
  - Highly Effective: Control effectively mitigates the risk
  - Moderately Effective: Control partially mitigates the risk
  - Minimally Effective: Control provides minimal mitigation
  - Not Effective: Control does not mitigate the risk

• How is effectiveness measured?
  - Testing results
  - Monitoring results
  - Incident history
  - Audit findings

3.2.5.3 Control Documentation

• Is the control documented?
  - Yes: Control is fully documented
  - Partial: Control is partially documented
  - No: Control is not documented

• Where is the control documented?
  - Policies
  - Procedures
  - System documentation
  - Training materials

3.2.5.4 Control Monitoring

• Is the control monitored?
  - Yes: Control is regularly monitored
  - Partial: Control is occasionally monitored
  - No: Control is not monitored

• How is the control monitored?
  - Automated monitoring
  - Manual monitoring
  - Audit log review
  - Compliance reports

3.2.5.5 Control Adequacy

• Does the control adequately mitigate the risk?
  - Yes: Control adequately mitigates the risk
  - Partial: Control partially mitigates the risk
  - No: Control does not adequately mitigate the risk

• Are additional controls needed?
  - Yes: Additional controls are needed
  - No: Existing controls are sufficient

3.2.6 Step 6: Documentation and Reporting

The team documents all findings, recommendations, and remediation actions in a comprehensive SRA report. The report includes:

3.2.6.1 Executive Summary

• Overview of SRA process
• Summary of key findings
• Summary of identified risks
• Summary of recommendations
• Overall risk posture

3.2.6.2 Detailed Findings

• Asset inventory
• Threat identification
• Vulnerability assessment
• Risk assessment and prioritization
• Control evaluation
• Gap analysis

3.2.6.3 Recommendations

• Specific remediation actions
• Prioritization of actions
• Estimated costs
• Estimated timelines
• Responsible parties
• Success criteria

3.2.6.4 Appendices

• Detailed asset inventory
• Threat catalog
• Vulnerability catalog
• Risk register
• Control matrix
• Testing results
• Supporting documentation

{{SRA_DOCUMENTATION}}

{{AUDIT_EVIDENCE_LIST}}

3.3 Risk Assessment Criteria

The team uses the following criteria to assess the likelihood and impact of risks:

3.3.1 Likelihood Assessment Criteria

Likelihood is assessed based on:

• Historical Data
  - Have similar incidents occurred in the past?
  - How frequently have they occurred?
  - What is the trend (increasing, decreasing, stable)?

• Threat Intelligence
  - Are threats active in the healthcare industry?
  - Are threats targeting organizations like ours?
  - What is the threat landscape?

• System Exposure
  - How exposed is the system to threats?
  - Is the system internet-facing?
  - Is the system accessible remotely?
  - Is the system in a public location?

• Control Effectiveness
  - How effective are existing controls?
  - Have controls been tested?
  - Have controls failed in the past?

• Threat Actor Capability
  - How capable are threat actors?
  - Are threat actors targeting healthcare?
  - What is the motivation of threat actors?

3.3.2 Impact Assessment Criteria

Impact is assessed based on:

• Number of Individuals Affected
  - How many patients' PHI would be compromised?
  - What is the scope of impact?

• Type of Information Compromised
  - What types of PHI would be compromised?
  - Is the information sensitive (mental health, HIV, substance abuse)?
  - Is the information financial (credit card, bank account)?

• Potential Harm to Individuals
  - Could individuals suffer financial harm?
  - Could individuals suffer reputational harm?
  - Could individuals suffer physical harm?

• Potential Regulatory Penalties
  - What are potential OCR penalties?
  - What are potential state attorney general penalties?
  - What are potential class action lawsuit damages?

• Potential Business Impact
  - What is the impact on operations?
  - What is the impact on revenue?
  - What is the impact on reputation?
  - What is the impact on patient trust?

• Potential Reputational Damage
  - Would the incident be reported in the media?
  - Would the incident affect patient trust?
  - Would the incident affect business relationships?


═══════════════════════════════════════════════════════════════
4. SRA DOCUMENTATION AND REPORTING
═══════════════════════════════════════════════════════════════

4.1 SRA Report Structure

The SRA is documented in a comprehensive report that includes:

4.1.1 Executive Summary

• Overview of SRA process and methodology
• Summary of key findings
• Summary of identified risks by priority
• Summary of recommendations
• Overall risk posture assessment
• Comparison to previous SRA (if applicable)

4.1.2 Detailed Inventory of Systems and Data Repositories

• Complete asset inventory
• Data flow diagrams
• System architecture diagrams
• Network topology diagrams
• Data classification matrix

4.1.3 Identification of Threats and Vulnerabilities

• Comprehensive threat catalog
• Vulnerability catalog
• Threat-vulnerability matrix
• Threat intelligence summary

4.1.4 Risk Assessment and Prioritization

• Risk register with all identified risks
• Risk matrix with risk levels
• Risk prioritization
• Risk scoring methodology
• Risk trends and patterns

4.1.5 Evaluation of Existing Controls

• Control inventory
• Control effectiveness assessment
• Control gap analysis
• Control recommendations

4.1.6 Recommendations for Remediation

• Specific remediation actions for each identified risk
• Prioritization of remediation actions
• Estimated costs for each remediation action
• Estimated timelines for each remediation action
• Responsible parties for each remediation action
• Success criteria for each remediation action
• Measurement methods for each remediation action

4.1.7 Appendices

• Detailed asset inventory
• Threat catalog with descriptions
• Vulnerability catalog with descriptions
• Risk register with full details
• Control matrix
• Testing results
• Supporting documentation
• References and resources

4.2 Report Review and Approval

The SRA report is:
• Reviewed by the Security Officer
• Reviewed by the Privacy Officer
• Reviewed by the Compliance Committee
• Approved by the CEO
• Presented to the Board of Directors
• Retained for minimum 6 years

4.3 Report Distribution

The SRA report is distributed to:
• Security Officer
• Privacy Officer
• CEO
• Board of Directors
• Compliance Committee
• IT Director
• External auditors (upon request)
• OCR (upon request)

4.4 Report Retention

The SRA report is retained for minimum 6 years in:
• Secure electronic storage
• Secure physical storage (if printed)
• Backup systems
• Disaster recovery systems


═══════════════════════════════════════════════════════════════
5. COMMUNICATION AND IMPLEMENTATION
═══════════════════════════════════════════════════════════════

5.1 Communication of SRA Findings

The SRA findings are communicated to all relevant stakeholders:

5.1.1 Board of Directors

• Executive summary of findings
• Key risks and recommendations
• Resource requirements
• Timeline for remediation
• Presentation at Board meeting

5.1.2 Senior Management

• Full report with recommendations
• Cost estimates
• Timeline estimates
• Resource requirements
• Implementation plan

5.1.3 IT Staff

• Technical findings
• System-specific vulnerabilities
• Recommended technical controls
• Implementation guidance
• Testing requirements

5.1.4 Clinical Leadership

• Clinical system findings
• Workflow impact
• User access findings
• Training requirements

5.1.5 Workforce Members

• General awareness of security risks
• Role-specific findings (if applicable)
• Training requirements
• Policy updates

5.2 Integration with Risk Management Plan

The SRA findings inform the development of the Risk Management Plan (POL-003), which specifies:
• How identified risks will be addressed
• Prioritization of remediation actions
• Implementation timelines
• Resource allocation
• Responsibility assignment
• Monitoring and review procedures


═══════════════════════════════════════════════════════════════
6. SRA REVIEW AND UPDATES
═══════════════════════════════════════════════════════════════

6.1 Review Schedule

The SRA is reviewed and updated:

• Annually (minimum requirement)
  - Comprehensive annual SRA
  - Scheduled completion date: {{Next_Review_Date}}
  - Timeline: 10-16 weeks

• Whenever significant system changes occur
  - New systems implemented
  - Systems migrated or replaced
  - Major upgrades

• Whenever a security incident or breach occurs
  - Immediate SRA to assess impact
  - Identify root causes
  - Identify similar vulnerabilities

• Whenever new threats or vulnerabilities are identified
  - Industry alerts
  - OCR guidance
  - Threat intelligence

• Whenever regulatory requirements change
  - HIPAA regulation changes
  - State law changes
  - OCR guidance updates

• Whenever the organization expands or contracts
  - New locations
  - New services
  - Organizational changes

• Whenever new business associates are added
  - New Business Associate relationships
  - Changes to existing relationships

• Whenever audit findings recommend changes
  - Internal audit findings
  - External audit findings
  - OCR audit findings

6.2 Update Process

When the SRA is updated:
• Changes are documented
• Version number is updated
• Change log is maintained
• Updated report is distributed
• Previous versions are retained

6.3 Continuous Improvement

The SRA process is continuously improved based on:
• Lessons learned from previous SRAs
• Industry best practices
• OCR guidance
• Audit findings
• Security incident lessons learned


═══════════════════════════════════════════════════════════════
7. RELATED POLICIES AND PROCEDURES
═══════════════════════════════════════════════════════════════

This SRA Policy is supported by:

• MST-001: HIPAA Security & Privacy Master Policy
• POL-003: Risk Management Plan Policy
• POL-004: Access Control Policy
• POL-007: Incident Response & Breach Notification Policy
• POL-009: Audit Logs & Documentation Retention Policy

═══════════════════════════════════════════════════════════════
END OF POLICY

This policy is effective as of {{Effective_Date}} and supersedes all previous versions.

Approved by:

{{Security_Officer_Name}}, {{Security_Officer_Role}}
Date: {{Effective_Date}}

{{CEO_Name}}, {{CEO_Title}}
Date: {{Effective_Date}}

═══════════════════════════════════════════════════════════════
`;
