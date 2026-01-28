-- Create breach_incidents table for OCR-grade incident tracking
-- This table stores all breach incident data required for legal defense

-- First, detect the actual type of organizations.id
DO $$
DECLARE
  v_org_id_type text;
BEGIN
  -- Get the actual data type of organizations.id
  SELECT data_type INTO v_org_id_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'organizations'
    AND column_name = 'id';
  
  -- Store it in a temporary table for use later
  CREATE TEMP TABLE IF NOT EXISTS org_id_type (type_name text);
  DELETE FROM org_id_type;
  INSERT INTO org_id_type VALUES (v_org_id_type);
END $$;

-- Create breach_incidents table with organization_id matching organizations.id type
-- We'll use text as default since the error indicates organizations.id is text
-- If it's actually uuid, we'll handle it in the foreign key constraint
CREATE TABLE IF NOT EXISTS breach_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id text NOT NULL, -- Will be converted to uuid if needed
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Incident Dates
  discovery_date date NOT NULL,
  incident_date date NOT NULL,
  
  -- Affected Count
  affected_count integer NOT NULL CHECK (affected_count >= 0),
  
  -- Description Fields
  description text NOT NULL,
  detailed_narrative text,
  discovery_method text,
  types_of_info text NOT NULL,
  steps_taken text NOT NULL,
  steps_for_patient text NOT NULL,
  additional_scope_information text,
  
  -- Security & Breach Classification (45 CFR §164.402)
  encryption_at_rest text CHECK (encryption_at_rest IN ('Yes', 'No', 'Unknown')),
  encryption_in_transit text CHECK (encryption_in_transit IN ('Yes', 'No', 'Unknown')),
  mfa_enabled text CHECK (mfa_enabled IN ('Yes', 'No', 'Unknown')),
  incident_type text NOT NULL CHECK (incident_type IN (
    'Hacking / Malware',
    'Lost Device',
    'Stolen Device',
    'Unauthorized Employee Access',
    'Phishing',
    'Ransomware',
    'Misconfiguration',
    'Business Associate Breach'
  )),
  
  -- Business Associate Information
  business_associate_involved boolean DEFAULT false,
  business_associate_name text,
  
  -- Governance & Legal Chain of Custody
  discovered_by_name text NOT NULL,
  discovered_by_role text NOT NULL,
  investigation_lead_name text NOT NULL,
  investigation_lead_role text NOT NULL,
  authorized_by text NOT NULL CHECK (authorized_by IN ('Privacy Officer', 'Security Officer', 'CEO')),
  
  -- Law Enforcement
  law_enforcement_notified boolean DEFAULT false,
  law_enforcement_delay boolean DEFAULT false,
  
  -- Jurisdiction (stored as JSONB array of state codes)
  states_affected jsonb DEFAULT '[]'::jsonb,
  state_or_jurisdiction text, -- For backward compatibility
  
  -- PHI Categories (stored as JSONB for flexibility)
  phi_categories jsonb DEFAULT '{}'::jsonb,
  
  -- System Information
  system_name text,
  system_type text,
  data_location text,
  encryption_status text, -- Legacy field, use encryption_at_rest/in_transit instead
  authentication_controls text,
  technical_details text,
  
  -- Response Actions
  containment_actions text,
  forensic_investigator text,
  law_enforcement_notification_status text,
  have_notified_or_will_notify text,
  security_enhancements text,
  
  -- Credit Monitoring
  credit_monitoring_offered boolean DEFAULT false,
  credit_monitoring_duration integer,
  credit_monitoring_provider text,
  credit_monitoring_enrollment_url text,
  credit_monitoring_phone_number text,
  enrollment_code text,
  identity_theft_insurance_amount text,
  enrollment_deadline_days integer,
  
  -- Investigation Details
  investigation_findings text,
  root_cause_analysis text,
  corrective_actions_summary text,
  
  -- Legal Classification (computed)
  breach_legal_status text NOT NULL DEFAULT 'Under Investigation' CHECK (breach_legal_status IN (
    'Not Reportable',
    'Reportable',
    'Under Investigation'
  )),
  
  -- Policy Version (for audit trail)
  policy_version text DEFAULT '1.0',
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  
  -- Metadata
  breach_id text UNIQUE -- Human-readable breach ID (e.g., BREACH-2024-001)
);

