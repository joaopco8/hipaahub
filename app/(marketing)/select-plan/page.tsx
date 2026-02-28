'use client';

import { useState } from 'react';
import { Check, ArrowRight, Loader2, Shield } from 'lucide-react';
import Image from 'next/image';
import { initiateCheckout } from '@/app/actions/checkout';
import { getStripe } from '@/utils/stripe/client';

const ESSENTIAL_PRICE_ID =
  process.env.NEXT_PUBLIC_STRIPE_ESSENTIAL_PRICE_ID || 'price_1T4lRNFjJxHsNvNGBzEXKgYv';
const GROWTH_PRICE_ID =
  process.env.NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID || 'price_1T4lRNFjJxHsNvNGCH2pkACR';

interface Plan {
  id: string;
  name: string;
  price: string;
  description: string;
  priceId: string;
  featured: boolean;
  features: string[];
}

const plans: Plan[] = [
  {
    id: 'essential',
    name: 'ESSENTIAL',
    price: '$297',
    description: 'For solo practices & small clinics (1–5 staff)',
    priceId: ESSENTIAL_PRICE_ID,
    featured: false,
    features: [
      'Secure access with MFA',
      'Role-based permissions',
      'HIPAA-aligned Risk Assessment',
      '9 customized HIPAA policies',
      'Breach notification letter generator',
      'One-click Audit Package export',
      'Email support (48h response)',
    ],
  },
  {
    id: 'growth',
    name: 'GROWTH',
    price: '$697',
    description: 'For scaling & multi-provider clinics (6–20 staff)',
    priceId: GROWTH_PRICE_ID,
    featured: true,
    features: [
      'Everything in Essential',
      'Custom risk scoring & mitigation tracking',
      'Vendor & BAA tracking with alerts',
      'Incident logging & response timeline',
      'Real-time compliance dashboard',
      'Staff training tracking',
      'Priority email + phone support',
    ],
  },
];

function PlanCard({ plan }: { plan: Plan }) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSelect = async () => {
    setIsLoading(true);
    setErrorMsg('');

    try {
      // Persist for backup (e.g. same-tab localStorage recovery)
      localStorage.setItem('hipaa_pending_price_id', plan.priceId);

      const result = await initiateCheckout(plan.priceId);

      if (result.type === 'redirect') {
        window.location.href = result.path;
      } else if (result.type === 'checkout') {
        if (result.sessionUrl) {
          window.location.href = result.sessionUrl;
          return;
        }
        const stripe = await getStripe();
        if (stripe && result.sessionId) {
          await stripe.redirectToCheckout({ sessionId: result.sessionId });
        }
      } else if (result.type === 'error') {
        setErrorMsg(result.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setErrorMsg('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`relative flex flex-col bg-white border ${
        plan.featured
          ? 'border-[#0c0b1d] shadow-2xl lg:scale-105 z-10'
          : 'border-gray-200 shadow-sm'
      } rounded-none p-10 transition-all duration-300 hover:-translate-y-1`}
    >
      {plan.featured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#1ad07a] text-[#0c0b1d] text-[11px] font-thin px-5 py-1.5 whitespace-nowrap">
          Most popular
        </div>
      )}

      <h3 className="text-xl font-thin text-[#0c0b1d] mb-1 tracking-wide">{plan.name}</h3>
      <p className="text-gray-400 text-xs font-thin mb-6 leading-relaxed">{plan.description}</p>

      <div className="flex items-baseline mb-8">
        <span className="text-5xl font-thin text-[#0c0b1d]">{plan.price}</span>
        <span className="text-gray-400 text-sm ml-2 font-thin">/ month</span>
      </div>

      <ul className="space-y-3 flex-grow mb-8">
        {plan.features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3 text-sm text-gray-600 font-thin">
            <Check size={14} className="text-[#1ad07a] mt-0.5 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {errorMsg && (
        <p className="mb-3 text-xs text-red-500 text-center font-thin">{errorMsg}</p>
      )}

      <button
        onClick={handleSelect}
        disabled={isLoading}
        className={`w-full py-4 text-sm font-thin flex items-center justify-center gap-3 transition-colors disabled:opacity-70 disabled:cursor-not-allowed ${
          plan.featured
            ? 'bg-[#1ad07a] text-[#0c0b1d] hover:bg-[#17b86a]'
            : 'bg-[#0c0b1d] text-white hover:bg-[#0c0b1d]/80'
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Processing...
          </>
        ) : (
          <>
            Get Started
            <ArrowRight size={16} />
          </>
        )}
      </button>
      <p className="mt-3 text-center text-xs text-gray-400 font-thin">Cancel anytime</p>
    </div>
  );
}

export default function SelectPlanPage() {
  return (
    <div className="min-h-screen bg-[#f3f5f9] flex flex-col items-center justify-center px-4 py-16">
      {/* Logo */}
      <div className="mb-10">
        <Image
          src="/logoescura.png"
          alt="HIPAA Hub"
          width={140}
          height={38}
          className="object-contain"
          priority
        />
      </div>

      {/* Header */}
      <div className="text-center mb-12 max-w-xl">
        <div className="inline-flex items-center gap-2 text-[#1ad07a] mb-4">
          <Shield size={18} />
          <span className="text-sm font-thin tracking-wide uppercase">Account Created</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-thin text-[#0c0b1d] leading-tight mb-3">
          Choose your plan
        </h1>
        <p className="text-gray-500 font-thin text-base leading-relaxed">
          Select the plan that best fits your organization. You can upgrade at any time.
        </p>
      </div>

      {/* Plan Cards */}
      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-0 items-center">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>

      {/* Footer note */}
      <p className="mt-10 text-xs text-gray-400 font-thin text-center max-w-md leading-relaxed">
        HIPAA Hub is a compliance support tool. It does not replace legal counsel or guarantee
        compliance. All plans billed monthly. Cancel anytime.
      </p>
    </div>
  );
}
