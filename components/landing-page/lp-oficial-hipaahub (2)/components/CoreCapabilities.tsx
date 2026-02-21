import React from 'react';
import { Database, ShieldCheck, Cpu, LayoutGrid, ArrowRight, Zap, RefreshCw, Layers } from 'lucide-react';

const CoreCapabilities: React.FC = () => {
  return (
    <section className="w-full">
      <div className="bg-cisco-navy py-24 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-12 grid lg:grid-cols-2 gap-20 items-center">
          <div className="order-2 lg:order-1 relative">
            <div className="relative rounded-none overflow-hidden aspect-[4/3] shadow-2xl border border-white/5">
              <img 
                src="https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&q=80&w=1200" 
                alt="Cloud Infrastructure" 
                className="w-full h-full object-cover brightness-50 opacity-40"
              />
              <div className="absolute inset-0 flex items-center justify-center p-12">
                 <div className="w-full h-full border border-cisco-blue/30 backdrop-blur-xl bg-white/5 p-10 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="h-1 w-24 bg-cisco-blue"></div>
                      <div className="h-6 w-3/4 bg-white/10"></div>
                      <div className="h-4 w-1/2 bg-white/5"></div>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                       {[1,2,3,4].map(i => <div key={i} className="h-12 bg-white/5"></div>)}
                    </div>
                 </div>
              </div>
            </div>
          </div>

          <div className="text-white order-1 lg:order-2">
            <h2 className="text-4xl lg:text-[48px] font-light leading-tight mb-12">
              Enterprise-Grade <br /> Security <br /> Infrastructure.
            </h2>
            
            <button className="bg-cisco-blue text-white px-10 py-5 text-xs font-bold hover:bg-white hover:text-cisco-navy transition-all">
              View Technical Architecture
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoreCapabilities;