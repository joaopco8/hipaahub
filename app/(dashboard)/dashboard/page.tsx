import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  Shield,
  FileText,
  Users,
  Archive,
  ListChecks,
  ChevronRight,
  Clock,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import {
  getCachedUser,
  getCachedDashboardData
} from '@/lib/cache/dashboard-cache';
import { getPolicyDocumentsCount, getActivityFeed } from '@/utils/supabase/queries';
import { getEvidenceStatistics } from '@/app/actions/compliance-evidence';

export const revalidate = 30;

export default async function DashboardPage() {
  const user = await getCachedUser();

  if (!user) {
    return redirect('/signin');
  }

  const { organization, riskAssessment, staffMembers, actionItems } =
    await getCachedDashboardData(user.id);

  if (!organization) {
    return redirect('/onboarding/expectation');
  }

  const supabase = createClient();

  // Fetch all data in parallel
  const [
    { total: policiesTotal, completed: policiesCompleted },
    activityFeed,
    evidenceStats,
    trainingResult
  ] = await Promise.all([
    getPolicyDocumentsCount(supabase, user.id),
    getActivityFeed(supabase, user.id, 5),
    getEvidenceStatistics().catch(() => ({
      total: 0, by_status: {} as any, by_type: {} as any,
      by_category: {} as any, expiring_soon: 0, requires_review: 0
    })),
    (supabase as any)
      .from('training_records')
      .select('completion_status, expiration_date, user_id, staff_member_id, full_name, training_date')
      .eq('user_id', user.id)
      .order('training_date', { ascending: false })
  ]);

  const trainingRecords: any[] = trainingResult.data || [];

  // ── Training Metrics ──────────────────────────────────────────────────────
  const now = new Date();
  const completedTrainings = trainingRecords.filter(
    (r: any) => r.completion_status === 'completed' && new Date(r.expiration_date) > now
  );
  const expiredTrainings = trainingRecords.filter(
    (r: any) => r.completion_status === 'expired' || (r.completion_status === 'completed' && new Date(r.expiration_date) <= now)
  );
  const employeesTrained = completedTrainings.length;
  const employeesTotal = Math.max(staffMembers.length, employeesTrained, trainingRecords.length > 0 ? 1 : 0) || 1;
  const trainingRate = Math.round((employeesTrained / employeesTotal) * 100);

  // ── Action Items Metrics ──────────────────────────────────────────────────
  const pendingActionItems = actionItems.filter(item => item.status === 'pending');
  const criticalItems = pendingActionItems.filter(item => item.priority === 'critical');
  const highItems = pendingActionItems.filter(item => item.priority === 'high');
  const completedItems = actionItems.filter(item => item.status === 'completed');
  const actionItemsRate = actionItems.length > 0
    ? Math.round((completedItems.length / actionItems.length) * 100)
    : 0;

  // ── Evidence Metrics ──────────────────────────────────────────────────────
  const validEvidence = (evidenceStats.by_status as any)['VALID'] || 0;
  const expiredEvidence = (evidenceStats.by_status as any)['EXPIRED'] || 0;
  const evidenceCoverage = evidenceStats.total > 0
    ? Math.round((validEvidence / evidenceStats.total) * 100)
    : 0;

  // ── Risk Level ────────────────────────────────────────────────────────────
  const riskLevel = riskAssessment?.risk_level || 'high';
  const riskColor = riskLevel === 'low' ? '#71bc48' : riskLevel === 'medium' ? '#fbab18' : '#e2231a';
  const riskBg = riskLevel === 'low' ? 'bg-[#71bc48]/10 text-[#71bc48]' : riskLevel === 'medium' ? 'bg-[#fbab18]/10 text-[#fbab18]' : 'bg-[#e2231a]/10 text-[#e2231a]';

  // ── Compliance Score ──────────────────────────────────────────────────────
  const policyScore = Math.round((policiesCompleted / policiesTotal) * 30);
  const trainingScore = Math.round((trainingRate / 100) * 25);
  const actionScore = actionItems.length > 0
    ? Math.round((1 - pendingActionItems.length / actionItems.length) * 25)
    : 25;
  const evidenceScore = evidenceStats.total > 0
    ? Math.round((validEvidence / evidenceStats.total) * 20)
    : 0;
  const complianceScore = Math.min(100, policyScore + trainingScore + actionScore + evidenceScore);
  const scoreColor = complianceScore >= 80 ? '#71bc48' : complianceScore >= 60 ? '#fbab18' : '#e2231a';
  const scoreBg = complianceScore >= 80 ? 'bg-[#71bc48]/10 text-[#71bc48]' : complianceScore >= 60 ? 'bg-[#fbab18]/10 text-[#fbab18]' : 'bg-[#e2231a]/10 text-[#e2231a]';
  const scoreLabel = complianceScore >= 80 ? 'Compliant' : complianceScore >= 60 ? 'Attention Needed' : 'At Risk';

  // SVG circle circumference for score ring
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const scoreOffset = circumference - (complianceScore / 100) * circumference;

  // ── Top Priority Action Items ─────────────────────────────────────────────
  const topActions = [...criticalItems, ...highItems].slice(0, 4);

  // ── Safeguard area progress (based on evidence categories) ────────────────
  const adminEvidence = (evidenceStats.by_category as any)['ADMINISTRATIVE_SAFEGUARDS'] || 0;
  const techEvidence = (evidenceStats.by_category as any)['TECHNICAL_SAFEGUARDS'] || 0;
  const physEvidence = (evidenceStats.by_category as any)['PHYSICAL_SAFEGUARDS'] || 0;
  const totalCatEvidence = adminEvidence + techEvidence + physEvidence || 1;

  // Use policies + training as part of Admin Safeguards score
  const adminScore = Math.min(100, Math.round(
    ((policiesCompleted / policiesTotal) * 50) +
    ((trainingRate / 100) * 30) +
    ((adminEvidence / Math.max(totalCatEvidence, 1)) * 20)
  ));
  const techScore = evidenceStats.total > 0
    ? Math.min(100, Math.round((techEvidence / Math.max(totalCatEvidence, 1)) * 100))
    : 0;
  const physScore = evidenceStats.total > 0
    ? Math.min(100, Math.round((physEvidence / Math.max(totalCatEvidence, 1)) * 100))
    : 0;

  const activityIconColor: Record<string, string> = {
    success: '#71bc48',
    info: '#00bceb',
    warning: '#fbab18',
    error: '#e2231a'
  };

  return (
    <div className="flex flex-col gap-6 font-sans">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex items-end justify-between border-b border-gray-200 pb-3">
        <div>
          <h1 className="text-3xl font-thin text-[#0e274e] leading-tight">Compliance Overview</h1>
          <p className="text-sm text-[#565656] font-light mt-0.5">
            {organization.name} &nbsp;·&nbsp; {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <span className={`text-xs font-light px-3 py-1 ${riskBg}`}>
          {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
        </span>
      </div>

      {/* ── Row 1: Score + 3 KPIs ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* Compliance Score */}
        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardContent className="p-6 flex flex-col items-center">
            <p className="text-sm font-light text-[#565656] mb-3">Compliance Score</p>
            <div className="relative w-[130px] h-[130px]">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r={radius} stroke="#f3f5f9" strokeWidth="8" fill="none" />
                <circle
                  cx="60" cy="60" r={radius}
                  stroke={scoreColor}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${circumference}`}
                  strokeDashoffset={scoreOffset}
                  strokeLinecap="butt"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-light" style={{ color: scoreColor }}>{complianceScore}%</span>
              </div>
            </div>
            <span className={`text-xs font-light px-3 py-1 mt-3 ${scoreBg}`}>{scoreLabel}</span>
          </CardContent>
        </Card>

        {/* Action Items */}
        <Link href="/dashboard/action-items">
          <Card className="border-0 shadow-sm bg-white rounded-none h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-light text-[#565656]">Action Items</p>
                <ListChecks className="h-4 w-4 text-gray-300" />
              </div>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-4xl font-extralight" style={{ color: criticalItems.length > 0 ? '#e2231a' : '#71bc48' }}>{criticalItems.length}</span>
                <span className="text-sm text-[#565656] font-light mb-1">critical</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[#565656] font-light">
                  <span>High priority</span>
                  <span>{highItems.length}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#565656] font-light">
                  <span>Completed</span>
                  <span>{completedItems.length}/{actionItems.length}</span>
                </div>
              </div>
              <div className="mt-4 h-[2px] bg-gray-100 w-full">
                <div className="h-[2px] bg-[#00bceb]" style={{ width: `${actionItemsRate}%` }} />
              </div>
              <p className="text-[11px] text-gray-400 font-light mt-1">{actionItemsRate}% completed</p>
            </CardContent>
          </Card>
        </Link>

        {/* Policies */}
        <Link href="/dashboard/policies">
          <Card className="border-0 shadow-sm bg-white rounded-none h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-light text-[#565656]">Policies</p>
                <FileText className="h-4 w-4 text-gray-300" />
              </div>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-4xl font-extralight text-[#0e274e]">{policiesCompleted}</span>
                <span className="text-sm text-[#565656] font-light mb-1">/ {policiesTotal} generated</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[#565656] font-light">
                  <span>Pending</span>
                  <span>{policiesTotal - policiesCompleted}</span>
                </div>
              </div>
              <div className="mt-4 h-[2px] bg-gray-100 w-full">
                <div
                  className="h-[2px] bg-[#00bceb]"
                  style={{ width: `${Math.round((policiesCompleted / policiesTotal) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-gray-400 font-light mt-1">
                {Math.round((policiesCompleted / policiesTotal) * 100)}% complete
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Staff Training */}
        <Link href="/dashboard/training">
          <Card className="border-0 shadow-sm bg-white rounded-none h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-light text-[#565656]">Staff Training</p>
                <Users className="h-4 w-4 text-gray-300" />
              </div>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-4xl font-extralight text-[#0e274e]">{trainingRate}%</span>
                <span className="text-sm text-[#565656] font-light mb-1">certified</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[#565656] font-light">
                  <span>Trained</span>
                  <span>{employeesTrained} of {employeesTotal}</span>
                </div>
                {expiredTrainings.length > 0 && (
                  <div className="flex items-center justify-between text-xs text-[#565656] font-light">
                    <span>Expired</span>
                    <span className="text-[#e2231a]">{expiredTrainings.length}</span>
                  </div>
                )}
              </div>
              <div className="mt-4 h-[2px] bg-gray-100 w-full">
                <div
                  className="h-[2px] bg-[#00bceb]"
                  style={{ width: `${trainingRate}%` }}
                />
              </div>
              <p className="text-[11px] text-gray-400 font-light mt-1">{employeesTrained} of {employeesTotal} employees</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* ── Row 2: Safeguards + Risk + Activity ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* HIPAA Safeguards Progress */}
        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-light text-[#0e274e]">HIPAA Safeguards</h3>
              <Shield className="h-4 w-4 text-gray-300" />
            </div>
            <div className="space-y-5">
              {[
                { label: 'Administrative', score: adminScore, detail: `${policiesCompleted}/${policiesTotal} policies · ${trainingRate}% training` },
                { label: 'Technical', score: techScore, detail: `${techEvidence} evidence items` },
                { label: 'Physical', score: physScore, detail: `${physEvidence} evidence items` },
              ].map(({ label, score, detail }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-light text-[#565656]">{label}</span>
                    <span className="text-xs font-light text-[#565656]">{score}%</span>
                  </div>
                  <div className="h-[2px] bg-gray-100 w-full">
                    <div className="h-[2px] bg-[#00bceb]" style={{ width: `${score}%` }} />
                  </div>
                  <p className="text-[11px] text-gray-400 font-light mt-1">{detail}</p>
                </div>
              ))}
            </div>

            {/* Evidence summary */}
            <div className="mt-6 pt-5 border-t border-gray-100">
              <p className="text-sm font-light text-[#0e274e] mb-3">Evidence Center</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-[#f3f5f9] p-2.5">
                  <div className="text-xl font-light text-[#0e274e]">{validEvidence}</div>
                  <div className="text-[11px] text-gray-400 font-light mt-0.5">Valid</div>
                </div>
                <div className="bg-[#f3f5f9] p-2.5">
                  <div className="text-xl font-light text-[#0e274e]">{expiredEvidence}</div>
                  <div className="text-[11px] text-gray-400 font-light mt-0.5">Expired</div>
                </div>
                <div className="bg-[#f3f5f9] p-2.5">
                  <div className="text-xl font-light text-[#0e274e]">{evidenceStats.expiring_soon}</div>
                  <div className="text-[11px] text-gray-400 font-light mt-0.5">Expiring</div>
                </div>
              </div>
              <Link href="/dashboard/evidence">
                <Button variant="outline" className="w-full mt-3 border-gray-200 text-[#565656] hover:bg-gray-50 rounded-none font-light text-xs">
                  View Evidence Center
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Status + Priority Action Items */}
        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardContent className="p-6">
            {/* Risk Status */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-5">
              <div className="relative shrink-0">
                <div className="w-11 h-11 rounded-full flex items-center justify-center bg-gray-100">
                  <Shield className="h-5 w-5 text-[#565656]" />
                </div>
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center border-2 border-white"
                  style={{ background: riskColor }}
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-light text-[#0e274e]">
                  {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
                </p>
                <p className="text-[11px] text-gray-400 font-light">
                  {new Date(riskAssessment?.updated_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <Link href="/dashboard/risk-assessment">
                <Button className="bg-[#00bceb] hover:bg-[#00a0c9] text-white rounded-none font-light text-xs px-3 h-7">
                  View
                </Button>
              </Link>
            </div>

            {/* Priority Action Items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-light text-[#0e274e]">Priority Items</p>
                <Link href="/dashboard/action-items" className="text-xs text-[#00bceb] hover:underline font-light">
                  View all
                </Link>
              </div>

              {topActions.length === 0 ? (
                <div className="py-6 text-center">
                  <CheckCircle2 className="h-7 w-7 text-[#71bc48] mx-auto mb-2" />
                  <p className="text-xs text-gray-400 font-light">No critical items pending</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {topActions.map((item: any, i: number) => (
                    <Link key={i} href="/dashboard/action-items">
                      <div className="flex items-start gap-2.5 px-2 py-2.5 hover:bg-[#f3f5f9] transition-colors group">
                        <div
                          className="mt-1.5 w-1.5 h-1.5 shrink-0 rounded-full"
                          style={{ background: item.priority === 'critical' ? '#e2231a' : '#fbab18' }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-light text-[#565656] leading-snug line-clamp-2">
                            {item.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-gray-400 font-light capitalize">{item.priority}</span>
                            {item.due_date && (
                              <span className="text-[11px] text-gray-400 font-light flex items-center gap-1">
                                <Clock className="h-2.5 w-2.5" />
                                {new Date(item.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-gray-200 shrink-0 group-hover:text-[#00bceb] transition-colors mt-0.5" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2">
              <Link href="/dashboard/policies">
                <Button variant="outline" className="w-full border-gray-200 text-[#565656] hover:bg-gray-50 rounded-none font-light text-xs">
                  Generate Policy
                </Button>
              </Link>
              <Link href="/dashboard/training">
                <Button variant="outline" className="w-full border-gray-200 text-[#565656] hover:bg-gray-50 rounded-none font-light text-xs">
                  Add Training
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-light text-[#0e274e]">Recent Activity</h3>
              <TrendingUp className="h-4 w-4 text-gray-300" />
            </div>

            <div className="space-y-4">
              {activityFeed.length > 0 ? (
                activityFeed.map((item: any, i: number) => {
                  const dotColor = activityIconColor[item.status] || '#9ca3af';
                  return (
                    <div key={i} className="flex gap-3 relative">
                      {i !== activityFeed.length - 1 && (
                        <div className="absolute left-[9px] top-5 bottom-[-16px] w-[1px] bg-gray-100" />
                      )}
                      <div className="mt-1 shrink-0 z-10 w-[18px] h-[18px] rounded-full flex items-center justify-center bg-gray-100">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: dotColor }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[#565656] font-light leading-snug">{item.title}</p>
                        <p className="text-[11px] text-gray-400 font-light mt-0.5">{item.date}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center">
                  <Info className="h-7 w-7 text-gray-200 mx-auto mb-2" />
                  <p className="text-xs text-gray-400 font-light">No recent activity</p>
                </div>
              )}
            </div>

            {/* Audit Readiness */}
            <div className="mt-6 pt-5 border-t border-gray-100">
              <p className="text-sm font-light text-[#0e274e] mb-3">Audit Readiness</p>
              <div className="space-y-2.5">
                {[
                  { label: 'Policy documents', done: policiesCompleted === policiesTotal, detail: `${policiesCompleted}/${policiesTotal}` },
                  { label: 'Staff training', done: trainingRate === 100, detail: `${trainingRate}%` },
                  { label: 'Evidence on file', done: validEvidence > 0, detail: `${validEvidence} valid` },
                  { label: 'Risk assessment', done: !!riskAssessment, detail: riskAssessment ? 'Completed' : 'Pending' },
                ].map((check, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {check.done
                        ? <CheckCircle2 className="h-3.5 w-3.5 text-[#71bc48] shrink-0" />
                        : <AlertTriangle className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                      }
                      <span className="text-xs text-[#565656] font-light">{check.label}</span>
                    </div>
                    <span className="text-[11px] text-gray-400 font-light">{check.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
