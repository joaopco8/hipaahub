-- Add user_id column to organizations table
-- Execute this in Supabase SQL Editor

-- Step 1: Add the column (nullable first)
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS user_id uuid;

-- Step 2: Add foreign key constraint
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
  END IF;
END $$;

-- Step 3: Add unique constraint (only if table is empty or you're sure there's no duplicate)
-- If you have existing data, you may need to handle duplicates first
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'organizations_user_id_key'
  ) THEN
    ALTER TABLE organizations 
    ADD CONSTRAINT organizations_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Step 4: Create index
CREATE INDEX IF NOT EXISTS organizations_user_id_idx ON organizations(user_id);

-- Step 5: Verify - should now show user_id column
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'organizations'
ORDER BY ordinal_position;


