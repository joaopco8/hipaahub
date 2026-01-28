'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, XCircle, Info, Shield, FileCheck, Users } from 'lucide-react';
import { EvidenceFieldConfig } from '@/lib/evidence-fields-config';

interface EvidenceGuidanceCardProps {
  field: EvidenceFieldConfig;
}

export function EvidenceGuidanceCard({ field }: EvidenceGuidanceCardProps) {
  if (!field.ocr_guidance) return null;

  const { ocr_guidance } = field;

  // Badge styles based on evidence strength
  const getStrengthBadge = (strength: string) => {
    switch (strength) {
      case 'strong':
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <Shield className="w-3 h-3 mr-1" />
            System-Generated (Strong)
          </Badge>
        );
      case 'acceptable':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
            <FileCheck className="w-3 h-3 mr-1" />
            Screenshot/Document (Acceptable)
          </Badge>
        );
      case 'weak':
        return (
          <Badge className="bg-orange-100 text-orange-700 border-orange-200">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Attestation Only (Weak)
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="border-2 border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              OCR Audit Guidance
            </CardTitle>
            <CardDescription className="mt-1">
              What auditors expect to see for this evidence
            </CardDescription>
          </div>
          {getStrengthBadge(ocr_guidance.evidence_strength)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* What OCR Expects */}
        <div>
          <h4 className="font-semibold text-sm text-zinc-900 mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            What OCR Expects
          </h4>
          <p className="text-sm text-zinc-700 leading-relaxed">
            {ocr_guidance.what_ocr_expects}
          </p>
        </div>

        {/* Acceptable Examples */}
        <div>
          <h4 className="font-semibold text-sm text-zinc-900 mb-2 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-green-600" />
            Acceptable Evidence Examples
          </h4>
          <ul className="space-y-1.5">
            {ocr_guidance.acceptable_examples.map((example, idx) => (
              <li key={idx} className="text-sm text-zinc-700 flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>{example}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Common Mistakes */}
        <div>
          <h4 className="font-semibold text-sm text-zinc-900 mb-2 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-600" />
            Common Mistakes to Avoid
          </h4>
          <ul className="space-y-1.5">
            {ocr_guidance.common_mistakes.map((mistake, idx) => (
              <li key={idx} className="text-sm text-zinc-700 flex items-start gap-2">
                <span className="text-red-600 mt-0.5">✗</span>
                <span>{mistake}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Who Provides */}
        <div className="pt-2 border-t border-blue-200">
          <p className="text-sm text-zinc-600 flex items-center gap-2">
            <Users className="w-4 h-4 text-zinc-500" />
            <span className="font-medium">Who usually provides this:</span>
            <span className="text-zinc-900">{ocr_guidance.who_provides}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
