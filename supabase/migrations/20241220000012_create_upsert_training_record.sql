-- Create a function to insert training records using raw SQL
-- This bypasses the Supabase schema cache validation issue

CREATE OR REPLACE FUNCTION upsert_training_record(
  p_user_id uuid,
  p_organization_id uuid,
  p_staff_member_id uuid,
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
  p_training_content_version text,
  p_quiz_score numeric
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  organization_id uuid,
  staff_member_id uuid,
  full_name text,
  email text,
  role_title text,
  training_type text,
  training_date timestamp with time zone,
  completion_status text,
  expiration_date timestamp with time zone,
  acknowledgement boolean,
  acknowledgement_date timestamp with time zone,
  recorded_by text,
  record_timestamp timestamp with time zone,
  training_content_version text,
  quiz_score numeric,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_record_id uuid;
BEGIN
  -- Insert training record
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
  RETURNING training_records.id INTO v_record_id;

  -- Return the inserted record
  RETURN QUERY
  SELECT
    tr.id,
    tr.user_id,
    tr.organization_id,
    tr.staff_member_id,
    tr.full_name,
    tr.email,
    tr.role_title,
    tr.training_type,
    tr.training_date,
    tr.completion_status,
    tr.expiration_date,
    tr.acknowledgement,
    tr.acknowledgement_date,
    tr.recorded_by,
    tr.record_timestamp,
    tr.training_content_version,
    tr.quiz_score,
    tr.created_at,
    tr.updated_at
  FROM training_records tr
  WHERE tr.id = v_record_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION upsert_training_record TO authenticated;






