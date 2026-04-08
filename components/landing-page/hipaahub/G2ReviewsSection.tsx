'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Star } from 'lucide-react';
import Image from 'next/image';

const REVIEWS = [
  {
    name: 'Sarah M.',
    role: 'Licensed Therapist, Solo Practice',
    rating: 5,
    text: "I was dreading our OCR audit until I found HIPAA Hub. Within a few hours I had all 9 required policies activated, my risk assessment done, and a PDF I could actually hand to a regulator. The peace of mind is worth every penny.",
  },
  {
    name: 'Dr. James K.',
    role: 'Psychiatrist, 3-Provider Practice',
    rating: 5,
    text: "We'd been putting off HIPAA compliance for two years because we didn't know where to start. HIPAA Hub made it clear, fast, and actually manageable. The BAA tracker alone saved us from a major gap we didn't know we had.",
  },
  {
    name: 'Michelle R.',
    role: 'Practice Administrator, Group Practice',
    rating: 5,
    text: "The risk assessment is genuinely OCR-defensible — I say that as someone who has been through an audit. The PDF export goes directly to the four questions OCR asks. This is not just another checkbox tool.",
  },
  {
    name: 'Dr. Amanda T.',
    role: 'Psychologist, Private Practice',
    rating: 5,
    text: "Set up in under an hour. My BAAs are tracked, my policies are signed, and my staff finished their HIPAA training with certificates on file. I finally feel like I'm actually compliant, not just hoping I am.",
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

const G2ReviewsSection: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="py-24 bg-[#f8f9fa] border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 md:px-12">

        {/* Section header */}
        <div className="mb-14">
          <p className="text-[11px] font-thin tracking-widest text-[#00bceb] uppercase mb-3">
            Customer Reviews
          </p>
          <h2 className="text-4xl lg:text-[44px] font-thin text-[#0e274e] leading-[1.15] max-w-xl">
            Hear why so many organizations love using HIPAA Hub.
          </h2>
        </div>

        <div ref={ref} className="grid lg:grid-cols-2 gap-16 items-start">

          {/* Left — G2 badge image */}
          <div
            className="flex items-center justify-center"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateX(0)' : 'translateX(-24px)',
              transition: 'opacity 0.7s ease, transform 0.7s ease',
            }}
          >
            <div className="relative">
              <Image
                src="/images/g2-badges.png"
                alt="G2 Awards — Top 50 Healthcare Products 2025, High Performer, Leader, Momentum Leader, Best Usability, Best Relationship, Easiest Setup, Users Love Us"
                width={480}
                height={480}
                className="w-full max-w-[420px] mx-auto object-contain drop-shadow-sm"
                priority
              />
            </div>
          </div>

          {/* Right — review cards */}
          <div className="space-y-4">
            {REVIEWS.map((review, i) => (
              <div
                key={review.name}
                className="bg-white border border-gray-100 p-6"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateX(0)' : 'translateX(24px)',
                  transition: `opacity 0.6s ease ${i * 100}ms, transform 0.6s ease ${i * 100}ms`,
                }}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="text-sm font-normal text-[#0e274e]">{review.name}</p>
                    <p className="text-xs text-gray-400 font-thin">{review.role}</p>
                  </div>
                  <StarRating count={review.rating} />
                </div>
                <p className="text-sm text-gray-600 font-thin leading-relaxed">
                  "{review.text}"
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default G2ReviewsSection;
