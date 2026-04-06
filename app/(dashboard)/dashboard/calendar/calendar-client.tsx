'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ChevronLeft, ChevronRight, Plus, Download, X, Check,
  Clock, AlertTriangle, CheckCircle2, Calendar, List,
  BarChart3, Bell, AlarmClock, Trash2, Filter,
  ChevronDown, ChevronUp, ExternalLink, Loader2
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CalendarEvent {
  id: string;
  org_id: string;
  title: string;
  event_type: EventType;
  status: EventStatus;
  due_date: string; // YYYY-MM-DD
  end_date?: string | null;
  assigned_to?: string | null;
  source_type?: string | null;
  source_id?: string | null;
  notes?: string | null;
  recurrence: 'none' | 'annual' | 'quarterly' | 'monthly' | 'custom';
  recurrence_interval_days?: number | null;
  completed_at?: string | null;
  snoozed_until?: string | null;
  snooze_reason?: string | null;
  is_auto_generated: boolean;
  location?: string | null;
  created_at: string;
}

type EventType =
  | 'policy_review'
  | 'training_renewal'
  | 'baa_renewal'
  | 'risk_assessment'
  | 'quarterly_review'
  | 'mitigation_deadline'
  | 'custom';

type EventStatus =
  | 'upcoming'
  | 'due_soon'
  | 'overdue'
  | 'in_progress'
  | 'complete'
  | 'snoozed'
  | 'cancelled';

type ViewMode = 'monthly' | 'quarterly' | 'list';

// ── Event Type Config ─────────────────────────────────────────────────────────

const ET: Record<EventType, { label: string; color: string; dot: string; badge: string }> = {
  policy_review:       { label: 'Policy Review',       color: '#3b82f6', dot: 'bg-blue-500',   badge: 'bg-blue-50 text-blue-700 border-blue-100' },
  training_renewal:    { label: 'Training Renewal',    color: '#8b5cf6', dot: 'bg-purple-500', badge: 'bg-purple-50 text-purple-700 border-purple-100' },
  baa_renewal:         { label: 'BAA Renewal',         color: '#f59e0b', dot: 'bg-amber-500',  badge: 'bg-amber-50 text-amber-700 border-amber-100' },
  risk_assessment:     { label: 'Risk Assessment',     color: '#ef4444', dot: 'bg-red-500',    badge: 'bg-red-50 text-red-700 border-red-100' },
  quarterly_review:    { label: 'Quarterly Review',    color: '#0d9488', dot: 'bg-teal-600',   badge: 'bg-teal-50 text-teal-700 border-teal-100' },
  mitigation_deadline: { label: 'Mitigation',          color: '#f97316', dot: 'bg-orange-500', badge: 'bg-orange-50 text-orange-700 border-orange-100' },
  custom:              { label: 'Custom',              color: '#6b7280', dot: 'bg-gray-500',   badge: 'bg-gray-50 text-gray-600 border-gray-200' },
};

const ALL_TYPES = Object.keys(ET) as EventType[];

// ── Helpers ───────────────────────────────────────────────────────────────────

function today(): string {
  return new Date().toISOString().split('T')[0];
}

function daysUntil(dateStr: string): number {
  const d = new Date(dateStr);
  const t = new Date(today());
  return Math.ceil((d.getTime() - t.getTime()) / 86400000);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function formatShortDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  });
}

function statusLabel(s: EventStatus): { text: string; cls: string } {
  switch (s) {
    case 'overdue':     return { text: 'Overdue',     cls: 'bg-red-50 text-red-600 border-red-100' };
    case 'due_soon':    return { text: 'Due Soon',    cls: 'bg-amber-50 text-amber-700 border-amber-100' };
    case 'in_progress': return { text: 'In Progress', cls: 'bg-blue-50 text-blue-700 border-blue-100' };
    case 'complete':    return { text: 'Complete',    cls: 'bg-green-50 text-green-700 border-green-100' };
    case 'snoozed':     return { text: 'Snoozed',     cls: 'bg-gray-50 text-gray-600 border-gray-200' };
    default:            return { text: 'Upcoming',    cls: 'bg-gray-50 text-gray-500 border-gray-100' };
  }
}

function effectiveStatus(e: CalendarEvent): EventStatus {
  if (e.status === 'overdue') return 'overdue';
  const d = daysUntil(e.due_date);
  if (d < 0 && e.status !== 'complete' && e.status !== 'cancelled' && e.status !== 'snoozed') return 'overdue';
  return e.status;
}

// ── Main Component ────────────────────────────────────────────────────────────

interface Props {
  orgName: string;
}

