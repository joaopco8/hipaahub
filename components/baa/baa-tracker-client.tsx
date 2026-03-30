'use client';

import { useState, useTransition } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Building2, Plus, Edit, Trash2, Upload, FileText, AlertTriangle,
  CheckCircle2, Clock, AlertCircle, RefreshCw, Filter, Download,
} from 'lucide-react';
import { UpgradeModal } from '@/components/ui/upgrade-modal';
import { format } from 'date-fns';
import {
  createVendor, updateVendor, deleteVendor, upsertBAA,
  type VendorWithBAA, type BAAStatus, type BAAStats,
} from '@/app/actions/baa-tracker';
import { toast } from 'sonner';

interface Props {
  initialVendors: VendorWithBAA[];
  initialStats: BAAStats;
  isLocked?: boolean;
}

// ─── Status helpers ──────────────────────────────────────────

const STATUS_CONFIG: Record<BAAStatus, { label: string; cls: string; icon: React.ReactNode }> = {
  active:        { label: 'Active',         cls: 'bg-green-50  text-green-600  border-green-200',  icon: <CheckCircle2 className="h-3 w-3" /> },
  expiring_soon: { label: 'Expiring Soon',  cls: 'bg-amber-50  text-amber-600  border-amber-200',  icon: <Clock       className="h-3 w-3" /> },
  expired:       { label: 'Expired',        cls: 'bg-red-50    text-red-600    border-red-200',     icon: <AlertCircle className="h-3 w-3" /> },
  not_signed:    { label: 'Not Signed',     cls: 'bg-gray-50   text-gray-500   border-gray-200',   icon: <AlertCircle className="h-3 w-3" /> },
};

function StatusBadge({ status }: { status: BAAStatus }) {
  const s = STATUS_CONFIG[status];
  return (
    <Badge className={`${s.cls} rounded-none text-xs font-light border flex items-center gap-1 w-fit`}>
      {s.icon}{s.label}
    </Badge>
  );
}

// ─── Vendor Form Modal ───────────────────────────────────────

