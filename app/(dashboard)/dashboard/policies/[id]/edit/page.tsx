import { createClient } from '@/utils/supabase/server';
import { getUser, getSubscription } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { getLatestEditorContent } from '@/app/actions/policy-editor';
import { getPolicyGenerationStatus } from '@/app/actions/policy-documents';
import { getOrganizationData } from '@/app/actions/organization';
import { POLICY_EDITOR_TEMPLATES, POLICY_NAMES, fillPolicyTemplate } from '@/lib/policy-editor-templates';
import { PolicyEditorClient } from '@/components/policies/policy-editor-client';

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

  // Load content: saved version OR fill fresh template
  let initialContent: string;
  if (savedContent?.content) {
    initialContent = savedContent.content;
  } else {
    const template = POLICY_EDITOR_TEMPLATES[policyId];
    const { html } = fillPolicyTemplate(template, organization);
    initialContent = html;
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
