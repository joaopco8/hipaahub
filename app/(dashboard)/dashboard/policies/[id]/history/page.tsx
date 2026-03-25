import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { getPolicyVersionHistory } from '@/app/actions/policy-documents';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, Clock, FileText, History, GitCompare } from 'lucide-react';
import Link from 'next/link';
import { PolicyVersionRestore } from '@/components/policies/policy-version-restore';

const STATUS_STYLES: Record<string, string> = {
  active:    'bg-[#71bc48]/10 text-[#71bc48]',
  in_review: 'bg-amber-50 text-amber-600',
  archived:  'bg-gray-100 text-gray-500',
  draft:     'bg-[#00bceb]/10 text-[#00bceb]',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Active', in_review: 'In Review', archived: 'Archived', draft: 'Draft',
};

const POLICY_NAMES: Record<string, string> = {
  '1': 'HIPAA Security & Privacy Master Policy',
  '2': 'Security Risk Analysis (SRA) Policy',
  '3': 'Risk Management Plan',
  '4': 'Access Control Policy',
  '5': 'Workforce Training Policy',
  '6': 'Sanction Policy',
  '7': 'Incident Response & Breach Notification',
  '8': 'Business Associate Management',
  '9': 'Audit Logs & Documentation Retention',
};

export default async function PolicyHistoryPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const user = await getUser(supabase);
  if (!user) return redirect('/signin');

  const policyId = parseInt(params.id, 10);
  const policyName = POLICY_NAMES[params.id] ?? `Policy #${params.id}`;
  const versions = await getPolicyVersionHistory(policyId);

  const latestVersionId: string | undefined = versions[0]?.id;

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/policies">
          <Button variant="ghost" size="sm" className="rounded-none text-gray-500">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Policies
          </Button>
        </Link>
      </div>

      <div className="mb-2">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-[#00bceb]" />
          <h2 className="text-2xl font-light text-[#0e274e]">Version History</h2>
        </div>
        <p className="text-sm text-gray-400 font-light mt-1">{policyName}</p>
      </div>

      {versions.length === 0 ? (
        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <History className="h-12 w-12 text-gray-200 mb-4" />
            <p className="text-sm text-gray-400">No version history yet.</p>
            <p className="text-xs text-gray-400 mt-1">Generate this policy to start tracking versions.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {versions.map((v: any, idx: number) => (
            <Card key={v.id} className="border-0 shadow-sm bg-white rounded-none">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#f3f5f9] text-[#0e274e] text-sm font-light shrink-0">
                      v{v.version_number}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`${STATUS_STYLES[v.status] || STATUS_STYLES.draft} border-0 rounded-none font-normal text-xs`}>
                          {STATUS_LABELS[v.status] || v.status}
                        </Badge>
                        {idx === 0 && (
                          <Badge className="bg-[#0e274e]/5 text-[#0e274e] border-0 rounded-none font-normal text-xs">
                            Latest
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-[#0e274e] font-light mt-1">
                        Generated on{' '}
                        {new Date(v.created_at).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                      {v.signature_name && (
                        <p className="text-xs text-[#71bc48] mt-1 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Signed by {v.signature_name}
                          {v.signed_at && ` on ${new Date(v.signed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                        </p>
                      )}
                      {v.next_review_date && (
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Review by {new Date(v.next_review_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      )}
                      {v.notes && (
                        <p className="text-xs text-gray-500 mt-2">{v.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                    {/* View Current */}
                    <Link href={`/dashboard/policies/${params.id}/preview`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-none border-gray-200 text-gray-600 hover:text-[#00bceb]"
                      >
                        <FileText className="h-3.5 w-3.5 mr-1" />
                        View Current
                      </Button>
                    </Link>

                    {/* Compare links */}
                    {idx === 0 && versions.length > 1 && versions[1]?.id && (
                      <Link href={`/dashboard/policies/${params.id}/diff?a=${versions[1].id}&b=${v.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-none border-gray-200 text-gray-600 hover:text-[#00bceb]"
                        >
                          <GitCompare className="h-3.5 w-3.5 mr-1" />
                          Compare with Previous
                        </Button>
                      </Link>
                    )}

                    {idx > 0 && latestVersionId && (
                      <Link href={`/dashboard/policies/${params.id}/diff?a=${v.id}&b=${latestVersionId}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-none border-gray-200 text-gray-600 hover:text-[#00bceb]"
                        >
                          <GitCompare className="h-3.5 w-3.5 mr-1" />
                          Compare with Latest
                        </Button>
                      </Link>
                    )}

                    {/* Restore — only for non-latest versions */}
                    {idx > 0 && (
                      <PolicyVersionRestore
                        policyId={policyId}
                        versionId={v.id}
                        versionNumber={v.version_number}
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
