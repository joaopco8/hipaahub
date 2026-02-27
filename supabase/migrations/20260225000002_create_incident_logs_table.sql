-- Create incident_logs table for Incident Logging & Response Timeline
-- This is separate from breach_incidents - it's for general incident tracking
CREATE TABLE IF NOT EXISTS incident_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id text NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Incident Information
  incident_title text NOT NULL,
  description text NOT NULL,
  
  -- Incident Dates
  date_occurred date NOT NULL,
  date_discovered date NOT NULL,
  discovered_by text NOT NULL,
  
  -- PHI Involvement
  phi_involved boolean NOT NULL DEFAULT false,
  
  -- Severity & Status
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'closed')),
  
  -- Impact Assessment
  estimated_individuals_affected integer DEFAULT 0 CHECK (estimated_individuals_affected >= 0),
  
  -- Breach Confirmation
  breach_confirmed boolean NOT NULL DEFAULT false,
  
  -- Link to Breach Notification (if generated)
  breach_notification_id uuid REFERENCES breach_notifications(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create incident_timeline table for chronological event tracking
CREATE TABLE IF NOT EXISTS incident_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id uuid NOT NULL REFERENCES incident_logs(id) ON DELETE CASCADE,
  organization_id text NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Timeline Event
  event_date timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  event_description text NOT NULL,
  
  -- Metadata
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create incident_attachments table for document storage
CREATE TABLE IF NOT EXISTS incident_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id uuid NOT NULL REFERENCES incident_logs(id) ON DELETE CASCADE,
  organization_id text NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- File Information
  file_name text NOT NULL,
  file_path text NOT NULL, -- Supabase Storage path
  file_size integer NOT NULL,
  mime_type text NOT NULL,
  file_hash text, -- SHA-256 hash for integrity verification
  
  -- Metadata
  uploaded_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  uploaded_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Description
  description text
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS incident_logs_organization_id_idx ON incident_logs(organization_id);
CREATE INDEX IF NOT EXISTS incident_logs_status_idx ON incident_logs(status);
CREATE INDEX IF NOT EXISTS incident_logs_severity_idx ON incident_logs(severity);
CREATE INDEX IF NOT EXISTS incident_logs_date_discovered_idx ON incident_logs(date_discovered);
CREATE INDEX IF NOT EXISTS incident_logs_breach_notification_id_idx ON incident_logs(breach_notification_id);
CREATE INDEX IF NOT EXISTS incident_timeline_incident_id_idx ON incident_timeline(incident_id);
CREATE INDEX IF NOT EXISTS incident_timeline_event_date_idx ON incident_timeline(event_date);
CREATE INDEX IF NOT EXISTS incident_attachments_incident_id_idx ON incident_attachments(incident_id);
CREATE INDEX IF NOT EXISTS incident_attachments_organization_id_idx ON incident_attachments(organization_id);

-- Enable RLS
ALTER TABLE incident_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for incident_logs
CREATE POLICY "Users can view incident logs for their organization"
  ON incident_logs FOR SELECT
  USING (
    organization_id IN (
      SELECT id::text FROM organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create incident logs for their organization"
  ON incident_logs FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT id::text FROM organizations WHERE user_id = auth.uid()
    )
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can update incident logs for their organization"
  ON incident_logs FOR UPDATE
  USING (
    organization_id IN (
      SELECT id::text FROM organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete incident logs for their organization"
  ON incident_logs FOR DELETE
  USING (
    organization_id IN (
      SELECT id::text FROM organizations WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for incident_timeline
CREATE POLICY "Users can view timeline for their organization's incidents"
  ON incident_timeline FOR SELECT
  USING (
    organization_id IN (
      SELECT id::text FROM organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create timeline entries for their organization's incidents"
  ON incident_timeline FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT id::text FROM organizations WHERE user_id = auth.uid()
    )
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can update timeline entries for their organization's incidents"
  ON incident_timeline FOR UPDATE
  USING (
    organization_id IN (
      SELECT id::text FROM organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete timeline entries for their organization's incidents"
  ON incident_timeline FOR DELETE
  USING (
    organization_id IN (
      SELECT id::text FROM organizations WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for incident_attachments
CREATE POLICY "Users can view attachments for their organization's incidents"
  ON incident_attachments FOR SELECT
  USING (
    organization_id IN (
      SELECT id::text FROM organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload attachments for their organization's incidents"
  ON incident_attachments FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT id::text FROM organizations WHERE user_id = auth.uid()
    )
    AND uploaded_by = auth.uid()
  );

CREATE POLICY "Users can update attachments for their organization's incidents"
  ON incident_attachments FOR UPDATE
  USING (
    organization_id IN (
      SELECT id::text FROM organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete attachments for their organization's incidents"
  ON incident_attachments FOR DELETE
  USING (
    organization_id IN (
      SELECT id::text FROM organizations WHERE user_id = auth.uid()
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_incident_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER incident_logs_updated_at
  BEFORE UPDATE ON incident_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_incident_logs_updated_at();

-- Comments for documentation
COMMENT ON TABLE incident_logs IS 'General incident logging and tracking (separate from breach_incidents)';
COMMENT ON TABLE incident_timeline IS 'Chronological event log for incident response tracking';
COMMENT ON TABLE incident_attachments IS 'Document attachments for incident logs';
COMMENT ON COLUMN incident_logs.severity IS 'Incident severity: low, medium, high';
COMMENT ON COLUMN incident_logs.status IS 'Incident status: open, under_review, closed';
