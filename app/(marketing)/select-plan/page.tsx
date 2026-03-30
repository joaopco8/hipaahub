import { createClient } from '@/utils/supabase/server';
import { getUser, getSubscription, getRiskAssessment } from '@/utils/supabase/queries';
import { toSubscriptionStatus, getTrialDaysRemaining } from '@/lib/plans';
import { getPolicyGenerationStatus } from '@/app/actions/policy-documents';
import { getEvidenceStatistics } from '@/app/actions/compliance-evidence';
import SelectPlanClient, { type TrialContext } from './select-plan-client';

export default async function SelectPlanPage() {
  let trialContext: TrialContext | null = null;

  try {
    const supabase = createClient();
    const user = await getUser(supabase);

    if (user) {
      const subscription = await getSubscription(supabase, user.id);
      const subscriptionStatus = toSubscriptionStatus(subscription?.status);

      if (subscriptionStatus === 'trial' || subscriptionStatus === 'expired') {
        const trialDaysRemaining =
          subscriptionStatus === 'trial'
            ? getTrialDaysRemaining(subscription?.trial_end ?? null)
            : null;

        // Fetch org data in parallel for the "what you've built" section
        const [policyMap, riskAssessment, evidenceResult] = await Promise.all([
          getPolicyGenerationStatus().catch(() => new Map()),
          getRiskAssessment(supabase, user.id).catch(() => null),
          getEvidenceStatistics().catch(() => ({ total: 0 })),
        ]);

        const policiesDrafted = policyMap.size;
        const policiesActive = Array.from(policyMap.values()).filter(
          (p) => p.policy_status === 'active'
        ).length;
        const riskAssessmentComplete = !!riskAssessment?.risk_level;
        const evidenceCount = (evidenceResult as any)?.total ?? 0;

        // Simple compliance score: policies (50%) + risk assessment (50%)
        const docScore = Math.round((policiesActive / 9) * 50);
        const riskScore = riskAssessmentComplete ? 50 : 0;
        const complianceScore = Math.min(100, docScore + riskScore);

        trialContext = {
          subscriptionStatus,
          trialDaysRemaining,
          policiesDrafted,
          riskAssessmentComplete,
          evidenceCount,
          complianceScore,
        };
      }
    }
  } catch {
    // If any fetch fails, render the page without the trial banner
  }

  return <SelectPlanClient trialContext={trialContext} />;
}
