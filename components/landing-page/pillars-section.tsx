'use client';

import { Shield, FileCheck, Lock, Users, Zap, Search, ArrowRight, Check, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { FadeIn, SlideIn } from './animated-section';

const tools = [
  {
    icon: Search,
    title: "Risk assessment",
    benefits: ["NIST SP 800-66 alignment", "Automated threat mapping", "Prioritized action items"],
    color: "bg-[#1acb77]/10 text-[#1acb77]"
  },
  {
    icon: FileCheck,
    title: "Policy engine",
    benefits: ["Dynamic content injection", "Legal version control", "Staff distribution system"],
    color: "bg-[#1acb77]/10 text-[#1acb77]"
  },
  {
    icon: Lock,
    title: "Evidence vault",
    benefits: ["AES-256 encryption", "Immutable activity logs", "Automatic retention rules"],
    color: "bg-zinc-100 text-[#0d0d1f]"
  },
  {
    icon: Users,
    title: "Staff training",
    benefits: ["Annual certification tracking", "Automated quiz engine", "Legal attestations"],
    color: "bg-[#1acb77]/10 text-[#1acb77]"
  },
  {
    icon: Zap,
    title: "Audit defense",
    benefits: ["One-click package export", "Defensibility scoring", "Real-time posture tracking"],
    color: "bg-red-50 text-red-600"
  },
  {
    icon: Shield,
    title: "Incident manager",
    benefits: ["Breach scoring engine", "Notification letter generation", "Actionable response logs"],
    color: "bg-[#0d0d1f]/10 text-[#0d0d1f]"
  }
];

export default function PillarsSection() {
  return (
    <section id="features" className="w-full relative bg-white py-24 md:py-32 font-extralight overflow-hidden" key="pillars-section-v2">
      {/* Enhanced background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-1/4 -left-64 w-[700px] h-[700px] bg-[#1ad07a]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-64 w-[700px] h-[700px] bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 font-extralight relative z-10">
        <div className="max-w-7xl mx-auto space-y-24 font-extralight">
          
          {/* Header */}
          <FadeIn>
            <div className="text-center space-y-8 max-w-4xl mx-auto font-extralight">
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1ad07a]/10 border border-[#1ad07a]/20"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
              >
                <Shield className="w-4 h-4 text-[#1ad07a]" />
                <span className="text-xs text-[#1ad07a] font-medium uppercase">Complete Toolset</span>
              </motion.div>

              <motion.h2 
                className="text-4xl md:text-5xl lg:text-6xl text-[#0c0b1d] font-extralight leading-tight"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                HIPAA compliance is not about answers.<br />
                <span className="text-[#1acb77] font-extralight">It's about defense.</span>
              </motion.h2>

              <motion.p 
                className="text-xl md:text-2xl text-zinc-600 font-extralight"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                HIPAA Hub is built for:
              </motion.p>

              <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto font-extralight">
                {['OCR audits', 'Insurance reviews', 'Legal discovery', 'Breach investigations'].map((item, idx) => (
                  <motion.div 
                    key={idx} 
                    className="flex items-center gap-3 text-lg text-zinc-700 font-extralight p-4 rounded-xl bg-white shadow-sm border border-zinc-100 hover:border-[#1ad07a]/30 hover:shadow-md transition-all group"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 + (idx * 0.1) }}
                    whileHover={{ y: -4 }}
                  >
                    <motion.div 
                      className="w-8 h-8 rounded-full bg-[#1ad07a]/10 flex items-center justify-center group-hover:bg-[#1ad07a]/20 transition-colors"
                      whileHover={{ scale: 1.1, rotate: 180 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Sparkles className="w-4 h-4 text-[#1ad07a]" />
                    </motion.div>
                    <span className="font-light group-hover:text-[#0c0b1d] transition-colors">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Tools Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 font-extralight">
            {tools.map((tool, idx) => (
              <motion.div
                key={idx}
                className="relative bg-gradient-to-br from-[#f3f5f9] to-white rounded-[2.5rem] p-10 space-y-8 border border-zinc-100 hover:border-[#1ad07a]/30 hover:shadow-2xl transition-all duration-500 group font-extralight overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                whileHover={{ y: -12 }}
              >
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#1ad07a]/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Corner decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#1ad07a]/5 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <motion.div 
                  className={cn("relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center", tool.color)}
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <tool.icon className="w-8 h-8" />
                </motion.div>
                
                <div className="relative z-10 space-y-6 font-extralight">
                  <h4 className="text-2xl font-extralight text-[#0d0d1f] group-hover:text-[#1ad07a] transition-colors">{tool.title}</h4>
                  <ul className="space-y-3 font-extralight">
                    {tool.benefits.map((benefit, i) => (
                      <motion.li 
                        key={i} 
                        className="flex items-center gap-3 text-sm text-zinc-600 font-extralight group-hover:text-zinc-700 transition-colors"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: idx * 0.1 + i * 0.05 }}
                      >
                        <motion.div
                          className="w-5 h-5 rounded-full bg-[#1ad07a]/10 flex items-center justify-center group-hover:bg-[#1ad07a]/20 transition-colors"
                          whileHover={{ scale: 1.2, rotate: 360 }}
                          transition={{ duration: 0.4 }}
                        >
                          <Check className="w-3 h-3 text-[#1ad07a]" />
                        </motion.div>
                        {benefit}
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div className="relative z-10 pt-4 font-extralight">
                  <Link href="/signup" className="inline-flex items-center gap-2 text-sm text-[#0d0d1f] hover:text-[#1ad07a] transition-colors group/link font-light">
                    Learn more
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-2" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
