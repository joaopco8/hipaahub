/**
 * HIPAA Breach Notification Letters Templates
 * Compliant with 45 CFR 164.400-414, HITECH Act
 * Production-ready templates for automated generation
 */

import { OrganizationData } from '../document-generator';

export interface BreachDetails {
  discoveryDate: string;
  incidentDate: string;
  description: string;
  detailedNarrative: string;
  discoveryMethod: string;
  typesOfInfo: string;
  stepsTaken: string;
  stepsForPatient: string;
  numberOfIndividuals: number;
  stateOrJurisdiction?: string;
  
  // Security & Breach Classification (45 CFR §164.402)
  encryptionAtRest?: 'Yes' | 'No' | 'Unknown';
  encryptionInTransit?: 'Yes' | 'No' | 'Unknown';
  mfaEnabled?: 'Yes' | 'No' | 'Unknown';
  incidentType?: 'Hacking / Malware' | 'Lost Device' | 'Stolen Device' | 'Unauthorized Employee Access' | 'Phishing' | 'Ransomware' | 'Misconfiguration' | 'Business Associate Breach';
  
  // Business Associate
  businessAssociateInvolved?: boolean;
  businessAssociateName?: string;
  
  // Governance & Legal Chain of Custody
  discoveredByName?: string;
  discoveredByRole?: string;
  investigationLeadName?: string;
  investigationLeadRole?: string;
  authorizedBy?: 'Privacy Officer' | 'Security Officer' | 'CEO';
  
  // Law Enforcement
  lawEnforcementNotified?: boolean;
  lawEnforcementDelay?: boolean;
  
  // Jurisdiction (multi-select US states)
  statesAffected?: string[]; // Array of state codes (e.g., ['CA', 'NY', 'TX'])
  
  // PHI Categories
  phiNameIncluded: boolean;
  phiSsnIncluded: boolean;
  phiDobIncluded: boolean;
  phiMrnIncluded: boolean;
  phiInsuranceIncluded: boolean;
  phiDiagnosisIncluded: boolean;
  phiMedicationIncluded: boolean;
  phiLabImagingIncluded: boolean;
  phiBillingIncluded: boolean;
  phiProviderIncluded: boolean;
  phiClaimsIncluded: boolean;
  phiOtherIncluded: boolean;
  phiOtherDescription?: string;
  
  // System Information
  systemName: string;
  systemType: string;
  dataLocation: string;
  encryptionStatus: string;
  authenticationControls: string;
  technicalDetails: string;
  
  // Response Actions
  containmentActions: string;
  forensicInvestigator: string;
  lawEnforcementNotificationStatus: string;
  haveNotifiedOrWillNotify: string;
  securityEnhancements: string;
  
  // Credit Monitoring (optional)
  creditMonitoringOffered: boolean;
  creditMonitoringDuration?: number;
  creditMonitoringProvider?: string;
  creditMonitoringEnrollmentUrl?: string;
  creditMonitoringPhoneNumber?: string;
  enrollmentCode?: string;
  identityTheftInsuranceAmount?: string;
  enrollmentDeadlineDays?: number;
  
  // Additional Information
  additionalScopeInformation?: string;
  investigationFindings?: string;
  rootCauseAnalysis?: string;
  correctiveActionsSummary?: string;
  breachId?: string;
  
  // Legal Classification (computed)
  breachLegalStatus?: 'Not Reportable' | 'Reportable' | 'Under Investigation';
}

/**
 * Generate Patient Notification Letter (45 CFR §164.404)
 * Production-ready template compliant with OCR requirements
 */
