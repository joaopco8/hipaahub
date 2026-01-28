'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { ArrowUpRight, ArrowRight, Shield, CheckCircle2, LogOut, User } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';

export default function HeroSection() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Error checking auth:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      router.refresh();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <section className="relative w-full overflow-hidden bg-[#0d1122] min-h-screen flex flex-col">
      {/* Header Navigation */}
      <header className="relative z-50 w-full px-6 py-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-hipaa-green rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-hipaa-dark" />
            </div>
            <span className="text-white font-geologica text-xl">HIPAA GUARD</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-white/80 text-sm font-geologica font-light">
            <Link href="/" className="hover:text-hipaa-green transition-colors">HOME</Link>
            <Link href="/products" className="hover:text-hipaa-green transition-colors">PRODUCTS</Link>
            <Link href="/features" className="hover:text-hipaa-green transition-colors">FEATURES</Link>
            <Link href="/how-to-apply" className="hover:text-hipaa-green transition-colors">HOW TO APPLY</Link>
            <Link href="/tools" className="hover:text-hipaa-green transition-colors">TOOLS</Link>
            <Link href="/more" className="hover:text-hipaa-green transition-colors flex items-center gap-1">
              MORE
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            {isLoading ? (
              <div className="w-24 h-10 bg-white/10 rounded-lg animate-pulse" />
            ) : user ? (
              <>
                <Link
                  href="/dashboard"
                  className={cn(
                    buttonVariants({ variant: 'ghost', size: 'lg' }),
                    'text-white/80 hover:text-white hover:bg-white/10 font-geologica rounded-lg px-4 py-2.5 text-sm flex items-center gap-2'
                  )}
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  size="lg"
                  className="text-white/80 hover:text-white hover:bg-white/10 font-geologica rounded-lg px-4 py-2.5 text-sm flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className={cn(
                    buttonVariants({ variant: 'ghost', size: 'lg' }),
                    'text-white/80 hover:text-white hover:bg-white/10 font-geologica rounded-lg px-4 py-2.5 text-sm'
                  )}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className={cn(
                    buttonVariants({ size: 'lg' }),
                    'bg-hipaa-green text-hipaa-dark font-geologica hover:bg-hipaa-green/90 rounded-lg px-6 py-2.5 text-sm'
                  )}
                >
                  GET STARTED
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Hero Content */}
      <div className="flex-1 container mx-auto px-6 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8 z-10">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-geologica font-light text-white leading-tight">
                Unlock Your{' '}
                <span className="relative inline-block font-normal">
                  Business
                  <ArrowUpRight className="absolute -top-1 -right-6 w-6 h-6 text-hipaa-green" />
                </span>{' '}
                Potential with HIPAA Hub
              </h1>
              <p className="text-lg md:text-xl text-white/70 font-geologica font-light leading-relaxed max-w-2xl">
                Achieve business success with HIPAA Hub. Our comprehensive compliance solutions help to unlock your business potential and take your vision to the next level.
              </p>
            </div>

            <Link
              href="/signup"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'bg-hipaa-green text-hipaa-dark font-geologica hover:bg-hipaa-green/90 rounded-lg px-8 py-6 text-base inline-flex items-center gap-2'
              )}
            >
              GET STARTED
              <ArrowRight className="w-5 h-5" />
            </Link>

            {/* Award Badge */}
            <div className="flex items-center gap-3 pt-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center flex-shrink-0">
                <span className="text-xl">🏆</span>
              </div>
              <span className="text-white/60 font-geologica text-sm font-light">
                2025 the world&apos;s best compliance platform
              </span>
            </div>
          </div>

          {/* Right Content - Image and Features */}
          <div className="relative lg:block hidden">
            <div className="relative">
              {/* Main Image Container */}
              <div className="relative bg-hipaa-green/10 rounded-3xl p-6 backdrop-blur-sm border border-hipaa-green/20">
                <div className="relative w-full h-[500px] rounded-2xl overflow-hidden bg-gradient-to-br from-hipaa-green/5 to-hipaa-dark/50">
                  {/* Placeholder for professional image */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-64 bg-hipaa-green/10 rounded-full flex items-center justify-center border border-hipaa-green/20">
                      <Shield className="w-32 h-32 text-hipaa-green/30" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature List - Vertical Line with Dots */}
              <div className="absolute -left-6 top-1/2 -translate-y-1/2">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-hipaa-green"></div>
                    <div className="w-px h-16 bg-hipaa-green/40"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 bg-hipaa-dark/90 backdrop-blur-sm rounded-lg p-3 border border-hipaa-green/20 max-w-[200px]">
                      <CheckCircle2 className="w-4 h-4 text-hipaa-green flex-shrink-0 mt-0.5" />
                      <span className="text-white font-geologica text-xs font-light leading-relaxed">Fast, easy compliance setup</span>
                    </div>
                    <div className="flex items-start gap-3 bg-hipaa-dark/90 backdrop-blur-sm rounded-lg p-3 border border-hipaa-green/20 max-w-[200px]">
                      <CheckCircle2 className="w-4 h-4 text-hipaa-green flex-shrink-0 mt-0.5" />
                      <span className="text-white font-geologica text-xs font-light leading-relaxed">Flexible compliance options</span>
                    </div>
                    <div className="flex items-start gap-3 bg-hipaa-dark/90 backdrop-blur-sm rounded-lg p-3 border border-hipaa-green/20 max-w-[200px]">
                      <CheckCircle2 className="w-4 h-4 text-hipaa-green flex-shrink-0 mt-0.5" />
                      <span className="text-white font-geologica text-xs font-light leading-relaxed">Competitive pricing plans</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <div className="w-px h-16 bg-hipaa-green/40"></div>
                  <div className="w-2 h-2 rounded-full bg-hipaa-green"></div>
                </div>
              </div>

              {/* User Count */}
              <div className="absolute -bottom-4 right-8 flex items-center gap-3 bg-hipaa-dark/95 backdrop-blur-sm rounded-lg px-4 py-2.5 border border-hipaa-green/20">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-full bg-gradient-to-br from-hipaa-green to-hipaa-green/60 border-2 border-hipaa-dark"
                    ></div>
                  ))}
                </div>
                <span className="text-white font-geologica text-xs">12M Active Users</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
