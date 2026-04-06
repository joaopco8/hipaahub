import { createClient } from '@/utils/supabase/server';
import { getUser, getSubscription } from '@/utils/supabase/queries';
import { getUserPlanTier } from '@/lib/plan-gating';
import { redirect } from 'next/navigation';
import { createStripePortal } from '@/utils/stripe/server';
import { ExternalLink, AlertTriangle, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const TIER_LABELS: Record<string, string> = {
  solo: 'Solo',
  practice: 'Practice',
  clinic: 'Clinic',
  enterprise: 'Enterprise',
  unknown: 'No Plan',
};

const TIER_COLORS: Record<string, string> = {
  solo: 'bg-[#00bceb]/10 text-[#00bceb] border-[#00bceb]/30',
  practice: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  clinic: 'bg-violet-50 text-violet-700 border-violet-200',
  enterprise: 'bg-amber-50 text-amber-700 border-amber-200',
  unknown: 'bg-zinc-100 text-zinc-500 border-zinc-200',
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  active: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  trialing: <Clock className="h-4 w-4 text-[#00bceb]" />,
  canceled: <AlertTriangle className="h-4 w-4 text-red-500" />,
  past_due: <AlertTriangle className="h-4 w-4 text-amber-500" />,
};

export default async function ManageSubscriptionPage() {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin');
  }

  const [subscription, planTier] = await Promise.all([
    getSubscription(supabase, user.id),
    getUserPlanTier(),
  ]);

  async function openBillingPortal() {
    'use server';
    const url = await createStripePortal('/dashboard/account/subscription');
    redirect(url);
  }

  const tierLabel = TIER_LABELS[planTier] ?? 'Unknown';
  const tierColor = TIER_COLORS[planTier] ?? TIER_COLORS.unknown;
  const status = subscription?.status ?? null;
  const statusIcon = status ? (STATUS_ICON[status] ?? null) : null;
  const renewalDate = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-light text-[#0e274e]">Subscription</h1>
        <p className="text-sm text-zinc-500 font-light mt-1">
          Billing is handled securely through Stripe.
        </p>
      </div>

      {/* Current Plan Card */}
      <div className="border border-zinc-200 bg-white">
        <div className="px-6 py-4 border-b border-zinc-100">
          <p className="text-xs font-medium text-zinc-400">Current Plan</p>
        </div>

        {subscription ? (
          <div className="px-6 py-6 space-y-5">
            {/* Tier badge + status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center px-3 py-1 text-sm font-light border ${tierColor}`}
                >
                  {tierLabel}
                </span>
                {status && (
                  <span className="flex items-center gap-1.5 text-sm font-light text-zinc-500 capitalize">
                    {statusIcon}
                    {status.replace('_', ' ')}
                  </span>
                )}
              </div>
              {planTier !== 'unknown' && planTier !== 'enterprise' && (
                <Link
                  href="/select-plan"
                  className="text-xs text-[#00bceb] hover:underline font-light flex items-center gap-1"
                >
                  Upgrade <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-zinc-50 px-4 py-3">
                <p className="text-xs text-zinc-400 font-light mb-1">Billing period</p>
                <p className="text-sm text-[#0e274e] font-light">Monthly</p>
              </div>
              {renewalDate && (
                <div className="bg-zinc-50 px-4 py-3">
                  <p className="text-xs text-zinc-400 font-light mb-1">
                    {status === 'canceled' ? 'Access until' : 'Next renewal'}
                  </p>
                  <p className="text-sm text-[#0e274e] font-light">{renewalDate}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="px-6 py-6">
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 px-4 py-3">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-800 font-light">No active subscription</p>
                <p className="text-xs text-amber-600 font-light mt-0.5">
                  Export, certificates, and Practice features are locked until you activate a plan.
                </p>
              </div>
            </div>
            <Link href="/select-plan" className="mt-4 inline-flex">
              <button className="bg-[#00bceb] hover:bg-[#00a8d4] text-white text-sm font-light px-5 py-2 flex items-center gap-2 transition-colors">
                Choose a plan
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Billing portal */}
      {subscription && (
        <div className="border border-zinc-200 bg-white">
          <div className="px-6 py-4 border-b border-zinc-100">
            <p className="text-xs font-medium text-zinc-400">Billing</p>
          </div>
          <div className="px-6 py-6 space-y-4">
            <p className="text-sm text-zinc-500 font-light">
              Update payment details, download invoices, or cancel your subscription through the
              Stripe billing portal.
            </p>
            <div className="bg-zinc-50 border border-zinc-200 px-4 py-3 flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
              <p className="text-xs text-zinc-500 font-light">
                Cancellation affects access only. Your organization&apos;s compliance records remain
                in your account.
              </p>
            </div>
            <form action={openBillingPortal}>
              <button
                type="submit"
                className="bg-[#0e274e] hover:bg-[#0e274e]/90 text-white text-sm font-light px-5 py-2 flex items-center gap-2 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Open Billing Portal
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Nav */}
      <div className="flex items-center justify-between text-sm font-light">
        <Link href="/dashboard/account" className="text-zinc-400 hover:text-zinc-600 transition-colors">
          ← Back to Account
        </Link>
        <Link href="/dashboard" className="text-zinc-400 hover:text-zinc-600 transition-colors">
          Dashboard →
        </Link>
      </div>
    </div>
  );
}
