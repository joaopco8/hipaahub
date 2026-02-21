import React from 'react';
import { Search, TrendingDown, Clock, CheckCircle2 } from 'lucide-react';

const StatsSection: React.FC = () => {
  return (
    <section className="py-24 bg-gray-50 border-b border-gray-200 border-[0.5px]">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-4xl lg:text-[48px] font-thin text-cisco-navy leading-[1.2] mb-8">
              Know Your <br /> Compliance Risk. <br /> In Real-Time.
            </h2>
            <h3 className="text-xl font-thin text-cisco-blue mb-8">
              Automated risk identification and quantification.
            </h3>
            <p className="text-gray-600 text-lg font-thin leading-relaxed mb-10">
              HIPAA Hub Risk Assessment Engine evaluates your organization against regulatory requirements and produces a compliance risk score.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6">
              <button className="bg-cisco-blue text-white px-10 py-5 text-xs font-thin hover:bg-cisco-navy transition-all">
                Get Your Risk Assessment
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white p-2 shadow-2xl border border-gray-100 rounded-none overflow-hidden">
               <img 
                 src="https://images.unsplash.com/photo-1551288049-bbbda546697a?auto=format&fit=crop&q=80&w=1200" 
                 alt="Compliance Monitoring Interface" 
                 className="w-full h-full object-cover grayscale brightness-95 hover:grayscale-0 transition-all duration-1000"
               />
            </div>
            
            {/* Visual element behind */}
            <div className="absolute -bottom-6 -right-6 w-full h-full border border-gray-200 -z-10 translate-x-4 translate-y-4"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
