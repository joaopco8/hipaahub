'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Shield, CheckCircle2, FileText, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function HeroSketchy() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative w-full min-h-screen bg-gradient-to-b from-white via-[#f3f5f9] to-white overflow-hidden">
      {/* Simple Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #0c0b1d 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-14 md:pt-40 md:pb-20 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-7 md:space-y-10">
            
            {/* Headline with Crimson Text highlights */}
            <motion.div
              className="space-y-4 md:space-y-5"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-[#0c0b1d] leading-[1.12] tracking-tight">
                <span className="block">What Happens When an Auditor Finds</span>
                <span className="block">
                  Your Documentation{' '}
                  <span className={cn("font-crimson-text font-semibold italic relative inline-block")}>
                    Disorganized
                    {/* Sketchy underline - FIXED POSITION */}
                    <motion.svg
                      className="absolute -bottom-2 left-0 w-full"
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
                <span className="block mt-3 text-xl md:text-2xl lg:text-3xl font-light text-zinc-500">
                  <span className={cn("font-crimson-text font-semibold italic text-[#0c0b1d]")}>
                    (Spoiler: It's Not Good)
                  </span>
                </span>
              </h1>
            </motion.div>

            {/* Subheadline with narrative style - FIXED POSITIONING */}
            <motion.div
              className="space-y-4 md:space-y-5 max-w-4xl mx-auto relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-base md:text-lg lg:text-xl text-zinc-700 font-light leading-relaxed">
                The auditor arrives on a{' '}
                <span className={cn("font-crimson-text font-semibold text-[#0c0b1d]")}>
                  Tuesday morning
                </span>
                . She's professional, polite, and systematic. She asks:{' '}
                <span className={cn("font-crimson-text font-semibold italic text-[#0c0b1d]")}>
                  "Where's your risk assessment?"
                </span>
              </p>
              <p className="text-base md:text-lg lg:text-xl text-zinc-700 font-light leading-relaxed">
                Your practice manager panics. She searches{' '}
                <span className={cn("font-crimson-text font-semibold text-[#0c0b1d]")}>
                  5 different folders
                </span>
                . She finds it{' '}
                <span className={cn("font-crimson-text font-semibold text-[#0c0b1d] relative inline-block")}>
                  15 minutes later
                  {/* Underline - FIXED POSITION */}
                  <motion.svg
                    className="absolute -bottom-1 left-0 w-full"
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
              <p className="text-base md:text-lg lg:text-xl text-zinc-700 font-light leading-relaxed">
                The auditor makes a note:{' '}
                <span className={cn("font-crimson-text font-semibold italic text-red-600")}>
                  "Documentation disorganized."
                </span>
                {' '}That's a violation. That violation becomes a fine. That fine could be{' '}
                <span className={cn("font-crimson-text font-bold text-red-600 relative inline-block px-1")}>
                  $15k, $50k, or more
                  {/* Double underlines - FIXED POSITION */}
                  <motion.svg
                    className="absolute -bottom-2 left-0 w-full"
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

            {/* Feature Pills */}
            <motion.div
              className="flex flex-wrap justify-center gap-3 md:gap-4 mt-10 md:mt-12"
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
                    className="group relative flex items-center gap-2.5 px-4 py-2.5 bg-white rounded-xl border-2 border-zinc-200 shadow-sm hover:border-[#1ad07a] transition-all duration-300"
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.7 + index * 0.1,
                      ease: 'easeOut',
                    }}
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    <Icon className="w-5 h-5 text-[#1ad07a]" />
                    <span className="text-sm font-medium text-[#0c0b1d]">{item.text}</span>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* CTA Button */}
            <motion.div
              className="flex flex-col items-center gap-3 mt-10 md:mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link href="/#pricing">
                <Button
                  size="lg"
                  className="group relative px-7 py-5 bg-[#1ad07a] text-[#0c0b1d] font-medium text-base md:text-lg rounded-lg hover:bg-[#1ad07a]/90 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <span className="flex items-center gap-3">
                    Get Audit-Ready in 30 Days
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
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </span>
                </Button>
              </Link>

              {/* Trust Badge with User Avatars */}
              <motion.div
                className="flex flex-col items-center gap-3 mt-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* User Avatars - Real Photos */}
                <div className="flex items-center -space-x-2">
                  {[
                    { name: 'Sarah', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces&auto=format&q=80' },
                    { name: 'Michael', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces&auto=format&q=80' },
                    { name: 'Jennifer', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces&auto=format&q=80' },
                    { name: 'David', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces&auto=format&q=80' },
                    { name: 'Emily', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces&auto=format&q=80' },
                    { name: 'Robert', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=faces&auto=format&q=80' },
                    { name: 'Lisa', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces&auto=format&q=80' },
                  ].map((user, index) => (
                    <motion.div
                      key={index}
                      className="relative w-9 h-9 md:w-11 md:h-11 rounded-full border-2 border-white shadow-sm overflow-hidden flex items-center justify-center bg-zinc-100"
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
                        sizes="(max-width: 768px) 36px, 44px"
                        loading="lazy"
                      />
                    </motion.div>
                  ))}
                  {/* Plus indicator for more users */}
                  <motion.div
                    className="relative w-9 h-9 md:w-11 md:h-11 rounded-full border-2 border-white shadow-sm bg-zinc-50 flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.4,
                      delay: 1.45,
                      ease: 'easeOut',
                    }}
                  >
                    <span className="text-zinc-500 font-medium text-xs md:text-sm">+</span>
                  </motion.div>
                </div>

                {/* Trust Text */}
                <p className="text-sm md:text-base text-zinc-600 font-light">
                  Trusted by{' '}
                  <span className="font-semibold text-[#0c0b1d]">1,000+ clinics</span>
                  {' '}across the United States
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
