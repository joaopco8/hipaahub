/**
 * Generate Required Documents from Risk Assessment Answers
 * 
 * This function analyzes risk assessment answers and determines
 * which HIPAA documents are required based on identified gaps.
 * Documents are classified by legal severity and linked to specific assessment failures.
 */

export interface RequiredDocument {
  id: string;
  name: string;
  severity: 'critical' | 'required';
  missingReasons: string[];
  description: string;
}

/**
 * Map assessment question IDs to human-readable failure reasons
 */
const FAILURE_REASONS: Record<string, string> = {
  'security-policy': 'No written security policy',
  'security-policy-partial': 'Partial/informal policies only',
  'security-policy-outdated': 'Security policy outdated (>1 year old)',
  'privacy-policy': 'No HIPAA Privacy Policy',
  'incident-response': 'No documented Incident Response Plan',
  'workforce-training': 'No workforce training policy documented',
  'workforce-training-partial': 'Incomplete workforce training',
  'risk-assessment-conducted': 'No formal Security Risk Assessment documented',
  'risk-assessment-old': 'Security Risk Assessment not current (over 1 year)',
  'access-management': 'No documented access management procedures',
  'access-management-informal': 'Informal access management procedures only',
  'contingency-plan': 'No documented Contingency Plan',
  'contingency-plan-untested': 'Contingency Plan not tested',
  'breach-history': 'Unreported breach history requires documented procedures'
};

/**
 * Generate required documents based on risk assessment answers
 */
export function generateRequiredDocuments(
  answers: Record<string, string>
): RequiredDocument[] {
  const documents: RequiredDocument[] = [];

  // CRITICAL DOCUMENTS - Audit Blockers

  // HIPAA Security Policy
  if (answers['security-policy'] === 'no' || 
      answers['security-policy'] === 'partial' || 
      answers['security-policy'] === 'yes-outdated') {
    const reasons: string[] = [];
    if (answers['security-policy'] === 'no') {
      reasons.push(FAILURE_REASONS['security-policy']);
    } else if (answers['security-policy'] === 'partial') {
      reasons.push(FAILURE_REASONS['security-policy-partial']);
    } else if (answers['security-policy'] === 'yes-outdated') {
      reasons.push(FAILURE_REASONS['security-policy-outdated']);
    }
    
    // Additional reasons if risk assessment is missing
    if (answers['risk-assessment-conducted'] === 'no' || answers['risk-assessment-conducted'] === 'yes-old') {
      if (answers['risk-assessment-conducted'] === 'no') {
        reasons.push(FAILURE_REASONS['risk-assessment-conducted']);
      } else {
        reasons.push(FAILURE_REASONS['risk-assessment-old']);
      }
    }

    documents.push({
      id: 'security-policy',
      name: 'HIPAA Security Policy',
      severity: 'critical',
      missingReasons: reasons,
      description: 'Comprehensive policy documenting administrative, physical, and technical safeguards required by the HIPAA Security Rule.'
    });
  }

  // Incident Response Plan
  if (answers['incident-response'] !== 'yes') {
    const reasons: string[] = [FAILURE_REASONS['incident-response']];
    
    // If there's breach history, this becomes even more critical
    if (answers['breach-history'] === 'yes-unreported' || answers['breach-history'] === 'yes-reported') {
      reasons.push(FAILURE_REASONS['breach-history']);
    }

    documents.push({
      id: 'incident-response',
      name: 'Incident Response Plan',
      severity: 'critical',
      missingReasons: reasons,
      description: 'Documented procedures for identifying, responding to, and reporting security incidents and data breaches as required by HIPAA.'
    });
  }

  // Breach Notification Policy
  // Show if there's breach history (always critical) OR if incident response is missing
  const hasBreachHistory = answers['breach-history'] === 'yes-unreported' || 
                          answers['breach-history'] === 'yes-reported';
  const hasIncidentResponse = answers['incident-response'] === 'yes';
  
  if (hasBreachHistory || !hasIncidentResponse) {
    const reasons: string[] = [];
    
    if (!hasIncidentResponse) {
      reasons.push('No documented breach notification procedures');
    }
    if (hasBreachHistory) {
      reasons.push('Breach history requires formal notification procedures');
    }

    // Only add if we have reasons (should always be true here, but safety check)
    if (reasons.length > 0) {
      documents.push({
        id: 'breach-notification',
        name: 'Breach Notification Policy',
        severity: 'critical',
        missingReasons: reasons,
        description: 'Policy outlining procedures for notifying patients, HHS, and media (if required) in the event of a data breach.'
      });
    }
  }

  // REQUIRED DOCUMENTS - Compliance Requirements

  // HIPAA Privacy Policy
  if (answers['privacy-policy'] !== 'yes') {
    documents.push({
      id: 'privacy-policy',
      name: 'HIPAA Privacy Policy',
      severity: 'required',
      missingReasons: [FAILURE_REASONS['privacy-policy']],
      description: 'Policy that informs patients of their rights regarding their protected health information, as required by the HIPAA Privacy Rule.'
    });
  }

  // Employee Training Policy
  if (answers['workforce-training'] === 'no' || answers['workforce-training'] === 'yes-some') {
    const reasons: string[] = [];
    if (answers['workforce-training'] === 'no') {
      reasons.push(FAILURE_REASONS['workforce-training']);
    } else {
      reasons.push(FAILURE_REASONS['workforce-training-partial']);
    }

    documents.push({
      id: 'employee-training',
      name: 'Employee Training Policy',
      severity: 'required',
      missingReasons: reasons,
      description: 'Documented policy outlining HIPAA training requirements for all workforce members who handle PHI.'
    });
  }

  // Sort: critical first, then required
  return documents.sort((a, b) => {
    if (a.severity === 'critical' && b.severity === 'required') return -1;
    if (a.severity === 'required' && b.severity === 'critical') return 1;
    return 0;
  });
}

