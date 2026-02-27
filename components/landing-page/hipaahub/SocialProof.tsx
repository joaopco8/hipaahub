'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Testimonial {
  id: number;
  quote: string;
  author: string;
  role: string;
  organization: string;
  image: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    quote: "Implementing HIPAA Hub reduced our documentation retrieval time by 80%. When our OCR audit request came in, we had everything organized and ready within hours instead of weeks.",
    author: "Marcus Thorne",
    role: "Director of Compliance",
    organization: "Regional Medical Associates",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 2,
    quote: "As a solo practitioner, I had no idea where to begin with HIPAA. HIPAA Hub gave me a clear roadmap, generated all my policies, and now I actually feel confident in my compliance posture.",
    author: "Dr. Sarah Mitchell",
    role: "Family Medicine Physician",
    organization: "Mitchell Family Practice",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 3,
    quote: "We were spending thousands on compliance consultants every year. HIPAA Hub replaced that entirely. The automated risk assessments and policy generation are accurate and built for real clinical environments.",
    author: "James Okafor",
    role: "Chief Operating Officer",
    organization: "Westside Mental Health Clinic",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 4,
    quote: "Our staff training compliance went from 40% to 100% within the first month. The platform tracks everything automatically and sends reminders. I no longer chase people down for attestations.",
    author: "Linda Park",
    role: "HR & Compliance Manager",
    organization: "Harmony Dental Group",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 5,
    quote: "After a breach incident at a peer clinic, we knew we needed to get serious. HIPAA Hub helped us build an incident response plan, vendor BAA registry, and a complete audit trail in under two weeks.",
    author: "Robert Vasquez",
    role: "Practice Administrator",
    organization: "Southwest Orthopedic Center",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 6,
    quote: "The breach notification builder alone is worth the subscription. It walks you through every regulatory requirement and generates a properly formatted letter. What used to take days now takes 30 minutes.",
    author: "Dr. Amara Osei",
    role: "Medical Director",
    organization: "Northview Women's Health",
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 7,
    quote: "We manage 14 providers across three locations. HIPAA Hub gives us a centralized view of compliance across all sites. The dashboard makes it easy to identify gaps before they become violations.",
    author: "Thomas Bergmann",
    role: "VP of Operations",
    organization: "Tri-State Physical Therapy",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 8,
    quote: "I reviewed every HIPAA compliance tool on the market before choosing HIPAA Hub. The risk assessment engine is clinically accurate, the documentation is professional, and the support team actually understands healthcare.",
    author: "Christine Nakamura",
    role: "Privacy Officer",
    organization: "Pacific Coast Pediatrics",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=800",
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
          <p className="text-[11px] font-thin text-[#0175a2] tracking-widest uppercase mb-3">Customer Stories</p>
          <h2 className="text-3xl font-thin text-[#0e274e]">Trusted by healthcare organizations across the US</h2>
        </div>

        {/* Main testimonial card */}
        <div className={`bg-white border border-gray-100 shadow-sm flex flex-col lg:flex-row min-h-[420px] transition-opacity duration-200 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>

          {/* Quote area */}
          <div className="flex-grow p-10 md:p-16 lg:w-3/4 flex flex-col justify-between">
            <div>
              {/* Large decorative quote mark */}
              <div className="text-[80px] leading-none font-thin text-gray-100 select-none -mb-4">&ldquo;</div>
              <p className="text-gray-700 leading-relaxed text-lg md:text-xl font-thin max-w-3xl">
                {current.quote}
              </p>
            </div>

            <div className="mt-10 flex items-center gap-4">
              <img
                src={current.image}
                alt={current.author}
                className="w-12 h-12 rounded-full object-cover grayscale brightness-95 flex-shrink-0"
              />
              <div>
                <p className="font-thin text-[#0e274e] text-sm">{current.author}</p>
                <p className="text-gray-400 text-xs font-thin mt-0.5">
                  {current.role} &mdash; {current.organization}
                </p>
              </div>
            </div>
          </div>

          {/* Right full photo */}
          <div className="lg:w-1/4 relative min-h-[280px] lg:min-h-full overflow-hidden border-l border-gray-50">
            <img
              key={current.id}
              src={current.image}
              alt={current.author}
              className="absolute inset-0 w-full h-full object-cover object-top grayscale brightness-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e274e]/40 to-transparent" />
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
