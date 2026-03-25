import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Eye, FileText, Package } from 'lucide-react';

interface AuditExportLog {
  id: string;
  exported_at: string;
  sections_included: string[];
  file_name: string | null;
}

interface EvidenceAccessLog {
  id: string;
  evidence_title: string;
  action: 'view' | 'download';
  accessed_at: string;
}

export default async function AuditLogPage() {
  const supabase = createClient();
  const user = await getUser(supabase);
  if (!user) return redirect('/signin');

  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!org) return redirect('/onboarding/expectation');
  const orgId = String((org as any).id);

  const [exportLogsResult, accessLogsResult] = await Promise.allSettled([
    (supabase as any)
      .from('audit_export_logs')
      .select('id, exported_at, sections_included, file_name')
      .eq('organization_id', orgId)
      .order('exported_at', { ascending: false })
      .limit(50),

    (supabase as any)
      .from('evidence_access_logs')
      .select('id, evidence_title, action, accessed_at')
      .eq('organization_id', orgId)
      .order('accessed_at', { ascending: false })
      .limit(100),
  ]);

  const exportLogs: AuditExportLog[] =
    exportLogsResult.status === 'fulfilled' ? exportLogsResult.value.data ?? [] : [];

  const accessLogs: EvidenceAccessLog[] =
    accessLogsResult.status === 'fulfilled' ? accessLogsResult.value.data ?? [] : [];

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="mb-2">
        <h2 className="text-2xl font-light text-[#0e274e]">Audit Log</h2>
        <p className="text-sm text-gray-400 font-light">
          Audit package exports and evidence document access history
        </p>
      </div>

      {/* Audit Package Exports */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Package className="h-4 w-4 text-[#0e274e]" />
          <h3 className="text-base font-light text-[#0e274e]">Audit Package Exports</h3>
        </div>

        {exportLogs.length === 0 ? (
          <Card className="border-0 shadow-sm bg-white rounded-none">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-10 w-10 text-gray-200 mb-3" />
              <p className="text-sm text-gray-400">No audit packages exported yet.</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-sm bg-white rounded-none">
            <CardContent className="p-0">
              <div className="divide-y divide-gray-50">
                {exportLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-4 px-5 py-4">
                    <Download className="h-4 w-4 text-[#0175a2] mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-normal text-[#0e274e] truncate">
                        {log.file_name || 'Audit Package'}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {(log.sections_included || []).map((s) => (
                          <Badge
                            key={s}
                            className="bg-[#f3f5f9] text-[#565656] border-0 rounded-none text-xs font-light"
                          >
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 font-light shrink-0">
                      {new Date(log.exported_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Evidence Document Access Log */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-4 w-4 text-[#0e274e]" />
          <h3 className="text-base font-light text-[#0e274e]">Evidence Document Access</h3>
        </div>

        {accessLogs.length === 0 ? (
          <Card className="border-0 shadow-sm bg-white rounded-none">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-10 w-10 text-gray-200 mb-3" />
              <p className="text-sm text-gray-400">No document access recorded yet.</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-sm bg-white rounded-none">
            <CardContent className="p-0">
              <div className="divide-y divide-gray-50">
                {accessLogs.map((log) => (
                  <div key={log.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50">
                    {log.action === 'download' ? (
                      <Download className="h-4 w-4 text-[#0175a2] shrink-0" />
                    ) : (
                      <Eye className="h-4 w-4 text-[#565656] shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-light text-[#0e274e] truncate">{log.evidence_title}</p>
                    </div>
                    <Badge className={`rounded-none border-0 text-xs font-light shrink-0 ${
                      log.action === 'download'
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {log.action === 'download' ? 'Downloaded' : 'Viewed'}
                    </Badge>
                    <span className="text-xs text-gray-400 font-light shrink-0">
                      {new Date(log.accessed_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
