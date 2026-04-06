'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2, AlertTriangle, ArrowRight, Send, Loader2,
  ChevronRight, TrendingUp, TrendingDown, Minus, PrinterIcon
} from 'lucide-react';

interface Review {
  id: string;
  quarter: string;
  year: number;
  status: string;
  meeting_date?: string;
  meeting_time?: string;
  meeting_location?: string;
  pre_brief_sent_at?: string;
}

interface Attendee { id: string; name: string; role?: string; email?: string; }

interface PrepareData {
  compliance: {
    score: number;
    tier: string;
    breakdown: {
      policies: { active: number; total: number };
      risk: { percentage: number | null; lastAssessed: string | null };
      training: { completed: number; total: number; overdue: number };
      baas: { total: number; expired: number; expiring: number };
    };
  };
  mitigation: { open: any[]; in_progress: any[]; overdue: any[] };
  incidents: { quarter: any[]; recent: any[] };
  baas: { expired: any[]; expiring: any[] };
  training: { overdue: any[]; employees: any[] };
  calendar_events: any[];
  previous_action_items: any[];
}

function formatDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

function ScoreRing({ score, tier }: { score: number; tier: string }) {
  const tierColor = tier === 'Protected' ? '#22c55e' : tier === 'Partial' ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex items-center gap-4">
      <div className="relative h-16 w-16">
        <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
          <circle cx="18" cy="18" r="15.9" fill="none" stroke={tierColor} strokeWidth="3"
            strokeDasharray={`${score} ${100 - score}`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold text-[#0e274e]">{score}</span>
        </div>
      </div>
      <div>
        <p className="text-2xl font-light text-[#0e274e]">{score}/100</p>
        <p style={{ color: tierColor }} className="text-sm font-medium">{tier}</p>
      </div>
    </div>
  );
}

export default function PrepareClient({
  review,
  attendees,
  orgName,
}: {
  review: Review;
  attendees: Attendee[];
  orgName: string;
}) {
  const router = useRouter();
  const [data, setData] = useState<PrepareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [starting, setStarting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    fetch(`/api/reviews/quarterly/${review.id}/prepare-data`)
      .then(r => r.json())
      .then(d => setData(d))
      .finally(() => setLoading(false));
  }, [review.id]);

  async function sendPreBrief() {
    setSending(true);
    const res = await fetch(`/api/reviews/quarterly/${review.id}/send-pre-brief`, { method: 'POST' });
    const d = await res.json();
    setSending(false);
    showToast(res.ok ? `Pre-brief sent to ${d.sent} attendee${d.sent !== 1 ? 's' : ''}.` : 'Failed to send.');
  }

  async function startMeeting() {
    setStarting(true);
    await fetch(`/api/reviews/quarterly/${review.id}/start`, { method: 'PATCH' });
    router.push(`/dashboard/quarterly-review/${review.id}/meeting`);
  }

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-[#f3f5f9]">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div>
          <p className="text-xs text-gray-400 font-light">Preparation</p>
          <h1 className="text-base font-medium text-[#0e274e]">
            {review.quarter} {review.year} Compliance Review — Pre-Meeting Brief
          </h1>
          {review.meeting_date && (
            <p className="text-xs text-gray-500 font-light">
              Meeting scheduled for {formatDate(review.meeting_date)}
              {review.meeting_time && ` at ${review.meeting_time}`}
              {review.meeting_location && ` · ${review.meeting_location}`}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={sendPreBrief}
            disabled={sending || attendees.filter(a => a.email).length === 0}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 rounded disabled:opacity-50"
          >
            {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            Send Pre-Brief to Attendees
          </button>
          <button
            onClick={startMeeting}
            disabled={starting}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0d9488] text-white text-xs font-medium rounded hover:bg-[#0b7e74] transition-colors"
          >
            {starting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
            Start Meeting
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-5 w-5 animate-spin text-gray-300" />
        </div>
      ) : !data ? (
        <div className="p-8 text-center text-gray-400 text-sm">Failed to load compliance data.</div>
      ) : (
        <div className="max-w-3xl mx-auto py-8 px-4 space-y-0 print:py-4">

          {/* Document header */}
          <div className="bg-white border border-gray-200 px-8 py-6">
            <div className="text-center border-b border-gray-100 pb-4 mb-4">
              <p className="text-xs font-semibold text-gray-400st mb-1">Confidential — Internal Use Only</p>
              <h2 className="text-xl font-light text-[#0e274e]">
                Pre-Meeting Brief — {review.quarter} {review.year} Review
              </h2>
              <p className="text-xs text-gray-400 mt-1">{orgName}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
              <div>
                <span className="text-gray-400">Data as of: </span>
                <span className="font-medium text-gray-700">{formatDate(todayStr)}</span>
              </div>
              <div>
                <span className="text-gray-400">Attendees: </span>
                <span className="font-medium text-gray-700">
                  {attendees.length > 0
                    ? attendees.slice(0, 3).map(a => a.name).join(', ') + (attendees.length > 3 ? ` +${attendees.length - 3} more` : '')
                    : 'Not set'}
                </span>
              </div>
              {review.meeting_date && (
                <div>
                  <span className="text-gray-400">Meeting: </span>
                  <span className="font-medium text-gray-700">{formatDate(review.meeting_date)}</span>
                </div>
              )}
              {review.meeting_location && (
                <div>
                  <span className="text-gray-400">Location: </span>
                  <span className="font-medium text-gray-700">{review.meeting_location}</span>
                </div>
              )}
            </div>
          </div>

          {/* ── SECTION 1: Compliance Score ───────────────────────────────── */}
          <BriefSection title={`Section 1 — Compliance Score — ${review.quarter} ${review.year}`}>
            <div className="flex items-start gap-8">
              <ScoreRing score={data.compliance.score} tier={data.compliance.tier} />
              <div className="flex-1">
                <div className="space-y-2">
                  {[
                    {
                      label: 'Policies',
                      value: `${data.compliance.breakdown.policies.active}/${data.compliance.breakdown.policies.total} active`,
                      pct: Math.round((data.compliance.breakdown.policies.active / Math.max(data.compliance.breakdown.policies.total, 1)) * 100),
                      ok: data.compliance.breakdown.policies.active >= data.compliance.breakdown.policies.total,
                    },
                    {
                      label: 'Risk Assessment',
                      value: data.compliance.breakdown.risk.lastAssessed
                        ? `Last completed ${new Date(data.compliance.breakdown.risk.lastAssessed).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
                        : 'Not completed',
                      pct: data.compliance.breakdown.risk.percentage != null
                        ? Math.max(0, 100 - data.compliance.breakdown.risk.percentage)
                        : 0,
                      ok: data.compliance.breakdown.risk.lastAssessed != null,
                    },
                    {
                      label: 'Staff Training',
                      value: `${data.compliance.breakdown.training.completed}/${data.compliance.breakdown.training.total} complete${data.compliance.breakdown.training.overdue > 0 ? ` · ${data.compliance.breakdown.training.overdue} overdue` : ''}`,
                      pct: data.compliance.breakdown.training.total > 0
                        ? Math.round((data.compliance.breakdown.training.completed / data.compliance.breakdown.training.total) * 100)
                        : 100,
                      ok: data.compliance.breakdown.training.overdue === 0,
                    },
                    {
                      label: 'BAA Coverage',
                      value: `${data.compliance.breakdown.baas.total} vendors${data.compliance.breakdown.baas.expired > 0 ? ` · ${data.compliance.breakdown.baas.expired} expired` : ''}${data.compliance.breakdown.baas.expiring > 0 ? ` · ${data.compliance.breakdown.baas.expiring} expiring` : ''}`,
                      pct: data.compliance.breakdown.baas.total > 0
                        ? Math.round(((data.compliance.breakdown.baas.total - data.compliance.breakdown.baas.expired) / data.compliance.breakdown.baas.total) * 100)
                        : 100,
                      ok: data.compliance.breakdown.baas.expired === 0,
                    },
                  ].map(row => (
                    <div key={row.label} className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-28 flex-shrink-0">{row.label}</span>
                      <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${row.ok ? 'bg-green-500' : row.pct >= 80 ? 'bg-amber-400' : 'bg-red-400'}`}
                          style={{ width: `${row.pct}%` }}
                        />
                      </div>
                      <span className={`text-xs w-56 ${row.ok ? 'text-gray-600' : 'text-amber-600 font-medium'}`}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {data.compliance.breakdown.baas.expired > 0 && (
              <TalkingPoint type="warn">
                BAA coverage has expired vendors. Recommend prioritizing BAA renewals in this meeting.
              </TalkingPoint>
            )}
            {data.compliance.breakdown.training.overdue > 0 && (
              <TalkingPoint type="warn">
                {data.compliance.breakdown.training.overdue} staff training renewal{data.compliance.breakdown.training.overdue > 1 ? 's are' : ' is'} overdue. Set firm deadlines today.
              </TalkingPoint>
            )}
          </BriefSection>

          {/* ── SECTION 2: Open Items ─────────────────────────────────────── */}
          <BriefSection title="Section 2 — Open Items Requiring Decision">
            {data.mitigation.overdue.length === 0 && data.baas.expired.length === 0 && data.training.overdue.length === 0 ? (
              <p className="text-sm text-green-600 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> No critical items requiring decision.
              </p>
            ) : (
              <div className="space-y-4">
                {data.baas.expired.map((baa: any, i) => (
                  <DecisionItem
                    key={baa.id}
                    number={i + 1}
                    title={`${baa.vendor_name} BAA expired${baa.expiration_date ? ` ${formatDate(baa.expiration_date)}` : ''}`}
                    severity="HIGH"
                    description="PHI may be transmitted without a valid BAA — HIPAA violation risk."
                    options={['(A) Renew BAA immediately', '(B) Suspend use of vendor until renewed', '(C) Switch to compliant vendor']}
                  />
                ))}
                {data.training.overdue.map((t: any, i) => {
                  const emp = data.training.employees.find((e: any) => e.id === t.employee_id);
                  return (
                    <DecisionItem
                      key={t.id}
                      number={data.baas.expired.length + i + 1}
                      title={`${emp?.name ?? 'Employee'} — HIPAA training renewal overdue`}
                      severity="MEDIUM"
                      description="Training expired. Employee may be handling PHI without current training."
                      options={['(A) Set deadline within 2 weeks', '(B) Restrict PHI access until complete']}
                    />
                  );
                })}
                {data.mitigation.overdue.map((m: any, i) => (
                  <DecisionItem
                    key={m.id}
                    number={data.baas.expired.length + data.training.overdue.length + i + 1}
                    title={`${m.title} — overdue by ${Math.ceil((Date.now() - new Date(m.due_date).getTime()) / 86400000)} days`}
                    severity={m.priority === 'high' ? 'HIGH' : 'MEDIUM'}
                    description="Mitigation item past its due date with no resolution."
                    options={['(A) Extend deadline with new owner', '(B) Escalate to leadership', '(C) Close as accepted risk']}
                  />
                ))}
              </div>
            )}
          </BriefSection>

          {/* ── SECTION 3: BAA Status ─────────────────────────────────────── */}
          {(data.baas.expired.length > 0 || data.baas.expiring.length > 0) && (
            <BriefSection title="Section 3 — BAA & Vendor Status">
              {data.baas.expired.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-red-600 mb-2">Expired</p>
                  {data.baas.expired.map((b: any) => (
                    <div key={b.id} className="flex items-center gap-2 py-1.5 text-sm">
                      <AlertTriangle className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />
                      <span className="font-medium text-[#0e274e]">{b.vendor_name}</span>
                      <span className="text-gray-400 text-xs">expired {b.expiration_date ? formatDate(b.expiration_date) : 'unknown'}</span>
                    </div>
                  ))}
                </div>
              )}
              {data.baas.expiring.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-amber-600 mb-2">Expiring Within 90 Days</p>
                  {data.baas.expiring.map((b: any) => {
                    const days = Math.ceil((new Date(b.expiration_date).getTime() - Date.now()) / 86400000);
                    return (
                      <div key={b.id} className="flex items-center gap-2 py-1.5 text-sm">
                        <Clock className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                        <span className="font-medium text-[#0e274e]">{b.vendor_name}</span>
                        <span className="text-gray-400 text-xs">expires in {days} days</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </BriefSection>
          )}

          {/* ── SECTION 4: Previous Action Items ─────────────────────────── */}
          {data.previous_action_items.length > 0 && (
            <BriefSection title="Section 4 — Previous Action Items — Status">
              <div className="space-y-2">
                {data.previous_action_items.slice(0, 10).map((item: any) => {
                  const icon = item.status === 'complete'
                    ? <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    : item.status === 'in_progress'
                      ? <Clock className="h-4 w-4 text-blue-400 flex-shrink-0" />
                      : <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />;
                  const isOverdue = item.due_date && new Date(item.due_date) < new Date() && item.status !== 'complete';
                  return (
                    <div key={item.id} className="flex items-start gap-2.5 py-2 border-b border-gray-50 last:border-0">
                      {icon}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${item.status === 'complete' ? 'text-gray-400 line-through' : 'text-[#0e274e]'}`}>
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {item.assigned_to_name && <>{item.assigned_to_name} · </>}
                          {item.due_date && <>Due {formatDate(item.due_date)}</>}
                          {isOverdue && <span className="text-red-500 font-medium"> · OVERDUE</span>}
                        </p>
                      </div>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-sm ${
                        item.status === 'complete' ? 'bg-green-50 text-green-600' :
                        item.status === 'in_progress' ? 'bg-blue-50 text-blue-600' :
                        isOverdue ? 'bg-red-50 text-red-600' :
                        'bg-gray-50 text-gray-500'
                      }`}>{item.status.replace('_', ' ')}</span>
                    </div>
                  );
                })}
              </div>
              {data.previous_action_items.length > 10 && (
                <p className="text-xs text-gray-400 mt-2">+ {data.previous_action_items.length - 10} more</p>
              )}
            </BriefSection>
          )}

          {/* ── SECTION 5: Upcoming Calendar Events ──────────────────────── */}
          {data.calendar_events.length > 0 && (
            <BriefSection title="Section 5 — Upcoming Compliance Events (Next 90 Days)">
              <div className="space-y-1.5">
                {data.calendar_events.map((e: any) => {
                  const days = Math.ceil((new Date(e.due_date).getTime() - Date.now()) / 86400000);
                  const isUrgent = days <= 30;
                  return (
                    <div key={e.id} className="flex items-center gap-3 py-1.5 text-sm">
                      <span className={`text-[10px] font-semibold w-16 text-right flex-shrink-0 ${isUrgent ? 'text-red-500' : 'text-gray-400'}`}>
                        {days}d
                      </span>
                      <span className="text-[#0e274e]">{e.title}</span>
                      <span className="text-xs text-gray-400 ml-auto">{formatDate(e.due_date)}</span>
                    </div>
                  );
                })}
              </div>
            </BriefSection>
          )}

          {/* Footer actions */}
          <div className="bg-white border border-gray-200 px-8 py-5 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Ready to run the meeting? Click Start Meeting to open the live facilitation view.
            </p>
            <button
              onClick={startMeeting}
              disabled={starting}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0d9488] text-white text-sm font-medium rounded hover:bg-[#0b7e74] transition-colors"
            >
              {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
              Start Meeting
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0e274e] text-white text-sm px-4 py-2.5 rounded shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function BriefSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border-x border-b border-gray-200 px-8 py-6">
      <div className="border-l-4 border-[#0d9488] pl-4 mb-4">
        <h3 className="text-sm font-semibold text-[#0e274e]">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function TalkingPoint({ type, children }: { type: 'warn' | 'info'; children: React.ReactNode }) {
  return (
    <div className={`mt-4 flex items-start gap-2 p-3 rounded text-xs ${
      type === 'warn' ? 'bg-amber-50 text-amber-800 border border-amber-100' : 'bg-blue-50 text-blue-800 border border-blue-100'
    }`}>
      <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
      <span><strong>Key talking point:</strong> {children}</span>
    </div>
  );
}

function DecisionItem({
  number, title, severity, description, options
}: {
  number: number;
  title: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  options: string[];
}) {
  const sevCls = severity === 'HIGH' ? 'bg-red-100 text-red-700' : severity === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700';
  return (
    <div className="border border-gray-100 p-4 rounded">
      <div className="flex items-start gap-2 mb-2">
        <span className="text-xs font-semibold text-gray-400 mt-0.5 w-5 flex-shrink-0">#{number}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <p className="text-sm font-medium text-[#0e274e]">{title}</p>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${sevCls}`}>{severity}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {options.map((opt, i) => (
              <span key={i} className="text-[11px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{opt}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Clock({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
