'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Plus, Monitor, Cloud, Laptop, Server, Wifi, Edit, Trash2,
  AlertTriangle, CheckCircle2, Shield, Package
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ActionGate } from '@/components/action-gate';
import { useSubscription } from '@/contexts/subscription-context';

interface Asset {
  id: string;
  asset_name: string;
  asset_type: string;
  description: string | null;
  vendor_name: string | null;
  model_or_version: string | null;
  location: string | null;
  assigned_to: string | null;
  has_phi_access: boolean;
  encryption_enabled: boolean | null;
  mfa_enabled: boolean | null;
  auto_update_enabled: boolean | null;
  antivirus_installed: boolean | null;
  is_managed: boolean;
  risk_score: number;
  risk_level: string;
  risk_notes: string | null;
  asset_status: string;
}

const RISK_COLORS: Record<string, string> = {
  low:      'bg-[#71bc48]/10 text-[#71bc48]',
  medium:   'bg-amber-50 text-amber-600',
  high:     'bg-red-50 text-red-600',
  critical: 'bg-red-100 text-red-700',
};

const TYPE_ICONS: Record<string, any> = {
  device:        Laptop,
  system:        Server,
  application:   Monitor,
  cloud_service: Cloud,
  network:       Wifi,
  other:         Package,
};

const TYPE_LABELS: Record<string, string> = {
  device:        'Device',
  system:        'System',
  application:   'Application',
  cloud_service: 'Cloud Service',
  network:       'Network',
  other:         'Other',
};

const defaultForm = {
  asset_name: '',
  asset_type: 'device',
  description: '',
  vendor_name: '',
  model_or_version: '',
  location: '',
  assigned_to: '',
  has_phi_access: true,
  encryption_enabled: false,
  mfa_enabled: false,
  auto_update_enabled: false,
  antivirus_installed: false,
  is_managed: true,
  risk_notes: '',
};

interface Props {
  initialAssets: Asset[];
  organizationId: string;
}

