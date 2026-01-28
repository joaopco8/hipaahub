'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, XCircle, FileText, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function HeroAuditReady() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative w-full min-h-screen bg-gradient-to-b from-white via-[#f3f5f9] to-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        
        {/* Main Grid - Text Left, Visuals Right */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* LEFT COLUMN - Text Content */}
          <div className="space-y-8 lg:space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-[#0c0b1d] leading-[1.1] tracking-tight">
                If an auditor asked for your documentation{' '}
                <span className="font-normal text-[#0c0b1d]">right now…</span>
                <br />
                <span className="font-light">would you be ready in</span>{' '}
                <span className="font-normal text-[#1ad07a]">5 minutes?</span>
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-xl md:text-2xl text-zinc-600 font-light leading-relaxed max-w-xl"
              >
                Most clinics panic. Files are missing. Proof doesn't exist.
                <br />
                <span className="text-[#0c0b1d] font-normal">
                  HIPAA Hub organizes your compliance so you're always audit-ready.
                </span>
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="pt-4"
            >
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-[#1ad07a] text-[#0c0b1d] hover:bg-[#1ad07a]/90 rounded-lg px-10 py-7 text-lg font-medium transition-all shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] group"
                >
                  Show Me My Compliance Gaps
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* RIGHT COLUMN - Visual Comparison */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-6 lg:gap-8">
              
              {/* LEFT CARD - The Panic */}
              <motion.div
                initial={{ opacity: 0, x: -30, scale: 0.95 }}
                animate={{ opacity: mounted ? 1 : 0, x: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                <div className="bg-[#FFF3F3] rounded-2xl p-5 md:p-6 shadow-2xl border border-red-100/80 backdrop-blur-sm">
                  {/* Mockup Window */}
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-red-50">
                    {/* Window Header */}
                    <div className="bg-gradient-to-r from-red-50 to-red-100/50 border-b border-red-200/50 px-3 py-2.5 flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400 shadow-sm"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-sm"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-sm"></div>
                      </div>
                      <div className="flex-1 text-center">
                        <span className="text-[10px] md:text-xs text-red-700 font-semibold tracking-wider uppercase">
                          Audit Request
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 md:p-5 space-y-4">
                      <div>
                        <h3 className="text-sm md:text-base font-semibold text-[#0c0b1d] mb-3">
                          Please provide:
                        </h3>
                        <ul className="space-y-2">
                          {[
                            'Risk Analysis',
                            'Staff Training',
                            'Security Policies',
                            'Access Logs'
                          ].map((item, index) => (
                            <motion.li
                              key={item}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: mounted ? 1 : 0, x: 0 }}
                              transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                              className="flex items-center gap-2 text-zinc-700"
                            >
                              <FileText className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                              <span className="text-xs md:text-sm font-light">{item}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>

                      {/* Status Badge */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: mounted ? 1 : 0, scale: 1 }}
                        transition={{ duration: 0.5, delay: 1.2 }}
                        className="flex items-center gap-2 bg-red-50/80 border border-red-200 rounded-lg px-3 py-2.5 backdrop-blur-sm"
                      >
                        <motion.div
                          animate={{ 
                            opacity: mounted ? [1, 0.6, 1] : 0,
                          }}
                          transition={{ 
                            duration: 2, 
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <XCircle className="w-4 h-4 text-red-600" />
                        </motion.div>
                        <span className="text-xs font-medium text-red-700">
                          Not Found
                        </span>
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Decorative Element */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: mounted ? 0.1 : 0, scale: 1 }}
                  transition={{ duration: 1, delay: 1.5 }}
                  className="absolute -top-4 -right-4 w-24 h-24 bg-red-200 rounded-full blur-3xl"
                />
              </motion.div>

              {/* RIGHT CARD - The Solution */}
              <motion.div
                initial={{ opacity: 0, x: 30, scale: 0.95 }}
                animate={{ opacity: mounted ? 1 : 0, x: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                <div className="bg-white rounded-2xl p-5 md:p-6 shadow-2xl border border-zinc-200/80 backdrop-blur-sm">
                  {/* Mockup HIPAA Hub */}
                  <div className="bg-[#f3f5f9] rounded-xl overflow-hidden border border-zinc-200/50">
                    {/* Header */}
                    <div className="bg-[#0c0b1d] px-3 py-2.5 flex items-center gap-2.5">
                      <Shield className="w-4 h-4 text-[#1ad07a]" />
                      <span className="text-white font-medium text-xs md:text-sm">HIPAA Hub</span>
                    </div>

                    {/* Content */}
                    <div className="p-4 md:p-5 space-y-4">
                      {/* Status Badge */}
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: mounted ? 1 : 0, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                        className="flex items-center gap-2 bg-[#1ad07a]/10 border border-[#1ad07a]/30 rounded-lg px-3 py-2.5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#1ad07a]" />
                        <span className="text-xs font-medium text-[#0c0b1d]">
                          Audit Ready: <span className="text-[#1ad07a] font-semibold">ACTIVE</span>
                        </span>
                      </motion.div>

                      {/* Checklist */}
                      <div className="space-y-2">
                        {[
                          { label: 'Risk Analysis', status: 'Uploaded', delay: 1.0 },
                          { label: 'Staff Training', status: 'Complete', delay: 1.2 },
                          { label: 'Security Policies', status: 'Approved', delay: 1.4 },
                          { label: 'Incident Logs', status: 'Stored', delay: 1.6 }
                        ].map((item, index) => (
                          <motion.div
                            key={item.label}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: mounted ? 1 : 0, x: 0 }}
                            transition={{ duration: 0.4, delay: item.delay }}
                            className="flex items-center justify-between bg-white rounded-lg px-3 py-2.5 border border-zinc-200/50 shadow-sm"
                          >
                            <div className="flex items-center gap-2.5">
                              <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: mounted ? 1 : 0, rotate: mounted ? 0 : -180 }}
                                transition={{ 
                                  duration: 0.4, 
                                  delay: item.delay + 0.1,
                                  type: "spring",
                                  stiffness: 200,
                                  damping: 15
                                }}
                                className="w-4 h-4 rounded-full bg-[#1ad07a] flex items-center justify-center flex-shrink-0"
                              >
                                <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                              </motion.div>
                              <span className="text-xs md:text-sm text-[#0c0b1d] font-medium">
                                {item.label}
                              </span>
                            </div>
                            <span className="text-[10px] text-zinc-500 font-light">
                              {item.status}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative Element */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: mounted ? 0.1 : 0, scale: 1 }}
                  transition={{ duration: 1, delay: 1.8 }}
                  className="absolute -bottom-4 -left-4 w-24 h-24 bg-[#1ad07a]/20 rounded-full blur-3xl"
                />
              </motion.div>

            </div>

            {/* Connecting Arrow/Line (Visual Flow) */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: mounted ? 1 : 0, scaleX: 1 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
            >
              <div className="flex items-center gap-2">
                <div className="w-16 h-px bg-gradient-to-r from-red-200 to-[#1ad07a]/30"></div>
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ArrowRight className="w-5 h-5 text-[#1ad07a]" />
                </motion.div>
                <div className="w-16 h-px bg-gradient-to-l from-[#1ad07a]/30 to-[#1ad07a]/50"></div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
