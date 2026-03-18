'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Testimonial {
  id: number;
  quote: string;
  author: string;
  role: string;
  organization: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    quote:
      "Honestly? I almost cried when I got the OCR inquiry letter. I'm a one-person practice, I see 24 clients a week, I don't have an IT department or a compliance officer, I have me. I spent that whole first night panicking. Then I remembered I had everything in HIPAA Hub. Pulled up the audit export, had the full package ready by noon the next day. The investigator closed the inquiry in 3 weeks. I still can't believe it was that straightforward.",
    author: "Sarah K.",
    role: "LCSW · Solo Private Practice",
    organization: "Portland, OR",
  },
  {
    id: 2,
    quote:
      "We're a three-provider behavioral health clinic. Before HIPAA Hub, our 'compliance system' was a shared Google Drive folder and a prayer. Our policies hadn't been updated since 2019. When our malpractice insurance carrier asked for our risk assessment documentation during renewal, we had nothing. Signed up for HIPAA Hub on a Tuesday, had a completed risk assessment and all nine policies activated by Thursday. Renewal went through without issue. At $297 a month it's genuinely one of the easiest ROI decisions we've made.",
    author: "Marcus T.",
    role: "Practice Administrator",
    organization: "3-Provider Behavioral Health Clinic · Denver, CO",
  },
  {
    id: 3,
    quote:
      "Ok so I just opened my practice last year and HIPAA compliance was lowkey the thing I was most stressed about. Like they don't really teach you this stuff in grad school? I looked into hiring a consultant and the quotes I got were anywhere from $3,500 to $8,000 just to get started. A colleague mentioned HIPAA Hub and I figured I'd try the trial. Set everything up in a weekend, got my policies done, did the risk assessment. It's been eight months and I genuinely don't stress about compliance anymore. That alone is worth every penny.",
    author: "Jordan M.",
    role: "LPC · Private Practice",
    organization: "Nashville, TN",
  },
  {
    id: 4,
    quote:
      "I'll be candid: I was skeptical of a software solution for something as serious as HIPAA compliance. We're a four-physician specialty clinic and I've seen practices get fined not because they lacked documentation, but because their documentation couldn't be produced in time or wasn't in the format OCR expected. What changed my mind about HIPAA Hub was the audit export feature. The package it generates is structured exactly the way federal investigators expect to receive it. We've since moved our entire compliance infrastructure to the platform. I'd recommend it to any practice that takes regulatory risk seriously.",
    author: "Dr. R. Patel, MD",
    role: "Specialty Clinic",
    organization: "Houston, TX",
  },
  {
    id: 5,
    quote:
      "I'm gonna be real with you: I knew we had compliance gaps for two years. Just kept putting it off because it felt overwhelming and expensive to fix. Then we had a ransomware incident. Nothing catastrophic, our EHR vendor contained it, but we had to self-report. Do you know how fast you need to move when you're self-reporting a breach to OCR with no documentation ready? It's a nightmare. We found HIPAA Hub during that exact crisis. Got the breach notification letter drafted in the platform, had our incident log organized, had our policies updated within the week. We got through it. But I wish I hadn't waited for an incident to take this seriously.",
    author: "T. Okafor",
    role: "Practice Owner · Family Mental Health Clinic",
    organization: "Atlanta, GA",
  },
];

const SocialProof: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goTo = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIndex(index);
      setIsTransitioning(false);
    }, 200);
  }, [isTransitioning]);

  const goNext = useCallback(() => {
    goTo((activeIndex + 1) % testimonials.length);
  }, [activeIndex, goTo]);

  const goPrev = useCallback(() => {
    goTo((activeIndex - 1 + testimonials.length) % testimonials.length);
  }, [activeIndex, goTo]);

  useEffect(() => {
    const timer = setInterval(goNext, 7000);
    return () => clearInterval(timer);
  }, [goNext]);

  const current = testimonials[activeIndex];

  return (
    <section className="py-24 bg-white border-t border-b border-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-12">

        {/* Section label */}
        <div className="mb-12 text-center">
          <p className="text-[11px] font-thin text-[#0175a2] tracking-widest uppercase mb-3">
            Customer Stories
          </p>
          <h2 className="text-3xl font-thin text-[#0e274e]">
            How private practices use HIPAA Hub in real incidents
          </h2>
        </div>

        {/* Main testimonial card (no photos) */}
        <div
          className={`bg-white border border-gray-100 shadow-sm flex flex-col min-h-[320px] transition-opacity duration-200 ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <div className="flex-grow p-10 md:p-16 flex flex-col justify-between">
            <div>
              <div className="text-[40px] leading-none font-thin text-gray-200 select-none mb-4">
                “
              </div>
              <p className="text-gray-700 leading-relaxed text-base md:text-lg font-thin max-w-3xl">
                {current.quote}
              </p>
            </div>

            <div className="mt-8">
              <p className="font-thin text-[#0e274e] text-sm">{current.author}</p>
              <p className="text-gray-400 text-xs font-thin mt-0.5">
                {current.role} · {current.organization}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation row */}
        <div className="mt-8 flex items-center justify-between">

          {/* Prev / Next arrows */}
          <div className="flex items-center gap-3">
            <button
              onClick={goPrev}
              className="w-9 h-9 border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#0175a2] hover:border-[#0175a2] transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={goNext}
              className="w-9 h-9 border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#0175a2] hover:border-[#0175a2] transition-colors"
              aria-label="Next"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Dots */}
          <div className="flex items-center gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? 'bg-[#0175a2] w-6'
                    : 'bg-gray-200 hover:bg-gray-300 w-1.5'
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>

          {/* Counter */}
          <p className="text-xs font-thin text-gray-400 tabular-nums">
            {String(activeIndex + 1).padStart(2, '0')} / {String(testimonials.length).padStart(2, '0')}
          </p>
        </div>

      </div>
    </section>
  );
};

export default SocialProof;
