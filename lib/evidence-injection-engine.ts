/**
 * Evidence Injection Engine (Enhanced)
 * 
 * Injects evidence references into generated HIPAA documents using comprehensive policy-evidence mapping.
 * Supports:
 * - Section-based injection with specific positioning
 * - Priority-based injection (high/medium/low)
 * - Multiple injection types (link, link_with_date, screenshot, attestation)
 * - Dynamic date replacement
 * - Supabase Storage URL generation
 */

import { ComplianceEvidence } from '@/app/actions/compliance-evidence';
import { 
  getEvidenceInjectionPointsForPolicy,
  getEvidenceInjectionPointsForSection,
  EvidenceInjectionPoint,
  PolicySection
} from './policy-evidence-mapping';

export interface EvidenceReference {
  evidence_id: string;
  title: string;
  file_name?: string;
  download_url?: string;
  upload_date: string;
  attestation_signed: boolean;
  attestation_signed_by?: string;
  attestation_signed_at?: string;
}

export interface EvidenceWithDownloadUrl extends ComplianceEvidence {
  download_url?: string;
}

/**
 * Format evidence reference for document injection
 */
export function formatEvidenceReference(evidence: ComplianceEvidence, downloadUrl?: string): string {
  const parts: string[] = [];
  
  // Title
  parts.push(evidence.title);
  
  // File name if available
  if (evidence.file_name) {
    parts.push(`(${evidence.file_name})`);
  }
  
  // Upload date
  const uploadDate = new Date(evidence.upload_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  parts.push(`- Uploaded ${uploadDate}`);
  
  // Attestation info if signed
  if (evidence.attestation_signed && evidence.attestation_signed_at) {
    const signDate = new Date(evidence.attestation_signed_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    parts.push(`- Legally attested on ${signDate}`);
  }
  
  // Download link if available
  if (downloadUrl) {
    return `${parts.join(' ')} [Download: ${downloadUrl}]`;
  }
  
  return parts.join(' ');
}

/**
 * Inject evidence references into document text
 * Replaces placeholders like {{Evidence: Title}} with formatted evidence references
 */
export function injectEvidenceReferences(
  documentText: string,
  evidenceList: ComplianceEvidence[],
  downloadUrls: Record<string, string> = {}
): string {
  let processed = documentText;
  
  // Pattern to match evidence placeholders: {{Evidence: Title}} or {{Evidence: SRA Report}}
  const evidencePattern = /\{\{Evidence:\s*([^}]+)\}\}/g;
  
  const matches = Array.from(documentText.matchAll(evidencePattern));
  
  for (const match of matches) {
    const placeholder = match[0]; // Full placeholder: {{Evidence: Title}}
    const evidenceTitle = match[1].trim(); // Title to search for
    
    // Find matching evidence
    const matchingEvidence = evidenceList.find(
      ev => ev.title.toLowerCase() === evidenceTitle.toLowerCase() ||
            ev.file_name?.toLowerCase() === evidenceTitle.toLowerCase()
    );
    
    if (matchingEvidence) {
      const downloadUrl = downloadUrls[matchingEvidence.id] || '';
      const reference = formatEvidenceReference(matchingEvidence, downloadUrl);
      
      // Replace placeholder with formatted reference
      processed = processed.replace(placeholder, reference);
    } else {
      // If no match found, replace with placeholder indicating missing evidence
      processed = processed.replace(
        placeholder,
        `[Evidence Required: ${evidenceTitle} - Not found in Evidence Center]`
      );
    }
  }
  
  return processed;
}

/**
 * Map evidence type to human-readable evidence category
 */
function mapEvidenceTypeToCategory(evidenceType: string): string {
  const typeMap: Record<string, string> = {
    'policy_procedure': 'Officer Designation',
    'sra_report': 'Security Risk Analysis',
    'incident_response_plan': 'Incident Response Plan',
    'access_control_policy': 'Access Control Policy',
    'training_logs': 'Training Documentation',
    'business_associate_agreement': 'Business Associate Agreement',
    'audit_log': 'Audit Log',
    'encryption_configuration': 'Encryption Configuration',
    'encryption_configuration_proof': 'Encryption Verification',
    'backup_recovery_tests': 'Backup & Recovery Test',
    'mfa_configuration': 'Multi-Factor Authentication',
    'device_control_inventory': 'Device Inventory',
    'employee_termination_checklist': 'Workforce Termination',
    'breach_log': 'Breach Notification Log',
    'vulnerability_scan_reports': 'Vulnerability Scan',
    'penetration_test_report': 'Penetration Test',
    'vendor_soc2_report': 'Vendor SOC 2 Report',
    'system_settings_screenshot': 'System Configuration',
    'other': 'Supporting Documentation',
  };
  return typeMap[evidenceType] || 'Supporting Documentation';
}

/**
 * Map evidence type to associated HIPAA control
 */
function mapEvidenceTypeToControl(evidenceType: string, title: string): string {
  // Try to determine control from title first
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('privacy officer')) {
    return 'Administrative Safeguards §164.530(a)(1)';
  }
  if (titleLower.includes('security officer')) {
    return 'Administrative Safeguards §164.308(a)(2)';
  }
  if (titleLower.includes('training') || titleLower.includes('awareness')) {
    return 'Administrative Safeguards §164.308(a)(5)';
  }
  if (titleLower.includes('risk') || titleLower.includes('sra')) {
    return 'Administrative Safeguards §164.308(a)(1)';
  }
  if (titleLower.includes('incident') || titleLower.includes('breach')) {
    return 'Administrative Safeguards §164.308(a)(6)';
  }
  if (titleLower.includes('business associate') || titleLower.includes('baa')) {
    return 'Administrative Safeguards §164.308(b)';
  }
  if (titleLower.includes('encryption')) {
    return 'Technical Safeguards §164.312(a)(2)(iv)';
  }
  if (titleLower.includes('access control') || titleLower.includes('rbac')) {
    return 'Technical Safeguards §164.312(a)(1)';
  }
  if (titleLower.includes('audit') || titleLower.includes('log')) {
    return 'Technical Safeguards §164.312(b)';
  }
  if (titleLower.includes('backup')) {
    return 'Technical Safeguards §164.308(a)(7)(ii)(A)';
  }
  if (titleLower.includes('physical') || titleLower.includes('facility')) {
    return 'Physical Safeguards §164.310';
  }
  
  // Fallback to evidence type mapping
  const typeMap: Record<string, string> = {
    'sra_report': 'Administrative Safeguards §164.308(a)(1)',
    'incident_response_plan': 'Administrative Safeguards §164.308(a)(6)',
    'training_logs': 'Administrative Safeguards §164.308(a)(5)',
    'business_associate_agreement': 'Administrative Safeguards §164.308(b)',
    'encryption_configuration': 'Technical Safeguards §164.312(a)(2)(iv)',
    'audit_log': 'Technical Safeguards §164.312(b)',
    'mfa_configuration': 'Technical Safeguards §164.312(a)(1)',
    'backup_recovery_tests': 'Technical Safeguards §164.308(a)(7)(ii)(A)',
  };
  
  return typeMap[evidenceType] || 'Administrative Safeguards §164.308';
}

