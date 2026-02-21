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
  
  // Log for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log('Dashboard Layout: User:', user.id);
    console.log('Dashboard Layout: Has subscription:', !!subscription);
    console.log('Dashboard Layout: Has organization:', !!organization);
    console.log('Dashboard Layout: Has commitment:', !!commitment);
  }
  
  // Redirect to onboarding if not completed (regardless of subscription)
  if (!organization || !commitment) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Dashboard Layout: Onboarding incomplete, redirecting to onboarding');
    }
    return redirect('/onboarding/expectation');
  }

  // If onboarding is complete, ALWAYS allow access to dashboard
  // Even if subscription hasn't synced yet (webhook may still be processing)
  // NEVER redirect to checkout if onboarding is complete
  if (process.env.NODE_ENV === 'development') {
    console.log('Dashboard Layout: Onboarding complete, allowing dashboard access');
    if (!subscription) {
      console.log('Dashboard Layout: No subscription yet, but onboarding complete - allowing access');
    }
  }

  return (
    <SavingStateProvider>
      <SavingBarGlobal />
      <SidebarProvider>
        <SidebarLayout
          userDetails={userDetails}
          organization={organization}
          navConfig={navConfig as NavItem[]}
        >
          {children}
        </SidebarLayout>
      </SidebarProvider>
    </SavingStateProvider>
  );
}
