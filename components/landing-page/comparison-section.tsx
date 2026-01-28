'use client';

import { X, Check } from 'lucide-react';

export default function ComparisonSection() {
  const comparisons = [
    { feature: 'Checklist', others: true, hipaahub: false },
    { feature: 'Legal documents', others: false, hipaahub: true },
    { feature: 'Generic PDFs', others: true, hipaahub: false },
    { feature: 'Personalized policies', others: false, hipaahub: true },
    { feature: 'No evidence', others: true, hipaahub: false },
    { feature: 'Evidence + logs', others: false, hipaahub: true },
    { feature: 'No attestation', others: true, hipaahub: false },
    { feature: 'Legal attestations', others: false, hipaahub: true },
    { feature: 'Static', others: true, hipaahub: false },
    { feature: 'Dynamic per answer', others: false, hipaahub: true },
    { feature: 'No breach defense', others: true, hipaahub: false },
    { feature: 'Breach letters + audit trail', others: false, hipaahub: true }
  ];

  return (
    <section className="w-full bg-white py-24 md:py-32 fade-in-slide">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          {/* Title */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#0c0b1d] mb-16 text-center">
            Other HIPAA tools tell you what to do. HIPAAHub proves that you did.
          </h2>

          {/* Comparison Table */}
          <div className="bg-white rounded-lg overflow-hidden border border-[#0c0b1d]/10">
            <div className="grid grid-cols-3 gap-4 p-6 border-b border-[#0c0b1d]/10 bg-[#f3f5f9]">
              <div className="font-semibold text-[#0c0b1d]">Feature</div>
              <div className="font-semibold text-[#0c0b1d] text-center">Others</div>
              <div className="font-semibold text-[#0c0b1d] text-center">HIPAA Hub</div>
            </div>
            {comparisons.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-3 gap-4 p-6 border-b border-[#0c0b1d]/5 last:border-0 hover:bg-[#f3f5f9]/50 transition-all duration-300 stagger-item"
              >
                <div className="text-[#0c0b1d]/80 font-medium">{item.feature}</div>
                <div className="flex items-center justify-center">
                  {item.others ? (
                    <X className="w-5 h-5 text-red-500" />
                  ) : (
                    <Check className="w-5 h-5 text-[#1acb77]" />
                  )}
                </div>
                <div className="flex items-center justify-center">
                  {item.hipaahub ? (
                    <Check className="w-5 h-5 text-[#1acb77]" />
                  ) : (
                    <X className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
