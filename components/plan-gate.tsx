'use client';

import { Lock, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { PlanTier } from '@/lib/plan-gating';

interface PlanGateProps {
  /** The minimum plan required to access this feature. */
  requiredPlan: PlanTier;
  /** The user's current plan tier (passed from server component). */
  currentPlan: PlanTier;
  /** Feature name shown in the locked state. */
  featureName: string;
  /** Bullet points that describe what the upgrade unlocks. */
  features?: string[];
  children: React.ReactNode;
}

const PLAN_LABELS: Record<PlanTier, string> = {
  unknown: 'a paid plan',
  solo: 'Solo',
  practice: 'Practice',
  clinic: 'Clinic',
  enterprise: 'Enterprise',
};

const TIER_RANK: Record<PlanTier, number> = {
  unknown: 0,
  solo: 1,
  practice: 2,
  clinic: 3,
  enterprise: 4,
};

export function PlanGate({
  requiredPlan,
  currentPlan,
  featureName,
  features = [],
  children,
}: PlanGateProps) {
  const hasAccess = TIER_RANK[currentPlan] >= TIER_RANK[requiredPlan];
  if (hasAccess) return <>{children}</>;

  return (
    <>
      {/* Blurred, non-interactive preview of the locked content */}
      <div className="pointer-events-none select-none blur-sm opacity-30 w-full">
        {children}
      </div>

      {/* Full-screen fixed overlay — blocks all interaction */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
        <div className="mx-4 w-full max-w-md bg-white border border-gray-200 shadow-2xl p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#0e274e]/10">
            <Lock className="h-7 w-7 text-[#0e274e]" />
          </div>

          <h3 className="text-xl font-light text-[#0e274e] mb-2">{featureName}</h3>
          <p className="text-sm text-gray-500 font-light mb-4">
            This feature is available on the{' '}
            <span className="font-medium text-[#0e274e]">{PLAN_LABELS[requiredPlan]}</span> plan
            and above.
          </p>

          {features.length > 0 && (
            <ul className="mb-6 text-left space-y-2">
              {features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600 font-light">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#00bceb] flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          )}

          <Link href="/select-plan">
            <Button className="bg-[#00bceb] text-white hover:bg-[#00a8d4] rounded-none w-full font-light">
              Upgrade to {PLAN_LABELS[requiredPlan]}
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>

          <p className="mt-3 text-xs text-gray-400 font-light">
            Current plan:{' '}
            <span className="capitalize">{PLAN_LABELS[currentPlan] ?? 'Unknown'}</span>
          </p>
        </div>
      </div>
    </>
  );
}
