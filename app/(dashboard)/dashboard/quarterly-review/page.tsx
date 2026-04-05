import { getUserPlanTier } from '@/lib/plan-gating';
import { PlanGate } from '@/components/plan-gate';
import QuarterlyIndexClient from './quarterly-index-client';

export const dynamic = 'force-dynamic';

export default async function QuarterlyReviewPage() {
  const planTier = await getUserPlanTier();

  return (
    <PlanGate
      requiredPlan="clinic"
      currentPlan={planTier}
      featureName="Quarterly Compliance Reviews"
      features={[
        'Schedule and run structured quarterly compliance meetings',
        'Auto-populated pre-meeting brief from your live compliance data',
        'Live meeting facilitation mode with notes, decisions, and action items',
        'Permanent review record for board reporting and audit evidence',
        'Action items auto-promoted to compliance tracker',
      ]}
    >
      <QuarterlyIndexClient />
    </PlanGate>
  );
}
