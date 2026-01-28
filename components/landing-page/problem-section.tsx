'use client';

import { AlertTriangle, FileX, ShieldOff, FileQuestion } from 'lucide-react';

export default function ProblemSection() {
  return (
    <section className="w-full bg-white py-24 md:py-32 fade-in-slide font-extralight" id="problem-section">
      <div className="container mx-auto px-6 font-extralight">
        <div className="max-w-6xl mx-auto font-extralight">
          
          {/* Title */}
          <div className="text-center mb-20 font-extralight">
            <h2 className="text-4xl md:text-5xl lg:text-6xl text-[#0c0b1d] mb-8 font-extralight">
              Most clinics think they're compliant.<br />
              <span className="text-zinc-500 font-extralight">Until the audit proves otherwise.</span>
            </h2>
            
            <p className="text-xl md:text-2xl text-zinc-600 max-w-3xl mx-auto font-extralight">
              HIPAA is not about knowing the rules.<br />
              It's about proving you follow them — with evidence.
            </p>
          </div>

          {/* OCR Questions */}
          <div className="bg-[#0c0b1d] text-white rounded-3xl p-12 md:p-16 mb-16 font-extralight">
            <p className="text-xl md:text-2xl mb-10 text-zinc-300 font-extralight">
              OCR audits don't ask:<br />
              <span className="text-zinc-500 italic font-extralight">"Do you care about compliance?"</span>
            </p>
            
            <p className="text-xl md:text-2xl mb-8 font-extralight">They ask:</p>
            
            <div className="space-y-4 font-extralight">
              {[
                'Where is your risk analysis?',
                'Who signed your policies?',
                'Where is your training evidence?',
                'Show us your audit trail'
              ].map((question, idx) => (
                <div key={idx} className="flex items-start gap-4 font-extralight">
                  <FileQuestion className="w-6 h-6 text-[#1acb77] shrink-0 mt-1" />
                  <p className="text-lg text-white font-extralight">{question}</p>
                </div>
              ))}
            </div>

            <p className="text-2xl md:text-3xl mt-12 text-[#1acb77] font-extralight">
              If you don't have proof, you fail.
            </p>
          </div>

          {/* Market Error - Why Templates Fail */}
          <div className="bg-[#f3f5f9] rounded-3xl p-12 md:p-16 font-extralight">
            <h3 className="text-3xl md:text-4xl text-[#0c0b1d] mb-8 font-extralight">
              Why spreadsheets and templates fail audits
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8 font-extralight">
              {[
                'Static documents',
                'No version history',
                'No timestamps',
                'No defensibility',
                'No audit logic'
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 font-extralight">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                    <span className="text-red-600 text-sm font-extralight">✕</span>
                  </div>
                  <span className="text-lg text-zinc-700 font-extralight">{item}</span>
                </div>
              ))}
            </div>

            <p className="text-2xl md:text-3xl text-[#0c0b1d] font-extralight">
              Templates don't survive investigations.<br />
              <span className="text-[#1acb77] font-extralight">Systems do.</span>
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
