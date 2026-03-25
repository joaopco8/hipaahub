import { describe, it, expect } from 'vitest';
import { buildGapReport } from '@/lib/gap-report';

// ── helpers ──────────────────────────────────────────────────────────────────

/** Fully-compliant answers (riskScore 0 for every question in the fixture) */
const COMPLIANT_ANSWERS: Record<string, string> = {
  'security-officer':  'yes',
  'privacy-officer':   'yes',
  'risk-assessment-conducted': 'yes-current',
  'risk-management-plan': 'yes',
  'sanction-policy':   'yes',
};

/** Answers that should produce gaps */
const NON_COMPLIANT_ANSWERS: Record<string, string> = {
  'security-officer':  'no',           // riskScore 5 → high
  'privacy-officer':   'informal',     // riskScore 2 → medium→high (per remediation)
  'risk-assessment-conducted': 'yes-old', // riskScore 3
  'sanction-policy':   'no',           // riskScore from question options
};

// ── tests ────────────────────────────────────────────────────────────────────

describe('buildGapReport', () => {
  it('returns empty categories and zero counts for fully compliant answers', () => {
    const report = buildGapReport(COMPLIANT_ANSWERS);
    expect(report.total_gaps).toBe(0);
    expect(report.high_count).toBe(0);
    expect(report.medium_count).toBe(0);
    expect(report.low_count).toBe(0);
    expect(report.administrative).toHaveLength(0);
    expect(report.physical).toHaveLength(0);
    expect(report.technical).toHaveLength(0);
  });

  it('returns empty report for empty answers', () => {
    const report = buildGapReport({});
    expect(report.total_gaps).toBe(0);
  });

  it('produces gap items for non-compliant answers', () => {
    const report = buildGapReport(NON_COMPLIANT_ANSWERS);
    expect(report.total_gaps).toBeGreaterThan(0);
    // All known gaps should be administrative
    expect(report.administrative.length).toBe(report.total_gaps);
    expect(report.physical).toHaveLength(0);
    expect(report.technical).toHaveLength(0);
  });

  it('gap items include required fields', () => {
    const report = buildGapReport(NON_COMPLIANT_ANSWERS);
    for (const item of report.administrative) {
      expect(item.question_id).toBeTruthy();
      expect(item.question_text).toBeTruthy();
      expect(item.current_answer).toBeTruthy();
      expect(item.required_standard).toBeTruthy();
      expect(item.recommendation).toBeTruthy();
      expect(item.hipaa_citation).toBeTruthy();
      expect(['high', 'medium', 'low']).toContain(item.risk_level);
      expect(item.category).toBe('administrative');
    }
  });

  it('sorts items high → medium → low within each category', () => {
    const report = buildGapReport(NON_COMPLIANT_ANSWERS);
    const items = report.administrative;
    const ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };
    for (let i = 1; i < items.length; i++) {
      expect(ORDER[items[i].risk_level]).toBeGreaterThanOrEqual(ORDER[items[i - 1].risk_level]);
    }
  });

  it('counts high, medium, low correctly', () => {
    const report = buildGapReport(NON_COMPLIANT_ANSWERS);
    const allItems = [...report.administrative, ...report.physical, ...report.technical];
    const expectedHigh = allItems.filter((i) => i.risk_level === 'high').length;
    const expectedMedium = allItems.filter((i) => i.risk_level === 'medium').length;
    const expectedLow = allItems.filter((i) => i.risk_level === 'low').length;
    expect(report.high_count).toBe(expectedHigh);
    expect(report.medium_count).toBe(expectedMedium);
    expect(report.low_count).toBe(expectedLow);
    expect(report.total_gaps).toBe(expectedHigh + expectedMedium + expectedLow);
  });

  it('physical and technical gaps are categorised correctly', () => {
    const answers: Record<string, string> = {
      // Technical — non-compliant
      'encryption-at-rest': 'no',
      'unique-user-ids': 'shared',
      // Physical — non-compliant
      'device-disposal': 'no',
    };
    const report = buildGapReport(answers);
    for (const item of report.physical) {
      expect(item.category).toBe('physical');
    }
    for (const item of report.technical) {
      expect(item.category).toBe('technical');
    }
  });

  it('does not include questions with no answer in the report', () => {
    const answers: Record<string, string> = { 'security-officer': 'no' };
    const report = buildGapReport(answers);
    // Only security-officer should appear (all others have no answer)
    expect(report.total_gaps).toBe(1);
    expect(report.administrative[0].question_id).toBe('security-officer');
  });
});

// ── Assessment expiry helpers ──────────────────────────────────────────────

function assessmentExpiresAt(completedAt: Date): Date {
  const d = new Date(completedAt);
  d.setFullYear(d.getFullYear() + 1);
  return d;
}

function daysUntilExpiry(expiresAt: Date, now: Date): number {
  return Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function shouldShowExpiryBadge(days: number, thresholdDays = 90): boolean {
  return days <= thresholdDays;
}

describe('assessment expiry', () => {
  it('expires_at = completed_at + 12 months', () => {
    const completed = new Date(2025, 3, 15); // Apr 15 2025
    const expires = assessmentExpiresAt(completed);
    expect(expires.getFullYear()).toBe(2026);
    expect(expires.getMonth()).toBe(3);
    expect(expires.getDate()).toBe(15);
  });

  it('badge shown at exactly 90 days', () => {
    expect(shouldShowExpiryBadge(90)).toBe(true);
  });

  it('badge shown when overdue (negative days)', () => {
    expect(shouldShowExpiryBadge(-5)).toBe(true);
  });

  it('badge not shown at 91 days', () => {
    expect(shouldShowExpiryBadge(91)).toBe(false);
  });

  it('daysUntilExpiry returns correct value', () => {
    const now = new Date(2026, 0, 1);  // Jan 1 2026
    const expires = new Date(2026, 3, 1); // Apr 1 2026
    const days = daysUntilExpiry(expires, now);
    expect(days).toBe(90); // Jan 1 → Apr 1 = 90 days
  });
});
