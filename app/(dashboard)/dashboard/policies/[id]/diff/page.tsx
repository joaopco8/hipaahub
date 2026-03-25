import { getPolicyVersionContent } from '@/app/actions/policy-documents';
import { diffTexts, buildSideBySideRows } from '@/lib/policy-diff';
import { PolicyDiffViewer } from '@/components/policies/policy-diff-viewer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, GitCompare, AlertCircle } from 'lucide-react';
import Link from 'next/link';

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

interface PolicyDiffPageProps {
  params: { id: string };
  searchParams: { a?: string; b?: string };
}

export default async function PolicyDiffPage({ params, searchParams }: PolicyDiffPageProps) {
  const policyName = POLICY_NAMES[params.id] ?? `Policy #${params.id}`;
  const versionAId = searchParams.a;
  const versionBId = searchParams.b;

  if (!versionAId || !versionBId) {
    return (
      <div className="flex w-full flex-col gap-6">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/policies/${params.id}/history`}>
            <Button variant="ghost" size="sm" className="rounded-none text-gray-500">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to History
            </Button>
          </Link>
        </div>
        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-200 mb-4" />
            <p className="text-sm text-gray-400">Missing version parameters.</p>
            <p className="text-xs text-gray-400 mt-1">
              Provide <code>?a=versionId&amp;b=versionId</code> to compare two versions.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [versionAData, versionBData] = await Promise.all([
    getPolicyVersionContent(versionAId),
    getPolicyVersionContent(versionBId),
  ]);

  if (!versionAData || !versionBData) {
    return (
      <div className="flex w-full flex-col gap-6">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/policies/${params.id}/history`}>
            <Button variant="ghost" size="sm" className="rounded-none text-gray-500">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to History
            </Button>
          </Link>
        </div>
        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-200 mb-4" />
            <p className="text-sm text-gray-400 font-light">
              {!versionAData && !versionBData
                ? 'Both versions could not be found.'
                : !versionAData
                  ? 'Version A could not be found.'
                  : 'Version B could not be found.'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              You may not have access to these versions.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Compute diff server-side
  const result = diffTexts(
    versionAData.content_snapshot || '',
    versionBData.content_snapshot || ''
  );
  const rows = buildSideBySideRows(result.lines);

  const versionA = { id: versionAId, version_number: versionAData.version_number };
  const versionB = { id: versionBId, version_number: versionBData.version_number };

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Back link */}
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/policies/${params.id}/history`}>
          <Button variant="ghost" size="sm" className="rounded-none text-gray-500">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to History
          </Button>
        </Link>
      </div>

      {/* Page header */}
      <div className="mb-2">
        <div className="flex items-center gap-2">
          <GitCompare className="h-5 w-5 text-[#00bceb]" />
          <h2 className="text-2xl font-light text-[#0e274e]">
            Version Comparison
          </h2>
        </div>
        <p className="text-sm text-gray-400 font-light mt-1">
          {policyName} &mdash; v{versionA.version_number} vs v{versionB.version_number}
        </p>
      </div>

      {/* Diff viewer */}
      <PolicyDiffViewer
        policyId={params.id}
        versionA={versionA}
        versionB={versionB}
        rows={rows}
        stats={result.stats}
      />
    </div>
  );
}
