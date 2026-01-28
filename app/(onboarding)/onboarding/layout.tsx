import { OnboardingProvider } from '@/contexts/onboarding-context';
import { createClient } from '@/utils/supabase/server';
import { getOrganization, getComplianceCommitment, getSubscription } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';

export default async function OnboardingLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // ALWAYS require authentication for onboarding
  if (!user) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Onboarding Layout: User not authenticated, redirecting to signup');
    }
    redirect('/signup?redirect=checkout');
  }

  // If user is authenticated, check subscription status FIRST
  if (user) {
    // ALWAYS verify subscription status before allowing onboarding access
    const subscription = await getSubscription(supabase, user.id);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Onboarding Layout: Checking subscription for user:', user.id);
      console.log('Onboarding Layout: Subscription found:', subscription ? 'YES' : 'NO');
    }
    
    if (!subscription) {
      // User doesn't have subscription, redirect to checkout
      if (process.env.NODE_ENV === 'development') {
        console.log('Onboarding Layout: User does NOT have subscription, redirecting to checkout');
      }
      redirect('/checkout');
    }
    
    // User has subscription, check if onboarding is already complete
    const [organization, commitment] = await Promise.all([
      getOrganization(supabase, user.id),
      getComplianceCommitment(supabase, user.id)
    ]);

    if (process.env.NODE_ENV === 'development') {
      console.log('Onboarding Layout: Organization exists:', !!organization);
      console.log('Onboarding Layout: Commitment exists:', !!commitment);
    }

    // If onboarding is complete, redirect to dashboard
    if (organization && commitment) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Onboarding Layout: Onboarding complete, redirecting to dashboard');
      }
      redirect('/dashboard');
    }
  }

  return <OnboardingProvider>{children}</OnboardingProvider>;
}


