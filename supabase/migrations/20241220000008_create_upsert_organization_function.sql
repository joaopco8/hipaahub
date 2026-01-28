-- Create a function to upsert organization data using raw SQL
-- This bypasses the Supabase schema cache validation issue

CREATE OR REPLACE FUNCTION upsert_organization(
  p_user_id uuid,
  p_name text,
  p_legal_name text,
  p_type text,
  p_state text,
  p_address_street text,
  p_address_city text,
  p_address_state text,
  p_address_zip text,
  p_security_officer_name text,
  p_security_officer_email text,
  p_security_officer_role text,
  p_privacy_officer_name text,
  p_privacy_officer_email text,
  p_privacy_officer_role text,
  p_employee_count integer,
  p_dba text,
  p_has_employees boolean,
  p_uses_contractors boolean,
  p_stores_phi_electronically boolean,
  p_uses_cloud_services boolean
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
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_assessment_date timestamp with time zone;
  v_next_review_date timestamp with time zone;
  v_org_id uuid;
BEGIN
  -- Set assessment date
  v_assessment_date := timezone('utc'::text, now());
  v_next_review_date := v_assessment_date + interval '12 months';

  -- Upsert organization
  INSERT INTO organizations (
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
    assessment_date,
    next_review_date,
    updated_at
  )
  VALUES (
    p_user_id,
    p_name,
    p_legal_name,
    p_dba,
    p_type,
    p_state,
    p_address_street,
    p_address_city,
    p_address_state,
    p_address_zip,
    p_security_officer_name,
    p_security_officer_email,
    p_security_officer_role,
    p_privacy_officer_name,
    p_privacy_officer_email,
    p_privacy_officer_role,
    p_employee_count,
    p_has_employees,
    p_uses_contractors,
    p_stores_phi_electronically,
    p_uses_cloud_services,
    v_assessment_date,
    v_next_review_date,
    timezone('utc'::text, now())
  )
  ON CONFLICT (user_id) DO UPDATE SET
    name = EXCLUDED.name,
    legal_name = EXCLUDED.legal_name,
    dba = EXCLUDED.dba,
    type = EXCLUDED.type,
    state = EXCLUDED.state,
    address_street = EXCLUDED.address_street,
    address_city = EXCLUDED.address_city,
    address_state = EXCLUDED.address_state,
    address_zip = EXCLUDED.address_zip,
    security_officer_name = EXCLUDED.security_officer_name,
    security_officer_email = EXCLUDED.security_officer_email,
    security_officer_role = EXCLUDED.security_officer_role,
    privacy_officer_name = EXCLUDED.privacy_officer_name,
    privacy_officer_email = EXCLUDED.privacy_officer_email,
    privacy_officer_role = EXCLUDED.privacy_officer_role,
    employee_count = EXCLUDED.employee_count,
    has_employees = EXCLUDED.has_employees,
    uses_contractors = EXCLUDED.uses_contractors,
    stores_phi_electronically = EXCLUDED.stores_phi_electronically,
    uses_cloud_services = EXCLUDED.uses_cloud_services,
    assessment_date = CASE 
      WHEN organizations.assessment_date IS NULL THEN EXCLUDED.assessment_date
      ELSE organizations.assessment_date
    END,
    next_review_date = CASE
      WHEN organizations.assessment_date IS NULL THEN EXCLUDED.next_review_date
      ELSE organizations.next_review_date
    END,
    updated_at = timezone('utc'::text, now())
  RETURNING organizations.id INTO v_org_id;

  -- Return the updated organization
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
    o.assessment_date,
    o.next_review_date,
    o.created_at,
    o.updated_at
  FROM organizations o
  WHERE o.id = v_org_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION upsert_organization TO authenticated;

