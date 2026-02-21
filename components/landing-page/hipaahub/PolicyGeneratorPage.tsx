import React from 'react';
import { FileText, Edit, CheckSquare, History, ShieldCheck, Download } from 'lucide-react';

const PolicyGeneratorPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const policies = [
    "Privacy Policy", "Security Policy", "Breach Notification",
    "Access Control", "Audit & Accountability", "Encryption Protocol",
    "Incident Response", "Business Associate Agreement", "Workforce Security"
  ];

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-white border-b py-2 px-4 md:px-12 text-[10px] text-gray-400">
        <div className="max-w-7xl mx-auto flex items-center space-x-2">
          <button onClick={onBack} className="hover:text-cisco-blue">Platform</button>
          <span>/</span>
          <span className="text-gray-900 font-bold">Policy Generator</span>
        </div>
      </div>

      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="flex flex-col md:flex-row gap-16 items-center mb-24">
            <div className="flex-1">
              <div className="w-12 h-[2px] bg-cisco-blue mb-8"></div>
              <h1 className="text-4xl md:text-5xl font-thin text-cisco-navy leading-tight mb-8">
                Institutional Policy <br /> Infrastructure.
              </h1>
              <p className="text-gray-500 text-lg font-thin leading-relaxed mb-10">
                Generate, customize, and maintain the 9 core HIPAA policies required 
                for audit defensibility. Centralized management with version control.
              </p>
              <div className="flex flex-wrap gap-4">
                 <button className="bg-cisco-navy text-white px-8 py-4 text-xs font-bold hover:bg-cisco-blue transition-all">
                   Preview Library
                 </button>
                 <button className="border border-gray-200 text-gray-500 px-8 py-4 text-xs font-bold hover:bg-white hover:text-cisco-navy transition-all">
                   Integration Guide
                 </button>
              </div>
            </div>
            
            <div className="flex-1 w-full">
              <div className="bg-white border border-gray-100 shadow-xl p-10">
                 <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-10">Compliance Library (9)</h4>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {policies.map((p, i) => (
                      <div key={i} className="p-4 border border-gray-50 bg-gray-50/30 flex items-center justify-between group hover:border-cisco-blue transition-all cursor-pointer">
                        <span className="text-sm font-thin text-slate-800">{p}</span>
                        <CheckSquare size={14} className="text-cisco-green opacity-40" />
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
             <div className="p-8 bg-white shadow-sm border border-gray-100">
                <Edit className="text-cisco-blue mb-6" size={32} />
                <h4 className="text-lg font-bold text-cisco-navy mb-4">Smart Customization</h4>
                <p className="text-sm text-gray-500 font-thin">Engine-driven templates that adapt to your specific clinical workflows.</p>
             </div>
             <div className="p-8 bg-white shadow-sm border border-gray-100">
                <History className="text-cisco-blue mb-6" size={32} />
                <h4 className="text-lg font-bold text-cisco-navy mb-4">Version Control</h4>
                <p className="text-sm text-gray-500 font-thin">Complete audit trail of all policy revisions, approvals, and distribution.</p>
             </div>
             <div className="p-8 bg-white shadow-sm border border-gray-100">
                <ShieldCheck className="text-cisco-blue mb-6" size={32} />
                <h4 className="text-lg font-bold text-cisco-navy mb-4">Staff Verification</h4>
                <p className="text-sm text-gray-500 font-thin">Automated digital acknowledgment tracking for institutional compliance.</p>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PolicyGeneratorPage;
