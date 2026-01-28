'use client';

import { Building2, Heart, FlaskConical, Video, DollarSign, Cloud, Microscope, Syringe, ClipboardList } from 'lucide-react';

const targets = [
  { icon: Building2, text: 'Medical clinics', description: "Primary care, specialists, and multi-location practices." },
  { icon: Heart, text: 'Mental health', description: "Psychiatrists, psychologists, and counseling centers." },
  { icon: Syringe, text: 'Dental practices', description: "General dentists, orthodontists, and oral surgeons." },
  { icon: Microscope, text: 'Diagnostic labs', description: "Independent laboratories and imaging centers." },
  { icon: Video, text: 'Telehealth providers', description: "Digital-first clinics and virtual care platforms." },
  { icon: DollarSign, text: 'Medical billing', description: "Third-party billing and revenue cycle companies." },
  { icon: Cloud, text: 'HealthTech startups', description: "SaaS platforms handling PHI and digital health apps." },
  { icon: FlaskConical, text: 'Pharma & research', description: "Clinical research organizations and biotech labs." },
  { icon: ClipboardList, text: 'Business associates', description: "IT vendors, MSPs, and legal firms serving healthcare." }
];

export default function WhoThisIsForSection() {
  return (
    <section className="w-full bg-[#f3f5f9] py-24 md:py-48">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          {/* Title */}
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-sm font-medium text-[#1acb77]">Our community</h2>
            <h3 className="text-4xl md:text-6xl font-extralight text-[#0d0d1f] leading-tight">
              Designed for the entire <br /> healthcare ecosystem
            </h3>
            <p className="text-lg text-zinc-500 font-light">
              From solo practitioners to multi-state healthcare networks and the technology vendors that support them.
            </p>
          </div>

          {/* Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {targets.map((target, idx) => {
              const Icon = target.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-8 flex flex-col gap-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-zinc-100 group"
                >
                  <div className="w-14 h-14 rounded-xl bg-[#f3f5f9] flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-[#1acb77]/10">
                    <Icon className="w-7 h-7 text-[#0d0d1f] group-hover:text-[#1acb77] transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-medium text-[#0d0d1f]">{target.text}</h4>
                    <p className="text-sm text-zinc-500 font-light leading-relaxed">{target.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
