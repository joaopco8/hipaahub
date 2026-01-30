/**
 * Last Updated Tracking
 * OCR hates outdated documentation - this tracks staleness
 */

export interface LastUpdatedInfo {
  last_updated: Date;
  is_outdated: boolean;
  outdated_reason?: string;
  days_since_update: number;
  next_review_date?: Date;
}

/**
 * Determine if item is outdated based on type and frequency
 */
export function checkIfOutdated(
  lastUpdated: Date,
  itemType: 'policy' | 'evidence' | 'training' | 'sra' | 'baa',
  frequency?: 'annually' | 'quarterly' | 'monthly' | 'continuously' | 'on_event'
): LastUpdatedInfo {
  const now = new Date();
  const daysSinceUpdate = Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
  
  let isOutdated = false;
  let outdatedReason: string | undefined;
  let maxDays: number;
  let nextReviewDate: Date | undefined;

  // Determine staleness thresholds by type and frequency
  switch (itemType) {
    case 'sra':
      maxDays = 365; // SRA must be updated annually
      if (daysSinceUpdate > maxDays) {
        isOutdated = true;
        outdatedReason = 'SRA older than 12 months. OCR expects annual updates.';
      }
      nextReviewDate = new Date(lastUpdated);
      nextReviewDate.setDate(nextReviewDate.getDate() + 365);
      break;

    case 'policy':
      maxDays = 365; // Policies should be reviewed annually
      if (daysSinceUpdate > maxDays) {
        isOutdated = true;
        outdatedReason = 'Policy not reviewed in over 12 months.';
      }
      nextReviewDate = new Date(lastUpdated);
      nextReviewDate.setDate(nextReviewDate.getDate() + 365);
      break;

    case 'training':
      maxDays = 365; // Training must be annual
      if (daysSinceUpdate > maxDays) {
        isOutdated = true;
        outdatedReason = 'Training records older than 12 months. Annual refresh required.';
      }
      nextReviewDate = new Date(lastUpdated);
      nextReviewDate.setDate(nextReviewDate.getDate() + 365);
      break;

    case 'baa':
      maxDays = 1095; // BAAs typically 3 years, but should review annually
      if (daysSinceUpdate > 365) {
        isOutdated = true;
        outdatedReason = 'BAA should be reviewed annually even if not expired.';
      }
      nextReviewDate = new Date(lastUpdated);
      nextReviewDate.setDate(nextReviewDate.getDate() + 365);
      break;

    case 'evidence':
      // Evidence frequency-dependent
      switch (frequency) {
        case 'annually':
          maxDays = 365;
          if (daysSinceUpdate > maxDays) {
            isOutdated = true;
            outdatedReason = 'Evidence older than 12 months.';
          }
          nextReviewDate = new Date(lastUpdated);
          nextReviewDate.setDate(nextReviewDate.getDate() + 365);
          break;
        case 'quarterly':
          maxDays = 90;
          if (daysSinceUpdate > maxDays) {
            isOutdated = true;
            outdatedReason = 'Evidence older than 90 days (quarterly refresh required).';
          }
          nextReviewDate = new Date(lastUpdated);
          nextReviewDate.setDate(nextReviewDate.getDate() + 90);
          break;
        case 'monthly':
          maxDays = 30;
          if (daysSinceUpdate > maxDays) {
            isOutdated = true;
            outdatedReason = 'Evidence older than 30 days (monthly refresh required).';
          }
          nextReviewDate = new Date(lastUpdated);
          nextReviewDate.setDate(nextReviewDate.getDate() + 30);
          break;
        case 'continuously':
          maxDays = 30; // Logs should be recent
          if (daysSinceUpdate > maxDays) {
            isOutdated = true;
            outdatedReason = 'Continuous evidence (logs) should be recent (< 30 days).';
          }
          nextReviewDate = new Date(lastUpdated);
          nextReviewDate.setDate(nextReviewDate.getDate() + 30);
          break;
        default:
          maxDays = 365;
          nextReviewDate = new Date(lastUpdated);
          nextReviewDate.setDate(nextReviewDate.getDate() + 365);
      }
      break;
  }

  return {
    last_updated: lastUpdated,
    is_outdated: isOutdated,
    outdated_reason: outdatedReason,
    days_since_update: daysSinceUpdate,
    next_review_date: nextReviewDate
  };
}

/**
 * Format last updated for display
 */
export function formatLastUpdated(date: Date): string {
  const now = new Date();
  const days = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

/**
 * Get staleness badge color
 */
export function getStalenessColor(daysSinceUpdate: number, maxDays: number): {
  bg: string;
  text: string;
  border: string;
} {
  const percentage = (daysSinceUpdate / maxDays) * 100;

  if (percentage < 50) {
    return {
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-300'
    };
  } else if (percentage < 90) {
    return {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      border: 'border-yellow-300'
    };
  } else {
    return {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-300'
    };
  }
}
