'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertCircle, Plus, Eye, Edit, Trash2, AlertTriangle, CheckCircle2,
  ArrowRight, ArrowLeft, FileText, ShieldAlert, Bell, ClipboardList,
  Info, ExternalLink, Lock
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { BreachNavigation } from '@/components/breach-notifications/breach-navigation';
import { ActionGate } from '@/components/action-gate';
import { useSubscription } from '@/contexts/subscription-context';

// ── Constants ────────────────────────────────────────────────────────────────

const DISCOVERY_METHODS = [
  'Staff report', 'Patient complaint', 'System alert',
  'Routine audit', 'External notification', 'Law enforcement', 'Other',
];

const INCIDENT_TYPES = [
  'Unauthorized access', 'Improper disclosure', 'Lost or stolen device',
  'Ransomware or malware', 'Misdirected communication', 'Insider threat',
  'Third-party breach', 'Physical theft', 'Other',
];

const PHI_TYPES = [
  'Names', 'Contact info', 'Dates of birth', 'Social Security numbers',
  'Medical record numbers', 'Diagnoses', 'Treatment notes',
  'Insurance info', 'Financial/billing info', 'Other',
];

const PATIENT_NOTIF_METHODS = [
  { value: 'first_class_mail', label: 'First class mail (required)' },
  { value: 'email', label: 'Email (if patient agreed to email communication)' },
  { value: 'substitute', label: 'Substitute notice (if contact info unavailable for 10+ patients)' },
];

const STEPS = [
  { id: 1, label: 'Discovery',         icon: AlertCircle },
  { id: 2, label: 'Assessment',        icon: ShieldAlert },
  { id: 3, label: 'Risk Assessment',   icon: ClipboardList },
  { id: 4, label: 'Response Actions',  icon: CheckCircle2 },
  { id: 5, label: 'Notifications',     icon: Bell },
];

const DEFAULT_RESPONSE_ACTIONS = {
  containment:              { checked: false, date: '', by: '' },
  secured:                  { checked: false, date: '', by: '' },
  evidence_preserved:       { checked: false, date: '', by: '' },
  privacy_officer_notified: { checked: false, date: '', by: '' },
  legal_notified:           { checked: false, date: '', by: '' },
  ocr_notified:             { checked: false, date: '', by: '', confirmation: '' },
  patient_notifications:    { checked: false, date: '', method: '' },
  corrective_actions:       { checked: false, date: '', by: '' },
  documented_in_log:        { checked: false, date: '', by: '' },
};

type RiskLevel = 'High' | 'Medium' | 'Low' | '';
type ActionKey = keyof typeof DEFAULT_RESPONSE_ACTIONS;

interface ResponseAction {
  checked: boolean;
  date: string;
  by?: string;
  confirmation?: string;
  method?: string;
}

interface IncidentForm {
  // Step 1
  incident_title: string;
  date_occurred: string;
  date_discovered: string;
  discovery_method: string;
  discoverer_name: string;
  discoverer_role: string;
  description: string;
  // Step 2
  incident_types: string[];
  phi_types: string[];
  estimated_individuals_affected: number;
  phi_encrypted: string;
  incident_classification: string;
  // Step 3
  risk_factor_1: RiskLevel;
  risk_factor_2: RiskLevel;
  risk_factor_3: RiskLevel;
  risk_factor_4: RiskLevel;
  overall_risk_level: string;
  // Step 4
  response_actions: Record<string, ResponseAction>;
  // Step 5
  ocr_notified_date: string;
  ocr_confirmation_number: string;
  patient_notification_method: string;
  patient_notification_date: string;
  patients_notified_count: number | '';
  // Legacy
  phi_involved: boolean;
  breach_confirmed: boolean;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'under_review' | 'closed';
}

const DEFAULT_FORM: IncidentForm = {
  incident_title: '',
  date_occurred: '',
  date_discovered: '',
  discovery_method: '',
  discoverer_name: '',
  discoverer_role: '',
  description: '',
  incident_types: [],
  phi_types: [],
  estimated_individuals_affected: 0,
  phi_encrypted: 'unknown',
  incident_classification: 'suspected_breach',
  risk_factor_1: '',
  risk_factor_2: '',
  risk_factor_3: '',
  risk_factor_4: '',
  overall_risk_level: '',
  response_actions: DEFAULT_RESPONSE_ACTIONS,
  ocr_notified_date: '',
  ocr_confirmation_number: '',
  patient_notification_method: '',
  patient_notification_date: '',
  patients_notified_count: '',
  phi_involved: true,
  breach_confirmed: false,
  severity: 'medium',
  status: 'open',
};

// ── Risk auto-calculation ────────────────────────────────────────────────────

