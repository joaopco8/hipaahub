-- Make user_id NOT NULL in organizations table
-- Only run this if the table is empty or all rows have user_id populated
-- Run this AFTER you've confirmed the column exists

-- First, check if there are any NULL values
SELECT COUNT(*) as null_count
FROM organizations
WHERE user_id IS NULL;

-- If the count is 0 (no NULL values), you can safely make it NOT NULL
-- Uncomment the line below to make user_id NOT NULL:
-- ALTER TABLE organizations ALTER COLUMN user_id SET NOT NULL;

-- Verify the change
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'organizations'
AND column_name = 'user_id';


