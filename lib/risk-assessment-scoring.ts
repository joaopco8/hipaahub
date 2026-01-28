/**
 * HIPAA Risk Assessment Scoring Engine
 * 
 * Implements a weighted, rule-based scoring model that:
 * - Prioritizes critical HIPAA failures
 * - Prevents misleading "Low Risk" results when critical safeguards are missing
 * - Uses category weighting aligned with OCR enforcement priorities
 * - Applies logical overrides for critical failures
 */

export interface Question {
  id: string;
  category: 'administrative' | 'physical' | 'technical';
  categoryLabel?: string;
  text: string;
  options: { value: string; label: string; riskScore: number }[];
  skipIf?: { questionId: string; answer: string };
  helpText?: string;
}

export interface ScoringResult {
  totalRiskScore: number;
  maxPossibleScore: number;
  riskPercentage: number;
  riskLevel: 'low' | 'medium' | 'high';
  criticalFailures: string[];
  appliedOverrides: string[];
}

// CRITICAL questions that force minimum risk levels if failed
// Based on SRA Questionnaire v2.0 - Severity Weight 5 (Critical)
const CRITICAL_QUESTIONS = [
  'security-officer',
  'privacy-officer',
  'risk-assessment-conducted',
  'risk-management-plan',
  'workforce-termination',
  'incident-response-plan',
  'incident-detection-analysis',
  'breach-notification-procedures',
  'breach-history',
  'business-associates',
  'baa-breach-notification',
  'data-backup-procedures',
  'encryption-at-rest',
  'encryption-in-transit',
  'unique-user-ids',
  'audit-log-configuration',
  'audit-log-review',
  'firewall-implementation',
  'lost-stolen-device-procedures',
  'breach-assessment-procedures',
  'breach-notification-timeline',
  'hhs-breach-notification',
  'media-notification'
] as const;

// IMPORTANT questions that get 2x weight multiplier
// Based on SRA Questionnaire v2.0 - Severity Weight 4 (High)
const IMPORTANT_QUESTIONS = [
  'sanction-policy',
  'information-system-activity-review',
  'workforce-authorization',
  'workforce-supervision',
  'access-control-policies',
  'access-authorization',
  'access-termination',
  'security-awareness-training',
  'initial-hipaa-training',
  'incident-reporting-training',
  'incident-mitigation-recovery',
  'baa-monitoring',
  'contingency-plan',
  'disaster-recovery-testing',
  'documentation-retention',
  'facility-access-policies',
  'facility-security-plan',
  'access-control-surveillance',
  'workstation-use-policy',
  'device-inventory',
  'device-disposal',
  'device-reuse',
  'portable-device-security',
  'automatic-logoff',
  'audit-log-retention',
  'audit-log-protection',
  'email-security',
  'vpn-remote-access',
  'multi-factor-authentication',
  'role-based-access-control',
  'antivirus-software',
  'malware-scanning',
  'patch-management',
  'system-patching',
  'firewall-rules',
  'cloud-baa',
  'phishing-social-engineering-training',
  'mobile-device-management',
  'workforce-exit-procedures',
  'workforce-termination-for-cause',
  'vendor-risk-assessment',
  'vendor-data-handling-security',
  'vendor-compliance-monitoring',
  'cloud-service-provider-security',
  'incident-response-team',
  'breach-documentation',
  'incident-communication-plan',
  'secure-disposal-utilities',
  'intrusion-detection-prevention',
  'vulnerability-scanning',
  'backup-encryption',
  'key-management',
  'database-security',
  'secure-file-transfer'
] as const;

// Category weights based on OCR enforcement priorities
const CATEGORY_WEIGHTS = {
  administrative: 1.5,
  technical: 1.2,
  physical: 1.0
} as const;

/**
 * Get question-specific weight multiplier
 */
function getQuestionWeight(questionId: string): number {
  if (IMPORTANT_QUESTIONS.includes(questionId as any)) {
    return 2.0;
  }
  return 1.0;
}

/**
 * Get category weight multiplier
 */
function getCategoryWeight(category: 'administrative' | 'physical' | 'technical'): number {
  return CATEGORY_WEIGHTS[category];
}

/**
 * Check for critical failures in answers
 */