export function generatePatientNotificationLetter(
  organization: OrganizationData,
  breachDetails: BreachDetails,
  recipientData?: {
    firstName?: string;
    lastName?: string;
    streetAddress?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    recipientId?: string;
  }
): string {
  const privacyOfficerName = organization.privacy_officer_name || 'Privacy Officer';
  const privacyOfficerEmail = organization.privacy_officer_email || organization.email_address || 'privacy@organization.com';
  const privacyOfficerPhone = organization.phone_number || 'Not Provided';
  const privacyOfficerRole = organization.privacy_officer_role || 'Privacy Officer';
  const securityOfficerName = organization.security_officer_name || 'Security Officer';
  const securityOfficerEmail = organization.security_officer_email || 'security@organization.com';
  const securityOfficerPhone = organization.phone_number || 'Not Provided';
  const securityOfficerRole = organization.security_officer_role || 'Security Officer';
  const ceoName = organization.ceo_name || organization.authorized_representative_name || 'Chief Executive Officer';
  const ceoTitle = organization.ceo_title || organization.authorized_representative_title || 'Chief Executive Officer';
  const orgName = organization.legal_name || organization.name || 'Organization';
  const orgDba = organization.dba || '';
  const address = formatFullAddress(organization);
  const ein = organization.ein || 'Not Provided';
  const npi = organization.npi || 'Not Provided';
  const stateLicense = organization.state_license_number || 'Not Provided';
  const phone = organization.phone_number || 'Not Provided';
  const email = organization.email_address || organization.security_officer_email || 'Not Provided';
  const website = organization.website || 'Not Provided';

  // Recipient information (use defaults if not provided)
  const recipientFirstName = recipientData?.firstName || 'Patient';
  const recipientLastName = recipientData?.lastName || '';
  const recipientAddress = recipientData?.streetAddress 
    ? `${recipientData.streetAddress}\n${recipientData.city}, ${recipientData.state} ${recipientData.zipCode}`
    : 'Address Not Provided';
  const recipientId = recipientData?.recipientId || 'N/A';

  const notificationDate = formatDateForLetter(new Date());
  const breachDate = formatDateForLetter(breachDetails.incidentDate);
  const discoveryDate = formatDateForLetter(breachDetails.discoveryDate);

  // Build PHI categories table
  const phiCategoriesTable = buildPHICategoriesTable(breachDetails);

  // Credit monitoring section
  const creditMonitoringSection = breachDetails.creditMonitoringOffered
    ? buildCreditMonitoringSection(organization, breachDetails)
    : buildNoCreditMonitoringSection(organization);

  // Law enforcement delay section
  const lawEnforcementDelaySection = breachDetails.lawEnforcementDelay
    ? buildLawEnforcementDelaySection(organization, privacyOfficerEmail, privacyOfficerPhone)
    : '';

  // State-specific resources (if state is provided)
  const stateResourcesSection = organization.state || organization.address_state
    ? buildStateResourcesSection(organization.state || organization.address_state || '')
    : '';

  return `
HIPAA BREACH NOTIFICATION LETTER
PRODUCTION-READY TEMPLATE FOR AUTOMATED GENERATION

DOCUMENT METADATA

Field
Value
Template Version
1.0
Last Updated
January 12, 2026
Legal Authority
45 CFR §164.400-414, HITECH Act
Compliance Standard
OCR Breach Notification Rule
Generated By
HIPAA Hub Breach Notification System
Document Classification
Legal Notice - Confidential

LETTERHEAD SECTION

${orgName}
${orgDba ? `DBA: ${orgDba}` : ''}
${address}
Phone: ${phone}
Email: ${email}
Website: ${website}
EIN: ${ein}
NPI: ${npi}
State License: ${stateLicense}

LETTER BODY

Date: ${notificationDate}

RE: NOTICE OF BREACH OF UNSECURED PROTECTED HEALTH INFORMATION

RECIPIENT INFORMATION

${recipientFirstName} ${recipientLastName}
${recipientAddress}

FORMAL GREETING

Dear ${recipientFirstName}:

SECTION 1: MANDATORY HIPAA DISCLOSURE (45 CFR §164.404(b))

This letter is to notify you of a breach of unsecured protected health information (PHI) that may have involved your personal health information. We are writing to you because we are required by law to notify you of this incident. This notice describes what happened, what information may have been involved, what we are doing to investigate and respond, and what steps you should take to protect yourself.

What Happened

On ${breachDate}, ${orgName} discovered that a security incident had occurred that may have resulted in unauthorized access to, acquisition of, or disclosure of your protected health information. We discovered this breach on ${discoveryDate} through ${breachDetails.discoveryMethod || 'our security monitoring systems'}.

Description of the Incident

${breachDetails.description}

The unauthorized access or disclosure occurred as follows: ${breachDetails.detailedNarrative || breachDetails.description}

SECTION 2: INFORMATION INVOLVED (45 CFR §164.404(b)(1)(i))

The protected health information that may have been involved in this breach includes the following categories of information:

${phiCategoriesTable}

Scope of Affected Individuals

This breach potentially affects ${breachDetails.numberOfIndividuals} individuals. ${breachDetails.additionalScopeInformation || 'We are notifying all affected individuals in accordance with HIPAA requirements.'}

SECTION 3: SYSTEMS AND TECHNOLOGY INVOLVED (45 CFR §164.404(b)(1)(ii))

The following systems or technologies were involved in this breach:

• System Name: ${breachDetails.systemName || 'Not Specified'}

• System Type: ${breachDetails.systemType || 'Not Specified'} (e.g., Electronic Health Record, Email System, Database Server, Cloud Storage, Mobile Device, etc.)

• Data Location: ${breachDetails.dataLocation || 'Not Specified'} (e.g., On-premises server, Cloud-based service, Portable device, etc.)

• Encryption Status: ${breachDetails.encryptionStatus || 'Not Specified'} (e.g., Encrypted, Unencrypted, Partially encrypted)

• Authentication Controls: ${breachDetails.authenticationControls || 'Not Specified'} (e.g., Password-protected, Multi-factor authentication, Biometric, etc.)

Technical Details

The breach occurred through the following technical means: ${breachDetails.technicalDetails || breachDetails.description}

SECTION 4: WHAT WE ARE DOING (45 CFR §164.404(b)(1)(iii))

${orgName} takes this breach very seriously and is taking the following immediate and ongoing actions to investigate, respond to, and prevent similar incidents in the future:

Immediate Response Actions

• Containment: We have immediately contained the breach by ${breachDetails.containmentActions || 'isolating affected systems and revoking unauthorized access'}.

• Forensic Investigation: We have engaged ${breachDetails.forensicInvestigator || 'qualified security professionals'} to conduct a comprehensive forensic investigation to determine the full scope and cause of the breach.

• Law Enforcement Notification: ${breachDetails.lawEnforcementNotificationStatus || 'We have notified'} We ${breachDetails.haveNotifiedOrWillNotify || 'have notified'} law enforcement of this incident.

• Notification Process: We are notifying all affected individuals, the media (if applicable), and the U.S. Department of Health and Human Services (HHS) as required by law.

Ongoing Investigation and Remediation

• Root Cause Analysis: We are conducting a detailed root cause analysis to determine how this breach occurred and what security gaps allowed it to happen.

• System Review: We are conducting a comprehensive review of all systems and controls to identify any similar vulnerabilities.

• Security Enhancements: We are implementing the following security enhancements to prevent recurrence: ${breachDetails.securityEnhancements || breachDetails.stepsTaken}.

• Policy Updates: We are updating our security policies and procedures to address the vulnerabilities that led to this breach.

• Workforce Training: We are providing additional training to our workforce on security awareness, incident response, and breach prevention.

• Vendor Assessment: We are reviewing our relationships with vendors and service providers to ensure they maintain adequate security controls.

Monitoring and Verification

• Ongoing Monitoring: We are implementing enhanced monitoring of our systems to detect any unauthorized access or suspicious activity.

• Audit Logging: We are reviewing audit logs to determine if any additional unauthorized access occurred.

• Verification of Remediation: We are verifying that all remediation actions have been completed and are effective.

SECTION 5: WHAT YOU SHOULD DO (45 CFR §164.404(b)(1)(iv))

We recommend that you take the following steps to protect yourself:

Immediate Actions

1. Monitor Your Accounts: Review your healthcare provider accounts, insurance accounts, and financial accounts for any suspicious activity or unauthorized transactions.

2. Check Your Credit Report: Obtain a free credit report from each of the three major credit reporting agencies (Equifax, Experian, and TransUnion) at www.annualcreditreport.com. Review your credit report for any unauthorized accounts or inquiries.

3. Place a Fraud Alert: Consider placing a fraud alert with the three major credit reporting agencies. A fraud alert requires creditors to verify your identity before opening new accounts in your name. To place a fraud alert, contact one of the following agencies:

• Equifax: 1-888-378-4329 or www.equifax.com

• Experian: 1-888-397-3742 or www.experian.com

• TransUnion: 1-888-909-8872 or www.transunion.com

4. Consider a Credit Freeze: You may also consider placing a credit freeze with the three major credit reporting agencies. A credit freeze prevents creditors from accessing your credit report without your permission, making it more difficult for someone to open accounts in your name. Contact information is provided above.

5. Monitor Your Medical Records: Contact your healthcare providers and request a copy of your medical records. Review your records for any unauthorized access or changes.

6. Monitor Your Insurance Claims: Review your insurance claims for any unauthorized claims or services you did not receive.

Ongoing Vigilance

• Report Suspicious Activity: If you notice any suspicious activity on your accounts or in your credit report, contact your financial institution, credit card company, or law enforcement immediately.

• Preserve Evidence: If you discover evidence of identity theft or fraud, preserve all documentation and report it to law enforcement.

• Contact Us: If you have any questions or concerns, please contact our Privacy Officer at ${privacyOfficerEmail} or ${privacyOfficerPhone}.

${breachDetails.stepsForPatient ? `\nAdditional Recommendations:\n\n${breachDetails.stepsForPatient}` : ''}

SECTION 6: CREDIT MONITORING AND IDENTITY THEFT PROTECTION

${creditMonitoringSection}

SECTION 7: LAW ENFORCEMENT DELAY NOTIFICATION (IF APPLICABLE)

${lawEnforcementDelaySection}

SECTION 8: PATIENT RIGHTS AND PRIVACY PROTECTIONS

Your Rights Under HIPAA

You have the following rights regarding your protected health information:

1. Right to Access: You have the right to access, inspect, and obtain a copy of your protected health information.

2. Right to Amendment: You have the right to request that we amend your protected health information if you believe it is inaccurate or incomplete.

3. Right to Accounting of Disclosures: You have the right to receive an accounting of disclosures of your protected health information.

4. Right to Confidential Communication: You have the right to request that we communicate with you about your protected health information in a confidential manner.

5. Right to File a Complaint: You have the right to file a complaint with us or with the U.S. Department of Health and Human Services if you believe your privacy rights have been violated.

How to Exercise Your Rights

To exercise any of these rights, please contact our Privacy Officer:

Privacy Officer
${privacyOfficerName}
${orgName}
${address}
Phone: ${privacyOfficerPhone}
Email: ${privacyOfficerEmail}

SECTION 9: CONTACT INFORMATION

If you have any questions or concerns about this breach or our response, please contact us:

Organization Contact Information

${orgName}
${address}
Phone: ${phone}
Email: ${email}
Website: ${website}

Privacy Officer

${privacyOfficerName}
Title: ${privacyOfficerRole}
Phone: ${privacyOfficerPhone}
Email: ${privacyOfficerEmail}

Security Officer

${securityOfficerName}
Title: ${securityOfficerRole}
Phone: ${securityOfficerPhone}
Email: ${securityOfficerEmail}

SECTION 10: ADDITIONAL RESOURCES

Federal Resources

• U.S. Department of Health and Human Services (HHS): www.hhs.gov/hipaa

• HHS Office for Civil Rights (OCR): www.hhs.gov/ocr

• Federal Trade Commission (FTC) - Identity Theft: www.identitytheft.gov

• Federal Trade Commission (FTC) - Credit Monitoring: www.consumer.ftc.gov

State Resources

${stateResourcesSection}

Credit Reporting Agencies

• Equifax: www.equifax.com or 1-888-378-4329

• Experian: www.experian.com or 1-888-397-3742

• TransUnion: www.transunion.com or 1-888-909-8872

SECTION 11: LEGAL DISCLAIMER AND IMPORTANT INFORMATION

Limitation of Liability

This notification is provided in compliance with the HIPAA Breach Notification Rule (45 CFR §164.400-414) and applicable state privacy laws. The information contained in this letter is provided "as is" without warranty of any kind, express or implied. ${orgName} does not warrant the accuracy, completeness, or timeliness of the information provided.

No Admission of Liability

This notification does not constitute an admission of liability, fault, or wrongdoing by ${orgName}. ${orgName} has taken this action out of an abundance of caution and in compliance with applicable law.

Confidentiality

This letter contains confidential and privileged information. If you have received this letter in error, please notify us immediately and destroy all copies.

No Waiver of Rights

Nothing in this letter shall be construed as a waiver of any rights or remedies available to you under applicable law.

SECTION 12: SIGNATURE BLOCK

We sincerely regret that this incident occurred and appreciate your patience as we work to resolve this matter. We remain committed to protecting your privacy and the security of your protected health information.

Sincerely,


_____________________________
${privacyOfficerName}
${privacyOfficerRole}
${orgName}

Date: ${notificationDate}


SECTION 13: DOCUMENT CONTROL AND VERSION INFORMATION

Document ID: BREACH-NOTIF-${ein.replace(/-/g, '')}-${breachDetails.breachId || 'UNKNOWN'}
Generated Date: ${notificationDate}
Notification Date: ${notificationDate}
Template Version: 2.0
Compliance Authority: 45 CFR §164.400-414, HITECH Act
Generated By: HIPAA Hub Breach Notification System
Recipient ID: ${recipientId}
Delivery Method: First-class mail

---
This notification is provided in compliance with the Health Insurance Portability and Accountability Act (HIPAA) Breach Notification Rule, 45 CFR §164.400-414, and applicable state privacy laws.
`;
}