-- Add foreign key constraint based on actual organizations.id type
DO $$
DECLARE
  v_org_id_type text;
BEGIN
  -- Get the actual type of organizations.id
  SELECT data_type INTO v_org_id_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'organizations'
    AND column_name = 'id';
  
  IF v_org_id_type = 'uuid' THEN
    -- organizations.id is uuid, convert organization_id to uuid and add foreign key
    ALTER TABLE breach_incidents
      ALTER COLUMN organization_id TYPE uuid USING organization_id::uuid;
    
    ALTER TABLE breach_incidents
      ADD CONSTRAINT breach_incidents_organization_fkey 
      FOREIGN KEY (organization_id) 
      REFERENCES organizations(id) 
      ON DELETE CASCADE;
  ELSIF v_org_id_type = 'text' THEN
    -- organizations.id is text, add foreign key with text
    ALTER TABLE breach_incidents
      ADD CONSTRAINT breach_incidents_organization_fkey 
      FOREIGN KEY (organization_id) 
      REFERENCES organizations(id) 
      ON DELETE CASCADE;
  ELSE
    RAISE EXCEPTION 'organizations.id has unsupported type: %', v_org_id_type;
  END IF;
END $$;

-- Create breach_evidence_logs table (append-only forensic log)
CREATE TABLE IF NOT EXISTS breach_evidence_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id uuid NOT NULL REFERENCES breach_incidents(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Action Details
  action text NOT NULL, -- e.g., 'letter_generated', 'incident_created', 'status_changed'
  action_type text NOT NULL CHECK (action_type IN (
    'incident_created',
    'incident_updated',
    'letter_generated',
    'report_generated',
    'defense_pack_exported',
    'status_changed',
    'authorization_changed'
  )),
  
  -- Forensic Data
  ip_address text,
  user_agent text,
  timestamp timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Data Snapshot (JSONB for flexibility)
  data_snapshot jsonb DEFAULT '{}'::jsonb,
  
  -- Document Metadata (if applicable)
  document_type text, -- e.g., 'patient_letter', 'ocr_notification', 'attorney_general'
  document_id text,
  policy_version text,
  
  CONSTRAINT breach_evidence_logs_incident_fkey FOREIGN KEY (incident_id) REFERENCES breach_incidents(id) ON DELETE CASCADE,
  CONSTRAINT breach_evidence_logs_user_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS breach_incidents_organization_id_idx ON breach_incidents(organization_id);
CREATE INDEX IF NOT EXISTS breach_incidents_user_id_idx ON breach_incidents(user_id);
CREATE INDEX IF NOT EXISTS breach_incidents_discovery_date_idx ON breach_incidents(discovery_date);
CREATE INDEX IF NOT EXISTS breach_incidents_breach_legal_status_idx ON breach_incidents(breach_legal_status);
CREATE INDEX IF NOT EXISTS breach_incidents_breach_id_idx ON breach_incidents(breach_id);
CREATE INDEX IF NOT EXISTS breach_evidence_logs_incident_id_idx ON breach_evidence_logs(incident_id);
CREATE INDEX IF NOT EXISTS breach_evidence_logs_user_id_idx ON breach_evidence_logs(user_id);
CREATE INDEX IF NOT EXISTS breach_evidence_logs_timestamp_idx ON breach_evidence_logs(timestamp);
CREATE INDEX IF NOT EXISTS breach_evidence_logs_action_type_idx ON breach_evidence_logs(action_type);

-- Create GIN index for JSONB fields
CREATE INDEX IF NOT EXISTS breach_incidents_states_affected_idx ON breach_incidents USING gin(states_affected);
CREATE INDEX IF NOT EXISTS breach_incidents_phi_categories_idx ON breach_incidents USING gin(phi_categories);
CREATE INDEX IF NOT EXISTS breach_evidence_logs_data_snapshot_idx ON breach_evidence_logs USING gin(data_snapshot);

-- Enable RLS
ALTER TABLE breach_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE breach_evidence_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for breach_incidents
CREATE POLICY "Users can view their organization's breach incidents"
  ON breach_incidents FOR SELECT
  USING (
    organization_id IN (
      SELECT id::text FROM organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create breach incidents for their organization"
  ON breach_incidents FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT id::text FROM organizations WHERE user_id = auth.uid()
    )
    AND user_id = auth.uid()
  );

CREATE POLICY "Users can update their organization's breach incidents"
  ON breach_incidents FOR UPDATE
  USING (
    organization_id IN (
      SELECT id::text FROM organizations WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for breach_evidence_logs (append-only, no updates/deletes)
CREATE POLICY "Users can view evidence logs for their organization's incidents"
  ON breach_evidence_logs FOR SELECT
  USING (
    incident_id IN (
      SELECT id FROM breach_incidents 
      WHERE organization_id IN (
        SELECT id::text FROM organizations WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create evidence logs for their organization's incidents"
  ON breach_evidence_logs FOR INSERT
  WITH CHECK (
    incident_id IN (
      SELECT id FROM breach_incidents 
      WHERE organization_id IN (
        SELECT id::text FROM organizations WHERE user_id = auth.uid()
      )
    )
    AND user_id = auth.uid()
  );

-- Function to automatically classify breach legal status
CREATE OR REPLACE FUNCTION classify_breach_legal_status()
RETURNS TRIGGER AS $$
BEGIN
  -- If PHI was encrypted at rest AND in transit, it's not a reportable breach
  IF NEW.encryption_at_rest = 'Yes' AND NEW.encryption_in_transit = 'Yes' THEN
    NEW.breach_legal_status := 'Not Reportable';
  -- Otherwise, it's reportable (unless still under investigation)
  ELSIF NEW.breach_legal_status = 'Under Investigation' THEN
    -- Keep as Under Investigation if explicitly set
    NULL;
  ELSE
    NEW.breach_legal_status := 'Reportable';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-classify breach status
CREATE TRIGGER breach_incidents_classify_status
  BEFORE INSERT OR UPDATE ON breach_incidents
  FOR EACH ROW
  EXECUTE FUNCTION classify_breach_legal_status();

-- Function to generate breach_id
CREATE OR REPLACE FUNCTION generate_breach_id()
RETURNS TRIGGER AS $$
DECLARE
  v_year text;
  v_count integer;
  v_breach_id text;
BEGIN
  -- Only generate if not already set
  IF NEW.breach_id IS NULL THEN
    v_year := EXTRACT(YEAR FROM NEW.discovery_date)::text;
    
    -- Count existing breaches for this organization in this year
    SELECT COUNT(*) INTO v_count
    FROM breach_incidents
    WHERE organization_id = NEW.organization_id
      AND EXTRACT(YEAR FROM discovery_date) = EXTRACT(YEAR FROM NEW.discovery_date);
    
    -- Generate breach ID: BREACH-YYYY-XXX
    v_breach_id := 'BREACH-' || v_year || '-' || LPAD((v_count + 1)::text, 3, '0');
    
    NEW.breach_id := v_breach_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate breach_id
CREATE TRIGGER breach_incidents_generate_id
  BEFORE INSERT ON breach_incidents
  FOR EACH ROW
  EXECUTE FUNCTION generate_breach_id();

-- Comments for documentation
COMMENT ON TABLE breach_incidents IS 'HIPAA Breach Incidents - OCR-grade incident tracking for legal defense';
COMMENT ON TABLE breach_evidence_logs IS 'Append-only forensic log for breach incident actions (immutable audit trail)';
COMMENT ON COLUMN breach_incidents.breach_legal_status IS 'Legal classification: Not Reportable (encrypted), Reportable (unencrypted), Under Investigation';
COMMENT ON COLUMN breach_incidents.encryption_at_rest IS 'Was PHI encrypted at rest? Determines if breach is reportable under 45 CFR §164.402';
COMMENT ON COLUMN breach_incidents.encryption_in_transit IS 'Was PHI encrypted in transit? Determines if breach is reportable under 45 CFR §164.402';
COMMENT ON COLUMN breach_evidence_logs.data_snapshot IS 'JSONB snapshot of relevant data at time of action (for forensic reconstruction)';
