/**
 * Feature access definitions for the two-dimensional gating system:
 * Dimension 1 — Trial vs Paid (ActionFeature): blocks exports/downloads/finalization
 * Dimension 2 — Plan Tier (SectionFeature): blocks entire sections by plan
 */

export type SubscriptionStatus = 'trial' | 'active' | 'expired';

export type SectionFeature =
  | 'staff_training'
  | 'baa_tracker'
  | 'asset_risk'
  | 'mitigation_workflow'
  | 'incident_employees_field'
  | 'incident_sanction_field'
  | 'dashboard_training_indicator'
  | 'dashboard_baa_indicator'
  | 'multi_location'
  | 'board_reports'
  | 'compliance_calendar'
  | 'quarterly_reviews'
  | 'guided_breach_workflow'
  | 'breach_templates_full';

export type ActionFeature =
  | 'export_audit_package'
  | 'export_policy_pdf'
  | 'export_assessment_pdf'
  | 'export_training_certificate'
  | 'export_baa_report'
  | 'export_incident_pdf'
  | 'export_ocr_letter'
  | 'export_patient_letter'
  | 'policy_activate'
  | 'policy_finalize'
  | 'employee_add'
  | 'vendor_add';

const SECTION_PLAN_REQUIREMENTS: Record<SectionFeature, 'practice' | 'clinic'> = {
  staff_training: 'practice',
  baa_tracker: 'practice',
  asset_risk: 'practice',
  mitigation_workflow: 'practice',
  incident_employees_field: 'practice',
  incident_sanction_field: 'practice',
  dashboard_training_indicator: 'practice',
  dashboard_baa_indicator: 'practice',
  multi_location: 'clinic',
  board_reports: 'clinic',
  compliance_calendar: 'clinic',
  quarterly_reviews: 'clinic',
  guided_breach_workflow: 'clinic',
  breach_templates_full: 'clinic',
};

const PLAN_HIERARCHY: Record<string, number> = {
  unknown: 0,
  solo: 1,
  practice: 2,
  clinic: 3,
  enterprise: 4,
};

/** True if the org's plan meets the requirement for this section feature. */
export function canAccessSection(orgPlan: string, feature: SectionFeature): boolean {
  const required = SECTION_PLAN_REQUIREMENTS[feature];
  return PLAN_HIERARCHY[orgPlan] >= PLAN_HIERARCHY[required];
}

/**
 * Action features are available on any active (paid) subscription.
 * Trial users can build and view everything — they just can't export/finalize.
 */
export function canPerformAction(status: SubscriptionStatus): boolean {
  return status === 'active';
}

export function requiredPlanFor(feature: SectionFeature): 'practice' | 'clinic' {
  return SECTION_PLAN_REQUIREMENTS[feature];
}

/** Convert raw Stripe subscription status → SubscriptionStatus */
export function toSubscriptionStatus(
  raw: string | null | undefined
): SubscriptionStatus {
  if (raw === 'active') return 'active';
  if (raw === 'trialing') return 'trial';
  return 'expired';
}

/**
 * Resolve subscription status from the organizations table fields.
 * This is the primary status source for the new org-based trial system.
 * Falls back to Stripe subscription status when org fields are absent.
 */
export function resolveSubscriptionStatus(org: {
  subscription_status?: string | null;
  trial_ends_at?: string | null;
} | null, stripeRaw?: string | null): SubscriptionStatus {
  // Org table has explicit status — trust it, except validate trial hasn't silently expired
  if (org?.subscription_status) {
    const s = org.subscription_status;
    if (s === 'active') return 'active';
    if (s === 'cancelled') return 'expired';
    if (s === 'expired') return 'expired';
    if (s === 'trial') {
      // Double-check trial hasn't expired (cron might not have run yet)
      if (org.trial_ends_at && new Date(org.trial_ends_at) < new Date()) {
        return 'expired';
      }
      return 'trial';
    }
  }
  // No org status yet — fall back to Stripe
  return toSubscriptionStatus(stripeRaw);
}

/** Compute trial days remaining from an ISO date string. */
export function getTrialDaysRemaining(trialEnd: string | null): number | null {
  if (!trialEnd) return null;
  const ms = new Date(trialEnd).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}
