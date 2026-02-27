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

const ESSENTIAL_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_ESSENTIAL_PRICE_ID || '';
const GROWTH_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID || '';

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
      <p className="text-gray-500 text-xs font-thin mb-8">{bestFor}</p>
      
        <div className="flex flex-col mb-10">
        <div className="flex items-baseline">
          <span className="text-5xl font-thin text-cisco-navy">{price}</span>
          {price !== 'Custom' && <span className="text-gray-500 text-base ml-2 font-thin">/ month</span>}
        </div>
        {subtitle && <p className="text-gray-400 text-sm mt-2">{subtitle}</p>}
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
          <h2 className="text-4xl lg:text-[54px] font-thin text-cisco-navy leading-[1.2] mb-6">Transparent, <br /> Predictable Pricing.</h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg md:text-xl font-thin">
            Choose the plan that fits your organization.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-0 max-w-7xl mx-auto">
          <PricingCard 
            title="ESSENTIAL"
            bestFor="For solo practices & small clinics (1–5 staff)"
            price="$297"
            subtitle=""
            cta="Get Started"
            priceId={ESSENTIAL_PRICE_ID}
            onDemoClick={onDemoClick}
            featureGroups={[
              {
                title: "Core Compliance Infrastructure",
                items: [
                  "Secure access with MFA",
                  "Role-based permissions",
                  "Encrypted cloud storage",
                  "Activity & access logs"
                ]
              },
              {
                title: "Risk & Documentation",
                items: [
                  "HIPAA-aligned Risk Assessment",
                  "Automated risk scoring + PDF report",
                  "9 customized HIPAA policies",
                  "Version control & audit history"
                ]
              },
              {
                title: "Audit Readiness",
                items: [
                  "Structured Evidence Center",
                  "Breach notification letter generator",
                  "One-click Audit Package export"
                ]
              },
              {
                title: "Support",
                items: [
                  "Email support (48h response)"
                ]
              }
            ]}
            bestForDescription="Best for: Clinics needing structured HIPAA documentation and audit readiness."
          />
          <PricingCard 
            title="GROWTH"
            bestFor="For scaling & multi-provider clinics (6–20 staff)"
            price="$697"
            isFeatured
            subtitle=""
            cta="Get Started"
            priceId={GROWTH_PRICE_ID}
            onDemoClick={onDemoClick}
            featureGroups={[
              {
                title: "Everything in Essential, plus:",
                items: []
              },
              {
                title: "Advanced Risk Management",
                items: [
                  "Custom risk scoring",
                  "Mitigation tracking workflow",
                  "Asset-based risk identification"
                ]
              },
              {
                title: "Vendor & Incident Management",
                items: [
                  "Vendor & BAA tracking with alerts",
                  "Incident logging & response timeline"
                ]
              },
              {
                title: "Compliance Oversight",
                items: [
                  "Real-time compliance dashboard",
                  "Staff training tracking",
                  "Automated compliance reminders"
                ]
              },
              {
                title: "Support",
                items: [
                  "Priority email",
                  "Business-hours phone support"
                ]
              }
            ]}
            bestForDescription="Best for: Growing clinics requiring structured compliance oversight and accountability."
          />
          <PricingCard 
            title="PRO"
            bestFor="For medical groups & high-liability organizations"
            price="Custom"
            subtitle=""
            cta="Contact Sales"
            onContactSales={() => setIsContactSalesModalOpen(true)}
            onDemoClick={onDemoClick}
            featureGroups={[
              {
                title: "Everything in Growth, plus:",
                items: []
              },
              {
                title: "Enterprise Compliance Controls",
                items: [
                  "Multi-location framework",
                  "Executive & board-ready reporting",
                  "Advanced audit export customization"
                ]
              },
              {
                title: "Strategic Guidance",
                items: [
                  "Quarterly compliance strategy call",
                  "Documentation review guidance"
                ]
              },
              {
                title: "Rapid Breach Toolkit",
                items: [
                  "Guided breach workflow",
                  "Structured response templates"
                ]
              },
              {
                title: "Priority Support",
                items: [
                  "24h response SLA",
                  "Direct phone access"
                ]
              }
            ]}
            bestForDescription="Best for: Organizations requiring executive-level compliance visibility and structured governance."
          />
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