function VendorFormModal({
  open,
  onClose,
  onSuccess,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initial?: VendorWithBAA | null;
}) {
  const [pending, startTransition] = useTransition();
  const isEdit = !!initial;
  const [form, setForm] = useState({
    vendor_name: initial?.vendor_name ?? '',
    service_type: initial?.service_type ?? '',
    contact_name: initial?.contact_name ?? '',
    contact_email: initial?.contact_email ?? '',
    contact_phone: initial?.contact_phone ?? '',
    notes: initial?.notes ?? '',
    start_date: initial?.start_date ?? '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        if (isEdit) {
          await updateVendor(initial!.id, form);
          toast.success('Vendor updated');
        } else {
          await createVendor(form);
          toast.success('Vendor added');
        }
        onSuccess();
        onClose();
      } catch (err: any) {
        toast.error(err.message ?? 'Error saving vendor');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-white border-gray-200 rounded-none max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#0e274e] font-light">{isEdit ? 'Edit Vendor' : 'Add Vendor'}</DialogTitle>
          <DialogDescription className="text-sm text-gray-500 font-light">
            {isEdit ? 'Update vendor information.' : 'Add a new vendor and track their BAA.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-[#0e274e] font-light">Vendor Name *</Label>
              <Input value={form.vendor_name} onChange={(e) => setForm({ ...form, vendor_name: e.target.value })} required className="rounded-none" placeholder="e.g. Epic Systems" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-[#0e274e] font-light">Service Type *</Label>
              <Input value={form.service_type} onChange={(e) => setForm({ ...form, service_type: e.target.value })} required className="rounded-none" placeholder="e.g. EHR, Cloud Storage" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-[#0e274e] font-light">Contact Name</Label>
              <Input value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} className="rounded-none" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-[#0e274e] font-light">Contact Email</Label>
              <Input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} className="rounded-none" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-[#0e274e] font-light">Contact Phone</Label>
              <Input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} className="rounded-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-[#0e274e] font-light">Relationship Start Date</Label>
              <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="rounded-none" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-[#0e274e] font-light">Notes</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="rounded-none font-light" placeholder="Contract terms, special considerations..." />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-none">Cancel</Button>
            <Button type="submit" disabled={pending} className="bg-[#00bceb] text-white hover:bg-[#00a8d4] rounded-none">
              {pending ? 'Saving…' : (isEdit ? 'Update' : 'Add Vendor')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── BAA Upload Modal ────────────────────────────────────────

function BAAModal({
  open,
  onClose,
  vendor,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  vendor: VendorWithBAA;
  onSuccess: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const existingBaa = vendor.baa;
  const [form, setForm] = useState({
    signed_date: existingBaa?.signed_date ?? '',
    expiration_date: existingBaa?.expiration_date ?? '',
    no_expiration: existingBaa?.no_expiration ?? false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await upsertBAA({
          vendor_id: vendor.id,
          signed_date: form.signed_date || undefined,
          expiration_date: form.no_expiration ? undefined : (form.expiration_date || undefined),
          no_expiration: form.no_expiration,
        });
        toast.success('BAA information saved');
        onSuccess();
        onClose();
      } catch (err: any) {
        toast.error(err.message ?? 'Error saving BAA');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white border-gray-200 rounded-none">
        <DialogHeader>
          <DialogTitle className="text-[#0e274e] font-light">
            {existingBaa ? 'Update BAA' : 'Record BAA'} — {vendor.vendor_name}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 font-light">
            Record signed date and expiration for this BAA.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label className="text-xs text-[#0e274e] font-light">Signed Date</Label>
            <Input
              type="date"
              value={form.signed_date}
              onChange={(e) => setForm({ ...form, signed_date: e.target.value })}
              className="rounded-none"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-[#0e274e] font-light">Expiration Date</Label>
            <Input
              type="date"
              value={form.expiration_date}
              onChange={(e) => setForm({ ...form, expiration_date: e.target.value })}
              disabled={form.no_expiration}
              className="rounded-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="no_expiration"
              checked={form.no_expiration}
              onChange={(e) => setForm({ ...form, no_expiration: e.target.checked, expiration_date: '' })}
              className="w-4 h-4 text-[#00bceb] border-gray-300"
            />
            <Label htmlFor="no_expiration" className="text-xs text-[#0e274e] font-light cursor-pointer">
              This BAA has no expiration date
            </Label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-none">Cancel</Button>
            <Button type="submit" disabled={pending} className="bg-[#00bceb] text-white hover:bg-[#00a8d4] rounded-none">
              {pending ? 'Saving…' : 'Save BAA'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ──────────────────────────────────────────

export default function BAATrackerClient({ initialVendors, initialStats, isLocked = false }: Props) {
  const [vendors, setVendors] = useState(initialVendors);
  const [stats, setStats] = useState(initialStats);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [vendorModalOpen, setVendorModalOpen] = useState(false);
  const [editVendor, setEditVendor] = useState<VendorWithBAA | null>(null);
  const [baaVendor, setBaaVendor] = useState<VendorWithBAA | null>(null);
  const [, startTransition] = useTransition();

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/baa/overview', { cache: 'no-store' });
      if (res.ok) {
        const d = await res.json();
        setVendors(d.vendors ?? vendors);
        setStats(d.stats ?? stats);
      }
    } catch {
      // silent
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDelete = (vendor: VendorWithBAA) => {
    if (!confirm(`Delete ${vendor.vendor_name}? This cannot be undone.`)) return;
    startTransition(async () => {
      try {
        await deleteVendor(vendor.id);
        toast.success('Vendor deleted');
        await refresh();
      } catch (err: any) {
        toast.error(err.message);
      }
    });
  };

  const handleDownloadReport = async () => {
    if (isLocked) { setShowUpgradeModal(true); return; }
    const res = await fetch('/api/baa/audit-report');
    if (!res.ok) { toast.error('Failed to generate report'); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'baa-audit-report.pdf'; a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = filterStatus === 'all'
    ? vendors
    : vendors.filter((v) => v.computed_status === filterStatus);

  const exposureList = vendors.filter((v) =>
    v.computed_status === 'not_signed' || v.computed_status === 'expired'
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">BAA Tracker</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleDownloadReport} className="rounded-none text-xs font-light h-8">
            <FileText className="mr-1.5 h-3.5 w-3.5" />
            BAA Audit Report
          </Button>
          <Button
            size="sm"
            onClick={() => { if (isLocked) { setShowUpgradeModal(true); return; } setEditVendor(null); setVendorModalOpen(true); }}
            className="bg-[#00bceb] text-white hover:bg-[#00a8d4] rounded-none text-xs h-8"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Vendor
          </Button>
          <Button size="sm" variant="ghost" onClick={refresh} disabled={isRefreshing} className="h-8 w-8 p-0 rounded-none text-gray-400">
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Vendors', value: stats.total_vendors, cls: 'text-[#0e274e]' },
          { label: 'Active',        value: stats.active,         cls: 'text-green-600' },
          { label: 'Expiring Soon', value: stats.expiring_soon,  cls: 'text-amber-600' },
          { label: 'Expired / None', value: stats.expired + stats.not_signed, cls: 'text-red-600' },
        ].map((s) => (
          <Card key={s.label} className="border-0 shadow-sm rounded-none">
            <CardContent className="p-5">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{s.label}</p>
              <p className={`text-3xl font-light ${s.cls}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Exposure List */}
      {exposureList.length > 0 && (
        <Card className="border-0 shadow-sm rounded-none border-l-4 border-l-red-500">
          <CardHeader className="py-3 px-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <CardTitle className="text-sm font-medium text-[#0e274e]">
                Vendors Without a Signed BAA ({exposureList.length})
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-gray-400 font-light mt-1">
              These vendors require immediate attention — uploading PHI to them without a BAA is a HIPAA violation.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <tbody>
                {exposureList.map((v) => (
                  <tr key={v.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-[#0e274e]">{v.vendor_name}</p>
                      <p className="text-xs text-gray-400">{v.service_type}</p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={v.computed_status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setBaaVendor(v)}
                        className="rounded-none text-xs h-7 border-[#00bceb] text-[#00bceb] hover:bg-[#00bceb]/5"
                      >
                        <Upload className="mr-1 h-3 w-3" />
                        {v.computed_status === 'expired' ? 'Renew BAA' : 'Record BAA'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-gray-400" />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-44 rounded-none h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="not_signed">Not Signed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Vendor Table */}
      <Card className="border-0 shadow-sm rounded-none">
        <CardHeader className="border-b border-gray-100 py-3">
          <CardTitle className="text-base font-light text-[#0e274e]">
            Vendors <span className="text-gray-400 text-sm font-light ml-1">({filtered.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-10 w-10 text-gray-200 mb-3" />
              <p className="text-sm text-gray-400 font-light">
                {vendors.length === 0 ? 'No vendors yet — add your first vendor above.' : 'No vendors match the filter.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left p-4 text-xs font-medium text-gray-500">Vendor</th>
                    <th className="text-left p-4 text-xs font-medium text-gray-500">BAA Status</th>
                    <th className="text-left p-4 text-xs font-medium text-gray-500">Expiration</th>
                    <th className="text-left p-4 text-xs font-medium text-gray-500">Days Left</th>
                    <th className="text-right p-4 text-xs font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((v) => (
                    <tr key={v.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4">
                        <p className="text-sm font-medium text-[#0e274e]">{v.vendor_name}</p>
                        <p className="text-xs text-gray-400">{v.service_type}</p>
                        {v.contact_name && <p className="text-xs text-gray-400">{v.contact_name}</p>}
                      </td>
                      <td className="p-4">
                        <StatusBadge status={v.computed_status} />
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {v.baa?.no_expiration
                          ? <span className="text-xs text-gray-400">No expiration</span>
                          : v.baa?.expiration_date
                          ? format(new Date(v.baa.expiration_date), 'MMM d, yyyy')
                          : <span className="text-xs text-gray-400">—</span>
                        }
                      </td>
                      <td className="p-4">
                        {v.days_until_expiration !== null && (
                          <span className={`text-sm font-light ${
                            v.days_until_expiration < 0 ? 'text-red-600' :
                            v.days_until_expiration <= 30 ? 'text-amber-600' :
                            'text-gray-600'
                          }`}>
                            {v.days_until_expiration < 0
                              ? `${Math.abs(v.days_until_expiration)}d overdue`
                              : `${v.days_until_expiration}d`}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 rounded-none text-xs font-light border-[#00bceb]/50 text-[#00bceb]"
                            onClick={() => setBaaVendor(v)}
                          >
                            <Upload className="mr-1 h-3 w-3" />
                            {v.baa ? 'Update BAA' : 'Record BAA'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 rounded-none text-gray-400 hover:text-[#0e274e]"
                            onClick={() => { setEditVendor(v); setVendorModalOpen(true); }}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 rounded-none text-gray-400 hover:text-red-600"
                            onClick={() => handleDelete(v)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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

      {/* Modals */}
      <VendorFormModal
        open={vendorModalOpen}
        onClose={() => { setVendorModalOpen(false); setEditVendor(null); }}
        onSuccess={refresh}
        initial={editVendor}
      />
      {baaVendor && (
        <BAAModal
          open={!!baaVendor}
          onClose={() => setBaaVendor(null)}
          vendor={baaVendor}
          onSuccess={refresh}
        />
      )}
      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureName="BAA Audit Report"
      />
    </div>
  );
}
