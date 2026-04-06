'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { format, startOfQuarter, endOfQuarter, subQuarters } from 'date-fns';
import {
  Download, Calendar, Clock, ChevronDown, ChevronUp, X, Plus,
  CheckCircle2, AlertTriangle, XCircle, Shield, Users, FileText,
  BarChart3, Lock, RefreshCw, Circle,
} from 'lucide-react';
import { ActionGate } from '@/components/action-gate';
import { useSubscription } from '@/contexts/subscription-context';
import { cn } from '@/utils/cn';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Period { label: string; start: string; end: string }

interface BoardReportData {
  period: Period;
  org: { name: string; address: string; complianceOfficer: string; complianceOfficerEmail: string };
  executiveSummary: {
    complianceScore: number; complianceTier: string; scoreTrend: number;
    staffTrainingPct: number; staffCompliant: number; staffTotal: number;
    baasActive: number; baasTotal: number; baasExpiringSoon: number; baasExpired: number;
    openRiskItems: number; highRiskItems: number; mediumRiskItems: number; lowRiskItems: number;
  };
  scoreHistory: { period: string; score: number; tier: string }[];
  regulatoryActivity: {
    incidents: number; breachesRequiringOCR: number; ocrInquiries: number;
    incidentList: any[]; regulatoryUpdates: any[];
  };
  policies: { name: string; status: string; version: string; lastReviewed: string; nextReview: string; nextReviewRaw?: string | null }[];
  training: { totalStaff: number; compliantStaff: number; overdue: number; newThisPeriod: number; certificatesIssued: number; staffList: any[]; totalStaffCount: number };
  baas: { active: number; total: number; expiringSoon: number; expired: number; vendorList: any[] };
  riskAssessment: { lastCompleted: string; conductedBy: string; score: number; tier: string; nextReview: string; openItems: any[]; closedThisPeriod: number };
  incidents: { total: number; requireOCR: number; ocrInquiries: number; list: any[] };
  upcomingEvents: { date: string; description: string; type: string; urgency: string }[];
  complianceOfficerStatement: string;
  schedule: any | null;
}

interface Sections {
  executiveSummary: boolean; scoreTrend: boolean; regulatoryActivity: boolean;
  policyStatus: boolean; staffTraining: boolean; baaStatus: boolean;
  riskAssessment: boolean; incidents: boolean; upcomingEvents: boolean;
  complianceStatement: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getQuarterPeriod(q: number, year: number) {
  const start = new Date(year, (q - 1) * 3, 1);
  const end = new Date(year, q * 3, 0);
  return { start, end, label: `Q${q} ${year}`, param: `q${q}-${year}` };
}

function periodParam(type: 'quarterly' | 'monthly' | 'annual', q: number, month: number, year: number) {
  if (type === 'quarterly') return `q${q}-${year}`;
  if (type === 'monthly') return `${year}-${String(month).padStart(2, '0')}`;
  return String(year);
}

function periodDisplay(type: 'quarterly' | 'monthly' | 'annual', q: number, month: number, year: number) {
  if (type === 'quarterly') {
    const start = new Date(year, (q - 1) * 3, 1);
    const end = new Date(year, q * 3, 0);
    return `Q${q} ${year} — ${start.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} to ${end.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
  }
  if (type === 'monthly') return new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  return String(year);
}

const SECTION_LABELS: Record<keyof Sections, string> = {
  executiveSummary: 'Executive Summary',
  scoreTrend: 'Compliance Score Trend',
  regulatoryActivity: 'Regulatory Activity',
  policyStatus: 'Policy Status',
  staffTraining: 'Staff Training',
  baaStatus: 'BAA Status',
  riskAssessment: 'Risk Assessment Summary',
  incidents: 'Incidents & Breaches',
  upcomingEvents: 'Upcoming Events (90 days)',
  complianceStatement: 'Compliance Officer Statement',
};

// ─── SVG Line Chart ───────────────────────────────────────────────────────────

function ScoreLineChart({ data }: { data: { period: string; score: number }[] }) {
  if (data.length < 2) return (
    <p className="text-xs text-gray-400 italic py-4">
      More historical data will appear as your compliance program matures.
    </p>
  );
  const W = 560; const H = 160; const PX = 40; const PY = 20;
  const xs = data.map((_, i) => PX + (i / (data.length - 1)) * (W - PX * 2));
  const y = (s: number) => PY + (1 - s / 100) * (H - PY * 2);
  const pts = data.map((d, i) => `${xs[i]},${y(d.score)}`).join(' ');
  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H + 24}`} className="w-full max-w-[560px]" style={{ height: 190 }}>
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(v => (
          <line key={v} x1={PX} x2={W - PX} y1={y(v)} y2={y(v)} stroke="#f0f0f0" strokeWidth={1} />
        ))}
        {/* Threshold lines */}
        <line x1={PX} x2={W - PX} y1={y(80)} y2={y(80)} stroke="#16a34a" strokeWidth={1} strokeDasharray="4 3" opacity={0.5} />
        <line x1={PX} x2={W - PX} y1={y(50)} y2={y(50)} stroke="#d97706" strokeWidth={1} strokeDasharray="4 3" opacity={0.5} />
        <text x={W - PX + 2} y={y(80) + 4} fontSize={9} fill="#16a34a" opacity={0.7}>Protected</text>
        <text x={W - PX + 2} y={y(50) + 4} fontSize={9} fill="#d97706" opacity={0.7}>Partial</text>
        {/* Area fill */}
        <polygon points={`${xs[0]},${y(0)} ${pts} ${xs[xs.length - 1]},${y(0)}`} fill="#00bceb" fillOpacity={0.08} />
        {/* Line */}
        <polyline points={pts} fill="none" stroke="#00bceb" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {/* Dots */}
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={xs[i]} cy={y(d.score)} r={5} fill="white" stroke="#00bceb" strokeWidth={2} />
            <text x={xs[i]} y={y(d.score) - 9} textAnchor="middle" fontSize={10} fill="#0175a2" fontWeight="600">{d.score}</text>
          </g>
        ))}
        {/* X labels */}
        {data.map((d, i) => (
          <text key={i} x={xs[i]} y={H + 16} textAnchor="middle" fontSize={10} fill="#9ca3af">{d.period}</text>
        ))}
        {/* Y axis */}
        {[0, 50, 100].map(v => (
          <text key={v} x={PX - 6} y={y(v) + 4} textAnchor="end" fontSize={9} fill="#d1d5db">{v}</text>
        ))}
      </svg>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function Badge({ label, color }: { label: string; color: 'green' | 'teal' | 'amber' | 'red' | 'gray' }) {
  const cls = {
    green: 'bg-green-50 text-green-700 border-green-200',
    teal: 'bg-[#e0f7fc] text-[#0175a2] border-[#b2ebf2]',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    gray: 'bg-gray-50 text-gray-500 border-gray-200',
  }[color];
  return <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide border rounded-sm', cls)}>{label}</span>;
}

