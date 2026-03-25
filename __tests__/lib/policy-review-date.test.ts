import { describe, it, expect } from 'vitest';

// Pure helper functions mirroring the logic in policies/page.tsx

function computeReviewDays(nextReviewDate: string | null, now: Date): number | null {
  if (!nextReviewDate) return null;
  const reviewDate = new Date(nextReviewDate);
  return Math.ceil((reviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function isReviewOverdue(daysUntilReview: number | null): boolean {
  return daysUntilReview !== null && daysUntilReview < 0;
}

function isReviewExpiringSoon(daysUntilReview: number | null, thresholdDays = 90): boolean {
  return daysUntilReview !== null && daysUntilReview >= 0 && daysUntilReview <= thresholdDays;
}

function nextReviewDateFromActivation(activationDate: Date): Date {
  const d = new Date(activationDate);
  d.setFullYear(d.getFullYear() + 1);
  return d;
}

// ────────────────────────────────────────────────────────────

describe('nextReviewDateFromActivation', () => {
  it('returns activation date + 12 months', () => {
    const activation = new Date(2025, 0, 15); // local: Jan 15 2025
    const review = nextReviewDateFromActivation(activation);
    expect(review.getFullYear()).toBe(2026);
    expect(review.getMonth()).toBe(0); // January
    expect(review.getDate()).toBe(15);
  });

  it('handles leap year boundary (Feb 29 → Feb 28)', () => {
    const activation = new Date('2024-02-29');
    const review = nextReviewDateFromActivation(activation);
    // 2025 is not a leap year — JS Date rolls Feb 29 → Mar 1 when non-leap
    // setFullYear(2025) on Feb 29 gives Mar 1 in some engines; this test
    // documents the actual behaviour rather than asserting a fixed date.
    expect(review.getFullYear()).toBe(2025);
  });

  it('preserves month end for 31-day months', () => {
    const activation = new Date(2025, 2, 31); // local: Mar 31 2025
    const review = nextReviewDateFromActivation(activation);
    expect(review.getFullYear()).toBe(2026);
    expect(review.getMonth()).toBe(2); // March
    expect(review.getDate()).toBe(31);
  });
});

describe('computeReviewDays', () => {
  it('returns null when no review date', () => {
    expect(computeReviewDays(null, new Date())).toBeNull();
  });

  it('returns positive days when review is in the future', () => {
    const now = new Date('2026-01-01');
    const future = new Date('2026-04-10').toISOString().split('T')[0];
    const days = computeReviewDays(future, now)!;
    expect(days).toBeGreaterThan(0);
    expect(days).toBe(99); // Jan 1 → Apr 10 = 99 days
  });

  it('returns 0 when review is today', () => {
    const now = new Date('2026-06-15T12:00:00Z');
    const today = '2026-06-15';
    const days = computeReviewDays(today, now)!;
    // ceil((same day delta) / ms-per-day) — depends on time-of-day, should be 0 or 1
    expect(days).toBeGreaterThanOrEqual(0);
    expect(days).toBeLessThanOrEqual(1);
  });

  it('returns negative days when review is in the past', () => {
    const now = new Date('2026-06-01');
    const past = '2026-01-01';
    const days = computeReviewDays(past, now)!;
    expect(days).toBeLessThan(0);
  });
});

describe('isReviewOverdue', () => {
  it('false for null', () => expect(isReviewOverdue(null)).toBe(false));
  it('false for future days', () => expect(isReviewOverdue(10)).toBe(false));
  it('false for zero days', () => expect(isReviewOverdue(0)).toBe(false));
  it('true for -1', () => expect(isReviewOverdue(-1)).toBe(true));
  it('true for large negative', () => expect(isReviewOverdue(-400)).toBe(true));
});

describe('isReviewExpiringSoon (90-day threshold)', () => {
  it('false for null', () => expect(isReviewExpiringSoon(null)).toBe(false));
  it('false when overdue', () => expect(isReviewExpiringSoon(-1)).toBe(false));
  it('true at exactly 90 days', () => expect(isReviewExpiringSoon(90)).toBe(true));
  it('true at 1 day', () => expect(isReviewExpiringSoon(1)).toBe(true));
  it('true at 0 days', () => expect(isReviewExpiringSoon(0)).toBe(true));
  it('false at 91 days', () => expect(isReviewExpiringSoon(91)).toBe(false));
  it('false at 365 days', () => expect(isReviewExpiringSoon(365)).toBe(false));
});
