export type PolicyStatus = 'draft' | 'active' | 'in_review' | 'archived';

// Allowed transitions per spec:
// draft→active, active→in_review, in_review→active, active→archived
const ALLOWED: Record<PolicyStatus, PolicyStatus[]> = {
  draft:     ['active'],
  active:    ['in_review', 'archived'],
  in_review: ['active'],
  archived:  [],
};

export function canTransition(from: PolicyStatus, to: PolicyStatus): boolean {
  const allowed = ALLOWED[from];
  if (!allowed) return false;
  return allowed.includes(to);
}

export function requiresSignature(from: PolicyStatus, to: PolicyStatus): boolean {
  if (!canTransition(from, to)) return false;
  return to === 'active';
}

export function getAllowedTransitions(from: PolicyStatus): PolicyStatus[] {
  return ALLOWED[from] ?? [];
}

export const STATUS_LABELS: Record<PolicyStatus, string> = {
  draft:     'Draft',
  active:    'Active',
  in_review: 'In Review',
  archived:  'Archived',
};
