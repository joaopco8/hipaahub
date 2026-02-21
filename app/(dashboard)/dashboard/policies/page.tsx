import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, FileText, Download, Eye, AlertCircle } from 'lucide-react';
import { PolicyAttachmentUpload } from '@/components/policies/policy-attachment-upload';
import { AdditionalDocumentsSection } from '@/components/policies/additional-documents-section';

export default async function PoliciesPage() {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin');
  }

  // HIPAA Required Documents - Only these 9 documents can be generated
  const policies = [
    {
      id: 1,
      name: 'HIPAA Security & Privacy Master Policy',
      description: 'Comprehensive master policy covering all HIPAA Security and Privacy Rule requirements.',
      status: 'pending',
      lastUpdated: null,
      template: true
    },
    {
      id: 2,
      name: 'Security Risk Analysis (SRA) Policy',
      description: 'Policy documenting the process for conducting and maintaining security risk assessments.',
      status: 'pending',
      lastUpdated: null,
      template: true
    },
    {
      id: 3,
      name: 'Risk Management Plan',
      description: 'Documented plan for identifying, assessing, and mitigating security risks to PHI.',
      status: 'pending',
      lastUpdated: null,
      template: true
    },
    {
      id: 4,
      name: 'Access Control Policy',
      description: 'Defines who can access PHI, under what circumstances, and how access is controlled and monitored.',
      status: 'pending',
      lastUpdated: null,
      template: true
    },
    {
      id: 5,
      name: 'Workforce Training Policy',
      description: 'Requirements and procedures for HIPAA training of all workforce members who handle PHI.',
      status: 'pending',
      lastUpdated: null,
      template: true
    },
    {
      id: 6,
      name: 'Sanction Policy',
      description: 'Policy outlining disciplinary actions for workforce members who violate HIPAA policies.',
      status: 'pending',
      lastUpdated: null,
      template: true
    },
    {
      id: 7,
      name: 'Incident Response & Breach Notification',
      description: 'Procedures for responding to security incidents and notifying patients and HHS in case of a breach.',
      status: 'pending',
      lastUpdated: null,
      template: true
    },
    {
      id: 8,
      name: 'Business Associate Management',
      description: 'Policy for managing business associates, including BAA requirements and vendor oversight.',
      status: 'pending',
      lastUpdated: null,
      template: true
    },
    {
      id: 9,
      name: 'Audit Logs & Documentation Retention',
      description: 'Policy for maintaining audit logs, documentation requirements, and record retention schedules.',
      status: 'pending',
      lastUpdated: null,
      template: true
    }
  ];

  const completedCount = policies.filter(p => p.status === 'completed').length;
  const totalCount = policies.length;

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Cisco Header */}
      <div className="mb-2">
        <h2 className="text-2xl font-light text-[#0e274e]">Policies & Documents</h2>
        <p className="text-sm text-gray-400 font-light">
          Manage HIPAA policy templates and documentation
        </p>
      </div>

      {/* Status Summary Card */}
      <Card className="border-0 shadow-sm bg-white rounded-none">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 rounded-full border-2 border-[#00bceb] flex items-center justify-center">
                 <FileText className="h-6 w-6 text-[#00bceb]" />
               </div>
               <div>
                 <p className="text-sm text-[#565656] font-light">Completion Status</p>
                 <p className="text-2xl font-light text-[#0e274e]">
                   {completedCount} <span className="text-lg text-[#565656]">/ {totalCount} Policies</span>
                 </p>
               </div>
            </div>
            <div className="hidden sm:block">
               {/* Optional chart or extra metric here */}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Policies Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {policies.map((policy, index) => (
          <Card key={policy.id} className="border-0 shadow-sm bg-white rounded-none hover:shadow-md transition-shadow">
            <CardHeader className="border-b border-gray-100 py-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-base font-normal text-[#0e274e]">{policy.name}</CardTitle>
                  </div>
                  <CardDescription className="text-xs text-gray-400 font-light">{policy.description}</CardDescription>
                </div>
                {policy.status === 'completed' ? (
                  <Badge className="bg-[#71bc48]/10 text-[#71bc48] border-0 rounded-none font-normal">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Complete
                  </Badge>
                ) : (
                  <Badge className="bg-yellow-50 text-yellow-600 border-0 rounded-none font-normal">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {policy.status === 'completed' && policy.lastUpdated && (
                  <div className="text-xs text-gray-400">
                    Last updated: {new Date(policy.lastUpdated).toLocaleDateString()}
                  </div>
                )}
                
                <div className="flex gap-2 flex-wrap">
                  {policy.status === 'completed' ? (
                    <>
                      <Button variant="outline" size="sm" className="h-8 rounded-none border-gray-200 text-gray-600 hover:text-[#00bceb]">
                        <Eye className="mr-2 h-3.5 w-3.5" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 rounded-none border-gray-200 text-gray-600 hover:text-[#00bceb]">
                        <Download className="mr-2 h-3.5 w-3.5" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 rounded-none border-gray-200 text-gray-600 hover:text-[#00bceb]">
                        Edit
                      </Button>
                    </>
                  ) : (
                    <Link href={`/dashboard/policies/${policy.id}/preview`} className="flex-1">
                      <Button size="sm" className="w-full bg-[#00bceb] text-white hover:bg-[#00a0c9] rounded-none h-8 font-light">
                        Generate Document
                      </Button>
                    </Link>
                  )}
                </div>
                
                <PolicyAttachmentUpload policyId={policy.id} policyName={policy.name} />
                
                {policy.status === 'completed' && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-[#71bc48] hover:text-[#71bc48]/80 hover:bg-[#71bc48]/5 rounded-none h-8 font-light"
                  >
                    <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
                    Mark as Implemented
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AdditionalDocumentsSection />
    </div>
  );
}
