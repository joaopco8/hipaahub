-- Risk Assessment v2: add domain_scores, display_score, tier, completed_by columns
ALTER TABLE risk_assessments         ADD COLUMN IF NOT EXISTS display_score  integer;
ALTER TABLE risk_assessments         ADD COLUMN IF NOT EXISTS domain_scores  jsonb;
ALTER TABLE risk_assessments         ADD COLUMN IF NOT EXISTS tier           text;
ALTER TABLE risk_assessments         ADD COLUMN IF NOT EXISTS completed_by   text;

ALTER TABLE onboarding_risk_assessments ADD COLUMN IF NOT EXISTS display_score integer;
ALTER TABLE onboarding_risk_assessments ADD COLUMN IF NOT EXISTS domain_scores  jsonb;
ALTER TABLE onboarding_risk_assessments ADD COLUMN IF NOT EXISTS tier           text;
ALTER TABLE onboarding_risk_assessments ADD COLUMN IF NOT EXISTS completed_by   text;

ALTER TABLE risk_assessment_history  ADD COLUMN IF NOT EXISTS display_score  integer;
ALTER TABLE risk_assessment_history  ADD COLUMN IF NOT EXISTS domain_scores  jsonb;
ALTER TABLE risk_assessment_history  ADD COLUMN IF NOT EXISTS tier           text;
ALTER TABLE risk_assessment_history  ADD COLUMN IF NOT EXISTS completed_by   text;
