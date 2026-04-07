import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { getUserPlanTier, isPracticePlus } from '@/lib/plan-gating';
import { PlanGate } from '@/components/plan-gate';
import BAATrackerClient from '@/components/baa/baa-tracker-client';
import { getVendorsWithBAA, getBAAStats } from '@/app/actions/baa-tracker';
import { getSubscription } from '@/utils/supabase/queries';

export default async function VendorsPage() {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) return redirect('/signin');

  const [planTier, subscription] = await Promise.all([
    getUserPlanTier(),
    getSubscription(supabase, user.id),
  ]);
  const isLocked = !subscription || subscription.status === 'trialing';
  const hasPractice = isPracticePlus(planTier);

  let vendors: any[] = [];
  let stats = { total_vendors: 0, active: 0, expiring_soon: 0, expired: 0, not_signed: 0 };

  if (hasPractice) {
    try {
      [vendors, stats] = await Promise.all([getVendorsWithBAA(), getBAAStats()]);
    } catch (e) {
      console.error('BAA tracker fetch error:', e);
    }
  }

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Header */}
      <div className="mb-2">
        <h2 className="text-2xl font-light text-[#0e274e]">BAA Tracker</h2>
        <p className="text-sm text-gray-400 font-light">
          Track Business Associate Agreements, expiration dates, and vendor PHI exposure
        </p>
      </div>

      {/* BAA Tracker — Practice+ feature */}
      <PlanGate
        requiredPlan="practice"
        currentPlan={planTier}
        featureName="BAA Tracker"
        features={[
          'Track all vendor BAA status in one dashboard',
          'Expiration alerts at 90, 60, and 30 days',
          'Exposure list: vendors without a signed BAA',
          'BAA audit report exportable as PDF',
          'Status badges: Active / Expiring Soon / Expired / Not Signed',
        ]}
      >
        <BAATrackerClient initialVendors={vendors} initialStats={stats} isLocked={isLocked} />
      </PlanGate>
    </div>
  );
}
