'use client';

import { X, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { FadeIn } from './animated-section';

const beforeItems = [
  'Scattered files',
  'Unclear roles',
  'No audit trail',
  'Compliance based on assumptions'
];

const afterItems = [
  'Centralized documentation',
  'Version control and approvals',
  'Clear evidence tracking',
  'Compliance you can demonstrate'
];

export default function BridgeSection() {
  return (
    <section className="w-full relative bg-gradient-to-b from-[#f3f5f9] to-white py-24 md:py-32 font-extralight overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-[#1ad07a]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          
          <FadeIn>
            <div className="space-y-16">
              
              {/* Title */}
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl md:text-4xl lg:text-5xl text-[#0c0b1d] font-extralight leading-tight">
                  From uncertainty to provable compliance.
                </h2>
              </motion.div>

              {/* Before / After Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 relative">
                
                {/* Arrow indicator between columns (desktop only) */}
                <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                  <motion.div 
                    className="w-16 h-16 rounded-full bg-white border-2 border-[#1ad07a] flex items-center justify-center shadow-lg"
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ 
                      duration: 0.8, 
                      delay: 0.5,
                      type: "spring",
                      stiffness: 200
                    }}
                  >
                    <ArrowRight className="w-8 h-8 text-[#1ad07a]" />
                  </motion.div>
                </div>
                
                {/* Before Column */}
                <motion.div 
                  className="relative group"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="absolute -inset-4 bg-zinc-400/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative bg-white rounded-2xl border border-zinc-200 p-8 md:p-10 space-y-6 shadow-sm hover:shadow-xl transition-all duration-500">
                    <div className="pb-4 border-b border-zinc-300">
                      <h3 className="text-xl md:text-2xl text-zinc-600 font-extralight uppercase">
                        Before
                      </h3>
                    </div>
                    <div className="space-y-4">
                      {beforeItems.map((item, index) => (
                        <motion.div 
                          key={index} 
                          className="flex items-start gap-3 opacity-70 hover:opacity-100 transition-opacity duration-300"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 0.7, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: 0.3 + (index * 0.1) }}
                        >
                          <div className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5">
                            <X className="w-full h-full" />
                          </div>
                          <p className="text-base md:text-lg text-zinc-700 font-extralight">
                            {item}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* After Column */}
                <motion.div 
                  className="relative group"
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="absolute -inset-4 bg-[#1ad07a]/20 rounded-3xl blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative bg-gradient-to-br from-white to-[#1ad07a]/5 rounded-2xl border-2 border-[#1ad07a]/30 p-8 md:p-10 space-y-6 shadow-lg hover:shadow-2xl hover:border-[#1ad07a]/50 transition-all duration-500">
                    <div className="pb-4 border-b border-[#1ad07a]">
                      <h3 className="text-xl md:text-2xl text-[#0c0b1d] font-extralight uppercase">
                        After
                        <span className="block text-lg normal-case text-[#1ad07a] mt-1 font-normal">(HIPAA Hub)</span>
                      </h3>
                    </div>
                    <div className="space-y-4">
                      {afterItems.map((item, index) => (
                        <motion.div 
                          key={index} 
                          className="flex items-start gap-3 group/item"
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: 0.3 + (index * 0.1) }}
                        >
                          <motion.div 
                            className="w-5 h-5 text-[#1ad07a] shrink-0 mt-0.5"
                            whileHover={{ scale: 1.2, rotate: 360 }}
                            transition={{ duration: 0.5 }}
                          >
                            <CheckCircle2 className="w-full h-full drop-shadow-sm" />
                          </motion.div>
                          <p className="text-base md:text-lg text-zinc-700 font-extralight group-hover/item:text-[#0c0b1d] transition-colors duration-300">
                            {item}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>

              </div>

              {/* Key Phrase */}
              <motion.div 
                className="pt-8 text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <motion.div 
                  className="relative inline-block px-8 py-6 bg-white rounded-2xl border border-zinc-200 shadow-lg max-w-3xl overflow-hidden group"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#1ad07a]/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <p className="relative text-xl md:text-2xl text-[#0c0b1d] font-extralight leading-tight">
                    HIPAA Hub doesn't make you compliant.<br />
                    <span className="text-[#1ad07a] font-normal">It makes your compliance provable.</span>
                  </p>
                </motion.div>
              </motion.div>

            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
