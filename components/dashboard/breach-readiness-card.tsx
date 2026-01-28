'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { BreachReadinessSnapshot, BreachReadinessItem, getBreachReadinessDisplay } from '@/lib/breach-readiness-snapshot';

interface BreachReadinessCardProps {
  snapshot: BreachReadinessSnapshot;
}

export function BreachReadinessCard({ snapshot }: BreachReadinessCardProps) {
  const display = getBreachReadinessDisplay(snapshot.overall_status);

  const getItemIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'partial':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case 'critical':
        return <Badge className="bg-red-100 text-red-700 border-red-300 text-xs">CRITICAL</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-700 border-orange-300 text-xs">HIGH</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 text-xs">MEDIUM</Badge>;
    }
  };

  return (
    <Card className={`border-2 ${
      display.color === 'green' ? 'border-green-200 bg-green-50/50' :
      display.color === 'yellow' ? 'border-yellow-200 bg-yellow-50/50' :
      'border-red-200 bg-red-50/50'
    }`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Breach Readiness Snapshot
            </CardTitle>
            <CardDescription className="mt-1.5">
              If a breach happened today, are you ready?
            </CardDescription>
          </div>
          <Badge className={`${
            display.color === 'green' ? 'bg-green-100 text-green-700 border-green-300' :
            display.color === 'yellow' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
            'bg-red-100 text-red-700 border-red-300'
          }`}>
            {display.icon} {display.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Alert */}
        <Alert className={`border-2 ${
          display.color === 'green' ? 'border-green-200 bg-green-50' :
          display.color === 'yellow' ? 'border-yellow-200 bg-yellow-50' :
          'border-red-200 bg-red-50'
        }`}>
          <AlertDescription className={
            display.color === 'green' ? 'text-green-700' :
            display.color === 'yellow' ? 'text-yellow-700' :
            'text-red-700'
          }>
            {display.description}
          </AlertDescription>
        </Alert>

        {/* Overall Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-zinc-700">Readiness Score</span>
            <span className={`text-2xl font-bold ${
              display.color === 'green' ? 'text-green-700' :
              display.color === 'yellow' ? 'text-yellow-700' :
              'text-red-700'
            }`}>
              {snapshot.overall_score}%
            </span>
          </div>
          <div className="w-full bg-zinc-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full ${
                display.color === 'green' ? 'bg-green-500' :
                display.color === 'yellow' ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${snapshot.overall_score}%` }}
            />
          </div>
        </div>

        {/* Checklist */}
        <div>
          <h4 className="font-semibold text-sm text-zinc-900 mb-3">Breach Response Checklist</h4>
          <div className="space-y-2">
            {snapshot.checklist_items.map(item => (
              <div key={item.id} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-zinc-200">
                <div className="mt-0.5">{getItemIcon(item.status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h5 className="font-medium text-sm text-zinc-900">{item.requirement}</h5>
                    {getImportanceBadge(item.importance)}
                  </div>
                  <p className="text-xs text-zinc-600 mb-2">{item.ocr_perspective}</p>
                  {item.evidence_required && item.status !== 'complete' && (
                    <div className="text-xs bg-blue-50 border border-blue-200 rounded p-2">
                      <span className="font-semibold text-blue-900">Needed:</span>
                      <span className="text-blue-700"> {item.evidence_required}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Gaps */}
        {snapshot.critical_gaps.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm text-red-900 mb-2 flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Critical Gaps
            </h4>
            <ul className="space-y-1">
              {snapshot.critical_gaps.map((gap, idx) => (
                <li key={idx} className="text-sm text-red-700 flex items-start gap-2">
                  <span className="mt-0.5">✗</span>
                  <span>{gap}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Strengths */}
        {snapshot.strengths.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm text-green-900 mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              In Place
            </h4>
            <ul className="space-y-1">
              {snapshot.strengths.slice(0, 5).map((strength, idx) => (
                <li key={idx} className="text-sm text-green-700 flex items-start gap-2">
                  <span className="mt-0.5">✓</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Next Actions */}
        <div className="pt-4 border-t border-zinc-200">
          <h4 className="font-semibold text-sm text-zinc-900 mb-3">Next Steps</h4>
          <div className="space-y-2">
            {snapshot.next_actions.map((action, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm text-zinc-700">
                <span className="text-blue-600 mt-0.5">→</span>
                <span>{action}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
