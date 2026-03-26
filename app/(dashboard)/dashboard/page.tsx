import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  AlertCircle,
  Shield,
  FileText,
  Users,
  AlertTriangle,
  Clock,
  Calendar,
  Building2,
  Activity,
  ArrowRight,
  Download,
  FileCheck,
  UserCheck,
  FileX,
  XCircle,
  GraduationCap,
  Package,
  FolderOpen,
  UserPlus
} from 'lucide-react';
import Link from 'next/link';
import {
  getCachedUser,
  getCachedDashboardData
} from '@/lib/cache/dashboard-cache';
import { getPolicyDocumentsCount } from '@/utils/supabase/queries';
import { getEvidenceStatistics } from '@/app/actions/compliance-evidence';
import { getRecentActivity } from '@/lib/activity-feed';
import { getUserPlanTier, isPracticePlus } from '@/lib/plan-gating';
import { getMitigationItems } from '@/app/actions/mitigation';
import { OnboardingChecklist } from '@/components/dashboard/onboarding-checklist';
import { LockedIndicator } from '@/components/locked-indicator';

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
  const orgId = (organization as any).id;

  // Fetch plan tier + all data in parallel
  const planTier = await getUserPlanTier();
  const hasPractice = isPracticePlus(planTier);

  const [
    { total: policiesTotal, completed: policiesCompleted },
    evidenceStatsResult,
    trainingResult,
    businessAssociatesResult,
    incidentsResult,
    mitigationResult,
    practiceTrainingResult,
    practiceBAAResult,
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
    // Mitigation items for Action Center
    getMitigationItems().catch(() => [] as any[]),
    // Practice plan: staff training compliance %
    hasPractice
      ? (supabase as any)
          .from('training_assignments')
          .select('status')
          .eq('org_id', orgId)
          .then((r: any) => r.data ?? [])
          .catch(() => [])
      : Promise.resolve(null),
    // Practice plan: BAAs from dedicated baas table
    hasPractice
      ? (supabase as any)
          .from('baas')
          .select('status, vendor_id')
          .eq('org_id', orgId)
          .then((r: any) => r.data ?? [])
          .catch(() => [])
      : Promise.resolve(null),
  ]);

  const evidenceStats = evidenceStatsResult || {
    total: 0, by_status: {} as any, by_type: {} as any,
    by_category: {} as any, expiring_soon: 0, requires_review: 0
  };

  const trainingRecords: any[] = trainingResult?.data || [];
  const vendors: any[] = businessAssociatesResult?.data || [];
  const incidents: any[] = incidentsResult?.data || [];

  // ── Training Metrics ──────────────────────────────────────────────────────
  const now = new Date();
  const completedTrainings = trainingRecords.filter(
    (r: any) => r.completion_status === 'completed' && new Date(r.expiration_date) > now
  );
  const employeesTrained = completedTrainings.length;
  const employeesTotal = Math.max(staffMembers.length, employeesTrained, trainingRecords.length > 0 ? 1 : 0) || 1;
  const trainingRate = Math.round((employeesTrained / employeesTotal) * 100);

  // ── Action Items Metrics ──────────────────────────────────────────────────
  const pendingActionItems = actionItems.filter(item => item.status === 'pending');
  const criticalItems = pendingActionItems.filter(item => item.priority === 'critical');
  const highItems = pendingActionItems.filter(item => item.priority === 'high');

  // ── Compliance Score Calculation (4 components, 25 pts each) ─────────────
  // 1. Documentation (Policies) - 25 pts
  const documentationScore = Math.round((policiesCompleted / Math.max(policiesTotal, 9)) * 25);

  // 2. Risk Management - 25 pts (based on risk assessment)
  const hasRiskAssessment = !!riskAssessment;
  const riskAssessmentDate = riskAssessment?.updated_at || riskAssessment?.created_at;
  let riskManagementScore = 0;
  if (hasRiskAssessment && riskAssessmentDate) {
    const assessmentDate = new Date(riskAssessmentDate);
    const monthsSinceAssessment = (now.getTime() - assessmentDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (monthsSinceAssessment <= 12) {
      riskManagementScore = 25; // Current
    } else if (monthsSinceAssessment <= 24) {
      riskManagementScore = 15; // Outdated
    } else {
      riskManagementScore = 5; // Very outdated
    }
  }

  // 3. Training - 25 pts
  // Practice+: use staff training assignments. Solo: always 25 (not applicable).
  let trainingScore: number;
  if (!hasPractice) {
    trainingScore = 25; // Solo plan: not applicable, full score
  } else if (practiceTrainingResult && (practiceTrainingResult as any[]).length > 0) {
    const allAssignments = practiceTrainingResult as any[];
    const completedAssignments = allAssignments.filter((a) => a.status === 'completed').length;
    const staffPctTrained = completedAssignments / allAssignments.length;
    trainingScore = Math.round(staffPctTrained * 25);
  } else {
    // Fall back to legacy training records
    trainingScore = Math.round((trainingRate / 100) * 25);
  }

  // 4. Vendor/BAA Control - 25 pts
  // Practice+: use dedicated baas table. Solo: use vendors.baa_signed.
  const today = new Date();
  let validBAAs: number;
  let totalVendorsWithPHI: number;
  let baaScore: number;

  if (hasPractice && practiceBAAResult) {
    const allBaas = practiceBAAResult as any[];
    validBAAs = allBaas.filter((b) => b.status === 'active').length;
    totalVendorsWithPHI = allBaas.length || 1;
    baaScore = Math.round((validBAAs / totalVendorsWithPHI) * 25);
  } else {
    validBAAs = vendors.filter((v: any) => {
      if (!v.baa_signed || !v.baa_expiration_date) return false;
      return new Date(v.baa_expiration_date) > today;
    }).length;
    totalVendorsWithPHI = vendors.filter((v: any) => v.has_phi_access).length || 1;
    baaScore = Math.round((validBAAs / totalVendorsWithPHI) * 25);
  }

  const openIncidents = incidents.filter((inc: any) => inc.status === 'open').length;
  const incidentVendorScore = Math.min(25, baaScore);

  const complianceScore = documentationScore + riskManagementScore + trainingScore + incidentVendorScore;
  const scoreTier = complianceScore < 40 ? 'low' : complianceScore < 70 ? 'medium' : 'high';
  const scoreColor = scoreTier === 'high' ? '#1ad07a' : scoreTier === 'medium' ? '#fbab18' : '#e2231a';
  const scoreLabel = scoreTier === 'high' ? 'Protected' : scoreTier === 'medium' ? 'Partial' : 'At Risk';

  // ── Header Contextual Status ─────────────────────────────────────────────
  const getHeaderStatus = () => {
    if (complianceScore < 40) {
      const criticalGaps = [
        policiesCompleted === 0 ? 'policies' : null,
        !hasRiskAssessment ? 'risk assessment' : null,
        trainingRate === 0 ? 'training' : null,
        validBAAs === 0 && totalVendorsWithPHI > 0 ? 'BAAs' : null
      ].filter(Boolean);
      const gapCount = criticalGaps.length;
      return {
        title: `Your practice is not yet protected — ${gapCount} critical step${gapCount > 1 ? 's' : ''} remaining`,
        subtitle: criticalGaps.slice(0, 2).join(' and ')
      };
    } else if (complianceScore < 70) {
      const gaps = [
        policiesCompleted < policiesTotal ? 'policies' : null,
        trainingRate < 100 ? 'training' : null,
        validBAAs < totalVendorsWithPHI ? 'BAAs' : null
      ].filter(Boolean);
      const gapCount = gaps.length;
      return {
        title: `Your practice is partially protected — ${gapCount} gap${gapCount > 1 ? 's' : ''} need attention`,
        subtitle: gaps.slice(0, 2).join(' and ')
      };
    } else {
      const lastReviewDate = riskAssessmentDate 
        ? new Date(riskAssessmentDate)
        : new Date();
      return {
        title: `Your practice is protected — last reviewed ${lastReviewDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
        subtitle: 'All critical compliance requirements are met'
      };
    }
  };

  const headerStatus = getHeaderStatus();
  const lastUpdated = riskAssessmentDate ? new Date(riskAssessmentDate) : new Date();
  const nextReviewDate = organization.next_review_date 
    ? new Date(organization.next_review_date)
    : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  // ── Onboarding Checklist (shown when score < 30) ─────────────────────────
  const onboardingItems = [
    {
      id: 'policies',
      label: 'Activate at least one policy',
      description: 'Your Privacy Policy or Security Policy protects you from OCR fines',
      completed: policiesCompleted > 0,
      link: '/dashboard/policies',
      cta: 'Go to Policies',
    },
    {
      id: 'risk',
      label: 'Complete your Risk Assessment',
      description: 'A documented Security Risk Analysis is federally required',
      completed: !!hasRiskAssessment,
      link: '/dashboard/risk-assessment',
      cta: 'Run Assessment',
    },
    {
      id: 'training',
      label: hasPractice ? 'Add at least one employee to training' : 'Complete your own HIPAA training',
      description: hasPractice
        ? 'Assign training to one staff member to get started'
        : 'Complete the HIPAA awareness module to satisfy training requirements',
      completed: hasPractice ? (staffMembers.length > 0 || trainingRecords.length > 0) : trainingRecords.some((r: any) => r.completion_status === 'completed'),
      link: '/dashboard/training',
      cta: hasPractice ? 'Add Employee' : 'Start Training',
    },
    {
      id: 'evidence',
      label: 'Upload a compliance document',
      description: 'Add your first piece of evidence to the Evidence Center',
      completed: evidenceStats.total > 0,
      link: '/dashboard/evidence',
      cta: 'Upload Document',
    },
  ];
  const onboardingCompleted = onboardingItems.filter((i) => i.completed).length;
  const showOnboarding = complianceScore < 40 && onboardingCompleted < onboardingItems.length;

  // ── Mitigation items for Action Center ───────────────────────────────────
  const openMitigationItems = (Array.isArray(mitigationResult) ? mitigationResult : [])
    .filter((m: any) => m.status === 'open' || m.status === 'in_progress')
    .sort((a: any, b: any) => {
      const priorityRank: Record<string, number> = { high: 0, medium: 1, low: 2 };
      return (priorityRank[a.priority] ?? 2) - (priorityRank[b.priority] ?? 2);
    });

  // ── Action Center Items (max 3, prioritized) ────────────────────────────
  const actionCenterItems: Array<{
    severity: 'critical' | 'warning' | 'info';
    title: string;
    description: string;
    link: string;
    icon: React.ReactNode;
  }> = [];

  // Priority 1: Missing policies
  if (policiesCompleted === 0) {
    actionCenterItems.push({
      severity: 'critical',
      title: 'Activate your Privacy Policy',
      description: 'Missing policies are the #1 reason OCR fines small practices',
      link: '/dashboard/policies',
      icon: <FileX className="w-5 h-5" />
    });
  }

  // Priority 2: No training
  if (trainingRate === 0) {
    actionCenterItems.push({
      severity: 'critical',
      title: 'Add employees to HIPAA training',
      description: '0% completion leaves you exposed',
      link: '/dashboard/training',
      icon: <UserCheck className="w-5 h-5" />
    });
  }

  // Priority 3: Missing BAAs
  const missingBAAs = vendors.filter((v: any) => !v.baa_signed && v.has_phi_access).length;
  if (missingBAAs > 0) {
    actionCenterItems.push({
      severity: 'warning',
      title: `Register your first vendor BAA`,
      description: 'Every vendor handling PHI needs a signed agreement',
      link: '/dashboard/policies/vendors',
      icon: <FileCheck className="w-5 h-5" />
    });
  }

  // If we have less than 3, add more based on priority
  if (actionCenterItems.length < 3) {
    if (!hasRiskAssessment) {
      actionCenterItems.push({
        severity: 'critical',
        title: 'Complete your Risk Assessment',
        description: 'A documented Risk Assessment is federally required',
        link: '/dashboard/risk-assessment',
        icon: <Shield className="w-5 h-5" />
      });
    }
  }

  if (actionCenterItems.length < 3 && policiesCompleted > 0 && policiesCompleted < policiesTotal) {
    actionCenterItems.push({
      severity: 'warning',
      title: `Complete remaining policies (${policiesTotal - policiesCompleted} left)`,
      description: 'All 9 HIPAA policies must be active',
      link: '/dashboard/policies',
      icon: <FileText className="w-5 h-5" />
    });
  }

  // Fill remaining slots with top open mitigation items
  if (actionCenterItems.length < 3 && openMitigationItems.length > 0) {
    const remaining = 3 - actionCenterItems.length;
    for (const mItem of openMitigationItems.slice(0, remaining)) {
      actionCenterItems.push({
        severity: mItem.priority === 'high' ? 'critical' : mItem.priority === 'medium' ? 'warning' : 'info',
        title: mItem.title,
        description: mItem.description ?? 'Open mitigation task',
        link: '/dashboard/mitigation',
        icon: <Shield className="w-5 h-5" />,
      });
    }
  }

  // Limit to 3
  const prioritizedActions = actionCenterItems.slice(0, 3);
  const totalActionItems = pendingActionItems.length;

  // ── Vendor & BAA Status ────────────────────────────────────────────────────
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
  const lastIncident = incidents.length > 0 ? incidents[0] : null;
  const highSeverityIncidents = incidents.filter((inc: any) => inc.severity === 'high' && inc.status === 'open').length;

  // ── Compliance Timeline Events ───────────────────────────────────────────
  const timelineEvents: Array<{
    date: Date;
    type: 'policy_review' | 'training_renewal' | 'baa_expiration' | 'risk_assessment';
    title: string;
    status: 'upcoming' | 'due_soon' | 'overdue';
    icon: React.ReactNode;
  }> = [];

  // Policy review
  const daysUntilPolicyReview = Math.ceil((nextReviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntilPolicyReview <= 365) {
    timelineEvents.push({
      date: nextReviewDate,
      type: 'policy_review',
      title: 'Annual Policy Review due',
      status: daysUntilPolicyReview <= 30 ? (daysUntilPolicyReview < 0 ? 'overdue' : 'due_soon') : 'upcoming',
      icon: <FileText className="w-4 h-4" />
    });
  }

  // Training renewals
  const trainingExpirations = trainingRecords
    .filter((r: any) => r.expiration_date)
    .map((r: any) => new Date(r.expiration_date))
    .filter((d: Date) => d > now && d.getTime() - now.getTime() <= 365 * 24 * 60 * 60 * 1000)
    .sort((a: Date, b: Date) => a.getTime() - b.getTime());
  
  if (trainingExpirations.length > 0) {
    const nextTrainingExpiry = trainingExpirations[0];
    const daysUntilTraining = Math.ceil((nextTrainingExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    timelineEvents.push({
      date: nextTrainingExpiry,
      type: 'training_renewal',
      title: `Staff training renewal (${trainingExpirations.length} employee${trainingExpirations.length > 1 ? 's' : ''})`,
      status: daysUntilTraining <= 30 ? (daysUntilTraining < 0 ? 'overdue' : 'due_soon') : 'upcoming',
      icon: <Users className="w-4 h-4" />
    });
  }

  // BAA expirations
  const baaExpirations = vendors
    .filter((v: any) => v.baa_expiration_date)
    .map((v: any) => ({
      date: new Date(v.baa_expiration_date),
      name: v.vendor_name
    }))
    .filter((v: any) => v.date > now && v.date.getTime() - now.getTime() <= 365 * 24 * 60 * 60 * 1000)
    .sort((a: any, b: any) => a.date.getTime() - b.date.getTime());

  if (baaExpirations.length > 0) {
    const nextBAAExpiry = baaExpirations[0];
    const daysUntilBAA = Math.ceil((nextBAAExpiry.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    timelineEvents.push({
      date: nextBAAExpiry.date,
      type: 'baa_expiration',
      title: `BAA expiration: ${nextBAAExpiry.name}`,
      status: daysUntilBAA <= 30 ? (daysUntilBAA < 0 ? 'overdue' : 'due_soon') : 'upcoming',
      icon: <FileCheck className="w-4 h-4" />
    });
  }

  // Risk Assessment
  if (riskAssessmentDate) {
    const assessmentDate = new Date(riskAssessmentDate);
    const nextAssessmentDate = new Date(assessmentDate);
    nextAssessmentDate.setFullYear(nextAssessmentDate.getFullYear() + 1);
    const daysUntilAssessment = Math.ceil((nextAssessmentDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilAssessment <= 365) {
      timelineEvents.push({
        date: nextAssessmentDate,
        type: 'risk_assessment',
        title: 'Risk Assessment valid until',
        status: daysUntilAssessment <= 90 ? (daysUntilAssessment < 0 ? 'overdue' : 'due_soon') : 'upcoming',
        icon: <Shield className="w-4 h-4" />
      });
    }
  }

  // Sort timeline by date
  timelineEvents.sort((a, b) => a.date.getTime() - b.date.getTime());

  // ── Upcoming Expirations (next 90 days) ───────────────────────────────────
  const ninety = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  interface ExpirationItem {
    label: string;
    category: string;
    daysLeft: number;
    date: Date;
    link: string;
    isOverdue: boolean;
  }
  const upcomingExpirations: ExpirationItem[] = [];

  // Individual training expirations within 90 days
  trainingRecords
    .filter((r: any) => r.expiration_date && r.completion_status === 'completed')
    .forEach((r: any) => {
      const d = new Date(r.expiration_date);
      const daysLeft = Math.ceil((d.getTime() - now.getTime()) / 86400000);
      if (daysLeft <= 90) {
        upcomingExpirations.push({
          label: `${r.full_name} — training expires`,
          category: 'Training',
          daysLeft,
          date: d,
          link: '/dashboard/training',
          isOverdue: daysLeft < 0,
        });
      }
    });

  // Individual BAA expirations within 90 days
  vendors
    .filter((v: any) => v.baa_expiration_date)
    .forEach((v: any) => {
      const d = new Date(v.baa_expiration_date);
      const daysLeft = Math.ceil((d.getTime() - now.getTime()) / 86400000);
      if (daysLeft <= 90) {
        upcomingExpirations.push({
          label: `${v.vendor_name} — BAA expires`,
          category: 'BAA',
          daysLeft,
          date: d,
          link: '/dashboard/policies/vendors',
          isOverdue: daysLeft < 0,
        });
      }
    });

  // Risk Assessment expiration
  if (riskAssessmentDate) {
    const assessmentDate = new Date(riskAssessmentDate);
    const nextAssessment = new Date(assessmentDate);
    nextAssessment.setFullYear(nextAssessment.getFullYear() + 1);
    const daysLeft = Math.ceil((nextAssessment.getTime() - now.getTime()) / 86400000);
    if (daysLeft <= 90) {
      upcomingExpirations.push({
        label: 'Annual Risk Assessment due',
        category: 'Risk Assessment',
        daysLeft,
        date: nextAssessment,
        link: '/dashboard/risk-assessment',
        isOverdue: daysLeft < 0,
      });
    }
  }

  // Sort: overdue first, then by days remaining
  upcomingExpirations.sort((a, b) => a.daysLeft - b.daysLeft);

  // ── Recent Activity Feed ──────────────────────────────────────────────────
  const recentActivity = await getRecentActivity(10);

  // ── Context Line Below Score ──────────────────────────────────────────────
  const getScoreContext = () => {
    if (complianceScore < 40) {
      return 'A practice at this score level faces $50k–$250k in potential OCR fines';
    } else if (complianceScore < 70) {
      return 'You\'re in the top 40% of practices at your size — 2 gaps remain';
    } else {
      return 'Audit-ready. Your evidence package can be exported in one click.';
    }
  };

  return (
    <div className="flex flex-col gap-8 font-sans max-w-[1600px] mx-auto px-4 md:px-8">
      {/* ── 1. Header Contextual ───────────────────────────────────────────── */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl md:text-3xl font-thin text-[#0e274e] leading-tight mb-2">
          {headerStatus.title}
        </h1>
        <p className="text-sm text-[#565656] font-thin">
          {organization.name} · Last updated {lastUpdated.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · Next review {nextReviewDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* ── 1b. No-plan banner ───────────────────────────────────────────── */}
      {planTier === 'unknown' && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#0e274e] text-white px-6 py-4">
          <div className="flex items-start sm:items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-[#00bceb] shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <p className="text-sm font-light">You don&apos;t have an active plan.</p>
              <p className="text-xs text-white/60 font-light mt-0.5">
                Export, certificates, and Practice features are locked until you activate a plan.
              </p>
            </div>
          </div>
          <Link href="/select-plan" className="shrink-0">
            <button className="bg-[#00bceb] hover:bg-[#00a8d4] text-white text-sm font-light px-5 py-2 flex items-center gap-2 transition-colors whitespace-nowrap">
              Choose a plan
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      )}

      {/* ── 1c. Onboarding Checklist (new users, score < 40) ─────────────── */}
      {showOnboarding && <OnboardingChecklist items={onboardingItems} />}

      {/* ── 2. Compliance Score Gauge ─────────────────────────────────────── */}
      <Card className="border-0 shadow-sm bg-white rounded-none">
        <CardContent className="p-8 md:p-12">
          <div className="grid md:grid-cols-[auto_1fr] gap-8 md:gap-12 items-center">
            {/* Gauge Circle */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-48 h-48 md:w-64 md:h-64">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="85" stroke="#f3f5f9" strokeWidth="20" fill="none" />
                  <circle
                    cx="100"
                    cy="100"
                    r="85"
                    stroke={scoreColor}
                    strokeWidth="20"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 85}`}
                    strokeDashoffset={`${2 * Math.PI * 85 * (1 - complianceScore / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl md:text-6xl font-thin text-[#0e274e]" style={{ color: scoreColor }}>
                    {complianceScore}
                  </span>
                  <span className="text-sm md:text-base font-thin text-gray-500 mt-1" style={{ color: scoreColor }}>
                    {scoreLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-thin text-[#565656]">Documentation</span>
                  <span className="text-sm font-thin text-[#0e274e]">{documentationScore} / 25 pts</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all"
                    style={{ 
                      width: `${(documentationScore / 25) * 100}%`,
                      backgroundColor: documentationScore >= 20 ? '#1ad07a' : documentationScore >= 10 ? '#fbab18' : '#e2231a'
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-thin text-[#565656]">Risk Management</span>
                  <span className="text-sm font-thin text-[#0e274e]">{riskManagementScore} / 25 pts</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all"
                    style={{ 
                      width: `${(riskManagementScore / 25) * 100}%`,
                      backgroundColor: riskManagementScore >= 20 ? '#1ad07a' : riskManagementScore >= 10 ? '#fbab18' : '#e2231a'
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-thin text-[#565656]">Training</span>
                  <span className="text-sm font-thin text-[#0e274e]">{trainingScore} / 25 pts</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all"
                    style={{ 
                      width: `${(trainingScore / 25) * 100}%`,
                      backgroundColor: trainingScore >= 20 ? '#1ad07a' : trainingScore >= 10 ? '#fbab18' : '#e2231a'
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-thin text-[#565656]">Incident & Vendor Control</span>
                  <span className="text-sm font-thin text-[#0e274e]">{incidentVendorScore} / 25 pts</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all"
                    style={{ 
                      width: `${(incidentVendorScore / 25) * 100}%`,
                      backgroundColor: incidentVendorScore >= 20 ? '#1ad07a' : incidentVendorScore >= 10 ? '#fbab18' : '#e2231a'
                    }}
                  />
                </div>
              </div>

              <p className="text-xs text-gray-500 font-thin mt-4 pt-4 border-t border-gray-100">
                {getScoreContext()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 3. Action Center (max 3 cards) ─────────────────────────────────── */}
      {prioritizedActions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-thin text-[#0e274e]">Action Center</h2>
            {totalActionItems > 3 && (
              <Link href="/dashboard/action-items" className="text-sm font-thin text-[#0175a2] hover:underline">
                View all action items ({totalActionItems})
              </Link>
            )}
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {prioritizedActions.map((action, i) => (
              <Card key={i} className="border-0 shadow-sm bg-white rounded-none">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        action.severity === 'critical' ? 'bg-red-50 text-red-600' :
                        action.severity === 'warning' ? 'bg-yellow-50 text-yellow-600' :
                        'bg-blue-50 text-blue-600'
                      }`}
                    >
                      {action.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-thin text-[#0e274e] mb-1">{action.title}</h3>
                      <p className="text-xs text-gray-500 font-thin leading-relaxed">{action.description}</p>
                    </div>
                  </div>
                  <Link href={action.link}>
                    <Button 
                      className={`w-full rounded-none font-thin text-xs ${
                        action.severity === 'critical' 
                          ? 'bg-[#e2231a] text-white hover:bg-[#c01e17]' 
                          : 'bg-[#0175a2] text-white hover:bg-[#0e274e]'
                      }`}
                    >
                      {action.severity === 'critical' ? 'Activate now' : action.severity === 'warning' ? 'Fix now' : 'View'} <ArrowRight className="w-3 h-3 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── 4. Documentation Health (4 cards) ──────────────────────────────── */}
      <div>
        <h2 className="text-xl font-thin text-[#0e274e] mb-4">Documentation Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Policies Card */}
          <Card className="border-0 shadow-sm bg-white rounded-none">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-5 h-5 text-[#0175a2]" />
                <h3 className="text-sm font-thin text-[#0e274e]">Policies</h3>
              </div>
              {policiesCompleted === 0 ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-thin text-red-600">No policies active</span>
                  </div>
                  <Link href="/dashboard/policies">
                    <Button className="w-full rounded-none font-thin text-xs bg-[#0175a2] text-white hover:bg-[#0e274e]">
                      Activate policies <ArrowRight className="w-3 h-3 ml-2" />
                    </Button>
                  </Link>
                </>
              ) : policiesCompleted < policiesTotal ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-thin text-[#0e274e]">{policiesCompleted} of {policiesTotal} active</span>
                  </div>
                  <Link href="/dashboard/policies">
                    <Button variant="outline" className="w-full rounded-none font-thin text-xs border-gray-200 text-[#565656] hover:bg-gray-50">
                      Complete remaining <ArrowRight className="w-3 h-3 ml-2" />
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-thin text-green-600">All {policiesTotal} policies active</span>
                  </div>
                  <Link href="/dashboard/policies">
                    <Button variant="outline" className="w-full rounded-none font-thin text-xs border-gray-200 text-[#565656] hover:bg-gray-50">
                      View policies
                    </Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>

          {/* Training Card */}
          <Card className="border-0 shadow-sm bg-white rounded-none">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-5 h-5 text-[#0175a2]" />
                <h3 className="text-sm font-thin text-[#0e274e]">Staff Training</h3>
              </div>
              {!hasPractice ? (
                <>
                  <div className="mb-3">
                    <LockedIndicator requiredPlan="practice" />
                  </div>
                  <p className="text-xs text-gray-400 font-thin">Staff training tracker requires Practice plan</p>
                </>
              ) : trainingRate === 0 ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-thin text-red-600">0% completion</span>
                  </div>
                  <Link href="/dashboard/training">
                    <Button className="w-full rounded-none font-thin text-xs bg-[#0175a2] text-white hover:bg-[#0e274e]">
                      Add team members <ArrowRight className="w-3 h-3 ml-2" />
                    </Button>
                  </Link>
                </>
              ) : trainingRate < 100 ? (
                <>
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-thin text-[#0e274e]">{trainingRate}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-500"
                        style={{ width: `${trainingRate}%` }}
                      />
                    </div>
                  </div>
                  <Link href="/dashboard/training">
                    <Button variant="outline" className="w-full rounded-none font-thin text-xs border-gray-200 text-[#565656] hover:bg-gray-50">
                      Complete training
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-thin text-green-600">100% complete</span>
                  </div>
                  <p className="text-xs text-gray-500 font-thin mb-3">
                    Last completed: {completedTrainings.length > 0 && completedTrainings[0].training_date 
                      ? new Date(completedTrainings[0].training_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                      : 'N/A'}
                  </p>
                  <Link href="/dashboard/training">
                    <Button variant="outline" className="w-full rounded-none font-thin text-xs border-gray-200 text-[#565656] hover:bg-gray-50">
                      View records
                    </Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>

          {/* Risk Assessment Card */}
          <Card className="border-0 shadow-sm bg-white rounded-none">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-5 h-5 text-[#0175a2]" />
                <h3 className="text-sm font-thin text-[#0e274e]">Risk Assessment</h3>
              </div>
              {!hasRiskAssessment ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-thin text-red-600">Not completed</span>
                  </div>
                  <Link href="/dashboard/risk-assessment">
                    <Button className="w-full rounded-none font-thin text-xs bg-[#0175a2] text-white hover:bg-[#0e274e]">
                      Run assessment <ArrowRight className="w-3 h-3 ml-2" />
                    </Button>
                  </Link>
                </>
              ) : (() => {
                const assessmentDate = new Date(riskAssessmentDate!);
                const daysUntilExpiry = Math.ceil((assessmentDate.getTime() + 365 * 24 * 60 * 60 * 1000 - now.getTime()) / (1000 * 60 * 60 * 24));
                if (daysUntilExpiry < 0) {
                  return (
                    <>
                      <div className="flex items-center gap-2 mb-3">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-thin text-red-600">Overdue</span>
                      </div>
                      <Link href="/dashboard/risk-assessment">
                        <Button className="w-full rounded-none font-thin text-xs bg-[#e2231a] text-white hover:bg-[#c01e17]">
                          Re-run assessment <ArrowRight className="w-3 h-3 ml-2" />
                        </Button>
                      </Link>
                    </>
                  );
                } else if (daysUntilExpiry <= 90) {
                  return (
                    <>
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm font-thin text-yellow-600">Review due in {daysUntilExpiry} days</span>
                      </div>
                      <Link href="/dashboard/risk-assessment">
                        <Button variant="outline" className="w-full rounded-none font-thin text-xs border-yellow-200 text-yellow-700 hover:bg-yellow-50">
                          Review now
                        </Button>
                      </Link>
                    </>
                  );
                } else {
                  return (
                    <>
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-thin text-green-600">Current</span>
                      </div>
                      <p className="text-xs text-gray-500 font-thin mb-3">
                        Completed: {assessmentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </p>
                      <Link href="/dashboard/risk-assessment">
                        <Button variant="outline" className="w-full rounded-none font-thin text-xs border-gray-200 text-[#565656] hover:bg-gray-50">
                          View assessment
                        </Button>
                      </Link>
                    </>
                  );
                }
              })()}
            </CardContent>
          </Card>

          {/* BAAs Card */}
          <Card className="border-0 shadow-sm bg-white rounded-none">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <FileCheck className="w-5 h-5 text-[#0175a2]" />
                <h3 className="text-sm font-thin text-[#0e274e]">BAAs</h3>
              </div>
              {!hasPractice ? (
                <>
                  <div className="mb-3">
                    <LockedIndicator requiredPlan="practice" />
                  </div>
                  <p className="text-xs text-gray-400 font-thin">BAA tracking requires Practice plan</p>
                </>
              ) : totalVendorsWithPHI === 0 ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-thin text-gray-500">No vendors registered</span>
                  </div>
                  <Link href="/dashboard/policies/vendors">
                    <Button variant="outline" className="w-full rounded-none font-thin text-xs border-gray-200 text-[#565656] hover:bg-gray-50">
                      Add your first vendor <ArrowRight className="w-3 h-3 ml-2" />
                    </Button>
                  </Link>
                </>
              ) : expiringBAAs > 0 || expiredBAAs > 0 ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-thin text-yellow-600">
                      {expiringBAAs + expiredBAAs} {expiredBAAs > 0 ? 'expired' : 'expiring'} in {expiringBAAs > 0 ? '30 days' : ''}
                    </span>
                  </div>
                  <Link href="/dashboard/policies/vendors">
                    <Button variant="outline" className="w-full rounded-none font-thin text-xs border-yellow-200 text-yellow-700 hover:bg-yellow-50">
                      Renew BAAs
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-thin text-green-600">All BAAs valid</span>
                  </div>
                  <p className="text-xs text-gray-500 font-thin mb-3">
                    {validBAAs} of {totalVendorsWithPHI} vendors
                  </p>
                  <Link href="/dashboard/policies/vendors">
                    <Button variant="outline" className="w-full rounded-none font-thin text-xs border-gray-200 text-[#565656] hover:bg-gray-50">
                      Manage vendors
                    </Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── 5. Incidents | Vendors (2 cards side by side) ──────────────────── */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Incidents Card */}
        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-thin text-[#0e274e]">Incidents</h3>
              <Link href="/dashboard/breach-notifications/incidents" className="text-xs font-thin text-[#0175a2] hover:underline">
                View incident log <ArrowRight className="w-3 h-3 inline ml-1" />
              </Link>
            </div>
            {openIncidents === 0 ? (
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-thin text-[#0e274e]">0</p>
                  <p className="text-xs text-gray-500 font-thin">No open incidents — practice is clean</p>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-3xl font-thin text-[#0e274e] mb-2">{openIncidents}</p>
                {lastIncident && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 font-thin mb-1">Most recent</p>
                    <p className="text-sm font-thin text-[#0e274e]">
                      {new Date(lastIncident.date_discovered).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-500 font-thin">
                      Status: {lastIncident.status === 'open' ? 'Open' : lastIncident.status === 'under_review' ? 'Under Review' : 'Closed'}
                    </p>
                  </div>
                )}
                {highSeverityIncidents > 0 && (
                  <p className="text-xs text-red-600 font-thin mt-2">{highSeverityIncidents} high severity</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vendors Card */}
        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-thin text-[#0e274e]">Vendors</h3>
              <Link href="/dashboard/policies/vendors" className="text-xs font-thin text-[#0175a2] hover:underline">
                Manage vendors <ArrowRight className="w-3 h-3 inline ml-1" />
              </Link>
            </div>
            {totalVendorsWithPHI === 0 ? (
              <div>
                <p className="text-2xl font-thin text-[#0e274e] mb-2">0</p>
                <p className="text-xs text-gray-500 font-thin mb-3">No vendors registered — every vendor handling PHI needs a BAA</p>
                <Link href="/dashboard/policies/vendors">
                  <Button className="w-full rounded-none font-thin text-xs bg-[#0175a2] text-white hover:bg-[#0e274e]">
                    Add vendor
                  </Button>
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-3xl font-thin text-[#0e274e] mb-2">{totalVendorsWithPHI}</p>
                <p className="text-xs text-gray-500 font-thin mb-2">Total vendors registered</p>
                {expiringBAAs > 0 && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className={`text-sm font-thin ${expiringBAAs > 0 ? 'text-yellow-600' : 'text-[#0e274e]'}`}>
                      {expiringBAAs} BAA{expiringBAAs > 1 ? 's' : ''} expiring in 30 days
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── 6. Upcoming Expirations (next 90 days) ─────────────────────────── */}
      {upcomingExpirations.length > 0 && (
        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-thin text-[#0e274e]">Upcoming Expirations</h3>
              <span className="text-xs text-gray-400 font-thin">Next 90 days</span>
            </div>
            <div className="space-y-2">
              {upcomingExpirations.map((item, i) => (
                <Link key={i} href={item.link} className="flex items-center gap-3 p-3 rounded-none hover:bg-gray-50 transition-colors group">
                  <div className={`shrink-0 ${item.isOverdue ? 'text-red-500' : item.daysLeft <= 30 ? 'text-red-400' : item.daysLeft <= 60 ? 'text-amber-400' : 'text-green-500'}`}>
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-thin text-[#0e274e] truncate">{item.label}</p>
                    <p className="text-xs text-gray-400 font-thin">{item.category}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className={`text-xs font-normal ${item.isOverdue ? 'text-red-600' : item.daysLeft <= 30 ? 'text-red-500' : item.daysLeft <= 60 ? 'text-amber-500' : 'text-green-600'}`}>
                      {item.isOverdue
                        ? `${Math.abs(item.daysLeft)}d overdue`
                        : item.daysLeft === 0
                        ? 'Today'
                        : `${item.daysLeft}d left`}
                    </span>
                    <p className="text-xs text-gray-400 font-thin">
                      {item.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── 8. Compliance Timeline ─────────────────────────────────────────── */}
      {timelineEvents.length > 0 && (
        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardContent className="p-6">
            <h3 className="text-base font-thin text-[#0e274e] mb-6">Compliance Timeline</h3>
            <div className="space-y-4">
              {timelineEvents.slice(0, 12).map((event, i) => {
                const daysUntil = Math.ceil((event.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                const statusColor = event.status === 'overdue' ? 'text-red-600' : event.status === 'due_soon' ? 'text-yellow-600' : 'text-gray-500';
                return (
                  <div key={i} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0">
                    <div className={`mt-0.5 ${statusColor}`}>
                      {event.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-thin text-[#0e274e]">{event.title}</p>
                        <span className={`text-xs font-thin ${statusColor}`}>
                          {event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      {event.status === 'overdue' && (
                        <p className="text-xs text-red-600 font-thin mt-1">Overdue by {Math.abs(daysUntil)} days</p>
                      )}
                      {event.status === 'due_soon' && daysUntil > 0 && (
                        <p className="text-xs text-yellow-600 font-thin mt-1">Due in {daysUntil} days</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── 9. Recent Activity Feed ────────────────────────────────────────── */}
      {recentActivity.length > 0 && (
        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-thin text-[#0e274e]">Recent Activity</h3>
              <Link href="/dashboard/activity" className="text-xs font-thin text-[#0175a2] hover:underline">
                View all <ArrowRight className="w-3 h-3 inline ml-1" />
              </Link>
            </div>
            <div className="space-y-3">
              {recentActivity.map((event) => {
                const iconMap: Record<string, React.ReactNode> = {
                  policy_activated: <FileCheck className="w-4 h-4 text-[#1ad07a]" />,
                  policy_draft: <FileText className="w-4 h-4 text-[#0175a2]" />,
                  training_completed: <GraduationCap className="w-4 h-4 text-[#1ad07a]" />,
                  training_invited: <UserPlus className="w-4 h-4 text-[#0175a2]" />,
                  incident_opened: <AlertTriangle className="w-4 h-4 text-red-500" />,
                  incident_closed: <CheckCircle2 className="w-4 h-4 text-[#1ad07a]" />,
                  vendor_added: <Building2 className="w-4 h-4 text-[#0175a2]" />,
                  evidence_uploaded: <FolderOpen className="w-4 h-4 text-[#0175a2]" />,
                  risk_assessment_completed: <Shield className="w-4 h-4 text-[#0175a2]" />,
                  asset_added: <Package className="w-4 h-4 text-[#0175a2]" />,
                };
                return (
                  <div key={event.id} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                    <div className="mt-0.5 shrink-0">
                      {iconMap[event.type] ?? <Activity className="w-4 h-4 text-gray-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-thin text-[#0e274e] truncate">{event.title}</p>
                        <span className="text-xs text-gray-400 font-thin shrink-0">
                          {event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 font-thin truncate">{event.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── 10. Export Audit CTA ──────────────────────────────────────────── */}
      <Card className="border-0 shadow-sm bg-white rounded-none">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-thin text-[#0e274e] mb-1">Audit Package</h3>
              <p className="text-sm text-gray-500 font-thin">
                Your audit package is {complianceScore >= 60 ? 'ready' : 'not ready'}. Last exported: never.
              </p>
            </div>
            <div>
              {complianceScore >= 60 ? (
                <Link href="/dashboard/audit-export">
                  <Button className="rounded-none font-thin text-sm bg-[#0175a2] text-white hover:bg-[#0e274e]">
                    <Download className="w-4 h-4 mr-2" />
                    Export Audit Package <ArrowRight className="w-3 h-3 ml-2" />
                  </Button>
                </Link>
              ) : (
                <Button 
                  disabled 
                  className="rounded-none font-thin text-sm bg-gray-200 text-gray-500 cursor-not-allowed"
                >
                  Complete {Math.ceil((60 - complianceScore) / 10)} more steps to generate
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