/**
 * Generate evidence ID in professional format
 */
function generateEvidenceId(evidence: ComplianceEvidence, index: number): string {
  const titleLower = evidence.title.toLowerCase();
  
  // Generate prefix based on evidence type
  let prefix = 'EV';
  
  if (titleLower.includes('privacy officer')) prefix = 'EV-PO';
  else if (titleLower.includes('security officer')) prefix = 'EV-SO';
  else if (titleLower.includes('training')) prefix = 'EV-TR';
  else if (titleLower.includes('risk') || titleLower.includes('sra')) prefix = 'EV-RA';
  else if (titleLower.includes('incident') || titleLower.includes('breach')) prefix = 'EV-IR';
  else if (titleLower.includes('business associate') || titleLower.includes('baa')) prefix = 'EV-BA';
  else if (titleLower.includes('encryption')) prefix = 'EV-EN';
  else if (titleLower.includes('access')) prefix = 'EV-AC';
  else if (titleLower.includes('audit') || titleLower.includes('log')) prefix = 'EV-AU';
  else if (titleLower.includes('backup')) prefix = 'EV-BK';
  else if (titleLower.includes('physical')) prefix = 'EV-PH';
  else if (titleLower.includes('device')) prefix = 'EV-DV';
  else if (titleLower.includes('vulnerability')) prefix = 'EV-VS';
  else if (titleLower.includes('penetration')) prefix = 'EV-PT';
  else if (titleLower.includes('termination')) prefix = 'EV-TM';
  
  // Add sequential number (3 digits)
  const num = String(index + 1).padStart(3, '0');
  return `${prefix}-${num}`;
}

