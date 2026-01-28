-- Compliance Evidence Center
-- Centralized, audit-grade evidence vault for HIPAA compliance
-- Independent of onboarding flow - allows ongoing evidence management

-- Main compliance evidence table
CREATE TABLE IF NOT EXISTS compliance_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id text NOT NULL, -- References organizations.id
  
  -- Evidence Identity
  title text NOT NULL,
  description text,
  evidence_type text NOT NULL, -- See EVIDENCE_TYPES enum below
  
  -- HIPAA Mapping
  hipaa_category text[], -- Array of HIPAA domains (Administrative, Physical, Technical, etc.)
  hipaa_safeguard text[], -- Specific safeguards (e.g., '164.308(a)(1)', '164.312(a)(1)')
  hipaa_rule_citation text[], -- Full citations (e.g., '45 CFR §164.308(a)(1)(ii)(A)')
  
  -- Question & Document Mapping
  related_question_ids text[], -- Array of question IDs (e.g., ['ADM-001', 'TECH-015'])
  related_document_ids text[], -- Array of document IDs (e.g., ['POL-002', 'POL-004'])
  
  -- File Storage
  file_url text, -- Supabase Storage path
  file_name text,
  file_type text,
  file_size bigint,
  storage_bucket text DEFAULT 'evidence',
  
  -- Metadata
  uploaded_by uuid NOT NULL REFERENCES auth.users(id),
  upload_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  ip_address text,
  user_agent text,
  
  -- Attestation
  attestation_signed boolean DEFAULT false,
  attestation_signed_by uuid REFERENCES auth.users(id),
  attestation_signed_at timestamp with time zone,
  attestation_ip_address text,
  
  -- Validity & Review
  validity_period_days integer, -- How long this evidence is valid (null = indefinite)
  validity_start_date date,
  validity_end_date date,
  review_due_date date,
  last_reviewed_at timestamp with time zone,
  last_reviewed_by uuid REFERENCES auth.users(id),
  
  -- Status
  status text NOT NULL DEFAULT 'VALID', -- VALID | EXPIRED | MISSING | REQUIRES_REVIEW | ARCHIVED
  
  -- Legal & Audit
  legal_weight text DEFAULT 'OCR defensible - litigation grade',
  audit_trail jsonb DEFAULT '[]'::jsonb, -- Array of audit events
  retention_until date, -- Calculated as upload_date + 7 years
  
  -- Additional Metadata
  tags text[], -- Custom tags for organization
  notes text, -- Internal notes
  external_reference text, -- Reference to external system (e.g., ticket number)
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  deleted_at timestamp with time zone, -- Soft delete
  
  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('VALID', 'EXPIRED', 'MISSING', 'REQUIRES_REVIEW', 'ARCHIVED')),
  CONSTRAINT valid_evidence_type CHECK (evidence_type IN (
    'security_risk_analysis',
    'penetration_test',
    'vulnerability_scan',
    'policy_procedure',
    'workforce_training_log',
    'signed_acknowledgment',
    'system_settings_screenshot',
    'mfa_configuration_proof',
    'encryption_configuration_proof',
    'audit_log',
    'backup_log',
    'incident_report',
    'business_associate_agreement',
    'vendor_security_attestation',
    'access_control_export',
    'termination_checklist',
    'hipaa_training_certificate',
    'incident_response_drill_record',
    'breach_log',
    'system_architecture_diagram',
    'other'
  ))
);

-- Evidence-to-Question mapping table (many-to-many)
CREATE TABLE IF NOT EXISTS evidence_question_mapping (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evidence_id uuid NOT NULL REFERENCES compliance_evidence(id) ON DELETE CASCADE,
  question_id text NOT NULL,
  question_sequence integer,
  mapped_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  mapped_by uuid REFERENCES auth.users(id),
  UNIQUE(evidence_id, question_id)
);

-- Evidence-to-Document mapping table (many-to-many)
CREATE TABLE IF NOT EXISTS evidence_document_mapping (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evidence_id uuid NOT NULL REFERENCES compliance_evidence(id) ON DELETE CASCADE,
  document_id text NOT NULL, -- e.g., 'POL-002', 'MST-001'
  document_name text,
  mapped_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  mapped_by uuid REFERENCES auth.users(id),
  UNIQUE(evidence_id, document_id)
);

