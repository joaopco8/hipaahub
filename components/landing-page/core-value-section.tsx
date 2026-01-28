'use client';

import { Brain, FileText, Lock } from 'lucide-react';

export default function CoreValueSection() {
  const cards = [
    {
      icon: Brain,
      title: 'Compliance Intelligence',
      features: [
        '150+ HIPAA risk-assessment questions',
        'Risk scoring',
        'OCR-aligned logic',
        'NIST-mapped controls'
      ]
    },
    {
      icon: FileText,
      title: 'Legal-Grade Documents',
      features: [
        '9 HIPAA master policies',
        'Auto-generated',
        'Auto-personalized',
        'Audit-ready'
      ]
    },
    {
      icon: Lock,
      title: 'Evidence Vault',
      features: [
        'Upload',
        'Link',
        'Screenshot',
        'System logs',
        'Attestations',
        'IP + timestamp',
        '7-year retention'
      ]
    }
  ];

  return (
    <section className="w-full bg-white py-24 md:py-32 fade-in-slide">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#0c0b1d] mb-16 text-center">
            Your compliance. Your evidence. Your legal defense. In one system.
          </h2>

          {/* Three Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {cards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#f3f5f9] rounded-lg p-8 space-y-6 card-premium stagger-item"
                >
                  <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center">
                    <Icon className="w-6 h-6 text-[#0c0b1d]" />
                  </div>
                  <h3 className="text-2xl font-semibold text-[#0c0b1d]">
                    {card.title}
                  </h3>
                  <ul className="space-y-3">
                    {card.features.map((feature, fIdx) => (
                      <li key={fIdx} className="text-[#0c0b1d]/70 flex items-start gap-2">
                        <span className="text-[#1acb77] mt-1">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Tagline */}
          <p className="text-center text-lg text-[#0c0b1d]/60 italic">
            Every statement in your documents can be proven.
          </p>
        </div>
      </div>
    </section>
  );
}
