import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lock, Users, FileText, Calendar, Clock, Download, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getEvidenceById,
  getEvidenceAccessLogs,
  getIsAdmin,
  type ComplianceEvidence,
  type EvidenceStatus,
} from '@/app/actions/compliance-evidence';
import { formatFileSize } from '@/utils/helpers';
import { EvidenceDetailActions } from '@/components/evidence/evidence-detail-actions';

const STATUS_COLORS: Record<EvidenceStatus, string> = {
  VALID: 'bg-[#71bc48]/10 text-[#71bc48] border border-[#71bc48]/20',
  EXPIRED: 'bg-red-50 text-red-800 border border-red-200',
  MISSING: 'bg-gray-50 text-gray-800 border border-gray-200',
  REQUIRES_REVIEW: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
  ARCHIVED: 'bg-zinc-100 text-zinc-700 border border-zinc-200',
};

export default async function EvidenceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) redirect('/signin');

  const [item, isAdmin] = await Promise.all([
    getEvidenceById(params.id),
    getIsAdmin(),
  ]);

  if (!item) notFound();

  const accessLogs = isAdmin ? await getEvidenceAccessLogs(params.id) : [];

  return (
    <div className="flex w-full flex-col gap-6 max-w-5xl">
      {/* Back nav */}
      <Link
        href="/dashboard/evidence"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#0e274e] transition-colors font-light"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Evidence Center
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-2xl font-light text-[#0e274e]">{item.title}</h2>
            {item.visibility === 'admin_only' && (
              <Badge
                variant="outline"
                className="text-[11px] font-light px-2 py-0.5 rounded-none bg-[#0e274e]/5 text-[#0e274e] border-[#0e274e]/20 flex items-center gap-1"
              >
                <Lock className="h-3 w-3" />
                Admin Only
              </Badge>
            )}
            {item.visibility === 'all_members' && (
              <Badge
                variant="outline"
                className="text-[11px] font-light px-2 py-0.5 rounded-none bg-gray-50 text-gray-500 border-gray-200 flex items-center gap-1"
              >
                <Users className="h-3 w-3" />
                All Members
              </Badge>
            )}
            <Badge
              variant="outline"
              className={`text-[11px] font-light px-2 py-0.5 rounded-none ${STATUS_COLORS[item.status as EvidenceStatus]}`}
            >
              {item.status.replace('_', ' ')}
            </Badge>
          </div>
          {item.description && (
            <p className="text-sm text-gray-500 font-light max-w-2xl">{item.description}</p>
          )}
        </div>

        {/* Download / view actions (client component for signed URL) */}
        {item.file_url && (
          <EvidenceDetailActions
            evidenceId={item.id}
            fileUrl={item.file_url}
            fileName={item.file_name || item.title}
            evidenceTitle={item.title}
          />
        )}
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm rounded-none bg-white">
          <CardContent className="p-4 space-y-1">
            <p className="text-[11px] text-gray-400 font-light uppercase tracking-wide">HIPAA Category</p>
            <p className="text-sm text-[#0e274e] font-light">{item.hipaa_category?.join(', ') || '—'}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm rounded-none bg-white">
          <CardContent className="p-4 space-y-1">
            <p className="text-[11px] text-gray-400 font-light uppercase tracking-wide">Upload Date</p>
            <p className="text-sm text-[#0e274e] font-light flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-gray-400" />
              {item.upload_date
                ? new Date(item.upload_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : '—'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm rounded-none bg-white">
          <CardContent className="p-4 space-y-1">
            <p className="text-[11px] text-gray-400 font-light uppercase tracking-wide">Validity</p>
            <p className="text-sm text-[#0e274e] font-light flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-gray-400" />
              {item.validity_end_date
                ? `Expires ${new Date(item.validity_end_date).toLocaleDateString()}`
                : '—'}
            </p>
          </CardContent>
        </Card>

        {item.file_name && (
          <Card className="border-0 shadow-sm rounded-none bg-white">
            <CardContent className="p-4 space-y-1">
              <p className="text-[11px] text-gray-400 font-light uppercase tracking-wide">File</p>
              <p className="text-sm text-[#0e274e] font-light flex items-center gap-1.5 truncate">
                <FileText className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <span className="truncate">{item.file_name}</span>
                {item.file_size && (
                  <span className="text-gray-400 shrink-0">{formatFileSize(item.file_size)}</span>
                )}
              </p>
            </CardContent>
          </Card>
        )}

        {item.legal_weight && (
          <Card className="border-0 shadow-sm rounded-none bg-white sm:col-span-2">
            <CardContent className="p-4 space-y-1">
              <p className="text-[11px] text-gray-400 font-light uppercase tracking-wide">Legal Weight</p>
              <p className="text-sm text-[#71bc48] font-light">{item.legal_weight}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Notes */}
      {item.notes && (
        <Card className="border-0 shadow-sm rounded-none bg-white">
          <CardHeader className="pb-2 px-5 pt-4">
            <CardTitle className="text-sm font-medium text-[#0e274e]">Notes</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <p className="text-sm text-gray-500 font-light whitespace-pre-wrap">{item.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Access Log — admin only */}
      {isAdmin && (
        <Card className="border-0 shadow-sm rounded-none bg-white">
          <CardHeader className="pb-2 px-5 pt-4 border-b border-gray-100">
            <CardTitle className="text-sm font-medium text-[#0e274e] flex items-center gap-2">
              Access History
              <Badge
                variant="outline"
                className="text-[10px] font-light px-1.5 py-0 rounded-none bg-[#0e274e]/5 text-[#0e274e] border-[#0e274e]/20"
              >
                Admin Only
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {accessLogs.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400 font-light">
                No access events recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-[#f3f5f9]">
                      <th className="text-left px-5 py-3 text-[11px] font-light text-gray-400 uppercase tracking-wide">User</th>
                      <th className="text-left px-5 py-3 text-[11px] font-light text-gray-400 uppercase tracking-wide">Action</th>
                      <th className="text-left px-5 py-3 text-[11px] font-light text-gray-400 uppercase tracking-wide">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accessLogs.map((log, i) => (
                      <tr
                        key={log.id}
                        className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'}`}
                      >
                        <td className="px-5 py-3 text-[#0e274e] font-light text-xs">
                          {log.user_name || log.user_id}
                        </td>
                        <td className="px-5 py-3">
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-light px-2 py-0.5 rounded-none ${
                              log.action === 'download'
                                ? 'bg-[#00bceb]/5 text-[#00bceb] border-[#00bceb]/20'
                                : 'bg-gray-50 text-gray-500 border-gray-200'
                            }`}
                          >
                            {log.action === 'download' ? (
                              <span className="flex items-center gap-1">
                                <Download className="h-2.5 w-2.5" />
                                Download
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <ExternalLink className="h-2.5 w-2.5" />
                                View
                              </span>
                            )}
                          </Badge>
                        </td>
                        <td className="px-5 py-3 text-gray-400 font-light text-xs">
                          {new Date(log.accessed_at).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
