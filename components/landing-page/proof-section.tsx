'use client';

import { CheckCircle2, Clock, ShieldCheck, Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import { FadeIn } from './animated-section';
import Image from 'next/image';
import { TextHighlight } from './text-highlight';
import { SectionCTA } from './section-cta';

const testimonials = [
  {
    text: 'HIPAA Hub saved us during our last audit. The evidence vault feature is incredible and the support team is always responsive.',
    author: 'Sarah Johnson',
    role: 'Medical Director'
  },
  {
    text: 'Finally, a HIPAA platform that speaks plain English. The risk assessment questions are clear, and the generated documents are usable.',
    author: 'Michael Chen',
    role: 'IT Director'
  },
  {
    text: 'I didn\'t realize how much stress I was carrying until it was gone. HIPAA Hub made compliance simple.',
    author: 'Jennifer Martinez',
    role: 'Practice Manager'
  }
];

export default function ProofSection() {
  return (
    <section className="w-full relative bg-white py-24 md:py-32 font-extralight overflow-hidden">
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
                  How{' '}
                  <TextHighlight variant="semibold" color="default">
                    Riverside Family Medicine
                  </TextHighlight>
                  {' '}went from{' '}
                  <TextHighlight variant="bold-italic" color="red" showUnderline delay={0.2}>
                    "scattered"
                  </TextHighlight>
                  <br />
                  <span className="text-[#1ad07a] font-extralight">
                    to{' '}
                    <TextHighlight variant="bold" color="green" showUnderline delay={0.3}>
                      "audit-ready"
                    </TextHighlight>
                    {' '}in{' '}
                    <TextHighlight variant="bold" color="green">
                      2 hours
                    </TextHighlight>
                    .
                  </span>
                </h2>
              </motion.div>

              {/* Story */}
              <motion.div 
                className="relative bg-gradient-to-br from-[#f3f5f9] to-white rounded-3xl p-8 md:p-12 border border-zinc-200 shadow-xl max-w-4xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="space-y-6 text-lg text-zinc-700 font-extralight leading-relaxed">
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <TextHighlight variant="semibold" color="default">
                      Riverside Family Medicine
                    </TextHighlight>
                    {' '}is a{' '}
                    <TextHighlight variant="bold" color="default">
                      6-person
                    </TextHighlight>
                    {' '}practice in Arizona. They had some HIPAA documentation—a few policies here, training records there, but nothing{' '}
                    <TextHighlight variant="semibold-italic" color="red">
                      complete or organized
                    </TextHighlight>
                    .
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    What they did have was{' '}
                    <TextHighlight variant="bold-italic" color="red" showUnderline delay={0.4}>
                      scattered
                    </TextHighlight>
                    . Google Drive. Email. Spreadsheets. Someone's laptop. And they were missing{' '}
                    <TextHighlight variant="bold" color="red">
                      several required policies
                    </TextHighlight>
                    .
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    When they realized an audit was coming, they{' '}
                    <TextHighlight variant="bold-italic" color="red">
                      panicked
                    </TextHighlight>
                    . They spent a{' '}
                    <TextHighlight variant="bold" color="amber">
                      whole day
                    </TextHighlight>
                    {' '}trying to gather everything. They still weren't sure they had it all—or if what they had was even current.
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    Then they decided to get organized with{' '}
                    <TextHighlight variant="bold" color="green" showUnderline delay={0.6}>
                      HIPAA Hub
                    </TextHighlight>
                    . In{' '}
                    <TextHighlight variant="bold" color="green">
                      2 hours
                    </TextHighlight>
                    , they:
                  </motion.p>
                  
                  <ul className="space-y-3 ml-6">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#1ad07a] shrink-0 mt-0.5" />
                      <span>Generated all 9 required policies (HIPAA Hub created what was missing, they uploaded what they already had)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#1ad07a] shrink-0 mt-0.5" />
                      <span>Organized everything in one place—policies, evidence, training records</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#1ad07a] shrink-0 mt-0.5" />
                      <span>Mapped evidence to policies (so they knew what supported what)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#1ad07a] shrink-0 mt-0.5" />
                      <span>Got version control (so they knew what was current)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#1ad07a] shrink-0 mt-0.5" />
                      <span>Created one audit export file ready to go</span>
                    </li>
                  </ul>
                  
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    The next day, the auditor arrived. The clinic owner showed her the organized documentation. The auditor was impressed. She said:{' '}
                    <TextHighlight variant="bold-italic" color="default">
                      "This is the most organized practice I've seen in months."
                    </TextHighlight>
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                  >
                    The audit went{' '}
                    <TextHighlight variant="bold" color="green" showUnderline delay={0.8}>
                      smoothly
                    </TextHighlight>
                    . No follow-up questions. No fines.
                  </motion.p>
                  <motion.div 
                    className="bg-[#1ad07a]/10 rounded-xl p-6 border border-[#1ad07a]/20"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                  >
                    <p className="text-lg text-[#0c0b1d] font-normal italic">
                      <TextHighlight variant="bold-italic" color="default">
                        "I didn't realize how much stress I was carrying until it was gone."
                      </TextHighlight>
                    </p>
                  </motion.div>
                </div>
              </motion.div>

              {/* Key Takeaway */}
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <p className="text-2xl md:text-3xl text-[#0c0b1d] font-extralight leading-tight">
                  You don't need to be{' '}
                  <TextHighlight variant="bold-italic" color="default">
                    perfect
                  </TextHighlight>
                  .<br />
                  <span className="text-[#1ad07a] font-normal">
                    You just need to be{' '}
                    <TextHighlight variant="bold" color="green" showUnderline delay={0.3}>
                      organized
                    </TextHighlight>
                    .
                  </span>
                </p>
                <p className="text-xl md:text-2xl text-zinc-600 font-extralight mt-4">
                  And that's what{' '}
                  <TextHighlight variant="bold" color="green">
                    HIPAA Hub
                  </TextHighlight>
                  {' '}does.
                </p>
              </motion.div>

              {/* Social Proof */}
              <motion.div 
                className="bg-[#f3f5f9] rounded-3xl p-8 md:p-12"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <div className="text-center mb-8">
                  <p className="text-xl md:text-2xl text-[#0c0b1d] font-extralight">
                    200+ clinics have used HIPAA Hub to pass audits.
                  </p>
                  <p className="text-lg text-zinc-600 font-extralight mt-2">
                    Here's what they say:
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {testimonials.map((testimonial, index) => (
                    <motion.div
                      key={index}
                      className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.6 + (index * 0.1) }}
                    >
                      <Quote className="w-8 h-8 text-[#1ad07a] mb-4" />
                      <p className="text-sm text-zinc-600 font-extralight leading-relaxed mb-4">
                        {testimonial.text}
                      </p>
                      <div className="pt-4 border-t border-zinc-200">
                        <p className="text-sm font-semibold text-[#0c0b1d]">
                          {testimonial.author}
                        </p>
                        <p className="text-xs text-zinc-500 font-extralight">
                          {testimonial.role}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <SectionCTA label="Get the Same Audit-Ready Setup" href="/signup" />

            </div>
          </FadeIn>
      </div>
    </section>
  );
}
