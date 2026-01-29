'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Download, ArrowRight, CheckCircle2, Shield, FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import LandingHeader from '@/components/landing-page/landing-header';
import { TextHighlight } from '@/components/landing-page/text-highlight';
import { FadeIn } from '@/components/landing-page/animated-section';

export default function AuditSurvivalGuidePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    practiceName: '',
    role: '',
    auditTimeline: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName.trim() || !formData.email.trim() || 
        !formData.practiceName.trim() || !formData.role || !formData.auditTimeline) {
      toast.error('Please fill in all fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      
      // Save lead to database
      // Note: leads table exists but may not be in TypeScript types yet
      const { error } = await (supabase as any)
        .from('leads')
        .insert([
          {
            name: formData.firstName.trim(),
            email: formData.email.trim(),
            practice_name: formData.practiceName.trim(),
            role: formData.role,
            audit_timeline: formData.auditTimeline,
            source: 'audit_survival_guide'
          }
        ]);

      if (error) {
        console.error('Error saving lead:', error);
        toast.error('Failed to submit. Please try again.');
        return;
      }

      // Redirect to download page
      router.push(`/download?email=${encodeURIComponent(formData.email)}`);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <LandingHeader />
      
      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="w-full bg-gradient-to-b from-[#f3f5f9] to-white py-20 md:py-28 font-extralight">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              
              {/* Left: Headline */}
              <FadeIn>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-6"
                >
                  <h1 className="text-[2rem] md:text-[2.5rem] lg:text-[3.31rem] text-[#0c0b1d] font-extralight leading-tight">
                    Your{' '}
                    <TextHighlight variant="bold" color="default" showUnderline delay={0.2}>
                      OCR Audit
                    </TextHighlight>
                    {' '}is Coming.<br />
                    <span className="text-[#1ad07a] font-extralight">
                      Are You{' '}
                      <TextHighlight variant="bold" color="green" showUnderline delay={0.3}>
                        Ready
                      </TextHighlight>
                      ?
                    </span>
                  </h1>
                  <p className="text-lg md:text-xl text-zinc-600 font-extralight leading-relaxed">
                    Most clinics get{' '}
                    <TextHighlight variant="bold" color="amber">
                      30 days notice
                    </TextHighlight>
                    {' '}before an OCR audit. That's not much time to prepare.
                  </p>
                  <p className="text-base text-zinc-700 font-extralight">
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
              </FadeIn>

              {/* Right: Key Points */}
              <FadeIn delay={0.2}>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="space-y-4"
                >
                  <motion.div
                    className="bg-white rounded-xl p-6 border-2 border-[#1ad07a]/20 shadow-sm hover:border-[#1ad07a]/40 transition-all"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-[#1ad07a]/10">
                        <Shield className="w-5 h-5 text-[#1ad07a] shrink-0" />
                      </div>
                      <div>
                        <h3 className="font-medium text-[#0c0b1d] mb-2">The 5-Step OCR Audit Process</h3>
                        <p className="text-sm text-zinc-600 font-extralight">Learn exactly what happens at each step</p>
                      </div>
                    </div>
                  </motion.div>
                  <motion.div
                    className="bg-white rounded-xl p-6 border-2 border-[#1ad07a]/20 shadow-sm hover:border-[#1ad07a]/40 transition-all"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-[#1ad07a]/10">
                        <FileText className="w-5 h-5 text-[#1ad07a] shrink-0" />
                      </div>
                      <div>
                        <h3 className="font-medium text-[#0c0b1d] mb-2">9 Required HIPAA Policies</h3>
                        <p className="text-sm text-zinc-600 font-extralight">What auditors always look for</p>
                      </div>
                    </div>
                  </motion.div>
                  <motion.div
                    className="bg-white rounded-xl p-6 border-2 border-[#1ad07a]/20 shadow-sm hover:border-[#1ad07a]/40 transition-all"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-[#1ad07a]/10">
                        <CheckCircle2 className="w-5 h-5 text-[#1ad07a] shrink-0" />
                      </div>
                      <div>
                        <h3 className="font-medium text-[#0c0b1d] mb-2">30-Day Preparation Timeline</h3>
                        <p className="text-sm text-zinc-600 font-extralight">Step-by-step plan to get ready</p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* PROBLEM SECTION */}
        <section className="w-full bg-gradient-to-b from-white to-[#f3f5f9] py-20 md:py-28 font-extralight">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              
              {/* Left: Problem Story */}
              <FadeIn>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="space-y-6 text-base text-zinc-700 font-extralight leading-relaxed"
                >
                  <h2 className="text-[2rem] md:text-[2.5rem] lg:text-[3.31rem] text-[#0c0b1d] font-extralight leading-tight mb-4">
                    The OCR Audit Process is{' '}
                    <TextHighlight variant="bold" color="default" showUnderline delay={0.2}>
                      Predictable
                    </TextHighlight>
                    .<br />
                    <span className="text-zinc-600 font-extralight">
                      But Most Clinics Still{' '}
                      <TextHighlight variant="bold-italic" color="red" showUnderline delay={0.3}>
                        Fail
                      </TextHighlight>
                      .
                    </span>
                  </h2>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    The auditor arrives on a{' '}
                    <TextHighlight variant="semibold-italic" color="default">
                      Monday morning
                    </TextHighlight>
                    . She sits down with your practice manager and asks:{' '}
                    <TextHighlight variant="bold-italic" color="default">
                      "Where's your documentation?"
                    </TextHighlight>
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    Your practice manager{' '}
                    <TextHighlight variant="bold-italic" color="red">
                      panics
                    </TextHighlight>
                    . She spends{' '}
                    <TextHighlight variant="bold" color="amber">
                      30 minutes
                    </TextHighlight>
                    {' '}looking through Google Drive, email, old hard drives. She finds some policies, but she's not sure if they're current.
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    The auditor watches her scramble. She makes a note:{' '}
                    <TextHighlight variant="bold-italic" color="red" showUnderline delay={0.6}>
                      "Documentation disorganized."
                    </TextHighlight>
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    That one note triggers a deeper audit. These gaps become violations. These violations become fines.{' '}
                    <TextHighlight variant="bold" color="red">
                      $100-$50,000 per violation
                    </TextHighlight>
                    .
                  </motion.p>
                </motion.div>
              </FadeIn>

              {/* Right: Key Message */}
              <FadeIn delay={0.2}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-white rounded-xl p-8 border-l-4 border-[#1ad07a] shadow-lg"
                >
                  <div className="space-y-4">
                    <p className="text-xl md:text-2xl text-[#0c0b1d] font-normal leading-tight">
                      HIPAA doesn't punish{' '}
                      <TextHighlight variant="semibold-italic" color="default">
                        intent
                      </TextHighlight>
                      .
                    </p>
                    <p className="text-xl md:text-2xl text-[#1ad07a] font-normal leading-tight">
                      It punishes{' '}
                      <TextHighlight variant="bold" color="green" showUnderline delay={0.4}>
                        lack of evidence
                      </TextHighlight>
                      .
                    </p>
                    <p className="text-base text-zinc-600 font-extralight leading-relaxed pt-4 border-t border-[#1ad07a]/20">
                      An auditor doesn't care if you're compliant. She cares if you can{' '}
                      <TextHighlight variant="bold" color="default">
                        PROVE
                      </TextHighlight>
                      {' '}you're compliant.
                    </p>
                  </div>
                </motion.div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* OPPORTUNITY SECTION */}
        <section className="w-full bg-gradient-to-b from-[#f3f5f9] to-white py-20 md:py-28 font-extralight">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              
              {/* Left: What You'll Learn */}
              <FadeIn>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="space-y-6"
                >
                  <h2 className="text-[2rem] md:text-[2.5rem] lg:text-[3.31rem] text-[#0c0b1d] font-extralight leading-tight">
                    What if you could prepare in{' '}
                    <TextHighlight variant="bold" color="green" showUnderline delay={0.2}>
                      30 days
                    </TextHighlight>
                    ?
                  </h2>
                  <p className="text-lg text-zinc-700 font-extralight leading-relaxed">
                    If you know what auditors look for, you can prepare systematically. In{' '}
                    <TextHighlight variant="bold" color="green">
                      30 days
                    </TextHighlight>
                    . Without a consultant.
                  </p>
                  <motion.div
                    className="bg-white rounded-xl p-6 border-2 border-[#1ad07a]/20 shadow-sm space-y-3"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <p className="font-medium text-[#0c0b1d] mb-3">You'll learn:</p>
                    <ul className="space-y-2">
                      {[
                        'The exact 5-step OCR audit process',
                        'The 9 required HIPAA policies',
                        'The evidence auditors want to see',
                        'The interview questions auditors ask',
                        'The 30-day audit preparation timeline',
                        'Common mistakes that trigger follow-up audits',
                        'The compliance checklist (50 items)',
                        'Red flags that make auditors dig deeper'
                      ].map((item, index) => (
                        <motion.li
                          key={index}
                          className="flex items-start gap-2 text-sm text-zinc-700 font-extralight"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                        >
                          <CheckCircle2 className="w-4 h-4 text-[#1ad07a] shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                </motion.div>
              </FadeIn>

              {/* Right: Benefits */}
              <FadeIn delay={0.2}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="space-y-4"
                >
                  {[
                    { title: '25-30 Pages', desc: 'Comprehensive guide' },
                    { title: '20-30 Minutes', desc: 'Reading time' },
                    { title: '50-Item Checklist', desc: 'Track your progress' },
                    { title: '30-Day Timeline', desc: 'Step-by-step plan' }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      className="bg-white rounded-xl p-6 border-2 border-[#1ad07a]/20 shadow-sm hover:border-[#1ad07a]/40 transition-all"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                      whileHover={{ y: -4, scale: 1.02 }}
                    >
                      <h3 className="font-medium text-[#0c0b1d] mb-2">
                        <TextHighlight variant="bold" color="default">
                          {item.title}
                        </TextHighlight>
                      </h3>
                      <p className="text-sm text-zinc-600 font-extralight">{item.desc}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* FORM SECTION */}
        <section id="form-section" className="w-full bg-gradient-to-b from-[#0c0b1d] via-[#1a1a2e] to-[#0c0b1d] py-20 md:py-28 font-extralight">
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <FadeIn>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="bg-white rounded-2xl p-8 md:p-12 shadow-2xl border-2 border-[#1ad07a]/20"
                >
                  <div className="space-y-8">
                    <div className="text-center space-y-4">
                      <h2 className="text-3xl md:text-4xl text-[#0c0b1d] font-extralight leading-tight">
                        Get{' '}
                        <TextHighlight variant="bold" color="green" showUnderline delay={0.2}>
                          Instant Access
                        </TextHighlight>
                        {' '}to the Guide
                      </h2>
                    </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-[#0c0b1d] font-medium">
                          First Name
                        </Label>
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="Your first name"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          required
                          className="h-12"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-[#0c0b1d] font-medium">
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          className="h-12"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="practiceName" className="text-[#0c0b1d] font-medium">
                        Practice Name
                      </Label>
                      <Input
                        id="practiceName"
                        type="text"
                        placeholder="Your clinic or practice name"
                        value={formData.practiceName}
                        onChange={(e) => setFormData({ ...formData, practiceName: e.target.value })}
                        required
                        className="h-12"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="role" className="text-[#0c0b1d] font-medium">
                          Your Role
                        </Label>
                        <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })} required>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="clinic_owner">Clinic Owner / Founder</SelectItem>
                            <SelectItem value="practice_manager">Practice Manager</SelectItem>
                            <SelectItem value="compliance_officer">Compliance Officer</SelectItem>
                            <SelectItem value="office_manager">Office Manager</SelectItem>
                            <SelectItem value="it_manager">IT Manager</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="auditTimeline" className="text-[#0c0b1d] font-medium">
                          When is your audit?
                        </Label>
                        <Select value={formData.auditTimeline} onValueChange={(value) => setFormData({ ...formData, auditTimeline: value })} required>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="When is your audit?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="next_30_days">Next 30 days (Urgent)</SelectItem>
                            <SelectItem value="1_3_months">1-3 months</SelectItem>
                            <SelectItem value="3_6_months">3-6 months</SelectItem>
                            <SelectItem value="not_sure">Not sure yet</SelectItem>
                            <SelectItem value="already_scheduled">Already scheduled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#1ad07a] text-[#0c0b1d] hover:bg-[#1ad07a]/90 h-14 text-lg font-medium shadow-lg hover:shadow-xl transition-all"
                    >
                      {isSubmitting ? 'Processing...' : (
                        <>
                          Download Free Guide
                          <Download className="ml-2 w-5 h-5" />
                        </>
                      )}
                    </Button>
                  </form>

                  <motion.div
                    className="pt-4 space-y-2 text-sm text-zinc-600 font-extralight text-center"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#1ad07a]" />
                      <span>No credit card required</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#1ad07a]" />
                      <span>Instant download</span>
                    </div>
                  </motion.div>
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
