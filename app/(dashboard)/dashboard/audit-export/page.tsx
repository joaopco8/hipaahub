import { createClient } from '@/utils/supabase/server';
import { getUser, getSubscription } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { getAuditExportData } from '@/app/actions/audit-export';
import { AuditExportClient } from '@/components/audit-export/audit-export-client';

export default async function AuditExportPage() {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin');
  }

  const [auditData, subscription] = await Promise.all([
    getAuditExportData(),
    getSubscription(supabase, user.id),
  ]);

  if (!auditData) {
    return redirect('/onboarding/expectation');
  }

  const isLocked = !subscription || subscription.status === 'trialing';

  return <AuditExportClient auditData={auditData} isLocked={isLocked} userEmail={user.email ?? ''} />;
}
