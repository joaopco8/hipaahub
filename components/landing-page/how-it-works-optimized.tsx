'use client';

import { Upload, Link2, Download, CheckCircle2, Clock, FileText, Shield, AlertTriangle, Users, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { FadeIn } from './animated-section';
import Image from 'next/image';
import { TextHighlight } from './text-highlight';
import { SectionCTA } from './section-cta';

const steps = [
  {
    number: '2',
    icon: Upload,
    title: 'See Your Audit Readiness Status',
    description: 'After completing your Security Risk Analysis, HIPAA Hub analyzes your responses and shows you exactly where you stand. Upload your existing documentation or use our templates. The system instantly tells you if you\'re ready for an audit, what\'s missing, and what needs attention—all organized by risk levels and priorities.',
    behindTheScenes: [
      'Your Security Risk Analysis responses are analyzed',
      'Audit readiness status is calculated based on your answers',
      'Missing documentation is automatically identified and prioritized',
      'Items are categorized by risk level (Low, Medium, High)',
      'Action items are sorted by priority and urgency',
      'Documents are scanned for compliance gaps',
      'Version control is automatically enabled',
      'Timestamps are recorded for audit trail',
      'Encryption is applied (AES-256)',
      'Backup copies are created automatically'
    ],
    timeRequired: '30-60 minutes',
    whyItMatters: 'After answering 150+ questions in your Security Risk Analysis, you need to know: Am I ready for an audit? What\'s missing? What should I fix first? HIPAA Hub takes your responses and creates a clear action plan. You\'ll see everything you need to do, organized by risk level and priority. No guessing. No panic. Just a clear roadmap showing exactly what needs attention—and what can wait. When an auditor arrives, you\'ll already know you\'re ready because you\'ve addressed everything the system flagged.',
    image: '/images/telas/Review Your Compliance.png'
  },
  {
    number: '3',
    icon: Link2,
    title: 'Connect Evidence to Policies',
    description: 'For each policy, HIPAA Hub helps you connect the evidence that proves you\'re following it. HIPAA Hub creates a visual map showing which evidence supports which policy. This is exactly what auditors want to see.',
    behindTheScenes: [
      'AI scans documents to suggest relevant evidence',
      'You confirm or adjust the connections',
      'Evidence is tagged with dates and responsible parties',
      'Chain of custody is automatically documented',
      'Immutable audit logs track all changes'
    ],
    timeRequired: '1-2 hours',
    whyItMatters: 'Auditors don\'t just want to see your policies. They want to see PROOF that you\'re actually following them. HIPAA Hub shows the auditor exactly how your evidence supports your policies. This is what separates "compliant on paper" from "actually compliant."',
    image: '/images/telas/Upload Evidence.png'
  },
  {
    number: '4',
    icon: Download,
    title: 'Export Your Audit Package',
    description: 'When you\'re ready (or when an auditor arrives), HIPAA Hub creates one complete audit package with everything an auditor needs. One file. Everything organized. Ready to present.',
    behindTheScenes: [
      'System generates a compliance report',
      'All documents are compiled in audit-ready format',
      'Timestamps and signatures are verified',
      'Missing documentation is flagged',
      'Package is encrypted and ready for secure delivery'
    ],
    timeRequired: '2-5 minutes',
    whyItMatters: 'The difference between passing an audit and failing an audit is often just being able to show the auditor everything quickly and clearly. HIPAA Hub does that for you. One click. Everything ready.',
    image: '/images/telas/tela2.jpg'
  }
];

export default function HowItWorksOptimized() {
  return (
    <section id="how-it-works" className="w-full bg-white py-24 md:py-32 font-extralight">
      <div className="max-w-7xl mx-auto px-6">
        <div className="space-y-20">
          
          {/* Header */}
          <FadeIn>
            <div className="text-center space-y-6">
              <h2 className="text-[2rem] md:text-[2.5rem] lg:text-[3.31rem] text-[#0c0b1d] font-extralight leading-tight">
                How{' '}
                <TextHighlight variant="bold" color="green" showUnderline delay={0.2}>
                  HIPAA Hub
                </TextHighlight>
                {' '}Works
              </h2>
              <p className="text-xl md:text-2xl text-zinc-600 font-extralight max-w-3xl mx-auto">
                You don't need to understand{' '}
                <TextHighlight variant="semibold-italic" color="default">
                  compliance
                </TextHighlight>
                {' '}to use HIPAA Hub.<br />
                <span className="text-[#1ad07a] font-extralight">
                  Start with a comprehensive{' '}
                  <TextHighlight variant="bold" color="green" showUnderline delay={0.3}>
                    Security Risk Analysis
                  </TextHighlight>
                  , then organize your documentation in{' '}
                  <TextHighlight variant="bold" color="green">
                    four simple steps
                  </TextHighlight>
                  .
                </span>
              </p>
            </div>
          </FadeIn>

          {/* Step 1: Complete Your Security Risk Analysis */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
              {/* Content */}
              <div className="space-y-8">
                {/* Step Number & Icon */}
                <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-[#0c0b1d] text-white text-3xl font-light flex items-center justify-center shadow-lg">
                  1
                </div>
                <div className="w-16 h-16 rounded-2xl bg-[#1ad07a] text-white flex items-center justify-center shadow-lg">
                  <Shield className="w-8 h-8" />
                </div>
                </div>

                {/* Title */}
                <h3 className="text-3xl md:text-4xl font-extralight text-[#0c0b1d] leading-tight">
                  Complete Your Security Risk Analysis
                </h3>

                {/* Description */}
                <p className="text-lg text-zinc-600 font-extralight leading-relaxed">
                  Start with our comprehensive Security Risk Analysis (SRA). HIPAA Hub guides you through 150+ OCR-aligned questions covering Administrative, Physical, and Technical Safeguards.
                </p>

                {/* Key Features */}
                <div className="bg-[#f3f5f9] rounded-xl p-6 space-y-3">
                  <p className="text-sm font-semibold text-[#0c0b1d] mb-2">What You Get:</p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-[#1ad07a] shrink-0 mt-0.5" />
                      <span className="text-sm text-zinc-600 font-extralight">150+ OCR-aligned questions</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-[#1ad07a] shrink-0 mt-0.5" />
                      <span className="text-sm text-zinc-600 font-extralight">NIST SP 800-53 framework</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-[#1ad07a] shrink-0 mt-0.5" />
                      <span className="text-sm text-zinc-600 font-extralight">Automated risk scoring (Low, Medium, High)</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-[#1ad07a] shrink-0 mt-0.5" />
                      <span className="text-sm text-zinc-600 font-extralight">Prioritized remediation recommendations</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-[#1ad07a] shrink-0 mt-0.5" />
                      <span className="text-sm text-zinc-600 font-extralight">Audit-ready risk assessment report</span>
                    </div>
                  </div>
                </div>

                {/* Time Required */}
                <div className="flex items-center gap-3 text-zinc-600">
                  <Clock className="w-5 h-5 text-[#1ad07a]" />
                  <span className="font-medium">Time Required: 20-30 minutes</span>
                </div>

                {/* Why It Matters */}
                <div className="bg-[#1ad07a]/5 rounded-xl p-6 border border-[#1ad07a]/20">
                  <p className="text-sm font-semibold text-[#0c0b1d] mb-2">Why This Matters:</p>
                  <p className="text-sm text-zinc-700 font-extralight leading-relaxed">
                    HIPAA requires a documented Security Risk Analysis. Most clinics either skip it or do it poorly. HIPAA Hub's guided assessment ensures you identify all vulnerabilities before an auditor does. This is your first line of defense.
                  </p>
                </div>
              </div>

              {/* Image */}
              <div className="relative">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 bg-white">
                  <Image 
                    src="/images/telas/Complete Your Security Risk Analysis.png" 
                    alt="Complete Your Security Risk Analysis"
                    width={1200}
                    height={900}
                    quality={100}
                    unoptimized={true}
                    className="w-full h-full object-contain"
                    style={{ transform: 'scale(1.02)' }}
                    priority={true}
                  />
                </div>
              </div>
          </div>

          {/* Steps 2-4 */}
          <div className="space-y-24">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  className="grid lg:grid-cols-2 gap-12 items-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  {/* Content */}
                  <div className={`space-y-8 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                    {/* Step Number & Icon */}
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-2xl bg-[#1ad07a] text-white text-3xl font-light flex items-center justify-center shadow-lg">
                        {step.number}
                      </div>
                      <div className="w-16 h-16 rounded-2xl bg-[#0c0b1d] text-white flex items-center justify-center shadow-lg">
                        <Icon className="w-8 h-8" />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-3xl md:text-4xl font-extralight text-[#0c0b1d] leading-tight">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-lg text-zinc-600 font-extralight leading-relaxed">
                      {step.description}
                    </p>

                    {/* Behind the Scenes */}
                    <div className="bg-[#f3f5f9] rounded-xl p-6 space-y-3">
                      <p className="text-sm font-semibold text-[#0c0b1d] mb-2">What Happens Behind the Scenes:</p>
                      {step.behindTheScenes.map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="w-4 h-4 text-[#1ad07a] shrink-0 mt-0.5" />
                          <span className="text-sm text-zinc-600 font-extralight">{item}</span>
                        </div>
                      ))}
                    </div>

                    {/* Time Required */}
                    <div className="flex items-center gap-3 text-zinc-600">
                      <Clock className="w-5 h-5 text-[#1ad07a]" />
                      <span className="font-medium">Time Required: {step.timeRequired}</span>
                    </div>

                    {/* Why It Matters */}
                    <div className="bg-[#1ad07a]/5 rounded-xl p-6 border border-[#1ad07a]/20">
                      <p className="text-sm font-semibold text-[#0c0b1d] mb-2">Why This Matters:</p>
                      <p className="text-sm text-zinc-700 font-extralight leading-relaxed">
                        {step.whyItMatters}
                      </p>
                    </div>
                  </div>

                  {/* Image */}
                  <div className={`relative ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 bg-white">
                      <Image 
                        src={step.image} 
                        alt={step.title}
                        width={1200}
                        height={900}
                        quality={100}
                        unoptimized={true}
                        className="w-full h-full object-contain"
                        style={{ transform: 'scale(1.02)' }}
                        priority={index < 2}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Extra Features Section */}
          <div className="space-y-24 mt-32">
            {/* Extra Feature 1: Breach Notification Template */}
            <motion.div
              className="relative bg-gradient-to-br from-[#1ad07a]/10 via-white to-[#1ad07a]/5 rounded-3xl p-8 md:p-12 border-2 border-[#1ad07a]/20 shadow-xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="absolute top-4 right-4">
                <div className="bg-[#1ad07a] text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Bonus Feature
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Content */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1ad07a] to-[#0c0b1d] text-white flex items-center justify-center shadow-lg">
                      <AlertTriangle className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-3xl md:text-4xl font-extralight text-[#0c0b1d] leading-tight">
                        HIPAA Breach Notification Letters
                      </h3>
                      <p className="text-sm text-[#1ad07a] font-medium mt-1">Ready-to-use templates</p>
                    </div>
                  </div>

                  <p className="text-lg text-zinc-600 font-extralight leading-relaxed">
                    When a breach occurs, time is critical. HIPAA Hub provides pre-formatted breach notification letter templates for patients, HHS OCR, and media—ensuring you meet all regulatory deadlines without legal confusion.
                  </p>

                  <div className="bg-white/80 rounded-xl p-6 space-y-3 border border-[#1ad07a]/20">
                    <p className="text-sm font-semibold text-[#0c0b1d] mb-3">What's Included:</p>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#1ad07a] shrink-0 mt-0.5" />
                        <span className="text-sm text-zinc-600 font-extralight">Patient notification letters</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#1ad07a] shrink-0 mt-0.5" />
                        <span className="text-sm text-zinc-600 font-extralight">HHS OCR notification forms</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#1ad07a] shrink-0 mt-0.5" />
                        <span className="text-sm text-zinc-600 font-extralight">Media-ready statements</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#1ad07a] shrink-0 mt-0.5" />
                        <span className="text-sm text-zinc-600 font-extralight">Regulatory deadline tracking</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#1ad07a]/10 rounded-xl p-6 border border-[#1ad07a]/30">
                    <p className="text-sm font-semibold text-[#0c0b1d] mb-2">Why This Matters:</p>
                    <p className="text-sm text-zinc-700 font-extralight leading-relaxed">
                      HIPAA requires breach notifications within 60 days. Having ready-to-use templates means you can respond immediately, protect your reputation, and demonstrate compliance even during a crisis.
                    </p>
                  </div>
                </div>

                {/* GIF */}
                <div className="relative">
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 bg-white">
                    <img 
                      src="/images/8img/gif-breach.gif" 
                      alt="HIPAA Breach Notification Letters"
                      className="w-full h-full object-contain"
                      style={{ transform: 'scale(1.02)' }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Extra Feature 2: Employee Training */}
            <motion.div
              className="relative bg-gradient-to-br from-[#0c0b1d]/5 via-white to-[#0c0b1d]/10 rounded-3xl p-8 md:p-12 border-2 border-[#0c0b1d]/20 shadow-xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="absolute top-4 right-4">
                <div className="bg-[#0c0b1d] text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Bonus Feature
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Image */}
                <div className="relative lg:order-1">
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 bg-white">
                    <Image 
                      src="/images/8img/NURSEJAKE.png" 
                      alt="Employee Training & Awareness"
                      width={1200}
                      height={900}
                      quality={100}
                      unoptimized={true}
                      className="w-full h-full object-contain"
                      style={{ transform: 'scale(1.02)' }}
                      priority={true}
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-6 lg:order-2">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0c0b1d] to-[#1ad07a] text-white flex items-center justify-center shadow-lg">
                      <Users className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-3xl md:text-4xl font-extralight text-[#0c0b1d] leading-tight">
                        Employee Training & Awareness
                      </h3>
                      <p className="text-sm text-[#1ad07a] font-medium mt-1">Train and certify your workforce</p>
                    </div>
                  </div>

                  <p className="text-lg text-zinc-600 font-extralight leading-relaxed">
                    HIPAA compliance isn't just about policies—it's about people. HIPAA Hub provides comprehensive training modules and certification tracking to ensure every team member understands their role in protecting patient privacy.
                  </p>

                  <div className="bg-white/80 rounded-xl p-6 space-y-3 border border-[#0c0b1d]/20">
                    <p className="text-sm font-semibold text-[#0c0b1d] mb-3">What's Included:</p>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#1ad07a] shrink-0 mt-0.5" />
                        <span className="text-sm text-zinc-600 font-extralight">Interactive training modules</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#1ad07a] shrink-0 mt-0.5" />
                        <span className="text-sm text-zinc-600 font-extralight">Automated certification tracking</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#1ad07a] shrink-0 mt-0.5" />
                        <span className="text-sm text-zinc-600 font-extralight">Compliance attestation records</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#1ad07a] shrink-0 mt-0.5" />
                        <span className="text-sm text-zinc-600 font-extralight">Audit-ready training history</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0c0b1d]/5 rounded-xl p-6 border border-[#0c0b1d]/20">
                    <p className="text-sm font-semibold text-[#0c0b1d] mb-2">Why This Matters:</p>
                    <p className="text-sm text-zinc-700 font-extralight leading-relaxed">
                      Auditors want proof that your staff is trained. HIPAA Hub tracks who completed training, when they completed it, and generates certificates automatically—creating an unbreakable chain of evidence for compliance.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* The Result */}
          <motion.div
            className="relative bg-gradient-to-br from-[#0c0b1d] to-[#1a1a2e] rounded-3xl p-8 md:p-12 text-white overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative z-10 space-y-8">
              <h3 className="text-3xl md:text-4xl font-extralight leading-tight text-center">
                From scattered to audit-ready.<br />
                <span className="text-[#1ad07a] font-extralight">In 3 steps. In 2 hours.</span>
              </h3>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Before */}
                <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                  <h4 className="text-xl font-semibold mb-4">Before HIPAA Hub:</h4>
                  <ul className="space-y-2 text-sm font-extralight text-white/80">
                    <li className="flex items-start gap-2">
                      <span className="text-red-400">✗</span>
                      <span>Your documentation is scattered across Google Drive, Email, Spreadsheets, Someone's laptop</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400">✗</span>
                      <span>When an auditor asks "Where's your documentation?", you spend 30 minutes scrambling</span>
                    </li>
                  </ul>
                </div>

                {/* After */}
                <div className="bg-[#1ad07a]/20 rounded-2xl p-6 backdrop-blur-sm border border-[#1ad07a]/30">
                  <h4 className="text-xl font-semibold mb-4">After HIPAA Hub:</h4>
                  <ul className="space-y-2 text-sm font-extralight text-white">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#1ad07a] shrink-0 mt-0.5" />
                      <span>Your documentation is organized in one place</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#1ad07a] shrink-0 mt-0.5" />
                      <span>When an auditor asks "Where's your documentation?", you click export and hand them everything in 5 minutes</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>

          <SectionCTA label="Start Your Setup Now" href="/signup" />

        </div>
      </div>
    </section>
  );
}
