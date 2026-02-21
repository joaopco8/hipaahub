import React from 'react';
import { Database, Activity, Search, AlertCircle, CheckCircle2, LayoutGrid } from 'lucide-react';

const GapAnalysisPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="bg-white min-h-screen">
      <div className="bg-white border-b py-2 px-4 md:px-12 text-[10px] text-gray-400">
        <div className="max-w-7xl mx-auto flex items-center space-x-2">
          <button onClick={onBack} className="hover:text-cisco-blue">Platform</button>
          <span>/</span>
          <span className="text-gray-900 font-bold">Gap Analysis Dashboard</span>
        </div>
      </div>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-cisco-blue text-[10px] font-bold mb-8 uppercase tracking-widest">
                <Activity size={14} /> Real-time monitoring
              </div>
              <h1 className="text-4xl md:text-6xl font-thin text-cisco-navy mb-10 leading-tight">
                Visibility into <br /> Operational Gaps.
              </h1>
              <p className="text-gray-600 text-lg md:text-xl font-thin leading-relaxed mb-10">
                Centralized dashboard identifying missing safeguards, expired policies, 
                and outstanding staff certifications.
              </p>
              <div className="space-y-4 mb-12">
                 {[
                   "Missing technical safeguard evidence",
                   "Outdated risk assessments",
                   "Staff with pending certifications",
                   "Business associates without valid BAAs"
                 ].map((item, i) => (
                   <div key={i} className="flex items-center text-sm font-thin text-slate-700">
                      <AlertCircle size={16} className="text-amber-500 mr-4" />
                      {item}
                   </div>
                 ))}
              </div>
              <button className="bg-cisco-navy text-white px-10 py-5 text-sm font-bold hover:bg-cisco-blue transition-all">
                Access Live Dashboard
              </button>
            </div>
            
            <div className="relative">
              <div className="bg-gray-50 border border-gray-100 p-12 shadow-inner">
                 <div className="flex items-center justify-between mb-10 pb-6 border-b">
                    <h4 className="text-xs font-bold text-gray-400">POSTURE VISUALIZATION</h4>
                    <div className="flex gap-2">
                       <div className="w-2 h-2 rounded-full bg-red-400"></div>
                       <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                       <div className="w-2 h-2 rounded-full bg-cisco-green"></div>
                    </div>
                 </div>
                 <div className="aspect-[16/9] bg-white border border-dashed border-gray-300 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-gray-300">Live Analytics Mockup</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GapAnalysisPage;
