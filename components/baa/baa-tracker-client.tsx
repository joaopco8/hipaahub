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
  ChevronDown, ChevronUp, Monitor, Video, CreditCard, CalendarDays,
  Mail, HardDrive, Mic, Users, Wrench, ExternalLink, Info, Zap,
} from 'lucide-react';
import { ActionGate } from '@/components/action-gate';
import { format } from 'date-fns';
import {
  createVendor, updateVendor, deleteVendor, upsertBAA,
  type VendorWithBAA, type BAAStatus, type BAAStats,
} from '@/app/actions/baa-tracker';
import { toast } from 'sonner';

// ── Category definitions ──────────────────────────────────────────────────────

interface VendorCategory {
  id: string;
  label: string;
  Icon: React.ElementType;
  common: string[];
  baaNote: string;
  warning: string;
}

const CATEGORIES: VendorCategory[] = [
  {
    id: 'ehr',
    label: 'EHR / Practice Management',
    Icon: Monitor,
    common: ['SimplePractice', 'TherapyNotes', 'Jane App', 'TheraNest', 'Valant'],
    baaNote: 'BAA available from all major vendors.',
    warning: 'Most practices have this one — verify yours is signed and on file.',
  },
  {
    id: 'telehealth',
    label: 'Telehealth Platform',
    Icon: Video,
    common: ['Zoom for Healthcare', 'Doxy.me', 'SimplePractice Video', 'Google Meet (Workspace)'],
    baaNote: 'BAA available — NOT on free/standard Zoom.',
    warning: 'Standard consumer Zoom does not offer a BAA. Use Zoom for Healthcare or a HIPAA-compliant alternative.',
  },
  {
    id: 'billing',
    label: 'Billing & Insurance',
    Icon: CreditCard,
    common: ['Luminare', 'Office Ally', 'AdvancedMD', 'PaySimple', 'Stripe (with BAA)'],
    baaNote: 'BAA available from most billing platforms.',
    warning: 'If your billing service sees patient names with diagnosis codes, they are a Business Associate.',
  },
  {
    id: 'scheduling',
    label: 'Scheduling & Appointments',
    Icon: CalendarDays,
    common: ['Acuity', 'Calendly (Business)', 'SimplePractice', 'Google Calendar (Workspace)'],
    baaNote: 'BAA available on business tiers.',
    warning: 'If appointment types reveal mental health treatment, a BAA is appropriate.',
  },
  {
    id: 'email',
    label: 'Email Provider',
    Icon: Mail,
    common: ['Google Workspace (Gmail)', 'Microsoft 365 (Outlook)', 'Zoho Mail'],
    baaNote: 'Google and Microsoft offer BAAs for business accounts at no extra cost.',
    warning: 'Personal Gmail does not offer a BAA. Google Workspace does — sign it at workspace.google.com/intl/en/terms/baa/',
  },
  {
    id: 'storage',
    label: 'Cloud Storage',
    Icon: HardDrive,
    common: ['Google Drive (Workspace)', 'Dropbox Business', 'Box', 'Microsoft OneDrive (365)'],
    baaNote: 'BAA available on business tiers.',
    warning: 'If you store patient documents, session notes, or intake forms here, a BAA is required.',
  },
  {
    id: 'esignature',
    label: 'E-Signature / Forms',
    Icon: FileText,
    common: ['DocuSign', 'HelloSign (Dropbox Sign)', 'Adobe Sign', 'JotForm (HIPAA)'],
    baaNote: 'BAA available on HIPAA-eligible plans.',
    warning: 'Required for intake forms, consent forms, or any document containing patient information.',
  },
  {
    id: 'transcription',
    label: 'Transcription / AI Notes',
    Icon: Mic,
    common: ['Freed AI', 'AutoNote', 'Otter.ai (Business)', 'Whisper-based tools'],
    baaNote: 'BAA availability varies — check each vendor individually.',
    warning: 'If your session notes are transcribed by any AI tool, that tool needs a BAA.',
  },
  {
    id: 'payroll',
    label: 'Payroll / HR',
    Icon: Users,
    common: ['Gusto', 'ADP', 'Rippling', 'Paychex'],
    baaNote: 'BAA required if they handle employee health data.',
    warning: 'Required if your payroll/HR system handles health-related employee data.',
  },
  {
    id: 'it',
    label: 'IT / Managed Services',
    Icon: Wrench,
    common: ['Any IT support company with system access'],
    baaNote: 'Should be negotiated directly with your IT provider.',
    warning: 'If your IT provider has access to systems that store patient data, they need a BAA.',
  },
];

