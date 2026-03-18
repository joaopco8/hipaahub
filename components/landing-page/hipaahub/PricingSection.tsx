'use client';

import React, { useState } from 'react';
import { Check, ArrowRight, Loader2 } from 'lucide-react';
import { initiateCheckout } from '@/app/actions/checkout';
import { getStripe } from '@/utils/stripe/client';
import ContactSalesModal from './ContactSalesModal';

interface FeatureGroup {
  title: string;
  items: string[];
}

// Fallback to hardcoded IDs so the correct price is always used in production
// even if the Vercel env vars are not configured.
const ESSENTIAL_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_ESSENTIAL_PRICE_ID || 'price_1T4lRNFjJxHsNvNGBzEXKgYv';
const GROWTH_PRICE_ID    = process.env.NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID    || 'price_1T4lRNFjJxHsNvNGCH2pkACR';

const PricingCard: React.FC<{ 
  title: string; 
  price: string; 
  subtitle: string;
  featureGroups: FeatureGroup[];
  isFeatured?: boolean; 
  cta: string;
  bestFor: string;
  bestForDescription?: string;
  priceId?: string;
  onDemoClick?: () => void;
  onContactSales?: () => void;
}> = ({ title, price, subtitle, featureGroups, isFeatured, cta, bestFor, bestForDescription, priceId, onDemoClick, onContactSales }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleCheckout = async () => {
    // If no Stripe price ID configured, redirect to signup page
    if (!priceId) {
      window.location.href = '/signup';
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const result = await initiateCheckout(priceId);

      if (result.type === 'redirect') {
        // Persist the selected priceId so the checkout page can recover it after auth
        localStorage.setItem('hipaa_pending_price_id', priceId);
        window.location.href = result.path;
      } else if (result.type === 'checkout') {
        try {
          const stripe = await getStripe();
          if (stripe && result.sessionId) {
            await stripe.redirectToCheckout({ sessionId: result.sessionId });
          } else if (result.sessionUrl) {
            window.location.href = result.sessionUrl;
          }
        } catch {
          if (result.sessionUrl) {
            window.location.href = result.sessionUrl;
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

  // Always treat "Get Started" as a checkout action (falls back to /signup if no priceId)
  const isCtaCheckout = cta === 'Get Started';
  const isCtaSales = cta === 'Contact Sales';
  const isCtaDemo = false;

  return (
    <div className={`p-10 flex flex-col h-full border ${isFeatured ? 'border-gray-300 shadow-2xl relative z-10 lg:scale-105 bg-white' : 'border-gray-100 bg-white/50 shadow-sm'} transition-all duration-500 hover:-translate-y-2 group`}>
      {isFeatured && (
        <div className="absolute top-0 right-10 -translate-y-1/2 bg-cisco-green text-white text-[11px] font-thin px-5 py-2">
          Most popular
        </div>
      )}
      <h3 className="text-2xl font-thin text-cisco-navy mb-2 leading-tight">{title}</h3>
      <p className="text-gray-700 text-xs font-semibold mb-2">{bestFor}</p>
      
      <div className="flex flex-col mb-6">
        <div className="flex items-baseline">
          <span className="text-5xl font-thin text-cisco-navy">{price}</span>
          {price !== 'Custom' && (
            <span className="text-gray-500 text-base ml-2 font-thin">/ month</span>
          )}
        </div>
        {subtitle && <p className="text-gray-500 text-sm mt-3 leading-relaxed">{subtitle}</p>}
      </div>

      <div className="mb-10 flex-grow overflow-y-auto max-h-[600px]">
        {featureGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="mb-6">
            <p className={`text-xs font-thin text-cisco-blue mb-3 ${group.items.length === 0 ? 'font-medium italic' : 'font-medium'}`}>
              {group.title}
            </p>
            {group.items.length > 0 && (
              <ul className="space-y-3">
                {group.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start text-sm text-gray-600 font-thin leading-snug">
                    <Check size={14} className="text-cisco-blue mr-2 mt-0.5 flex-shrink-0 opacity-60" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {errorMsg && (
        <p className="mb-3 text-xs text-red-500 text-center font-light">{errorMsg}</p>
      )}

      <button 
        onClick={isCtaCheckout ? handleCheckout : isCtaSales ? onContactSales : isCtaDemo ? onDemoClick : undefined}
        disabled={isLoading}
        className={`w-full py-5 font-thin text-sm transition-all flex items-center justify-center gap-3 rounded-none disabled:opacity-70 disabled:cursor-not-allowed ${isFeatured ? 'bg-cisco-blue text-white hover:bg-cisco-navy' : 'bg-cisco-navy text-white hover:bg-cisco-blue'}`}
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Processing...
          </>
        ) : (
          <>
            {cta}
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </>
        )}
      </button>
      <p className="mt-3 text-center text-xs text-gray-500 font-thin">
        ✓ 14-day free trial · No credit card required
      </p>
      {bestForDescription && (
        <p className="mt-4 text-center text-xs text-gray-500 font-thin leading-relaxed">{bestForDescription}</p>
      )}
      <p className="mt-2 text-center text-xs text-gray-400 font-thin">Cancel anytime</p>
    </div>
  );
};

const PricingSection: React.FC<{ onDemoClick?: () => void }> = ({ onDemoClick }) => {
  const [isContactSalesModalOpen, setIsContactSalesModalOpen] = useState(false);

  return (
    <>
      <section id="pricing" className="py-24 bg-[#f8f9fa] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <div className="text-center mb-24">
          <h2 className="text-4xl lg:text-[54px] font-thin text-cisco-navy leading-[1.2] mb-6">
            Pricing built for private practices.
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg md:text-xl font-thin">
            Start where you are today. Upgrade only when your compliance exposure grows.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-0 max-w-7xl mx-auto">
          <PricingCard 
            title="ESSENTIAL"
            bestFor="Just you, or a small team. You still need full HIPAA coverage."
            price="$297"
            subtitle="The complete HIPAA compliance foundation for solo therapists and clinics with 1–5 staff. Everything the OCR expects to find, organized, documented, and ready."
            cta="Start free, 14 days, no credit card"
            priceId={ESSENTIAL_PRICE_ID}
            onDemoClick={onDemoClick}
            featureGroups={[
              {
                title: "Your protection layer",
                items: [
                  "9 HIPAA policies ready to activate: Privacy, Security, Breach Notification, and 6 more",
                  "Automated risk assessment with your compliance score updated in real time",
                  "Version control: every policy change is timestamped and auditable"
                ]
              },
              {
                title: "When the OCR calls",
                items: [
                  "One-click Audit Package export: everything compiled in hours, not weeks",
                  "Breach notification letter generator: compliant with 72-hour OCR reporting requirement",
                  "Structured Evidence Center: your documentation organized exactly how auditors expect it"
                ]
              },
              {
                title: "Your account",
                items: [
                  "Encrypted storage with role-based access and MFA",
                  "Full activity log: every action recorded for audit trail",
                  "Email support with 48-hour response"
                ]
              },
            ]}
            bestForDescription="Best for: Solo therapists, psychologists, and clinics with 1–5 staff who need complete HIPAA coverage without a compliance team."
          />
          <PricingCard 
            title="GROWTH"
            bestFor="Your practice is growing. Your compliance exposure is growing with it."
            price="$697"
            isFeatured
            subtitle="Everything in Essential, plus the oversight tools that multi-provider clinics and growing practices need to stay in control as complexity increases."
            cta="Start free, 14 days, no credit card"
            priceId={GROWTH_PRICE_ID}
            onDemoClick={onDemoClick}
            featureGroups={[
              {
                title: "Where Essential ends, Growth begins",
                items: [
                  "Vendor & BAA tracker with expiration alerts: never have an unsigned BAA again",
                  "Asset-based risk identification: know exactly which systems and devices carry PHI exposure",
                  "Mitigation tracking workflow: turn identified risks into assigned action items with deadlines"
                ]
              },
              {
                title: "Compliance across your whole team",
                items: [
                  "Staff training tracker: see who's certified, who's overdue, and who's never been trained",
                  "Automated compliance reminders: annual policy reviews, training renewals, and BAA renewals triggered automatically",
                  "Real-time compliance dashboard: your full compliance posture visible in one screen"
                ]
              },
              {
                title: "When incidents happen",
                items: [
                  "Incident logging with full response timeline",
                  "Priority email + business-hours phone support"
                ]
              },
            ]}
            bestForDescription="Best for: Clinics with 3–20 staff, multi-provider practices, and any practice where more than one person touches patient records."
          />
          <PricingCard 
            title="PRO"
            bestFor="Multiple locations. Board oversight. Zero margin for error."
            price="Custom"
            subtitle="Everything in Growth, plus enterprise-grade controls, executive reporting, and direct access to compliance guidance for organizations where HIPAA failure has board-level consequences."
            cta="Contact Sales"
            onContactSales={() => setIsContactSalesModalOpen(true)}
            onDemoClick={onDemoClick}
            featureGroups={[
              {
                title: "Built for organizational complexity",
                items: [
                  "Multi-location compliance framework: manage each location's compliance status independently or as a consolidated view",
                  "Executive & board-ready reporting: one-click reports formatted for governance meetings, not just auditors",
                  "Advanced audit export customization: tailor evidence packages by location, department, or audit type"
                ]
              },
              {
                title: "When you need more than software",
                items: [
                  "Quarterly compliance strategy call: review your posture, upcoming regulatory changes, and documentation gaps with our team",
                  "Documentation review guidance: expert eyes on your policies before an audit"
                ]
              },
              {
                title: "When a breach happens at scale",
                items: [
                  "Guided breach response workflow: step-by-step process with assigned owners and deadline tracking",
                  "Structured response templates for every breach scenario"
                ]
              },
              {
                title: "Direct access",
                items: [
                  "24-hour response SLA",
                  "Direct phone line, not a ticket queue"
                ]
              }
            ]}
            bestForDescription="Best for: Multi-location medical groups, DSOs, behavioral health networks, and organizations with board-level compliance reporting requirements."
          />
        </div>
        <p className="mt-10 text-center text-xs md:text-sm text-gray-500 font-thin">
          Not sure which plan? Start with Essential. You can upgrade anytime.
        </p>
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