export default function CalendarClient({ orgName }: Props) {
  const [view, setView] = useState<ViewMode>('monthly');
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() }; // 0-indexed
  });
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Set<EventType>>(new Set(ALL_TYPES));
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overdue', 'thisweek', 'thismonth']));
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [snoozePanel, setSnoozePanel] = useState(false);
  const [snoozeDate, setSnoozeDate] = useState('');
  const [snoozeReason, setSnoozeReason] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const notesSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Add event form state
  const [addForm, setAddForm] = useState({
    title: '', event_type: 'custom' as EventType, due_date: '',
    end_date: '', assigned_to: '', location: '', notes: '', recurrence: 'none',
    recurrence_interval_days: '',
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/calendar/events');
      const data = await res.json();
      setEvents(data.events ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  // Auto-generate on first load
  useEffect(() => {
    const key = 'calendar_generated';
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, '1');
      setGenerating(true);
      fetch('/api/calendar/generate', { method: 'POST' })
        .then(() => fetchEvents())
        .finally(() => setGenerating(false));
    }
  }, [fetchEvents]);

  // Sync notes to selected event
  useEffect(() => {
    if (selectedEvent) setNotesDraft(selectedEvent.notes ?? '');
  }, [selectedEvent?.id]);

  // ── Derived data ───────────────────────────────────────────────────────────

  const filtered = events.filter(e => activeFilters.has(e.event_type));
  const todayStr = today();

  const overdue = filtered.filter(e => effectiveStatus(e) === 'overdue');
  const thisWeek = filtered.filter(e => {
    const d = daysUntil(e.due_date);
    return d >= 0 && d <= 7 && effectiveStatus(e) !== 'complete';
  });
  const thisMonth = filtered.filter(e => {
    const d = daysUntil(e.due_date);
    return d > 7 && d <= 31 && effectiveStatus(e) !== 'complete';
  });
  const next90 = filtered.filter(e => {
    const d = daysUntil(e.due_date);
    return d > 31 && d <= 90 && effectiveStatus(e) !== 'complete';
  });

  // Group events by date
  const eventsByDate = filtered.reduce<Record<string, CalendarEvent[]>>((acc, e) => {
    const key = e.due_date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(e);
    return acc;
  }, {});

  // ── Calendar grid helpers ──────────────────────────────────────────────────

  function buildMonthGrid(year: number, month: number): (string | null)[][] {
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (string | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
    }
    while (cells.length % 7 !== 0) cells.push(null);
    const rows: (string | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  }

  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  function prevMonth() {
    setCurrentMonth(m => {
      if (m.month === 0) return { year: m.year - 1, month: 11 };
      return { year: m.year, month: m.month - 1 };
    });
    setExpandedDay(null);
  }

  function nextMonth() {
    setCurrentMonth(m => {
      if (m.month === 11) return { year: m.year + 1, month: 0 };
      return { year: m.year, month: m.month + 1 };
    });
    setExpandedDay(null);
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  async function markComplete(eventId: string) {
    setActionLoading(eventId + '-complete');
    try {
      const res = await fetch(`/api/calendar/events/${eventId}/complete`, { method: 'POST' });
      const data = await res.json();
      await fetchEvents();
      const msg = data.next_date
        ? `Marked complete. Next occurrence scheduled for ${formatDate(data.next_date)}.`
        : 'Marked complete.';
      showToast(msg);
      setSelectedEvent(null);
    } finally {
      setActionLoading(null);
    }
  }

  async function markInProgress(eventId: string) {
    setActionLoading(eventId + '-progress');
    try {
      await fetch(`/api/calendar/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'in_progress' }),
      });
      await fetchEvents();
      showToast('Marked as in progress.');
      setSelectedEvent(prev => prev?.id === eventId ? { ...prev, status: 'in_progress' } : prev);
    } finally {
      setActionLoading(null);
    }
  }

  async function doSnooze() {
    if (!selectedEvent || !snoozeDate) return;
    setActionLoading(selectedEvent.id + '-snooze');
    try {
      await fetch(`/api/calendar/events/${selectedEvent.id}/snooze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snooze_until: snoozeDate, reason: snoozeReason }),
      });
      await fetchEvents();
      showToast(`Snoozed until ${formatDate(snoozeDate)}.`);
      setSnoozePanel(false);
      setSelectedEvent(null);
    } finally {
      setActionLoading(null);
    }
  }

  async function deleteEvent(eventId: string) {
    setActionLoading(eventId + '-delete');
    try {
      const res = await fetch(`/api/calendar/events/${eventId}`, { method: 'DELETE' });
      if (!res.ok) {
        const d = await res.json();
        showToast(d.error ?? 'Delete failed.');
        return;
      }
      await fetchEvents();
      showToast('Event deleted.');
      setSelectedEvent(null);
    } finally {
      setActionLoading(null);
    }
  }

  async function createEvent() {
    if (!addForm.title || !addForm.due_date) return;
    setActionLoading('create');
    try {
      const res = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: addForm.title,
          event_type: addForm.event_type,
          due_date: addForm.due_date,
          end_date: addForm.end_date || null,
          assigned_to: addForm.assigned_to || null,
          location: addForm.location || null,
          notes: addForm.notes || null,
          recurrence: addForm.recurrence,
          recurrence_interval_days: addForm.recurrence_interval_days
            ? parseInt(addForm.recurrence_interval_days)
            : null,
        }),
      });
      if (res.ok) {
        await fetchEvents();
        showToast('Event created.');
        setShowAddModal(false);
        setAddForm({ title: '', event_type: 'custom', due_date: '', end_date: '', assigned_to: '', location: '', notes: '', recurrence: 'none', recurrence_interval_days: '' });
      }
    } finally {
      setActionLoading(null);
    }
  }

  function saveNotes(value: string) {
    if (!selectedEvent) return;
    if (notesSaveTimer.current) clearTimeout(notesSaveTimer.current);
    notesSaveTimer.current = setTimeout(async () => {
      await fetch(`/api/calendar/events/${selectedEvent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: value }),
      });
    }, 800);
  }

  async function sendReminder() {
    if (!selectedEvent) return;
    showToast('Reminder sent to assignee.');
  }

  function exportCalendar() {
    window.location.href = '/api/calendar/export';
  }

  // ── Toggle helpers ─────────────────────────────────────────────────────────

  function toggleFilter(t: EventType) {
    setActiveFilters(prev => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
  }

  function toggleSection(key: string) {
    setExpandedSections(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  // ── Sub-components ─────────────────────────────────────────────────────────

  function TypeBadge({ type }: { type: EventType }) {
    const cfg = ET[type];
    return (
      <span className={`text-[10px] font-medium px-1.5 py-0.5 border rounded-sm ${cfg.badge}`}>
        {cfg.label}
      </span>
    );
  }

  function StatusBadge({ status }: { status: EventStatus }) {
    const s = statusLabel(status);
    return (
      <span className={`text-[10px] font-medium px-1.5 py-0.5 border rounded-sm ${s.cls}`}>
        {s.text}
      </span>
    );
  }

  function EventDot({ type, overrideRed }: { type: EventType; overrideRed?: boolean }) {
    const cls = overrideRed ? 'bg-red-500' : ET[type].dot;
    return <span className={`inline-block h-2 w-2 rounded-full flex-shrink-0 ${cls}`} />;
  }

  // Small card shown in sidebar upcoming lists
  function SidebarEventRow({
    event,
    showDate = true,
  }: {
    event: CalendarEvent;
    showDate?: boolean;
  }) {
    const days = daysUntil(event.due_date);
    const eff = effectiveStatus(event);
    return (
      <div
        className="flex items-start gap-2 py-2 cursor-pointer hover:bg-gray-50 px-1 -mx-1 rounded"
        onClick={() => setSelectedEvent(event)}
      >
        <EventDot type={event.event_type} overrideRed={eff === 'overdue'} />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[#0e274e] leading-snug truncate">{event.title}</p>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <TypeBadge type={event.event_type} />
            {showDate && (
              <span className="text-[10px] text-gray-400">{formatShortDate(event.due_date)}</span>
            )}
          </div>
        </div>
        {eff === 'overdue' && (
          <span className="text-[10px] text-red-600 font-medium shrink-0">
            {Math.abs(days)}d late
          </span>
        )}
        {eff !== 'overdue' && showDate && days <= 7 && (
          <span className="text-[10px] text-amber-600 font-medium shrink-0">{days}d</span>
        )}
      </div>
    );
  }

  // ── MONTHLY CALENDAR VIEW ──────────────────────────────────────────────────

  function MonthlyView() {
    const { year, month } = currentMonth;
    const rows = buildMonthGrid(year, month);

    return (
      <div>
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded">
            <ChevronLeft className="h-4 w-4 text-gray-500" />
          </button>
          <h2 className="text-base font-medium text-[#0e274e]">
            {MONTH_NAMES[month]} {year}
          </h2>
          <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded">
            <ChevronRight className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_NAMES.map(d => (
            <div key={d} className="text-center text-[10px] font-medium text-gray-400 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Rows */}
        <div className="border-t border-l border-gray-100">
          {rows.map((row, ri) => (
            <div key={ri} className="grid grid-cols-7">
              {row.map((dateStr, ci) => {
                if (!dateStr) {
                  return <div key={ci} className="border-b border-r border-gray-100 bg-gray-50/50 min-h-[72px]" />;
                }
                const dayEvents = eventsByDate[dateStr] ?? [];
                const isToday = dateStr === todayStr;
                const isPast = dateStr < todayStr;
                const isExpanded = expandedDay === dateStr;
                const visible = dayEvents.slice(0, 3);
                const extra = dayEvents.length - 3;

                return (
                  <div key={dateStr} className="border-b border-r border-gray-100">
                    <button
                      className={`w-full text-left p-1.5 min-h-[72px] transition-colors hover:bg-blue-50/30 ${isExpanded ? 'bg-blue-50/40' : ''}`}
                      onClick={() => setExpandedDay(isExpanded ? null : dateStr)}
                    >
                      <span className={`text-xs font-medium inline-flex items-center justify-center w-5 h-5 rounded-full mb-1
                        ${isToday
                          ? 'bg-[#0d9488] text-white'
                          : isPast
                            ? 'text-gray-300'
                            : 'text-[#0e274e]'
                        }`}>
                        {new Date(dateStr + 'T12:00:00').getDate()}
                      </span>
                      <div className="flex flex-wrap gap-0.5">
                        {visible.map((e, i) => (
                          <span
                            key={i}
                            className={`inline-block h-1.5 w-1.5 rounded-full ${isPast ? 'opacity-50' : ''} ${effectiveStatus(e) === 'overdue' ? 'bg-red-500' : ET[e.event_type].dot}`}
                          />
                        ))}
                        {extra > 0 && (
                          <span className="text-[9px] text-gray-400 leading-none">+{extra}</span>
                        )}
                      </div>
                    </button>

                    {/* Expanded day events */}
                    {isExpanded && dayEvents.length > 0 && (
                      <div className="px-1.5 pb-2 bg-blue-50/40 border-t border-blue-100">
                        {dayEvents.map(e => (
                          <button
                            key={e.id}
                            className="w-full text-left flex items-center gap-1.5 py-1 hover:bg-white/60 rounded px-1"
                            onClick={() => setSelectedEvent(e)}
                          >
                            <EventDot type={e.event_type} overrideRed={effectiveStatus(e) === 'overdue'} />
                            <span className="text-[10px] text-[#0e274e] leading-tight truncate flex-1">{e.title}</span>
                            <StatusBadge status={effectiveStatus(e)} />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── QUARTERLY TIMELINE VIEW ────────────────────────────────────────────────

  function QuarterlyView() {
    const now = new Date();
    const currentQ = Math.floor(now.getMonth() / 3);
    const year = now.getFullYear();
    const months = [currentQ * 3, currentQ * 3 + 1, currentQ * 3 + 2];

    return (
      <div>
        <h2 className="text-base font-medium text-[#0e274e] mb-4">
          Q{currentQ + 1} {year} Timeline
        </h2>
        <div className="grid grid-cols-3 gap-px bg-gray-100 border border-gray-100">
          {months.map(m => {
            const mName = MONTH_NAMES[m];
            const monthStr = `${year}-${String(m + 1).padStart(2, '0')}`;
            const monthEvents = filtered.filter(e => e.due_date.startsWith(monthStr));
            const isPastMonth = m < now.getMonth();

            return (
              <div key={m} className={`bg-white ${isPastMonth ? 'opacity-70' : ''}`}>
                <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
                  <p className="text-xs font-medium text-[#0e274e]">{mName}</p>
                  <p className="text-[10px] text-gray-400">{monthEvents.length} event{monthEvents.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="p-2 space-y-1.5">
                  {monthEvents.length === 0 && (
                    <p className="text-[10px] text-gray-300 py-4 text-center">No events</p>
                  )}
                  {monthEvents.map(e => {
                    const eff = effectiveStatus(e);
                    return (
                      <button
                        key={e.id}
                        className="w-full text-left flex items-center gap-1.5 p-1.5 rounded hover:bg-gray-50"
                        onClick={() => setSelectedEvent(e)}
                      >
                        <div
                          className="w-0.5 self-stretch rounded-full flex-shrink-0"
                          style={{ backgroundColor: eff === 'overdue' ? '#ef4444' : ET[e.event_type].color }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-[#0e274e] leading-snug truncate">{e.title}</p>
                          <p className="text-[9px] text-gray-400">{formatShortDate(e.due_date)}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Full event list for the quarter below */}
        <div className="mt-6 space-y-1">
          <p className="text-xs font-medium text-gray-500 mb-2">All Q{currentQ + 1} Events</p>
          {filtered
            .filter(e => {
              const d = new Date(e.due_date + 'T12:00:00');
              return d.getFullYear() === year && Math.floor(d.getMonth() / 3) === currentQ;
            })
            .sort((a, b) => a.due_date.localeCompare(b.due_date))
            .map(e => (
              <button
                key={e.id}
                className="w-full text-left flex items-center gap-3 px-3 py-2.5 bg-white border border-gray-100 hover:border-gray-200 rounded"
                onClick={() => setSelectedEvent(e)}
              >
                <EventDot type={e.event_type} overrideRed={effectiveStatus(e) === 'overdue'} />
                <span className="flex-1 text-sm text-[#0e274e] truncate">{e.title}</span>
                <TypeBadge type={e.event_type} />
                <StatusBadge status={effectiveStatus(e)} />
                <span className="text-xs text-gray-400 w-24 text-right">{formatShortDate(e.due_date)}</span>
              </button>
            ))
          }
        </div>
      </div>
    );
  }

  // ── LIST VIEW ──────────────────────────────────────────────────────────────

  function ListView() {
    const sorted = [...filtered].sort((a, b) => a.due_date.localeCompare(b.due_date));
    const byMonth: Record<string, CalendarEvent[]> = {};
    for (const e of sorted) {
      const key = e.due_date.slice(0, 7); // YYYY-MM
      if (!byMonth[key]) byMonth[key] = [];
      byMonth[key].push(e);
    }

    return (
      <div className="space-y-6">
        {Object.entries(byMonth).map(([monthKey, monthEvents]) => {
          const [y, m] = monthKey.split('-').map(Number);
          const label = new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
          return (
            <div key={monthKey}>
              <h3 className="text-xs font-semibold text-gray-400st mb-2">{label}</h3>
              <div className="space-y-1">
                {monthEvents.map(e => (
                  <button
                    key={e.id}
                    className="w-full text-left flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 hover:border-[#00bceb] transition-colors"
                    onClick={() => setSelectedEvent(e)}
                  >
                    <div
                      className="w-1 self-stretch rounded-full flex-shrink-0"
                      style={{ backgroundColor: effectiveStatus(e) === 'overdue' ? '#ef4444' : ET[e.event_type].color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0e274e] truncate">{e.title}</p>
                      {e.notes && (
                        <p className="text-xs text-gray-400 font-light truncate">{e.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <TypeBadge type={e.event_type} />
                      <StatusBadge status={effectiveStatus(e)} />
                      <span className="text-xs text-gray-400 w-20 text-right">{formatShortDate(e.due_date)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">No events match the current filters.</p>
        )}
      </div>
    );
  }

  // ── RIGHT SIDEBAR ──────────────────────────────────────────────────────────

  function RightSidebar() {
    // Group next90 by month
    const next90ByMonth: Record<string, CalendarEvent[]> = {};
    for (const e of next90) {
      const key = e.due_date.slice(0, 7);
      if (!next90ByMonth[key]) next90ByMonth[key] = [];
      next90ByMonth[key].push(e);
    }

    return (
      <div className="w-80 flex-shrink-0 flex flex-col gap-0 border-l border-gray-100 bg-white overflow-y-auto max-h-[calc(100vh-120px)] sticky top-0">

        {/* OVERDUE */}
        {overdue.length > 0 && (
          <div className="border-b border-red-100">
            <button
              className="w-full flex items-center justify-between px-4 py-3 bg-red-50 hover:bg-red-100 transition-colors"
              onClick={() => toggleSection('overdue')}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                <span className="text-xs font-semibold text-red-700">Overdue</span>
                <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded-full font-bold">{overdue.length}</span>
              </div>
              {expandedSections.has('overdue') ? <ChevronUp className="h-3 w-3 text-red-400" /> : <ChevronDown className="h-3 w-3 text-red-400" />}
            </button>
            {expandedSections.has('overdue') && (
              <div className="px-4 py-2">
                {overdue.map(e => (
                  <div key={e.id} className="py-2 border-b border-red-50 last:border-0">
                    <SidebarEventRow event={e} />
                    <button
                      className="mt-1 text-[10px] text-green-600 hover:text-green-700 font-medium"
                      onClick={() => markComplete(e.id)}
                    >
                      ✓ Mark Complete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* THIS WEEK */}
        <div className="border-b border-gray-100">
          <button
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50"
            onClick={() => toggleSection('thisweek')}
          >
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs font-semibold text-gray-600">This Week</span>
              {thisWeek.length > 0 && (
                <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full font-bold">{thisWeek.length}</span>
              )}
            </div>
            {expandedSections.has('thisweek') ? <ChevronUp className="h-3 w-3 text-gray-400" /> : <ChevronDown className="h-3 w-3 text-gray-400" />}
          </button>
          {expandedSections.has('thisweek') && (
            <div className="px-4 pb-2">
              {thisWeek.length === 0
                ? <p className="text-xs text-gray-400 py-2">Nothing due this week.</p>
                : thisWeek.map(e => (
                  <div key={e.id} className="border-b border-gray-50 last:border-0 py-1.5">
                    <SidebarEventRow event={e} />
                    <button
                      className="mt-0.5 text-[10px] text-green-600 hover:text-green-700 font-medium"
                      onClick={() => markComplete(e.id)}
                    >
                      ✓ Mark Complete
                    </button>
                  </div>
                ))
              }
            </div>
          )}
        </div>

        {/* THIS MONTH */}
        <div className="border-b border-gray-100">
          <button
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50"
            onClick={() => toggleSection('thismonth')}
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-[#0d9488]" />
              <span className="text-xs font-semibold text-gray-600">This Month</span>
              {thisMonth.length > 0 && (
                <span className="text-[10px] bg-[#0d9488] text-white px-1.5 py-0.5 rounded-full font-bold">{thisMonth.length}</span>
              )}
            </div>
            {expandedSections.has('thismonth') ? <ChevronUp className="h-3 w-3 text-gray-400" /> : <ChevronDown className="h-3 w-3 text-gray-400" />}
          </button>
          {expandedSections.has('thismonth') && (
            <div className="px-4 pb-2">
              {thisMonth.length === 0
                ? <p className="text-xs text-gray-400 py-2">Nothing due this month.</p>
                : thisMonth.map(e => (
                  <div key={e.id} className="border-b border-gray-50 last:border-0 py-1">
                    <SidebarEventRow event={e} />
                  </div>
                ))
              }
            </div>
          )}
        </div>

        {/* NEXT 90 DAYS */}
        <div className="border-b border-gray-100">
          <button
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50"
            onClick={() => toggleSection('next90')}
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-xs font-semibold text-gray-600">Next 90 Days</span>
              {next90.length > 0 && (
                <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded-full font-bold">{next90.length}</span>
              )}
            </div>
            {expandedSections.has('next90') ? <ChevronUp className="h-3 w-3 text-gray-400" /> : <ChevronDown className="h-3 w-3 text-gray-400" />}
          </button>
          {expandedSections.has('next90') && (
            <div className="px-4 pb-2">
              {next90.length === 0
                ? <p className="text-xs text-gray-400 py-2">No events in next 90 days.</p>
                : Object.entries(next90ByMonth).map(([mk, mes]) => {
                  const [y, m] = mk.split('-').map(Number);
                  const label = new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long' });
                  return (
                    <div key={mk} className="mb-2">
                      <p className="text-[10px] text-gray-400 font-medium py-1">{label}</p>
                      {mes.map(e => (
                        <div key={e.id} className="border-b border-gray-50 last:border-0 py-1">
                          <SidebarEventRow event={e} />
                        </div>
                      ))}
                    </div>
                  );
                })
              }
            </div>
          )}
        </div>

        {/* FILTER BY TYPE */}
        <div>
          <div className="px-4 py-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Filter className="h-3.5 w-3.5 text-gray-400" />
              <p className="text-xs font-semibold text-gray-600">Filter by Type</p>
            </div>
            <div className="space-y-1">
              {ALL_TYPES.map(t => {
                const cfg = ET[t];
                const active = activeFilters.has(t);
                return (
                  <button
                    key={t}
                    className="w-full flex items-center gap-2 py-1 text-left"
                    onClick={() => toggleFilter(t)}
                  >
                    <div className={`h-3.5 w-3.5 rounded border flex items-center justify-center flex-shrink-0 transition-colors
                      ${active ? 'border-transparent' : 'border-gray-300 bg-white'}`}
                      style={{ backgroundColor: active ? cfg.color : undefined }}
                    >
                      {active && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                    </div>
                    <span className="text-xs text-gray-600">{cfg.label}</span>
                    <span className="ml-auto text-[10px] text-gray-400">
                      {events.filter(e => e.event_type === t).length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── EVENT DETAIL PANEL ─────────────────────────────────────────────────────

  function EventDetailPanel() {
    if (!selectedEvent) return null;
    const e = selectedEvent;
    const eff = effectiveStatus(e);
    const days = daysUntil(e.due_date);
    const cfg = ET[e.event_type];
    const isCompleting = actionLoading === e.id + '-complete';
    const isSnoozing = actionLoading === e.id + '-snooze';

    const sourceLink = () => {
      if (!e.source_type) return null;
      const links: Record<string, { href: string; label: string }> = {
        policy: { href: '/dashboard/policies', label: 'Policy Editor' },
        training: { href: '/dashboard/training', label: 'Staff Training' },
        baa: { href: '/dashboard/vendors', label: 'BAA Tracker' },
        mitigation: { href: '/dashboard/mitigation', label: 'Mitigation Board' },
        organization: { href: '/dashboard/risk-assessment', label: 'Risk Assessment' },
      };
      return links[e.source_type] ?? null;
    };
    const link = sourceLink();

    return (
      <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-gray-200 shadow-2xl z-40 flex flex-col overflow-hidden">
        {/* Header */}
        <div
          className="h-1 flex-shrink-0"
          style={{ backgroundColor: eff === 'overdue' ? '#ef4444' : cfg.color }}
        />
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <TypeBadge type={e.event_type} />
              <StatusBadge status={eff} />
            </div>
            <h2 className="text-base font-medium text-[#0e274e] leading-tight">{e.title}</h2>
          </div>
          <button onClick={() => { setSelectedEvent(null); setSnoozePanel(false); }} className="ml-2 p-1 hover:bg-gray-100 rounded flex-shrink-0">
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        {/* Details */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Key details */}
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between items-start">
              <span className="text-xs text-gray-400">Due date</span>
              <span className="text-right">
                <span className="text-xs font-medium text-[#0e274e]">{formatDate(e.due_date)}</span>
                <span className={`block text-[10px] ${days < 0 ? 'text-red-600' : days <= 7 ? 'text-amber-600' : 'text-gray-400'}`}>
                  {days < 0 ? `${Math.abs(days)} days overdue` : days === 0 ? 'Due today' : `${days} days from now`}
                </span>
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Recurrence</span>
              <span className="text-xs text-[#0e274e] capitalize">{e.recurrence === 'none' ? 'One-time' : e.recurrence}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Source</span>
              <span className="text-xs text-[#0e274e]">
                {e.is_auto_generated ? 'Auto-generated' : 'Manual'}
              </span>
            </div>
            {link && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Related</span>
                <a href={link.href} className="text-xs text-[#00bceb] hover:underline flex items-center gap-0.5">
                  {link.label} <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
            )}
            {e.location && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Location</span>
                <span className="text-xs text-[#0e274e]">{e.location}</span>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1.5">Notes</p>
            <textarea
              className="w-full text-xs text-gray-700 border border-gray-200 rounded p-2 resize-none focus:outline-none focus:border-[#00bceb] bg-gray-50"
              rows={3}
              placeholder="Add notes..."
              value={notesDraft}
              onChange={e => {
                setNotesDraft(e.target.value);
                saveNotes(e.target.value);
              }}
            />
          </div>

          {/* Snooze panel */}
          {snoozePanel && (
            <div className="border border-amber-100 bg-amber-50 p-3 rounded space-y-2">
              <p className="text-xs font-medium text-amber-700">Snooze until</p>
              <input
                type="date"
                className="w-full text-xs border border-amber-200 bg-white p-1.5 rounded focus:outline-none"
                value={snoozeDate}
                min={todayStr}
                onChange={ev => setSnoozeDate(ev.target.value)}
              />
              <input
                type="text"
                className="w-full text-xs border border-amber-200 bg-white p-1.5 rounded focus:outline-none"
                placeholder="Reason (optional)"
                value={snoozeReason}
                onChange={ev => setSnoozeReason(ev.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={doSnooze}
                  disabled={!snoozeDate || isSnoozing}
                  className="flex-1 text-xs bg-amber-500 text-white py-1.5 rounded hover:bg-amber-600 disabled:opacity-50"
                >
                  {isSnoozing ? 'Saving...' : 'Confirm Snooze'}
                </button>
                <button
                  onClick={() => setSnoozePanel(false)}
                  className="flex-1 text-xs border border-gray-200 text-gray-600 py-1.5 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-gray-100 p-4 space-y-2 flex-shrink-0">
          {eff !== 'complete' && (
            <button
              onClick={() => markComplete(e.id)}
              disabled={isCompleting}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white text-sm font-medium hover:bg-green-700 rounded disabled:opacity-60 transition-colors"
            >
              {isCompleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Mark as Complete
            </button>
          )}
          {eff !== 'complete' && eff !== 'in_progress' && (
            <button
              onClick={() => markInProgress(e.id)}
              className="w-full py-2 border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
            >
              Mark as In Progress
            </button>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => { setSnoozePanel(!snoozePanel); setSnoozeDate(''); setSnoozeReason(''); }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 rounded"
            >
              <AlarmClock className="h-3.5 w-3.5" /> Snooze
            </button>
            <button
              onClick={sendReminder}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 rounded"
            >
              <Bell className="h-3.5 w-3.5" /> Send Reminder
            </button>
          </div>
          {!e.is_auto_generated && (
            <button
              onClick={() => {
                if (confirm('Delete this event?')) deleteEvent(e.id);
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-red-500 hover:bg-red-50 rounded transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete Event
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── ADD EVENT MODAL ────────────────────────────────────────────────────────

  function AddEventModal() {
    if (!showAddModal) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
        <div className="bg-white w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 bg-[#0e274e]">
            <h3 className="text-base font-medium text-white">Add Compliance Event</h3>
            <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-white/10 rounded transition-colors">
              <X className="h-4 w-4 text-white/70" />
            </button>
          </div>

          <div className="p-6 space-y-4 bg-white">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Event Title *</label>
              <input
                className="w-full border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#0175a2] rounded bg-gray-50"
                placeholder="e.g. Insurance Renewal"
                value={addForm.title}
                onChange={e => setAddForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Type</label>
                <select
                  className="w-full border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#0175a2] rounded bg-gray-50"
                  value={addForm.event_type}
                  onChange={e => setAddForm(f => ({ ...f, event_type: e.target.value as EventType }))}
                >
                  {ALL_TYPES.map(t => (
                    <option key={t} value={t}>{ET[t].label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Recurrence</label>
                <select
                  className="w-full border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#0175a2] rounded bg-gray-50"
                  value={addForm.recurrence}
                  onChange={e => setAddForm(f => ({ ...f, recurrence: e.target.value }))}
                >
                  <option value="none">None</option>
                  <option value="annual">Annual</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="monthly">Monthly</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>

            {addForm.recurrence === 'custom' && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Repeat every (days)</label>
                <input
                  type="number"
                  className="w-full border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#0175a2] rounded bg-gray-50"
                  placeholder="e.g. 180"
                  value={addForm.recurrence_interval_days}
                  onChange={e => setAddForm(f => ({ ...f, recurrence_interval_days: e.target.value }))}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Due Date *</label>
                <input
                  type="date"
                  className="w-full border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#0175a2] rounded bg-gray-50"
                  value={addForm.due_date}
                  onChange={e => setAddForm(f => ({ ...f, due_date: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">End Date</label>
                <input
                  type="date"
                  className="w-full border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#0175a2] rounded bg-gray-50"
                  value={addForm.end_date}
                  onChange={e => setAddForm(f => ({ ...f, end_date: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Location</label>
              <input
                className="w-full border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#0175a2] rounded bg-gray-50"
                placeholder="e.g. Conference Room A"
                value={addForm.location}
                onChange={e => setAddForm(f => ({ ...f, location: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Notes</label>
              <textarea
                className="w-full border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#0175a2] rounded bg-gray-50 resize-none"
                rows={3}
                placeholder="Additional notes..."
                value={addForm.notes}
                onChange={e => setAddForm(f => ({ ...f, notes: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
            <button
              onClick={createEvent}
              disabled={!addForm.title || !addForm.due_date || actionLoading === 'create'}
              className="flex-1 py-2.5 bg-[#0175a2] text-white text-sm font-medium hover:bg-[#015a7a] disabled:opacity-50 rounded transition-colors"
            >
              {actionLoading === 'create' ? 'Creating...' : 'Create Event'}
            </button>
            <button
              onClick={() => setShowAddModal(false)}
              className="px-6 py-2.5 border border-gray-200 text-sm text-gray-600 hover:bg-white rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── RENDER ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full bg-[#f3f5f9] min-h-screen">

      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div>
          <p className="text-xs font-medium text-[#00bceb]">Clinic Plan</p>
          <h1 className="text-lg font-light text-[#0e274e]">Compliance Calendar</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex border border-gray-200 rounded overflow-hidden">
            {([['monthly', <Calendar key="c" className="h-3.5 w-3.5" />, 'Month'],
               ['quarterly', <BarChart3 key="b" className="h-3.5 w-3.5" />, 'Quarter'],
               ['list', <List key="l" className="h-3.5 w-3.5" />, 'List']] as const).map(([v, icon, label]) => (
              <button
                key={v}
                onClick={() => setView(v as ViewMode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors
                  ${view === v ? 'bg-[#0e274e] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                {icon}{label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00bceb] text-white text-xs font-medium hover:bg-[#00a8d4] rounded transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Add Event
          </button>
          <button
            onClick={exportCalendar}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 rounded transition-colors"
          >
            <Download className="h-3.5 w-3.5" /> Export .ics
          </button>
        </div>
      </div>

      {/* Generating banner */}
      {generating && (
        <div className="bg-blue-50 border-b border-blue-100 px-6 py-2 flex items-center gap-2">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
          <span className="text-xs text-blue-600">Syncing events from your compliance data…</span>
        </div>
      )}

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main area */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
            </div>
          ) : (
            <>
              {view === 'monthly' && <MonthlyView />}
              {view === 'quarterly' && <QuarterlyView />}
              {view === 'list' && <ListView />}
            </>
          )}
        </div>

        {/* Right sidebar */}
        <RightSidebar />
      </div>

      {/* Event detail panel (slide-in from right, over sidebar) */}
      {selectedEvent && (
        <>
          <div className="fixed inset-0 z-30 bg-black/10" onClick={() => { setSelectedEvent(null); setSnoozePanel(false); }} />
          <EventDetailPanel />
        </>
      )}

      {/* Add event modal */}
      <AddEventModal />

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0e274e] text-white text-sm px-4 py-2.5 rounded shadow-lg flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-400" />
          {toastMsg}
        </div>
      )}
    </div>
  );
}
