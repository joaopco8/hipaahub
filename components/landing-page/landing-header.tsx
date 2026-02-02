'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LandingHeader() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        setUser(null);
      }
    };
    checkAuth();
  }, [supabase]);

  const navLinks = [
    { href: "/#features", label: "Features" },
    { href: "/#how-it-works", label: "How it works" },
    { href: "/#problem", label: "Problem" },
    { href: "/#proof", label: "Proof" },
    { href: "/docs", label: "Docs" },
    { href: "/blog", label: "Blog" },
    { href: "/#pricing", label: "Pricing" },
    { href: "/#faq", label: "FAQ" },
  ];

  return (
    <>
      <header className={cn(
        "fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300",
        scrolled || mobileMenuOpen
          ? "bg-[#0c0b1d]/95 backdrop-blur-md border-b border-[#0c0b1d]/20 py-3 sm:py-4 shadow-lg" 
          : "bg-[#0c0b1d]/90 backdrop-blur-md border-b border-[#0c0b1d]/30 py-3 sm:py-4 md:py-6"
      )}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group relative z-[60]">
              <div className="relative w-24 sm:w-32 md:w-40 h-6 sm:h-8 md:h-10 transition-transform group-hover:scale-105">
                <Image 
                  src="/logohipa.png" 
                  alt="HIPAA Hub" 
                  fill
                  priority
                  className="object-contain"
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-white text-sm font-medium">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-[#1ad07a] transition-colors whitespace-nowrap">
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop CTA Buttons */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <Link href="/dashboard">
                  <Button
                    className="bg-[#1ad07a] text-[#0c0b1d] hover:bg-[#1ad07a]/90 rounded-lg px-6 font-medium"
                  >
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/signin">
                    <Button
                      variant="ghost"
                      className="text-white hover:text-[#1ad07a] hover:bg-white/10 text-sm"
                    >
                      Log in
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button
                      className="bg-[#1ad07a] text-[#0c0b1d] hover:bg-[#1ad07a]/90 rounded-lg px-6 shadow-md hover:shadow-lg transition-all font-medium"
                    >
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden relative z-[60] p-2 text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay - Full Screen (Outside Header) */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-[100] md:hidden" 
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh'
          }}
        >
          {/* Full screen background - Dark solid with blur */}
          <div className="absolute inset-0 bg-[#0c0b1d] backdrop-blur-xl" />
          <div className="absolute inset-0 bg-[#0c0b1d]/95" />
          
          {/* Content container - Full height and width */}
          <div className="relative z-10 flex flex-col h-full w-full">
            {/* Header with Close button - Fixed at top */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <div className="w-8 h-8" /> {/* Spacer for alignment */}
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-white hover:text-[#1ad07a] transition-colors rounded-lg hover:bg-white/10"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              {/* Navigation Links - Start at same height as X button */}
              <nav className="flex flex-col gap-1 text-lg font-light text-white">
                {navLinks.map((link) => (
                  <Link 
                    key={link.href} 
                    href={link.href} 
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:text-[#1ad07a] transition-colors py-4 px-4 rounded-lg hover:bg-white/10 active:bg-white/5"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              
              {/* CTA Buttons - Always visible at bottom */}
              <div className="flex flex-col gap-3 pt-6 pb-4">
                {user ? (
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-[#1ad07a] text-[#0c0b1d] h-14 rounded-lg text-base font-medium shadow-lg hover:bg-[#1ad07a]/90">
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/signin" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full border-2 border-white/30 text-white hover:bg-white/10 h-14 rounded-lg text-base backdrop-blur-sm">
                        Log in
                      </Button>
                    </Link>
                    <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full bg-[#1ad07a] text-[#0c0b1d] h-14 rounded-lg text-base font-medium shadow-lg hover:bg-[#1ad07a]/90">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
