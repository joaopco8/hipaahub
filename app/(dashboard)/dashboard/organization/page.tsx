import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { OrganizationForm } from '@/components/organization/organization-form';
import { getOrganizationData } from '@/app/actions/organization';

export default async function OrganizationPage() {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin');
  }

  const organization = await getOrganizationData();

  // Debug: Log organization data to verify it's being loaded
  if (process.env.NODE_ENV === 'development') {
    console.log('Organization data loaded:', JSON.stringify(organization, null, 2));
  }

  return (
    <div className="flex w-full flex-col gap-6 page-transition-premium">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Organization Information</h1>
        <p className="text-zinc-600 text-base">
          Manage your organization details required for HIPAA compliance documentation
        </p>
      </div>

      {/* Organization Form */}
      {organization ? (
        <OrganizationForm key={organization.id || 'new'} initialData={organization} />
      ) : (
        <div className="text-center py-12">
          <p className="text-zinc-600">No organization data found. Please complete onboarding first.</p>
        </div>
      )}
    </div>
  );
}

