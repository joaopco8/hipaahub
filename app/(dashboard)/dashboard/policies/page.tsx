import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, FileText, Download, Eye, AlertCircle, RefreshCw, Clock } from 'lucide-react';
import { AdditionalDocumentsSection } from '@/components/policies/additional-documents-section';
import { PoliciesNavigation } from '@/components/policies/policies-navigation';
import { getPolicyGenerationStatus } from '@/app/actions/policy-documents';

export default async function PoliciesPage() {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin');
  }

  // Fetch generation status from DB
  const generationStatusMap = await getPolicyGenerationStatus();

  // HIPAA Required Documents — only these 9 can be generated
  const policiesBase = [
    {
      id: 1,
      name: 'HIPAA Security & Privacy Master Policy',
      description: 'Comprehensive master policy covering all HIPAA Security and Privacy Rule requirements.',
      template: true
    },
    {
      id: 2,
      name: 'Security Risk Analysis (SRA) Policy',
      description: 'Policy documenting the process for conducting and maintaining security risk assessments.',
      template: true
    },
    {
      id: 3,
      name: 'Risk Management Plan',
      description: 'Documented plan for identifying, assessing, and mitigating security risks to PHI.',
      template: true
    },
    {
      id: 4,
      name: 'Access Control Policy',
      description: 'Defines who can access PHI, under what circumstances, and how access is controlled and monitored.',
      template: true
    },
    {
      id: 5,
      name: 'Workforce Training Policy',
      description: 'Requirements and procedures for HIPAA training of all workforce members who handle PHI.',
      template: true
    },
    {
      id: 6,
      name: 'Sanction Policy',
      description: 'Policy outlining disciplinary actions for workforce members who violate HIPAA policies.',
      template: true
    },
    {
      id: 7,
      name: 'Incident Response & Breach Notification',
      description: 'Procedures for responding to security incidents and notifying patients and HHS in case of a breach.',
      template: true
    },
    {
      id: 8,
      name: 'Business Associate Management',
      description: 'Policy for managing business associates, including BAA requirements and vendor oversight.',
      template: true
    },
    {
      id: 9,
      name: 'Audit Logs & Documentation Retention',
      description: 'Policy for maintaining audit logs, documentation requirements, and record retention schedules.',
      template: true
    }
  ];

  // Merge DB generation status into each policy
  const policies = policiesBase.map((p) => {
    const genStatus = generationStatusMap.get(p.id);
    return {
      ...p,
      isGenerated: !!genStatus,
      generatedAt: genStatus?.last_generated_at ?? null,
      generationCount: genStatus?.generation_count ?? 0
    };
  });

  const completedCount = policies.filter((p) => p.isGenerated).length;
  const totalCount = policies.length;

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Header */}
      <div className="mb-2">
        <h2 className="text-2xl font-light text-[#0e274e]">Policies & Documents</h2>
        <p className="text-sm text-gray-400 font-light">
          Manage HIPAA policy templates and documentation
        </p>
      </div>

      {/* Navigation Tabs */}
      <PoliciesNavigation />

      {/* Status Summary Card */}
      <Card className="border-0 shadow-sm bg-white rounded-none">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full border-2 border-[#00bceb] flex items-center justify-center">
                <FileText className="h-6 w-6 text-[#00bceb]" />
              </div>
              <div>
                <p className="text-sm text-[#565656] font-light">Policies Generated</p>
                <p className="text-2xl font-light text-[#0e274e]">
                  {completedCount}{' '}
                  <span className="text-lg text-[#565656]">/ {totalCount} Policies</span>
                </p>
              </div>
            </div>
            {/* Progress bar */}
            <div className="hidden sm:block w-40">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#565656]">
                  {Math.round((completedCount / totalCount) * 100)}% complete
                </span>
              </div>
              <div className="h-2 bg-[#f3f5f9] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00bceb] rounded-full transition-all"
                  style={{ width: `${Math.round((completedCount / totalCount) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Policies Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {policies.map((policy) => (
          <Card
            key={policy.id}
            className="border-0 shadow-sm bg-white rounded-none hover:shadow-md transition-shadow"
          >
            <CardHeader className="border-b border-gray-100 py-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-base font-normal text-[#0e274e]">
                      {policy.name}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-xs text-gray-400 font-light">
                    {policy.description}
                  </CardDescription>
                </div>

                {/* Status badge */}
                {policy.isGenerated ? (
                  <Badge className="bg-[#00bceb]/10 text-[#00bceb] border-0 rounded-none font-normal shrink-0">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Generated
                  </Badge>
                ) : (
                  <Badge className="bg-yellow-50 text-yellow-600 border-0 rounded-none font-normal shrink-0">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              <div className="space-y-3">
                {/* Generation metadata */}
                {policy.isGenerated && policy.generatedAt && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Clock className="h-3 w-3" />
                    Last generated:{' '}
                    {new Date(policy.generatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                    {policy.generationCount > 1 && (
                      <span className="ml-1 text-[#565656]">
                        · {policy.generationCount}× generated
                      </span>
                    )}
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  {policy.isGenerated ? (
                    <>
                      {/* View previews the latest version */}
                      <Link href={`/dashboard/policies/${policy.id}/preview`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-none border-gray-200 text-gray-600 hover:text-[#00bceb]"
                        >
                          <Eye className="mr-2 h-3.5 w-3.5" />
                          View
                        </Button>
                      </Link>

                      {/* Regenerate */}
                      <Link href={`/dashboard/policies/${policy.id}/preview`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-none border-gray-200 text-[#565656] hover:text-[#0e274e]"
                        >
                          <RefreshCw className="mr-2 h-3.5 w-3.5" />
                          Regenerate
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <Link href={`/dashboard/policies/${policy.id}/preview`} className="flex-1">
                      <Button
                        size="sm"
                        className="w-full bg-[#00bceb] text-white hover:bg-[#00a0c9] rounded-none h-8 font-light"
                      >
                        Generate Document
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AdditionalDocumentsSection />
    </div>
  );
}
