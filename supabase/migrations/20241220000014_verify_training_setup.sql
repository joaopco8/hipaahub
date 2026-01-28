-- Verification script to ensure training_records table and function exist
-- Run this to verify your setup is correct

-- Check if table exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'training_records'
  ) THEN
    RAISE EXCEPTION 'Table training_records does not exist. Please run migration 20241220000011_create_training_records.sql first.';
  ELSE
    RAISE NOTICE '✓ Table training_records exists';
  END IF;
END $$;

-- Check if function exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_name = 'upsert_training_record_jsonb'
  ) THEN
    RAISE EXCEPTION 'Function upsert_training_record_jsonb does not exist. Please run migration 20241220000013_create_upsert_training_record_jsonb.sql first.';
  ELSE
    RAISE NOTICE '✓ Function upsert_training_record_jsonb exists';
  END IF;
END $$;

-- Test the function with sample data (will be rolled back)
DO $$
DECLARE
  test_result record;
BEGIN
  -- This is just a syntax check, we'll rollback
  BEGIN
    SELECT * INTO test_result
    FROM upsert_training_record_jsonb(
      '00000000-0000-0000-0000-000000000000'::uuid,
      '{"full_name": "Test", "email": "test@test.com", "role_title": "Test", "training_type": "initial", "training_date": "2024-01-01T00:00:00Z", "completion_status": "completed", "expiration_date": "2025-01-01T00:00:00Z", "acknowledgement": true, "acknowledgement_date": "2024-01-01T00:00:00Z", "recorded_by": "Test", "record_timestamp": "2024-01-01T00:00:00Z"}'::jsonb
    );
    RAISE NOTICE '✓ Function syntax is correct';
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Function syntax error: %', SQLERRM;
  END;
  
  -- Rollback the test insert
  ROLLBACK;
END $$;

RAISE NOTICE 'All checks passed! Training setup is correct.';






