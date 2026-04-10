/**
 * API Route: Generate HIPAA Documents
 * 
 * Generates personalized HIPAA compliance documents based on
 * risk assessment answers, evidence, and attestations
 */

// Force dynamic rendering - this route uses Supabase auth which requires cookies
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { convertToQuestionAnswers } from '@/lib/question-answer-converter';
import { generateDocumentFields, injectDocumentFields, generateRemediationActions } from '@/lib/document-generation-engine';
import { SECURITY_RISK_ANALYSIS_POLICY_TEMPLATE } from '@/lib/document-templates/security-risk-analysis-policy';
import { HIPAA_SECURITY_PRIVACY_MASTER_POLICY_TEMPLATE } from '@/lib/document-templates/hipaa-security-privacy-master-policy';
import { RISK_MANAGEMENT_PLAN_POLICY_TEMPLATE } from '@/lib/document-templates/risk-management-plan-policy';
import { ACCESS_CONTROL_POLICY_TEMPLATE } from '@/lib/document-templates/access-control-policy';
import { WORKFORCE_TRAINING_POLICY_TEMPLATE } from '@/lib/document-templates/workforce-training-policy';
import { SANCTION_POLICY_TEMPLATE } from '@/lib/document-templates/sanction-policy';
import { INCIDENT_RESPONSE_BREACH_NOTIFICATION_POLICY_TEMPLATE } from '@/lib/document-templates/incident-response-breach-notification-policy';
import { BUSINESS_ASSOCIATE_MANAGEMENT_POLICY_TEMPLATE } from '@/lib/document-templates/business-associate-management-policy';
import { AUDIT_LOGS_DOCUMENTATION_RETENTION_POLICY_TEMPLATE } from '@/lib/document-templates/audit-logs-documentation-retention-policy';
import { processDocumentTemplate } from '@/lib/document-generator';
import { formatDocumentForA4 } from '@/lib/document-formatter';
import { injectEvidenceReferences, generateEvidenceListForDocument, generateEvidenceStatement } from '@/lib/evidence-injection-engine';
import { getEvidenceByDocumentId } from '@/app/actions/compliance-evidence';
import type { OrganizationData } from '@/lib/document-generator';
import type { DocumentData } from '@/lib/document-generation-engine';

/**
 * Replace any remaining placeholders that weren't filled by document generation
 * with appropriate default or empty values
 */
