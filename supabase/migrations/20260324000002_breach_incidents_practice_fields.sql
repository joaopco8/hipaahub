-- Add Practice Plan fields to incident_logs

ALTER TABLE incident_logs
  ADD COLUMN IF NOT EXISTS employees_involved text,
  ADD COLUMN IF NOT EXISTS sanction_applied boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sanction_description text,
  ADD COLUMN IF NOT EXISTS requires_admin_approval boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS submitted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

COMMENT ON COLUMN incident_logs.employees_involved IS 'Names/roles of employees involved in the incident';
COMMENT ON COLUMN incident_logs.sanction_applied IS 'Whether a workforce sanction was applied per sanction policy';
COMMENT ON COLUMN incident_logs.sanction_description IS 'Description of the sanction applied';
COMMENT ON COLUMN incident_logs.requires_admin_approval IS 'Practice Plan: incident must be approved by admin before closing';
COMMENT ON COLUMN incident_logs.approved_by IS 'Admin user who approved/closed the incident';
COMMENT ON COLUMN incident_logs.approved_at IS 'When the incident was approved by admin';
COMMENT ON COLUMN incident_logs.submitted_by IS 'Member who submitted the incident for approval';
