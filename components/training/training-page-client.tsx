'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  UserPlus, Download, BookOpen, Award, Loader2, AlertTriangle,
  Upload, FileText,
} from 'lucide-react';
import { ActionGate } from '@/components/action-gate';
import { PlanGate } from '@/components/plan-gate';
import StaffTrainingClient from '@/components/training/staff-training-client';
import { createEmployee, bulkImportEmployees } from '@/app/actions/staff-training';
import type {
  EmployeeWithAssignments, TrainingModule, RoleGroup,
} from '@/app/actions/staff-training';
import type { PlanTier } from '@/lib/plan-gating';
import { toast } from 'sonner';
import { useRef } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Props {
  trainingRecords: any[];
  trainingStats: { completed: number; pending: number; expired: number; total: number };
  userName: string;
  userEmail: string;
  activeEmployees: EmployeeWithAssignments[];
  inactiveEmployees: EmployeeWithAssignments[];
  modules: TrainingModule[];
  planTier: PlanTier;
  hasPractice: boolean;
  isLocked: boolean;
}

const ROLE_GROUPS: RoleGroup[] = ['Clinical', 'Admin', 'Contractor', 'Intern'];
const PLAN_LIMITS: Record<string, number> = {
  solo: 5, practice: 15, clinic: 50, enterprise: 999, unknown: 5,
};
const GROUP_STYLE: Record<string, { bg: string; text: string }> = {
  Clinical:   { bg: '#ccfbf1', text: '#0f766e' },
  Admin:      { bg: '#dbeafe', text: '#1e40af' },
  Contractor: { bg: '#f3f4f6', text: '#374151' },
  Intern:     { bg: '#f3f4f6', text: '#374151' },
};

// ─── Add Employee Modal ───────────────────────────────────────────────────────