/**
 * Generate professional evidence table for a specific document
 * Formats evidence as a structured table for audit compliance
 */
export function generateEvidenceListForDocument(
  evidenceList: ComplianceEvidence[],
  downloadUrls: Record<string, string> = {}
): string {
  if (evidenceList.length === 0) {
    return `No evidence records currently on file for this policy.

Evidence records can be created and linked to this policy through the HIPAA Hub Evidence Center. All evidence is retained for a minimum of six (6) years in accordance with 45 CFR §164.316(b).`;
  }
  
  // Generate table header
  const lines: string[] = [];
  lines.push('10. Evidence Records and Supporting Documentation');
  lines.push('');
  lines.push('The following evidence records support the implementation, enforcement, and ongoing maintenance of this HIPAA Security & Privacy Master Policy.');
  lines.push('');
  lines.push('All referenced evidence is securely maintained within the HIPAA Hub Evidence Center and is retained for a minimum of six (6) years in accordance with 45 CFR §164.316(b).');
  lines.push('');
  
  // Generate table rows with proper formatting
  evidenceList.forEach((evidence, index) => {
    const evidenceId = generateEvidenceId(evidence, index);
    const evidenceType = mapEvidenceTypeToCategory(evidence.evidence_type);
    const description = evidence.title;
    const associatedControl = mapEvidenceTypeToControl(evidence.evidence_type, evidence.title);
    const uploadDate = new Date(evidence.upload_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    // Determine status
    let status = 'Verified';
    if (evidence.status === 'REQUIRES_REVIEW') {
      status = 'Pending Review';
    } else if (evidence.status === 'EXPIRED') {
      status = 'Expired';
    } else if (evidence.status === 'ARCHIVED') {
      status = 'Archived';
    } else if (evidence.attestation_signed) {
      status = 'Verified';
    }
    
    // Format each evidence record as a structured block
    lines.push(`Evidence Record ${index + 1}:`);
    lines.push(`  • Evidence ID: ${evidenceId}`);
    lines.push(`  • Evidence Type: ${evidenceType}`);
    lines.push(`  • Description: ${description}`);
    lines.push(`  • Associated Control: ${associatedControl}`);
    lines.push(`  • Date Uploaded: ${uploadDate}`);
    lines.push(`  • Status: ${status}`);
    lines.push('');
  });
  
  lines.push('');
  lines.push('All evidence records are version-controlled, access-restricted, and subject to periodic review. Underlying files (e.g., signed PDFs, attestations, screenshots, system logs) are available for inspection by authorized personnel, external auditors, insurers, or regulatory authorities upon request.');
  lines.push('');
  lines.push('A complete evidence inventory, including file hashes, access logs, and historical versions, is maintained within the HIPAA Hub platform and can be exported as part of an audit defense package.');
  
  return lines.join('\n');
}

/**
 * Generate evidence statement for document sections
 * Creates a statement that references evidence supporting a control
 */
export function generateEvidenceStatement(
  evidenceList: ComplianceEvidence[],
  controlDescription: string
): string {
  if (evidenceList.length === 0) {
    return `${controlDescription} Evidence documentation is maintained in the Evidence Center.`;
  }
  
  const evidenceTitles = evidenceList.map(ev => ev.title).join(', ');
  
  if (evidenceList.some(ev => ev.attestation_signed)) {
    return `${controlDescription} This control is supported by legally binding attested evidence: ${evidenceTitles}. Evidence is maintained in the Evidence Center and available for audit review.`;
  }
  
  return `${controlDescription} This control is supported by the following evidence on file: ${evidenceTitles}. Evidence is maintained in the Evidence Center and available for audit review.`;
}

/**
 * Generate attestation statement
 * Creates a statement about attested evidence
 */
export function generateAttestationStatement(
  evidence: ComplianceEvidence
): string {
  if (!evidence.attestation_signed || !evidence.attestation_signed_at) {
    return '';
  }
  
  const signDate = new Date(evidence.attestation_signed_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return `This control is supported by legally binding attested evidence recorded on ${signDate}. The evidence has been reviewed and attested to by authorized personnel.`;
}

// ================================
// ENHANCED SECTION-BASED INJECTION
// ================================

/**
 * Generate download URL for evidence file (Supabase Storage)
 */
export function generateEvidenceDownloadUrl(
  organizationId: string,
  evidenceId: string,
  fileName: string
): string {
  // Generate Supabase Storage URL
  // Format: https://<project>.supabase.co/storage/v1/object/public/evidence/<org_id>/<evidence_id>/<filename>
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  return `${supabaseUrl}/storage/v1/object/public/evidence/${organizationId}/${evidenceId}/${fileName}`;
}

/**
 * Format evidence link for injection
 * Creates clickable reference with optional date
 */
export function formatEvidenceLinkForInjection(
  evidence: EvidenceWithDownloadUrl,
  injectionPoint: EvidenceInjectionPoint
): string {
  let text = injectionPoint.template_text;

  // Replace evidence link placeholder
  if (evidence.download_url) {
    text = text.replace('{{evidence_link}}', `[View Document](${evidence.download_url})`);
  } else {
    text = text.replace('{{evidence_link}}', '[Evidence on file]');
  }

  // Replace date placeholders if present
  if (injectionPoint.date_field && evidence.upload_date) {
    const uploadDate = new Date(evidence.upload_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    // Replace all date field placeholders (e.g., {{Last_SRA_Date}}, {{Latest_Log_Date}})
    const dateFieldPattern = new RegExp(`\\{\\{${injectionPoint.date_field}\\}\\}`, 'g');
    text = text.replace(dateFieldPattern, uploadDate);
  }

  return text;
}

/**
 * Inject evidence into policy document based on comprehensive mapping
 * 
 * This is the main function that processes a policy document and injects all evidence
 * references according to the policy-evidence-mapping.ts configuration.
 */
export function injectEvidenceIntoPolicy(
  policyId: string,
  documentText: string,
  availableEvidence: EvidenceWithDownloadUrl[],
  organizationId: string
): string {
  const policyMapping = getEvidenceInjectionPointsForPolicy(policyId);
  if (!policyMapping) {
    console.warn(`No evidence mapping found for policy: ${policyId}`);
    return documentText;
  }

  let processedText = documentText;
  let injectionsApplied = 0;

  // Process each section in order
  for (const section of policyMapping.sections) {
    // Process high-priority injections first
    const highPriorityInjections = section.evidence_injections
      .filter(inj => inj.priority === 'high')
      .sort((a, b) => a.position.localeCompare(b.position));

    const mediumPriorityInjections = section.evidence_injections
      .filter(inj => inj.priority === 'medium')
      .sort((a, b) => a.position.localeCompare(b.position));

    const lowPriorityInjections = section.evidence_injections
      .filter(inj => inj.priority === 'low')
      .sort((a, b) => a.position.localeCompare(b.position));

    // Apply injections in priority order
    const allInjections = [
      ...highPriorityInjections,
      ...mediumPriorityInjections,
      ...lowPriorityInjections
    ];

    for (const injectionPoint of allInjections) {
      // Find matching evidence
      const matchingEvidence = availableEvidence.find(
        (ev: any) =>
          (ev as any).field_id === injectionPoint.evidence_id ||
          ev.title.toLowerCase() === injectionPoint.evidence_name.toLowerCase()
      );

      if (matchingEvidence) {
        // Generate injection text
        const injectionText = formatEvidenceLinkForInjection(matchingEvidence, injectionPoint);

        // Create section marker for injection
        const sectionMarker = `<!-- SECTION:${section.section_id} -->`;
        const positionMarker = `<!-- ${injectionPoint.position} -->`;

        // Try to inject at specific position
        if (processedText.includes(sectionMarker)) {
          // Section markers exist - inject at precise position
          processedText = injectAtMarkedPosition(
            processedText,
            sectionMarker,
            positionMarker,
            injectionText
          );
          injectionsApplied++;
        } else {
          // Fallback: inject based on section title
          processedText = injectNearSectionTitle(
            processedText,
            section.section_title,
            injectionText
          );
          injectionsApplied++;
        }
      } else {
        // Evidence not found - inject placeholder if high priority
        if (injectionPoint.priority === 'high') {
          const placeholderText = `[Evidence Required: ${injectionPoint.evidence_name} - Not found in Evidence Center]`;
          processedText = injectNearSectionTitle(
            processedText,
            section.section_title,
            placeholderText
          );
        }
      }
    }
  }

  console.log(`Evidence injection completed for ${policyId}: ${injectionsApplied} injections applied`);
  return processedText;
}

/**
 * Inject text at a marked position (using HTML-style comments)
 */
function injectAtMarkedPosition(
  documentText: string,
  sectionMarker: string,
  positionMarker: string,
  injectionText: string
): string {
  // Find section
  const sectionIndex = documentText.indexOf(sectionMarker);
  if (sectionIndex === -1) return documentText;

  // Find position marker within section
  const positionIndex = documentText.indexOf(positionMarker, sectionIndex);
  if (positionIndex === -1) return documentText;

  // Insert injection text after position marker
  const insertionPoint = positionIndex + positionMarker.length;
  return (
    documentText.substring(0, insertionPoint) +
    '\n\n' +
    injectionText +
    documentText.substring(insertionPoint)
  );
}

/**
 * Inject text near section title (fallback method)
 */
function injectNearSectionTitle(
  documentText: string,
  sectionTitle: string,
  injectionText: string
): string {
  // Try to find section title (case-insensitive)
  const titlePattern = new RegExp(
    `(#{1,3}\\s*${sectionTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
    'i'
  );
  
  const match = documentText.match(titlePattern);
  if (!match) {
    // Section not found - append at end of document
    return documentText + '\n\n' + injectionText;
  }

  // Find end of the title line
  const titleIndex = match.index!;
  const titleEndIndex = documentText.indexOf('\n', titleIndex);
  
  if (titleEndIndex === -1) {
    // No newline after title - append at end
    return documentText + '\n\n' + injectionText;
  }

  // Insert after title
  return (
    documentText.substring(0, titleEndIndex + 1) +
    '\n' +
    injectionText +
    '\n' +
    documentText.substring(titleEndIndex + 1)
  );
}

/**
 * Generate evidence summary section for policy
 * Creates a comprehensive "Evidence on File" section listing all evidence
 */
export function generateEvidenceSummarySection(
  policyId: string,
  availableEvidence: EvidenceWithDownloadUrl[]
): string {
  const policyMapping = getEvidenceInjectionPointsForPolicy(policyId);
  if (!policyMapping) return '';

  const lines: string[] = [];
  lines.push('## Evidence on File for This Policy');
  lines.push('');
  lines.push('The following evidence documents support this policy and are maintained in the HIPAA Hub Evidence Center:');
  lines.push('');

  // Group evidence by priority
  const highPriority: string[] = [];
  const mediumPriority: string[] = [];
  const lowPriority: string[] = [];

  for (const section of policyMapping.sections) {
    for (const injectionPoint of section.evidence_injections) {
      const evidence = availableEvidence.find(
        ev => 
          (ev as any).field_id === injectionPoint.evidence_id ||
          ev.title.toLowerCase() === injectionPoint.evidence_name.toLowerCase()
      );

      if (evidence) {
        const uploadDate = new Date(evidence.upload_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });

        const evidenceLine = evidence.download_url
          ? `- **${evidence.title}** - Uploaded ${uploadDate} [View Document](${evidence.download_url})`
          : `- **${evidence.title}** - Uploaded ${uploadDate}`;

        if (injectionPoint.priority === 'high') {
          highPriority.push(evidenceLine);
        } else if (injectionPoint.priority === 'medium') {
          mediumPriority.push(evidenceLine);
        } else {
          lowPriority.push(evidenceLine);
        }
      }
    }
  }

  // Remove duplicates
  const uniqueHigh = Array.from(new Set(highPriority));
  const uniqueMedium = Array.from(new Set(mediumPriority));
  const uniqueLow = Array.from(new Set(lowPriority));

  if (uniqueHigh.length > 0) {
    lines.push('### Critical Evidence (High Priority)');
    lines.push('');
    lines.push(...uniqueHigh);
    lines.push('');
  }

  if (uniqueMedium.length > 0) {
    lines.push('### Supporting Evidence (Medium Priority)');
    lines.push('');
    lines.push(...uniqueMedium);
    lines.push('');
  }

  if (uniqueLow.length > 0) {
    lines.push('### Additional Evidence (Low Priority)');
    lines.push('');
    lines.push(...uniqueLow);
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Validate evidence completeness for policy generation
 * Returns validation result with missing evidence details
 */
export function validateEvidenceForPolicy(
  policyId: string,
  availableEvidence: EvidenceWithDownloadUrl[]
): {
  canGenerate: boolean;
  missingHighPriority: string[];
  missingMediumPriority: string[];
  missingLowPriority: string[];
  coveragePercent: number;
} {
  const policyMapping = getEvidenceInjectionPointsForPolicy(policyId);
  if (!policyMapping) {
    return {
      canGenerate: false,
      missingHighPriority: [],
      missingMediumPriority: [],
      missingLowPriority: [],
      coveragePercent: 0
    };
  }

  const missingHighPriority: string[] = [];
  const missingMediumPriority: string[] = [];
  const missingLowPriority: string[] = [];
  let totalRequired = 0;
  let totalFound = 0;

  for (const section of policyMapping.sections) {
    for (const injectionPoint of section.evidence_injections) {
      totalRequired++;

      const evidence = availableEvidence.find(
        ev => 
          (ev as any).field_id === injectionPoint.evidence_id ||
          ev.title.toLowerCase() === injectionPoint.evidence_name.toLowerCase()
      );

      if (evidence) {
        totalFound++;
      } else {
        if (injectionPoint.priority === 'high') {
          missingHighPriority.push(injectionPoint.evidence_name);
        } else if (injectionPoint.priority === 'medium') {
          missingMediumPriority.push(injectionPoint.evidence_name);
        } else {
          missingLowPriority.push(injectionPoint.evidence_name);
        }
      }
    }
  }

  const coveragePercent = totalRequired === 0 ? 100 : Math.round((totalFound / totalRequired) * 100);

  // Can generate if at least all high-priority evidence is present
  const canGenerate = missingHighPriority.length === 0;

  return {
    canGenerate,
    missingHighPriority: Array.from(new Set(missingHighPriority)),
    missingMediumPriority: Array.from(new Set(missingMediumPriority)),
    missingLowPriority: Array.from(new Set(missingLowPriority)),
    coveragePercent
  };
}
