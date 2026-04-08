'use client';

import React, { useEffect, useRef, useState } from 'react';

// ─── Animated circular-progress stat ─────────────────────────────────────────

interface CircleStatProps {
  /** 0-100 — how far the arc fills */
  percentage: number;
  /** What to display in the centre instead of `${percentage}%` */
  valueDisplay: string;
  label: string;
  source?: string;
  /** Delay before animation starts (ms) */
  delay?: number;
  isVisible: boolean;
}

const CircleStat: React.FC<CircleStatProps> = ({
  percentage,
  valueDisplay,
  label,
  source,
  delay = 0,
  isVisible,
}) => {
  const radius = 56;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  return (
    <div
      className="flex flex-col items-center transition-opacity duration-700"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      <div className="relative w-[140px] h-[140px] md:w-[250px] md:h-[250px] flex items-center justify-center mb-6 md:mb-10">
        <svg className="w-full h-full -rotate-90 block" viewBox="0 0 128 128">
          {/* Track */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated fill */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="#00bceb"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={isVisible ? targetOffset : circumference}
            strokeLinecap="round"
            style={{
              transition: `stroke-dashoffset 1.4s cubic-bezier(0.4, 0, 0.2, 1) ${delay + 100}ms`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-3xl md:text-6xl font-thin text-slate-800 leading-none">
            {valueDisplay}
          </span>
        </div>
      </div>
      <p className="text-center text-base text-gray-500 max-w-[300px] leading-relaxed font-thin">
        {label}
      </p>
      {source && (
        <p className="text-center text-[10px] text-gray-300 max-w-[260px] mt-3 font-thin italic">
          {source}
        </p>
      )}
    </div>
  );
};

// ─── Section ──────────────────────────────────────────────────────────────────

const STATS = [
  {
    percentage: 33,
    valueDisplay: '1 in 3',
    label: 'solo practices audited by OCR had no documented policies on file',
    source: 'HHS OCR Phase 2 Audit Program Report, 2017',
    delay: 0,
  },
  {
    percentage: 40,
    valueDisplay: '40%',
    label: 'increase in OCR audits (2024–2025)',
    source: 'HHS Office for Civil Rights Annual Report to Congress, 2024',
    delay: 120,
  },
  {
    percentage: 72,
    valueDisplay: '$50k',
    label: 'average fine per violation',
    source: 'HHS OCR Resolution Agreements, 2020–2024',
    delay: 240,
  },
  {
    percentage: 85,
    valueDisplay: '10 days',
    label: 'OCR gives you 10 days to respond to an audit request. Most solo practices need 4–8 weeks to find their files.',
    source: 'HHS OCR Desk Review Protocol',
    delay: 360,
  },
];

const SolutionSection: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="solution" className="py-24 bg-white border-b border-gray-200 border-[0.5px]">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <div
          ref={ref}
          className="grid grid-cols-2 xl:grid-cols-4 gap-8 xl:gap-10"
        >
          {STATS.map((stat) => (
            <CircleStat key={stat.valueDisplay} {...stat} isVisible={isVisible} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
