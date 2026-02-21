import React from 'react';
import { Check, ArrowRight, ShieldCheck, Zap, Star } from 'lucide-react';

const PricingCard: React.FC<{ 
  title: string; 
  price: string; 
  subtitle: string;
  features: string[]; 
  isFeatured?: boolean; 
  cta: string;
  bestFor: string;
}> = ({ title, price, subtitle, features, isFeatured, cta, bestFor }) => (
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
      <p className="text-gray-400 text-sm mt-2">{subtitle}</p>
    </div>

    <div className="mb-10 flex-grow">
      <p className="text-xs font-thin text-cisco-blue mb-6 border-b border-gray-200 pb-2">Includes:</p>
      <ul className="space-y-4">
        {features.map((f, i) => (
          <li key={i} className="flex items-start text-base text-gray-600 font-thin leading-snug">
            <Check size={16} className="text-cisco-blue mr-3 mt-0.5 flex-shrink-0 opacity-60" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>

    <button className={`w-full py-5 font-thin text-sm transition-all flex items-center justify-center gap-3 rounded-none ${isFeatured ? 'bg-cisco-blue text-white hover:bg-cisco-navy' : 'bg-cisco-navy text-white hover:bg-cisco-blue'}`}>
      {cta}
      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
    </button>
    <p className="mt-4 text-center text-xs text-gray-400 font-thin">14-Day Free Trial</p>
  </div>
);

const PricingSection: React.FC = () => {
  return (
    <section id="pricing" className="py-24 bg-[#f8f9fa] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <div className="text-center mb-24">
          <h2 className="text-4xl lg:text-[54px] font-thin text-cisco-navy leading-[1.2] mb-6">Transparent, <br /> Predictable Pricing.</h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg md:text-xl font-thin">
            Choose the plan that fits your organization. Save 17% on annual billing.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-0 max-w-7xl mx-auto">
          <PricingCard 
            title="Starter Plan"
            bestFor="Solo practices, startup clinics"
            price="$99"
            subtitle="or $990/year (1-5 staff)"
            cta="Start Free Trial"
            features={[
              "Risk Assessment Engine",
              "9 customizable policies",
              "10GB Documentation repository",
              "Training module access",
              "Breach notification templates",
              "Quarterly compliance review",
              "Email support"
            ]}
          />
          <PricingCard 
            title="Professional Plan"
            bestFor="Mid-size, multi-provider clinics"
            price="$299"
            isFeatured
            subtitle="or $2,990/year (6-20 staff)"
            cta="Start Free Trial"
            features={[
              "Advanced risk assessment",
              "Multi-location support",
              "Unlimited staff training tracking",
              "Incident response support",
              "Quarterly audit verification",
              "Priority email support",
              "Phone support (business hours)",
              "Custom policy templates",
              "API access"
            ]}
          />
          <PricingCard 
            title="Enterprise Plan"
            bestFor="Hospital systems, large groups"
            price="Custom"
            subtitle="Organizations with 20+ staff"
            cta="Contact Sales"
            features={[
              "Dedicated compliance advisor",
              "On-site training",
              "Custom integrations",
              "Advanced reporting",
              "Multi-site framework",
              "24/7 Breach response hotline",
              "SLA guarantee"
            ]}
          />
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
