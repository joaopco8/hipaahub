'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X, User, LayoutDashboard, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';

export function BlogNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  useEffect(() => {
    const supabase = createClient();
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setIsAuthenticated(!!user);
        if (user) {
          const { data: subs } = await supabase
            .from('subscriptions')
            .select('id, status')
            .eq('user_id', user.id)
            .in('status', ['active', 'trialing'])
            .limit(1);
          setHasSubscription(!!subs && subs.length > 0);
        }
      } catch {
        setIsAuthenticated(false);
        setHasSubscription(false);
      }
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsAuthenticated(!!session?.user);
      if (session?.user) {
        const { data: subs } = await supabase
          .from('subscriptions')
          .select('id, status')
          .eq('user_id', session.user.id)
          .in('status', ['active', 'trialing'])
          .limit(1);
        setHasSubscription(!!subs && subs.length > 0);
      } else {
        setHasSubscription(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const navLinks = [
    { label: 'Platform', href: '/#features' },
    { label: 'Blog', href: '/blog' },
    { label: 'Pricing', href: '/#pricing' },
  ];

  return (
    <nav className="w-full sticky top-0 z-[100] bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-12 h-[72px] flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
          <Image
            src="/logoescura.png"
            alt="HIPAA Hub"
            width={120}
            height={32}
            className="object-contain"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden xl:flex items-center space-x-8 h-full">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-gray-600 hover:text-[#00bceb] transition-colors text-sm font-thin py-4 h-full flex items-center"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex items-center space-x-4 md:space-x-6 shrink-0">
          {isAuthenticated && hasSubscription ? (
            <Link
              href="/dashboard"
              className="bg-[#71BC48] text-white px-4 md:px-6 py-3 text-xs md:text-sm font-thin hover:bg-[#5fa33e] transition-all shadow-md flex items-center space-x-2"
            >
              <LayoutDashboard size={16} />
              <span>Go to Dashboard</span>
            </Link>
          ) : (
            <>
              <Link
                href="/risk-score"
                className="hidden xl:inline-flex items-center gap-1.5 border border-[#00bceb]/30 bg-[#00bceb]/5 text-[#0e274e] px-3 py-1.5 text-xs font-thin hover:bg-[#00bceb]/10 hover:border-[#00bceb]/40 transition-colors"
              >
                Free Risk Score <ArrowUpRight size={14} />
              </Link>
              <Link
                href="/signin"
                className="hidden sm:flex items-center space-x-2 text-gray-600 hover:text-[#00bceb] transition-colors text-sm font-thin"
              >
                <User size={16} />
                <span>Login</span>
              </Link>
              <Link
                href="/signup"
                className="bg-[#00bceb] text-white px-4 md:px-6 py-3 text-xs md:text-sm font-thin hover:bg-[#0e274e] transition-all shadow-md"
              >
                Start Free Trial
              </Link>
            </>
          )}

          <button
            className="xl:hidden text-gray-600 p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`xl:hidden fixed inset-0 top-[72px] bg-white z-[90] transition-all duration-300 ${isMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}>
        <div className="h-full overflow-y-auto p-8 space-y-8">
          {isAuthenticated && hasSubscription ? (
            <Link
              href="/dashboard"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center space-x-2 text-[#71BC48] text-lg font-thin"
            >
              <LayoutDashboard size={20} />
              <span>Go to Dashboard</span>
            </Link>
          ) : (
            <Link
              href="/signin"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center space-x-2 text-[#0e274e] text-lg font-thin"
            >
              <User size={20} />
              <span>Account Login</span>
            </Link>
          )}

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="block text-xl font-thin text-[#0e274e] border-b border-gray-50 pb-2 hover:text-[#00bceb] transition-colors"
            >
              {link.label}
            </Link>
          ))}

          <div className="space-y-4 pt-4">
            <Link
              href="/risk-score"
              onClick={() => setIsMenuOpen(false)}
              className="inline-flex items-center justify-between gap-4 w-full border border-[#00bceb]/30 bg-[#00bceb]/5 text-[#0e274e] px-4 py-3 text-base font-thin"
            >
              <span>Free Risk Score</span>
              <ArrowUpRight size={18} />
            </Link>
            {!(isAuthenticated && hasSubscription) && (
              <Link
                href="/signup"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full bg-[#00bceb] text-white px-6 py-4 text-sm font-thin hover:bg-[#0e274e] transition-all text-center"
              >
                Start Free Trial
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
