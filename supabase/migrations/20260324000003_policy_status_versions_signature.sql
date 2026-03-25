-- Add policy status, version history, electronic signature, and annual review

-- Step 1: Extend generated_policy_documents with status, signature, and review date
ALTER TABLE generated_policy_documents
  ADD COLUMN IF NOT EXISTS policy_status text NOT NULL DEFAULT 'draft'
    CHECK (policy_status IN ('draft', 'active', 'in_review', 'archived')),
  ADD COLUMN IF NOT EXISTS signed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS signed_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS signature_name text,
  ADD COLUMN IF NOT EXISTS next_review_date date,
  ADD COLUMN IF NOT EXISTS last_reviewed_at timestamp with time zone;

-- Index on status for filtering
CREATE INDEX IF NOT EXISTS generated_policy_documents_status_idx
  ON generated_policy_documents(policy_status);

-- Step 2: Create policy_versions table for full version history
CREATE TABLE IF NOT EXISTS policy_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id text NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  policy_id integer NOT NULL,
  policy_name text NOT NULL,
  version_number integer NOT NULL,
  content_snapshot text,           -- The rendered policy text at this version
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'in_review', 'archived')),
  generated_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  signed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  signed_at timestamp with time zone,
  signature_name text,
  next_review_date date,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS policy_versions_org_policy_idx
  ON policy_versions(organization_id, policy_id);
CREATE INDEX IF NOT EXISTS policy_versions_version_number_idx
  ON policy_versions(policy_id, version_number);

ALTER TABLE policy_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view policy versions for their organization"
  ON policy_versions FOR SELECT
  USING (
    organization_id IN (
      SELECT id::text FROM organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert policy versions for their organization"
  ON policy_versions FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT id::text FROM organizations WHERE user_id = auth.uid()
    )
    AND generated_by = auth.uid()
  );

CREATE POLICY "Users can update policy versions for their organization"
  ON policy_versions FOR UPDATE
  USING (
    organization_id IN (
      SELECT id::text FROM organizations WHERE user_id = auth.uid()
    )
  );

COMMENT ON TABLE policy_versions IS 'Full version history for generated HIPAA policy documents';
COMMENT ON COLUMN policy_versions.content_snapshot IS 'Snapshot of the policy text at the time this version was generated';
COMMENT ON COLUMN policy_versions.version_number IS 'Monotonically increasing version number per policy per organization';
