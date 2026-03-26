import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, Monitor, Cloud, Laptop, Server, Wifi } from 'lucide-react';
import { AssetInventoryClient } from './asset-inventory-client';
import { getUserPlanTier, isPracticePlus } from '@/lib/plan-gating';
import { PlanGate } from '@/components/plan-gate';
import { AssetRiskPanel } from '@/components/assets/asset-risk-panel';

const RISK_COLORS: Record<string, string> = {
  low:      'bg-[#71bc48]/10 text-[#71bc48]',
  medium:   'bg-amber-50 text-amber-600',
  high:     'bg-red-50 text-red-600',
  critical: 'bg-red-100 text-red-700',
};

export default async function AssetInventoryPage() {
  const supabase = createClient();
  const user = await getUser(supabase);
  if (!user) return redirect('/signin');

  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!org) return redirect('/onboarding/expectation');

  const planTier = await getUserPlanTier();
  const hasPractice = isPracticePlus(planTier);

  const { data: assets } = await (supabase as any)
    .from('assets')
    .select('*')
    .eq('organization_id', org.id)
    .eq('asset_status', 'active')
    .order('risk_score', { ascending: false });

  const allAssets = assets || [];

  const criticalCount = allAssets.filter((a: any) => a.risk_level === 'critical').length;
  const highCount     = allAssets.filter((a: any) => a.risk_level === 'high').length;
  const avgScore      = allAssets.length > 0
    ? (allAssets.reduce((s: number, a: any) => s + a.risk_score, 0) / allAssets.length).toFixed(0)
    : 0;

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="mb-2">
        <h2 className="text-2xl font-light text-[#0e274e]">Asset Inventory</h2>
        <p className="text-sm text-gray-400 font-light">
          Track PHI-touching devices, systems, and cloud services
        </p>
      </div>

      {/* Stats */}
      {allAssets.length > 0 && (criticalCount > 0 || highCount > 0) && (
        <Card className="border-0 shadow-sm bg-white rounded-none border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
              <p className="text-sm text-[#0e274e]">
                {criticalCount > 0 && <><strong>{criticalCount}</strong> critical risk asset{criticalCount !== 1 ? 's' : ''} · </>}
                {highCount > 0 && <><strong>{highCount}</strong> high risk asset{highCount !== 1 ? 's' : ''}</>}
                {' '}— Review and remediate security gaps.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#565656] mb-1 font-light">Total Assets</p>
                <p className="text-3xl font-light text-[#0e274e]">{allAssets.length}</p>
              </div>
              <div className="h-10 w-10 rounded-full border-2 border-[#00bceb] flex items-center justify-center">
                <Shield className="h-5 w-5 text-[#00bceb]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#565656] mb-1 font-light">High / Critical Risk</p>
                <p className="text-3xl font-light text-[#0e274e]">{criticalCount + highCount}</p>
              </div>
              <div className="h-10 w-10 rounded-full border-2 border-red-400 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#565656] mb-1 font-light">Avg Risk Score</p>
                <p className="text-3xl font-light text-[#0e274e]">{avgScore}</p>
              </div>
              <div className="h-10 w-10 rounded-full border-2 border-amber-400 flex items-center justify-center">
                <Monitor className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AssetInventoryClient initialAssets={allAssets} organizationId={org.id} />

      {/* ── Practice Plan: Risk Identification Panel ── */}
      <PlanGate
        requiredPlan="practice"
        currentPlan={planTier}
        featureName="Asset-Based Risk Identification"
        features={[
          'PHI access level scoring (none / read / read_write / full)',
          'Real-time risk score calculator as you fill the form',
          'High-Risk Asset Panel with missing controls and inline recommendations',
          'Control checklist: encryption at rest/transit, access controls, MFA',
          'Responsible person + last review date tracking',
        ]}
      >
        <div>
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">
            Asset-Based Risk Identification
          </h3>
          <AssetRiskPanel assets={allAssets} organizationId={org.id} />
        </div>
      </PlanGate>
    </div>
  );
}
