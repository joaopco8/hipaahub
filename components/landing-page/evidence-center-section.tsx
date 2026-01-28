'use client';

import { Upload, Link as LinkIcon, Camera, FileText, Users, Database } from 'lucide-react';

export default function EvidenceCenterSection() {
  const evidenceTypes = [
    { icon: Upload, text: 'Upload SRA reports' },
    { icon: LinkIcon, text: 'Upload BAAs' },
    { icon: Camera, text: 'Upload MFA screenshots' },
    { icon: FileText, text: 'Upload encryption proof' },
    { icon: Users, text: 'Training logs' },
    { icon: Database, text: 'System logs' }
  ];

  return (
    <section className="w-full bg-[#0c0b1d] py-24 md:py-32 fade-in-slide">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          {/* Title */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-16 text-center">
            Every claim. Backed by proof.
          </h2>

          {/* Evidence Types Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {evidenceTypes.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-white/5 backdrop-blur-sm rounded-lg p-6 flex items-center gap-4 border border-white/10 hover:border-[#1ad07a]/50 transition-all duration-300 card-premium stagger-item"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#1acb77]/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-[#1acb77]" />
                  </div>
                  <span className="text-white font-medium">{item.text}</span>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
