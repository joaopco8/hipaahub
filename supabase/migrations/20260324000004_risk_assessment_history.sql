-- Store historical risk assessment snapshots (one per assessment completion)
CREATE TABLE IF NOT EXISTS risk_assessment_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  risk_level text NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  risk_percentage numeric(5, 2) NOT NULL DEFAULT 0,
  total_risk_score numeric(10, 2) NOT NULL DEFAULT 0,
  max_possible_score numeric(10, 2) NOT NULL DEFAULT 0,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  critical_failures jsonb DEFAULT '[]'::jsonb,
  notes text,
  assessed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS risk_assessment_history_user_idx ON risk_assessment_history(user_id);
CREATE INDEX IF NOT EXISTS risk_assessment_history_assessed_at_idx ON risk_assessment_history(assessed_at);

ALTER TABLE risk_assessment_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own risk assessment history"
  ON risk_assessment_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own risk assessment history"
  ON risk_assessment_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE risk_assessment_history IS 'Historical snapshots of completed risk assessments for trend analysis';
