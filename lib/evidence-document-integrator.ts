/**
 * Evidence-Document Integrator
 * 
 * High-level API for integrating evidence injection into policy document generation.
 * Simplifies the process of generating evidence-enriched policy documents.
 */

import { createClient as createSupabaseServerClient } from '@/utils/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  injectEvidenceIntoPolicy,
  generateEvidenceSummarySection,
  validateEvidenceForPolicy,
  generateEvidenceDownloadUrl,
  EvidenceWithDownloadUrl
} from './evidence-injection-engine';
import { getAllEvidenceIdsForPolicy } from './policy-evidence-mapping';
import { EVIDENCE_FIELDS } from './evidence-fields-config';

/**
 * Fetch all evidence for an organization from Supabase
 */
export async function fetchOrganizationEvidence(
  supabase: SupabaseClient,
  organizationId: string
): Promise<EvidenceWithDownloadUrl[]> {
  // Fetch from compliance_evidence table
  const { data: evidenceRecords, error } = await (supabase as any)
    .from('compliance_evidence')
    .select('*')
    .eq('organization_id', organizationId);

  if (error) {
    console.error('Error fetching evidence:', error);
    return [];
  }

  if (!evidenceRecords || evidenceRecords.length === 0) {
    return [];
  }

  // Add download URLs
  const evidenceWithUrls: EvidenceWithDownloadUrl[] = evidenceRecords.map((record: any) => ({
    ...record,
    download_url: record.file_name
      ? generateEvidenceDownloadUrl(organizationId, record.id, record.file_name)
      : undefined
  }));

  return evidenceWithUrls;
}

/**
 * Generate policy document with evidence injection
 * 
 * Main function to generate a complete policy document with all evidence references.
 */
