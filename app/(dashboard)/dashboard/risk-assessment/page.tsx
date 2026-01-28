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
    <div className="flex min-h-screen w-full flex-col gap-6 max-w-[1600px] mx-auto page-transition-premium">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">HIPAA Risk Assessment</h1>
        <p className="text-zinc-600 text-base">
          Review, edit, or retake the full assessment to keep your compliance model accurate.
        </p>
      </div>

      {!hasCompletedAssessment ? (
        <Card className="card-premium-enter stagger-item">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-2xl">Start the Full Assessment (150 Questions)</CardTitle>
                <CardDescription>
                  Your answers are saved automatically. You can leave and continue later at any time.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold mb-2">What this updates:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Your HIPAA risk level and risk score</li>
                  <li>Priority action items generated from gaps</li>
                  <li>Evidence requirements tied to your answers</li>
                </ul>
              </div>
              <Button asChild size="lg" className="w-full bg-[#1ad07a] text-[#0c0b1d] hover:bg-[#1ad07a]/90">
                <Link href="/onboarding/risk-assessment">Start Assessment</Link>
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                “If OCR shows up tomorrow, do we have defensible controls — or gaps?”
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Update Your Answers (150 Questions)</CardTitle>
            <CardDescription>
              {lastUpdated ? `Last updated ${lastUpdated}.` : 'Your previous answers are saved.'}{' '}
              You can change them anytime to update your risk model and action plan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-lg border">
                {riskLevel === 'low' && (
                  <>
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                    <div>
                      <div className="font-semibold text-lg">Low Risk</div>
                      <div className="text-sm text-muted-foreground">
                        Your practice is in good compliance with HIPAA requirements
                      </div>
                    </div>
                  </>
                )}
                {riskLevel === 'medium' && (
                  <>
                    <AlertTriangle className="h-8 w-8 text-yellow-600" />
                    <div>
                      <div className="font-semibold text-lg">Medium Risk</div>
                      <div className="text-sm text-muted-foreground">
                        Some areas need attention to ensure full compliance
                      </div>
                    </div>
                  </>
                )}
                {riskLevel === 'high' && (
                  <>
                    <XCircle className="h-8 w-8 text-red-600" />
                    <div>
                      <div className="font-semibold text-lg">High Risk</div>
                      <div className="text-sm text-muted-foreground">
                        Immediate action required to avoid potential violations
                      </div>
                    </div>
                  </>
                )}
                {!riskLevel && (
                  <>
                    <AlertTriangle className="h-8 w-8 text-zinc-500" />
                    <div>
                      <div className="font-semibold text-lg">Assessment In Progress</div>
                      <div className="text-sm text-muted-foreground">
                        Continue where you left off and complete all questions to refresh your results.
                      </div>
                    </div>
                  </>
                )}
              </div>
              <Button
                asChild
                size="lg"
                className="w-full bg-[#1ad07a] text-[#0c0b1d] hover:bg-[#1ad07a]/90"
              >
                <Link href="/onboarding/risk-assessment">Continue / Edit Answers</Link>
              </Button>
              <p className="text-xs text-muted-foreground">
                Completing the assessment recalculates your risk score and may update action items.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Why Risk Assessment Matters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              HIPAA violations can result in fines ranging from $100 to $50,000 per violation, 
              with a maximum annual penalty of $1.5 million. A simple risk assessment helps you:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Identify gaps in your compliance before an audit</li>
              <li>Prioritize which areas need immediate attention</li>
              <li>Document your compliance efforts</li>
              <li>Reduce the risk of costly violations</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



