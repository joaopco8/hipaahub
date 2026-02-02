'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { initiateCheckout } from '@/app/actions/checkout';
import { getStripe } from '@/utils/stripe/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Loader2 } from 'lucide-react';

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
        
        // Add a small delay to ensure auth state is ready after OAuth redirect
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const result = await initiateCheckout();
        
        console.log('CheckoutPage: Result received:', result.type);
        
        if (result.type === 'redirect') {
          // User needs to be redirected (not authenticated or already has subscription)
          console.log('CheckoutPage: Redirecting to:', result.path);
          
          // Prevent redirect loops - if redirecting to checkout, show error instead
          if (result.path === '/checkout' || result.path.startsWith('/checkout')) {
            console.error('CheckoutPage: Redirect loop detected! Redirecting to home instead.');
            setError('Unable to proceed with checkout. Please try again from the home page.');
            setIsLoading(false);
            setTimeout(() => {
              window.location.href = '/';
            }, 3000);
            return;
          }
          
          setHasRedirected(true);
          // Use window.location for more reliable redirect
          window.location.href = result.path;
        } else if (result.type === 'checkout') {
          // User can proceed to checkout
          console.log('CheckoutPage: Proceeding to Stripe checkout...');
          setHasRedirected(true);
          
          try {
            const stripe = await getStripe();
            if (stripe) {
              console.log('CheckoutPage: Redirecting to Stripe checkout with session:', result.sessionId);
              const { error: stripeError } = await stripe.redirectToCheckout({ sessionId: result.sessionId });
              if (stripeError) {
                console.error('CheckoutPage: Stripe redirect error:', stripeError);
                setError(`Stripe error: ${stripeError.message}`);
                setIsLoading(false);
                setHasRedirected(false);
              }
            } else {
              console.error('CheckoutPage: Stripe returned null');
              setError('Stripe failed to load. Please refresh the page or contact support.');
              setIsLoading(false);
              setHasRedirected(false);
            }
          } catch (stripeLoadError: any) {
            console.error('CheckoutPage: Error loading Stripe.js:', stripeLoadError);
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
          <Card className="w-full max-w-md border-zinc-200">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-zinc-900">
                {isCurrencyError ? 'Currency Conflict' : 'Checkout Error'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <p className="text-zinc-600 leading-relaxed">{error}</p>
                {isCurrencyError && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
                    <p className="text-sm font-medium text-amber-900">How to resolve:</p>
                    <ol className="text-sm text-amber-800 space-y-2 list-decimal list-inside">
                      <li>
                        <strong>Open Stripe Dashboard</strong> (click button below)
                      </li>
                      <li>
                        Find your customer account (search by your email)
                      </li>
                      <li>
                        Look for active subscriptions with currency <strong>{conflictingCurrency}</strong>
                      </li>
                      <li>
                        Click on the subscription and select <strong>"Cancel subscription"</strong>
                      </li>
                      <li>
                        Wait a few seconds, then <strong>return here and try again</strong>
                      </li>
                    </ol>
                    <div className="mt-3 pt-3 border-t border-amber-200">
                      <p className="text-xs text-amber-700">
                        <strong>Note:</strong> Only active subscriptions cause this conflict. Canceled or expired subscriptions are automatically ignored.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => router.push('/')}
                  variant="outline"
                  className="flex-1"
                >
                  Go to Home
                </Button>
                {isCurrencyError && (
                  <Button
                    onClick={() => {
                      window.open('https://dashboard.stripe.com/test/subscriptions', '_blank');
                    }}
                    className="flex-1 bg-[#1ad07a] hover:bg-[#1ad07a]/90 text-[#0c0b1d]"
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
        <Card className="w-full max-w-md border-zinc-200">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-12 w-12 text-[#1ad07a] animate-spin" />
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-zinc-900">
                Redirecting to Checkout
              </h2>
              <p className="text-zinc-600 text-sm">
                Please wait while we prepare your payment...
              </p>
              {isLoading && (
                <p className="text-zinc-500 text-xs mt-2">
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





