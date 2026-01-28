-- Recreate organizations table with correct schema
-- WARNING: This will DROP the existing table and all its data!
-- Only run this if you're sure you want to start fresh

-- First, drop dependent objects
DROP TABLE IF EXISTS risk_assessments CASCADE;
DROP TABLE IF EXISTS staff_members CASCADE;
DROP TABLE IF EXISTS compliance_commitments CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- Recreate organizations table with correct schema
CREATE TABLE organizations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  legal_name text,
  dba text,
  type text NOT NULL CHECK (type IN ('medical', 'dental', 'mental-health', 'therapy')),
  state text NOT NULL,
  employee_count integer NOT NULL DEFAULT 1,
  address_street text,
  address_city text,
  address_state text,
  address_zip text,
  security_officer_name text,
  security_officer_email text,
  security_officer_role text,
  privacy_officer_name text,
  privacy_officer_email text,
  privacy_officer_role text,
  has_employees boolean DEFAULT true,
  uses_contractors boolean DEFAULT false,
  stores_phi_electronically boolean DEFAULT true,
  uses_cloud_services boolean DEFAULT false,
  assessment_date timestamp with time zone DEFAULT timezone('utc'::text, now()),
  next_review_date timestamp with time zone,
  primary_contact_name text,
  compliance_contact_email text,
  compliance_contact_phone text,
  ein text,
  npi text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- Recreate dependent tables
CREATE TABLE risk_assessments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  risk_level text NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  total_risk_score numeric(10, 2) NOT NULL DEFAULT 0,
  max_possible_score numeric(10, 2) NOT NULL DEFAULT 0,
  risk_percentage numeric(5, 2) NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

CREATE TABLE staff_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('staff', 'admin')),
  training_completed boolean DEFAULT false,
  training_completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, email)
);

CREATE TABLE compliance_commitments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  committed boolean NOT NULL DEFAULT false,
  committed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_commitments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations
CREATE POLICY "Users can view own organization" ON organizations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own organization" ON organizations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own organization" ON organizations
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for risk_assessments
CREATE POLICY "Users can view own risk assessment" ON risk_assessments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own risk assessment" ON risk_assessments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own risk assessment" ON risk_assessments
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for staff_members
CREATE POLICY "Users can view own staff members" ON staff_members
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own staff members" ON staff_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own staff members" ON staff_members
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own staff members" ON staff_members
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for compliance_commitments
CREATE POLICY "Users can view own commitment" ON compliance_commitments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own commitment" ON compliance_commitments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own commitment" ON compliance_commitments
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS organizations_user_id_idx ON organizations(user_id);
CREATE INDEX IF NOT EXISTS risk_assessments_user_id_idx ON risk_assessments(user_id);
CREATE INDEX IF NOT EXISTS risk_assessments_organization_id_idx ON risk_assessments(organization_id);
CREATE INDEX IF NOT EXISTS staff_members_user_id_idx ON staff_members(user_id);
CREATE INDEX IF NOT EXISTS staff_members_organization_id_idx ON staff_members(organization_id);
CREATE INDEX IF NOT EXISTS compliance_commitments_user_id_idx ON compliance_commitments(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_risk_assessments_updated_at BEFORE UPDATE ON risk_assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_members_updated_at BEFORE UPDATE ON staff_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_commitments_updated_at BEFORE UPDATE ON compliance_commitments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify the table was created correctly
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'organizations'
ORDER BY ordinal_position;


