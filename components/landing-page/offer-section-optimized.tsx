'use client';

import { Button } from '@/components/ui/button';
import { Check, Shield, Sparkles, ArrowRight, DollarSign, Clock, Zap, FileText, Users } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { initiateCheckout } from '@/app/actions/checkout';
import { getStripe } from '@/utils/stripe/client';
import { FadeIn } from './animated-section';
import { TextHighlight } from './text-highlight';

export default function OfferSectionOptimized() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGetStarted = async () => {
    setIsLoading(true);
    try {
      const result = await initiateCheckout();
      
      if (result.type === 'redirect') {
        window.location.href = result.path;
      } else if (result.type === 'checkout') {
        try {
          const stripe = await getStripe();
          if (stripe) {
            await stripe.redirectToCheckout({ sessionId: result.sessionId });
          } else {
            // Fallback: use session URL if Stripe.js fails
            if (result.sessionUrl) {
              window.location.href = result.sessionUrl;
            } else {
              window.location.href = '/signup?redirect=checkout';
            }
          }
        } catch (stripeError: any) {
          console.error('Stripe.js error, using session URL:', stripeError);
          // Fallback: use session URL if Stripe.js throws error
          if (result.sessionUrl) {
            window.location.href = result.sessionUrl;
          } else {
            window.location.href = '/signup?redirect=checkout';
          }
        }
      } else if (result.type === 'error') {
        window.location.href = '/signup?redirect=checkout';
      }
    } catch (error: any) {
      console.error('Error initiating checkout:', error);
      window.location.href = '/signup?redirect=checkout';
    } finally {
      setIsLoading(false);
    }
  };

  const whatsIncluded = [
    { 
      title: 'All 9 required HIPAA policies', 
      sub: 'Customized to your practice',
      icon: Shield
    },
    { 
      title: 'Evidence vault', 
      sub: 'Organize all your compliance documentation',
      icon: Shield
    },
    { 
      title: 'Version control & audit history', 
      sub: 'Know what\'s current',
      icon: Shield
    },
    { 
      title: 'Audit export', 
      sub: 'One-click audit-ready package',
      icon: Shield
    },
    { 
      title: 'Staff training certificates', 
      sub: 'Unlimited',
      icon: Shield
    },
    { 
      title: 'Email support', 
      sub: 'I\'m here to help',
      icon: Shield
    },
    { 
      title: 'HIPAA Breach Notification Letters', 
      sub: 'Patient, HHS OCR, and media-ready templates',
      icon: FileText
    },
    { 
      title: 'Employee Training & Awareness', 
      sub: 'Train and certify your workforce on HIPAA compliance',
      icon: Users
    }
  ];

  const valueComparison = [
    { label: 'HIPAA Consultant', value: '$2,000-5,000', period: 'one-time' },
    { label: 'Compliance Software', value: '$2,000-5,000', period: 'per year' },
    { label: 'One Audit Fine', value: '$100-50,000', period: 'per violation' }
  ];

  return (
    <section id="pricing" className="relative w-full bg-gradient-to-b from-[#0c0b1d] via-[#1a1a2e] to-[#0c0b1d] py-32 md:py-40 font-extralight overflow-hidden">
      {/* Enhanced background with animated elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-64 w-[1000px] h-[1000px] bg-[#1ad07a]/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-1/4 -right-64 w-[1000px] h-[1000px] bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
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
            <div className="space-y-20">
              
              {/* Header */}
              <motion.div 
                className="text-center space-y-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1ad07a]/20 border border-[#1ad07a]/30 backdrop-blur-sm">
                  <Sparkles className="w-4 h-4 text-[#1ad07a]" />
                  <span className="text-xs text-[#1ad07a] font-medium uppercase tracking-wider">Simple Pricing</span>
                </div>
                <h2 className="text-[2rem] md:text-[2.5rem] lg:text-[3.31rem] text-white font-extralight leading-tight">
                  Here's what you{' '}
                  <TextHighlight variant="bold" color="default" className="text-white" showUnderline delay={0.2}>
                    get
                  </TextHighlight>
                  :
                </h2>
                <p className="text-xl md:text-2xl text-white/70 font-extralight max-w-3xl mx-auto">
                  One plan. Full{' '}
                  <TextHighlight variant="bold" color="green" className="text-[#1ad07a]">
                    audit defense
                  </TextHighlight>
                  . Everything you need to reach and maintain{' '}
                  <TextHighlight variant="semibold-italic" color="default" className="text-white">
                    HIPAA compliance
                  </TextHighlight>
                  .
                </p>
              </motion.div>

              {/* Main Pricing Card */}
              <motion.div 
                className="relative rounded-[3.5rem] border-2 border-white/10 bg-gradient-to-br from-white to-[#f3f5f9] overflow-hidden shadow-2xl"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                
                {/* Corner decorations */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#1ad07a]/5 rounded-bl-full opacity-50" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-tr-full opacity-50" />

                <div className="relative flex flex-col lg:flex-row z-10">
                  
                  {/* Left Side: Pricing & CTA */}
                  <div className="lg:w-2/5 p-10 md:p-14 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-zinc-200/50">
                    <div>
                      <motion.div 
                        className="flex items-center gap-4 mb-6"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                      >
                        <div className="w-14 h-14 rounded-2xl bg-[#1ad07a] flex items-center justify-center shadow-lg">
                          <Shield className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-3xl md:text-4xl font-extralight text-[#0c0b1d]">FULL GUARD</h3>
                          <p className="text-sm text-zinc-500 font-extralight mt-1">Complete compliance system</p>
                        </div>
                      </motion.div>

                      {/* Pricing */}
                      <motion.div 
                        className="mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                      >
                        <div className="flex items-baseline gap-3 mb-3">
                          <span className="text-7xl md:text-8xl text-[#0c0b1d] font-extralight">$499</span>
                          <span className="text-2xl md:text-3xl text-zinc-500 font-extralight">/year</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-600 mb-4">
                          <Clock className="w-4 h-4 text-[#1ad07a]" />
                          <span className="text-lg font-extralight">That's $41/month</span>
                        </div>
                        <div className="bg-[#1ad07a]/10 rounded-xl p-4 border border-[#1ad07a]/20">
                          <p className="text-sm text-[#0c0b1d] font-normal leading-relaxed">
                            Full access to all features. No hidden fees. No per-document charges.
                          </p>
                        </div>
                      </motion.div>
                    </div>

                    {/* CTA Button */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.7 }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          onClick={handleGetStarted}
                          disabled={isLoading}
                          className="w-full bg-[#1ad07a] text-[#0c0b1d] hover:bg-[#1ad07a]/90 rounded-xl py-8 text-xl shadow-[0_0_40px_rgba(26,208,122,0.5)] transition-all group font-medium relative overflow-hidden"
                        >
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            {isLoading ? 'Processing…' : 'Get Started Now'}
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-r from-[#1ad07a] to-[#15b566] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Button>
                      </motion.div>
                    </motion.div>
                  </div>

                  {/* Right Side: Features */}
                  <div className="lg:w-3/5 p-10 md:p-14">
                    <motion.p 
                      className="text-xs text-zinc-500 mb-8 font-medium uppercase tracking-wider"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                    >
                      What's included:
                    </motion.p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {whatsIncluded.map((item, index) => {
                        const Icon = item.icon;
                        return (
                          <motion.div 
                            key={index} 
                            className="flex items-start gap-4"
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: 0.4 + (index * 0.1) }}
                          >
                            <div className="w-10 h-10 rounded-xl bg-[#1ad07a]/20 flex items-center justify-center shrink-0">
                              <Check className="w-5 h-5 text-[#1ad07a]" />
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-[#0c0b1d] text-base font-medium leading-tight">
                                {item.title}
                              </span>
                              <span className="text-zinc-500 text-sm font-extralight">
                                {item.sub}
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Value Comparison */}
              <motion.div 
                className="grid md:grid-cols-4 gap-6"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {valueComparison.map((item, index) => (
                  <motion.div
                    key={index}
                    className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.5 + (index * 0.1) }}
                  >
                    <DollarSign className="w-8 h-8 text-zinc-400 mx-auto mb-3" />
                    <p className="text-sm text-zinc-400 font-extralight mb-2">{item.label}</p>
                    <p className="text-2xl text-white font-extralight mb-1">{item.value}</p>
                    <p className="text-xs text-zinc-500 font-extralight">{item.period}</p>
                  </motion.div>
                ))}
                <motion.div
                  className="bg-[#1ad07a]/20 backdrop-blur-sm rounded-2xl p-6 border-2 border-[#1ad07a]/30 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.8 }}
                >
                  <Zap className="w-8 h-8 text-[#1ad07a] mx-auto mb-3" />
                  <p className="text-sm text-[#1ad07a] font-extralight mb-2">HIPAA Hub</p>
                  <p className="text-2xl text-white font-extralight mb-1">$499</p>
                  <p className="text-xs text-zinc-300 font-extralight">per year</p>
                </motion.div>
              </motion.div>

              {/* Risk Reversal */}
              <motion.div 
                className="relative bg-gradient-to-br from-[#1ad07a]/20 to-[#1ad07a]/10 rounded-3xl p-10 md:p-14 border-2 border-[#1ad07a]/30 backdrop-blur-sm"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <div className="text-center space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20">
                    <Shield className="w-4 h-4 text-[#1ad07a]" />
                    <span className="text-sm text-white font-medium">Risk-Free Guarantee</span>
                  </div>
                  <h3 className="text-3xl md:text-4xl text-white font-extralight">
                    7-Day Money-Back Guarantee
                  </h3>
                  <p className="text-lg md:text-xl text-white/80 font-extralight leading-relaxed max-w-3xl mx-auto">
                    If HIPAA Hub doesn't help you get organized and audit-ready, we'll refund your money in full. No questions asked.
                  </p>
                  <p className="text-lg text-white font-normal">
                    We're confident this will work for you. But if it doesn't, we want you to get your money back.
                  </p>
                </div>
              </motion.div>

            </div>
          </FadeIn>
      </div>
    </section>
  );
}
