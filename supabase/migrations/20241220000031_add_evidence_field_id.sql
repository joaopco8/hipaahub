-- Add evidence_field_id to link evidence to specific field from evidence_fields_config
-- This allows tracking which of the 48 evidence fields has been uploaded

ALTER TABLE compliance_evidence ADD COLUMN IF NOT EXISTS evidence_field_id text;

-- Create index for evidence_field_id
CREATE INDEX IF NOT EXISTS compliance_evidence_field_id_idx 
  ON compliance_evidence(evidence_field_id);

-- Add comment
COMMENT ON COLUMN compliance_evidence.evidence_field_id IS 'Links to evidence field ID from evidence_fields_config (e.g., security_officer_designation, sra_report)';
