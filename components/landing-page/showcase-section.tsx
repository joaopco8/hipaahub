'use client';

import { CheckCircle2, ShieldCheck, FileSearch, HardDrive, Share2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import Image from 'next/image';

const features = [
  {
    icon: ShieldCheck,
    title: "OCR-aligned controls",
    description: "Built strictly according to the latest OCR audit protocols and NIST security standards."
  },
  {
    icon: FileSearch,
    title: "Audit trail forensics",
    description: "Every action, attestation, and document update is timestamped and recorded with IP evidence."
  },
  {
    icon: HardDrive,
    title: "Encrypted evidence vault",
    description: "Military-grade encryption for all your uploaded screenshots, system logs, and BAA documents."
  },
  {
    icon: Share2,
    title: "Zero PHI architecture",
    description: "Our platform never touches patient data, keeping your liability low and your security high."
  }
];

export default function ShowcaseSection() {
  return (
    <section id="solutions" className="w-full bg-white py-24 md:py-48 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-center max-w-7xl mx-auto">
          {/* Text Content */}
          <div className="space-y-12">
            <div className="space-y-6">
              <h2 className="text-sm font-medium text-[#1acb77]">Audit defense</h2>
              <h3 className="text-4xl md:text-6xl font-extralight text-[#0d0d1f] leading-[1.1]">
                Stop guessing. <br />
                Start defending.
              </h3>
              <p className="text-xl text-zinc-600 font-light leading-relaxed">
                If you cannot prove it, it did not happen. HIPAA Hub creates a permanent, legally-defensible trail of your compliance efforts.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-10">
              {features.map((feature, idx) => (
                <div key={idx} className="space-y-4">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-[#0d0d1f]">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-[#0d0d1f]">{feature.title}</h4>
                    <p className="text-sm text-zinc-500 font-light leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Element - Mockup style like August Health */}
          <div className="relative">
            <div className="relative aspect-square max-w-[600px] mx-auto">
              {/* Decorative circles */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[120%] opacity-10">
                <svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="500" cy="500" r="450" stroke="#1acb77" strokeWidth="40" fill="none" />
                  <circle cx="500" cy="500" r="350" stroke="#0d0d1f" strokeWidth="20" fill="none" />
                </svg>
              </div>

              {/* Central Card */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full bg-white rounded-3xl shadow-2xl border border-zinc-100 p-8 z-10 rotate-[-2deg]">
                <div className="flex items-center justify-between mb-8">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-zinc-400">Compliance posture</p>
                    <h4 className="text-2xl font-extralight text-[#0d0d1f]">Audit readiness</h4>
                  </div>
                  <div className="w-12 h-12 bg-[#1acb77] rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-[#0d0d1f]" />
                  </div>
                </div>
                <div className="space-y-6">
                  {[
                    { label: "SRA evidence", progress: 100 },
                    { label: "Staff training", progress: 85 },
                    { label: "Policy attestation", progress: 92 }
                  ].map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-sm font-medium text-[#0d0d1f]">
                        <span>{item.label}</span>
                        <span>{item.progress}%</span>
                      </div>
                      <div className="h-2 bg-[#f3f5f9] rounded-full overflow-hidden">
                        <div className="h-full bg-[#1acb77]" style={{ width: `${item.progress}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Smaller floating card */}
              <div className="absolute bottom-[-10%] right-[-10%] w-64 bg-[#0d0d1f] text-white rounded-2xl shadow-2xl p-6 z-20 rotate-[5deg] border border-white/10 hidden md:block">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-[#1acb77]/20 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-[#1acb77]" />
                  </div>
                  <span className="font-medium text-sm">Legally defensible</span>
                </div>
                <p className="text-xs text-white/60 leading-relaxed font-light">
                  Complete compliance documentation ready for regulatory review.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
