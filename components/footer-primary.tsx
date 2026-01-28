'use client'
import { useState } from "react"
import React from 'react'
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { Shield, ArrowRight, Linkedin, Instagram, Mail } from 'lucide-react';

export default function FooterPrimary() {
  const [email, setEmail] = useState('')
  const supabase = createClient()

  const certificateImages = [
    '/images/certifica/lh2OZHoa6vWkCIdtwhJgJ4OH8.png',
    '/images/certifica/qeCP87kIOhUjSnHbsf9ZYKl6nog.avif',
    '/images/certifica/rDLougW3lvlvBBNVWPnp7qm1AH8.png',
    '/images/certifica/tBZpvW6AhYhkuyrCFWibAiSpA.png',
    '/images/certifica/XIpzXmr735QBrMd2zKW6qCBMBaQ.png',
    '/images/certifica/yLWevTQjUl8ckOOua7U9HRkCY.png',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('user_email_list')
        .insert([{ email }])
      
      if (error) throw error

      toast.success("Thank you for subscribing!")
      setEmail('')
    } catch (error) {
      console.error('Error inserting email:', error)
      toast.error("An error occurred. Please try again.")
    }
  }

  return (
    <footer className="bg-[#0d0d1f] border-t border-white/10 pt-24 md:pt-32 pb-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
          
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-10">
            <Link href="/" className="inline-block">
              <div className="relative w-48 h-12 transition-transform hover:scale-105">
                <Image 
                  src="/logohipa.png" 
                  alt="HIPAA Hub" 
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
            <p className="text-white/70 font-light leading-relaxed max-w-sm text-lg">
              The institutional standard for healthcare compliance and audit defense.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/80 hover:bg-[#1acb77] hover:text-[#0d0d1f] transition-all border border-white/10">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/80 hover:bg-[#1acb77] hover:text-[#0d0d1f] transition-all border border-white/10">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-2 space-y-8">
            <h4 className="text-sm font-medium text-white tracking-tight">Company</h4>
            <ul className="space-y-5">
              <li><Link href="/blog" className="text-white/70 hover:text-[#1acb77] font-light transition-colors">Blog</Link></li>
              <li><Link href="/#pricing" className="text-white/70 hover:text-[#1acb77] font-light transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-8">
            <h4 className="text-sm font-medium text-white tracking-tight">Resources</h4>
            <ul className="space-y-5">
              <li><Link href="/#how-it-works" className="text-white/70 hover:text-[#1acb77] font-light transition-colors">How it works</Link></li>
              <li><Link href="/#features" className="text-white/70 hover:text-[#1acb77] font-light transition-colors">Features</Link></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="md:col-span-4 space-y-8">
            <h4 className="text-sm font-medium text-white tracking-tight">Contact</h4>
            <div className="space-y-6">
              <div className="flex items-start gap-4 text-white/70">
                <Mail className="w-5 h-5 text-[#1acb77] shrink-0 mt-0.5" />
                <span className="font-light">hello@hipaahub.com</span>
              </div>
            </div>
            
            {/* Training certificates - Horizontal */}
            <div className="space-y-4 pt-6">
              <p className="text-sm text-white/60 font-light">Training certificates</p>
              <div className="flex flex-wrap gap-3">
                {certificateImages.map((src) => (
                  <div
                    key={src}
                    className="relative w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden bg-white/5 border border-white/10"
                  >
                    <Image src={src} alt="Certificate" fill className="object-cover opacity-80" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-wrap justify-center items-center gap-8 text-xs font-medium tracking-widest text-white/50">
            <span>© 2026 HIPAA Hub Inc.</span>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of service</Link>
            <Link href="/baa" className="hover:text-white transition-colors">BAA</Link>
            <Link href="/cookies" className="hover:text-white transition-colors">Cookie settings</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
