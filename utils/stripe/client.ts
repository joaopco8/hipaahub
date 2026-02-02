import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = (): Promise<Stripe | null> => {
  // Get the publishable key
  const publishableKey = 
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE ??
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ??
    '';

  // Validate key exists
  if (!publishableKey || publishableKey.trim() === '') {
    console.error('Stripe publishable key is not configured');
    console.error('Available env vars:', {
      hasLiveKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE,
      hasTestKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      allStripeVars: Object.keys(process.env).filter(k => k.includes('STRIPE'))
    });
    
    // Return a rejected promise with a clear error
    return Promise.reject(new Error('Stripe publishable key is not configured. Please set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE or NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in your environment variables.'));
  }

  // Validate key format (should start with pk_)
  if (!publishableKey.startsWith('pk_')) {
    console.error('Invalid Stripe publishable key format. Key should start with "pk_"');
    return Promise.reject(new Error('Invalid Stripe publishable key format. Please check your environment variables.'));
  }

  // Create promise if it doesn't exist
  if (!stripePromise) {
    stripePromise = loadStripe(publishableKey).catch((error) => {
      console.error('Failed to load Stripe.js:', error);
      // Reset promise so it can be retried
      stripePromise = null;
      throw new Error(`Failed to load Stripe.js: ${error.message}`);
    });
  }

  return stripePromise;
};
