'use client';

import { FileText } from 'lucide-react';

export default function DocumentsSection() {
  const documents = [
    'HIPAA Security & Privacy Master Policy',
    'Security Risk Analysis (SRA)',
    'Risk Management Plan',
    'Incident Response & Breach Policy',
    'Business Associate Policy',
    'Audit & Retention Policy',
    'Access Control Policy',
    'Workforce Training Policy',
    'Sanction Policy'
  ];

  return (
    <section className="w-full bg-[#0c0b1d] py-24 md:py-32 fade-in-slide">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-16 text-center">
            You don&apos;t get templates. You get legal artifacts.
          </h2>

          {/* Grid of Documents */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {documents.map((doc, idx) => (
              <div
                key={idx}
                className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 hover:border-[#1ad07a]/50 transition-all duration-300 card-premium stagger-item"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#1acb77]/20 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-[#1acb77]" />
                  </div>
                  <h3 className="text-lg font-medium text-white leading-snug">
                    {doc}
                  </h3>
                </div>
              </div>
            ))}
          </div>

          {/* Explanatory Text */}
          <p className="text-center text-lg text-white/70 max-w-3xl mx-auto">
            Each document is dynamically generated from your data, evidence, and attestations.
          </p>
        </div>
      </div>
    </section>
  );
}
