-- Add OCR risk context to action items
-- This makes action items audit-defensible by explaining legal consequences

ALTER TABLE action_items 
ADD COLUMN IF NOT EXISTS ocr_risk_if_ignored TEXT,
ADD COLUMN IF NOT EXISTS hipaa_citation TEXT,
ADD COLUMN IF NOT EXISTS audit_impact TEXT,
ADD COLUMN IF NOT EXISTS evidence_required TEXT[];

-- Add comments for documentation
COMMENT ON COLUMN action_items.ocr_risk_if_ignored IS 'What happens in an OCR audit if this item is not completed';
COMMENT ON COLUMN action_items.hipaa_citation IS 'Specific HIPAA regulation cite (e.g., §164.308(a)(1)(ii)(A))';
COMMENT ON COLUMN action_items.audit_impact IS 'How this impacts audit readiness (critical/high/medium)';
COMMENT ON COLUMN action_items.evidence_required IS 'Array of evidence types needed to prove completion';
