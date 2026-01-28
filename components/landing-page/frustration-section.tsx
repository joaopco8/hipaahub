'use client';

import { X, AlertCircle, FileText, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { FadeIn } from './animated-section';
import { SectionCTA } from './section-cta';

const frustrationStories = [
  {
    icon: DollarSign,
    title: 'Hiring a Consultant',
    story: 'You hired a HIPAA consultant. He charged $2,000-5,000. He spent a few weeks gathering your documentation. He created a binder of policies. He handed it to you. You felt organized for a few months. But then things changed. You hired a new employee. You updated a policy. You changed your EHR. And suddenly, the binder was outdated again. You were back to square one. And you were out $5,000.'
  },
  {
    icon: FileText,
    title: 'Using Generic Compliance Software',
    story: 'You tried a compliance software. It promised to do everything: risk assessments, policy generation, training management, breach notification. But it was so complex that you only used 10% of it. You spent hours learning the system. You uploaded your policies. But you never figured out how to use the evidence vault. You never set up the training module. It was powerful, but it was also overkill. And it cost $2,000-5,000 per year.'
  },
  {
    icon: AlertCircle,
    title: 'DIY with Spreadsheets',
    story: 'You decided to do it yourself with spreadsheets. You created a spreadsheet of policies. Another spreadsheet of evidence. Another spreadsheet of training records. Now you have 10 spreadsheets and you can\'t find anything. When an auditor asks for documentation, you\'re back to square one: scrambling through files.'
  }
];

export default function FrustrationSection() {
  return (
    <section className="w-full relative bg-gradient-to-b from-white via-zinc-50 to-white py-24 md:py-32 font-extralight overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-zinc-200 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-zinc-200 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          <FadeIn>
            <div className="space-y-16">
              
              {/* Header */}
              <motion.div 
                className="text-center space-y-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-[2rem] md:text-[2.5rem] lg:text-[3.31rem] text-[#0c0b1d] font-extralight leading-tight">
                  You've probably tried everything.<br />
                  <span className="text-zinc-600 font-extralight">And nothing worked.</span>
                </h2>
                <p className="text-xl md:text-2xl text-zinc-600 font-extralight">
                  Here's why.
                </p>
              </motion.div>

              {/* Frustration Stories */}
              <div className="grid md:grid-cols-3 gap-8">
                {frustrationStories.map((story, index) => {
                  const Icon = story.icon;
                  return (
                    <motion.div
                      key={index}
                      className="relative bg-white rounded-2xl p-8 border border-zinc-200 shadow-sm hover:shadow-lg transition-all duration-300 group"
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      whileHover={{ y: -4 }}
                    >
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600 mb-6 group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6" />
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-semibold text-[#0c0b1d] mb-4">
                        {story.title}
                      </h3>

                      {/* Story */}
                      <p className="text-base text-zinc-600 font-extralight leading-relaxed">
                        {story.story}
                      </p>
                    </motion.div>
                  );
                })}
              </div>

              {/* Key Message */}
              <motion.div 
                className="relative bg-white rounded-2xl p-8 md:p-12 border-2 border-zinc-200 shadow-xl max-w-4xl mx-auto"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="space-y-4">
                  <p className="text-xl md:text-2xl text-[#0c0b1d] font-extralight leading-tight">
                    The problem with all of these solutions: They don't address the real problem.
                  </p>
                  <p className="text-lg md:text-xl text-zinc-600 font-extralight leading-relaxed">
                    The real problem isn't that you don't have policies. You probably do.
                  </p>
                  <p className="text-lg md:text-xl text-[#0c0b1d] font-normal leading-relaxed">
                    The real problem is: You can't find them quickly. You can't prove they're current. You can't show an auditor that you're organized.
                  </p>
                  <p className="text-lg md:text-xl text-[#1ad07a] font-normal leading-relaxed">
                    That's the real problem.
                  </p>
                </div>
              </motion.div>

              <SectionCTA label="Stop the Chaos — Get Organized Now" href="/signup" />

            </div>
          </FadeIn>
      </div>
    </section>
  );
}
