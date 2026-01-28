'use client';

import { Progress } from '@/components/ui/progress';
import { useOnboarding } from '@/contexts/onboarding-context';

const TOTAL_STEPS = 9;

const stepLabels = [
  'Expectation',
  'Welcome',
  'Organization',
  'Risk Assessment',
  'Results',
  'Action Plan',
  'Documents',
  'Evidence',
  'Staff',
  'Commitment'
];

export function OnboardingProgressBar() {
  const { state } = useOnboarding();
  // Step 0 (expectation) is not counted in progress, so we adjust
  const displayStep = state.currentStep === 0 ? 0 : state.currentStep;
  const progress = displayStep === 0 ? 0 : (displayStep / TOTAL_STEPS) * 100;
  const stepLabel = stepLabels[displayStep] || stepLabels[0];

  // Hide progress bar on expectation step
  if (displayStep === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-2 px-4 py-4 bg-white border-b border-zinc-200">
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-600">
          Step {displayStep} of {TOTAL_STEPS}
        </span>
        <span className="text-zinc-600">
          {stepLabel}
        </span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}

