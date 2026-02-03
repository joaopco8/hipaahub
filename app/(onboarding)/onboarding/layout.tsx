'use client';

import { OnboardingProvider } from '@/contexts/onboarding-context';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function OnboardingLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    // Check auth on client side to avoid Server Component issues
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          console.log('Onboarding Layout: User not authenticated, redirecting to signup');
          router.push('/signup?redirect=checkout');
          return;
        }

        console.log('Onboarding Layout: User authenticated:', user.id);
      } catch (error: any) {
        console.error('Onboarding Layout: Error checking auth:', error);
        // Continue anyway - let the page handle it
      }
    };

    checkAuth();
  }, [router]);

  // Always render - don't block on anything
  return <OnboardingProvider>{children}</OnboardingProvider>;
}


