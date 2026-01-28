'use client';

import Image from 'next/image';
import { FadeIn } from './animated-section';

export default function ComplianceDocumentsSection() {
  return (
    <section className="w-full bg-gradient-to-b from-white via-blue-50/20 to-white py-24 md:py-32 font-extralight">
      <div className="container mx-auto px-6 font-extralight">
        <div className="max-w-7xl mx-auto font-extralight">
          
          {/* Two Column Layout */}
          <FadeIn>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              
              {/* Left Side - Text Content */}
              <div className="space-y-6 font-extralight">
                <h2 className="text-4xl md:text-5xl lg:text-6xl text-[#0c0b1d] font-extralight leading-tight">
                  All HIPAA Policies. Generated. Audit-Ready.
                </h2>
                <p className="text-xl md:text-2xl text-zinc-600 font-extralight leading-relaxed">
                  Everything your organization is legally required to have — generated automatically, customized to your practice, and defensible in an OCR audit.
                </p>
                <p className="text-base md:text-lg text-zinc-500 font-extralight leading-relaxed">
                  HIPAA Hub generates the complete set of required HIPAA policies based on your organization profile and security risk analysis.
                  <span className="block mt-2">
                    No templates. No guessing. No outdated PDFs.
                  </span>
                  <span className="block mt-2">
                    Every document is practice-specific, versioned, timestamped, and audit-ready.
                  </span>
                </p>
              </div>

              {/* Right Side - Image */}
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-2 border-zinc-100">
                <Image
                  src="/mockup9doc.jpg"
                  alt="HIPAA Policy Documents - Complete Set of Required Policies"
                  fill
                  className="object-cover object-center"
                  quality={100}
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