/**
 * Generate HHS OCR Notification Letter (45 CFR §164.406)
 * Required for breaches affecting 500+ individuals
 */
export function generateHHSOCRNotificationLetter(
  organization: OrganizationData,
  breachDetails: BreachDetails
): string {
  const privacyOfficerName = organization.privacy_officer_name || 'Privacy Officer';
  const privacyOfficerEmail = organization.privacy_officer_email || organization.email_address || 'privacy@organization.com';
  const privacyOfficerPhone = organization.phone_number || 'Not Provided';
  const ceoName = organization.ceo_name || organization.authorized_representative_name || 'Chief Executive Officer';
  const ceoTitle = organization.ceo_title || organization.authorized_representative_title || 'Chief Executive Officer';
  const orgName = organization.legal_name || organization.name || 'Organization';
  const address = formatFullAddress(organization);
  const ein = organization.ein || 'Not Provided';
  const npi = organization.npi || 'Not Provided';

  const notificationDate = formatDateForLetter(new Date());
  const breachDate = formatDateForLetter(breachDetails.incidentDate);
  const discoveryDate = formatDateForLetter(breachDetails.discoveryDate);

  return `
HIPAA BREACH NOTIFICATION
NOTIFICATION TO HHS SECRETARY

U.S. Department of Health and Human Services
Office for Civil Rights
200 Independence Avenue, S.W.
Washington, D.C. 20201

Date: ${notificationDate}

RE: BREACH NOTIFICATION - 45 CFR §164.406

To Whom It May Concern:

This letter serves as formal notification to the Secretary of the U.S. Department of Health and Human Services (HHS) of a breach of unsecured Protected Health Information (PHI) as required by 45 CFR §164.406 of the Health Insurance Portability and Accountability Act (HIPAA) Breach Notification Rule.

COVERED ENTITY INFORMATION

Organization Name: ${orgName}
EIN (Employer Identification Number): ${ein}
NPI (National Provider Identifier): ${npi}
Address: ${address}
State: ${organization.state || organization.address_state || 'Not Provided'}

CONTACT INFORMATION

Privacy Officer: ${privacyOfficerName}
Email: ${privacyOfficerEmail}
Phone: ${privacyOfficerPhone}

BREACH INFORMATION

Date of Discovery: ${discoveryDate}
Date of Incident: ${breachDate}
Number of Individuals Affected: ${breachDetails.numberOfIndividuals}

DESCRIPTION OF THE BREACH

${breachDetails.description}

TYPES OF INFORMATION INVOLVED

The following types of Protected Health Information were involved in this breach:

${breachDetails.typesOfInfo}

REMEDIATION ACTIONS

We have taken the following steps to investigate and address this breach:

${breachDetails.stepsTaken}

We are also implementing additional safeguards to prevent similar incidents in the future.

INDIVIDUAL NOTIFICATION

We have notified all affected individuals in accordance with 45 CFR §164.404. Individual notifications were sent by first-class mail and, where applicable, by email to individuals who have agreed to electronic notification.

CERTIFICATION

I certify that the information provided in this notification is accurate and complete to the best of my knowledge.

Respectfully submitted,

${ceoName}
${ceoTitle}
${orgName}

Signature: _________________________
Date: ${notificationDate}

---
This notification is provided in accordance with 45 CFR §164.406 of the Health Insurance Portability and Accountability Act (HIPAA) Breach Notification Rule.
`;
}

