'use client';

import { CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { FadeIn } from './animated-section';

const benefits = [
  'One source of truth for HIPAA compliance',
  'Clear ownership and accountability',
  'Documents always current and audit-ready',
  'Confidence instead of anxiety'
];

export default function FutureStateSection() {
  return (
    <section className="w-full bg-white py-24 md:py-32 font-extralight">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          
          <FadeIn>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              
              {/* Left Side - Content */}
              <div className="space-y-8 font-extralight">
                <div className="space-y-6">
                  <h2 className="text-3xl md:text-4xl lg:text-5xl text-[#0c0b1d] font-extralight leading-tight">
                    Imagine knowing exactly where your compliance stands.
                  </h2>
                  
                  <p className="text-lg md:text-xl text-zinc-600 font-extralight leading-relaxed">
                    With HIPAA Hub, your compliance is no longer a guess.<br />
                    It's structured, documented, and always accessible.
                  </p>
                </div>

                {/* Benefits List */}
                <div className="space-y-4 pt-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-5 h-5 text-[#1ad07a] shrink-0">
                        <CheckCircle2 className="w-full h-full" />
                      </div>
                      <p className="text-base md:text-lg text-zinc-700 font-extralight">
                        {benefit}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Side - Dashboard Image - Larger */}
              <div className="relative w-full flex items-center justify-center">
                {/* Decorative Background */}
                <div className="absolute -inset-8 bg-[#1ad07a]/5 rounded-[2rem] blur-3xl" />
                
                {/* Dashboard Image - Larger but proportional */}
                <div className="relative w-full max-w-none rounded-2xl overflow-hidden">
                  <Image
                    src="/imgsec111.png"
                    alt="HIPAA Hub Compliance Dashboard - Real-time compliance overview"
                    width={1920}
                    height={1080}
                    className="w-full h-auto object-contain"
                    quality={100}
                    priority
                    unoptimized={false}
                  />
                </div>
              </div>

            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
