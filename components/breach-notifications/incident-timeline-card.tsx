'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, AlertCircle, Loader2, Edit2, Save, X } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface TimelineMilestones {
  timeline_breach_occurred: string | null;
  timeline_breach_discovered: string | null;
  timeline_investigation_began: string | null;
  timeline_ocr_notified: string | null;
  timeline_patients_notified: string | null;
  timeline_incident_resolved: string | null;
}

interface Props {
  incidentId: string;
  initialMilestones: TimelineMilestones;
  discoveryDate?: string; // Used to compute 60-day OCR deadline
}

interface Milestone {
  key: keyof TimelineMilestones;
  label: string;
  sublabel: string;
  regulatoryNote?: string;
  deadlineDays?: number; // days from discovery
}

const MILESTONES: Milestone[] = [
  {
    key: 'timeline_breach_occurred',
    label: 'Breach Occurred',
    sublabel: 'When the incident took place',
  },
  {
    key: 'timeline_breach_discovered',
    label: 'Breach Discovered',
    sublabel: 'When the breach was formally identified',
    regulatoryNote: '60-day OCR clock starts here',
  },
  {
    key: 'timeline_investigation_began',
    label: 'Investigation Initiated',
    sublabel: 'Internal investigation formally launched',
  },
  {
    key: 'timeline_ocr_notified',
    label: 'OCR / HHS Notified',
    sublabel: 'Notification submitted to Office for Civil Rights',
    regulatoryNote: 'Required within 60 days of discovery (≥500 individuals)',
    deadlineDays: 60,
  },
  {
    key: 'timeline_patients_notified',
    label: 'Patients Notified',
    sublabel: 'Affected individuals notified without unreasonable delay',
    regulatoryNote: 'Required without unreasonable delay (max 60 days from discovery)',
    deadlineDays: 60,
  },
  {
    key: 'timeline_incident_resolved',
    label: 'Incident Resolved',
    sublabel: 'Incident formally closed',
  },
];

