'use client';

import { useState } from 'react';
import { Shield, FileCheck, Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FadeIn, SlideIn } from './animated-section';

const services = [
  {
    id: 'risk',
    tabLabel: 'Risk assessment',
    title: 'Automated risk analysis',
    description: 'Stop using manual spreadsheets. Our NIST-aligned engine identifies vulnerabilities across your entire operation in minutes, not months.',
    benefits: [
      "150+ OCR-aligned controls",
      "Automated risk scoring (low/med/high)",
      "Actionable remediation roadmap",
      "Instant export for insurance & auditors"
    ],
    image: '/images/telas/Review Your Compliance.png'
  },
  {
    id: 'policy',
    tabLabel: 'Policy engine',
    title: 'Dynamic policy generation',
    description: 'Legally-unique documents that adapt to your practice. Not just templates, but live policies that reflect your actual controls and evidence.',
    benefits: [
      "9 mandatory HIPAA master policies",
      "Evidence-injection technology",
      "Version control & audit history",
      "One-click staff distribution"
    ],
    image: 'https://images.unsplash.com/photo-1586772002130-b0f3daa6288b?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'audit',
    tabLabel: 'Audit defense',
    title: 'Institutional defensibility',
    description: 'Built for the moment an auditor knocks. Every action, attestation, and document is timestamped and ready for federal inspection.',
    benefits: [
      "Encrypted evidence vault",
      "Immutable activity logs",
      "IP-tracked attestations",
      "Complete audit-package export"
    ],
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=1000'
  }
];

export default function ServicesSection() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="w-full relative bg-gradient-to-b from-[#f3f5f9] via-blue-50/30 to-[#f3f5f9] py-24 md:py-32 overflow-hidden">
      {/* Enhanced background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-[600px] h-[600px] bg-[#1ad07a]/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-1/4 -right-48 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-7xl mx-auto space-y-20">
          
          {/* Header & Tabs Selection */}
          <FadeIn>
            <div className="flex flex-col items-center space-y-12">
              <div className="text-center space-y-4 max-w-3xl">
                <h2 className="text-sm font-medium text-[#1acb77]">The platform</h2>
                <h3 className="text-4xl md:text-6xl font-extralight text-[#0d0d1f]">
                  Complete compliance <br /> management
                </h3>
              </div>

              {/* Enhanced Tabs */}
              <motion.div 
                className="flex flex-wrap justify-center gap-3 p-2 bg-white/80 backdrop-blur-sm rounded-full border border-zinc-200 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {services.map((service, idx) => (
                  <motion.button
                    key={service.id}
                    onClick={() => setActiveTab(idx)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "relative px-8 py-4 rounded-full font-medium transition-all duration-300 text-sm md:text-base",
                      activeTab === idx 
                        ? "bg-[#0d0d1f] text-white shadow-xl border border-[#0d0d1f] scale-105" 
                        : "text-zinc-500 hover:text-[#0d0d1f] hover:bg-zinc-50"
                    )}
                  >
                    {service.tabLabel}
                    {activeTab === idx && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-[#0d0d1f] rounded-full -z-10"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.button>
                ))}
              </motion.div>
            </div>
          </FadeIn>

          {/* Content Block (2 Columns) */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text Content */}
            <SlideIn direction="left" delay={0.2}>
              <motion.div 
                key={activeTab}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-10"
              >
                <div className="space-y-6">
                  <h4 className="text-3xl md:text-5xl font-extralight text-[#0d0d1f] leading-tight">
                    {services[activeTab].title}
                  </h4>
                  <p className="text-xl text-zinc-600 font-light leading-relaxed">
                    {services[activeTab].description}
                  </p>
                </div>

                <div className="space-y-4">
                  <p className="font-medium text-[#0d0d1f] text-xs">Core capabilities:</p>
                  <div className="grid gap-4">
                    {services[activeTab].benefits.map((benefit, i) => (
                      <motion.div 
                        key={i} 
                        className="flex items-center gap-4 group"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.1 }}
                      >
                        <motion.div 
                          className="w-6 h-6 rounded-full bg-[#1acb77]/10 flex items-center justify-center group-hover:bg-[#1acb77] group-hover:scale-110 transition-all duration-300"
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          <CheckCircle2 className="w-4 h-4 text-[#1acb77] group-hover:text-white" />
                        </motion.div>
                        <span className="text-zinc-700 font-light group-hover:text-[#0d0d1f] transition-colors">{benefit}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="pt-6">
                  <Link href="/signup">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button className="relative bg-[#1acb77] text-[#0d0d1f] hover:bg-[#1acb77]/90 font-medium rounded-full px-10 py-7 text-lg transition-all shadow-lg hover:shadow-xl group overflow-hidden">
                        <span className="relative z-10 flex items-center gap-2">
                          Explore solution
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-[#1ad07a] to-[#15b566] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Button>
                    </motion.div>
                  </Link>
                </div>
              </motion.div>
            </SlideIn>

            {/* Right: Large Image */}
            <SlideIn direction="right" delay={0.3}>
              <motion.div 
                key={`image-${activeTab}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="relative aspect-square md:aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white bg-[#0d0d1f]/5 group">
                  <Image 
                    src={services[activeTab].image}
                    alt={services[activeTab].title}
                    fill
                    quality={100}
                    unoptimized={true}
                    className="object-contain group-hover:scale-105 transition-transform duration-500"
                    style={{ transform: 'scale(1.02)' }}
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d1f]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                
                {/* Enhanced Trust Badge */}
                <motion.div 
                  className="absolute -bottom-8 -left-8 bg-white p-6 rounded-3xl shadow-2xl border border-zinc-100 hidden md:block max-w-[240px] group hover:shadow-xl hover:border-[#1ad07a]/30 transition-all duration-300"
                  initial={{ opacity: 0, y: 20, x: -20 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <motion.div 
                      className="w-10 h-10 rounded-xl bg-[#1acb77]/10 flex items-center justify-center group-hover:bg-[#1acb77]/20 transition-colors"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Lock className="w-5 h-5 text-[#1acb77]" />
                    </motion.div>
                    <span className="font-medium text-[10px] text-zinc-400">Security standard</span>
                  </div>
                  <p className="text-sm font-light text-[#0d0d1f]">Verified military-grade encryption & storage.</p>
                  
                  {/* Glow effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#1ad07a]/20 to-blue-500/20 rounded-3xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
                </motion.div>
              </motion.div>
            </SlideIn>
          </div>
        </div>
      </div>
    </section>
  );
}