const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

const QUICK_ADD: Array<{ name: string; category: string; baaUrl: string }> = [
  { name: 'Google Workspace',    category: 'email',      baaUrl: 'https://workspace.google.com/intl/en/terms/baa/' },
  { name: 'Microsoft 365',       category: 'email',      baaUrl: 'https://www.microsoft.com/en-us/licensing/product-licensing/products' },
  { name: 'Zoom for Healthcare', category: 'telehealth', baaUrl: 'https://explore.zoom.us/en/healthcare/' },
  { name: 'SimplePractice',      category: 'ehr',        baaUrl: 'https://www.simplepractice.com/hipaa/' },
  { name: 'Dropbox Business',    category: 'storage',    baaUrl: 'https://www.dropbox.com/business/trust/compliance/hipaa' },
  { name: 'DocuSign',            category: 'esignature', baaUrl: 'https://www.docusign.com/trust/compliance/hipaa' },
];

// ── Status helpers ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<BAAStatus, { label: string; cls: string; icon: React.ReactNode }> = {
  active:        { label: 'Active',        cls: 'bg-green-50 text-green-600 border-green-200',   icon: <CheckCircle2 className="h-3 w-3" /> },
  expiring_soon: { label: 'Expiring Soon', cls: 'bg-amber-50 text-amber-600 border-amber-200',   icon: <Clock        className="h-3 w-3" /> },
  expired:       { label: 'Expired',       cls: 'bg-red-50   text-red-600   border-red-200',      icon: <AlertCircle  className="h-3 w-3" /> },
  not_signed:    { label: 'Not Signed',    cls: 'bg-gray-50  text-gray-500  border-gray-200',    icon: <AlertCircle  className="h-3 w-3" /> },
};

function StatusBadge({ status }: { status: BAAStatus }) {
  const s = STATUS_CONFIG[status];
  return (
    <Badge className={`${s.cls} rounded-none text-xs font-light border flex items-center gap-1 w-fit`}>
      {s.icon}{s.label}
    </Badge>
  );
}

// ── Vendor Form Modal ─────────────────────────────────────────────────────────

interface VendorFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initial?: VendorWithBAA | null;
  initialCategory?: string;
  initialName?: string;
  initialBaaUrl?: string;
}

