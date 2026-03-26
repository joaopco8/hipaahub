-- Add gap_report JSONB column to risk_assessment_history
-- Stores the full GapReport snapshot for each historical assessment
ALTER TABLE risk_assessment_history
  ADD COLUMN IF NOT EXISTS gap_report jsonb DEFAULT '{}'::jsonb;

-- Add expires_at to onboarding_risk_assessments
-- Set to completed_at (updated_at) + 12 months when assessment is saved
ALTER TABLE onboarding_risk_assessments
  ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone;

-- Backfill expires_at for existing rows
UPDATE onboarding_risk_assessments
SET expires_at = updated_at + interval '12 months'
WHERE expires_at IS NULL AND updated_at IS NOT NULL;

-- Also add expires_at to risk_assessments table (fallback table)
ALTER TABLE risk_assessments
  ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone;

UPDATE risk_assessments
SET expires_at = "updatedAt" + interval '12 months'
WHERE expires_at IS NULL AND "updatedAt" IS NOT NULL;

COMMENT ON COLUMN risk_assessment_history.gap_report IS 'Full gap report snapshot (GapReport JSON) at time of assessment';
COMMENT ON COLUMN onboarding_risk_assessments.expires_at IS 'Assessment expiration: completed_at + 12 months';
