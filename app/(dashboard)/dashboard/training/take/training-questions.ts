// HIPAA Fundamentals for Healthcare Staff — 14 questions across 4 sections
// This module is OCR-defensible per 45 CFR 164.530(b) and 45 CFR 164.308(a)(5)

export interface TrainingQuestion {
  id: string;
  sectionId: string;
  question: string;
  options: string[];
  correctAnswer: number; // 0-based index
  explanation: string;
}

export function getQuestionsForSection(sectionId: string): TrainingQuestion[] {
  return TRAINING_QUESTIONS.filter(q => q.sectionId === sectionId);
}

export const TRAINING_QUESTIONS: TrainingQuestion[] = [

  // ── Section A: What is PHI ──────────────────────────────────────────────────

  {
    id: 'A-01',
    sectionId: 'phi',
    question:
      'A colleague asks you the name of a patient you saw yesterday. This information is:',
    options: [
      'PHI only if you also share their diagnosis',
      'PHI — a patient\'s name alone, when linked to the fact they are a patient, is PHI',
      'Not PHI — names are public information',
      'PHI only if shared outside the building',
    ],
    correctAnswer: 1,
    explanation:
      'Under HIPAA, a patient\'s name combined with the fact that they received services at your practice qualifies as PHI. Even appointment confirmations that include a patient\'s name must be handled carefully.',
  },
  {
    id: 'A-02',
    sectionId: 'phi',
    question: 'Which of the following is an example of PHI?',
    options: [
      'A list of staff names and their work schedules',
      'A patient\'s name, date of birth, and diagnosis',
      'General statistics about anxiety rates in the US',
      'The name of a medication with no patient attached',
    ],
    correctAnswer: 1,
    explanation:
      'PHI requires both an identifier (like name or date of birth) AND health-related information (like a diagnosis). Option B has both. General statistics or medication names without patient identifiers are not PHI.',
  },
  {
    id: 'A-03',
    sectionId: 'phi',
    question:
      'You overhear a colleague discussing a patient\'s treatment plan loudly in the waiting room. This is:',
    options: [
      'Acceptable if the patient is not present',
      'A potential HIPAA violation — PHI should only be discussed where it cannot be overheard by others',
      'Acceptable because it is verbal, not written',
      'Only a problem if the patient files a complaint',
    ],
    correctAnswer: 1,
    explanation:
      'HIPAA\'s Minimum Necessary standard requires that PHI disclosures happen only to those who need the information and in settings where privacy can be maintained. Verbal disclosures are fully covered by HIPAA — the medium does not matter.',
  },
  {
    id: 'A-04',
    sectionId: 'phi',
    question:
      'A patient calls asking about their upcoming appointment. You can confirm the appointment to:',
    options: [
      'Anyone who calls and knows the patient\'s name',
      'The patient themselves, after verifying their identity',
      'The patient\'s spouse without patient authorization',
      'The patient\'s employer if they request it',
    ],
    correctAnswer: 1,
    explanation:
      'You can share information with the patient directly after verifying who they are. Sharing with spouses, family members, or employers requires either explicit written patient authorization or the patient to be present and verbally consent.',
  },

  // ── Section B: How to Access and Handle Data Securely ──────────────────────

  {
    id: 'B-01',
    sectionId: 'secure-access',
    question:
      'You need to step away from your desk for 5 minutes. You should:',
    options: [
      'Leave your computer as-is since you\'ll be right back',
      'Lock your screen before leaving',
      'Close the patient record but leave the computer unlocked',
      'Ask a colleague to watch your screen',
    ],
    correctAnswer: 1,
    explanation:
      'Even a brief absence is enough time for unauthorized access. Locking your screen takes one second (Windows+L or CMD+Control+Q on Mac) and is required every time you leave your workstation — without exception.',
  },
  {
    id: 'B-02',
    sectionId: 'secure-access',
    question:
      'A colleague asks to use your login to quickly check a patient record because they forgot their password. You should:',
    options: [
      'Help them out since it\'s an emergency',
      'Refuse and direct them to reset their own password',
      'Log in for them but watch what they access',
      'It\'s fine if a supervisor approves it verbally',
    ],
    correctAnswer: 1,
    explanation:
      'HIPAA requires unique user identification. Sharing login credentials makes it impossible to track who accessed what and when — which destroys the audit trail. Your credentials are your sole responsibility, regardless of who asks.',
  },
  {
    id: 'B-03',
    sectionId: 'secure-access',
    question:
      'A patient\'s family member calls asking for the patient\'s appointment details. The patient is an adult. You should:',
    options: [
      'Provide the information if they sound like family',
      'Provide the information only if the patient has signed an authorization for that person',
      'Refuse to confirm the patient is even a client',
      'Provide the information as long as you don\'t mention the diagnosis',
    ],
    correctAnswer: 1,
    explanation:
      'Adult patients control their own health information. Without written authorization from the patient designating that person as someone who may receive information, you cannot share appointment details — regardless of the relationship.',
  },
  {
    id: 'B-04',
    sectionId: 'secure-access',
    question:
      'You receive an email that appears to be from your EHR vendor asking you to click a link and verify your login credentials. You should:',
    options: [
      'Click the link and verify — vendors need access',
      'Forward it to your supervisor to review first',
      'Delete it without telling anyone',
      'Reply with your credentials if the email looks official',
    ],
    correctAnswer: 1,
    explanation:
      'This is a phishing attempt. Legitimate vendors never ask for your credentials via email. Do not click links in suspicious emails. Report it to your supervisor or designated security officer immediately so it can be assessed and communicated to the team.',
  },

  // ── Section C: What to Do If You Suspect a Breach ─────────────────────────

  {
    id: 'C-01',
    sectionId: 'breach-reporting',
    question:
      'You accidentally send an email with a patient\'s name and appointment time to the wrong email address. You should:',
    options: [
      'Delete the sent email and hope the recipient ignores it',
      'Report it to your supervisor immediately, even if it seems minor',
      'Send a follow-up email asking the recipient to delete it, then consider it handled',
      'Only report it if the patient finds out',
    ],
    correctAnswer: 1,
    explanation:
      'Every potential breach must be reported internally and assessed — even minor-seeming ones. The practice needs to evaluate whether OCR notification is required. Concealing a breach is a separate and more serious HIPAA violation than the original incident.',
  },
  {
    id: 'C-02',
    sectionId: 'breach-reporting',
    question:
      'You discover that a former employee\'s login credentials still work in your EHR system two weeks after they left. This is:',
    options: [
      'Not a concern unless they actually accessed records',
      'A security incident that must be reported to your supervisor immediately',
      'Normal — IT will get to it eventually',
      'Only a problem if the former employee was terminated for cause',
    ],
    correctAnswer: 1,
    explanation:
      'Active credentials for former employees represent an unauthorized access risk and must be treated as a security incident. The longer they remain active, the greater the exposure. Report it so access can be revoked and an audit can determine whether any unauthorized access occurred.',
  },
  {
    id: 'C-03',
    sectionId: 'breach-reporting',
    question: 'How quickly must you report a suspected breach to your supervisor?',
    options: [
      'Within 30 days',
      'Within 72 hours — same day is the standard',
      'By the end of the week',
      'Only after you are certain a breach occurred',
    ],
    correctAnswer: 1,
    explanation:
      'You should report as soon as possible — the same day is the expected standard. HIPAA gives the practice 72 hours from discovery to notify OCR for large breaches (500+ patients). That clock starts the moment anyone at the practice becomes aware. Your delay becomes the practice\'s legal problem.',
  },

  // ── Section D: Penalties and Why This Matters ──────────────────────────────

  {
    id: 'D-01',
    sectionId: 'penalties',
    question:
      'A coworker tells you they looked up a celebrity patient\'s records out of curiosity. They ask you not to say anything. You should:',
    options: [
      'Keep it between you — they made a mistake and are sorry',
      'Report it to your supervisor immediately',
      'Warn them once and monitor the situation',
      'Only report it if the celebrity finds out',
    ],
    correctAnswer: 1,
    explanation:
      'Accessing records without a legitimate work reason is a HIPAA violation regardless of whether the patient ever finds out. Knowing about a violation and concealing it makes you potentially liable as well. Reporting protects you, the practice, and the patient.',
  },
  {
    id: 'D-02',
    sectionId: 'penalties',
    question: 'Which statement about HIPAA penalties is correct?',
    options: [
      'Only the practice owner can be held responsible, not individual staff',
      'Individual staff members can face criminal charges for intentional violations',
      'Penalties only apply to violations that cause visible harm to patients',
      'Apologizing to the patient resolves the HIPAA violation',
    ],
    correctAnswer: 1,
    explanation:
      'Individual employees can face federal criminal prosecution for intentional HIPAA violations — separate from any action taken against the practice. Penalties range from 1 year in prison for knowing violations to 10 years for violations intended to sell data or cause harm.',
  },
  {
    id: 'D-03',
    sectionId: 'penalties',
    question: 'The best reason to complete this training is:',
    options: [
      'Because your employer requires it',
      'Because it protects patients, the practice, and yourself from preventable harm',
      'To avoid being fined personally',
      'Because OCR randomly audits staff knowledge',
    ],
    correctAnswer: 1,
    explanation:
      'The goal of HIPAA is to protect patients\' most sensitive information. Understanding these rules helps you make better decisions every day — not just in audits. Your training record is evidence that you were informed and capable of making those decisions.',
  },
];
