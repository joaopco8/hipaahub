import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { CheckCircle2, AlertTriangle, XCircle, Download, Shield, FileCheck, Users, AlertCircle, ArrowRight, FileText } from 'lucide-react';
import Link from 'next/link';
import { EVIDENCE_FIELDS } from '@/lib/evidence-fields-config';
import {
  getCachedUser,
  getCachedUserDetails,
  getCachedDashboardData
} from '@/lib/cache/dashboard-cache';

export const revalidate = 30; // Revalidate every 30 seconds for fresh data

export default async function DashboardPage() {
  // Use cached user data (shared with layout)
  const user = await getCachedUser();
  
  if (!user) {
    return redirect('/signin');
  }

  const userDetails = await getCachedUserDetails();

  // Fetch all dashboard data in one optimized call
  const { organization, riskAssessment, staffMembers, commitment, actionItems } = 
    await getCachedDashboardData(user.id);

  // Layout already handles these redirects, but keep as safety check
  if (!organization || !commitment) {
    return redirect('/onboarding/expectation');
  }

  // Create Supabase client for additional queries
  const supabase = createClient();

  // Calculate compliance status based on risk level
  // Handle case where risk assessment might not exist yet
  const riskLevel = riskAssessment?.risk_level || 'high';
  let complianceStatus: 'compliant' | 'partial' | 'at-risk';
  let complianceScore: number;

  if (riskLevel === 'low') {
    complianceStatus = 'compliant';
    complianceScore = Math.max(75, 100 - Number(riskAssessment?.risk_percentage || 0));
  } else if (riskLevel === 'medium') {
    complianceStatus = 'partial';
    complianceScore = Math.max(50, 100 - Number(riskAssessment?.risk_percentage || 0));
  } else {
    complianceStatus = 'at-risk';
    complianceScore = Math.max(25, 100 - Number(riskAssessment?.risk_percentage || 0));
  }

  // Calculate metrics from real data
  const pendingActionItems = actionItems.filter(item => item.status === 'pending');
  const criticalActionItems = pendingActionItems.filter(item => item.priority === 'critical');
  const highActionItems = pendingActionItems.filter(item => item.priority === 'high');
  const actionItemsCount = pendingActionItems.length;
  const criticalCount = criticalActionItems.length;
  const highCount = highActionItems.length;
  
  const policiesCompleted = 3; // TODO: Calculate from actual policies
  const policiesTotal = 8;
  const employeesTrained = staffMembers.filter(s => s.training_completed).length;
  const employeesTotal = staffMembers.length || 1;
  
  // Top 3 critical action items for dashboard
  const topCriticalItems = criticalActionItems.slice(0, 3);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-50 border-green-200';
      case 'partial':
        return 'bg-yellow-50 border-yellow-200';
      case 'at-risk':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-zinc-50 border-zinc-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'partial':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'at-risk':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'Compliant';
      case 'partial':
        return 'Partial Compliance';
      case 'at-risk':
        return 'At Risk';
      default:
        return 'Unknown';
    }
  };

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const userName = userDetails?.full_name?.split(' ')[0] || 'there';
  const greeting = getGreeting();

  // ---- Compliance posture (audit-facing snapshot) ----
  // NOTE: We use real database-backed signals (Evidence Center + Training Records + Organization officers).
  // No mock numbers on this card.

  type ComplianceEvidenceRow = {
    evidence_field_id: string | null;
    status: string | null;
    attestation_signed: boolean | null;
    upload_date: string | null;
    updated_at: string | null;
  };

  type TrainingRecordRow = {
    email: string | null;
    completion_status: string | null;
    expiration_date: string | null;
    record_timestamp: string | null;
  };

  type RiskEvidenceRow = {
    uploaded_at: string | null;
    updated_at: string | null;
  };

  const [
    complianceEvidenceResult,
    latestComplianceEvidenceResult,
    trainingRecordsResult,
    latestTrainingRecordResult,
    latestRiskEvidenceResult
  ] = await Promise.all([
    // Evidence Center (real uploads + attestations)
    (supabase as any)
      .from('compliance_evidence' as any)
      .select('evidence_field_id,status,attestation_signed,upload_date,updated_at')
      .eq('organization_id', organization.id)
      .is('deleted_at', null),
    (supabase as any)
      .from('compliance_evidence' as any)
      .select('upload_date,updated_at')
      .eq('organization_id', organization.id)
      .is('deleted_at', null)
      .order('upload_date', { ascending: false })
      .limit(1)
      .maybeSingle(),
    // Training Records (real staff attestations/training logs)
    (supabase as any)
      .from('training_records' as any)
      .select('email,completion_status,expiration_date,record_timestamp')
      .eq('user_id', user.id),
    (supabase as any)
      .from('training_records' as any)
      .select('record_timestamp')
      .eq('user_id', user.id)
      .order('record_timestamp', { ascending: false })
      .limit(1)
      .maybeSingle(),
    // Evidence-driven risk assessment uploads (when used)
    (supabase as any)
      .from('risk_assessment_evidence' as any)
      .select('uploaded_at,updated_at')
      .eq('user_id', user.id)
      .eq('organization_id', organization.id)
      .order('uploaded_at', { ascending: false })
      .limit(1)
      .maybeSingle()
  ]);

  const complianceEvidenceRows = (complianceEvidenceResult?.data || []) as ComplianceEvidenceRow[];
  const trainingRecordRows = (trainingRecordsResult?.data || []) as TrainingRecordRow[];

  const hasValidEvidenceForField = (fieldId: string) =>
    complianceEvidenceRows.some(
      (row) => row.evidence_field_id === fieldId && row.status === 'VALID'
    );

  // Mandatory SRA evidence (Evidence Center field: sra_report)
  const hasMandatorySraEvidence = hasValidEvidenceForField('sra_report');

  // Designated Security Officer (organization officer + designation evidence uploaded)
  const hasDesignatedSecurityOfficer =
    !!organization.security_officer_name && hasValidEvidenceForField('security_officer_designation');

  // Policies “unsigned” = required policy documents missing OR missing attestation on those docs (real evidence attestations).
  const requiredPolicyFields = EVIDENCE_FIELDS.filter(
    (field) => field.required && field.evidence_type === 'document' && /policy/i.test(field.name)
  );

  const policyCoverage = (() => {
    if (requiredPolicyFields.length === 0) return null;
    let complete = 0;

    for (const field of requiredPolicyFields) {
      const latestRowForField = complianceEvidenceRows
        .filter((row) => row.evidence_field_id === field.id && row.status === 'VALID')
        .sort((a, b) => new Date(b.upload_date || 0).getTime() - new Date(a.upload_date || 0).getTime())[0];

      if (latestRowForField?.attestation_signed === true) {
        complete++;
      }
    }

    return {
      total: requiredPolicyFields.length,
      complete,
      percent: Math.round((complete / requiredPolicyFields.length) * 100)
    };
  })();

  const hasUnsignedOrMissingPolicies = policyCoverage ? policyCoverage.percent < 100 : false;

  // Training coverage: use real training records; if staff members exist, compute coverage against staff list.
  const now = new Date();
  const currentTrainingEmails = new Set(
    trainingRecordRows
      .filter(
        (r) =>
          r.completion_status === 'completed' &&
          !!r.expiration_date &&
          new Date(r.expiration_date) > now
      )
      .map((r) => (r.email || '').toLowerCase())
      .filter(Boolean)
  );

  const trainingCoveragePercent: number | null = (() => {
    if (staffMembers.length > 0) {
      const trainedStaffCount = staffMembers.filter((s) =>
        currentTrainingEmails.has((s.email || '').toLowerCase())
      ).length;
      return Math.round((trainedStaffCount / staffMembers.length) * 100);
    }

    const uniqueEmployees = new Set(
      trainingRecordRows.map((r) => (r.email || '').toLowerCase()).filter(Boolean)
    );

    if (uniqueEmployees.size === 0) return null;
    return Math.round((currentTrainingEmails.size / uniqueEmployees.size) * 100);
  })();

  // Required evidence coverage (Evidence Center required fields)
  const requiredEvidenceFieldIds = EVIDENCE_FIELDS.filter((f) => f.required).map((f) => f.id);
  const requiredEvidenceCompleted = requiredEvidenceFieldIds.filter((id) => hasValidEvidenceForField(id)).length;
  const requiredEvidencePercent =
    requiredEvidenceFieldIds.length > 0
      ? Math.round((requiredEvidenceCompleted / requiredEvidenceFieldIds.length) * 100)
      : 0;

  // Audit readiness score (normalized weights to avoid fake 0% when a signal is unavailable)
  const readinessSignals: Array<{ weight: number; value: number | null }> = [
    { weight: 0.35, value: requiredEvidencePercent },
    { weight: 0.25, value: trainingCoveragePercent },
    { weight: 0.15, value: hasMandatorySraEvidence ? 100 : 0 },
    { weight: 0.15, value: hasDesignatedSecurityOfficer ? 100 : 0 },
    { weight: 0.10, value: policyCoverage?.percent ?? null }
  ];

  const totalWeight = readinessSignals.reduce((sum, s) => sum + (s.value === null ? 0 : s.weight), 0);
  const auditReadinessPercent =
    totalWeight === 0
      ? 0
      : Math.max(
          0,
          Math.min(
            100,
            Math.round(
              readinessSignals.reduce((sum, s) => sum + (s.value === null ? 0 : s.weight * s.value), 0) /
                totalWeight
            )
          )
        );

  const defensibilityStatus =
    auditReadinessPercent >= 85
      ? 'Audit-Ready'
      : auditReadinessPercent >= 60
        ? 'Partially Audit-Ready'
        : 'Not Audit-Ready';

  const postureStatus: 'compliant' | 'partial' | 'at-risk' =
    auditReadinessPercent < 60 || criticalCount > 0 || riskLevel === 'high'
      ? 'at-risk'
      : auditReadinessPercent < 85 || riskLevel === 'medium'
        ? 'partial'
        : 'compliant';

  const lastEvidenceCandidates = [
    organization.updated_at,
    riskAssessment?.updated_at,
    (latestComplianceEvidenceResult?.data as ComplianceEvidenceRow | null)?.upload_date,
    (latestComplianceEvidenceResult?.data as ComplianceEvidenceRow | null)?.updated_at,
    (latestTrainingRecordResult?.data as { record_timestamp: string | null } | null)?.record_timestamp,
    (latestRiskEvidenceResult?.data as RiskEvidenceRow | null)?.uploaded_at,
    (latestRiskEvidenceResult?.data as RiskEvidenceRow | null)?.updated_at
  ].filter(Boolean) as string[];

  const lastEvidenceUpdateRaw =
    lastEvidenceCandidates.length === 0
      ? null
      : lastEvidenceCandidates
          .map((v) => new Date(v))
          .sort((a, b) => b.getTime() - a.getTime())[0];

  const lastEvidenceUpdate =
    lastEvidenceUpdateRaw === null
      ? 'N/A'
      : lastEvidenceUpdateRaw.toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric'
        });

  const meterSegmentsFilled = Math.max(0, Math.min(10, Math.round(auditReadinessPercent / 10)));

  const readinessGaps = [
    {
      key: 'sra',
      show: !hasMandatorySraEvidence,
      label: 'Missing mandatory SRA evidence'
    },
    {
      key: 'security-officer',
      show: !hasDesignatedSecurityOfficer,
      label: 'No designated Security Officer'
    },
    {
      key: 'policies',
      show: hasUnsignedOrMissingPolicies,
      label: 'Policies unsigned'
    }
  ].filter((gap) => gap.show);

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Professional Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-2">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">{greeting}, {userName}</h1>
          <p className="text-sm text-zinc-600 mt-1">Here's your compliance overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild className="bg-[#1ad07a] hover:bg-[#1ad07a]/90 text-[#0d1122]">
            <Link href="/dashboard/action-items">
              <FileCheck className="mr-2 h-4 w-4" />
              View Actions
            </Link>
          </Button>
        </div>
      </div>

      {/* Compliance Posture Card (key dashboard element) */}
      <Card className="border border-zinc-200 bg-white shadow-sm card-premium-enter stagger-item">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <CardTitle className="text-lg font-semibold text-zinc-900">
                HIPAA Compliance Posture
              </CardTitle>
              <CardDescription className="text-zinc-600">
                A defensibility snapshot for audit readiness.
              </CardDescription>
            </div>
            <StatusBadge status={postureStatus} className="shrink-0" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg border border-zinc-200 bg-white p-4">
              <p className="text-xs font-medium text-zinc-600">Defensibility Status</p>
              <p className="mt-1 text-base font-semibold text-zinc-900">{defensibilityStatus}</p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-4">
              <p className="text-xs font-medium text-zinc-600">Last Evidence Update</p>
              <p className="mt-1 text-base font-semibold text-zinc-900">{lastEvidenceUpdate}</p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-4">
              <p className="text-xs font-medium text-zinc-600">Attestation Coverage</p>
              <p className="mt-1 text-base font-semibold text-zinc-900">
                {trainingCoveragePercent === null ? 'N/A' : `${trainingCoveragePercent}%`}
              </p>
            </div>
          </div>

          <div className="border-t border-zinc-100 pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-zinc-900">Audit Readiness</p>
              <p className="text-sm font-semibold text-zinc-900">{auditReadinessPercent}%</p>
            </div>

            {/* Visual meter (10 segments) */}
            <div
              className="grid grid-cols-10 gap-1"
              role="img"
              aria-label={`Audit Readiness ${auditReadinessPercent}%`}
            >
              {Array.from({ length: 10 }).map((_, idx) => {
                const isFilled = idx < meterSegmentsFilled;
                return (
                  <div
                    key={idx}
                    className={[
                      'h-3 rounded-sm border',
                      isFilled
                        ? postureStatus === 'at-risk'
                          ? 'bg-red-600 border-red-600'
                          : postureStatus === 'partial'
                            ? 'bg-yellow-500 border-yellow-500'
                            : 'bg-[#1ad07a] border-[#1ad07a]'
                        : 'bg-zinc-100 border-zinc-200'
                    ].join(' ')}
                  />
                );
              })}
            </div>

            {/* Missing items callouts (audit-facing) */}
            <div className="mt-4 space-y-2">
              {readinessGaps.length > 0 ? (
                readinessGaps.map((gap) => (
                  <div
                    key={gap.key}
                    className="flex items-start gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2"
                  >
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-zinc-900">{gap.label}</p>
                  </div>
                ))
              ) : (
                <div className="flex items-start gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-zinc-900">No audit blockers detected.</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Metrics Cards - Clean and Minimalist */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border border-zinc-200 bg-white card-premium-enter stagger-item">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 mb-1">Pending Actions</p>
                <p className="text-3xl font-bold text-zinc-900">{actionItemsCount}</p>
                {criticalCount > 0 && (
                  <p className="text-xs text-red-600 mt-1">{criticalCount} critical</p>
                )}
              </div>
              <div className="p-3 rounded-lg bg-red-50">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 bg-white card-premium-enter stagger-item" style={{ animationDelay: '50ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 mb-1">Compliance Score</p>
                <p className="text-3xl font-bold text-zinc-900">{complianceScore}%</p>
                <p className="text-xs text-zinc-500 mt-1">{getStatusLabel(complianceStatus)}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-50">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 bg-white card-premium-enter stagger-item" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600 mb-1">Risk Level</p>
                <p className="text-3xl font-bold text-zinc-900">
                  {riskLevel === 'high' ? 'High' : riskLevel === 'medium' ? 'Medium' : 'Low'}
                </p>
                <p className="text-xs text-zinc-500 mt-1">Current assessment</p>
              </div>
              <div className={`p-3 rounded-lg ${
                riskLevel === 'high' ? 'bg-red-50' :
                riskLevel === 'medium' ? 'bg-yellow-50' :
                'bg-green-50'
              }`}>
                <AlertTriangle className={`h-5 w-5 ${
                  riskLevel === 'high' ? 'text-red-600' :
                  riskLevel === 'medium' ? 'text-yellow-600' :
                  'text-green-600'
                }`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CRITICAL ACTIONS - Top Priority Section */}
      {criticalCount > 0 && (
        <Card className="border border-zinc-200 bg-white shadow-sm card-premium-enter stagger-item" style={{ animationDelay: '150ms' }}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-zinc-900">
                  Critical Actions Required
                </CardTitle>
                <CardDescription className="text-zinc-600">
                  {criticalCount} critical item{criticalCount !== 1 ? 's' : ''} need immediate attention
                </CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-zinc-600 hover:text-zinc-900">
                <Link href="/dashboard/action-items">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCriticalItems.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-4 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 transition-colors"
                >
                  <div className="p-1.5 rounded bg-red-100 text-red-600 shrink-0 mt-0.5">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-zinc-900 mb-1">
                      {item.title}
                    </h4>
                    <p className="text-xs text-zinc-600 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                  >
                    <Link href="/dashboard/action-items">
                      View
                    </Link>
                  </Button>
                </div>
              ))}
              {criticalCount > 3 && (
                <div className="text-center pt-2">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="border-red-300 hover:bg-red-100 text-red-700"
                  >
                    <Link href="/dashboard/action-items">
                      View {criticalCount - 3} more critical item{criticalCount - 3 !== 1 ? 's' : ''}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Progress Panel */}
        <Card className="border border-zinc-200 bg-white shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-zinc-900">Compliance Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-600">Overall Progress</span>
                <span className="text-sm font-semibold text-zinc-900">{complianceScore}%</span>
              </div>
              <Progress value={complianceScore} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-100">
              <div>
                <p className="text-2xl font-bold text-zinc-900">{policiesCompleted}/{policiesTotal}</p>
                <p className="text-xs text-zinc-600 mt-1">Policies</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-900">{employeesTrained}/{employeesTotal}</p>
                <p className="text-xs text-zinc-600 mt-1">Employees Trained</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity / Quick Actions */}
        <Card className="border border-zinc-200 bg-white shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-zinc-900">Quick Actions</CardTitle>
              <Link href="/dashboard/action-items" className="text-sm text-blue-600 hover:text-blue-700">
                See All
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCriticalItems.slice(0, 3).map((item) => (
                <Link
                  key={item.id}
                  href="/dashboard/action-items"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-50 transition-colors group"
                >
                  <div className="p-2 rounded bg-red-50 group-hover:bg-red-100 transition-colors">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 truncate">{item.title}</p>
                    <p className="text-xs text-zinc-500 truncate">{item.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
                </Link>
              ))}
              {topCriticalItems.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-zinc-600">All actions complete</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* High Priority Actions */}
      {highCount > 0 && criticalCount === 0 && (
        <Card className="border border-zinc-200 bg-white shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-zinc-900">
                  High Priority Actions
                </CardTitle>
                <CardDescription className="text-zinc-600">
                  {highCount} high priority item{highCount !== 1 ? 's' : ''} need attention
                </CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-zinc-600 hover:text-zinc-900">
                <Link href="/dashboard/action-items">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingActionItems
                .filter(item => item.priority === 'high')
                .slice(0, 3)
                .map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-4 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 transition-colors"
                  >
                    <div className="p-1.5 rounded bg-yellow-100 text-yellow-600 shrink-0 mt-0.5">
                      <AlertCircle className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-zinc-900 mb-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-zinc-600 line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="shrink-0"
                    >
                      <Link href="/dashboard/action-items">
                        View
                      </Link>
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Clear State */}
      {actionItemsCount === 0 && (
        <Card className="border border-zinc-200 bg-white shadow-sm">
          <CardContent className="py-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-50">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-zinc-900 mb-1">All Critical Actions Complete</h3>
                <p className="text-sm text-zinc-600">
                  You have no pending action items. Your compliance status is up to date.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compliance Management Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-900">Compliance Management</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <Link href="/dashboard/action-items" className="block group">
            <Card className="border border-zinc-200 bg-white hover:shadow-md transition-all cursor-pointer h-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <FileCheck className="h-5 w-5 text-zinc-400" />
                  {actionItemsCount > 0 ? (
                    <span className="text-2xl font-bold text-red-600">{actionItemsCount}</span>
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  )}
                </div>
                <h3 className="font-semibold text-zinc-900 mb-1">Action Items</h3>
                <p className="text-xs text-zinc-600">
                  {actionItemsCount > 0 ? 'Items requiring attention' : 'All complete'}
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/policies" className="block group">
            <Card className="border border-zinc-200 bg-white hover:shadow-md transition-all cursor-pointer h-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <FileText className="h-5 w-5 text-zinc-400" />
                  <span className="text-2xl font-bold text-zinc-900">{policiesCompleted}/{policiesTotal}</span>
                </div>
                <h3 className="font-semibold text-zinc-900 mb-1">Policies</h3>
                <p className="text-xs text-zinc-600">HIPAA documentation</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/training" className="block group">
            <Card className="border border-zinc-200 bg-white hover:shadow-md transition-all cursor-pointer h-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Users className="h-5 w-5 text-zinc-400" />
                  <span className="text-2xl font-bold text-zinc-900">{employeesTrained}/{employeesTotal}</span>
                </div>
                <h3 className="font-semibold text-zinc-900 mb-1">Training</h3>
                <p className="text-xs text-zinc-600">Employee compliance</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/risk-assessment" className="block group">
            <Card className="border border-zinc-200 bg-white hover:shadow-md transition-all cursor-pointer h-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Shield className="h-5 w-5 text-zinc-400" />
                  <Badge className={`text-xs ${
                    riskLevel === 'high' ? 'bg-red-100 text-red-700' :
                    riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {riskLevel === 'high' ? 'High' : riskLevel === 'medium' ? 'Medium' : 'Low'}
                  </Badge>
                </div>
                <h3 className="font-semibold text-zinc-900 mb-1">Risk Assessment</h3>
                <p className="text-xs text-zinc-600">Latest results</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/evidence" className="block group">
            <Card className="border border-zinc-200 bg-white hover:shadow-md transition-all cursor-pointer h-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <FileCheck className="h-5 w-5 text-zinc-400" />
                </div>
                <h3 className="font-semibold text-zinc-900 mb-1">Evidence</h3>
                <p className="text-xs text-zinc-600">Audit documentation</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

    </div>
  );
}
