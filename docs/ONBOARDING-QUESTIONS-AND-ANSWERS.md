# HIPAA Guard — Onboarding Questions and Answers

This document contains all questions from the onboarding flow and their possible answer options.

---

## Table of Contents

1. [Organization Information](#organization-information)
2. [Risk Assessment Questions](#risk-assessment-questions)
   - [Administrative Safeguards](#administrative-safeguards)
   - [Physical Safeguards](#physical-safeguards)
   - [Technical Safeguards](#technical-safeguards)
3. [Staff Members](#staff-members)
4. [Compliance Commitment](#compliance-commitment)

---

## Organization Information

**Page:** `/onboarding/organization`

### Organization Identity

| Field | Type | Required | Options / Description |
|-------|------|----------|----------------------|
| **Clinic Name** | Text Input | ✅ Yes | Free text (e.g., "Downtown Medical Clinic") |
| **Legal Organization Name** | Text Input | ✅ Yes | Free text (legal name as registered) |
| **DBA (Doing Business As)** | Text Input | ❌ No | Free text (optional) |
| **Practice Type** | Select | ✅ Yes | • Medical<br>• Dental<br>• Mental Health<br>• Therapy |
| **State (US)** | Select | ✅ Yes | All 50 US states + DC (AL, AK, AZ, AR, CA, CO, CT, DE, FL, GA, HI, ID, IL, IN, IA, KS, KY, LA, ME, MD, MA, MI, MN, MS, MO, MT, NE, NV, NH, NJ, NM, NY, NC, ND, OH, OK, OR, PA, RI, SC, SD, TN, TX, UT, VT, VA, WA, WV, WI, WY, DC) |

### Primary Business Address

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **Street Address** | Text Input | ✅ Yes | Free text |
| **City** | Text Input | ✅ Yes | Free text |
| **State** | Select | ✅ Yes | All 50 US states + DC |
| **ZIP Code** | Text Input | ✅ Yes | Free text |

### Security Officer

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **Full Name** | Text Input | ✅ Yes | Free text |
| **Email** | Email Input | ✅ Yes | Valid email address |
| **Role / Title** | Text Input | ✅ Yes | Free text |

### Privacy Officer

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **Full Name** | Text Input | ✅ Yes | Free text |
| **Email** | Email Input | ✅ Yes | Valid email address |
| **Role / Title** | Text Input | ✅ Yes | Free text<br>*Note: Can be the same person as Security Officer*

### Organization Structure

| Field | Type | Required | Options / Description |
|-------|------|----------|----------------------|
| **Number of Employees** | Slider | ✅ Yes | Range: 1-100+ employees |
| **Do you have employees?** | Switch (Toggle) | ✅ Yes | • Yes (true)<br>• No (false) |
| **Uses Contractors / Vendors with PHI?** | Switch (Toggle) | ❌ No | • Yes (true)<br>• No (false) |

### Technology

| Field | Type | Required | Options / Description |
|-------|------|----------|----------------------|
| **Do you store or process PHI electronically?** | Switch (Toggle) | ✅ Yes | • Yes (true)<br>• No (false)<br>*Note: Almost always Yes for modern practices* |
| **Do you use cloud services to store PHI?** | Switch (Toggle) | ❌ No | • Yes (true)<br>• No (false)<br>*Note: Impacts Security Policy and BAA section* |

---

## Risk Assessment Questions

**Page:** `/onboarding/risk-assessment`

Total: **32 questions** organized into 3 categories.

---

### Administrative Safeguards

#### 1. Security Officer Designation

**Question:** Have you designated a Security Officer responsible for HIPAA compliance?

**Options:**
- `yes` - Yes, formally designated (Risk Score: 0)
- `informal` - Informal assignment (Risk Score: 2)
- `no` - No (Risk Score: 5)

**Help Text:** HIPAA requires a designated Security Officer to oversee compliance.

---

#### 2. Security Policy Document

**Question:** Do you have a written HIPAA Security Policy document?

**Options:**
- `yes-comprehensive` - Yes, comprehensive and current (Risk Score: 0)
- `yes-outdated` - Yes, but outdated (>1 year old) (Risk Score: 2)
- `partial` - Partial/informal policies (Risk Score: 4)
- `no` - No written policy (Risk Score: 5)

---

#### 3. Privacy Policy

**Question:** Do you have a HIPAA Privacy Policy that informs patients of their rights?

**Options:**
- `yes` - Yes (Risk Score: 0)
- `no` - No (Risk Score: 5)

---

#### 4. Workforce Training

**Question:** Have all workforce members completed HIPAA security awareness training?

**Options:**
- `yes-all` - Yes, all employees trained (Risk Score: 0)
- `yes-some` - Some employees trained (Risk Score: 3)
- `no` - No training provided (Risk Score: 5)

---

#### 5. Workforce Clearance

**Question:** Do you perform background checks or verify credentials before granting access to PHI?

**Options:**
- `yes-all` - Yes, for all staff (Risk Score: 0)
- `yes-some` - Yes, for some positions (Risk Score: 2)
- `no` - No (Risk Score: 4)

---

#### 6. Access Management

**Question:** Do you have procedures to authorize and supervise workforce access to PHI?

**Options:**
- `yes-formal` - Yes, formal procedures documented (Risk Score: 0)
- `yes-informal` - Yes, informal procedures (Risk Score: 2)
- `no` - No procedures (Risk Score: 5)

---

#### 7. Access Review

**Question:** Do you regularly review and update workforce access to PHI (e.g., when employees leave)?

**Options:**
- `yes-regular` - Yes, regularly reviewed (Risk Score: 0)
- `yes-occasional` - Yes, but only occasionally (Risk Score: 2)
- `no` - No review process (Risk Score: 5)

---

#### 8. Contingency Plan

**Question:** Do you have a Contingency Plan for data backup and disaster recovery?

**Options:**
- `yes-tested` - Yes, documented and tested (Risk Score: 0)
- `yes-untested` - Yes, but not tested (Risk Score: 2)
- `no` - No contingency plan (Risk Score: 5)

---

#### 9. Incident Response Plan

**Question:** Do you have a documented Incident Response Plan for security incidents and breaches?

**Options:**
- `yes` - Yes (Risk Score: 0)
- `no` - No (Risk Score: 5)

---

#### 10. Breach History

**Question:** Have you experienced a security incident or data breach involving PHI in the past 24 months?

**Options:**
- `no` - No known incidents (Risk Score: 0)
- `yes-reported` - Yes, reported and documented (Risk Score: 1)
- `yes-unreported` - Yes, not formally reported (Risk Score: 5)

**Help Text:** OCR reviews breach history during audits. This information is critical for risk assessment.

---

#### 11. Business Associate Agreements

**Question:** Do you have Business Associate Agreements (BAAs) with all vendors who handle PHI?

**Options:**
- `yes-all` - Yes, all vendors have BAAs (Risk Score: 0)
- `yes-some` - Some vendors have BAAs (Risk Score: 3)
- `no` - No BAAs in place (Risk Score: 5)

---

#### 12. BAA Monitoring

**Question:** Do you monitor and ensure your Business Associates comply with their BAAs?

**Options:**
- `yes` - Yes, regularly monitored (Risk Score: 0)
- `no` - No monitoring (Risk Score: 3)

**Skip Condition:** This question is skipped if question 11 (Business Associate Agreements) is answered `no`.

---

#### 13. Risk Assessment Conducted

**Question:** Have you conducted a formal Security Risk Assessment in the past 12 months?

**Options:**
- `yes-current` - Yes, within past year (Risk Score: 0)
- `yes-old` - Yes, but over a year ago (Risk Score: 2)
- `no` - No formal assessment (Risk Score: 4)

---

### Physical Safeguards

#### 14. Facility Access Controls

**Question:** Do you have physical controls to limit access to areas where PHI is stored?

**Options:**
- `yes-controlled` - Yes, access controlled (locks, badges, etc.) (Risk Score: 0)
- `yes-partial` - Some areas controlled (Risk Score: 2)
- `no` - No physical access controls (Risk Score: 5)

---

#### 15. Workstation Security

**Question:** Are workstations that access PHI secured and restricted from unauthorized access?

**Options:**
- `yes-secured` - Yes, all workstations secured (Risk Score: 0)
- `yes-some` - Some workstations secured (Risk Score: 2)
- `no` - No workstation security (Risk Score: 5)

---

#### 16. Device Controls

**Question:** Do you have controls for the receipt and removal of hardware and electronic media containing PHI?

**Options:**
- `yes` - Yes, documented procedures (Risk Score: 0)
- `no` - No controls (Risk Score: 4)

---

#### 17. Media Disposal

**Question:** Do you have procedures for secure disposal of PHI (paper and electronic media)?

**Options:**
- `yes-secure` - Yes, secure disposal procedures (Risk Score: 0)
- `yes-informal` - Yes, but informal (Risk Score: 2)
- `no` - No disposal procedures (Risk Score: 5)

---

### Technical Safeguards

#### 18. Access Control (User IDs)

**Question:** Do you have unique user IDs and authentication controls for systems accessing PHI?

**Options:**
- `yes-unique` - Yes, unique IDs for all users (Risk Score: 0)
- `yes-shared` - Yes, but some shared accounts (Risk Score: 3)
- `no` - No access controls (Risk Score: 5)

---

#### 19. Emergency Access

**Question:** Do you have procedures for emergency access to PHI when needed?

**Options:**
- `yes-documented` - Yes, documented procedures (Risk Score: 0)
- `yes-informal` - Yes, but informal (Risk Score: 2)
- `no` - No emergency access procedures (Risk Score: 4)

---

#### 20. Automatic Logoff

**Question:** Do your systems automatically log off users after periods of inactivity?

**Options:**
- `yes-all` - Yes, on all systems (Risk Score: 0)
- `yes-some` - Yes, on some systems (Risk Score: 2)
- `no` - No automatic logoff (Risk Score: 4)

---

#### 21. Encryption at Rest

**Question:** Is electronic Protected Health Information (ePHI) encrypted when stored (at rest)?

**Options:**
- `yes-all` - Yes, all ePHI encrypted (Risk Score: 0)
- `yes-some` - Some ePHI encrypted (Risk Score: 3)
- `no` - No encryption at rest (Risk Score: 5)

---

#### 22. Encryption in Transit

**Question:** Is ePHI encrypted when transmitted over networks (email, cloud, etc.)?

**Options:**
- `yes-all` - Yes, all transmissions encrypted (Risk Score: 0)
- `yes-some` - Some transmissions encrypted (Risk Score: 3)
- `no` - No encryption in transit (Risk Score: 5)

---

#### 23. Integrity Controls

**Question:** Do you have controls to ensure ePHI is not improperly altered or destroyed?

**Options:**
- `yes` - Yes, integrity controls in place (Risk Score: 0)
- `no` - No integrity controls (Risk Score: 4)

---

#### 24. Audit Logs

**Question:** Do you maintain audit logs of who accessed PHI and when?

**Options:**
- `yes-comprehensive` - Yes, comprehensive logging (Risk Score: 0)
- `yes-basic` - Yes, basic logging (Risk Score: 2)
- `no` - No audit logs (Risk Score: 5)

---

#### 25. Cloud Services Usage

**Question:** Do you use cloud services (Google Drive, Dropbox, AWS, Azure, etc.) to store or process PHI?

**Options:**
- `yes` - Yes (Risk Score: 0)
- `no` - No (Risk Score: 0)

**Note:** This question does not affect risk score directly, but determines if question 26 is shown.

---

#### 26. Cloud BAA Compliance

**Question:** Do your cloud service providers have Business Associate Agreements and HIPAA-compliant configurations?

**Options:**
- `yes-all` - Yes, all providers compliant (Risk Score: 0)
- `yes-some` - Some providers compliant (Risk Score: 3)
- `no` - No BAAs or compliance verification (Risk Score: 5)

**Skip Condition:** This question is skipped if question 25 (Cloud Services Usage) is answered `no`.

---

#### 27. Email Security

**Question:** Do you use encrypted email when sending PHI to patients or other providers?

**Options:**
- `yes-always` - Yes, always encrypted (Risk Score: 0)
- `yes-sometimes` - Sometimes encrypted (Risk Score: 3)
- `no` - No email encryption (Risk Score: 5)

---

#### 28. Password Policy

**Question:** Do you enforce strong password policies (complexity, expiration, etc.)?

**Options:**
- `yes-enforced` - Yes, enforced by system (Risk Score: 0)
- `yes-policy` - Yes, policy but not enforced (Risk Score: 2)
- `no` - No password policy (Risk Score: 4)

---

#### 29. Backup Verification

**Question:** Do you regularly test your data backup and recovery procedures?

**Options:**
- `yes-regular` - Yes, regularly tested (Risk Score: 0)
- `yes-occasional` - Yes, occasionally tested (Risk Score: 2)
- `no` - No testing (Risk Score: 4)

---

## Staff Members

**Page:** `/onboarding/staff`

### Initial Question

**Question:** Do you have employees?

**Options:**
- **Yes, add employees** → Proceeds to staff management interface
- **No employees / Skip for now** → Skips staff addition and proceeds to commitment page

### Staff Management (if "Yes" selected)

| Field | Type | Required | Options / Description |
|-------|------|----------|----------------------|
| **Email Address** | Email Input | ✅ Yes | Valid email address |
| **Role** | Select | ✅ Yes | • Staff<br>• Admin |

**Actions:**
- Add staff member (button with plus icon)
- Remove staff member (X button on each staff card)

**Note:** Staff members can be added later from the dashboard. This step is optional during onboarding.

---

## Compliance Commitment

**Page:** `/onboarding/commitment`

### Commitment Statement

**Question:** I acknowledge and accept this commitment to ongoing HIPAA compliance.

**Options:**
- **Checkbox** - Must be checked to proceed

**Commitment Text:**
> "I understand that HIPAA compliance is an ongoing responsibility and commit to maintaining the safeguards identified in this assessment."

**Why this matters:**
- Demonstrates good faith effort in compliance
- Provides legal protection during audits
- Shows commitment to patient privacy and security

**Action Button:**
- **"Activate Compliance Dashboard"** (enabled only when checkbox is checked)

---

## Summary

### Total Questions by Category

- **Organization Information:** 15 fields (11 required, 4 optional)
- **Risk Assessment:** 32 questions
  - Administrative Safeguards: 13 questions
  - Physical Safeguards: 4 questions
  - Technical Safeguards: 15 questions
- **Staff Members:** 1 initial question + optional staff addition
- **Compliance Commitment:** 1 checkbox confirmation

### Risk Score Calculation

Each risk assessment question has a **risk score** (0-5) associated with each answer option:
- **0** = Low risk / Compliant
- **1-2** = Medium risk / Needs attention
- **3-4** = High risk / Non-compliant
- **5** = Critical risk / Major non-compliance

The total risk score is calculated and used to determine:
- Overall risk level (Low / Medium / High)
- Compliance status (Compliant / Attention Needed / Non-Compliant)
- Action items priority

---

**Document Version:** 1.0  
**Last Updated:** 2024-12-20  
**Maintained by:** HIPAA Guard Development Team
