/**
 * Incident Response & Breach Notification Policy Template
 * Policy ID: POL-007
 * Pages: 5-7
 */

export const INCIDENT_RESPONSE_BREACH_NOTIFICATION_POLICY_TEMPLATE = `
POLICY 7: INCIDENT RESPONSE & BREACH NOTIFICATION POLICY

Pages: 5-7

Document Control

Field
Value
Policy ID
{{Policy_ID}}
Title
Incident Response & Breach Notification Policy
Effective Date
{{Effective_Date}}
Last Reviewed
{{Assessment_Date}}
Next Review Date
{{Next_Review_Date}}
Policy Owner
{{Security_Officer_Name}}, {{Security_Officer_Role}}
Legal Basis
45 CFR §164.308(a)(6), 45 CFR §164.400 et seq., HITECH Act
Document Classification
Confidential - Internal Use Only


1. Purpose and Legal Requirements

The purpose of this Incident Response & Breach Notification Policy is to establish procedures for {{Organization_Legal_Name}} to detect, respond to, and report security incidents and breaches of unsecured PHI. This policy ensures that the organization can respond quickly to minimize harm to patients and comply with regulatory notification requirements.

1.1 HIPAA Security Rule

45 CFR §164.308(a)(6) requires covered entities to establish and implement procedures to address security incidents, including identification and analysis of incidents, implementation of corrective actions, and documentation of incidents and corrective actions.

1.2 HIPAA Breach Notification Rule

45 CFR §164.400 et seq. requires covered entities to notify affected individuals, the media, and the HHS Secretary of any breach of unsecured PHI.

1.3 HITECH Act

The HITECH Act expands breach notification requirements and increases penalties for violations.

{{INCIDENT_PROCEDURES}}

{{BREACH_NOTIFICATION_STATUS}}

{{INCIDENT_DEFENSIBILITY}}

2. Definitions

2.1 Security Incident

A security incident is any unauthorized access, use, disclosure, modification, or destruction of ePHI or any event that compromises the confidentiality, integrity, or availability of ePHI.

2.2 Breach

A breach is an unauthorized access, acquisition, use, or disclosure of PHI that compromises the security or privacy of the information. A breach is presumed to have occurred unless the organization can demonstrate that there is a low probability that the PHI has been compromised.

3. Incident Response Procedures

3.1 Incident Detection and Reporting

Any workforce member who suspects a security incident must report it immediately to the Security Officer or Privacy Officer. Reports can be made:

• In person

• By phone

• By email

• Through an anonymous hotline

3.2 Incident Investigation

Upon receipt of a report, the Security Officer initiates an investigation to:

• Determine the nature and scope of the incident

• Identify the systems or data affected

• Determine the number of individuals affected

• Assess the potential harm to affected individuals

• Identify the cause of the incident

• Determine whether the incident constitutes a breach

3.3 Incident Containment

Immediate actions are taken to contain the incident and prevent further unauthorized access or disclosure:

• Isolate affected systems

• Revoke compromised credentials

• Block unauthorized users

• Preserve evidence for forensic analysis

• Notify affected systems and stakeholders

3.4 Incident Remediation

Actions are taken to remediate the incident and prevent recurrence:

• Patch vulnerabilities

• Implement additional security controls

• Update policies and procedures

• Provide additional training

• Conduct follow-up audits

4. Breach Notification Procedures

4.1 Breach Determination

If the investigation determines that a breach has occurred, the organization must notify affected individuals, the media, and the HHS Secretary.

4.2 Notification Timeline

Notifications must be provided without unreasonable delay and in no case later than 60 calendar days after discovery of the breach.

4.3 Individual Notification

Each affected individual must be notified by:

• First-class mail to the individual's last known address

• Email (if the individual has agreed to electronic notification)

• Telephone (if the individual cannot be reached by mail or email)

The notification must include:

• Description of the breach

• Types of information involved

• Steps the individual should take to protect themselves

• What the organization is doing to investigate the breach

• Contact information for the organization's Privacy Officer

4.4 Media Notification

If the breach affects more than 500 residents of a state or jurisdiction, the organization must notify prominent media outlets in that state or jurisdiction.

4.5 HHS Notification

The organization must notify the HHS Secretary of any breach affecting 500 or more individuals. For breaches affecting fewer than 500 individuals, the organization must maintain a log of breaches and submit it to the HHS Secretary annually.

5. Breach Investigation and Documentation

5.1 Investigation

The organization conducts a thorough investigation of the breach to determine:

• How the breach occurred

• What information was compromised

• Who had access to the compromised information

• Whether the information was actually accessed or viewed

• What steps can be taken to prevent recurrence

5.2 Documentation

The breach investigation is documented in a comprehensive report that includes:

• Description of the breach

• Date and time of discovery

• Number of individuals affected

• Types of information compromised

• Cause of the breach

• Investigation findings

• Corrective actions taken

• Notification timeline and method
`;
