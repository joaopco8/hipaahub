// All 50 training questions organized by category
export interface TrainingQuestion {
  id: string;
  category: string;
  question: string;
  options: string[];
  correctAnswer: number; // 0-based index
  explanation: string;
}

export const allTrainingQuestions: TrainingQuestion[] = [
  // Understanding PHI & Privacy (5 questions)
  {
    id: 'PHI-01',
    category: 'Understanding PHI & Privacy',
    question: 'What does PHI stand for?',
    options: [
      'Personal Health Information',
      'Protected Health Information',
      'Patient Hospital Information',
      'Private Healthcare Identification'
    ],
    correctAnswer: 1,
    explanation: 'PHI stands for Protected Health Information. It includes any health information that can identify a patient, such as name, date of birth, medical record number, or diagnosis. All employees must protect PHI as required by HIPAA.'
  },
  {
    id: 'PHI-02',
    category: 'Understanding PHI & Privacy',
    question: 'Which of the following is NOT considered PHI?',
    options: [
      'Patient\'s social security number',
      'Patient\'s medical diagnosis',
      'A completely de-identified statistical report about disease trends',
      'Patient\'s phone number'
    ],
    correctAnswer: 2,
    explanation: 'De-identified information that cannot be linked to a specific patient is not considered PHI. Once information is properly de-identified (removing all identifiers), it is no longer protected under HIPAA.'
  },
  {
    id: 'PHI-03',
    category: 'Understanding PHI & Privacy',
    question: 'You overhear a conversation in the hallway about a patient\'s condition. What should you do?',
    options: [
      'Share the information with colleagues who might find it interesting',
      'Post about it on social media without naming the patient',
      'Report the breach to your supervisor or Privacy Officer',
      'Do nothing, it\'s just casual conversation'
    ],
    correctAnswer: 2,
    explanation: 'Any unauthorized disclosure of PHI is a breach, even if overheard accidentally. You should report it to your supervisor or Privacy Officer immediately. Discussing patient information in public areas violates HIPAA.'
  },
  {
    id: 'PHI-04',
    category: 'Understanding PHI & Privacy',
    question: 'Can you discuss a patient\'s medical information with family members who call the clinic?',
    options: [
      'Yes, family members have the right to know',
      'Only if the patient has authorized it in writing',
      'Yes, but only with immediate family',
      'No, never discuss patient information over the phone'
    ],
    correctAnswer: 1,
    explanation: 'You can only discuss a patient\'s information with authorized individuals. The patient must provide written authorization. Even family members cannot access PHI without explicit patient consent.'
  },
  {
    id: 'PHI-05',
    category: 'Understanding PHI & Privacy',
    question: 'A patient requests access to their medical records. How long do you have to provide them?',
    options: [
      '7 days',
      '14 days',
      '30 days',
      '60 days'
    ],
    correctAnswer: 2,
    explanation: 'HIPAA requires covered entities to provide patients with access to their medical records within 30 days of request. This is a patient right under the HIPAA Privacy Rule.'
  },
  // Password & Access Security (5 questions)
  {
    id: 'PASSWORD-01',
    category: 'Password & Access Security',
    question: 'What is a strong password?',
    options: [
      'Your name followed by your birth year (e.g., John1985)',
      'A 12-character password with uppercase, lowercase, numbers, and special characters',
      'Your pet\'s name repeated twice (e.g., Fluffy123Fluffy123)',
      'Your username with numbers added (e.g., Admin2024)'
    ],
    correctAnswer: 1,
    explanation: 'A strong password should be at least 12 characters long and include a mix of uppercase letters, lowercase letters, numbers, and special characters. This makes it much harder for attackers to guess or crack your password.'
  },
  {
    id: 'PASSWORD-02',
    category: 'Password & Access Security',
    question: 'How often should you change your password?',
    options: [
      'Never, if it\'s strong enough',
      'Every 6 months',
      'Every 90 days',
      'Only when your manager tells you to'
    ],
    correctAnswer: 2,
    explanation: 'Industry best practices recommend changing passwords every 90 days. This reduces the risk if your password is compromised. Your organization\'s policy should specify the exact frequency.'
  },
  {
    id: 'PASSWORD-03',
    category: 'Password & Access Security',
    question: 'You receive an email asking you to reset your password by clicking a link. What should you do?',
    options: [
      'Click the link immediately and reset your password',
      'Ignore the email and go directly to the official website to reset your password',
      'Forward the email to your IT department to verify it\'s legitimate',
      'Call the sender to confirm it\'s real'
    ],
    correctAnswer: 1,
    explanation: 'This is a common phishing attack. Never click links in emails asking you to reset your password. Always go directly to the official website or application to reset your password. This prevents attackers from capturing your credentials.'
  },
  {
    id: 'PASSWORD-04',
    category: 'Password & Access Security',
    question: 'Is it okay to write your password on a sticky note and put it on your monitor?',
    options: [
      'Yes, as long as you\'re the only one in your office',
      'Yes, it\'s convenient and you can see it easily',
      'No, never write down your password',
      'Only if you use a code instead of your actual password'
    ],
    correctAnswer: 2,
    explanation: 'Never write down your password or store it in an unsecured location. Written passwords can be easily discovered by unauthorized individuals. Use a password manager if you need help remembering passwords.'
  },
  {
    id: 'PASSWORD-05',
    category: 'Password & Access Security',
    question: 'Your colleague asks you to share your password so they can access a file while you\'re away. What should you do?',
    options: [
      'Share your password to help them',
      'Refuse and suggest they contact IT or your manager',
      'Create a temporary account for them',
      'Share your password but ask them to change it back when done'
    ],
    correctAnswer: 1,
    explanation: 'Never share your password with anyone, even colleagues. Each person should have their own unique login credentials. If someone needs access to a file, they should request it through proper channels (IT department or manager).'
  },
  // Phishing & Email Security (5 questions)
  {
    id: 'PHISHING-01',
    category: 'Phishing & Email Security',
    question: 'What is a phishing email?',
    options: [
      'An email from a legitimate company asking you to confirm your account',
      'A fraudulent email designed to trick you into revealing sensitive information',
      'An email with a file attachment',
      'An email from an unknown sender'
    ],
    correctAnswer: 1,
    explanation: 'Phishing emails are fraudulent messages designed to trick you into revealing sensitive information like passwords, credit card numbers, or PHI. They often impersonate legitimate companies or colleagues.'
  },
  {
    id: 'PHISHING-02',
    category: 'Phishing & Email Security',
    question: 'You receive an email from \'your bank\' asking you to verify your account information. The email looks legitimate. What should you do?',
    options: [
      'Click the link and verify your information',
      'Call the bank directly using the phone number on your bank card, not the number in the email',
      'Reply to the email asking for more information',
      'Delete the email without taking any action'
    ],
    correctAnswer: 1,
    explanation: 'Never click links in emails asking for sensitive information. Instead, contact the organization directly using a phone number or website you know is legitimate. This prevents you from falling victim to phishing attacks.'
  },
  {
    id: 'PHISHING-03',
    category: 'Phishing & Email Security',
    question: 'What is a red flag that an email might be a phishing attempt?',
    options: [
      'The email asks you to click a link to verify your account',
      'The email contains urgent language like \'Act now\' or \'Verify immediately\'',
      'The email sender\'s address looks slightly different from the legitimate company',
      'All of the above'
    ],
    correctAnswer: 3,
    explanation: 'All of these are red flags for phishing emails. Other warning signs include spelling errors, generic greetings, requests for personal information, and suspicious attachments. Always be cautious with unsolicited emails.'
  },
  {
    id: 'PHISHING-04',
    category: 'Phishing & Email Security',
    question: 'You receive an email with an attachment from someone you don\'t recognize. What should you do?',
    options: [
      'Open the attachment to see what it is',
      'Delete the email immediately',
      'Contact the sender to verify the attachment is legitimate before opening it',
      'Forward it to your IT department for analysis'
    ],
    correctAnswer: 2,
    explanation: 'Never open attachments from unknown senders without verification. Malicious attachments can contain viruses or ransomware that compromise your system and patient data. Contact the sender through a known phone number or email to verify before opening.'
  },
  {
    id: 'PHISHING-05',
    category: 'Phishing & Email Security',
    question: 'You receive an email that appears to be from your CEO asking you to transfer money urgently. What should you do?',
    options: [
      'Process the transfer immediately',
      'Contact your CEO directly using a phone number from the company directory to verify the request',
      'Forward the email to accounting to process',
      'Reply to the email asking for more details'
    ],
    correctAnswer: 1,
    explanation: 'This is a common business email compromise (BEC) scam. Always verify urgent requests for money or sensitive actions by contacting the person directly using a known phone number. Never reply to the email or click links.'
  },
  // Access Control & Minimum Necessary (5 questions)
  {
    id: 'ACCESS-01',
    category: 'Access Control & Minimum Necessary',
    question: 'What does \'minimum necessary\' mean in HIPAA?',
    options: [
      'You can access any patient information you want',
      'You should only access the minimum amount of PHI needed to do your job',
      'You can access patient information only on Mondays',
      'You can share patient information with anyone who asks'
    ],
    correctAnswer: 1,
    explanation: 'The \'minimum necessary\' principle means you should only access and use the least amount of PHI needed to accomplish your specific job function. This reduces the risk of unauthorized disclosure and protects patient privacy.'
  },
  {
    id: 'ACCESS-02',
    category: 'Access Control & Minimum Necessary',
    question: 'You work in billing and need to process a patient\'s insurance claim. What information do you need?',
    options: [
      'The patient\'s full medical history and all diagnoses',
      'Only the diagnosis codes and treatment dates relevant to the claim',
      'The patient\'s complete medical record',
      'The patient\'s social security number and financial information'
    ],
    correctAnswer: 1,
    explanation: 'You should only access the specific information needed for your job function. In this case, you need diagnosis codes and treatment dates for the insurance claim, not the entire medical record. This follows the minimum necessary principle.'
  },
  {
    id: 'ACCESS-03',
    category: 'Access Control & Minimum Necessary',
    question: 'A colleague asks you to look up a patient\'s information because they\'re curious about a celebrity who came to the clinic. What should you do?',
    options: [
      'Look up the information and share it with your colleague',
      'Refuse and explain that accessing PHI without a business need is a violation',
      'Look up the information but don\'t tell anyone',
      'Tell your colleague to look it up themselves'
    ],
    correctAnswer: 1,
    explanation: 'Accessing PHI without a legitimate business need is a serious HIPAA violation. This includes accessing records out of curiosity, even if the patient is famous. Report any unauthorized access attempts to your supervisor or Privacy Officer.'
  },
  {
    id: 'ACCESS-04',
    category: 'Access Control & Minimum Necessary',
    question: 'You\'re on vacation and a colleague asks you to access a patient\'s information on their behalf. What should you do?',
    options: [
      'Access the information and send it to them',
      'Refuse and suggest they access it themselves or contact your manager',
      'Access the information but ask them to keep it confidential',
      'Tell them to wait until you return from vacation'
    ],
    correctAnswer: 1,
    explanation: 'You should never access PHI on behalf of someone else. Each person should access only the information they need for their own job function. If they need information, they should access it themselves or request it through proper channels.'
  },
  {
    id: 'ACCESS-05',
    category: 'Access Control & Minimum Necessary',
    question: 'When you change jobs within the organization, what should happen to your access?',
    options: [
      'Your access should remain the same',
      'Your old access should be removed and new access granted based on your new role',
      'You should keep both old and new access',
      'You should request access to everything in case you need it'
    ],
    correctAnswer: 1,
    explanation: 'When you change roles, your access should be updated to match your new job function. Old access should be removed to follow the minimum necessary principle. This prevents unauthorized access to systems you no longer need.'
  },
  // Incident Response & Breach Reporting (5 questions)
  {
    id: 'INCIDENT-01',
    category: 'Incident Response & Breach Reporting',
    question: 'What should you do if you suspect a security incident or breach?',
    options: [
      'Keep it quiet and monitor the situation',
      'Tell your colleagues but not your manager',
      'Report it immediately to your supervisor or Privacy Officer',
      'Wait to see if anything happens before reporting'
    ],
    correctAnswer: 2,
    explanation: 'Any suspected security incident or breach must be reported immediately to your supervisor or Privacy Officer. Early reporting allows the organization to respond quickly and minimize harm. Delays in reporting can result in disciplinary action.'
  },
  {
    id: 'INCIDENT-02',
    category: 'Incident Response & Breach Reporting',
    question: 'You accidentally send a patient\'s medical record to the wrong email address. What should you do?',
    options: [
      'Hope the recipient doesn\'t open it',
      'Report it immediately to your Privacy Officer and IT department',
      'Ask the recipient to delete it but don\'t report it internally',
      'Send a follow-up email asking them to ignore the first email'
    ],
    correctAnswer: 1,
    explanation: 'This is a breach of PHI. You must report it immediately to your Privacy Officer and IT department. They will determine if the recipient accessed the information and what steps need to be taken. Attempting to cover it up is a serious violation.'
  },
  {
    id: 'INCIDENT-03',
    category: 'Incident Response & Breach Reporting',
    question: 'You notice someone accessing patient records who shouldn\'t have access. What should you do?',
    options: [
      'Confront the person directly',
      'Report it to your supervisor or Security Officer immediately',
      'Monitor them to gather more information before reporting',
      'Ask other colleagues if they\'ve noticed anything suspicious'
    ],
    correctAnswer: 1,
    explanation: 'Report any suspicious activity to your supervisor or Security Officer immediately. Do not confront the person or investigate on your own. This allows the organization to respond appropriately and preserve evidence.'
  },
  {
    id: 'INCIDENT-04',
    category: 'Incident Response & Breach Reporting',
    question: 'What is a breach under HIPAA?',
    options: [
      'Any unauthorized access to PHI',
      'Only unauthorized access that results in harm to the patient',
      'Unauthorized access, acquisition, use, or disclosure of PHI that compromises security or privacy',
      'Only breaches that affect more than 100 patients'
    ],
    correctAnswer: 2,
    explanation: 'A breach is any unauthorized access, acquisition, use, or disclosure of PHI that compromises the security or privacy of the information. This includes accidental disclosures. All breaches must be reported, regardless of the number of patients affected.'
  },
  {
    id: 'INCIDENT-05',
    category: 'Incident Response & Breach Reporting',
    question: 'You find a patient\'s medical record left on a printer. What should you do?',
    options: [
      'Leave it there for the person who printed it to retrieve',
      'Take it to your supervisor or Privacy Officer immediately',
      'Shred it without telling anyone',
      'Post a note asking whose document it is'
    ],
    correctAnswer: 1,
    explanation: 'Unattended PHI is a security risk. Take it to your supervisor or Privacy Officer immediately. This ensures proper handling and documentation. Leaving it unattended or shredding it without reporting could be a violation.'
  },
  // Device & Data Security (5 questions)
  {
    id: 'DEVICE-01',
    category: 'Device & Data Security',
    question: 'What should you do with your work computer when you leave your desk?',
    options: [
      'Leave it on and unlocked for quick access when you return',
      'Lock your computer or log off before leaving',
      'Close the monitor but leave it logged in',
      'Leave it on but minimize all windows'
    ],
    correctAnswer: 1,
    explanation: 'Always lock your computer or log off before leaving your desk. This prevents unauthorized access to PHI. Many organizations have policies requiring automatic logoff after a period of inactivity.'
  },
  {
    id: 'DEVICE-02',
    category: 'Device & Data Security',
    question: 'You need to work from home. What should you do to protect PHI?',
    options: [
      'Use your personal computer and internet connection',
      'Use the organization\'s VPN and encrypted connection on an approved device',
      'Access the system through a public WiFi network',
      'Share your login credentials with a family member to help you'
    ],
    correctAnswer: 1,
    explanation: 'When working remotely, you must use the organization\'s VPN and an approved, encrypted device. Never use personal computers or public WiFi networks to access PHI. This protects patient data from interception.'
  },
  {
    id: 'DEVICE-03',
    category: 'Device & Data Security',
    question: 'Your laptop contains patient information. What should you do if you lose it?',
    options: [
      'Hope no one finds it',
      'Report it immediately to your IT department and supervisor',
      'Wait a few days to see if someone returns it',
      'Replace it and don\'t tell anyone'
    ],
    correctAnswer: 1,
    explanation: 'Lost or stolen devices containing PHI must be reported immediately. Your IT department can remotely wipe the device and determine if patient data was accessed. Delays in reporting can result in disciplinary action and regulatory fines.'
  },
  {
    id: 'DEVICE-04',
    category: 'Device & Data Security',
    question: 'Can you take patient records home on a USB drive?',
    options: [
      'Yes, as long as you keep it in a safe place',
      'Only if you have written permission from your manager',
      'Only if the drive is encrypted and you follow your organization\'s policy',
      'No, never remove patient records from the facility'
    ],
    correctAnswer: 2,
    explanation: 'Portable devices like USB drives are a security risk. If your organization allows it, the drive must be encrypted and you must follow strict policies. Many organizations prohibit removing PHI from the facility entirely.'
  },
  {
    id: 'DEVICE-05',
    category: 'Device & Data Security',
    question: 'You\'re using a shared computer in a common area. What should you do?',
    options: [
      'Log in and access patient information normally',
      'Log in, access only what you need, and log off immediately',
      'Don\'t log in and ask someone else to access the information for you',
      'Leave yourself logged in so others can access it quickly'
    ],
    correctAnswer: 1,
    explanation: 'When using shared computers, log in, access only the information you need, and log off immediately. This prevents other users from accessing PHI. Always log off, even if you\'ll only be away for a few minutes.'
  },
  // Physical Security (5 questions)
  {
    id: 'PHYSICAL-01',
    category: 'Physical Security',
    question: 'You notice a door to the server room is propped open. What should you do?',
    options: [
      'Leave it open for convenience',
      'Close it and report it to your IT department or supervisor',
      'Leave it open but lock the server room later',
      'Ask someone else to close it'
    ],
    correctAnswer: 1,
    explanation: 'Propped-open doors to secure areas are a security risk. Close the door and report it immediately. This prevents unauthorized access to systems containing PHI and ensures physical security controls are maintained.'
  },
  {
    id: 'PHYSICAL-02',
    category: 'Physical Security',
    question: 'A stranger asks you to let them into a secure area because they say they forgot their badge. What should you do?',
    options: [
      'Let them in to be helpful',
      'Verify their identity and ask them to use their own badge or contact their manager',
      'Let them in but watch them closely',
      'Tell them to wait outside'
    ],
    correctAnswer: 1,
    explanation: 'Never let unauthorized individuals into secure areas. This is called \'tailgating\' and is a common security breach. Always verify identity and require proper credentials. If they don\'t have a badge, they should contact their manager or IT.'
  },
  {
    id: 'PHYSICAL-03',
    category: 'Physical Security',
    question: 'Where should you store printed documents containing PHI?',
    options: [
      'On your desk where you can see them',
      'In a locked cabinet or drawer',
      'In a public area so you remember to file them',
      'In the trash when you\'re done with them'
    ],
    correctAnswer: 1,
    explanation: 'Printed documents containing PHI must be stored in locked cabinets or drawers when not in use. This prevents unauthorized access. When you\'re done with them, they should be shredded, not thrown in the trash.'
  },
  {
    id: 'PHYSICAL-04',
    category: 'Physical Security',
    question: 'You have a printed patient record that you no longer need. What should you do?',
    options: [
      'Throw it in the regular trash',
      'Shred it or use the organization\'s document destruction service',
      'Leave it on your desk for someone else to handle',
      'Recycle it'
    ],
    correctAnswer: 1,
    explanation: 'All printed documents containing PHI must be shredded or destroyed using the organization\'s document destruction service. Never throw PHI in regular trash or recycling. This prevents dumpster diving and unauthorized access.'
  },
  {
    id: 'PHYSICAL-05',
    category: 'Physical Security',
    question: 'You see a visitor in the clinic without a visitor badge. What should you do?',
    options: [
      'Ignore them, they probably belong here',
      'Ask them for their visitor badge and direct them to check in if they don\'t have one',
      'Tell your manager later',
      'Follow them to see where they\'re going'
    ],
    correctAnswer: 1,
    explanation: 'All visitors should have a visitor badge. If you see someone without one, politely ask them for their badge and direct them to check in. This maintains physical security and prevents unauthorized access to patient areas.'
  },
  // Workforce Security & Training (5 questions)
  {
    id: 'TRAINING-01',
    category: 'Workforce Security & Training',
    question: 'Why is HIPAA training important?',
    options: [
      'It\'s required by law and helps you understand your responsibilities',
      'It\'s just a formality that doesn\'t really matter',
      'It only applies to IT staff',
      'It\'s only important for managers'
    ],
    correctAnswer: 0,
    explanation: 'HIPAA training is required by law and is essential for all employees. It helps you understand your responsibilities in protecting patient privacy and security. Training is a key component of HIPAA compliance.'
  },
  {
    id: 'TRAINING-02',
    category: 'Workforce Security & Training',
    question: 'How often should you complete HIPAA training?',
    options: [
      'Only once when you\'re hired',
      'Every year',
      'Every 5 years',
      'Never, once is enough'
    ],
    correctAnswer: 1,
    explanation: 'HIPAA training should be completed annually. This ensures you stay informed about security threats, policy updates, and best practices. Your organization may require additional training if there\'s a breach or policy change.'
  },
  {
    id: 'TRAINING-03',
    category: 'Workforce Security & Training',
    question: 'What should you do if you don\'t understand a HIPAA policy?',
    options: [
      'Ignore it and do what seems right',
      'Ask your manager or Privacy Officer for clarification',
      'Ask your colleagues what they do',
      'Assume it doesn\'t apply to your job'
    ],
    correctAnswer: 1,
    explanation: 'If you don\'t understand a HIPAA policy, ask your manager or Privacy Officer for clarification. It\'s better to ask than to violate the policy unintentionally. Your organization wants to ensure all employees understand their responsibilities.'
  },
  {
    id: 'TRAINING-04',
    category: 'Workforce Security & Training',
    question: 'What is the consequence of violating HIPAA?',
    options: [
      'A warning',
      'Disciplinary action up to and including termination, plus potential fines',
      'Nothing, it\'s not a serious violation',
      'Just a conversation with your manager'
    ],
    correctAnswer: 1,
    explanation: 'HIPAA violations can result in serious consequences including disciplinary action, termination of employment, and significant fines. The organization can face fines up to $50,000 per violation. Individual employees can also face criminal charges.'
  },
  {
    id: 'TRAINING-05',
    category: 'Workforce Security & Training',
    question: 'Who is responsible for protecting patient privacy?',
    options: [
      'Only the IT department',
      'Only the Privacy Officer',
      'Only doctors and nurses',
      'Every employee in the organization'
    ],
    correctAnswer: 3,
    explanation: 'Every employee is responsible for protecting patient privacy. This includes administrative staff, IT personnel, clinical staff, and management. HIPAA compliance is a shared responsibility.'
  },
  // Secure Communication (5 questions)
  {
    id: 'COMMUNICATION-01',
    category: 'Secure Communication',
    question: 'Can you discuss patient information over the phone?',
    options: [
      'Yes, always',
      'Only if you verify the caller\'s identity and they have authorization',
      'Never, only in person',
      'Only if it\'s a quick conversation'
    ],
    correctAnswer: 1,
    explanation: 'You can discuss patient information over the phone only if you verify the caller\'s identity and they are authorized to receive the information. Always confirm who you\'re speaking with before discussing PHI.'
  },
  {
    id: 'COMMUNICATION-02',
    category: 'Secure Communication',
    question: 'What should you do if you accidentally include the wrong patient\'s information in an email?',
    options: [
      'Send another email correcting the mistake',
      'Report it immediately to your Privacy Officer and IT department',
      'Call the recipient and ask them to delete it',
      'Hope they don\'t notice'
    ],
    correctAnswer: 1,
    explanation: 'This is a breach of PHI. Report it immediately to your Privacy Officer and IT department. They will determine if the recipient accessed the information and what steps need to be taken.'
  },
  {
    id: 'COMMUNICATION-03',
    category: 'Secure Communication',
    question: 'Can you text a patient\'s medical information to a colleague?',
    options: [
      'Yes, texting is secure',
      'Only if you use an encrypted messaging app approved by your organization',
      'No, never text PHI',
      'Yes, as long as you delete the message after'
    ],
    correctAnswer: 1,
    explanation: 'Regular text messages are not secure. If your organization allows texting, you must use an encrypted messaging app approved by your organization. Standard SMS is not HIPAA-compliant.'
  },
  {
    id: 'COMMUNICATION-04',
    category: 'Secure Communication',
    question: 'You need to send a patient\'s medical record to another provider. What\'s the safest way?',
    options: [
      'Email it as an attachment',
      'Text it to them',
      'Use your organization\'s secure fax or encrypted email system',
      'Print it and mail it'
    ],
    correctAnswer: 2,
    explanation: 'Use your organization\'s secure fax or encrypted email system to send PHI to other providers. These methods protect the information from interception. Never use regular email or text messages.'
  },
  {
    id: 'COMMUNICATION-05',
    category: 'Secure Communication',
    question: 'A patient calls asking about their test results. What should you do?',
    options: [
      'Provide the results immediately',
      'Verify their identity and check if they\'re authorized to receive results before providing them',
      'Tell them to contact their doctor',
      'Ask them to come in person'
    ],
    correctAnswer: 1,
    explanation: 'Always verify the caller\'s identity before discussing any PHI. Confirm their name, date of birth, or other identifying information. This prevents unauthorized disclosure of patient information.'
  },
  // Visitor & Contractor Management (2 questions)
  {
    id: 'VISITOR-01',
    category: 'Visitor & Contractor Management',
    question: 'A contractor needs to work on the clinic\'s computer system. What should you do?',
    options: [
      'Give them full access to all systems',
      'Ensure they have a signed Business Associate Agreement (BAA) and limited access only to what they need',
      'Let them access the system without supervision',
      'Assume they\'re trustworthy and don\'t worry about it'
    ],
    correctAnswer: 1,
    explanation: 'All contractors who may access PHI must have a signed Business Associate Agreement (BAA). They should be given limited access only to what they need for their job. Supervision and access controls are essential.'
  },
  {
    id: 'VISITOR-02',
    category: 'Visitor & Contractor Management',
    question: 'What is a Business Associate Agreement (BAA)?',
    options: [
      'A contract between the organization and a vendor',
      'A legal agreement that requires vendors to protect PHI and comply with HIPAA',
      'An agreement that allows vendors to share PHI with others',
      'A contract that\'s optional for most vendors'
    ],
    correctAnswer: 1,
    explanation: 'A BAA is a legal agreement between a covered entity and a vendor that requires the vendor to protect PHI and comply with HIPAA. Any vendor that may access PHI must have a signed BAA.'
  },
  // Third-Party & Vendor Management (2 questions)
  {
    id: 'VENDOR-01',
    category: 'Third-Party & Vendor Management',
    question: 'Your organization uses a cloud-based EHR system. What should you verify about the vendor?',
    options: [
      'Nothing, just trust them',
      'That they have a signed BAA and use encryption to protect PHI',
      'That they\'re a large company',
      'That they offer the cheapest price'
    ],
    correctAnswer: 1,
    explanation: 'Before using any vendor\'s system to store or process PHI, verify they have a signed BAA and use encryption. Ask about their security practices, data backup procedures, and breach notification policies.'
  },
  {
    id: 'VENDOR-02',
    category: 'Third-Party & Vendor Management',
    question: 'A vendor informs you of a security breach affecting their system. What should you do?',
    options: [
      'Keep it quiet and hope it doesn\'t affect your patients',
      'Report it immediately to your Privacy Officer and IT department',
      'Wait to see if any patients are affected',
      'Contact the vendor\'s customer service'
    ],
    correctAnswer: 1,
    explanation: 'Any vendor breach affecting PHI must be reported immediately to your Privacy Officer and IT department. They will determine if your patients\' information was affected and what notification steps are needed.'
  },
  // General Compliance (5 questions)
  {
    id: 'COMPLIANCE-01',
    category: 'General Compliance',
    question: 'What does HIPAA stand for?',
    options: [
      'Health Information Privacy and Protection Act',
      'Health Insurance Portability and Accountability Act',
      'Healthcare Information Privacy Act',
      'Health Information Protection and Access Act'
    ],
    correctAnswer: 1,
    explanation: 'HIPAA stands for the Health Insurance Portability and Accountability Act. It\'s a federal law that requires healthcare organizations to protect patient privacy and security.'
  },
  {
    id: 'COMPLIANCE-02',
    category: 'General Compliance',
    question: 'Who enforces HIPAA?',
    options: [
      'The FBI',
      'The Department of Health and Human Services (HHS) Office for Civil Rights (OCR)',
      'The CIA',
      'Local police'
    ],
    correctAnswer: 1,
    explanation: 'The Department of Health and Human Services (HHS) Office for Civil Rights (OCR) enforces HIPAA. They investigate complaints and can impose significant fines for violations.'
  },
  {
    id: 'COMPLIANCE-03',
    category: 'General Compliance',
    question: 'What is a HIPAA audit?',
    options: [
      'A financial review of the organization',
      'An investigation by OCR to verify HIPAA compliance',
      'A review of employee performance',
      'An annual meeting with staff'
    ],
    correctAnswer: 1,
    explanation: 'A HIPAA audit is an investigation by OCR to verify that the organization is complying with HIPAA requirements. Audits can be triggered by complaints or conducted randomly. Organizations must be prepared to provide documentation.'
  },
  {
    id: 'COMPLIANCE-04',
    category: 'General Compliance',
    question: 'What should you do if you receive a complaint about a HIPAA violation?',
    options: [
      'Ignore it',
      'Report it to your Privacy Officer or supervisor immediately',
      'Investigate it yourself',
      'Tell other employees about it'
    ],
    correctAnswer: 1,
    explanation: 'Any complaint about a HIPAA violation should be reported immediately to your Privacy Officer or supervisor. They will investigate and take appropriate action. Do not investigate on your own or discuss it with other employees.'
  },
  {
    id: 'COMPLIANCE-05',
    category: 'General Compliance',
    question: 'Can your organization be fined for HIPAA violations?',
    options: [
      'No, HIPAA violations don\'t result in fines',
      'Yes, fines can range from $100 to $50,000 per violation',
      'Yes, but only for the first violation',
      'Only if the violation involves more than 1,000 patients'
    ],
    correctAnswer: 1,
    explanation: 'Yes, organizations can be fined for HIPAA violations. Fines can range from $100 to $50,000 per violation. Repeated violations or willful neglect result in higher fines. Criminal charges are also possible.'
  },
  // Social Engineering & Manipulation (5 questions)
  {
    id: 'SOCIAL-01',
    category: 'Social Engineering & Manipulation',
    question: 'What is social engineering?',
    options: [
      'A type of computer virus',
      'A technique to trick people into revealing sensitive information',
      'A networking event for healthcare professionals',
      'A software update'
    ],
    correctAnswer: 1,
    explanation: 'Social engineering is a technique used by attackers to trick people into revealing sensitive information or performing actions that compromise security. Examples include phishing, pretexting, and baiting.'
  },
  {
    id: 'SOCIAL-02',
    category: 'Social Engineering & Manipulation',
    question: 'Someone calls claiming to be from IT asking for your password. What should you do?',
    options: [
      'Provide your password',
      'Refuse and contact IT directly using a known phone number',
      'Give them a fake password',
      'Ask them to call back later'
    ],
    correctAnswer: 1,
    explanation: 'Legitimate IT staff will never ask for your password. This is a common social engineering attack. Refuse and contact IT directly using a phone number from your company directory.'
  },
  {
    id: 'SOCIAL-03',
    category: 'Social Engineering & Manipulation',
    question: 'What is pretexting?',
    options: [
      'Sending a phishing email',
      'Creating a false scenario to trick someone into revealing information',
      'Leaving a malicious USB drive in a parking lot',
      'Installing spyware on a computer'
    ],
    correctAnswer: 1,
    explanation: 'Pretexting is creating a false scenario to trick someone into revealing sensitive information. For example, someone might call claiming to be from your bank to get your account number.'
  },
  {
    id: 'SOCIAL-04',
    category: 'Social Engineering & Manipulation',
    question: 'You receive a call from someone claiming to be a patient asking for another patient\'s contact information. What should you do?',
    options: [
      'Provide the information',
      'Refuse and explain that you cannot share patient information without authorization',
      'Ask them why they need it',
      'Tell them to call back later'
    ],
    correctAnswer: 1,
    explanation: 'Never share patient information without authorization. This is a social engineering attack. Politely refuse and explain that you cannot share patient information with anyone except the patient themselves or authorized individuals.'
  },
  {
    id: 'SOCIAL-05',
    category: 'Social Engineering & Manipulation',
    question: 'What should you do if you suspect someone is trying to manipulate you into breaking security rules?',
    options: [
      'Go along with it to be helpful',
      'Report it to your supervisor or Security Officer immediately',
      'Ignore it and hope it goes away',
      'Tell your colleagues but not management'
    ],
    correctAnswer: 1,
    explanation: 'Report any suspected social engineering attempts to your supervisor or Security Officer immediately. This helps the organization identify and prevent attacks. Do not go along with requests that violate security rules.'
  },
  // Mobile Device Security (3 questions)
  {
    id: 'MOBILE-01',
    category: 'Mobile Device Security',
    question: 'Can you use your personal smartphone to access patient information?',
    options: [
      'Yes, as long as you have a password',
      'Only if your organization approves it and the device meets security requirements',
      'No, never use personal devices',
      'Yes, if you\'re careful'
    ],
    correctAnswer: 1,
    explanation: 'Personal devices may be used to access PHI only if your organization approves it and the device meets security requirements (encryption, password protection, etc.). Always follow your organization\'s mobile device policy.'
  },
  {
    id: 'MOBILE-02',
    category: 'Mobile Device Security',
    question: 'What should you do if you lose your work smartphone that contains PHI?',
    options: [
      'Hope someone returns it',
      'Report it immediately to your IT department and supervisor',
      'Wait a few days before reporting',
      'Replace it and don\'t tell anyone'
    ],
    correctAnswer: 1,
    explanation: 'Lost or stolen devices containing PHI must be reported immediately. Your IT department can remotely wipe the device and determine if patient data was accessed. Delays in reporting can result in disciplinary action.'
  },
  {
    id: 'MOBILE-03',
    category: 'Mobile Device Security',
    question: 'Should you use public WiFi to access patient information?',
    options: [
      'Yes, it\'s convenient',
      'Only if you use a VPN',
      'No, never use public WiFi for PHI',
      'Only if the connection is password-protected'
    ],
    correctAnswer: 1,
    explanation: 'Public WiFi networks are not secure. If you must access PHI on public WiFi, use your organization\'s VPN. The VPN encrypts your connection and protects PHI from interception.'
  },
  // Data Backup & Recovery (3 questions)
  {
    id: 'BACKUP-01',
    category: 'Data Backup & Recovery',
    question: 'Why is data backup important?',
    options: [
      'It\'s not really important',
      'It ensures PHI can be recovered if systems fail or are attacked',
      'It\'s only important for IT staff',
      'It\'s a waste of time and resources'
    ],
    correctAnswer: 1,
    explanation: 'Data backup is critical for ensuring PHI can be recovered if systems fail, are attacked, or experience data loss. Regular backups are a key component of HIPAA compliance and business continuity.'
  },
  {
    id: 'BACKUP-02',
    category: 'Data Backup & Recovery',
    question: 'Where should backup data be stored?',
    options: [
      'In the same location as the original data',
      'In a separate, secure location away from the original data',
      'On a USB drive in your desk',
      'On the cloud without encryption'
    ],
    correctAnswer: 1,
    explanation: 'Backup data should be stored in a separate, secure location away from the original data. This protects against site-wide disasters. Backups should also be encrypted and regularly tested for recovery.'
  },
  {
    id: 'BACKUP-03',
    category: 'Data Backup & Recovery',
    question: 'How often should data backups be performed?',
    options: [
      'Once a year',
      'Once a month',
      'Daily or more frequently, depending on the organization\'s policy',
      'Only when IT remembers to do it'
    ],
    correctAnswer: 2,
    explanation: 'Data backups should be performed daily or more frequently, depending on the organization\'s policy and the importance of the data. Regular backups minimize data loss in case of a disaster.'
  },
  // Security Awareness (5 questions)
  {
    id: 'AWARENESS-01',
    category: 'Security Awareness',
    question: 'What is the first step in protecting patient privacy?',
    options: [
      'Installing antivirus software',
      'Being aware of security risks and following policies',
      'Hiring a security consultant',
      'Purchasing expensive security systems'
    ],
    correctAnswer: 1,
    explanation: 'Security awareness is the first step in protecting patient privacy. Understanding risks and following security policies is more important than technology alone. Every employee plays a role in protecting PHI.'
  },
  {
    id: 'AWARENESS-02',
    category: 'Security Awareness',
    question: 'What should you do if you see a security vulnerability or weakness?',
    options: [
      'Ignore it',
      'Try to fix it yourself',
      'Report it to your IT department or supervisor',
      'Tell your colleagues but not management'
    ],
    correctAnswer: 2,
    explanation: 'Report any security vulnerabilities or weaknesses to your IT department or supervisor. Do not attempt to fix them yourself. This allows the organization to address the issue properly and prevent exploitation.'
  },
  {
    id: 'AWARENESS-03',
    category: 'Security Awareness',
    question: 'Why is it important to keep your antivirus software updated?',
    options: [
      'It\'s not important',
      'Updated software detects and removes new malware threats',
      'It\'s just a marketing gimmick',
      'Updates slow down your computer'
    ],
    correctAnswer: 1,
    explanation: 'Updated antivirus software includes the latest virus definitions and can detect and remove new malware threats. Always keep your antivirus software updated to protect against the latest threats.'
  },
  {
    id: 'AWARENESS-04',
    category: 'Security Awareness',
    question: 'What is the best way to stay informed about security threats?',
    options: [
      'Ignore security news',
      'Attend security training and read security awareness communications from your organization',
      'Only worry about it if there\'s a breach',
      'Assume it won\'t happen to you'
    ],
    correctAnswer: 1,
    explanation: 'Stay informed by attending security training and reading security awareness communications from your organization. This helps you recognize and respond to threats. Security awareness is an ongoing process.'
  },
  {
    id: 'AWARENESS-05',
    category: 'Security Awareness',
    question: 'What is the most important thing you can do to protect patient privacy?',
    options: [
      'Use a strong password',
      'Think before you act and follow security policies',
      'Install antivirus software',
      'Lock your door'
    ],
    correctAnswer: 1,
    explanation: 'The most important thing you can do is think before you act and follow security policies. Security awareness and good judgment are the foundation of protecting patient privacy. Technology alone is not enough.'
  }
];

