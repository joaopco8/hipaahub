-- Complete fix for organizations table schema
-- This script adds all missing columns to match the expected schema
-- Run this in Supabase SQL Editor

-- Step 1: Add basic columns from initial migration
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS name text,
ADD COLUMN IF NOT EXISTS type text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS employee_count integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT timezone('utc'::text, now());

-- Step 2: Add extended columns from extend_organizations_table migration
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS legal_name text,
ADD COLUMN IF NOT EXISTS dba text,
ADD COLUMN IF NOT EXISTS address_street text,
ADD COLUMN IF NOT EXISTS address_city text,
ADD COLUMN IF NOT EXISTS address_state text,
ADD COLUMN IF NOT EXISTS address_zip text,
ADD COLUMN IF NOT EXISTS security_officer_name text,
ADD COLUMN IF NOT EXISTS security_officer_email text,
ADD COLUMN IF NOT EXISTS security_officer_role text,
ADD COLUMN IF NOT EXISTS privacy_officer_name text,
ADD COLUMN IF NOT EXISTS privacy_officer_email text,
ADD COLUMN IF NOT EXISTS privacy_officer_role text,
ADD COLUMN IF NOT EXISTS has_employees boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS uses_contractors boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS stores_phi_electronically boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS uses_cloud_services boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS assessment_date timestamp with time zone DEFAULT timezone('utc'::text, now()),
ADD COLUMN IF NOT EXISTS next_review_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS primary_contact_name text,
ADD COLUMN IF NOT EXISTS compliance_contact_email text,
ADD COLUMN IF NOT EXISTS compliance_contact_phone text,
ADD COLUMN IF NOT EXISTS ein text,
ADD COLUMN IF NOT EXISTS npi text;

-- Step 3: Add constraints for type column
DO $$
BEGIN
  -- Add check constraint for type if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'organizations_type_check'
  ) THEN
    ALTER TABLE organizations 
    ADD CONSTRAINT organizations_type_check 
    CHECK (type IN ('medical', 'dental', 'mental-health', 'therapy'));
  END IF;
END $$;

-- Step 4: Make required columns NOT NULL (only if table is empty)
DO $$
DECLARE
  row_count integer;
BEGIN
  SELECT COUNT(*) INTO row_count FROM organizations;
  
  IF row_count = 0 THEN
    -- Table is empty, we can make columns NOT NULL
    ALTER TABLE organizations 
    ALTER COLUMN name SET NOT NULL,
    ALTER COLUMN type SET NOT NULL,
    ALTER COLUMN state SET NOT NULL,
    ALTER COLUMN employee_count SET NOT NULL,
    ALTER COLUMN created_at SET NOT NULL,
    ALTER COLUMN updated_at SET NOT NULL;
    
    -- Make user_id NOT NULL if it exists and is nullable
    IF EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'organizations' 
      AND column_name = 'user_id'
      AND is_nullable = 'YES'
    ) THEN
      ALTER TABLE organizations ALTER COLUMN user_id SET NOT NULL;
    END IF;
    
    RAISE NOTICE 'Made required columns NOT NULL (table was empty)';
  ELSE
    RAISE NOTICE 'Table has % rows. Skipping NOT NULL constraints. You may need to populate data first.', row_count;
  END IF;
END $$;

-- Step 5: Verify all columns exist
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'organizations'
ORDER BY ordinal_position;

-- Step 6: Show summary
SELECT 
  COUNT(*) as total_columns,
  COUNT(CASE WHEN is_nullable = 'NO' THEN 1 END) as not_null_columns,
  COUNT(CASE WHEN is_nullable = 'YES' THEN 1 END) as nullable_columns
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'organizations';

