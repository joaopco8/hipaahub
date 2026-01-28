'use client';

import { OnboardingProgressBar } from './progress-bar';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useOnboarding } from '@/contexts/onboarding-context';
import { useRouter, usePathname } from 'next/navigation';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  showBackButton?: boolean;
  showNextButton?: boolean;
  nextButtonLabel?: string;
  nextButtonDisabled?: boolean;
  onNext?: () => void;
  onBack?: () => void;
}

// Map routes to their previous routes
const ROUTE_BACK_MAP: Record<string, string> = {
  '/onboarding': '/onboarding/expectation',
  '/onboarding/organization': '/onboarding',
  '/onboarding/risk-assessment': '/onboarding/organization',
  '/onboarding/results': '/onboarding/risk-assessment',
  '/onboarding/action-plan': '/onboarding/results',
  '/onboarding/documents': '/onboarding/action-plan',
  '/onboarding/staff': '/onboarding/documents',
  '/onboarding/commitment': '/onboarding/staff'
};

export function OnboardingLayout({
  children,
  showBackButton = true,
  showNextButton = true,
  nextButtonLabel = 'Continue',
  nextButtonDisabled = false,
  onNext,
  onBack
}: OnboardingLayoutProps) {
  const { previousStep, nextStep } = useOnboarding();
  const router = useRouter();
  const pathname = usePathname();

  const handleNext = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (onNext) {
      onNext();
    } else {
      // If no custom handler, just advance step
      // Navigation will be handled by the page itself
      nextStep();
    }
  };

  const handleBack = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('Back button clicked, pathname:', pathname); // Debug
    
    if (onBack) {
      onBack();
    } else {
      // Determine previous route based on current pathname
      const previousRoute = ROUTE_BACK_MAP[pathname || ''];
      
      if (previousRoute) {
        console.log('Navigating to:', previousRoute); // Debug
        router.push(previousRoute);
        previousStep();
      } else if (pathname === '/onboarding') {
        // If on welcome page, go to dashboard
        router.push('/dashboard');
      } else {
        // Fallback: go to welcome page
        router.push('/onboarding');
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <OnboardingProgressBar />
      <div className="flex-1 flex flex-col w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-10">
        <div className="flex-1 max-w-[1400px] mx-auto w-full page-transition-premium">
          {children}
        </div>
        <div className="flex items-center justify-between pt-6 border-t border-zinc-200 mt-8">
          <Button
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Back button onClick triggered');
              handleBack(e);
            }}
            className={!showBackButton ? 'invisible' : 'cursor-pointer'}
            type="button"
            style={{ pointerEvents: 'auto' }}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex-1" />
          {showNextButton && (
            <Button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!nextButtonDisabled) {
                  handleNext();
                }
              }} 
              disabled={nextButtonDisabled}
              className="bg-[#1ad07a] text-[#0d1122] hover:bg-[#1ad07a]/90 disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
            >
              {nextButtonLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

