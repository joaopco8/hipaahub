import { createClient } from '@/utils/supabase/server';
import { getRiskAssessment, getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle2, XCircle, Shield } from 'lucide-react';
import Link from 'next/link';

export default async function RiskAssessmentPage() {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin');
  }

  const riskAssessment = await getRiskAssessment(supabase, user.id);
  const hasCompletedAssessment = !!riskAssessment?.risk_level;
  const riskLevel = (riskAssessment?.risk_level as 'low' | 'medium' | 'high' | undefined) ?? undefined;
  const lastUpdated = riskAssessment?.updated_at
    ? new Date(riskAssessment.updated_at).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      })
    : null;

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Cisco Header */}
      <div className="mb-2">
        <h2 className="text-2xl font-light text-[#0e274e]">HIPAA Risk Assessment</h2>
        <p className="text-sm text-gray-400 font-light">
          Manage your Security Risk Analysis (SRA)
        </p>
      </div>

      {!hasCompletedAssessment ? (
        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#00bceb]/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-[#00bceb]" />
              </div>
              <div>
                <CardTitle className="text-lg font-light text-[#0e274e]">Start Assessment</CardTitle>
                <CardDescription className="text-xs text-gray-400">
                  Comprehensive 150-question analysis
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-[#f3f5f9] border border-gray-100">
                <h3 className="text-sm font-medium text-[#0e274e] mb-2">Why this matters:</h3>
                <ul className="list-disc list-inside space-y-1 text-xs text-[#565656] font-light">
                  <li>Determines your HIPAA risk score</li>
                  <li>Generates priority action items</li>
                  <li>Identifies required evidence</li>
                </ul>
              </div>
              <Button asChild size="lg" className="w-full bg-[#00bceb] text-white hover:bg-[#00bceb]/90 rounded-none font-light">
                <Link href="/onboarding/risk-assessment">Start Assessment</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardHeader>
            <CardTitle className="text-lg font-light text-[#0e274e]">Assessment Status</CardTitle>
            <CardDescription className="text-xs text-gray-400">
              {lastUpdated ? `Last updated ${lastUpdated}.` : 'Your answers are saved.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-[#f3f5f9] border-l-4 border-[#0e274e]">
                {riskLevel === 'low' && (
                  <>
                    <CheckCircle2 className="h-8 w-8 text-[#71bc48]" />
                    <div>
                      <div className="font-medium text-[#0e274e]">Low Risk</div>
                      <div className="text-sm text-[#565656] font-light">
                        Good compliance posture
                      </div>
                    </div>
                  </>
                )}
                {riskLevel === 'medium' && (
                  <>
                    <AlertTriangle className="h-8 w-8 text-yellow-500" />
                    <div>
                      <div className="font-medium text-[#0e274e]">Medium Risk</div>
                      <div className="text-sm text-[#565656] font-light">
                        Attention needed in some areas
                      </div>
                    </div>
                  </>
                )}
                {riskLevel === 'high' && (
                  <>
                    <XCircle className="h-8 w-8 text-red-500" />
                    <div>
                      <div className="font-medium text-[#0e274e]">High Risk</div>
                      <div className="text-sm text-[#565656] font-light">
                        Immediate action required
                      </div>
                    </div>
                  </>
                )}
                {!riskLevel && (
                  <>
                    <AlertTriangle className="h-8 w-8 text-gray-400" />
                    <div>
                      <div className="font-medium text-[#0e274e]">In Progress</div>
                      <div className="text-sm text-[#565656] font-light">
                        Complete all questions to see results
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <Button
                asChild
                size="lg"
                className="w-full bg-[#00bceb] text-white hover:bg-[#00bceb]/90 rounded-none font-light"
              >
                <Link href="/onboarding/risk-assessment">Update Answers</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-sm bg-white rounded-none">
        <CardHeader>
          <CardTitle className="text-base font-light text-[#0e274e]">Risk Analysis Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-[#565656] font-light">
            <p>
              HIPAA violations can result in significant fines. A regular risk assessment helps you:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Identify compliance gaps</li>
              <li>Prioritize remediation efforts</li>
              <li>Document due diligence for auditors</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
