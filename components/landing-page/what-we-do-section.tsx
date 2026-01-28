'use client';

import { FileText, Archive, Users, ShieldCheck } from 'lucide-react';
import { FadeIn } from './animated-section';
import Image from 'next/image';

const features = [
  {
    icon: FileText,
    title: 'Policy Management',
    description: 'Create, store, version, and manage HIPAA policies',
    number: '01'
  },
  {
    icon: Archive,
    title: 'Evidence Tracking',
    description: 'Attach and organize proof where it belongs',
    number: '02'
  },
  {
    icon: Users,
    title: 'Role Definition',
    description: 'Clearly assign Security and Privacy responsibilities',
    number: '03'
  },
  {
    icon: ShieldCheck,
    title: 'Audit Readiness',
    description: 'Everything structured, searchable, and documented',
    number: '04'
  }
];

export default function WhatWeDoSection() {
  return (
    <section className="w-full bg-[#0c0b1d] py-24 md:py-32 font-extralight relative overflow-hidden">
      
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `linear-gradient(#1ad07a 1px, transparent 1px), linear-gradient(90deg, #1ad07a 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
      }} />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          
          <FadeIn>
            <div className="space-y-16">
              
              {/* Header */}
              <div className="text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1ad07a]/10 border border-[#1ad07a]/20">
                  <ShieldCheck className="w-4 h-4 text-[#1ad07a]" />
                  <span className="text-xs text-[#1ad07a] font-medium uppercase">Core Capabilities</span>
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl text-white font-extralight leading-tight">
                  Built for real-world HIPAA compliance.
                </h2>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                
                {/* Left Column - Image/Visual */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl">
                    <Image
                      src="/seguro-rcp-enfermeiro-1920x0-c-default_upscayl_4x_ultramix-balanced-4x.png"
                      alt="HIPAA Compliance Documentation"
                      fill
                      className="object-cover opacity-90"
                      quality={100}
                      unoptimized={true}
                      style={{ transform: 'scale(1.02)' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0b1d] via-transparent to-transparent" />
                    
                    {/* Floating badge */}
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#1ad07a] flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-xs text-zinc-500 uppercase">Compliance Status</p>
                            <p className="text-sm font-medium text-[#0c0b1d]">Audit-Ready</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trust indicator */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-sm text-white/60 font-extralight leading-relaxed">
                      Designed by compliance professionals, built for healthcare practices that need real audit defense.
                    </p>
                  </div>
                </div>

                {/* Right Column - Features */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <div
                        key={index}
                        className="group relative"
                      >
                        {/* Card */}
                        <div className="relative h-full bg-white/[0.03] hover:bg-white/[0.05] rounded-xl p-6 border border-white/10 hover:border-[#1ad07a]/30 transition-all duration-300">
                          
                          {/* Number badge */}
                          <div className="absolute top-4 right-4 text-[#1ad07a]/20 text-3xl font-extralight">
                            {feature.number}
                          </div>

                          {/* Content */}
                          <div className="relative space-y-4">
                            {/* Icon */}
                            <div className="w-12 h-12 rounded-lg bg-[#1ad07a]/10 flex items-center justify-center text-[#1ad07a] group-hover:bg-[#1ad07a]/20 transition-colors">
                              <Icon className="w-6 h-6" strokeWidth={1.5} />
                            </div>

                            {/* Text */}
                            <div className="space-y-2">
                              <h3 className="text-xl text-white font-extralight leading-tight">
                                {feature.title}
                              </h3>
                              <p className="text-sm text-white/60 font-extralight leading-relaxed">
                                {feature.description}
                              </p>
                            </div>

                            {/* Decorative line */}
                            <div className="pt-2">
                              <div className="h-[1px] w-full bg-gradient-to-r from-[#1ad07a]/20 to-transparent" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>

              {/* Bottom emphasis */}
              <div className="text-center pt-8 border-t border-white/10">
                <p className="text-base md:text-lg text-white/50 font-extralight max-w-2xl mx-auto">
                  No bloated features. No endless configuration.<br />
                  <span className="text-white/70">Just what you need to stay compliant and audit-ready.</span>
                </p>
              </div>

            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
