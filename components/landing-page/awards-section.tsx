'use client';

import { Award } from 'lucide-react';

const awards = [
  {
    image: '/images/Great-Customer-Service-Award.png',
    alt: 'Best Customer Service 2022'
  },
  {
    image: '/images/Inc.-5000-Color-Medallion-Logo.png',
    alt: 'Inc. 5000 - America\'s Fastest-Growing Private Companies'
  },
  {
    image: '/images/best-company-badge.png',
    alt: 'Best Company Best of the Best 2025'
  }
];

export default function AwardsSection() {
  return (
    <section className="w-full bg-gradient-to-b from-[#f3f5f9] via-blue-50/40 to-[#f3f5f9] py-24 md:py-32 font-extralight">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          {/* Awards Banner - Dark Blue Rectangle */}
          <div className="bg-[#0c0b1d] rounded-2xl px-10 md:px-16 py-10 md:py-12 flex flex-col md:flex-row items-center justify-between gap-10 md:gap-16">
            
            {/* Left: Awards & Recognition Header */}
            <div className="flex items-start gap-3 shrink-0">
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-extralight text-[#1ad07a] leading-none">
                    Awards
                  </h2>
                  <Award className="w-7 h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 text-[#1ad07a] flex-shrink-0" strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-extralight text-white leading-none">
                  & Recognition
                </h3>
              </div>
            </div>

            {/* Right: Award Badges - Horizontal Layout */}
            <div className="flex-1 flex items-center justify-center md:justify-end gap-8 md:gap-10 lg:gap-12">
              {awards.map((award, idx) => (
                <div 
                  key={idx} 
                  className="flex-shrink-0 hover:scale-105 transition-transform duration-300"
                >
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40">
                    <img
                      src={award.image}
                      alt={award.alt}
                      className="w-full h-full object-contain drop-shadow-2xl"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
