import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

// Hardcoded production key as fallback (from STRIPE_PRODUCTION_KEYS.md)
const FALLBACK_PUBLISHABLE_KEY = 'pk_live_51Qig6XFjJxHsNvNGwtnek4yywzuF4ehhCxzSF2q5h215M4g3l9GQpCxJr6mygdWj8JRLkv5jnmxCID74MzoLqUn000oEIt6yDJ';

export const getStripe = async (): Promise<Stripe | null> => {
  // Get the publishable key with fallback
  let publishableKey = 
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE ??
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ??
    '';

  // If no key found, use fallback (production key)
  if (!publishableKey || publishableKey.trim() === '') {
    console.warn('⚠️ Stripe publishable key not found in env vars, using fallback production key');
    publishableKey = FALLBACK_PUBLISHABLE_KEY;
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