function StatusDot({ status }: { status: string }) {
  if (status === 'Active' || status === 'Current') return <span className="text-green-600 font-medium flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" />{status}</span>;
  if (status === 'Expiring Soon' || status === 'Due Soon') return <span className="text-amber-600 font-medium flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" />{status}</span>;
  if (status === 'Expired' || status === 'Overdue') return <span className="text-red-600 font-medium flex items-center gap-1"><XCircle className="h-3.5 w-3.5" />{status}</span>;
  return <span className="text-gray-400 flex items-center gap-1"><Circle className="h-3.5 w-3.5" />{status}</span>;
}

// ─── Report Sections ──────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="mb-4">
      <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#0175a2]">{label}</p>
      <div className="mt-1.5 h-px bg-gradient-to-r from-[#0175a2]/30 to-transparent" />
    </div>
  );
}

function ReportSection({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mb-8', className)}>{children}</div>;
}

function ReportTable({ headers, rows, emptyMessage }: { headers: string[]; rows: (string | React.ReactNode)[][]; emptyMessage?: string }) {
  if (rows.length === 0) return <p className="text-xs text-gray-400 italic py-3">{emptyMessage ?? 'No data available.'}</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {headers.map((h, i) => <th key={i} className="text-left px-3 py-2 font-semibold text-gray-500 uppercase tracking-wide text-[10px]">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={cn('border-b border-gray-100', ri % 2 === 1 ? 'bg-gray-50/40' : '')}>
              {row.map((cell, ci) => <td key={ci} className="px-3 py-2 text-gray-700">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ExecutiveSummarySection({ d }: { d: BoardReportData }) {
  const s = d.executiveSummary;
  const scoreBadge = s.complianceScore >= 80 ? { label: 'PROTECTED', color: 'green' as const } : s.complianceScore >= 50 ? { label: 'PARTIAL', color: 'amber' as const } : { label: 'AT RISK', color: 'red' as const };
  const trainingBadge = s.staffTotal === 0 ? { label: 'NO DATA', color: 'gray' as const } : s.staffTrainingPct === 100 ? { label: 'FULLY COMPLIANT', color: 'green' as const } : s.staffTrainingPct > 80 ? { label: 'ON TRACK', color: 'teal' as const } : { label: 'NEEDS ATTENTION', color: 'amber' as const };
  const baaBadge = s.baasTotal === 0 ? { label: 'N/A', color: 'gray' as const } : s.baasExpired > 0 ? { label: `${s.baasExpired} EXPIRED`, color: 'red' as const } : s.baasExpiringSoon > 0 ? { label: `${s.baasExpiringSoon} EXPIRING`, color: 'amber' as const } : { label: 'ALL CURRENT', color: 'green' as const };
  const riskBadge = s.openRiskItems === 0 ? { label: 'ALL RESOLVED', color: 'green' as const } : s.openRiskItems <= 3 ? { label: 'BEING MANAGED', color: 'teal' as const } : { label: 'NEEDS ATTENTION', color: 'amber' as const };

  return (
    <ReportSection>
      <SectionHeader label="Executive Summary" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Score */}
        <div className="border border-gray-200 p-4 bg-white">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">Compliance Score</p>
          <div className="flex items-baseline gap-1 mb-2">
            <span className={cn('text-4xl font-light', s.complianceScore >= 80 ? 'text-green-600' : s.complianceScore >= 50 ? 'text-amber-600' : 'text-red-600')}>{s.complianceScore}</span>
            <span className="text-sm text-gray-400">/100</span>
          </div>
          <Badge {...scoreBadge} />
          {s.scoreTrend !== 0 && <p className="text-[10px] text-gray-400 mt-1.5">{s.scoreTrend > 0 ? `↑ +${s.scoreTrend}` : `↓ ${s.scoreTrend}`} from last period</p>}
        </div>
        {/* Training */}
        <div className="border border-gray-200 p-4 bg-white">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">Staff Training</p>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-4xl font-light text-[#0e274e]">{s.staffTrainingPct}</span>
            <span className="text-sm text-gray-400">%</span>
          </div>
          <Badge {...trainingBadge} />
          <p className="text-[10px] text-gray-400 mt-1.5">{s.staffCompliant}/{s.staffTotal} staff</p>
        </div>
        {/* BAAs */}
        <div className="border border-gray-200 p-4 bg-white">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">BAAs Active</p>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-4xl font-light text-[#0e274e]">{s.baasActive}</span>
            <span className="text-sm text-gray-400">/{s.baasTotal}</span>
          </div>
          <Badge {...baaBadge} />
          {s.baasTotal === 0 && <p className="text-[10px] text-gray-400 mt-1.5">No BAAs tracked</p>}
        </div>
        {/* Risk */}
        <div className="border border-gray-200 p-4 bg-white">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">Open Risk Items</p>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-4xl font-light text-[#0e274e]">{s.openRiskItems}</span>
            <span className="text-sm text-gray-400">items</span>
          </div>
          <Badge {...riskBadge} />
          {s.openRiskItems > 0 && <p className="text-[10px] text-gray-400 mt-1.5">{s.highRiskItems}H · {s.mediumRiskItems}M · {s.lowRiskItems}L</p>}
        </div>
      </div>
    </ReportSection>
  );
}

function ScoreTrendSection({ d }: { d: BoardReportData }) {
  const history = d.scoreHistory.length > 0 ? d.scoreHistory : [{ period: d.period.label, score: d.executiveSummary.complianceScore, tier: d.executiveSummary.complianceTier }];
  return (
    <ReportSection>
      <SectionHeader label="Compliance Score Over Time" />
      <ScoreLineChart data={history} />
      {history.length > 1 && (
        <p className="text-xs text-gray-500 mt-3 font-light">
          {d.org.name}'s compliance score has {history[history.length - 1].score >= history[0].score ? 'improved' : 'changed'} by {Math.abs(history[history.length - 1].score - history[0].score)} points over the past {history.length} recorded periods.
        </p>
      )}
    </ReportSection>
  );
}

function RegulatorySection({ d }: { d: BoardReportData }) {
  const ra = d.regulatoryActivity;
  return (
    <ReportSection>
      <SectionHeader label={`Regulatory Activity — ${d.period.label}`} />
      {ra.incidents === 0 ? (
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-xs text-gray-600 bg-green-50 border border-green-200 p-3">
            <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
            <span>No breach incidents requiring OCR notification during this period.</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-gray-600 bg-green-50 border border-green-200 p-3">
            <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
            <span>No OCR inquiries received during this period.</span>
          </div>
        </div>
      ) : (
        <ReportTable
          headers={['Date', 'Title', 'Type', 'Status', 'PHI', 'OCR Required']}
          rows={ra.incidentList.map(i => [
            i.date ? new Date(i.date).toLocaleDateString() : '—',
            i.title || '—', i.type, i.status,
            i.phiInvolved, i.ocrRequired,
          ])}
          emptyMessage="No incidents this period."
        />
      )}
      {ra.regulatoryUpdates.length > 0 && (
        <div className="mt-4">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Regulatory Updates</p>
          {ra.regulatoryUpdates.map((u: any, i: number) => (
            <div key={i} className="border-l-2 border-[#0175a2]/30 pl-3 mb-2">
              <p className="text-xs font-medium text-[#0e274e]">{u.title}</p>
              {u.description && <p className="text-xs text-gray-500 font-light">{u.description}</p>}
            </div>
          ))}
        </div>
      )}
      {ra.regulatoryUpdates.length === 0 && <p className="text-xs text-gray-400 italic mt-3">No significant regulatory updates during this period.</p>}
    </ReportSection>
  );
}

function PolicySection({ d }: { d: BoardReportData }) {
  const inactive = d.policies.filter(p => p.status !== 'Active');
  const now = new Date();
  const in90 = new Date(Date.now() + 90 * 86400000);
  return (
    <ReportSection>
      <SectionHeader label="HIPAA Policies — Status Overview" />
      {inactive.length > 0 && (
        <div className="mb-3 flex items-start gap-2 text-xs bg-amber-50 border border-amber-200 text-amber-700 p-3">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          {inactive.length} {inactive.length === 1 ? 'policy is' : 'policies are'} not yet active. Review and activate them to maintain your compliance posture.
        </div>
      )}
      <ReportTable
        headers={['Policy', 'Status', 'Version', 'Last Reviewed', 'Next Review']}
        rows={d.policies.map(p => {
          const isOverdue = p.nextReviewRaw && new Date(p.nextReviewRaw) < now;
          const isSoon = !isOverdue && p.nextReviewRaw && new Date(p.nextReviewRaw) <= in90;
          return [
            p.name,
            <StatusDot key="s" status={p.status} />,
            <span key="v" className="text-gray-500">{p.version}</span>,
            p.lastReviewed,
            <span key="nr" className={cn(isOverdue ? 'text-red-600 font-medium' : isSoon ? 'text-amber-600 font-medium' : 'text-gray-600')}>{p.nextReview}</span>,
          ];
        })}
        emptyMessage="No policy documents found."
      />
      <p className="text-[10px] text-gray-400 mt-2">{d.policies.filter(p => p.status === 'Active').length}/{d.policies.length} policies active and current</p>
    </ReportSection>
  );
}

function TrainingSection({ d }: { d: BoardReportData }) {
  const t = d.training;
  const pct = t.totalStaff > 0 ? Math.round((t.compliantStaff / t.totalStaff) * 100) : t.totalStaff === 0 ? 0 : 100;
  const barColor = pct >= 90 ? 'bg-green-500' : pct >= 70 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <ReportSection>
      <SectionHeader label={`Workforce HIPAA Training — ${d.period.label}`} />
      <div className="grid grid-cols-3 gap-3 mb-4 text-center">
        {[['Total Staff', t.totalStaff], ['Compliant', t.compliantStaff], ['Overdue', t.overdue]].map(([label, val]) => (
          <div key={label as string} className="border border-gray-100 p-3">
            <p className="text-2xl font-light text-[#0e274e]">{val}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-1">{label}</p>
          </div>
        ))}
      </div>
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1"><span className="text-gray-500">Compliance rate</span><span className="font-semibold text-[#0e274e]">{pct}%</span></div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className={cn('h-2 rounded-full transition-all', barColor)} style={{ width: `${pct}%` }} /></div>
      </div>
      <ReportTable
        headers={['Name', 'Role', 'Last Trained', 'Expires', 'Status']}
        rows={t.staffList.map(s => [s.name, s.role, s.lastTrained || '—', s.expires || '—', <StatusDot key="s" status={s.status} />])}
        emptyMessage="No staff training records found."
      />
      {t.totalStaffCount > 10 && <p className="text-[10px] text-gray-400 mt-2 italic">Showing 10 of {t.totalStaffCount} staff members. Full records available in HIPAA Hub.</p>}
      <p className="text-[10px] text-gray-400 mt-2">Training certificates for all staff members are available in the Evidence Center.</p>
    </ReportSection>
  );
}

function BAASection({ d }: { d: BoardReportData }) {
  const b = d.baas;
  const hasIssues = b.expired > 0 || b.vendorList.some((v: any) => v.status === 'Not Signed');
  return (
    <ReportSection>
      <SectionHeader label={`Vendor BAA Status — ${d.period.label}`} />
      {hasIssues && (
        <div className="mb-3 flex items-start gap-2 text-xs bg-red-50 border border-red-200 text-red-700 p-3">
          <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
          Action required: {b.expired + b.vendorList.filter((v: any) => v.status === 'Not Signed').length} vendor(s) require BAA renewal or initial signing.
        </div>
      )}
      {b.total === 0 ? (
        <p className="text-xs text-gray-400 italic">No Business Associate Agreements tracked. Add vendors in the BAA Tracker.</p>
      ) : (
        <>
          <ReportTable
            headers={['Vendor', 'Service Type', 'Status', 'Expiration']}
            rows={b.vendorList.map((v: any) => [v.name, v.serviceType, <StatusDot key="s" status={v.status} />, v.expirationDate])}
          />
          <p className="text-[10px] text-gray-400 mt-2">{b.active} of {b.total} BAAs current{b.expiringSoon > 0 ? ` · ${b.expiringSoon} renewal(s) in progress` : ''}</p>
        </>
      )}
    </ReportSection>
  );
}

function RiskAssessmentSection({ d }: { d: BoardReportData }) {
  const r = d.riskAssessment;
  return (
    <ReportSection>
      <SectionHeader label={`Security Risk Assessment — ${d.period.label}`} />
      <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
        {[['Last Completed', r.lastCompleted], ['Conducted By', r.conductedBy], ['Overall Score', `${r.score}/100`], ['Next Review', r.nextReview]].map(([k, v]) => (
          <div key={k as string} className="border border-gray-100 p-3">
            <p className="text-gray-400 uppercase tracking-wide text-[10px] mb-1">{k}</p>
            <p className="font-medium text-[#0e274e]">{v}</p>
          </div>
        ))}
      </div>
      {r.openItems.length === 0 ? (
        <div className="flex items-start gap-2 text-xs text-green-700 bg-green-50 border border-green-200 p-3">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          No open risk items. All identified risks have been addressed.
        </div>
      ) : (
        <ReportTable
          headers={['Risk Description', 'Priority', 'Status', 'Due Date']}
          rows={r.openItems.map((item: any) => [
            item.description,
            <span key="p" className={cn('font-semibold', item.priority === 'high' ? 'text-red-600' : item.priority === 'medium' ? 'text-amber-600' : 'text-green-600')}>{item.priority?.toUpperCase()}</span>,
            item.status,
            item.dueDate,
          ])}
        />
      )}
      <p className="text-[10px] text-gray-400 mt-2">{r.closedThisPeriod} item(s) closed this period · {r.openItems.length} item(s) remain open</p>
    </ReportSection>
  );
}

function IncidentsSection({ d }: { d: BoardReportData }) {
  const inc = d.incidents;
  return (
    <ReportSection>
      <SectionHeader label={`Security Incidents — ${d.period.label}`} />
      {inc.total === 0 ? (
        <div className="flex items-start gap-2 text-xs text-green-700 bg-green-50 border border-green-200 p-3">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          No security incidents, breaches, or OCR inquiries during this period.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 mb-4 text-center text-xs">
            {[['Incidents', inc.total], ['Require OCR', inc.requireOCR], ['OCR Inquiries', inc.ocrInquiries]].map(([l, v]) => (
              <div key={l as string} className="border border-gray-100 p-3">
                <p className={cn('text-2xl font-light', (v as number) > 0 ? 'text-red-600' : 'text-[#0e274e]')}>{v}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-1">{l}</p>
              </div>
            ))}
          </div>
          <ReportTable
            headers={['Date', 'Type', 'Status', 'PHI Involved', 'OCR Required']}
            rows={inc.list.map(i => [i.date, i.type, i.status, i.phiInvolved, i.ocrRequired])}
          />
          <p className="text-[10px] text-gray-400 mt-2">Full incident documentation is available in the Evidence Center.</p>
        </>
      )}
    </ReportSection>
  );
}

function UpcomingEventsSection({ d }: { d: BoardReportData }) {
  const events = d.upcomingEvents;
  return (
    <ReportSection>
      <SectionHeader label="Upcoming Compliance Events — Next 90 Days" />
      {events.length === 0 ? (
        <p className="text-xs text-gray-400 italic">No compliance events scheduled in the next 90 days.</p>
      ) : (
        <div className="space-y-2">
          {events.map((e, i) => (
            <div key={i} className="flex items-start gap-3 text-xs py-2 border-b border-gray-100 last:border-0">
              <span className={cn('shrink-0 text-[10px] font-mono w-20 text-gray-400')}>{new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              <span className="flex-1 text-gray-700">{e.description}</span>
              {e.urgency === 'critical' && <span className="shrink-0 text-red-600 font-semibold text-[10px] uppercase">🔴 Urgent</span>}
              {e.urgency === 'warning' && <span className="shrink-0 text-amber-600 font-semibold text-[10px] uppercase">⚠ Soon</span>}
            </div>
          ))}
        </div>
      )}
    </ReportSection>
  );
}

function ComplianceStatementSection({ d, statement }: { d: BoardReportData; statement: string }) {
  return (
    <ReportSection>
      <SectionHeader label="Compliance Officer Statement" />
      <div className="border-l-4 border-[#0175a2]/40 pl-4 py-2">
        <p className="text-sm text-gray-700 font-light leading-relaxed italic">"{statement}"</p>
        <div className="mt-4 text-xs text-gray-500">
          <p className="font-semibold text-gray-700">{d.org.complianceOfficer}</p>
          <p>Compliance Officer — {d.org.name}</p>
          <p>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
      </div>
    </ReportSection>
  );
}

// ─── PDF Generator ────────────────────────────────────────────────────────────

async function generatePDF(data: BoardReportData, sections: Sections, branding: { orgName: string; preparedFor: string; preparedBy: string }, statement: string) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210; const H = 297; const M = 20; const CW = W - M * 2;

  const teal: [number, number, number] = [0, 188, 235];
  const navy: [number, number, number] = [10, 22, 40];
  const midBlue: [number, number, number] = [1, 117, 162];
  const gray: [number, number, number] = [107, 114, 128];
  const lightGray: [number, number, number] = [243, 244, 246];
  const dark: [number, number, number] = [14, 39, 78];

  const orgName = branding.orgName || data.org.name;
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // ── PAGE 1: COVER ──────────────────────────────────────────────────────────
  doc.setFillColor(...navy);
  doc.rect(0, 0, W, H, 'F');

  // Teal accent bar
  doc.setFillColor(...teal);
  doc.rect(0, H - 8, W, 8, 'F');

  // Accent line
  doc.setDrawColor(...teal);
  doc.setLineWidth(0.5);
  doc.line(M, 120, W - M, 120);

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.text('HIPAA Compliance Report', W / 2, 80, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(...teal);
  doc.text(data.period.label, W / 2, 94, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(200, 210, 220);
  const pStart = new Date(data.period.start).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const pEnd = new Date(data.period.end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  doc.text(`${pStart} — ${pEnd}`, W / 2, 104, { align: 'center' });

  const infoY = 135;
  const lines: [string, string][] = [
    ['Organization', orgName],
    ['Prepared for', branding.preparedFor],
    ['Prepared by', branding.preparedBy],
    ['Generated', `${today} via HIPAA Hub`],
  ];
  lines.forEach(([label, val], i) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...gray);
    doc.text(label.toUpperCase(), M, infoY + i * 12);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text(val, M, infoY + i * 12 + 6);
  });

  // Confidential badge
  doc.setFillColor(255, 255, 255, 20);
  doc.setDrawColor(...teal);
  doc.setLineWidth(0.5);
  doc.rect(M, H - 35, CW, 14, 'D');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...teal);
  doc.text('CONFIDENTIAL — FOR BOARD AND EXECUTIVE USE ONLY', W / 2, H - 26, { align: 'center' });

  // ── Helper: add page header/footer ───────────────────────────────────────
  let pageNum = 1;
  const totalPagesRef = { val: 1 };

  const addPage = () => {
    doc.addPage();
    pageNum++;
    // Header bar
    doc.setFillColor(...navy);
    doc.rect(0, 0, W, 12, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(200, 210, 220);
    doc.text(`${orgName}  |  HIPAA Compliance Report  |  ${data.period.label}`, M, 8);
    // Footer
    doc.setFillColor(...lightGray);
    doc.rect(0, H - 10, W, 10, 'F');
    doc.setFontSize(7);
    doc.setTextColor(...gray);
    doc.text(`Page ${pageNum}  |  Generated ${today}  |  HIPAA Hub  |  CONFIDENTIAL`, W / 2, H - 4, { align: 'center' });
  };

  let y = 0;
  const contentStart = 20;

  const checkPage = (needed: number) => {
    if (y + needed > H - 18) { addPage(); y = contentStart; }
  };

  const sectionTitle = (title: string) => {
    checkPage(14);
    doc.setFillColor(...navy);
    doc.rect(M, y, CW, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...teal);
    doc.text(title.toUpperCase(), M + 3, y + 5.5);
    y += 12;
  };

  const kv = (label: string, val: string, col = false) => {
    checkPage(8);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...gray);
    doc.text(label + ':', M + (col ? CW / 2 : 0), y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...dark);
    doc.text(val, M + (col ? CW / 2 : 0) + doc.getTextWidth(label + ':') + 2, y);
    if (!col) y += 6;
  };

  const paragraph = (text: string) => {
    checkPage(12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...dark);
    const lines = doc.splitTextToSize(text, CW);
    lines.forEach((l: string) => { checkPage(5); doc.text(l, M, y); y += 5; });
    y += 3;
  };

  const pdfTable = (headers: string[], rows: string[][], colWidths?: number[]) => {
    const widths = colWidths ?? headers.map(() => CW / headers.length);
    const rowH = 6;
    // Header row
    checkPage(rowH + 2);
    doc.setFillColor(230, 236, 245);
    doc.rect(M, y, CW, rowH, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...dark);
    let cx = M;
    headers.forEach((h, i) => { doc.text(h, cx + 2, y + 4.5); cx += widths[i]; });
    y += rowH;
    // Data rows
    rows.forEach((row, ri) => {
      checkPage(rowH);
      if (ri % 2 === 1) { doc.setFillColor(248, 250, 252); doc.rect(M, y, CW, rowH, 'F'); }
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...dark);
      cx = M;
      row.forEach((cell, ci) => {
        const maxW = widths[ci] - 4;
        const truncated = doc.splitTextToSize(String(cell ?? '—'), maxW)[0];
        doc.text(truncated, cx + 2, y + 4.5);
        cx += widths[ci];
      });
      y += rowH;
    });
    y += 4;
  };

  const scoreCard = (label: string, val: string, sub: string, color: [number, number, number]) => {
    const cardW = CW / 4 - 2;
    doc.setFillColor(248, 250, 252);
    doc.rect(M + (CW / 4) * ['Score', 'Training', 'BAAs', 'Risk'].indexOf(label.split(' ')[0]) + 1, y, cardW, 28, 'F');
    const cx = M + (CW / 4) * ['Score', 'Training', 'BAAs', 'Risk'].indexOf(label.split(' ')[0]) + 1 + cardW / 2;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...gray);
    doc.text(label, cx, y + 6, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(...color);
    doc.text(val, cx, y + 18, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...gray);
    doc.text(sub, cx, y + 25, { align: 'center' });
  };

  // ── PAGE 2+: CONTENT ─────────────────────────────────────────────────────
  addPage();
  y = contentStart;
  const s = data.executiveSummary;

  // Executive Summary
  if (sections.executiveSummary) {
    sectionTitle('Executive Summary');
    const scoreColor: [number, number, number] = s.complianceScore >= 80 ? [22, 163, 74] : s.complianceScore >= 50 ? [217, 119, 6] : [220, 38, 38];
    scoreCard('Score /100', String(s.complianceScore), s.complianceTier, scoreColor);
    scoreCard('Training %', `${s.staffTrainingPct}%`, `${s.staffCompliant}/${s.staffTotal} staff`, [1, 117, 162]);
    scoreCard('BAAs Active', `${s.baasActive}/${s.baasTotal}`, s.baasExpired > 0 ? `${s.baasExpired} expired` : 'all current', s.baasExpired > 0 ? [220, 38, 38] : [22, 163, 74]);
    scoreCard('Risk Items', String(s.openRiskItems), `${s.highRiskItems}H ${s.mediumRiskItems}M`, s.openRiskItems > 3 ? [217, 119, 6] : [22, 163, 74]);
    y += 32;
  }

  // Score Trend
  if (sections.scoreTrend && data.scoreHistory.length > 0) {
    sectionTitle('Compliance Score History');
    const hist = data.scoreHistory;
    paragraph(`Score trend across ${hist.length} recorded periods:`);
    pdfTable(
      ['Period', 'Score', 'Tier'],
      hist.map(h => [h.period, String(h.score), h.tier]),
      [70, 50, 50]
    );
  }

  // Regulatory Activity
  if (sections.regulatoryActivity) {
    sectionTitle(`Regulatory Activity — ${data.period.label}`);
    if (data.regulatoryActivity.incidents === 0) {
      paragraph('✓ No breach incidents requiring OCR notification during this period.');
      paragraph('✓ No OCR inquiries received during this period.');
    } else {
      pdfTable(
        ['Date', 'Title', 'Type', 'Status', 'OCR'],
        data.regulatoryActivity.incidentList.map(i => [
          i.date ? new Date(i.date).toLocaleDateString() : '—', i.title || '—', i.type, i.status, i.ocrRequired
        ]),
        [28, 55, 35, 30, 22]
      );
    }
  }

  // Policies
  if (sections.policyStatus) {
    sectionTitle('HIPAA Policies — Status Overview');
    pdfTable(
      ['Policy', 'Status', 'Version', 'Last Reviewed', 'Next Review'],
      data.policies.map(p => [p.name, p.status, p.version, p.lastReviewed, p.nextReview]),
      [65, 22, 18, 30, 30]
    );
  }

  // Training
  if (sections.staffTraining) {
    sectionTitle(`Workforce Training — ${data.period.label}`);
    const t = data.training;
    paragraph(`Total staff: ${t.totalStaff}  |  Compliant: ${t.compliantStaff}  |  Overdue: ${t.overdue}  |  Completion: ${t.totalStaff > 0 ? Math.round(t.compliantStaff / t.totalStaff * 100) : 0}%`);
    if (t.staffList.length > 0) {
      pdfTable(
        ['Name', 'Role', 'Last Trained', 'Expires', 'Status'],
        t.staffList.map(s => [s.name, s.role, s.lastTrained || '—', s.expires || '—', s.status]),
        [40, 35, 30, 30, 25]
      );
    }
  }

  // BAAs
  if (sections.baaStatus) {
    sectionTitle(`Vendor BAA Status — ${data.period.label}`);
    if (data.baas.total === 0) {
      paragraph('No Business Associate Agreements are currently tracked.');
    } else {
      pdfTable(
        ['Vendor', 'Service Type', 'Status', 'Expiration'],
        data.baas.vendorList.map((v: any) => [v.name, v.serviceType, v.status, v.expirationDate]),
        [60, 45, 30, 30]
      );
    }
  }

  // Risk Assessment
  if (sections.riskAssessment) {
    sectionTitle(`Security Risk Assessment — ${data.period.label}`);
    const r = data.riskAssessment;
    paragraph(`Last completed: ${r.lastCompleted}  |  Score: ${r.score}/100  |  Tier: ${r.tier}  |  Next review: ${r.nextReview}`);
    if (r.openItems.length === 0) {
      paragraph('✓ No open risk items. All identified risks have been addressed.');
    } else {
      pdfTable(
        ['Risk Description', 'Priority', 'Status', 'Due Date'],
        r.openItems.map((item: any) => [item.description, item.priority?.toUpperCase() || '—', item.status, item.dueDate]),
        [75, 22, 30, 30]
      );
    }
  }

  // Incidents
  if (sections.incidents) {
    sectionTitle(`Security Incidents — ${data.period.label}`);
    if (data.incidents.total === 0) {
      paragraph('✓ No security incidents, breaches, or OCR inquiries during this period.');
    } else {
      pdfTable(
        ['Date', 'Type', 'Status', 'PHI', 'OCR Required'],
        data.incidents.list.map(i => [i.date, i.type, i.status, i.phiInvolved, i.ocrRequired]),
        [28, 45, 30, 22, 25]
      );
    }
  }

  // Upcoming Events
  if (sections.upcomingEvents) {
    sectionTitle('Upcoming Compliance Events — Next 90 Days');
    if (data.upcomingEvents.length === 0) {
      paragraph('No compliance events scheduled in the next 90 days.');
    } else {
      pdfTable(
        ['Date', 'Event', 'Type', 'Urgency'],
        data.upcomingEvents.map(e => [new Date(e.date).toLocaleDateString(), e.description, e.type, e.urgency]),
        [28, 80, 30, 22]
      );
    }
  }

  // Compliance Statement
  if (sections.complianceStatement) {
    sectionTitle('Compliance Officer Statement');
    paragraph(`"${statement}"`);
    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...dark);
    doc.text(data.org.complianceOfficer, M, y); y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...gray);
    doc.text(`Compliance Officer — ${orgName}`, M, y); y += 5;
    doc.text(today, M, y); y += 8;
  }

  const period = data.period.label.replace(/\s+/g, '_');
  const date = new Date().toISOString().split('T')[0];
  const filename = `${orgName.replace(/\s+/g, '_')}_HIPAA_Report_${period}_${date}.pdf`;
  doc.save(filename);
  return filename;
}

// ─── Schedule Modal ───────────────────────────────────────────────────────────

function ScheduleModal({ onClose, data, sections }: { onClose: () => void; data: BoardReportData | null; sections: Sections }) {
  const [freq, setFreq] = useState<'monthly' | 'quarterly' | 'annual'>('quarterly');
  const [sendDay, setSendDay] = useState(1);
  const [recipients, setRecipients] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const addEmail = () => {
    const e = emailInput.trim();
    if (e && /\S+@\S+\.\S+/.test(e) && !recipients.includes(e)) {
      setRecipients(r => [...r, e]);
      setEmailInput('');
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await fetch('/api/reports/board', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_schedule', frequency: freq, send_on_day: sendDay, recipients, sections_config: sections }),
      });
      setSaved(true);
      setTimeout(onClose, 1500);
    } catch { /* ignore */ } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-[#0e274e]">Schedule Automatic Reports</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X className="h-4 w-4" /></button>
        </div>
        <div className="px-6 py-5 space-y-5">
          {/* Frequency */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Frequency</label>
            <div className="flex gap-1">
              {(['monthly', 'quarterly', 'annual'] as const).map(f => (
                <button key={f} onClick={() => setFreq(f)} className={cn('flex-1 py-2 text-xs font-semibold capitalize border transition-colors', freq === f ? 'bg-[#0175a2] text-white border-[#0175a2]' : 'text-gray-600 border-gray-200 hover:border-[#0175a2]/50')}>{f}</button>
              ))}
            </div>
          </div>

          {/* Send on day */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Send on day of {freq === 'annual' ? 'year' : freq === 'quarterly' ? 'quarter' : 'month'}</label>
            <select value={sendDay} onChange={e => setSendDay(Number(e.target.value))} className="w-full border border-gray-200 text-sm px-3 py-2 focus:outline-none focus:border-[#0175a2]">
              {[1, 5, 10, 15, 20, 25, 28].map(d => <option key={d} value={d}>Day {d}</option>)}
            </select>
          </div>

          {/* Recipients */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Recipients</label>
            <div className="flex gap-2 mb-2">
              <input value={emailInput} onChange={e => setEmailInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addEmail()} placeholder="email@example.com" className="flex-1 border border-gray-200 text-sm px-3 py-2 focus:outline-none focus:border-[#0175a2]" />
              <button onClick={addEmail} className="px-3 py-2 bg-[#0175a2] text-white text-xs hover:bg-[#015a7a]"><Plus className="h-3.5 w-3.5" /></button>
            </div>
            <div className="flex flex-wrap gap-1">
              {recipients.map(r => (
                <span key={r} className="flex items-center gap-1 bg-gray-100 text-xs px-2 py-1 rounded-sm">
                  {r}
                  <button onClick={() => setRecipients(rs => rs.filter(x => x !== r))}><X className="h-3 w-3 text-gray-400 hover:text-red-500" /></button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 px-6 pb-6">
          <button onClick={save} disabled={saving || saved} className={cn('flex-1 py-2.5 text-sm font-semibold text-white transition-colors', saved ? 'bg-green-600' : 'bg-[#0175a2] hover:bg-[#015a7a]')}>
            {saved ? '✓ Saved!' : saving ? 'Saving…' : 'Save Schedule'}
          </button>
          <button onClick={onClose} className="px-4 py-2.5 text-sm text-gray-600 border border-gray-200 hover:border-gray-400">Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── Config Accordion ─────────────────────────────────────────────────────────

function Accordion({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/10">
      <button onClick={() => setOpen(o => !o)} className="flex items-center justify-between w-full px-4 py-3 text-xs font-semibold text-white/70 uppercase tracking-wide hover:bg-white/5 transition-colors">
        {title}
        {open ? <ChevronUp className="h-3.5 w-3.5 text-white/40" /> : <ChevronDown className="h-3.5 w-3.5 text-white/40" />}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const now = new Date();
const currentQ = Math.floor(now.getMonth() / 3) + 1;
const currentYear = now.getFullYear();

export default function BoardReportClient() {
  const { isLocked } = useSubscription();

  // Period config
  const [periodType, setPeriodType] = useState<'quarterly' | 'monthly' | 'annual'>('quarterly');
  const [quarter, setQuarter] = useState(currentQ);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(currentYear);

  // Sections config
  const [sections, setSections] = useState<Sections>({
    executiveSummary: true, scoreTrend: true, regulatoryActivity: true,
    policyStatus: true, staffTraining: true, baaStatus: true,
    riskAssessment: true, incidents: true, upcomingEvents: true,
    complianceStatement: true,
  });

  // Branding — persisted to localStorage
  const [preparedFor, setPreparedFor] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('br_preparedFor') ?? 'Board of Directors' : 'Board of Directors'
  );
  const [preparedBy, setPreparedBy] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('br_preparedBy') ?? '' : ''
  );
  const [orgNameOverride, setOrgNameOverride] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('br_orgName') ?? '' : ''
  );

  // Statement — persisted to localStorage
  const [statement, setStatement] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('br_statement') ?? '' : ''
  );

  // Recipients
  const [recipientInput, setRecipientInput] = useState('');
  const [recipients, setRecipients] = useState<string[]>([]);

  // Data
  const [data, setData] = useState<BoardReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const param = periodParam(periodType, quarter, month, year);
      const res = await fetch(`/api/reports/board?period=${param}`);
      if (!res.ok) throw new Error('Failed to load report data');
      const json = await res.json();
      setData(json);
      if (!localStorage.getItem('br_statement') && json.complianceOfficerStatement) setStatement(json.complianceOfficerStatement);
      if (!localStorage.getItem('br_preparedBy') && json.org?.complianceOfficer) setPreparedBy(json.org.complianceOfficer);
      if (!localStorage.getItem('br_orgName') && json.org?.name) setOrgNameOverride(json.org.name);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [periodType, quarter, month, year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Persist branding + statement to localStorage on change
  useEffect(() => { localStorage.setItem('br_preparedFor', preparedFor); }, [preparedFor]);
  useEffect(() => { localStorage.setItem('br_preparedBy', preparedBy); }, [preparedBy]);
  useEffect(() => { localStorage.setItem('br_orgName', orgNameOverride); }, [orgNameOverride]);
  useEffect(() => { localStorage.setItem('br_statement', statement); }, [statement]);

  const handleExport = async () => {
    if (!data) return;
    setExporting(true);
    try {
      await generatePDF(data, sections, { orgName: orgNameOverride || data.org.name, preparedFor, preparedBy }, statement);
    } catch (e) {
      console.error('PDF generation failed:', e);
    } finally {
      setExporting(false);
    }
  };

  const toggleSection = (key: keyof Sections) => setSections(s => ({ ...s, [key]: !s[key] }));

  const addRecipient = () => {
    const e = recipientInput.trim();
    if (e && /\S+@\S+\.\S+/.test(e) && !recipients.includes(e)) {
      setRecipients(r => [...r, e]);
      setRecipientInput('');
    }
  };

  const displayPeriod = data?.period ? `${data.period.label} · Generated ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}` : 'Loading…';

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="-m-4 sm:-m-8 flex flex-col h-screen overflow-hidden">

      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center justify-between gap-4 px-6 py-3.5 bg-white border-b border-gray-200 shadow-sm z-10">
        <div>
          <h1 className="text-lg font-light text-[#0e274e] leading-tight">Board &amp; Executive Report</h1>
          <p className="text-xs text-gray-400 font-light">{displayPeriod}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => setScheduleOpen(true)} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 border border-gray-200 hover:border-[#0175a2] hover:text-[#0175a2] transition-colors">
            <Clock className="h-3.5 w-3.5" /> Schedule
          </button>
          <ActionGate isLocked={isLocked} documentType="board compliance report">
            <button
              onClick={handleExport}
              disabled={exporting || loading || !data}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#0175a2] text-white hover:bg-[#015a7a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {exporting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              {exporting ? 'Generating…' : 'Export PDF'}
            </button>
          </ActionGate>
        </div>
      </div>

      {/* ── Two-column layout ────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left Config Sidebar ─────────────────────────────────────── */}
        <aside className="w-64 shrink-0 bg-[#0e274e] overflow-y-auto flex flex-col">

          <Accordion title="Report Period" defaultOpen>
            {/* Period type */}
            <div className="flex gap-0.5 mb-3">
              {(['quarterly', 'monthly', 'annual'] as const).map(t => (
                <button key={t} onClick={() => setPeriodType(t)} className={cn('flex-1 py-1.5 text-[10px] font-semibold capitalize border transition-colors', periodType === t ? 'bg-white text-[#0e274e] border-white' : 'text-white/60 border-white/20 hover:border-white/50')}>{t}</button>
              ))}
            </div>
            {/* Date selectors */}
            {periodType === 'quarterly' && (
              <div className="flex gap-2">
                <select value={quarter} onChange={e => setQuarter(Number(e.target.value))} className="flex-1 bg-white/10 border border-white/20 text-white text-xs px-2 py-1.5 focus:outline-none focus:border-white/60">
                  {[1, 2, 3, 4].map(q => <option key={q} value={q} className="text-[#0e274e] bg-white">Q{q}</option>)}
                </select>
                <select value={year} onChange={e => setYear(Number(e.target.value))} className="flex-1 bg-white/10 border border-white/20 text-white text-xs px-2 py-1.5 focus:outline-none focus:border-white/60">
                  {years.map(y => <option key={y} value={y} className="text-[#0e274e] bg-white">{y}</option>)}
                </select>
              </div>
            )}
            {periodType === 'monthly' && (
              <div className="flex gap-2">
                <select value={month} onChange={e => setMonth(Number(e.target.value))} className="flex-1 bg-white/10 border border-white/20 text-white text-xs px-2 py-1.5 focus:outline-none focus:border-white/60">
                  {months.map((m, i) => <option key={i} value={i + 1} className="text-[#0e274e] bg-white">{m}</option>)}
                </select>
                <select value={year} onChange={e => setYear(Number(e.target.value))} className="flex-1 bg-white/10 border border-white/20 text-white text-xs px-2 py-1.5 focus:outline-none focus:border-white/60">
                  {years.map(y => <option key={y} value={y} className="text-[#0e274e] bg-white">{y}</option>)}
                </select>
              </div>
            )}
            {periodType === 'annual' && (
              <select value={year} onChange={e => setYear(Number(e.target.value))} className="w-full bg-white/10 border border-white/20 text-white text-xs px-2 py-1.5 focus:outline-none focus:border-white/60">
                {years.map(y => <option key={y} value={y} className="text-[#0e274e] bg-white">{y}</option>)}
              </select>
            )}
          </Accordion>

          <Accordion title="Sections" defaultOpen>
            <div className="space-y-2">
              {(Object.keys(sections) as (keyof Sections)[]).map(key => (
                <label key={key} className="flex items-center gap-2.5 cursor-pointer group">
                  <div onClick={() => toggleSection(key)} className={cn('w-4 h-4 border flex items-center justify-center shrink-0 transition-colors', sections[key] ? 'bg-white border-white' : 'border-white/30 group-hover:border-white/60')}>
                    {sections[key] && <svg className="w-2.5 h-2.5 text-[#0e274e]" viewBox="0 0 10 10"><polyline points="1.5,5 4,7.5 8.5,2.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                  </div>
                  <span className="text-xs text-white/80">{SECTION_LABELS[key]}</span>
                </label>
              ))}
            </div>
          </Accordion>

          <Accordion title="Branding">
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] text-white/50 uppercase tracking-wide mb-1">Organization Name</label>
                <input value={orgNameOverride} onChange={e => setOrgNameOverride(e.target.value)} placeholder="Your organization" className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-xs px-2.5 py-1.5 focus:outline-none focus:border-white/60" />
              </div>
              <div>
                <label className="block text-[10px] text-white/50 uppercase tracking-wide mb-1">Prepared For</label>
                <input value={preparedFor} onChange={e => setPreparedFor(e.target.value)} placeholder="Board of Directors" className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-xs px-2.5 py-1.5 focus:outline-none focus:border-white/60" />
              </div>
              <div>
                <label className="block text-[10px] text-white/50 uppercase tracking-wide mb-1">Prepared By</label>
                <input value={preparedBy} onChange={e => setPreparedBy(e.target.value)} placeholder="Compliance Officer" className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-xs px-2.5 py-1.5 focus:outline-none focus:border-white/60" />
              </div>
            </div>
          </Accordion>

          <Accordion title="CO Statement">
            <div>
              <textarea value={statement} onChange={e => { if (e.target.value.length <= 600) setStatement(e.target.value); }} rows={6} placeholder="Enter the compliance officer's statement…" className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-xs px-2.5 py-2 focus:outline-none focus:border-white/60 resize-none leading-relaxed" />
              <p className="text-[10px] text-white/40 text-right mt-1">{statement.length}/600</p>
            </div>
          </Accordion>

          <Accordion title="Recipients">
            <div className="space-y-2">
              <div className="flex gap-1.5">
                <input value={recipientInput} onChange={e => setRecipientInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addRecipient()} placeholder="email@example.com" className="flex-1 bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-xs px-2 py-1.5 focus:outline-none focus:border-white/60 min-w-0" />
                <button onClick={addRecipient} className="px-2 py-1.5 bg-white/20 text-white hover:bg-white/30"><Plus className="h-3.5 w-3.5" /></button>
              </div>
              <div className="space-y-1">
                {recipients.map(r => (
                  <div key={r} className="flex items-center justify-between text-xs bg-white/10 px-2 py-1">
                    <span className="truncate text-white/80">{r}</span>
                    <button onClick={() => setRecipients(rs => rs.filter(x => x !== r))}><X className="h-3 w-3 text-white/40 hover:text-red-400" /></button>
                  </div>
                ))}
              </div>
            </div>
          </Accordion>
        </aside>

        {/* ── Report Preview ───────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto bg-[#f3f5f9] p-6">
          {loading && (
            <div className="flex items-center justify-center h-64 text-gray-400 gap-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading report data…</span>
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center h-64 text-red-500 text-sm">{error}</div>
          )}
          {!loading && !error && data && (
            <div className="max-w-3xl mx-auto">
              {/* Document */}
              <div className="bg-white shadow-lg ring-1 ring-black/5">
                {/* Report Header */}
                <div className="px-10 pt-10 pb-6 border-b border-gray-200">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                      <p className="text-xl font-semibold text-[#0e274e]">HIPAA Compliance Report</p>
                      <p className="text-sm text-[#0175a2] mt-0.5">{data.period.label} — {new Date(data.period.start).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} to {new Date(data.period.end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <div className="text-right text-xs text-gray-400 space-y-0.5 shrink-0">
                      <p><span className="text-gray-500">Prepared for:</span> {preparedFor}</p>
                      <p><span className="text-gray-500">Prepared by:</span> {preparedBy || data.org.complianceOfficer}</p>
                      <p><span className="text-gray-500">Generated:</span> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                      <p className="font-semibold text-[#0e274e] uppercase tracking-wide text-[10px] mt-1">Confidential</p>
                    </div>
                  </div>
                </div>

                {/* Sections */}
                <div className="px-10 py-8 space-y-2">
                  {sections.executiveSummary && <ExecutiveSummarySection d={data} />}
                  {sections.scoreTrend && <ScoreTrendSection d={data} />}
                  {sections.regulatoryActivity && <RegulatorySection d={data} />}
                  {sections.policyStatus && <PolicySection d={data} />}
                  {sections.staffTraining && <TrainingSection d={data} />}
                  {sections.baaStatus && <BAASection d={data} />}
                  {sections.riskAssessment && <RiskAssessmentSection d={data} />}
                  {sections.incidents && <IncidentsSection d={data} />}
                  {sections.upcomingEvents && <UpcomingEventsSection d={data} />}
                  {sections.complianceStatement && <ComplianceStatementSection d={data} statement={statement} />}
                </div>

                {/* Footer note */}
                <div className="px-10 py-4 bg-gray-50 border-t border-gray-100 text-center">
                  <p className="text-[10px] text-gray-400">
                    This report was generated by HIPAA Hub on {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
                    {data.org.address ? ` ${orgNameOverride || data.org.name} | ${data.org.address}.` : ''}
                    {' '}Confidential — For Board and Executive Use Only.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {scheduleOpen && data && <ScheduleModal onClose={() => setScheduleOpen(false)} data={data} sections={sections} />}
    </div>
  );
}
