-- Complete fix for CLIA constraint and function update
-- Execute this migration to fix the constraint violation error

-- ============================================================================
-- STEP 1: Fix all constraints to allow empty strings
-- ============================================================================

-- Drop and recreate CLIA constraint
alter table organizations
  drop constraint if exists clia_format_check;

alter table organizations
  add constraint clia_format_check 
  check (
    clia_certificate_number is null 
    or clia_certificate_number = ''
    or length(trim(clia_certificate_number)) >= 10
  );

-- Drop and recreate EIN constraint
alter table organizations
  drop constraint if exists ein_format_check;

alter table organizations
  add constraint ein_format_check 
  check (
    ein is null 
    or ein = ''
    or ein ~ '^\d{2}-\d{7}$'
  );

-- Drop and recreate NPI constraint
alter table organizations
  drop constraint if exists npi_format_check;

alter table organizations
  add constraint npi_format_check 
  check (
    npi is null 
    or npi = ''
    or npi ~ '^\d{10}$'
  );

-- ============================================================================
-- STEP 2: Update the RPC function to properly handle empty strings
-- ============================================================================

DROP FUNCTION IF EXISTS upsert_organization_jsonb(jsonb) CASCADE;

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
  assessment_date timestamp with time zone,
  next_review_date timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  ein text,
  npi text,
  state_license_number text,
  clia_certificate_number text,
  medicare_provider_number text,
  state_tax_id text,
  authorized_representative_name text,
  authorized_representative_title text,
  ceo_name text,
  ceo_title text,
  phone_number text,
  email_address text,
  website text,
  accreditation_status text,
  types_of_services text,
  insurance_coverage text,
  performs_laboratory_tests boolean,
  serves_medicare_patients boolean
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
  v_clia_value text;
  v_ein_value text;
  v_npi_value text;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;
  
  v_now := timezone('utc'::text, now());
  v_assessment_date := v_now;
  v_next_review_date := v_assessment_date + interval '12 months';
  
  -- Process EIN: convert empty/null to NULL, validate format if provided
  v_ein_value := NULLIF(NULLIF(trim(p_data->>'ein'), ''), 'null');
  IF v_ein_value IS NOT NULL AND NOT (v_ein_value ~ '^\d{2}-\d{7}$') THEN
    v_ein_value := NULL; -- Invalid EIN format, set to NULL
  END IF;
  
  -- Process NPI: convert empty/null to NULL, validate format if provided
  v_npi_value := NULLIF(NULLIF(trim(p_data->>'npi'), ''), 'null');
  IF v_npi_value IS NOT NULL AND NOT (v_npi_value ~ '^\d{10}$') THEN
    v_npi_value := NULL; -- Invalid NPI format, set to NULL
  END IF;
  
  -- Process CLIA value: convert empty/null to NULL
  v_clia_value := NULLIF(NULLIF(trim(p_data->>'clia_certificate_number'), ''), 'null');
  IF v_clia_value IS NOT NULL AND length(trim(v_clia_value)) < 10 THEN
    v_clia_value := NULL; -- Invalid CLIA, set to NULL
  END IF;
  
  SELECT o.id INTO v_existing_org_id
  FROM public.organizations o
  WHERE o.user_id = v_user_id
  LIMIT 1;
  
  IF v_existing_org_id IS NULL THEN
    INSERT INTO public.organizations (
      id, user_id, name, legal_name, dba, type, state,
      address_street, address_city, address_state, address_zip,
      security_officer_name, security_officer_email, security_officer_role,
      privacy_officer_name, privacy_officer_email, privacy_officer_role,
      employee_count, has_employees, uses_contractors,
      stores_phi_electronically, uses_cloud_services,
      assessment_date, next_review_date, created_at, updated_at,
      ein, npi, state_license_number, clia_certificate_number,
      medicare_provider_number, state_tax_id,
      authorized_representative_name, authorized_representative_title,
      ceo_name, ceo_title,
      phone_number, email_address, website,
      accreditation_status, types_of_services, insurance_coverage,
      performs_laboratory_tests, serves_medicare_patients
    )
    VALUES (
      gen_random_uuid(), v_user_id,
      p_data->>'name', p_data->>'legal_name', NULLIF(p_data->>'dba', ''),
      p_data->>'type', p_data->>'state',
      p_data->>'address_street', p_data->>'address_city',
      p_data->>'address_state', p_data->>'address_zip',
      p_data->>'security_officer_name', p_data->>'security_officer_email',
      p_data->>'security_officer_role',
      p_data->>'privacy_officer_name', p_data->>'privacy_officer_email',
      p_data->>'privacy_officer_role',
      COALESCE((p_data->>'employee_count')::integer, 1),
      COALESCE((p_data->>'has_employees')::boolean, true),
      COALESCE((p_data->>'uses_contractors')::boolean, false),
      COALESCE((p_data->>'stores_phi_electronically')::boolean, true),
      COALESCE((p_data->>'uses_cloud_services')::boolean, false),
      v_assessment_date, v_next_review_date, v_now, v_now,
      v_ein_value, -- Use processed EIN value
      v_npi_value, -- Use processed NPI value
      NULLIF(NULLIF(p_data->>'state_license_number', ''), 'null'),
      v_clia_value, -- Use processed CLIA value
      NULLIF(NULLIF(p_data->>'medicare_provider_number', ''), 'null'),
      NULLIF(NULLIF(p_data->>'state_tax_id', ''), 'null'),
      NULLIF(NULLIF(p_data->>'authorized_representative_name', ''), 'null'),
      NULLIF(NULLIF(p_data->>'authorized_representative_title', ''), 'null'),
      NULLIF(NULLIF(p_data->>'ceo_name', ''), 'null'),
      NULLIF(NULLIF(p_data->>'ceo_title', ''), 'null'),
      NULLIF(NULLIF(p_data->>'phone_number', ''), 'null'),
      NULLIF(NULLIF(p_data->>'email_address', ''), 'null'),
      NULLIF(NULLIF(p_data->>'website', ''), 'null'),
      NULLIF(NULLIF(p_data->>'accreditation_status', ''), 'null'),
      NULLIF(NULLIF(p_data->>'types_of_services', ''), 'null'),
      NULLIF(NULLIF(p_data->>'insurance_coverage', ''), 'null'),
      COALESCE((p_data->>'performs_laboratory_tests')::boolean, false),
      COALESCE((p_data->>'serves_medicare_patients')::boolean, false)
    )
    RETURNING public.organizations.id INTO v_org_id;
  ELSE
    -- Process EIN, NPI, and CLIA for UPDATE
    v_ein_value := NULLIF(NULLIF(trim(p_data->>'ein'), ''), 'null');
    IF v_ein_value IS NOT NULL AND NOT (v_ein_value ~ '^\d{2}-\d{7}$') THEN
      v_ein_value := NULL;
    END IF;
    
    v_npi_value := NULLIF(NULLIF(trim(p_data->>'npi'), ''), 'null');
    IF v_npi_value IS NOT NULL AND NOT (v_npi_value ~ '^\d{10}$') THEN
      v_npi_value := NULL;
    END IF;
    
    v_clia_value := NULLIF(NULLIF(trim(p_data->>'clia_certificate_number'), ''), 'null');
    IF v_clia_value IS NOT NULL AND length(trim(v_clia_value)) < 10 THEN
      v_clia_value := NULL;
    END IF;
    
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
      assessment_date = COALESCE(o.assessment_date, v_assessment_date),
      next_review_date = COALESCE(o.next_review_date, v_next_review_date),
      updated_at = v_now,
      ein = COALESCE(v_ein_value, o.ein),
      npi = COALESCE(v_npi_value, o.npi),
      state_license_number = COALESCE(NULLIF(NULLIF(p_data->>'state_license_number', ''), 'null'), o.state_license_number),
      clia_certificate_number = COALESCE(v_clia_value, o.clia_certificate_number),
      medicare_provider_number = COALESCE(NULLIF(NULLIF(p_data->>'medicare_provider_number', ''), 'null'), o.medicare_provider_number),
      state_tax_id = COALESCE(NULLIF(NULLIF(p_data->>'state_tax_id', ''), 'null'), o.state_tax_id),
      authorized_representative_name = COALESCE(NULLIF(NULLIF(p_data->>'authorized_representative_name', ''), 'null'), o.authorized_representative_name),
      authorized_representative_title = COALESCE(NULLIF(NULLIF(p_data->>'authorized_representative_title', ''), 'null'), o.authorized_representative_title),
      ceo_name = COALESCE(NULLIF(NULLIF(p_data->>'ceo_name', ''), 'null'), o.ceo_name),
      ceo_title = COALESCE(NULLIF(NULLIF(p_data->>'ceo_title', ''), 'null'), o.ceo_title),
      phone_number = COALESCE(NULLIF(NULLIF(p_data->>'phone_number', ''), 'null'), o.phone_number),
      email_address = COALESCE(NULLIF(NULLIF(p_data->>'email_address', ''), 'null'), o.email_address),
      website = COALESCE(NULLIF(NULLIF(p_data->>'website', ''), 'null'), o.website),
      accreditation_status = COALESCE(NULLIF(NULLIF(p_data->>'accreditation_status', ''), 'null'), o.accreditation_status),
      types_of_services = COALESCE(NULLIF(NULLIF(p_data->>'types_of_services', ''), 'null'), o.types_of_services),
      insurance_coverage = COALESCE(NULLIF(NULLIF(p_data->>'insurance_coverage', ''), 'null'), o.insurance_coverage),
      performs_laboratory_tests = COALESCE((p_data->>'performs_laboratory_tests')::boolean, o.performs_laboratory_tests),
      serves_medicare_patients = COALESCE((p_data->>'serves_medicare_patients')::boolean, o.serves_medicare_patients)
    WHERE o.user_id = v_user_id
    RETURNING o.id INTO v_org_id;
  END IF;
  
  RETURN QUERY
  SELECT o.id, o.user_id, o.name, o.legal_name, o.dba, o.type, o.state,
    o.address_street, o.address_city, o.address_state, o.address_zip,
    o.security_officer_name, o.security_officer_email, o.security_officer_role,
    o.privacy_officer_name, o.privacy_officer_email, o.privacy_officer_role,
    o.employee_count, o.has_employees, o.uses_contractors,
    o.stores_phi_electronically, o.uses_cloud_services,
    o.assessment_date, o.next_review_date, o.created_at, o.updated_at,
    o.ein, o.npi, o.state_license_number, o.clia_certificate_number,
    o.medicare_provider_number, o.state_tax_id,
    o.authorized_representative_name, o.authorized_representative_title,
    o.ceo_name, o.ceo_title,
    o.phone_number, o.email_address, o.website,
    o.accreditation_status, o.types_of_services, o.insurance_coverage,
    o.performs_laboratory_tests, o.serves_medicare_patients
  FROM public.organizations o
  WHERE o.id = v_org_id;
END;
$$;

GRANT EXECUTE ON FUNCTION upsert_organization_jsonb(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_organization_jsonb(jsonb) TO anon;
