import React from 'react';
import { ShieldAlert, FileWarning, Mail, Clock, ShieldCheck, FileText } from 'lucide-react';

const BreachBuilderPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="bg-white min-h-screen">
      <div className="bg-white border-b py-2 px-4 md:px-12 text-[10px] text-gray-400">
        <div className="max-w-7xl mx-auto flex items-center space-x-2">
          <button onClick={onBack} className="hover:text-cisco-blue">Platform</button>
          <span>/</span>
          <span className="text-gray-900 font-bold">Breach Notification Builder</span>
        </div>
      </div>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-12 grid lg:grid-cols-2 gap-24 items-center">
          <div>
            <div className="bg-red-50 text-red-600 inline-block p-4 mb-8">
              <ShieldAlert size={32} />
            </div>
            <h1 className="text-4xl md:text-6xl font-thin text-cisco-navy mb-8 leading-tight">
              Rapid Response <br /> Protocols.
            </h1>
            <p className="text-gray-600 text-lg font-thin leading-relaxed mb-10">
              Operationalized workflows for incident classification, investigation, 
              and mandatory regulatory notifications.
            </p>
            <div className="grid grid-cols-2 gap-8 mb-12">
               <div className="p-6 bg-gray-50 border border-gray-100">
                  <h4 className="text-sm font-bold text-cisco-navy mb-2">48-Hour SLA</h4>
                  <p className="text-xs text-gray-500 font-thin">Expert response support for confirmed medical data breaches.</p>
               </div>
               <div className="p-6 bg-gray-50 border border-gray-100">
                  <h4 className="text-sm font-bold text-cisco-navy mb-2">Template Vault</h4>
                  <p className="text-xs text-gray-500 font-thin">Legally-reviewed letters for patient, HHS, and media notifications.</p>
               </div>
            </div>
            <button className="bg-cisco-navy text-white px-10 py-5 text-sm font-bold hover:bg-cisco-blue transition-all">
              Initiate Incident Review
            </button>
          </div>
          
          <div className="bg-gray-50 p-12 border border-gray-100 relative">
             <h4 className="text-xs font-bold text-gray-400 mb-8 border-b pb-4 uppercase tracking-widest">Notification Pipeline</h4>
             <div className="space-y-12">
                {[
                  { step: "Classification", desc: "Low, Moderate, or High risk breach determination.", icon: <FileWarning size={20} /> },
                  { step: "Evidence Collection", desc: "Automated logging of affected PHI and access vectors.", icon: <ShieldCheck size={20} /> },
                  { step: "Notification Build", desc: "Generation of mandatory regulatory letters.", icon: <Mail size={20} /> }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="text-cisco-blue">{item.icon}</div>
                    <div>
                      <h4 className="text-base font-bold text-cisco-navy">{item.step}</h4>
                      <p className="text-sm text-gray-500 font-thin">{item.desc}</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BreachBuilderPage;
