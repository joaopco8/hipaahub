'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Shield, CheckCircle2, FileText, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Marquee from '@/components/magicui/marquee';

const companyLogos = [
  {
    name: 'Valley Health System',
    logo: '/images/logos/Valley-Health-System-logo-300x137.webp',
    width: 300,
    height: 137
  },
  {
    name: 'AMBA',
    logo: '/images/logos/AMBA-logo-300x75.webp',
    width: 300,
    height: 75
  },
  {
    name: '4medica',
    logo: '/images/logos/4medica-Logo-300x82.webp',
    width: 300,
    height: 82
  },
  {
    name: 'NextGen',
    logo: '/images/logos/Nextgen-300x123.webp',
    width: 300,
    height: 123
  },
  {
    name: 'OHIP',
    logo: '/images/logos/OHIP-only-Coral-300x200.webp',
    width: 300,
    height: 200
  },
  {
    name: 'MeUCare',
    logo: '/images/logos/MeUCare.webp',
    width: 300,
    height: 100
  }
];

function HealthcareLogosMarquee() {
  return (
    <div className="w-full overflow-hidden py-3 sm:py-4 md:py-6">
      <div className="relative">
        {/* Gradient fade on edges */}
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-16 md:w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-16 md:w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
        
        <Marquee
          pauseOnHover={false}
          className="[--duration:40s] gap-6 sm:gap-8 md:gap-12 lg:gap-16"
        >
          {companyLogos.map((company, index) => (
            <div
              key={index}
              className="flex items-center justify-center h-10 sm:h-12 md:h-14 lg:h-20 px-2 sm:px-3 md:px-4 lg:px-8 grayscale hover:grayscale-0 transition-all duration-300 opacity-50 hover:opacity-100 group"
            >
              <div className="relative w-full max-w-[120px] sm:max-w-[140px] md:max-w-[160px] lg:max-w-[180px] xl:max-w-[220px] h-full flex items-center justify-center">
                <Image
                  src={company.logo}
                  alt={company.name}
                  width={company.width}
                  height={company.height}
                  className="object-contain max-w-full max-h-full filter group-hover:brightness-110 transition-all duration-300"
                  quality={90}
                  unoptimized={false}
                />
              </div>
            </div>
          ))}
        </Marquee>
      </div>
    </div>
  );
}

const circleConfigs = [
  {
    id: 1,
    size: 480,
    radius: 700,
    speed: 40,
    startAngle: 0,
    content: '/images/8img/01.png',
  },
  {
    id: 2,
    size: 480,
    radius: 700,
    speed: 40,
    startAngle: 45,
    content: '/images/8img/02.png',
  },
  {
    id: 3,
    size: 480,
    radius: 700,
    speed: 40,
    startAngle: 90,
    content: '/images/8img/03.png',
  },
  {
    id: 4,
    size: 480,
    radius: 700,
    speed: 40,
    startAngle: 135,
    content: '/images/8img/04.png',
  },
  {
    id: 5,
    size: 480,
    radius: 700,
    speed: 40,
    startAngle: 180,
    content: '/images/8img/05.png',
  },
  {
    id: 6,
    size: 480,
    radius: 700,
    speed: 40,
    startAngle: 225,
    content: '/images/8img/06.png',
  },
  {
    id: 7,
    size: 480,
    radius: 700,
    speed: 40,
    startAngle: 270,
    content: '/images/8img/07.png',
  },
  {
    id: 8,
    size: 480,
    radius: 700,
    speed: 40,
    startAngle: 315,
    content: '/images/8img/08.png',
  }
];

