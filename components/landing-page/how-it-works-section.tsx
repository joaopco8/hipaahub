'use client';

import { CheckCircle2, ClipboardList, ShieldCheck, FileCheck, Zap } from 'lucide-react';

const steps = [
  {
    title: "150 OCR-aligned questions",
    description: "Complete our comprehensive assessment to identify every potential HIPAA vulnerability in your practice.",
    icon: ClipboardList
  },
  {
    title: "Upload & attest evidence",
    description: "Link your system logs, screenshots, and documents directly to specific HIPAA controls for audit defense.",
    icon: ShieldCheck
  },
  {
    title: "Automated exposure analysis",
    description: "Our engine calculates your legal exposure and produces a prioritized remediation roadmap instantly.",
    icon: Zap
  },
  {
    title: "Generate master documents",
    description: "AI-powered generation of 9 mandatory HIPAA policies, customized to your unique practice profile.",
    icon: FileCheck
  }
];

export default function HowItWorksSection() {
  return (
    <section className="w-full bg-white py-24 md:py-48">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-24">
            <div className="max-w-2xl space-y-6">
              <h2 className="text-sm font-medium text-[#1acb77]">The roadmap</h2>
              <h3 className="text-4xl md:text-6xl font-extralight text-[#0d0d1f] leading-tight">
                Your path to <br /> complete audit readiness
              </h3>
            </div>
            <div className="max-w-sm">
              <p className="text-lg text-zinc-500 font-light leading-relaxed">
                A structured, guided workflow that takes the complexity out of HIPAA compliance.
              </p>
            </div>
          </div>

          {/* Steps Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
            {/* Connecting line for desktop */}
            <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-zinc-100 -z-0" />
            
            {steps.map((step, idx) => (
              <div key={idx} className="relative z-10 space-y-8 group">
                <div className="w-24 h-24 rounded-3xl bg-[#f3f5f9] flex items-center justify-center text-[#0d0d1f] transition-all duration-500 group-hover:bg-[#1acb77] group-hover:text-white group-hover:rotate-6 group-hover:scale-110 shadow-sm border border-zinc-100">
                  <step.icon className="w-10 h-10" />
                </div>
                <div className="space-y-4">
                  <h4 className="text-xl font-light text-[#0d0d1f]">{step.title}</h4>
                  <p className="text-zinc-500 font-light leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Final Result Card */}
          <div className="mt-32 p-10 md:p-16 rounded-[3rem] bg-[#0d0d1f] text-white overflow-hidden relative group shadow-2xl">
            {/* Background effect */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-[#1acb77]/10 blur-[120px] rounded-full translate-x-1/2" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="space-y-6 max-w-xl text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                  <CheckCircle2 className="w-4 h-4 text-[#1acb77]" />
                  <span className="text-sm font-medium">Result</span>
                </div>
                <h4 className="text-3xl md:text-5xl font-extralight leading-tight">
                  You&apos;re 100% audit-ready and legally defensible.
                </h4>
                <p className="text-xl text-white/60 font-light">
                  Your entire compliance infrastructure is documented, evidenced, and ready for regulatory inspection.
                </p>
              </div>
              
              <div className="shrink-0 scale-110 md:scale-125 transition-transform duration-700 group-hover:scale-150">
                <div className="w-48 h-48 rounded-full bg-[#1acb77] flex items-center justify-center shadow-[0_0_60px_rgba(26,203,119,0.4)]">
                  <ShieldCheck className="w-24 h-24 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