/**
 * Generate Media Notification Letter (45 CFR §164.408)
 * Required for breaches affecting 500+ residents of a state or jurisdiction
 */
export function generateMediaNotificationLetter(
  organization: OrganizationData,
  breachDetails: BreachDetails
): string {
  const privacyOfficerName = organization.privacy_officer_name || 'Privacy Officer';
  const privacyOfficerEmail = organization.privacy_officer_email || organization.email_address || 'privacy@organization.com';
  const privacyOfficerPhone = organization.phone_number || 'Not Provided';
  const orgName = organization.legal_name || organization.name || 'Organization';
  const address = formatFullAddress(organization);
  const ein = organization.ein || 'Not Provided';
  const npi = organization.npi || 'Not Provided';

  const notificationDate = formatDateForLetter(new Date());
  const breachDate = formatDateForLetter(breachDetails.incidentDate);
  const discoveryDate = formatDateForLetter(breachDetails.discoveryDate);

  return `
HIPAA BREACH NOTIFICATION
MEDIA NOTIFICATION

FOR IMMEDIATE RELEASE

Date: ${notificationDate}

CONTACT:
${privacyOfficerName}
Privacy Officer
${orgName}
Phone: ${privacyOfficerPhone}
Email: ${privacyOfficerEmail}

${orgName} NOTIFIES INDIVIDUALS OF DATA BREACH

${orgName} (EIN: ${ein}, NPI: ${npi}) is notifying individuals of a breach of Protected Health Information that may affect residents of ${breachDetails.stateOrJurisdiction || organization.state || organization.address_state || 'the state'}.

WHAT HAPPENED

On ${breachDate}, ${orgName} discovered that Protected Health Information may have been accessed, acquired, used, or disclosed in an unauthorized manner. The breach was discovered on ${discoveryDate}.

DESCRIPTION OF THE BREACH

${breachDetails.description}

SCOPE OF THE BREACH

This breach may affect approximately ${breachDetails.numberOfIndividuals} individuals, including residents of ${breachDetails.stateOrJurisdiction || organization.state || organization.address_state || 'the state'}.

TYPES OF INFORMATION INVOLVED

The following types of Protected Health Information may have been involved:

${breachDetails.typesOfInfo}

WHAT WE ARE DOING

${orgName} takes this matter very seriously and has taken immediate steps to investigate and address this breach:

${breachDetails.stepsTaken}

We are also implementing additional safeguards to prevent similar incidents in the future.

WHAT AFFECTED INDIVIDUALS SHOULD DO

Affected individuals should:

• Review their medical records and explanation of benefits statements for any suspicious activity
• Monitor their credit reports and financial accounts
• Report any suspicious activity to their healthcare providers and financial institutions
• Consider placing a fraud alert or credit freeze on their credit reports

FOR MORE INFORMATION

Affected individuals who have questions about this breach or need additional information should contact:

${privacyOfficerName}
Privacy Officer
${orgName}
Phone: ${privacyOfficerPhone}
Email: ${privacyOfficerEmail}

Individuals also have the right to file a complaint with the U.S. Department of Health and Human Services (HHS) Office for Civil Rights (OCR) by visiting https://www.hhs.gov/hipaa/filing-a-complaint/index.html or calling 1-800-368-1019.

ABOUT ${orgName.toUpperCase()}

${orgName} is committed to protecting the privacy and security of patient information. We sincerely apologize for any inconvenience or concern this incident may cause and are committed to taking all necessary steps to safeguard Protected Health Information.

---

This notification is provided in accordance with 45 CFR §164.408 of the Health Insurance Portability and Accountability Act (HIPAA) Breach Notification Rule.

For media inquiries, please contact:
${privacyOfficerName}
Privacy Officer
${orgName}
Phone: ${privacyOfficerPhone}
Email: ${privacyOfficerEmail}
`;
}

