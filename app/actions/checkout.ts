'use server';

import { createClient } from '@/utils/supabase/server';
import { checkoutWithStripe } from '@/utils/stripe/server';
import { getProducts, getSubscription } from '@/utils/supabase/queries';

/**
 * Check if user has an active subscription
 * Returns true if user has 'trialing' or 'active' subscription
 * 
 * We query directly to avoid cache issues and ensure we get the most up-to-date data
 */
async function hasActiveSubscription(userId: string): Promise<boolean> {
  const supabase = createClient();
  
  // Query directly from database to avoid cache issues
  const { data: subscriptions, error } = await supabase
    .from('subscriptions')
    .select('id, status')
    .eq('user_id', userId)
    .in('status', ['trialing', 'active'])
    .limit(1);
  
  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('Checking subscription for user:', userId);
    console.log('Query error:', error);
    console.log('Subscriptions found:', subscriptions?.length || 0);
    if (subscriptions && subscriptions.length > 0) {
      console.log('Subscription status:', subscriptions[0].status);
      console.log('Subscription ID:', subscriptions[0].id);
    }
  }
  
  if (error) {
    console.error('Error checking subscription:', error);
    // If there's an error, assume no subscription to allow checkout
    return false;
  }
  
  // Return true only if we have at least one active/trialing subscription
  return subscriptions && subscriptions.length > 0;
}

export type CheckoutResult = 
  | { type: 'redirect'; path: string } 
  | { type: 'checkout'; sessionId: string }
  | { type: 'error'; message: string };

/**
 * Initiate checkout for the annual plan ($500/year)
 * This is called from the landing page when user clicks "GET STARTED"
 * 
 * Flow:
 * 1. If user is not authenticated → return redirect to signup
 * 2. If user has active subscription → return redirect to dashboard
 * 3. If user has no subscription → create Stripe checkout and return sessionId
 */
