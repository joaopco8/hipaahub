'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export type ClinicType = 'medical' | 'dental' | 'mental-health' | 'therapy';

export interface OrganizationData {
  name: string;
  type: ClinicType;
  state: string;
  employeeCount: number;
}

export interface RiskAssessmentAnswers {
  [key: string]: any;
}

export interface OnboardingState {
  currentStep: number;
  organization: OrganizationData | null;
  riskAssessment: RiskAssessmentAnswers | null;
  riskLevel: 'low' | 'medium' | 'high' | null;
  completedSteps: number[];
}

interface OnboardingContextType {
  state: OnboardingState;
  setOrganization: (data: OrganizationData) => void;
  setRiskAssessment: (answers: RiskAssessmentAnswers) => void;
  setRiskLevel: (level: 'low' | 'medium' | 'high') => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
  markStepComplete: (step: number) => void;
  isStepComplete: (step: number) => boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

const TOTAL_STEPS = 9;

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>({
    currentStep: 1,
    organization: null,
    riskAssessment: null,
    riskLevel: null,
    completedSteps: []
  });

  const setOrganization = (data: OrganizationData) => {
    setState((prev) => ({ ...prev, organization: data }));
  };

  const setRiskAssessment = (answers: RiskAssessmentAnswers) => {
    setState((prev) => ({ ...prev, riskAssessment: answers }));
  };

  const setRiskLevel = (level: 'low' | 'medium' | 'high') => {
    setState((prev) => ({ ...prev, riskLevel: level }));
  };

  const nextStep = () => {
    setState((prev) => {
      const newStep = Math.min(prev.currentStep + 1, TOTAL_STEPS);
      // Trigger navigation via custom event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('onboarding-step-change', { detail: newStep }));
      }
      return {
        ...prev,
        currentStep: newStep
      };
    });
  };

  const previousStep = () => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1)
    }));
  };

  const goToStep = (step: number) => {
    setState((prev) => {
      const newStep = Math.max(1, Math.min(step, TOTAL_STEPS));
      // Trigger navigation via custom event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('onboarding-step-change', { detail: newStep }));
      }
      return {
        ...prev,
        currentStep: newStep
      };
    });
  };

  const markStepComplete = (step: number) => {
    setState((prev) => ({
      ...prev,
      completedSteps: [...prev.completedSteps, step].filter(
        (v, i, a) => a.indexOf(v) === i
      )
    }));
  };

  const isStepComplete = (step: number) => {
    return state.completedSteps.includes(step);
  };

  return (
    <OnboardingContext.Provider
      value={{
        state,
        setOrganization,
        setRiskAssessment,
        setRiskLevel,
        nextStep,
        previousStep,
        goToStep,
        markStepComplete,
        isStepComplete
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}

