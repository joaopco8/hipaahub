import React from 'react';
import { Target, ClipboardCheck, BarChart3, ShieldAlert, ArrowRight, ShieldCheck, Info } from 'lucide-react';

const AssessmentStep: React.FC<{
  number: string;
  title: string;
  desc: string;
}> = ({ number, title, desc }) => (
  <div className="flex gap-6 relative group">
    <div className="flex-shrink-0 w-12 h-12 bg-cisco-navy text-white flex items-center justify-center font-thin text-xl group-hover:bg-cisco-blue transition-colors">
      {number}
    </div>
    <div className="pt-2">
      <h4 className="text-xl font-thin text-cisco-navy mb-2">{title}</h4>
      <p className="text-gray-500 text-sm font-thin leading-relaxed">{desc}</p>
    </div>
  </div>
);

const ComplianceAssessmentPage: React.FC<{ onBack: () => void; onStartForm?: () => void }> = ({ onBack, onStartForm }) => {
  return (
    <div className="bg-white min-h-screen">
      <div className="bg-white border-b py-2 px-4 md:px-12 text-[10px] text-gray-400">
        <div className="max-w-7xl mx-auto flex items-center space-x-2">
          <button onClick={onBack} className="hover:text-cisco-blue">Solutions</button>
          <span>/</span>
          <span className="text-gray-900 font-bold">Compliance Assessment</span>
        </div>
      </div>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-12 grid lg:grid-cols-2 gap-24 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-thin text-cisco-navy leading-tight mb-8">
              Benchmarking <br /> Your Defensibility.
            </h1>
            <p className="text-gray-600 text-lg md:text-xl font-thin leading-relaxed mb-10">
              Our 30-minute assessment uses the same scoring methodology as federal 
              OCR auditors to determine your organizational risk profile.
            </p>
            <div className="space-y-12">
              <AssessmentStep 
                number="01"
                title="Posture Evaluation"
                desc="Review of technical safeguards, administrative controls, and documentation maturity."
              />
              <AssessmentStep 
                number="02"
                title="Gap Quantification"
                desc="Identification of specific regulatory implementation specifications currently unmet."
              />
              <AssessmentStep 
                number="03"
                title="Risk Scoring"
                desc="A finalized defensibility score (0-100) and a prioritized remediation roadmap."
              />
            </div>
            <button 
              onClick={onStartForm}
              className="mt-16 bg-cisco-blue text-white px-10 py-5 text-sm font-bold hover:bg-cisco-navy transition-all"
            >
              Request Assessment Call
            </button>
          </div>
          
          <div className="relative">
             <div className="bg-gray-50 p-12 border border-gray-100">
                <div className="flex items-center justify-between mb-10 pb-6 border-b">
                   <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Audit focus areas</h4>
                   <ShieldCheck className="text-cisco-blue" />
                </div>
                <div className="grid grid-cols-2 gap-8">
                   {[
                     { label: "SRA Validity", icon: <Target size={20} /> },
                     { label: "Policy Maturity", icon: <ClipboardCheck size={20} /> },
                     { label: "Training Proof", icon: <BarChart3 size={20} /> },
                     { label: "Breach Protocols", icon: <ShieldAlert size={20} /> }
                   ].map((item, i) => (
                     <div key={i} className="space-y-4">
                        <div className="text-cisco-blue opacity-40">{item.icon}</div>
                        <h5 className="text-sm font-bold text-cisco-navy">{item.label}</h5>
                     </div>
                   ))}
                </div>
                
                <div className="mt-12 p-6 bg-white border border-blue-50">
                   <div className="flex items-start gap-4">
                      <Info className="text-cisco-blue shrink-0 mt-1" size={16} />
                      <p className="text-xs text-gray-500 font-thin leading-relaxed">
                        Results of this assessment are confidential and protected under our 
                        master BAA agreement protocols.
                      </p>
                   </div>
                </div>
             </div>
             
             {/* Decorative UI element */}
             <div className="absolute -top-4 -right-4 w-24 h-24 bg-cisco-blue/5 rounded-full -z-10"></div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ComplianceAssessmentPage;
