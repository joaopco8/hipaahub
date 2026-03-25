import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, History, TrendingUp, TrendingDown, Minus, FileText } from 'lucide-react';
import Link from 'next/link';

const riskColorMap: Record<string, string> = {
  low:    'bg-[#71bc48]/10 text-[#71bc48]',
  medium: 'bg-amber-50 text-amber-600',
  high:   'bg-red-50 text-red-600',
};
const riskLabelMap: Record<string, string> = {
  low: 'Protected', medium: 'Partial', high: 'At Risk',
};

export default async function RiskAssessmentHistoryPage() {
  const supabase = createClient();
  const user = await getUser(supabase);
  if (!user) return redirect('/signin');

  const { data: history } = await (supabase as any)
    .from('risk_assessment_history')
    .select('id, risk_level, risk_percentage, total_risk_score, assessed_at, notes')
    .eq('user_id', user.id)
    .order('assessed_at', { ascending: false })
    .limit(50);

  const items = history || [];

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/risk-assessment">
          <Button variant="ghost" size="sm" className="rounded-none text-gray-500">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Risk Assessment
          </Button>
        </Link>
      </div>

      <div className="mb-2">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-[#00bceb]" />
          <h2 className="text-2xl font-light text-[#0e274e]">Assessment History</h2>
        </div>
        <p className="text-sm text-gray-400 font-light mt-1">Track your compliance improvement over time</p>
      </div>

      {items.length === 0 ? (
        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <History className="h-12 w-12 text-gray-200 mb-4" />
            <p className="text-sm text-gray-400">No historical assessments recorded yet.</p>
            <p className="text-xs text-gray-400 mt-1">
              History is recorded each time you complete a risk assessment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-base font-light text-[#0e274e]">
              {items.length} Assessment{items.length !== 1 ? 's' : ''} on record
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {items.map((h: any, idx: number) => {
              const prev = items[idx + 1];
              const delta = prev ? Number(h.risk_percentage) - Number(prev.risk_percentage) : null;
              const improved = delta !== null && delta < 0;
              const worsened = delta !== null && delta > 0;

              return (
                <div key={h.id} className="flex items-center justify-between p-4 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <p className="text-xs text-gray-400 font-light">
                        {new Date(h.assessed_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </p>
                      <p className="text-xs text-gray-400 font-light">
                        {new Date(h.assessed_at).toLocaleDateString('en-US', { day: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-[#0e274e] font-light">
                        {new Date(h.assessed_at).toLocaleDateString('en-US', {
                          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                      {h.notes && (
                        <p className="text-xs text-gray-400 mt-0.5">{h.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {delta !== null && (
                      <div className={`flex items-center gap-1 text-xs ${improved ? 'text-[#71bc48]' : worsened ? 'text-red-500' : 'text-gray-400'}`}>
                        {improved ? <TrendingDown className="h-3.5 w-3.5" /> :
                         worsened ? <TrendingUp className="h-3.5 w-3.5" /> :
                         <Minus className="h-3.5 w-3.5" />}
                        {delta !== null ? `${Math.abs(delta).toFixed(1)}%` : ''}
                      </div>
                    )}
                    {idx === 0 && (
                      <Badge className="bg-[#0e274e]/5 text-[#0e274e] border-0 rounded-none text-xs">
                        Current
                      </Badge>
                    )}
                    <p className="text-lg font-light text-[#0e274e] min-w-[48px] text-right">
                      {Number(h.risk_percentage).toFixed(1)}%
                    </p>
                    <Badge className={`${riskColorMap[h.risk_level] || 'bg-gray-100 text-gray-500'} border-0 rounded-none text-xs`}>
                      {riskLabelMap[h.risk_level] || h.risk_level}
                    </Badge>
                    <Link href={`/dashboard/risk-assessment/history/${h.id}`}>
                      <Button variant="outline" size="sm" className="h-7 rounded-none border-gray-200 text-gray-600 hover:text-[#00bceb] text-xs px-2">
                        <FileText className="h-3 w-3 mr-1" />
                        Gap Report
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
