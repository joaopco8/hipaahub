import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getErrorRedirect, getStatusRedirect } from '@/utils/helpers';

export async function GET(request: NextRequest) {
  // Rate limiting for auth callback (IP-based to prevent abuse)
  const { authLimiter, getRateLimitIdentifier, createRateLimitResponse } = await import('@/lib/rate-limit');
  const identifier = getRateLimitIdentifier(null, request);
  const { success, limit, remaining, reset } = await authLimiter.limit(identifier);

  if (!success) {
    console.warn(`Rate limit exceeded for auth callback from IP ${identifier}`);
    return createRateLimitResponse(limit, remaining, reset);
  }

  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the `@supabase/ssr` package. It exchanges an auth code for the user's session.
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const errorParam = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');
  
  // Check if OAuth provider returned an error
  if (errorParam) {
    let errorMessage = errorDescription || 'An error occurred during authentication.';
    
    // Provide user-friendly error messages
    if (errorParam.includes('provider is not enabled') || errorParam.includes('Unsupported provider')) {
      errorMessage = 'This sign-in method is not enabled. Please contact support or use email/password to sign in.';
    }
    
    return NextResponse.redirect(
      getErrorRedirect(
        `${requestUrl.origin}/signin`,
        'Authentication failed',
        errorMessage
      )
    );
  }
  
  if (code) {
    const supabase = createClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      let errorMessage = error.message || "Sorry, we weren't able to log you in. Please try again.";
      
      // Provide user-friendly error messages
      if (error.message?.includes('provider is not enabled') || error.message?.includes('Unsupported provider')) {
        errorMessage = 'This sign-in method is not enabled. Please contact support or use email/password to sign in.';
      }
      
      return NextResponse.redirect(
        getErrorRedirect(
          `${requestUrl.origin}/signin`,
          error.name || 'Authentication failed',
          errorMessage
        )
      );
    }

    // Wait a moment for session to be fully established after OAuth
    // This ensures cookies are set and session is available
    await new Promise(resolve => setTimeout(resolve, 500));

    // After successful OAuth, check if user has completed onboarding
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Check if user has phone number - if not, redirect to complete profile
      const { data: userData } = await supabase
        .from('users')
        .select('phone_number')
        .eq('id', user.id)
        .single();

      if (!userData?.phone_number) {
        // User doesn't have phone number, redirect to complete profile
        const redirectParam = requestUrl.searchParams.get('redirect');
        const redirectUrl = redirectParam 
          ? `${requestUrl.origin}/complete-profile?redirect=${redirectParam}`
          : `${requestUrl.origin}/complete-profile`;
        
        if (process.env.NODE_ENV === 'development') {
          console.log('Auth callback: User does not have phone number, redirecting to complete profile');
        }
        return NextResponse.redirect(redirectUrl);
      }

      // Check subscription and onboarding status
      const { getSubscription, getOrganization, getComplianceCommitment } = await import('@/utils/supabase/queries');
      const subscription = await getSubscription(supabase, user.id);
      const [organization, commitment] = await Promise.all([
        getOrganization(supabase, user.id),
        getComplianceCommitment(supabase, user.id)
      ]);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Auth callback: Checking subscription for user:', user.id);
        console.log('Auth callback: Subscription found:', subscription ? 'YES' : 'NO');
        console.log('Auth callback: Onboarding complete:', (organization && commitment) ? 'YES' : 'NO');
      }
      
      // If user has active subscription, ALWAYS allow access (never redirect to checkout)
      if (subscription) {
        // User has subscription, check onboarding status
        if (organization && commitment) {
          // Onboarding complete → go to dashboard
          if (process.env.NODE_ENV === 'development') {
            console.log('Auth callback: User has subscription and onboarding complete, redirecting to dashboard');
          }
          return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
        } else {
          // Onboarding incomplete → go to onboarding
          if (process.env.NODE_ENV === 'development') {
            console.log('Auth callback: User has subscription but onboarding incomplete, redirecting to onboarding');
          }
          return NextResponse.redirect(`${requestUrl.origin}/onboarding/expectation`);
        }
      }
      
      // User doesn't have subscription yet
      // Check if user came from checkout flow (check redirect parameter)
      const redirectParam = requestUrl.searchParams.get('redirect');
      
      if (redirectParam === 'checkout') {
        // User came from checkout flow but doesn't have subscription yet
        // Allow them to proceed to checkout
        if (process.env.NODE_ENV === 'development') {
          console.log('Auth callback: User came from checkout flow, redirecting to checkout');
        }
        return NextResponse.redirect(`${requestUrl.origin}/checkout`);
      }
      
      // No redirect param - check onboarding status FIRST
      // If onboarding is complete, ALWAYS allow dashboard access (never redirect to checkout)
      if (organization && commitment) {
        // Onboarding complete → ALWAYS go to dashboard (even without subscription)
        // Webhook may still be processing, but user should have access
        if (process.env.NODE_ENV === 'development') {
          console.log('Auth callback: Onboarding complete, allowing dashboard access (subscription may be processing)');
        }
        return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
      } else {
        // Onboarding incomplete and no subscription → redirect to checkout
        if (process.env.NODE_ENV === 'development') {
          console.log('Auth callback: No subscription and onboarding incomplete, redirecting to checkout');
        }
        return NextResponse.redirect(`${requestUrl.origin}/checkout`);
      }
    }
  }

  // Fallback: redirect to signin if something went wrong
  return NextResponse.redirect(`${requestUrl.origin}/signin`);
}
