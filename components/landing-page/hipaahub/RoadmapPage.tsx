import React from 'react';
import { RefreshCw, Map, Clock, CheckCircle2, ArrowRight, Target } from 'lucide-react';

const RoadmapPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="bg-white min-h-screen">
      <div className="bg-white border-b py-2 px-4 md:px-12 text-[10px] text-gray-400">
        <div className="max-w-7xl mx-auto flex items-center space-x-2">
          <button onClick={onBack} className="hover:text-cisco-blue">Platform</button>
          <span>/</span>
          <span className="text-gray-900 font-bold">Compliance Roadmap</span>
        </div>
      </div>

      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="text-center mb-24">
            <h1 className="text-4xl md:text-[54px] font-thin text-cisco-navy mb-6">Strategic Implementation.</h1>
            <p className="text-gray-500 text-lg md:text-xl font-thin max-w-2xl mx-auto">
              A structured, phase-based path from fragmentation to <br /> institutional clinical infrastructure.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 mb-24">
             {[
               { phase: "Assess", time: "Day 1-2", status: "Completed" },
               { phase: "Remediate", time: "Day 3-7", status: "Active" },
               { phase: "Document", time: "Day 8-10", status: "Pending" },
               { phase: "Certify", time: "Day 11-14", status: "Pending" }
             ].map((item, i) => (
               <div key={i} className="bg-white p-8 border border-gray-100 flex flex-col justify-between h-full group hover:border-cisco-blue transition-all">
                 <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 block">Phase 0{i+1}</span>
                    <h4 className="text-2xl font-thin text-cisco-navy mb-4">{item.phase}</h4>
                    <p className="text-xs text-cisco-blue font-bold mb-8">{item.time}</p>
                 </div>
                 <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 group-hover:text-cisco-navy transition-colors">
                    {item.status === 'Completed' ? <CheckCircle2 size={16} className="text-cisco-green" /> : <Clock size={16} />}
                    {item.status}
                 </div>
               </div>
             ))}
          </div>

          <div className="max-w-4xl mx-auto bg-cisco-navy p-12 text-white relative overflow-hidden">
             <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="max-w-lg">
                   <h3 className="text-3xl font-thin mb-6">Track Implementation Progress in Real-Time.</h3>
                   <p className="text-gray-400 font-thin leading-relaxed">
                     Our project management dashboard allows medical boards and executives to monitor 
                     milestone achievement and resource allocation during the 14-day build.
                   </p>
                </div>
                <button className="bg-cisco-blue text-white px-10 py-5 text-sm font-bold hover:bg-white hover:text-cisco-navy transition-all whitespace-nowrap">
                   Launch Project Tracker
                </button>
             </div>
             <div className="absolute top-0 right-0 opacity-5 -translate-y-1/2 translate-x-1/2">
                <RefreshCw size={300} strokeWidth={0.5} />
             </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RoadmapPage;
