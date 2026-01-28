'use client';

import { HelpCircle, CheckCircle2, Clock, Shield, Database, Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { FadeIn } from './animated-section';
import { useState } from 'react';
import { cn } from '@/utils/cn';
import { SectionCTA } from './section-cta';

const objections = [
  {
    icon: HelpCircle,
    question: 'This sounds too simple. Compliance can\'t be that simple, right?',
    answer: 'You\'re right. Compliance is complex. But organizing your documentation isn\'t. Most compliance tools try to do everything: risk assessments, policy generation, training management, breach notification. They\'re powerful, but they\'re also complex. We do one thing: organize your documentation. That\'s it. We handle the complexity of compliance. You handle the simplicity of organization.'
  },
  {
    icon: Clock,
    question: 'I don\'t have time to set this up. I\'m already overwhelmed.',
    answer: 'Most clinics complete setup in 2-3 days. Not weeks. Not months. Days. Here\'s how: Day 1: Upload your policies (or use our templates). Day 2: Organize by category. Day 3: Add evidence. You\'re done. Audit-ready. And if you get stuck, we\'re here to help. Email support is included.'
  },
  {
    icon: Shield,
    question: 'What if I\'m already organized? Do I need this?',
    answer: 'If you can answer this question in 5 minutes, you don\'t need HIPAA Hub: "Show me your current policies, version control, evidence tracking system, and training records. All organized in one place. All audit-ready." If you can do that, you\'re good. Most clinics can\'t.'
  },
  {
    icon: Database,
    question: 'Does this integrate with my EHR?',
    answer: 'HIPAA Hub doesn\'t require EHR integration. We focus on compliance documentation, not clinical data. You can export compliance reports and share them with your EHR vendor or IT team. But we don\'t touch your patient data. Ever. This keeps you safe and keeps your data secure.'
  },
  {
    icon: Shield,
    question: 'Is my data secure?',
    answer: 'Yes. Military-grade encryption (AES-256) at rest and in transit. SOC 2 Type II certified data centers. NIST SP 800-53 security controls. Regular security audits. We don\'t store patient PHI. We only store your compliance documentation. And you can export all your data at any time in standard formats (PDF, DOCX, ZIP).'
  }
];

export default function ObjectionHandlingSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="w-full relative bg-gradient-to-b from-[#f3f5f9] to-white py-24 md:py-32 font-extralight overflow-hidden">
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
                  But wait... I have questions.
                </h2>
              </motion.div>

              {/* Objections */}
              <div className="space-y-4">
                {objections.map((objection, index) => {
                  const Icon = objection.icon;
                  return (
                    <motion.div
                      key={index}
                      className={cn(
                        "relative bg-white rounded-2xl border-2 transition-all duration-500 overflow-hidden",
                        openIndex === index ? "border-[#1ad07a]/50 shadow-lg" : "border-zinc-200 hover:border-zinc-300"
                      )}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <button
                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                        className="w-full p-6 md:p-8 flex items-start gap-4 text-left"
                      >
                        <div className="w-10 h-10 rounded-xl bg-[#1ad07a]/10 flex items-center justify-center text-[#1ad07a] shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-lg md:text-xl text-[#0c0b1d] font-extralight leading-tight mb-2">
                            {objection.question}
                          </p>
                          <div className={cn(
                            "overflow-hidden transition-all duration-500",
                            openIndex === index ? "max-h-96 mt-4" : "max-h-0"
                          )}>
                            <p className="text-base md:text-lg text-zinc-600 font-extralight leading-relaxed">
                              {objection.answer}
                            </p>
                          </div>
                        </div>
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-500",
                          openIndex === index ? "bg-[#1ad07a] text-white rotate-180" : "bg-zinc-100 text-zinc-600"
                        )}>
                          {openIndex === index ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        </div>
                      </button>
                    </motion.div>
                  );
                })}
              </div>

              <SectionCTA label="Get Started (We’ll Guide You)" href="/signup" />

            </div>
          </FadeIn>
      </div>
    </section>
  );
}
