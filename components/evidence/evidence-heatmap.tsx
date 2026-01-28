'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { EVIDENCE_FIELDS, getEvidenceCategories } from '@/lib/evidence-fields-config';

interface EvidenceHeatmapProps {
  uploadedEvidence: string[]; // Array of evidence IDs that have been uploaded
}

export function EvidenceHeatmap({ uploadedEvidence }: EvidenceHeatmapProps) {
  const categories = getEvidenceCategories();

  // Calculate completion by category
  const categoryStats = categories.map(category => {
    const fieldsInCategory = EVIDENCE_FIELDS.filter(f => f.category === category);
    const requiredInCategory = fieldsInCategory.filter(f => f.required);
    const uploadedInCategory = fieldsInCategory.filter(f => uploadedEvidence.includes(f.id));
    const requiredUploadedInCategory = requiredInCategory.filter(f => uploadedEvidence.includes(f.id));

    const totalFields = fieldsInCategory.length;
    const completionRate = totalFields > 0 ? (uploadedInCategory.length / totalFields) * 100 : 0;
    const requiredCompletionRate = requiredInCategory.length > 0 
      ? (requiredUploadedInCategory.length / requiredInCategory.length) * 100 
      : 100;

    return {
      category,
      totalFields,
      requiredFields: requiredInCategory.length,
      uploaded: uploadedInCategory.length,
      requiredUploaded: requiredUploadedInCategory.length,
      completionRate,
      requiredCompletionRate
    };
  });

  // Determine color based on required completion
  const getColor = (requiredCompletionRate: number) => {
    if (requiredCompletionRate === 100) return 'green';
    if (requiredCompletionRate >= 75) return 'yellow';
    return 'red';
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green':
        return {
          bg: 'bg-green-100',
          border: 'border-green-300',
          text: 'text-green-700',
          icon: 'text-green-600'
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-100',
          border: 'border-yellow-300',
          text: 'text-yellow-700',
          icon: 'text-yellow-600'
        };
      default:
        return {
          bg: 'bg-red-100',
          border: 'border-red-300',
          text: 'text-red-700',
          icon: 'text-red-600'
        };
    }
  };

  const getIcon = (color: string) => {
    switch (color) {
      case 'green':
        return CheckCircle2;
      case 'yellow':
        return AlertTriangle;
      default:
        return XCircle;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evidence Completeness Heatmap</CardTitle>
        <CardDescription>
          Visual overview of evidence coverage by HIPAA safeguard category
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Overall Stats */}
          <div className="grid grid-cols-3 gap-4 pb-4 border-b border-zinc-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-zinc-900">
                {uploadedEvidence.length}/{EVIDENCE_FIELDS.length}
              </div>
              <div className="text-xs text-zinc-600">Total Evidence</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-zinc-900">
                {categoryStats.filter(s => s.requiredCompletionRate === 100).length}/{categories.length}
              </div>
              <div className="text-xs text-zinc-600">Categories Complete</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-zinc-900">
                {Math.round(categoryStats.reduce((acc, s) => acc + s.requiredCompletionRate, 0) / categories.length)}%
              </div>
              <div className="text-xs text-zinc-600">Avg Completion</div>
            </div>
          </div>

          {/* Heatmap Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryStats.map(stat => {
              const color = getColor(stat.requiredCompletionRate);
              const classes = getColorClasses(color);
              const Icon = getIcon(color);

              return (
                <div
                  key={stat.category}
                  className={`p-4 rounded-lg border-2 ${classes.border} ${classes.bg}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-zinc-900 mb-1 truncate">
                        {stat.category}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-zinc-600">
                        <span>{stat.requiredUploaded}/{stat.requiredFields} required</span>
                        <span>•</span>
                        <span>{stat.uploaded}/{stat.totalFields} total</span>
                      </div>
                    </div>
                    <Icon className={`w-5 h-5 ${classes.icon} flex-shrink-0`} />
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-zinc-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          color === 'green' ? 'bg-green-500' :
                          color === 'yellow' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${stat.requiredCompletionRate}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium ${classes.text}`}>
                        {Math.round(stat.requiredCompletionRate)}% Required Complete
                      </span>
                      {stat.requiredCompletionRate === 100 && (
                        <Badge className="text-xs bg-green-100 text-green-700 border-green-300">
                          ✓ Complete
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="pt-4 border-t border-zinc-200">
            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>100% Required = Audit Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span>75-99% = Gaps Exist</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <span>&lt;75% = Critical Missing</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
