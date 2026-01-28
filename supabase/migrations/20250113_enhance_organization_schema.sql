-- Migration: Enhanced Organization Schema for HIPAA Compliance
-- Adds validation, structure, and technology fields

-- Add country/jurisdiction field
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS country VARCHAR(2) DEFAULT 'US' CHECK (country IN ('US', 'CA', 'MX'));

-- Update practice type to be more specific
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS practice_type_primary VARCHAR(50) CHECK (practice_type_primary IN ('medical', 'dental', 'behavioral-health', 'laboratory', 'imaging', 'telemedicine', 'hospital', 'multi-specialty'));

-- Add specialties array
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS specialties TEXT[];

-- Update officer roles to use dropdown values
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS security_officer_role_type VARCHAR(50) CHECK (security_officer_role_type IN ('hipaa-security-officer', 'compliance-manager', 'practice-administrator', 'it-director', 'ceo', 'managing-director', 'other'));

ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS security_officer_role_other VARCHAR(255);

ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS privacy_officer_role_type VARCHAR(50) CHECK (privacy_officer_role_type IN ('hipaa-privacy-officer', 'compliance-manager', 'practice-administrator', 'ceo', 'managing-director', 'other'));

ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS privacy_officer_role_other VARCHAR(255);

-- Add organizational structure fields
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS number_of_locations INTEGER DEFAULT 1 CHECK (number_of_locations > 0);

ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS multi_state_operations BOOLEAN DEFAULT false;

ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS remote_workforce BOOLEAN DEFAULT false;

-- Add technology fields (separated)
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS ehr_system VARCHAR(255); -- Epic, Cerner, Athena, etc.

ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS email_provider VARCHAR(255); -- Outlook, Gmail, etc.

ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS cloud_storage_provider VARCHAR(255); -- AWS, Azure, Google Cloud, etc.

ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS uses_vpn BOOLEAN DEFAULT false;

ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS vpn_provider VARCHAR(255);

ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS device_types TEXT[]; -- laptops, mobiles, tablets, etc.

-- Migrate existing data
UPDATE organizations 
SET practice_type_primary = CASE 
  WHEN type = 'medical' THEN 'medical'
  WHEN type = 'dental' THEN 'dental'
  WHEN type = 'mental-health' THEN 'behavioral-health'
  WHEN type = 'therapy' THEN 'behavioral-health'
  ELSE 'medical'
END
WHERE practice_type_primary IS NULL;

UPDATE organizations 
SET country = 'US' 
WHERE country IS NULL;

UPDATE organizations 
SET number_of_locations = 1 
WHERE number_of_locations IS NULL;

-- Add validation function for US addresses
CREATE OR REPLACE FUNCTION validate_us_address()
RETURNS TRIGGER AS $$
BEGIN
  -- If country is US, validate state codes and ZIP
  IF NEW.country = 'US' THEN
    -- State must be valid US state code
    IF NEW.state NOT IN ('AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
                         'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
                         'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
                         'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
                         'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC') THEN
      RAISE EXCEPTION 'Invalid US state code: %', NEW.state;
    END IF;
    
    -- Address state must match organization state (or be valid US state)
    IF NEW.address_state NOT IN ('AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
                                   'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
                                   'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
                                   'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
                                   'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC') THEN
      RAISE EXCEPTION 'Invalid US address state code: %', NEW.address_state;
    END IF;
    
    -- ZIP must be 5 digits or 9 digits (XXXXX or XXXXX-XXXX)
    IF NEW.address_zip !~ '^\d{5}(-\d{4})?$' THEN
      RAISE EXCEPTION 'Invalid US ZIP code format. Must be 5 digits or 9 digits (XXXXX or XXXXX-XXXX): %', NEW.address_zip;
    END IF;
    
    -- CLIA only valid for US
    IF NEW.clia_certificate_number IS NOT NULL AND NEW.country != 'US' THEN
      RAISE EXCEPTION 'CLIA Certificate Number is only valid for US organizations';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for validation
DROP TRIGGER IF EXISTS validate_organization_address ON organizations;
CREATE TRIGGER validate_organization_address
  BEFORE INSERT OR UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION validate_us_address();

-- Add comments for documentation
COMMENT ON COLUMN organizations.country IS 'Jurisdiction: US, CA, or MX. Determines validation rules.';
COMMENT ON COLUMN organizations.practice_type_primary IS 'Primary practice type for HIPAA compliance categorization.';
COMMENT ON COLUMN organizations.specialties IS 'Array of medical specialties (e.g., Cardiology, Psychiatry, Pediatrics).';
COMMENT ON COLUMN organizations.security_officer_role_type IS 'Standardized role type for Security Officer (dropdown).';
COMMENT ON COLUMN organizations.privacy_officer_role_type IS 'Standardized role type for Privacy Officer (dropdown).';
COMMENT ON COLUMN organizations.number_of_locations IS 'Number of physical locations. Required for multi-location compliance.';
COMMENT ON COLUMN organizations.multi_state_operations IS 'Whether organization operates in multiple states.';
COMMENT ON COLUMN organizations.remote_workforce IS 'Whether organization has remote workforce members.';
COMMENT ON COLUMN organizations.ehr_system IS 'Electronic Health Record system name (Epic, Cerner, Athena, etc.).';
COMMENT ON COLUMN organizations.email_provider IS 'Email service provider (Outlook, Gmail, etc.).';
COMMENT ON COLUMN organizations.cloud_storage_provider IS 'Cloud storage provider (AWS, Azure, Google Cloud, etc.).';
COMMENT ON COLUMN organizations.device_types IS 'Array of device types used (laptops, mobiles, tablets, etc.).';
