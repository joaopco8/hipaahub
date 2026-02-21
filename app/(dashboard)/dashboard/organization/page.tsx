import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { OrganizationForm } from '@/components/organization/organization-form';
import { getOrganizationData } from '@/app/actions/organization';
import { Card, CardContent } from '@/components/ui/card';

export default async function OrganizationPage() {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin');
  }

  const organization = await getOrganizationData();

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Cisco Style Header */}
      <div className="mb-2">
        <h2 className="text-2xl font-light text-[#0e274e]">Organization Information</h2>
        <p className="text-sm text-gray-400 font-light">
          Manage your organization details for HIPAA compliance
        </p>
      </div>

      {/* Content Card */}
      <Card className="border-0 shadow-sm bg-white rounded-none">
        <CardContent className="p-6">
          {organization ? (
            <OrganizationForm key={organization.id || 'new'} initialData={organization} />
          ) : (
            <div className="text-center py-12">
              <p className="text-[#565656] font-light">No organization data found. Please complete onboarding first.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
