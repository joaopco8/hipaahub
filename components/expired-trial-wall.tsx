'use client';

import React, { useState } from 'react';
import { Lock, Check, Loader2, LogOut } from 'lucide-react';
import Image from 'next/image';
import { signOut } from '@/utils/auth-helpers/server';
import type { PlanTier } from '@/lib/plan-gating';

interface Plan {
  id: 'solo' | 'practice' | 'clinic';
  name: string;
  price: string;
  description: string;
  priceId: string;
  features: string[];
}

const PLANS: Plan[] = [
  {
    id: 'solo',
    name: 'Solo',
    price: '$69/mo',
    description: '1-5 staff. Full HIPAA coverage.',
    priceId: process.env.NEXT_PUBLIC_STRIPE_SOLO_PRICE_ID ?? 'price_1TEHcrFjJxHsNvNGmvH3pQur',
    features: [
      'All 9 HIPAA policy templates',
      'Security Risk Assessment',
      'Evidence Center & audit export',
      'BAA tracking',
    ],
  },
  {
    id: 'practice',
    name: 'Practice',
    price: '$197/mo',
    description: '2-15 staff. Includes training and BAA tracking.',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRACTICE_PRICE_ID ?? 'price_1TEHd6FjJxHsNvNGahdVbS6N',
    features: [
      'Everything in Solo',
      'Staff training tracker',
      'Asset risk management',
      'Mitigation workflow',
    ],
  },
  {
    id: 'clinic',
    name: 'Clinic',
    price: '$397/mo',
    description: '15-50 staff. Multi-location and board reporting.',
    priceId: process.env.NEXT_PUBLIC_STRIPE_CLINIC_PRICE_ID ?? 'price_1TEHdcFjJxHsNvNGzViIgMp8',
    features: [
      'Everything in Practice',
      'Multi-location support',
      'Board compliance reports',
      'Compliance calendar',
    ],
  },
];

interface Props {
  userEmail: string;
  userName: string;
  planTier: PlanTier;
}

export function ExpiredTrialWall({ userEmail, userName, planTier }: Props) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const firstName = userName?.split(' ')[0] || 'there';

  async function handleSubscribe(plan: Plan) {
    setLoadingPlan(plan.id);
    setError(null);
    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: plan.priceId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Checkout failed');
      if (data.url) window.location.href = data.url;
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong. Please try again.');
      setLoadingPlan(null);
    }
  }

  async function handleSignOut() {
    await signOut();
  }

  return (
    <div className="fixed inset-0 z-[200] bg-white overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Image
          src="/logoescura.png"
          alt="HIPAA Hub"
          width={110}
          height={28}
          className="object-contain"
          priority
        />
        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-2 text-sm font-thin text-gray-400 hover:text-[#0e274e] transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>

      {/* Main content */}
      <div className="max-w-[1100px] mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center max-w-[520px] mx-auto mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0e274e]/5 mb-6">
            <Lock className="h-7 w-7 text-[#0e274e]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-thin text-[#0e274e] mb-5 leading-tight">
            Your free trial has ended.
          </h1>
          <p className="text-gray-500 font-thin text-base leading-relaxed">
            Everything you built during your trial is safe and ready.
            Your policies, Risk Assessment, and compliance documentation
            are waiting for you on the other side of a subscription.
          </p>
        </div>

        {/* Error */}
        {error && (
          <p className="text-center text-sm text-red-500 font-thin mb-8">{error}</p>
        )}

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {PLANS.map((plan) => {
            const isCurrent = plan.id === planTier;
            const isLoading = loadingPlan === plan.id;
            return (
              <div
                key={plan.id}
                className={`border p-8 flex flex-col ${
                  plan.id === 'practice'
                    ? 'border-[#00bceb] shadow-md'
                    : 'border-gray-200'
                }`}
              >
                {plan.id === 'practice' && (
                  <span className="text-[10px] font-thin tracking-[0.18em] uppercase text-[#00bceb] mb-4 block">
                    Most popular
                  </span>
                )}
                <p className="text-2xl font-thin text-[#0e274e] mb-1">{plan.name}</p>
                <p className="text-3xl font-thin text-[#0e274e] mb-2">{plan.price}</p>
                <p className="text-sm font-thin text-gray-500 mb-6">{plan.description}</p>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm font-thin text-gray-600">
                      <Check className="h-4 w-4 text-[#00bceb] shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={!!loadingPlan}
                  className={`w-full py-3.5 text-sm font-thin transition-all flex items-center justify-center gap-2 ${
                    plan.id === 'practice'
                      ? 'bg-[#00bceb] text-white hover:bg-[#0e274e] disabled:opacity-50'
                      : 'bg-[#0e274e] text-white hover:bg-[#00bceb] disabled:opacity-50'
                  }`}
                >
                  {isLoading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
                  ) : (
                    `Subscribe to ${plan.name}`
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Reassurance */}
        <p className="text-center text-sm font-thin text-gray-400 mb-3">
          All plans include everything you built during your trial. No setup required. Cancel anytime.
        </p>
        <p className="text-center text-sm font-thin text-gray-400">
          Questions?{' '}
          <a
            href="mailto:support@hipaahubhealth.com"
            className="text-[#00bceb] hover:underline"
          >
            support@hipaahubhealth.com
          </a>
        </p>
      </div>
    </div>
  );
}
