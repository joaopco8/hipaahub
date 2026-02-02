'use client';

import { Download, CheckCircle2, Shield, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import LandingHeader from '@/components/landing-page/landing-header';
import { TextHighlight } from '@/components/landing-page/text-highlight';
import { FadeIn } from '@/components/landing-page/animated-section';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function AuditSurvivalGuidePage() {
  const handleDownload = () => {
    // Create download link
    const link = document.createElement('a');
    link.href = '/downloads/HIPAA_OCR_Audit_Survival_Guide.pdf';
    link.download = 'HIPAA_OCR_Audit_Survival_Guide.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <LandingHeader />
      
      <main className="flex-1">
        {/* SECTION 1: HERO WITH DOWNLOAD */}
        <section className="w-full bg-white py-16 md:py-24 lg:py-32 font-extralight">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              {/* Headline - Same size as main landing page */}
              <FadeIn>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-5 sm:space-y-6 md:space-y-8 text-center mb-12 md:mb-16"
                >
                  <h1 className="text-4xl sm:text-5xl md:text-5xl lg:text-5xl xl:text-6xl 2xl:text-6xl font-light text-[#0c0b1d] leading-[1.2] sm:leading-[1.15] tracking-tight">
                    <span className="block">Your{' '}
                      <TextHighlight variant="bold" color="default" showUnderline delay={0.2}>
                        OCR Audit
                      </TextHighlight>
                      {' '}is Coming.
                    </span>
                    <span className="block mt-3 sm:mt-4 text-xl sm:text-2xl md:text-2xl lg:text-2xl xl:text-3xl 2xl:text-3xl font-light text-[#1ad07a]">
                      Are You{' '}
                      <TextHighlight variant="bold" color="green" showUnderline delay={0.3}>
                        Ready
                      </TextHighlight>
                      ?
                    </span>
                  </h1>

                  {/* Subheadline - Same size as main landing page */}
                  <motion.div
                    className="space-y-3 sm:space-y-4 md:space-y-5"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <p className="text-base sm:text-lg md:text-xl lg:text-xl xl:text-2xl 2xl:text-2xl text-zinc-700 font-light leading-relaxed max-w-4xl mx-auto">
                      Most clinics get{' '}
                      <TextHighlight variant="bold" color="amber">
                        30 days notice
                      </TextHighlight>
                      {' '}before an OCR audit. That's not much time to prepare.
                    </p>
                    <p className="text-base sm:text-lg md:text-xl lg:text-xl xl:text-2xl 2xl:text-2xl text-zinc-700 font-light leading-relaxed max-w-4xl mx-auto">
                      This guide shows you exactly what auditors look for and how to prepare in the next{' '}
                      <TextHighlight variant="bold" color="green">
                        30 days
                      </TextHighlight>
                      . Used by{' '}
                      <TextHighlight variant="bold" color="default">
                        500+ clinics
                      </TextHighlight>
                      {' '}to pass audits without fines.
                    </p>
                  </motion.div>
                </motion.div>
              </FadeIn>

              {/* Feature Cards Grid */}
              <FadeIn delay={0.2}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="grid md:grid-cols-3 gap-4 mb-12 md:mb-16"
                >
                  {[
                    { icon: Shield, title: 'The 5-Step OCR Audit Process', desc: 'Learn exactly what happens at each step' },
                    { icon: FileText, title: '9 Required HIPAA Policies', desc: 'What auditors always look for' },
                    { icon: CheckCircle2, title: '30-Day Preparation Timeline', desc: 'Step-by-step plan to get ready' }
                  ].map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={index}
                        className="bg-white rounded-xl p-6 border-2 border-[#1ad07a]/20 shadow-sm hover:border-[#1ad07a]/40 transition-all"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                        whileHover={{ y: -4, scale: 1.02 }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-[#1ad07a]/10 flex-shrink-0">
                            <Icon className="w-5 h-5 text-[#1ad07a]" />
                          </div>
                          <div>
                            <h3 className="font-medium text-[#0c0b1d] mb-2 text-sm md:text-base">{item.title}</h3>
                            <p className="text-xs md:text-sm text-zinc-600 font-extralight">{item.desc}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </FadeIn>

              {/* Download Button - Centered */}
              <FadeIn delay={0.4}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center space-y-6"
                >
                  <Button
                    onClick={handleDownload}
                    size="lg"
                    className="bg-[#1ad07a] text-[#0c0b1d] hover:bg-[#1ad07a]/90 h-14 px-8 text-lg font-medium shadow-lg hover:shadow-xl transition-all"
                  >
                    <Download className="mr-2 w-5 h-5" />
                    Download Free Guide
                  </Button>
                  
                  <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-zinc-600 font-extralight">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#1ad07a]" />
                      <span>No credit card required</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#1ad07a]" />
                      <span>Instant download</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#1ad07a]" />
                      <span>25+ pages</span>
                    </div>
                  </div>
                </motion.div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* SECTION 2: PROBLEM & SOLUTION */}
        <section className="w-full bg-gradient-to-b from-[#f3f5f9] to-white py-16 md:py-24 lg:py-32 font-extralight">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              {/* Headline */}
              <FadeIn>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="text-center mb-12 md:mb-16"
                >
                  <h2 className="text-4xl sm:text-5xl md:text-5xl lg:text-5xl xl:text-6xl 2xl:text-6xl font-light text-[#0c0b1d] leading-[1.2] sm:leading-[1.15] tracking-tight mb-6">
                    <span className="block">The OCR Audit Process is{' '}
                      <TextHighlight variant="bold" color="default" showUnderline delay={0.2}>
                        Predictable
                      </TextHighlight>
                      .
                    </span>
                    <span className="block mt-3 sm:mt-4 text-xl sm:text-2xl md:text-2xl lg:text-2xl xl:text-3xl 2xl:text-3xl font-light text-zinc-600">
                      But Most Clinics Still{' '}
                      <TextHighlight variant="bold-italic" color="red" showUnderline delay={0.3}>
                        Fail
                      </TextHighlight>
                      .
                    </span>
                  </h2>
                </motion.div>
              </FadeIn>

              {/* Story Content */}
              <FadeIn delay={0.2}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-6 text-base sm:text-lg md:text-xl lg:text-xl xl:text-2xl 2xl:text-2xl text-zinc-700 font-light leading-relaxed max-w-4xl mx-auto mb-12"
                >
                  <p>
                    The auditor arrives on a{' '}
                    <TextHighlight variant="semibold-italic" color="default">
                      Monday morning
                    </TextHighlight>
                    . She sits down with your practice manager and asks:{' '}
                    <TextHighlight variant="bold-italic" color="default">
                      "Where's your documentation?"
                    </TextHighlight>
                  </p>
                  <p>
                    Your practice manager{' '}
                    <TextHighlight variant="bold-italic" color="red">
                      panics
                    </TextHighlight>
                    . She spends{' '}
                    <TextHighlight variant="bold" color="amber">
                      30 minutes
                    </TextHighlight>
                    {' '}looking through Google Drive, email, old hard drives. She finds some policies, but she's not sure if they're current.
                  </p>
                  <p>
                    The auditor watches her scramble. She makes a note:{' '}
                    <TextHighlight variant="bold-italic" color="red" showUnderline delay={0.6}>
                      "Documentation disorganized."
                    </TextHighlight>
                  </p>
                  <p>
                    That one note triggers a deeper audit. These gaps become violations. These violations become fines.{' '}
                    <TextHighlight variant="bold" color="red">
                      $100-$50,000 per violation
                    </TextHighlight>
                    .
                  </p>
                </motion.div>
              </FadeIn>

              {/* Key Message Box */}
              <FadeIn delay={0.4}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-white rounded-xl p-8 md:p-12 border-l-4 border-[#1ad07a] shadow-lg max-w-3xl mx-auto"
                >
                  <div className="space-y-4">
                    <p className="text-xl md:text-2xl lg:text-3xl text-[#0c0b1d] font-light leading-tight">
                      HIPAA doesn't punish{' '}
                      <TextHighlight variant="semibold-italic" color="default">
                        intent
                      </TextHighlight>
                      .
                    </p>
                    <p className="text-xl md:text-2xl lg:text-3xl text-[#1ad07a] font-light leading-tight">
                      It punishes{' '}
                      <TextHighlight variant="bold" color="green" showUnderline delay={0.4}>
                        lack of evidence
                      </TextHighlight>
                      .
                    </p>
                    <p className="text-base md:text-lg text-zinc-600 font-light leading-relaxed pt-4 border-t border-[#1ad07a]/20">
                      An auditor doesn't care if you're compliant. She cares if you can{' '}
                      <TextHighlight variant="bold" color="default">
                        PROVE
                      </TextHighlight>
                      {' '}you're compliant.
                    </p>
                  </div>
                </motion.div>
              </FadeIn>

              {/* What You'll Learn */}
              <FadeIn delay={0.6}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-16 md:mt-20"
                >
                  <h3 className="text-2xl md:text-3xl lg:text-4xl text-[#0c0b1d] font-light text-center mb-8">
                    What if you could prepare in{' '}
                    <TextHighlight variant="bold" color="green" showUnderline delay={0.2}>
                      30 days
                    </TextHighlight>
                    ?
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 border-2 border-[#1ad07a]/20 shadow-sm">
                      <p className="font-medium text-[#0c0b1d] mb-3 text-sm md:text-base">You'll learn:</p>
                      <ul className="space-y-2">
                        {[
                          'The exact 5-step OCR audit process',
                          'The 9 required HIPAA policies',
                          'The evidence auditors want to see',
                          'The interview questions auditors ask'
                        ].map((item, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-zinc-700 font-extralight">
                            <CheckCircle2 className="w-4 h-4 text-[#1ad07a] shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-white rounded-xl p-6 border-2 border-[#1ad07a]/20 shadow-sm">
                      <ul className="space-y-2">
                        {[
                          'The 30-day audit preparation timeline',
                          'Common mistakes that trigger follow-up audits',
                          'The compliance checklist (50 items)',
                          'Red flags that make auditors dig deeper'
                        ].map((item, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-zinc-700 font-extralight">
                            <CheckCircle2 className="w-4 h-4 text-[#1ad07a] shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { title: '25-30 Pages', desc: 'Comprehensive guide' },
                      { title: '20-30 Minutes', desc: 'Reading time' },
                      { title: '50-Item Checklist', desc: 'Track progress' },
                      { title: '30-Day Timeline', desc: 'Step-by-step plan' }
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        className="bg-white rounded-xl p-4 border-2 border-[#1ad07a]/20 shadow-sm text-center"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                      >
                        <h4 className="font-medium text-[#0c0b1d] mb-1 text-sm md:text-base">
                          <TextHighlight variant="bold" color="default">
                            {item.title}
                          </TextHighlight>
                        </h4>
                        <p className="text-xs text-zinc-600 font-extralight">{item.desc}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </FadeIn>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
