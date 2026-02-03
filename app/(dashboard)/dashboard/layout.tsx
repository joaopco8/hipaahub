import { NavItem, navConfig } from '@/config/dashboard';
import { redirect } from 'next/navigation';
import { SidebarProvider } from '@/contexts/sidebar-context';
import SidebarLayout from '@/components/sidebar-layout';
import { SavingStateProvider } from '@/hooks/use-saving-state';
import { SavingBarGlobal } from '@/components/saving-bar-global';
import {
  getCachedUser,
  getCachedUserDetails,
  getCachedSubscription,
  getCachedOrganization,
  getCachedComplianceCommitment
} from '@/lib/cache/dashboard-cache';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const revalidate = 60; // Revalidate every 60 seconds

export default async function DashboardLayout({
  children
}: DashboardLayoutProps) {
  // Use cached functions to avoid duplicate queries
  const user = await getCachedUser();
  
  if (!user) {
    return redirect('/signin');
  }

  // All subsequent fetches use the same cached userId
  const [userDetails, subscription, organization, commitment] = await Promise.all([
    getCachedUserDetails(),
    getCachedSubscription(user.id),
    getCachedOrganization(user.id),
    getCachedComplianceCommitment(user.id)
  ]);
  
  // If user has active subscription, ALWAYS allow access (never redirect to checkout)
  if (subscription) {
    // Redirect to onboarding if not completed
    if (!organization || !commitment) {
      return redirect('/onboarding/expectation');
    }
    // User has subscription and onboarding complete → allow access
    // No need to check anything else
  } else {
    // User doesn't have subscription yet
    // Redirect to onboarding if not completed
    if (!organization || !commitment) {
      return redirect('/onboarding/expectation');
    }
    // Onboarding is complete but no subscription yet
    // Allow access anyway (webhook may still be processing after payment)
    // Don't redirect to checkout if onboarding is complete
  }

  return (
    <SavingStateProvider>
      <SavingBarGlobal />
      <SidebarProvider>
        <SidebarLayout
          userDetails={userDetails}
          navConfig={navConfig as NavItem[]}
        >
          {children}
        </SidebarLayout>
      </SidebarProvider>
    </SavingStateProvider>
  );
}