export function IncidentTimelineCard({ incidentId, initialMilestones, discoveryDate }: Props) {
  const [milestones, setMilestones] = useState<TimelineMilestones>(initialMilestones);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<TimelineMilestones>(initialMilestones);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const discoveryDateObj = discoveryDate ? new Date(discoveryDate) : null;

  function getDeadlineStatus(milestone: Milestone, dateValue: string | null): 'ok' | 'warning' | 'overdue' | null {
    if (!milestone.deadlineDays || !discoveryDateObj) return null;
    const deadline = new Date(discoveryDateObj);
    deadline.setDate(deadline.getDate() + milestone.deadlineDays);
    const today = new Date();

    if (dateValue) {
      // Completed — was it on time?
      const completedDate = new Date(dateValue);
      return completedDate <= deadline ? 'ok' : 'overdue';
    } else {
      // Not done — how many days remain?
      const daysLeft = differenceInDays(deadline, today);
      if (daysLeft < 0) return 'overdue';
      if (daysLeft <= 10) return 'warning';
      return null;
    }
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      const supabase = createClient();
      const { error: updateError } = await (supabase as any)
        .from('incident_logs')
        .update({
          timeline_breach_occurred:     draft.timeline_breach_occurred     || null,
          timeline_breach_discovered:   draft.timeline_breach_discovered   || null,
          timeline_investigation_began: draft.timeline_investigation_began || null,
          timeline_ocr_notified:        draft.timeline_ocr_notified        || null,
          timeline_patients_notified:   draft.timeline_patients_notified   || null,
          timeline_incident_resolved:   draft.timeline_incident_resolved   || null,
        })
        .eq('id', incidentId);

      if (updateError) throw updateError;

      setMilestones({ ...draft });
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(err.message || 'Failed to save timeline');
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setDraft({ ...milestones });
    setEditing(false);
    setError('');
  }

  const completedCount = Object.values(milestones).filter(Boolean).length;

  return (
    <Card className="border-0 shadow-sm bg-white rounded-none">
      <CardHeader className="border-b border-gray-100 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-light text-[#0e274e] flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#00bceb]" />
              Incident Timeline
            </CardTitle>
            <CardDescription className="text-xs text-gray-400 mt-1">
              {completedCount} of {MILESTONES.length} milestones completed
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {saved && (
              <span className="text-xs text-[#71bc48] font-light flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Saved
              </span>
            )}
            {!editing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setDraft({ ...milestones }); setEditing(true); }}
                className="rounded-none border-gray-200 text-xs font-light h-8 flex items-center gap-1.5"
              >
                <Edit2 className="h-3.5 w-3.5" />
                Edit Dates
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={saving}
                  className="rounded-none border-gray-200 text-xs font-light h-8"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-none bg-[#0e274e] text-white hover:bg-[#0e274e]/90 text-xs font-light h-8 flex items-center gap-1.5"
                >
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 p-3 text-sm text-red-700 mb-4 rounded-none">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-[19px] top-6 bottom-6 w-px bg-gray-200" />

          <div className="space-y-0">
            {MILESTONES.map((milestone, idx) => {
              const dateValue = editing ? draft[milestone.key] : milestones[milestone.key];
              const isCompleted = Boolean(dateValue);
              const deadlineStatus = getDeadlineStatus(milestone, dateValue as string | null);
              const isLast = idx === MILESTONES.length - 1;

              return (
                <div key={milestone.key} className={`relative flex gap-4 ${isLast ? '' : 'pb-6'}`}>
                  {/* Node */}
                  <div className="relative z-10 flex-shrink-0">
                    {isCompleted ? (
                      <div className="w-10 h-10 rounded-full bg-[#00bceb]/10 border-2 border-[#00bceb] flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-[#00bceb]" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-50 border-2 border-gray-200 flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1.5 min-w-0">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`text-sm font-light ${isCompleted ? 'text-[#0e274e]' : 'text-gray-400'}`}>
                            {milestone.label}
                          </p>

                          {/* Status badge */}
                          {isCompleted ? (
                            <Badge className="bg-[#00bceb]/10 text-[#00bceb] border border-[#00bceb]/20 rounded-none text-[10px] font-light px-1.5 py-0">
                              Completed
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-50 text-gray-400 border border-gray-200 rounded-none text-[10px] font-light px-1.5 py-0">
                              Pending
                            </Badge>
                          )}

                          {/* Deadline warning */}
                          {deadlineStatus === 'overdue' && !isCompleted && (
                            <Badge className="bg-red-50 text-red-600 border border-red-200 rounded-none text-[10px] font-light px-1.5 py-0">
                              Overdue
                            </Badge>
                          )}
                          {deadlineStatus === 'warning' && !isCompleted && (
                            <Badge className="bg-yellow-50 text-yellow-600 border border-yellow-200 rounded-none text-[10px] font-light px-1.5 py-0">
                              Due Soon
                            </Badge>
                          )}
                          {deadlineStatus === 'overdue' && isCompleted && (
                            <Badge className="bg-orange-50 text-orange-600 border border-orange-200 rounded-none text-[10px] font-light px-1.5 py-0">
                              Completed Late
                            </Badge>
                          )}
                        </div>

                        <p className="text-xs text-gray-400 font-light mt-0.5">{milestone.sublabel}</p>

                        {milestone.regulatoryNote && (
                          <p className="text-xs text-[#00bceb] font-light mt-0.5 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3 shrink-0" />
                            {milestone.regulatoryNote}
                          </p>
                        )}
                      </div>

                      {/* Date display or input */}
                      <div className="shrink-0">
                        {editing ? (
                          <input
                            type="date"
                            value={(draft[milestone.key] as string) || ''}
                            onChange={(e) =>
                              setDraft((prev) => ({ ...prev, [milestone.key]: e.target.value || null }))
                            }
                            className="border border-gray-200 px-2 py-1.5 text-xs font-light text-[#0e274e] focus:outline-none focus:border-[#00bceb] rounded-none bg-white w-36"
                          />
                        ) : isCompleted ? (
                          <p className="text-xs text-[#0e274e] font-light text-right">
                            {format(new Date(dateValue as string), 'MMM d, yyyy')}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-300 font-light">—</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* OCR deadline tracker */}
        {discoveryDateObj && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="bg-[#0e274e]/3 border border-[#0e274e]/10 p-4">
              <p className="text-xs font-medium text-[#0e274e] mb-2">60-Day OCR Notification Deadline</p>
              {(() => {
                const deadline = new Date(discoveryDateObj);
                deadline.setDate(deadline.getDate() + 60);
                const today = new Date();
                const daysLeft = differenceInDays(deadline, today);
                const ocrDone = Boolean(milestones.timeline_ocr_notified);

                if (ocrDone) {
                  return (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#71bc48]" />
                      <p className="text-xs text-[#71bc48] font-light">
                        OCR notified on {format(new Date(milestones.timeline_ocr_notified!), 'MMM d, yyyy')}
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 font-light">
                        Deadline: {format(deadline, 'MMMM d, yyyy')}
                      </p>
                      <p className={`text-xs font-light mt-0.5 ${daysLeft < 0 ? 'text-red-600' : daysLeft <= 10 ? 'text-yellow-600' : 'text-[#0e274e]'}`}>
                        {daysLeft < 0
                          ? `${Math.abs(daysLeft)} days overdue`
                          : `${daysLeft} days remaining`}
                      </p>
                    </div>
                    <div className="w-24 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${daysLeft < 0 ? 'bg-red-500' : daysLeft <= 10 ? 'bg-yellow-400' : 'bg-[#00bceb]'}`}
                        style={{ width: `${Math.min(100, Math.max(0, ((60 - daysLeft) / 60) * 100))}%` }}
                      />
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
