import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, FileText, Download, Eye } from 'lucide-react';
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
    <div className="flex w-full flex-col gap-6 page-transition-premium">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Policies & Templates</h1>
          <p className="text-zinc-600 text-base">
            Professional HIPAA policy templates ready to use
          </p>
        </div>
        <div className="text-left sm:text-right">
          <div className="text-2xl font-bold text-zinc-900">{completedCount}/{totalCount}</div>
          <div className="text-sm text-zinc-600">Policies Complete</div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {policies.map((policy, index) => (
          <Card key={policy.id} className="card-premium-enter stagger-item" style={{ animationDelay: `${index * 50}ms` }}>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{policy.name}</CardTitle>
                  </div>
                  <CardDescription>{policy.description}</CardDescription>
                </div>
                {policy.status === 'completed' ? (
                  <Badge className="bg-green-100 text-green-800 border-green-200 w-fit">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Complete
                  </Badge>
                ) : (
                  <Badge className="bg-amber-100 text-amber-800 border-amber-200 w-fit">
                    Pending
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {policy.status === 'completed' && policy.lastUpdated && (
                  <div className="text-sm text-muted-foreground">
                    Last updated: {new Date(policy.lastUpdated).toLocaleDateString()}
                  </div>
                )}
                <div className="flex gap-2 flex-wrap">
                  {policy.status === 'completed' ? (
                    <>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href={`/dashboard/policies/${policy.id}/preview`} className="flex-1 min-w-[140px]">
                        <Button size="sm" className="w-full bg-[#1ad07a] text-[#0c0b1d] hover:bg-[#1ad07a]/90">
                          Generate Document
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
                <PolicyAttachmentUpload policyId={policy.id} policyName={policy.name} />
                {policy.status === 'completed' && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-green-600 hover:text-green-700"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Mark as Implemented
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-blue-50 border-blue-200 card-premium-enter stagger-item" style={{ animationDelay: `${policies.length * 50}ms` }}>
        <CardHeader>
          <CardTitle className="text-lg">Why These Policies Matter</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            HIPAA requires covered entities to have written policies and procedures. These templates 
            are professionally written, include your practice name automatically, and can be 
            customized to fit your specific needs. Each policy includes:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-3">
            <li>HIPAA-compliant language and requirements</li>
            <li>Placeholders for your practice information</li>
            <li>Implementation checklists</li>
            <li>Review and update schedules</li>
          </ul>
        </CardContent>
      </Card>

      <AdditionalDocumentsSection />
    </div>
  );
}



