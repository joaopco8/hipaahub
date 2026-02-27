import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { getAuditExportData } from '@/app/actions/audit-export';
import { AuditExportClient } from '@/components/audit-export/audit-export-client';

export default async function AuditExportPage() {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin');
  }

  const auditData = await getAuditExportData();

  if (!auditData) {
    return redirect('/onboarding/expectation');
  }

  return <AuditExportClient auditData={auditData} />;
}
