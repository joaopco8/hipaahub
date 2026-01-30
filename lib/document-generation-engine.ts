/**
 * Dynamic HIPAA Document Generation Engine
 * 
 * This engine generates legally defensible, OCR-ready documents based on:
 * - Question answers with compliance status
 * - Evidence files and attestations
 * - Conflict resolution logic
 * - Remediation commitments
 */

import { 
  QuestionBinding, 
  QuestionAnswer, 
  ComplianceStatus, 
  RiskLevel,
  DocumentFieldBinding,
  getQuestionBinding,
  getDocumentFieldsForQuestion,
  getLegalStatement,
  DOCUMENT_FIELDS
} from './question-document-binding';

export interface DocumentFieldValue {
  field_name: string;
  value: string;
  compliance_status: ComplianceStatus;
  risk_level: RiskLevel;
  source_questions: string[]; // Question IDs that contributed to this field
  evidence_files: Array<{
    file_id: string;
    file_name: string;
    uploaded_at: string;
    storage_path?: string;
    download_url?: string;
  }>;
  attestations: Array<{
    timestamp: string;
    ip_address: string;
    signer_name: string;
  }>;
}

export interface DocumentData {
  document_name: string;
  fields: Record<string, DocumentFieldValue>;
}

export interface RemediationAction {
  finding: string;
  required_action: string;
  severity: 'MEDIUM' | 'HIGH' | 'CRITICAL';
  due_date: string;
  question_id: string;
}

/**
 * Convert question answer to compliance status
 */
export function getComplianceStatusFromAnswer(
  questionId: string,
  selectedOption: string
): ComplianceStatus {
  const binding = getQuestionBinding(questionId);
  if (!binding) return 'NON_COMPLIANT';
  
  // Map answer values to compliance status
  // This logic should match the risk scores in questions.ts
  // Values like 'yes', 'yes-current', 'yes-regular' = COMPLIANT
  if (selectedOption === 'yes' || 
      selectedOption === 'yes-current' || 
      selectedOption === 'yes-regular') {
    return 'COMPLIANT';
  }
  
  // Values like 'partial', 'informal', 'yes-old', 'yes-occasional' = PARTIAL
  if (selectedOption === 'partial' || 
      selectedOption === 'informal' || 
      selectedOption === 'yes-old' ||
      selectedOption === 'yes-occasional') {
    return 'PARTIAL';
  }
  
  // Values like 'no' = NON_COMPLIANT
  if (selectedOption === 'no') {
    return 'NON_COMPLIANT';
  }
  
  // Default based on risk score (0 = COMPLIANT, 1-2 = PARTIAL, 3+ = NON_COMPLIANT)
  // This is a fallback - should be refined per question
  return 'PARTIAL';
}

/**
 * Convert compliance status and risk score to risk level
 */
export function getRiskLevel(
  complianceStatus: ComplianceStatus,
  riskScore: number
): RiskLevel {
  if (complianceStatus === 'COMPLIANT' && riskScore === 0) {
    return 'LOW';
  }
  if (complianceStatus === 'NON_COMPLIANT' || riskScore >= 4) {
    return 'CRITICAL';
  }
  if (complianceStatus === 'PARTIAL' || riskScore >= 2) {
    return 'HIGH';
  }
  return 'MEDIUM';
}

/**
 * Generate document field values from question answers
 */
