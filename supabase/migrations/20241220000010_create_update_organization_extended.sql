-- Create a simple function to update extended organization fields
-- This function only updates, doesn't insert, so it's simpler

CREATE OR REPLACE FUNCTION update_organization_extended(
  p_user_id uuid,
  p_legal_name text,
  p_dba text,
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
  p_has_employees boolean,
  p_uses_contractors boolean,
  p_stores_phi_electronically boolean,
  p_uses_cloud_services boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE organizations
  SET
    legal_name = p_legal_name,
    dba = p_dba,
    address_street = p_address_street,
    address_city = p_address_city,
    address_state = p_address_state,
    address_zip = p_address_zip,
    security_officer_name = p_security_officer_name,
    security_officer_email = p_security_officer_email,
    security_officer_role = p_security_officer_role,
    privacy_officer_name = p_privacy_officer_name,
    privacy_officer_email = p_privacy_officer_email,
    privacy_officer_role = p_privacy_officer_role,
    has_employees = p_has_employees,
    uses_contractors = p_uses_contractors,
    stores_phi_electronically = p_stores_phi_electronically,
    uses_cloud_services = p_uses_cloud_services,
    assessment_date = CASE 
      WHEN assessment_date IS NULL THEN timezone('utc'::text, now())
      ELSE assessment_date
    END,
    next_review_date = CASE
      WHEN assessment_date IS NULL THEN timezone('utc'::text, now()) + interval '12 months'
      ELSE next_review_date
    END,
    updated_at = timezone('utc'::text, now())
  WHERE user_id = p_user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_organization_extended TO authenticated;






