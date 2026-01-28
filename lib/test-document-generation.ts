/**
 * Test Helper for Document Generation
 * 
 * Provides utilities to test document generation with sample data
 */

import { convertToQuestionAnswers } from './question-answer-converter';
import { generateDocumentFields, generateRemediationActions } from './document-generation-engine';
import type { QuestionAnswer } from './question-document-binding';

/**
 * Sample answers for testing
 * Represents a partially compliant organization
 */
export const SAMPLE_ANSWERS = {
  'security-officer': 'yes',
  'privacy-officer': 'yes',
  'risk-assessment-conducted': 'yes-old', // PARTIAL
  'risk-management-plan': 'partial',
  'sanction-policy': 'yes',
  'information-system-activity-review': 'yes-occasional', // PARTIAL
  'workforce-authorization': 'yes',
  'workforce-supervision': 'partial',
  'workforce-clearance': 'yes-some', // PARTIAL
  'workforce-termination': 'yes',
  'access-control-policies': 'yes',
  'access-authorization': 'yes',
  'access-termination': 'yes',
  'security-awareness-training': 'yes',
  'initial-hipaa-training': 'yes',
  'annual-hipaa-training': 'yes',
  'role-specific-training': 'yes',
  'incident-reporting-training': 'yes',
  'incident-response-plan': 'yes',
  'incident-detection-analysis': 'yes',
  'breach-notification-procedures': 'yes',
  'incident-mitigation-recovery': 'yes',
  'business-associates': 'yes-all',
  'baa-monitoring': 'yes',
  'baa-breach-notification': 'yes',
  'contingency-plan': 'yes',
  'data-backup-procedures': 'yes',
  'disaster-recovery-testing': 'yes',
  'privacy-policy': 'yes',
  'breach-history': 'no',
  'documentation-retention': 'yes',
  'facility-access-policies': 'yes',
  'visitor-access-logging': 'yes',
  'facility-security-plan': 'yes',
  'access-control-surveillance': 'yes',
  'workstation-use-policy': 'yes',
  'workstation-security': 'yes',
  'workstation-positioning': 'yes',
  'device-inventory': 'yes',
  'device-disposal': 'yes',
  'portable-device-security': 'yes',
  'unique-user-ids': 'yes',
  'emergency-access-procedures': 'yes',
  'automatic-logoff': 'yes',
  'encryption-at-rest': 'yes',
  'encryption-in-transit': 'yes',
  'audit-logs': 'yes',
  'integrity-controls': 'yes',
  'password-policy': 'yes',
  'multi-factor-authentication': 'yes',
};

/**
 * Sample evidence data for testing
 */
export const SAMPLE_EVIDENCE_DATA = {
  'risk-assessment-conducted': {
    files: [
      {
        file_id: 'test-file-1',
        file_name: 'SRA_Report_2024.pdf',
        uploaded_at: new Date().toISOString(),
      },
    ],
    attestation_signed: true,
    timestamp: new Date().toISOString(),
    ip_address: '192.168.1.100',
  },
  'security-officer': {
    files: [],
    attestation_signed: true,
    timestamp: new Date().toISOString(),
    ip_address: '192.168.1.100',
  },
};

/**
 * Generate test documents
 */
export function generateTestDocuments() {
  const questionAnswers = convertToQuestionAnswers(
    SAMPLE_ANSWERS,
    SAMPLE_EVIDENCE_DATA
  );

  const documents = generateDocumentFields(questionAnswers);
  const remediationActions = generateRemediationActions(questionAnswers);

  return {
    questionAnswers,
    documents,
    remediationActions,
    summary: {
      totalQuestions: questionAnswers.length,
      compliant: questionAnswers.filter(a => a.compliance_status === 'COMPLIANT').length,
      partial: questionAnswers.filter(a => a.compliance_status === 'PARTIAL').length,
      nonCompliant: questionAnswers.filter(a => a.compliance_status === 'NON_COMPLIANT').length,
      documentsGenerated: documents.size,
      remediationActions: remediationActions.length,
    },
  };
}

/**
 * Get document field summary
 */
export function getDocumentFieldSummary(documents: Map<string, any>) {
  const summary: Record<string, any> = {};

  for (const [docName, docData] of documents.entries()) {
    summary[docName] = {
      fieldCount: Object.keys(docData.fields).length,
      fields: Object.keys(docData.fields),
      complianceStatuses: Object.values(docData.fields).map((f: any) => f.compliance_status),
    };
  }

  return summary;
}

/**
 * Validate document generation
 */
export function validateDocumentGeneration(result: ReturnType<typeof generateTestDocuments>) {
  const errors: string[] = [];

  // Check that documents were generated
  if (result.documents.size === 0) {
    errors.push('No documents were generated');
  }

  // Check that at least some fields were populated
  let totalFields = 0;
  for (const doc of result.documents.values()) {
    totalFields += Object.keys(doc.fields).length;
  }

  if (totalFields === 0) {
    errors.push('No document fields were populated');
  }

  // Check that remediation actions were generated for non-compliant items
  const nonCompliantCount = result.questionAnswers.filter(
    a => a.compliance_status === 'NON_COMPLIANT'
  ).length;

  if (nonCompliantCount > 0 && result.remediationActions.length === 0) {
    errors.push('Remediation actions should be generated for non-compliant answers');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
