import Stripe from 'stripe';
import { stripe } from '@/utils/stripe/config';

// Force dynamic rendering to prevent Next.js from executing this during build
export const dynamic = 'force-dynamic';

// Import admin functions lazily to prevent top-level execution during build
const getAdminFunctions = () => {
  return import('@/utils/supabase/admin').then(module => ({
    upsertProductRecord: module.upsertProductRecord,
    upsertPriceRecord: module.upsertPriceRecord,
    manageSubscriptionStatusChange: module.manageSubscriptionStatusChange,
    deleteProductRecord: module.deleteProductRecord,
    deletePriceRecord: module.deletePriceRecord,
    activateOrgSubscription: module.activateOrgSubscription,
  }));
};

// Map Stripe price ID → plan tier
function getPlanTierFromPriceId(priceId: string): 'solo' | 'practice' | 'clinic' | 'enterprise' {
  const soloIds = [
    process.env.NEXT_PUBLIC_STRIPE_SOLO_PRICE_ID?.replace(/\s+/g, ''),
    'price_1TEHcrFjJxHsNvNGmvH3pQur',
  ].filter(Boolean);
  const practiceIds = [
    process.env.NEXT_PUBLIC_STRIPE_PRACTICE_PRICE_ID?.replace(/\s+/g, ''),
    'price_1TEHd6FjJxHsNvNGahdVbS6N',
  ].filter(Boolean);
  const clinicIds = [
    process.env.NEXT_PUBLIC_STRIPE_CLINIC_PRICE_ID?.replace(/\s+/g, ''),
    'price_1TEHdcFjJxHsNvNGzViIgMp8',
  ].filter(Boolean);
  if (soloIds.includes(priceId)) return 'solo';
  if (practiceIds.includes(priceId)) return 'practice';
  if (clinicIds.includes(priceId)) return 'clinic';
  return 'enterprise';
}

const relevantEvents = new Set([
  'product.created',
  'product.updated',
  'product.deleted',
  'price.created',
  'price.updated',
  'price.deleted',
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.paid'
]);

export async function POST(req: Request) {
  // Rate limiting for webhook (IP-based)
  const { stripeWebhookLimiter, getRateLimitIdentifier, createRateLimitResponse } = await import('@/lib/rate-limit');
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const ip = forwardedFor?.split(',')[0] || realIp || 'unknown';
  const identifier = `ip:${ip}`;

  const { success, limit, remaining, reset } = await stripeWebhookLimiter.limit(identifier);

  if (!success) {
    return createRateLimitResponse(limit, remaining, reset);
  }

  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event: Stripe.Event;

  try {
    if (!sig || !webhookSecret) {
      return new Response('Webhook secret not found.', { status: 400 });
    }
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Stripe webhook signature error: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (relevantEvents.has(event.type)) {
    // Lazy load admin functions only when needed (at runtime, not during build)
    const {
      upsertProductRecord,
      upsertPriceRecord,
      manageSubscriptionStatusChange,
      deleteProductRecord,
      deletePriceRecord,
      activateOrgSubscription,
    } = await getAdminFunctions();

    try {
      switch (event.type) {
        case 'product.created':
        case 'product.updated':
          await upsertProductRecord(event.data.object as Stripe.Product);
          break;
        case 'price.created':
        case 'price.updated':
          await upsertPriceRecord(event.data.object as Stripe.Price);
          break;
        case 'price.deleted':
          await deletePriceRecord(event.data.object as Stripe.Price);
          break;
        case 'product.deleted':
          await deleteProductRecord(event.data.object as Stripe.Product);
          break;
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          const subscription = event.data.object as Stripe.Subscription;
          await manageSubscriptionStatusChange(
            subscription.id,
            subscription.customer as string,
            event.type === 'customer.subscription.created'
          );
          break;
        case 'checkout.session.completed':
          const checkoutSession = event.data.object as Stripe.Checkout.Session;

          if (checkoutSession.mode === 'subscription') {
            const subscriptionId = checkoutSession.subscription;
            if (subscriptionId && checkoutSession.customer) {
              await manageSubscriptionStatusChange(
                subscriptionId as string,
                checkoutSession.customer as string,
                true
              );

              // Activate org subscription and send Email 5
              try {
                const stripeAdminSub = await stripe.subscriptions.retrieve(subscriptionId as string);
                const priceId = stripeAdminSub.items.data[0]?.price?.id;
                const planTier = priceId ? getPlanTierFromPriceId(priceId) : 'solo';

                // Look up user from customers table
                const { createClient: createAdminClient } = await import('@supabase/supabase-js');
                const adminSupa = createAdminClient(
                  process.env.NEXT_PUBLIC_SUPABASE_URL!,
                  process.env.SUPABASE_SERVICE_ROLE_KEY!,
                  { auth: { autoRefreshToken: false, persistSession: false } }
                );
                const { data: customerRow } = await adminSupa
                  .from('customers')
                  .select('id')
                  .eq('stripe_customer_id', checkoutSession.customer as string)
                  .single();
                if (customerRow?.id) {
                  await activateOrgSubscription(customerRow.id, planTier);
                }
              } catch (activateErr) {
                console.error('activateOrgSubscription error:', activateErr);
              }
            } else {
              console.error('Missing subscription ID or customer ID in checkout session');
            }
          }
          break;
        case 'invoice.payment_succeeded':
        case 'invoice.paid':
          const invoice = event.data.object as Stripe.Invoice;

          // If invoice has a subscription, ensure it's synced to database
          if (invoice.subscription && invoice.customer) {
            const subscriptionId = invoice.subscription as string;
            const customerId = invoice.customer as string;

            await manageSubscriptionStatusChange(
              subscriptionId,
              customerId,
              invoice.billing_reason === 'subscription_create' || invoice.billing_reason === 'subscription_cycle'
            );

            // Also activate org subscription to keep organizations table in sync.
            // This handles cases where checkout.session.completed failed or the
            // user converted from trial — manageSubscriptionStatusChange only
            // updates the subscriptions table, not organizations.
            try {
              const { createClient: createAdminClient } = await import('@supabase/supabase-js');
              const adminSupa = createAdminClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!,
                { auth: { autoRefreshToken: false, persistSession: false } }
              );
              const { data: customerRow } = await adminSupa
                .from('customers')
                .select('id')
                .eq('stripe_customer_id', customerId)
                .single();
              if (customerRow?.id) {
                const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
                const priceId = stripeSub.items.data[0]?.price?.id;
                const planTier = priceId ? getPlanTierFromPriceId(priceId) : 'solo';
                await activateOrgSubscription(customerRow.id, planTier);
              }
            } catch (activateErr) {
              console.error('activateOrgSubscription from invoice error (non-fatal):', activateErr);
            }
          }
          break;
        default:
          throw new Error('Unhandled relevant event!');
      }
    } catch (error) {
      console.error(`Error handling Stripe event ${event.type}:`, error);
      return new Response(
        'Webhook handler failed. View your Next.js function logs.',
        { status: 400 }
      );
    }
  }

  return new Response(JSON.stringify({ received: true }));
}
