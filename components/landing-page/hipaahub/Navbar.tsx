'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X, User, LayoutDashboard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';


const Navbar: React.FC<{ 
  onNavigate: (view: string) => void;
  onDemoClick?: () => void;
}> = ({ onNavigate, onDemoClick }) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  // Check authentication AND subscription status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const authenticated = !!user;
        setIsAuthenticated(authenticated);

        if (authenticated && user) {
          const { data: subs } = await supabase
            .from('subscriptions')
            .select('id, status')
            .eq('user_id', user.id)
            .in('status', ['active', 'trialing'])
            .limit(1);
          setHasSubscription(!!subs && subs.length > 0);
        } else {
          setHasSubscription(false);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsAuthenticated(false);
        setHasSubscription(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const authenticated = !!session?.user;
      setIsAuthenticated(authenticated);
      if (authenticated && session?.user) {
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

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleNavigation = (id?: string) => {
    setIsMenuOpen(false);
    if (!id) return;

    if (id === 'pricing-section') {
      // First ensure we are on home view
      onNavigate('home');
      // Small delay to allow react to render the home view before scrolling
      setTimeout(() => {
        const element = document.getElementById('pricing');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return;
    }

    onNavigate(id);
  };

  const navLinks = [
    { label: 'Platform', id: 'platform' },
    { label: 'Blog', id: 'blog' },
    { label: 'Research', id: 'research' },
    { label: 'Company', id: 'company' },
  ];

  return (
    <nav className="w-full sticky top-0 z-[100] bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-12 h-[72px] flex items-center justify-between">
        <div className="flex items-center shrink-0">
          <button onClick={() => onNavigate('home')} className="flex items-center hover:opacity-80 transition-opacity">
            <Image 
              src="/logoescura.png" 
              alt="HIPAA Hub" 
              width={120}
              height={32}
              className="object-contain"
              priority
            />
          </button>
        </div>

        <div className="hidden xl:flex items-center space-x-8 h-full">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavigation(link.id)}
              className="text-gray-600 hover:text-cisco-blue transition-colors text-sm font-thin py-4 h-full flex items-center"
            >
              {link.label}
            </button>
          ))}
          <button 
            onClick={() => handleNavigation('pricing-section')}
            className="text-gray-600 hover:text-cisco-blue transition-colors text-sm font-thin py-4 h-full flex items-center"
          >
            Pricing
          </button>
        </div>

        <div className="flex items-center space-x-4 md:space-x-6 shrink-0">
          {!isCheckingAuth && (
            <>
              {isAuthenticated && hasSubscription ? (
                <Link 
                  href="/dashboard"
                  className="bg-cisco-green text-white px-4 md:px-6 py-3 text-xs md:text-sm font-thin hover:bg-[#17b86a] transition-all shadow-md shadow-cisco-green/10 flex items-center space-x-2"
                >
                  <LayoutDashboard size={16} />
                  <span>Go to Dashboard</span>
                </Link>
              ) : (
                <>
                  <Link 
                    href="/signin"
                    className="hidden sm:flex items-center space-x-2 text-gray-600 hover:text-cisco-blue transition-colors text-sm font-thin"
                  >
                    <User size={16} />
                    <span>Login</span>
                  </Link>

                  <button 
                    onClick={onDemoClick}
                    className="bg-cisco-blue text-white px-4 md:px-6 py-3 text-xs md:text-sm font-thin hover:bg-cisco-navy transition-all shadow-md shadow-cisco-blue/10"
                  >
                    Request Demo
                  </button>
                </>
              )}
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

      <div className={`
        xl:hidden fixed inset-0 top-[72px] bg-white z-[90] transition-all duration-300
        ${isMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}
      `}>
        <div className="h-full overflow-y-auto p-8 space-y-10">
          {!isCheckingAuth && (
            <div className="sm:hidden border-b border-gray-100 pb-6">
              {isAuthenticated && hasSubscription ? (
                <Link 
                  href="/dashboard"
                  className="flex items-center space-x-2 text-cisco-green hover:text-[#17b86a] transition-colors text-lg font-thin"
                >
                  <LayoutDashboard size={20} />
                  <span>Go to Dashboard</span>
                </Link>
              ) : (
                <Link 
                  href="/signin"
                  className="flex items-center space-x-2 text-cisco-navy hover:text-cisco-blue transition-colors text-lg font-thin"
                >
                  <User size={20} />
                  <span>Account Login</span>
                </Link>
              )}
            </div>
          )}

          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavigation(link.id)}
              className="text-xl font-thin text-cisco-navy border-b border-gray-50 pb-2 w-full text-left hover:text-cisco-blue transition-colors"
            >
              {link.label}
            </button>
          ))}
          
          <div className="space-y-4">
            <button 
              onClick={() => handleNavigation('pricing-section')}
              className="text-xl font-thin text-cisco-navy border-b border-gray-50 pb-2 w-full text-left"
            >
              Pricing
            </button>
            {!isCheckingAuth && !(isAuthenticated && hasSubscription) && (
              <button 
                onClick={onDemoClick}
                className="w-full bg-cisco-blue text-white px-6 py-4 text-sm font-thin hover:bg-cisco-navy transition-all mt-6"
              >
                Request Demo
              </button>
            )}
            {!isCheckingAuth && isAuthenticated && hasSubscription && (
              <Link 
                href="/dashboard"
                className="w-full bg-cisco-green text-white px-6 py-4 text-sm font-thin hover:bg-[#17b86a] transition-all mt-6 flex items-center justify-center space-x-2"
              >
                <LayoutDashboard size={18} />
                <span>Go to Dashboard</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
