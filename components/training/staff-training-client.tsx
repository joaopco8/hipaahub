'use client';

import { useState, useTransition, useRef } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  Users, UserPlus, CheckCircle2, Clock, AlertCircle, XCircle,
  Download, BarChart3, Filter, RefreshCw, Upload, FileText,
  ChevronDown, ChevronRight,
} from 'lucide-react';
import {
  createEmployee, updateEmployee, deactivateEmployee, manualAssign,
  markAssignmentComplete, bulkImportEmployees,
  type Employee, type EmployeeWithAssignments, type RoleGroup,
  type TrainingModule, type TrainingOverviewStats,
} from '@/app/actions/staff-training';
import { toast } from 'sonner';
import { ActionGate } from '@/components/action-gate';

interface Props {
  initialEmployees: EmployeeWithAssignments[];
  initialStats: TrainingOverviewStats;
  initialModules: TrainingModule[];
  isLocked?: boolean;
}

const ROLE_GROUPS: RoleGroup[] = ['Clinical', 'Admin', 'Contractor', 'Intern'];

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  completed:   { label: 'Complete',    cls: 'bg-green-50  text-green-600  border-green-200'  },
  in_progress: { label: 'In Progress', cls: 'bg-amber-50  text-amber-600  border-amber-200'  },
  not_started: { label: 'Not Started', cls: 'bg-gray-50   text-gray-500   border-gray-200'   },
  expired:     { label: 'Expired',     cls: 'bg-red-50    text-red-600    border-red-200'     },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_BADGE[status] ?? STATUS_BADGE.not_started;
  return (
    <Badge className={`${s.cls} rounded-none text-xs font-light border`}>{s.label}</Badge>
  );
}

// ─── Add Employee Form ─────────────────────────────────────────────────────

function AddEmployeeModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', role_group: 'Clinical' as RoleGroup, hire_date: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await createEmployee(form);
        toast.success('Employee added and training auto-assigned.');
        onSuccess();
        onClose();
        setForm({ first_name: '', last_name: '', email: '', role_group: 'Clinical', hire_date: '' });
      } catch (err: any) {
        toast.error(err.message ?? 'Failed to add employee');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-white border-gray-200 rounded-none">
        <DialogHeader>
          <DialogTitle className="text-[#0e274e] font-light">Add Employee</DialogTitle>
          <DialogDescription className="text-gray-500 font-light text-sm">
            Training will be auto-assigned based on role group.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-[#0e274e] font-light">First Name *</Label>
              <Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required className="rounded-none" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-[#0e274e] font-light">Last Name *</Label>
              <Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required className="rounded-none" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-[#0e274e] font-light">Email *</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="rounded-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-[#0e274e] font-light">Role Group *</Label>
              <Select value={form.role_group} onValueChange={(v) => setForm({ ...form, role_group: v as RoleGroup })}>
                <SelectTrigger className="rounded-none"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLE_GROUPS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-[#0e274e] font-light">Hire Date</Label>
              <Input type="date" value={form.hire_date} onChange={(e) => setForm({ ...form, hire_date: e.target.value })} className="rounded-none" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-none">Cancel</Button>
            <Button type="submit" disabled={pending} className="bg-[#00bceb] text-white hover:bg-[#00a8d4] rounded-none">
              {pending ? 'Adding…' : 'Add Employee'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Manual Assign Modal ────────────────────────────────────────────────────

function AssignModal({
  open,
  onClose,
  employees,
  modules,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  employees: Employee[];
  modules: TrainingModule[];
  onSuccess: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({ employee_id: '', module_id: '', due_date: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await manualAssign(form);
        toast.success('Assignment created.');
        onSuccess();
        onClose();
      } catch (err: any) {
        toast.error(err.message ?? 'Failed to assign');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white border-gray-200 rounded-none">
        <DialogHeader>
          <DialogTitle className="text-[#0e274e] font-light">Assign Training</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label className="text-xs text-[#0e274e] font-light">Employee *</Label>
            <Select value={form.employee_id} onValueChange={(v) => setForm({ ...form, employee_id: v })}>
              <SelectTrigger className="rounded-none"><SelectValue placeholder="Select employee" /></SelectTrigger>
              <SelectContent>
                {employees.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.first_name} {e.last_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-[#0e274e] font-light">Module *</Label>
            <Select value={form.module_id} onValueChange={(v) => setForm({ ...form, module_id: v })}>
              <SelectTrigger className="rounded-none"><SelectValue placeholder="Select module" /></SelectTrigger>
              <SelectContent>
                {modules.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.module_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-[#0e274e] font-light">Due Date (optional)</Label>
            <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="rounded-none" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-none">Cancel</Button>
            <Button type="submit" disabled={pending || !form.employee_id || !form.module_id} className="bg-[#00bceb] text-white hover:bg-[#00a8d4] rounded-none">
              {pending ? 'Assigning…' : 'Assign'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── CSV Import ─────────────────────────────────────────────────────────────

function CSVImportModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ created: number; errors: string[] } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
      // Skip header row if it looks like a header
      const dataLines = lines[0]?.toLowerCase().includes('email') ? lines.slice(1) : lines;
      const rows = dataLines.map((line) => {
        const [first_name, last_name, email, role_group] = line.split(',').map((c) => c.trim().replace(/"/g, ''));
        return { first_name, last_name, email, role_group: (role_group ?? 'Admin') as RoleGroup };
      }).filter((r) => r.email);

      startTransition(async () => {
        try {
          const res = await bulkImportEmployees(rows);
          setResult(res);
          if (res.created > 0) onSuccess();
        } catch (err: any) {
          toast.error(err.message ?? 'Import failed');
        }
      });
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white border-gray-200 rounded-none">
        <DialogHeader>
          <DialogTitle className="text-[#0e274e] font-light">Bulk Import Employees</DialogTitle>
          <DialogDescription className="text-sm text-gray-500 font-light">
            CSV format: first_name, last_name, email, role_group (Clinical/Admin/Contractor/Intern)
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <Input ref={fileRef} type="file" accept=".csv,text/csv" onChange={handleFile} disabled={pending} className="rounded-none" />
          {pending && <p className="text-sm text-gray-500 font-light">Importing…</p>}
          {result && (
            <div className="space-y-2">
              <p className="text-sm text-green-600 font-light">{result.created} employee(s) imported.</p>
              {result.errors.map((e, i) => (
                <p key={i} className="text-xs text-red-500">{e}</p>
              ))}
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose} className="rounded-none">Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Employee Row ───────────────────────────────────────────────────────────

function EmployeeRow({
  emp,
  onDeactivate,
  onComplete,
  isLocked,
}: {
  emp: EmployeeWithAssignments;
  onDeactivate: (id: string) => void;
  onComplete: (assignmentId: string) => void;
  isLocked?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const overallStatus =
    emp.assignments.length === 0 ? 'not_started' :
    emp.assignments.some((a) => a.status === 'expired') ? 'expired' :
    emp.assignments.every((a) => a.status === 'completed') ? 'completed' :
    emp.assignments.some((a) => a.status === 'in_progress') ? 'in_progress' :
    'not_started';

  const handleDownloadCert = async (assignmentId: string, name: string) => {
    const res = await fetch(`/api/training/staff-certificate?id=${assignmentId}`);
    if (!res.ok) { toast.error('Certificate not available'); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Certificate_${name.replace(/\s+/g, '_')}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <tr
        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-[#0e274e] flex items-center justify-center text-white text-xs font-light flex-shrink-0">
              {emp.first_name[0]}{emp.last_name[0]}
            </div>
            <div>
              <p className="text-sm font-medium text-[#0e274e]">{emp.first_name} {emp.last_name}</p>
              <p className="text-xs text-gray-400">{emp.email}</p>
            </div>
          </div>
        </td>
        <td className="p-4">
          <Badge className="bg-[#0e274e]/10 text-[#0e274e] border-0 rounded-none text-xs font-light">
            {emp.role_group}
          </Badge>
        </td>
        <td className="p-4"><StatusBadge status={overallStatus} /></td>
        <td className="p-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 h-1.5 rounded-full">
              <div
                className="h-1.5 rounded-full bg-green-500 transition-all"
                style={{ width: `${emp.compliance_pct}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 w-8 text-right">{emp.compliance_pct}%</span>
          </div>
        </td>
        <td className="p-4 text-right">
          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 rounded-none text-gray-400 hover:text-red-600"
              onClick={() => {
                if (confirm(`Deactivate ${emp.first_name} ${emp.last_name}?`)) {
                  onDeactivate(emp.id);
                }
              }}
            >
              <XCircle className="h-3.5 w-3.5" />
            </Button>
            {expanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-gray-50/50">
          <td colSpan={5} className="px-6 pb-4">
            {emp.assignments.length === 0 ? (
              <p className="text-xs text-gray-400 py-2 font-light">No modules assigned.</p>
            ) : (
              <div className="mt-2 space-y-2">
                {emp.assignments.map((a) => (
                  <div key={a.id} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm text-[#0e274e] font-light">{(a.module as any)?.module_name ?? 'Unknown Module'}</p>
                      {a.due_date && a.status !== 'completed' && (
                        <p className="text-xs text-gray-400">Due: {new Date(a.due_date).toLocaleDateString()}</p>
                      )}
                      {a.expires_at && a.status === 'completed' && (
                        <p className="text-xs text-gray-400">Expires: {new Date(a.expires_at).toLocaleDateString()}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={a.status} />
                      {a.status !== 'completed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 rounded-none text-xs font-light"
                          onClick={() => onComplete(a.id)}
                        >
                          Mark Complete
                        </Button>
                      )}
                      {a.status === 'completed' && (
                        <ActionGate isLocked={isLocked ?? false} documentType="training certificate">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 rounded-none text-gray-400 hover:text-[#00bceb]"
                            title="Download certificate"
                            onClick={() => handleDownloadCert(a.id, `${emp.first_name} ${emp.last_name}`)}
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </ActionGate>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function StaffTrainingClient({ initialEmployees, initialStats, initialModules, isLocked = false }: Props) {
  const [employees, setEmployees] = useState(initialEmployees);
  const [stats, setStats] = useState(initialStats);
  const [modules] = useState(initialModules);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [addOpen, setAddOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);

  const [, startTransition] = useTransition();

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/training/staff-overview', { cache: 'no-store' });
      if (res.ok) {
        const d = await res.json();
        setEmployees(d.employees ?? employees);
        setStats(d.stats ?? stats);
      }
    } catch {
      // silent
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDeactivate = (id: string) => {
    startTransition(async () => {
      try {
        await deactivateEmployee(id);
        toast.success('Employee deactivated');
        await refresh();
      } catch (err: any) {
        toast.error(err.message);
      }
    });
  };

  const handleComplete = (assignmentId: string) => {
    startTransition(async () => {
      try {
        await markAssignmentComplete(assignmentId);
        toast.success('Marked as complete');
        await refresh();
      } catch (err: any) {
        toast.error(err.message);
      }
    });
  };

  const filtered = employees.filter((emp) => {
    const roleOk = filterRole === 'all' || emp.role_group === filterRole;
    if (!roleOk) return false;
    if (filterStatus === 'all') return true;
    const overallStatus =
      emp.assignments.length === 0 ? 'not_started' :
      emp.assignments.some((a) => a.status === 'expired') ? 'expired' :
      emp.assignments.every((a) => a.status === 'completed') ? 'completed' :
      'in_progress';
    return overallStatus === filterStatus;
  });

  const handleDownloadReport = async () => {
    const res = await fetch('/api/training/audit-report');
    if (!res.ok) { toast.error('Failed to generate report'); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'training-audit-report.pdf'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-medium text-gray-400">
            Staff Training Tracker
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <ActionGate isLocked={isLocked} documentType="training audit report">
            <Button size="sm" variant="outline" onClick={handleDownloadReport} className="rounded-none text-xs font-light h-8">
              <FileText className="mr-1.5 h-3.5 w-3.5" />
              Audit Report
            </Button>
          </ActionGate>
          <Button size="sm" variant="outline" onClick={() => setCsvOpen(true)} className="rounded-none text-xs font-light h-8">
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            Import CSV
          </Button>
          <Button size="sm" variant="outline" onClick={() => setAssignOpen(true)} className="rounded-none text-xs font-light h-8">
            <BarChart3 className="mr-1.5 h-3.5 w-3.5" />
            Assign Training
          </Button>
          <ActionGate isLocked={isLocked} documentType="employee">
            <Button
              size="sm"
              onClick={() => setAddOpen(true)}
              className="bg-[#00bceb] text-white hover:bg-[#00a8d4] rounded-none text-xs h-8"
            >
              <UserPlus className="mr-1.5 h-3.5 w-3.5" />
              Add Employee
            </Button>
          </ActionGate>
          <Button size="sm" variant="ghost" onClick={refresh} disabled={isRefreshing} className="h-8 w-8 p-0 rounded-none text-gray-400">
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* KPI: Compliance % */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm rounded-none col-span-2 md:col-span-1">
          <CardContent className="p-6">
            <p className="text-xs text-gray-400 mb-1">Team Compliance</p>
            <p className="text-5xl font-light text-[#0e274e]">{stats.compliance_pct}<span className="text-2xl">%</span></p>
            <p className="text-xs text-gray-400 font-light mt-1">{stats.fully_compliant} / {stats.total_employees} employees</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm rounded-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">Complete</p>
                <p className="text-3xl font-light text-[#0e274e]">{stats.completed}</p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm rounded-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">Pending</p>
                <p className="text-3xl font-light text-[#0e274e]">{stats.not_started + stats.in_progress}</p>
              </div>
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm rounded-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">Expired</p>
                <p className="text-3xl font-light text-[#0e274e]">{stats.expired}</p>
              </div>
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-gray-400" />
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-36 rounded-none h-8 text-xs">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {ROLE_GROUPS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40 rounded-none h-8 text-xs">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="completed">Complete</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="not_started">Not Started</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Employee Table */}
      <Card className="border-0 shadow-sm rounded-none">
        <CardHeader className="border-b border-gray-100 py-3">
          <CardTitle className="text-base font-light text-[#0e274e]">
            Employees <span className="text-gray-400 text-sm font-light ml-1">({filtered.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="h-10 w-10 text-gray-200 mb-3" />
              <p className="text-sm text-gray-400 font-light">
                {employees.length === 0 ? 'No employees yet — add your first employee above.' : 'No employees match the current filter.'}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left p-4 text-xs font-medium text-gray-500">Name</th>
                  <th className="text-left p-4 text-xs font-medium text-gray-500">Role</th>
                  <th className="text-left p-4 text-xs font-medium text-gray-500">Status</th>
                  <th className="text-left p-4 text-xs font-medium text-gray-500">Progress</th>
                  <th className="p-4" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp) => (
                  <EmployeeRow
                    key={emp.id}
                    emp={emp}
                    onDeactivate={handleDeactivate}
                    onComplete={handleComplete}
                    isLocked={isLocked}
                  />
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <AddEmployeeModal open={addOpen} onClose={() => setAddOpen(false)} onSuccess={refresh} />
      <AssignModal open={assignOpen} onClose={() => setAssignOpen(false)} employees={employees} modules={modules} onSuccess={refresh} />
      <CSVImportModal open={csvOpen} onClose={() => setCsvOpen(false)} onSuccess={refresh} />
    </div>
  );
}
