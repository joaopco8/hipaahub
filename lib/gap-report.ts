/**
 * Gap Report Generator
 *
 * Produces a structured gap report from risk assessment answers.
 * For every non-compliant answer (riskScore > 0), produces a GapItem with:
 *   - question text and current answer label
 *   - required standard (from remediations config)
 *   - risk level (High / Medium / Low)
 *   - remediation recommendation
 *
 * Grouped by category: Administrative | Physical | Technical
 * Sorted within each category: High → Medium → Low
 */

import { QUESTIONS } from '@/app/(onboarding)/onboarding/risk-assessment/questions';
import { getRemediation, type RiskLevel } from '@/config/remediations';

export interface GapItem {
  question_id: string;
  category: 'administrative' | 'physical' | 'technical';
  category_label: string;
  question_text: string;
  current_answer: string;   // human-readable label of the chosen option
  required_standard: string;
  risk_level: RiskLevel;
  recommendation: string;
  hipaa_citation: string;
}

export interface GapReport {
  administrative: GapItem[];
  physical: GapItem[];
  technical: GapItem[];
  total_gaps: number;
  high_count: number;
  medium_count: number;
  low_count: number;
}

const RISK_ORDER: Record<RiskLevel, number> = { high: 0, medium: 1, low: 2 };

/**
 * Build a gap report from a completed assessment answers map.
 * @param answers Record<questionId, selectedValue>
 */
export function buildGapReport(answers: Record<string, string>): GapReport {
  const items: GapItem[] = [];

  for (const question of QUESTIONS) {
    const selectedValue = answers[question.id];
    if (!selectedValue) continue;

    // Find the chosen option
    const chosen = question.options.find((o) => o.value === selectedValue);
    if (!chosen) continue;

    // Non-compliant = any answer with riskScore > 0
    if (chosen.riskScore === 0) continue;

    const remediation = getRemediation(question.id);

    items.push({
      question_id: question.id,
      category: question.category,
      category_label: question.categoryLabel,
      question_text: question.text,
      current_answer: chosen.label,
      required_standard: remediation.required_standard,
      risk_level: remediation.risk_level,
      recommendation: remediation.recommendation,
      hipaa_citation: question.hipaaCitation ?? remediation.hipaa_citation,
    });
  }

  // Sort each category: High → Medium → Low
  const sortItems = (arr: GapItem[]) =>
    arr.sort((a, b) => RISK_ORDER[a.risk_level] - RISK_ORDER[b.risk_level]);

  const administrative = sortItems(items.filter((i) => i.category === 'administrative'));
  const physical = sortItems(items.filter((i) => i.category === 'physical'));
  const technical = sortItems(items.filter((i) => i.category === 'technical'));

  const high_count = items.filter((i) => i.risk_level === 'high').length;
  const medium_count = items.filter((i) => i.risk_level === 'medium').length;
  const low_count = items.filter((i) => i.risk_level === 'low').length;

  return {
    administrative,
    physical,
    technical,
    total_gaps: items.length,
    high_count,
    medium_count,
    low_count,
  };
}
