import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect, notFound } from 'next/navigation';
import { getUserPlanTier } from '@/lib/plan-gating';
import { PlanGate } from '@/components/plan-gate';
import MeetingClient from './meeting-client';

export const dynamic = 'force-dynamic';

export default async function MeetingPage({ params }: { params: { id: string } }) {
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

  const { data: review } = await (supabase as any)
    .from('quarterly_reviews')
    .select('*')
    .eq('id', params.id)
    .eq('org_id', (org as any).id)
    .single();
  if (!review) return notFound();

  const [sectionsRes, attendeesRes] = await Promise.all([
    (supabase as any)
      .from('quarterly_review_sections')
      .select('*')
      .eq('review_id', params.id)
      .order('section_order'),
    (supabase as any)
      .from('quarterly_review_attendees')
      .select('*')
      .eq('review_id', params.id),
  ]);

  // Fetch decisions and action items for each section
  const [decisionsRes, actionItemsRes] = await Promise.all([
    (supabase as any).from('quarterly_review_decisions').select('*').eq('review_id', params.id),
    (supabase as any).from('quarterly_review_action_items').select('*').eq('review_id', params.id),
  ]);

  const sections = (sectionsRes.data ?? []).map((s: any) => ({
    ...s,
    decisions: (decisionsRes.data ?? []).filter((d: any) => d.section_id === s.id),
    action_items: (actionItemsRes.data ?? []).filter((a: any) => a.section_id === s.id),
  }));

  return (
    <PlanGate
      requiredPlan="clinic"
      currentPlan={planTier}
      featureName="Quarterly Compliance Reviews"
      features={[]}
    >
      <MeetingClient
        review={review}
        sections={sections}
        attendees={attendeesRes.data ?? []}
        orgName={(org as any).name ?? ''}
      />
    </PlanGate>
  );
}