/**
 * Build PHI categories table
 */
function buildPHICategoriesTable(details: BreachDetails): string {
  return `
Information Category
Included
Details
Name
${details.phiNameIncluded ? 'Yes' : 'No'}
Full legal name
Social Security Number
${details.phiSsnIncluded ? 'Yes' : 'No'}
9-digit SSN
Date of Birth
${details.phiDobIncluded ? 'Yes' : 'No'}
Month/Day/Year
Medical Record Number
${details.phiMrnIncluded ? 'Yes' : 'No'}
Patient identifier
Health Insurance Information
${details.phiInsuranceIncluded ? 'Yes' : 'No'}
Policy number, group number
Diagnosis and Treatment Information
${details.phiDiagnosisIncluded ? 'Yes' : 'No'}
Medical conditions, treatment plans
Medication Information
${details.phiMedicationIncluded ? 'Yes' : 'No'}
Current and past medications
Laboratory and Imaging Results
${details.phiLabImagingIncluded ? 'Yes' : 'No'}
Test results, imaging reports
Billing and Payment Information
${details.phiBillingIncluded ? 'Yes' : 'No'}
Account numbers, payment history
Provider Information
${details.phiProviderIncluded ? 'Yes' : 'No'}
Treating physician names, contact info
Insurance Claims Information
${details.phiClaimsIncluded ? 'Yes' : 'No'}
Claim numbers, claim status
Other Sensitive Information
${details.phiOtherIncluded ? 'Yes' : 'No'}
${details.phiOtherDescription || 'N/A'}
`;
}