function replaceRemainingPlaceholders(
  template: string,
  documentData: DocumentData
): string {
  let processed = template;
  
  // List of known placeholders that should have defaults if not filled
  const placeholderDefaults: Record<string, string> = {
    'SRA_STATEMENT': 'The organization conducts Security Risk Analyses in accordance with HIPAA requirements. Specific details are documented in the Security Risk Analysis Policy (POL-002).',
    'SECURITY_POSTURE': 'The organization has designated a Security Officer responsible for implementing and maintaining security policies and procedures.',
    'RISK_MGMT_ACTIONS': 'Risk management actions are documented in the Risk Management Plan Policy (POL-003).',
    'AUDIT_EVIDENCE_LIST': 'Evidence documentation is maintained in accordance with the Audit Logs & Documentation Retention Policy (POL-009).',
    'INCIDENT_DEFENSIBILITY': 'Incident response procedures are documented in the Incident Response & Breach Notification Policy (POL-007).',
  };
  
  // Find all remaining placeholders in the template
  const remainingPlaceholders = (processed.match(/\{\{([A-Z_]+)\}\}/g) || [])
    .map(p => p.replace(/[{}]/g, ''));
  
  // Replace placeholders that weren't filled - use global flag and replace ALL occurrences
  for (const [placeholder, defaultValue] of Object.entries(placeholderDefaults)) {
    // Escape special regex characters in placeholder name
    const escapedPlaceholder = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\{\\{${escapedPlaceholder}\\}\\}`, 'g');
    processed = processed.replace(regex, defaultValue);
  }
  
  // Replace any other remaining placeholders with empty string to avoid showing {{PLACEHOLDER}} in final document
  // This catches any placeholders not in our defaults list
  processed = processed.replace(/\{\{([A-Z_]+)\}\}/g, '');
  
  // Clean up any double newlines or extra whitespace that might result from placeholder removal
  processed = processed.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  return processed;
}

/**
 * Final cleanup for any placeholder-like tokens that might remain
 * This is a safety net to catch any placeholders that escaped previous processing
 */
function cleanupPlaceholders(template: string): string {
  let cleaned = template;
  
  // Remove any remaining {{...}} placeholders
  cleaned = cleaned.replace(/\{\{[^}]+\}\}/g, '');
  
  // Clean up any resulting double newlines or excessive whitespace
  cleaned = cleaned.replace(/\n\s*\n\s*\n+/g, '\n\n');
  
  // Remove lines that are only whitespace after placeholder removal
  cleaned = cleaned.replace(/^\s+$/gm, '');
  
  return cleaned;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limiting
    const { documentGenerationLimiter, getRateLimitIdentifier, createRateLimitResponse } = await import('@/lib/rate-limit');
    const identifier = getRateLimitIdentifier(user.id, request);
    const { success, limit, remaining, reset } = await documentGenerationLimiter.limit(identifier);

    if (!success) {
      return createRateLimitResponse(limit, remaining, reset);
    }

    const body = await request.json();
    const { documentType, answers, evidenceData } = body;

    if (!documentType || !answers) {
      return NextResponse.json(
        { error: 'Missing required fields: documentType, answers' },
        { status: 400 }
      );
    }

    // Get organization data
    const { data: organization } = await supabase
      .from('organizations')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Load evidence data if not provided
    let finalEvidenceData = evidenceData;
    if (!finalEvidenceData || Object.keys(finalEvidenceData).length === 0) {
      // Get risk assessment ID
      const { data: assessment, error: assessmentError } = await supabase
        .from('onboarding_risk_assessments' as any)
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      // Load evidence records - try multiple strategies
      let evidenceRecords;
      
      // Strategy 1: Try with risk_assessment_id if assessment exists
      if (assessment) {
        const { data: evidenceWithId, error: errorWithId } = await supabase
          .from('risk_assessment_evidence' as any)
          .select('question_id, evidence_data, uploaded_at, uploaded_by, uploaded_ip')
          .eq('risk_assessment_id', assessment.id)
          .eq('organization_id', organization.id);

        if (evidenceWithId && evidenceWithId.length > 0) {
          evidenceRecords = evidenceWithId;
        }
      }
      
      // Strategy 2: If no records found, try by user_id and organization_id only
      if (!evidenceRecords || evidenceRecords.length === 0) {
        const { data: evidenceByUser, error: errorByUser } = await supabase
          .from('risk_assessment_evidence' as any)
          .select('question_id, evidence_data, uploaded_at, uploaded_by, uploaded_ip')
          .eq('user_id', user.id)
          .eq('organization_id', organization.id);

        if (evidenceByUser && evidenceByUser.length > 0) {
          evidenceRecords = evidenceByUser;
        }
      }
      
      // Strategy 3: Last resort - try by user_id only
      if (!evidenceRecords || evidenceRecords.length === 0) {
        const { data: evidenceByUserOnly, error: errorByUserOnly } = await supabase
          .from('risk_assessment_evidence' as any)
          .select('question_id, evidence_data, uploaded_at, uploaded_by, uploaded_ip')
          .eq('user_id', user.id);

        if (evidenceByUserOnly && evidenceByUserOnly.length > 0) {
          evidenceRecords = evidenceByUserOnly;
        }
      }

      if (evidenceRecords && evidenceRecords.length > 0) {
          finalEvidenceData = {};
          for (const record of evidenceRecords) {
            const evidence = record.evidence_data as any;
            const files: Array<{ file_id: string; file_name: string; uploaded_at: string; storage_path?: string; download_url?: string }> = [];

            // Extract files from evidence_data
            if (evidence?.documents) {
              for (const doc of evidence.documents) {
                // storage_path is the path in Supabase Storage (e.g., "user_id/question_id/timestamp.pdf")
                const storagePath = doc.storage_path || doc.file_id || '';
                // Generate signed URL for the file (valid for 1 hour)
                let downloadUrl = '';
                if (storagePath) {
                  try {
                    const { data: urlData, error: urlError } = await supabase.storage
                      .from('evidence')
                      .createSignedUrl(storagePath, 3600); // 1 hour expiry
                    if (!urlError && urlData?.signedUrl) {
                      downloadUrl = urlData.signedUrl;
                    }
                  } catch (error) {
                    // Silent fail - URL generation is non-blocking
                  }
                }
                
                files.push({
                  file_id: doc.file_id || doc.id || '',
                  file_name: doc.file_name || doc.name || 'Document',
                  uploaded_at: doc.uploaded_at || record.uploaded_at || new Date().toISOString(),
                  storage_path: storagePath,
                  download_url: downloadUrl
                });
              }
            }

            if (evidence?.screenshots) {
              for (const screenshot of evidence.screenshots) {
                const storagePath = screenshot.storage_path || screenshot.file_id || '';
                // Generate signed URL for the file (valid for 1 hour)
                let downloadUrl = '';
                if (storagePath) {
                  try {
                    const { data: urlData, error: urlError } = await supabase.storage
                      .from('evidence')
                      .createSignedUrl(storagePath, 3600); // 1 hour expiry
                    if (!urlError && urlData?.signedUrl) {
                      downloadUrl = urlData.signedUrl;
                    }
                  } catch (error) {
                    // Silent fail - URL generation is non-blocking
                  }
                }
                
                files.push({
                  file_id: screenshot.file_id || screenshot.id || '',
                  file_name: screenshot.file_name || screenshot.name || 'Screenshot',
                  uploaded_at: screenshot.uploaded_at || record.uploaded_at || new Date().toISOString(),
                  storage_path: storagePath,
                  download_url: downloadUrl
                });
              }
            }

            finalEvidenceData[record.question_id] = {
              files,
              attestation_signed: evidence?.attestations?.length > 0 || false,
              timestamp: record.uploaded_at || new Date().toISOString(),
              ip_address: record.uploaded_ip || 'unknown'
            };
          }
        }
    }

    // Convert answers to QuestionAnswer format
    const questionAnswers = convertToQuestionAnswers(answers, finalEvidenceData);

    // Generate document fields
    const documents = generateDocumentFields(questionAnswers);

    // Get organization data for template
    const orgData: OrganizationData = {
      name: organization.name,
      legal_name: organization.legal_name || organization.name,
      dba: organization.dba,
      type: organization.type,
      state: organization.state,
      address_street: organization.address_street,
      address_city: organization.address_city,
      address_state: organization.address_state,
      address_zip: organization.address_zip,
      security_officer_name: organization.security_officer_name,
      security_officer_email: organization.security_officer_email,
      security_officer_role: organization.security_officer_role,
      privacy_officer_name: organization.privacy_officer_name,
      privacy_officer_email: organization.privacy_officer_email,
      privacy_officer_role: organization.privacy_officer_role,
      employee_count: organization.employee_count,
      assessment_date: new Date().toISOString(),
      next_review_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      ein: organization.ein,
      npi: (organization as any).npi,
      state_license_number: (organization as any).state_license_number,
      clia_certificate_number: (organization as any).clia_certificate_number,
      medicare_provider_number: (organization as any).medicare_provider_number,
      state_tax_id: (organization as any).state_tax_id,
      authorized_representative_name: (organization as any).authorized_representative_name,
      authorized_representative_title: (organization as any).authorized_representative_title,
      ceo_name: (organization as any).ceo_name,
      ceo_title: (organization as any).ceo_title,
      phone_number: (organization as any).phone_number,
      email_address: (organization as any).email_address,
      website: (organization as any).website,
      accreditation_status: (organization as any).accreditation_status,
      types_of_services: (organization as any).types_of_services,
      insurance_coverage: (organization as any).insurance_coverage,
      performs_laboratory_tests: (organization as any).performs_laboratory_tests,
      serves_medicare_patients: (organization as any).serves_medicare_patients,
    };

    // Generate the requested document
    let template = '';
    let documentData = null;
    let documentKey = '';
  let documentTitle = '';
  let policyId: string | undefined;

    switch (documentType) {
      case 'sra-policy':
        template = SECURITY_RISK_ANALYSIS_POLICY_TEMPLATE;
        documentKey = 'SRAPolicy';
      documentTitle = 'Security Risk Analysis (SRA) Policy';
      policyId = 'POL-002';
        break;
      case 'master-policy':
        template = HIPAA_SECURITY_PRIVACY_MASTER_POLICY_TEMPLATE;
        documentKey = 'MasterPolicy';
      documentTitle = 'HIPAA Security & Privacy Master Policy';
      policyId = 'MST-001';
        break;
      case 'risk-management-plan':
        template = RISK_MANAGEMENT_PLAN_POLICY_TEMPLATE;
        documentKey = 'RiskManagementPlan';
      documentTitle = 'Risk Management Plan Policy';
      policyId = 'POL-003';
        break;
      case 'access-control-policy':
        template = ACCESS_CONTROL_POLICY_TEMPLATE;
        documentKey = 'AccessControlPolicy';
      documentTitle = 'Access Control Policy';
      policyId = 'POL-004';
        break;
      case 'workforce-training-policy':
        template = WORKFORCE_TRAINING_POLICY_TEMPLATE;
        documentKey = 'WorkforceTrainingPolicy';
      documentTitle = 'Workforce Training Policy';
      policyId = 'POL-005';
        break;
      case 'sanction-policy':
        template = SANCTION_POLICY_TEMPLATE;
        documentKey = 'SanctionPolicy';
      documentTitle = 'Sanction Policy';
      policyId = 'POL-006';
        break;
      case 'incident-response-policy':
        template = INCIDENT_RESPONSE_BREACH_NOTIFICATION_POLICY_TEMPLATE;
        documentKey = 'IncidentResponsePolicy';
      documentTitle = 'Incident Response & Breach Notification Policy';
      policyId = 'POL-007';
        break;
      case 'business-associate-policy':
        template = BUSINESS_ASSOCIATE_MANAGEMENT_POLICY_TEMPLATE;
        documentKey = 'BusinessAssociatePolicy';
      documentTitle = 'Business Associate Management Policy';
      policyId = 'POL-008';
        break;
      case 'audit-logs-policy':
        template = AUDIT_LOGS_DOCUMENTATION_RETENTION_POLICY_TEMPLATE;
        documentKey = 'AuditLogsPolicy';
      documentTitle = 'Audit Logs & Documentation Retention Policy';
      policyId = 'POL-009';
        break;
      default:
        return NextResponse.json(
          { error: `Unknown document type: ${documentType}. Supported types: sra-policy, master-policy, risk-management-plan, access-control-policy, workforce-training-policy, sanction-policy, incident-response-policy, business-associate-policy, audit-logs-policy` },
          { status: 400 }
        );
    }

    documentData = documents.get(documentKey);

    if (!documentData) {
      // Try alternative document names
      const alternatives = documentType === 'master-policy' 
        ? ['MasterPolicy', 'HIPAA_Master_Policy']
        : documentType === 'sra-policy'
        ? ['SRAPolicy', 'SecurityRiskAnalysis']
        : [documentKey];
      
      for (const altKey of alternatives) {
        const altData = documents.get(altKey);
        if (altData) {
          documentData = altData;
          break;
        }
      }
      
      // If still no data, create empty structure
      if (!documentData) {
        documentData = {
          document_name: documentKey,
          fields: {}
        };
      }
    }
    
    // Load evidence from Evidence Center for this document (before document processing)
    let evidenceFromCenter = await getEvidenceByDocumentId(policyId);

    // Inject document fields into template
    let finalDocument = injectDocumentFields(template, documentData);

    // Always process evidence, even if empty, to replace placeholders
    const evidenceDownloadUrls: Record<string, string> = {};
    
    if (evidenceFromCenter && evidenceFromCenter.length > 0) {
      // Generate signed URLs for evidence files
      for (const evidence of evidenceFromCenter) {
        if (evidence.file_url) {
          try {
            const { data: urlData, error: urlError } = await supabase.storage
              .from(evidence.storage_bucket || 'evidence')
              .createSignedUrl(evidence.file_url, 3600); // 1 hour expiry
            
            if (!urlError && urlData?.signedUrl) {
              evidenceDownloadUrls[evidence.id] = urlData.signedUrl;
            }
          } catch (error) {
            // Silent fail - URL generation is non-blocking
          }
        }
      }
      
      // Inject evidence references into document
      finalDocument = injectEvidenceReferences(finalDocument, evidenceFromCenter, evidenceDownloadUrls);

      // Generate evidence statements for specific controls
      if (evidenceFromCenter.some(ev => ev.evidence_type === 'security_risk_analysis')) {
        const sraEvidence = evidenceFromCenter.filter(ev => ev.evidence_type === 'security_risk_analysis');
        const sraStatement = generateEvidenceStatement(sraEvidence, 'The organization\'s Security Risk Analysis is documented and on file:');
        finalDocument = finalDocument.replace(/\{\{SRA_EVIDENCE_STATEMENT\}\}/g, sraStatement);
      }
    }
    
    // Always generate evidence list (even if empty) to replace AUDIT_EVIDENCE_LIST placeholder
    const evidenceList = generateEvidenceListForDocument(evidenceFromCenter || [], evidenceDownloadUrls);
    finalDocument = finalDocument.replace(/\{\{AUDIT_EVIDENCE_LIST\}\}/g, evidenceList);

    // Replace any remaining placeholders with default values if no data was generated
    // This ensures placeholders don't remain empty in the final document
    finalDocument = replaceRemainingPlaceholders(finalDocument, documentData);

    // Process template with organization data
    finalDocument = processDocumentTemplate(finalDocument, orgData);
    
    // Final evidence injection pass (after all other processing)
    // This ensures evidence references are injected even if they were in organization data placeholders
    if (evidenceFromCenter && evidenceFromCenter.length > 0) {
      const evidenceDownloadUrls: Record<string, string> = {};
      for (const evidence of evidenceFromCenter) {
        if (evidence.file_url) {
          try {
            const { data: urlData } = await supabase.storage
              .from(evidence.storage_bucket || 'evidence')
              .createSignedUrl(evidence.file_url, 3600);
            if (urlData?.signedUrl) {
              evidenceDownloadUrls[evidence.id] = urlData.signedUrl;
            }
          } catch (error) {
            // Silent fail - URL already generated above
          }
        }
      }
      finalDocument = injectEvidenceReferences(finalDocument, evidenceFromCenter, evidenceDownloadUrls);
    }

    // AGGRESSIVE FINAL CLEANUP - Remove ALL remaining placeholders BEFORE HTML formatting
    // First, try to replace known placeholders with defaults
    const knownPlaceholders: Record<string, string> = {
      'SECURITY_POSTURE': 'The organization has designated a Security Officer responsible for implementing and maintaining security policies and procedures.',
      'SRA_STATEMENT': 'The organization conducts Security Risk Analyses in accordance with HIPAA requirements. Specific details are documented in the Security Risk Analysis Policy (POL-002).',
      'RISK_MGMT_ACTIONS': 'Risk management actions are documented in the Risk Management Plan Policy (POL-003).',
      'AUDIT_EVIDENCE_LIST': 'Evidence documentation is maintained in accordance with the Audit Logs & Documentation Retention Policy (POL-009).',
      'INCIDENT_DEFENSIBILITY': 'Incident response procedures are documented in the Incident Response & Breach Notification Policy (POL-007).',
    };
    
    for (const [key, value] of Object.entries(knownPlaceholders)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      finalDocument = finalDocument.replace(regex, value);
    }
    
    // Then remove ANY remaining {{...}} placeholders (safety net)
    finalDocument = finalDocument.replace(/\{\{[^}]+\}\}/g, '');
    
    // Clean up resulting whitespace issues
    finalDocument = cleanupPlaceholders(finalDocument);
    finalDocument = cleanupPlaceholders(finalDocument); // Second pass
    
    // Final verification - if any placeholders still exist, remove them
    const remainingPlaceholders = (finalDocument.match(/\{\{[^}]+\}\}/g) || []);
    if (remainingPlaceholders.length > 0) {
      finalDocument = finalDocument.replace(/\{\{[^}]+\}\}/g, '');
    }

    // Build formatted HTML for A4/PDF consumption
    // IMPORTANT: finalDocument is already cleaned, but add one more safety pass in formatter
    let formattedDocument: string | null = null;
    try {
      formattedDocument = formatDocumentForA4(finalDocument, documentTitle || documentType, policyId);
      
      // Final safety check on HTML - remove any placeholders that might have escaped
      if (formattedDocument.includes('{{')) {
        formattedDocument = formattedDocument.replace(/\{\{[^}]+\}\}/g, '');
      }
    } catch (err) {
      console.error('Error formatting document for A4:', err);
    }

    // Generate remediation actions
    const remediationActions = generateRemediationActions(questionAnswers);

    // Ensure finalDocument is the cleaned version (not the original with placeholders)
    // This is what gets returned as 'document' field
    const cleanedFinalDocument = finalDocument.replace(/\{\{[^}]+\}\}/g, '');
    
    return NextResponse.json({
      success: true,
      document: cleanedFinalDocument, // Always return cleaned version
      formattedDocument: formattedDocument || formatDocumentForA4(cleanedFinalDocument, documentTitle || documentType, policyId),
      documentType,
      remediationActions,
      fieldCount: Object.keys(documentData.fields).length,
    });

  } catch (error) {
    console.error('Error generating document:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate document',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
