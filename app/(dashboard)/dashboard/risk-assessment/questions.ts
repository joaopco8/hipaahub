// HIPAA Security Risk Assessment — 68 questions across 6 domains
// OCR-defensible per 45 CFR 164.308(a)(1) — Security Management Process

export interface QuestionOption {
  letter: 'A' | 'B' | 'C' | 'D' | 'E';
  text: string;
  riskPoints: number;
  isNA?: boolean;
}

export interface Question {
  id: string;
  domain: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
  isMulti?: boolean; // Q2 only
  options: QuestionOption[];
  explanation: string;
  remediation: string; // PDF Section 4 recommendation
  pdfSection: 1 | 2 | 3 | 4;
  weight: number; // 1.0 default, 1.5 for critical questions
}

export const DOMAINS = [
  { id: 1, label: 'PHI Inventory',         short: 'PHI',      questionCount: 14 },
  { id: 2, label: 'Access Controls',       short: 'Access',   questionCount: 12 },
  { id: 3, label: 'Device & Physical',     short: 'Devices',  questionCount: 10 },
  { id: 4, label: 'Network & Transmission',short: 'Network',  questionCount: 10 },
  { id: 5, label: 'Vendors & BAs',         short: 'Vendors',  questionCount: 8  },
  { id: 6, label: 'Policies & Governance', short: 'Governance', questionCount: 14 },
] as const;

// Helper — max raw score per domain (questionCount × 3)
export const DOMAIN_MAX: Record<number, number> = {
  1: 42, 2: 36, 3: 30, 4: 30, 5: 24, 6: 42,
};
export const TOTAL_MAX = 204; // 68 × 3

