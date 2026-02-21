import React from 'react';
import { Zap, ShieldCheck, Clock, ArrowRight, CheckCircle2, Layers, RefreshCw } from 'lucide-react';

const TierCard: React.FC<{
  title: string;
  timeline: string;
  desc: string;
  items: string[];
  cta: string;
  isFeatured?: boolean;
}> = ({ title, timeline, desc, items, cta, isFeatured }) => (
  <div className={`p-10 border ${isFeatured ? 'border-cisco-blue bg-white shadow-2xl relative z-10' : 'border-gray-100 bg-gray-50/50'} flex flex-col h-full`}>
    <h3 className="text-2xl font-light text-cisco-navy mb-2">{title}</h3>
    <div className="flex items-center gap-2 text-cisco-blue font-bold text-xs mb-8 uppercase tracking-widest">
      <Clock size={14} /> {timeline}
    </div>
    <p className="text-gray-500 text-sm font-light leading-relaxed mb-10">{desc}</p>
    <ul className="space-y-4 mb-12 flex-grow">
      {items.map((item, i) => (
        <li key={i} className="flex items-start text-sm text-gray-600 font-light">
          <CheckCircle2 size={16} className="text-cisco-blue mr-3 mt-0.5 flex-shrink-0" />
          {item}
        </li>
      ))}
    </ul>
    <button className={`w-full py-5 text-xs font-bold uppercase tracking-widest transition-all ${isFeatured ? 'bg-cisco-blue text-white hover:bg-cisco-navy' : 'bg-cisco-navy text-white hover:bg-cisco-blue'}`}>
      {cta}
    </button>
  </div>
);

const ImplementationServicesPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="bg-white min-h-screen">
      <div className="bg-white border-b py-2 px-4 md:px-12 text-[10px] text-gray-400">
        <div className="max-w-7xl mx-auto flex items-center space-x-2">
          <button onClick={onBack} className="hover:text-cisco-blue">Solutions</button>
          <span>/</span>
          <span className="text-gray-900 font-bold">Implementation Services</span>
        </div>
      </div>

      <section className="py-24 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-12 grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-light text-cisco-navy leading-tight mb-8">
              Expert-Led <br /> Implementation.
            </h1>
            <p className="text-gray-600 text-lg md:text-xl font-light leading-relaxed mb-10">
              Compliance isn't just software—it's execution. Our services ensure your 
              platform is mapped to your specific clinical reality from Day 1.
            </p>
            <div className="flex flex-wrap gap-4">
               <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-cisco-blue text-xs font-bold rounded-full">
                 <Zap size={14} /> Rapid Deployment
               </div>
               <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-cisco-blue text-xs font-bold rounded-full">
                 <ShieldCheck size={14} /> OCR-Aligned
               </div>
            </div>
          </div>
          <div className="bg-gray-50 p-10 border border-gray-100 relative">
             <div className="absolute top-0 right-0 p-8 opacity-5">
               <Layers size={100} />
             </div>
             <h4 className="text-[10px] font-bold text-gray-400 mb-8 border-b pb-4 uppercase tracking-widest">Why professional implementation?</h4>
             <ul className="space-y-6">
                {[
                  "Avoid common 'generic' policy mistakes",
                  "Properly classify technical vulnerabilities",
                  "Structured staff training onboarding",
                  "Verified audit-ready documentation"
                ].map((item, i) => (
                  <li key={i} className="flex items-start text-sm text-gray-500 font-light">
                    <CheckCircle2 size={16} className="text-cisco-blue mr-3 mt-1" />
                    {item}
                  </li>
                ))}
             </ul>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-12 grid md:grid-cols-2 gap-8 lg:gap-0 max-w-5xl mx-auto">
          <TierCard 
            title="7-Day Readiness Sprint"
            timeline="1 business week"
            desc="For organizations with existing documentation that need to be centralized and verified."
            items={[
              "Rapid documentation consolidation",
              "Gap identification & remediation",
              "9 basic policy customizations",
              "Initial risk assessment run",
              "Evidence package compilation"
            ]}
            cta="Schedule Sprint"
          />
          <TierCard 
            isFeatured
            title="21-Day Full Deployment"
            timeline="3 business weeks"
            desc="Comprehensive build-out for clinics starting from scratch or requiring complete remediation."
            items={[
              "End-to-end regulatory mapping",
              "Deep technical safeguard review",
              "Full staff training & certification",
              "Custom incident response builder",
              "Quarterly monitoring setup",
              "Board-ready compliance report"
            ]}
            cta="Request Full Deployment"
          />
        </div>
      </section>
    </div>
  );
};

export default ImplementationServicesPage;