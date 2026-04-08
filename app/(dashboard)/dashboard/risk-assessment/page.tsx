import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle, CheckCircle2, XCircle, Shield, Download,
  History, Calendar, ChevronRight, BarChart3, TrendingUp,
  AlertCircle, ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { RiskAssessmentExportButton } from '@/components/risk-assessment/risk-assessment-export-button';
import { getSubscription } from '@/utils/supabase/queries';
import { QUESTIONS, DOMAINS } from './questions';

// ─── Radar chart (pure SVG, no external lib) ─────────────────────────────────

function RadarChart({ scores }: { scores: Record<number, { display: number }> }) {
  const cx = 100;
  const cy = 100;
  const r = 75;
  const levels = [25, 50, 75, 100];

  const angleFor = (i: number) => ((-90 + i * 60) * Math.PI) / 180;

  const gridPoints = (pct: number) =>
    [0, 1, 2, 3, 4, 5]
      .map((i) => {
        const a = angleFor(i);
        return `${cx + r * (pct / 100) * Math.cos(a)},${cy + r * (pct / 100) * Math.sin(a)}`;
      })
      .join(' ');

  const scorePolygon = [1, 2, 3, 4, 5, 6]
    .map((domainId, i) => {
      const pct = scores[domainId]?.display ?? 0;
      const a = angleFor(i);
      return `${cx + r * (pct / 100) * Math.cos(a)},${cy + r * (pct / 100) * Math.sin(a)}`;
    })
    .join(' ');

  const domainShorts = ['PHI', 'Access', 'Devices', 'Network', 'Vendors', 'Governance'];
  const labelOffset = 12;

  return (
    <svg viewBox="0 0 200 200" className="w-full max-w-[260px] mx-auto">
      {/* Background grid */}
      {levels.map((pct) => (
        <polygon
          key={pct}
          points={gridPoints(pct)}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="0.5"
        />
      ))}
      {/* Axis lines */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = angleFor(i);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={cx + r * Math.cos(a)}
            y2={cy + r * Math.sin(a)}
            stroke="#e5e7eb"
            strokeWidth="0.5"
          />
        );
      })}
      {/* Score polygon */}
      <polygon
        points={scorePolygon}
        fill="rgba(0,188,235,0.15)"
        stroke="#00bceb"
        strokeWidth="1.5"
      />
      {/* Score dots */}
      {[1, 2, 3, 4, 5, 6].map((domainId, i) => {
        const pct = scores[domainId]?.display ?? 0;
        const a = angleFor(i);
        return (
          <circle
            key={domainId}
            cx={cx + r * (pct / 100) * Math.cos(a)}
            cy={cy + r * (pct / 100) * Math.sin(a)}
            r={3}
            fill="#00bceb"
          />
        );
      })}
      {/* Labels */}
      {domainShorts.map((label, i) => {
        const a = angleFor(i);
        const lx = cx + (r + labelOffset) * Math.cos(a);
        const ly = cy + (r + labelOffset) * Math.sin(a);
        return (
          <text
            key={label}
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="7"
            fill="#6b7280"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TIER_BADGE: Record<string, string> = {
  PROTECTED: 'bg-[#71bc48]/10 text-[#71bc48]',
  PARTIAL: 'bg-amber-50 text-amber-600',
  AT_RISK: 'bg-red-50 text-red-600',
  CRITICAL: 'bg-red-100 text-red-700',
};
const TIER_LABEL: Record<string, string> = {
  PROTECTED: 'Protected',
  PARTIAL: 'Partial',
  AT_RISK: 'At Risk',
  CRITICAL: 'Critical',
};

// Map C/D answers to app links for findings
const DOMAIN_LINKS: Record<number, { href: string; label: string }> = {
  1: { href: '/dashboard/evidence', label: 'Evidence Center' },
  2: { href: '/dashboard/action-items', label: 'Action Items' },
  3: { href: '/dashboard/action-items', label: 'Action Items' },
  4: { href: '/dashboard/action-items', label: 'Action Items' },
  5: { href: '/dashboard/vendors', label: 'BAA Tracker' },
  6: { href: '/dashboard/policies', label: 'Policies' },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function RiskAssessmentPage() {
  const supabase = createClient();
  const user = await getUser(supabase);
  if (!user) return redirect('/signin');

  const [v2Raw, subscription] = await Promise.all([
    (supabase as any)
      .from('onboarding_risk_assessments')
      .select('answers, domain_scores, display_score, tier, updated_at, completed_by, risk_level, risk_percentage')
      .eq('user_id', user.id)
      .single(),
    getSubscription(supabase, user.id),
  ]);

  const v2 = v2Raw?.data ?? null;
  const isLocked = !subscription || subscription.status === 'trialing';
  const isV2 = !!(v2?.domain_scores);
  const hasAnyAssessment = !!(v2?.risk_level);

  // Overdue / expiring checks
  const lastUpdated = v2?.updated_at ? new Date(v2.updated_at) : null;
  const isOverdue = lastUpdated
    ? (Date.now() - lastUpdated.getTime()) > 365 * 24 * 60 * 60 * 1000
    : false;
  const isExpiringSoon = !isOverdue && lastUpdated
    ? (Date.now() - lastUpdated.getTime()) > 335 * 24 * 60 * 60 * 1000
    : false;

  // ─── V2 results computation ────────────────────────────────────────────────

  const answers: Record<string, string> = v2?.answers ?? {};
  const domainScores: Record<number, { raw: number; max: number; display: number }> =
    v2?.domain_scores ?? {};
  const displayScore: number = v2?.display_score ?? 0;
  const tier: string = v2?.tier ?? '';
  const completedBy: string = v2?.completed_by ?? '';

  // Compute critical (D), moderate (C), strong (A) findings from answers
  type Finding = {
    questionId: string;
    domain: number;
    questionText: string;
    answeredLetter: string;
    explanation: string;
    remediation: string;
  };

  const criticalFindings: Finding[] = [];
  const moderateFindings: Finding[] = [];
  const strengths: Finding[] = [];

  if (isV2) {
    for (const q of QUESTIONS) {
      const letter = answers[q.id];
      if (!letter) continue;
      // For multi, check highest-risk letter
      let effectiveLetter = letter;
      if (q.isMulti) {
        const letters = letter.split(',').map((l) => l.trim());
        // Highest risk option selected
        let maxRisk = 0;
        for (const l of letters) {
          const opt = q.options.find((o) => o.letter === l);
          if (opt && opt.riskPoints > maxRisk) {
            maxRisk = opt.riskPoints;
            effectiveLetter = l;
          }
        }
      }
      const finding: Finding = {
        questionId: q.id,
        domain: q.domain,
        questionText: q.text,
        answeredLetter: effectiveLetter,
        explanation: q.explanation,
        remediation: q.remediation,
      };
      if (effectiveLetter === 'D') criticalFindings.push(finding);
      else if (effectiveLetter === 'C') moderateFindings.push(finding);
      else if (effectiveLetter === 'A') strengths.push(finding);
    }
  }

  // Fetch assessment history
  const { data: history } = await (supabase as any)
    .from('risk_assessment_history')
    .select('id, risk_level, risk_percentage, display_score, tier, assessed_at')
    .eq('user_id', user.id)
    .order('assessed_at', { ascending: false })
    .limit(10);

  // Executive summary
  const weakestDomains = Object.entries(domainScores)
    .sort(([, a], [, b]) => a.display - b.display)
    .slice(0, 2)
    .map(([id]) => DOMAINS.find((d) => d.id === Number(id))?.label ?? `Domain ${id}`);
  const strongestDomain = Object.entries(domainScores)
    .sort(([, a], [, b]) => b.display - a.display)[0];
  const strongestDomainLabel = strongestDomain
    ? DOMAINS.find((d) => d.id === Number(strongestDomain[0]))?.label
    : null;

  const execSummary = isV2
    ? `Your practice scored ${displayScore}/100 (${TIER_LABEL[tier] ?? tier}). The areas of greatest exposure are ${weakestDomains.join(' and ')}. ${criticalFindings.length} item${criticalFindings.length !== 1 ? 's' : ''} require immediate attention and ${moderateFindings.length} require near-term remediation.${strongestDomainLabel ? ` Your strongest area is ${strongestDomainLabel}.` : ''}`
    : null;

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-light text-[#0e274e]">HIPAA Risk Assessment</h2>
          <p className="text-sm text-gray-400 font-light">
            Security Risk Analysis (SRA) — OCR-defensible per 45 CFR 164.308(a)(1)
          </p>
        </div>
        {hasAnyAssessment && (
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

      {/* Annual review alerts */}
      {isOverdue && (
        <Card className="border-0 shadow-sm bg-white rounded-none border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-700">Annual Re-Assessment Overdue</p>
                <p className="text-xs text-red-600">
                  Last assessed:{' '}
                  {lastUpdated?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
                  HIPAA requires annual risk assessments.
                </p>
              </div>
              <Link href="/dashboard/risk-assessment/assess" className="ml-auto">
                <Button size="sm" className="rounded-none bg-red-600 text-white hover:bg-red-700">
                  Re-Assess Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
      {isExpiringSoon && (
        <Card className="border-0 shadow-sm bg-white rounded-none border-l-4 border-l-amber-400">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-amber-600 shrink-0" />
              <p className="text-sm text-amber-700">
                Your annual risk assessment is due soon — before{' '}
                {lastUpdated &&
                  new Date(lastUpdated.getTime() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString(
                    'en-US',
                    { month: 'long', day: 'numeric', year: 'numeric' },
                  )}.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── NO ASSESSMENT ─────────────────────────────────────── */}
      {!hasAnyAssessment && (
        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardContent className="p-8 flex flex-col items-center text-center gap-4">
            <div className="h-14 w-14 rounded-full bg-[#00bceb]/10 flex items-center justify-center">
              <Shield className="h-7 w-7 text-[#00bceb]" />
            </div>
            <div>
              <h3 className="text-lg font-light text-[#0e274e] mb-1">
                Start Your Security Risk Assessment
              </h3>
              <p className="text-sm text-gray-400 font-light max-w-md">
                68 questions across 6 domains. Estimated 40–50 minutes. Generates an
                OCR-defensible PDF directly answering the four questions evaluated in a HIPAA audit.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-left w-full max-w-sm text-xs text-[#565656]">
              {DOMAINS.map((d) => (
                <div key={d.id} className="flex items-center gap-2 p-2 bg-[#f3f5f9]">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#00bceb]" />
                  {d.label}
                </div>
              ))}
            </div>
            <Button asChild size="lg" className="rounded-none bg-[#00bceb] text-white hover:bg-[#00bceb]/90 font-light">
              <Link href="/dashboard/risk-assessment/assess">Begin Assessment</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ─── OLD ASSESSMENT (no domain_scores) ─────────────────── */}
      {hasAnyAssessment && !isV2 && (
        <>
          <Card className="border-0 shadow-sm bg-white rounded-none">
            <CardContent className="p-6 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <AlertTriangle className="h-10 w-10 text-amber-500" />
                <div>
                  <p className="text-sm text-gray-500 font-light">
                    You have a previous assessment on file. Retake with the new 68-question
                    OCR-defensible format to unlock domain breakdown and PDF certification.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Assessed:{' '}
                    {lastUpdated?.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <Link href="/dashboard/risk-assessment/assess">
                <Button className="rounded-none bg-[#00bceb] text-white hover:bg-[#00bceb]/90">
                  Take New Assessment
                </Button>
              </Link>
            </CardContent>
          </Card>
        </>
      )}

      {/* ─── V2 RESULTS ────────────────────────────────────────── */}
      {isV2 && (
        <>
          {/* Score header */}
          <Card className="border-0 shadow-sm bg-white rounded-none">
            <CardContent className="p-6">
              <div className="flex items-start justify-between flex-wrap gap-6">
                <div className="flex items-center gap-5">
                  {displayScore >= 85 && <CheckCircle2 className="h-12 w-12 text-[#71bc48] shrink-0" />}
                  {displayScore >= 55 && displayScore < 85 && <AlertTriangle className="h-12 w-12 text-amber-500 shrink-0" />}
                  {displayScore < 55 && <XCircle className="h-12 w-12 text-red-500 shrink-0" />}
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-4xl font-light text-[#0e274e]">{displayScore}</span>
                      <span className="text-lg text-gray-400 font-light">/100</span>
                      <Badge className={`${TIER_BADGE[tier] ?? 'bg-gray-100 text-gray-500'} border-0 rounded-none font-normal text-sm px-3 py-1`}>
                        {TIER_LABEL[tier] ?? tier}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400 font-light">
                      Assessed: {lastUpdated?.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      {completedBy ? ` · Completed by: ${completedBy}` : ''}
                    </p>
                  </div>
                </div>
                <Link href="/dashboard/risk-assessment/assess">
                  <Button variant="outline" size="sm" className="rounded-none border-gray-200 text-[#565656]">
                    Retake Assessment
                  </Button>
                </Link>
              </div>
              {execSummary && (
                <p className="mt-4 text-sm text-[#565656] font-light leading-relaxed border-t border-gray-100 pt-4">
                  {execSummary}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Domain breakdown */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-[#00bceb]" />
              <h3 className="text-xl font-light text-[#0e274e]">Domain Breakdown</h3>
            </div>
            <Card className="border-0 shadow-sm bg-white rounded-none">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  {/* Radar chart */}
                  <div className="w-full md:w-auto md:shrink-0">
                    <RadarChart scores={domainScores} />
                  </div>
                  {/* Domain table */}
                  <div className="flex-1 w-full">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left py-2 text-xs text-gray-400 font-normal">Domain</th>
                          <th className="text-right py-2 text-xs text-gray-400 font-normal">Score</th>
                          <th className="text-right py-2 text-xs text-gray-400 font-normal">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {DOMAINS.map((d) => {
                          const ds = domainScores[d.id];
                          const score = ds?.display ?? 0;
                          const statusColor =
                            score >= 85 ? 'text-[#71bc48]' :
                            score >= 55 ? 'text-amber-500' : 'text-red-500';
                          const statusLabel =
                            score >= 85 ? 'Protected' :
                            score >= 55 ? 'Partial' : 'At Risk';
                          return (
                            <tr key={d.id} className="border-b border-gray-50">
                              <td className="py-2.5 text-[#0e274e] font-light">{d.label}</td>
                              <td className="py-2.5 text-right text-[#565656]">{score}/100</td>
                              <td className="py-2.5 text-right">
                                <span className={`text-xs font-normal ${statusColor}`}>{statusLabel}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Critical findings (D answers) */}
          {criticalFindings.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="h-5 w-5 text-red-500" />
                <h3 className="text-xl font-light text-[#0e274e]">
                  Critical Findings
                  <span className="ml-2 text-sm text-red-500">({criticalFindings.length})</span>
                </h3>
              </div>
              <p className="text-xs text-gray-400 mb-3 font-light">
                These items represent the highest-risk gaps. Each is a direct violation or near-violation that must be addressed immediately.
              </p>
              <div className="space-y-3">
                {criticalFindings.map((f) => {
                  const link = DOMAIN_LINKS[f.domain];
                  return (
                    <Card key={f.questionId} className="border-0 shadow-sm bg-white rounded-none border-l-4 border-l-red-500">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2 flex-wrap">
                              <p className="text-sm font-normal text-[#0e274e]">{f.questionText}</p>
                              <Badge className="bg-red-50 text-red-600 border-0 rounded-none text-xs shrink-0">
                                Critical
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 font-light">{f.explanation}</p>
                            <div className="mt-2 p-2 bg-red-50/50 border-l-2 border-l-red-200">
                              <p className="text-xs text-[#565656] font-light">
                                <span className="font-medium text-[#0e274e]">Action: </span>
                                {f.remediation}
                              </p>
                            </div>
                            {link && (
                              <Link href={link.href} className="inline-flex items-center gap-1 mt-2 text-xs text-[#00bceb] hover:underline">
                                Go to {link.label}
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Moderate findings (C answers) */}
          {moderateFindings.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h3 className="text-xl font-light text-[#0e274e]">
                  Moderate Findings
                  <span className="ml-2 text-sm text-amber-500">({moderateFindings.length})</span>
                </h3>
              </div>
              <p className="text-xs text-gray-400 mb-3 font-light">
                These items are partially addressed or planned but not yet implemented. Target resolution within 90 days.
              </p>
              <div className="space-y-3">
                {moderateFindings.map((f) => {
                  const link = DOMAIN_LINKS[f.domain];
                  return (
                    <Card key={f.questionId} className="border-0 shadow-sm bg-white rounded-none border-l-4 border-l-amber-400">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2 flex-wrap">
                              <p className="text-sm font-normal text-[#0e274e]">{f.questionText}</p>
                              <Badge className="bg-amber-50 text-amber-600 border-0 rounded-none text-xs shrink-0">
                                Moderate
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 font-light">{f.explanation}</p>
                            <div className="mt-2 p-2 bg-amber-50/50 border-l-2 border-l-amber-200">
                              <p className="text-xs text-[#565656] font-light">
                                <span className="font-medium text-[#0e274e]">Action: </span>
                                {f.remediation}
                              </p>
                            </div>
                            {link && (
                              <Link href={link.href} className="inline-flex items-center gap-1 mt-2 text-xs text-[#00bceb] hover:underline">
                                Go to {link.label}
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Strengths */}
          {strengths.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-[#71bc48]" />
                <h3 className="text-xl font-light text-[#0e274e]">
                  What You Are Doing Well
                  <span className="ml-2 text-sm text-[#71bc48]">({strengths.length} items)</span>
                </h3>
              </div>
              <Card className="border-0 shadow-sm bg-white rounded-none">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {strengths.slice(0, 16).map((f) => (
                      <div key={f.questionId} className="flex items-start gap-2 p-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#71bc48] shrink-0 mt-0.5" />
                        <p className="text-xs text-[#565656] font-light">{f.questionText}</p>
                      </div>
                    ))}
                  </div>
                  {strengths.length > 16 && (
                    <p className="text-xs text-gray-400 mt-3 pl-2">
                      +{strengths.length - 16} additional items fully implemented.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* No findings at all */}
          {criticalFindings.length === 0 && moderateFindings.length === 0 && (
            <Card className="border-0 shadow-sm bg-white rounded-none">
              <CardContent className="flex flex-col items-center justify-center py-10 gap-3">
                <CheckCircle2 className="h-10 w-10 text-[#71bc48]" />
                <p className="text-sm font-light text-[#0e274e]">Excellent — no critical or moderate gaps found.</p>
                <p className="text-xs text-gray-400">Continue maintaining current safeguards and reassess annually.</p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Assessment history */}
      {(history || []).length > 1 && (
        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardHeader className="border-b border-gray-100 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#00bceb]" />
                <CardTitle className="text-base font-light text-[#0e274e]">Assessment History</CardTitle>
              </div>
              <Link href="/dashboard/risk-assessment/history">
                <Button variant="ghost" size="sm" className="text-xs text-[#00bceb] rounded-none">
                  View all
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {(history || []).slice(0, 5).map((h: any) => {
              const hTier = h.tier ?? (h.risk_level === 'low' ? 'PROTECTED' : h.risk_level === 'medium' ? 'PARTIAL' : 'AT_RISK');
              const hScore = h.display_score ?? Number(h.risk_percentage ?? 0);
              return (
                <div key={h.id} className="flex items-center justify-between p-4 border-b border-gray-50 last:border-0">
                  <p className="text-sm text-[#0e274e] font-light">
                    {new Date(h.assessed_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#565656]">{hScore}/100</span>
                    <Badge className={`${TIER_BADGE[hTier] ?? 'bg-gray-100 text-gray-500'} border-0 rounded-none text-xs`}>
                      {TIER_LABEL[hTier] ?? hTier}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