export const QUESTIONS: Question[] = [

  // ─── DOMAIN 1: PHI INVENTORY (Q1–Q14) ──────────────────────────────────────

  {
    id: 'Q1', domain: 1, pdfSection: 1, weight: 1.5,
    text: 'Does your practice maintain a written inventory of all systems, applications, and devices that store or transmit patient data?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Yes — written inventory exists, is current, and is reviewed annually' },
      { letter: 'B', riskPoints: 1, text: 'Yes — but it has not been updated in over a year' },
      { letter: 'C', riskPoints: 2, text: 'We have a mental inventory but nothing documented' },
      { letter: 'D', riskPoints: 3, text: 'No inventory exists' },
    ],
    explanation: "OCR's first step in any audit is asking for a list of systems that handle PHI. A documented inventory demonstrates that your practice actively manages its data environment.",
    remediation: 'Create a written inventory of all systems, applications, and devices that store or transmit PHI. Review and update it at least annually.',
  },

  {
    id: 'Q2', domain: 1, pdfSection: 1, weight: 1.5, isMulti: true,
    text: 'Where are patient electronic records primarily stored? (Select all that apply)',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Cloud-based EHR managed by a HIPAA-compliant vendor with signed BAA' },
      { letter: 'B', riskPoints: 1, text: 'Local server at the practice' },
      { letter: 'C', riskPoints: 2, text: 'Individual staff computers (local hard drives)' },
      { letter: 'D', riskPoints: 3, text: 'Personal devices owned by staff' },
      { letter: 'E', riskPoints: 3, text: 'External hard drives or USB drives' },
    ],
    explanation: 'Each additional storage location increases breach risk. Cloud EHR with a BAA is lowest risk. Personal devices and external drives are high risk and require immediate policy action.',
    remediation: 'Consolidate data to encrypted, HIPAA-compliant locations. Remove PHI from personal devices and unencrypted external media. Ensure a BAA covers every storage platform.',
  },

  {
    id: 'Q3', domain: 1, pdfSection: 1, weight: 1.0,
    text: 'Does your practice use paper records for any patient information?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'No paper records containing PHI' },
      { letter: 'B', riskPoints: 1, text: 'Yes — stored in locked cabinets with restricted access' },
      { letter: 'C', riskPoints: 2, text: 'Yes — storage is not consistently locked or restricted' },
      { letter: 'D', riskPoints: 3, text: 'Yes — and there is no formal storage policy' },
    ],
    explanation: 'Paper records are PHI and are covered by HIPAA\'s Privacy Rule. They must be physically secured and disposed of properly.',
    remediation: 'Store all paper PHI in locked cabinets with access restricted to authorized staff. Establish a written policy for paper record storage and disposal.',
  },

  {
    id: 'Q4', domain: 1, pdfSection: 1, weight: 1.0,
    text: 'How are paper records with PHI disposed of when no longer needed?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Cross-cut shredding or certified destruction service, documented' },
      { letter: 'B', riskPoints: 1, text: 'Shredding — but not formally documented' },
      { letter: 'C', riskPoints: 2, text: 'Torn up or thrown in regular trash' },
      { letter: 'D', riskPoints: 3, text: 'We have not established a paper disposal process' },
      { letter: 'E', riskPoints: 0, text: 'Not applicable — no paper records', isNA: true },
    ],
    explanation: 'Improper disposal of paper PHI is a direct HIPAA violation. The "dumpster diving" breach is real — discarded records are a frequent source of unauthorized disclosure.',
    remediation: 'Implement cross-cut shredding or a certified destruction service. Document all PHI disposal as part of your audit trail.',
  },

  {
    id: 'Q5', domain: 1, pdfSection: 1, weight: 1.5,
    text: 'Do any staff members use personal cell phones to communicate about patients (texts, calls, voicemails)?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'No — practice policy prohibits this and a compliant system is used instead' },
      { letter: 'B', riskPoints: 1, text: 'Yes — but only for scheduling without clinical details' },
      { letter: 'C', riskPoints: 2, text: 'Yes — including clinical details, using a HIPAA-compliant app with signed BAA' },
      { letter: 'D', riskPoints: 3, text: 'Yes — via regular SMS or phone without any specific safeguards' },
    ],
    explanation: 'Personal cell phone communications about patients are PHI. Standard SMS is not encrypted. A HIPAA-compliant messaging app with a signed BAA is required for clinical communication.',
    remediation: 'Prohibit clinical communication over personal SMS/phone. Implement a HIPAA-compliant messaging solution with a signed BAA and enforce its use.',
  },

  {
    id: 'Q6', domain: 1, pdfSection: 1, weight: 1.5,
    text: 'Is your practice\'s telehealth platform HIPAA-compliant with a signed BAA?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Yes — we have a signed BAA with our telehealth platform' },
      { letter: 'B', riskPoints: 1, text: 'We use a telehealth platform but have not signed a BAA' },
      { letter: 'C', riskPoints: 2, text: 'We use a consumer video tool (standard Zoom, FaceTime, Skype)' },
      { letter: 'D', riskPoints: 3, text: 'We do not conduct telehealth — no BAA required for this' },
      { letter: 'E', riskPoints: 0, text: 'Not applicable — practice does not provide telehealth', isNA: true },
    ],
    explanation: 'Standard consumer video platforms are explicitly not HIPAA-compliant. During the PHE waiver period they were temporarily allowed, but that waiver is no longer in effect.',
    remediation: 'Switch to a HIPAA-compliant telehealth platform (e.g., SimplePractice, Doxy.me, Zoom for Healthcare) and obtain a signed BAA before any sessions.',
  },

  {
    id: 'Q7', domain: 1, pdfSection: 1, weight: 1.0,
    text: 'Does your practice use email to communicate PHI with patients or other providers?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Yes — using a HIPAA-compliant email provider with a signed BAA' },
      { letter: 'B', riskPoints: 1, text: 'Yes — using Google Workspace or Microsoft 365 without a signed BAA' },
      { letter: 'C', riskPoints: 2, text: 'Yes — using personal email accounts (Gmail, Yahoo, etc.)' },
      { letter: 'D', riskPoints: 3, text: 'We use a secure patient portal exclusively — no PHI by email' },
    ],
    explanation: 'Standard email is not inherently secure. Google Workspace and Microsoft 365 both offer BAAs — if you use them for PHI, you must have one signed.',
    remediation: 'Sign a BAA with your email provider (Google Workspace or Microsoft 365 both offer this for free) or migrate to a HIPAA-compliant platform with built-in encryption.',
  },

  {
    id: 'Q8', domain: 1, pdfSection: 1, weight: 1.5,
    text: 'Is patient data backed up regularly?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Yes — automated backups to an encrypted, HIPAA-compliant location, tested regularly' },
      { letter: 'B', riskPoints: 1, text: 'Yes — but backups are not encrypted or not regularly tested' },
      { letter: 'C', riskPoints: 2, text: 'Occasionally — no formal backup schedule' },
      { letter: 'D', riskPoints: 3, text: 'No backup system in place' },
    ],
    explanation: 'Data loss from ransomware, hardware failure, or disaster is a leading cause of practice disruption. HIPAA\'s contingency planning requirement includes data backup and recovery procedures.',
    remediation: 'Implement automated, encrypted backups to a HIPAA-compliant cloud service. Test restoration at least quarterly. Ensure your backup vendor has signed a BAA.',
  },

  {
    id: 'Q9', domain: 1, pdfSection: 1, weight: 1.0,
    text: 'Where are backup copies of patient data stored?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Encrypted cloud backup with signed BAA' },
      { letter: 'B', riskPoints: 1, text: 'External drive stored offsite in a secure location' },
      { letter: 'C', riskPoints: 2, text: 'External drive kept at the practice' },
      { letter: 'D', riskPoints: 3, text: 'No separate backup exists' },
      { letter: 'E', riskPoints: 0, text: 'Not applicable — cloud-only with vendor-managed redundancy (BAA confirmed)', isNA: true },
    ],
    explanation: 'A backup stored in the same location as the primary data provides no protection against fire, flood, or physical theft. Offsite or cloud backups are required.',
    remediation: 'Store backup copies in a separate physical location or in encrypted cloud storage. Confirm the storage vendor has a signed BAA.',
  },

  {
    id: 'Q10', domain: 1, pdfSection: 1, weight: 1.0,
    text: 'Does your practice have a written policy defining what data staff can and cannot store on personal devices?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Yes — written policy exists, staff have signed acknowledgment, policy is enforced' },
      { letter: 'B', riskPoints: 1, text: 'Yes — policy exists but acknowledgment or enforcement is inconsistent' },
      { letter: 'C', riskPoints: 2, text: 'We have verbally communicated expectations but nothing is written' },
      { letter: 'D', riskPoints: 3, text: 'No policy exists' },
    ],
    explanation: 'Without a written policy, staff may unknowingly store PHI on personal devices that are not encrypted, not backed up, and outside your control.',
    remediation: 'Adopt a written BYOD (Bring Your Own Device) or Mobile Device Policy. Have staff sign acknowledgment. Enforce encryption and remote-wipe capability for any device used for work.',
  },

  {
    id: 'Q11', domain: 1, pdfSection: 1, weight: 1.0,
    text: 'Are session notes or clinical documentation ever written in physical notebooks or loose paper before being entered into the EHR?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'No — all documentation goes directly into the EHR or secure system' },
      { letter: 'B', riskPoints: 1, text: 'Yes — but notes are transferred and paper is shredded the same day' },
      { letter: 'C', riskPoints: 2, text: 'Yes — notes sit for multiple days before being entered and destroyed' },
      { letter: 'D', riskPoints: 3, text: 'Yes — and paper notes are kept long-term alongside or instead of electronic records' },
    ],
    explanation: 'Physical notebooks containing patient information are PHI. They can be lost, stolen, or seen by unauthorized parties. A notebook left in a bag is a breach waiting to happen.',
    remediation: 'Establish a policy that paper notes are transferred to the EHR and shredded within 24 hours. Consider transitioning to direct-to-EHR documentation.',
  },

  {
    id: 'Q12', domain: 1, pdfSection: 1, weight: 1.5,
    text: 'Does your practice have a process for what happens to patient data when a staff member leaves or is terminated?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Yes — written offboarding checklist including immediate access revocation and device recovery' },
      { letter: 'B', riskPoints: 1, text: 'Yes — but the process is informal and not always followed consistently' },
      { letter: 'C', riskPoints: 2, text: 'We revoke EHR access but do not have a systematic process for other systems' },
      { letter: 'D', riskPoints: 3, text: 'No formal offboarding process for data access' },
    ],
    explanation: 'Former employees with active credentials are one of the most common sources of unauthorized PHI access. Immediate access revocation on termination is required.',
    remediation: 'Create a written offboarding checklist that covers every system the employee accessed. Execute it on or before the last day of employment. Document completion.',
  },

  {
    id: 'Q13', domain: 1, pdfSection: 1, weight: 1.0,
    text: 'Does your practice conduct any research, teaching, or share de-identified patient data with any external parties?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'No' },
      { letter: 'B', riskPoints: 1, text: 'Yes — through formal research protocols with proper authorization' },
      { letter: 'C', riskPoints: 2, text: 'Yes — we share cases informally for educational purposes without formal authorization' },
      { letter: 'D', riskPoints: 3, text: 'Unsure' },
    ],
    explanation: 'Sharing PHI for research or teaching requires either patient authorization or a formal de-identification process meeting HIPAA standards. Informal case sharing is a disclosure violation.',
    remediation: 'If sharing data externally, implement a formal authorization process. Ensure any data shared for teaching purposes meets HIPAA de-identification standards (Safe Harbor or Expert Determination).',
  },

  {
    id: 'Q14', domain: 1, pdfSection: 1, weight: 1.0,
    text: 'Does your practice have a written Retention Policy defining how long different types of patient records are kept?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Yes — written policy aligned with state requirements and HIPAA' },
      { letter: 'B', riskPoints: 1, text: 'Yes — but it has not been reviewed against current state law' },
      { letter: 'C', riskPoints: 2, text: 'We follow general practice but nothing is written' },
      { letter: 'D', riskPoints: 3, text: 'No retention policy exists' },
    ],
    explanation: 'Record retention requirements vary by state. HIPAA security documentation must be retained for 6 years. Medical records vary by state law. Without a written policy, records may be destroyed prematurely or kept longer than required.',
    remediation: 'Adopt a written Records Retention Policy that specifies retention periods by record type, aligned with your state\'s requirements and HIPAA\'s 6-year minimum for security documentation.',
  },

  // ─── DOMAIN 2: ACCESS CONTROLS (Q15–Q26) ────────────────────────────────────

  {
    id: 'Q15', domain: 2, pdfSection: 2, weight: 1.5,
    text: 'Does every person who accesses patient data have their own unique login credentials?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Yes — every user has individual credentials across all systems containing PHI' },
      { letter: 'B', riskPoints: 1, text: 'Yes for the EHR, but some other systems use shared logins' },
      { letter: 'C', riskPoints: 2, text: 'Some systems use shared credentials as standard practice' },
      { letter: 'D', riskPoints: 3, text: 'Multiple people share the same login on our primary systems' },
    ],
    explanation: 'HIPAA\'s unique user identification requirement means every person must have their own login. Shared credentials make audit trails impossible and are a direct violation.',
    remediation: 'Create individual accounts for every user on every system that accesses PHI. Eliminate all shared credentials immediately.',
  },

  {
    id: 'Q16', domain: 2, pdfSection: 2, weight: 1.5,
    text: 'Is multi-factor authentication (MFA) enabled on systems containing patient data? (MFA = requiring a phone code or app in addition to a password)',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Yes — MFA is enabled on all systems containing PHI' },
      { letter: 'B', riskPoints: 1, text: 'Yes — MFA is enabled on the EHR but not on email or cloud storage' },
      { letter: 'C', riskPoints: 2, text: 'MFA is available but optional and most staff have not enabled it' },
      { letter: 'D', riskPoints: 3, text: 'MFA is not in use on any systems' },
    ],
    explanation: 'MFA prevents 99.9% of credential-based attacks. A stolen password alone is not enough to gain access when MFA is enabled. This is now considered a baseline security requirement.',
    remediation: 'Enable MFA on all systems containing PHI — EHR, email, cloud storage, and practice management software. Make it mandatory, not optional.',
  },

  {
    id: 'Q17', domain: 2, pdfSection: 2, weight: 1.5,
    text: 'How are staff granted access to patient data systems when they join?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Formal access request process — minimum necessary access, documented and approved by a supervisor' },
      { letter: 'B', riskPoints: 1, text: 'Access is granted based on job role without formal documentation' },
      { letter: 'C', riskPoints: 2, text: 'New staff get the same access as whoever trained them' },
      { letter: 'D', riskPoints: 3, text: 'No formal access provisioning process' },
    ],
    explanation: 'HIPAA\'s Minimum Necessary standard requires that staff only have access to the PHI they need for their specific job — not access to all patient records.',
    remediation: 'Create a formal access request and approval process. Document each employee\'s access level and the business reason for it. Implement role-based access restrictions in your EHR.',
  },

  {
    id: 'Q18', domain: 2, pdfSection: 2, weight: 1.0,
    text: 'Are access permissions reviewed periodically to ensure they remain appropriate?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Yes — formal access review at least annually, documented' },
      { letter: 'B', riskPoints: 1, text: 'Yes — but reviews are informal and not consistently documented' },
      { letter: 'C', riskPoints: 2, text: 'Only when a problem is identified' },
      { letter: 'D', riskPoints: 3, text: 'No periodic access review process' },
    ],
    explanation: 'Staff roles change over time. An employee who was promoted may still have access to systems relevant to their old role. Annual access reviews catch these over-privileged accounts.',
    remediation: 'Schedule an annual access review for all users. Document findings and remove or adjust permissions that are no longer appropriate.',
  },

  {
    id: 'Q19', domain: 2, pdfSection: 2, weight: 1.5,
    text: 'Does your EHR or practice management system generate audit logs showing who accessed which records and when?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Yes — audit logs are generated and reviewed regularly (at least quarterly)' },
      { letter: 'B', riskPoints: 1, text: 'Yes — audit logs are generated but rarely or never reviewed' },
      { letter: 'C', riskPoints: 2, text: 'Unsure if audit logging is enabled' },
      { letter: 'D', riskPoints: 3, text: 'Audit logs are not generated or not available' },
    ],
    explanation: 'Audit controls are a required technical safeguard under HIPAA. The practice must be able to demonstrate that access to PHI is monitored.',
    remediation: 'Confirm audit logging is enabled in your EHR. Review logs at least quarterly for unusual access patterns. Document your review process.',
  },

  {
    id: 'Q20', domain: 2, pdfSection: 2, weight: 1.0,
    text: 'Do you review audit logs for unusual access patterns (staff accessing records of patients they do not treat, after-hours access, bulk downloads)?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Yes — regular review with documented findings and follow-up' },
      { letter: 'B', riskPoints: 1, text: 'Occasionally — but not systematically' },
      { letter: 'C', riskPoints: 2, text: 'Only after a specific incident is reported' },
      { letter: 'D', riskPoints: 3, text: 'Audit logs are not reviewed' },
    ],
    explanation: 'Generating logs and not reviewing them provides limited protection. OCR expects that practices actively monitor for suspicious access, not just record it.',
    remediation: 'Establish a quarterly audit log review process. Define what "unusual access" looks like for your practice and document what was reviewed and any findings.',
  },

  {
    id: 'Q21', domain: 2, pdfSection: 2, weight: 1.5,
    text: 'Is there a process for immediately revoking access when a staff member leaves?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Yes — written checklist, access revoked within hours of departure, documented' },
      { letter: 'B', riskPoints: 1, text: 'Yes — but it sometimes takes days for all systems to be updated' },
      { letter: 'C', riskPoints: 2, text: 'Access is revoked from the EHR but email and cloud storage are sometimes missed' },
      { letter: 'D', riskPoints: 3, text: 'No formal revocation process' },
    ],
    explanation: 'Former employees retain the ability to access PHI as long as their credentials are active. The longer credentials remain active after departure, the greater the risk.',
    remediation: 'Build access revocation into your offboarding checklist. Target same-day revocation for all systems. Include EHR, email, cloud storage, scheduling, and billing systems.',
  },

  {
    id: 'Q22', domain: 2, pdfSection: 2, weight: 1.0,
    text: 'Are there role-based access restrictions in your EHR — for example, preventing administrative staff from viewing clinical session notes?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Yes — clinical and administrative staff have different access levels, configured and maintained' },
      { letter: 'B', riskPoints: 1, text: 'We have different roles but they are not consistently configured' },
      { letter: 'C', riskPoints: 2, text: 'All staff have access to all patient information regardless of role' },
      { letter: 'D', riskPoints: 3, text: 'We have only one type of user account' },
    ],
    explanation: 'An administrative assistant does not need to read session notes. A clinician may not need billing details. Role-based access limits the exposure of sensitive information.',
    remediation: 'Configure role-based access controls in your EHR. Review which information each role type actually needs and remove access to anything beyond that.',
  },

  {
    id: 'Q23', domain: 2, pdfSection: 2, weight: 1.0,
    text: 'Do staff automatically get locked out of systems after a period of inactivity (automatic session timeout)?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Yes — all systems have automatic timeout configured' },
      { letter: 'B', riskPoints: 1, text: 'Yes for the EHR — not for email or other systems' },
      { letter: 'C', riskPoints: 2, text: 'Available but not configured' },
      { letter: 'D', riskPoints: 3, text: 'No automatic timeout on any systems' },
    ],
    explanation: 'An unlocked workstation left unattended is an open invitation. Automatic session timeout ensures that a forgotten logout doesn\'t leave patient data exposed.',
    remediation: 'Configure automatic session timeouts on all systems containing PHI. Recommended: 15 minutes of inactivity for clinical workstations, 5 minutes for high-traffic areas.',
  },

  {
    id: 'Q24', domain: 2, pdfSection: 2, weight: 1.0,
    text: 'Are privileged accounts (admin access) limited to only those who need them and monitored more closely?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Admin access is strictly limited, documented, and subject to additional monitoring' },
      { letter: 'B', riskPoints: 1, text: 'Admin access is limited but not specifically monitored' },
      { letter: 'C', riskPoints: 2, text: 'Several staff have admin access without clear justification' },
      { letter: 'D', riskPoints: 3, text: 'Not applicable — solo practice with single account', isNA: true },
    ],
    explanation: 'Administrator accounts have the ability to delete audit logs, create new users, and modify security settings. Compromised admin accounts cause the most severe breaches.',
    remediation: 'Limit admin access to the fewest people possible. Document who has it and why. Review admin activity logs at least monthly.',
  },

  {
    id: 'Q25', domain: 2, pdfSection: 2, weight: 1.0,
    text: 'How strong are password requirements across your systems?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Complex passwords (12+ characters, mixed types) required by system policy and changed at least annually' },
      { letter: 'B', riskPoints: 1, text: 'Moderate requirements enforced by some systems but not all' },
      { letter: 'C', riskPoints: 2, text: 'Passwords are set by users without system-enforced requirements' },
      { letter: 'D', riskPoints: 3, text: 'No password requirements or policies' },
    ],
    explanation: 'Weak or reused passwords are the most common point of entry for attackers. Password requirements alone reduce risk substantially.',
    remediation: 'Enforce password complexity requirements across all systems (12+ characters, mixed types). Consider a password manager to help staff manage strong unique passwords.',
  },

  {
    id: 'Q26', domain: 2, pdfSection: 2, weight: 1.0,
    text: 'Is there a process for staff to report lost or stolen credentials or devices containing PHI?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Yes — clear reporting process, staff are trained on it, documented response procedure' },
      { letter: 'B', riskPoints: 1, text: 'Staff know to report but the process is informal' },
      { letter: 'C', riskPoints: 2, text: 'No clear reporting process' },
    ],
    explanation: 'The sooner a lost device or credential is reported, the faster you can revoke access and limit exposure. Delayed reporting is the biggest amplifier of breach damage.',
    remediation: 'Establish a clear reporting procedure for lost devices and credentials. Train all staff. Ensure same-day response capability when a report is made.',
  },

  // ─── DOMAIN 3: DEVICE & PHYSICAL SECURITY (Q27–Q36) ─────────────────────────

  {
    id: 'Q27', domain: 3, pdfSection: 3, weight: 1.5,
    text: 'Are work computers and laptops encrypted (full disk encryption)?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Yes — all devices used for work have full disk encryption enabled and verified' },
      { letter: 'B', riskPoints: 1, text: 'Practice-owned devices are encrypted but personal devices used for work are not' },
      { letter: 'C', riskPoints: 2, text: 'Some devices are encrypted, others are not' },
      { letter: 'D', riskPoints: 3, text: 'No encryption on work devices' },
    ],
    explanation: 'Full disk encryption means that if a laptop is stolen, the data cannot be accessed without the login credentials. It is one of the most effective protections against breach from device theft.',
    remediation: 'Enable BitLocker (Windows) or FileVault (Mac) on all devices that access PHI. Verify encryption is active — not just enabled — on each device.',
  },

  {
    id: 'Q28', domain: 3, pdfSection: 3, weight: 1.0,
    text: 'Are mobile phones used for work (calls, texts, email, EHR access) secured with strong passwords/PINs and encryption?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Yes — all work-use phones have strong PINs and encryption enabled' },
      { letter: 'B', riskPoints: 1, text: 'Most but not all phones are secured' },
      { letter: 'C', riskPoints: 2, text: 'We rely on staff to secure their own devices without verification' },
      { letter: 'D', riskPoints: 3, text: 'No policy or verification in place' },
    ],
    explanation: 'Modern smartphones are encrypted by default when a PIN is set — but a phone without a PIN has no encryption protection.',
    remediation: 'Require that all phones used for work purposes have a PIN of 6+ digits and auto-lock enabled. Verify compliance periodically.',
  },

  {
    id: 'Q29', domain: 3, pdfSection: 3, weight: 1.0,
    text: 'Is there a process for remotely wiping data from a lost or stolen device that has accessed PHI?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Yes — remote wipe capability is enabled on all devices that access PHI' },
      { letter: 'B', riskPoints: 1, text: 'Available for some devices but not consistently implemented' },
      { letter: 'C', riskPoints: 2, text: 'Not implemented' },
      { letter: 'D', riskPoints: 3, text: 'Not applicable — no mobile device access to PHI', isNA: true },
    ],
    explanation: 'Remote wipe allows the practice to erase all data from a lost device before it can be accessed. Without it, a stolen phone is potentially a breach.',
    remediation: 'Enroll work-use devices in Mobile Device Management (MDM) software that supports remote wipe. Apple Business Manager and Microsoft Intune are common options.',
  },

  {
    id: 'Q30', domain: 3, pdfSection: 3, weight: 1.0,
    text: 'Is physical access to areas where patient data is stored or discussed restricted to authorized staff?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Yes — locked areas, key card or physical key control, visitor log' },
      { letter: 'B', riskPoints: 1, text: 'Some areas are restricted but not consistently enforced' },
      { letter: 'C', riskPoints: 2, text: 'Patient areas are open to non-staff without supervision' },
      { letter: 'D', riskPoints: 3, text: 'No physical access controls' },
    ],
    explanation: 'Physical access to areas where PHI is stored or processed is a HIPAA physical safeguard requirement.',
    remediation: 'Secure server rooms, file storage areas, and workstation areas. Maintain a visitor log. Escort visitors who need access to clinical areas.',
  },

  {
    id: 'Q31', domain: 3, pdfSection: 3, weight: 1.0,
    text: 'Are conversations about patients conducted only in private spaces where they cannot be overheard?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Yes — practice policy enforced, physical layout supports privacy' },
      { letter: 'B', riskPoints: 1, text: 'Usually — but layout sometimes makes it difficult' },
      { letter: 'C', riskPoints: 2, text: 'No formal policy — conversations happen wherever convenient' },
    ],
    explanation: 'Oral disclosures of PHI are fully covered by HIPAA. Overheard conversations in waiting rooms or hallways are violations.',
    remediation: 'Establish a written privacy policy for verbal communication about patients. If your layout makes private conversations difficult, consider white noise machines or physical barriers.',
  },

  {
    id: 'Q32', domain: 3, pdfSection: 3, weight: 1.0,
    text: 'Are workstation screens positioned so that patient information cannot be seen by other patients in waiting rooms or public areas?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Yes — all screens are positioned or protected with privacy filters' },
      { letter: 'B', riskPoints: 1, text: 'Most screens are protected but not all' },
      { letter: 'C', riskPoints: 2, text: 'Screens are visible to anyone in the office' },
      { letter: 'D', riskPoints: 3, text: 'Not evaluated' },
    ],
    explanation: 'Screen visibility is a simple but commonly cited HIPAA issue. A patient in the waiting room should never be able to read another patient\'s information.',
    remediation: 'Reposition screens so they face away from patient areas. Install privacy screen filters (typically under $30) on screens that cannot be repositioned.',
  },

  {
    id: 'Q33', domain: 3, pdfSection: 3, weight: 1.5,
    text: 'What happens to hardware (computers, hard drives, phones, printers) when it is retired or disposed of?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Formal data destruction process: certified wiping or physical destruction, documented' },
      { letter: 'B', riskPoints: 1, text: 'We delete files before disposal but do not formally wipe devices' },
      { letter: 'C', riskPoints: 2, text: 'Devices are donated or discarded without data sanitization' },
      { letter: 'D', riskPoints: 3, text: 'No formal disposal process' },
    ],
    explanation: 'Deleting files does not remove them from a hard drive — they can be recovered with free tools. "HIPAA-compliant" disposal requires either certified overwriting or physical destruction.',
    remediation: 'Use a certified data destruction service for all retired devices, or use DBAN (free) to overwrite hard drives 3+ times. Document each disposal.',
  },

  {
    id: 'Q34', domain: 3, pdfSection: 3, weight: 1.0,
    text: 'Does your practice have security measures for after-hours access (alarm system, camera, keypad entry)?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Yes — multiple layers of physical security after hours' },
      { letter: 'B', riskPoints: 1, text: 'Basic lock only' },
      { letter: 'C', riskPoints: 2, text: 'No after-hours security measures' },
    ],
    explanation: 'After-hours physical access is a significant risk vector. Alarm systems and cameras deter break-ins and document unauthorized access.',
    remediation: 'Install a monitored alarm system and consider security cameras. Maintain a keypad entry log if possible.',
  },

  {
    id: 'Q35', domain: 3, pdfSection: 3, weight: 1.0,
    text: 'Are printers and fax machines that print patient documents secured, and is their output handled appropriately?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Printers in restricted areas, documents retrieved immediately, no PHI left in output tray' },
      { letter: 'B', riskPoints: 1, text: 'Printers are in office areas but generally monitored' },
      { letter: 'C', riskPoints: 2, text: 'Printed documents with PHI are sometimes left unattended in output trays' },
      { letter: 'D', riskPoints: 3, text: 'No policy around printed PHI' },
    ],
    explanation: 'Printed patient records left unattended in a printer tray are a common and preventable privacy violation.',
    remediation: 'Place printers in restricted areas. Establish a policy requiring immediate retrieval of printed PHI. Consider pull-printing features that require staff authentication at the printer.',
  },

  {
    id: 'Q36', domain: 3, pdfSection: 3, weight: 1.0,
    text: 'Does your practice have a workstation use policy defining what staff can and cannot do on computers that access PHI?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Yes — written policy, staff have signed acknowledgment' },
      { letter: 'B', riskPoints: 1, text: 'Expectations communicated verbally but not written' },
      { letter: 'C', riskPoints: 2, text: 'No policy' },
    ],
    explanation: 'Personal browsing, unauthorized software downloads, and unapproved cloud storage can introduce malware or result in PHI being stored in unapproved locations.',
    remediation: 'Create a written Workstation Use Policy. Include prohibitions on personal browsing, unapproved software, and personal cloud storage on clinical workstations.',
  },

  // ─── DOMAIN 4: NETWORK & TRANSMISSION SECURITY (Q37–Q46) ────────────────────

  {
    id: 'Q37', domain: 4, pdfSection: 3, weight: 1.5,
    text: 'Is your office WiFi network secured with a strong password and modern encryption (WPA2 or WPA3)?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Yes — WPA2 or WPA3, strong password, reviewed regularly' },
      { letter: 'B', riskPoints: 1, text: 'Password protected but encryption standard unknown' },
      { letter: 'C', riskPoints: 2, text: 'Network is open or uses outdated WEP encryption' },
      { letter: 'D', riskPoints: 3, text: 'Not applicable — fully remote practice', isNA: true },
    ],
    explanation: 'An open or WEP-encrypted WiFi network can be easily compromised, giving attackers access to every device on the network.',
    remediation: 'Confirm your router uses WPA2 or WPA3. Change the default router password. Change the WiFi password at least annually.',
  },

  {
    id: 'Q38', domain: 4, pdfSection: 3, weight: 1.0,
    text: 'Is there a separate guest WiFi network for patients and visitors that is isolated from your work network?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Yes — completely separate guest network' },
      { letter: 'B', riskPoints: 1, text: 'We ask guests not to use our network but do not have a separate one' },
      { letter: 'C', riskPoints: 2, text: 'Patients and visitors use the same network as staff' },
      { letter: 'D', riskPoints: 3, text: 'Not applicable — no visitor WiFi provided', isNA: true },
    ],
    explanation: 'Guests on the same network as clinical workstations can potentially intercept unencrypted traffic or exploit connected devices.',
    remediation: 'Enable a guest WiFi network on your router (most modern routers support this). This creates a separate, isolated network for visitor use.',
  },

  {
    id: 'Q39', domain: 4, pdfSection: 3, weight: 1.5,
    text: 'Are staff prohibited from accessing patient records over public WiFi (coffee shops, airports) without a VPN?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Yes — written policy, VPN required for any remote access' },
      { letter: 'B', riskPoints: 1, text: 'Discouraged but not formally required' },
      { letter: 'C', riskPoints: 2, text: 'No policy on public WiFi use' },
    ],
    explanation: 'Public WiFi is an untrusted network. Without a VPN, data transmitted over public WiFi can be intercepted by others on the same network.',
    remediation: 'Adopt a written Remote Access Policy requiring VPN use for any access to PHI outside the office. Implement a practice-wide VPN subscription.',
  },

  {
    id: 'Q40', domain: 4, pdfSection: 3, weight: 1.5,
    text: 'Is data encrypted when transmitted between your systems (HTTPS, TLS, secure email)?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Yes — all data in transit is encrypted, verified' },
      { letter: 'B', riskPoints: 1, text: 'Primary systems use encryption but some communications may not' },
      { letter: 'C', riskPoints: 2, text: 'Unsure of encryption status for our transmissions' },
    ],
    explanation: 'Encryption in transit (TLS/HTTPS) protects data from being intercepted as it travels between systems. Unencrypted transmission is a direct HIPAA Technical Safeguard deficiency.',
    remediation: 'Verify that your EHR and all web-based systems use HTTPS. Confirm your email provider uses TLS. Contact vendors if uncertain about encryption status.',
  },

  {
    id: 'Q41', domain: 4, pdfSection: 3, weight: 1.0,
    text: 'Do you send any patient information via standard, unencrypted email or SMS?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Never — all patient communication goes through secure channels' },
      { letter: 'B', riskPoints: 1, text: 'Only scheduling information — no clinical details' },
      { letter: 'C', riskPoints: 2, text: 'Sometimes — including clinical details, via standard email or SMS' },
      { letter: 'D', riskPoints: 3, text: 'Regularly — for convenience' },
    ],
    explanation: 'Standard email and SMS are not encrypted end-to-end. Sending PHI via these channels without patient consent and proper safeguards is a violation.',
    remediation: 'Use a HIPAA-compliant messaging platform for all clinical communication. If patients request email communication, obtain written consent and document the risk acknowledgment.',
  },

  {
    id: 'Q42', domain: 4, pdfSection: 3, weight: 1.0,
    text: 'Does your practice use a firewall to protect your network?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Yes — firewall is in place and maintained' },
      { letter: 'B', riskPoints: 1, text: 'Yes — but last reviewed more than a year ago' },
      { letter: 'C', riskPoints: 2, text: 'Unsure if we have a firewall' },
      { letter: 'D', riskPoints: 3, text: 'No firewall' },
    ],
    explanation: 'A firewall is a basic perimeter security control that blocks unauthorized access to your network.',
    remediation: 'Ensure a firewall is active on your network router. Many modern routers include a built-in firewall. Verify it is enabled and review its settings annually.',
  },

  {
    id: 'Q43', domain: 4, pdfSection: 3, weight: 1.0,
    text: 'Are your network equipment and antivirus/security software kept up to date with automatic updates?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Automatic updates enabled on all devices, verified' },
      { letter: 'B', riskPoints: 1, text: 'Most devices updated but not consistently all' },
      { letter: 'C', riskPoints: 2, text: 'Updates are manual and done irregularly' },
      { letter: 'D', riskPoints: 3, text: 'Systems often run outdated software' },
    ],
    explanation: 'Most ransomware attacks exploit known vulnerabilities that have patches available. Systems running outdated software are significantly more vulnerable.',
    remediation: 'Enable automatic updates on all workstations, servers, and mobile devices. Install reputable antivirus software and keep it updated.',
  },

  {
    id: 'Q44', domain: 4, pdfSection: 3, weight: 1.0,
    text: 'Has your practice had any ransomware, malware, or phishing incidents in the past 3 years?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'No known incidents' },
      { letter: 'B', riskPoints: 1, text: 'One incident — addressed and documented' },
      { letter: 'C', riskPoints: 2, text: 'Multiple incidents' },
      { letter: 'D', riskPoints: 3, text: 'Not sure — we would not necessarily know' },
    ],
    explanation: 'Practices that have experienced incidents before have a higher likelihood of future incidents without specific remediation. Past incidents also inform your current risk profile for this assessment.',
    remediation: 'If you have had incidents, document them and identify what specific controls were added. A history of incidents without remediation significantly elevates your risk profile.',
  },

  {
    id: 'Q45', domain: 4, pdfSection: 3, weight: 1.0,
    text: 'Do you have a process for evaluating new software or services before adopting them to ensure they are HIPAA-compliant?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Yes — formal evaluation process including BAA review before any new vendor is used' },
      { letter: 'B', riskPoints: 1, text: 'We check that they claim HIPAA compliance but do not always get a BAA first' },
      { letter: 'C', riskPoints: 2, text: 'We adopt tools as needed without a formal review' },
    ],
    explanation: 'Shadow IT — staff using unapproved tools — is one of the most common ways PHI ends up in unsecured locations.',
    remediation: 'Create a simple vendor review process: before using any new tool that touches patient data, require a HIPAA assessment and signed BAA.',
  },

  {
    id: 'Q46', domain: 4, pdfSection: 3, weight: 1.0,
    text: 'Do staff receive training on recognizing phishing emails and social engineering attacks?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Yes — formal training at least annually, documented' },
      { letter: 'B', riskPoints: 1, text: 'General awareness communicated but not formal training' },
      { letter: 'C', riskPoints: 2, text: 'No specific training on this topic' },
    ],
    explanation: 'Phishing is the leading cause of healthcare data breaches. A single clicked link can compromise an entire practice. Training reduces susceptibility significantly.',
    remediation: 'Include phishing awareness in your annual HIPAA training. Consider periodic simulated phishing tests to measure staff awareness.',
  },

  // ─── DOMAIN 5: VENDORS & BUSINESS ASSOCIATES (Q47–Q54) ──────────────────────

  {
    id: 'Q47', domain: 5, pdfSection: 2, weight: 1.5,
    text: 'Have you identified all vendors (Business Associates) who create, receive, maintain, or transmit PHI on your behalf?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Yes — complete written list maintained and updated regularly' },
      { letter: 'B', riskPoints: 1, text: 'We know the major ones but may have missed some' },
      { letter: 'C', riskPoints: 2, text: 'We have not formally identified all Business Associates' },
    ],
    explanation: 'You cannot protect what you have not identified. A complete BA inventory is the foundation of your vendor compliance program.',
    remediation: 'Create a complete written inventory of all vendors who touch PHI. Common ones include: EHR, billing, telehealth, scheduling, email, cloud storage, transcription, and IT support.',
  },

  {
    id: 'Q48', domain: 5, pdfSection: 2, weight: 1.5,
    text: 'Do you have a signed Business Associate Agreement (BAA) with your primary EHR vendor?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Yes — signed BAA on file' },
      { letter: 'B', riskPoints: 1, text: 'We believe so but cannot locate the document' },
      { letter: 'C', riskPoints: 2, text: 'No BAA with EHR vendor' },
      { letter: 'D', riskPoints: 3, text: 'We use a tool that does not offer a BAA' },
    ],
    explanation: 'A BAA with your EHR vendor is required by law. Operating without one is a direct HIPAA violation regardless of how secure the platform is.',
    remediation: 'Locate or re-execute your BAA with your EHR vendor immediately. Keep the signed document in a secure, accessible location.',
  },

  {
    id: 'Q49', domain: 5, pdfSection: 2, weight: 1.5,
    text: 'Do you have signed BAAs with ALL vendors who access PHI — not only your EHR? (telehealth, billing, scheduling, email, cloud storage, etc.)',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Yes — signed BAA with every vendor who touches PHI, all documents on file' },
      { letter: 'B', riskPoints: 1, text: 'Most vendors have BAAs but some may be missing' },
      { letter: 'C', riskPoints: 2, text: 'We only have a BAA with our EHR' },
      { letter: 'D', riskPoints: 3, text: 'We have not collected BAAs' },
    ],
    explanation: 'Every vendor who handles your patients\' data needs a BAA — not just the EHR. Email providers, billing software, telehealth platforms, and cloud storage all qualify.',
    remediation: 'For every vendor in your BA inventory, obtain a signed BAA. Most major platforms offer these for free. Store copies in your Evidence Center.',
  },

  {
    id: 'Q50', domain: 5, pdfSection: 2, weight: 1.0,
    text: 'Do you track BAA expiration dates and renewal requirements?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Yes — formal tracking system with alerts before expiration' },
      { letter: 'B', riskPoints: 1, text: 'We know generally when BAAs expire but lack a formal system' },
      { letter: 'C', riskPoints: 2, text: 'We do not track BAA expiration dates' },
    ],
    explanation: 'An expired BAA is legally the same as no BAA. Without proactive tracking, you may not know your coverage has lapsed until an audit reveals it.',
    remediation: 'Track BAA expiration dates with calendar reminders at 90 days before expiration. HIPAA Hub\'s BAA Tracker provides this automatically.',
  },

  {
    id: 'Q51', domain: 5, pdfSection: 2, weight: 1.5,
    text: 'When you adopt a new vendor or service that will access PHI, do you require a signed BAA before sharing any data?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Yes — always, no exceptions' },
      { letter: 'B', riskPoints: 1, text: 'Usually — but sometimes we start using a service before formalizing the BAA' },
      { letter: 'C', riskPoints: 2, text: 'No consistent process' },
    ],
    explanation: 'Using a service before signing a BAA — even for one session — is a HIPAA violation. The BAA must be in place before any PHI is shared.',
    remediation: 'Make BAA execution a required step in your vendor onboarding process. No PHI should be shared with a new vendor until the BAA is signed.',
  },

  {
    id: 'Q52', domain: 5, pdfSection: 2, weight: 1.0,
    text: 'Do you review vendor security practices before engaging them (SOC 2 reports, HIPAA certifications, security questionnaires)?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Yes — formal vendor security review for all vendors handling PHI' },
      { letter: 'B', riskPoints: 1, text: 'We check that they claim HIPAA compliance but do not verify' },
      { letter: 'C', riskPoints: 2, text: 'We do not evaluate vendor security practices' },
    ],
    explanation: 'A vendor claiming HIPAA compliance is not the same as being HIPAA compliant. Their breach becomes your breach.',
    remediation: 'Ask new vendors for their SOC 2 report or HIPAA compliance documentation. At minimum, review their security practices before sharing PHI.',
  },

  {
    id: 'Q53', domain: 5, pdfSection: 2, weight: 1.0,
    text: 'When you terminate a vendor relationship, do you require them to return or destroy your PHI?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Yes — this is in our BAA and we confirm compliance upon termination' },
      { letter: 'B', riskPoints: 1, text: 'We assume vendors handle this correctly' },
      { letter: 'C', riskPoints: 2, text: 'We have not addressed data return/destruction with vendors' },
    ],
    explanation: 'Your obligation to protect patient data extends to your vendors. When you stop using a vendor, they should no longer hold your patients\' data.',
    remediation: 'Include data return/destruction requirements in all BAAs. Upon vendor termination, formally request and document confirmation that your PHI has been destroyed or returned.',
  },

  {
    id: 'Q54', domain: 5, pdfSection: 2, weight: 1.0,
    text: 'Have any of your vendors experienced a breach that may have exposed your patient data in the past 3 years?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'No known vendor breaches' },
      { letter: 'B', riskPoints: 1, text: 'Yes — one incident, handled and documented' },
      { letter: 'C', riskPoints: 2, text: 'Multiple incidents' },
      { letter: 'D', riskPoints: 3, text: 'We would not necessarily know if they did' },
    ],
    explanation: 'If a vendor has your patient data and experiences a breach, you are potentially liable. Vendor breach notification is a key requirement in your BAA.',
    remediation: 'Add a breach notification requirement to all BAAs specifying that vendors must notify you within 60 days of discovering a breach involving your PHI.',
  },

  // ─── DOMAIN 6: POLICIES, TRAINING & GOVERNANCE (Q55–Q68) ────────────────────

  {
    id: 'Q55', domain: 6, pdfSection: 4, weight: 1.5,
    text: 'Has your practice designated a Privacy Officer responsible for HIPAA compliance?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Yes — named individual, role documented, staff are aware of who it is' },
      { letter: 'B', riskPoints: 1, text: 'Someone informally handles compliance but it is not a formal designation' },
      { letter: 'C', riskPoints: 2, text: 'No designated Privacy Officer' },
    ],
    explanation: 'HIPAA requires every covered entity to designate a Privacy Officer. For a solo practice, this is typically the therapist themselves. The designation must be documented.',
    remediation: 'Formally designate a Privacy Officer by name and document this in writing. Communicate the designation to all staff. For solo practices, this is typically the clinician.',
  },

  {
    id: 'Q56', domain: 6, pdfSection: 4, weight: 1.5,
    text: 'Does your practice have all 9 required HIPAA policies in written, current form?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Yes — all 9 policies exist, are dated, version-controlled, and reviewed annually' },
      { letter: 'B', riskPoints: 1, text: 'Some policies exist but not the complete set' },
      { letter: 'C', riskPoints: 2, text: 'We have general policies but they are outdated or undated' },
      { letter: 'D', riskPoints: 3, text: 'No formal written policies' },
    ],
    explanation: 'The 9 required HIPAA policies include: Privacy Policy, Security Policy, Breach Response Plan, Sanctions Policy, Workforce Training Policy, Access Control Policy, Incident Response, Business Associate Policy, and Retention Policy.',
    remediation: 'Implement all required HIPAA policies using current templates. HIPAA Hub\'s Policies & Documents section provides all 9 required policies.',
  },

  {
    id: 'Q57', domain: 6, pdfSection: 4, weight: 1.5,
    text: 'Have all current staff received formal HIPAA training since joining the practice?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Yes — documented training with completion records for every staff member' },
      { letter: 'B', riskPoints: 1, text: 'Training has been provided but records are inconsistent' },
      { letter: 'C', riskPoints: 2, text: 'Training was verbal only, not documented' },
      { letter: 'D', riskPoints: 3, text: 'No formal HIPAA training for current staff' },
    ],
    explanation: 'Workforce training is a required administrative safeguard. OCR expects documented proof that every staff member has been trained — not just told about HIPAA.',
    remediation: 'Provide formal HIPAA training to all staff members and document completion. HIPAA Hub\'s Staff Training module generates OCR-defensible completion certificates.',
  },

  {
    id: 'Q58', domain: 6, pdfSection: 4, weight: 1.5,
    text: 'Is HIPAA training conducted annually for all staff?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Yes — annual training with documented completion records' },
      { letter: 'B', riskPoints: 1, text: 'Training is repeated but not consistently annual' },
      { letter: 'C', riskPoints: 2, text: 'Training was only done once at onboarding' },
      { letter: 'D', riskPoints: 3, text: 'No recurring training' },
    ],
    explanation: 'HIPAA training must be repeated whenever there are relevant changes to policies, and at minimum periodically. Annual training is the accepted industry standard.',
    remediation: 'Schedule annual HIPAA training for all staff and add it to your compliance calendar. Track completion and follow up with any staff who miss the deadline.',
  },

  {
    id: 'Q59', domain: 6, pdfSection: 4, weight: 1.0,
    text: 'Are there sanctions (consequences) for staff who violate HIPAA policies, and is this documented in writing?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Yes — written sanctions policy, staff are aware of it, consequences applied consistently' },
      { letter: 'B', riskPoints: 1, text: 'Policy exists but is not consistently applied' },
      { letter: 'C', riskPoints: 2, text: 'Consequences are implied but not formally documented' },
      { letter: 'D', riskPoints: 3, text: 'No sanctions policy' },
    ],
    explanation: 'A Sanctions Policy is a required HIPAA administrative safeguard. Staff must know there are consequences for violations — this deters non-compliance.',
    remediation: 'Adopt a written Sanctions Policy that outlines consequences for HIPAA violations by severity. Communicate it during onboarding and annual training.',
  },

  {
    id: 'Q60', domain: 6, pdfSection: 4, weight: 1.5,
    text: 'Does your practice have a written Breach Response Plan describing what to do when a breach occurs?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Yes — written plan, Privacy Officer designated, timelines documented, reviewed in the past year' },
      { letter: 'B', riskPoints: 1, text: 'Plan exists but is outdated or incomplete' },
      { letter: 'C', riskPoints: 2, text: 'General awareness but no written plan' },
      { letter: 'D', riskPoints: 3, text: 'No breach response plan' },
    ],
    explanation: 'You cannot respond effectively to a breach without a plan. OCR expects practices to have documented procedures before an incident occurs — not to figure it out afterward.',
    remediation: 'Create and activate a Breach Response Plan using HIPAA Hub\'s Breach Notifications → Response Plan section. Once activated, it satisfies this requirement.',
  },

  {
    id: 'Q61', domain: 6, pdfSection: 4, weight: 1.5,
    text: 'Has your practice ever conducted a formal Security Risk Assessment before?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Yes — within the past 12 months, documented' },
      { letter: 'B', riskPoints: 1, text: 'Yes — but more than 12 months ago' },
      { letter: 'C', riskPoints: 2, text: 'Never formally completed one' },
      { letter: 'D', riskPoints: 3, text: 'Unsure' },
    ],
    explanation: 'The Security Risk Assessment is the single most commonly cited deficiency in OCR enforcement actions. It is a mandatory requirement, not optional.',
    remediation: 'Complete this risk assessment annually. Store the completed assessment and PDF export in your Evidence Center.',
  },

  {
    id: 'Q62', domain: 6, pdfSection: 4, weight: 1.0,
    text: 'Has your practice implemented a Risk Management Plan to address vulnerabilities identified in previous assessments?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Yes — written risk management plan with tracked remediation items' },
      { letter: 'B', riskPoints: 1, text: 'We addressed some items informally but nothing documented' },
      { letter: 'C', riskPoints: 2, text: 'No risk management plan' },
      { letter: 'D', riskPoints: 3, text: 'Not applicable — first assessment', isNA: true },
    ],
    explanation: 'Completing a risk assessment without acting on its findings provides almost no legal protection. OCR expects to see that identified risks were actually remediated.',
    remediation: 'Use your assessment findings to create a Risk Management Plan with prioritized action items, responsible parties, and target dates. Track progress in HIPAA Hub\'s Action Items.',
  },

  {
    id: 'Q63', domain: 6, pdfSection: 4, weight: 1.0,
    text: 'Does your practice have a contingency plan for continuing operations if your main EHR or systems become unavailable?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Written plan covering: data backup, emergency access, and recovery procedures' },
      { letter: 'B', riskPoints: 1, text: 'We have thought about it but nothing is written' },
      { letter: 'C', riskPoints: 2, text: 'No contingency plan' },
    ],
    explanation: 'Contingency planning is a required HIPAA administrative safeguard. It covers data backup, disaster recovery, and emergency access to PHI.',
    remediation: 'Document a contingency plan that covers at minimum: what to do if the EHR is unavailable, how to access emergency patient information, and how to restore systems from backup.',
  },

  {
    id: 'Q64', domain: 6, pdfSection: 4, weight: 1.0,
    text: 'Are HIPAA policies reviewed and updated at least annually?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Yes — formal annual review, documented with dates and version numbers' },
      { letter: 'B', riskPoints: 1, text: 'Reviewed occasionally but not on a set schedule' },
      { letter: 'C', riskPoints: 2, text: 'Policies have not been reviewed since creation' },
    ],
    explanation: 'Outdated policies are nearly as problematic as no policies. If your technology, staff, or workflows have changed and your policies have not, you are not compliant.',
    remediation: 'Schedule an annual policy review. Document the review date and any changes made. Add to your compliance calendar.',
  },

  {
    id: 'Q65', domain: 6, pdfSection: 4, weight: 1.0,
    text: 'Does your practice provide patients with a current Notice of Privacy Practices (NPP) and obtain signed acknowledgment?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Yes — current NPP provided at first appointment, signed acknowledgment obtained and retained' },
      { letter: 'B', riskPoints: 1, text: 'NPP provided but acknowledgment process is inconsistent' },
      { letter: 'C', riskPoints: 2, text: 'NPP exists but is not current (outdated)' },
      { letter: 'D', riskPoints: 3, text: 'No NPP or acknowledgment process' },
    ],
    explanation: 'Providing a current NPP and obtaining patient acknowledgment is one of the most basic HIPAA Privacy Rule requirements.',
    remediation: 'Ensure your NPP is current and updated whenever privacy practices change. Obtain and file signed acknowledgments from patients at first contact.',
  },

  {
    id: 'Q66', domain: 6, pdfSection: 4, weight: 1.0,
    text: 'Are staff trained on how to respond to patient requests to access or amend their records, and does the practice have a documented process?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Yes — written process, staff trained, 30-day response timeline followed' },
      { letter: 'B', riskPoints: 1, text: 'We handle requests as they come without a formal documented process' },
      { letter: 'C', riskPoints: 2, text: 'No formal process' },
    ],
    explanation: 'Patients have a legal right to access and amend their records. HIPAA requires a response within 30 days. Denial of this right is one of the most common patient-reported HIPAA complaints.',
    remediation: 'Adopt a written patient rights process that covers: access requests, amendments, and accounting of disclosures. Train all staff on the 30-day response requirement.',
  },

  {
    id: 'Q67', domain: 6, pdfSection: 4, weight: 1.0,
    text: 'Does your practice log and track patient record access requests, accounting of disclosures, and right-to-access requests?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Yes — formal tracking in all required areas' },
      { letter: 'B', riskPoints: 1, text: 'Partial tracking' },
      { letter: 'C', riskPoints: 2, text: 'No formal tracking' },
    ],
    explanation: 'HIPAA requires an accounting of disclosures — a log of when and to whom PHI was disclosed for purposes other than treatment, payment, or operations.',
    remediation: 'Implement a simple log (even a spreadsheet) to track: patient access requests, record amendments, and all disclosures beyond TPO. Review quarterly.',
  },

  {
    id: 'Q68', domain: 6, pdfSection: 4, weight: 1.0,
    text: 'Overall, how would you characterize your practice\'s current approach to HIPAA compliance?',
    options: [
      { letter: 'A', riskPoints: 0, text: 'Proactive — we actively manage compliance, conduct regular reviews, and address issues before they become problems' },
      { letter: 'B', riskPoints: 1, text: 'Reactive — we respond to issues when they arise but do not actively manage compliance' },
      { letter: 'C', riskPoints: 2, text: 'Minimal — we do what is absolutely necessary' },
      { letter: 'D', riskPoints: 3, text: 'Unaware — we have not previously prioritized this' },
    ],
    explanation: 'Self-awareness is the first step. The goal of this assessment is not to find fault but to identify where your energy and resources should be directed.',
    remediation: 'Use the findings from this assessment to build a structured compliance program. Schedule quarterly reviews and assign responsibility for each action item.',
  },
];

// Lookup helpers
export const QUESTION_MAP = new Map(QUESTIONS.map(q => [q.id, q]));

export function getQuestionsForDomain(domain: number): Question[] {
  return QUESTIONS.filter(q => q.domain === domain);
}

export function getDomainInfo(domain: number) {
  return DOMAINS.find(d => d.id === domain)!;
}