export async function initiateCheckout(): Promise<CheckoutResult> {
  const supabase = createClient();
  
  // Wait a moment for OAuth session to be fully established
  // This is especially important after OAuth redirects
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError) {
    if (process.env.NODE_ENV === 'development') {
      console.error('initiateCheckout: Auth error:', authError);
    }
    // If there's an auth error, redirect to signup
    return { type: 'redirect', path: '/signup?redirect=checkout' };
  }
  
  if (!user) {
    // Return redirect instruction (client will handle it)
    if (process.env.NODE_ENV === 'development') {
      console.log('initiateCheckout: User not authenticated, redirecting to signup');
    }
    return { type: 'redirect', path: '/signup?redirect=checkout' };
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('initiateCheckout: User authenticated:', user.id, user.email);
  }

  // Check if user already has an active subscription
  const hasSubscription = await hasActiveSubscription(user.id);
  
  if (hasSubscription) {
    // User already has an active subscription, redirect to dashboard
    // The dashboard layout will check onboarding status and redirect accordingly
    if (process.env.NODE_ENV === 'development') {
      console.log('initiateCheckout: User HAS active subscription');
      console.log('initiateCheckout: Redirecting to dashboard (will check onboarding status there)');
    }
    return { type: 'redirect', path: '/dashboard' };
  }
  
  // Debug: Log that user doesn't have subscription and will proceed to checkout
  if (process.env.NODE_ENV === 'development') {
    console.log('initiateCheckout: User does NOT have active subscription, proceeding to create Stripe checkout');
  }

  // User doesn't have subscription, proceed with checkout
  // Get products from database
  let products: any[] = [];
  try {
    products = await getProducts(supabase) || [];
  } catch (productsError: any) {
    console.error('Error fetching products:', productsError);
    // Continue to sync attempt even if fetch fails
    products = [];
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('initiateCheckout: Products found in database:', products?.length || 0);
  }
  
  // If no products found, try to sync from Stripe
  if (!products || products.length === 0) {
    // Enhanced diagnostic BEFORE calling syncStripeProducts
    if (process.env.NODE_ENV === 'development') {
      console.log('=== initiateCheckout: No products found ===');
      console.log('Environment check BEFORE syncStripeProducts:');
      console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? `SET (${process.env.SUPABASE_SERVICE_ROLE_KEY.length} chars)` : 'NOT SET');
      console.log('All SUPABASE env vars:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.log('Key preview:', process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 30) + '...');
        console.log('✅ Key is available - syncStripeProducts should work');
      } else {
        // Enhanced diagnostic when key is missing
        console.error('❌ SUPABASE_SERVICE_ROLE_KEY is NOT available in process.env at this point');
        console.error('This usually means:');
        console.error('1. Server was not restarted after adding variable to .env.local');
        console.error('2. Variable name is misspelled in .env.local');
        console.error('3. .env.local is in wrong location (should be in project root)');
        console.error('4. Next.js cache issue - try: rm -rf .next && pnpm dev');
        console.error('5. Server Action context issue - env vars may not be loaded in this context');
      }
    }
    
    try {
      const { syncStripeProducts } = await import('@/utils/supabase/admin');
      const syncResult = await syncStripeProducts();
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Sync result:', syncResult);
      }
      
      // Wait a moment for database to update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Try to get products again after sync
      products = await getProducts(supabase);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Products after sync:', products?.length || 0);
      }
      
      if (!products || products.length === 0) {
        return { 
          type: 'error', 
          message: 'No products available. Please create a product in Stripe first, or contact support if this issue persists. Make sure SUPABASE_SERVICE_ROLE_KEY is set in your .env.local file.' 
        };
      }
    } catch (syncError: any) {
      console.error('=== Error syncing products from Stripe ===');
      console.error('Error message:', syncError.message);
      console.error('Error stack:', syncError.stack);
      console.error('Environment check at error time:', {
        hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        serviceRoleKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
        nodeEnv: process.env.NODE_ENV,
        allSupabaseVars: Object.keys(process.env).filter(k => k.includes('SUPABASE'))
      });
      
      // Provide more detailed error message
      let errorMessage = 'Unable to load products. ';
      
      // Check if the error is actually about the service role key
      const isServiceKeyError = syncError.message?.includes('SUPABASE_SERVICE_ROLE_KEY') || 
                                syncError.message?.includes('service_role') ||
                                syncError.message?.includes('not configured');
      
      // Check if key is actually available
      const keyAvailable = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (isServiceKeyError && !keyAvailable) {
        // Key is missing
        errorMessage += 'SUPABASE_SERVICE_ROLE_KEY is not configured. ';
        errorMessage += 'Please set it in your .env.local file and restart your Next.js server. ';
        errorMessage += 'You can find this key in your Supabase Dashboard → Settings → API → service_role key.';
      } else if (isServiceKeyError && keyAvailable) {
        // Key exists but error says it doesn't - this is a bug or timing issue
        errorMessage += 'SUPABASE_SERVICE_ROLE_KEY is configured but not being recognized. ';
        errorMessage += 'This may be a timing issue. Please check server logs for detailed diagnostics. ';
        errorMessage += `Error: ${syncError.message}`;
      } else if (syncError.message?.includes('row-level security') || syncError.message?.includes('RLS')) {
        errorMessage += 'Row Level Security (RLS) issue. ';
        errorMessage += 'Please ensure SUPABASE_SERVICE_ROLE_KEY is set correctly in your .env.local file and restart the server.';
      } else {
        errorMessage += `Error: ${syncError.message}. `;
        errorMessage += 'Please check server logs for more details. ';
        errorMessage += 'Ensure Stripe is configured correctly and products exist in your Stripe account.';
      }
      
      return { 
        type: 'error', 
        message: errorMessage
      };
    }
  }

  // Find the best available price
  // Priority: 1) Annual price ($500/year = 50000 cents), 2) Any annual price, 3) Any active price
  let selectedPrice = null;
  
  try {
    // Priority 1: Look for exact annual price ($500/year = 50000 cents)
    for (const product of products || []) {
      if (product?.prices && Array.isArray(product.prices)) {
        selectedPrice = product.prices.find(
          (price: any) => price?.active === true && 
                         price?.interval === 'year' && 
                         price?.unit_amount === 50000
        );
        if (selectedPrice) break;
      }
    }

    // Priority 2: If not found, try to find any annual price
    if (!selectedPrice) {
      for (const product of products || []) {
        if (product?.prices && Array.isArray(product.prices)) {
          selectedPrice = product.prices.find(
            (price: any) => price?.active === true && price?.interval === 'year'
          );
          if (selectedPrice) break;
        }
      }
    }

    // Priority 3: If still not found, use the first active price from "HIPAA Hub" product
    if (!selectedPrice) {
      const hipaaHubProduct = products?.find(
        (product: any) => product?.name?.toLowerCase().includes('hipaa') || 
                         product?.name?.toLowerCase().includes('hub')
      );
      
      if (hipaaHubProduct?.prices && Array.isArray(hipaaHubProduct.prices)) {
        selectedPrice = hipaaHubProduct.prices.find((price: any) => price?.active === true);
      }
    }

    // Priority 4: Last resort - use the first active price from any product
    if (!selectedPrice) {
      for (const product of products || []) {
        if (product?.prices && Array.isArray(product.prices)) {
          selectedPrice = product.prices.find((price: any) => price?.active === true);
          if (selectedPrice) break;
        }
      }
    }
  } catch (priceSearchError: any) {
    console.error('Error searching for price:', priceSearchError);
    return { 
      type: 'error', 
      message: 'Error processing pricing information. Please contact support.' 
    };
  }

  if (!selectedPrice) {
    return { 
      type: 'error', 
      message: 'No active pricing plan found. Please ensure products are properly configured in Stripe and synced to the database.' 
    };
  }

  // Initiate checkout
  try {
    const { errorRedirect, sessionId } = await checkoutWithStripe(
      selectedPrice,
      '/onboarding/expectation' // After payment, go to onboarding
    );

    if (errorRedirect) {
      // Check if errorRedirect contains an error message
      if (errorRedirect.includes('error=')) {
        // Extract error message from URL
        try {
          const url = new URL(errorRedirect, 'http://localhost');
          const errorMsg = url.searchParams.get('error');
          if (errorMsg) {
            console.error('Checkout error from errorRedirect:', decodeURIComponent(errorMsg));
            return { type: 'error', message: decodeURIComponent(errorMsg) };
          }
        } catch (urlError) {
          // If URL parsing fails, try manual extraction
          const errorMatch = errorRedirect.match(/error=([^&]+)/);
          if (errorMatch) {
            const errorMsg = decodeURIComponent(errorMatch[1]);
            console.error('Checkout error (manual extraction):', errorMsg);
            return { type: 'error', message: errorMsg };
          }
        }
      }
      // Return error redirect path (for non-error redirects)
      return { type: 'redirect', path: errorRedirect };
    }

    if (!sessionId) {
      return { type: 'error', message: 'Failed to create checkout session. Please try again.' };
    }

    // Return checkout session ID for client-side redirect
    return { type: 'checkout', sessionId };
  } catch (error: any) {
    // Catch and return currency or other Stripe errors
    console.error('Error in checkoutWithStripe:', error);
    
    let errorMessage = error.message || 'Failed to create checkout session. Please try again.';
    
    // Preserve currency conflict messages
    if (error.message?.includes('Currency conflict') || error.message?.includes('currency')) {
      errorMessage = error.message;
    } else if (error.message?.includes('brl')) {
      errorMessage = 'Currency conflict: Your account has an active subscription with currency BRL, but this product uses USD. Stripe does not allow mixing currencies. Please cancel your existing subscription first or contact support.';
    }
    
    return { type: 'error', message: errorMessage };
  }
}





