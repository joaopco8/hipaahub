-- Create a super simple function that accepts only JSONB
-- This function does everything internally and doesn't require parameter validation
-- PostgREST can call this without schema cache issues because it's just one JSONB parameter

CREATE OR REPLACE FUNCTION insert_training_via_jsonb(
  p_json jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_record_id uuid;
  v_result jsonb;
  v_user_id uuid;
BEGIN
  -- Extract user_id from JSON (required for RLS)
  v_user_id := (p_json->>'user_id')::uuid;
  
  -- Verify user is authenticated (security check)
  IF v_user_id IS NULL OR v_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: user_id must match authenticated user';
  END IF;

  -- Insert training record directly using JSONB values
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
    acknowledgement_ip,
    recorded_by,
    record_timestamp,
    training_content_version,
    quiz_score,
    quiz_answers,
    certificate_id,
    user_agent,
    training_start_time,
    training_duration_minutes,
    updated_at
  )
  VALUES (
    (p_json->>'user_id')::uuid,
    NULLIF(p_json->>'organization_id', 'null')::uuid,
    NULLIF(p_json->>'staff_member_id', 'null')::uuid,
    p_json->>'full_name',
    p_json->>'email',
    p_json->>'role_title',
    p_json->>'training_type',
    (p_json->>'training_date')::timestamp with time zone,
    p_json->>'completion_status',
    (p_json->>'expiration_date')::timestamp with time zone,
    (p_json->>'acknowledgement')::boolean,
    (p_json->>'acknowledgement_date')::timestamp with time zone,
    COALESCE(
      NULLIF(p_json->>'acknowledgement_ip', 'null'),
      NULLIF(p_json->>'acknowledgement_ip', ''),
      NULLIF(p_json->>'acknowledgement_ip', NULL),
      'unknown'
    ),
    p_json->>'recorded_by',
    (p_json->>'record_timestamp')::timestamp with time zone,
    COALESCE(p_json->>'training_content_version', '1.0'),
    NULLIF(p_json->>'quiz_score', 'null')::numeric,
    p_json->'quiz_answers',
    NULLIF(p_json->>'certificate_id', 'null'),
    NULLIF(p_json->>'user_agent', 'null'),
    NULLIF((p_json->>'training_start_time')::text, 'null')::timestamp with time zone,
    NULLIF(p_json->>'training_duration_minutes', 'null')::integer,
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
GRANT EXECUTE ON FUNCTION insert_training_via_jsonb TO authenticated;

-- Add comment
COMMENT ON FUNCTION insert_training_via_jsonb IS 'Simple JSONB function for training records - bypasses PostgREST schema cache validation';



