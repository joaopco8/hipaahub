/**
 * Audit Readiness Assessment
 * Determines if an organization would survive an OCR audit today
 */

export type AuditReadinessLevel = 'audit-ready' | 'partially-defensible' | 'high-risk';

export interface AuditReadinessResult {
  level: AuditReadinessLevel;
  score: number;
  topRisks: AuditRisk[];
  criticalGaps: string[];
  strengths: string[];
  nextSteps: string[];
}

export interface AuditRisk {
  id: string;
  title: string;
  description: string;
  impact: 'critical' | 'high' | 'medium';
  hipaa_citation: string;
  ocr_perspective: string;
  remediation: string;
}

/**
 * Calculate Audit Readiness based on compliance state
 */
export function calculateAuditReadiness(params: {
  complianceScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  criticalActionItems: number;
  requiredEvidenceMissing: number;
  trainingCompletionRate: number;
  hasSRA: boolean;
  hasSecurityOfficer: boolean;
  hasPrivacyOfficer: boolean;
  hasBAAs: boolean;
  lastSRADate?: Date | null;
}): AuditReadinessResult {
  const topRisks: AuditRisk[] = [];
  const criticalGaps: string[] = [];
  const strengths: string[] = [];
  const nextSteps: string[] = [];

  let readinessScore = params.complianceScore;

  // CRITICAL: SRA (most common OCR failure)
  if (!params.hasSRA || !params.lastSRADate) {
    topRisks.push({
      id: 'no-sra',
      title: 'No Security Risk Analysis (SRA) on File',
      description: 'This is the #1 reason clinics fail OCR audits. HIPAA requires a comprehensive, documented SRA.',
      impact: 'critical',
      hipaa_citation: '§164.308(a)(1)(ii)(A)',
      ocr_perspective: 'OCR will immediately request your SRA. If you don\'t have one, you\'re in violation from day one of the audit.',
      remediation: 'Complete and document a comprehensive Security Risk Analysis immediately'
    });
    criticalGaps.push('No documented Security Risk Analysis');
    readinessScore -= 25;
  } else {
    const monthsSinceSRA = params.lastSRADate 
      ? Math.floor((Date.now() - new Date(params.lastSRADate).getTime()) / (1000 * 60 * 60 * 24 * 30))
      : 999;
    
    if (monthsSinceSRA > 12) {
      topRisks.push({
        id: 'outdated-sra',
        title: 'Security Risk Analysis is Outdated',
        description: `Your SRA is ${monthsSinceSRA} months old. OCR expects annual updates.`,
        impact: 'high',
        hipaa_citation: '§164.308(a)(1)(ii)(A)',
        ocr_perspective: 'Outdated SRAs suggest you\'re not actively managing security risks.',
        remediation: 'Update your SRA annually or when significant changes occur'
      });
      criticalGaps.push(`SRA is ${monthsSinceSRA} months old (should be < 12 months)`);
      readinessScore -= 15;
    } else {
      strengths.push('Current Security Risk Analysis on file');
    }
  }

  // CRITICAL: Designated Officers
  if (!params.hasSecurityOfficer || !params.hasPrivacyOfficer) {
    topRisks.push({
      id: 'no-officers',
      title: 'Missing Designated Security/Privacy Officer',
      description: 'HIPAA requires you to formally designate a Security Officer and Privacy Officer in writing.',
      impact: 'critical',
      hipaa_citation: '§164.308(a)(2) and §164.530(a)(1)',
      ocr_perspective: 'OCR always asks "Who is your Security Officer?" If you don\'t have one formally designated, you\'re non-compliant.',
      remediation: 'Formally designate Security and Privacy Officers with written appointment letters'
    });
    criticalGaps.push('No formally designated Security/Privacy Officers');
    readinessScore -= 20;
  } else {
    strengths.push('Security and Privacy Officers formally designated');
  }

  // CRITICAL: Business Associate Agreements
  if (!params.hasBAAs) {
    topRisks.push({
      id: 'no-baas',
      title: 'Missing Business Associate Agreements (BAAs)',
      description: 'Every vendor that touches PHI must have a signed BAA. This is non-negotiable.',
      impact: 'critical',
      hipaa_citation: '§164.308(b)(1)',
      ocr_perspective: 'OCR will request all your BAAs. Missing BAAs with EHR vendors, billing companies, or cloud providers is an automatic violation.',
      remediation: 'Obtain signed BAAs from ALL vendors with PHI access (EHR, billing, IT, cloud)'
    });
    criticalGaps.push('Missing Business Associate Agreements with vendors');
    readinessScore -= 20;
  } else {
    strengths.push('Business Associate Agreements in place');
  }

  // HIGH: Training
  if (params.trainingCompletionRate < 100) {
    topRisks.push({
      id: 'incomplete-training',
      title: 'Incomplete Workforce Training',
      description: `Only ${params.trainingCompletionRate.toFixed(0)}% of workforce has completed HIPAA training.`,
      impact: 'high',
      hipaa_citation: '§164.530(b)',
      ocr_perspective: 'OCR expects 100% training completion with documentation. Missing training records are a red flag.',
      remediation: 'Ensure all workforce members complete annual HIPAA training with documented proof'
    });
    criticalGaps.push(`Training completion at ${params.trainingCompletionRate.toFixed(0)}% (should be 100%)`);
    readinessScore -= 10;
  } else {
    strengths.push('100% workforce training completion');
  }

  // Required Evidence Missing
  if (params.requiredEvidenceMissing > 5) {
    topRisks.push({
      id: 'missing-evidence',
      title: `${params.requiredEvidenceMissing} Required Evidence Items Missing`,
      description: 'OCR will request proof of your compliance measures. Missing evidence weakens your defense.',
      impact: 'high',
      hipaa_citation: 'Multiple HIPAA provisions',
      ocr_perspective: 'Claims of compliance without supporting evidence are not credible in an audit.',
      remediation: 'Upload all required evidence to strengthen audit defense'
    });
    readinessScore -= params.requiredEvidenceMissing * 2;
  }

  // Determine readiness level
  let level: AuditReadinessLevel;
  if (readinessScore >= 85 && criticalGaps.length === 0) {
    level = 'audit-ready';
  } else if (readinessScore >= 60 && criticalGaps.length <= 2) {
    level = 'partially-defensible';
  } else {
    level = 'high-risk';
  }

  // Generate next steps
  if (criticalGaps.length > 0) {
    nextSteps.push('Address all critical gaps immediately - these are automatic failures');
  }
  if (params.requiredEvidenceMissing > 0) {
    nextSteps.push('Upload missing required evidence to Evidence Vault');
  }
  if (params.trainingCompletionRate < 100) {
    nextSteps.push('Complete training for all workforce members');
  }
  if (nextSteps.length === 0) {
    nextSteps.push('Maintain current compliance status with regular reviews');
    nextSteps.push('Keep evidence up-to-date (especially logs and training records)');
    nextSteps.push('Review and update SRA annually');
  }

  return {
    level,
    score: Math.max(0, Math.min(100, readinessScore)),
    topRisks: topRisks.slice(0, 3),
    criticalGaps,
    strengths,
    nextSteps
  };
}

/**
 * Get readiness level display info
 */
export function getAuditReadinessDisplay(level: AuditReadinessLevel) {
  switch (level) {
    case 'audit-ready':
      return {
        label: 'Audit Ready',
        description: 'Your organization would likely survive an OCR audit today',
        color: 'green',
        bgClass: 'bg-green-50',
        borderClass: 'border-green-200',
        textClass: 'text-green-700',
        badgeClass: 'bg-green-100 text-green-700 border-green-300'
      };
    case 'partially-defensible':
      return {
        label: 'Partially Defensible',
        description: 'You have some protections but gaps that could result in findings',
        color: 'yellow',
        bgClass: 'bg-yellow-50',
        borderClass: 'border-yellow-200',
        textClass: 'text-yellow-700',
        badgeClass: 'bg-yellow-100 text-yellow-700 border-yellow-300'
      };
    case 'high-risk':
      return {
        label: 'High Risk',
        description: 'Critical gaps exist that would likely result in violations',
        color: 'red',
        bgClass: 'bg-red-50',
        borderClass: 'border-red-200',
        textClass: 'text-red-700',
        badgeClass: 'bg-red-100 text-red-700 border-red-300'
      };
  }
}
