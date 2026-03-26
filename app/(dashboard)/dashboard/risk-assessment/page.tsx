import { createClient } from '@/utils/supabase/server';
import { getRiskAssessment, getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, XCircle, Shield, Download, History, BarChart3, Calendar } from 'lucide-react';
import Link from 'next/link';
import { RiskAssessmentExportButton } from '@/components/risk-assessment/risk-assessment-export-button';
import { CreateMitigationButton } from '@/components/risk-assessment/create-mitigation-button';
import { getSubscription } from '@/utils/supabase/queries';

export default async function RiskAssessmentPage() {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin');
  }

  const [riskAssessment, subscription] = await Promise.all([
    getRiskAssessment(supabase, user.id),
    getSubscription(supabase, user.id),
  ]);
  const isLocked = !subscription || subscription.status === 'trialing';
  const hasCompletedAssessment = !!riskAssessment?.risk_level;
  const riskLevel = (riskAssessment?.risk_level as 'low' | 'medium' | 'high' | undefined) ?? undefined;
  const riskPct = Number(riskAssessment?.risk_percentage || 0).toFixed(1);
  const lastUpdated = riskAssessment?.updated_at
    ? new Date(riskAssessment.updated_at)
    : null;

  // Check if assessment is overdue (> 12 months)
  const isOverdue = lastUpdated
    ? (Date.now() - lastUpdated.getTime()) > 365 * 24 * 60 * 60 * 1000
    : false;
  const isExpiringSoon = lastUpdated
    ? (Date.now() - lastUpdated.getTime()) > 335 * 24 * 60 * 60 * 1000
    : false;

  // Fetch action items for gap report
  const { data: actionItems } = await (supabase as any)
    .from('action_items')
    .select('title, description, priority, category, status, hipaa_citation')
    .eq('user_id', user.id)
    .neq('status', 'completed')
    .order('priority', { ascending: true })
    .limit(100);

  // Fetch assessment history
  const { data: history } = await (supabase as any)
    .from('risk_assessment_history')
    .select('id, risk_level, risk_percentage, assessed_at')
    .eq('user_id', user.id)
    .order('assessed_at', { ascending: false })
    .limit(10);

  // Group action items by category for gap report
  const gapsByCategory: Record<string, any[]> = {};
  for (const item of (actionItems || [])) {
    if (!gapsByCategory[item.category]) gapsByCategory[item.category] = [];
    gapsByCategory[item.category].push(item);
  }

  const categoryOrder = ['Administrative', 'Security', 'Training', 'Policies', 'Contracts'];
  const riskLabelMap = {
    low: 'Protected',
    medium: 'Partial',
    high: 'At Risk',
  };
  const riskColorMap = {
    low: 'bg-[#71bc48]/10 text-[#71bc48]',
    medium: 'bg-amber-50 text-amber-600',
    high: 'bg-red-50 text-red-600',
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-light text-[#0e274e]">HIPAA Risk Assessment</h2>
          <p className="text-sm text-gray-400 font-light">Security Risk Analysis (SRA) results and gap report</p>
        </div>
        {hasCompletedAssessment && (
          <div className="flex gap-2 flex-wrap">
            <RiskAssessmentExportButton isLocked={isLocked} />
            <Link href="/dashboard/risk-assessment/history">
              <Button variant="outline" size="sm" className="rounded-none border-gray-200 text-[#565656]">
                <History className="h-4 w-4 mr-1.5" />
                History
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Annual Review Alert */}
      {isOverdue && (
        <Card className="border-0 shadow-sm bg-white rounded-none border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-700">Annual Re-Assessment Overdue</p>
                <p className="text-xs text-red-600">
                  Your last assessment was{' '}
                  {lastUpdated?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
                  HIPAA requires annual risk assessments. Please update your answers.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {!isOverdue && isExpiringSoon && (
        <Card className="border-0 shadow-sm bg-white rounded-none border-l-4 border-l-amber-400">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-amber-600 shrink-0" />
              <p className="text-sm text-amber-700">
                Your annual risk assessment is due soon. Schedule a re-assessment before{' '}
                {lastUpdated && new Date(lastUpdated.getTime() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!hasCompletedAssessment ? (
        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#00bceb]/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-[#00bceb]" />
              </div>
              <div>
                <CardTitle className="text-lg font-light text-[#0e274e]">Start Assessment</CardTitle>
                <CardDescription className="text-xs text-gray-400">Comprehensive 150-question analysis</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-[#f3f5f9]">
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
        <>
          {/* Score Card */}
          <Card className="border-0 shadow-sm bg-white rounded-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  {riskLevel === 'low' && <CheckCircle2 className="h-10 w-10 text-[#71bc48]" />}
                  {riskLevel === 'medium' && <AlertTriangle className="h-10 w-10 text-amber-500" />}
                  {riskLevel === 'high' && <XCircle className="h-10 w-10 text-red-500" />}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-3xl font-light text-[#0e274e]">{riskPct}%</p>
                      <Badge className={`${riskLevel ? riskColorMap[riskLevel] : 'bg-gray-100 text-gray-500'} border-0 rounded-none font-normal`}>
                        {riskLevel ? riskLabelMap[riskLevel] : 'Unknown'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400 font-light mt-1">
                      Last assessed: {lastUpdated?.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <Button asChild size="sm" variant="outline" className="rounded-none border-gray-200">
                  <Link href="/onboarding/risk-assessment">Update Answers</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Gap Report by Category */}
          {Object.keys(gapsByCategory).length > 0 && (
            <div>
              <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-[#00bceb]" />
                  <h3 className="text-xl font-light text-[#0e274e]">Gap Report by Category</h3>
                </div>
                <CreateMitigationButton gaps={actionItems || []} />
              </div>
              <div className="space-y-4">
                {categoryOrder
                  .filter(cat => gapsByCategory[cat]?.length > 0)
                  .map(cat => {
                    const items = gapsByCategory[cat];
                    const criticalCount = items.filter((i: any) => i.priority === 'critical').length;
                    const highCount = items.filter((i: any) => i.priority === 'high').length;

                    return (
                      <Card key={cat} className="border-0 shadow-sm bg-white rounded-none">
                        <CardHeader className="pb-2 border-b border-gray-100">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-normal text-[#0e274e]">{cat}</CardTitle>
                            <div className="flex gap-2">
                              {criticalCount > 0 && (
                                <Badge className="bg-red-50 text-red-600 border-0 rounded-none text-xs">
                                  {criticalCount} critical
                                </Badge>
                              )}
                              {highCount > 0 && (
                                <Badge className="bg-amber-50 text-amber-600 border-0 rounded-none text-xs">
                                  {highCount} high
                                </Badge>
                              )}
                              <Badge className="bg-gray-100 text-gray-500 border-0 rounded-none text-xs">
                                {items.length} total
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-0">
                          {items.slice(0, 5).map((item: any, idx: number) => (
                            <div key={idx} className={`p-4 ${idx < items.length - 1 ? 'border-b border-gray-50' : ''}`}>
                              <div className="flex items-start gap-3">
                                <Badge className={`shrink-0 mt-0.5 border-0 rounded-none font-normal text-xs ${
                                  item.priority === 'critical' ? 'bg-red-50 text-red-600' :
                                  item.priority === 'high' ? 'bg-amber-50 text-amber-600' :
                                  'bg-[#00bceb]/10 text-[#00bceb]'
                                }`}>
                                  {item.priority}
                                </Badge>
                                <div className="flex-1">
                                  <p className="text-sm font-normal text-[#0e274e]">{item.title}</p>
                                  <p className="text-xs text-gray-400 mt-1 font-light">{item.description}</p>
                                  {item.hipaa_citation && (
                                    <p className="text-xs text-[#00bceb] mt-1 font-light">
                                      HIPAA: {item.hipaa_citation}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          {items.length > 5 && (
                            <div className="p-3 text-center border-t border-gray-50">
                              <Link href="/dashboard/action-items">
                                <p className="text-xs text-[#00bceb] hover:underline cursor-pointer">
                                  +{items.length - 5} more in Action Items →
                                </p>
                              </Link>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </div>
          )}

          {Object.keys(gapsByCategory).length === 0 && (
            <Card className="border-0 shadow-sm bg-white rounded-none">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <CheckCircle2 className="h-10 w-10 text-[#71bc48] mb-3" />
                <p className="text-sm font-light text-[#0e274e]">No open gaps found.</p>
                <p className="text-xs text-gray-400 mt-1">All identified action items have been completed.</p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Assessment History Preview */}
      {(history || []).length > 1 && (
        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-light text-[#0e274e]">Assessment History</CardTitle>
              <Link href="/dashboard/risk-assessment/history">
                <Button variant="ghost" size="sm" className="text-xs text-[#00bceb] rounded-none">View all</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {(history || []).slice(0, 5).map((h: any) => (
              <div key={h.id} className="flex items-center justify-between p-4 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <p className="text-sm text-[#0e274e] font-light">
                    {new Date(h.assessed_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-[#565656]">{Number(h.risk_percentage).toFixed(1)}%</p>
                  <Badge className={`${riskColorMap[h.risk_level as keyof typeof riskColorMap] || 'bg-gray-100 text-gray-500'} border-0 rounded-none text-xs`}>
                    {riskLabelMap[h.risk_level as keyof typeof riskLabelMap] || h.risk_level}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
