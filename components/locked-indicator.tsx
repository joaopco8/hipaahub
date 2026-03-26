'use client';

import { Lock } from 'lucide-react';
import Link from 'next/link';

interface LockedIndicatorProps {
  requiredPlan: 'practice' | 'clinic';
}

const PLAN_LABELS: Record<string, string> = {
  practice: 'Practice',
  clinic: 'Clinic',
};

/**
 * Inline "N/A 🔒" element for dashboard metric cards that are locked by plan tier.
 * Clicking navigates to /select-plan.
 */
export function LockedIndicator({ requiredPlan }: LockedIndicatorProps) {
  const label = PLAN_LABELS[requiredPlan] ?? 'higher';

  return (
    <Link
      href="/select-plan"
      title={`Available on ${label} plan · Upgrade →`}
      className="group inline-flex items-center gap-1.5 text-gray-400 hover:text-[#0e274e] transition-colors"
    >
      <span className="text-3xl font-light leading-none">N/A</span>
      <Lock className="h-4 w-4 text-gray-300 group-hover:text-[#00bceb] transition-colors mt-0.5" />
    </Link>
  );
}
