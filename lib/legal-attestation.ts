/**
 * Legal Attestation Framework
 * Provides legally defensible attestation language for HIPAA compliance
 */

export interface LegalAttestation {
  id: string;
  attestation_type: 'compliance_commitment' | 'sra_review' | 'policy_review' | 'training_completion' | 'incident_review' | 'evidence_upload' | 'risk_acceptance';
  legal_text: string;
  short_description: string;
  requires_signature: boolean;
  requires_officer_designation?: boolean;
  legal_weight: 'high' | 'medium' | 'standard';
}

/**
 * Standard Legal Attestation Templates
 */
export const LEGAL_ATTESTATION_TEMPLATES: Record<string, LegalAttestation> = {
  compliance_commitment: {
    id: 'compliance_commitment',
    attestation_type: 'compliance_commitment',
    legal_text: 'I hereby attest, under penalty of perjury under the laws of the United States, that I have reviewed and understand the HIPAA Security and Privacy Rules as they apply to this organization. I commit to implementing and maintaining the administrative, physical, and technical safeguards identified in our Security Risk Analysis. I understand that HIPAA compliance is an ongoing responsibility and that this organization will conduct regular reviews and updates to maintain compliance. The information provided in this assessment is accurate and complete to the best of my knowledge as of the date below.',
    short_description: 'Initial HIPAA compliance commitment',
    requires_signature: true,
    requires_officer_designation: true,
    legal_weight: 'high'
  },
  sra_review: {
    id: 'sra_review',
    attestation_type: 'sra_review',
    legal_text: 'I hereby attest, under penalty of perjury, that I have personally reviewed this Security Risk Analysis and that it accurately reflects the current state of security safeguards, risks, and vulnerabilities for electronic Protected Health Information (ePHI) within this organization as of the date below. I acknowledge that this SRA identifies areas requiring remediation and commit to implementing the recommended safeguards in a timely manner. I understand that failure to maintain an accurate and current SRA is a violation of HIPAA requirements.',
    short_description: 'Security Risk Analysis review and accuracy',
    requires_signature: true,
    requires_officer_designation: true,
    legal_weight: 'high'
  },
  policy_review: {
    id: 'policy_review',
    attestation_type: 'policy_review',
    legal_text: 'I hereby attest, under penalty of perjury, that I have reviewed the HIPAA policies and procedures listed below and that they accurately reflect the current practices of this organization. I understand that these policies are legally binding on all workforce members and that non-compliance may result in disciplinary action. I commit to ensuring these policies are communicated to all workforce members and updated as necessary to maintain HIPAA compliance.',
    short_description: 'HIPAA policy review and implementation',
    requires_signature: true,
    requires_officer_designation: true,
    legal_weight: 'high'
  },
  training_completion: {
    id: 'training_completion',
    attestation_type: 'training_completion',
    legal_text: 'I hereby acknowledge, under penalty of perjury, that I have completed the required HIPAA training for my role within this organization. I understand the HIPAA Privacy and Security Rules as they apply to my job responsibilities. I commit to handling Protected Health Information (PHI) in accordance with HIPAA requirements and organizational policies. I understand that violations of HIPAA or organizational policies may result in disciplinary action up to and including termination, as well as potential civil and criminal penalties.',
    short_description: 'Workforce member training completion',
    requires_signature: true,
    requires_officer_designation: false,
    legal_weight: 'medium'
  },
  incident_review: {
    id: 'incident_review',
    attestation_type: 'incident_review',
    legal_text: 'I hereby attest, under penalty of perjury, that the incident details documented herein are accurate and complete to the best of my knowledge. I have reviewed the incident response actions taken and confirm that appropriate steps were followed in accordance with our Incident Response Plan. I understand that accurate incident documentation is required for HIPAA breach notification determination and OCR reporting.',
    short_description: 'Security incident review and documentation',
    requires_signature: true,
    requires_officer_designation: true,
    legal_weight: 'high'
  },
  evidence_upload: {
    id: 'evidence_upload',
    attestation_type: 'evidence_upload',
    legal_text: 'I hereby attest, under penalty of perjury, that the evidence file(s) uploaded are authentic, accurate, and represent the current state of this control as of the upload date. I understand that falsifying evidence for HIPAA compliance is a serious violation and may result in legal consequences. This evidence may be presented to auditors or regulators as proof of compliance.',
    short_description: 'Evidence authenticity and accuracy',
    requires_signature: true,
    requires_officer_designation: false,
    legal_weight: 'medium'
  },
  risk_acceptance: {
    id: 'risk_acceptance',
    attestation_type: 'risk_acceptance',
    legal_text: 'I hereby attest, under penalty of perjury, that I have been informed of the security risk(s) described below and the potential impact to Protected Health Information (PHI). I understand the HIPAA requirements related to this risk. After considering the available safeguards and the cost of implementation, I accept this risk on behalf of the organization with the understanding that it will be documented in our Risk Register and reviewed regularly. I acknowledge that accepting this risk does not eliminate HIPAA compliance obligations.',
    short_description: 'Documented risk acceptance decision',
    requires_signature: true,
    requires_officer_designation: true,
    legal_weight: 'high'
  }
};

/**
 * Generate attestation with user and timestamp
 */
export interface SignedAttestation {
  attestation: LegalAttestation;
  signed_by_name: string;
  signed_by_title: string;
  signed_by_email: string;
  signature_date: string;
  signature_ip: string;
  organization_name: string;
  additional_context?: string;
}

/**
 * Format attestation for document/PDF export
 */
export function formatAttestationForExport(signed: SignedAttestation): string {
  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    LEGAL ATTESTATION UNDER PENALTY OF PERJURY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${signed.attestation.legal_text}

${signed.additional_context ? `\nAdditional Context:\n${signed.additional_context}\n` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                                   SIGNATURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Organization:         ${signed.organization_name}
Signed By:            ${signed.signed_by_name}
Title:                ${signed.signed_by_title}
Email:                ${signed.signed_by_email}
Date of Signature:    ${signed.signature_date}
IP Address:           ${signed.signature_ip}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This attestation has been electronically signed and constitutes a legally binding 
statement. The signer acknowledges that providing false information is subject to 
penalties under federal law.

Document ID: ${signed.attestation.id}_${Date.now()}
Generated by: HIPAA Hub Compliance Management System
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `;
}

/**
 * Get attestation template by type
 */
export function getAttestationTemplate(type: string): LegalAttestation | null {
  return LEGAL_ATTESTATION_TEMPLATES[type] || null;
}
