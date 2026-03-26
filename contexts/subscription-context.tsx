'use client';

import { createContext, useContext } from 'react';
import type { PlanTier } from '@/lib/plan-gating';
import type { SubscriptionStatus } from '@/lib/plans';

interface SubscriptionContextValue {
  /** True when user is on trial or has no active subscription — blocks exports/downloads. */
  isLocked: boolean;
  /** Current plan tier. */
  planTier: PlanTier;
  /** Granular subscription status. */
  subscriptionStatus: SubscriptionStatus;
  /** Days remaining in trial, or null if not on trial. */
  trialDaysRemaining: number | null;
}

const SubscriptionContext = createContext<SubscriptionContextValue>({
  isLocked: true,
  planTier: 'unknown',
  subscriptionStatus: 'expired',
  trialDaysRemaining: null,
});

export function SubscriptionProvider({
  value,
  children,
}: {
  value: SubscriptionContextValue;
  children: React.ReactNode;
}) {
  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

/** Access subscription status and lock state from any client component under DashboardLayout. */
export function useSubscription() {
  return useContext(SubscriptionContext);
}