export function generateDocumentFields(
  answers: QuestionAnswer[]
): Map<string, DocumentData> {
  // Map: document_name -> DocumentData
  const documents = new Map<string, DocumentData>();
  
  // Process each answer
  for (const answer of answers) {
    // Log if answer has evidence
    if (answer.evidence_files && answer.evidence_files.length > 0) {
      console.log(`🔍 Processing answer with evidence: ${answer.question_id}`, {
        evidenceCount: answer.evidence_files.length,
        fileNames: answer.evidence_files.map(ev => ev.file_name)
      });
    }
    
    const binding = getQuestionBinding(answer.question_id);
    if (!binding) {
      // Log if question has evidence but no binding
      if (answer.evidence_files && answer.evidence_files.length > 0) {
        console.warn(`⚠️ Question ${answer.question_id} has evidence but no binding!`);
      }
      continue;
    }
    
    const complianceStatus = answer.compliance_status;
    const legalStatement = getLegalStatement(answer.question_id, complianceStatus);
    
    if (!legalStatement) continue;
    
    // For each document field this question affects
    for (const fieldBinding of binding.affects) {
      const { document_name, field_name, priority } = fieldBinding;
      
      // Get or create document
      if (!documents.has(document_name)) {
        documents.set(document_name, {
          document_name,
          fields: {}
        });
      }
      
      const document = documents.get(document_name)!;
      
      // If field already exists, we need conflict resolution
      if (document.fields[field_name]) {
        const existing = document.fields[field_name];
        
        // Conflict resolution: worst status wins
        const newStatus = resolveConflict(
          existing.compliance_status,
          complianceStatus
        );
        
        // Merge statements
        const mergedStatement = mergeLegalStatements(
          existing.value,
          legalStatement,
          existing.compliance_status,
          complianceStatus
        );
        
        // Update field
        document.fields[field_name] = {
          field_name,
          value: mergedStatement,
          compliance_status: newStatus,
          risk_level: getRiskLevel(newStatus, answer.risk_level === 'CRITICAL' ? 5 : 3),
          source_questions: [...existing.source_questions, answer.question_id],
          evidence_files: [...existing.evidence_files, ...answer.evidence_files],
          attestations: answer.attestation_signed 
            ? [...existing.attestations, {
                timestamp: answer.timestamp,
                ip_address: answer.ip_address,
                signer_name: 'User' // Will be replaced with actual user name
              }]
            : existing.attestations
        };
      } else {
        // New field
        document.fields[field_name] = {
          field_name,
          value: legalStatement,
          compliance_status: complianceStatus,
          risk_level: getRiskLevel(complianceStatus, 0),
          source_questions: [answer.question_id],
          evidence_files: answer.evidence_files,
          attestations: answer.attestation_signed 
            ? [{
                timestamp: answer.timestamp,
                ip_address: answer.ip_address,
                signer_name: 'User'
              }]
            : []
        };
      }
    }
  }
  
  // Aggregate evidence for specific document fields
  const evidenceByDocument: Map<string, Array<{
    question_id: string;
    file_name: string;
    uploaded_at: string;
    download_url?: string;
  }>> = new Map();
  
  const attestationsByDocument: Map<string, Array<{
    timestamp: string;
    ip_address: string;
    signer_name: string;
  }>> = new Map();

  // Collect all evidence and attestations by document
  for (const document of Array.from(documents.values())) {
    for (const field of Object.values(document.fields)) {
      if (field.evidence_files.length > 0) {
        if (!evidenceByDocument.has(document.document_name)) {
          evidenceByDocument.set(document.document_name, []);
        }
        const docEvidence = evidenceByDocument.get(document.document_name)!;
        for (const ev of field.evidence_files) {
          // Avoid duplicates
          if (!docEvidence.find(e => e.file_name === ev.file_name && e.uploaded_at === ev.uploaded_at)) {
            docEvidence.push({
              question_id: field.source_questions[0] || 'unknown',
              file_name: ev.file_name,
              uploaded_at: ev.uploaded_at,
              download_url: ev.download_url
            });
          }
        }
      }
      
      if (field.attestations.length > 0) {
        if (!attestationsByDocument.has(document.document_name)) {
          attestationsByDocument.set(document.document_name, []);
        }
        const docAttestations = attestationsByDocument.get(document.document_name)!;
        for (const att of field.attestations) {
          // Avoid duplicates
          if (!docAttestations.find(a => a.timestamp === att.timestamp && a.ip_address === att.ip_address)) {
            docAttestations.push(att);
          }
        }
      }
    }
  }

  // Add evidence and attestation statements to document fields
  for (const document of Array.from(documents.values())) {
    const documentEvidence = evidenceByDocument.get(document.document_name) || [];
    const documentAttestations = attestationsByDocument.get(document.document_name) || [];
    
    // Format evidence list for AUDIT_EVIDENCE_LIST field
    if (document.fields['AUDIT_EVIDENCE_LIST']) {
      if (documentEvidence.length > 0) {
        const evidenceList = documentEvidence
          .map(ev => {
            const uploadDate = new Date(ev.uploaded_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
            // Include download link if available
            const fileReference = ev.download_url 
              ? `${ev.file_name} [Download: ${ev.download_url}]`
              : ev.file_name;
            return `  • ${fileReference} (Question ID: ${ev.question_id}, Uploaded: ${uploadDate})`;
          })
          .join('\n');
        document.fields['AUDIT_EVIDENCE_LIST'].value = `The following evidence documents are maintained on file to support compliance with this policy:\n\n${evidenceList}\n\nAll evidence documents are retained for a minimum of six (6) years in accordance with HIPAA retention requirements.`;
      } else {
        document.fields['AUDIT_EVIDENCE_LIST'].value = 'Evidence documentation is maintained in accordance with the Audit Logs & Documentation Retention Policy (POL-009).';
      }
    }
    
    // Format evidence for SRA_DOCUMENTATION field
    if (document.fields['SRA_DOCUMENTATION']) {
      if (documentEvidence.length > 0) {
        const sraEvidence = documentEvidence
          .filter(ev => ev.question_id.startsWith('SRA-') || ev.question_id.startsWith('ADM-'))
          .map(ev => {
            const uploadDate = new Date(ev.uploaded_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
            // Include download link if available
            const fileReference = ev.download_url 
              ? `${ev.file_name} [Download: ${ev.download_url}]`
              : ev.file_name;
            return `  • ${fileReference} (Uploaded: ${uploadDate})`;
          })
          .join('\n');
        
        if (sraEvidence) {
          document.fields['SRA_DOCUMENTATION'].value += `\n\nSupporting Documentation:\n${sraEvidence}`;
        }
      }
    }
    
    // Add evidence to individual fields
    for (const field of Object.values(document.fields)) {
      // Skip special fields that are handled above
      if (field.field_name === 'AUDIT_EVIDENCE_LIST' || field.field_name === 'SRA_DOCUMENTATION') {
        continue;
      }
      
      // Add evidence list if any
      if (field.evidence_files.length > 0) {
        const evidenceList = field.evidence_files
          .map(ev => {
            const uploadDate = new Date(ev.uploaded_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
            // Include download link if available
            const fileReference = ev.download_url 
              ? `${ev.file_name} [Download: ${ev.download_url}]`
              : ev.file_name;
            return `  • ${fileReference} (Uploaded: ${uploadDate})`;
          })
          .join('\n');
        field.value += `\n\nSupporting Evidence on File:\n${evidenceList}`;
      }
      
      // Add attestation statement if any
      if (field.attestations.length > 0) {
        const attestation = field.attestations[0]; // Use first attestation
        const attestDate = new Date(attestation.timestamp).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        field.value += `\n\nThis statement is supported by a legally binding attestation recorded on ${attestDate} from IP address ${attestation.ip_address}.`;
      }
    }
    
    // Add attestation section to Master Policy if applicable
    if (document.document_name === 'master-policy' && documentAttestations.length > 0) {
      const attestation = documentAttestations[0];
      const attestDate = new Date(attestation.timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      if (document.fields['SECURITY_POSTURE']) {
        document.fields['SECURITY_POSTURE'].value += `\n\nThis policy is supported by legally binding attestations recorded on ${attestDate} from IP address ${attestation.ip_address}.`;
      }
    }
  }
  
  return documents;
}

/**
 * Resolve conflict between two compliance statuses
 * Rule: Worst status wins (NON_COMPLIANT > PARTIAL > COMPLIANT)
 */
export function resolveConflict(
  status1: ComplianceStatus,
  status2: ComplianceStatus
): ComplianceStatus {
  if (status1 === 'NON_COMPLIANT' || status2 === 'NON_COMPLIANT') {
    return 'NON_COMPLIANT';
  }
  if (status1 === 'PARTIAL' || status2 === 'PARTIAL') {
    return 'PARTIAL';
  }
  return 'COMPLIANT';
}

/**
 * Merge two legal statements when there's a conflict
 */
function mergeLegalStatements(
  existing: string,
  newStatement: string,
  existingStatus: ComplianceStatus,
  newStatus: ComplianceStatus
): string {
  // If both are same status, combine them
  if (existingStatus === newStatus) {
    return `${existing}\n\n${newStatement}`;
  }
  
  // If new status is worse, prioritize it
  if (newStatus === 'NON_COMPLIANT' && existingStatus !== 'NON_COMPLIANT') {
    return `${newStatement}\n\nNote: Previous assessment indicated: ${existing}`;
  }
  
  // If existing is worse, keep it but note the new information
  if (existingStatus === 'NON_COMPLIANT' && newStatus !== 'NON_COMPLIANT') {
    return `${existing}\n\nAdditional assessment: ${newStatement}`;
  }
  
  // Mixed PARTIAL and COMPLIANT
  return `${existing}\n\n${newStatement}`;
}

/**
 * Generate remediation actions from non-compliant answers
 */
export function generateRemediationActions(
  answers: QuestionAnswer[]
): RemediationAction[] {
  const actions: RemediationAction[] = [];
  const today = new Date();
  
  for (const answer of answers) {
    if (answer.compliance_status === 'COMPLIANT') continue;
    
    const binding = getQuestionBinding(answer.question_id);
    if (!binding) continue;
    
    const severity = answer.risk_level === 'CRITICAL' ? 'CRITICAL' 
                   : answer.risk_level === 'HIGH' ? 'HIGH' 
                   : 'MEDIUM';
    
    // Calculate due date based on severity
    const dueDate = new Date(today);
    if (severity === 'CRITICAL') {
      dueDate.setDate(dueDate.getDate() + 30); // 30 days
    } else if (severity === 'HIGH') {
      dueDate.setDate(dueDate.getDate() + 60); // 60 days
    } else {
      dueDate.setDate(dueDate.getDate() + 90); // 90 days
    }
    
    actions.push({
      finding: `Compliance gap identified in: ${answer.question_id}`,
      required_action: binding.legal_statements[answer.compliance_status],
      severity,
      due_date: dueDate.toISOString(),
      question_id: answer.question_id
    });
  }
  
  return actions;
}

/**
 * Inject document field values into template
 */
export function injectDocumentFields(
  template: string,
  documentData: DocumentData
): string {
  let processed = template;
  
  // Replace each field
  for (const [fieldName, fieldValue] of Object.entries(documentData.fields)) {
    const placeholder = `{{${fieldName}}}`;
    // Escape special regex characters in field name
    const escapedPlaceholder = fieldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\{\\{${escapedPlaceholder}\\}\\}`, 'g');
    processed = processed.replace(regex, fieldValue.value);
  }
  
  return processed;
}
