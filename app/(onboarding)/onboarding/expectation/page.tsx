'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

export default function ExpectationPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    console.log('ExpectationPage: useEffect started');
    
    // Timeout fallback - show page after 3 seconds even if auth check is stuck
    const timeoutFallback = setTimeout(() => {
      console.warn('ExpectationPage: Auth check timeout - showing page anyway');
      setIsCheckingAuth(false);
      setIsAuthenticated(true);
    }, 3000);

    const checkAuth = async () => {
      try {
        console.log('ExpectationPage: Starting auth check...');
        console.log('ExpectationPage: Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET');
        console.log('ExpectationPage: Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
        
        const supabase = createClient();
        console.log('ExpectationPage: Supabase client created');
        
        // Add timeout to getUser call
        const authPromise = supabase.auth.getUser();
        const timeoutPromise = new Promise<{ data: { user: null }, error: { message: string } }>((_, reject) => 
          setTimeout(() => reject(new Error('Auth check timeout')), 2000)
        );
        
        let result;
        try {
          result = await Promise.race([
            authPromise,
            timeoutPromise
          ]);
        } catch (timeoutError) {
          console.warn('ExpectationPage: Auth check timed out, showing page anyway');
          clearTimeout(timeoutFallback);
          setIsCheckingAuth(false);
          setIsAuthenticated(true);
          return;
        }
        
        const { data: { user }, error: authError } = result;
        
        clearTimeout(timeoutFallback);
        
        if (authError) {
          console.error('ExpectationPage: Auth error:', authError);
          // Don't redirect immediately - show page first
          setIsAuthenticated(true);
          setIsCheckingAuth(false);
          // Redirect after a moment
          setTimeout(() => {
            router.push('/signup?redirect=checkout');
          }, 2000);
          return;
        }
        
        if (!user) {
          console.log('ExpectationPage: User not authenticated');
          // Show page first, then redirect
          setIsAuthenticated(true);
          setIsCheckingAuth(false);
          setTimeout(() => {
            router.push('/signup?redirect=checkout');
          }, 2000);
          return;
        }
        
        console.log('ExpectationPage: User authenticated:', user.id);
        setIsAuthenticated(true);
        setIsCheckingAuth(false);
        
        // Auto-advance after 3 seconds
        const timer = setTimeout(() => {
          console.log('ExpectationPage: Auto-advancing to onboarding');
          router.push('/onboarding');
        }, 3000);

        return () => clearTimeout(timer);
      } catch (error: any) {
        console.error('ExpectationPage: Error checking auth:', error);
        clearTimeout(timeoutFallback);
        setIsCheckingAuth(false);
        // Always show the page on error - don't block
        setIsAuthenticated(true);
      }
    };

    checkAuth();
    
    return () => {
      clearTimeout(timeoutFallback);
    };
  }, [router]);

  const handleContinue = () => {
    router.push('/onboarding');
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#f3f5f9] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="loading-spinner-premium mx-auto" />
          <p className="text-zinc-600 animate-pulse">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render content if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f3f5f9] flex flex-col">
      <div className="flex-1 flex flex-col max-w-[1600px] mx-auto w-full px-4 py-8">
        <div className="flex-1 page-transition-premium">
          <div className="space-y-6 max-w-2xl mx-auto w-full">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1ad07a]/10 mb-4">
            <Clock className="h-8 w-8 text-[#1ad07a]" />
          </div>
          <h1 className="text-3xl font-extralight text-zinc-900">
            What to Expect
          </h1>
          <p className="text-lg text-zinc-600">
            Over the next 20-30 minutes, HIPAA Hub will:
          </p>
        </div>

        <Card className="card-premium-enter stagger-item">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#1ad07a] shrink-0 mt-0.5" />
              <div>
                <h3 className="font-extralight text-zinc-900 mb-1">
                  Assess your HIPAA risk
                </h3>
                <p className="text-sm text-zinc-600">
                  Complete a quick questionnaire about your security practices
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#1ad07a] shrink-0 mt-0.5" />
              <div>
                <h3 className="font-extralight text-zinc-900 mb-1">
                  Identify compliance gaps
                </h3>
                <p className="text-sm text-zinc-600">
                  Get a clear picture of what needs attention
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#1ad07a] shrink-0 mt-0.5" />
              <div>
                <h3 className="font-extralight text-zinc-900 mb-1">
                  Generate your compliance action plan
                </h3>
                <p className="text-sm text-zinc-600">
                  Receive a prioritized list of tasks to become compliant
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#1ad07a] shrink-0 mt-0.5" />
              <div>
                <h3 className="font-extralight text-zinc-900 mb-1">
                  Prepare audit-ready documentation
                </h3>
                <p className="text-sm text-zinc-600">
                  Generate professional HIPAA policies and documents instantly
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-600">Progress</span>
            <span className="text-zinc-600">Estimated duration: 20-30 minutes</span>
          </div>
          <Progress value={0} className="h-2" />
        </div>
          </div>
        </div>
        <div className="flex items-center justify-center pt-6 border-t border-zinc-200 mt-8">
          <Button
            onClick={handleContinue}
            className="bg-[#1ad07a] text-[#0d1122] hover:bg-[#1ad07a]/90"
            type="button"
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
}

