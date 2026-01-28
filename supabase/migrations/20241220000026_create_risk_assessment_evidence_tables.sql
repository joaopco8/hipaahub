-- Evidence-Driven Compliance System
-- Stores evidence for each risk assessment answer
-- OCR-grade audit trail for legal defensibility

-- Main evidence table
CREATE TABLE IF NOT EXISTS risk_assessment_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id text NOT NULL, -- Matches organizations.id type
  risk_assessment_id uuid, -- References onboarding_risk_assessments(id) or risk_assessments(id) - FK added dynamically
  
  -- Question Reference
  question_id text NOT NULL, -- e.g., 'ADM-001', 'TECH-015'
  question_sequence integer NOT NULL,
  
  -- Answer
  answer text NOT NULL, -- The actual answer value (e.g., 'yes', 'no', 'partial')
  
  -- Evidence Metadata
  evidence_required boolean NOT NULL DEFAULT false,
  evidence_type text[], -- Array of types: ['document', 'screenshot', 'link', 'attestation', 'log', 'vendor_proof', 'structured_narrative']
  evidence_provided boolean NOT NULL DEFAULT false,
  
  -- Evidence Storage
  evidence_data jsonb DEFAULT '{}'::jsonb, -- Stores all evidence details
  
  -- Audit Trail
  uploaded_by uuid REFERENCES auth.users(id),
  uploaded_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  uploaded_ip text,
  uploaded_user_agent text,
  
  -- Retention
  retention_until date, -- Calculated as uploaded_at + 7 years
  
  -- Legal Metadata
  legal_weight text DEFAULT 'OCR defensible - litigation grade',
  audit_trail jsonb DEFAULT '[]'::jsonb, -- Array of audit events
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Constraints
  CONSTRAINT unique_question_evidence UNIQUE (risk_assessment_id, question_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS risk_assessment_evidence_user_id_idx 
  ON risk_assessment_evidence(user_id);
  
CREATE INDEX IF NOT EXISTS risk_assessment_evidence_organization_id_idx 
  ON risk_assessment_evidence(organization_id);
  
CREATE INDEX IF NOT EXISTS risk_assessment_evidence_risk_assessment_id_idx 
  ON risk_assessment_evidence(risk_assessment_id);
  
CREATE INDEX IF NOT EXISTS risk_assessment_evidence_question_id_idx 
  ON risk_assessment_evidence(question_id);
  
CREATE INDEX IF NOT EXISTS risk_assessment_evidence_evidence_required_idx 
  ON risk_assessment_evidence(evidence_required) 
  WHERE evidence_required = true;
  
CREATE INDEX IF NOT EXISTS risk_assessment_evidence_evidence_provided_idx 
  ON risk_assessment_evidence(evidence_provided) 
  WHERE evidence_provided = true;

-- GIN index for JSONB queries
CREATE INDEX IF NOT EXISTS risk_assessment_evidence_evidence_data_idx 
  ON risk_assessment_evidence USING gin(evidence_data);

-- Comments
COMMENT ON TABLE risk_assessment_evidence IS 'OCR-grade evidence storage for risk assessment answers. Each record represents evidence for a single question answer.';
COMMENT ON COLUMN risk_assessment_evidence.evidence_data IS 'JSONB structure: { "documents": [...], "screenshots": [...], "links": [...], "attestations": [...], "logs": [...], "vendor_proofs": [...], "narratives": [...] }';
COMMENT ON COLUMN risk_assessment_evidence.audit_trail IS 'Array of audit events: [{ "action": "uploaded", "timestamp": "...", "user": "...", "ip": "..." }, ...]';

-- RLS Policies
ALTER TABLE risk_assessment_evidence ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can view their own evidence" ON risk_assessment_evidence;
DROP POLICY IF EXISTS "Users can insert their own evidence" ON risk_assessment_evidence;
DROP POLICY IF EXISTS "Users can update their own evidence" ON risk_assessment_evidence;
DROP POLICY IF EXISTS "Users can delete their own evidence" ON risk_assessment_evidence;

-- Users can only see their own evidence
CREATE POLICY "Users can view their own evidence"
  ON risk_assessment_evidence
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own evidence
CREATE POLICY "Users can insert their own evidence"
  ON risk_assessment_evidence
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own evidence
CREATE POLICY "Users can update their own evidence"
  ON risk_assessment_evidence
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own evidence
CREATE POLICY "Users can delete their own evidence"
  ON risk_assessment_evidence
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically set retention_until
CREATE OR REPLACE FUNCTION set_evidence_retention()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Set retention to 7 years from upload date
  IF NEW.uploaded_at IS NOT NULL THEN
    NEW.retention_until := (NEW.uploaded_at + INTERVAL '7 years')::date;
  END IF;
  
  -- Update updated_at
  NEW.updated_at := timezone('utc'::text, now());
  
  RETURN NEW;
END;
$$;

-- Drop trigger if exists (for idempotency)
DROP TRIGGER IF EXISTS set_evidence_retention_trigger ON risk_assessment_evidence;

-- Trigger to set retention
CREATE TRIGGER set_evidence_retention_trigger
  BEFORE INSERT OR UPDATE ON risk_assessment_evidence
  FOR EACH ROW
  EXECUTE FUNCTION set_evidence_retention();

-- Function to add audit trail entry
CREATE OR REPLACE FUNCTION add_evidence_audit_trail()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_audit_event jsonb;
BEGIN
  -- Create audit event
  v_audit_event := jsonb_build_object(
    'action', CASE 
      WHEN TG_OP = 'INSERT' THEN 'created'
      WHEN TG_OP = 'UPDATE' THEN 'updated'
      WHEN TG_OP = 'DELETE' THEN 'deleted'
    END,
    'timestamp', timezone('utc'::text, now()),
    'user_id', auth.uid(),
    'ip_address', COALESCE(NEW.uploaded_ip, 'unknown'),
    'user_agent', COALESCE(NEW.uploaded_user_agent, 'unknown')
  );
  
  -- Append to audit trail
  IF TG_OP = 'INSERT' THEN
    NEW.audit_trail := COALESCE(NEW.audit_trail, '[]'::jsonb) || v_audit_event;
  ELSIF TG_OP = 'UPDATE' THEN
    NEW.audit_trail := COALESCE(OLD.audit_trail, '[]'::jsonb) || v_audit_event;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop trigger if exists (for idempotency)
DROP TRIGGER IF EXISTS add_evidence_audit_trail_trigger ON risk_assessment_evidence;

-- Trigger for audit trail
CREATE TRIGGER add_evidence_audit_trail_trigger
  BEFORE INSERT OR UPDATE ON risk_assessment_evidence
  FOR EACH ROW
  EXECUTE FUNCTION add_evidence_audit_trail();

-- Storage bucket for evidence files (if using Supabase Storage)
-- Note: This requires Supabase Storage to be enabled
-- The bucket will be created via Supabase Dashboard or API
