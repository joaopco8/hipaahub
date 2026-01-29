'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, Clock, Shield, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { FadeIn } from './animated-section';
import { TextHighlight } from './text-highlight';

export default function FinalCTAOptimized() {
  return (
    <section className="relative w-full bg-gradient-to-b from-[#0c0b1d] to-[#1a1a2e] py-16 md:py-20 lg:py-24 font-extralight overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-[#1ad07a]/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          
          <FadeIn>
            <div className="space-y-12 text-center">
              
              {/* Header */}
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-[2rem] md:text-[2.5rem] lg:text-[3.31rem] text-white font-extralight leading-tight">
                  Stop stressing about{' '}
                  <TextHighlight variant="bold-italic" color="red" className="text-red-400" showUnderline delay={0.2}>
                    audits
                  </TextHighlight>
                  .<br />
                  <span className="text-[#1ad07a] font-extralight">
                    Get{' '}
                    <TextHighlight variant="bold" color="green" showUnderline delay={0.3}>
                      organized
                    </TextHighlight>
                    {' '}today.
                  </span>
                </h2>
                <p className="text-xl md:text-2xl text-white/70 font-extralight">
                  Your{' '}
                  <TextHighlight variant="bold" color="green" className="text-[#1ad07a]">
                    7-day money-back guarantee
                  </TextHighlight>
                  {' '}starts now.
                </p>
              </motion.div>

              {/* CTA Button */}
              <motion.div 
                className="flex justify-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Link href="/signup">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="lg"
                      className="bg-[#1ad07a] text-[#0c0b1d] hover:bg-[#1ad07a]/90 rounded-full px-12 py-8 text-xl shadow-[0_0_40px_rgba(26,208,122,0.5)] transition-all font-medium"
                    >
                      Start Your 2-Hour Setup
                      <ArrowRight className="ml-2 w-6 h-6" />
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>

              {/* Final Risk Reversal */}
              <motion.div 
                className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {[
                  { icon: CheckCircle2, text: '7-day money-back guarantee' },
                  { icon: Shield, text: 'Secure payment processing' },
                  { icon: Clock, text: 'Cancel anytime' },
                  { icon: Shield, text: 'Email support included' }
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={index}
                      className="flex items-center gap-3 bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10"
                      initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.4 + (index * 0.1) }}
                    >
                      <Icon className="w-5 h-5 text-[#1ad07a]" />
                      <span className="text-sm text-white/80 font-extralight">{item.text}</span>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Urgency */}
              <motion.div 
                className="pt-8"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <p className="text-lg md:text-xl text-white/60 font-extralight italic">
                  Audits{' '}
                  <TextHighlight variant="bold-italic" color="red" className="text-red-400">
                    don't wait
                  </TextHighlight>
                  . Get organized before{' '}
                  <TextHighlight variant="semibold-italic" color="default" className="text-white">
                    yours arrives
                  </TextHighlight>
                  .
                </p>
              </motion.div>

            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
