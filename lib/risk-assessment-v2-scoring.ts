import { QUESTIONS, DOMAIN_MAX, TOTAL_MAX } from '@/app/(dashboard)/dashboard/risk-assessment/questions';

export type Tier = 'PROTECTED' | 'PARTIAL' | 'AT_RISK' | 'CRITICAL';

export interface V2ScoreResult {
  totalRaw: number;
  displayScore: number;
  tier: Tier;
  domainScores: Record<number, { raw: number; max: number; display: number }>;
}

export function calculateV2Scores(answers: Record<string, string>): V2ScoreResult {
  const domainRaw: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

  for (const question of QUESTIONS) {
    const answer = answers[question.id];
    if (!answer) continue;

    let questionRisk = 0;

    if (question.isMulti) {
      const selectedLetters = answer.split(',').map((l) => l.trim()).filter(Boolean);
      let maxPoints = 0;
      for (const letter of selectedLetters) {
        const opt = question.options.find((o) => o.letter === letter);
        if (opt && opt.riskPoints > maxPoints) maxPoints = opt.riskPoints;
      }
      questionRisk = maxPoints;
    } else {
      const opt = question.options.find((o) => o.letter === answer.trim());
      questionRisk = opt ? opt.riskPoints : 0;
    }

    domainRaw[question.domain] = (domainRaw[question.domain] ?? 0) + questionRisk;
  }

  const totalRaw = Object.values(domainRaw).reduce((sum, v) => sum + v, 0);
  const displayScore = Math.round(100 - (totalRaw / TOTAL_MAX) * 100);

  let tier: Tier;
  if (totalRaw <= 30) tier = 'PROTECTED';
  else if (totalRaw <= 60) tier = 'PARTIAL';
  else if (totalRaw <= 100) tier = 'AT_RISK';
  else tier = 'CRITICAL';

  const domainScores: Record<number, { raw: number; max: number; display: number }> = {};
  for (const domainId of [1, 2, 3, 4, 5, 6] as const) {
    const raw = domainRaw[domainId] ?? 0;
    const max = DOMAIN_MAX[domainId];
    const display = Math.round(100 - (raw / max) * 100);
    domainScores[domainId] = { raw, max, display };
  }

  return { totalRaw, displayScore, tier, domainScores };
}
