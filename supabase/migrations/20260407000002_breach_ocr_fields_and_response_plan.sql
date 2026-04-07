-- Add OCR-required fields to incident_logs for the 5-step breach wizard
ALTER TABLE incident_logs ADD COLUMN IF NOT EXISTS discovery_method text;
ALTER TABLE incident_logs ADD COLUMN IF NOT EXISTS discoverer_name text;
ALTER TABLE incident_logs ADD COLUMN IF NOT EXISTS discoverer_role text;
ALTER TABLE incident_logs ADD COLUMN IF NOT EXISTS incident_types jsonb DEFAULT '[]';
ALTER TABLE incident_logs ADD COLUMN IF NOT EXISTS phi_types jsonb DEFAULT '[]';
ALTER TABLE incident_logs ADD COLUMN IF NOT EXISTS phi_encrypted text DEFAULT 'unknown';
ALTER TABLE incident_logs ADD COLUMN IF NOT EXISTS incident_classification text DEFAULT 'suspected_breach';
ALTER TABLE incident_logs ADD COLUMN IF NOT EXISTS risk_factor_1 text;
ALTER TABLE incident_logs ADD COLUMN IF NOT EXISTS risk_factor_2 text;
ALTER TABLE incident_logs ADD COLUMN IF NOT EXISTS risk_factor_3 text;
ALTER TABLE incident_logs ADD COLUMN IF NOT EXISTS risk_factor_4 text;
ALTER TABLE incident_logs ADD COLUMN IF NOT EXISTS overall_risk_level text;
ALTER TABLE incident_logs ADD COLUMN IF NOT EXISTS response_actions jsonb DEFAULT '{}';
ALTER TABLE incident_logs ADD COLUMN IF NOT EXISTS ocr_notified_date date;
ALTER TABLE incident_logs ADD COLUMN IF NOT EXISTS ocr_confirmation_number text;
ALTER TABLE incident_logs ADD COLUMN IF NOT EXISTS patient_notification_method text;
ALTER TABLE incident_logs ADD COLUMN IF NOT EXISTS patient_notification_date date;
ALTER TABLE incident_logs ADD COLUMN IF NOT EXISTS patients_notified_count integer;

-- Breach Response Plan: one per organization, living document
CREATE TABLE IF NOT EXISTS breach_response_plan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id text NOT NULL UNIQUE,

  -- Section 2.1 — How We Detect Breaches
  privacy_officer_contact text,
  monitored_systems text,
  staff_reporting_method text,
  staff_reporting_timeline text DEFAULT 'immediately',

  -- Section 2.2 — Who Coordinates the Response
  privacy_officer_name text,
  privacy_officer_title text,
  privacy_officer_email text,
  privacy_officer_phone text,
  backup_contact text,
  legal_counsel_contact text,
  cyber_insurance_contact text,

  -- Section 2.3 — How We Assess Severity
  assessment_performer text,
  assessment_timeline text DEFAULT 'within_72_hours',
  assessment_factors text,

  -- Section 2.4 — How We Notify OCR
  ocr_notification_person text,
  hhs_portal_location text,

  -- Section 2.5 — How We Notify Patients
  patient_notification_person text,
  patient_notification_method text DEFAULT 'first_class_mail',
  patient_letter_approved_date date,

  -- Section 2.6 — How We Document Everything
  physical_records_location text,
  backup_documentation_method text,

  -- Status & Signature
  plan_status text DEFAULT 'draft',  -- draft | active
  activated_by text,
  activated_at timestamptz,
  next_review_date date,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE breach_response_plan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their org breach response plan"
  ON breach_response_plan FOR ALL
  USING (
    organization_id = (
      SELECT id::text FROM organizations WHERE user_id = auth.uid()
    )
  );