/**
 * Build credit monitoring section
 */
function buildCreditMonitoringSection(org: OrganizationData, details: BreachDetails): string {
  if (!details.creditMonitoringOffered) {
    return buildNoCreditMonitoringSection(org);
  }

  return `
Complimentary Credit Monitoring and Identity Theft Protection Services

To help protect you, ${org.legal_name || org.name || 'Organization'} is offering ${details.creditMonitoringDuration || 12} months of complimentary credit monitoring and identity theft protection services through ${details.creditMonitoringProvider || 'a qualified provider'}.

How to Enroll

To activate your complimentary credit monitoring services, please visit ${details.creditMonitoringEnrollmentUrl || 'the enrollment website'} or call ${details.creditMonitoringPhoneNumber || 'the enrollment phone number'}.

You will need the following information to enroll:

• Your name and date of birth

• Your Social Security Number

• Your email address

• Enrollment code: ${details.enrollmentCode || 'N/A'}

What is Included

Your complimentary credit monitoring services include:

• Credit Report Monitoring: Continuous monitoring of your credit reports from all three major credit reporting agencies

• Credit Score Monitoring: Daily monitoring of your credit score

• Fraud Alert: Automatic placement of fraud alerts on your credit file

• Identity Theft Insurance: Up to ${details.identityTheftInsuranceAmount || '$1,000,000'} in identity theft insurance coverage

• Fraud Resolution Assistance: Professional assistance in resolving any identity theft or fraud issues

• 24/7 Customer Support: Access to customer support representatives 24 hours a day, 7 days a week

Enrollment Deadline

You must enroll in these services within ${details.enrollmentDeadlineDays || 60} days of receiving this letter to receive the full ${details.creditMonitoringDuration || 12} months of complimentary services.
`;
}

