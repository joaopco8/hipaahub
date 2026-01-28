'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

/**
 * This component intercepts OAuth errors that are displayed as JSON on the page
 * and redirects to the appropriate error page with a user-friendly message
 */
export function OAuthErrorHandler() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Intercept fetch requests to catch OAuth errors before they're displayed
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      
      // Check if this is a Supabase auth request that failed
      const url = args[0]?.toString() || '';
      if (url.includes('/auth/v1/authorize') && !response.ok) {
        const clonedResponse = response.clone();
        try {
          const errorData = await clonedResponse.json();
          if (errorData?.error_code === 'validation_failed' || 
              errorData?.msg?.includes('provider is not enabled') ||
              errorData?.msg?.includes('Unsupported provider')) {
            
            const errorMessage = 'Google sign-in is not properly enabled in your Supabase project. Please verify: 1) Google provider is enabled in Authentication → Providers, 2) Client ID and Secret are correctly entered, 3) You clicked "Save" after making changes.';
            
            // Determine the correct path to redirect to
            const redirectPath = pathname.includes('signup') ? '/signup' : '/signin';
            const errorUrl = `${redirectPath}?error=${encodeURIComponent('Sign in failed')}&error_description=${encodeURIComponent(errorMessage)}`;
            
            // Use replace to avoid adding to history
            window.location.replace(errorUrl);
            return new Response(); // Return empty response to prevent JSON display
          }
        } catch (jsonError) {
          // If JSON parsing fails, continue with original response
        }
      }
      
      return response;
    };

    // Also check page content for JSON errors (fallback)
    const checkForJsonError = () => {
      const bodyText = document.body?.textContent || document.documentElement?.textContent || '';
      
      // Check for Supabase OAuth error patterns
      if (bodyText.includes('"error_code":"validation_failed"') ||
          bodyText.includes('"msg":"Unsupported provider') ||
          bodyText.includes('provider is not enabled')) {
        
        try {
          // Try to parse the JSON error
          const jsonMatch = bodyText.match(/\{[\s\S]*"code"[\s\S]*"error_code"[\s\S]*"msg"[\s\S]*\}/);
          if (jsonMatch) {
            const errorData = JSON.parse(jsonMatch[0]);
            const errorMessage = errorData.msg?.includes('provider is not enabled') || 
                                errorData.msg?.includes('Unsupported provider')
              ? 'Google sign-in is not properly enabled in your Supabase project. Please verify: 1) Google provider is enabled in Authentication → Providers, 2) Client ID and Secret are correctly entered, 3) You clicked "Save" after making changes.'
              : 'An error occurred during authentication. Please try again.';
            
            // Determine the correct path to redirect to
            const redirectPath = pathname.includes('signup') ? '/signup' : '/signin';
            const errorUrl = `${redirectPath}?error=${encodeURIComponent('Sign in failed')}&error_description=${encodeURIComponent(errorMessage)}`;
            
            window.location.replace(errorUrl);
            return;
          }
        } catch (parseError) {
          // If parsing fails, use generic error
          const redirectPath = pathname.includes('signup') ? '/signup' : '/signin';
          const errorUrl = `${redirectPath}?error=${encodeURIComponent('Sign in failed')}&error_description=${encodeURIComponent('An error occurred during authentication. Please try again.')}`;
          window.location.replace(errorUrl);
        }
      }
    };

    // Check immediately and also after delays (in case page is still loading)
    checkForJsonError();
    const timeouts = [
      setTimeout(checkForJsonError, 100),
      setTimeout(checkForJsonError, 500),
      setTimeout(checkForJsonError, 1000)
    ];

    return () => {
      // Restore original fetch
      window.fetch = originalFetch;
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [router, pathname]);

  return null;
}

