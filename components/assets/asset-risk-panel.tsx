'use client';

import { useState, useTransition } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertTriangle, ShieldCheck, CheckCircle2, XCircle,
  Edit, RefreshCw, Lock, Wifi, Database, Eye,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

export type PhiAccessLevel = 'none' | 'read' | 'read_write' | 'full';

export interface AssetRiskData {
  id: string;
  asset_name: string;
  asset_type: string;
  phi_access_level: PhiAccessLevel | null;
  encryption_at_rest: boolean | null;
  encryption_in_transit: boolean | null;
  access_controlled: boolean | null;
  mfa_enabled: boolean | null;
  responsible_person: string | null;
  last_reviewed_date: string | null;
  // existing fields
  has_phi_access: boolean;
  encryption_enabled: boolean | null;
  risk_score: number;
  risk_level: string;
}

interface Props {
  assets: AssetRiskData[];
  organizationId: string;
}

// ── Score calculation (client-side, mirrors DB function) ─────────────────────

function computePracticeRiskScore(
  phiLevel: PhiAccessLevel,
  encAtRest: boolean,
  encInTransit: boolean,
  accessControlled: boolean,
  mfa: boolean
): number {
  const base = { none: 0, read: 25, read_write: 50, full: 75 }[phiLevel] ?? 25;
  const deductions = [encAtRest, encInTransit, accessControlled, mfa].filter(Boolean).length * 10;
  return Math.max(0, base - deductions);
}

function riskTier(score: number): { label: string; cls: string } {
  if (score <= 20) return { label: 'Low Risk',    cls: 'bg-green-50 text-green-700 border-green-200' };
  if (score <= 45) return { label: 'Medium Risk', cls: 'bg-amber-50 text-amber-700 border-amber-200' };
  return              { label: 'High Risk',    cls: 'bg-red-50   text-red-700   border-red-200'   };
}

const MISSING_CONTROL_RECS: Record<string, { label: string; rec: string; icon: React.ReactNode }> = {
  encryption_at_rest:  { label: 'No Encryption at Rest',    rec: 'Enable AES-256 disk encryption (FileVault, BitLocker, or cloud-native)',   icon: <Database className="h-3.5 w-3.5" /> },
  encryption_in_transit: { label: 'No Encryption in Transit', rec: 'Enforce TLS 1.2+ for all data in transit; disable unencrypted protocols', icon: <Wifi className="h-3.5 w-3.5" /> },
  access_controlled:   { label: 'No Access Controls',       rec: 'Implement RBAC; restrict PHI access to minimum necessary staff',             icon: <Lock className="h-3.5 w-3.5" /> },
  mfa_enabled:         { label: 'No MFA',                   rec: 'Require multi-factor authentication on all accounts that access PHI',        icon: <ShieldCheck className="h-3.5 w-3.5" /> },
};

// ── Edit Risk Controls Modal ─────────────────────────────────────────────────

