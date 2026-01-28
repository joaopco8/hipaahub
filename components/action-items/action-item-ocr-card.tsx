'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, FileText, Shield } from 'lucide-react';
import { ActionItemOCRContext } from '@/lib/action-items-ocr';

interface ActionItemOCRCardProps {
  ocrContext: ActionItemOCRContext;
}

export function ActionItemOCRCard({ ocrContext }: ActionItemOCRCardProps) {
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical':
        return {
          badge: 'bg-red-100 text-red-700 border-red-300',
          alert: 'border-red-200 bg-red-50',
          text: 'text-red-700'
        };
      case 'high':
        return {
          badge: 'bg-orange-100 text-orange-700 border-orange-300',
          alert: 'border-orange-200 bg-orange-50',
          text: 'text-orange-700'
        };
      default:
        return {
          badge: 'bg-yellow-100 text-yellow-700 border-yellow-300',
          alert: 'border-yellow-200 bg-yellow-50',
          text: 'text-yellow-700'
        };
    }
  };

  const colors = getImpactColor(ocrContext.audit_impact);

  return (
    <Card className="p-4 space-y-3">
      {/* Impact and Citation */}
      <div className="flex flex-wrap gap-2">
        <Badge className={colors.badge}>
          <AlertTriangle className="w-3 h-3 mr-1" />
          {ocrContext.audit_impact.toUpperCase()} AUDIT RISK
        </Badge>
        <Badge variant="outline" className="text-xs">
          <FileText className="w-3 h-3 mr-1" />
          {ocrContext.hipaa_citation}
        </Badge>
      </div>

      {/* OCR Risk */}
      <Alert className={`${colors.alert} border-2`}>
        <AlertTriangle className={`h-4 w-4 ${colors.text}`} />
        <AlertDescription className={`${colors.text} text-sm font-medium`}>
          <span className="font-semibold">OCR Audit Risk:</span>
          <p className="mt-1">{ocrContext.ocr_risk_if_ignored}</p>
        </AlertDescription>
      </Alert>

      {/* Evidence Required */}
      <div>
        <h5 className="text-xs font-semibold text-zinc-700 mb-2 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" />
          Evidence Required to Close This Item:
        </h5>
        <ul className="space-y-1">
          {ocrContext.evidence_required.map((evidence, idx) => (
            <li key={idx} className="text-xs text-zinc-600 flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>{evidence}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Real World Example */}
      {ocrContext.real_world_example && (
        <div className="pt-2 border-t border-zinc-200">
          <p className="text-xs text-zinc-600 italic">
            <span className="font-semibold not-italic">Real-world impact:</span> {ocrContext.real_world_example}
          </p>
        </div>
      )}
    </Card>
  );
}
