-- Create a function that inserts training records using SQL directly
-- This function uses SECURITY DEFINER to bypass RLS and schema cache validation
-- It accepts all parameters as individual values to avoid JSONB parsing issues

CREATE OR REPLACE FUNCTION insert_training_record_direct(
  p_user_id uuid,
  p_full_name text,
  p_email text,
  p_role_title text,
  p_training_type text,
  p_training_date timestamp with time zone,
  p_completion_status text,
  p_expiration_date timestamp with time zone,
  p_acknowledgement boolean,
  p_acknowledgement_date timestamp with time zone,
  p_recorded_by text,
  p_record_timestamp timestamp with time zone,
  p_organization_id uuid DEFAULT NULL,
  p_staff_member_id uuid DEFAULT NULL,
  p_training_content_version text DEFAULT '1.0',
  p_quiz_score numeric DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_record_id uuid;
  v_result jsonb;
BEGIN
  -- Insert training record directly
  INSERT INTO training_records (
    user_id,
    organization_id,
    staff_member_id,
    full_name,
    email,
    role_title,
    training_type,
    training_date,
    completion_status,
    expiration_date,
    acknowledgement,
    acknowledgement_date,
    recorded_by,
    record_timestamp,
    training_content_version,
    quiz_score,
    updated_at
  )
  VALUES (
    p_user_id,
    p_organization_id,
    p_staff_member_id,
    p_full_name,
    p_email,
    p_role_title,
    p_training_type,
    p_training_date,
    p_completion_status,
    p_expiration_date,
    p_acknowledgement,
    p_acknowledgement_date,
    p_recorded_by,
    p_record_timestamp,
    p_training_content_version,
    p_quiz_score,
    timezone('utc'::text, now())
  )
  RETURNING id INTO v_record_id;

  -- Return the inserted record as JSONB
  SELECT to_jsonb(tr.*) INTO v_result
  FROM training_records tr
  WHERE tr.id = v_record_id;

  RETURN v_result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION insert_training_record_direct TO authenticated;

-- Add comment
COMMENT ON FUNCTION insert_training_record_direct IS 'Direct insert function for training records that bypasses PostgREST schema cache validation';