-- Evidence-to-Safeguard mapping table (many-to-many)
CREATE TABLE IF NOT EXISTS evidence_safeguard_mapping (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evidence_id uuid NOT NULL REFERENCES compliance_evidence(id) ON DELETE CASCADE,
  safeguard_code text NOT NULL, -- e.g., '164.308(a)(1)'
  safeguard_name text,
  mapped_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  mapped_by uuid REFERENCES auth.users(id),
  UNIQUE(evidence_id, safeguard_code)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS compliance_evidence_organization_id_idx 
  ON compliance_evidence(organization_id);
CREATE INDEX IF NOT EXISTS compliance_evidence_status_idx 
  ON compliance_evidence(status);
CREATE INDEX IF NOT EXISTS compliance_evidence_evidence_type_idx 
  ON compliance_evidence(evidence_type);
CREATE INDEX IF NOT EXISTS compliance_evidence_upload_date_idx 
  ON compliance_evidence(upload_date DESC);
CREATE INDEX IF NOT EXISTS compliance_evidence_validity_end_date_idx 
  ON compliance_evidence(validity_end_date);
CREATE INDEX IF NOT EXISTS compliance_evidence_review_due_date_idx 
  ON compliance_evidence(review_due_date);
CREATE INDEX IF NOT EXISTS compliance_evidence_deleted_at_idx 
  ON compliance_evidence(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS evidence_question_mapping_evidence_id_idx 
  ON evidence_question_mapping(evidence_id);
CREATE INDEX IF NOT EXISTS evidence_question_mapping_question_id_idx 
  ON evidence_question_mapping(question_id);

CREATE INDEX IF NOT EXISTS evidence_document_mapping_evidence_id_idx 
  ON evidence_document_mapping(evidence_id);
CREATE INDEX IF NOT EXISTS evidence_document_mapping_document_id_idx 
  ON evidence_document_mapping(document_id);

CREATE INDEX IF NOT EXISTS evidence_safeguard_mapping_evidence_id_idx 
  ON evidence_safeguard_mapping(evidence_id);
CREATE INDEX IF NOT EXISTS evidence_safeguard_mapping_safeguard_code_idx 
  ON evidence_safeguard_mapping(safeguard_code);

-- Function to automatically calculate validity_end_date
CREATE OR REPLACE FUNCTION calculate_evidence_validity_end_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.validity_period_days IS NOT NULL AND NEW.validity_start_date IS NOT NULL THEN
    NEW.validity_end_date := NEW.validity_start_date + (NEW.validity_period_days || ' days')::interval;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_evidence_validity_end_date_trigger
  BEFORE INSERT OR UPDATE ON compliance_evidence
  FOR EACH ROW
  EXECUTE FUNCTION calculate_evidence_validity_end_date();

-- Function to automatically calculate retention_until (7 years from upload)
CREATE OR REPLACE FUNCTION calculate_evidence_retention()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.retention_until IS NULL THEN
    NEW.retention_until := (NEW.upload_date::date + interval '7 years')::date;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_evidence_retention_trigger
  BEFORE INSERT OR UPDATE ON compliance_evidence
  FOR EACH ROW
  EXECUTE FUNCTION calculate_evidence_retention();

-- Function to update status based on dates
CREATE OR REPLACE FUNCTION update_evidence_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if expired
  IF NEW.validity_end_date IS NOT NULL AND NEW.validity_end_date < CURRENT_DATE THEN
    NEW.status := 'EXPIRED';
  -- Check if review due
  ELSIF NEW.review_due_date IS NOT NULL AND NEW.review_due_date < CURRENT_DATE AND NEW.status = 'VALID' THEN
    NEW.status := 'REQUIRES_REVIEW';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_evidence_status_trigger
  BEFORE INSERT OR UPDATE ON compliance_evidence
  FOR EACH ROW
  EXECUTE FUNCTION update_evidence_status();

-- RLS Policies
ALTER TABLE compliance_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_question_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_document_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_safeguard_mapping ENABLE ROW LEVEL SECURITY;

-- Users can only see evidence from their organization
CREATE POLICY "Users can view their organization's evidence"
  ON compliance_evidence FOR SELECT
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE user_id = auth.uid()
    )
  );

-- Users can insert evidence for their organization
CREATE POLICY "Users can insert evidence for their organization"
  ON compliance_evidence FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT id FROM organizations WHERE user_id = auth.uid()
    )
  );

-- Users can update evidence from their organization
CREATE POLICY "Users can update their organization's evidence"
  ON compliance_evidence FOR UPDATE
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE user_id = auth.uid()
    )
  );

-- Users can delete (soft delete) evidence from their organization
CREATE POLICY "Users can delete their organization's evidence"
  ON compliance_evidence FOR DELETE
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE user_id = auth.uid()
    )
  );

-- Mapping tables RLS
CREATE POLICY "Users can view evidence mappings"
  ON evidence_question_mapping FOR SELECT
  USING (
    evidence_id IN (
      SELECT id FROM compliance_evidence 
      WHERE organization_id IN (
        SELECT id FROM organizations WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage evidence question mappings"
  ON evidence_question_mapping FOR ALL
  USING (
    evidence_id IN (
      SELECT id FROM compliance_evidence 
      WHERE organization_id IN (
        SELECT id FROM organizations WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can view evidence document mappings"
  ON evidence_document_mapping FOR SELECT
  USING (
    evidence_id IN (
      SELECT id FROM compliance_evidence 
      WHERE organization_id IN (
        SELECT id FROM organizations WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage evidence document mappings"
  ON evidence_document_mapping FOR ALL
  USING (
    evidence_id IN (
      SELECT id FROM compliance_evidence 
      WHERE organization_id IN (
        SELECT id FROM organizations WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can view evidence safeguard mappings"
  ON evidence_safeguard_mapping FOR SELECT
  USING (
    evidence_id IN (
      SELECT id FROM compliance_evidence 
      WHERE organization_id IN (
        SELECT id FROM organizations WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage evidence safeguard mappings"
  ON evidence_safeguard_mapping FOR ALL
  USING (
    evidence_id IN (
      SELECT id FROM compliance_evidence 
      WHERE organization_id IN (
        SELECT id FROM organizations WHERE user_id = auth.uid()
      )
    )
  );
