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
    deletePriceRecord: module.deletePriceRecord
  }));
};

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
  'customer.subscription.deleted'
]);

export async function POST(req: Request) {
  console.log('Received a request');
  
  // Rate limiting for webhook (IP-based)
  const { stripeWebhookLimiter, getRateLimitIdentifier, createRateLimitResponse } = await import('@/lib/rate-limit');
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const ip = forwardedFor?.split(',')[0] || realIp || 'unknown';
  const identifier = `ip:${ip}`;
  
  const { success, limit, remaining, reset } = await stripeWebhookLimiter.limit(identifier);
  
  if (!success) {
    console.warn(`Rate limit exceeded for Stripe webhook from IP ${ip}`);
    return createRateLimitResponse(limit, remaining, reset);
  }

  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event: Stripe.Event;

  try {
    if (!sig || !webhookSecret) {
      console.log('Webhook secret not found');
      return new Response('Webhook secret not found.', { status: 400 });
    }
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    console.log(`🔔  Webhook received: ${event.type}`);
  } catch (err: any) {
    console.log(`❌ Error message: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (relevantEvents.has(event.type)) {
    console.log(`✅ Processing relevant event: ${event.type}`);
    
    // Lazy load admin functions only when needed (at runtime, not during build)
    const {
      upsertProductRecord,
      upsertPriceRecord,
      manageSubscriptionStatusChange,
      deleteProductRecord,
      deletePriceRecord
    } = await getAdminFunctions();
    
    try {
      switch (event.type) {
        case 'product.created':
        case 'product.updated':
          console.log(`Handling product event: ${event.type}`);
          await upsertProductRecord(event.data.object as Stripe.Product);
          console.log(`Product event handled: ${event.type}`);
          break;
        case 'price.created':
        case 'price.updated':
          console.log(`Handling price event: ${event.type}`);
          await upsertPriceRecord(event.data.object as Stripe.Price);
          console.log(`Price event handled: ${event.type}`);
          break;
        case 'price.deleted':
          console.log(`Handling price deleted event`);
          await deletePriceRecord(event.data.object as Stripe.Price);
          console.log(`Price deleted event handled`);
          break;
        case 'product.deleted':
          console.log(`Handling product deleted event`);
          await deleteProductRecord(event.data.object as Stripe.Product);
          console.log(`Product deleted event handled`);
          break;
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          console.log(`Handling subscription event: ${event.type}`);
          const subscription = event.data.object as Stripe.Subscription;
          await manageSubscriptionStatusChange(
            subscription.id,
            subscription.customer as string,
            event.type === 'customer.subscription.created'
          );
          console.log(`Subscription event handled: ${event.type}`);
          break;
        case 'checkout.session.completed':
          console.log('✅ Handling checkout session completed event');
          const checkoutSession = event.data.object as Stripe.Checkout.Session;
          console.log('Checkout session customer:', checkoutSession.customer);
          console.log('Checkout session mode:', checkoutSession.mode);
          
          if (checkoutSession.mode === 'subscription') {
            const subscriptionId = checkoutSession.subscription;
            if (subscriptionId && checkoutSession.customer) {
              console.log('Processing subscription:', subscriptionId, 'for customer:', checkoutSession.customer);
              await manageSubscriptionStatusChange(
                subscriptionId as string,
                checkoutSession.customer as string,
                true
              );
              console.log('✅ Subscription created/updated successfully');
            } else {
              console.error('❌ Missing subscription ID or customer ID in checkout session');
            }
          } else {
            console.log('⚠️  Checkout session is not a subscription (mode:', checkoutSession.mode, ')');
          }
          console.log('✅ Checkout session completed event handled');
          break;
        case 'invoice.payment_succeeded':
          const invoice = event.data.object as Stripe.Invoice;

          console.log('Invoice', invoice);
          console.log('Invoice subscripton reason', invoice.billing_reason);

          if (invoice.billing_reason === 'subscription_cycle') {
            const subscriptionId = invoice.subscription;
            const customerId = invoice.customer;

            console.log('It is subscription cycle.');

            console.log(`Successfully reset questions_counter for user `);
          }
          break;
        default:
          console.log('Unhandled relevant event type!');
          throw new Error('Unhandled relevant event!');
      }
    } catch (error) {
      console.log(`Error handling event: ${event.type}`, error);
      return new Response(
        'Webhook handler failed. View your Next.js function logs.',
        {
          status: 400
        }
      );
    }
  } else {
    // Event not in relevantEvents - this is OK, we just log it
    console.log(`ℹ️  Ignoring unsupported event type: ${event.type}`);
    return new Response(JSON.stringify({ received: true, ignored: true }), {
      status: 200
    });
  }
  console.log('Event processed successfully');
  return new Response(JSON.stringify({ received: true }));
}
