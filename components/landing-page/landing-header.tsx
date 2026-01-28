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
    { href: "/docs", label: "Docs" },
    { href: "/blog", label: "Blog" },
    { href: "/#pricing", label: "Pricing" },
  ];

  return (
    <>
      <header className={cn(
        "fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300",
        scrolled || mobileMenuOpen
          ? "bg-white/90 backdrop-blur-md border-b border-zinc-200 py-4 shadow-sm" 
          : "bg-white/60 backdrop-blur-md border-b border-white/30 py-6"
      )}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group relative z-[60]">
              <div className="relative w-32 md:w-40 h-8 md:h-10 transition-transform group-hover:scale-105">
                <Image 
                  src="/images/logoescura.png" 
                  alt="HIPAA Hub" 
                  fill
                  priority
                  className="object-contain"
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-10 text-[#0d0d1f] text-sm">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-[#1acb77] transition-colors">
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop CTA Buttons */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <Link href="/dashboard">
                  <Button
                    className="bg-[#0d0d1f] text-white hover:bg-[#0d0d1f]/90 rounded-lg px-6"
                  >
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/signin">
                    <Button
                      variant="ghost"
                      className="text-[#0d0d1f] hover:text-[#1acb77] hover:bg-transparent text-sm"
                    >
                      Log in
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button
                      className="bg-[#1acb77] text-[#0d0d1f] hover:bg-[#1acb77]/90 rounded-lg px-6 shadow-md hover:shadow-lg transition-all"
                    >
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden relative z-[60] p-2 text-[#0d0d1f]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Overlay */}
        <div className={cn(
          "fixed inset-0 bg-white/80 backdrop-blur-lg z-50 md:hidden transition-all duration-500 flex flex-col p-6 pt-24 gap-6",
          mobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
        )}>
          <nav className="flex flex-col gap-4 text-base font-light text-[#0d0d1f]">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#1acb77] transition-colors py-2"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          
          <div className="mt-auto flex flex-col gap-3">
            {user ? (
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-[#0d0d1f] text-white h-12 rounded-lg text-base">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/signin" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full border-2 border-[#0d0d1f] text-[#0d0d1f] h-12 rounded-lg text-base">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-[#1acb77] text-[#0d0d1f] h-12 rounded-lg text-base">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
