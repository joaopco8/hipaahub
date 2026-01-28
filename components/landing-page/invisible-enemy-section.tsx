'use client';

import { AlertCircle, FileX, Search, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { FadeIn } from './animated-section';

const floatingIcons = [
  { icon: FileX, position: { top: '15%', left: '10%' }, delay: 0 },
  { icon: Search, position: { top: '20%', right: '15%' }, delay: 0.2 },
  { icon: ShieldAlert, position: { bottom: '25%', left: '8%' }, delay: 0.4 },
  { icon: AlertCircle, position: { bottom: '20%', right: '12%' }, delay: 0.6 }
];

export default function InvisibleEnemySection() {
  return (
    <section className="w-full relative bg-gradient-to-br from-[#f8f9fb] via-[#f3f5f9] to-[#eef1f6] py-24 md:py-32 font-extralight overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-zinc-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-zinc-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Floating Icons */}
        {floatingIcons.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={index}
              className="absolute hidden lg:block"
              style={item.position}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 0.15, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 1, 
                delay: item.delay,
                repeat: Infinity,
                repeatType: "reverse",
                repeatDelay: 2
              }}
            >
              <Icon className="w-12 h-12 text-zinc-400" />
            </motion.div>
          );
        })}
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          
          <FadeIn>
            <div className="text-center space-y-12">
              
              {/* Animated Icon */}
              <motion.div 
                className="flex justify-center"
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  duration: 0.8 
                }}
              >
                <motion.div 
                  className="relative w-20 h-20 rounded-full bg-gradient-to-br from-zinc-300 to-zinc-200 flex items-center justify-center text-zinc-600 shadow-lg"
                  animate={{ 
                    boxShadow: [
                      "0 10px 30px rgba(0,0,0,0.1)",
                      "0 10px 50px rgba(0,0,0,0.15)",
                      "0 10px 30px rgba(0,0,0,0.1)"
                    ]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <AlertCircle className="w-10 h-10" />
                  </motion.div>
                  
                  {/* Pulse rings */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-zinc-400"
                    animate={{ 
                      scale: [1, 1.5, 1.5],
                      opacity: [0.5, 0, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeOut"
                    }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-zinc-400"
                    animate={{ 
                      scale: [1, 1.5, 1.5],
                      opacity: [0.5, 0, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      delay: 1,
                      repeat: Infinity,
                      ease: "easeOut"
                    }}
                  />
                </motion.div>
              </motion.div>

              {/* Main Content */}
              <motion.div 
                className="space-y-8"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <h2 className="text-3xl md:text-4xl lg:text-5xl text-[#0c0b1d] font-extralight leading-tight italic">
                  "It looks fine" is the most dangerous state.
                </h2>
                
                <p className="text-xl md:text-2xl text-zinc-600 font-extralight leading-relaxed max-w-3xl mx-auto">
                  The biggest compliance risk isn't what you know is wrong.<br />
                  <span className="text-[#0c0b1d] font-normal">It's what you assume is correct — without proof.</span>
                </p>
              </motion.div>

              {/* Key Message Card */}
              <motion.div 
                className="pt-8"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <motion.div 
                  className="relative inline-block px-10 py-8 bg-white rounded-2xl border-2 border-zinc-200 shadow-xl max-w-3xl overflow-hidden group"
                  whileHover={{ scale: 1.02, borderColor: "rgba(26, 208, 122, 0.3)" }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Animated gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#1ad07a]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Content */}
                  <div className="relative space-y-4">
                    <p className="text-xl md:text-2xl text-[#0c0b1d] font-extralight leading-tight">
                      If it's not documented, versioned, and traceable,
                    </p>
                    <p className="text-2xl md:text-3xl text-[#1ad07a] font-normal">
                      it doesn't exist in an audit.
                    </p>
                  </div>

                  {/* Corner accent */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-[#1ad07a]/5 rounded-bl-full" />
                  <div className="absolute bottom-0 left-0 w-20 h-20 bg-zinc-200/50 rounded-tr-full" />
                </motion.div>
              </motion.div>

            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
