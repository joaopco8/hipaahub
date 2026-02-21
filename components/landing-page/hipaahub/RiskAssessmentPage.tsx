import React from 'react';
import { ArrowLeft, Cpu, Target, AlertTriangle, TrendingDown, CheckCircle2 } from 'lucide-react';

const RiskAssessmentPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="bg-white min-h-screen">
      <div className="bg-white border-b py-2 px-4 md:px-12 text-[10px] text-gray-400">
        <div className="max-w-7xl mx-auto flex items-center space-x-2">
          <button onClick={onBack} className="hover:text-cisco-blue">Platform</button>
          <span>/</span>
          <span className="text-gray-900 font-bold">Risk Assessment Engine</span>
        </div>
      </div>

      <section className="bg-cisco-navy text-white py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <div className="bg-cisco-blue inline-block p-3 mb-8">
                <Cpu size={32} />
              </div>
              <h1 className="text-4xl md:text-6xl font-thin leading-tight mb-8">
                Risk Identification <br /> & Quantification.
              </h1>
              <p className="text-gray-300 text-lg md:text-xl font-thin leading-relaxed mb-10 max-w-xl">
                Our proprietary Risk Assessment Engine evaluates your organization against the 
                NIST Cybersecurity Framework and HIPAA Security Rule.
              </p>
              <button className="bg-cisco-blue text-white px-10 py-5 text-sm font-bold hover:bg-white hover:text-cisco-navy transition-all">
                Run Preliminary Scan
              </button>
            </div>
            
            <div className="relative">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-12 shadow-2xl">
                 <div className="flex items-center justify-between mb-12">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Risk Score</h4>
                    <span className="text-4xl font-thin text-amber-500">68/100</span>
                 </div>
                 <div className="space-y-8">
                    {[
                      { label: "Technical Safeguards", score: 45, status: "Critical" },
                      { label: "Administrative Controls", score: 72, status: "Moderate" },
                      { label: "Physical Security", score: 88, status: "Low" }
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between text-sm">
                           <span className="font-thin">{item.label}</span>
                           <span className={item.status === 'Critical' ? 'text-red-400' : 'text-gray-400'}>{item.status}</span>
                        </div>
                        <div className="h-1 bg-white/10 w-full overflow-hidden">
                           <div className="h-full bg-cisco-blue transition-all duration-1000" style={{ width: `${item.score}%` }}></div>
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-12 grid md:grid-cols-3 gap-16">
          <div className="space-y-6">
            <Target className="text-cisco-blue" size={40} />
            <h3 className="text-2xl font-thin text-cisco-navy">Granular Analysis</h3>
            <p className="text-gray-500 font-thin leading-relaxed">
              We move beyond general checkboxes to evaluate 164 specific regulatory implementation specifications.
            </p>
          </div>
          <div className="space-y-6">
            <AlertTriangle className="text-amber-500" size={40} />
            <h3 className="text-2xl font-thin text-cisco-navy">Vulnerability Prioritization</h3>
            <p className="text-gray-500 font-thin leading-relaxed">
              Not all gaps are equal. Our engine identifies high-impact vulnerabilities that represent the greatest liability.
            </p>
          </div>
          <div className="space-y-6">
            <TrendingDown className="text-cisco-green" size={40} />
            <h3 className="text-2xl font-thin text-cisco-navy">Continuous Benchmarking</h3>
            <p className="text-gray-500 font-thin leading-relaxed">
              Track your risk reduction over time as policies are implemented and safeguards are verified.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RiskAssessmentPage;
