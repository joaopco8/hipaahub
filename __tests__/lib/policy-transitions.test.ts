import { describe, it, expect } from 'vitest';
import {
  canTransition,
  requiresSignature,
  getAllowedTransitions,
  STATUS_LABELS,
  type PolicyStatus,
} from '@/lib/policy-transitions';

describe('canTransition', () => {
  // draft transitions
  it('draft → active: true', () => {
    expect(canTransition('draft', 'active')).toBe(true);
  });
  it('draft → in_review: false', () => {
    expect(canTransition('draft', 'in_review')).toBe(false);
  });
  it('draft → archived: false', () => {
    expect(canTransition('draft', 'archived')).toBe(false);
  });
  it('draft → draft: false', () => {
    expect(canTransition('draft', 'draft')).toBe(false);
  });

  // active transitions
  it('active → in_review: true', () => {
    expect(canTransition('active', 'in_review')).toBe(true);
  });
  it('active → archived: true', () => {
    expect(canTransition('active', 'archived')).toBe(true);
  });
  it('active → draft: false', () => {
    expect(canTransition('active', 'draft')).toBe(false);
  });
  it('active → active: false', () => {
    expect(canTransition('active', 'active')).toBe(false);
  });

  // in_review transitions
  it('in_review → active: true', () => {
    expect(canTransition('in_review', 'active')).toBe(true);
  });
  it('in_review → draft: false', () => {
    expect(canTransition('in_review', 'draft')).toBe(false);
  });
  it('in_review → archived: false', () => {
    expect(canTransition('in_review', 'archived')).toBe(false);
  });
  it('in_review → in_review: false', () => {
    expect(canTransition('in_review', 'in_review')).toBe(false);
  });

  // archived transitions — all false
  it('archived → active: false', () => {
    expect(canTransition('archived', 'active')).toBe(false);
  });
  it('archived → draft: false', () => {
    expect(canTransition('archived', 'draft')).toBe(false);
  });
  it('archived → in_review: false', () => {
    expect(canTransition('archived', 'in_review')).toBe(false);
  });
  it('archived → archived: false', () => {
    expect(canTransition('archived', 'archived')).toBe(false);
  });
});

describe('requiresSignature', () => {
  it('draft → active: true (valid transition, to=active)', () => {
    expect(requiresSignature('draft', 'active')).toBe(true);
  });
  it('in_review → active: true (valid transition, to=active)', () => {
    expect(requiresSignature('in_review', 'active')).toBe(true);
  });
  it('active → in_review: false (valid transition but to !== active)', () => {
    expect(requiresSignature('active', 'in_review')).toBe(false);
  });
  it('active → archived: false (valid transition but to !== active)', () => {
    expect(requiresSignature('active', 'archived')).toBe(false);
  });

  // Invalid transitions should return false
  it('draft → in_review: false (invalid transition)', () => {
    expect(requiresSignature('draft', 'in_review')).toBe(false);
  });
  it('draft → archived: false (invalid transition)', () => {
    expect(requiresSignature('draft', 'archived')).toBe(false);
  });
  it('archived → active: false (invalid transition)', () => {
    expect(requiresSignature('archived', 'active')).toBe(false);
  });
  it('in_review → archived: false (invalid transition)', () => {
    expect(requiresSignature('in_review', 'archived')).toBe(false);
  });
  it('active → draft: false (invalid transition)', () => {
    expect(requiresSignature('active', 'draft')).toBe(false);
  });
});

describe('getAllowedTransitions', () => {
  it('draft → [active]', () => {
    expect(getAllowedTransitions('draft')).toEqual(['active']);
  });
  it('active → [in_review, archived]', () => {
    expect(getAllowedTransitions('active')).toEqual(['in_review', 'archived']);
  });
  it('in_review → [active]', () => {
    expect(getAllowedTransitions('in_review')).toEqual(['active']);
  });
  it('archived → []', () => {
    expect(getAllowedTransitions('archived')).toEqual([]);
  });
});

describe('STATUS_LABELS', () => {
  it('has correct labels for all statuses', () => {
    expect(STATUS_LABELS.draft).toBe('Draft');
    expect(STATUS_LABELS.active).toBe('Active');
    expect(STATUS_LABELS.in_review).toBe('In Review');
    expect(STATUS_LABELS.archived).toBe('Archived');
  });
});
