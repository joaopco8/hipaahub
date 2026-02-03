import { OnboardingProvider } from '@/contexts/onboarding-context';
import { createClient } from '@/utils/supabase/server';
import { getOrganization, getComplianceCommitment } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';

export default async function OnboardingLayout({
  children
}: {
  children: React.ReactNode;
}) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // Handle auth errors gracefully
    if (authError) {
      console.error('Onboarding Layout: Auth error:', authError);
      redirect('/signup?redirect=checkout');
    }

    // ALWAYS require authentication for onboarding
    if (!user) {
      console.log('Onboarding Layout: User not authenticated, redirecting to signup');
      redirect('/signup?redirect=checkout');
    }

    // User is authenticated - check if onboarding is already complete
    // NOTE: We don't check subscription here to avoid blocking access after payment
    // The subscription check happens in the dashboard layout instead
    try {
      const [organization, commitment] = await Promise.all([
        getOrganization(supabase, user.id).catch(() => null),
        getComplianceCommitment(supabase, user.id).catch(() => null)
      ]);

      console.log('Onboarding Layout: Organization exists:', !!organization);
      console.log('Onboarding Layout: Commitment exists:', !!commitment);

      // If onboarding is complete, redirect to dashboard
      if (organization && commitment) {
        console.log('Onboarding Layout: Onboarding complete, redirecting to dashboard');
        redirect('/dashboard');
      }
    } catch (error: any) {
      console.error('Onboarding Layout: Error checking organization/commitment:', error);
      // Continue to onboarding even if there's an error
    }

    // Always render the onboarding provider - don't block on subscription check
    return <OnboardingProvider>{children}</OnboardingProvider>;
  } catch (error: any) {
    console.error('Onboarding Layout: Unexpected error:', error);
    // On critical errors, still try to render (graceful degradation)
    // Only redirect if it's an auth error
    if (error.message?.includes('auth') || error.message?.includes('unauthorized')) {
      redirect('/signup?redirect=checkout');
    }
    // Otherwise, render anyway
    return <OnboardingProvider>{children}</OnboardingProvider>;
  }
}


