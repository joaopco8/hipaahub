import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect, notFound } from 'next/navigation';
import { getUserPlanTier } from '@/lib/plan-gating';
import { PlanGate } from '@/components/plan-gate';
import PrepareClient from './prepare-client';

export const dynamic = 'force-dynamic';

export default async function PreparePage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const user = await getUser(supabase);
  if (!user) return redirect('/signin');

  const planTier = await getUserPlanTier();

  const { data: org } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('user_id', user.id)
    .single();
  if (!org) return redirect('/dashboard');

  // Fetch review
  const { data: review } = await (supabase as any)
    .from('quarterly_reviews')
    .select('*')
    .eq('id', params.id)
    .eq('org_id', (org as any).id)
    .single();
  if (!review) return notFound();

  // Fetch attendees
  const { data: attendees } = await (supabase as any)
    .from('quarterly_review_attendees')
    .select('*')
    .eq('review_id', params.id);

  return (
    <PlanGate
      requiredPlan="clinic"
      currentPlan={planTier}
      featureName="Quarterly Compliance Reviews"
      features={[]}
    >
      <PrepareClient
        review={review}
        attendees={attendees ?? []}
        orgName={(org as any).name ?? ''}
      />
    </PlanGate>
  );
}
