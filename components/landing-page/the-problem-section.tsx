'use client';

import { Folder, FileText, AlertTriangle, FileQuestion, HardDrive, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { FadeIn } from './animated-section';

const problems = [
  {
    icon: Folder,
    text: 'Policies spread across drives, emails, and old PDFs'
  },
  {
    icon: FileText,
    text: 'No clear version control or approval history'
  },
  {
    icon: AlertTriangle,
    text: 'Roles defined "informally"'
  },
  {
    icon: FileQuestion,
    text: 'Evidence exists — but no one knows where'
  },
  {
    icon: AlertTriangle,
    text: 'Compliance based on memory, not structure'
  }
];

// Scattered documents visual representation
const scatteredDocs = [
  { icon: FileText, position: { top: '10%', left: '5%' }, rotation: -12, delay: 0 },
  { icon: Folder, position: { top: '5%', right: '10%' }, rotation: 8, delay: 0.1 },
  { icon: Mail, position: { bottom: '15%', left: '8%' }, rotation: 15, delay: 0.2 },
  { icon: HardDrive, position: { bottom: '10%', right: '5%' }, rotation: -8, delay: 0.3 },
  { icon: FileQuestion, position: { top: '40%', left: '2%' }, rotation: 20, delay: 0.4 },
  { icon: FileText, position: { top: '45%', right: '3%' }, rotation: -15, delay: 0.5 }
];

export default function TheProblemSection() {
  return (
    <section className="w-full relative bg-white py-24 md:py-32 font-extralight overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-1/3 -left-32 w-64 h-64 bg-zinc-200 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -right-32 w-64 h-64 bg-zinc-200 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          
          <FadeIn>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              
              {/* Left Side - Content */}
              <motion.div 
                className="space-y-8 font-extralight"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="space-y-6">
                  <motion.h2 
                    className="text-3xl md:text-4xl lg:text-5xl text-[#0c0b1d] font-extralight leading-tight"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    HIPAA usually isn't broken.<br />
                    <span className="text-zinc-600 font-extralight">It's just undocumented.</span>
                  </motion.h2>
                  
                  <motion.p 
                    className="text-lg md:text-xl text-zinc-600 font-extralight leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    Most organizations don't fail HIPAA because they ignored it.<br />
                    <span className="text-[#0c0b1d] font-normal">They fail because they can't prove what they did.</span>
                  </motion.p>
                </div>

                {/* Problems List with staggered animation */}
                <div className="space-y-4 pt-4">
                  {problems.map((problem, index) => {
                    const Icon = problem.icon;
                    return (
                      <motion.div 
                        key={index} 
                        className="flex items-start gap-4 group"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.4 + (index * 0.1) }}
                      >
                        <motion.div 
                          className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5 group-hover:text-zinc-600 transition-colors duration-300"
                          whileHover={{ scale: 1.2, rotate: 10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Icon className="w-full h-full" />
                        </motion.div>
                        <p className="text-base md:text-lg text-zinc-700 font-extralight leading-relaxed group-hover:text-[#0c0b1d] transition-colors duration-300">
                          {problem.text}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Right Side - Visual Representation of Scattered Documents */}
              <motion.div 
                className="relative h-[500px] lg:h-[600px]"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {/* Main message card */}
                <motion.div 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-full max-w-md"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.8, 
                    delay: 0.6,
                    type: "spring",
                    stiffness: 200
                  }}
                >
                  <div className="relative bg-white rounded-2xl p-8 md:p-10 border-2 border-zinc-200 shadow-2xl">
                    {/* Glow effect */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-zinc-200/50 via-[#1ad07a]/20 to-zinc-200/50 rounded-3xl blur-2xl opacity-50" />
                    
                    {/* Content */}
                    <div className="relative space-y-4">
                      <p className="text-xl md:text-2xl lg:text-3xl text-[#0c0b1d] font-extralight leading-tight">
                        HIPAA doesn't punish intent.
                      </p>
                      <p className="text-xl md:text-2xl lg:text-3xl text-zinc-600 font-extralight leading-tight">
                        It punishes <span className="text-[#0c0b1d] font-normal border-b-2 border-[#1ad07a]">lack of evidence</span>.
                      </p>
                    </div>

                    {/* Corner accents */}
                    <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-[#1ad07a] rounded-tl-lg" />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-[#1ad07a] rounded-br-lg" />
                  </div>
                </motion.div>

                {/* Scattered floating documents */}
                {scatteredDocs.map((doc, index) => {
                  const Icon = doc.icon;
                  return (
                    <motion.div
                      key={index}
                      className="absolute hidden lg:block"
                      style={doc.position}
                      initial={{ opacity: 0, scale: 0, rotate: 0 }}
                      whileInView={{ 
                        opacity: 0.15, 
                        scale: 1, 
                        rotate: doc.rotation 
                      }}
                      viewport={{ once: true }}
                      transition={{ 
                        duration: 0.8, 
                        delay: doc.delay,
                        type: "spring",
                        stiffness: 100
                      }}
                      animate={{
                        y: [0, -10, 0],
                        rotate: [doc.rotation, doc.rotation + 5, doc.rotation]
                      }}
                      transition={{
                        y: {
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: doc.delay
                        },
                        rotate: {
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: doc.delay
                        }
                      }}
                    >
                      <div className="p-4 bg-white rounded-lg shadow-lg border border-zinc-200">
                        <Icon className="w-8 h-8 text-zinc-400" />
                      </div>
                    </motion.div>
                  );
                })}

                {/* Question marks floating around */}
                <motion.div
                  className="absolute top-1/4 right-1/4 text-6xl text-zinc-200 font-extralight hidden lg:block"
                  animate={{ 
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  ?
                </motion.div>
                <motion.div
                  className="absolute bottom-1/3 left-1/4 text-5xl text-zinc-200 font-extralight hidden lg:block"
                  animate={{ 
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 3,
                    delay: 1,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  ?
                </motion.div>
              </motion.div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
