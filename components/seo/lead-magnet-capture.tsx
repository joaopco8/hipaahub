'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Mail } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { TextHighlight } from '@/components/landing-page/text-highlight';

interface LeadMagnetCaptureProps {
  title: string;
  description: string;
  downloadUrl: string;
  fileName: string;
  ctaText?: string;
}

export function LeadMagnetCapture({
  title,
  description,
  downloadUrl,
  fileName,
  ctaText = 'Download Now'
}: LeadMagnetCaptureProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);

    try {
      // Save email to database
      const { error } = await supabase.from('user_email_list').insert([
        { email, source: 'lead_magnet', lead_magnet_name: fileName }
      ]);

      if (error) throw error;

      // Trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Check your email! We sent you the download link.');
      setEmail('');
    } catch (error) {
      console.error('Error capturing lead:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="bg-gradient-to-br from-white to-[#f3f5f9] border-2 border-[#1ad07a]/30 rounded-2xl p-8 space-y-6 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="flex items-center gap-3"
        initial={{ opacity: 0, x: -10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="p-3 rounded-xl bg-[#1ad07a] text-[#0c0b1d] shadow-md">
          <Download className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-[#0c0b1d]">
            <TextHighlight variant="bold" color="default">
              {title}
            </TextHighlight>
          </h3>
          <p className="text-sm text-zinc-600 font-extralight">{description}</p>
        </div>
      </motion.div>

      <motion.form
        onSubmit={handleSubmit}
        className="space-y-4"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div>
          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-zinc-200 focus:border-[#1ad07a] focus:ring-[#1ad07a] font-extralight"
            required
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#1ad07a] hover:bg-[#1ad07a]/90 text-[#0c0b1d] font-medium shadow-lg hover:shadow-xl transition-all"
        >
          {isLoading ? 'Downloading...' : ctaText}
          <Download className="ml-2 w-4 h-4" />
        </Button>
      </motion.form>

      <motion.p
        className="text-xs text-zinc-500 text-center font-extralight"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
      >
        By downloading, you agree to receive HIPAA compliance tips and updates from{' '}
        <TextHighlight variant="semibold" color="default">
          HIPAA Hub
        </TextHighlight>
        . Unsubscribe anytime.
      </motion.p>
    </motion.div>
  );
}
