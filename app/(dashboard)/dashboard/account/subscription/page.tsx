import { createClient } from '@/utils/supabase/server';
import { getUser, getSubscription } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { createStripePortal } from '@/utils/stripe/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default async function ManageSubscriptionPage() {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin');
  }

  const subscription = await getSubscription(supabase, user.id);

  async function openBillingPortal() {
    'use server';
    const url = await createStripePortal('/dashboard/account/subscription');
    redirect(url);
  }

  return (
    <div className="flex min-h-screen w-full flex-col gap-6 max-w-5xl mx-auto page-transition-premium">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Manage Subscription</h1>
        <p className="text-zinc-600 text-base">
          Billing is handled securely through Stripe. You can update payment details or cancel your plan anytime.
        </p>
      </div>

      <Card className="border-zinc-200 card-premium-enter stagger-item">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-zinc-900">Your current plan</CardTitle>
          <CardDescription className="text-zinc-600">A snapshot of your active billing state.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscription ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg border border-zinc-200 bg-white p-4">
                <div className="text-xs font-medium text-zinc-600">Plan</div>
                <div className="mt-1 text-base font-semibold text-zinc-900">
                  {subscription?.prices?.products?.name || 'N/A'}
                </div>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-4">
                <div className="text-xs font-medium text-zinc-600">Status</div>
                <div className="mt-1 text-base font-semibold text-zinc-900 capitalize">
                  {subscription?.status || 'N/A'}
                </div>
              </div>
            </div>
          ) : (
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertTriangle className="h-4 w-4" />
              <div>
                <AlertTitle>No active subscription</AlertTitle>
                <AlertDescription>
                  This account does not currently have an active subscription. If you need access, choose a plan first.
                </AlertDescription>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card className="border-zinc-200 card-premium-enter stagger-item">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-zinc-900">Cancel subscription</CardTitle>
          <CardDescription className="text-zinc-600">
            Cancellation happens in Stripe and is recorded on your billing account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-zinc-50 border-zinc-200">
            <AlertTriangle className="h-4 w-4" />
            <div>
              <AlertTitle>Audit note</AlertTitle>
              <AlertDescription>
                Subscription status affects access only. Your organization’s compliance records remain in your database.
              </AlertDescription>
            </div>
          </Alert>

          <form action={openBillingPortal} className="space-y-3">
            <Button
              type="submit"
              className="w-full bg-[#1ad07a] text-[#0d1122] hover:bg-[#1ad07a]/90"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Stripe Billing Portal
            </Button>
          </form>

          <div className="flex items-center justify-between">
            <Link href="/dashboard/account" className="text-sm text-zinc-600 hover:text-zinc-900">
              Back to Account
            </Link>
            <Link href="/dashboard" className="text-sm text-zinc-600 hover:text-zinc-900">
              Back to Dashboard
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

