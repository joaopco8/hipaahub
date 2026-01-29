'use client';

import { X, AlertCircle, FileText, DollarSign, BookOpen, Grid3x3, Layers, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { FadeIn } from './animated-section';
import { SectionCTA } from './section-cta';
import { cn } from '@/lib/utils';

const frustrationStories = [
  {
    icon: DollarSign,
    title: 'Hiring a Consultant',
    story: 'You hired a HIPAA consultant. He charged $2,000-5,000. He spent a few weeks gathering your documentation. He created a binder of policies. He handed it to you. You felt organized for a few months. But then things changed. You hired a new employee. You updated a policy. You changed your EHR. And suddenly, the binder was outdated again. You were back to square one. And you were out $5,000.',
    cost: '$5,000',
    visual: 'binder'
  },
  {
    icon: FileText,
    title: 'Using Generic Compliance Software',
    story: 'You tried a compliance software. It promised to do everything: risk assessments, policy generation, training management, breach notification. But it was so complex that you only used 10% of it. You spent hours learning the system. You uploaded your policies. But you never figured out how to use the evidence vault. You never set up the training module. It was powerful, but it was also overkill. And it cost $2,000-5,000 per year.',
    cost: '$2,000-5,000/year',
    visual: 'software'
  },
  {
    icon: AlertCircle,
    title: 'DIY with Spreadsheets',
    story: 'You decided to do it yourself with spreadsheets. You created a spreadsheet of policies. Another spreadsheet of evidence. Another spreadsheet of training records. Now you have 10 spreadsheets and you can\'t find anything. When an auditor asks for documentation, you\'re back to square one: scrambling through files.',
    cost: 'Time wasted',
    visual: 'spreadsheets'
  }
];

export default function FrustrationSection() {
  return (
    <section className="w-full relative bg-gradient-to-b from-[#0c0b1d] via-[#1a1a2e] to-[#0c0b1d] py-8 md:py-12 lg:py-16 font-extralight overflow-hidden">
      {/* Animated Background - Themed Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <motion.div
          className="absolute top-1/4 -left-64 w-[800px] h-[800px] bg-red-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-64 w-[800px] h-[800px] bg-yellow-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />

        {/* Floating Binder/Documents (for Consultant) */}
        <div className="absolute left-[10%] top-[20%] hidden lg:block">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute w-16 h-20 bg-white/5 backdrop-blur-sm border border-white/10 rounded-sm"
              style={{
                left: `${i * 8}px`,
                top: `${i * 6}px`,
                rotate: `${-15 + i * 10}deg`,
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [`${-15 + i * 10}deg`, `${-10 + i * 10}deg`, `${-15 + i * 10}deg`],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.5,
              }}
            />
          ))}
        </div>

        {/* Floating Software UI Elements (for Software) */}
        <div className="absolute right-[15%] top-[30%] hidden lg:block">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute w-12 h-12 bg-white/5 backdrop-blur-sm border border-white/10 rounded"
              style={{
                left: `${i * 14}px`,
                top: `${i * 8}px`,
              }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.3,
              }}
            />
          ))}
        </div>

        {/* Floating Spreadsheet Grid (for Spreadsheets) */}
        <div className="absolute left-[50%] bottom-[25%] hidden lg:block">
          <motion.div
            className="w-32 h-32 bg-white/5 backdrop-blur-sm border border-white/10 rounded"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '16px 16px',
            }}
            animate={{
              scale: [1, 1.05, 1],
              rotate: [0, 2, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

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
              
              {/* Header */}
              <motion.div 
                className="text-center space-y-6 relative z-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <motion.h2 
                  className="text-[2rem] md:text-[2.5rem] lg:text-[3.31rem] text-white font-extralight leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  You've probably tried everything.<br />
                  <span className="text-white/70 font-extralight">And nothing worked.</span>
                </motion.h2>
                <motion.p 
                  className="text-xl md:text-2xl text-white/60 font-extralight"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  Here's why.
                </motion.p>
              </motion.div>

              {/* Frustration Stories */}
              <div className="grid md:grid-cols-3 gap-6 md:gap-8 relative z-10">
                {frustrationStories.map((story, index) => {
                  const Icon = story.icon;
                  return (
                    <motion.div
                      key={index}
                      className="relative group"
                      initial={{ opacity: 0, y: 50, scale: 0.9 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ 
                        duration: 0.8, 
                        delay: index * 0.15,
                        type: 'spring',
                        stiffness: 100
                      }}
                      whileHover={{ y: -8, scale: 1.02 }}
                    >
                      {/* Glassmorphism Card */}
                      <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/10 shadow-2xl hover:border-white/20 transition-all duration-500 overflow-hidden">
                        {/* Animated background gradient */}
                        <motion.div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          style={{
                            background: index === 0 
                              ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, transparent 50%)'
                              : index === 1
                              ? 'linear-gradient(135deg, rgba(234, 179, 8, 0.1) 0%, transparent 50%)'
                              : 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, transparent 50%)'
                          }}
                        />

                        {/* Cost Badge */}
                        <motion.div
                          className="absolute top-4 right-4"
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: index * 0.15 + 0.3 }}
                        >
                          <div className="px-3 py-1.5 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-full">
                            <span className="text-xs font-semibold text-red-400">{story.cost}</span>
                          </div>
                        </motion.div>

                        {/* Icon with animated background */}
                        <motion.div
                          className="relative w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300"
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: index * 0.15 + 0.2, type: 'spring' }}
                        >
                          <Icon className="w-7 h-7 text-white/90" />
                          <motion.div
                            className="absolute inset-0 rounded-xl bg-white/10"
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.5, 0, 0.5],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: 'easeInOut',
                            }}
                          />
                        </motion.div>

                        {/* Title */}
                        <h3 className="text-xl md:text-2xl font-semibold text-white mb-4 relative z-10">
                          {story.title}
                        </h3>

                        {/* Story */}
                        <p className="text-sm md:text-base text-white/70 font-extralight leading-relaxed relative z-10">
                          {story.story}
                        </p>

                        {/* Decorative elements based on visual type */}
                        {story.visual === 'binder' && (
                          <div className="absolute bottom-0 right-0 w-24 h-24 opacity-5 pointer-events-none">
                            <BookOpen className="w-full h-full text-white" />
                          </div>
                        )}
                        {story.visual === 'software' && (
                          <div className="absolute bottom-0 right-0 w-24 h-24 opacity-5 pointer-events-none">
                            <Layers className="w-full h-full text-white" />
                          </div>
                        )}
                        {story.visual === 'spreadsheets' && (
                          <div className="absolute bottom-0 right-0 w-24 h-24 opacity-5 pointer-events-none">
                            <Grid3x3 className="w-full h-full text-white" />
                          </div>
                        )}
                      </div>

                      {/* Glow effect on hover */}
                      <motion.div
                        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl -z-10 transition-opacity duration-500"
                        style={{
                          background: index === 0 
                            ? 'radial-gradient(circle, rgba(239, 68, 68, 0.3) 0%, transparent 70%)'
                            : index === 1
                            ? 'radial-gradient(circle, rgba(234, 179, 8, 0.3) 0%, transparent 70%)'
                            : 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)'
                        }}
                      />
                    </motion.div>
                  );
                })}
              </div>

              {/* Key Message - Glassmorphism Highlight */}
              <motion.div 
                className="relative max-w-4xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl overflow-hidden">
                  {/* Animated background gradient */}
                  <motion.div
                    className="absolute inset-0 opacity-30"
                    style={{
                      background: 'linear-gradient(135deg, rgba(26, 208, 122, 0.1) 0%, rgba(12, 11, 29, 0.2) 50%, rgba(26, 208, 122, 0.1) 100%)',
                    }}
                    animate={{
                      backgroundPosition: ['0% 0%', '100% 100%'],
                    }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />

                  {/* Left border accent */}
                  <motion.div
                    className="absolute left-0 top-0 bottom-0 w-1 bg-[#1ad07a]"
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                  />

                  <div className="space-y-4 md:space-y-6 relative z-10 pl-6">
                    <motion.p 
                      className="text-xl md:text-2xl text-white font-extralight leading-tight"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.8 }}
                    >
                      The problem with all of these solutions: They don't address the real problem.
                    </motion.p>
                    <motion.p 
                      className="text-lg md:text-xl text-white/70 font-extralight leading-relaxed"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.9 }}
                    >
                      The real problem isn't that you don't have policies. You probably do.
                    </motion.p>
                    <motion.p 
                      className="text-lg md:text-xl text-white font-normal leading-relaxed"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 1.0 }}
                    >
                      The real problem is: You can't find them quickly. You can't prove they're current. You can't show an auditor that you're organized.
                    </motion.p>
                    <motion.p 
                      className="text-lg md:text-xl text-[#1ad07a] font-normal leading-relaxed flex items-center gap-2"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 1.1 }}
                    >
                      <TrendingDown className="w-5 h-5" />
                      That's the real problem.
                    </motion.p>
                  </div>

                  {/* Decorative corner elements */}
                  <motion.div
                    className="absolute top-0 right-0 w-32 h-32 bg-[#1ad07a]/5 rounded-bl-full"
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 1.2 }}
                  />
                </div>
              </motion.div>

              <SectionCTA label="Stop the Chaos — Get Organized Now" href="/signup" />

            </div>
          </FadeIn>
      </div>
    </section>
  );
}
