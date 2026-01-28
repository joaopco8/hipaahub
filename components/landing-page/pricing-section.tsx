'use client';

import { Button } from '@/components/ui/button';
import { Check, Shield, Sparkles, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { initiateCheckout } from '@/app/actions/checkout';
import { getStripe } from '@/utils/stripe/client';

export default function PricingSection() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGetStarted = async () => {
    setIsLoading(true);
    try {
      console.log('PricingSection: Get Started clicked');
      const result = await initiateCheckout();
      
      console.log('PricingSection: Result type:', result.type);
      
      if (result.type === 'redirect') {
        console.log('PricingSection: Redirecting to:', result.path);
        window.location.href = result.path;
      } else if (result.type === 'checkout') {
        console.log('PricingSection: Proceeding to Stripe checkout');
        const stripe = await getStripe();
        if (stripe) {
          await stripe.redirectToCheckout({ sessionId: result.sessionId });
        } else {
          console.error('Stripe failed to load');
          window.location.href = '/signup?redirect=checkout';
        }
      } else if (result.type === 'error') {
        console.error('Checkout error:', result.message);
        window.location.href = '/signup?redirect=checkout';
      }
    } catch (error: any) {
      console.error('Error initiating checkout:', error);
      window.location.href = '/signup?redirect=checkout';
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { title: 'Security Risk Analysis (SRA)', sub: 'OCR-aligned and audit-ready' },
    { title: 'Dynamic Policy Engine', sub: 'All 9 required HIPAA policies' },
    { title: 'Evidence Vault', sub: 'Centralized storage for all proofs' },
    { title: 'Workforce Training', sub: 'Unlimited certificates for staff' },
    { title: 'Version History', sub: 'Full audit trail of all changes' }
  ];

  return (
    <section id="pricing" className="relative w-full bg-gradient-to-b from-[#f3f5f9] via-blue-50/30 to-[#f3f5f9] py-24 md:py-32 font-extralight overflow-hidden">
      {/* Enhanced background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 -left-64 w-[800px] h-[800px] bg-[#1ad07a]/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-1/3 -right-64 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '7s', animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-6 font-extralight relative z-10">
        <motion.div 
          className="text-center mb-16 space-y-6 font-extralight"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1ad07a]/10 border border-[#1ad07a]/20">
            <Sparkles className="w-4 h-4 text-[#1ad07a]" />
            <span className="text-xs text-[#1ad07a] font-medium uppercase">Simple Pricing</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl text-[#0c0b1d] font-extralight leading-tight">
            One plan. Full audit defense.
          </h2>
          <p className="text-xl text-zinc-600 max-w-2xl mx-auto font-extralight">
            Everything you need to reach and maintain HIPAA compliance in one place.
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto font-extralight">
          <motion.div 
            className="relative rounded-3xl border-2 border-white/10 bg-[#0c0b1d] text-white overflow-hidden shadow-2xl group"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            whileHover={{ y: -8, borderColor: 'rgba(26, 208, 122, 0.3)' }}
          >
            {/* Animated glow effect */}
            <div className="absolute -inset-2 bg-gradient-to-r from-[#1ad07a]/20 via-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
            
            {/* Corner decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#1ad07a]/5 rounded-bl-full opacity-50" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-tr-full opacity-50" />

            <div className="relative flex flex-col lg:flex-row z-10">
              
              {/* Left Side: Pricing & CTA */}
              <div className="lg:w-2/5 p-8 md:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/5 font-extralight">
                <div>
                  <motion.div 
                    className="flex items-center gap-3 mb-4 font-extralight"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <Shield className="w-8 h-8 text-[#1ad07a]" />
                    <h3 className="text-3xl md:text-4xl font-extralight">FULL GUARD</h3>
                  </motion.div>
                  
                  <motion.div
                    className="inline-flex items-center gap-2 bg-[#1ad07a]/20 text-[#1ad07a] text-xs px-3 py-1.5 rounded-full border border-[#1ad07a]/30 mb-4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span className="font-medium">Most Popular</span>
                  </motion.div>

                  <motion.p 
                    className="text-zinc-400 text-sm mb-8 font-extralight leading-relaxed"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    Complete compliance operating system designed for small clinics and practices.
                  </motion.p>

                  {/* Pricing */}
                  <motion.div 
                    className="mb-8 font-extralight"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    <div className="flex items-baseline gap-2 mb-2 font-extralight">
                      <span className="text-6xl md:text-7xl text-white font-extralight">$499</span>
                      <span className="text-zinc-400 text-xl font-extralight">/ year</span>
                    </div>
                    <p className="text-[#1ad07a] text-sm mt-2 font-extralight flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Full access to all HIPAA Guard modules
                    </p>
                    <p className="text-xs text-zinc-500 mt-2 font-extralight">
                      Annual plan. Cancel anytime.
                    </p>
                  </motion.div>
                </div>

                {/* CTA Button */}
                <motion.div 
                  className="font-extralight"
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
                      className="w-full bg-[#1ad07a] text-[#0c0b1d] hover:bg-[#1ad07a]/90 rounded-xl py-7 text-lg shadow-[0_0_30px_rgba(26,208,122,0.4)] transition-all group font-medium relative overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {isLoading ? 'Processing…' : 'Get Started'}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#1ad07a] to-[#15b566] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Button>
                  </motion.div>
                </motion.div>
              </div>

              {/* Right Side: Features */}
              <div className="lg:w-3/5 p-8 md:p-12 font-extralight">
                <motion.p 
                  className="text-xs text-zinc-500 mb-6 font-medium uppercase"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  What's included:
                </motion.p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 font-extralight">
                  {features.map((feature, index) => (
                    <motion.div 
                      key={index} 
                      className="flex items-start gap-3 font-extralight group"
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.4 + (index * 0.1) }}
                      whileHover={{ x: 4 }}
                    >
                      <motion.div
                        className="w-5 h-5 rounded-full bg-[#1ad07a]/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#1ad07a]/30 transition-colors"
                        whileHover={{ scale: 1.1, rotate: 360 }}
                        transition={{ duration: 0.4 }}
                      >
                        <Check className="w-3 h-3 text-[#1ad07a]" />
                      </motion.div>
                      <div className="flex flex-col gap-0.5 font-extralight">
                        <span className="text-zinc-200 text-sm leading-none font-extralight group-hover:text-white transition-colors">
                          {feature.title}
                        </span>
                        <span className="text-zinc-500 text-[12px] font-extralight italic">
                          {feature.sub}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
