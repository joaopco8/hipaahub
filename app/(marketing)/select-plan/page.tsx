'use client';

import { useState } from 'react';
import { Check, ArrowRight, Loader2, Shield } from 'lucide-react';
import Image from 'next/image';
import { initiateCheckout } from '@/app/actions/checkout';
import { getStripe } from '@/utils/stripe/client';

interface Plan {
  id: string;
  name: string;
  price: string;
  description: string;
  priceId: string;
  featured: boolean;
  features: string[];
}

const SOLO_PRICE_ID =
  process.env.NEXT_PUBLIC_STRIPE_SOLO_PRICE_ID || 'price_1TEHcrFjJxHsNvNGmvH3pQur';
const PRACTICE_PRICE_ID =
  process.env.NEXT_PUBLIC_STRIPE_PRACTICE_PRICE_ID || 'price_1TEHd6FjJxHsNvNGahdVbS6N';
const CLINIC_PRICE_ID =
  process.env.NEXT_PUBLIC_STRIPE_CLINIC_PRICE_ID || 'price_1TEHdcFjJxHsNvNGzViIgMp8';
const ENTERPRISE_PRICE_ID =
  process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID || 'price_1TEHdcFjJxHsNvNGzViIgMp8';

const plans: Plan[] = [
  {
    id: 'solo',
    name: 'SOLO',
    price: '$79',
    description: 'For solo practices & small clinics (1-5 staff)',
    priceId: SOLO_PRICE_ID,
    featured: false,
    features: [
      'Encrypted cloud storage with role-based access and MFA',
      'Full activity log: every action recorded for audit trail',
      'HIPAA Business Associate Agreement included',
      'Email support, 48-hour response',
    ],
  },
  {
    id: 'practice',
    name: 'PRACTICE',
    price: '$197',
    description: 'Your practice is growing. Your compliance needs to keep up.',
    priceId: PRACTICE_PRICE_ID,
    featured: true,
    features: [
      "Staff training tracker: see who's certified, who's overdue, and who's never been trained",
      'Automated annual training reminders with certificate generation',
      'Role-based training assignment: clinical staff, admin, contractors',
      'Completion reports formatted for OCR review',
      'BAA tracker with expiration alerts',
      'Asset-based risk identification',
      'Mitigation tracking workflow with deadlines and owners',
      'Real-time compliance dashboard',
      'Incident logging with full response timeline and chain-of-custody documentation',
      'Priority email support',
      'Business-hours phone support',
    ],
  },
  {
    id: 'clinic',
    name: 'CLINIC',
    price: '$397',
    description: 'Multiple providers. Board-level accountability. Zero margin for error.',
    priceId: CLINIC_PRICE_ID,
    featured: false,
    features: [
      "Multi-location framework: manage each location's compliance status independently or as a unified view",
      'Executive and board-ready reporting: one-click reports formatted for governance meetings, not just auditors',
      'Advanced audit export customization: tailor evidence packages by location, department, or audit type',
      'Compliance program calendar: automated scheduling of all required annual activities',
      'Quarterly compliance review',
      'Documentation review guidance',
      'Dedicated onboarding',
      'Guided breach response workflow',
      'Structured notification templates for every breach scenario',
      '24-hour response SLA',
      'Direct phone line: not a ticket queue',
      'Dedicated account contact',
    ],
  },
  {
    id: 'enterprise',
    name: 'ENTERPRISE',
    price: 'Custom',
    description:
      'Custom pricing: starting at $1,500/month. Custom compliance infrastructure for networks, DSOs, and health systems.',
    priceId: ENTERPRISE_PRICE_ID,
    featured: false,
    features: [
      'Unlimited locations and entities under one account',
      'Custom policy framework aligned to your organizational structure',
      'Dedicated compliance success manager',
      'Custom integrations with your existing EHR, HR, and credentialing systems',
      'Board-level and executive reporting suite',
      'Annual compliance program audit with written findings',
      'Priority breach response with direct legal escalation guidance',
      'SLA-backed uptime and dedicated infrastructure',
      'Consolidated billing across all locations',
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
          ? 'border-[#00bceb] shadow-2xl lg:scale-105 z-10'
          : 'border-gray-200 shadow-sm'
      } rounded-none p-10 transition-all duration-300 hover:-translate-y-1`}
    >
      {plan.featured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#00bceb] text-white text-[11px] font-thin px-5 py-1.5 whitespace-nowrap">
          Most popular
        </div>
      )}

      <h3 className="text-xl font-thin text-[#0e274e] mb-1 tracking-wide">{plan.name}</h3>
      <p className="text-gray-400 text-xs font-thin mb-6 leading-relaxed">{plan.description}</p>

      <div className="flex items-baseline mb-8">
        <span className="text-5xl font-thin text-[#0e274e]">{plan.price}</span>
        {plan.price !== 'Custom' && (
          <span className="text-gray-400 text-sm ml-2 font-thin">/ month</span>
        )}
      </div>

      <ul className="space-y-3 flex-grow mb-8">
        {plan.features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3 text-sm text-gray-600 font-thin">
            <Check size={14} className="text-[#00bceb] mt-0.5 flex-shrink-0" />
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
            ? 'bg-[#00bceb] text-white hover:bg-[#00a8d4]'
            : 'bg-[#0e274e] text-white hover:bg-[#0e274e]/90'
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
        <div className="inline-flex items-center gap-2 text-[#00bceb] mb-4">
          <Shield size={18} />
          <span className="text-sm font-thin tracking-wide uppercase">Account Created</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-thin text-[#0e274e] leading-tight mb-3">
          Choose your plan
        </h1>
        <p className="text-gray-500 font-thin text-base leading-relaxed">
          Select the plan that best fits your organization. You can upgrade at any time.
        </p>
      </div>

      {/* Plan Cards */}
      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 items-center">
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
