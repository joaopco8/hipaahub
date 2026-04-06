'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Calendar, Users, CheckCircle2, Clock, AlertCircle,
  X, ChevronDown, Loader2, PlayCircle, Eye, Settings,
  ArrowRight
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Attendee { name: string; email?: string; role?: string; }

interface Review {
  id: string;
  quarter: string;
  year: number;
  period_start: string;
  period_end: string;
  status: 'scheduled' | 'in_progress' | 'complete' | 'cancelled';
  meeting_date?: string;
  meeting_time?: string;
  meeting_location?: string;
  duration_minutes?: number;
  compliance_score_at_review?: number;
  compliance_tier_at_review?: string;
  started_at?: string;
  completed_at?: string;
  notes_for_attendees?: string;
  created_at: string;
  attendees: { id: string; name: string; was_present: boolean }[];
  action_items: { id: string; status: string }[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const QUARTERS_CONFIG = [
  { label: 'Q1', months: 'January — March',   periodStart: (y: number) => `${y}-01-01` },
  { label: 'Q2', months: 'April — June',       periodStart: (y: number) => `${y}-04-01` },
  { label: 'Q3', months: 'July — September',   periodStart: (y: number) => `${y}-07-01` },
  { label: 'Q4', months: 'October — December', periodStart: (y: number) => `${y}-10-01` },
];

function currentQuarter(): { quarter: string; year: number } {
  const now = new Date();
  return { quarter: `Q${Math.ceil((now.getMonth() + 1) / 3)}`, year: now.getFullYear() };
}

function formatDate(d: string): string {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

function daysUntil(d: string): number {
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
}

function timeAgo(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor(diff / 60000);
  if (h >= 1) return `${h} hour${h > 1 ? 's' : ''} ago`;
  if (m >= 1) return `${m} minute${m > 1 ? 's' : ''} ago`;
  return 'just now';
}

// ── Schedule Modal ────────────────────────────────────────────────────────────

function ScheduleModal({
  onClose,
  onCreated,
  editReview,
}: {
  onClose: () => void;
  onCreated: () => void;
  editReview?: Review;
}) {
  const currentQ = currentQuarter();
  const [form, setForm] = useState({
    quarter: editReview?.quarter ?? currentQ.quarter,
    year: editReview?.year ?? currentQ.year,
    meeting_date: editReview?.meeting_date ?? '',
    meeting_time: editReview?.meeting_time ?? '',
    meeting_location: editReview?.meeting_location ?? '',
    duration_minutes: editReview?.duration_minutes ?? 60,
    notes_for_attendees: editReview?.notes_for_attendees ?? '',
  });
  const [attendees, setAttendees] = useState<Attendee[]>(
    editReview?.attendees?.map(a => ({ name: a.name, email: '', role: '' })) ?? [{ name: '', email: '', role: '' }]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const years = [currentQ.year - 1, currentQ.year, currentQ.year + 1];

  async function submit() {
    if (!form.quarter) { setError('Please select a quarter.'); return; }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/reviews/quarterly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          attendees: attendees.filter(a => a.name.trim()),
        }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Failed to schedule.'); return; }
      onCreated();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const qConfig = QUARTERS_CONFIG.find(q => q.label === form.quarter);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-[#0e274e]">
          <h3 className="text-base font-medium text-white">
            {editReview ? 'Edit Review' : 'Schedule Quarterly Review'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded transition-colors">
            <X className="h-4 w-4 text-white/70" />
          </button>
        </div>

        <div className="p-6 space-y-5 bg-white">
          {/* Quarter + Year */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Review Quarter</label>
              <div className="grid grid-cols-4 gap-1">
                {['Q1','Q2','Q3','Q4'].map(q => (
                  <button
                    key={q}
                    onClick={() => setForm(f => ({ ...f, quarter: q }))}
                    className={`py-2 text-xs font-medium border rounded transition-colors
                      ${form.quarter === q
                        ? 'bg-[#0e274e] text-white border-[#0e274e]'
                        : 'border-gray-200 text-gray-500 hover:border-[#0e274e]'}`}
                  >
                    {q}
                  </button>
                ))}
              </div>
              {qConfig && (
                <p className="text-[10px] text-gray-400 mt-1">{qConfig.months}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Year</label>
              <select
                className="w-full border border-gray-200 px-3 py-2 text-sm text-gray-800 rounded bg-gray-50 focus:outline-none focus:border-[#0175a2]"
                value={form.year}
                onChange={e => setForm(f => ({ ...f, year: parseInt(e.target.value) }))}
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Meeting Date</label>
              <input
                type="date"
                className="w-full border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 rounded bg-gray-50 focus:outline-none focus:border-[#0175a2]"
                value={form.meeting_date}
                onChange={e => setForm(f => ({ ...f, meeting_date: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Time (optional)</label>
              <input
                type="time"
                className="w-full border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 rounded bg-gray-50 focus:outline-none focus:border-[#0175a2]"
                value={form.meeting_time}
                onChange={e => setForm(f => ({ ...f, meeting_time: e.target.value }))}
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Location / Format</label>
            <input
              className="w-full border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 rounded bg-gray-50 focus:outline-none focus:border-[#0175a2]"
              placeholder="e.g. Conference Room A, or Zoom"
              value={form.meeting_location}
              onChange={e => setForm(f => ({ ...f, meeting_location: e.target.value }))}
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Meeting Duration</label>
            <div className="flex gap-2">
              {[30, 60, 90].map(d => (
                <button
                  key={d}
                  onClick={() => setForm(f => ({ ...f, duration_minutes: d }))}
                  className={`px-3 py-1.5 text-xs border rounded transition-colors
                    ${form.duration_minutes === d
                      ? 'bg-[#0e274e] text-white border-[#0e274e]'
                      : 'border-gray-200 text-gray-500 hover:border-[#0e274e]'}`}
                >
                  {d} min
                </button>
              ))}
            </div>
          </div>

          {/* Attendees */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Attendees</label>
            <div className="space-y-2">
              {attendees.map((a, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                  <input
                    className="border border-gray-200 px-2.5 py-1.5 text-xs text-gray-800 placeholder:text-gray-400 rounded bg-gray-50 focus:outline-none focus:border-[#0175a2]"
                    placeholder="Name"
                    value={a.name}
                    onChange={e => {
                      const next = [...attendees];
                      next[i] = { ...next[i], name: e.target.value };
                      setAttendees(next);
                    }}
                  />
                  <input
                    className="border border-gray-200 px-2.5 py-1.5 text-xs text-gray-800 placeholder:text-gray-400 rounded bg-gray-50 focus:outline-none focus:border-[#0175a2]"
                    placeholder="Email (for invite)"
                    value={a.email ?? ''}
                    onChange={e => {
                      const next = [...attendees];
                      next[i] = { ...next[i], email: e.target.value };
                      setAttendees(next);
                    }}
                  />
                  <button
                    onClick={() => setAttendees(attendees.filter((_, j) => j !== i))}
                    className="p-1 hover:bg-red-50 rounded text-gray-300 hover:text-red-400"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setAttendees([...attendees, { name: '', email: '', role: '' }])}
                className="text-xs text-[#0175a2] hover:text-[#0e274e] flex items-center gap-1 transition-colors"
              >
                <Plus className="h-3 w-3" /> Add attendee
              </button>
            </div>
          </div>

          {/* Notes for attendees */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Notes for Attendees</label>
            <textarea
              className="w-full border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 rounded bg-gray-50 focus:outline-none focus:border-[#0175a2] resize-none"
              rows={2}
              placeholder="Will be included in the calendar invite / pre-meeting email..."
              value={form.notes_for_attendees}
              onChange={e => setForm(f => ({ ...f, notes_for_attendees: e.target.value }))}
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded border border-red-100">{error}</p>
          )}
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={submit}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#0175a2] text-white text-sm font-medium hover:bg-[#015a7a] disabled:opacity-50 rounded transition-colors"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
            {saving ? 'Scheduling...' : 'Schedule Review'}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-200 text-sm text-gray-600 hover:bg-white rounded transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Review['status'] }) {
  const cfg = {
    scheduled:   { label: 'Scheduled',   cls: 'bg-blue-50 text-blue-700 border-blue-100' },
    in_progress: { label: 'In Progress', cls: 'bg-amber-50 text-amber-700 border-amber-100' },
    complete:    { label: 'Complete',    cls: 'bg-green-50 text-green-700 border-green-100' },
    cancelled:   { label: 'Cancelled',  cls: 'bg-gray-50 text-gray-500 border-gray-200' },
  }[status];
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 border rounded-sm ${cfg.cls}`}>
      {status === 'in_progress' && (
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse" />
      )}
      {cfg.label}
    </span>
  );
}

// ── Review Card ───────────────────────────────────────────────────────────────

function ReviewCard({ review, onRefresh }: { review: Review; onRefresh: () => void }) {
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);
  const totalItems = review.action_items.length;
  const resolvedItems = review.action_items.filter(a => a.status === 'complete').length;

  async function cancelReview() {
    if (!confirm('Cancel this review?')) return;
    setCancelling(true);
    await fetch(`/api/reviews/quarterly/${review.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' }),
    });
    onRefresh();
    setCancelling(false);
  }

  const isInProgress = review.status === 'in_progress';
  const isComplete = review.status === 'complete';
  const isScheduled = review.status === 'scheduled';

  return (
    <div className={`bg-white border rounded-sm p-5 transition-all
      ${isInProgress ? 'border-[#0d9488] shadow-sm' : 'border-gray-100 hover:border-gray-200'}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2.5 mb-1">
            <h3 className="text-base font-medium text-[#0e274e]">
              {review.quarter} {review.year} Compliance Review
            </h3>
            <StatusBadge status={review.status} />
          </div>

          {/* Date line */}
          <p className="text-xs text-gray-500 font-light mb-3">
            {isInProgress && review.started_at && (
              <>Started {timeAgo(review.started_at)} · </>
            )}
            {isComplete && review.completed_at && (
              <>Completed {formatDate(review.completed_at)}
                {review.duration_minutes && <> · {review.duration_minutes} min</>}
              </>
            )}
            {isScheduled && review.meeting_date && (
              <>Scheduled for {formatDate(review.meeting_date)}
                {' '}
                <span className={daysUntil(review.meeting_date) < 7 ? 'text-amber-600 font-medium' : ''}>
                  (in {daysUntil(review.meeting_date)} days)
                </span>
              </>
            )}
            {isScheduled && !review.meeting_date && 'Date not set'}
            {review.meeting_location && <> · {review.meeting_location}</>}
          </p>

          {/* Metrics row */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
            {review.attendees.length > 0 && (
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-gray-300" />
                {review.attendees.length} attendee{review.attendees.length !== 1 ? 's' : ''}
                {isComplete && ` (${review.attendees.filter(a => a.was_present).length} present)`}
              </span>
            )}
            {isComplete && review.compliance_score_at_review != null && (
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                Score: {review.compliance_score_at_review}/100 ({review.compliance_tier_at_review})
              </span>
            )}
            {isComplete && totalItems > 0 && (
              <span className="flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 text-gray-300" />
                {totalItems} action items — {resolvedItems} resolved
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1.5 flex-shrink-0">
          {isInProgress && (
            <button
              onClick={() => router.push(`/dashboard/quarterly-review/${review.id}/meeting`)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0d9488] text-white text-xs font-medium rounded hover:bg-[#0b7e74] transition-colors"
            >
              <PlayCircle className="h-3.5 w-3.5" /> Resume Meeting
            </button>
          )}
          {isScheduled && (
            <>
              <button
                onClick={() => router.push(`/dashboard/quarterly-review/${review.id}/prepare`)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#0e274e] text-white text-xs font-medium rounded hover:bg-[#0d2040] transition-colors"
              >
                <ArrowRight className="h-3.5 w-3.5" /> Prepare
              </button>
              <button
                onClick={cancelReview}
                disabled={cancelling}
                className="px-4 py-2 border border-gray-200 text-xs text-gray-500 hover:border-red-200 hover:text-red-500 rounded transition-colors"
              >
                Cancel
              </button>
            </>
          )}
          {isComplete && (
            <button
              onClick={() => router.push(`/dashboard/quarterly-review/${review.id}/record`)}
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-xs text-gray-600 hover:border-[#00bceb] hover:text-[#00bceb] rounded transition-colors"
            >
              <Eye className="h-3.5 w-3.5" /> View Record
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function QuarterlyIndexClient() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reviews/quarterly');
      const data = await res.json();
      setReviews(data.reviews ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const inProgress = reviews.filter(r => r.status === 'in_progress');
  const upcoming = reviews.filter(r => r.status === 'scheduled');
  const completed = reviews.filter(r => r.status === 'complete');

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 md:px-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs font-medium text-[#00bceb] tracking-widest uppercase mb-1">Clinic Plan</p>
          <h1 className="text-3xl font-light text-[#0e274e]">Quarterly Compliance Reviews</h1>
          <p className="text-sm text-gray-500 mt-1 font-light">
            Structured quarterly meetings to track, decide, and document your compliance program.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#00bceb] text-white text-sm font-medium hover:bg-[#00a8d4] rounded transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" /> Schedule Review
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-5 w-5 animate-spin text-gray-300" />
        </div>
      ) : reviews.length === 0 ? (
        /* Empty state */
        <div className="text-center py-16 px-8 border border-dashed border-gray-200 bg-white rounded">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-[#0e274e]/5 flex items-center justify-center">
            <Calendar className="h-6 w-6 text-[#0e274e]/30" />
          </div>
          <h3 className="text-base font-medium text-[#0e274e] mb-2">No quarterly reviews yet</h3>
          <p className="text-sm text-gray-500 font-light max-w-md mx-auto mb-6 leading-relaxed">
            Quarterly reviews help your team stay aligned on compliance status, identify gaps before they
            become violations, and create a documented record of your compliance program.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00bceb] text-white text-sm font-medium hover:bg-[#00a8d4] rounded transition-colors"
          >
            <Plus className="h-4 w-4" /> Schedule First Review
          </button>
        </div>
      ) : (
        <div className="space-y-8">

          {/* In Progress */}
          {inProgress.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-[#0d9488] uppercase tracking-widest mb-3">
                In Progress
              </h2>
              <div className="space-y-3">
                {inProgress.map(r => (
                  <ReviewCard key={r.id} review={r} onRefresh={fetchReviews} />
                ))}
              </div>
            </section>
          )}

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                Upcoming ({upcoming.length})
              </h2>
              <div className="space-y-3">
                {upcoming.map(r => (
                  <ReviewCard key={r.id} review={r} onRefresh={fetchReviews} />
                ))}
              </div>
            </section>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                Completed ({completed.length})
              </h2>
              <div className="space-y-3">
                {completed.map(r => (
                  <ReviewCard key={r.id} review={r} onRefresh={fetchReviews} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {showModal && (
        <ScheduleModal
          onClose={() => setShowModal(false)}
          onCreated={fetchReviews}
        />
      )}
    </div>
  );
}
