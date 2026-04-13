/**
 * Generate Action Items from Risk Assessment Answers (v2 — 68 questions)
 *
 * Derives action items directly from the QUESTIONS array using Q1–Q68 answer keys.
 * An action item is created for every question whose selected answer has riskPoints >= 2.
 */

import { QUESTIONS, type Question } from '@/app/(dashboard)/dashboard/risk-assessment/questions';

export interface ActionItemData {
  itemKey: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium';
  category: string;
}

// Default category by domain
const DOMAIN_CATEGORY: Record<number, string> = {
  1: 'Security',
  2: 'Security',
  3: 'Security',
  4: 'Security',
  5: 'Contracts',
  6: 'Policies',
};

// Per-question category overrides
const QUESTION_CATEGORY: Record<string, string> = {
  Q55: 'Administrative', // Designate Privacy Officer
  Q57: 'Training',       // Initial staff training
  Q58: 'Training',       // Annual staff training
  Q59: 'Administrative', // Sanctions policy
  Q61: 'Administrative', // Security Risk Assessment
  Q62: 'Administrative', // Risk Management Plan
  Q63: 'Administrative', // Contingency Plan
};

/** For multi-select questions (Q2), take the highest riskPoints among selected options. */
function getEffectiveRiskPoints(question: Question, answer: string): number {
  if (question.isMulti) {
    const letters = answer.split(',').map(l => l.trim());
    return Math.max(0, ...letters.map(letter => {
      const opt = question.options.find(o => o.letter === letter);
      return opt?.riskPoints ?? 0;
    }));
  }
  const opt = question.options.find(o => o.letter === answer);
  return opt?.riskPoints ?? 0;
}

function getPriority(riskPoints: number): 'critical' | 'high' | 'medium' {
  if (riskPoints >= 3) return 'critical';
  if (riskPoints === 2) return 'high';
  return 'medium';
}

/** Extract the first sentence of the remediation text as the action item title. */
function titleFromRemediation(remediation: string): string {
  const sentence = remediation.replace(/\s+/g, ' ').split(/\.\s/)[0].replace(/\.$/, '');
  return sentence.length <= 80 ? sentence : sentence.slice(0, 77) + '...';
}

/**
 * Generate action items based on Q1–Q68 risk assessment answers.
 * Each answer is a letter string ('A'–'E'); Q2 may be comma-separated ('A,C').
 */
export function generateActionItems(
  answers: Record<string, string>
): ActionItemData[] {
  const items: ActionItemData[] = [];

  for (const question of QUESTIONS) {
    const answer = answers[question.id];
    if (!answer) continue;

    const riskPoints = getEffectiveRiskPoints(question, answer);
    if (riskPoints < 2) continue;

    items.push({
      itemKey: `q_${question.id.toLowerCase()}`,
      title: titleFromRemediation(question.remediation),
      description: question.remediation,
      priority: getPriority(riskPoints),
      category: QUESTION_CATEGORY[question.id] ?? DOMAIN_CATEGORY[question.domain],
    });
  }

  const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2 };
  return items.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}
