-- Add date_from, date_to, file_size fields to audit_export_logs
ALTER TABLE audit_export_logs
  ADD COLUMN IF NOT EXISTS date_from date,
  ADD COLUMN IF NOT EXISTS date_to date,
  ADD COLUMN IF NOT EXISTS file_size bigint;

COMMENT ON COLUMN audit_export_logs.date_from IS 'Start of the date range selected for the export';
COMMENT ON COLUMN audit_export_logs.date_to IS 'End of the date range selected for the export';
COMMENT ON COLUMN audit_export_logs.file_size IS 'Size of the generated ZIP file in bytes';
