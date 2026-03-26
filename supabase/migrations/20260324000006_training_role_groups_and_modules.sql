-- Add role groups and module assignments to the training system

-- Step 1: Add role_group column to training_records
ALTER TABLE training_records
  ADD COLUMN IF NOT EXISTS role_group text
    CHECK (role_group IN ('clinical', 'admin', 'contractor', 'intern'));

-- Step 2: Add module_name column (currently training is one generic module)
ALTER TABLE training_records
  ADD COLUMN IF NOT EXISTS module_name text DEFAULT 'HIPAA Awareness Training';

-- Step 3: Add certificate_issued tracking
ALTER TABLE training_records
  ADD COLUMN IF NOT EXISTS certificate_issued boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS certificate_issued_at timestamp with time zone;

-- Step 4: Create training_modules table (or add missing columns if it already exists)
CREATE TABLE IF NOT EXISTS training_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id text REFERENCES organizations(id) ON DELETE CASCADE,
  module_name text,
  module_description text,
  role_groups text[] NOT NULL DEFAULT ARRAY['clinical','admin','contractor','intern'],
  is_required boolean NOT NULL DEFAULT true,
  duration_minutes integer NOT NULL DEFAULT 30,
  expiration_months integer NOT NULL DEFAULT 12,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add columns if they don't exist (for pre-existing tables with different schema)
ALTER TABLE training_modules ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE training_modules ADD COLUMN IF NOT EXISTS organization_id text REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE training_modules ADD COLUMN IF NOT EXISTS module_name text;
ALTER TABLE training_modules ADD COLUMN IF NOT EXISTS module_description text;
ALTER TABLE training_modules ADD COLUMN IF NOT EXISTS role_groups text[] NOT NULL DEFAULT ARRAY['clinical','admin','contractor','intern'];
ALTER TABLE training_modules ADD COLUMN IF NOT EXISTS is_required boolean NOT NULL DEFAULT true;
ALTER TABLE training_modules ADD COLUMN IF NOT EXISTS duration_minutes integer NOT NULL DEFAULT 30;
ALTER TABLE training_modules ADD COLUMN IF NOT EXISTS expiration_months integer NOT NULL DEFAULT 12;

CREATE INDEX IF NOT EXISTS training_modules_org_idx ON training_modules(organization_id);

ALTER TABLE training_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view modules for their organization"
  ON training_modules FOR SELECT
  USING (organization_id IN (SELECT id::text FROM organizations WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert modules for their organization"
  ON training_modules FOR INSERT
  WITH CHECK (
    organization_id IN (SELECT id::text FROM organizations WHERE user_id = auth.uid())
    AND user_id = auth.uid()
  );

CREATE POLICY "Users can update modules for their organization"
  ON training_modules FOR UPDATE
  USING (organization_id IN (SELECT id::text FROM organizations WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete modules for their organization"
  ON training_modules FOR DELETE
  USING (organization_id IN (SELECT id::text FROM organizations WHERE user_id = auth.uid()));

COMMENT ON TABLE training_modules IS 'Training module definitions with role group assignments';
COMMENT ON COLUMN training_modules.role_groups IS 'Which role groups this module applies to: clinical, admin, contractor, intern';
COMMENT ON COLUMN training_records.role_group IS 'Employee role group for training role-based assignments';
COMMENT ON COLUMN training_records.certificate_issued IS 'Whether a completion certificate has been issued';
