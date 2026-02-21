import React from 'react';
import { Scale, Clock, AlertTriangle, CheckCircle2, ArrowRight, FileText, Layout, RefreshCw, Layers } from 'lucide-react';

const RegulatoryTrackerItem: React.FC<{
  status: 'active' | 'pending' | 'draft';
  title: string;
  impact: 'High' | 'Medium' | 'Low';
  date: string;
  desc: string;
}> = ({ status, title, impact, date, desc }) => (
  <div className="flex gap-8 group">
    <div className="flex flex-col items-center">
      <div className={`w-3 h-3 rounded-full mb-4 ${status === 'active' ? 'bg-cisco-green' : status === 'pending' ? 'bg-amber-400' : 'bg-gray-200'}`}></div>
      <div className="w-[1px] flex-grow bg-gray-100 group-last:hidden"></div>
    </div>
    <div className="pb-16 pt-[-4px]">
      <div className="flex items-center gap-4 mb-3">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{date}</span>
        <span className={`px-2 py-0.5 text-[8px] font-bold text-white uppercase tracking-widest ${impact === 'High' ? 'bg-red-500' : impact === 'Medium' ? 'bg-amber-500' : 'bg-gray-400'}`}>
          {impact} Impact
        </span>
      </div>
      <h4 className="text-xl font-thin text-cisco-navy mb-4 group-hover:text-cisco-blue transition-colors cursor-pointer">{title}</h4>
      <p className="text-gray-500 text-sm font-thin leading-relaxed max-w-2xl">{desc}</p>
    </div>
  </div>
);

const RegulatoryAnalysisPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="bg-white min-h-screen">
      <div className="bg-white border-b py-2 px-4 md:px-12 text-[10px] text-gray-400">
        <div className="max-w-7xl mx-auto flex items-center space-x-2">
          <button onClick={onBack} className="hover:text-cisco-blue">Research</button>
          <span>/</span>
          <span className="text-gray-900 font-bold">Regulatory Analysis</span>
        </div>
      </div>

      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="max-w-4xl mb-24">
            <div className="w-12 h-1 bg-cisco-blue mb-10"></div>
            <h1 className="text-4xl md:text-6xl font-thin text-cisco-navy leading-tight mb-8">
              Regulatory Infrastructure <br /> Analysis.
            </h1>
            <p className="text-gray-500 text-lg md:text-xl font-thin leading-relaxed">
              Systematic tracking and interpretation of federal and state healthcare 
              regulations. We bridge the gap between legal text and clinical operations.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-24 items-start">
            <div className="lg:col-span-2">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-16 border-b pb-6 flex justify-between items-center">
                ACTIVE REGULATORY TRACKER
                <div className="flex gap-4">
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-cisco-green"></div><span className="text-[9px]">ENFORCED</span></div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-400"></div><span className="text-[9px]">PENDING</span></div>
                </div>
              </h3>
              
              <div className="space-y-4">
                <RegulatoryTrackerItem 
                  status="active"
                  impact="High"
                  date="JAN 2026"
                  title="HIPAA Privacy Rule: Reproductive Health Data"
                  desc="New federal mandates limiting the disclosure of PHI related to reproductive healthcare services. Requires immediate policy and BAA updates."
                />
                <RegulatoryTrackerItem 
                  status="pending"
                  impact="Medium"
                  date="MAR 2026"
                  title="Change Healthcare Breach: OCR Audit Wave"
                  desc="Anticipated surge in desk audits targeting organizations utilizing third-party billing and clearinghouse providers affected by the 2024 outage."
                />
                <RegulatoryTrackerItem 
                  status="draft"
                  impact="High"
                  date="Q3 2026"
                  title="NIST 800-53 Rev. 6 Alignment"
                  desc="Upcoming revisions to the cybersecurity framework governing federal healthcare data standards. Significant changes to logging and MFA protocols expected."
                />
              </div>
            </div>

            <div className="space-y-12">
              <div className="bg-white p-10 shadow-xl border border-gray-100">
                <Scale className="text-cisco-blue mb-8" size={32} strokeWidth={1.5} />
                <h4 className="text-xl font-thin text-cisco-navy mb-4">Legal Deep Dives</h4>
                <p className="text-gray-500 text-sm font-thin leading-relaxed mb-10">
                  Detailed interpretations of OCR settlement letters and administrative law changes.
                </p>
                <div className="space-y-6">
                  {[
                    "Analysis: The 'Safe Harbor' Myth",
                    "State Law: California CCPA vs HIPAA",
                    "Audit Defense: Case Study 042"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs text-cisco-navy group cursor-pointer hover:text-cisco-blue">
                      <span>{item}</span>
                      <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-cisco-navy p-10 text-white relative overflow-hidden">
                <div className="relative z-10">
                   <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">IMPACT ASSESSMENT</h4>
                   <h3 className="text-2xl font-thin mb-8">Ready for the 2026 <br /> Privacy Rule Update?</h3>
                   <p className="text-gray-400 text-sm font-thin leading-relaxed mb-10">
                     Our analysis division has prepared a 12-point impact assessment for clinical leadership.
                   </p>
                   <button className="text-cisco-blue text-xs font-bold flex items-center hover:text-white transition-colors">
                      VIEW IMPACT REPORT <ArrowRight size={14} className="ml-2" />
                   </button>
                </div>
                <RefreshCw size={200} className="absolute -bottom-20 -right-20 text-white/5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-12 grid md:grid-cols-3 gap-16">
          <div className="space-y-6">
            <Layout className="text-cisco-blue" size={40} strokeWidth={1} />
            <h3 className="text-2xl font-thin text-cisco-navy">Institutional Mapping</h3>
            <p className="text-gray-500 font-thin leading-relaxed">
              We map legal requirements to specific UI fields and platform features, ensuring 1:1 compliance execution.
            </p>
          </div>
          <div className="space-y-6">
            <Layers className="text-cisco-blue" size={40} strokeWidth={1} />
            <h3 className="text-2xl font-thin text-cisco-navy">State-by-State Analysis</h3>
            <p className="text-gray-500 font-thin leading-relaxed">
              Beyond federal HIPAA, we track the patchwork of state-level data privacy laws affecting clinical operations.
            </p>
          </div>
          <div className="space-y-6">
            <CheckCircle2 className="text-cisco-green" size={40} strokeWidth={1} />
            <h3 className="text-2xl font-thin text-cisco-navy">Audit Defensibility</h3>
            <p className="text-gray-500 font-thin leading-relaxed">
              All analysis is benchmarked against the actual reporting standards used by federal OCR auditors during desk audits.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RegulatoryAnalysisPage;
