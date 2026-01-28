-- Update Evidence Types to include Master Catalog of 18 Critical Documents
-- This migration adds the new evidence types from the master catalog

-- First, drop the constraint
ALTER TABLE compliance_evidence DROP CONSTRAINT IF EXISTS valid_evidence_type;

-- Add new constraint with all 18 critical document types + legacy types
ALTER TABLE compliance_evidence ADD CONSTRAINT valid_evidence_type CHECK (evidence_type IN (
  -- 18 Critical Documents from Master Catalog
  'sra_report',
  'incident_response_plan',
  'access_control_policy',
  'training_logs',
  'business_associate_agreements',
  'audit_logs',
  'encryption_configuration',
  'backup_recovery_tests',
  'mfa_configuration',
  'device_control_inventory',
  'employee_termination_checklist',
  'breach_log',
  'vulnerability_scan_reports',
  'penetration_test_report',
  'cloud_security_configuration',
  'vendor_soc2_report',
  'risk_remediation_plan',
  'sanction_documentation',
  -- Legacy types (for backward compatibility)
  'security_risk_analysis',
  'penetration_test',
  'vulnerability_scan',
  'policy_procedure',
  'workforce_training_log',
  'signed_acknowledgment',
  'system_settings_screenshot',
  'mfa_configuration_proof',
  'encryption_configuration_proof',
  'audit_log',
  'backup_log',
  'incident_report',
  'business_associate_agreement',
  'vendor_security_attestation',
  'access_control_export',
  'termination_checklist',
  'hipaa_training_certificate',
  'incident_response_drill_record',
  'system_architecture_diagram',
  'other'
));

-- Add capture_type field to support different evidence capture methods
ALTER TABLE compliance_evidence ADD COLUMN IF NOT EXISTS capture_type text DEFAULT 'document_upload';
ALTER TABLE compliance_evidence ADD CONSTRAINT valid_capture_type CHECK (capture_type IN (
  'document_upload',
  'external_link',
  'attestation',
  'system_generated',
  'screenshot'
));

-- Add frequency field to track review frequency
ALTER TABLE compliance_evidence ADD COLUMN IF NOT EXISTS frequency text;
ALTER TABLE compliance_evidence ADD CONSTRAINT valid_frequency CHECK (frequency IN (
  'annually',
  'quarterly',
  'monthly',
  'continuously',
  'on_hire',
  'on_termination',
  'on_incident',
  'on_risk_identified',
  'on_violation',
  'on_contract'
));

-- Add external_link field for evidence captured via external links
ALTER TABLE compliance_evidence ADD COLUMN IF NOT EXISTS external_link text;

-- Add required_signatures field to track who must sign
ALTER TABLE compliance_evidence ADD COLUMN IF NOT EXISTS required_signatures text[];

-- Add ocr_expectations field to document what OCR expects to see
ALTER TABLE compliance_evidence ADD COLUMN IF NOT EXISTS ocr_expectations text;

-- Add catalog_id field to link to master catalog
ALTER TABLE compliance_evidence ADD COLUMN IF NOT EXISTS catalog_id text;

-- Create index for catalog_id
CREATE INDEX IF NOT EXISTS compliance_evidence_catalog_id_idx 
  ON compliance_evidence(catalog_id);

-- Create index for frequency
CREATE INDEX IF NOT EXISTS compliance_evidence_frequency_idx 
  ON compliance_evidence(frequency);

-- Create index for capture_type
CREATE INDEX IF NOT EXISTS compliance_evidence_capture_type_idx 
  ON compliance_evidence(capture_type);
