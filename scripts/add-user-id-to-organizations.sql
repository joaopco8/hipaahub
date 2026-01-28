-- Add user_id column to organizations table
-- Run this in Supabase SQL Editor

-- Step 1: Check if table exists and has any data
DO $$
DECLARE
  row_count integer;
BEGIN
  SELECT COUNT(*) INTO row_count FROM organizations;
  RAISE NOTICE 'Current organizations table has % rows', row_count;
END $$;

-- Step 2: Add user_id column (nullable first, we'll make it NOT NULL after)
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS user_id uuid;

-- Step 3: If you have existing data, you need to populate user_id
-- For now, we'll leave it nullable temporarily
-- You'll need to update existing rows manually if any exist

-- Step 4: Add foreign key constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'organizations_user_id_fkey'
  ) THEN
    ALTER TABLE organizations 
    ADD CONSTRAINT organizations_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added foreign key constraint';
  ELSE
    RAISE NOTICE 'Foreign key constraint already exists';
  END IF;
END $$;

-- Step 5: Add unique constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'organizations_user_id_key'
  ) THEN
    ALTER TABLE organizations 
    ADD CONSTRAINT organizations_user_id_key UNIQUE (user_id);
    RAISE NOTICE 'Added unique constraint on user_id';
  ELSE
    RAISE NOTICE 'Unique constraint on user_id already exists';
  END IF;
END $$;

-- Step 6: Create index
CREATE INDEX IF NOT EXISTS organizations_user_id_idx ON organizations(user_id);

-- Step 7: Make user_id NOT NULL (only if table is empty or all rows have user_id)
-- WARNING: This will fail if there are rows with NULL user_id
-- Uncomment the line below ONLY if you're sure all rows have user_id populated
-- ALTER TABLE organizations ALTER COLUMN user_id SET NOT NULL;

-- Step 8: Verify the column was added
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'organizations'
ORDER BY ordinal_position;


