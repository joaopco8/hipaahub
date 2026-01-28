'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Shield, Award, Users, Star } from 'lucide-react';

export default function SocialProofSection() {
  return (
    <section
      id="g2-awards-section"
      className="w-full relative bg-gradient-to-b from-[#f8f9fb] to-[#f3f5f9] py-24 md:py-32 font-extralight overflow-hidden"
    >
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#1ad07a]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">

            {/* Header Text */}
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1ad07a]/10 border border-[#1ad07a]/20 mb-6">
                <Shield className="w-4 h-4 text-[#1ad07a]" />
                <span className="text-xs text-[#1ad07a] font-medium uppercase">Trusted by Professionals</span>
              </div>
              <p className="text-xl md:text-2xl text-zinc-700 font-extralight max-w-3xl mx-auto">
                Trusted by healthcare professionals who refuse to gamble with compliance.
              </p>
            </motion.div>

            {/* G2 Badges Card */}
            <motion.div 
              className="relative bg-white rounded-3xl p-8 md:p-16 shadow-2xl border border-zinc-200 mb-12 overflow-hidden group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              whileHover={{ y: -8 }}
            >
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#1ad07a]/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Title */}
              <div className="relative z-10 text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Award className="w-8 h-8 text-[#1ad07a]" />
                  <h3 className="text-3xl md:text-4xl text-[#0c0b1d] font-extralight">
                    G2 Summer 2025 Awards
                  </h3>
                </div>
              </div>

              {/* Image */}
              <motion.div 
                className="relative z-10 w-full mb-8 rounded-2xl bg-gradient-to-br from-zinc-50 to-zinc-100 p-6 border border-zinc-200"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Image
                  src="/images/Sem Título-1.png"
                  alt="G2 Summer 2025 Awards - Grid Leader, High Performer, Easiest To Do Business With, Users Most Likely To Recommend, High Performer Asia"
                  width={1400}
                  height={400}
                  className="w-full h-auto object-contain"
                  priority
                  unoptimized
                />
              </motion.div>

              {/* Badges List */}
              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mt-8">
                {[
                  { name: 'Grid Leader', sub: null },
                  { name: 'High Performer', sub: null },
                  { name: 'Easiest To Do Business With', sub: 'MID-MARKET' },
                  { name: 'Users Most Likely To Recommend', sub: 'MID-MARKET' },
                  { name: 'High Performer', sub: 'SMALL BUSINESS' }
                ].map((badge, idx) => (
                  <motion.div 
                    key={idx} 
                    className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-zinc-50 to-white rounded-xl border border-zinc-200 hover:border-[#1ad07a]/30 hover:shadow-lg transition-all duration-300 group"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.4 + (idx * 0.1) }}
                    whileHover={{ y: -4, scale: 1.02 }}
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1ad07a]/10 group-hover:bg-[#1ad07a]/20 transition-colors duration-300">
                      <Star className="w-5 h-5 text-[#1ad07a]" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-zinc-800 font-light group-hover:text-[#0c0b1d] transition-colors">{badge.name}</p>
                      {badge.sub && (
                        <p className="text-xs text-zinc-500 mt-1 font-extralight">{badge.sub}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-[#1ad07a]/5 rounded-br-full" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/5 rounded-tl-full" />
            </motion.div>

            {/* Stats */}
            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <motion.div 
                className="flex items-center gap-3 px-6 py-3 rounded-full bg-white border border-zinc-200 shadow-sm hover:shadow-md hover:border-[#1ad07a]/30 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
              >
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="text-base font-light text-zinc-700">4.9/5 on Trustpilot</span>
              </motion.div>
              
              <div className="h-6 w-px bg-zinc-300 hidden sm:block" />
              
              <motion.div 
                className="flex items-center gap-3 px-6 py-3 rounded-full bg-white border border-zinc-200 shadow-sm hover:shadow-md hover:border-[#1ad07a]/30 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
              >
                <Users className="w-5 h-5 text-[#1ad07a]" />
                <span className="text-base font-light text-zinc-700">Used by 500+ clinics across the U.S.</span>
              </motion.div>
            </motion.div>

        </div>
    </section>
  );
}