// Helper function to get questions by category
export function getQuestionsByCategory(category: string): TrainingQuestion[] {
  return allTrainingQuestions.filter(q => q.category === category);
}

// Helper function to map questions to section IDs
// Total: 50 questions distributed across 8 sections
export function getQuestionsForSection(sectionId: string): TrainingQuestion[] {
  const mapping: Record<string, string[]> = {
    // Section 1: Introduction to HIPAA (6 questions)
    'introduction': ['COMPLIANCE-01', 'COMPLIANCE-02', 'COMPLIANCE-03', 'COMPLIANCE-04', 'COMPLIANCE-05', 'TRAINING-01'],
    // Section 2: Understanding PHI (6 questions)
    'phi': ['PHI-01', 'PHI-02', 'PHI-03', 'PHI-04', 'PHI-05', 'TRAINING-02'],
    // Section 3: Minimum Necessary (6 questions)
    'minimum-necessary': ['ACCESS-01', 'ACCESS-02', 'ACCESS-03', 'ACCESS-04', 'ACCESS-05', 'TRAINING-03'],
    // Section 4: Access Controls & Passwords (7 questions)
    'access-controls': ['PASSWORD-01', 'PASSWORD-02', 'PASSWORD-03', 'PASSWORD-04', 'PASSWORD-05', 'DEVICE-01', 'DEVICE-02'],
    // Section 5: Email & Communication Security (7 questions)
    'communication': ['PHISHING-01', 'PHISHING-02', 'PHISHING-03', 'PHISHING-04', 'PHISHING-05', 'COMMUNICATION-01', 'COMMUNICATION-02'],
    // Section 6: Incident & Breach Reporting (7 questions)
    'incident-reporting': ['INCIDENT-01', 'INCIDENT-02', 'INCIDENT-03', 'INCIDENT-04', 'INCIDENT-05', 'COMMUNICATION-03', 'COMMUNICATION-04'],
    // Section 7: Sanctions for Violations (7 questions)
    'sanctions': ['TRAINING-04', 'TRAINING-05', 'PHYSICAL-01', 'PHYSICAL-02', 'PHYSICAL-03', 'PHYSICAL-04', 'PHYSICAL-05'],
    // Section 8: Privacy Rights & Additional Topics (4 questions)
    'patient-rights': ['COMMUNICATION-05', 'VISITOR-01', 'VISITOR-02', 'VENDOR-01', 'VENDOR-02', 'SOCIAL-01', 'SOCIAL-02', 'SOCIAL-03', 'SOCIAL-04', 'SOCIAL-05', 'MOBILE-01', 'MOBILE-02', 'MOBILE-03', 'BACKUP-01', 'BACKUP-02', 'BACKUP-03', 'AWARENESS-01', 'AWARENESS-02', 'AWARENESS-03', 'AWARENESS-04', 'AWARENESS-05', 'DEVICE-03', 'DEVICE-04', 'DEVICE-05']
  };

  const questionIds = mapping[sectionId] || [];
  return allTrainingQuestions.filter(q => questionIds.includes(q.id));
}
