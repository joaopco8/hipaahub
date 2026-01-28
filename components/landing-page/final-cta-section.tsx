'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function FinalCTASection() {
  return (
    <section className="relative w-full bg-gradient-to-b from-[#f3f5f9] via-blue-50/30 to-[#f3f5f9] py-24 md:py-32 overflow-hidden font-extralight">
      {/* Enhanced background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[#1ad07a]/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
      </div>

      <div className="container mx-auto px-6 relative z-10 font-extralight">
        <motion.div 
          className="max-w-7xl mx-auto rounded-[3.5rem] bg-gradient-to-br from-[#0d0d1f] to-[#1a1a2e] overflow-hidden relative group shadow-2xl font-extralight"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          whileHover={{ y: -8 }}
        >
          {/* Animated background decorations */}
          <div className="absolute top-0 right-0 w-full h-full bg-[#1acb77]/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-[#1acb77]/10 transition-all duration-500" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2" />
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `linear-gradient(#1ad07a 1px, transparent 1px), linear-gradient(90deg, #1ad07a 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }} />
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center font-extralight relative z-10">
            
            {/* Left: Text Content */}
            <div className="p-12 md:p-24 space-y-10 relative z-10 text-center lg:text-left font-extralight">
              <div className="space-y-8 font-extralight">
                <motion.div 
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mx-auto lg:mx-0"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Sparkles className="w-4 h-4 text-[#1acb77]" />
                  <span className="text-sm text-white font-medium">Defend your practice</span>
                </motion.div>

                <motion.h2 
                  className="text-4xl md:text-5xl lg:text-6xl text-white leading-tight font-extralight"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  If an audit happened tomorrow,<br />
                  <span className="text-[#1acb77] font-extralight">would you pass?</span>
                </motion.h2>
                
                <motion.p 
                  className="text-xl text-white/70 font-extralight leading-relaxed max-w-xl mx-auto lg:mx-0"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  Don't guess. Don't hope. Don't improvise.<br />
                  <span className="text-white font-normal">Build your audit defense now.</span>
                </motion.p>
              </div>

              <motion.div 
                className="flex flex-col sm:flex-row items-center gap-6 font-extralight"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Link href="/signup" className="w-full sm:w-auto">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="lg"
                      className="relative bg-[#1acb77] text-[#0d0d1f] hover:bg-[#1acb77]/90 rounded-full px-12 py-8 text-xl w-full transition-all shadow-[0_0_40px_rgba(26,208,122,0.5)] group overflow-hidden font-medium"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        Secure My HIPAA Hub
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#1ad07a] to-[#15b566] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/signin" className="w-full sm:w-auto">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                  >
                    <Button
                      variant="link"
                      className="text-white/70 hover:text-[#1acb77] text-base font-light transition-colors"
                    >
                      Login to your hub →
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>

              <motion.p 
                className="text-sm text-white/50 italic font-extralight"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Annual plan. Full access. Audit-ready.
              </motion.p>
            </div>

            {/* Right: Professional Image */}
            <div className="relative h-full min-h-[400px] lg:min-h-[600px] hidden lg:block overflow-hidden font-extralight">
              <motion.div
                className="relative w-full h-full"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Image 
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000" 
                  alt="Professional healthcare management" 
                  fill
                  className="object-cover opacity-20 grayscale transition-transform duration-1000 group-hover:scale-110 group-hover:opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-[#0d0d1f] via-[#0d0d1f]/50 to-transparent" />
              </motion.div>
              
              {/* Enhanced floating element */}
              <motion.div 
                className="absolute bottom-12 right-12 bg-white p-8 rounded-3xl shadow-2xl rotate-3 border border-zinc-100 group/badge hover:rotate-0 transition-all duration-300"
                initial={{ opacity: 0, y: 30, rotate: 10 }}
                whileInView={{ opacity: 1, y: 0, rotate: 3 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5, type: "spring" }}
                whileHover={{ scale: 1.05, rotate: 0 }}
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ShieldCheck className="w-14 h-14 text-[#1acb77] mb-3" />
                </motion.div>
                <p className="text-sm font-medium text-[#0d0d1f]">100% defensible</p>
                <p className="text-xs text-zinc-500 mt-1">Audit-ready system</p>
                
                {/* Glow effect */}
                <div className="absolute -inset-2 bg-gradient-to-r from-[#1ad07a]/20 to-blue-500/20 rounded-3xl blur-lg opacity-0 group-hover/badge:opacity-100 transition-opacity -z-10" />
              </motion.div>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
