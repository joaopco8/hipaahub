/**
 * HTML templates for the TipTap policy editor.
 * Each template contains {{PLACEHOLDER}} fields that are auto-filled
 * from the organization profile when the editor loads.
 *
 * Placeholder reference:
 * {{ORGANIZATION_NAME}}, {{ORGANIZATION_ADDRESS}},
 * {{PRIVACY_OFFICER_NAME}}, {{PRIVACY_OFFICER_EMAIL}}, {{PRIVACY_OFFICER_PHONE}},
 * {{SECURITY_OFFICER_NAME}}, {{SECURITY_OFFICER_EMAIL}},
 * {{EFFECTIVE_DATE}}, {{REVIEW_DATE}}
 */

export const POLICY_EDITOR_TEMPLATES: Record<number, string> = {
  1: `<h1>HIPAA Security &amp; Privacy Master Policy</h1>
<p><strong>Organization:</strong> {{ORGANIZATION_NAME}}<br><strong>Address:</strong> {{ORGANIZATION_ADDRESS}}<br><strong>Effective Date:</strong> {{EFFECTIVE_DATE}}<br><strong>Review Date:</strong> {{REVIEW_DATE}}<br><strong>Privacy Officer:</strong> {{PRIVACY_OFFICER_NAME}} — {{PRIVACY_OFFICER_EMAIL}}<br><strong>Security Officer:</strong> {{SECURITY_OFFICER_NAME}} — {{SECURITY_OFFICER_EMAIL}}</p>

<h2>1. Purpose</h2>
<p>This Master Policy establishes the framework through which {{ORGANIZATION_NAME}} complies with the Health Insurance Portability and Accountability Act of 1996 (HIPAA), the Health Information Technology for Economic and Clinical Health (HITECH) Act, and related regulations. This policy applies to all workforce members, contractors, and business associates who access, use, or disclose protected health information (PHI) on behalf of {{ORGANIZATION_NAME}}.</p>

<h2>2. Scope</h2>
<p>This policy applies to:</p>
<ul>
  <li>All workforce members of {{ORGANIZATION_NAME}}, including employees, volunteers, trainees, and contractors</li>
  <li>All PHI created, received, maintained, or transmitted by {{ORGANIZATION_NAME}}</li>
  <li>All information systems and media that contain PHI</li>
  <li>All physical locations where PHI is accessed or stored</li>
</ul>

<h2>3. Policy Statement</h2>
<h3>3.1 Patient Rights</h3>
<p>{{ORGANIZATION_NAME}} recognizes and upholds the following patient rights under the HIPAA Privacy Rule:</p>
<ul>
  <li>Right to access and obtain copies of their PHI (45 CFR §164.524)</li>
  <li>Right to request amendment of their PHI (45 CFR §164.526)</li>
  <li>Right to an accounting of disclosures (45 CFR §164.528)</li>
  <li>Right to request restrictions on uses and disclosures (45 CFR §164.522)</li>
  <li>Right to receive confidential communications (45 CFR §164.522(b))</li>
  <li>Right to receive a Notice of Privacy Practices (45 CFR §164.520)</li>
</ul>

<h3>3.2 Permitted Uses and Disclosures</h3>
<p>{{ORGANIZATION_NAME}} may use or disclose PHI without patient authorization for the following purposes:</p>
<ul>
  <li>Treatment: To provide, coordinate, or manage healthcare and related services</li>
  <li>Payment: To obtain reimbursement for healthcare services</li>
  <li>Healthcare Operations: For quality assessment, training, accreditation, and other operational activities</li>
  <li>Required by Law: When mandated by federal, state, or local law</li>
  <li>Public Health Activities: As permitted under 45 CFR §164.512(b)</li>
</ul>

<h3>3.3 Minimum Necessary Standard</h3>
<p>When using or disclosing PHI, {{ORGANIZATION_NAME}} shall make reasonable efforts to limit PHI to the minimum necessary to accomplish the intended purpose, consistent with 45 CFR §164.502(b). This standard does not apply to disclosures for treatment purposes.</p>

<h3>3.4 Authorization Requirements</h3>
<p>Uses and disclosures of PHI not permitted under the minimum necessary standard or for TPO purposes require a valid written authorization from the patient. Authorizations must include the elements required by 45 CFR §164.508.</p>

<h2>4. Procedures</h2>
<h3>4.1 Patient Access Requests</h3>
<p>Patients requesting access to their PHI must submit a written request to {{PRIVACY_OFFICER_NAME}} at {{PRIVACY_OFFICER_EMAIL}}. {{ORGANIZATION_NAME}} will respond within 30 days of receipt.</p>

<h3>4.2 Amendment Requests</h3>
<p>Patients may request amendment of their PHI. Requests must be submitted in writing. {{ORGANIZATION_NAME}} will act on the request within 60 days.</p>

<h3>4.3 Accounting of Disclosures</h3>
<p>{{ORGANIZATION_NAME}} maintains a log of all disclosures of PHI not made for TPO purposes. Patients may request an accounting of disclosures for the six years prior to the date of the request.</p>

<h2>5. Notice of Privacy Practices</h2>
<p>{{ORGANIZATION_NAME}} maintains a current Notice of Privacy Practices (NPP) that describes: how PHI may be used and disclosed; patient rights; and how to contact the Privacy Officer. The NPP is provided to patients at first service delivery and posted conspicuously at the point of service.</p>

<h2>6. Responsibilities</h2>
<p>The Privacy Officer, {{PRIVACY_OFFICER_NAME}}, is responsible for:</p>
<ul>
  <li>Developing and implementing privacy policies and procedures</li>
  <li>Conducting and overseeing workforce privacy training</li>
  <li>Receiving and resolving privacy complaints</li>
  <li>Investigating and responding to privacy violations</li>
  <li>Coordinating with the Security Officer on matters affecting ePHI</li>
</ul>

<h2>7. Training Requirements</h2>
<p>All workforce members must complete HIPAA privacy training within 30 days of hire and annually thereafter. Training records shall be maintained for a minimum of six years. Workforce members who do not complete training by the required date are subject to sanctions.</p>

<h2>8. Sanctions for Violations</h2>
<p>Workforce members who violate this policy are subject to sanctions up to and including termination of employment or contract. Sanctions shall be applied consistently and without regard to the violator's position. All sanctions shall be documented.</p>

<h2>9. Document Control</h2>
<p><strong>Effective Date:</strong> {{EFFECTIVE_DATE}}<br><strong>Review Date:</strong> {{REVIEW_DATE}}<br><strong>Policy Owner:</strong> {{PRIVACY_OFFICER_NAME}}, Privacy Officer<br><strong>Version:</strong> 1.0<br><strong>Classification:</strong> Confidential — Internal Use Only</p>`,

  2: `<h1>Security Risk Analysis (SRA) Policy</h1>
<p><strong>Organization:</strong> {{ORGANIZATION_NAME}}<br><strong>Effective Date:</strong> {{EFFECTIVE_DATE}}<br><strong>Review Date:</strong> {{REVIEW_DATE}}<br><strong>Security Officer:</strong> {{SECURITY_OFFICER_NAME}} — {{SECURITY_OFFICER_EMAIL}}</p>

<h2>1. Purpose and Scope</h2>
<p>This policy establishes the requirements for conducting, documenting, and maintaining a Security Risk Analysis (SRA) for {{ORGANIZATION_NAME}} in accordance with 45 CFR §164.308(a)(1). The SRA is the foundation of the HIPAA Security Rule compliance program and must be conducted before implementing security measures and reviewed periodically.</p>

<h2>2. Security Officer Designation</h2>
<p>{{SECURITY_OFFICER_NAME}} is designated as the Security Officer for {{ORGANIZATION_NAME}} pursuant to 45 CFR §164.308(a)(2). The Security Officer is responsible for the development, implementation, and maintenance of the security program, including the SRA process.</p>

<h2>3. Administrative Safeguards</h2>
<h3>3.1 Risk Analysis Requirement</h3>
<p>{{ORGANIZATION_NAME}} shall conduct a thorough assessment of the potential risks and vulnerabilities to the confidentiality, integrity, and availability of all ePHI it holds. The SRA must identify: all ePHI created, received, maintained, or transmitted; threats and vulnerabilities to that ePHI; current security measures; and the likelihood and impact of threat occurrence.</p>

<h3>3.2 Risk Management</h3>
<p>Following the SRA, {{ORGANIZATION_NAME}} shall implement security measures sufficient to reduce identified risks to a reasonable and appropriate level. Risk management decisions shall be documented with rationale.</p>

<h3>3.3 Sanction Policy</h3>
<p>{{ORGANIZATION_NAME}} maintains a Sanction Policy applicable to workforce members who fail to comply with security policies and procedures. Sanctions range from verbal warnings to termination and are applied consistently.</p>

<h3>3.4 Information System Activity Review</h3>
<p>{{ORGANIZATION_NAME}} implements procedures to regularly review records of information system activity, including audit logs, access reports, and security incident tracking. Reviews are conducted no less than quarterly.</p>

<h3>3.5 Workforce Training</h3>
<p>All workforce members receive security awareness training upon hire and annually. Training covers: password management; phishing and social engineering; physical security; incident reporting; and acceptable use of information systems.</p>

<h3>3.6 Access Management</h3>
<p>Access to ePHI is granted based on the minimum necessary principle. Access is reviewed when an employee's role changes and revoked immediately upon termination.</p>

<h2>4. Physical Safeguards</h2>
<h3>4.1 Facility Access</h3>
<p>{{ORGANIZATION_NAME}} implements policies and procedures to limit physical access to its electronic information systems and the facilities in which they are housed, while ensuring that properly authorized access is allowed.</p>

<h3>4.2 Workstation Use</h3>
<p>All workforce members must use workstations containing ePHI only for authorized purposes, in authorized locations, and with appropriate physical safeguards such as screen locks and privacy screens.</p>

<h3>4.3 Device and Media Controls</h3>
<p>{{ORGANIZATION_NAME}} implements policies governing the receipt, removal, backup, storage, re-use, and disposal of hardware and electronic media containing ePHI. All disposed devices are sanitized using NIST-approved methods.</p>

<h2>5. Technical Safeguards</h2>
<h3>5.1 Access Controls</h3>
<p>Unique user identifications are assigned to all users. Emergency access procedures are documented. Automatic logoff is configured on all workstations accessing ePHI. Encryption is used for ePHI stored on portable devices.</p>

<h3>5.2 Audit Controls</h3>
<p>Hardware, software, and procedural mechanisms that record and examine activity in information systems containing ePHI are implemented and reviewed regularly.</p>

<h3>5.3 Transmission Security</h3>
<p>ePHI transmitted over electronic communication networks is encrypted using TLS 1.2 or higher. Email containing ePHI must use secure/encrypted email solutions.</p>

<h2>6. SRA Review Schedule</h2>
<p>The SRA shall be reviewed and updated:</p>
<ul>
  <li>At least annually, or more frequently as warranted</li>
  <li>When operational changes affect ePHI security (new systems, new locations, new workforce roles)</li>
  <li>Following a security incident or breach</li>
  <li>When new threats are identified</li>
</ul>

<h2>7. Document Control</h2>
<p><strong>Effective Date:</strong> {{EFFECTIVE_DATE}}<br><strong>Review Date:</strong> {{REVIEW_DATE}}<br><strong>Policy Owner:</strong> {{SECURITY_OFFICER_NAME}}, Security Officer<br><strong>Version:</strong> 1.0</p>`,

  3: `<h1>Breach Notification Policy</h1>
<p><strong>Organization:</strong> {{ORGANIZATION_NAME}}<br><strong>Address:</strong> {{ORGANIZATION_ADDRESS}}<br><strong>Effective Date:</strong> {{EFFECTIVE_DATE}}<br><strong>Review Date:</strong> {{REVIEW_DATE}}<br><strong>Privacy Officer:</strong> {{PRIVACY_OFFICER_NAME}} — {{PRIVACY_OFFICER_EMAIL}} — {{PRIVACY_OFFICER_PHONE}}</p>

<h2>1. Purpose</h2>
<p>This policy establishes the requirements and procedures for {{ORGANIZATION_NAME}} to identify, assess, and respond to breaches of unsecured protected health information (PHI) in accordance with the HIPAA Breach Notification Rule (45 CFR §§164.400–414) and the HITECH Act.</p>

<h2>2. Definition of Breach</h2>
<p>A <strong>breach</strong> is defined as an impermissible use or disclosure of unsecured PHI that compromises the security or privacy of such information. A breach is presumed unless {{ORGANIZATION_NAME}} demonstrates that there is a low probability that PHI has been compromised based on a four-factor risk assessment.</p>
<p><strong>Exceptions that are not breaches:</strong></p>
<ul>
  <li>Unintentional acquisition, access, or use by a workforce member acting in good faith within scope of authority</li>
  <li>Inadvertent disclosure between persons authorized to access PHI at the same facility</li>
  <li>Disclosure where the recipient could not reasonably have retained the information</li>
</ul>

<h2>3. Breach Risk Assessment — Four-Factor Test</h2>
<p>To determine whether an impermissible use or disclosure constitutes a breach, {{ORGANIZATION_NAME}} shall assess the following four factors:</p>
<ol>
  <li><strong>Nature and Extent of PHI:</strong> Types of identifiers and the likelihood of re-identification, including sensitivity of the information (financial, mental health, substance abuse, etc.)</li>
  <li><strong>Unauthorized Person:</strong> Who used the PHI or to whom the disclosure was made, and whether the recipient had obligations to protect the PHI</li>
  <li><strong>Whether PHI Was Actually Acquired or Viewed:</strong> Whether the PHI was actually acquired or viewed or, conversely, if only the opportunity existed</li>
  <li><strong>Extent to Which Risk Has Been Mitigated:</strong> Whether {{ORGANIZATION_NAME}} has obtained satisfactory assurances that the information will not be further used or disclosed (e.g., confidentiality agreements, return/destruction of data)</li>
</ol>

<h2>4. Notification to Individuals</h2>
<h3>4.1 Timing</h3>
<p>{{ORGANIZATION_NAME}} shall notify affected individuals without unreasonable delay and in no case later than <strong>60 calendar days</strong> following discovery of a breach.</p>
<h3>4.2 Required Content</h3>
<p>Individual notifications must include:</p>
<ul>
  <li>Brief description of what happened, including date of breach and date of discovery</li>
  <li>Description of the types of PHI involved</li>
  <li>Steps individuals should take to protect themselves from potential harm</li>
  <li>Brief description of what {{ORGANIZATION_NAME}} is doing to investigate the breach, mitigate harm, and protect against future occurrences</li>
  <li>Contact information for {{PRIVACY_OFFICER_NAME}} at {{PRIVACY_OFFICER_EMAIL}} or {{PRIVACY_OFFICER_PHONE}}</li>
</ul>
<h3>4.3 Methods of Notification</h3>
<p>Notification is provided by first-class mail. If the individual has agreed to electronic notification, email may be used. If contact information is insufficient or out of date, substitute notice (web posting or major media) is provided.</p>

<h2>5. Notification to HHS/OCR</h2>
<p>{{ORGANIZATION_NAME}} shall notify the Department of Health and Human Services (HHS) Office for Civil Rights (OCR):</p>
<ul>
  <li><strong>500+ individuals:</strong> Simultaneously with individual notification and no later than 60 days after discovery, via the HHS Breach Reporting Portal</li>
  <li><strong>Fewer than 500 individuals:</strong> Within 60 days after the end of the calendar year in which the breach was discovered, via the HHS annual log</li>
</ul>

<h2>6. Notification to Media</h2>
<p>If a breach involves more than <strong>500 residents of a state or jurisdiction</strong>, {{ORGANIZATION_NAME}} shall provide notice to prominent media outlets serving that state or jurisdiction no later than 60 calendar days after discovery of the breach.</p>

<h2>7. Documentation Requirements</h2>
<p>{{ORGANIZATION_NAME}} shall document all breaches and breach risk assessments, including those that do not require notification, and retain documentation for at least <strong>six years</strong>. Documentation includes: discovery date; assessment results; notifications sent; and actions taken to mitigate harm.</p>

<h2>8. Responsibilities</h2>
<p>{{PRIVACY_OFFICER_NAME}} is responsible for: receiving breach reports; conducting or overseeing the four-factor assessment; ensuring timely notification to individuals, HHS, and media as required; and maintaining breach documentation.</p>

<h2>9. Document Control</h2>
<p><strong>Effective Date:</strong> {{EFFECTIVE_DATE}}<br><strong>Review Date:</strong> {{REVIEW_DATE}}<br><strong>Policy Owner:</strong> {{PRIVACY_OFFICER_NAME}}, Privacy Officer<br><strong>Version:</strong> 1.0</p>`,

  4: `<h1>Access Control Policy</h1>
<p><strong>Organization:</strong> {{ORGANIZATION_NAME}}<br><strong>Effective Date:</strong> {{EFFECTIVE_DATE}}<br><strong>Review Date:</strong> {{REVIEW_DATE}}<br><strong>Security Officer:</strong> {{SECURITY_OFFICER_NAME}} — {{SECURITY_OFFICER_EMAIL}}</p>

<h2>1. Purpose</h2>
<p>This policy establishes requirements for controlling access to electronic protected health information (ePHI) at {{ORGANIZATION_NAME}} in accordance with 45 CFR §164.312(a). The purpose is to ensure that only authorized workforce members have access to ePHI, that access is limited to the minimum necessary, and that all access is traceable.</p>

<h2>2. Unique User Identification</h2>
<p>Each workforce member of {{ORGANIZATION_NAME}} who accesses ePHI must be assigned a unique user identifier (username or user ID). Shared accounts are prohibited for systems containing ePHI. User IDs must not be reused after termination. All user activity is attributable to a single individual through their unique ID.</p>

<h2>3. Emergency Access Procedures</h2>
<p>{{ORGANIZATION_NAME}} maintains documented emergency access procedures that allow authorized workforce members to obtain necessary ePHI during a system emergency, disaster recovery, or contingency situation. Emergency access accounts are monitored, require dual approval, and are reviewed after each use. Emergency access is logged and audited.</p>

<h2>4. Automatic Logoff</h2>
<p>All workstations and applications that access ePHI must be configured to automatically terminate the session or engage a password-protected screen lock after a period of inactivity not to exceed <strong>15 minutes</strong>. Mobile devices must lock after no more than 5 minutes of inactivity.</p>

<h2>5. Encryption and Decryption</h2>
<p>ePHI stored on portable devices (laptops, tablets, mobile phones, USB drives) must be encrypted using AES-256 or equivalent. ePHI transmitted electronically must be encrypted using TLS 1.2 or higher. Encryption keys are managed in accordance with the Encryption Policy.</p>

<h2>6. Role-Based Access Definitions</h2>
<p>Access to ePHI is granted based on workforce role. Defined roles and their access levels include:</p>
<ul>
  <li><strong>Administrator:</strong> Full access to all systems; responsible for user provisioning and deprovisioning</li>
  <li><strong>Clinical Provider:</strong> Access to patient records relevant to their clinical scope</li>
  <li><strong>Clinical Support Staff:</strong> Access to scheduling, billing, and basic demographic data; no access to clinical notes unless required</li>
  <li><strong>Billing/Finance:</strong> Access to billing records and claims; no access to clinical notes</li>
  <li><strong>IT Support:</strong> Access to system infrastructure; ePHI access restricted to what is necessary for troubleshooting</li>
  <li><strong>Read-Only/Auditor:</strong> Read access only; no modification or export capabilities</li>
</ul>

<h2>7. Access Request and Approval Process</h2>
<p>Access to systems containing ePHI must be formally requested by the workforce member's supervisor using the Access Request Form. Requests must specify: the systems and data requiring access; the business justification; and the role to be assigned. {{SECURITY_OFFICER_NAME}} or designee reviews and approves all access requests prior to provisioning.</p>

<h2>8. Access Revocation — Termination Procedures</h2>
<p>Upon termination of a workforce member (voluntary or involuntary), all access to ePHI systems must be revoked immediately upon separation. The termination checklist requires:</p>
<ul>
  <li>Disable all system accounts and user IDs within <strong>24 hours</strong> of termination (immediately for involuntary terminations)</li>
  <li>Revoke physical access credentials (badges, keys)</li>
  <li>Collect all organization-owned devices</li>
  <li>Change shared passwords known to the terminated employee</li>
  <li>Forward business email and re-route communications as appropriate</li>
  <li>Document completion of all steps in the termination checklist</li>
</ul>

<h2>9. Password Requirements</h2>
<p>Passwords for systems containing ePHI must meet the following requirements:</p>
<ul>
  <li>Minimum length: 12 characters</li>
  <li>Complexity: Must include uppercase, lowercase, numbers, and special characters</li>
  <li>Maximum age: 90 days (or use of a password manager)</li>
  <li>History: Cannot reuse any of the last 12 passwords</li>
  <li>Multi-factor authentication (MFA) required for remote access and all administrative accounts</li>
  <li>Default passwords must be changed immediately upon first use</li>
</ul>

<h2>10. Document Control</h2>
<p><strong>Effective Date:</strong> {{EFFECTIVE_DATE}}<br><strong>Review Date:</strong> {{REVIEW_DATE}}<br><strong>Policy Owner:</strong> {{SECURITY_OFFICER_NAME}}, Security Officer<br><strong>Version:</strong> 1.0</p>`,

  5: `<h1>Audit &amp; Accountability Policy</h1>
<p><strong>Organization:</strong> {{ORGANIZATION_NAME}}<br><strong>Effective Date:</strong> {{EFFECTIVE_DATE}}<br><strong>Review Date:</strong> {{REVIEW_DATE}}<br><strong>Security Officer:</strong> {{SECURITY_OFFICER_NAME}} — {{SECURITY_OFFICER_EMAIL}}</p>

<h2>1. Purpose</h2>
<p>This policy establishes requirements for implementing and maintaining audit controls at {{ORGANIZATION_NAME}} in accordance with 45 CFR §164.312(b). The purpose is to ensure that all access to ePHI is logged, monitored, and reviewed so that unauthorized access or activity can be detected and investigated.</p>

<h2>2. Audit Controls</h2>
<h3>2.1 Systems Subject to Auditing</h3>
<p>The following systems are subject to audit logging at {{ORGANIZATION_NAME}}:</p>
<ul>
  <li>Electronic Health Record (EHR) systems</li>
  <li>Practice management systems</li>
  <li>Email systems when used to transmit PHI</li>
  <li>Network infrastructure (firewalls, VPN, routers)</li>
  <li>File servers and cloud storage containing ePHI</li>
  <li>Workstations and mobile devices accessing ePHI</li>
  <li>Administrative systems (billing, scheduling)</li>
</ul>
<h3>2.2 Audit Frequency</h3>
<p>Automated audit logging is continuous. Manual review of audit logs is conducted no less than <strong>monthly</strong> for high-risk systems (EHR, network perimeter) and <strong>quarterly</strong> for other systems.</p>

<h2>3. Audit Log Requirements</h2>
<p>Audit logs must capture the following information for each auditable event:</p>
<ul>
  <li>User identification (unique user ID)</li>
  <li>Date and time of the event</li>
  <li>Type of event (login, logout, access, create, modify, delete, export, print)</li>
  <li>Success or failure of the event</li>
  <li>Source (workstation ID, IP address)</li>
  <li>Patient or record identifier (where applicable)</li>
  <li>Application or system generating the event</li>
</ul>

<h2>4. Log Review Procedures</h2>
<p>{{SECURITY_OFFICER_NAME}} or a designated reviewer is responsible for reviewing audit logs. Reviews focus on:</p>
<ul>
  <li>Access by terminated or suspended employees</li>
  <li>Unusually high volumes of access by a single user</li>
  <li>Access during unusual hours (nights, weekends)</li>
  <li>Failed login attempts (brute force indicators)</li>
  <li>Access to records not related to the user's clinical role</li>
  <li>Large data exports or print jobs</li>
</ul>
<p>All anomalies identified during log review are escalated to the Security Officer and documented. Review findings are retained as part of the security management documentation.</p>

<h2>5. Audit Log Retention</h2>
<p>Audit logs shall be retained for a minimum of <strong>six (6) years</strong> from the date of creation, consistent with the HIPAA documentation retention requirement (45 CFR §164.530(j)). Audit logs must be stored in a manner that protects them from modification, deletion, or unauthorized access. Backup copies of audit logs are maintained off-site or in a separate system.</p>

<h2>6. Response to Audit Findings</h2>
<p>When audit review identifies a potential security incident or policy violation:</p>
<ol>
  <li>The reviewer documents the finding with supporting log evidence</li>
  <li>The finding is reported to {{SECURITY_OFFICER_NAME}} within <strong>24 hours</strong></li>
  <li>The Security Officer assesses whether the finding constitutes a security incident under the Incident Response Policy</li>
  <li>If an incident is confirmed, the Incident Response Policy procedures are followed</li>
  <li>If a workforce member is implicated, HR and legal counsel are notified as appropriate</li>
  <li>Corrective action is documented and tracked to completion</li>
</ol>

<h2>7. Document Control</h2>
<p><strong>Effective Date:</strong> {{EFFECTIVE_DATE}}<br><strong>Review Date:</strong> {{REVIEW_DATE}}<br><strong>Policy Owner:</strong> {{SECURITY_OFFICER_NAME}}, Security Officer<br><strong>Version:</strong> 1.0</p>`,

  6: `<h1>Encryption Policy</h1>
<p><strong>Organization:</strong> {{ORGANIZATION_NAME}}<br><strong>Effective Date:</strong> {{EFFECTIVE_DATE}}<br><strong>Review Date:</strong> {{REVIEW_DATE}}<br><strong>Security Officer:</strong> {{SECURITY_OFFICER_NAME}} — {{SECURITY_OFFICER_EMAIL}}</p>

<h2>1. Purpose</h2>
<p>This policy establishes encryption standards and requirements for {{ORGANIZATION_NAME}} to protect electronic protected health information (ePHI) from unauthorized access, consistent with HIPAA addressable specifications at 45 CFR §§164.312(a)(2)(iv) and 164.312(e)(2)(ii), and the NIST encryption guidance in HHS guidance on rendering PHI unusable.</p>

<h2>2. Encryption at Rest</h2>
<h3>2.1 Devices and Workstations</h3>
<p>All devices that store ePHI — including but not limited to laptops, desktop workstations, tablets, mobile phones, and external hard drives — must have full-disk encryption enabled using <strong>AES-256</strong> or equivalent strength. Encryption must be enabled before any ePHI is stored on the device.</p>
<h3>2.2 Servers and Storage</h3>
<p>All servers and storage systems (on-premises and cloud-based) that contain ePHI must encrypt data at rest using AES-256. Database-level encryption is required for databases containing ePHI.</p>
<h3>2.3 Backups</h3>
<p>All backup media (tapes, disks, cloud backups) containing ePHI must be encrypted using AES-256 before backup and remain encrypted throughout the backup lifecycle. Backup encryption keys are stored separately from backup data.</p>

<h2>3. Encryption in Transit</h2>
<h3>3.1 Email</h3>
<p>ePHI transmitted via email must use end-to-end encryption or be sent through a HIPAA-compliant secure messaging platform. Standard unencrypted email (Gmail, Outlook without encryption) must not be used to transmit ePHI.</p>
<h3>3.2 File Transfer</h3>
<p>File transfers containing ePHI must use SFTP, FTPS, HTTPS, or an equivalent encrypted protocol. Unencrypted FTP and HTTP are prohibited for ePHI transfers.</p>
<h3>3.3 APIs and Web Services</h3>
<p>All APIs and web services that transmit ePHI must use HTTPS with TLS 1.2 or higher. TLS 1.0 and 1.1 are deprecated and must not be used. Certificates must be issued by a trusted Certificate Authority and regularly renewed.</p>

<h2>4. Key Management</h2>
<p>Encryption key management at {{ORGANIZATION_NAME}} requires:</p>
<ul>
  <li>Keys are generated using approved random number generators</li>
  <li>Keys are stored separately from the data they encrypt</li>
  <li>Key access is limited to authorized personnel only, using the principle of least privilege</li>
  <li>Key rotation schedule: annually for data-at-rest keys; immediately upon suspected compromise</li>
  <li>A documented key recovery procedure is maintained and tested annually</li>
  <li>Retired keys are securely destroyed using approved methods</li>
</ul>

<h2>5. Approved Encryption Standards</h2>
<ul>
  <li><strong>Symmetric Encryption:</strong> AES-256 (required); AES-128 (minimum acceptable)</li>
  <li><strong>Asymmetric Encryption:</strong> RSA 2048-bit minimum; RSA 4096-bit preferred</li>
  <li><strong>Transport Encryption:</strong> TLS 1.2 minimum; TLS 1.3 preferred</li>
  <li><strong>Hashing:</strong> SHA-256 minimum; SHA-3 preferred for new implementations</li>
  <li><strong>Prohibited:</strong> DES, 3DES, RC4, MD5, SHA-1, SSL 2.0/3.0, TLS 1.0/1.1</li>
</ul>

<h2>6. Exceptions Process</h2>
<p>Exceptions to this policy require written approval from {{SECURITY_OFFICER_NAME}}. Exception requests must document: the system and data involved; the reason encryption is not technically feasible; compensating controls that will be implemented; and a timeline for achieving compliance. Exceptions are reviewed quarterly and renewed annually at maximum.</p>

<h2>7. Mobile Device Encryption</h2>
<p>All mobile devices (smartphones, tablets) used to access ePHI must have:</p>
<ul>
  <li>Device encryption enabled (standard on iOS; must be verified on Android)</li>
  <li>PIN or biometric lock with a minimum 6-digit PIN</li>
  <li>Remote wipe capability enabled and tested</li>
  <li>Enrollment in a mobile device management (MDM) solution if used to access ePHI</li>
  <li>Automatic lock after 5 minutes of inactivity</li>
</ul>

<h2>8. Document Control</h2>
<p><strong>Effective Date:</strong> {{EFFECTIVE_DATE}}<br><strong>Review Date:</strong> {{REVIEW_DATE}}<br><strong>Policy Owner:</strong> {{SECURITY_OFFICER_NAME}}, Security Officer<br><strong>Version:</strong> 1.0</p>`,

  7: `<h1>Incident Response Policy</h1>
<p><strong>Organization:</strong> {{ORGANIZATION_NAME}}<br><strong>Address:</strong> {{ORGANIZATION_ADDRESS}}<br><strong>Effective Date:</strong> {{EFFECTIVE_DATE}}<br><strong>Review Date:</strong> {{REVIEW_DATE}}<br><strong>Security Officer:</strong> {{SECURITY_OFFICER_NAME}} — {{SECURITY_OFFICER_EMAIL}}</p>

<h2>1. Purpose</h2>
<p>This policy establishes the procedures for {{ORGANIZATION_NAME}} to identify, respond to, contain, and recover from security incidents involving ePHI, in accordance with 45 CFR §164.308(a)(6). The policy also defines the relationship between security incident response and the Breach Notification Policy.</p>

<h2>2. Definition of Security Incident</h2>
<p>A <strong>security incident</strong> means the attempted or successful unauthorized access, use, disclosure, modification, or destruction of information or interference with system operations in an information system. Examples include:</p>
<ul>
  <li>Unauthorized access to ePHI systems or records</li>
  <li>Malware infection on systems containing ePHI</li>
  <li>Ransomware attack</li>
  <li>Phishing attack resulting in credential compromise</li>
  <li>Physical theft or loss of a device containing ePHI</li>
  <li>Accidental disclosure of ePHI to unauthorized recipients</li>
  <li>Denial of service attack on critical healthcare systems</li>
</ul>

<h2>3. Incident Response Team</h2>
<p>The Incident Response Team (IRT) for {{ORGANIZATION_NAME}} consists of:</p>
<ul>
  <li><strong>Security Officer (Lead):</strong> {{SECURITY_OFFICER_NAME}} — {{SECURITY_OFFICER_EMAIL}}</li>
  <li><strong>Privacy Officer:</strong> {{PRIVACY_OFFICER_NAME}} — {{PRIVACY_OFFICER_EMAIL}}</li>
  <li>IT Representative (systems, forensics)</li>
  <li>Legal Counsel (as needed for significant incidents)</li>
  <li>Senior Leadership (as needed for significant incidents)</li>
</ul>

<h2>4. Incident Identification and Reporting</h2>
<p>All workforce members are required to report suspected security incidents immediately to {{SECURITY_OFFICER_NAME}} at {{SECURITY_OFFICER_EMAIL}}. Reports can also be submitted via the incident reporting mechanism (internal help desk ticket, phone, or in-person). Workforce members shall not attempt to investigate or remediate incidents independently.</p>

<h2>5. Response Procedures</h2>
<h3>5.1 Contain</h3>
<p>Upon receiving an incident report, the Security Officer shall immediately assess and implement containment measures, which may include: isolating affected systems from the network; disabling compromised accounts; blocking malicious IP addresses; and preserving evidence (log files, affected systems).</p>
<h3>5.2 Assess</h3>
<p>The IRT assesses the incident to determine: scope and severity; systems and PHI affected; root cause; and whether the incident constitutes a breach of unsecured PHI under the Breach Notification Policy four-factor test.</p>
<h3>5.3 Notify</h3>
<p>If the assessment indicates a probable breach, the Breach Notification Policy procedures are activated immediately. Leadership and legal counsel are notified for high-severity incidents. Workforce members are notified on a need-to-know basis.</p>
<h3>5.4 Recover</h3>
<p>Recovery activities include: restoring systems from clean backups; patching vulnerabilities; implementing additional controls to prevent recurrence; verifying system integrity before returning to production; and confirming ePHI availability and integrity.</p>

<h2>6. Post-Incident Review</h2>
<p>Within <strong>30 days</strong> of incident resolution, the IRT conducts a post-incident review that documents: timeline of events; root cause analysis; effectiveness of the response; corrective actions implemented; and lessons learned. The review findings are presented to senior leadership and used to update policies and training.</p>

<h2>7. Documentation Requirements</h2>
<p>All security incidents must be documented, including incidents where no breach is determined. Documentation is retained for at least <strong>six years</strong> and includes: incident description and discovery date; assessment results; containment and recovery actions; notification decisions; and post-incident review findings.</p>

<h2>8. Relationship to Breach Notification Policy</h2>
<p>Every breach of unsecured PHI is a security incident. Not every security incident is a breach. When an incident is determined to involve a probable breach of unsecured PHI, the Breach Notification Policy governs the notification obligations to individuals, HHS, and media. Both policies are activated simultaneously for incidents involving ePHI.</p>

<h2>9. Document Control</h2>
<p><strong>Effective Date:</strong> {{EFFECTIVE_DATE}}<br><strong>Review Date:</strong> {{REVIEW_DATE}}<br><strong>Policy Owner:</strong> {{SECURITY_OFFICER_NAME}}, Security Officer<br><strong>Version:</strong> 1.0</p>`,

  8: `<h1>Business Associate Agreement Template</h1>
<p><strong>Covered Entity:</strong> {{ORGANIZATION_NAME}}<br><strong>Address:</strong> {{ORGANIZATION_ADDRESS}}<br><strong>Privacy Officer:</strong> {{PRIVACY_OFFICER_NAME}} — {{PRIVACY_OFFICER_EMAIL}}<br><strong>Effective Date:</strong> {{EFFECTIVE_DATE}}</p>

<p><em>This Business Associate Agreement ("BAA") is entered into between {{ORGANIZATION_NAME}} ("Covered Entity") and [BUSINESS_ASSOCIATE_NAME] ("Business Associate"), effective [AGREEMENT_DATE].</em></p>

<h2>1. Definitions</h2>
<p>Terms used but not otherwise defined in this BAA shall have the meanings given to them in HIPAA and the HIPAA Rules.</p>
<ul>
  <li><strong>"HIPAA"</strong> means the Health Insurance Portability and Accountability Act of 1996.</li>
  <li><strong>"HIPAA Rules"</strong> means the Privacy, Security, Breach Notification, and Enforcement Rules at 45 CFR Parts 160 and 164.</li>
  <li><strong>"PHI"</strong> means Protected Health Information as defined at 45 CFR §160.103.</li>
  <li><strong>"Business Associate"</strong> has the meaning given at 45 CFR §160.103.</li>
  <li><strong>"Covered Entity"</strong> has the meaning given at 45 CFR §160.103.</li>
</ul>

<h2>2. Obligations of Business Associate</h2>
<p>Business Associate agrees to:</p>
<ul>
  <li>Not use or disclose PHI other than as permitted by this BAA or required by law</li>
  <li>Use appropriate safeguards to prevent use or disclosure of PHI other than as provided in this BAA</li>
  <li>Comply with the HIPAA Security Rule with respect to electronic PHI</li>
  <li>Report to Covered Entity any use or disclosure of PHI not permitted by this BAA of which Business Associate becomes aware, including breaches of unsecured PHI as required by 45 CFR §164.410</li>
  <li>Ensure that any subcontractors that create, receive, maintain, or transmit PHI on behalf of Business Associate agree to the same restrictions and conditions that apply to Business Associate</li>
</ul>

<h2>3. Permitted Uses and Disclosures</h2>
<p>Business Associate may use or disclose PHI:</p>
<ul>
  <li>As necessary to perform the services set forth in the underlying service agreement</li>
  <li>For the proper management and administration of Business Associate's own business</li>
  <li>To carry out the legal responsibilities of Business Associate</li>
  <li>As required by law</li>
</ul>

<h2>4. Prohibited Uses</h2>
<p>Business Associate shall not:</p>
<ul>
  <li>Use or disclose PHI in any way that violates the HIPAA Rules</li>
  <li>Use or disclose PHI for Business Associate's own marketing purposes or sell PHI</li>
  <li>Disclose PHI to a subcontractor without first obtaining satisfactory assurances through a written agreement that the subcontractor will appropriately safeguard the PHI</li>
</ul>

<h2>5. Reporting Requirements</h2>
<p>Business Associate shall:</p>
<ul>
  <li>Report any breach of unsecured PHI to Covered Entity without unreasonable delay and no later than <strong>10 business days</strong> after discovery</li>
  <li>Report any successful Security Incident (as defined in 45 CFR §164.304) of which it becomes aware, within <strong>30 days</strong> of discovery</li>
  <li>Reports must include: the identification of each individual affected; date of breach and discovery; description of PHI types involved; steps the individual should take; and Business Associate's contact information</li>
</ul>

<h2>6. Subcontractors</h2>
<p>Business Associate shall ensure that any subcontractors that create, receive, maintain, or transmit PHI on behalf of Business Associate agree to the same restrictions and conditions that apply through this BAA to Business Associate with respect to such PHI, through a written agreement.</p>

<h2>7. Access to PHI by Covered Entity</h2>
<p>Business Associate agrees to provide access to PHI in a designated record set, upon Covered Entity's request, to the Covered Entity or, as directed, to an individual in order to meet the requirements of 45 CFR §164.524.</p>

<h2>8. Amendments to Comply with Law Changes</h2>
<p>The parties agree to take such action as is necessary to amend this BAA from time to time as is necessary for Covered Entity to comply with the requirements of HIPAA and the HIPAA Rules. Either party may request amendments by providing 30 days written notice.</p>

<h2>9. Term and Termination</h2>
<p><strong>Term:</strong> This BAA is effective as of the date first set forth above and shall remain in effect until all PHI is returned or destroyed, or as long as Business Associate retains PHI.<br><strong>Termination for Cause:</strong> Covered Entity may terminate this BAA upon 30 days written notice if Business Associate materially breaches this BAA and fails to cure within the notice period.<br><strong>Obligations Upon Termination:</strong> Business Associate shall, at the direction of Covered Entity, return or destroy all PHI upon termination. Where return or destruction is not feasible, Business Associate shall continue to protect the PHI and limit further uses and disclosures.</p>

<h2>10. Miscellaneous</h2>
<p><strong>Governing Law:</strong> This BAA shall be governed by the laws of the state where the Covered Entity is located.<br><strong>Entire Agreement:</strong> This BAA is incorporated into and made part of the service agreement between the parties. In the event of a conflict, this BAA shall control with respect to HIPAA compliance.<br><strong>Survival:</strong> The obligations of Business Associate under this BAA shall survive the termination of this BAA.</p>

<h2>11. Signature Blocks</h2>
<p><strong>COVERED ENTITY:</strong> {{ORGANIZATION_NAME}}</p>
<p>Signature: ___________________________<br>Name: {{PRIVACY_OFFICER_NAME}}<br>Title: Privacy Officer<br>Date: ___________________________</p>
<p><strong>BUSINESS ASSOCIATE:</strong> [BUSINESS_ASSOCIATE_NAME]</p>
<p>Signature: ___________________________<br>Name: ___________________________<br>Title: ___________________________<br>Date: ___________________________</p>`,

  9: `<h1>Workforce Security Policy</h1>
<p><strong>Organization:</strong> {{ORGANIZATION_NAME}}<br><strong>Effective Date:</strong> {{EFFECTIVE_DATE}}<br><strong>Review Date:</strong> {{REVIEW_DATE}}<br><strong>Privacy Officer:</strong> {{PRIVACY_OFFICER_NAME}} — {{PRIVACY_OFFICER_EMAIL}}<br><strong>Security Officer:</strong> {{SECURITY_OFFICER_NAME}} — {{SECURITY_OFFICER_EMAIL}}</p>

<h2>1. Purpose</h2>
<p>This policy establishes requirements for workforce security at {{ORGANIZATION_NAME}} in accordance with 45 CFR §164.308(a)(3). The policy ensures that all workforce members who access PHI are appropriately screened, trained, and authorized, and that access is properly managed throughout the workforce member lifecycle from hiring through termination.</p>

<h2>2. Pre-Employment Screening Requirements</h2>
<p>Before granting any workforce member access to PHI, {{ORGANIZATION_NAME}} requires:</p>
<ul>
  <li><strong>Background Check:</strong> Criminal background check for all employees and contractors with direct access to PHI</li>
  <li><strong>Identity Verification:</strong> Government-issued photo ID verification</li>
  <li><strong>Professional License Verification:</strong> For clinical staff, verification of current licensure in good standing</li>
  <li><strong>Reference Check:</strong> Minimum two professional references</li>
  <li><strong>Confidentiality Agreement:</strong> Signed before access is granted</li>
  <li><strong>HIPAA Training Completion:</strong> Initial HIPAA training completed before accessing PHI</li>
</ul>

<h2>3. Access Authorization and Establishment</h2>
<p>Access to PHI systems is granted only after:</p>
<ol>
  <li>Pre-employment screening is complete and satisfactory</li>
  <li>Supervisor submits an Access Request specifying systems needed and business justification</li>
  <li>{{SECURITY_OFFICER_NAME}} or designee reviews and approves the request</li>
  <li>Unique user accounts are created with access limited to the approved scope</li>
  <li>The workforce member receives account credentials securely</li>
  <li>The workforce member acknowledges the Access Control Policy and Acceptable Use Policy in writing</li>
</ol>

<h2>4. Workforce Clearance Procedures</h2>
<p>Prior to gaining access to PHI, all workforce members must:</p>
<ul>
  <li>Complete the initial HIPAA privacy and security training program</li>
  <li>Sign the Workforce Confidentiality Agreement</li>
  <li>Acknowledge receipt of the Acceptable Use Policy</li>
  <li>Pass any required professional competency assessments</li>
  <li>Successfully complete the background screening requirements</li>
</ul>
<p>A clearance record is maintained for each workforce member and is reviewed annually or when the workforce member's role changes significantly.</p>

<h2>5. Termination Procedures — Access Revocation Checklist</h2>
<p>Upon termination (voluntary or involuntary), the following checklist must be completed:</p>
<ul>
  <li>Disable all system accounts within <strong>24 hours</strong> (immediately for involuntary terminations)</li>
  <li>Revoke physical access (key cards, building access codes)</li>
  <li>Collect all organization-owned equipment (laptop, mobile device, badge, keys)</li>
  <li>Remove personal access to shared accounts and change shared passwords</li>
  <li>Revoke remote access (VPN, remote desktop)</li>
  <li>Notify relevant vendors and third parties of the termination (as applicable)</li>
  <li>Forward business communications appropriately</li>
  <li>Conduct exit interview to reinforce confidentiality obligations</li>
  <li>Obtain signed acknowledgment of ongoing confidentiality obligations</li>
  <li>Document completion of all checklist items and retain for six years</li>
</ul>

<h2>6. Employee Responsibilities</h2>
<p>Each workforce member of {{ORGANIZATION_NAME}} is responsible for:</p>
<ul>
  <li>Protecting PHI from unauthorized access, use, or disclosure</li>
  <li>Using only assigned credentials to access PHI systems (no sharing of passwords)</li>
  <li>Reporting suspected security incidents or privacy violations immediately</li>
  <li>Completing all required HIPAA training on schedule</li>
  <li>Following the Acceptable Use Policy for all organization systems</li>
  <li>Reporting changes in role or access needs to their supervisor</li>
  <li>Locking workstations when leaving unattended</li>
</ul>

<h2>7. Sanctions for Violations</h2>
<p>Workforce members who violate HIPAA policies, including this Workforce Security Policy, are subject to the Sanction Policy. Sanctions are applied progressively based on the severity of the violation, the workforce member's prior history, and whether the violation was intentional. Sanctions range from verbal warning to immediate termination and may include reporting to licensing boards or law enforcement where required.</p>

<h2>8. Training Requirements</h2>
<p>All workforce members are required to complete:</p>
<ul>
  <li><strong>Initial Training:</strong> HIPAA Privacy and Security training before accessing PHI</li>
  <li><strong>Annual Refresher:</strong> Annual HIPAA training covering updates, changes, and reinforcement of core concepts</li>
  <li><strong>Role-Specific Training:</strong> Additional training for workforce members with specialized PHI access (e.g., IT staff, billing, clinical providers)</li>
  <li><strong>Incident-Triggered Training:</strong> Retraining following a security incident or policy violation</li>
</ul>
<p>Training records are maintained for a minimum of six years. {{PRIVACY_OFFICER_NAME}} is responsible for ensuring all workforce members complete required training.</p>

<h2>9. Document Control</h2>
<p><strong>Effective Date:</strong> {{EFFECTIVE_DATE}}<br><strong>Review Date:</strong> {{REVIEW_DATE}}<br><strong>Policy Owner:</strong> {{PRIVACY_OFFICER_NAME}}, Privacy Officer<br><strong>Version:</strong> 1.0</p>`,
};

