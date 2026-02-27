'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { initiateCheckout } from '@/app/actions/checkout';
import { getStripe } from '@/utils/stripe/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Loader2 } from 'lucide-react';

// Retrieve the price ID the user selected before being sent to auth
function getStoredPriceId(): string | undefined {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const fromUrl = urlParams.get('priceId');
    if (fromUrl) return fromUrl;
    const fromStorage = localStorage.getItem('hipaa_pending_price_id');
    if (fromStorage) return fromStorage;
  } catch {
    // localStorage unavailable (e.g. SSR context)
  }
  return undefined;
}

function clearStoredPriceId() {
  try {
    localStorage.removeItem('hipaa_pending_price_id');
  } catch {
    // ignore
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasRedirected, setHasRedirected] = useState(false);

  // Check for error in URL params (from redirects)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    if (errorParam) {
      console.log('CheckoutPage: Error found in URL:', errorParam);
      setError(decodeURIComponent(errorParam));
      setIsLoading(false);
    }
  }, []);

  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading && !error && !hasRedirected) {
        console.error('CheckoutPage: Timeout - redirect taking too long');
        setError('The checkout process is taking longer than expected. This may be due to a currency conflict or network issue. Please try refreshing the page or contact support.');
        setIsLoading(false);
      }
    }, 8000); // 8 second timeout

    return () => clearTimeout(timeout);
  }, [isLoading, error, hasRedirected]);

  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirected || error) {
      return;
    }

    const startCheckout = async () => {
      try {
        console.log('CheckoutPage: Starting checkout process...');

        // Recover the plan the user selected before they were sent to auth
        const pendingPriceId = getStoredPriceId();
        console.log('CheckoutPage: Pending price ID:', pendingPriceId ?? '(none – will use default)');
        
        // Add a small delay to ensure auth state is ready after OAuth redirect
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const result = await initiateCheckout(pendingPriceId);
        
        console.log('CheckoutPage: Result received:', result.type);
        
        if (result.type === 'redirect') {
          // User needs to be redirected (not authenticated or already has subscription)
          console.log('CheckoutPage: Redirecting to:', result.path);
          
          // Prevent redirect loops - if redirecting back to checkout, show error instead
          if (result.path === '/checkout' || result.path.startsWith('/checkout?')) {
            console.error('CheckoutPage: Redirect loop detected! Redirecting to home instead.');
            clearStoredPriceId();
            setError('Unable to proceed with checkout. Please try again from the home page.');
            setIsLoading(false);
            setTimeout(() => {
              window.location.href = '/';
            }, 3000);
            return;
          }

          // If being sent back to auth, preserve the priceId in the URL so it survives the round-trip
          if (pendingPriceId && (result.path.includes('/signin') || result.path.includes('/signup'))) {
            const separator = result.path.includes('?') ? '&' : '?';
            setHasRedirected(true);
            window.location.href = `${result.path}${separator}redirect=checkout`;
            return;
          }
          
          setHasRedirected(true);
          // Use window.location for more reliable redirect
          window.location.href = result.path;
        } else if (result.type === 'checkout') {
          // User can proceed to checkout — clear the stored price selection
          clearStoredPriceId();
          console.log('CheckoutPage: Proceeding to Stripe checkout...', {
            sessionId: result.sessionId,
            hasSessionUrl: !!result.sessionUrl,
            sessionUrl: result.sessionUrl
          });
          
          // PRIORITY: Always use sessionUrl if available (most reliable)
          if (result.sessionUrl) {
            console.log('CheckoutPage: Using sessionUrl for direct redirect:', result.sessionUrl);
            setHasRedirected(true);
            window.location.href = result.sessionUrl;
            return; // Exit early, redirect is happening
          }
          
          // Fallback: Try Stripe.js if sessionUrl is not available
          console.log('CheckoutPage: sessionUrl not available, trying Stripe.js...');
          setHasRedirected(true);
          
          try {
            console.log('CheckoutPage: Attempting to load Stripe.js...');
            const stripe = await getStripe();
            console.log('CheckoutPage: Stripe.js loaded:', !!stripe);
            
            if (stripe) {
              console.log('CheckoutPage: Redirecting via Stripe.js with sessionId:', result.sessionId);
              const { error: stripeError } = await stripe.redirectToCheckout({ sessionId: result.sessionId });
              if (stripeError) {
                console.error('CheckoutPage: Stripe redirect error:', stripeError);
                setError(`Stripe error: ${stripeError.message}`);
                setIsLoading(false);
                setHasRedirected(false);
              }
            } else {
              console.error('CheckoutPage: Stripe.js returned null');
              setError('Unable to redirect to checkout. Please try again or contact support.');
              setIsLoading(false);
              setHasRedirected(false);
            }
          } catch (stripeLoadError: any) {
            console.error('CheckoutPage: Error loading Stripe.js:', {
              message: stripeLoadError.message,
              stack: stripeLoadError.stack,
              name: stripeLoadError.name
            });
            setError(`Failed to load Stripe: ${stripeLoadError.message || 'Please check your Stripe configuration and refresh the page.'}`);
            setIsLoading(false);
            setHasRedirected(false);
          }
        } else if (result.type === 'error') {
          // Error occurred
          console.error('CheckoutPage: Error from initiateCheckout:', result.message);
          
          // Show more helpful error messages
          let errorMessage = result.message || 'An error occurred. Please try again.';
          
          // Check for currency conflict
          if (result.message?.includes('Currency conflict') || result.message?.includes('currency')) {
            errorMessage = result.message;
          } else if (result.message?.includes('Unable to create checkout session')) {
            errorMessage = 'Unable to create checkout session. This may be due to a currency conflict or account issue. Please contact support if this problem persists.';
          }
          
          setError(errorMessage);
          setIsLoading(false);
        }
      } catch (error: any) {
        console.error('CheckoutPage: Exception during checkout:', error);
        setError(error.message || 'An error occurred. Please try again.');
        setIsLoading(false);
      }
    };

    startCheckout();
  }, [router, hasRedirected, error]);

  if (error) {
    const isCurrencyError = error.includes('Currency conflict') || error.includes('currency');
    // Extract currency from error message if possible
    const currencyMatch = error.match(/currency (\w+)/i);
    const conflictingCurrency = currencyMatch ? currencyMatch[1].toUpperCase() : 'BRL';
    
    return (
      <div className="flex min-h-[100dvh] flex-col bg-[#f3f5f9] px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center flex-1">
          <Card className="w-full max-w-md border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-thin text-[#0e274e]">
                {isCurrencyError ? 'Currency Conflict' : 'Checkout Error'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <p className="text-gray-600 leading-relaxed font-thin text-sm">{error}</p>
                {isCurrencyError && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
                    <p className="text-sm font-thin text-amber-900">How to resolve:</p>
                    <ol className="text-sm text-amber-800 space-y-2 list-decimal list-inside font-thin">
                      <li>
                        <strong className="font-thin">Open Stripe Dashboard</strong> (click button below)
                      </li>
                      <li>
                        Find your customer account (search by your email)
                      </li>
                      <li>
                        Look for active subscriptions with currency <strong className="font-thin">{conflictingCurrency}</strong>
                      </li>
                      <li>
                        Click on the subscription and select <strong className="font-thin">"Cancel subscription"</strong>
                      </li>
                      <li>
                        Wait a few seconds, then <strong className="font-thin">return here and try again</strong>
                      </li>
                    </ol>
                    <div className="mt-3 pt-3 border-t border-amber-200">
                      <p className="text-xs text-amber-700 font-thin">
                        <strong className="font-thin">Note:</strong> Only active subscriptions cause this conflict. Canceled or expired subscriptions are automatically ignored.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => router.push('/')}
                  variant="outline"
                  className="flex-1 rounded-none border-gray-300 text-[#0e274e] hover:text-[#0175a2] font-thin"
                >
                  Go to Home
                </Button>
                {isCurrencyError && (
                  <Button
                    onClick={() => {
                      window.open('https://dashboard.stripe.com/test/subscriptions', '_blank');
                    }}
                    className="flex-1 bg-[#0175a2] hover:bg-[#0e274e] text-white rounded-none font-thin"
                  >
                    Open Stripe Dashboard
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#f3f5f9] px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center justify-center flex-1">
        <Card className="w-full max-w-md border-gray-200 bg-white shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-6">
            <Loader2 className="h-10 w-10 text-[#0175a2] animate-spin" />
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-thin text-[#0e274e]">
                Redirecting to Checkout
              </h2>
              <p className="text-gray-600 text-sm font-thin">
                Please wait while we prepare your payment...
              </p>
              {isLoading && (
                <p className="text-gray-400 text-xs mt-3 font-thin">
                  This may take a few seconds after login...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}





