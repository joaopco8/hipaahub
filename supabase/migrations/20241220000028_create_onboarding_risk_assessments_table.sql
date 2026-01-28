-- Create onboarding_risk_assessments table
-- This table stores risk assessment answers during the onboarding process
-- Separate from regular risk_assessments to allow for partial saves

CREATE TABLE IF NOT EXISTS onboarding_risk_assessments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id text NOT NULL, -- Matches organizations.id type
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  risk_level text CHECK (risk_level IN ('low', 'medium', 'high')),
  total_risk_score numeric(10, 2) DEFAULT 0,
  max_possible_score numeric(10, 2) DEFAULT 0,
  risk_percentage numeric(5, 2) DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS onboarding_risk_assessments_user_id_idx 
  ON onboarding_risk_assessments(user_id);
  
CREATE INDEX IF NOT EXISTS onboarding_risk_assessments_organization_id_idx 
  ON onboarding_risk_assessments(organization_id);

-- GIN index for JSONB queries on answers
CREATE INDEX IF NOT EXISTS onboarding_risk_assessments_answers_idx 
  ON onboarding_risk_assessments USING gin(answers);

-- Enable Row Level Security
ALTER TABLE onboarding_risk_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own onboarding risk assessment" 
  ON onboarding_risk_assessments
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding risk assessment" 
  ON onboarding_risk_assessments
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding risk assessment" 
  ON onboarding_risk_assessments
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own onboarding risk assessment" 
  ON onboarding_risk_assessments
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE TRIGGER update_onboarding_risk_assessments_updated_at 
  BEFORE UPDATE ON onboarding_risk_assessments
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE onboarding_risk_assessments IS 'Stores risk assessment answers during onboarding process. Allows partial saves for auto-save functionality.';
COMMENT ON COLUMN onboarding_risk_assessments.answers IS 'JSONB object mapping question IDs to answer values: { "question-id": "answer-value", ... }';