/**
 * Build no credit monitoring section
 */
function buildNoCreditMonitoringSection(org: OrganizationData): string {
  return `
Credit Monitoring Services

While ${org.legal_name || org.name || 'Organization'} is not providing complimentary credit monitoring services in this instance, we strongly recommend that you consider enrolling in credit monitoring services on your own. Many credit monitoring services are available at reasonable cost and can help you detect and respond to identity theft quickly.
`;
}

/**
 * Build law enforcement delay section
 */
function buildLawEnforcementDelaySection(org: OrganizationData, email: string, phone: string): string {
  return `
Law Enforcement Delay

We have been advised by law enforcement that notification of this breach may delay the investigation. Therefore, we are delaying notification of certain details of this breach as requested by law enforcement. We will provide you with additional information as soon as law enforcement advises us that notification will not compromise their investigation.

For more information about this delay, please contact our Privacy Officer at ${email} or ${phone}.
`;
}

/**
 * Build state-specific resources section
 */
function buildStateResourcesSection(state: string): string {
  // Basic state resources - can be expanded with actual state-specific URLs
  return `
• ${state} Attorney General: Please visit your state's Attorney General website for information about state-specific privacy laws and resources.

• ${state} Consumer Protection: Please visit your state's consumer protection agency website for information about identity theft and consumer protection resources.
`;
}

/**
 * Format full address for letters
 */
function formatFullAddress(org: OrganizationData): string {
  const parts: string[] = [];
  
  if (org.address_street) parts.push(org.address_street);
  if (org.address_city) {
    const cityStateZip = [org.address_city];
    if (org.address_state) cityStateZip.push(org.address_state);
    if (org.address_zip) cityStateZip.push(org.address_zip);
    parts.push(cityStateZip.join(', '));
  }
  
  return parts.length > 0 ? parts.join('\n') : 'Address not provided';
}

/**
 * Format date for letters (e.g., "January 15, 2024")
 */
function formatDateForLetter(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) {
    return 'Date not provided';
  }
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
