-- Create a function to insert training records using JSONB parameter
-- This bypasses Supabase schema cache validation and parameter order issues

CREATE OR REPLACE FUNCTION upsert_training_record_jsonb(
  p_user_id uuid,
  p_data jsonb
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
    (p_data->>'organization_id')::uuid,
    (p_data->>'staff_member_id')::uuid,
    (p_data->>'full_name')::text,
    (p_data->>'email')::text,
    (p_data->>'role_title')::text,
    (p_data->>'training_type')::text,
    (p_data->>'training_date')::timestamp with time zone,
    (p_data->>'completion_status')::text,
    (p_data->>'expiration_date')::timestamp with time zone,
    (p_data->>'acknowledgement')::boolean,
    (p_data->>'acknowledgement_date')::timestamp with time zone,
    (p_data->>'recorded_by')::text,
    (p_data->>'record_timestamp')::timestamp with time zone,
    (p_data->>'training_content_version')::text,
    (p_data->>'quiz_score')::numeric,
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
GRANT EXECUTE ON FUNCTION upsert_training_record_jsonb TO authenticated;






