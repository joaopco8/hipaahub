'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2, Circle, X, Plus, Trash2, Loader2,
  Pause, Play, ChevronRight, AlertTriangle, Users
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Section {
  id: string;
  section_type: string;
  section_label: string;
  section_order: number;
  status: 'pending' | 'in_progress' | 'complete' | 'skipped';
  discussion_notes: string;
  decisions: Decision[];
  action_items: ActionItem[];
}

interface Decision {
  id: string;
  decision_text: string;
  decided_by_name: string;
}

interface ActionItem {
  id: string;
  title: string;
  assigned_to_name: string;
  assigned_to_email?: string;
  due_date?: string;
  priority: 'high' | 'medium' | 'low';
  status: string;
}

interface Attendee {
  id: string;
  name: string;
  role?: string;
  email?: string;
  was_present: boolean;
}

interface Review {
  id: string;
  quarter: string;
  year: number;
  status: string;
  started_at?: string;
  elapsed_seconds?: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatElapsed(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

// ── Close Confirmation Modal ───────────────────────────────────────────────────

function CloseModal({
  sections,
  actionItemCount,
  elapsed,
  onConfirm,
  onCancel,
  closing,
}: {
  sections: Section[];
  actionItemCount: number;
  elapsed: number;
  onConfirm: () => void;
  onCancel: () => void;
  closing: boolean;
}) {
  const complete = sections.filter(s => s.status === 'complete').length;
  const skipped = sections.filter(s => s.status === 'skipped').length;
  const pending = sections.filter(s => s.status !== 'complete' && s.status !== 'skipped').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white w-full max-w-md border border-gray-200 shadow-2xl p-6">
        <h3 className="text-lg font-medium text-[#0e274e] mb-1">Close this review?</h3>
        <p className="text-sm text-gray-500 font-light mb-5">
          This will finalize the review record and promote action items to your compliance tracker.
        </p>

        <div className="bg-gray-50 border border-gray-100 rounded p-4 space-y-2 mb-5 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Sections completed</span>
            <span className="font-medium text-[#0e274e]">{complete}/{sections.length}
              {skipped > 0 && <span className="text-gray-400 font-normal"> ({skipped} skipped)</span>}
            </span>
          </div>
          {pending > 0 && (
            <div className="flex justify-between">
              <span className="text-amber-600">Sections not started</span>
              <span className="font-medium text-amber-600">{pending}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500">Action items created</span>
            <span className="font-medium text-[#0e274e]">{actionItemCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Meeting duration</span>
            <span className="font-medium text-[#0e274e]">{formatElapsed(elapsed)}</span>
          </div>
        </div>

        <p className="text-xs text-gray-400 mb-4">
          {actionItemCount > 0
            ? `${actionItemCount} action item${actionItemCount !== 1 ? 's' : ''} will be added to your compliance tracker.`
            : 'No action items were created during this review.'}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            disabled={closing}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {closing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {closing ? 'Closing...' : 'Yes, Close Review'}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 rounded"
          >
            Continue Meeting
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Section Editor ─────────────────────────────────────────────────────────────

function SectionEditor({
  section,
  reviewId,
  attendees,
  onUpdate,
}: {
  section: Section;
  reviewId: string;
  attendees: Attendee[];
  onUpdate: (updated: Partial<Section> & { id: string }) => void;
}) {
  const [notes, setNotes] = useState(section.discussion_notes ?? '');
  const [decisions, setDecisions] = useState<Decision[]>(section.decisions ?? []);
  const [actionItems, setActionItems] = useState<ActionItem[]>(section.action_items ?? []);
  const [newDecision, setNewDecision] = useState('');
  const [newDecisionBy, setNewDecisionBy] = useState('');
  const [addingDecision, setAddingDecision] = useState(false);
  const [addingAction, setAddingAction] = useState(false);
  const [newAction, setNewAction] = useState({ title: '', assigned_to_name: '', assigned_to_email: '', due_date: '', priority: 'medium' as const });
  const [savingNotes, setSavingNotes] = useState(false);
  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Roll call: attendee presence toggle
  const [presence, setPresence] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(attendees.map(a => [a.id, a.was_present]))
  );

  function handleNotesChange(val: string) {
    setNotes(val);
    if (notesTimer.current) clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(async () => {
      setSavingNotes(true);
      await fetch(`/api/reviews/quarterly/${reviewId}/section/${section.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discussion_notes: val }),
      });
      setSavingNotes(false);
      onUpdate({ id: section.id, discussion_notes: val });
    }, 800);
  }

  async function addDecision() {
    if (!newDecision.trim()) return;
    const res = await fetch(`/api/reviews/quarterly/${reviewId}/decisions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section_id: section.id, decision_text: newDecision, decided_by_name: newDecisionBy }),
    });
    const data = await res.json();
    if (data.decision) {
      setDecisions(prev => [...prev, data.decision]);
      setNewDecision(''); setNewDecisionBy(''); setAddingDecision(false);
    }
  }

  async function removeDecision(decId: string) {
    await fetch(`/api/reviews/quarterly/${reviewId}/decisions?decision_id=${decId}`, { method: 'DELETE' });
    setDecisions(prev => prev.filter(d => d.id !== decId));
  }

  async function addActionItem() {
    if (!newAction.title.trim()) return;
    const res = await fetch(`/api/reviews/quarterly/${reviewId}/action-items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newAction, section_id: section.id }),
    });
    const data = await res.json();
    if (data.item) {
      setActionItems(prev => [...prev, data.item]);
      setNewAction({ title: '', assigned_to_name: '', assigned_to_email: '', due_date: '', priority: 'medium' });
      setAddingAction(false);
    }
  }

  async function removeActionItem(itemId: string) {
    await fetch(`/api/reviews/quarterly/${reviewId}/action-items?item_id=${itemId}`, { method: 'DELETE' });
    setActionItems(prev => prev.filter(i => i.id !== itemId));
  }

  async function markComplete() {
    await fetch(`/api/reviews/quarterly/${reviewId}/section/${section.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'complete' }),
    });
    onUpdate({ id: section.id, status: 'complete' });
  }

  async function markSkipped() {
    await fetch(`/api/reviews/quarterly/${reviewId}/section/${section.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'skipped' }),
    });
    onUpdate({ id: section.id, status: 'skipped' });
  }

  const priorityColors = { high: 'text-red-600', medium: 'text-amber-600', low: 'text-blue-600' };

  return (
    <div className="space-y-5">
      {/* Roll call section */}
      {section.section_type === 'roll_call' && (
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2">Mark Attendance</p>
          <div className="grid grid-cols-2 gap-2">
            {attendees.map(a => (
              <button
                key={a.id}
                onClick={async () => {
                  const newVal = !presence[a.id];
                  setPresence(prev => ({ ...prev, [a.id]: newVal }));
                  await fetch(`/api/reviews/quarterly/${reviewId}/section/${section.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ discussion_notes: JSON.stringify({ ...presence, [a.id]: newVal }) }),
                  });
                }}
                className={`flex items-center gap-2 px-3 py-2 border rounded text-sm text-left transition-colors
                  ${presence[a.id] ? 'border-green-200 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}
              >
                {presence[a.id]
                  ? <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                  : <Circle className="h-4 w-4 text-gray-300 flex-shrink-0" />}
                <span className="truncate">{a.name}</span>
                {a.role && <span className="text-[10px] text-gray-400 ml-auto flex-shrink-0">{a.role}</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Discussion notes */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-gray-500">Discussion Notes</label>
          {savingNotes && <span className="text-[10px] text-gray-400 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" />Saving…</span>}
        </div>
        <textarea
          className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#0d9488] resize-none bg-gray-50"
          rows={4}
          placeholder="Add notes from this discussion..."
          value={notes}
          onChange={e => handleNotesChange(e.target.value)}
        />
      </div>

      {/* Decisions */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-gray-500">Decisions Made</p>
          <button
            onClick={() => setAddingDecision(!addingDecision)}
            className="text-xs text-[#0d9488] hover:text-[#0b7e74] flex items-center gap-1"
          >
            <Plus className="h-3 w-3" /> Add Decision
          </button>
        </div>

        {addingDecision && (
          <div className="bg-teal-50 border border-teal-100 rounded p-3 mb-2 space-y-2">
            <input
              className="w-full border border-teal-200 bg-white px-2.5 py-1.5 text-sm rounded focus:outline-none"
              placeholder="Decision text..."
              value={newDecision}
              onChange={e => setNewDecision(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addDecision()}
            />
            <div className="flex gap-2">
              <input
                className="flex-1 border border-teal-200 bg-white px-2.5 py-1.5 text-sm rounded focus:outline-none"
                placeholder="Decided by (name)"
                value={newDecisionBy}
                onChange={e => setNewDecisionBy(e.target.value)}
              />
              <button
                onClick={addDecision}
                className="px-3 py-1.5 bg-[#0d9488] text-white text-xs rounded hover:bg-[#0b7e74]"
              >
                Save
              </button>
              <button
                onClick={() => setAddingDecision(false)}
                className="px-3 py-1.5 border border-gray-200 text-xs text-gray-500 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {decisions.length === 0 && !addingDecision && (
          <p className="text-xs text-gray-400 py-1">No decisions recorded yet.</p>
        )}

        <div className="space-y-1.5">
          {decisions.map(d => (
            <div key={d.id} className="flex items-start gap-2 bg-teal-50 border border-teal-100 px-3 py-2 rounded">
              <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700">{d.decision_text}</p>
                {d.decided_by_name && (
                  <p className="text-[10px] text-gray-400">— {d.decided_by_name}</p>
                )}
              </div>
              <button onClick={() => removeDecision(d.id)} className="text-gray-300 hover:text-red-400 flex-shrink-0">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Action items */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-gray-500">Action Items</p>
          <button
            onClick={() => setAddingAction(!addingAction)}
            className="text-xs text-[#0d9488] hover:text-[#0b7e74] flex items-center gap-1"
          >
            <Plus className="h-3 w-3" /> Add Action Item
          </button>
        </div>

        {addingAction && (
          <div className="bg-orange-50 border border-orange-100 rounded p-3 mb-2 space-y-2">
            <input
              className="w-full border border-orange-200 bg-white px-2.5 py-1.5 text-sm rounded focus:outline-none"
              placeholder="What needs to be done?"
              value={newAction.title}
              onChange={e => setNewAction(a => ({ ...a, title: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                className="border border-orange-200 bg-white px-2.5 py-1.5 text-xs rounded focus:outline-none"
                placeholder="Assigned to (name)"
                value={newAction.assigned_to_name}
                onChange={e => setNewAction(a => ({ ...a, assigned_to_name: e.target.value }))}
              />
              <input
                className="border border-orange-200 bg-white px-2.5 py-1.5 text-xs rounded focus:outline-none"
                placeholder="Email (optional)"
                value={newAction.assigned_to_email}
                onChange={e => setNewAction(a => ({ ...a, assigned_to_email: e.target.value }))}
              />
              <input
                type="date"
                className="border border-orange-200 bg-white px-2.5 py-1.5 text-xs rounded focus:outline-none"
                value={newAction.due_date}
                onChange={e => setNewAction(a => ({ ...a, due_date: e.target.value }))}
              />
              <select
                className="border border-orange-200 bg-white px-2.5 py-1.5 text-xs rounded focus:outline-none"
                value={newAction.priority}
                onChange={e => setNewAction(a => ({ ...a, priority: e.target.value as any }))}
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={addActionItem}
                className="flex-1 py-1.5 bg-[#0d9488] text-white text-xs rounded hover:bg-[#0b7e74]"
              >
                Add
              </button>
              <button
                onClick={() => setAddingAction(false)}
                className="flex-1 py-1.5 border border-gray-200 text-xs text-gray-500 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {actionItems.length === 0 && !addingAction && (
          <p className="text-xs text-gray-400 py-1">No action items yet.</p>
        )}

        <div className="space-y-1.5">
          {actionItems.map(item => (
            <div key={item.id} className="flex items-start gap-2 bg-orange-50 border border-orange-100 px-3 py-2 rounded">
              <AlertTriangle className="h-3.5 w-3.5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700">{item.title}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {item.assigned_to_name && <>{item.assigned_to_name} · </>}
                  {item.due_date && <>Due {new Date(item.due_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · </>}
                  <span className={`font-semibold ${priorityColors[item.priority]}`}>{item.priority}</span>
                </p>
              </div>
              <button onClick={() => removeActionItem(item.id)} className="text-gray-300 hover:text-red-400 flex-shrink-0">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Section actions */}
      <div className="flex gap-2 pt-2 border-t border-gray-100">
        {section.status !== 'complete' && (
          <button
            onClick={markComplete}
            className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors"
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> Mark Section Complete
          </button>
        )}
        {section.status === 'complete' && (
          <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
            <CheckCircle2 className="h-4 w-4" /> Section Complete
          </span>
        )}
        {section.status !== 'skipped' && section.status !== 'complete' && (
          <button
            onClick={markSkipped}
            className="px-3 py-2 text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded"
          >
            Skip Section
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Meeting Client ────────────────────────────────────────────────────────

export default function MeetingClient({
  review,
  sections: initialSections,
  attendees: initialAttendees,
  orgName,
}: {
  review: Review;
  sections: Section[];
  attendees: Attendee[];
  orgName: string;
}) {
  const router = useRouter();
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [attendees] = useState<Attendee[]>(initialAttendees);
  const [activeSectionId, setActiveSectionId] = useState<string>(initialSections[0]?.id ?? '');
  const [elapsed, setElapsed] = useState<number>(review.elapsed_seconds ?? 0);
  const [paused, setPaused] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closing, setClosing] = useState(false);
  const elapsedRef = useRef(elapsed);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer
  useEffect(() => {
    if (!paused) {
      timerRef.current = setInterval(() => {
        setElapsed(prev => { elapsedRef.current = prev + 1; return prev + 1; });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused]);

  // Auto-save elapsed every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetch(`/api/reviews/quarterly/${review.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ elapsed_seconds: elapsedRef.current }),
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [review.id]);

  const updateSection = useCallback((updated: Partial<Section> & { id: string }) => {
    setSections(prev => prev.map(s => s.id === updated.id ? { ...s, ...updated } : s));
  }, []);

  const completedCount = sections.filter(s => s.status === 'complete').length;
  const skippedCount = sections.filter(s => s.status === 'skipped').length;
  const totalActionItems = sections.reduce((sum, s) => sum + s.action_items.length, 0);
  const activeSection = sections.find(s => s.id === activeSectionId);

  async function closeReview() {
    setClosing(true);
    // Save final elapsed
    await fetch(`/api/reviews/quarterly/${review.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ elapsed_seconds: elapsedRef.current }),
    });
    await fetch(`/api/reviews/quarterly/${review.id}/complete`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ elapsed_seconds: elapsedRef.current }),
    });
    router.push(`/dashboard/quarterly-review/${review.id}/record`);
  }

  function sectionStatusIcon(s: Section) {
    if (s.status === 'complete') return <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />;
    if (s.status === 'skipped') return <span className="h-4 w-4 flex-shrink-0 text-gray-300 text-xs flex items-center">—</span>;
    if (s.id === activeSectionId) return (
      <span className="h-4 w-4 flex-shrink-0 flex items-center justify-center">
        <span className="h-2 w-2 rounded-full bg-[#0d9488]" />
      </span>
    );
    return <Circle className="h-4 w-4 text-gray-200 flex-shrink-0" />;
  }

  return (
    <div className="flex flex-col h-screen bg-[#f3f5f9]">
      {/* Top bar */}
      <div className="bg-[#0e274e] text-white px-5 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-medium">{review.quarter} {review.year} Review — IN PROGRESS</span>
          </span>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-lg font-light text-white/80">{formatElapsed(elapsed)}</span>
          <button
            onClick={() => setPaused(p => !p)}
            className="p-1.5 hover:bg-white/10 rounded transition-colors"
          >
            {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setShowCloseModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors"
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> Close & Complete Review
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left navigator */}
        <div className="w-52 flex-shrink-0 bg-white border-r border-gray-100 overflow-y-auto">
          <div className="px-3 py-3 border-b border-gray-100">
            <p className="text-[10px] font-semibold text-gray-400r">Sections</p>
          </div>
          {sections.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setActiveSectionId(s.id)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 text-left transition-colors text-sm
                ${s.id === activeSectionId
                  ? 'bg-teal-50 border-l-2 border-[#0d9488] text-[#0d9488]'
                  : 'border-l-2 border-transparent text-gray-600 hover:bg-gray-50'}`}
            >
              {sectionStatusIcon(s)}
              <span className="truncate text-xs">{s.section_label}</span>
            </button>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeSection && (
            <div className="max-w-2xl mx-auto">
              {/* Section header */}
              <div className="bg-white border border-gray-200 rounded-sm overflow-hidden mb-4">
                <div className="h-1 bg-[#0d9488]" />
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <div>
                    <p className="text-[10px] text-gray-400st font-medium">
                      Section {activeSection.section_order} of {sections.length}
                    </p>
                    <h2 className="text-lg font-medium text-[#0e274e]">{activeSection.section_label}</h2>
                  </div>
                  {activeSection.status === 'complete' && (
                    <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                      <CheckCircle2 className="h-4 w-4" /> Complete
                    </span>
                  )}
                </div>
                <div className="px-6 py-5">
                  <SectionEditor
                    section={activeSection}
                    reviewId={review.id}
                    attendees={attendees}
                    onUpdate={updateSection}
                  />
                </div>
              </div>

              {/* Navigate to next section */}
              {activeSection.status === 'complete' && (
                <div className="flex justify-end">
                  {(() => {
                    const idx = sections.findIndex(s => s.id === activeSectionId);
                    const next = sections[idx + 1];
                    if (!next) return null;
                    return (
                      <button
                        onClick={() => setActiveSectionId(next.id)}
                        className="flex items-center gap-1.5 text-xs text-[#0d9488] hover:text-[#0b7e74]"
                      >
                        Next: {next.section_label} <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sticky progress bar */}
      <div className="bg-white border-t border-gray-100 px-5 py-2.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>{completedCount + skippedCount}/{sections.length} sections done</span>
          <span className="text-gray-300">·</span>
          <span>{totalActionItems} action item{totalActionItems !== 1 ? 's' : ''}</span>
          <span className="text-gray-300">·</span>
          <span>{formatElapsed(elapsed)} elapsed</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-0.5">
            {sections.map(s => (
              <div
                key={s.id}
                className={`h-1.5 w-5 rounded-sm ${
                  s.status === 'complete' ? 'bg-green-500' :
                  s.status === 'skipped' ? 'bg-gray-200' :
                  s.id === activeSectionId ? 'bg-[#0d9488]' :
                  'bg-gray-100'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setShowCloseModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700"
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> Close Review
          </button>
        </div>
      </div>

      {showCloseModal && (
        <CloseModal
          sections={sections}
          actionItemCount={totalActionItems}
          elapsed={elapsed}
          onConfirm={closeReview}
          onCancel={() => setShowCloseModal(false)}
          closing={closing}
        />
      )}
    </div>
  );
}
