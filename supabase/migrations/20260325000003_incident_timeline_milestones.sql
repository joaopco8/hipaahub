-- Add structured HIPAA timeline milestone columns to incident_logs
-- These track key regulatory dates: occurred → discovered → investigation → OCR notified → patients notified → resolved

ALTER TABLE incident_logs
  ADD COLUMN IF NOT EXISTS timeline_breach_occurred      date,
  ADD COLUMN IF NOT EXISTS timeline_breach_discovered    date,
  ADD COLUMN IF NOT EXISTS timeline_investigation_began  date,
  ADD COLUMN IF NOT EXISTS timeline_ocr_notified         date,
  ADD COLUMN IF NOT EXISTS timeline_patients_notified    date,
  ADD COLUMN IF NOT EXISTS timeline_incident_resolved    date;

COMMENT ON COLUMN incident_logs.timeline_breach_occurred     IS 'Date the breach/incident occurred (may differ from date_occurred if initially unknown)';
COMMENT ON COLUMN incident_logs.timeline_breach_discovered   IS 'Date the breach was formally confirmed/discovered';
COMMENT ON COLUMN incident_logs.timeline_investigation_began IS 'Date internal investigation was initiated';
COMMENT ON COLUMN incident_logs.timeline_ocr_notified        IS 'Date notification submitted to HHS Office for Civil Rights (required within 60 days of discovery for >=500 individuals)';
COMMENT ON COLUMN incident_logs.timeline_patients_notified   IS 'Date affected individuals were notified (required without unreasonable delay)';
COMMENT ON COLUMN incident_logs.timeline_incident_resolved   IS 'Date the incident was formally closed/resolved';
