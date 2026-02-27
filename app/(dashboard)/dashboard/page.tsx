import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  AlertCircle,
  Shield,
  FileText,
  Users,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Clock,
  Calendar,
  Building2,
  Activity
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

  // Get organization ID
  const orgId = (organization as any).id;

  // Fetch all data in parallel
  const [
    { total: policiesTotal, completed: policiesCompleted },
    evidenceStatsResult,
    trainingResult,
    businessAssociatesResult,
    incidentsResult,
    breachNotificationsResult
  ] = await Promise.all([
    getPolicyDocumentsCount(supabase, user.id),
    getEvidenceStatistics().catch(() => ({
      total: 0, by_status: {} as any, by_type: {} as any,
      by_category: {} as any, expiring_soon: 0, requires_review: 0
    })),
    (supabase as any)
      .from('training_records')
      .select('completion_status, expiration_date, user_id, staff_member_id, full_name, training_date')
      .eq('user_id', user.id)
      .order('training_date', { ascending: false }),
    (supabase as any)
      .from('vendors')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .then((result: any) => result.error ? { data: [] } : result)
      .catch(() => ({ data: [] })),
    (supabase as any)
      .from('incident_logs')
      .select('*')
      .eq('organization_id', orgId)
      .order('date_discovered', { ascending: false })
      .then((result: any) => result.error ? { data: [] } : result)
      .catch(() => ({ data: [] })),
    (supabase as any)
      .from('breach_notifications')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(1)
      .then((result: any) => result.error ? { data: [] } : result)
      .catch(() => ({ data: [] }))
  ]);

  // Handle results with error checking
  const evidenceStats = evidenceStatsResult || {
    total: 0, by_status: {} as any, by_type: {} as any,
    by_category: {} as any, expiring_soon: 0, requires_review: 0
  };

  const trainingRecords: any[] = trainingResult?.data || [];
  const vendors: any[] = businessAssociatesResult?.data || [];
  const incidents: any[] = incidentsResult?.data || [];
  const lastBreachNotification = breachNotificationsResult?.data?.[0] || null;

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

  // ── Risk Level ────────────────────────────────────────────────────────────
  const riskLevel = riskAssessment?.risk_level || 'high';
  const riskColor = riskLevel === 'low' ? '#71bc48' : riskLevel === 'medium' ? '#fbab18' : '#e2231a';
  const riskLabel = riskLevel === 'low' ? 'Low Risk' : riskLevel === 'medium' ? 'Moderate Risk' : 'High Risk';

  // ── Compliance Score Calculation ─────────────────────────────────────────
  const policyScore = Math.round((policiesCompleted / policiesTotal) * 30);
  const trainingScore = Math.round((trainingRate / 100) * 25);
  const actionScore = actionItems.length > 0
    ? Math.round((1 - pendingActionItems.length / actionItems.length) * 25)
    : 25;
  const validEvidence = (evidenceStats.by_status as any)['VALID'] || 0;
  const evidenceScore = evidenceStats.total > 0
    ? Math.round((validEvidence / evidenceStats.total) * 20)
    : 0;
  const complianceScore = Math.min(100, policyScore + trainingScore + actionScore + evidenceScore);
  const scoreColor = complianceScore >= 80 ? '#71bc48' : complianceScore >= 60 ? '#fbab18' : '#e2231a';
  const scoreLabel = complianceScore >= 80 ? 'Compliant' : complianceScore >= 60 ? 'Moderate Risk' : 'At Risk';

  // ── Top 3 Active Risks ────────────────────────────────────────────────────
  const topRisks = [...criticalItems, ...highItems].slice(0, 3).map(item => ({
    title: item.title,
    priority: item.priority
  }));

  // ── Open Mitigation Items ─────────────────────────────────────────────────
  const openMitigations = pendingActionItems.length;

  // ── Documentation Health ───────────────────────────────────────────────────
  const riskAssessmentCurrent = !!riskAssessment;
  const nextReviewDate = organization.next_review_date 
    ? new Date(organization.next_review_date)
    : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // Default: 1 year from now

  // ── Vendor & BAA Status ────────────────────────────────────────────────────
  const totalVendors = vendors.length;
  const today = new Date();
  const validBAAs = vendors.filter((v: any) => {
    if (!v.baa_signed || !v.baa_expiration_date) return false;
    const expDate = new Date(v.baa_expiration_date);
    return expDate > today;
  }).length;
  const expiringBAAs = vendors.filter((v: any) => {
    if (!v.baa_expiration_date) return false;
    const expDate = new Date(v.baa_expiration_date);
    const daysUntilExpiry = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  }).length;
  const expiredBAAs = vendors.filter((v: any) => {
    if (!v.baa_expiration_date) return false;
    const expDate = new Date(v.baa_expiration_date);
    return expDate < today;
  }).length;

  // ── Incident Status ───────────────────────────────────────────────────────
  const openIncidents = incidents.filter((inc: any) => inc.status === 'open').length;
  const highSeverityIncidents = incidents.filter((inc: any) => inc.severity === 'high' && inc.status === 'open').length;
  const lastIncident = incidents.length > 0 ? incidents[0] : null;

  // ── Action Center Items ────────────────────────────────────────────────────
  const actionCenterItems: Array<{
    type: 'warning' | 'info';
    text: string;
    link?: string;
  }> = [];

  // Staff training overdue
  if (expiredTrainings.length > 0) {
    actionCenterItems.push({
      type: 'warning',
      text: `Staff training overdue (${expiredTrainings.length} employees)`,
      link: '/dashboard/training'
    });
  }

  // Vendor BAA issues
  if (expiredBAAs > 0) {
    actionCenterItems.push({
      type: 'warning',
      text: `${expiredBAAs} vendor BAA${expiredBAAs > 1 ? 's' : ''} expired`,
      link: '/dashboard/policies/vendors'
    });
  }
  if (expiringBAAs > 0) {
    actionCenterItems.push({
      type: 'warning',
      text: `${expiringBAAs} vendor BAA${expiringBAAs > 1 ? 's' : ''} expiring soon`,
      link: '/dashboard/policies/vendors'
    });
  }
  const missingBAAs = vendors.filter((v: any) => !v.baa_signed && v.has_phi_access).length;
  if (missingBAAs > 0) {
    actionCenterItems.push({
      type: 'warning',
      text: `${missingBAAs} vendor${missingBAAs > 1 ? 's' : ''} with missing BAA${missingBAAs > 1 ? 's' : ''}`,
      link: '/dashboard/policies/vendors'
    });
  }

  // High severity incidents
  if (highSeverityIncidents > 0) {
    actionCenterItems.push({
      type: 'warning',
      text: `${highSeverityIncidents} high severity incident${highSeverityIncidents > 1 ? 's' : ''} requiring attention`,
      link: '/dashboard/breach-notifications/incidents'
    });
  }
  
  // Open incidents older than 7 days
  const staleIncidents = incidents.filter((inc: any) => {
    if (inc.status !== 'open') return false;
    const discoveredDate = new Date(inc.date_discovered);
    const daysSinceDiscovery = (now.getTime() - discoveredDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceDiscovery > 7;
  }).length;
  if (staleIncidents > 0) {
    actionCenterItems.push({
      type: 'warning',
      text: `${staleIncidents} incident${staleIncidents > 1 ? 's' : ''} open for more than 7 days`,
      link: '/dashboard/breach-notifications/incidents'
    });
  }

  // Risk reassessment recommended
  if (riskAssessment) {
    const assessmentDate = new Date(riskAssessment.updated_at || riskAssessment.created_at);
    const monthsSinceAssessment = (now.getTime() - assessmentDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (monthsSinceAssessment >= 11) {
      actionCenterItems.push({
        type: 'warning',
        text: 'Risk reassessment recommended',
        link: '/dashboard/risk-assessment'
      });
    }
  }

  // Policy review approaching
  const daysUntilReview = Math.ceil((nextReviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntilReview <= 30 && daysUntilReview > 0) {
    actionCenterItems.push({
      type: 'warning',
      text: 'Policy review approaching',
      link: '/dashboard/policies'
    });
  }

  // Critical action items
  if (criticalItems.length > 0) {
    actionCenterItems.push({
      type: 'warning',
      text: `${criticalItems.length} critical action item${criticalItems.length > 1 ? 's' : ''} pending`,
      link: '/dashboard/action-items'
    });
  }

  // Last updated date
  const lastUpdated = riskAssessment?.updated_at 
    ? new Date(riskAssessment.updated_at)
    : new Date();

  return (
    <div className="flex flex-col gap-6 font-sans max-w-[1600px] mx-auto">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex items-end justify-between border-b border-gray-200 pb-3">
        <div>
          <h1 className="text-3xl font-thin text-[#0e274e] leading-tight">Compliance Overview</h1>
          <p className="text-sm text-[#565656] font-light mt-0.5">
            {organization.name} &nbsp;·&nbsp; {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* ── 1. COMPLIANCE SCORE (Card grande no topo) ───────────────────── */}
      <Card className="border-0 shadow-sm bg-white rounded-none">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-sm font-light text-[#565656] mb-4 uppercase tracking-wide">Overall Compliance Status</h2>
              <div className="flex items-baseline gap-4 mb-4">
                <span className="text-6xl font-thin text-[#0e274e]">{complianceScore}</span>
                <span className="text-2xl font-thin text-gray-400">/ 100</span>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <span className={`text-sm font-light px-4 py-2 ${scoreColor === '#71bc48' ? 'bg-[#71bc48]/10 text-[#71bc48]' : scoreColor === '#fbab18' ? 'bg-[#fbab18]/10 text-[#fbab18]' : 'bg-[#e2231a]/10 text-[#e2231a]'}`}>
                  {scoreLabel}
                </span>
                <span className="text-xs text-gray-400 font-light">
                  Last Updated: {lastUpdated.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center gap-6 text-xs text-gray-500 font-light">
                <span>Next Review: {nextReviewDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
            <div className="w-32 h-32 relative">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" stroke="#f3f5f9" strokeWidth="8" fill="none" />
                <circle
                  cx="60" cy="60"
                  r="52"
                  stroke={scoreColor}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 52}`}
                  strokeDashoffset={`${2 * Math.PI * 52 * (1 - complianceScore / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-thin" style={{ color: scoreColor }}>{complianceScore}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 2. RISK STATUS (3 cards menores) ─────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardContent className="p-6">
            <h3 className="text-sm font-light text-[#0e274e] mb-4">Current Risk Level</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: `${riskColor}20` }}>
                <Shield className="h-6 w-6" style={{ color: riskColor }} />
              </div>
              <div>
                <p className="text-xl font-thin text-[#0e274e]">{riskLabel}</p>
                <p className="text-xs text-gray-400 font-light">
                  {riskAssessment ? 'Assessment completed' : 'No assessment yet'}
                </p>
              </div>
            </div>
            <Link href="/dashboard/risk-assessment">
              <Button variant="outline" className="w-full border-gray-200 text-[#565656] hover:bg-gray-50 rounded-none font-light text-xs mt-4">
                View Assessment
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardContent className="p-6">
            <h3 className="text-sm font-light text-[#0e274e] mb-4">Top 3 Active Risks</h3>
            {topRisks.length > 0 ? (
              <div className="space-y-3">
                {topRisks.map((risk, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${risk.priority === 'critical' ? 'bg-[#e2231a]' : 'bg-[#fbab18]'}`} />
                    <p className="text-xs text-[#565656] font-light flex-1 leading-snug">{risk.title}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center">
                <CheckCircle2 className="h-6 w-6 text-[#71bc48] mx-auto mb-2" />
                <p className="text-xs text-gray-400 font-light">No active risks</p>
              </div>
            )}
            <Link href="/dashboard/action-items">
              <Button variant="outline" className="w-full border-gray-200 text-[#565656] hover:bg-gray-50 rounded-none font-light text-xs mt-4">
                View All Risks
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardContent className="p-6">
            <h3 className="text-sm font-light text-[#0e274e] mb-4">Open Mitigation Items</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100">
                <AlertTriangle className="h-6 w-6 text-[#565656]" />
              </div>
              <div>
                <p className="text-2xl font-thin text-[#0e274e]">{openMitigations}</p>
                <p className="text-xs text-gray-400 font-light">Items pending</p>
              </div>
            </div>
            <Link href="/dashboard/action-items">
              <Button variant="outline" className="w-full border-gray-200 text-[#565656] hover:bg-gray-50 rounded-none font-light text-xs mt-4">
                View Action Items
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* ── 3. DOCUMENTATION HEALTH ──────────────────────────────────────── */}
      <Card className="border-0 shadow-sm bg-white rounded-none">
        <CardHeader className="border-b border-gray-100 pb-4">
          <CardTitle className="text-base font-light text-[#0e274e]">Documentation Health</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div>
              <p className="text-xs text-gray-400 font-light mb-1">Policies Up to Date</p>
              <p className="text-2xl font-thin text-[#0e274e]">{policiesCompleted} / {policiesTotal}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-light mb-1">Staff Training Completed</p>
              <p className="text-2xl font-thin text-[#0e274e]">{trainingRate}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-light mb-1">Risk Assessment Current</p>
              <p className="text-2xl font-thin text-[#0e274e]">{riskAssessmentCurrent ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-light mb-1">BAAs Valid</p>
              <p className="text-2xl font-thin text-[#0e274e]">{validBAAs} / {totalVendors || 0}</p>
              {expiringBAAs > 0 && (
                <p className="text-xs text-yellow-600 mt-1">{expiringBAAs} expiring soon</p>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-400 font-light mb-1">Next Policy Review Due</p>
              <p className="text-sm font-thin text-[#0e274e]">{nextReviewDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 4. INCIDENT & VENDOR STATUS ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-base font-light text-[#0e274e]">Incidents</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 font-light mb-1">Open Incidents</p>
                <p className="text-2xl font-thin text-[#0e274e]">{openIncidents}</p>
              </div>
              {lastIncident ? (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400 font-light mb-1">Last Incident</p>
                  <p className="text-sm font-thin text-[#0e274e] mb-1">{new Date(lastIncident.date_discovered).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                  <p className="text-xs text-gray-500 font-light">Status: {lastIncident.status === 'open' ? 'Open' : lastIncident.status === 'under_review' ? 'Under Review' : 'Closed'}</p>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400 font-light">No incidents reported</p>
                </div>
              )}
              {highSeverityIncidents > 0 && (
                <div className="pt-2">
                  <p className="text-xs text-red-600 font-light">{highSeverityIncidents} high severity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-base font-light text-[#0e274e]">Vendors</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 font-light mb-1">Total Vendors</p>
                <p className="text-2xl font-thin text-[#0e274e]">{totalVendors}</p>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 font-light mb-1">BAAs Expiring in 30 days</p>
                <p className={`text-2xl font-thin ${expiringBAAs > 0 ? 'text-[#fbab18]' : 'text-[#0e274e]'}`}>{expiringBAAs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── 5. ACTION CENTER (Lista vertical) ────────────────────────────── */}
      <Card className="border-0 shadow-sm bg-white rounded-none">
        <CardHeader className="border-b border-gray-100 pb-4">
          <CardTitle className="text-base font-light text-[#0e274e]">Action Center</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {actionCenterItems.length > 0 ? (
            <div className="space-y-3">
              {actionCenterItems.map((item, i) => (
                <Link key={i} href={item.link || '#'}>
                  <div className="flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors group">
                    <AlertTriangle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${item.type === 'warning' ? 'text-[#fbab18]' : 'text-[#00bceb]'}`} />
                    <p className="text-sm text-[#565656] font-light flex-1">{item.text}</p>
                    <span className="text-xs text-gray-400 group-hover:text-[#00bceb] transition-colors">View →</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <CheckCircle2 className="h-10 w-10 text-[#71bc48] mx-auto mb-3" />
              <p className="text-sm text-gray-500 font-light">All compliance items are up to date.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
