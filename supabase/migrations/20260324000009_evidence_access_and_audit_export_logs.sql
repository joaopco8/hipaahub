-- Evidence access log: tracks views and downloads of evidence documents

CREATE TABLE IF NOT EXISTS evidence_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id text NOT NULL,
  evidence_id uuid NOT NULL,
  evidence_title text NOT NULL,
  action text NOT NULL CHECK (action IN ('view', 'download')),
  accessed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS evidence_access_logs_org_idx ON evidence_access_logs(organization_id);
CREATE INDEX IF NOT EXISTS evidence_access_logs_evidence_idx ON evidence_access_logs(evidence_id);
CREATE INDEX IF NOT EXISTS evidence_access_logs_user_idx ON evidence_access_logs(user_id);

ALTER TABLE evidence_access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view access logs for their organization"
  ON evidence_access_logs FOR SELECT
  USING (organization_id IN (SELECT id::text FROM organizations WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert access logs for their organization"
  ON evidence_access_logs FOR INSERT
  WITH CHECK (user_id = auth.uid());

COMMENT ON TABLE evidence_access_logs IS 'Granular log of who accessed (viewed/downloaded) each evidence document and when';

-- Audit export log: records every time an audit package is exported

CREATE TABLE IF NOT EXISTS audit_export_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id text NOT NULL,
  exported_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  sections_included text[] NOT NULL DEFAULT '{}',
  file_name text
);

CREATE INDEX IF NOT EXISTS audit_export_logs_org_idx ON audit_export_logs(organization_id);

ALTER TABLE audit_export_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view export logs for their organization"
  ON audit_export_logs FOR SELECT
  USING (organization_id IN (SELECT id::text FROM organizations WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert export logs for their organization"
  ON audit_export_logs FOR INSERT
  WITH CHECK (user_id = auth.uid());

COMMENT ON TABLE audit_export_logs IS 'Persistent log of all audit package exports: who exported, when, and what sections were included';
