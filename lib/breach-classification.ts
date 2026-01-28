/**
 * Breach Legal Classification Logic
 * Determines if a breach is reportable under 45 CFR §164.402
 * 
 * Rule: If PHI was encrypted at rest AND in transit, it's NOT a reportable breach
 */

import type { BreachDetails } from './document-templates/breach-notification-letters';

export type BreachLegalStatus = 'Not Reportable' | 'Reportable' | 'Under Investigation';

/**
 * Classify breach legal status based on encryption
 */
export function classifyBreachLegalStatus(breachDetails: BreachDetails): BreachLegalStatus {
  // If encryption status is unknown, default to "Under Investigation"
  if (
    breachDetails.encryptionAtRest === 'Unknown' ||
    breachDetails.encryptionInTransit === 'Unknown' ||
    !breachDetails.encryptionAtRest ||
    !breachDetails.encryptionInTransit
  ) {
    return 'Under Investigation';
  }

  // If PHI was encrypted at rest AND in transit, it's NOT a reportable breach
  if (breachDetails.encryptionAtRest === 'Yes' && breachDetails.encryptionInTransit === 'Yes') {
    return 'Not Reportable';
  }

  // Otherwise, it's a reportable breach
  return 'Reportable';
}

/**
 * Check if breach notification is required
 */
export function isBreachNotificationRequired(breachDetails: BreachDetails): boolean {
  const status = classifyBreachLegalStatus(breachDetails);
  return status === 'Reportable';
}

/**
 * Get legal defense statement for encrypted breaches
 */
export function getLegalDefenseStatement(breachDetails: BreachDetails): string | null {
  if (breachDetails.encryptionAtRest === 'Yes' && breachDetails.encryptionInTransit === 'Yes') {
    return `This incident does not constitute a reportable breach under 45 CFR §164.402 because the Protected Health Information (PHI) was encrypted at rest and in transit using encryption methods that render the PHI unusable, unreadable, or indecipherable to unauthorized individuals.`;
  }
  return null;
}
