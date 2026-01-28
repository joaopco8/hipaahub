'use client';

import { X, Check } from 'lucide-react';

export default function TheTurnSection() {
  return (
    <section className="w-full bg-[#0c0b1d] py-24 md:py-32 fade-in-slide">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          {/* Title */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-16 text-center">
            HIPAAHub turns answers into legal proof.
          </h2>

          {/* Two Columns Comparison */}
          <div className="grid md:grid-cols-2 gap-12">
            {/* Column 1 - You don't deliver */}
            <div className="space-y-6 bg-white/5 backdrop-blur-sm rounded-lg p-8 border border-white/10 card-premium">
              <h3 className="text-2xl font-semibold text-white/60 mb-6">You don&apos;t deliver:</h3>
              <div className="space-y-4">
                {['PDFs', 'Checklists', 'Training videos'].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 stagger-item">
                    <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <span className="text-lg text-white/60 line-through">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2 - You deliver (highlighted) */}
            <div className="space-y-6 bg-[#1acb77] rounded-lg p-8 card-premium">
              <h3 className="text-2xl font-semibold text-[#0c0b1d] mb-6">You deliver:</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-[#0c0b1d] flex-shrink-0" />
                  <span className="text-lg text-[#0c0b1d] font-medium">
                    A compliance defense system
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
