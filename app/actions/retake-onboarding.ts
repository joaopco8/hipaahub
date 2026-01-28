'use server';

import { clearOnboardingData } from './onboarding';
import { redirect } from 'next/navigation';

/**
 * Action to retake the onboarding
 * Clears all previous onboarding data and redirects to onboarding
 */
export async function retakeOnboarding() {
  try {
    // Clear all previous onboarding data
    await clearOnboardingData();
  } catch (error) {
    console.error('Error retaking onboarding:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to reset onboarding: ${errorMessage}`);
  }
  
  // Redirect to onboarding expectation page
  redirect('/onboarding/expectation');
}

