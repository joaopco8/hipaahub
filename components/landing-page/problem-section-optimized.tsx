'use client';

import { Folder, FileText, AlertTriangle, FileQuestion, HardDrive, Mail, X, CheckCircle2, PenTool, StickyNote } from 'lucide-react';
import { motion } from 'framer-motion';
import { FadeIn } from './animated-section';
import { TextHighlight } from './text-highlight';
import { SectionCTA } from './section-cta';

export default function ProblemSectionOptimized() {
  return (
    <section id="problem" className="w-full relative bg-gradient-to-b from-[#0c0b1d] via-[#1a1a2e] to-[#0c0b1d] py-16 md:py-20 lg:py-24 font-extralight overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 -left-64 w-[800px] h-[800px] bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-1/4 -right-64 w-[800px] h-[800px] bg-[#1ad07a]/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(#1ad07a 1px, transparent 1px), linear-gradient(90deg, #1ad07a 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          <FadeIn>
            <div className="space-y-16">
              
              {/* Main Headlines - Centered */}
              <motion.div 
                className="text-center space-y-8"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                        <motion.h2 
                          className="text-[2rem] md:text-[2.5rem] lg:text-[3.31rem] text-white font-extralight leading-tight"
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.6, delay: 0.2 }}
                        >
                          HIPAA usually isn't{' '}
                          <TextHighlight variant="semibold-italic" color="default" className="text-white">
                            broken
                          </TextHighlight>
                          .
                        </motion.h2>
                        <motion.h2 
                          className="text-[2rem] md:text-[2.5rem] lg:text-[3.31rem] text-[#1ad07a] font-extralight leading-tight"
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.6, delay: 0.3 }}
                        >
                          It's just{' '}
                          <TextHighlight variant="semibold-italic" color="green" showUnderline delay={0.5}>
                            undocumented
                          </TextHighlight>
                          .
                        </motion.h2>
                
                <motion.p 
                  className="text-xl md:text-2xl text-white/70 font-extralight leading-relaxed max-w-3xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  Most organizations don't fail HIPAA because they ignored it.<br />
                  <span className="text-white font-normal">
                    They fail because they can't{' '}
                    <TextHighlight variant="bold" color="default" className="text-white">
                      prove
                    </TextHighlight>
                    {' '}what they did.
                  </span>
                </motion.p>
              </motion.div>

              {/* Visual Story Cards */}
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {/* Card 1: The Problem */}
                <motion.div
                  className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-[#1ad07a]/30 transition-all group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                >
                  <div className="absolute top-4 right-4">
                    <AlertTriangle className="w-6 h-6 text-red-400/50" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl text-white font-extralight">The Auditor Arrives</h3>
                    <p className="text-white/70 font-extralight text-sm leading-relaxed">
                      "Where's your documentation?"
                    </p>
                    <div className="pt-4 border-t border-white/10">
                      <div className="flex items-center gap-2 text-red-400 text-xs font-extralight">
                        <X className="w-4 h-4" />
                        <span>30 minutes scrambling</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Card 2: The Note */}
                <motion.div
                  className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-[#1ad07a]/30 transition-all group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                >
                  <div className="absolute top-4 right-4">
                    <StickyNote className="w-6 h-6 text-yellow-400/50" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl text-white font-extralight">The Note</h3>
                    <p className="text-red-400 font-normal text-sm leading-relaxed italic">
                      <TextHighlight variant="bold-italic" color="red">
                        "Documentation disorganized."
                      </TextHighlight>
                    </p>
                    <div className="pt-4 border-t border-white/10">
                      <div className="flex items-center gap-2 text-yellow-400 text-xs font-extralight">
                        <PenTool className="w-4 h-4" />
                        <span>Triggers deeper audit</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Card 3: The Cost */}
                <motion.div
                  className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-[#1ad07a]/30 transition-all group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                >
                  <div className="absolute top-4 right-4">
                    <FileQuestion className="w-6 h-6 text-red-400/50" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl text-white font-extralight">The Cost</h3>
                    <p className="text-white font-normal text-lg">
                      <TextHighlight variant="bold" color="default" className="text-white">
                        $100-$50,000
                      </TextHighlight>
                    </p>
                    <p className="text-white/70 font-extralight text-sm leading-relaxed">
                      per violation
                    </p>
                    <div className="pt-4 border-t border-white/10">
                      <div className="flex items-center gap-2 text-white/50 text-xs font-extralight">
                        <span>Plus reputation & peace of mind</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Full Story - Storytelling Section */}
              <motion.div 
                className="relative max-w-4xl mx-auto bg-white/5 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/10"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-[#1ad07a]/20 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-[#1ad07a]" />
                    </div>
                    <h3 className="text-2xl md:text-3xl text-white font-extralight">
                      Here's what happens during an OCR audit:
                    </h3>
                  </div>

                  <div className="space-y-5 text-white/80 font-extralight leading-relaxed">
                    <motion.p 
                      className="text-base md:text-lg"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.7 }}
                    >
                      The auditor arrives. She asks your practice manager:{' '}
                      <TextHighlight variant="semibold-italic" color="default" className="text-white">
                        "Where's your documentation?"
                      </TextHighlight>
                    </motion.p>
                    
                    <motion.p 
                      className="text-base md:text-lg"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.8 }}
                    >
                      Your practice manager panics. She spends 30 minutes looking through Google Drive, email, old hard drives. She finds some policies, but she's not sure if they're current. She finds some training records, but they're mixed with personal files.
                    </motion.p>
                    
                    <motion.p 
                      className="text-base md:text-lg"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.9 }}
                    >
                      The auditor watches her scramble. She makes a note:{' '}
                      <TextHighlight variant="bold-italic" color="red">
                        "Documentation disorganized."
                      </TextHighlight>
                    </motion.p>
                    
                    <motion.p 
                      className="text-base md:text-lg"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 1.0 }}
                    >
                      That one note triggers a deeper audit. That deeper audit finds gaps. Those gaps become violations. Those violations become fines.
                    </motion.p>
                    
                    <motion.div 
                      className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 my-6"
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 1.1 }}
                    >
                      <p className="text-lg md:text-xl text-white font-normal">
                        The fine is{' '}
                        <TextHighlight variant="bold" color="red">
                          $100-$50,000 per violation
                        </TextHighlight>
                        .
                      </p>
                    </motion.div>
                    
                    <motion.p 
                      className="text-base md:text-lg"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 1.2 }}
                    >
                      But the real cost? Your reputation. Your patients. Your peace of mind.
                    </motion.p>
                    
                    <motion.p 
                      className="text-base md:text-lg text-[#1ad07a] font-normal"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 1.3 }}
                    >
                      All because your documentation was scattered.
                    </motion.p>
                  </div>
                </div>
              </motion.div>

              {/* Key Message - Professional Legal Statement */}
              <motion.div 
                className="relative max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 3.5 }}
              >
                <div className="relative bg-white/5 backdrop-blur-sm rounded-lg p-8 md:p-10 border border-white/20">
                  {/* Left border accent - professional legal style */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1ad07a]" />
                  
                  <div className="pl-6 space-y-4">
                    <p className="text-xl md:text-2xl lg:text-2xl text-white font-light leading-relaxed">
                      HIPAA doesn't punish{' '}
                      <TextHighlight variant="semibold-italic" color="default" className="text-white">
                        intent
                      </TextHighlight>
                      .
                    </p>
                    <p className="text-xl md:text-2xl lg:text-2xl text-[#1ad07a] font-normal leading-relaxed">
                      It punishes{' '}
                      <TextHighlight variant="bold" color="green" showUnderline delay={0.9}>
                        lack of evidence
                      </TextHighlight>
                      .
                    </p>
                  </div>
                </div>
              </motion.div>

              <SectionCTA label="Fix This Before an Auditor Arrives" href="/signup" />

            </div>
          </FadeIn>
      </div>
    </section>
  );
}