export async function generatePolicyWithEvidence(
  policyId: string,
  policyBaseContent: string,
  organizationId: string,
  options?: {
    includeEvidenceSummary?: boolean;
    validateBeforeGeneration?: boolean;
    requireHighPriorityEvidence?: boolean;
  }
): Promise<{
  success: boolean;
  document?: string;
  validation?: {
    canGenerate: boolean;
    missingHighPriority: string[];
    missingMediumPriority: string[];
    missingLowPriority: string[];
    coveragePercent: number;
  };
  error?: string;
}> {
  try {
    const supabase = createSupabaseServerClient();

    // Fetch available evidence
    const availableEvidence = await fetchOrganizationEvidence(supabase, organizationId);

    // Validate evidence completeness if requested
    if (options?.validateBeforeGeneration) {
      const validation = validateEvidenceForPolicy(policyId, availableEvidence);

      if (options?.requireHighPriorityEvidence && !validation.canGenerate) {
        return {
          success: false,
          validation,
          error: `Cannot generate policy ${policyId}: Missing critical evidence (${validation.missingHighPriority.join(', ')})`
        };
      }
    }

    // Inject evidence into policy document
    let enrichedDocument = injectEvidenceIntoPolicy(
      policyId,
      policyBaseContent,
      availableEvidence,
      organizationId
    );

    // Add evidence summary section if requested
    if (options?.includeEvidenceSummary) {
      const evidenceSummary = generateEvidenceSummarySection(policyId, availableEvidence);
      enrichedDocument += '\n\n---\n\n' + evidenceSummary;
    }

    return {
      success: true,
      document: enrichedDocument,
      validation: validateEvidenceForPolicy(policyId, availableEvidence)
    };
  } catch (error) {
    console.error('Error generating policy with evidence:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Get evidence requirements for a policy
 * Returns what evidence is needed for this policy
 */
export async function getPolicyEvidenceRequirements(
  policyId: string,
  organizationId: string
): Promise<{
  required: Array<{
    evidence_id: string;
    evidence_name: string;
    priority: 'high' | 'medium' | 'low';
    available: boolean;
    description?: string;
  }>;
  summary: {
    total: number;
    high_priority: number;
    medium_priority: number;
    low_priority: number;
    available: number;
    missing: number;
    coverage_percent: number;
  };
}> {
  const supabase = createSupabaseServerClient();

  // Get all evidence IDs for this policy
  const requiredEvidenceIds = getAllEvidenceIdsForPolicy(policyId);

  // Fetch available evidence
  const availableEvidence = await fetchOrganizationEvidence(supabase, organizationId);
  const availableIds = new Set(availableEvidence.map((ev: any) => ev.field_id));

  // Build requirements list
  const required = requiredEvidenceIds.map(evidenceId => {
    const fieldConfig = EVIDENCE_FIELDS.find(field => field.id === evidenceId);
    return {
      evidence_id: evidenceId,
      evidence_name: fieldConfig?.name || evidenceId,
      priority: (fieldConfig?.required ? 'high' : 'medium') as 'high' | 'medium' | 'low',
      available: availableIds.has(evidenceId),
      description: fieldConfig?.description
    };
  });

  // Calculate summary
  const high_priority = required.filter(r => r.priority === 'high').length;
  const medium_priority = required.filter(r => r.priority === 'medium').length;
  const low_priority = required.filter(r => r.priority === 'low').length;
  const available = required.filter(r => r.available).length;
  const missing = required.length - available;
  const coverage_percent = required.length === 0 ? 100 : Math.round((available / required.length) * 100);

  return {
    required,
    summary: {
      total: required.length,
      high_priority,
      medium_priority,
      low_priority,
      available,
      missing,
      coverage_percent
    }
  };
}

/**
 * Batch generate all 9 policies with evidence
 * Generates all HIPAA policies with evidence injection
 */
export async function batchGenerateAllPoliciesWithEvidence(
  organizationId: string,
  policyBaseContents: Record<string, string>, // Map of policyId -> base content
  options?: {
    includeEvidenceSummary?: boolean;
    skipIfMissingHighPriority?: boolean;
  }
): Promise<{
  success: boolean;
  results: Array<{
    policyId: string;
    policyName: string;
    success: boolean;
    document?: string;
    coveragePercent: number;
    missingHighPriority: number;
    error?: string;
  }>;
  summary: {
    total: number;
    generated: number;
    failed: number;
    skipped: number;
  };
}> {
  const policyIds = [
    'MST-001',
    'POL-002',
    'POL-003',
    'POL-004',
    'POL-005',
    'POL-006',
    'POL-007',
    'POL-008',
    'POL-009'
  ];

  const results = [];
  let generated = 0;
  let failed = 0;
  let skipped = 0;

  for (const policyId of policyIds) {
    const baseContent = policyBaseContents[policyId];
    
    if (!baseContent) {
      results.push({
        policyId,
        policyName: policyId,
        success: false,
        coveragePercent: 0,
        missingHighPriority: 0,
        error: 'Base content not provided'
      });
      skipped++;
      continue;
    }

    const result = await generatePolicyWithEvidence(
      policyId,
      baseContent,
      organizationId,
      {
        includeEvidenceSummary: options?.includeEvidenceSummary,
        validateBeforeGeneration: true,
        requireHighPriorityEvidence: options?.skipIfMissingHighPriority
      }
    );

    if (result.success) {
      results.push({
        policyId,
        policyName: policyId,
        success: true,
        document: result.document,
        coveragePercent: result.validation?.coveragePercent || 0,
        missingHighPriority: result.validation?.missingHighPriority.length || 0
      });
      generated++;
    } else if (result.error?.includes('Missing critical evidence')) {
      results.push({
        policyId,
        policyName: policyId,
        success: false,
        coveragePercent: result.validation?.coveragePercent || 0,
        missingHighPriority: result.validation?.missingHighPriority.length || 0,
        error: result.error
      });
      skipped++;
    } else {
      results.push({
        policyId,
        policyName: policyId,
        success: false,
        coveragePercent: 0,
        missingHighPriority: 0,
        error: result.error
      });
      failed++;
    }
  }

  return {
    success: generated > 0,
    results,
    summary: {
      total: policyIds.length,
      generated,
      failed,
      skipped
    }
  };
}

/**
 * Check evidence status for all policies
 * Returns a comprehensive status report
 */
export async function checkAllPoliciesEvidenceStatus(
  organizationId: string
): Promise<{
  overall_status: 'ready' | 'partial' | 'not_ready';
  overall_coverage_percent: number;
  policies: Array<{
    policyId: string;
    status: 'ready' | 'partial' | 'not_ready';
    coveragePercent: number;
    missingHighPriority: string[];
    missingMediumPriority: string[];
    canGenerate: boolean;
  }>;
}> {
  const supabase = createSupabaseServerClient();
  const availableEvidence = await fetchOrganizationEvidence(supabase, organizationId);

  const policyIds = [
    'MST-001',
    'POL-002',
    'POL-003',
    'POL-004',
    'POL-005',
    'POL-006',
    'POL-007',
    'POL-008',
    'POL-009'
  ];

  const policies = policyIds.map(policyId => {
    const validation = validateEvidenceForPolicy(policyId, availableEvidence);
    
    let status: 'ready' | 'partial' | 'not_ready';
    if (validation.canGenerate && validation.coveragePercent === 100) {
      status = 'ready';
    } else if (validation.canGenerate) {
      status = 'partial';
    } else {
      status = 'not_ready';
    }

    return {
      policyId,
      status,
      coveragePercent: validation.coveragePercent,
      missingHighPriority: validation.missingHighPriority,
      missingMediumPriority: validation.missingMediumPriority,
      canGenerate: validation.canGenerate
    };
  });

  const totalCoverage = policies.reduce((sum, p) => sum + p.coveragePercent, 0) / policies.length;
  const allReady = policies.every(p => p.status === 'ready');
  const someReady = policies.some(p => p.canGenerate);

  const overall_status: 'ready' | 'partial' | 'not_ready' = 
    allReady ? 'ready' : someReady ? 'partial' : 'not_ready';

  return {
    overall_status,
    overall_coverage_percent: Math.round(totalCoverage),
    policies
  };
}
