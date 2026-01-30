'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { TextHighlight } from './text-highlight';
import { CheckCircle2, Shield, FileText, ArrowRight } from 'lucide-react';

export default function ExitIntentPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: ''
  });

  useEffect(() => {
    // Check if popup has already been shown (using localStorage for permanent tracking)
    const exitIntentShown = localStorage.getItem('exit-intent-shown');
    if (exitIntentShown === 'true') {
      setHasShown(true);
      return;
    }

    // Detect exit intent (mouse leaving the top of the page)
    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse is moving upward (towards the top of the page)
      if (e.clientY <= 0 && !hasShown) {
        setIsOpen(true);
        setHasShown(true);
        localStorage.setItem('exit-intent-shown', 'true');
      }
    };

    // Add event listener
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [hasShown]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone_number.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      
      // Save lead to database
      const { error } = await supabase
        .from('leads' as any)
        .insert([
          {
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone_number: formData.phone_number.trim(),
            source: 'exit_intent_popup'
          }
        ]);

      if (error) {
        console.error('Error saving lead:', error);
        toast.error('Failed to submit. Please try again.');
        return;
      }

      // Close popup
      setIsOpen(false);

      // Redirect to audit survival guide page
      router.push('/audit-survival-guide');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      // If user closes the popup, mark as shown so it won't appear again
      if (!open) {
        localStorage.setItem('exit-intent-shown', 'true');
      }
    }}>
      <DialogContent className="sm:max-w-[800px] lg:max-w-[900px] border-2 border-[#1ad07a]/30 p-0 overflow-hidden max-h-[90vh] bg-white shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          
          {/* Left Side - Text Content */}
          <div className="p-6 lg:p-8 space-y-6 overflow-y-auto bg-gradient-to-br from-white to-[#f3f5f9]">
            <DialogHeader className="space-y-3 text-left">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <DialogTitle className="text-2xl lg:text-3xl font-extralight text-[#0c0b1d] leading-tight">
                  Wait! Don't{' '}
                  <TextHighlight variant="bold-italic" color="red" showUnderline delay={0.2}>
                    Leave
                  </TextHighlight>
                  {' '}Yet
                </DialogTitle>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <DialogDescription className="text-base text-zinc-600 font-extralight leading-relaxed">
                  Get our free{' '}
                  <TextHighlight variant="bold" color="green">
                    HIPAA Compliance Checklist
                  </TextHighlight>
                  {' '}and start protecting your practice today
                </DialogDescription>
              </motion.div>
            </DialogHeader>

            {/* Key Benefits */}
            <motion.div
              className="space-y-3 pt-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              {[
                { icon: Shield, text: '50-item compliance checklist' },
                { icon: FileText, text: '9 required HIPAA policies guide' },
                { icon: CheckCircle2, text: '30-day audit preparation timeline' }
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={index}
                    className="flex items-center gap-3 text-sm text-zinc-700 font-extralight"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                  >
                    <Icon className="w-4 h-4 text-[#1ad07a] shrink-0" />
                    <span>{item.text}</span>
                  </motion.div>
                );
              })}
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="exit-name" className="text-zinc-900 font-extralight">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="exit-name"
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="border-zinc-200 focus:border-[#1ad07a] focus:ring-[#1ad07a] font-extralight"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="exit-email" className="text-zinc-900 font-extralight">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="exit-email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="border-zinc-200 focus:border-[#1ad07a] focus:ring-[#1ad07a] font-extralight"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="exit-phone" className="text-zinc-900 font-extralight">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="exit-phone"
                  type="tel"
                  name="phone_number"
                  placeholder="(555) 123-4567"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  required
                  className="border-zinc-200 focus:border-[#1ad07a] focus:ring-[#1ad07a] font-extralight"
                />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#1ad07a] text-[#0c0b1d] hover:bg-[#1ad07a]/90 font-medium h-12 text-base shadow-lg hover:shadow-xl transition-all"
                >
                  {isSubmitting ? 'Submitting...' : (
                    <>
                      Get Free Checklist
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </motion.div>

              <motion.p
                className="text-xs text-zinc-500 text-center font-extralight"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                By submitting, you agree to receive communications from{' '}
                <TextHighlight variant="semibold" color="default">
                  HIPAA Hub
                </TextHighlight>
                . We respect your privacy and will never share your information.
              </motion.p>
            </form>
          </div>

          {/* Right Side - Image */}
          <div className="hidden lg:block relative w-full h-full min-h-[400px] bg-gradient-to-br from-[#0c0b1d] to-[#1a1a2e]">
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <motion.div
                className="text-center space-y-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-[#1ad07a]/20 flex items-center justify-center">
                  <FileText className="w-10 h-10 text-[#1ad07a]" />
                </div>
                <h3 className="text-2xl text-white font-extralight">
                  <TextHighlight variant="bold" color="green" className="text-[#1ad07a]">
                    Free HIPAA
                  </TextHighlight>
                  {' '}Compliance Checklist
                </h3>
                <p className="text-sm text-white/70 font-extralight">
                  50 items to ensure audit readiness
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