function VendorFormModal({
  open, onClose, onSuccess, initial,
  initialCategory = '', initialName = '', initialBaaUrl = '',
}: VendorFormProps) {
  const [pending, startTransition] = useTransition();
  const isEdit = !!initial;

  const [form, setForm] = useState({
    vendor_name:   initial?.vendor_name   ?? initialName     ?? '',
    category:      initial?.category      ?? initialCategory ?? '',
    service_type:  initial?.service_type  ?? '',
    baa_url:       initial?.baa_url       ?? initialBaaUrl   ?? '',
    contact_name:  initial?.contact_name  ?? '',
    contact_email: initial?.contact_email ?? '',
    contact_phone: initial?.contact_phone ?? '',
    notes:         initial?.notes         ?? '',
    start_date:    initial?.start_date    ?? '',
  });

  const handleCategoryChange = (val: string) => {
    const cat = CATEGORY_MAP[val];
    setForm((f) => ({
      ...f,
      category: val,
      // auto-fill service_type from category label only if still empty
      service_type: f.service_type || (cat?.label ?? ''),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const serviceType =
          form.service_type ||
          (form.category ? (CATEGORY_MAP[form.category]?.label ?? '') : '') ||
          'General';

        const payload = {
          vendor_name:   form.vendor_name,
          service_type:  serviceType,
          category:      form.category   || undefined,
          baa_url:       form.baa_url    || undefined,
          contact_name:  form.contact_name  || undefined,
          contact_email: form.contact_email || undefined,
          contact_phone: form.contact_phone || undefined,
          notes:         form.notes         || undefined,
          start_date:    form.start_date    || undefined,
        };

        if (isEdit) {
          await updateVendor(initial!.id, payload);
          toast.success('Vendor updated');
        } else {
          await createVendor(payload);
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
          <DialogTitle className="text-[#0e274e] font-light">
            {isEdit ? 'Edit Vendor' : 'Add Vendor'}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 font-light">
            {isEdit ? 'Update vendor information.' : 'Add a vendor to track their BAA status.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Name + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-[#0e274e] font-light">Vendor Name *</Label>
              <Input
                value={form.vendor_name}
                onChange={(e) => setForm({ ...form, vendor_name: e.target.value })}
                required
                className="rounded-none"
                placeholder="e.g. Google Workspace"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-[#0e274e] font-light">Category</Label>
              <Select value={form.category} onValueChange={handleCategoryChange}>
                <SelectTrigger className="rounded-none text-sm h-10">
                  <SelectValue placeholder="Select category…" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Service desc + BAA URL */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-[#0e274e] font-light">Service Description</Label>
              <Input
                value={form.service_type}
                onChange={(e) => setForm({ ...form, service_type: e.target.value })}
                className="rounded-none"
                placeholder="e.g. Cloud-based EHR"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-[#0e274e] font-light">BAA Page URL</Label>
              <div className="flex gap-1">
                <Input
                  value={form.baa_url}
                  onChange={(e) => setForm({ ...form, baa_url: e.target.value })}
                  className="rounded-none text-xs"
                  placeholder="https://vendor.com/baa"
                />
                {form.baa_url && (
                  <a
                    href={form.baa_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-2 border border-gray-200 text-[#00bceb] hover:bg-[#00bceb]/5"
                    title="Open BAA page"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Category warning hint */}
          {form.category && CATEGORY_MAP[form.category] && (
            <div className="bg-amber-50 border border-amber-100 px-3 py-2 text-xs text-amber-700">
              {CATEGORY_MAP[form.category].warning}
            </div>
          )}

          {/* Contact row */}
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
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="rounded-none font-light"
              placeholder="Contract terms, special considerations…"
            />
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

// ── BAA Modal ─────────────────────────────────────────────────────────────────

function BAAModal({
  open, onClose, vendor, onSuccess,
}: {
  open: boolean; onClose: () => void; vendor: VendorWithBAA; onSuccess: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const existingBaa = vendor.baa;
  const [form, setForm] = useState({
    signed_date:     existingBaa?.signed_date     ?? '',
    expiration_date: existingBaa?.expiration_date ?? '',
    no_expiration:   existingBaa?.no_expiration   ?? false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await upsertBAA({
          vendor_id:       vendor.id,
          signed_date:     form.signed_date     || undefined,
          expiration_date: form.no_expiration ? undefined : (form.expiration_date || undefined),
          no_expiration:   form.no_expiration,
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
            Record the signed date and expiration for this BAA.
          </DialogDescription>
        </DialogHeader>

        {/* Link to BAA page if available */}
        {vendor.baa_url && (
          <a
            href={vendor.baa_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-[#00bceb] hover:underline -mt-2 mb-1"
          >
            <ExternalLink className="h-3 w-3" />
            Get / sign BAA from {vendor.vendor_name}
          </a>
        )}

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

// ── Explainer Banner ──────────────────────────────────────────────────────────

function ExplainerBanner({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }) {
  return (
    <div className="border border-blue-100 bg-blue-50">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-blue-100/60 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-[#0175a2] flex-shrink-0" />
          <span className="text-sm font-medium text-[#0175a2]">
            What is a BAA and why does every vendor need one?
          </span>
        </div>
        {expanded
          ? <ChevronUp className="h-4 w-4 text-[#0175a2] flex-shrink-0" />
          : <ChevronDown className="h-4 w-4 text-[#0175a2] flex-shrink-0" />}
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-4 text-sm text-gray-700">
          <p>
            A <strong>Business Associate Agreement (BAA)</strong> is a legally required
            contract under HIPAA. Any vendor that creates, receives, maintains, or
            transmits patient data (PHI) on your behalf must sign one before you share
            any patient information with them.
          </p>

          <div>
            <p className="font-medium text-[#0e274e] mb-2">A proper BAA must specify:</p>
            <ul className="space-y-1 text-gray-600">
              {[
                'What the vendor is allowed to do with your patient data',
                'How they protect it (encryption, access controls, etc.)',
                'What happens if they experience a breach — they must notify you within a specific timeframe',
                'That they will return or destroy your data if you stop using their service',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-[#0175a2] mt-0.5 flex-shrink-0">·</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-amber-50 border border-amber-200 px-4 py-3">
            <p className="text-amber-800 text-sm">
              <strong>The most common mistake:</strong> Practices have a BAA with their
              EHR and assume that covers everything. It doesn&apos;t. Every other vendor
              touching patient data needs its own BAA.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Category Mapper ───────────────────────────────────────────────────────────

function CategoryMapper({
  vendors,
  onAddForCategory,
}: {
  vendors: VendorWithBAA[];
  onAddForCategory: (categoryId: string) => void;
}) {
  const vendorsByCategory: Record<string, VendorWithBAA[]> = {};
  for (const v of vendors) {
    if (v.category) {
      if (!vendorsByCategory[v.category]) vendorsByCategory[v.category] = [];
      vendorsByCategory[v.category].push(v);
    }
  }

  return (
    <div>
      <div className="flex items-baseline gap-3 mb-4">
        <h3 className="text-sm font-medium text-[#0e274e]">Which of these do you use?</h3>
        <span className="text-xs text-gray-400">Map your vendors to common HIPAA categories to identify gaps</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {CATEGORIES.map((cat) => {
          const catVendors = vendorsByCategory[cat.id] ?? [];
          const hasVendors = catVendors.length > 0;
          const { Icon } = cat;

          return (
            <div
              key={cat.id}
              className={`border bg-white p-4 ${hasVendors ? 'border-gray-200' : 'border-gray-100'}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-50 border border-gray-100 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-[#0175a2]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#0e274e] mb-0.5">{cat.label}</p>
                  <p className="text-[11px] text-gray-400 mb-2">
                    Common: {cat.common.slice(0, 3).join(', ')}{cat.common.length > 3 ? ', …' : ''}
                  </p>

                  {hasVendors ? (
                    <div className="space-y-1.5">
                      {catVendors.map((v) => (
                        <div key={v.id} className="flex items-center gap-2 flex-wrap">
                          <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                          <span className="text-xs text-[#0e274e]">{v.vendor_name}</span>
                          <StatusBadge status={v.computed_status} />
                        </div>
                      ))}
                      <button
                        onClick={() => onAddForCategory(cat.id)}
                        className="text-[11px] text-[#00bceb] hover:underline mt-0.5"
                      >
                        + Add another
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 italic">Not in your tracker</span>
                      <button
                        onClick={() => onAddForCategory(cat.id)}
                        className="flex items-center gap-1 text-xs text-[#00bceb] hover:underline"
                      >
                        <Plus className="h-3 w-3" />
                        Add vendor
                      </button>
                    </div>
                  )}

                  <p className="text-[11px] text-amber-600 mt-2.5 pt-2 border-t border-gray-100">
                    {cat.warning}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Quick Add Section ─────────────────────────────────────────────────────────

function QuickAddSection({
  onQuickAdd,
}: {
  onQuickAdd: (name: string, category: string, baaUrl: string) => void;
}) {
  return (
    <div className="border border-gray-100 bg-gray-50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="h-4 w-4 text-[#0175a2]" />
        <p className="text-sm font-medium text-[#0e274e]">Quick Add Common Vendors</p>
        <span className="text-xs text-gray-400">These vendors offer standard HIPAA BAAs</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {QUICK_ADD.map((q) => (
          <button
            key={q.name}
            onClick={() => onQuickAdd(q.name, q.category, q.baaUrl)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 bg-white text-[#0e274e] hover:border-[#00bceb] hover:text-[#00bceb] transition-colors"
          >
            <Plus className="h-3 w-3" />
            {q.name}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface Props {
  initialVendors: VendorWithBAA[];
  initialStats: BAAStats;
  isLocked?: boolean;
}

export default function BAATrackerClient({ initialVendors, initialStats, isLocked = false }: Props) {
  const [vendors, setVendors]             = useState(initialVendors);
  const [stats, setStats]                 = useState(initialStats);
  const [filterStatus, setFilterStatus]   = useState<string>('all');
  const [isRefreshing, setIsRefreshing]   = useState(false);
  const [vendorModalOpen, setVendorModalOpen] = useState(false);
  const [editVendor, setEditVendor]       = useState<VendorWithBAA | null>(null);
  const [baaVendor, setBaaVendor]         = useState<VendorWithBAA | null>(null);
  const [prefillCategory, setPrefillCategory] = useState('');
  const [prefillName, setPrefillName]     = useState('');
  const [prefillBaaUrl, setPrefillBaaUrl] = useState('');
  const [explainerExpanded, setExplainerExpanded] = useState(initialVendors.length === 0);
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
    const res = await fetch('/api/baa/audit-report');
    if (!res.ok) { toast.error('Failed to generate report'); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'baa-audit-report.pdf'; a.click();
    URL.revokeObjectURL(url);
  };

  const openAddVendor = () => {
    setEditVendor(null);
    setPrefillCategory('');
    setPrefillName('');
    setPrefillBaaUrl('');
    setVendorModalOpen(true);
  };

  const openAddForCategory = (categoryId: string) => {
    setEditVendor(null);
    setPrefillCategory(categoryId);
    setPrefillName('');
    setPrefillBaaUrl('');
    setVendorModalOpen(true);
  };

  const openQuickAdd = (name: string, category: string, baaUrl: string) => {
    setEditVendor(null);
    setPrefillCategory(category);
    setPrefillName(name);
    setPrefillBaaUrl(baaUrl);
    setVendorModalOpen(true);
  };

  const filtered = filterStatus === 'all'
    ? vendors
    : vendors.filter((v) => v.computed_status === filterStatus);

  const exposureList = vendors.filter(
    (v) => v.computed_status === 'not_signed' || v.computed_status === 'expired'
  );

  // Form key forces remount (resets useState) when opening for different vendor/prefill
  const formKey = editVendor
    ? `edit-${editVendor.id}`
    : `add-${prefillCategory}-${prefillName}`;

  return (
    <div className="flex flex-col gap-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div /> {/* spacer */}
        <div className="flex items-center gap-2">
          <ActionGate isLocked={isLocked} documentType="BAA Audit Report">
            <Button size="sm" variant="outline" onClick={handleDownloadReport} className="rounded-none text-xs font-light h-8">
              <FileText className="mr-1.5 h-3.5 w-3.5" />
              BAA Audit Report
            </Button>
          </ActionGate>
          <ActionGate isLocked={isLocked} documentType="vendor">
            <Button
              size="sm"
              onClick={openAddVendor}
              className="bg-[#00bceb] text-white hover:bg-[#00a8d4] rounded-none text-xs h-8"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add Vendor
            </Button>
          </ActionGate>
          <Button size="sm" variant="ghost" onClick={refresh} disabled={isRefreshing} className="h-8 w-8 p-0 rounded-none text-gray-400">
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Vendors',   value: stats.total_vendors,               cls: 'text-[#0e274e]' },
          { label: 'Active',          value: stats.active,                       cls: 'text-green-600' },
          { label: 'Expiring Soon',   value: stats.expiring_soon,               cls: 'text-amber-600' },
          { label: 'Expired / None',  value: stats.expired + stats.not_signed,  cls: 'text-red-600'   },
        ].map((s) => (
          <Card key={s.label} className="border-0 shadow-sm rounded-none">
            <CardContent className="p-5">
              <p className="text-xs text-gray-400 mb-1">{s.label}</p>
              <p className={`text-3xl font-light ${s.cls}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── BAA Explainer ── */}
      <ExplainerBanner
        expanded={explainerExpanded}
        onToggle={() => setExplainerExpanded((v) => !v)}
      />

      {/* ── Category Mapper ── */}
      <CategoryMapper vendors={vendors} onAddForCategory={openAddForCategory} />

      {/* ── Quick Add ── */}
      <QuickAddSection onQuickAdd={openQuickAdd} />

      {/* ── Exposure Warning ── */}
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
              Sharing PHI with these vendors without a BAA is a HIPAA violation.
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
                    <td className="px-4 py-3"><StatusBadge status={v.computed_status} /></td>
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

      {/* ── Filter + Vendor Table ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
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
        </div>

        <Card className="border-0 shadow-sm rounded-none">
          <CardHeader className="border-b border-gray-100 py-3">
            <CardTitle className="text-base font-light text-[#0e274e]">
              Vendors{' '}
              <span className="text-gray-400 text-sm font-light ml-1">({filtered.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Building2 className="h-10 w-10 text-gray-200 mb-3" />
                <p className="text-sm text-gray-400 font-light">
                  {vendors.length === 0
                    ? 'No vendors yet — use the category mapper or Quick Add above.'
                    : 'No vendors match this filter.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left p-4 text-xs font-medium text-gray-500">Vendor</th>
                      <th className="text-left p-4 text-xs font-medium text-gray-500">Category</th>
                      <th className="text-left p-4 text-xs font-medium text-gray-500">BAA Status</th>
                      <th className="text-left p-4 text-xs font-medium text-gray-500">Expiration</th>
                      <th className="text-left p-4 text-xs font-medium text-gray-500">Days Left</th>
                      <th className="text-right p-4 text-xs font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((v) => {
                      const catLabel = v.category ? (CATEGORY_MAP[v.category]?.label ?? v.category) : v.service_type;
                      return (
                        <tr key={v.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-4">
                            <p className="text-sm font-medium text-[#0e274e]">{v.vendor_name}</p>
                            {v.contact_name && (
                              <p className="text-xs text-gray-400">{v.contact_name}</p>
                            )}
                          </td>
                          <td className="p-4">
                            <span className="text-xs text-gray-500">{catLabel}</span>
                          </td>
                          <td className="p-4"><StatusBadge status={v.computed_status} /></td>
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
                              {v.baa_url && (
                                <a
                                  href={v.baa_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Open BAA page"
                                  className="h-7 w-7 flex items-center justify-center border border-gray-100 text-gray-400 hover:text-[#00bceb] hover:border-[#00bceb]/50 transition-colors"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 rounded-none text-gray-400 hover:text-[#0e274e]"
                                onClick={() => { setEditVendor(v); setPrefillCategory(''); setPrefillName(''); setPrefillBaaUrl(''); setVendorModalOpen(true); }}
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
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Modals ── */}
      <VendorFormModal
        key={formKey}
        open={vendorModalOpen}
        onClose={() => { setVendorModalOpen(false); setEditVendor(null); }}
        onSuccess={refresh}
        initial={editVendor}
        initialCategory={prefillCategory}
        initialName={prefillName}
        initialBaaUrl={prefillBaaUrl}
      />

      {baaVendor && (
        <BAAModal
          open={!!baaVendor}
          onClose={() => setBaaVendor(null)}
          vendor={baaVendor}
          onSuccess={refresh}
        />
      )}
    </div>
  );
}
