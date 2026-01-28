// Redirect webhook requests from /webhook to /api/webhooks/stripe
// This is needed because Stripe CLI sends to /webhook by default
// We simply re-export the handler from the actual webhook route
export { POST } from '@/app/api/webhooks/stripe/route';