function AddEmployeeModal({
  open, onClose, onSuccess, onImport,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onImport: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [sendInvite, setSendInvite] = useState(false);
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '',
    role_group: 'Clinical' as RoleGroup,
    hire_date: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await createEmployee(form);
        if (sendInvite) {
          await fetch('/api/training/invite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: form.email, name: `${form.first_name} ${form.last_name}` }),
          });
        }
        toast.success('Employee added. Training modules assigned.');
        onSuccess();
        onClose();
        setForm({ first_name: '', last_name: '', email: '', role_group: 'Clinical', hire_date: '' });
        setSendInvite(false);
      } catch (err: any) {
        toast.error(err.message ?? 'Failed to add employee');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-white rounded-lg border border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-[#0a1628] font-semibold text-base">Add Employee</DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Training modules will be auto-assigned based on their group.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-700">First Name *</Label>
              <Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required className="h-9 text-sm rounded-md border-gray-200" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-700">Last Name *</Label>
              <Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required className="h-9 text-sm rounded-md border-gray-200" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-700">Work Email *</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="h-9 text-sm rounded-md border-gray-200" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-700">Group *</Label>
              <Select value={form.role_group} onValueChange={(v) => setForm({ ...form, role_group: v as RoleGroup })}>
                <SelectTrigger className="h-9 text-sm rounded-md border-gray-200"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLE_GROUPS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-700">Hire Date</Label>
              <Input type="date" value={form.hire_date} onChange={(e) => setForm({ ...form, hire_date: e.target.value })} className="h-9 text-sm rounded-md border-gray-200" />
            </div>
          </div>

          {/* Send invite checkbox */}
          <div className="flex items-start gap-2.5 p-3 bg-gray-50 rounded-md">
            <input
              id="send-invite"
              type="checkbox"
              checked={sendInvite}
              onChange={(e) => setSendInvite(e.target.checked)}
              className="mt-0.5 rounded border-gray-300 text-[#0d9488] focus:ring-[#0d9488] w-4 h-4 cursor-pointer"
            />
            <div>
              <label htmlFor="send-invite" className="text-xs font-medium text-gray-700 cursor-pointer">
                Send training invitation email
              </label>
              <p className="text-xs text-gray-400 mt-0.5">
                Employee receives a link to complete HIPAA training online.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => { onClose(); onImport(); }}
              className="text-xs text-[#0d9488] hover:underline"
            >
              Import multiple employees instead →
            </button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose} className="h-9 text-sm rounded-md border-gray-200 text-gray-700">Cancel</Button>
              <Button type="submit" disabled={pending} className="h-9 text-sm rounded-md bg-[#0a1628] text-white hover:bg-[#0a1628]/90">
                {pending ? 'Adding…' : 'Add Employee'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Import Modal ─────────────────────────────────────────────────────────────

function ImportModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [preview, setPreview] = useState<{ first_name: string; last_name: string; email: string; role_group: RoleGroup; error?: string }[]>([]);
  const [result, setResult] = useState<{ created: number; errors: string[] } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleClose = () => { setStep(1); setPreview([]); setResult(null); onClose(); };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
      const dataLines = lines[0]?.toLowerCase().includes('email') ? lines.slice(1) : lines;
      const rows = dataLines.map((line) => {
        const [first_name, last_name, email, role_group] = line.split(',').map((c) => c.trim().replace(/"/g, ''));
        const valid = ROLE_GROUPS as readonly string[];
        const error = !email ? 'Missing email' : !first_name ? 'Missing first name' : !valid.includes(role_group) ? `Invalid group: ${role_group}` : undefined;
        return { first_name: first_name ?? '', last_name: last_name ?? '', email: email ?? '', role_group: (valid.includes(role_group) ? role_group : 'Admin') as RoleGroup, error };
      });
      setPreview(rows); setStep(3);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    const valid = preview.filter((r) => !r.error);
    startTransition(async () => {
      try {
        const res = await bulkImportEmployees(valid);
        setResult(res);
        if (res.created > 0) onSuccess();
      } catch (err: any) { toast.error(err.message ?? 'Import failed'); }
    });
  };

  const downloadTemplate = () => {
    const csv = 'first_name,last_name,email,role_group,hire_date\nJane,Doe,jane@clinic.com,Clinical,2024-01-15';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'employee-template.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl bg-white rounded-lg border border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-[#0a1628] font-semibold text-base">Import Employees</DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Step {step} of 3 — {step === 1 ? 'Download template' : step === 2 ? 'Upload CSV' : 'Review and confirm'}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4 mt-2">
            <p className="text-sm text-gray-600 bg-gray-50 rounded-md p-3">
              Download our CSV template, fill in your employees, and upload it back.
            </p>
            <p className="text-xs text-gray-500">Columns: <code className="bg-gray-100 px-1 rounded text-xs">first_name, last_name, email, role_group, hire_date</code></p>
            <p className="text-xs text-gray-500">Valid groups: Clinical / Admin / Contractor / Intern</p>
            <div className="flex gap-2 pt-1">
              <Button onClick={downloadTemplate} variant="outline" className="h-9 text-sm rounded-md border-gray-200">
                <Download className="h-3.5 w-3.5 mr-1.5" /> Download Template
              </Button>
              <Button onClick={() => setStep(2)} className="h-9 text-sm rounded-md bg-[#0a1628] text-white">
                I have a CSV file →
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 mt-2">
            <div
              className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center cursor-pointer hover:border-gray-300 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-400 mt-1">.csv files only</p>
              <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={handleFile} className="hidden" />
            </div>
            <Button variant="outline" onClick={() => setStep(1)} className="h-9 text-sm rounded-md border-gray-200 text-gray-700">← Back</Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 mt-2">
            {result ? (
              <div>
                <p className="text-sm text-green-600 font-medium">{result.created} employee(s) imported.</p>
                {result.errors.map((e, i) => <p key={i} className="text-xs text-red-500 mt-1">{e}</p>)}
                <Button onClick={handleClose} className="h-9 text-sm rounded-md bg-[#0a1628] text-white mt-3">Done</Button>
              </div>
            ) : (
              <>
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>{['Name', 'Email', 'Group', 'Status'].map((h) => (
                        <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400">{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {preview.map((row, i) => (
                        <tr key={i} className={`border-t border-gray-100 ${row.error ? 'bg-red-50' : ''}`}>
                          <td className="px-3 py-2 text-gray-900">{row.first_name} {row.last_name}</td>
                          <td className="px-3 py-2 text-gray-500">{row.email}</td>
                          <td className="px-3 py-2 text-gray-500">{row.role_group}</td>
                          <td className="px-3 py-2">{row.error ? <span className="text-red-500">{row.error}</span> : <span className="text-green-600">OK</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-500">{preview.filter((r) => !r.error).length} valid / {preview.filter((r) => !!r.error).length} with errors</p>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)} className="h-9 text-sm rounded-md border-gray-200 text-gray-700">← Back</Button>
                  <Button
                    onClick={handleImport}
                    disabled={pending || preview.filter((r) => !r.error).length === 0}
                    className="h-9 text-sm rounded-md bg-[#0a1628] text-white"
                  >
                    {pending ? 'Importing…' : `Import ${preview.filter((r) => !r.error).length} employees`}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── My Training Card ─────────────────────────────────────────────────────────

function MyTrainingCard({
  records, stats, userName, isLocked,
}: {
  records: any[];
  stats: { completed: number; pending: number; expired: number; total: number };
  userName: string;
  isLocked: boolean;
}) {
  const now = new Date();
  const ninetyDays = 90 * 24 * 60 * 60 * 1000;

  const validRecord = records.find(
    (r) => r.completion_status === 'completed' && new Date(r.expiration_date) > now,
  );
  const expiringSoon = validRecord && (new Date(validRecord.expiration_date).getTime() - now.getTime()) < ninetyDays;
  const hasAnyExpired = records.some(
    (r) => r.completion_status === 'completed' && new Date(r.expiration_date) <= now,
  );

  let statusDotColor = '#94a3b8';
  let statusLabel = 'Not Started';
  if (validRecord) {
    if (expiringSoon) { statusDotColor = '#d97706'; statusLabel = 'Due Soon'; }
    else { statusDotColor = '#16a34a'; statusLabel = 'Current'; }
  } else if (hasAnyExpired) {
    statusDotColor = '#dc2626'; statusLabel = 'Expired';
  }

  const displayName = records[0]?.full_name || userName;
  const roleTitle = records[0]?.role_title || 'Administrator';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  const expiresDate = validRecord
    ? new Date(validRecord.expiration_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';

  return (
    <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-4">
      <div className="flex items-center gap-6">
        {/* Avatar + info */}
        <div className="flex items-center gap-3 min-w-[200px]">
          <div className="w-10 h-10 rounded-full bg-[#0d9488] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 leading-tight">{displayName}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-gray-400">{roleTitle}</p>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: statusDotColor }} />
                <span className="text-xs text-gray-500">{statusLabel}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        {records.length === 0 ? (
          <div className="flex-1 text-sm text-gray-400 text-center">
            No training records yet.
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-4 gap-4 text-center">
            {[
              { label: 'Completed', value: String(stats.completed) },
              { label: 'Pending',   value: String(stats.pending) },
              { label: 'Expired',   value: String(stats.expired) },
              { label: 'Expires',   value: expiresDate },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-lg font-semibold text-gray-900 leading-tight">{item.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Expiry warning */}
        {expiringSoon && validRecord && (
          <div className="flex items-center gap-1.5 text-amber-600 text-xs shrink-0">
            <AlertTriangle className="h-3.5 w-3.5" />
            Expiring soon
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          {validRecord && (
            <ActionGate isLocked={isLocked} documentType="training certificate">
              <CertDownloadButton recordId={validRecord.id} name={displayName} />
            </ActionGate>
          )}
          <Link href="/dashboard/training/take">
            <Button
              size="sm"
              variant={validRecord ? 'outline' : 'default'}
              className={`h-8 text-xs rounded-md w-full ${
                validRecord
                  ? 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  : 'bg-[#0d9488] text-white hover:bg-[#0d9488]/90 border-0'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5 mr-1.5" />
              {validRecord ? 'Retake Training' : 'Start Training'}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// small inline cert download so we avoid circular issues
function CertDownloadButton({ recordId, name }: { recordId: string; name: string }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/training/certificate?id=${encodeURIComponent(recordId)}`);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `HIPAA_Certificate_${name.replace(/\s+/g, '_')}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      toast.error(err.message || 'Failed to download certificate');
    } finally { setLoading(false); }
  };

  return (
    <Button size="sm" variant="outline" onClick={handleDownload} disabled={loading}
      className="h-8 text-xs rounded-md border-gray-200 text-gray-600 hover:bg-gray-50">
      {loading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Award className="h-3.5 w-3.5 mr-1.5" />}
      Certificate
    </Button>
  );
}

// ─── Stats Cards ──────────────────────────────────────────────────────────────

function StatsCards({
  activeEmployees, inactiveEmployees, planTier, ownerHasTraining,
}: {
  activeEmployees: EmployeeWithAssignments[];
  inactiveEmployees: EmployeeWithAssignments[];
  planTier: PlanTier;
  ownerHasTraining: boolean;
}) {
  const planLimit = PLAN_LIMITS[planTier] ?? 5;
  const totalActive = activeEmployees.length + (ownerHasTraining ? 1 : 0);
  const limitPct = totalActive / planLimit;
  const limitColor = limitPct >= 1 ? '#dc2626' : limitPct >= 0.8 ? '#d97706' : '#6b7280';

  const groupCounts = ROLE_GROUPS.reduce((acc, g) => {
    acc[g] = activeEmployees.filter((e) => e.role_group === g).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <p className="text-xs text-gray-500 mb-2">Total Active Employees</p>
        <p className="text-5xl font-medium text-gray-900 leading-none">{totalActive}</p>
        <p className="text-xs mt-2 font-medium flex items-center justify-center gap-1" style={{ color: limitColor }}>
          Limit {planLimit}
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <p className="text-xs text-gray-500 mb-3 text-center">Workforce Groups</p>
        <div className="grid grid-cols-4 gap-2 text-center">
          {ROLE_GROUPS.map((g) => (
            <div key={g}>
              <p className="text-2xl font-semibold text-gray-900 leading-none">{groupCounts[g]}</p>
              <p className="text-[10px] text-gray-400 mt-1 leading-tight">{g}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <p className="text-xs text-gray-500 mb-2">Total Inactive Employees</p>
        <p className="text-5xl font-medium text-gray-900 leading-none">{inactiveEmployees.length}</p>
      </div>
    </div>
  );
}

// ─── Export Report ────────────────────────────────────────────────────────────

function ExportReportButton({ isLocked }: { isLocked: boolean }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/training/audit-report');
      if (!res.ok) throw new Error('Failed to generate report');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'training-audit-report.pdf'; a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      toast.error(err.message || 'Failed to download report');
    } finally { setLoading(false); }
  };

  return (
    <ActionGate isLocked={isLocked} documentType="training audit report">
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownload}
        disabled={loading}
        className="h-9 text-[13px] font-medium rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <FileText className="h-3.5 w-3.5 mr-1.5" />}
        Export Report
      </Button>
    </ActionGate>
  );
}

// ─── Main Page Client ─────────────────────────────────────────────────────────

export default function TrainingPageClient({
  trainingRecords, trainingStats, userName, userEmail,
  activeEmployees, inactiveEmployees, modules,
  planTier, hasPractice, isLocked,
}: Props) {
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [staffKey, setStaffKey] = useState(0); // force staff table refresh

  const ownerHasTraining = trainingRecords.some(
    (r) => r.completion_status === 'completed' && new Date(r.expiration_date) > new Date(),
  );

  const handleAddSuccess = () => setStaffKey((k) => k + 1);
  const handleImportSuccess = () => setStaffKey((k) => k + 1);

  return (
    <div className="flex flex-col gap-6 w-full">

      {/* ── Zone 1: Page Header ──────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-medium text-gray-900">Training & Employees</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage HIPAA training compliance for your team.</p>
        </div>
        {hasPractice && (
          <div className="flex items-center gap-2">
            <ExportReportButton isLocked={isLocked} />
            <ActionGate isLocked={isLocked} documentType="employee">
              <Button
                size="sm"
                onClick={() => setAddOpen(true)}
                className="h-9 text-[13px] font-medium rounded-md bg-[#0a1628] text-white hover:bg-[#0a1628]/90"
              >
                <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                Add Employee
              </Button>
            </ActionGate>
          </div>
        )}
      </div>

      {/* ── Zone 2: My Training Card ─────────────────────────────────────── */}
      <MyTrainingCard
        records={trainingRecords}
        stats={trainingStats}
        userName={userName}
        isLocked={isLocked}
      />

      {/* ── Zone 3 + 4 + 5: Staff Tracker ────────────────────────────────── */}
      <PlanGate
        requiredPlan="practice"
        currentPlan={planTier}
        featureName="Staff Training Tracker"
        features={[
          'Full employee roster with role-based training assignments',
          'Auto-assign modules when employees are added',
          'Completion certificates with org branding and expiration tracking',
          'Automated renewal reminders at 60, 30, and 7 days',
          'Training audit report exportable as PDF',
        ]}
      >
        {/* Divider + label */}
        <div className="flex items-center gap-4">
          <hr className="flex-1 border-slate-200/80" />
          <span className="text-[11px] font-semibold tracking-widest uppercase text-slate-400">Staff Tracker</span>
          <hr className="flex-1 border-slate-200/80" />
        </div>

        {/* Stats cards */}
        <StatsCards
          activeEmployees={activeEmployees}
          inactiveEmployees={inactiveEmployees}
          planTier={planTier}
          ownerHasTraining={ownerHasTraining}
        />

        {/* Table */}
        <StaffTrainingClient
          key={staffKey}
          initialEmployees={activeEmployees}
          initialInactiveEmployees={inactiveEmployees}
          initialModules={modules}
          isLocked={isLocked}
          onAddOpen={() => setAddOpen(true)}
        />
      </PlanGate>

      {/* Modals */}
      <AddEmployeeModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={handleAddSuccess}
        onImport={() => { setAddOpen(false); setImportOpen(true); }}
      />
      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onSuccess={handleImportSuccess}
      />
    </div>
  );
}
