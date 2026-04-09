import { createClient } from '@/utils/supabase/server';
import { getUser, getSubscription } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import {
  getTrainingRecords,
  getTrainingStats,
} from '@/app/actions/training';
import { getUserPlanTier, isPracticePlus } from '@/lib/plan-gating';
import {
  getEmployeesWithAssignments,
  getInactiveEmployeesWithAssignments,
  getTrainingModules,
} from '@/app/actions/staff-training';
import TrainingPageClient from '@/components/training/training-page-client';

export default async function TrainingPage() {
  const supabase = createClient();
  const user = await getUser(supabase);
  if (!user) return redirect('/signin');

  const [planTier, subscription] = await Promise.all([
    getUserPlanTier(),
    getSubscription(supabase, user.id),
  ]);

  const isLocked = !subscription || subscription.status === 'trialing';
  const hasPractice = isPracticePlus(planTier);

  let trainingRecords: any[] = [];
  let trainingStats = { completed: 0, pending: 0, expired: 0, total: 0 };
  let activeEmployees: any[] = [];
  let inactiveEmployees: any[] = [];
  let modules: any[] = [];

  try {
    const base = await Promise.all([getTrainingRecords(), getTrainingStats()]);
    trainingRecords = base[0];
    trainingStats = base[1];

    if (hasPractice) {
      const staff = await Promise.all([
        getEmployeesWithAssignments(),
        getInactiveEmployeesWithAssignments(),
        getTrainingModules(),
      ]);
      activeEmployees = staff[0];
      inactiveEmployees = staff[1];
      modules = staff[2];
    }
  } catch (err) {
    console.error('Training page fetch error:', err);
  }

  const userName =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    user.email ||
    'User';

  return (
    <TrainingPageClient
      trainingRecords={trainingRecords}
      trainingStats={trainingStats}
      userName={userName}
      userEmail={user.email ?? ''}
      activeEmployees={activeEmployees}
      inactiveEmployees={inactiveEmployees}
      modules={modules}
      planTier={planTier}
      hasPractice={hasPractice}
      isLocked={isLocked}
    />
  );
}
