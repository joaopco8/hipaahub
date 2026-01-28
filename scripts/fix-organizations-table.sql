-- Fix organizations table: Ensure user_id column exists
-- Run this in Supabase SQL Editor if you get "column user_id does not exist" error

-- First, check if the table exists and what columns it has
DO $$
BEGIN
  -- Check if user_id column exists
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'organizations' 
    AND column_name = 'user_id'
  ) THEN
    -- Add user_id column if it doesn't exist
    ALTER TABLE organizations 
    ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    
    -- Make it NOT NULL after adding (if table is empty)
    -- If table has data, you'll need to populate user_id first
    -- For now, we'll make it nullable temporarily
    RAISE NOTICE 'Added user_id column to organizations table';
  ELSE
    RAISE NOTICE 'user_id column already exists in organizations table';
  END IF;
END $$;

-- Ensure the unique constraint exists
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

-- Ensure the index exists
CREATE INDEX IF NOT EXISTS organizations_user_id_idx ON organizations(user_id);

-- Verify the table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'organizations'
ORDER BY ordinal_position;


