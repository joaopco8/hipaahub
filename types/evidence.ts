/**
 * Evidence-Driven Compliance System Types
 * OCR-grade types for evidence collection and storage
 */

export type EvidenceType = 
  | 'document' 
  | 'screenshot' 
  | 'link' 
  | 'attestation' 
  | 'log' 
  | 'vendor_proof' 
  | 'structured_narrative';

export interface EvidenceFile {
  file_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  uploaded_at: string;
  uploaded_by: string;
  storage_path: string;
  hash?: string; // SHA-256 hash for integrity verification
}

export interface EvidenceLink {
  url: string;
  title?: string;
  description?: string;
  verified_at?: string;
  expires_at?: string;
}

export interface EvidenceAttestation {
  signer_name: string;
  signer_email: string;
  signer_role: string;
  signed_at: string;
  ip_address: string;
  user_agent: string;
  digital_signature?: string; // Optional digital signature hash
}

export interface EvidenceLog {
  log_type: string;
  log_content: string; // Base64 encoded or plain text
  log_format: 'csv' | 'json' | 'txt' | 'log';
  exported_at: string;
  exported_by: string;
}

export interface EvidenceVendorProof {
  vendor_name: string;
  proof_type: 'BAA' | 'SOC2' | 'ISO27001' | 'HITRUST' | 'Other';
  certificate_number?: string;
  issued_date?: string;
  expires_date?: string;
  file_id?: string; // Reference to uploaded certificate file
  verification_url?: string;
}

export interface EvidenceNarrative {
  narrative_type: string;
  structured_data: Record<string, any>;
  narrative_text: string;
  completed_at: string;
  completed_by: string;
}

export interface EvidenceData {
  documents?: EvidenceFile[];
  screenshots?: EvidenceFile[];
  links?: EvidenceLink[];
  attestations?: EvidenceAttestation[];
  logs?: EvidenceLog[];
  vendor_proofs?: EvidenceVendorProof[];
  narratives?: EvidenceNarrative[];
}

export interface EvidenceRecord {
  id: string;
  user_id: string;
  organization_id: string;
  risk_assessment_id: string;
  question_id: string;
  question_sequence: number;
  answer: string;
  evidence_required: boolean;
  evidence_type: EvidenceType[];
  evidence_provided: boolean;
  evidence_data: EvidenceData;
  uploaded_by: string;
  uploaded_at: string;
  uploaded_ip: string;
  uploaded_user_agent: string;
  retention_until: string;
  legal_weight: string;
  audit_trail: Array<{
    action: string;
    timestamp: string;
    user_id: string;
    ip_address: string;
    user_agent: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface EvidenceQuestionMetadata {
  question_id: string;
  sequence: number;
  original_question: string;
  rewritten_compliance_question: string;
  hipaa_citation: string;
  nist_control?: string;
  risk_domain: string;
  severity: number;
  category: 'administrative' | 'physical' | 'technical' | 'vendor' | 'training' | 'incident';
  evidence_required: boolean;
  evidence_type: EvidenceType[];
  evidence_instructions_for_user: string;
  backend_field_definition: {
    evidence_required: boolean;
    evidence_type: EvidenceType[];
    required_if?: string;
    retention: string;
    legal_weight: string;
    audit_trail: boolean;
    timestamp_required: boolean;
    signer_required: boolean;
  };
}