export default function HeroSketchy() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative w-full min-h-screen bg-white overflow-hidden flex items-center">
      {/* Audit Process Background - Left Side */}
      <div className="absolute left-[5%] top-0 w-[25%] h-full pointer-events-none opacity-[0.15] hidden lg:block">
        <svg className="w-full h-full" viewBox="0 0 500 1400" preserveAspectRatio="xMinYMin meet">
          {/* Document shapes with text lines */}
          {[
            { x: 60, y: 120, width: 120, height: 160, title: 'HIPAA Policy' },
            { x: 60, y: 320, width: 120, height: 160, title: 'Risk Assessment' },
            { x: 60, y: 520, width: 120, height: 160, title: 'Training Log' },
            { x: 60, y: 720, width: 120, height: 160, title: 'Evidence File' },
            { x: 60, y: 920, width: 120, height: 160, title: 'Audit Report' },
          ].map((doc, index) => (
            <g key={index}>
              {/* Document page with shadow */}
              <defs>
                <filter id={`shadow-${index}`}>
                  <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#0c0b1d" floodOpacity="0.2"/>
                </filter>
              </defs>
              <motion.rect
                x={doc.x}
                y={doc.y}
                width={doc.width}
                height={doc.height}
                rx="3"
                fill="white"
                stroke="#0c0b1d"
                strokeWidth="2.5"
                filter={`url(#shadow-${index})`}
                initial={{ opacity: 0, y: doc.y + 20 }}
                animate={{ opacity: 1, y: doc.y }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              />
              {/* Document fold corner */}
              <motion.polygon
                points={`${doc.x + doc.width - 20},${doc.y} ${doc.x + doc.width},${doc.y} ${doc.x + doc.width},${doc.y + 20}`}
                fill="#f3f5f9"
                stroke="#0c0b1d"
                strokeWidth="1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: index * 0.2 + 0.3 }}
              />
              {/* Text lines in document */}
              {[0, 1, 2, 3, 4, 5].map((line) => (
                <motion.line
                  key={line}
                  x1={doc.x + 15}
                  y1={doc.y + 40 + line * 18}
                  x2={doc.x + doc.width - 15}
                  y2={doc.y + 40 + line * 18}
                  stroke="#0c0b1d"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                  opacity="0.6"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.2 + 0.4 + line * 0.05 }}
                />
              ))}
              {/* Document title */}
              <motion.text
                x={doc.x + doc.width / 2}
                y={doc.y + 25}
                textAnchor="middle"
                fill="#0c0b1d"
                fontSize="11"
                fontWeight="700"
                letterSpacing="0.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: index * 0.2 + 0.5 }}
              >
                {doc.title}
              </motion.text>
            </g>
          ))}

          {/* Connecting audit flow lines with arrows */}
          <motion.path
            d="M 120 280 L 120 320 M 120 480 L 120 520 M 120 680 L 120 720 M 120 880 L 120 920"
            stroke="#1ad07a"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="6 4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}
          />
          {/* Arrow heads */}
          {[320, 520, 720, 920].map((y, i) => (
            <motion.polygon
              key={i}
              points={`120,${y} 115,${y - 5} 125,${y - 5}`}
              fill="#1ad07a"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: i * 0.5 + 0.5 }}
            />
          ))}

          {/* Checklist items */}
          {[
            { x: 220, y: 200, text: 'Privacy Policy ✓' },
            { x: 220, y: 400, text: 'Security Policy ✓' },
            { x: 220, y: 600, text: 'Breach Protocol ✓' },
            { x: 220, y: 800, text: 'Staff Training ✓' },
            { x: 220, y: 1000, text: 'Risk Analysis ✓' },
          ].map((item, index) => (
            <g key={index}>
              <motion.circle
                cx={item.x - 15}
                cy={item.y}
                r="8"
                fill="#1ad07a"
                stroke="#0c0b1d"
                strokeWidth="2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: index * 0.3 + 1, type: 'spring' }}
              />
              <motion.path
                d={`M ${item.x - 19} ${item.y} L ${item.x - 13} ${item.y + 5} L ${item.x - 9} ${item.y - 3}`}
                stroke="white"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3, delay: index * 0.3 + 1.2 }}
              />
              <motion.text
                x={item.x}
                y={item.y + 5}
                fill="#0c0b1d"
                fontSize="12"
                fontWeight="600"
                letterSpacing="0.3"
                initial={{ opacity: 0, x: item.x - 10 }}
                animate={{ opacity: 1, x: item.x }}
                transition={{ duration: 0.4, delay: index * 0.3 + 1.3 }}
              >
                {item.text}
              </motion.text>
            </g>
          ))}
        </svg>
      </div>

      {/* Audit Process Background - Right Side */}
      <div className="absolute right-[5%] top-0 w-[25%] h-full pointer-events-none opacity-[0.15] hidden lg:block">
        <svg className="w-full h-full" viewBox="0 0 500 1400" preserveAspectRatio="xMaxYMin meet">
          {/* Audit workflow steps */}
          {[
            { x: 320, y: 150, step: '1', title: 'Initial Review', status: 'complete' },
            { x: 320, y: 350, step: '2', title: 'Document Check', status: 'complete' },
            { x: 320, y: 550, step: '3', title: 'Evidence Verify', status: 'complete' },
            { x: 320, y: 750, step: '4', title: 'Compliance Check', status: 'complete' },
            { x: 320, y: 950, step: '5', title: 'Final Approval', status: 'complete' },
          ].map((step, index) => (
            <g key={index}>
              {/* Step number circle with shadow */}
              <defs>
                <filter id={`step-shadow-${index}`}>
                  <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#1ad07a" floodOpacity="0.3"/>
                </filter>
              </defs>
              <motion.circle
                cx={step.x}
                cy={step.y}
                r="24"
                fill={step.status === 'complete' ? '#1ad07a' : '#f3f5f9'}
                stroke="#0c0b1d"
                strokeWidth="2.5"
                filter={step.status === 'complete' ? `url(#step-shadow-${index})` : ''}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.2, type: 'spring' }}
              />
              <motion.text
                x={step.x}
                y={step.y + 6}
                textAnchor="middle"
                fill={step.status === 'complete' ? 'white' : '#0c0b1d'}
                fontSize="14"
                fontWeight="800"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.2 + 0.3 }}
              >
                {step.step}
              </motion.text>
              
              {/* Step title box with shadow */}
              <motion.rect
                x={step.x + 40}
                y={step.y - 18}
                width="150"
                height="36"
                rx="5"
                fill="white"
                stroke="#0c0b1d"
                strokeWidth="2"
                filter="url(#shadow-0)"
                initial={{ opacity: 0, x: step.x + 25 }}
                animate={{ opacity: 1, x: step.x + 40 }}
                transition={{ duration: 0.5, delay: index * 0.2 + 0.2 }}
              />
              <motion.text
                x={step.x + 115}
                y={step.y + 4}
                textAnchor="middle"
                fill="#0c0b1d"
                fontSize="11"
                fontWeight="700"
                letterSpacing="0.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: index * 0.2 + 0.4 }}
              >
                {step.title}
              </motion.text>

              {/* Checkmark for complete */}
              {step.status === 'complete' && (
                <motion.path
                  d={`M ${step.x - 10} ${step.y} L ${step.x - 4} ${step.y + 6} L ${step.x + 10} ${step.y - 4}`}
                  stroke="white"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.2 + 0.6 }}
                />
              )}
            </g>
          ))}

          {/* Connecting workflow lines with arrows */}
          <motion.path
            d="M 320 170 L 320 330 M 320 370 L 320 530 M 320 570 L 320 730 M 320 770 L 320 930"
            stroke="#1ad07a"
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="7 5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 4, repeat: Infinity, repeatDelay: 2, delay: 0.5 }}
          />
          {/* Arrow heads */}
          {[330, 530, 730, 930].map((y, i) => (
            <motion.polygon
              key={i}
              points={`320,${y} 315,${y - 6} 325,${y - 6}`}
              fill="#1ad07a"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: i * 0.5 + 1 }}
            />
          ))}

          {/* Audit stamp/seal elements */}
          {[
            { x: 420, y: 250 },
            { x: 420, y: 650 },
            { x: 420, y: 1050 },
          ].map((stamp, index) => (
            <g key={index}>
              <motion.circle
                cx={stamp.x}
                cy={stamp.y}
                r="30"
                fill="#1ad07a"
                fillOpacity="0.1"
                stroke="#1ad07a"
                strokeWidth="3"
                strokeDasharray="4 3"
                initial={{ scale: 0, rotate: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ duration: 0.8, delay: index * 0.4 + 1, type: 'spring' }}
              />
              <motion.circle
                cx={stamp.x}
                cy={stamp.y}
                r="28"
                fill="none"
                stroke="#0c0b1d"
                strokeWidth="2"
                strokeDasharray="3 2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.4 + 1.2 }}
              />
              <motion.text
                x={stamp.x}
                y={stamp.y - 6}
                textAnchor="middle"
                fill="#0c0b1d"
                fontSize="9"
                fontWeight="800"
                letterSpacing="1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.4 + 1.3 }}
              >
                APPROVED
              </motion.text>
              <motion.text
                x={stamp.x}
                y={stamp.y + 10}
                textAnchor="middle"
                fill="#1ad07a"
                fontSize="8"
                fontWeight="700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.4 + 1.4 }}
              >
                HIPAA
              </motion.text>
            </g>
          ))}
        </svg>
      </div>

      {/* Subtle document grid pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(to right, #0c0b1d 1px, transparent 1px),
              linear-gradient(to bottom, #0c0b1d 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10 sm:pt-28 sm:pb-12 md:pt-32 md:pb-16 lg:pt-32 lg:pb-20 relative z-30 w-full">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center text-center min-h-[calc(100vh-80px)] sm:min-h-[calc(100vh-100px)]">
            {/* Content - Text and CTA */}
            <div className="space-y-5 sm:space-y-6 md:space-y-8 max-w-4xl w-full">
            
            {/* Headline with Crimson Text highlights */}
            <motion.div
              className="space-y-3 sm:space-y-4 md:space-y-5 px-2 sm:px-0"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-5xl lg:text-5xl xl:text-6xl 2xl:text-6xl font-light text-[#0c0b1d] leading-[1.2] sm:leading-[1.15] tracking-tight">
                <span className="block">What Happens When an Auditor Finds Your HIPAA Documentation{' '}
                  <span className={cn("font-crimson-text font-semibold italic relative inline-block text-[#1ad07a]")}>
                    Disorganized
                    {/* Sketchy underline - FIXED POSITION */}
                    <motion.svg
                      className="absolute -bottom-1 sm:-bottom-2 left-0 w-full hidden sm:block"
                      height="8"
                      viewBox="0 0 200 8"
                      fill="none"
                      stroke="#1ad07a"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <motion.path
                        d="M5 4 Q50 2 100 4 T195 4"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.8, delay: 0.7, ease: 'easeOut' }}
                        style={{ strokeDasharray: '8 4' }}
                      />
                    </motion.svg>
                  </span>
                </span>
                <span className="block mt-3 sm:mt-4 text-xl sm:text-2xl md:text-2xl lg:text-2xl xl:text-3xl 2xl:text-3xl font-light text-zinc-600">
                  <span className={cn("font-crimson-text font-semibold italic text-[#0c0b1d]")}>
                    (Spoiler: It's Not Good)
                  </span>
                </span>
              </h1>
            </motion.div>

            {/* Subheadline with narrative style - FIXED POSITIONING */}
            <motion.div
              className="space-y-3 sm:space-y-4 md:space-y-5 relative px-2 sm:px-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-base sm:text-lg md:text-xl lg:text-xl xl:text-2xl 2xl:text-2xl text-zinc-700 font-light leading-relaxed">
                The auditor arrives on a{' '}
                <span className={cn("font-crimson-text font-semibold text-[#0c0b1d]")}>
                  Tuesday morning
                </span>
                . She's professional, polite, and systematic. She asks:{' '}
                <span className={cn("font-crimson-text font-semibold italic text-[#1ad07a]")}>
                  "Where's your risk assessment?"
                </span>
              </p>
              <p className="text-base sm:text-lg md:text-xl lg:text-xl xl:text-2xl 2xl:text-2xl text-zinc-700 font-light leading-relaxed">
                Your practice manager panics. She searches{' '}
                <span className={cn("font-crimson-text font-semibold text-[#0c0b1d]")}>
                  5 different folders
                </span>
                . She finds it{' '}
                <span className={cn("font-crimson-text font-semibold text-[#0c0b1d] relative inline-block")}>
                  15 minutes later
                  {/* Underline - FIXED POSITION */}
                  <motion.svg
                    className="absolute -bottom-1 left-0 w-full hidden sm:block"
                    height="6"
                    viewBox="0 0 180 6"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.6 }}
                  >
                    <motion.path
                      d="M5 3 Q45 1.5 90 3 T175 3"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.7, delay: 1.8 }}
                      style={{ strokeDasharray: '6 3' }}
                    />
                  </motion.svg>
                </span>
                .
              </p>
              <p className="text-base sm:text-lg md:text-xl lg:text-xl xl:text-2xl 2xl:text-2xl text-zinc-700 font-light leading-relaxed">
                The auditor makes a note:{' '}
                <span className={cn("font-crimson-text font-semibold italic text-red-500")}>
                  "Documentation disorganized."
                </span>
                {' '}That's a violation. That violation becomes a fine. That fine could be{' '}
                <span className={cn("font-crimson-text font-bold text-red-500 relative inline-block px-1")}>
                  $15k, $50k, or more
                  {/* Double underlines - FIXED POSITION */}
                  <motion.svg
                    className="absolute -bottom-2 left-0 w-full hidden sm:block"
                    height="14"
                    viewBox="0 0 280 14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.4 }}
                  >
                    <motion.path
                      d="M5 6 Q70 3 140 6 T275 6"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1, delay: 2.6 }}
                      style={{ strokeDasharray: '10 5' }}
                    />
                    <motion.path
                      d="M5 10 Q70 7 140 10 T275 10"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1, delay: 2.8 }}
                      style={{ strokeDasharray: '10 5' }}
                    />
                  </motion.svg>
                </span>
                .
              </p>
            </motion.div>

            {/* Feature Pills - Single Line */}
            <motion.div
              className="flex flex-nowrap gap-1 sm:gap-1.5 md:gap-3 mt-4 sm:mt-6 md:mt-8 justify-center px-2 sm:px-0 overflow-x-auto scrollbar-hide"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              {[
                { icon: Shield, text: 'All 9 Policies' },
                { icon: FileText, text: 'Risk Assessment' },
                { icon: CheckCircle2, text: 'Evidence Linked' },
                { icon: AlertTriangle, text: 'Audit Ready' },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={index}
                    className="group relative flex items-center gap-0.5 sm:gap-1 md:gap-2 px-2 sm:px-2.5 md:px-4 py-1 sm:py-1.5 md:py-2.5 bg-zinc-50 rounded-md sm:rounded-lg md:rounded-xl border border-zinc-200 shadow-sm hover:border-[#1ad07a] hover:bg-zinc-100 transition-all duration-300 flex-shrink-0"
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.7 + index * 0.1,
                      ease: 'easeOut',
                    }}
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-5 md:h-5 text-[#1ad07a] flex-shrink-0" />
                    <span className="text-[9px] sm:text-[10px] md:text-sm font-medium text-[#0c0b1d] whitespace-nowrap">{item.text}</span>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* CTA Button */}
            <motion.div
              className="flex flex-col gap-2 sm:gap-2.5 mt-4 sm:mt-6 md:mt-8 items-center w-full px-4 sm:px-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link href="/#pricing" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="group relative w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-4 bg-[#1ad07a] text-[#0c0b1d] font-medium text-sm sm:text-base rounded-lg hover:bg-[#1ad07a]/90 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <span className="flex items-center justify-center gap-2 sm:gap-3">
                    <span className="text-xs sm:text-sm md:text-base">Get Audit-Ready in 30 Days</span>
                    <motion.div
                      animate={{
                        x: [0, 6, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </motion.div>
                  </span>
                </Button>
              </Link>

              {/* Trust Badge with User Avatars */}
              <motion.div
                className="flex flex-col gap-1.5 sm:gap-2 mt-3 sm:mt-4 items-center px-4 sm:px-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* User Avatars - Real Photos */}
                <div className="flex items-center -space-x-1.5 sm:-space-x-2">
                  {[
                    { name: 'Sarah', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces&auto=format&q=80' },
                    { name: 'Michael', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces&auto=format&q=80' },
                    { name: 'Jennifer', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces&auto=format&q=80' },
                    { name: 'David', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces&auto=format&q=80' },
                    { name: 'Emily', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces&auto=format&q=80' },
                    { name: 'Robert', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=faces&auto=format&q=80' },
                    { name: 'Lisa', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces&auto=format&q=80' },
                  ].slice(0, 5).map((user, index) => (
                    <motion.div
                      key={index}
                      className="relative w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-11 lg:h-11 rounded-full border-2 border-zinc-200 shadow-sm overflow-hidden flex items-center justify-center bg-zinc-100"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: 0.4,
                        delay: 1.1 + index * 0.05,
                        ease: 'easeOut',
                      }}
                      whileHover={{ scale: 1.15, zIndex: 10 }}
                    >
                      {/* Real person photo */}
                      <Image
                        src={user.image}
                        alt={`${user.name}, HIPAA Hub user`}
                        fill
                        className="object-cover rounded-full"
                        sizes="(max-width: 640px) 28px, (max-width: 768px) 32px, (max-width: 1024px) 36px, 44px"
                        loading="lazy"
                      />
                    </motion.div>
                  ))}
                  {/* Plus indicator for more users */}
                  <motion.div
                    className="relative w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-11 lg:h-11 rounded-full border-2 border-zinc-200 shadow-sm bg-zinc-50 flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.4,
                      delay: 1.45,
                      ease: 'easeOut',
                    }}
                  >
                    <span className="text-zinc-600 font-medium text-[10px] sm:text-xs md:text-sm">+</span>
                  </motion.div>
                </div>

                {/* Trust Text */}
                <p className="text-[10px] sm:text-xs md:text-sm text-zinc-600 font-light text-center">
                  Trusted by{' '}
                  <span className="font-semibold text-[#0c0b1d]">1,000+ clinics</span>
                  {' '}across the United States
                </p>
              </motion.div>
            </motion.div>

            {/* Healthcare Logos Scroll */}
            <motion.div
              className="w-full mt-8 sm:mt-10 md:mt-12 lg:mt-16 px-2 sm:px-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <HealthcareLogosMarquee />
            </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
