'use client';

import { useEffect } from 'react';
import { useOnboarding } from '@/contexts/onboarding-context';
import { useRouter } from 'next/navigation';
import OrganizationPage from '../organization/page';
import RiskAssessmentPage from '../risk-assessment/page';
import ResultsPage from '../results/page';
import ActionPlanPage from '../action-plan/page';
import DocumentsPage from '../documents/page';
import StaffPage from '../staff/page';

const STEP_COMPONENTS: Record<number, React.ComponentType> = {
  1: () => {
    const router = useRouter();
    useEffect(() => {
      router.push('/onboarding');
    }, [router]);
    return null;
  },
  2: OrganizationPage,
  3: RiskAssessmentPage,
  4: ResultsPage,
  5: ActionPlanPage,
  6: DocumentsPage,
  7: () => {
    // Evidence upload is handled via modal, redirect to next step
    const { nextStep } = useOnboarding();
    useEffect(() => {
      nextStep();
    }, [nextStep]);
    return null;
  },
  8: StaffPage
};

export default function OnboardingStepPage({
  params
}: {
  params: { step: string };
}) {
  const { state, goToStep } = useOnboarding();
  const router = useRouter();
  const step = parseInt(params.step, 10);

  useEffect(() => {
    // Validate step
    if (isNaN(step) || step < 1 || step > 8) {
      router.push('/onboarding');
      return;
    }

    // Redirect logic based on completion
    if (step === 1) {
      if (state.organization) {
        if (state.riskLevel) {
          goToStep(4); // Results
        } else {
          goToStep(3); // Risk Assessment
        }
      } else {
        goToStep(2); // Organization
      }
      return;
    }

    // Ensure prerequisites are met
    if (step === 3 && !state.organization) {
      goToStep(2);
      return;
    }
    if (step === 4 && !state.riskLevel) {
      goToStep(3);
      return;
    }
  }, [step, state, goToStep, router]);

  const StepComponent = STEP_COMPONENTS[step];
  if (!StepComponent) {
    return null;
  }

  return <StepComponent />;
}








