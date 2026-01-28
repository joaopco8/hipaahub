'use client';

import { Shield, FileText, Archive, GraduationCap, CheckCircle } from 'lucide-react';

const modules = [
  {
    icon: Shield,
    title: 'Security Risk Analysis (SRA)',
    features: [
      '150+ OCR-aligned controls',
      'NIST SP 800-66 mapped',
      'Automated risk scoring',
      'Remediation roadmap'
    ],
    tagline: 'What auditors expect. Exactly how they expect it.'
  },
  {
    icon: FileText,
    title: 'Policy Engine',
    features: [
      'All required HIPAA policies',
      'Auto-filled with your practice data',
      'Version control & legal timestamps',
      'Digital signatures'
    ],
    tagline: 'Policies that prove compliance, not just claim it.'
  },
  {
    icon: Archive,
    title: 'Evidence Vault',
    features: [
      'Encrypted (AES-256) storage',
      'Control-level evidence mapping',
      'Immutable audit logs',
      'Automatic retention rules'
    ],
    tagline: 'Your defense in one secure location.'
  },
  {
    icon: GraduationCap,
    title: 'Workforce Training',
    features: [
      'Mobile-first certificates',
      'Annual expiration tracking',
      'Audit-grade attestations',
      'Unlimited staff'
    ],
    tagline: 'Proof your team knows HIPAA.'
  }
];

export default function CoreModulesSection() {
  return (
    <section className="w-full bg-white py-24 md:py-40 font-extralight" id="core-modules-section">
      <div className="container mx-auto px-6 font-extralight">
        <div className="max-w-7xl mx-auto font-extralight">
          
          {/* Header */}
          <div className="text-center mb-20 font-extralight">
            <h2 className="text-4xl md:text-5xl lg:text-6xl text-[#0c0b1d] mb-8 font-extralight">
              HIPAA Hub is not software.<br />
              <span className="text-[#1acb77] font-extralight">It's your compliance operating system.</span>
            </h2>
            
            <p className="text-xl md:text-2xl text-zinc-600 max-w-3xl mx-auto font-extralight">
              Every requirement. Every control. Every proof — connected, tracked, defensible.
            </p>
          </div>

          {/* Core Modules Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 font-extralight">
            {modules.map((module, idx) => {
              const Icon = module.icon;
              return (
                <div 
                  key={idx} 
                  className="bg-[#f3f5f9] rounded-3xl p-8 hover:bg-white hover:shadow-2xl transition-all duration-500 border border-transparent hover:border-[#1acb77]/20 font-extralight"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#1acb77]/10 flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-[#1acb77]" />
                  </div>
                  
                  <h3 className="text-2xl text-[#0c0b1d] mb-6 font-extralight">{module.title}</h3>
                  
                  <ul className="space-y-3 mb-6 font-extralight">
                    {module.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 font-extralight">
                        <CheckCircle className="w-4 h-4 text-[#1acb77] shrink-0 mt-1" />
                        <span className="text-sm text-zinc-700 font-extralight">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <p className="text-sm text-zinc-600 italic font-extralight border-t border-zinc-200 pt-4">
                    {module.tagline}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
