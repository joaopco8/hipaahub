import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { getOrganizationData, getComplianceState } from '@/app/actions/organization';
import { getEvidenceByDocumentId } from '@/app/actions/compliance-evidence';
import { processDocumentTemplate } from '@/lib/document-generator';
import { validateOrganizationData } from '@/lib/validate-organization-data';
import { formatDocumentForA4 } from '@/lib/document-formatter';
import { generateEvidenceListForDocument } from '@/lib/evidence-injection-engine';
import { HIPAA_SECURITY_PRIVACY_MASTER_POLICY_TEMPLATE } from '@/lib/document-templates/hipaa-security-privacy-master-policy';
import { SECURITY_RISK_ANALYSIS_POLICY_TEMPLATE } from '@/lib/document-templates/security-risk-analysis-policy';
import { RISK_MANAGEMENT_PLAN_POLICY_TEMPLATE } from '@/lib/document-templates/risk-management-plan-policy';
import { ACCESS_CONTROL_POLICY_TEMPLATE } from '@/lib/document-templates/access-control-policy';
import { WORKFORCE_TRAINING_POLICY_TEMPLATE } from '@/lib/document-templates/workforce-training-policy';
import { SANCTION_POLICY_TEMPLATE } from '@/lib/document-templates/sanction-policy';
import { INCIDENT_RESPONSE_BREACH_NOTIFICATION_POLICY_TEMPLATE } from '@/lib/document-templates/incident-response-breach-notification-policy';
import { BUSINESS_ASSOCIATE_MANAGEMENT_POLICY_TEMPLATE } from '@/lib/document-templates/business-associate-management-policy';
import { AUDIT_LOGS_DOCUMENTATION_RETENTION_POLICY_TEMPLATE } from '@/lib/document-templates/audit-logs-documentation-retention-policy';
import { DocumentViewer } from '@/components/documents/document-viewer';
import { DocumentActions } from '@/components/documents/document-actions';
import { OrganizationValidationError } from '@/components/documents/organization-validation-error';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const DOCUMENT_MAP: Record<string, { name: string; template: string; policyId: string }> = {
  '1': {
    name: 'HIPAA Security & Privacy Master Policy',
    template: HIPAA_SECURITY_PRIVACY_MASTER_POLICY_TEMPLATE,
    policyId: 'MST-001',
  },
  '2': {
    name: 'Security Risk Analysis (SRA) Policy',
    template: SECURITY_RISK_ANALYSIS_POLICY_TEMPLATE,
    policyId: 'POL-002',
  },
  '3': {
    name: 'Risk Management Plan',
    template: RISK_MANAGEMENT_PLAN_POLICY_TEMPLATE,
    policyId: 'POL-003',
  },
  '4': {
    name: 'Access Control Policy',
    template: ACCESS_CONTROL_POLICY_TEMPLATE,
    policyId: 'POL-004',
  },
  '5': {
    name: 'Workforce Training Policy',
    template: WORKFORCE_TRAINING_POLICY_TEMPLATE,
    policyId: 'POL-005',
  },
  '6': {
    name: 'Sanction Policy',
    template: SANCTION_POLICY_TEMPLATE,
    policyId: 'POL-006',
  },
  '7': {
    name: 'Incident Response & Breach Notification',
    template: INCIDENT_RESPONSE_BREACH_NOTIFICATION_POLICY_TEMPLATE,
    policyId: 'POL-007',
  },
  '8': {
    name: 'Business Associate Management',
    template: BUSINESS_ASSOCIATE_MANAGEMENT_POLICY_TEMPLATE,
    policyId: 'POL-008',
  },
  '9': {
    name: 'Audit Logs & Documentation Retention',
    template: AUDIT_LOGS_DOCUMENTATION_RETENTION_POLICY_TEMPLATE,
    policyId: 'POL-009',
  },
};

