'use client';

import { useState, useTransition, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import {
  Users, UserPlus, XCircle, Download, BarChart3,
  RefreshCw, Search, MoreHorizontal, ChevronDown, ChevronRight,
  ChevronUp, SlidersHorizontal, TrendingUp, TrendingDown, Minus, X,
} from 'lucide-react';
import {
  deactivateEmployee, reactivateEmployee, manualAssign,
  markAssignmentComplete,
  type Employee, type EmployeeWithAssignments, type RoleGroup,
  type TrainingModule,
} from '@/app/actions/staff-training';
import { toast } from 'sonner';
import { ActionGate } from '@/components/action-gate';

// ─── Constants ───────────────────────────────────────────────────────────────

const ROLE_GROUPS: RoleGroup[] = ['Clinical', 'Admin', 'Contractor', 'Intern'];

const GROUP_STYLE: Record<string, { bg: string; text: string }> = {
  Clinical:   { bg: '#ccfbf1', text: '#0f766e' },
  Admin:      { bg: '#dbeafe', text: '#1e40af' },
  Contractor: { bg: '#f3f4f6', text: '#374151' },
  Intern:     { bg: '#f3f4f6', text: '#374151' },
};

const AVATAR_COLORS = [
  '#0a1628','#0d9488','#1e40af','#6d28d9','#92400e',
  '#065f46','#9f1239','#1e3a5f','#78350f','#4c1d95',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hashColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

type OverallStatus = 'completed' | 'in_progress' | 'not_started' | 'expired';

function getOverallStatus(emp: EmployeeWithAssignments): OverallStatus {
  const { assignments } = emp;
  if (!assignments.length) return 'not_started';
  if (assignments.some((a) => a.status === 'expired')) return 'expired';
  if (assignments.every((a) => a.status === 'completed')) return 'completed';
  if (assignments.some((a) => a.status === 'in_progress')) return 'in_progress';
  return 'not_started';
}

function getMonitoringStatus(emp: EmployeeWithAssignments): 'green' | 'amber' | 'red' | 'gray' {
  const { assignments } = emp;
  if (!assignments.length) return 'gray';
  if (assignments.some((a) => a.status === 'expired')) return 'red';
  const now = Date.now();
  const ninetyDays = 90 * 24 * 60 * 60 * 1000;
  if (assignments.some((a) => a.expires_at && new Date(a.expires_at).getTime() - now < ninetyDays && a.status === 'completed')) return 'amber';
  if (assignments.every((a) => a.status === 'completed')) return 'green';
  return 'gray';
}

const MON_COLOR = { green: '#16a34a', amber: '#d97706', red: '#dc2626', gray: '#94a3b8' };

// ─── Assign Modal ─────────────────────────────────────────────────────────────

function AssignModal({ open, onClose, employees, modules, onSuccess }: {
  open: boolean; onClose: () => void;
  employees: Employee[]; modules: TrainingModule[]; onSuccess: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({ employee_id: '', module_id: '', due_date: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await manualAssign(form);
        toast.success('Training assigned.');
        onSuccess(); onClose();
      } catch (err: any) { toast.error(err.message ?? 'Failed to assign'); }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white rounded-lg border border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-[#0a1628] font-semibold text-base">Assign Training Module</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-700">Employee *</Label>
            <Select value={form.employee_id} onValueChange={(v) => setForm({ ...form, employee_id: v })}>
              <SelectTrigger className="h-9 text-sm rounded-md border-gray-200"><SelectValue placeholder="Select employee" /></SelectTrigger>
              <SelectContent>{employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.first_name} {e.last_name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-700">Module *</Label>
            <Select value={form.module_id} onValueChange={(v) => setForm({ ...form, module_id: v })}>
              <SelectTrigger className="h-9 text-sm rounded-md border-gray-200"><SelectValue placeholder="Select module" /></SelectTrigger>
              <SelectContent>{modules.map((m) => <SelectItem key={m.id} value={m.id}>{m.module_name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-700">Due Date (optional)</Label>
            <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="h-9 text-sm rounded-md border-gray-200" />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="h-9 text-sm rounded-md border-gray-200 text-gray-700">Cancel</Button>
            <Button type="submit" disabled={pending || !form.employee_id || !form.module_id} className="h-9 text-sm rounded-md bg-[#0a1628] text-white">
              {pending ? 'Assigning…' : 'Assign'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Expanded Row ─────────────────────────────────────────────────────────────

function ExpandedRow({ emp, onComplete, isLocked }: {
  emp: EmployeeWithAssignments; onComplete: (id: string) => void; isLocked?: boolean;
}) {
  const handleDownloadCert = async (assignmentId: string, name: string) => {
    const res = await fetch(`/api/training/staff-certificate?id=${assignmentId}`);
    if (!res.ok) { toast.error('Certificate not available'); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `Certificate_${name.replace(/\s+/g, '_')}.pdf`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <tr className="bg-gray-50/60">
      <td colSpan={8} className="px-4 pb-3 pt-0">
        <div className="ml-10 border border-gray-100 rounded-lg overflow-hidden">
          {emp.assignments.length === 0 ? (
            <p className="text-xs text-gray-400 p-4">No modules assigned.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-white">
                  <th className="text-left px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400">Module</th>
                  <th className="text-left px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400">Status</th>
                  <th className="text-left px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400">Due / Expires</th>
                  <th className="px-4 py-2 w-28" />
                </tr>
              </thead>
              <tbody className="bg-white">
                {emp.assignments.map((a) => {
                  const s = a.status as string;
                  const dotColor = s === 'completed' ? '#16a34a' : s === 'in_progress' ? '#d97706' : s === 'expired' ? '#dc2626' : '#94a3b8';
                  const label = { completed: 'Complete', in_progress: 'In Progress', expired: 'Expired', not_started: 'Not Started' }[s] ?? s;
                  return (
                    <tr key={a.id} className="border-t border-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-900 font-medium">{(a.module as any)?.module_name ?? 'Unknown Module'}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dotColor }} />
                          <span className="text-xs text-gray-600">{label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-xs text-gray-400">
                        {a.status !== 'completed' && a.due_date && `Due ${new Date(a.due_date).toLocaleDateString()}`}
                        {a.status === 'completed' && a.expires_at && `Expires ${new Date(a.expires_at).toLocaleDateString()}`}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {a.status !== 'completed' && (
                          <Button size="sm" variant="outline" className="h-6 rounded text-xs px-2 border-gray-200" onClick={() => onComplete(a.id)}>
                            Mark Complete
                          </Button>
                        )}
                        {a.status === 'completed' && (
                          <ActionGate isLocked={isLocked ?? false} documentType="training certificate">
                            <button
                              title="Download certificate"
                              onClick={() => handleDownloadCert(a.id, `${emp.first_name} ${emp.last_name}`)}
                              className="text-gray-400 hover:text-[#0a1628] transition-colors p-1"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </button>
                          </ActionGate>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </td>
    </tr>
  );
}

// ─── Employee Row ─────────────────────────────────────────────────────────────

function EmployeeRow({ emp, isActive, selected, onSelect, onDeactivate, onReactivate, onComplete, onAssign, isLocked }: {
  emp: EmployeeWithAssignments;
  isActive: boolean;
  selected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onDeactivate: (id: string) => void;
  onReactivate: (id: string) => void;
  onComplete: (id: string) => void;
  onAssign: (emp: Employee) => void;
  isLocked?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const fullName = `${emp.first_name} ${emp.last_name}`;
  const avatarColor = hashColor(fullName);
  const monStatus = getMonitoringStatus(emp);
  const completed = emp.assignments.filter((a) => a.status === 'completed').length;
  const total = emp.assignments.length;
  const conformanceColor = emp.compliance_pct === 100 ? '#16a34a' : emp.compliance_pct >= 75 ? '#d97706' : '#dc2626';
  const groupStyle = GROUP_STYLE[emp.role_group] ?? { bg: '#f3f4f6', text: '#374151' };

  return (
    <>
      <tr className={`border-b border-gray-100 transition-colors ${selected ? 'bg-blue-50/40' : 'hover:bg-gray-50/70'}`}>
        {/* Checkbox */}
        <td className="px-4 py-3 w-10">
          <input type="checkbox" checked={selected} onChange={(e) => onSelect(emp.id, e.target.checked)}
            className="rounded border-gray-300 w-4 h-4 cursor-pointer" />
        </td>

        {/* Name */}
        <td className="px-4 py-3 min-w-[200px]">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
              style={{ backgroundColor: avatarColor }}>
              {emp.first_name[0]}{emp.last_name[0]}
            </div>
            <div>
              <p className="text-[13px] font-medium text-gray-900 leading-tight">{fullName}</p>
              <p className="text-[11px] text-gray-400">{emp.email}</p>
            </div>
          </div>
        </td>

        {/* Group */}
        <td className="px-4 py-3 w-[120px]">
          <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ backgroundColor: groupStyle.bg, color: groupStyle.text }}>
            {emp.role_group}
          </span>
        </td>

        {/* Conformance */}
        <td className="px-4 py-3 w-[110px]">
          {total === 0 ? (
            <span className="text-gray-300 text-sm">—</span>
          ) : (
            <div className="flex items-center gap-1" style={{ color: conformanceColor }}>
              {emp.compliance_pct === 100 ? <TrendingUp className="h-3.5 w-3.5" /> : emp.compliance_pct >= 75 ? <Minus className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              <span className="text-sm font-semibold tabular-nums">{emp.compliance_pct}</span>
            </div>
          )}
        </td>

        {/* Tasks progress */}
        <td className="px-4 py-3 w-[90px]">
          {total === 0 ? (
            <span className="text-gray-300 text-sm">—</span>
          ) : (
            <div title={`${completed} of ${total} training modules complete`} className="w-[72px] h-[5px] bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${(completed / total) * 100}%`, backgroundColor: '#16a34a' }} />
            </div>
          )}
        </td>

        {/* Monitoring */}
        <td className="px-4 py-3 w-[90px]">
          <span className="w-2.5 h-2.5 rounded-full block" style={{ backgroundColor: MON_COLOR[monStatus] }} />
        </td>

        {/* Actions */}
        <td className="px-4 py-3 w-10 text-right">
          <div className="flex items-center justify-end gap-0.5">
            <button onClick={() => setExpanded(!expanded)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition-colors">
              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition-colors">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-lg min-w-[190px] text-sm">
                <DropdownMenuItem className="cursor-pointer" onClick={() => setExpanded(true)}>View Employee</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => onAssign(emp)}>
                  <BarChart3 className="h-3.5 w-3.5 mr-2 text-gray-400" /> Assign Training Module
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {isActive ? (
                  <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                    onClick={() => { if (confirm(`Deactivate ${fullName}?`)) onDeactivate(emp.id); }}>
                    <XCircle className="h-3.5 w-3.5 mr-2" /> Deactivate
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem className="text-green-600 focus:text-green-600 focus:bg-green-50 cursor-pointer"
                    onClick={() => onReactivate(emp.id)}>
                    <RefreshCw className="h-3.5 w-3.5 mr-2" /> Activate
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </td>
      </tr>
      {expanded && <ExpandedRow emp={emp} onComplete={onComplete} isLocked={isLocked} />}
    </>
  );
}

// ─── Bulk Action Bar ──────────────────────────────────────────────────────────

function BulkActionBar({ count, onDeactivate, onClear }: { count: number; onDeactivate: () => void; onClear: () => void }) {
  return (
    <div className="flex items-center gap-4 px-4 py-2.5 bg-[#0a1628] text-white rounded-lg text-sm mx-4 mb-2">
      <span className="font-medium">{count} employee{count !== 1 ? 's' : ''} selected</span>
      <div className="flex items-center gap-2 ml-auto">
        <button onClick={onDeactivate} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded transition-colors">
          Deactivate
        </button>
        <button onClick={onClear} className="text-gray-300 hover:text-white transition-colors p-1">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type SortKey = 'name' | 'role_group' | 'compliance_pct';
type SortDir = 'asc' | 'desc';

interface Props {
  initialEmployees: EmployeeWithAssignments[];
  initialInactiveEmployees: EmployeeWithAssignments[];
  initialModules: TrainingModule[];
  isLocked?: boolean;
  onAddOpen: () => void;
}

export default function StaffTrainingClient({
  initialEmployees, initialInactiveEmployees, initialModules,
  isLocked = false, onAddOpen,
}: Props) {
  const [activeEmployees, setActiveEmployees] = useState(initialEmployees);
  const [inactiveEmployees, setInactiveEmployees] = useState(initialInactiveEmployees);
  const [modules] = useState(initialModules);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState<Employee | null>(null);

  const [, startTransition] = useTransition();

  const employees = activeTab === 'active' ? activeEmployees : inactiveEmployees;

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/training/staff-overview', { cache: 'no-store' });
      if (res.ok) {
        const d = await res.json();
        setActiveEmployees(d.employees ?? activeEmployees);
      }
    } catch { /* silent */ } finally { setIsRefreshing(false); }
  };

  const handleDeactivate = (id: string) => {
    startTransition(async () => {
      try {
        await deactivateEmployee(id);
        toast.success('Employee deactivated');
        const emp = activeEmployees.find((e) => e.id === id);
        if (emp) {
          setActiveEmployees((prev) => prev.filter((e) => e.id !== id));
          setInactiveEmployees((prev) => [...prev, { ...emp, is_active: false }]);
        }
        setSelected((prev) => { const s = new Set(prev); s.delete(id); return s; });
      } catch (err: any) { toast.error(err.message); }
    });
  };

  const handleReactivate = (id: string) => {
    startTransition(async () => {
      try {
        await reactivateEmployee(id);
        toast.success('Employee reactivated');
        const emp = inactiveEmployees.find((e) => e.id === id);
        if (emp) {
          setInactiveEmployees((prev) => prev.filter((e) => e.id !== id));
          setActiveEmployees((prev) => [...prev, { ...emp, is_active: true }]);
        }
      } catch (err: any) { toast.error(err.message); }
    });
  };

  const handleComplete = (assignmentId: string) => {
    startTransition(async () => {
      try {
        await markAssignmentComplete(assignmentId);
        toast.success('Marked as complete');
        await refresh();
      } catch (err: any) { toast.error(err.message); }
    });
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronDown className="h-3 w-3 opacity-30 inline ml-0.5" />;
    return sortDir === 'asc'
      ? <ChevronUp className="h-3 w-3 inline ml-0.5" />
      : <ChevronDown className="h-3 w-3 inline ml-0.5" />;
  };

  const filtered = useMemo(() => {
    let list = employees.filter((emp) => {
      const roleOk = filterRole === 'all' || emp.role_group === filterRole;
      const statusOk = filterStatus === 'all' || getOverallStatus(emp) === filterStatus;
      const q = search.toLowerCase();
      const searchOk = !q || `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(q) || emp.email.toLowerCase().includes(q);
      return roleOk && statusOk && searchOk;
    });
    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') cmp = `${a.last_name}${a.first_name}`.localeCompare(`${b.last_name}${b.first_name}`);
      if (sortKey === 'role_group') cmp = a.role_group.localeCompare(b.role_group);
      if (sortKey === 'compliance_pct') cmp = a.compliance_pct - b.compliance_pct;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [employees, filterRole, filterStatus, search, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const selectAll = paginated.length > 0 && paginated.every((e) => selected.has(e.id));
  const hasActiveFilters = filterRole !== 'all' || filterStatus !== 'all';

  return (
    <div className="flex flex-col gap-0">
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06)]">

        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {/* Filters popover */}
            <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
              <PopoverTrigger asChild>
                <button className={`flex items-center gap-1.5 h-8 px-3 text-xs font-medium border rounded-md transition-colors ${
                  hasActiveFilters ? 'border-[#0a1628] bg-[#0a1628]/5 text-[#0a1628]' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}>
                  <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
                  {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]" />}
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-60 rounded-lg p-4 space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700">Group</Label>
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="h-8 text-xs rounded-md border-gray-200"><SelectValue placeholder="All Groups" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Groups</SelectItem>
                      {ROLE_GROUPS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700">Training Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="h-8 text-xs rounded-md border-gray-200"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="completed">Compliant</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="not_started">Not Started</SelectItem>
                      <SelectItem value="expired">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {hasActiveFilters && (
                  <button className="text-xs text-gray-400 hover:text-gray-600 underline"
                    onClick={() => { setFilterRole('all'); setFilterStatus('all'); setFiltersOpen(false); }}>
                    Clear filters
                  </button>
                )}
              </PopoverContent>
            </Popover>

            {/* Active / Inactive toggle */}
            <div className="flex items-center border border-gray-200 rounded-md overflow-hidden text-xs font-medium">
              <button
                onClick={() => { setActiveTab('active'); setSelected(new Set()); setPage(1); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${
                  activeTab === 'active' ? 'bg-[#0a1628] text-white' : 'text-gray-500 hover:text-gray-700 bg-white'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
                Active ({activeEmployees.length})
              </button>
              <button
                onClick={() => { setActiveTab('inactive'); setSelected(new Set()); setPage(1); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 border-l border-gray-200 transition-colors ${
                  activeTab === 'inactive' ? 'bg-[#0a1628] text-white' : 'text-gray-500 hover:text-gray-700 bg-white'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#dc2626]" />
                Inactive ({inactiveEmployees.length})
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2">
            <div className="relative w-44">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder={`Search ${filtered.length} employees…`}
                className="pl-8 h-8 text-xs rounded-md border-gray-200"
              />
            </div>
            <button onClick={refresh} disabled={isRefreshing}
              className="h-8 w-8 flex items-center justify-center border border-gray-200 rounded-md text-gray-400 hover:text-gray-600 bg-white transition-colors">
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Bulk action bar */}
        {selected.size > 0 && (
          <div className="pt-2">
            <BulkActionBar
              count={selected.size}
              onDeactivate={() => { if (confirm(`Deactivate ${selected.size} employee(s)?`)) selected.forEach((id) => handleDeactivate(id)); }}
              onClear={() => setSelected(new Set())}
            />
          </div>
        )}

        {/* Table or empty state */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Users className="h-6 w-6 text-gray-300" />
            </div>
            {employees.length === 0 && activeTab === 'active' ? (
              <>
                <p className="text-sm font-medium text-gray-900 mb-1">No employees yet</p>
                <p className="text-xs text-gray-400 mb-4 text-center max-w-xs">Add your team members to track their HIPAA training compliance.</p>
                <Button size="sm" onClick={onAddOpen} className="h-9 rounded-md bg-[#0a1628] text-white text-sm">
                  <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Add Employee
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-500">No employees match your current filters.</p>
                <button className="text-xs text-[#0d9488] underline mt-2"
                  onClick={() => { setFilterRole('all'); setFilterStatus('all'); setSearch(''); }}>
                  Clear filters
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/40">
                  <th className="px-4 py-2.5 w-10">
                    <input type="checkbox" checked={selectAll} onChange={() => {
                      setSelected((prev) => {
                        const s = new Set(prev);
                        if (selectAll) paginated.forEach((e) => s.delete(e.id));
                        else paginated.forEach((e) => s.add(e.id));
                        return s;
                      });
                    }} className="rounded border-gray-300 w-4 h-4 cursor-pointer" />
                  </th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400 cursor-pointer select-none" onClick={() => toggleSort('name')}>
                    Name <SortIcon col="name" />
                  </th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400 cursor-pointer select-none" onClick={() => toggleSort('role_group')}>
                    Group(s) <SortIcon col="role_group" />
                  </th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400 cursor-pointer select-none" onClick={() => toggleSort('compliance_pct')}>
                    Conformance <SortIcon col="compliance_pct" />
                  </th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Tasks</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Monitoring</th>
                  <th className="px-4 py-2.5 w-20" />
                </tr>
              </thead>
              <tbody>
                {paginated.map((emp) => (
                  <EmployeeRow
                    key={emp.id}
                    emp={emp}
                    isActive={activeTab === 'active'}
                    selected={selected.has(emp.id)}
                    onSelect={(id, checked) => setSelected((prev) => { const s = new Set(prev); checked ? s.add(id) : s.delete(id); return s; })}
                    onDeactivate={handleDeactivate}
                    onReactivate={handleReactivate}
                    onComplete={handleComplete}
                    onAssign={(e) => { setAssignTarget(e); setAssignOpen(true); }}
                    isLocked={isLocked}
                  />
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Rows per page</span>
                  <Select value={String(perPage)} onValueChange={(v) => { setPerPage(Number(v)); setPage(1); }}>
                    <SelectTrigger className="h-7 text-xs rounded border-gray-200 w-16"><SelectValue /></SelectTrigger>
                    <SelectContent>{[10, 25, 50].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500 mr-2">
                    {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
                  </span>
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                    className="h-7 w-7 flex items-center justify-center rounded border border-gray-200 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed">
                    <ChevronDown className="h-3.5 w-3.5 rotate-90" />
                  </button>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="h-7 w-7 flex items-center justify-center rounded border border-gray-200 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed">
                    <ChevronDown className="h-3.5 w-3.5 -rotate-90" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Assign modal */}
      <AssignModal
        open={assignOpen}
        onClose={() => { setAssignOpen(false); setAssignTarget(null); }}
        employees={assignTarget ? [assignTarget] : activeEmployees}
        modules={modules}
        onSuccess={refresh}
      />
    </div>
  );
}