export const POLICY_NAMES: Record<number, string> = {
  1: 'HIPAA Security & Privacy Master Policy',
  2: 'Security Risk Analysis (SRA) Policy',
  3: 'Breach Notification Policy',
  4: 'Access Control Policy',
  5: 'Audit & Accountability Policy',
  6: 'Encryption Policy',
  7: 'Incident Response Policy',
  8: 'Business Associate Agreement',
  9: 'Workforce Security Policy',
};

/**
 * Given org profile data, fill placeholders in an HTML template.
 * Returns { html, unfilledPlaceholders } where html is ready for TipTap.
 */
export function fillPolicyTemplate(
  templateHtml: string,
  orgData: {
    name?: string | null;
    legal_name?: string | null;
    address_street?: string | null;
    address_city?: string | null;
    address_state?: string | null;
    address_zip?: string | null;
    privacy_officer_name?: string | null;
    privacy_officer_email?: string | null;
    compliance_contact_phone?: string | null;
    security_officer_name?: string | null;
    security_officer_email?: string | null;
  }
): { html: string; unfilledPlaceholders: string[] } {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const reviewDate = new Date(
    Date.now() + 365 * 24 * 60 * 60 * 1000
  ).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const addressParts = [
    orgData.address_street,
    orgData.address_city,
    orgData.address_state,
    orgData.address_zip,
  ].filter(Boolean);
  const address = addressParts.join(', ');

  const fillMap: Record<string, string> = {
    ORGANIZATION_NAME: orgData.name || '',
    ORGANIZATION_LEGAL_NAME: orgData.legal_name || orgData.name || '',
    ORGANIZATION_ADDRESS: address,
    PRIVACY_OFFICER_NAME: orgData.privacy_officer_name || '',
    PRIVACY_OFFICER_EMAIL: orgData.privacy_officer_email || '',
    PRIVACY_OFFICER_PHONE: orgData.compliance_contact_phone || '',
    SECURITY_OFFICER_NAME: orgData.security_officer_name || '',
    SECURITY_OFFICER_EMAIL: orgData.security_officer_email || '',
    EFFECTIVE_DATE: today,
    REVIEW_DATE: reviewDate,
  };

  const unfilledPlaceholders: string[] = [];
  let html = templateHtml;

  // Replace filled placeholders
  for (const [key, value] of Object.entries(fillMap)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    if (value) {
      html = html.replace(regex, value);
    }
  }

  // Find and highlight remaining unfilled {{PLACEHOLDER}} patterns
  const remainingRegex = /\{\{([A-Z_]+)\}\}/g;
  let match;
  while ((match = remainingRegex.exec(html)) !== null) {
    if (!unfilledPlaceholders.includes(match[1])) {
      unfilledPlaceholders.push(match[1]);
    }
  }

  // Wrap unfilled placeholders in a highlight span
  html = html.replace(
    /\{\{([A-Z_]+)\}\}/g,
    '<mark data-placeholder="$1" style="background:#fef3c7;color:#92400e;border-radius:3px;padding:1px 4px;cursor:pointer;" title="Click to fill — update your Organization Profile to auto-fill">{{$1}}</mark>'
  );

  return { html, unfilledPlaceholders };
}
