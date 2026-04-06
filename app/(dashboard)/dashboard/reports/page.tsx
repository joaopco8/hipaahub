import { getUserPlanTier } from '@/lib/plan-gating';
import { PlanGate } from '@/components/plan-gate';
import BoardReportClient from './board-report-client';

export const revalidate = 0;

export default async function BoardReportsPage() {
  const planTier = await getUserPlanTier();

  return (
    <PlanGate
      requiredPlan="clinic"
      currentPlan={planTier}
      featureName="Board & Executive Reports"
      features={[
        'Compliance score overview formatted for governance meetings',
        'Risk, policy, training and BAA summary in one view',
        'Exportable board-ready PDF with cover page and signed statement',
        'Score trend chart across the last 4 quarters',
        'Compliance officer statement with custom branding',
      ]}
    >
      <BoardReportClient />
    </PlanGate>
  );
}
