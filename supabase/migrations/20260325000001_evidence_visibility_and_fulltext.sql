-- Evidence Center: full-text search + per-document access control
-- Adds extracted_text (from PDF/text parsing) and visibility (all_members | admin_only)

ALTER TABLE compliance_evidence
  ADD COLUMN IF NOT EXISTS extracted_text text,
  ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'all_members'
    CHECK (visibility IN ('all_members', 'admin_only'));

COMMENT ON COLUMN compliance_evidence.extracted_text IS 'Text extracted from uploaded PDF/text files for full-text search';
COMMENT ON COLUMN compliance_evidence.visibility IS 'Access control: all_members = visible to everyone in org, admin_only = visible only to org owner';

-- Add user_name (email) to access logs for readable audit trail
ALTER TABLE evidence_access_logs
  ADD COLUMN IF NOT EXISTS user_name text;

-- Full-text search index over title, description, file_name and extracted PDF content
CREATE INDEX IF NOT EXISTS compliance_evidence_fts_idx
  ON compliance_evidence
  USING gin(
    to_tsvector('english',
      coalesce(title, '') || ' ' ||
      coalesce(description, '') || ' ' ||
      coalesce(file_name, '') || ' ' ||
      coalesce(extracted_text, '')
    )
  );

-- Drop and replace the SELECT RLS policy to enforce visibility
-- Org owners (admins) see everything; staff members only see all_members docs
DROP POLICY IF EXISTS "Users can view their organization's evidence" ON compliance_evidence;

CREATE POLICY "Users can view their organization's evidence"
  ON compliance_evidence FOR SELECT
  USING (
    -- Org owner (admin): sees all documents regardless of visibility
    organization_id IN (
      SELECT id FROM organizations WHERE user_id = auth.uid()
    )
    OR
    -- Staff member: only sees documents marked all_members
    (
      visibility = 'all_members'
      AND organization_id IN (
        SELECT organization_id FROM staff_members WHERE user_id = auth.uid()
      )
    )
  );
