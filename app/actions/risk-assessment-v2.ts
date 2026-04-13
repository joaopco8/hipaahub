'use server';

import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { revalidatePath } from 'next/cache';
import { TOTAL_MAX } from '@/app/(dashboard)/dashboard/risk-assessment/questions';
import { calculateV2Scores } from '@/lib/risk-assessment-v2-scoring';

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

    // Generate and save action items from the completed assessment
    try {
      const { generateActionItems } = await import('@/lib/generate-action-items');
      const actionItems = generateActionItems(answers);

      if (actionItems.length > 0) {
        // Replace any existing action items for this user
        await (supabase as any).from('action_items').delete().eq('user_id', user.id);

        const itemsToInsert = actionItems.map(item => ({
          user_id: user.id,
          organization_id: org.id,
          item_key: item.itemKey,
          title: item.title,
          description: item.description,
          priority: item.priority,
          category: item.category,
          status: 'pending',
        }));

        const { error: insertError } = await (supabase as any)
          .from('action_items')
          .insert(itemsToInsert);

        if (insertError) {
          console.error('[completeV2Assessment] action items insert error:', insertError);
        }
      }
    } catch (err) {
      console.error('[completeV2Assessment] action items generation error:', err);
    }

    revalidatePath('/dashboard/risk-assessment');
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/action-items');

    return { success: true };
  } catch (err) {
    console.error('[completeV2Assessment] unexpected error:', err);
    return { success: false };
  }
}
