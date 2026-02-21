import React from 'react';
import { CheckCircle2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

const BottomCTA: React.FC<{ onAssessmentClick?: () => void }> = ({ onAssessmentClick }) => {
  const trustItems = [
    "500+ healthcare organizations",
    "100% audit success rate",
    "Average risk reduction: 50 pts",
    "99.99% platform uptime",
    "SOC 2 Type II certified",
    "HIPAA compliant",
    "24/7 support (Enterprise)",
    "14-day free trial"
  ];

  return (
    <section className="bg-cisco-navy text-white py-24 md:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div className="max-w-3xl">
            <h2 className="text-4xl lg:text-[60px] font-light leading-[1.2] mb-8 text-white">
              Transform Your <br /> Compliance Posture.
            </h2>
            <h3 className="text-xl md:text-2xl font-normal text-cisco-blue mb-10">
              Start your free trial today. No credit card required.
            </h3>
            <p className="text-gray-400 text-lg font-light leading-relaxed mb-12">
              HIPAA Hub transforms compliance from reactive crisis management into continuous operational infrastructure. Centralized documentation. Automated risk assessment. Continuous audit readiness.
            </p>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6">
              <button 
                onClick={onAssessmentClick}
                className="bg-cisco-blue text-white px-12 py-6 text-xs font-bold hover:bg-white hover:text-cisco-navy transition-all shadow-2xl shadow-cisco-blue/20"
              >
                Start 14-Day Free Trial
              </button>
              <button className="text-white flex items-center justify-center text-sm font-bold hover:text-cisco-blue transition-colors group">
                Request Platform Demo <ArrowRight size={18} className="ml-3 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-10 md:p-16 backdrop-blur-xl relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
               <ShieldCheck size={80} />
            </div>
            <h4 className="text-[10px] font-bold text-blue-400 mb-10 uppercase tracking-widest">Trust Indicators</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {trustItems.map((item, i) => (
                <div key={i} className="flex items-center text-sm text-gray-300 font-normal">
                  <CheckCircle2 size={16} className="text-cisco-blue mr-4 flex-shrink-0 opacity-60" />
                  {item}
                </div>
              ))}
            </div>
            
            <div className="mt-12 pt-8 border-t border-white/5 flex items-center gap-6">
               <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => <div key={i} className="w-10 h-10 rounded-full bg-gray-600 border-2 border-cisco-navy overflow-hidden"><img src={`https://i.pravatar.cc/100?img=${i+20}`} alt="User" className="grayscale" /></div>)}
               </div>
               <p className="text-xs text-gray-500 font-bold leading-tight">Join 500+ <br /> Secure Clinics</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BottomCTA;