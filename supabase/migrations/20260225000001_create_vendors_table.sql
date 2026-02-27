-- Create vendors table for Vendor & BAA Management
CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id text NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Vendor Information
  vendor_name text NOT NULL,
  service_type text NOT NULL,
  
  -- Contact Information
  contact_name text,
  contact_email text,
  contact_phone text,
  
  -- PHI Access & BAA Status
  has_phi_access boolean NOT NULL DEFAULT false,
  baa_signed boolean NOT NULL DEFAULT false,
  baa_signed_date date,
  baa_expiration_date date,
  
  -- Risk Assessment
  risk_level text NOT NULL DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high')),
  
  -- Additional Notes
  notes text,
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create vendor_baa_files table for BAA document storage
CREATE TABLE IF NOT EXISTS vendor_baa_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  organization_id text NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- File Information
  file_name text NOT NULL,
  file_path text NOT NULL, -- Supabase Storage path
  file_size integer NOT NULL,
  mime_type text NOT NULL DEFAULT 'application/pdf',
  file_hash text, -- SHA-256 hash for integrity verification
  
  -- Versioning
  version integer NOT NULL DEFAULT 1,
  is_current boolean NOT NULL DEFAULT true,
  
  -- Metadata
  uploaded_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  uploaded_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Notes
  notes text
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS vendors_organization_id_idx ON vendors(organization_id);
CREATE INDEX IF NOT EXISTS vendors_baa_expiration_date_idx ON vendors(baa_expiration_date);
CREATE INDEX IF NOT EXISTS vendors_risk_level_idx ON vendors(risk_level);
CREATE INDEX IF NOT EXISTS vendor_baa_files_vendor_id_idx ON vendor_baa_files(vendor_id);
CREATE INDEX IF NOT EXISTS vendor_baa_files_organization_id_idx ON vendor_baa_files(organization_id);
CREATE INDEX IF NOT EXISTS vendor_baa_files_is_current_idx ON vendor_baa_files(is_current);

-- Enable RLS
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_baa_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vendors
CREATE POLICY "Users can view vendors for their organization"
  ON vendors FOR SELECT
  USING (
    organization_id IN (
      SELECT id::text FROM organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create vendors for their organization"
  ON vendors FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT id::text FROM organizations WHERE user_id = auth.uid()
    )
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can update vendors for their organization"
  ON vendors FOR UPDATE
  USING (
    organization_id IN (
      SELECT id::text FROM organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete vendors for their organization"
  ON vendors FOR DELETE
  USING (
    organization_id IN (
      SELECT id::text FROM organizations WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for vendor_baa_files
CREATE POLICY "Users can view BAA files for their organization's vendors"
  ON vendor_baa_files FOR SELECT
  USING (
    organization_id IN (
      SELECT id::text FROM organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload BAA files for their organization's vendors"
  ON vendor_baa_files FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT id::text FROM organizations WHERE user_id = auth.uid()
    )
    AND uploaded_by = auth.uid()
  );

CREATE POLICY "Users can update BAA files for their organization's vendors"
  ON vendor_baa_files FOR UPDATE
  USING (
    organization_id IN (
      SELECT id::text FROM organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete BAA files for their organization's vendors"
  ON vendor_baa_files FOR DELETE
  USING (
    organization_id IN (
      SELECT id::text FROM organizations WHERE user_id = auth.uid()
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_vendors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER vendors_updated_at
  BEFORE UPDATE ON vendors
  FOR EACH ROW
  EXECUTE FUNCTION update_vendors_updated_at();

-- Function to set previous versions to is_current = false when new version is uploaded
CREATE OR REPLACE FUNCTION vendor_baa_files_version_control()
RETURNS TRIGGER AS $$
BEGIN
  -- When a new file is marked as current, set all other files for this vendor to not current
  IF NEW.is_current = true THEN
    UPDATE vendor_baa_files
    SET is_current = false
    WHERE vendor_id = NEW.vendor_id
      AND id != NEW.id
      AND is_current = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for version control
CREATE TRIGGER vendor_baa_files_version_control_trigger
  BEFORE INSERT OR UPDATE ON vendor_baa_files
  FOR EACH ROW
  EXECUTE FUNCTION vendor_baa_files_version_control();

-- Comments for documentation
COMMENT ON TABLE vendors IS 'Vendor & Business Associate tracking with BAA management';
COMMENT ON TABLE vendor_baa_files IS 'BAA document storage with version control';
COMMENT ON COLUMN vendors.risk_level IS 'Risk assessment level: low, medium, high';
COMMENT ON COLUMN vendor_baa_files.is_current IS 'Indicates if this is the current active BAA version';