export default async function DocumentPreviewPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin');
  }

  // Get organization data
  const organization = await getOrganizationData();

  if (!organization) {
    return redirect('/dashboard/organization');
  }

  // Validate organization data before generating document
  // Normalize nullable DB fields into document-generator compatible shape
  const organizationForValidation = {
    ...organization,
    legal_name: organization.legal_name ?? organization.name,
  } as any;

  const validation = validateOrganizationData(organizationForValidation);

  // Get document template
  const document = DOCUMENT_MAP[params.id];

  if (!document) {
    return (
      <div className="flex min-h-screen w-full flex-col gap-6 max-w-[1600px] mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Document Not Found</h1>
          <p className="text-zinc-600 mb-6">The requested document template could not be found.</p>
          <Link href="/dashboard/policies">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Policies
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Show validation error if data is incomplete
  if (!validation.isValid) {
    return (
      <OrganizationValidationError 
        missingFields={validation.missingFields}
        errors={validation.errors}
      />
    );
  }

  // Get compliance state from risk assessment
  const complianceState = await getComplianceState();

  // Load evidence from Evidence Center for this document
  console.log('📦 Loading evidence from Evidence Center for document:', document.policyId);
  let evidenceFromCenter = await getEvidenceByDocumentId(document.policyId);
  console.log('📊 Evidence found:', {
    count: evidenceFromCenter?.length || 0,
    evidence: evidenceFromCenter?.map(e => ({
      id: e.id,
      title: e.title,
      related_document_ids: e.related_document_ids,
      file_name: e.file_name,
      status: e.status
    })) || []
  });

  // Generate signed URLs for evidence files
  const evidenceDownloadUrls: Record<string, string> = {};
  if (evidenceFromCenter && evidenceFromCenter.length > 0) {
    console.log(`✅ Found ${evidenceFromCenter.length} evidence items from Evidence Center`);
    
    for (const evidence of evidenceFromCenter) {
      if (evidence.file_url) {
        try {
          const { data: urlData, error: urlError } = await supabase.storage
            .from(evidence.storage_bucket || 'evidence')
            .createSignedUrl(evidence.file_url, 3600); // 1 hour expiry
          
          if (!urlError && urlData?.signedUrl) {
            evidenceDownloadUrls[evidence.id] = urlData.signedUrl;
            console.log(`✅ Generated signed URL for evidence ${evidence.id}: ${evidence.title}`);
          } else {
            console.warn(`⚠️ Failed to generate signed URL for evidence ${evidence.id}:`, urlError);
          }
        } catch (error) {
          console.warn('Failed to generate signed URL for evidence', evidence.id, error);
        }
      }
    }
  } else {
    console.log('ℹ️ No evidence found in Evidence Center for this document');
  }

  // Process template with organization data and compliance state
  // Create a modified organization object with the policy ID for this document
  const organizationWithPolicyId = {
    ...organizationForValidation,
    current_policy_id: document.policyId,
  };
  let processedContent = processDocumentTemplate(
    document.template, 
    organizationWithPolicyId,
    complianceState || undefined
  );

  // Generate evidence list for AUDIT_EVIDENCE_LIST placeholder
  const evidenceList = generateEvidenceListForDocument(evidenceFromCenter || [], evidenceDownloadUrls);
  console.log('📋 Generated evidence list:', {
    evidenceCount: evidenceFromCenter?.length || 0,
    listLength: evidenceList.length,
    preview: evidenceList.substring(0, 200)
  });

  // AGGRESSIVE CLEANUP - Remove ALL remaining placeholders
  // Known placeholders that should have defaults if not filled
  const knownPlaceholders: Record<string, string> = {
    'SECURITY_POSTURE': 'The organization has designated a Security Officer responsible for implementing and maintaining security policies and procedures.',
    'SRA_STATEMENT': 'The organization conducts Security Risk Analyses in accordance with HIPAA requirements. Specific details are documented in the Security Risk Analysis Policy (POL-002).',
    'RISK_MGMT_ACTIONS': 'Risk management actions are documented in the Risk Management Plan Policy (POL-003).',
    'AUDIT_EVIDENCE_LIST': evidenceList, // Use real evidence list instead of default
    'INCIDENT_DEFENSIBILITY': 'Incident response procedures are documented in the Incident Response & Breach Notification Policy (POL-007).',
  };
  
  // Replace known placeholders with defaults (or real evidence list)
  for (const [key, value] of Object.entries(knownPlaceholders)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    processedContent = processedContent.replace(regex, value);
  }
  
  // Remove ANY remaining {{...}} placeholders (safety net)
  processedContent = processedContent.replace(/\{\{[^}]+\}\}/g, '');
  
  // Clean up resulting whitespace issues
  processedContent = processedContent.replace(/\n\s*\n\s*\n+/g, '\n\n');

  return (
    <div className="flex w-full flex-col gap-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <Link href="/dashboard/policies">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              {document.name}
            </h1>
            <p className="text-sm text-zinc-600 mt-1">
              Document Preview - Review before generating
            </p>
          </div>
        </div>
        <div className="sm:shrink-0">
          <DocumentActions 
          documentTitle={document.name}
          documentContent={processedContent}
          organizationName={organization.name}
          policyId={document.policyId}
          />
        </div>
      </div>

      {/* Document Viewer */}
      <DocumentViewer content={processedContent} title={document.name} />
    </div>
  );
}
