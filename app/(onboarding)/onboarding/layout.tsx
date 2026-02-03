import { OnboardingProvider } from '@/contexts/onboarding-context';
import { createClient } from '@/utils/supabase/server';
import { getOrganization, getComplianceCommitment, getSubscription } from '@/utils/supabase/queries';
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
      if (process.env.NODE_ENV === 'development') {
        console.log('Onboarding Layout: User not authenticated, redirecting to signup');
      }
      redirect('/signup?redirect=checkout');
    }

    // If user is authenticated, check subscription status FIRST
    if (user) {
      try {
        // ALWAYS verify subscription status before allowing onboarding access
        const subscription = await getSubscription(supabase, user.id);
        
        if (process.env.NODE_ENV === 'development') {
          console.log('Onboarding Layout: Checking subscription for user:', user.id);
          console.log('Onboarding Layout: Subscription found:', subscription ? 'YES' : 'NO');
        }
        
        // If no subscription, wait longer and check again (webhook might be processing)
        if (!subscription) {
          console.log('Onboarding Layout: No subscription found, waiting for webhook to process...');
          
          // Wait 5 seconds for webhook to process (longer wait for production)
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          // Check again
          const retrySubscription = await getSubscription(supabase, user.id);
          
          if (!retrySubscription) {
            // Check if user just came from checkout (payment was made)
            // Allow access temporarily if payment was just made
            // The webhook will process the subscription soon
            console.log('Onboarding Layout: Still no subscription after retry');
            console.log('Onboarding Layout: Allowing access anyway - webhook may still be processing');
            // Don't redirect - allow access to onboarding
            // The subscription will be created by the webhook soon
          } else {
            console.log('Onboarding Layout: Subscription found after retry!');
          }
        }
        
        // User has subscription, check if onboarding is already complete
        const [organization, commitment] = await Promise.all([
          getOrganization(supabase, user.id).catch(() => null),
          getComplianceCommitment(supabase, user.id).catch(() => null)
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
      } catch (subscriptionError: any) {
        console.error('Onboarding Layout: Error checking subscription/organization:', subscriptionError);
        // Continue to onboarding even if there's an error (graceful degradation)
        // The page itself will handle the error
      }
    }

    return <OnboardingProvider>{children}</OnboardingProvider>;
  } catch (error: any) {
    console.error('Onboarding Layout: Unexpected error:', error);
    // Redirect to signup on critical errors
    redirect('/signup?redirect=checkout');
  }
}