export function AssetInventoryClient({ initialAssets, organizationId }: Props) {
  const router = useRouter();
  const { isLocked } = useSubscription();
  const [assets, setAssets] = useState(initialAssets);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Asset | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [filter, setFilter] = useState('all');

  function openNew() {
    setEditing(null);
    setForm(defaultForm);
    setIsOpen(true);
  }

  function openEdit(asset: Asset) {
    setEditing(asset);
    setForm({
      asset_name: asset.asset_name,
      asset_type: asset.asset_type,
      description: asset.description || '',
      vendor_name: asset.vendor_name || '',
      model_or_version: asset.model_or_version || '',
      location: asset.location || '',
      assigned_to: asset.assigned_to || '',
      has_phi_access: asset.has_phi_access,
      encryption_enabled: asset.encryption_enabled ?? false,
      mfa_enabled: asset.mfa_enabled ?? false,
      auto_update_enabled: asset.auto_update_enabled ?? false,
      antivirus_installed: asset.antivirus_installed ?? false,
      is_managed: asset.is_managed,
      risk_notes: asset.risk_notes || '',
    });
    setIsOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      ...form,
      organization_id: organizationId,
      created_by: user.id,
    };

    if (editing) {
      const { data, error } = await (supabase as any)
        .from('assets')
        .update(payload)
        .eq('id', editing.id)
        .select()
        .single();
      if (!error && data) {
        setAssets(assets.map(a => a.id === editing.id ? data : a));
      }
    } else {
      const { data, error } = await (supabase as any)
        .from('assets')
        .insert(payload)
        .select()
        .single();
      if (!error && data) {
        setAssets([data, ...assets]);
      }
    }

    setIsOpen(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this asset?')) return;
    const supabase = createClient();
    await (supabase as any).from('assets').update({ asset_status: 'retired' }).eq('id', id);
    setAssets(assets.filter(a => a.id !== id));
  }

  const filtered = filter === 'all'
    ? assets
    : assets.filter(a =>
        filter === 'high_risk' ? ['high', 'critical'].includes(a.risk_level)
        : a.asset_type === filter
      );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {['all', 'high_risk', 'device', 'system', 'application', 'cloud_service'].map(f => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className={`rounded-none text-xs ${filter === f ? 'bg-[#0e274e] text-white' : 'border-gray-200 text-[#565656]'}`}
            >
              {f === 'all' ? 'All' :
               f === 'high_risk' ? '⚠ High Risk' :
               TYPE_LABELS[f] || f}
            </Button>
          ))}
        </div>

        <ActionGate isLocked={isLocked} documentType="asset record">
          <Button
            onClick={openNew}
            className="bg-[#00bceb] text-white hover:bg-[#00a0c9] rounded-none"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Asset
          </Button>
        </ActionGate>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-none">
            <DialogHeader>
              <DialogTitle className="font-light text-[#0e274e] text-xl">
                {editing ? 'Edit Asset' : 'Register New Asset'}
              </DialogTitle>
              <DialogDescription className="text-[#565656] font-light text-sm">
                Track PHI-touching devices, systems, and services
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-light">Asset Name *</Label>
                  <Input
                    value={form.asset_name}
                    onChange={e => setForm({ ...form, asset_name: e.target.value })}
                    required
                    className="rounded-none"
                    placeholder="e.g., Dr. Smith's MacBook Pro"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-light">Asset Type *</Label>
                  <Select value={form.asset_type} onValueChange={v => setForm({ ...form, asset_type: v })}>
                    <SelectTrigger className="rounded-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TYPE_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-light">Vendor / Manufacturer</Label>
                  <Input
                    value={form.vendor_name}
                    onChange={e => setForm({ ...form, vendor_name: e.target.value })}
                    className="rounded-none"
                    placeholder="e.g., Apple, Microsoft, AWS"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-light">Model / Version</Label>
                  <Input
                    value={form.model_or_version}
                    onChange={e => setForm({ ...form, model_or_version: e.target.value })}
                    className="rounded-none"
                    placeholder="e.g., MacBook Pro 2022"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-light">Location</Label>
                  <Input
                    value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                    className="rounded-none"
                    placeholder="e.g., Office Room 2"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-light">Assigned To</Label>
                  <Input
                    value={form.assigned_to}
                    onChange={e => setForm({ ...form, assigned_to: e.target.value })}
                    className="rounded-none"
                    placeholder="Staff member name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-light">Description</Label>
                <Textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="rounded-none"
                  placeholder="Brief description of what this asset does..."
                />
              </div>

              {/* Security Posture */}
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-medium text-[#0e274e] mb-3">Security Posture (affects risk score)</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'has_phi_access', label: 'Has access to PHI' },
                    { key: 'encryption_enabled', label: 'Encryption enabled' },
                    { key: 'mfa_enabled', label: 'MFA / 2FA enabled' },
                    { key: 'auto_update_enabled', label: 'Auto-updates enabled' },
                    { key: 'antivirus_installed', label: 'Antivirus installed' },
                    { key: 'is_managed', label: 'Organization-managed (not BYOD)' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={key}
                        checked={(form as any)[key] || false}
                        onChange={e => setForm({ ...form, [key]: e.target.checked })}
                        className="h-4 w-4"
                      />
                      <Label htmlFor={key} className="text-sm font-light cursor-pointer">{label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-light">Risk Notes</Label>
                <Textarea
                  value={form.risk_notes}
                  onChange={e => setForm({ ...form, risk_notes: e.target.value })}
                  rows={2}
                  className="rounded-none"
                  placeholder="Any known risks or remediation notes..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="rounded-none">
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#00bceb] text-white hover:bg-[#00a0c9] rounded-none">
                  {editing ? 'Update Asset' : 'Register Asset'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Assets List */}
      {filtered.length === 0 ? (
        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-12 w-12 text-gray-200 mb-4" />
            <p className="text-sm text-gray-400 mb-2">
              {filter === 'all' ? 'No assets registered yet.' : 'No assets matching this filter.'}
            </p>
            {filter === 'all' && (
              <p className="text-xs text-gray-400">Register your first PHI-touching asset to start tracking.</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((asset) => {
            const Icon = TYPE_ICONS[asset.asset_type] || Package;
            const gaps = [];
            if (!asset.encryption_enabled) gaps.push('No encryption');
            if (!asset.mfa_enabled) gaps.push('No MFA');
            if (!asset.auto_update_enabled) gaps.push('Auto-updates off');
            if (!asset.is_managed) gaps.push('BYOD device');

            return (
              <Card key={asset.id} className="border-0 shadow-sm bg-white rounded-none">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-[#f3f5f9] rounded-none shrink-0">
                        <Icon className="h-5 w-5 text-[#565656]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-normal text-[#0e274e] text-base">{asset.asset_name}</h3>
                          <Badge className="bg-[#f3f5f9] text-[#565656] border-0 rounded-none text-xs font-light">
                            {TYPE_LABELS[asset.asset_type]}
                          </Badge>
                          <Badge className={`${RISK_COLORS[asset.risk_level]} border-0 rounded-none text-xs font-normal`}>
                            {asset.risk_score} — {asset.risk_level.charAt(0).toUpperCase() + asset.risk_level.slice(1)} Risk
                          </Badge>
                          {asset.has_phi_access && (
                            <Badge className="bg-red-50 text-red-500 border-0 rounded-none text-xs">PHI Access</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-400 font-light">
                          {asset.vendor_name && <span>{asset.vendor_name}</span>}
                          {asset.location && <span>· {asset.location}</span>}
                          {asset.assigned_to && <span>· {asset.assigned_to}</span>}
                        </div>
                        {gaps.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {gaps.map(g => (
                              <span key={g} className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-none">
                                ⚠ {g}
                              </span>
                            ))}
                          </div>
                        )}
                        {asset.risk_notes && (
                          <p className="text-xs text-gray-400 mt-2 font-light">{asset.risk_notes}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(asset)}
                        className="h-8 rounded-none text-gray-400 hover:text-[#00bceb]"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(asset.id)}
                        className="h-8 rounded-none text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