function EditRiskModal({
  asset, open, onClose, onSaved,
}: {
  asset: AssetRiskData;
  open: boolean;
  onClose: () => void;
  onSaved: (updated: AssetRiskData) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    phi_access_level: (asset.phi_access_level ?? 'read') as PhiAccessLevel,
    encryption_at_rest: asset.encryption_at_rest ?? false,
    encryption_in_transit: asset.encryption_in_transit ?? false,
    access_controlled: asset.access_controlled ?? false,
    mfa_enabled: asset.mfa_enabled ?? false,
    responsible_person: asset.responsible_person ?? '',
    last_reviewed_date: asset.last_reviewed_date ?? '',
  });

  // Live score
  const liveScore = computePracticeRiskScore(
    form.phi_access_level,
    form.encryption_at_rest,
    form.encryption_in_transit,
    form.access_controlled,
    form.mfa_enabled
  );
  const liveTier = riskTier(liveScore);

  const toggle = (field: keyof typeof form) =>
    setForm((f) => ({ ...f, [field]: !f[field] }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const supabase = createClient();
        const { error } = await (supabase as any)
          .from('assets')
          .update({
            phi_access_level: form.phi_access_level,
            encryption_at_rest: form.encryption_at_rest,
            encryption_in_transit: form.encryption_in_transit,
            access_controlled: form.access_controlled,
            mfa_enabled: form.mfa_enabled,
            responsible_person: form.responsible_person || null,
            last_reviewed_date: form.last_reviewed_date || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', asset.id);
        if (error) throw new Error(error.message);
        onSaved({ ...asset, ...form });
        toast.success('Asset risk controls updated');
        onClose();
      } catch (err: any) {
        toast.error(err.message ?? 'Failed to save');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-white border-gray-200 rounded-none">
        <DialogHeader>
          <DialogTitle className="text-[#0e274e] font-light">{asset.asset_name} — Risk Controls</DialogTitle>
          <DialogDescription className="text-sm text-gray-500 font-light">
            Update PHI access level and security controls. Score updates in real time.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Live Score */}
          <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100">
            <div>
              <p className="text-xs text-gray-400 font-light">Live Risk Score</p>
              <p className="text-3xl font-light" style={{ color: liveScore > 45 ? '#dc2626' : liveScore > 20 ? '#d97706' : '#16a34a' }}>
                {liveScore}
              </p>
            </div>
            <Badge className={`${liveTier.cls} rounded-none text-xs border`}>{liveTier.label}</Badge>
          </div>

          {/* PHI Access Level */}
          <div className="space-y-1">
            <Label className="text-xs text-[#0e274e] font-light">PHI Access Level</Label>
            <Select value={form.phi_access_level} onValueChange={(v) => setForm({ ...form, phi_access_level: v as PhiAccessLevel })}>
              <SelectTrigger className="rounded-none"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (no PHI access) — +0 pts</SelectItem>
                <SelectItem value="read">Read only — +25 pts</SelectItem>
                <SelectItem value="read_write">Read / Write — +50 pts</SelectItem>
                <SelectItem value="full">Full access — +75 pts</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Security Controls */}
          <div className="space-y-1">
            <Label className="text-xs text-[#0e274e] font-light">Security Controls (each reduces score by 10)</Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {[
                { key: 'encryption_at_rest' as const, label: 'Encryption at Rest' },
                { key: 'encryption_in_transit' as const, label: 'Encryption in Transit' },
                { key: 'access_controlled' as const, label: 'Access Controlled' },
                { key: 'mfa_enabled' as const, label: 'MFA Enabled' },
              ].map(({ key, label }) => (
                <label
                  key={key}
                  className={`flex items-center gap-2 p-2.5 border cursor-pointer transition-colors ${
                    form[key] ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form[key] as boolean}
                    onChange={() => toggle(key)}
                    className="w-4 h-4 text-green-600"
                  />
                  <span className="text-sm font-light text-[#0e274e]">{label}</span>
                  {form[key] && <CheckCircle2 className="h-3.5 w-3.5 text-green-500 ml-auto" />}
                </label>
              ))}
            </div>
          </div>

          {/* Responsible Person + Last Reviewed */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-[#0e274e] font-light">Responsible Person</Label>
              <Input
                value={form.responsible_person}
                onChange={(e) => setForm({ ...form, responsible_person: e.target.value })}
                placeholder="Name or role"
                className="rounded-none"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-[#0e274e] font-light">Last Reviewed</Label>
              <Input
                type="date"
                value={form.last_reviewed_date}
                onChange={(e) => setForm({ ...form, last_reviewed_date: e.target.value })}
                className="rounded-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-none">Cancel</Button>
            <Button type="submit" disabled={pending} className="bg-[#00bceb] text-white hover:bg-[#00a8d4] rounded-none">
              {pending ? 'Saving…' : 'Save Controls'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Panel ────────────────────────────────────────────────────────────────

export function AssetRiskPanel({ assets: initialAssets, organizationId }: Props) {
  const [assets, setAssets] = useState(initialAssets);
  const [editAsset, setEditAsset] = useState<AssetRiskData | null>(null);

  const handleSaved = (updated: AssetRiskData) => {
    setAssets((prev) => prev.map((a) => a.id === updated.id ? updated : a));
  };

  // Compute practice scores for all assets
  const assetsWithScore = assets.map((a) => {
    const phiLevel = a.phi_access_level ?? (a.has_phi_access ? 'read' : 'none');
    const score = computePracticeRiskScore(
      phiLevel as PhiAccessLevel,
      a.encryption_at_rest ?? a.encryption_enabled ?? false,
      a.encryption_in_transit ?? false,
      a.access_controlled ?? false,
      a.mfa_enabled ?? false,
    );
    const missingControls: string[] = [];
    if (!(a.encryption_at_rest ?? a.encryption_enabled)) missingControls.push('encryption_at_rest');
    if (!a.encryption_in_transit) missingControls.push('encryption_in_transit');
    if (!a.access_controlled) missingControls.push('access_controlled');
    if (!a.mfa_enabled) missingControls.push('mfa_enabled');
    return { ...a, practiceScore: score, missingControls };
  });

  const highRisk = assetsWithScore.filter((a) => a.practiceScore > 45);
  const allCompliant = highRisk.length === 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-0 shadow-sm rounded-none">
          <CardContent className="p-4">
            <p className="text-xs text-gray-400 font-light mb-1">High Risk</p>
            <p className="text-2xl font-light text-red-600">{highRisk.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm rounded-none">
          <CardContent className="p-4">
            <p className="text-xs text-gray-400 font-light mb-1">Medium Risk</p>
            <p className="text-2xl font-light text-amber-600">
              {assetsWithScore.filter((a) => a.practiceScore > 20 && a.practiceScore <= 45).length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm rounded-none">
          <CardContent className="p-4">
            <p className="text-xs text-gray-400 font-light mb-1">Low Risk</p>
            <p className="text-2xl font-light text-green-600">
              {assetsWithScore.filter((a) => a.practiceScore <= 20).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* High-Risk Asset Panel */}
      {highRisk.length > 0 ? (
        <Card className="border-0 shadow-sm rounded-none border-l-4 border-l-red-500">
          <CardHeader className="py-3 px-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <CardTitle className="text-sm font-medium text-[#0e274e]">
                High-Risk Assets ({highRisk.length}) — Controls Required
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-gray-400 font-light mt-1">
              Each asset below has missing security controls that expose PHI. Click Edit to remediate.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {highRisk.map((a) => (
              <div key={a.id} className="border-t border-gray-100 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-[#0e274e]">{a.asset_name}</p>
                    <p className="text-xs text-gray-400">{a.asset_type.replace('_', ' ')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-light text-red-600">{a.practiceScore} pts</span>
                    <Badge className="bg-red-50 text-red-700 border-red-200 rounded-none text-xs border">High Risk</Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditAsset(a)}
                      className="rounded-none h-7 text-xs border-[#00bceb]/50 text-[#00bceb]"
                    >
                      <Edit className="h-3 w-3 mr-1" />Edit Controls
                    </Button>
                  </div>
                </div>
                {a.missingControls.length > 0 && (
                  <div className="space-y-1.5">
                    {a.missingControls.map((ctrl) => {
                      const c = MISSING_CONTROL_RECS[ctrl];
                      return (
                        <div key={ctrl} className="flex items-start gap-2 bg-red-50/50 p-2">
                          <XCircle className="h-3.5 w-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-medium text-red-700">{c.label}</p>
                            <p className="text-xs text-gray-500 font-light">{c.rec}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm rounded-none border-l-4 border-l-green-500">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <p className="text-sm text-green-700 font-light">
              All assets are Low or Medium risk — no immediate action required.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Full Asset Risk Table */}
      <Card className="border-0 shadow-sm rounded-none">
        <CardHeader className="border-b border-gray-100 py-3">
          <CardTitle className="text-base font-light text-[#0e274e]">
            Risk Score by Asset
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left p-3 text-xs font-medium text-gray-500">Asset</th>
                <th className="text-left p-3 text-xs font-medium text-gray-500">PHI Access</th>
                <th className="text-left p-3 text-xs font-medium text-gray-500">Risk Score</th>
                <th className="text-left p-3 text-xs font-medium text-gray-500">Controls</th>
                <th className="text-right p-3" />
              </tr>
            </thead>
            <tbody>
              {assetsWithScore.map((a) => {
                const tier = riskTier(a.practiceScore);
                const phiLabel = { none: 'None', read: 'Read', read_write: 'Read/Write', full: 'Full' };
                return (
                  <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3">
                      <p className="text-sm font-light text-[#0e274e]">{a.asset_name}</p>
                      <p className="text-xs text-gray-400 capitalize">{a.asset_type.replace('_', ' ')}</p>
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {phiLabel[(a.phi_access_level ?? 'read') as PhiAccessLevel] ?? 'Read'}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-light ${
                          a.practiceScore > 45 ? 'text-red-600' :
                          a.practiceScore > 20 ? 'text-amber-600' : 'text-green-600'
                        }`}>{a.practiceScore}</span>
                        <Badge className={`${tier.cls} rounded-none text-xs border`}>{tier.label}</Badge>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        {[
                          { key: 'encryption_at_rest', ok: a.encryption_at_rest ?? a.encryption_enabled, title: 'Enc. at rest' },
                          { key: 'encryption_in_transit', ok: a.encryption_in_transit, title: 'Enc. in transit' },
                          { key: 'access_controlled', ok: a.access_controlled, title: 'Access ctrl' },
                          { key: 'mfa_enabled', ok: a.mfa_enabled, title: 'MFA' },
                        ].map((ctrl) => (
                          <span
                            key={ctrl.key}
                            title={ctrl.title}
                            className={`w-5 h-5 rounded-full flex items-center justify-center ${
                              ctrl.ok ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
                            }`}
                          >
                            {ctrl.ok ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditAsset(a)}
                        className="h-7 rounded-none text-gray-400 hover:text-[#0e274e]"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {assetsWithScore.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-sm text-gray-400 font-light">
                    No assets registered. Add assets using the Asset Inventory above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {editAsset && (
        <EditRiskModal
          asset={editAsset}
          open={!!editAsset}
          onClose={() => setEditAsset(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