function checkCriticalFailures(
  answers: Record<string, string>,
  questions: Question[]
): string[] {
  const failures: string[] = [];

  CRITICAL_QUESTIONS.forEach(questionId => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    const answer = answers[questionId];
    if (!answer) return;

    // Find the highest risk option for this question
    const highestRiskOption = question.options.reduce((max, opt) =>
      opt.riskScore > max.riskScore ? opt : max
    );

    // Check if user selected the highest risk option
    const selectedOption = question.options.find(opt => opt.value === answer);
    if (selectedOption && selectedOption.riskScore === highestRiskOption.riskScore) {
      failures.push(questionId);
    }
  });

  return failures;
}

/**
 * Calculate weighted risk score
 */
export function calculateRiskScore(
  answers: Record<string, string>,
  questions: Question[]
): ScoringResult {
  let totalRiskScore = 0;
  let maxPossibleScore = 0;
  const appliedOverrides: string[] = [];

  // Calculate weighted scores for each question
  questions.forEach(question => {
    const answer = answers[question.id];
    if (!answer) return;

    const selectedOption = question.options.find(opt => opt.value === answer);
    if (!selectedOption) return;

    // Calculate weights
    const questionWeight = getQuestionWeight(question.id);
    const categoryWeight = getCategoryWeight(question.category);
    const totalWeight = questionWeight * categoryWeight;

    // Add to totals
    const weightedScore = selectedOption.riskScore * totalWeight;
    totalRiskScore += weightedScore;

    // Calculate max possible score for this question
    const maxOptionScore = Math.max(...question.options.map(o => o.riskScore));
    maxPossibleScore += maxOptionScore * totalWeight;
  });

  // Calculate risk percentage
  const riskPercentage = maxPossibleScore > 0
    ? (totalRiskScore / maxPossibleScore) * 100
    : 0;

  // Initial classification based on percentage
  let initialLevel: 'low' | 'medium' | 'high';
  if (riskPercentage < 20) {
    initialLevel = 'low';
  } else if (riskPercentage < 50) {
    initialLevel = 'medium';
  } else {
    initialLevel = 'high';
  }

  // Check for critical failures
  const criticalFailures = checkCriticalFailures(answers, questions);

  // Apply overrides
  let finalLevel: 'low' | 'medium' | 'high' = initialLevel;

  // Priority 1: Unreported breach forces High Risk
  if (answers['breach-history'] === 'yes-unreported') {
    finalLevel = 'high';
    appliedOverrides.push('unreported-breach-high-risk');
  }
  // Priority 2: Multiple critical failures force High Risk
  else if (criticalFailures.length >= 2) {
    finalLevel = 'high';
    appliedOverrides.push('multiple-critical-failures-high-risk');
  }
  // Priority 3: Single critical failure forces minimum Medium Risk
  else if (criticalFailures.length === 1) {
    if (initialLevel === 'low') {
      finalLevel = 'medium';
      appliedOverrides.push('critical-failure-minimum-medium-risk');
    } else {
      finalLevel = initialLevel;
    }
  }

  return {
    totalRiskScore,
    maxPossibleScore,
    riskPercentage: Number(riskPercentage.toFixed(2)),
    riskLevel: finalLevel,
    criticalFailures,
    appliedOverrides
  };
}

/**
 * Get human-readable explanation of risk level
 */
export function getRiskLevelExplanation(
  result: ScoringResult,
  questions: Question[]
): string {
  const explanations: string[] = [];

  if (result.appliedOverrides.includes('unreported-breach-high-risk')) {
    explanations.push('Unreported breach history indicates significant compliance risk.');
  }

  if (result.appliedOverrides.includes('multiple-critical-failures-high-risk')) {
    explanations.push('Multiple critical HIPAA safeguards are missing.');
  }

  if (result.appliedOverrides.includes('critical-failure-minimum-medium-risk')) {
    const failure = result.criticalFailures[0];
    const question = questions.find(q => q.id === failure);
    if (question) {
      explanations.push(`Critical safeguard missing: ${question.text}`);
    }
  }

  if (explanations.length === 0) {
    explanations.push(`Risk level based on overall compliance score of ${result.riskPercentage}%.`);
  }

  return explanations.join(' ');
}

