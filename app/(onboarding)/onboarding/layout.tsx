'use client';

import { OnboardingProvider } from '@/contexts/onboarding-context';

export default function OnboardingLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Completely remove auth check from layout - let pages handle it individually
  // This prevents any blocking issues
  return <OnboardingProvider>{children}</OnboardingProvider>;
}


