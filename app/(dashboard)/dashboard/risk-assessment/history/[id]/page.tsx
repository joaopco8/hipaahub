import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle, AlertCircle, Info, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import type { GapReport, GapItem, RiskLevel } from '@/lib/gap-report';

// ── Helpers ──────────────────────────────────────────────────────────────────

const riskColorMap: Record<string, string> = {
  low:    'bg-[#71bc48]/10 text-[#71bc48]',
  medium: 'bg-amber-50 text-amber-600',
  high:   'bg-red-50 text-red-600',
};
const riskLabelMap: Record<string, string> = {
  low: 'Protected', medium: 'Partial', high: 'At Risk',
};

const RISK_LEVEL_ICON = {
  high:   <AlertTriangle className="h-3.5 w-3.5 text-red-500" />,
  medium: <AlertCircle className="h-3.5 w-3.5 text-amber-500" />,
  low:    <Info className="h-3.5 w-3.5 text-[#71bc48]" />,
};

const CATEGORY_LABELS: Record<string, string> = {
  administrative: 'Administrative Safeguards',
  physical:       'Physical Safeguards',
  technical:      'Technical Safeguards',
};

// ── Gap Items List ────────────────────────────────────────────────────────────

function GapItemRow({ item }: { item: GapItem }) {
  return (
    <div className="border-b border-gray-50 last:border-0 px-5 py-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">{RISK_LEVEL_ICON[item.risk_level]}</div>
        <div className="flex-1 min-w-0">
          {/* Question text */}
          <p className="text-sm text-[#0e274e] font-light leading-snug">{item.question_text}</p>

          {/* Current answer vs required */}
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="bg-red-50 rounded-none px-3 py-2">
              <p className="text-[10px] text-red-400 font-medium mb-0.5">Current Answer</p>
              <p className="text-xs text-red-700 font-light">{item.current_answer}</p>
            </div>
            <div className="bg-[#71bc48]/5 rounded-none px-3 py-2">
              <p className="text-[10px] text-[#71bc48] font-medium mb-0.5">Required Standard</p>
              <p className="text-xs text-[#3a6b24] font-light">{item.required_standard}</p>
            </div>
          </div>

          {/* Recommendation */}
          <div className="mt-2 bg-[#f3f5f9] px-3 py-2">
            <p className="text-[10px] text-[#565656] font-medium mb-0.5">Recommendation</p>
            <p className="text-xs text-[#565656] font-light">{item.recommendation}</p>
          </div>

          {/* HIPAA citation */}
          <p className="text-[10px] text-gray-400 mt-1.5">{item.hipaa_citation}</p>
        </div>

        {/* Risk level badge */}
        <Badge className={`${riskColorMap[item.risk_level]} border-0 rounded-none text-xs shrink-0`}>
          {item.risk_level.charAt(0).toUpperCase() + item.risk_level.slice(1)} Risk
        </Badge>
      </div>
    </div>
  );
}

function CategorySection({ title, items }: { title: string; items: GapItem[] }) {
  if (items.length === 0) return null;
  return (
    <section>
      <h3 className="text-sm font-normal text-[#0e274e] mb-3 flex items-center gap-2">
        <ShieldAlert className="h-4 w-4 text-[#00bceb]" />
        {title}
        <span className="text-xs text-gray-400 font-light">({items.length} gap{items.length !== 1 ? 's' : ''})</span>
      </h3>
      <Card className="border-0 shadow-sm bg-white rounded-none">
        <CardContent className="p-0">
          {items.map((item) => (
            <GapItemRow key={item.question_id} item={item} />
          ))}
        </CardContent>
      </Card>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AssessmentGapReportPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const user = await getUser(supabase);
  if (!user) return redirect('/signin');

  const { data: record, error } = await (supabase as any)
    .from('risk_assessment_history')
    .select('id, risk_level, risk_percentage, total_risk_score, assessed_at, gap_report, notes')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (error || !record) return redirect('/dashboard/risk-assessment/history');

  const gapReport = record.gap_report as GapReport | null;
  const hasGapReport = gapReport && gapReport.total_gaps !== undefined;

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Back */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/risk-assessment/history">
          <Button variant="ghost" size="sm" className="rounded-none text-gray-500">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to History
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-2">
        <h2 className="text-2xl font-light text-[#0e274e]">Gap Report</h2>
        <p className="text-sm text-gray-400 font-light mt-1">
          Assessment completed on{' '}
          {new Date(record.assessed_at).toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
          })}
        </p>
      </div>

      {/* Score summary */}
      <Card className="border-0 shadow-sm bg-white rounded-none">
        <CardContent className="p-5">
          <div className="flex items-center gap-6 flex-wrap">
            <div>
              <p className="text-xs text-gray-400 font-light mb-1">Risk Score</p>
              <p className="text-3xl font-light text-[#0e274e]">{Number(record.risk_percentage).toFixed(1)}%</p>
            </div>
            <Badge className={`${riskColorMap[record.risk_level] || 'bg-gray-100 text-gray-500'} border-0 rounded-none text-sm px-3 py-1`}>
              {riskLabelMap[record.risk_level] || record.risk_level}
            </Badge>
            {hasGapReport && (
              <>
                <div className="text-center">
                  <p className="text-xs text-gray-400 font-light mb-1">Total Gaps</p>
                  <p className="text-xl font-light text-[#0e274e]">{gapReport.total_gaps}</p>
                </div>
                <div className="flex gap-3">
                  {gapReport.high_count > 0 && (
                    <Badge className="bg-red-50 text-red-600 border-0 rounded-none text-xs">
                      {gapReport.high_count} High
                    </Badge>
                  )}
                  {gapReport.medium_count > 0 && (
                    <Badge className="bg-amber-50 text-amber-600 border-0 rounded-none text-xs">
                      {gapReport.medium_count} Medium
                    </Badge>
                  )}
                  {gapReport.low_count > 0 && (
                    <Badge className="bg-[#71bc48]/10 text-[#71bc48] border-0 rounded-none text-xs">
                      {gapReport.low_count} Low
                    </Badge>
                  )}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Gap report body */}
      {!hasGapReport ? (
        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-gray-400">
              Detailed gap report is not available for this assessment.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Gap reports are generated for assessments completed after this feature was enabled.
            </p>
          </CardContent>
        </Card>
      ) : gapReport.total_gaps === 0 ? (
        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-[#71bc48] font-light">No gaps identified — full compliance achieved.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          <CategorySection
            title={CATEGORY_LABELS.administrative}
            items={gapReport.administrative}
          />
          <CategorySection
            title={CATEGORY_LABELS.physical}
            items={gapReport.physical}
          />
          <CategorySection
            title={CATEGORY_LABELS.technical}
            items={gapReport.technical}
          />
        </div>
      )}
    </div>
  );
}
