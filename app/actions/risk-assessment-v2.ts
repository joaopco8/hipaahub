'use server';

import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { revalidatePath } from 'next/cache';
import { QUESTIONS, DOMAIN_MAX, TOTAL_MAX } from '@/app/(dashboard)/dashboard/risk-assessment/questions';

// ─── Types ───────────────────────────────────────────────────────────────────

type Tier = 'PROTECTED' | 'PARTIAL' | 'AT_RISK' | 'CRITICAL';

export interface V2ScoreResult {
  totalRaw: number;
  displayScore: number;
  tier: Tier;
  domainScores: Record<number, { raw: number; max: number; display: number }>;
}

// ─── Pure scoring function (exported, not a server action) ────────────────────

export function calculateV2Scores(answers: Record<string, string>): V2ScoreResult {
  // Accumulate raw scores per domain
  const domainRaw: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

  for (const question of QUESTIONS) {
    const answer = answers[question.id];
    if (answer === undefined || answer === null || answer === '') continue;

    let questionRisk = 0;

    if (question.isMulti) {
      // Q2: take the MAX riskPoints among all selected letters
      const selectedLetters = answer.split(',').map((l) => l.trim()).filter(Boolean);
      let maxPoints = 0;
      for (const letter of selectedLetters) {
        const opt = question.options.find((o) => o.letter === letter);
        if (opt && opt.riskPoints > maxPoints) {
          maxPoints = opt.riskPoints;
        }
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

// ─── Server Actions ───────────────────────────────────────────────────────────

export async function autoSaveV2Answers(
  answers: Record<string, string>
): Promise<{ success: boolean }> {
  try {
    const supabase = createClient();
    const user = await getUser(supabase);
    if (!user) return { success: false };

    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (orgError || !org) return { success: false };

    const { error } = await (supabase as any)
      .from('onboarding_risk_assessments')
      .upsert(
        {
          user_id: user.id,
          organization_id: org.id,
          answers,
        },
        { onConflict: 'user_id' }
      );

    if (error) {
      console.error('[autoSaveV2Answers] upsert error:', error);
      return { success: false };
    }

    return { success: true };
  } catch (err) {
    console.error('[autoSaveV2Answers] unexpected error:', err);
    return { success: false };
  }
}

export async function loadV2Assessment(): Promise<any> {
  try {
    const supabase = createClient();
    const user = await getUser(supabase);
    if (!user) return null;

    const { data, error } = await (supabase as any)
      .from('onboarding_risk_assessments')
      .select('answers, domain_scores, display_score, tier, updated_at, completed_by')
      .eq('user_id', user.id)
      .single();

    if (error) {
      // PGRST116 = no rows found; that is not an error in our case
      if (error.code === 'PGRST116') return null;
      console.error('[loadV2Assessment] query error:', error);
      return null;
    }

    return data ?? null;
  } catch (err) {
    console.error('[loadV2Assessment] unexpected error:', err);
    return null;
  }
}

export async function completeV2Assessment(
  answers: Record<string, string>,
  completedBy: string
): Promise<{ success: boolean }> {
  try {
    const supabase = createClient();
    const user = await getUser(supabase);
    if (!user) return { success: false };

    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (orgError || !org) return { success: false };

    const { totalRaw, displayScore, tier, domainScores } = calculateV2Scores(answers);

    const risk_level =
      displayScore >= 85 ? 'low' : displayScore >= 55 ? 'medium' : 'high';

    const assessedAt = new Date().toISOString();

    // Upsert the primary assessment record
    const { error: upsertError } = await (supabase as any)
      .from('onboarding_risk_assessments')
      .upsert(
        {
          user_id: user.id,
          organization_id: org.id,
          answers,
          domain_scores: domainScores,
          display_score: displayScore,
          tier,
          completed_by: completedBy,
          risk_level,
          risk_percentage: displayScore,
          total_risk_score: totalRaw,
          max_possible_score: TOTAL_MAX,
        },
        { onConflict: 'user_id' }
      );

    if (upsertError) {
      console.error('[completeV2Assessment] upsert error:', upsertError);
      return { success: false };
    }

    // Insert historical record
    const { error: historyError } = await (supabase as any)
      .from('risk_assessment_history')
      .insert({
        user_id: user.id,
        organization_id: org.id,
        answers,
        risk_level,
        risk_percentage: displayScore,
        total_risk_score: totalRaw,
        max_possible_score: TOTAL_MAX,
        display_score: displayScore,
        domain_scores: domainScores,
        tier,
        completed_by: completedBy,
        assessed_at: assessedAt,
      });

    if (historyError) {
      // History insert failure is non-fatal — log but don't fail the action
      console.error('[completeV2Assessment] history insert error:', historyError);
    }

    revalidatePath('/dashboard/risk-assessment');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (err) {
    console.error('[completeV2Assessment] unexpected error:', err);
    return { success: false };
  }
}
