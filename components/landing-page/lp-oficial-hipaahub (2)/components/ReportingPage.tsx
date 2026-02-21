import React from 'react';
import { Archive, Download, FileCheck, ShieldCheck, Database, Layers } from 'lucide-react';

const ReportingPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="bg-white min-h-screen">
      <div className="bg-white border-b py-2 px-4 md:px-12 text-[10px] text-gray-400">
        <div className="max-w-7xl mx-auto flex items-center space-x-2">
          <button onClick={onBack} className="hover:text-cisco-blue">Platform</button>
          <span>/</span>
          <span className="text-gray-900 font-bold">Reporting & Documentation</span>
        </div>
      </div>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-12 grid lg:grid-cols-2 gap-24 items-center">
          <div>
            <div className="bg-cisco-blue text-white inline-block p-4 mb-8">
              <Archive size={32} />
            </div>
            <h1 className="text-4xl md:text-6xl font-light text-cisco-navy mb-8 leading-tight">
              Evidence Packages <br /> for Audit Defense.
            </h1>
            <p className="text-gray-600 text-lg font-light leading-relaxed mb-12">
              Compiles all policies, risk assessments, training records, and technical 
              safeguard evidence into a single, organized institutional package.
            </p>
            <div className="space-y-8 mb-12">
               <div className="flex gap-6">
                  <Download className="text-cisco-blue shrink-0" size={24} />
                  <div>
                    <h4 className="text-base font-bold text-cisco-navy">One-Click Export</h4>
                    <p className="text-sm text-gray-500 font-light">Generate the specific reporting structure used by OCR in federal desk audits.</p>
                  </div>
               </div>
               <div className="flex gap-6">
                  <FileCheck className="text-cisco-blue shrink-0" size={24} />
                  <div>
                    <h4 className="text-base font-bold text-cisco-navy">Evidence Verification</h4>
                    <p className="text-sm text-gray-500 font-light">Timestamped logs and digital signatures for all compliance artifacts.</p>
                  </div>
               </div>
            </div>
            <button className="bg-cisco-navy text-white px-10 py-5 text-sm font-bold hover:bg-cisco-blue transition-all">
              Compile Evidence Package
            </button>
          </div>
          
          <div className="relative">
             <div className="bg-gray-50 border border-gray-100 p-12 aspect-square flex flex-col justify-center">
                <div className="space-y-4">
                   {[
                     { label: "Policy Library.pdf", size: "4.2 MB", status: "Verified" },
                     { label: "Risk_Assessment_2024.pdf", size: "12.8 MB", status: "Verified" },
                     { label: "Staff_Training_Records.zip", size: "85.1 MB", status: "Verified" },
                     { label: "Technical_Safeguard_Evidence.zip", size: "214.0 MB", status: "Verified" }
                   ].map((file, i) => (
                     <div key={i} className="bg-white p-4 border border-gray-100 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                           <FileCheck size={18} className="text-cisco-green" />
                           <span className="text-xs font-semibold text-cisco-navy">{file.label}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">{file.size}</span>
                     </div>
                   ))}
                </div>
                <div className="mt-12 text-center">
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Repository Status: Healthy</p>
                </div>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ReportingPage;