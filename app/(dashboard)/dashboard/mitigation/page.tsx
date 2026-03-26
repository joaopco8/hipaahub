import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { getUserPlanTier, isPracticePlus } from '@/lib/plan-gating';
import { PlanGate } from '@/components/plan-gate';
import { getMitigationItems, getMitigationStats } from '@/app/actions/mitigation';
import MitigationBoard from '@/components/mitigation/mitigation-board';

export default async function MitigationPage() {
  const supabase = createClient();
  const user = await getUser(supabase);
  if (!user) return redirect('/signin');

  const planTier = await getUserPlanTier();
  const hasPractice = isPracticePlus(planTier);

  let items: any[] = [];
  let stats = { open: 0, in_progress: 0, done: 0, overdue: 0 };

  if (hasPractice) {
    try {
      [items, stats] = await Promise.all([getMitigationItems(), getMitigationStats()]);
    } catch (e) {
      console.error('Mitigation fetch error:', e);
    }
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="mb-2">
        <h2 className="text-2xl font-light text-[#0e274e]">Mitigation Workflow</h2>
        <p className="text-sm text-gray-400 font-light">
          Track and resolve compliance gaps from Risk Assessments and asset reviews
        </p>
      </div>

      <PlanGate
        requiredPlan="practice"
        currentPlan={planTier}
        featureName="Mitigation Workflow"
        features={[
          'Kanban board: Open → In Progress → Done',
          'Auto-create from Risk Assessment gaps',
          'Assignee + due date tracking with overdue alerts',
          'Comment threads and full history log',
          'Email notifications for assignments and completions',
        ]}
      >
        <MitigationBoard initialItems={items} mitigationStats={stats} />
      </PlanGate>
    </div>
  );
}
