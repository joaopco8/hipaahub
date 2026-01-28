'use server';

import Stripe from 'stripe';
import { stripe } from '@/utils/stripe/config';
import { createClient } from '@/utils/supabase/server';
import { createOrRetrieveCustomer } from '@/utils/supabase/admin';
import {
  getURL,
  getErrorRedirect,
  calculateTrialEndUnixTimestamp
} from '@/utils/helpers';
import { Tables } from '@/types/db';

type Price = Tables<'prices'>;

type CheckoutResponse = {
  errorRedirect?: string;
  sessionId?: string;
};

export async function checkoutWithStripe(
  price: Price,
  redirectPath: string = '/account'
): Promise<CheckoutResponse> {
  try {
    // Get the user from Supabase auth
    const supabase = createClient();
    const {
      error,
      data: { user }
    } = await supabase.auth.getUser();

    if (error || !user) {
      console.error(error);
      return { errorRedirect: '/signin?error=Could not get user session.' };
    }

    // Retrieve or create the customer in Stripe
    let customer: string;
    try {
      customer = await createOrRetrieveCustomer({
        uuid: user?.id || '',
        email: user?.email || ''
      });
    } catch (err: any) {
      console.error('Error creating/retrieving customer:', err);
      // Return error redirect instead of throwing
      const errorMsg = err.message || 'Unable to access customer record.';
      return { errorRedirect: `/checkout?error=${encodeURIComponent(errorMsg)}` };
    }

    // Check if customer has existing subscriptions/items with different currency
    // Stripe doesn't allow mixing currencies on the same customer
    const priceCurrency = price.currency?.toUpperCase() || 'USD';
    let finalCustomer = customer;
    
    try {
      // Check for existing ACTIVE subscriptions with different currency
      // Only check active, trialing, past_due, or paused subscriptions
      // Ignore canceled, incomplete, incomplete_expired, and unpaid subscriptions
      const subscriptions = await stripe.subscriptions.list({
        customer: customer,
        limit: 10,
        status: 'all'
      });
      
      const existingCurrencies = new Set<string>();
      
      // Only check ACTIVE subscriptions (not canceled, incomplete, etc.)
      const activeStatuses = ['active', 'trialing', 'past_due', 'paused'];
      subscriptions.data.forEach(sub => {
        // Only consider subscriptions that are actually active/active-like
        if (activeStatuses.includes(sub.status)) {
          const subCurrency = sub.items.data[0]?.price?.currency?.toUpperCase();
          if (subCurrency) {
            existingCurrencies.add(subCurrency);
            console.log(`Found active subscription with currency: ${subCurrency}, status: ${sub.status}`);
          }
        } else {
          console.log(`Ignoring subscription with status: ${sub.status} (not active)`);
        }
      });
      
      // Check for active invoice items (one-time charges that might conflict)
      // Only check paid invoices that are recent (last 30 days) to avoid false positives
      const recentInvoices = await stripe.invoices.list({
        customer: customer,
        limit: 10,
        status: 'paid'
      });
      
      // Only consider invoices from the last 30 days to avoid conflicts with old test data
      const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
      recentInvoices.data.forEach(inv => {
        // Only consider recent paid invoices
        if (inv.created >= thirtyDaysAgo && inv.status === 'paid') {
          const invCurrency = inv.currency?.toUpperCase();
          if (invCurrency) {
            existingCurrencies.add(invCurrency);
            console.log(`Found recent paid invoice with currency: ${invCurrency}`);
          }
        }
      });
      
      // Check if there's a currency conflict with ACTIVE subscriptions only
      if (existingCurrencies.size > 0 && !existingCurrencies.has(priceCurrency)) {
        const existingCurrency = Array.from(existingCurrencies)[0];
        const errorMessage = `Currency conflict: Your account has an active subscription with currency ${existingCurrency}, but this product uses ${priceCurrency}. Stripe does not allow mixing currencies on the same account. Please cancel your active ${existingCurrency} subscription first, or contact support for assistance.`;
        console.error(errorMessage);
        // Return error redirect instead of throwing
        return { errorRedirect: `/checkout?error=${encodeURIComponent(errorMessage)}` };
      }
      
      // Log if no conflict found
      if (existingCurrencies.size > 0) {
        console.log(`No currency conflict. Existing currencies: ${Array.from(existingCurrencies).join(', ')}, Product currency: ${priceCurrency}`);
      } else {
        console.log(`No active subscriptions found. Proceeding with currency: ${priceCurrency}`);
      }
    } catch (currencyCheckError: any) {
      // If it's our custom error, return it as errorRedirect
      if (currencyCheckError.message?.includes('Currency conflict')) {
        return { errorRedirect: `/checkout?error=${encodeURIComponent(currencyCheckError.message)}` };
      }
      // For other errors, log but continue (might be a network issue)
      console.warn('Could not check customer currency:', currencyCheckError.message);
      // Don't block checkout if we can't check currency (might be a temporary network issue)
    }

    let params: Stripe.Checkout.SessionCreateParams = {
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer: finalCustomer,
      customer_update: {
        address: 'auto'
      },
      line_items: [
        {
          price: price.id,
          quantity: 1
        }
      ],
      cancel_url: getURL(),
      success_url: getURL(redirectPath)
    };

    console.log(
      'Trial end:',
      calculateTrialEndUnixTimestamp(price.trial_period_days)
    );
    if (price.type === 'recurring') {
      params = {
        ...params,
        mode: 'subscription',
        subscription_data: {
          trial_end: calculateTrialEndUnixTimestamp(price.trial_period_days)
        }
      };
    } else if (price.type === 'one_time') {
      params = {
        ...params,
        mode: 'payment'
      };
    }

    // Create a checkout session in Stripe
    let session;
    try {
      session = await stripe.checkout.sessions.create(params);
    } catch (err: any) {
      console.error('Stripe checkout session creation error:', err);
      
      // Handle currency mismatch error specifically
      if (err.message?.includes('currency') || err.message?.includes('brl') || err.message?.includes('cannot combine currencies')) {
        const errorMessage = `Currency conflict: This account has an active subscription with a different currency (BRL). The current product uses ${priceCurrency}. Please contact support or cancel your existing subscription to proceed.`;
        console.error(errorMessage);
        // Return error redirect instead of throwing
        return { errorRedirect: `/checkout?error=${encodeURIComponent(errorMessage)}` };
      }
      
      // Return error redirect for other errors
      const errorMsg = err.message || 'Unable to create checkout session.';
      return { errorRedirect: `/checkout?error=${encodeURIComponent(errorMsg)}` };
    }

    // Instead of returning a Response, just return the data or error.
    if (session) {
      return { sessionId: session.id };
    } else {
      throw new Error('Unable to create checkout session.');
    }
  } catch (error) {
    if (error instanceof Error) {
      return {
        errorRedirect: getErrorRedirect(
          redirectPath,
          error.message,
          'Please try again later or contact a system administrator.'
        )
      };
    } else {
      return {
        errorRedirect: getErrorRedirect(
          redirectPath,
          'An unknown error occurred.',
          'Please try again later or contact a system administrator.'
        )
      };
    }
  }
}

export async function createStripePortal(currentPath: string) {
  try {
    const supabase = createClient();
    const {
      error,
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      if (error) {
        console.error(error);
      }
      throw new Error('Could not get user session.');
    }

    let customer;
    try {
      customer = await createOrRetrieveCustomer({
        uuid: user.id || '',
        email: user.email || ''
      });
    } catch (err) {
      console.error(err);
      throw new Error('Unable to access customer record.');
    }

    if (!customer) {
      throw new Error('Could not get customer.');
    }

    try {
      const { url } = await stripe.billingPortal.sessions.create({
        customer,
        return_url: getURL('/dashboard/account')
      });
      if (!url) {
        throw new Error('Could not create billing portal');
      }
      return url;
    } catch (err) {
      console.error(err);
      throw new Error('Could not create billing portal');
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      return getErrorRedirect(
        currentPath,
        error.message,
        'Please try again later or contact a system administrator.'
      );
    } else {
      return getErrorRedirect(
        currentPath,
        'An unknown error occurred.',
        'Please try again later or contact a system administrator.'
      );
    }
  }
}
