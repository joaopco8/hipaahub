'use client';

import { Shield, CheckCircle2 } from 'lucide-react';

export default function BreachModeSection() {
  const features = [
    'One-click Breach Notification Letters',
    'Auto-filled with: Dates, Scope, Systems, PHI types, Remediation',
    'OCR-compliant',
    'Patient-ready',
    'Media-ready',
    'HHS-ready'
  ];

  return (
    <section className="w-full bg-[#0c0b1d] py-24 md:py-32 fade-in-slide">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          {/* Title */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-12 text-center">
            When a breach happens, HIPAAHub becomes your legal shield.
          </h2>

          {/* Features List */}
          <div className="space-y-4 mb-12">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-4 stagger-item">
                <CheckCircle2 className="w-6 h-6 text-[#1ad07a] flex-shrink-0 mt-1" />
                <p className="text-lg text-white/90 leading-relaxed">{feature}</p>
              </div>
            ))}
          </div>

          {/* Tagline */}
          <div className="bg-[#1acb77]/10 rounded-lg p-8 border border-[#1acb77]/20">
            <p className="text-2xl font-bold text-white text-center">
              No scrambling. No lawyers. No panic.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
