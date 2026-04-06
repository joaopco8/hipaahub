'use client';

import { useRouter } from 'next/navigation';
import {
  CheckCircle2, AlertTriangle, Clock, Download, ArrowLeft,
  ExternalLink, Users, Calendar, FileText
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Review {
  id: string;
  quarter: string;
  year: number;
  period_start: string;
  period_end: string;
  status: string;
  meeting_date?: string;
  duration_minutes?: number;
  compliance_score_at_review?: number;
  compliance_tier_at_review?: string;
  started_at?: string;
  completed_at?: string;
  meeting_location?: string;
}

interface Section {
  id: string;
  section_label: string;
  section_order: number;
  status: string;
  discussion_notes?: string;
  decisions: { id: string; decision_text: string; decided_by_name?: string }[];
  action_items?: ActionItem[];
}

interface ActionItem {
  id: string;
  title: string;
  assigned_to_name?: string;
  due_date?: string;
  priority: 'high' | 'medium' | 'low';
  status: string;
  section_id?: string;
}

interface Attendee {
  id: string;
  name: string;
  role?: string;
  was_present: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(d: string): string {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

const PRIORITY_CONFIG = {
  high:   { label: 'HIGH',   cls: 'bg-red-50 text-red-700 border-red-100' },
  medium: { label: 'MED',    cls: 'bg-amber-50 text-amber-700 border-amber-100' },
  low:    { label: 'LOW',    cls: 'bg-blue-50 text-blue-700 border-blue-100' },
};

// ── Record Client ─────────────────────────────────────────────────────────────

export default function RecordClient({
  review,
  sections,
  attendees,
  actionItems,
  orgName,
}: {
  review: Review;
  sections: Section[];
  attendees: Attendee[];
  actionItems: ActionItem[];
  orgName: string;
}) {
  const router = useRouter();

  const tierColor = review.compliance_tier_at_review === 'Protected'
    ? '#22c55e'
    : review.compliance_tier_at_review === 'Partial'
      ? '#f59e0b'
      : '#ef4444';

  const highItems = actionItems.filter(a => a.priority === 'high').length;
  const medItems = actionItems.filter(a => a.priority === 'medium').length;
  const lowItems = actionItems.filter(a => a.priority === 'low').length;
  const presentAttendees = attendees.filter(a => a.was_present);

  function printRecord() {
    window.print();
  }

  return (
    <div className="min-h-screen bg-[#f3f5f9]">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between print:hidden sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard/quarterly-review')}
            className="p-1.5 hover:bg-gray-100 rounded text-gray-400"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-base font-medium text-[#0e274e]">
              {review.quarter} {review.year} Compliance Review — Complete
            </h1>
            {review.completed_at && (
              <p className="text-xs text-gray-400 font-light">
                Conducted {formatDate(review.completed_at)}
                {review.duration_minutes && ` · ${review.duration_minutes} min`}
                {attendees.length > 0 && ` · ${presentAttendees.length || attendees.length} attendees`}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={printRecord}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 rounded"
          >
            <Download className="h-3.5 w-3.5" /> Export PDF
          </button>
          <a
            href="/dashboard/mitigation"
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 rounded"
          >
            <ExternalLink className="h-3.5 w-3.5" /> View Action Items
          </a>
        </div>
      </div>

      {/* Document */}
      <div className="max-w-3xl mx-auto py-8 px-4">

        {/* Cover */}
        <div className="bg-white border border-gray-200 px-8 py-8 print:border-0">
          <div className="text-center border-b border-gray-100 pb-6 mb-6">
            <p className="text-xs font-semibold text-gray-400st mb-2">Official Review Record</p>
            <h2 className="text-2xl font-light text-[#0e274e] mb-1">
              {review.quarter} {review.year} Compliance Review
            </h2>
            <p className="text-sm text-gray-500">{orgName}</p>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm mb-6">
            <DetailRow icon={<Calendar className="h-3.5 w-3.5" />} label="Review Period">
              {review.period_start && review.period_end
                ? `${formatDate(review.period_start)} — ${formatDate(review.period_end)}`
                : `${review.quarter} ${review.year}`}
            </DetailRow>
            {review.meeting_date && (
              <DetailRow icon={<Calendar className="h-3.5 w-3.5" />} label="Meeting Date">
                {formatDate(review.meeting_date)}
                {review.duration_minutes && ` (${review.duration_minutes} min)`}
              </DetailRow>
            )}
            {review.meeting_location && (
              <DetailRow icon={<FileText className="h-3.5 w-3.5" />} label="Location">
                {review.meeting_location}
              </DetailRow>
            )}
            <DetailRow icon={<Users className="h-3.5 w-3.5" />} label="Attendees">
              {attendees.length > 0
                ? presentAttendees.length > 0
                  ? presentAttendees.map(a => a.name).join(', ')
                  : attendees.map(a => a.name).join(', ')
                : 'Not recorded'}
            </DetailRow>
          </div>

          {/* Score */}
          {review.compliance_score_at_review != null && (
            <div className="flex items-center gap-5 p-4 bg-gray-50 border border-gray-100 rounded">
              <div className="relative h-14 w-14 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="h-14 w-14 -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke={tierColor} strokeWidth="3"
                    strokeDasharray={`${review.compliance_score_at_review} ${100 - review.compliance_score_at_review}`}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-semibold text-[#0e274e]">{review.compliance_score_at_review}</span>
                </div>
              </div>
              <div>
                <p className="text-lg font-light text-[#0e274e]">{review.compliance_score_at_review}/100</p>
                <p style={{ color: tierColor }} className="text-sm font-medium">
                  {review.compliance_tier_at_review ?? 'Unknown'}
                </p>
                <p className="text-xs text-gray-400">Score at time of review</p>
              </div>
            </div>
          )}
        </div>

        {/* Sections */}
        {sections
          .filter(s => s.status !== 'skipped' || s.discussion_notes || s.decisions.length > 0)
          .map(section => (
            <div key={section.id} className="bg-white border-x border-b border-gray-200 px-8 py-6">
              <div className="border-l-4 border-[#0d9488] pl-4 mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-[#0e274e]">
                    {section.section_label}
                  </h3>
                  {section.status === 'skipped' && (
                    <span className="text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">SKIPPED</span>
                  )}
                  {section.status === 'complete' && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  )}
                </div>
              </div>

              {/* Notes */}
              {section.discussion_notes && (
                <div className="mb-4">
                  <p className="text-[10px] font-semibold text-gray-400 mb-1.5">Discussion Notes</p>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{section.discussion_notes}</p>
                </div>
              )}

              {/* Decisions */}
              {section.decisions.length > 0 && (
                <div className="mb-4">
                  <p className="text-[10px] font-semibold text-gray-400 mb-1.5">Decisions Made</p>
                  <div className="space-y-1.5">
                    {section.decisions.map(d => (
                      <div key={d.id} className="flex items-start gap-2 bg-teal-50 border border-teal-100 px-3 py-2 rounded">
                        <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-700">{d.decision_text}</p>
                          {d.decided_by_name && <p className="text-[10px] text-gray-400">— {d.decided_by_name}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action items for this section */}
              {actionItems.filter(a => a.section_id === section.id).length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 mb-1.5">Action Items Created</p>
                  <div className="space-y-1.5">
                    {actionItems.filter(a => a.section_id === section.id).map(item => (
                      <ActionItemRow key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              )}

              {!section.discussion_notes && section.decisions.length === 0 && (
                <p className="text-xs text-gray-400">No notes recorded for this section.</p>
              )}
            </div>
          ))}

        {/* Action Items Summary */}
        {actionItems.length > 0 && (
          <div className="bg-white border-x border-b border-gray-200 px-8 py-6">
            <div className="border-l-4 border-orange-400 pl-4 mb-4">
              <h3 className="text-sm font-semibold text-[#0e274e]">
                Action Items Summary
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { count: highItems, label: 'High Priority', color: 'text-red-600', bg: 'bg-red-50' },
                { count: medItems, label: 'Medium Priority', color: 'text-amber-600', bg: 'bg-amber-50' },
                { count: lowItems, label: 'Low Priority', color: 'text-blue-600', bg: 'bg-blue-50' },
              ].map(({ count, label, color, bg }) => (
                <div key={label} className={`${bg} rounded px-4 py-3 text-center`}>
                  <p className={`text-2xl font-light ${color}`}>{count}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-500 mb-4">
              All {actionItems.length} action item{actionItems.length !== 1 ? 's' : ''} are now tracked in your compliance system.
            </p>

            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left text-[10px] font-semibold text-gray-400 px-3 py-2">Task</th>
                  <th className="text-left text-[10px] font-semibold text-gray-400 px-3 py-2">Assignee</th>
                  <th className="text-left text-[10px] font-semibold text-gray-400 px-3 py-2">Due</th>
                  <th className="text-left text-[10px] font-semibold text-gray-400 px-3 py-2">Priority</th>
                </tr>
              </thead>
              <tbody>
                {actionItems.map((item, i) => (
                  <tr key={item.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 py-2 text-gray-700">{item.title}</td>
                    <td className="px-3 py-2 text-gray-500 text-xs">{item.assigned_to_name ?? '—'}</td>
                    <td className="px-3 py-2 text-gray-500 text-xs">
                      {item.due_date ? formatDate(item.due_date) : '—'}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 border rounded-sm ${PRIORITY_CONFIG[item.priority].cls}`}>
                        {PRIORITY_CONFIG[item.priority].label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer / Document ID */}
        <div className="bg-white border-x border-b border-gray-200 px-8 py-4 print:border-0">
          <p className="text-[10px] text-gray-300 text-center">
            This record was generated by HIPAA Hub · Document ID: {review.id} · {orgName}
          </p>
          <p className="text-[10px] text-gray-300 text-center mt-0.5">
            This document constitutes the official record of the {review.quarter} {review.year} Quarterly Compliance Review
            and is retained as audit evidence.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-6 print:hidden">
          <a
            href="/dashboard/quarterly-review"
            className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 bg-white text-xs text-gray-600 hover:border-gray-300 rounded"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All Reviews
          </a>
          <a
            href="/dashboard/mitigation"
            className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 bg-white text-xs text-gray-600 hover:border-gray-300 rounded"
          >
            View Action Items in Tracker <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <a
            href="/dashboard/calendar"
            className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 bg-white text-xs text-gray-600 hover:border-gray-300 rounded"
          >
            Compliance Calendar <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function DetailRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-gray-300 mt-0.5 flex-shrink-0">{icon}</span>
      <div>
        <p className="text-[10px] text-gray-400 font-medium">{label}</p>
        <p className="text-sm text-[#0e274e]">{children}</p>
      </div>
    </div>
  );
}

function ActionItemRow({ item }: { item: ActionItem }) {
  const cfg = PRIORITY_CONFIG[item.priority];
  const isOverdue = item.due_date && new Date(item.due_date) < new Date() && item.status !== 'complete';
  return (
    <div className="flex items-start gap-2 border border-orange-100 bg-orange-50 px-3 py-2 rounded">
      <AlertTriangle className="h-3.5 w-3.5 text-orange-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700">{item.title}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">
          {item.assigned_to_name && <>{item.assigned_to_name} · </>}
          {item.due_date && (
            <span className={isOverdue ? 'text-red-500 font-medium' : ''}>
              Due {formatDate(item.due_date)}{isOverdue ? ' · OVERDUE' : ''}
            </span>
          )}
        </p>
      </div>
      <span className={`text-[10px] font-semibold px-1.5 py-0.5 border rounded-sm flex-shrink-0 ${cfg.cls}`}>
        {cfg.label}
      </span>
    </div>
  );
}
