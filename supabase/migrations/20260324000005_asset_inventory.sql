-- Asset Inventory for PHI-touching devices, systems, apps, and cloud services

CREATE TABLE IF NOT EXISTS assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id text NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Asset Identification
  asset_name text NOT NULL,
  asset_type text NOT NULL CHECK (asset_type IN (
    'device',        -- Laptop, desktop, mobile, tablet
    'system',        -- EHR, EMR, practice management software
    'application',   -- Web app, SaaS
    'cloud_service', -- AWS, GCP, Azure, Dropbox, etc.
    'network',       -- Firewall, router, VPN
    'other'
  )),
  description text,
  vendor_name text,
  model_or_version text,
  location text,              -- e.g., "Office - Room 3", "Remote - Dr. Smith"
  assigned_to text,           -- Staff member name

  -- PHI Access
  has_phi_access boolean NOT NULL DEFAULT true,
  phi_types text[],           -- e.g., ['names', 'dates', 'medical_records']
  data_at_rest boolean NOT NULL DEFAULT false,
  data_in_transit boolean NOT NULL DEFAULT false,

  -- Security Posture
  encryption_enabled boolean,
  mfa_enabled boolean,
  auto_update_enabled boolean,
  antivirus_installed boolean,
  last_security_review date,
  is_managed boolean NOT NULL DEFAULT false,  -- Organization-managed vs. BYOD

  -- Risk Score (0-100, computed from security posture)
  risk_score integer NOT NULL DEFAULT 50 CHECK (risk_score BETWEEN 0 AND 100),
  risk_level text NOT NULL DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  risk_notes text,

  -- Integration with Risk Assessment
  risk_assessment_gap text,  -- Maps to a risk assessment question/gap

  -- Status
  asset_status text NOT NULL DEFAULT 'active' CHECK (asset_status IN ('active', 'retired', 'under_review')),

  -- Timestamps
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS assets_organization_id_idx ON assets(organization_id);
CREATE INDEX IF NOT EXISTS assets_risk_level_idx ON assets(risk_level);
CREATE INDEX IF NOT EXISTS assets_asset_type_idx ON assets(asset_type);
CREATE INDEX IF NOT EXISTS assets_asset_status_idx ON assets(asset_status);

ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view assets for their organization"
  ON assets FOR SELECT
  USING (organization_id IN (SELECT id::text FROM organizations WHERE user_id = auth.uid()));

CREATE POLICY "Users can create assets for their organization"
  ON assets FOR INSERT
  WITH CHECK (
    organization_id IN (SELECT id::text FROM organizations WHERE user_id = auth.uid())
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can update assets for their organization"
  ON assets FOR UPDATE
  USING (organization_id IN (SELECT id::text FROM organizations WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete assets for their organization"
  ON assets FOR DELETE
  USING (organization_id IN (SELECT id::text FROM organizations WHERE user_id = auth.uid()));

-- Auto-compute risk_score and risk_level based on security posture
CREATE OR REPLACE FUNCTION compute_asset_risk()
RETURNS TRIGGER AS $$
DECLARE
  score integer := 0;
BEGIN
  -- Base risk for PHI access
  IF NEW.has_phi_access THEN score := score + 20; END IF;

  -- Encryption
  IF NEW.encryption_enabled = false OR NEW.encryption_enabled IS NULL THEN score := score + 25; END IF;

  -- MFA
  IF NEW.mfa_enabled = false OR NEW.mfa_enabled IS NULL THEN score := score + 20; END IF;

  -- Auto updates
  IF NEW.auto_update_enabled = false OR NEW.auto_update_enabled IS NULL THEN score := score + 10; END IF;

  -- Antivirus (relevant for device/system types)
  IF NEW.asset_type IN ('device', 'system') AND (NEW.antivirus_installed = false OR NEW.antivirus_installed IS NULL) THEN
    score := score + 15;
  END IF;

  -- Unmanaged BYOD
  IF NEW.is_managed = false THEN score := score + 10; END IF;

  -- Cap at 100
  NEW.risk_score := LEAST(score, 100);

  -- Set risk_level based on score
  IF NEW.risk_score >= 70 THEN
    NEW.risk_level := 'critical';
  ELSIF NEW.risk_score >= 50 THEN
    NEW.risk_level := 'high';
  ELSIF NEW.risk_score >= 25 THEN
    NEW.risk_level := 'medium';
  ELSE
    NEW.risk_level := 'low';
  END IF;

  NEW.updated_at := timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER assets_compute_risk
  BEFORE INSERT OR UPDATE ON assets
  FOR EACH ROW EXECUTE FUNCTION compute_asset_risk();

COMMENT ON TABLE assets IS 'PHI-touching asset inventory with automated risk scoring';
COMMENT ON COLUMN assets.risk_score IS 'Auto-computed 0-100 risk score based on security posture gaps';
