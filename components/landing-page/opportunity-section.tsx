'use client';

import { CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { FadeIn } from './animated-section';
import { TextHighlight } from './text-highlight';
import { SectionCTA } from './section-cta';

const opportunities = [
  {
    icon: Clock,
    text: 'Show an auditor your documentation in 5 minutes instead of 30 minutes'
  },
  {
    icon: ShieldCheck,
    text: 'Be audit-ready in 2 hours instead of 2 weeks'
  },
  {
    icon: CheckCircle2,
    text: 'Take all your scattered documentation and put it in one place'
  }
];

export default function OpportunitySection() {
  return (
    <section className="w-full relative bg-gradient-to-b from-[#f3f5f9] via-white to-[#f3f5f9] py-24 md:py-32 font-extralight overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-[#1ad07a]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          <FadeIn>
            <div className="space-y-16">
              
              {/* Header */}
              <motion.div 
                className="text-center space-y-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-[2rem] md:text-[2.5rem] lg:text-[3.31rem] text-[#0c0b1d] font-extralight leading-tight">
                  What if there was a{' '}
                  <TextHighlight variant="semibold-italic" color="default" showUnderline delay={0.3}>
                    simple way
                  </TextHighlight>
                  {' '}to get organized?
                </h2>
                
                <div className="space-y-6 max-w-3xl mx-auto">
                  <motion.p 
                    className="text-xl md:text-2xl text-zinc-600 font-extralight leading-relaxed"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    What if you could take all your{' '}
                    <TextHighlight variant="semibold" color="default">
                      scattered documentation
                    </TextHighlight>
                    {' '}and put it in one place?
                  </motion.p>
                  <motion.p 
                    className="text-xl md:text-2xl text-zinc-600 font-extralight leading-relaxed"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    What if you could show an auditor your documentation in{' '}
                    <TextHighlight variant="bold" color="green">
                      5 minutes
                    </TextHighlight>
                    {' '}instead of{' '}
                    <TextHighlight variant="semibold" color="amber">
                      30 minutes
                    </TextHighlight>
                    ?
                  </motion.p>
                  <motion.p 
                    className="text-xl md:text-2xl text-zinc-600 font-extralight leading-relaxed"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    What if you could be{' '}
                    <TextHighlight variant="bold" color="green" showUnderline delay={0.5}>
                      audit-ready
                    </TextHighlight>
                    {' '}in{' '}
                    <TextHighlight variant="bold" color="green">
                      2 hours
                    </TextHighlight>
                    {' '}instead of{' '}
                    <TextHighlight variant="semibold" color="amber">
                      2 weeks
                    </TextHighlight>
                    ?
                  </motion.p>
                  <motion.p 
                    className="text-2xl md:text-3xl text-[#0c0b1d] font-normal leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    That would{' '}
                    <TextHighlight variant="bold-italic" color="default" showUnderline delay={0.6}>
                      change everything
                    </TextHighlight>
                    , right?
                  </motion.p>
                </div>
              </motion.div>

              {/* The Solution */}
              <motion.div 
                className="relative bg-white rounded-3xl p-8 md:p-12 border-2 border-[#1ad07a]/30 shadow-2xl max-w-4xl mx-auto"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="space-y-6">
                  <h3 className="text-2xl md:text-3xl text-[#0c0b1d] font-extralight leading-tight">
                    That's what{' '}
                    <TextHighlight variant="bold" color="green" showUnderline delay={0.2}>
                      HIPAA Hub
                    </TextHighlight>
                    {' '}does.
                  </h3>
                  
                  <p className="text-lg md:text-xl text-zinc-600 font-extralight leading-relaxed">
                    We don't try to do everything. We do{' '}
                    <TextHighlight variant="semibold-italic" color="default">
                      one thing
                    </TextHighlight>
                    {' '}really well: organize your existing documentation so you're{' '}
                    <TextHighlight variant="bold" color="green">
                      audit-ready
                    </TextHighlight>
                    .
                  </p>
                  
                  <p className="text-xl md:text-2xl text-[#0c0b1d] font-normal leading-relaxed">
                    Think of it as a{' '}
                    <TextHighlight variant="semibold-italic" color="default" showUnderline delay={0.3}>
                      filing system
                    </TextHighlight>
                    {' '}for compliance. Not a consultant. Not a risk assessment tool. A filing system.
                  </p>
                  
                  <p className="text-lg md:text-xl text-zinc-600 font-extralight leading-relaxed">
                    You bring some information. We bring the{' '}
                    <TextHighlight variant="bold" color="green" showUnderline delay={0.4}>
                      structure
                    </TextHighlight>
                    .
                  </p>
                  
                  <p className="text-xl md:text-2xl text-[#1ad07a] font-normal leading-relaxed">
                    <TextHighlight variant="bold-italic" color="green">
                      That's it. That's the whole thing.
                    </TextHighlight>
                  </p>
                </div>

                {/* Corner accents */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#1ad07a]/10 rounded-bl-full" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#1ad07a]/10 rounded-tr-full" />
              </motion.div>

              <SectionCTA label="See What You’re Missing (In Minutes)" href="/signup" />

            </div>
          </FadeIn>
      </div>
    </section>
  );
}
