'use client';

import React, { useState } from 'react';
import { Check, ArrowRight, Loader2 } from 'lucide-react';
import { initiateCheckout } from '@/app/actions/checkout';
import { getStripe } from '@/utils/stripe/client';
import ContactSalesModal from './ContactSalesModal';

const SOLO_PRICE_ID     = (process.env.NEXT_PUBLIC_STRIPE_SOLO_PRICE_ID     || 'price_1TEHcrFjJxHsNvNGmvH3pQur').replace(/\s+/g, '');
const PRACTICE_PRICE_ID = (process.env.NEXT_PUBLIC_STRIPE_PRACTICE_PRICE_ID || 'price_1TEHd6FjJxHsNvNGahdVbS6N').replace(/\s+/g, '');
const CLINIC_PRICE_ID   = (process.env.NEXT_PUBLIC_STRIPE_CLINIC_PRICE_ID   || 'price_1TEHdcFjJxHsNvNGzViIgMp8').replace(/\s+/g, '');

interface PricingCardProps {
  title: string;
  tagline: string;
  price: string;
  annualNote?: string;
  features: string[];
  featuresLabel?: string;
  isFeatured?: boolean;
  cta: string;
  priceId?: string;
  onContactSales?: () => void;
}

const PricingCard: React.FC<PricingCardProps> = ({
  title,
  tagline,
  price,
  annualNote,
  features,
  featuresLabel,
  isFeatured,
  cta,
  priceId,
  onContactSales,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleCheckout = async () => {
    if (!priceId) {
      window.location.href = '/signup';
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    try {
      const result = await initiateCheckout(priceId);
      if (result.type === 'redirect') {
        localStorage.setItem('hipaa_pending_price_id', priceId);
        window.location.href = result.path;
      } else if (result.type === 'checkout') {
        // Always prefer sessionUrl — stripe.redirectToCheckout is deprecated and unreliable
        if (result.sessionUrl) {
          window.location.href = result.sessionUrl;
        } else if (result.sessionId) {
          try {
            const stripe = await getStripe();
            if (stripe) await stripe.redirectToCheckout({ sessionId: result.sessionId });
          } catch {
            setErrorMsg('Something went wrong. Please try again.');
          }
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

  const handleClick = () => {
    if (priceId) { void handleCheckout(); return; }
    if (onContactSales) { onContactSales(); return; }
    window.location.href = '/signup';
  };

  return (
    <div
      className={`flex flex-col h-full border transition-all duration-300 hover:-translate-y-1 group relative
        ${isFeatured
          ? 'border-cisco-blue/40 shadow-xl bg-white lg:scale-[1.03] z-10'
          : 'border-gray-100 bg-white shadow-sm'
        }`}
    >
      {isFeatured && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-cisco-green text-white text-[10px] font-thin px-4 py-1.5 whitespace-nowrap">
          Most popular
        </div>
      )}

      {/* Header */}
      <div className={`px-7 pt-8 pb-6 border-b ${isFeatured ? 'border-cisco-blue/10' : 'border-gray-50'}`}>
        <p className="text-[11px] font-thin tracking-widest uppercase text-cisco-blue mb-2">{title}</p>
        <p className="text-xs text-gray-500 font-thin mb-5 leading-snug">{tagline}</p>

        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-thin text-cisco-navy">{price}</span>
          {price !== 'Custom' && (
            <span className="text-sm text-gray-400 font-thin">/ mo</span>
          )}
        </div>
        {annualNote && (
          <p className="text-[11px] text-gray-400 font-thin mt-1">{annualNote}</p>
        )}
      </div>

      {/* Features */}
      <div className="px-7 py-6 flex-grow">
        {featuresLabel && (
          <p className="text-[10px] font-thin text-cisco-blue tracking-widest uppercase mb-4">{featuresLabel}</p>
        )}
        <ul className="space-y-2.5">
          {features.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[13px] text-gray-600 font-thin leading-snug">
              <Check size={12} className="text-cisco-blue mt-0.5 flex-shrink-0 opacity-70" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <div className="px-7 pb-7">
        {errorMsg && (
          <p className="mb-2 text-xs text-red-500 text-center font-light">{errorMsg}</p>
        )}
        <button
          onClick={handleClick}
          disabled={isLoading}
          className={`w-full py-3.5 text-sm font-thin transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed
            ${isFeatured
              ? 'bg-cisco-blue text-white hover:bg-cisco-navy'
              : 'bg-cisco-navy text-white hover:bg-cisco-blue'
            }`}
        >
          {isLoading ? (
            <><Loader2 size={14} className="animate-spin" /> Processing...</>
          ) : (
            <>{cta}<ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></>
          )}
        </button>
        {price !== 'Custom' && (
          <p className="mt-2.5 text-center text-[11px] text-gray-400 font-thin">
            Cancel anytime &middot; BAA included
          </p>
        )}
      </div>
    </div>
  );
};

const PricingSection: React.FC<{ onDemoClick?: () => void }> = () => {
  const [isContactSalesModalOpen, setIsContactSalesModalOpen] = useState(false);

  return (
    <>
      <section id="pricing" className="py-24 bg-[#f8f9fa] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-12">

          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-[52px] font-thin text-cisco-navy leading-[1.2] mb-4">
              Pricing built for private practices.
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-base md:text-lg font-thin">
              Start where you are. Upgrade only when your exposure grows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100 border border-gray-100">
            <PricingCard
              title="Solo"
              tagline="1–5 staff. Full HIPAA coverage, no compliance team required."
              price="$79"
              annualNote="or $67/mo billed annually"
              cta="Get started"
              priceId={SOLO_PRICE_ID}
              features={[
                "9 customizable HIPAA policy templates",
                "Automated risk assessment & compliance score",
                "Version-controlled policy history",
                "One-click audit package export",
                "Breach notification letter generator",
                "Evidence Center for documentation",
                "Encrypted storage, RBAC & MFA",
                "Full activity log for audit trail",
                "HIPAA BAA included",
                "Email support (48h response)",
              ]}
            />

            <PricingCard
              title="Practice"
              tagline="Growing practice. More staff, more compliance exposure."
              price="$197"
              annualNote="or $167/mo billed annually (save $360/yr)"
              isFeatured
              cta="Get started"
              priceId={PRACTICE_PRICE_ID}
              featuresLabel="Everything in Solo, plus"
              features={[
                "Staff training tracker & certificate generation",
                "Role-based training assignment",
                "Annual training reminders",
                "BAA tracker with expiration alerts",
                "Asset-based risk identification",
                "Mitigation workflow with owners & deadlines",
                "Real-time compliance dashboard",
                "Incident logging & response timeline",
                "Priority email + business-hours phone support",
              ]}
            />

            <PricingCard
              title="Clinic"
              tagline="Multiple providers. Board-level accountability."
              price="$397"
              annualNote="or $330/mo billed annually (save $804/yr)"
              cta="Get started"
              priceId={CLINIC_PRICE_ID}
              featuresLabel="Everything in Practice, plus"
              features={[
                "Multi-location compliance management",
                "Board & executive-ready reports",
                "Compliance program calendar",
                "Quarterly compliance reviews",
                "Guided breach response workflow",
                "Breach notification templates (all scenarios)",
                "Dedicated onboarding",
                "24h response SLA",
                "Dedicated account contact",
              ]}
            />

            <PricingCard
              title="Enterprise"
              tagline="Networks, DSOs, and health systems."
              price="Custom"
              cta="Talk to sales"
              onContactSales={() => setIsContactSalesModalOpen(true)}
              featuresLabel="Everything in Clinic, plus"
              features={[
                "Unlimited locations & entities",
                "Custom policy framework",
                "Dedicated compliance success manager",
                "Custom EHR, HR & credentialing integrations",
                "Annual compliance program audit",
                "Priority breach response & legal escalation",
                "SLA-backed dedicated infrastructure",
                "Consolidated billing",
              ]}
            />
          </div>

          <div className="mt-8 flex flex-col items-center gap-2 text-center">
            <p className="text-xs text-gray-400 font-thin">
              Not sure which plan? Start with Solo &mdash; you can upgrade anytime.
            </p>
            <p className="text-xs text-gray-400 font-thin max-w-xl">
              <span className="text-gray-500">Solo → Practice:</span> the step up adds staff training tracking with certificates, a real-time compliance dashboard, phone support, and BAA expiration alerts &mdash; worth it once you have 6+ staff or face an upcoming audit.
            </p>
          </div>
        </div>
      </section>

      <ContactSalesModal
        isOpen={isContactSalesModalOpen}
        onClose={() => setIsContactSalesModalOpen(false)}
      />
    </>
  );
};

export default PricingSection;
