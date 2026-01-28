'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { AuditReadinessResult, getAuditReadinessDisplay } from '@/lib/audit-readiness';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface AuditReadinessCardProps {
  readiness: AuditReadinessResult;
}

export function AuditReadinessCard({ readiness }: AuditReadinessCardProps) {
  const display = getAuditReadinessDisplay(readiness.level);

  return (
    <Card className={`border-2 ${display.borderClass} ${display.bgClass}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Audit Readiness Status
            </CardTitle>
            <CardDescription className="mt-1.5">
              If an OCR audit happened tomorrow, would you pass?
            </CardDescription>
          </div>
          <Badge className={display.badgeClass}>
            {display.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Readiness Description */}
        <Alert className={`${display.bgClass} ${display.borderClass} border-2`}>
          <AlertDescription className={display.textClass}>
            {display.description}
          </AlertDescription>
        </Alert>

        {/* Compliance Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-zinc-700">Compliance Score</span>
            <span className={`text-2xl font-bold ${display.textClass}`}>
              {readiness.score}%
            </span>
          </div>
          <div className="w-full bg-zinc-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all ${
                display.color === 'green' ? 'bg-green-500' : 
                display.color === 'yellow' ? 'bg-yellow-500' : 
                'bg-red-500'
              }`}
              style={{ width: `${readiness.score}%` }}
            />
          </div>
        </div>

        {/* Top 3 Risks That Would Fail Audit */}
        {readiness.topRisks.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm text-zinc-900 mb-3 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600" />
              Top {readiness.topRisks.length} Items That Would Fail an OCR Audit Today
            </h4>
            <div className="space-y-3">
              {readiness.topRisks.map((risk, idx) => (
                <div 
                  key={risk.id}
                  className="p-4 bg-white rounded-lg border-2 border-red-200"
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      risk.impact === 'critical' ? 'bg-red-100 text-red-700' :
                      risk.impact === 'high' ? 'bg-orange-100 text-orange-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      <span className="text-xs font-bold">{idx + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-semibold text-sm text-zinc-900 mb-1">
                        {risk.title}
                      </h5>
                      <p className="text-xs text-zinc-600 mb-2">
                        {risk.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {risk.hipaa_citation}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${
                          risk.impact === 'critical' ? 'border-red-300 bg-red-50 text-red-700' :
                          risk.impact === 'high' ? 'border-orange-300 bg-orange-50 text-orange-700' :
                          'border-yellow-300 bg-yellow-50 text-yellow-700'
                        }`}>
                          {risk.impact.toUpperCase()} RISK
                        </Badge>
                      </div>
                      <div className="text-xs bg-blue-50 border border-blue-200 rounded p-2 mb-2">
                        <span className="font-semibold text-blue-900">OCR Perspective:</span>
                        <p className="text-blue-700 mt-1">{risk.ocr_perspective}</p>
                      </div>
                      <div className="text-xs bg-green-50 border border-green-200 rounded p-2">
                        <span className="font-semibold text-green-900">Fix:</span>
                        <p className="text-green-700 mt-1">{risk.remediation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Strengths */}
        {readiness.strengths.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm text-zinc-900 mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Your Strengths
            </h4>
            <ul className="space-y-1">
              {readiness.strengths.map((strength, idx) => (
                <li key={idx} className="text-sm text-zinc-700 flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Critical Gaps Summary */}
        {readiness.criticalGaps.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm text-zinc-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              Critical Gaps
            </h4>
            <ul className="space-y-1">
              {readiness.criticalGaps.map((gap, idx) => (
                <li key={idx} className="text-sm text-red-700 flex items-start gap-2">
                  <span className="mt-0.5">✗</span>
                  <span>{gap}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Next Steps */}
        <div className="pt-4 border-t border-zinc-200">
          <h4 className="font-semibold text-sm text-zinc-900 mb-3">
            Next Steps to Improve Readiness
          </h4>
          <div className="space-y-2">
            {readiness.nextSteps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm text-zinc-700">
                <ArrowRight className="w-4 h-4 text-zinc-500 mt-0.5 flex-shrink-0" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <Button asChild className="w-full">
          <Link href="/dashboard/action-items">
            View All Action Items
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