function computeOverallRisk(f1: RiskLevel, f2: RiskLevel, f3: RiskLevel, f4: RiskLevel): string {
  const values = [f1, f2, f3, f4].filter(Boolean);
  if (values.length === 0) return '';
  const highs = values.filter(v => v === 'High').length;
  const lows  = values.filter(v => v === 'Low').length;
  if (highs >= 2) return 'High';
  if (lows >= 3)  return 'Low';
  return 'Medium';
}

// ── Multi-select toggle helper ────────────────────────────────────────────────

function toggleArrayItem(arr: string[], item: string): string[] {
  return arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];
}

// ── Status helpers ────────────────────────────────────────────────────────────

function getSeverityStyle(s: string) {
  return s === 'high' ? 'bg-red-50 text-red-600 border-red-200'
       : s === 'medium' ? 'bg-yellow-50 text-yellow-600 border-yellow-200'
       : 'bg-green-50 text-green-600 border-green-200';
}
function getStatusStyle(s: string) {
  return s === 'open' ? 'bg-red-50 text-red-600 border-red-200'
       : s === 'under_review' ? 'bg-yellow-50 text-yellow-600 border-yellow-200'
       : 'bg-green-50 text-green-600 border-green-200';
}
function getRiskStyle(r: string) {
  return r === 'High' ? 'bg-red-50 text-red-700 border-red-200'
       : r === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200'
       : r === 'Low' ? 'bg-green-50 text-green-700 border-green-200'
       : 'bg-gray-50 text-gray-600 border-gray-200';
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function IncidentsPage() {
  const router = useRouter();
  const { planTier } = useSubscription();
  const isTrialOrFree = planTier !== 'practice' && planTier !== 'clinic' && planTier !== 'enterprise';

  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<IncidentForm>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadIncidents(); }, []);

  // Auto-compute overall risk whenever factors change
  useEffect(() => {
    const overall = computeOverallRisk(
      form.risk_factor_1, form.risk_factor_2,
      form.risk_factor_3, form.risk_factor_4
    );
    setForm(prev => ({ ...prev, overall_risk_level: overall }));
  }, [form.risk_factor_1, form.risk_factor_2, form.risk_factor_3, form.risk_factor_4]);

  async function loadIncidents() {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/signin'); return; }
      const { data: org } = await supabase.from('organizations').select('id').eq('user_id', user.id).single();
      if (!org) { setLoading(false); return; }
      const { data } = await (supabase as any)
        .from('incident_logs').select('*').eq('organization_id', org.id)
        .order('date_discovered', { ascending: false });
      setIncidents(data || []);
    } finally {
      setLoading(false);
    }
  }

  function openNew() {
    setForm(DEFAULT_FORM);
    setEditingId(null);
    setStep(1);
    setIsOpen(true);
  }

  function openEdit(inc: any) {
    setForm({
      incident_title: inc.incident_title || '',
      date_occurred: inc.date_occurred || '',
      date_discovered: inc.date_discovered || '',
      discovery_method: inc.discovery_method || '',
      discoverer_name: inc.discoverer_name || (inc.discovered_by || ''),
      discoverer_role: inc.discoverer_role || '',
      description: inc.description || '',
      incident_types: inc.incident_types || [],
      phi_types: inc.phi_types || [],
      estimated_individuals_affected: inc.estimated_individuals_affected || 0,
      phi_encrypted: inc.phi_encrypted || 'unknown',
      incident_classification: inc.incident_classification || 'suspected_breach',
      risk_factor_1: inc.risk_factor_1 || '',
      risk_factor_2: inc.risk_factor_2 || '',
      risk_factor_3: inc.risk_factor_3 || '',
      risk_factor_4: inc.risk_factor_4 || '',
      overall_risk_level: inc.overall_risk_level || '',
      response_actions: inc.response_actions || DEFAULT_RESPONSE_ACTIONS,
      ocr_notified_date: inc.ocr_notified_date || '',
      ocr_confirmation_number: inc.ocr_confirmation_number || '',
      patient_notification_method: inc.patient_notification_method || '',
      patient_notification_date: inc.patient_notification_date || '',
      patients_notified_count: inc.patients_notified_count ?? '',
      phi_involved: inc.phi_involved ?? true,
      breach_confirmed: inc.breach_confirmed || false,
      severity: inc.severity || 'medium',
      status: inc.status || 'open',
    });
    setEditingId(inc.id);
    setStep(1);
    setIsOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: org } = await supabase.from('organizations').select('id').eq('user_id', user.id).single();
      if (!org) return;

      const payload = {
        incident_title: form.incident_title,
        description: form.description,
        date_occurred: form.date_occurred || null,
        date_discovered: form.date_discovered || null,
        discovered_by: `${form.discoverer_name}${form.discoverer_role ? ` (${form.discoverer_role})` : ''}`,
        discovery_method: form.discovery_method || null,
        discoverer_name: form.discoverer_name || null,
        discoverer_role: form.discoverer_role || null,
        incident_types: form.incident_types,
        phi_types: form.phi_types,
        estimated_individuals_affected: Number(form.estimated_individuals_affected) || 0,
        phi_encrypted: form.phi_encrypted,
        incident_classification: form.incident_classification,
        risk_factor_1: form.risk_factor_1 || null,
        risk_factor_2: form.risk_factor_2 || null,
        risk_factor_3: form.risk_factor_3 || null,
        risk_factor_4: form.risk_factor_4 || null,
        overall_risk_level: form.overall_risk_level || null,
        response_actions: form.response_actions,
        ocr_notified_date: form.ocr_notified_date || null,
        ocr_confirmation_number: form.ocr_confirmation_number || null,
        patient_notification_method: form.patient_notification_method || null,
        patient_notification_date: form.patient_notification_date || null,
        patients_notified_count: form.patients_notified_count !== '' ? Number(form.patients_notified_count) : null,
        phi_involved: form.phi_involved,
        breach_confirmed: form.incident_classification === 'confirmed_breach',
        severity: form.overall_risk_level === 'High' ? 'high' : form.overall_risk_level === 'Low' ? 'low' : 'medium',
        status: form.status,
        updated_at: new Date().toISOString(),
      };

      if (editingId) {
        await (supabase as any).from('incident_logs').update(payload).eq('id', editingId).eq('organization_id', org.id);
      } else {
        const { data: newInc } = await (supabase as any)
          .from('incident_logs').insert({ ...payload, organization_id: org.id, created_by: user.id })
          .select('id').single();
        fetch('/api/incidents/notify-admin', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ incidentId: newInc?.id, title: form.incident_title }),
        }).catch(() => {});
      }

      setIsOpen(false);
      loadIncidents();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this incident? This cannot be undone.')) return;
    const supabase = createClient();
    await (supabase as any).from('incident_logs').delete().eq('id', id);
    loadIncidents();
  }

  function setAction(key: ActionKey, field: string, value: any) {
    setForm(prev => ({
      ...prev,
      response_actions: {
        ...prev.response_actions,
        [key]: { ...(prev.response_actions[key] || {}), [field]: value },
      },
    }));
  }

  const affected = Number(form.estimated_individuals_affected) || 0;
  const ocrRequired = affected >= 500;

  if (loading) return (
    <div className="flex w-full flex-col gap-6">
      <div className="mb-2">
        <h2 className="text-2xl font-light text-[#0e274e]">Breach Notifications</h2>
        <p className="text-sm text-gray-400 font-light">Loading...</p>
      </div>
    </div>
  );

  const openCount = incidents.filter(i => i.status === 'open').length;
  const highCount = incidents.filter(i => i.severity === 'high' && i.status !== 'closed').length;

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="mb-2">
        <h2 className="text-2xl font-light text-[#0e274e]">Breach Notifications</h2>
        <p className="text-sm text-gray-400 font-light">Manage breach notifications, incident logs, and compliance documentation</p>
      </div>

      <BreachNavigation />

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-light text-[#0e274e]">Incident Log</h3>
          <p className="text-sm text-gray-400 font-light">{incidents.length} total · {openCount} open</p>
        </div>
        <Button onClick={openNew} className="bg-[#00bceb] text-white hover:bg-[#00a0c9] rounded-none">
          <Plus className="h-4 w-4 mr-2" />Log Incident
        </Button>
      </div>

      {highCount > 0 && (
        <Card className="border-0 shadow-sm bg-white rounded-none border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <p className="text-sm text-[#0e274e]">
                <strong>{highCount}</strong> high-risk incident{highCount > 1 ? 's' : ''} requiring immediate attention
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Incidents Table */}
      <Card className="border-0 shadow-sm bg-white rounded-none">
        <CardContent className="p-0">
          {incidents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <AlertCircle className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-sm text-gray-400 mb-1">No incidents logged yet</p>
              <p className="text-xs text-gray-400">Use the 5-step OCR wizard to document incidents correctly</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left p-4 text-xs font-medium text-[#565656]">Incident</th>
                    <th className="text-left p-4 text-xs font-medium text-[#565656]">Classification</th>
                    <th className="text-left p-4 text-xs font-medium text-[#565656]">Risk</th>
                    <th className="text-left p-4 text-xs font-medium text-[#565656]">Affected</th>
                    <th className="text-left p-4 text-xs font-medium text-[#565656]">Status</th>
                    <th className="text-left p-4 text-xs font-medium text-[#565656]">Discovered</th>
                    <th className="text-right p-4 text-xs font-medium text-[#565656]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((inc) => (
                    <tr key={inc.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4">
                        <p className="text-sm font-medium text-[#0e274e]">{inc.incident_title}</p>
                        <p className="text-xs text-gray-400 line-clamp-1">{inc.description}</p>
                      </td>
                      <td className="p-4">
                        <Badge className={`rounded-none text-xs ${
                          inc.incident_classification === 'confirmed_breach' ? 'bg-red-50 text-red-700 border-red-200'
                          : inc.incident_classification === 'suspected_breach' ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {inc.incident_classification === 'confirmed_breach' ? 'Confirmed Breach'
                           : inc.incident_classification === 'security_incident' ? 'Security Incident'
                           : 'Suspected Breach'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {inc.overall_risk_level ? (
                          <Badge className={`rounded-none text-xs ${getRiskStyle(inc.overall_risk_level)}`}>
                            {inc.overall_risk_level}
                          </Badge>
                        ) : <span className="text-xs text-gray-400">—</span>}
                      </td>
                      <td className="p-4">
                        <span className={`text-sm font-light ${inc.estimated_individuals_affected >= 500 ? 'text-red-600 font-medium' : 'text-[#565656]'}`}>
                          {inc.estimated_individuals_affected?.toLocaleString() ?? '—'}
                          {inc.estimated_individuals_affected >= 500 && <span className="block text-xs text-red-500">OCR 72h</span>}
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge className={`${getStatusStyle(inc.status)} rounded-none capitalize`}>
                          {inc.status?.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-[#565656]">
                        {inc.date_discovered ? format(new Date(inc.date_discovered), 'MMM d, yyyy') : '—'}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/breach-notifications/incidents/${inc.id}`)} className="h-8 rounded-none text-gray-500 hover:text-[#00bceb]">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openEdit(inc)} className="h-8 rounded-none text-gray-500 hover:text-[#00bceb]">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(inc.id)} className="h-8 rounded-none text-red-400 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 5-Step Wizard Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto bg-white p-0">
          <DialogHeader className="px-6 pt-6 pb-0">
            <DialogTitle className="text-[#0c0b1d] font-light text-xl">
              {editingId ? 'Edit Incident' : 'Log New Incident'}
            </DialogTitle>
            <p className="text-sm text-gray-400 font-light mt-1">OCR-compliant incident documentation — 45 CFR 164.400–414</p>
          </DialogHeader>

          {/* Step progress */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-0">
              {STEPS.map((s, i) => {
                const active = step === s.id;
                const done   = step > s.id;
                return (
                  <div key={s.id} className="flex items-center flex-1 min-w-0">
                    <div className="flex flex-col items-center shrink-0">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                        done ? 'bg-[#00bceb] text-white' : active ? 'bg-[#0e274e] text-white' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {done ? '✓' : s.id}
                      </div>
                      <span className={`text-[10px] mt-1 font-light whitespace-nowrap ${active ? 'text-[#0e274e]' : 'text-gray-400'}`}>
                        {s.label}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`h-px flex-1 mx-2 mt-[-10px] ${done ? 'bg-[#00bceb]' : 'bg-gray-200'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="px-6 py-5 space-y-5">

            {/* ── STEP 1: Discovery ─────────────────────────────────────────── */}
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label className="text-[#0c0b1d] font-light text-sm">Incident Title *</Label>
                  <Input value={form.incident_title} onChange={e => setForm(p => ({ ...p, incident_title: e.target.value }))}
                    className="rounded-none text-[#0c0b1d]" placeholder="Brief description of the incident" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#0c0b1d] font-light text-sm">Date Breach Occurred</Label>
                    <Input type="date" value={form.date_occurred} onChange={e => setForm(p => ({ ...p, date_occurred: e.target.value }))}
                      className="rounded-none text-[#0c0b1d]" />
                    <p className="text-xs text-gray-400">Leave blank if unknown / estimated</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#0c0b1d] font-light text-sm">Date Breach Discovered *</Label>
                    <Input type="date" value={form.date_discovered} onChange={e => setForm(p => ({ ...p, date_discovered: e.target.value }))}
                      className="rounded-none text-[#0c0b1d]" />
                    <p className="text-xs text-gray-400">OCR notification clock starts here</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[#0c0b1d] font-light text-sm">How Was It Discovered? *</Label>
                  <Select value={form.discovery_method} onValueChange={v => setForm(p => ({ ...p, discovery_method: v }))}>
                    <SelectTrigger className="rounded-none text-[#0c0b1d]"><SelectValue placeholder="Select discovery method" /></SelectTrigger>
                    <SelectContent>
                      {DISCOVERY_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#0c0b1d] font-light text-sm">Who Discovered It — Name</Label>
                    <Input value={form.discoverer_name} onChange={e => setForm(p => ({ ...p, discoverer_name: e.target.value }))}
                      className="rounded-none text-[#0c0b1d]" placeholder="Full name" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#0c0b1d] font-light text-sm">Role / Title</Label>
                    <Input value={form.discoverer_role} onChange={e => setForm(p => ({ ...p, discoverer_role: e.target.value }))}
                      className="rounded-none text-[#0c0b1d]" placeholder="e.g. Front desk staff" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[#0c0b1d] font-light text-sm">Description of What Happened *</Label>
                  <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    rows={4} className="rounded-none text-[#0c0b1d]"
                    placeholder="Describe the incident in detail — what occurred, which systems were involved, what data may have been exposed..." />
                </div>
              </>
            )}

            {/* ── STEP 2: Assessment ───────────────────────────────────────── */}
            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label className="text-[#0c0b1d] font-light text-sm">Type of Incident (select all that apply)</Label>
                  <div className="grid grid-cols-2 gap-1.5 border border-gray-200 p-3">
                    {INCIDENT_TYPES.map(t => (
                      <label key={t} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1.5">
                        <input type="checkbox" checked={form.incident_types.includes(t)}
                          onChange={() => setForm(p => ({ ...p, incident_types: toggleArrayItem(p.incident_types, t) }))}
                          className="w-4 h-4 text-[#00bceb] rounded" />
                        <span className="text-sm font-light text-[#0c0b1d]">{t}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[#0c0b1d] font-light text-sm">What Type of PHI Was Involved? (select all that apply)</Label>
                  <div className="grid grid-cols-2 gap-1.5 border border-gray-200 p-3">
                    {PHI_TYPES.map(t => (
                      <label key={t} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1.5">
                        <input type="checkbox" checked={form.phi_types.includes(t)}
                          onChange={() => setForm(p => ({ ...p, phi_types: toggleArrayItem(p.phi_types, t) }))}
                          className="w-4 h-4 text-[#00bceb] rounded" />
                        <span className="text-sm font-light text-[#0c0b1d]">{t}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[#0c0b1d] font-light text-sm">How Many Patients Are Potentially Affected? *</Label>
                  <Input type="number" min="0" value={form.estimated_individuals_affected}
                    onChange={e => setForm(p => ({ ...p, estimated_individuals_affected: parseInt(e.target.value) || 0 }))}
                    className="rounded-none text-[#0c0b1d]" />
                  {affected >= 500 && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-200 p-3 mt-1">
                      <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-red-700 font-light">
                        <strong>500+ patients affected:</strong> OCR must be notified within 72 hours of discovery. Media notification may also be required for patients in affected states.
                      </p>
                    </div>
                  )}
                  {affected > 0 && affected < 500 && (
                    <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 p-3 mt-1">
                      <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-700 font-light">
                        Fewer than 500 patients: Notify affected patients within 60 days. Add to annual OCR breach log (submit by March 1 of the following year).
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-[#0c0b1d] font-light text-sm">Was the PHI Encrypted?</Label>
                  <Select value={form.phi_encrypted} onValueChange={v => setForm(p => ({ ...p, phi_encrypted: v }))}>
                    <SelectTrigger className="rounded-none text-[#0c0b1d]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes — PHI was encrypted</SelectItem>
                      <SelectItem value="no">No — PHI was not encrypted</SelectItem>
                      <SelectItem value="unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[#0c0b1d] font-light text-sm">Is This a Breach or Security Incident?</Label>
                  <div className="space-y-2 border border-gray-200 p-3">
                    {[
                      { value: 'confirmed_breach',  label: 'Confirmed breach' },
                      { value: 'suspected_breach',  label: 'Suspected breach' },
                      { value: 'security_incident', label: 'Security incident (no breach)' },
                    ].map(opt => (
                      <label key={opt.value} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1.5">
                        <input type="radio" name="classification" value={opt.value}
                          checked={form.incident_classification === opt.value}
                          onChange={() => setForm(p => ({ ...p, incident_classification: opt.value }))}
                          className="w-4 h-4 text-[#00bceb]" />
                        <span className="text-sm font-light text-[#0c0b1d]">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 bg-gray-50 border border-gray-100 px-3 py-2">
                    <strong>A breach</strong> is unauthorized acquisition, access, use, or disclosure of PHI that compromises its privacy or security. If you are unsure, treat it as a breach.
                  </p>
                </div>
              </>
            )}

            {/* ── STEP 3: Risk Assessment (4-factor test) ──────────────────── */}
            {step === 3 && (
              <>
                <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 p-3">
                  <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700 font-light">
                    OCR requires a 4-factor risk assessment to determine whether notification is required. Answer each factor honestly. If the majority are HIGH, the incident is a reportable breach.
                  </p>
                </div>

                {[
                  {
                    field: 'risk_factor_1' as const,
                    label: 'Factor 1: What is the nature and extent of the PHI involved?',
                    options: [
                      { value: 'High',   hint: 'High sensitivity data (mental health, substance abuse, HIV status, genetic info)' },
                      { value: 'Medium', hint: 'Financial or insurance info' },
                      { value: 'Low',    hint: 'General demographic info only' },
                    ],
                  },
                  {
                    field: 'risk_factor_2' as const,
                    label: 'Factor 2: Who accessed or could have accessed the PHI?',
                    options: [
                      { value: 'High',   hint: 'Unknown external party' },
                      { value: 'Medium', hint: 'Known external party (wrong recipient) or internal unauthorized access' },
                      { value: 'Low',    hint: 'Trusted employee with legitimate access who made an error' },
                    ],
                  },
                  {
                    field: 'risk_factor_3' as const,
                    label: 'Factor 3: Was the PHI actually acquired or viewed?',
                    options: [
                      { value: 'High',   hint: 'Unknown / Likely yes' },
                      { value: 'Medium', hint: 'Cannot be confirmed either way' },
                      { value: 'Low',    hint: 'Confirmed it was not viewed (e.g. encrypted, returned unopened) — may not require notification' },
                    ],
                  },
                  {
                    field: 'risk_factor_4' as const,
                    label: 'Factor 4: How much has the risk been mitigated?',
                    options: [
                      { value: 'High',   hint: 'No mitigation possible' },
                      { value: 'Medium', hint: 'Partial mitigation (e.g. recipient promised deletion)' },
                      { value: 'Low',    hint: 'Significant mitigation (e.g. data recovered, confirmed destroyed)' },
                    ],
                  },
                ].map((factor, i) => (
                  <div key={factor.field} className="space-y-2">
                    <Label className="text-[#0c0b1d] font-light text-sm">{factor.label}</Label>
                    <div className="space-y-1 border border-gray-200 p-3">
                      {factor.options.map(opt => (
                        <label key={opt.value} className={`flex items-start gap-2 cursor-pointer px-2 py-2 hover:bg-gray-50 ${
                          form[factor.field] === opt.value ? 'bg-gray-50' : ''
                        }`}>
                          <input type="radio" name={factor.field} value={opt.value}
                            checked={form[factor.field] === opt.value}
                            onChange={() => setForm(p => ({ ...p, [factor.field]: opt.value as RiskLevel }))}
                            className="w-4 h-4 mt-0.5 text-[#00bceb] shrink-0" />
                          <div>
                            <span className={`text-xs font-medium mr-2 ${
                              opt.value === 'High' ? 'text-red-600' : opt.value === 'Medium' ? 'text-amber-600' : 'text-green-600'
                            }`}>{opt.value.toUpperCase()} RISK</span>
                            <span className="text-sm font-light text-[#565656]">{opt.hint}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                {form.overall_risk_level && (
                  <div className={`border p-4 ${
                    form.overall_risk_level === 'High' ? 'bg-red-50 border-red-200'
                    : form.overall_risk_level === 'Medium' ? 'bg-amber-50 border-amber-200'
                    : 'bg-green-50 border-green-200'
                  }`}>
                    <p className="text-sm font-medium text-[#0c0b1d] mb-1">
                      Overall Risk Level: <span className={
                        form.overall_risk_level === 'High' ? 'text-red-700'
                        : form.overall_risk_level === 'Medium' ? 'text-amber-700'
                        : 'text-green-700'
                      }>{form.overall_risk_level}</span>
                    </p>
                    <p className="text-xs text-gray-600 font-light">
                      {form.overall_risk_level === 'High'
                        ? 'Majority HIGH factors — this is a reportable breach. Notification requirements apply.'
                        : form.overall_risk_level === 'Low'
                        ? 'Majority LOW factors and PHI likely not acquired — may qualify as low probability of compromise. Document the reasoning thoroughly.'
                        : 'Mixed risk factors — treat as a reportable breach unless you can clearly document otherwise.'}
                    </p>
                  </div>
                )}
              </>
            )}

            {/* ── STEP 4: Response Actions ─────────────────────────────────── */}
            {step === 4 && (
              <>
                <p className="text-sm text-gray-500 font-light">
                  Track required response actions. Check each item as it's completed and record the date and responsible person.
                </p>
                {[
                  { key: 'containment' as ActionKey,              label: 'Immediate containment actions taken' },
                  { key: 'secured' as ActionKey,                  label: 'Affected systems secured or isolated' },
                  { key: 'evidence_preserved' as ActionKey,       label: 'Evidence preserved (logs, emails, devices)' },
                  { key: 'privacy_officer_notified' as ActionKey, label: 'Privacy Officer notified' },
                  { key: 'legal_notified' as ActionKey,           label: 'Legal counsel notified (if applicable)' },
                  { key: 'ocr_notified' as ActionKey,             label: `OCR notified within 72 hours${ocrRequired ? ' — REQUIRED (500+ patients)' : ' (required if 500+ patients)'}` },
                  { key: 'patient_notifications' as ActionKey,    label: 'Patient notifications sent' },
                  { key: 'corrective_actions' as ActionKey,       label: 'Corrective actions implemented to prevent recurrence' },
                  { key: 'documented_in_log' as ActionKey,        label: 'Incident documented in breach log' },
                ].map(({ key, label }) => {
                  const action = form.response_actions[key] || {};
                  const isOcr = key === 'ocr_notified';
                  const isPatient = key === 'patient_notifications';
                  return (
                    <div key={key} className={`border p-3 space-y-2 ${
                      key === 'ocr_notified' && ocrRequired ? 'border-red-200 bg-red-50' : 'border-gray-100'
                    }`}>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={!!action.checked}
                          onChange={e => setAction(key, 'checked', e.target.checked)}
                          className="w-4 h-4 text-[#00bceb]" />
                        <span className={`text-sm font-light ${action.checked ? 'line-through text-gray-400' : 'text-[#0c0b1d]'}`}>{label}</span>
                      </label>
                      {action.checked && (
                        <div className={`grid gap-3 pl-6 ${isOcr ? 'grid-cols-2' : isPatient ? 'grid-cols-2' : 'grid-cols-2'}`}>
                          <div className="space-y-1">
                            <Label className="text-[#565656] font-light text-xs">Date Completed</Label>
                            <Input type="date" value={action.date || ''}
                              onChange={e => setAction(key, 'date', e.target.value)}
                              className="rounded-none text-[#0c0b1d] h-8 text-xs" />
                          </div>
                          {!isPatient && (
                            <div className="space-y-1">
                              <Label className="text-[#565656] font-light text-xs">Completed By</Label>
                              <Input value={action.by || ''}
                                onChange={e => setAction(key, 'by', e.target.value)}
                                placeholder="Name / role" className="rounded-none text-[#0c0b1d] h-8 text-xs" />
                            </div>
                          )}
                          {isOcr && (
                            <div className="space-y-1 col-span-2">
                              <Label className="text-[#565656] font-light text-xs">OCR Confirmation Number</Label>
                              <Input value={action.confirmation || ''}
                                onChange={e => setAction(key, 'confirmation', e.target.value)}
                                placeholder="HHS portal confirmation number" className="rounded-none text-[#0c0b1d] h-8 text-xs" />
                            </div>
                          )}
                          {isPatient && (
                            <div className="space-y-1">
                              <Label className="text-[#565656] font-light text-xs">Notification Method</Label>
                              <Select value={action.method || ''} onValueChange={v => setAction(key, 'method', v)}>
                                <SelectTrigger className="rounded-none h-8 text-xs"><SelectValue placeholder="Select method" /></SelectTrigger>
                                <SelectContent>
                                  {PATIENT_NOTIF_METHODS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}

            {/* ── STEP 5: Notification Tracking ───────────────────────────── */}
            {step === 5 && (
              <>
                {/* Notification rules guidance */}
                <div className="bg-gray-50 border border-gray-200 p-4 space-y-3">
                  <h4 className="text-sm font-medium text-[#0e274e]">Notification Rules</h4>
                  <div className={`border-l-4 pl-3 py-1 ${ocrRequired ? 'border-red-400' : 'border-[#00bceb]'}`}>
                    <p className="text-xs font-medium text-[#0c0b1d] mb-1">
                      {ocrRequired ? 'You have 500+ patients affected:' : 'You have fewer than 500 patients affected:'}
                    </p>
                    {ocrRequired ? (
                      <ul className="text-xs text-gray-600 font-light space-y-1">
                        <li>→ <strong>Notify OCR within 72 hours</strong> of discovery</li>
                        <li>→ Notify affected patients within 60 days</li>
                        <li>→ Notify prominent media in affected states</li>
                      </ul>
                    ) : (
                      <ul className="text-xs text-gray-600 font-light space-y-1">
                        <li>→ Notify affected patients within 60 days</li>
                        <li>→ Add to <strong>annual OCR breach log</strong> (submit by March 1 of the following year)</li>
                        <li>→ No immediate OCR notification required</li>
                      </ul>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#0c0b1d] font-light text-sm">
                      Number of Patients to Notify
                    </Label>
                    <Input type="number" min="0"
                      value={form.estimated_individuals_affected}
                      onChange={e => setForm(p => ({ ...p, estimated_individuals_affected: parseInt(e.target.value) || 0 }))}
                      className="rounded-none text-[#0c0b1d] bg-gray-50" />
                    <p className="text-xs text-gray-400">Auto-filled from Step 2</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#0c0b1d] font-light text-sm">
                      OCR Notification Required Immediately?
                    </Label>
                    <div className={`px-3 py-2 border text-sm font-light ${ocrRequired ? 'border-red-200 bg-red-50 text-red-700' : 'border-gray-200 bg-gray-50 text-gray-600'}`}>
                      {ocrRequired ? 'YES — within 72 hours of discovery' : 'NO — report annually by March 1'}
                    </div>
                  </div>
                </div>

                {ocrRequired && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[#0c0b1d] font-light text-sm">OCR Notification Date</Label>
                      <Input type="date" value={form.ocr_notified_date}
                        onChange={e => setForm(p => ({ ...p, ocr_notified_date: e.target.value }))}
                        className="rounded-none text-[#0c0b1d]" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#0c0b1d] font-light text-sm">OCR Acknowledgment / Confirmation Number</Label>
                      <Input value={form.ocr_confirmation_number}
                        onChange={e => setForm(p => ({ ...p, ocr_confirmation_number: e.target.value }))}
                        placeholder="From HHS web portal" className="rounded-none text-[#0c0b1d]" />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-[#0c0b1d] font-light text-sm">Patient Notification Method</Label>
                  <Select value={form.patient_notification_method}
                    onValueChange={v => setForm(p => ({ ...p, patient_notification_method: v }))}>
                    <SelectTrigger className="rounded-none text-[#0c0b1d]"><SelectValue placeholder="Select method" /></SelectTrigger>
                    <SelectContent>
                      {PATIENT_NOTIF_METHODS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#0c0b1d] font-light text-sm">Patient Notification Date</Label>
                    <Input type="date" value={form.patient_notification_date}
                      onChange={e => setForm(p => ({ ...p, patient_notification_date: e.target.value }))}
                      className="rounded-none text-[#0c0b1d]" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#0c0b1d] font-light text-sm">Number of Patients Notified</Label>
                    <Input type="number" min="0" value={form.patients_notified_count}
                      onChange={e => setForm(p => ({ ...p, patients_notified_count: e.target.value === '' ? '' : parseInt(e.target.value) }))}
                      className="rounded-none text-[#0c0b1d]" />
                  </div>
                </div>

                {/* Document generators */}
                <div className="border-t border-gray-100 pt-5 space-y-3">
                  <h4 className="text-sm font-medium text-[#0e274e]">Document Generators</h4>
                  <p className="text-xs text-gray-400 font-light">Generate pre-filled notification letters based on this incident's data.</p>
                  <div className="flex flex-wrap gap-3">
                    <ActionGate isLocked={isTrialOrFree} documentType="OCR Notification Letter">
                      <Button variant="outline" className="rounded-none border-[#0e274e] text-[#0e274e] hover:bg-[#0e274e] hover:text-white text-xs">
                        <FileText className="h-3.5 w-3.5 mr-2" />
                        Generate OCR Notification Letter
                        {isTrialOrFree && <Lock className="h-3 w-3 ml-1.5" />}
                      </Button>
                    </ActionGate>
                    <ActionGate isLocked={isTrialOrFree} documentType="Patient Notification Letter">
                      <Button variant="outline" className="rounded-none border-[#0e274e] text-[#0e274e] hover:bg-[#0e274e] hover:text-white text-xs">
                        <FileText className="h-3.5 w-3.5 mr-2" />
                        Generate Patient Notification Letter
                        {isTrialOrFree && <Lock className="h-3 w-3 ml-1.5" />}
                      </Button>
                    </ActionGate>
                    <ActionGate isLocked={isTrialOrFree} documentType="Internal Incident Report">
                      <Button variant="outline" className="rounded-none border-[#0e274e] text-[#0e274e] hover:bg-[#0e274e] hover:text-white text-xs">
                        <FileText className="h-3.5 w-3.5 mr-2" />
                        Generate Internal Incident Report PDF
                        {isTrialOrFree && <Lock className="h-3 w-3 ml-1.5" />}
                      </Button>
                    </ActionGate>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer nav */}
          <div className="px-6 pb-6 flex justify-between border-t border-gray-100 pt-4">
            <Button variant="outline" onClick={() => step === 1 ? setIsOpen(false) : setStep(s => s - 1)}
              className="rounded-none">
              {step === 1 ? 'Cancel' : <><ArrowLeft className="h-4 w-4 mr-1" />Back</>}
            </Button>
            <div className="flex gap-2">
              {step < 5 ? (
                <Button onClick={() => setStep(s => s + 1)}
                  disabled={step === 1 && (!form.incident_title || !form.date_discovered)}
                  className="bg-[#00bceb] text-white hover:bg-[#00a0c9] rounded-none">
                  Next <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={handleSave} disabled={saving}
                  className="bg-[#0e274e] text-white hover:bg-[#1a3a6b] rounded-none">
                  {saving ? 'Saving...' : editingId ? 'Update Incident' : 'Save Incident'}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
