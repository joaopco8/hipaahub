-- ============================================================================
-- Add metadata column to organizations table for additional onboarding data
-- ============================================================================
-- This allows storing all additional onboarding fields that don't fit
-- into the main organization schema (specialties, ehr_system, etc.)
-- ============================================================================

-- Add metadata column if it doesn't exist
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS onboarding_metadata jsonb DEFAULT '{}'::jsonb;

-- Create index for JSONB queries
CREATE INDEX IF NOT EXISTS idx_organizations_onboarding_metadata 
ON organizations USING gin (onboarding_metadata);

-- Add comment
COMMENT ON COLUMN organizations.onboarding_metadata IS 
'Additional onboarding data including specialties, technology details, and other metadata collected during onboarding';

-- Update the RPC function to also save metadata
CREATE OR REPLACE FUNCTION upsert_organization_jsonb(
  p_data jsonb
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  name text,
  legal_name text,
  dba text,
  type text,
  state text,
  address_street text,
  address_city text,
  address_state text,
  address_zip text,
  security_officer_name text,
  security_officer_email text,
  security_officer_role text,
  privacy_officer_name text,
  privacy_officer_email text,
  privacy_officer_role text,
  employee_count integer,
  has_employees boolean,
  uses_contractors boolean,
  stores_phi_electronically boolean,
  uses_cloud_services boolean,
  -- US HIPAA Required Legal Identifiers
  ein text,
  npi text,
  state_license_number text,
  state_tax_id text,
  -- Authorized Representative / CEO
  authorized_representative_name text,
  authorized_representative_title text,
  ceo_name text,
  ceo_title text,
  -- Conditional Fields
  performs_laboratory_tests boolean,
  clia_certificate_number text,
  serves_medicare_patients boolean,
  medicare_provider_number text,
  -- Optional but Recommended
  phone_number text,
  email_address text,
  website text,
  accreditation_status text,
  types_of_services text,
  insurance_coverage text,
  -- Metadata
  assessment_date timestamp with time zone,
  next_review_date timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_org_id uuid;
  v_now timestamp with time zone;
  v_assessment_date timestamp with time zone;
  v_next_review_date timestamp with time zone;
  v_existing_org_id uuid;
  v_metadata jsonb;
BEGIN
  -- ========================================================================
  -- SECURITY: Use auth.uid() exclusively
  -- ========================================================================
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;
  
  -- ========================================================================
  -- EXTRACT METADATA FROM p_data
  -- ========================================================================
  -- Extract fields that should go into metadata JSONB
  v_metadata := jsonb_build_object(
    'practice_type_primary', p_data->>'practice_type_primary',
    'specialties', p_data->'specialties',
    'number_of_locations', (p_data->>'number_of_locations')::integer,
    'multi_state_operations', (p_data->>'multi_state_operations')::boolean,
    'remote_workforce', (p_data->>'remote_workforce')::boolean,
    'ehr_system', p_data->>'ehr_system',
    'email_provider', p_data->>'email_provider',
    'cloud_storage_provider', p_data->>'cloud_storage_provider',
    'uses_vpn', (p_data->>'uses_vpn')::boolean,
    'vpn_provider', p_data->>'vpn_provider',
    'device_types', p_data->'device_types',
    'security_officer_role_other', p_data->>'security_officer_role_other',
    'privacy_officer_role_other', p_data->>'privacy_officer_role_other',
    'primary_contact_name', p_data->>'primary_contact_name',
    'compliance_contact_email', p_data->>'compliance_contact_email',
    'compliance_contact_phone', p_data->>'compliance_contact_phone'
  );
  
  -- Remove null values from metadata
  v_metadata := v_metadata - 'null';
  
  -- ========================================================================
  -- PREPARE DATA
  -- ========================================================================
  v_now := timezone('utc'::text, now());
  v_assessment_date := v_now;
  v_next_review_date := v_assessment_date + interval '12 months';
  
  -- ========================================================================
  -- CHECK IF ORGANIZATION EXISTS
  -- ========================================================================
  SELECT o.id INTO v_existing_org_id
  FROM public.organizations o
  WHERE o.user_id = v_user_id
  LIMIT 1;
  
  -- ========================================================================
  -- INSERT OR UPDATE
  -- ========================================================================
  IF v_existing_org_id IS NULL THEN
    -- INSERT: Create new organization
    INSERT INTO public.organizations (
      id,
      user_id,
      name,
      legal_name,
      dba,
      type,
      state,
      address_street,
      address_city,
      address_state,
      address_zip,
      security_officer_name,
      security_officer_email,
      security_officer_role,
      privacy_officer_name,
      privacy_officer_email,
      privacy_officer_role,
      employee_count,
      has_employees,
      uses_contractors,
      stores_phi_electronically,
      uses_cloud_services,
      -- US HIPAA Required Legal Identifiers
      ein,
      npi,
      state_license_number,
      state_tax_id,
      -- Authorized Representative / CEO
      authorized_representative_name,
      authorized_representative_title,
      ceo_name,
      ceo_title,
      -- Conditional Fields
      performs_laboratory_tests,
      clia_certificate_number,
      serves_medicare_patients,
      medicare_provider_number,
      -- Optional but Recommended
      phone_number,
      email_address,
      website,
      accreditation_status,
      types_of_services,
      insurance_coverage,
      -- Metadata
      onboarding_metadata,
      assessment_date,
      next_review_date,
      created_at,
      updated_at
    )
    VALUES (
      gen_random_uuid(),
      v_user_id,
      p_data->>'name',
      p_data->>'legal_name',
      NULLIF(p_data->>'dba', ''),
      p_data->>'type',
      p_data->>'state',
      p_data->>'address_street',
      p_data->>'address_city',
      p_data->>'address_state',
      p_data->>'address_zip',
      p_data->>'security_officer_name',
      p_data->>'security_officer_email',
      p_data->>'security_officer_role',
      p_data->>'privacy_officer_name',
      p_data->>'privacy_officer_email',
      p_data->>'privacy_officer_role',
      COALESCE((p_data->>'employee_count')::integer, 1),
      COALESCE((p_data->>'has_employees')::boolean, true),
      COALESCE((p_data->>'uses_contractors')::boolean, false),
      COALESCE((p_data->>'stores_phi_electronically')::boolean, true),
      COALESCE((p_data->>'uses_cloud_services')::boolean, false),
      -- US HIPAA Required Legal Identifiers
      NULLIF(p_data->>'ein', ''),
      NULLIF(p_data->>'npi', ''),
      NULLIF(p_data->>'state_license_number', ''),
      NULLIF(p_data->>'state_tax_id', ''),
      -- Authorized Representative / CEO
      NULLIF(p_data->>'authorized_representative_name', ''),
      NULLIF(p_data->>'authorized_representative_title', ''),
      NULLIF(p_data->>'ceo_name', ''),
      NULLIF(p_data->>'ceo_title', ''),
      -- Conditional Fields
      COALESCE((p_data->>'performs_laboratory_tests')::boolean, false),
      NULLIF(p_data->>'clia_certificate_number', ''),
      COALESCE((p_data->>'serves_medicare_patients')::boolean, false),
      NULLIF(p_data->>'medicare_provider_number', ''),
      -- Optional but Recommended
      NULLIF(p_data->>'phone_number', ''),
      NULLIF(p_data->>'email_address', ''),
      NULLIF(p_data->>'website', ''),
      NULLIF(p_data->>'accreditation_status', ''),
      NULLIF(p_data->>'types_of_services', ''),
      NULLIF(p_data->>'insurance_coverage', ''),
      -- Metadata
      v_metadata,
      v_assessment_date,
      v_next_review_date,
      v_now,
      v_now
    )
    RETURNING public.organizations.id INTO v_org_id;
  ELSE
    -- UPDATE: Update existing organization
    -- Merge metadata instead of replacing
    UPDATE public.organizations o
    SET
      name = p_data->>'name',
      legal_name = p_data->>'legal_name',
      dba = NULLIF(p_data->>'dba', ''),
      type = p_data->>'type',
      state = p_data->>'state',
      address_street = p_data->>'address_street',
      address_city = p_data->>'address_city',
      address_state = p_data->>'address_state',
      address_zip = p_data->>'address_zip',
      security_officer_name = p_data->>'security_officer_name',
      security_officer_email = p_data->>'security_officer_email',
      security_officer_role = p_data->>'security_officer_role',
      privacy_officer_name = p_data->>'privacy_officer_name',
      privacy_officer_email = p_data->>'privacy_officer_email',
      privacy_officer_role = p_data->>'privacy_officer_role',
      employee_count = COALESCE((p_data->>'employee_count')::integer, o.employee_count),
      has_employees = COALESCE((p_data->>'has_employees')::boolean, o.has_employees),
      uses_contractors = COALESCE((p_data->>'uses_contractors')::boolean, o.uses_contractors),
      stores_phi_electronically = COALESCE((p_data->>'stores_phi_electronically')::boolean, o.stores_phi_electronically),
      uses_cloud_services = COALESCE((p_data->>'uses_cloud_services')::boolean, o.uses_cloud_services),
      -- US HIPAA Required Legal Identifiers
      ein = COALESCE(NULLIF(p_data->>'ein', ''), o.ein),
      npi = COALESCE(NULLIF(p_data->>'npi', ''), o.npi),
      state_license_number = COALESCE(NULLIF(p_data->>'state_license_number', ''), o.state_license_number),
      state_tax_id = COALESCE(NULLIF(p_data->>'state_tax_id', ''), o.state_tax_id),
      -- Authorized Representative / CEO
      authorized_representative_name = COALESCE(NULLIF(p_data->>'authorized_representative_name', ''), o.authorized_representative_name),
      authorized_representative_title = COALESCE(NULLIF(p_data->>'authorized_representative_title', ''), o.authorized_representative_title),
      ceo_name = COALESCE(NULLIF(p_data->>'ceo_name', ''), o.ceo_name),
      ceo_title = COALESCE(NULLIF(p_data->>'ceo_title', ''), o.ceo_title),
      -- Conditional Fields
      performs_laboratory_tests = COALESCE((p_data->>'performs_laboratory_tests')::boolean, o.performs_laboratory_tests),
      clia_certificate_number = COALESCE(NULLIF(p_data->>'clia_certificate_number', ''), o.clia_certificate_number),
      serves_medicare_patients = COALESCE((p_data->>'serves_medicare_patients')::boolean, o.serves_medicare_patients),
      medicare_provider_number = COALESCE(NULLIF(p_data->>'medicare_provider_number', ''), o.medicare_provider_number),
      -- Optional but Recommended
      phone_number = COALESCE(NULLIF(p_data->>'phone_number', ''), o.phone_number),
      email_address = COALESCE(NULLIF(p_data->>'email_address', ''), o.email_address),
      website = COALESCE(NULLIF(p_data->>'website', ''), o.website),
      accreditation_status = COALESCE(NULLIF(p_data->>'accreditation_status', ''), o.accreditation_status),
      types_of_services = COALESCE(NULLIF(p_data->>'types_of_services', ''), o.types_of_services),
      insurance_coverage = COALESCE(NULLIF(p_data->>'insurance_coverage', ''), o.insurance_coverage),
      -- Metadata: Merge with existing metadata
      onboarding_metadata = COALESCE(o.onboarding_metadata, '{}'::jsonb) || v_metadata,
      -- Metadata: Preserve existing dates if they exist
      assessment_date = COALESCE(o.assessment_date, v_assessment_date),
      next_review_date = COALESCE(o.next_review_date, v_next_review_date),
      updated_at = v_now
    WHERE o.user_id = v_user_id
    RETURNING o.id INTO v_org_id;
  END IF;
  
  -- ========================================================================
  -- RETURN RESULT
  -- ========================================================================
  RETURN QUERY
  SELECT 
    o.id,
    o.user_id,
    o.name,
    o.legal_name,
    o.dba,
    o.type,
    o.state,
    o.address_street,
    o.address_city,
    o.address_state,
    o.address_zip,
    o.security_officer_name,
    o.security_officer_email,
    o.security_officer_role,
    o.privacy_officer_name,
    o.privacy_officer_email,
    o.privacy_officer_role,
    o.employee_count,
    o.has_employees,
    o.uses_contractors,
    o.stores_phi_electronically,
    o.uses_cloud_services,
    -- US HIPAA Required Legal Identifiers
    o.ein,
    o.npi,
    o.state_license_number,
    o.state_tax_id,
    -- Authorized Representative / CEO
    o.authorized_representative_name,
    o.authorized_representative_title,
    o.ceo_name,
    o.ceo_title,
    -- Conditional Fields
    o.performs_laboratory_tests,
    o.clia_certificate_number,
    o.serves_medicare_patients,
    o.medicare_provider_number,
    -- Optional but Recommended
    o.phone_number,
    o.email_address,
    o.website,
    o.accreditation_status,
    o.types_of_services,
    o.insurance_coverage,
    -- Metadata
    o.assessment_date,
    o.next_review_date,
    o.created_at,
    o.updated_at
  FROM public.organizations o
  WHERE o.id = v_org_id;
END;
$$;

-- Update permissions
GRANT EXECUTE ON FUNCTION upsert_organization_jsonb(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_organization_jsonb(jsonb) TO anon;
