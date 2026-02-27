import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = async (): Promise<Stripe | null> => {
  // Prefer live key if set, otherwise fall back to (test) key
  const publishableKey =
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE ??
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ??
    '';

  if (!publishableKey || publishableKey.trim() === '') {
    throw new Error('Stripe publishable key is not configured. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in your environment variables.');
  }

  // Validate key format (should start with pk_)
  if (!publishableKey.startsWith('pk_')) {
    const errorMsg = 'Invalid Stripe publishable key format. Key should start with "pk_"';
    console.error(errorMsg, { keyPreview: publishableKey.substring(0, 20) + '...' });
    throw new Error(errorMsg);
  }

  // Create promise if it doesn't exist
  if (!stripePromise) {
    stripePromise = loadStripe(publishableKey, {
      // Add options to help with loading
      locale: 'en',
    })
      .then((stripe) => {
        if (!stripe) {
          throw new Error('Stripe.js loaded but returned null');
        }
        console.log('✅ Stripe.js loaded successfully');
        return stripe;
      })
      .catch((error) => {
        console.error('❌ Failed to load Stripe.js:', error);
        // Reset promise so it can be retried
        stripePromise = null;
        throw error;
      });
  }

  return stripePromise;
};
