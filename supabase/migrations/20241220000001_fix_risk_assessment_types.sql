-- Fix risk_assessments table to support decimal scores from weighted scoring
-- This migration handles the case where the table was created with integer columns

-- Check if columns exist and are integer type, then convert to numeric
DO $$
BEGIN
  -- Check if total_risk_score exists and is integer type
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'risk_assessments' 
    AND column_name = 'total_risk_score'
    AND data_type = 'integer'
  ) THEN
    -- Alter existing integer columns to numeric
    ALTER TABLE risk_assessments 
      ALTER COLUMN total_risk_score TYPE numeric(10, 2) USING total_risk_score::numeric(10, 2);
    
    RAISE NOTICE 'Updated total_risk_score from integer to numeric';
  END IF;

  -- Check if max_possible_score exists and is integer type
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'risk_assessments' 
    AND column_name = 'max_possible_score'
    AND data_type = 'integer'
  ) THEN
    -- Alter existing integer columns to numeric
    ALTER TABLE risk_assessments 
      ALTER COLUMN max_possible_score TYPE numeric(10, 2) USING max_possible_score::numeric(10, 2);
    
    RAISE NOTICE 'Updated max_possible_score from integer to numeric';
  END IF;
END $$;
