import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { getUserPlanTier } from '@/lib/plan-gating';
import { PlanGate } from '@/components/plan-gate';
import CalendarClient from './calendar-client';

export const dynamic = 'force-dynamic';

export default async function ComplianceCalendarPage() {
  const supabase = createClient();
  const user = await getUser(supabase);
  if (!user) return redirect('/signin');

  const planTier = await getUserPlanTier();

  const { data: org } = await supabase
    .from('organizations')
    .select('name')
    .eq('user_id', user.id)
    .single();

  const orgName = (org as any)?.name ?? 'Your Organization';

  return (
    <PlanGate
      requiredPlan="clinic"
      currentPlan={planTier}
      featureName="Compliance Program Calendar"
      features={[
        'Every deadline, renewal, and review in one calendar',
        'Auto-generated events from your policies, BAAs, and training records',
        'Assign owners, track status, mark complete, and snooze',
        'Export to Google Calendar, Outlook, or Apple Calendar (.ics)',
        'Automated email reminders at 90/60/30/7/1 days before due',
      ]}
    >
      <CalendarClient orgName={orgName} />
    </PlanGate>
  );
}
