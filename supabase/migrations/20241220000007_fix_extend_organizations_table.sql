-- Fix: Extend organizations table with comprehensive organization data
-- This migration adds all fields required for HIPAA compliance documentation
-- Uses DO block to check if columns exist before adding them

DO $$
BEGIN
  -- Identity fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'legal_name') THEN
    ALTER TABLE organizations ADD COLUMN legal_name text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'dba') THEN
    ALTER TABLE organizations ADD COLUMN dba text;
  END IF;
  
  -- Address fields (juridically critical)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'address_street') THEN
    ALTER TABLE organizations ADD COLUMN address_street text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'address_city') THEN
    ALTER TABLE organizations ADD COLUMN address_city text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'address_state') THEN
    ALTER TABLE organizations ADD COLUMN address_state text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'address_zip') THEN
    ALTER TABLE organizations ADD COLUMN address_zip text;
  END IF;
  
  -- Security Officer (HIPAA requires names, not generic titles)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'security_officer_name') THEN
    ALTER TABLE organizations ADD COLUMN security_officer_name text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'security_officer_email') THEN
    ALTER TABLE organizations ADD COLUMN security_officer_email text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'security_officer_role') THEN
    ALTER TABLE organizations ADD COLUMN security_officer_role text;
  END IF;
  
  -- Privacy Officer (can be same person, but name must exist)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'privacy_officer_name') THEN
    ALTER TABLE organizations ADD COLUMN privacy_officer_name text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'privacy_officer_email') THEN
    ALTER TABLE organizations ADD COLUMN privacy_officer_email text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'privacy_officer_role') THEN
    ALTER TABLE organizations ADD COLUMN privacy_officer_role text;
  END IF;
  
  -- Organization structure
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'has_employees') THEN
    ALTER TABLE organizations ADD COLUMN has_employees boolean DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'uses_contractors') THEN
    ALTER TABLE organizations ADD COLUMN uses_contractors boolean DEFAULT false;
  END IF;
  
  -- Technology (minimal necessary)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'stores_phi_electronically') THEN
    ALTER TABLE organizations ADD COLUMN stores_phi_electronically boolean DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'uses_cloud_services') THEN
    ALTER TABLE organizations ADD COLUMN uses_cloud_services boolean DEFAULT false;
  END IF;
  
  -- Governance dates
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'assessment_date') THEN
    ALTER TABLE organizations ADD COLUMN assessment_date timestamp with time zone DEFAULT timezone('utc'::text, now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'next_review_date') THEN
    ALTER TABLE organizations ADD COLUMN next_review_date timestamp with time zone;
  END IF;
  
  -- Optional contact information (soft step after onboarding)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'primary_contact_name') THEN
    ALTER TABLE organizations ADD COLUMN primary_contact_name text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'compliance_contact_email') THEN
    ALTER TABLE organizations ADD COLUMN compliance_contact_email text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'compliance_contact_phone') THEN
    ALTER TABLE organizations ADD COLUMN compliance_contact_phone text;
  END IF;
  
  -- Legal identifiers (optional but powerful)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'ein') THEN
    ALTER TABLE organizations ADD COLUMN ein text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'npi') THEN
    ALTER TABLE organizations ADD COLUMN npi text;
  END IF;
END $$;

-- Set next_review_date to 12 months from assessment_date for existing records
UPDATE organizations
SET next_review_date = assessment_date + interval '12 months'
WHERE next_review_date IS NULL AND assessment_date IS NOT NULL;

-- Create function to auto-update next_review_date when assessment_date changes
CREATE OR REPLACE FUNCTION update_next_review_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.assessment_date IS NOT NULL THEN
    NEW.next_review_date = NEW.assessment_date + interval '12 months';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update next_review_date
DROP TRIGGER IF EXISTS update_next_review_date_trigger ON organizations;
CREATE TRIGGER update_next_review_date_trigger
  BEFORE INSERT OR UPDATE OF assessment_date ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_next_review_date();

-- Add comments for documentation
COMMENT ON COLUMN organizations.legal_name IS 'Legal organization name (required for contracts and ToS)';
COMMENT ON COLUMN organizations.dba IS 'Doing Business As name (optional)';
COMMENT ON COLUMN organizations.address_street IS 'Primary business address street (juridically critical for breach notification)';
COMMENT ON COLUMN organizations.address_city IS 'Primary business address city';
COMMENT ON COLUMN organizations.address_state IS 'Primary business address state';
COMMENT ON COLUMN organizations.address_zip IS 'Primary business address ZIP code';
COMMENT ON COLUMN organizations.security_officer_name IS 'Security Officer full name (HIPAA requires names, not generic titles)';
COMMENT ON COLUMN organizations.security_officer_email IS 'Security Officer email';
COMMENT ON COLUMN organizations.security_officer_role IS 'Security Officer role/title';
COMMENT ON COLUMN organizations.privacy_officer_name IS 'Privacy Officer full name (can be same person as Security Officer)';
COMMENT ON COLUMN organizations.privacy_officer_email IS 'Privacy Officer email';
COMMENT ON COLUMN organizations.privacy_officer_role IS 'Privacy Officer role/title';
COMMENT ON COLUMN organizations.assessment_date IS 'Date of current HIPAA assessment (auto-set on creation)';
COMMENT ON COLUMN organizations.next_review_date IS 'Next review date (auto-set to 12 months from assessment_date)';






