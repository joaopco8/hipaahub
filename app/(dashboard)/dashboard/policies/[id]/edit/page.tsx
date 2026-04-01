import { createClient } from '@/utils/supabase/server';
import { getUser, getSubscription } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { getLatestEditorContent } from '@/app/actions/policy-editor';
import { getPolicyGenerationStatus } from '@/app/actions/policy-documents';
import { getOrganizationData } from '@/app/actions/organization';
import { POLICY_NAMES } from '@/lib/policy-editor-templates';
import { PolicyEditorClient } from '@/components/policies/policy-editor-client';
import { processDocumentTemplate } from '@/lib/document-generator';
import { policyTextToEditorHtml } from '@/lib/policy-text-to-editor-html';
import { HIPAA_SECURITY_PRIVACY_MASTER_POLICY_TEMPLATE } from '@/lib/document-templates/hipaa-security-privacy-master-policy';
import { SECURITY_RISK_ANALYSIS_POLICY_TEMPLATE } from '@/lib/document-templates/security-risk-analysis-policy';
import { RISK_MANAGEMENT_PLAN_POLICY_TEMPLATE } from '@/lib/document-templates/risk-management-plan-policy';
import { ACCESS_CONTROL_POLICY_TEMPLATE } from '@/lib/document-templates/access-control-policy';
import { WORKFORCE_TRAINING_POLICY_TEMPLATE } from '@/lib/document-templates/workforce-training-policy';
import { SANCTION_POLICY_TEMPLATE } from '@/lib/document-templates/sanction-policy';
import { INCIDENT_RESPONSE_BREACH_NOTIFICATION_POLICY_TEMPLATE } from '@/lib/document-templates/incident-response-breach-notification-policy';
import { BUSINESS_ASSOCIATE_MANAGEMENT_POLICY_TEMPLATE } from '@/lib/document-templates/business-associate-management-policy';
import { AUDIT_LOGS_DOCUMENTATION_RETENTION_POLICY_TEMPLATE } from '@/lib/document-templates/audit-logs-documentation-retention-policy';

/** Maps policyId → real document template (same as view/preview page). */
const REAL_TEMPLATES: Record<number, string> = {
  1: HIPAA_SECURITY_PRIVACY_MASTER_POLICY_TEMPLATE,
  2: SECURITY_RISK_ANALYSIS_POLICY_TEMPLATE,
  3: RISK_MANAGEMENT_PLAN_POLICY_TEMPLATE,
  4: ACCESS_CONTROL_POLICY_TEMPLATE,
  5: WORKFORCE_TRAINING_POLICY_TEMPLATE,
  6: SANCTION_POLICY_TEMPLATE,
  7: INCIDENT_RESPONSE_BREACH_NOTIFICATION_POLICY_TEMPLATE,
  8: BUSINESS_ASSOCIATE_MANAGEMENT_POLICY_TEMPLATE,
  9: AUDIT_LOGS_DOCUMENTATION_RETENTION_POLICY_TEMPLATE,
};

export default async function PolicyEditPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) return redirect('/signin');

  const policyId = parseInt(params.id, 10);
  if (isNaN(policyId) || !POLICY_NAMES[policyId]) {
    return redirect('/dashboard/policies');
  }

  const policyName = POLICY_NAMES[policyId];

  const [organization, subscription, generationStatusMap, savedContent] =
    await Promise.all([
      getOrganizationData(),
      getSubscription(supabase, user.id),
      getPolicyGenerationStatus(),
      getLatestEditorContent(policyId),
    ]);

  if (!organization) return redirect('/dashboard/organization');

  const isLocked = !subscription || subscription.status === 'trialing';
  const genStatus = generationStatusMap.get(policyId);

  // Load content:
  // 1. Previously saved editor HTML (from a prior edit session)
  // 2. Fresh render of the REAL policy template (same as what View shows)
  let initialContent: string;
  if (savedContent?.content) {
    initialContent = savedContent.content;
  } else {
    const rawTemplate = REAL_TEMPLATES[policyId];
    if (rawTemplate) {
      // Process the template with org data (fills {{placeholders}})
      const processedText = processDocumentTemplate(rawTemplate, organization as any);
      // Convert plain-text format to TipTap-compatible HTML
      initialContent = policyTextToEditorHtml(processedText);
    } else {
      // Fallback: empty document with just the title
      initialContent = `<h1>${policyName}</h1><p>Start editing your policy here.</p>`;
    }
  }

  return (
    <PolicyEditorClient
      policyId={policyId}
      policyName={policyName}
      initialContent={initialContent}
      isLocked={isLocked}
      orgData={{
        name: organization.name ?? '',
        legal_name: organization.legal_name ?? undefined,
        address_street: organization.address_street ?? undefined,
        address_city: organization.address_city ?? undefined,
        address_state: organization.address_state ?? undefined,
        address_zip: organization.address_zip ?? undefined,
        privacy_officer_name: organization.privacy_officer_name ?? undefined,
        privacy_officer_email: organization.privacy_officer_email ?? undefined,
        compliance_contact_phone: (organization as any).compliance_contact_phone ?? undefined,
        security_officer_name: organization.security_officer_name ?? undefined,
        security_officer_email: organization.security_officer_email ?? undefined,
      }}
      genStatus={
        genStatus
          ? {
              policyStatus: genStatus.policy_status ?? 'draft',
              signatureName: genStatus.signature_name ?? null,
              signedAt: genStatus.signed_at ?? null,
              nextReviewDate: genStatus.next_review_date ?? null,
              generationCount: genStatus.generation_count ?? 1,
              lastGeneratedAt: genStatus.last_generated_at ?? null,
            }
          : null
      }
      currentVersionNumber={savedContent?.versionNumber ?? 0}
      userId={user.id}
      userFullName={(user as any).user_metadata?.full_name ?? user.email ?? 'User'}
    />
  );
}
