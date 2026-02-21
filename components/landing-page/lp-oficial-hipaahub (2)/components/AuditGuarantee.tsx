import React from 'react';
import { ShieldCheck, Lock, Activity, RefreshCw, CheckCircle2, Server, Eye, FileCheck } from 'lucide-react';

const AuditGuarantee: React.FC = () => {
  return (
    <section className="py-24 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-[54px] font-light text-cisco-navy leading-tight mb-6">Enterprise-Grade <br /> Compliance & Security.</h2>
          <h3 className="text-xl font-normal text-cisco-blue">Built for healthcare compliance and data protection.</h3>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Certs */}
          <div className="bg-white p-10 border border-gray-100 shadow-sm">
            <h4 className="text-[10px] font-bold text-cisco-blue mb-8 border-b pb-4 tracking-widest">Compliance certifications</h4>
            <ul className="space-y-4">
              {["HIPAA Compliant", "SOC 2 Type II Certified", "NIST 800-53 Aligned", "HITRUST CSF Certified"].map((c, i) => (
                <li key={i} className="flex items-center text-sm text-gray-600 font-normal">
                  <CheckCircle2 size={16} className="text-cisco-green mr-3 flex-shrink-0" /> {c}
                </li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div className="bg-white p-10 border border-gray-100 shadow-sm">
            <h4 className="text-[10px] font-bold text-cisco-blue mb-8 border-b pb-4 tracking-widest">Security features</h4>
            <ul className="space-y-4">
              {["AES-256 Encryption", "Role-Based Access (RBAC)", "Multi-Factor (MFA)", "Automated Access Logging", "Penetration Testing"].map((c, i) => (
                <li key={i} className="flex items-center text-sm text-gray-600 font-normal">
                  <Lock size={16} className="text-cisco-blue mr-3 flex-shrink-0 opacity-40" /> {c}
                </li>
              ))}
            </ul>
          </div>

          {/* Protection */}
          <div className="bg-white p-10 border border-gray-100 shadow-sm">
            <h4 className="text-[10px] font-bold text-cisco-blue mb-8 border-b pb-4 tracking-widest">Data protection</h4>
            <ul className="space-y-4">
              {["99.99% Uptime SLA", "Daily Automated Backups", "Disaster Recovery Plan", "Geographic Redundancy", "HIPAA Business Associate Agreement"].map((c, i) => (
                <li key={i} className="flex items-center text-sm text-gray-600 font-normal">
                  <Server size={16} className="text-cisco-blue mr-3 flex-shrink-0 opacity-40" /> {c}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 text-center">
           <button className="bg-cisco-navy text-white px-10 py-5 text-xs font-bold hover:bg-cisco-blue transition-all">
             View Security Documentation
           </button>
        </div>
      </div>
    </section>
  );
};

export default AuditGuarantee;