'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';
import { 
  FileText, 
  Image as ImageIcon, 
  FileCode, 
  Link as LinkIcon, 
  CheckCircle2,
  Upload,
  Eye, 
  Download 
} from 'lucide-react';
import { 
  getEvidenceFieldsByCategory,
  getEvidenceCategories
} from '@/lib/evidence-fields-config';
import { EvidenceUploadModal } from './evidence-upload-modal';
import { useRouter } from 'next/navigation';
import { type ComplianceEvidence } from '@/app/actions/compliance-evidence';

const EVIDENCE_TYPE_ICONS = {
  document: FileText,
  screenshot: ImageIcon,
  log: FileCode,
  link: LinkIcon,
  attestation: CheckCircle2,
};

const EVIDENCE_TYPE_COLORS = {
  document: 'bg-blue-50/50 text-blue-600 border-0',
  screenshot: 'bg-purple-50/50 text-purple-600 border-0',
  log: 'bg-amber-50/50 text-amber-600 border-0',
  link: 'bg-indigo-50/50 text-indigo-600 border-0',
  attestation: 'bg-[#71bc48]/5 text-[#71bc48] border-0',
};

interface EvidenceFieldsGridProps {
  existingEvidence?: Array<{ field_id: string; uploaded: boolean }>;
  evidenceByFieldId?: Record<string, ComplianceEvidence[]>;
}

export function EvidenceFieldsGrid({ existingEvidence = [], evidenceByFieldId = {} }: EvidenceFieldsGridProps) {
  const router = useRouter();
  const categories = getEvidenceCategories();

  const hasEvidence = (fieldId: string) => {
    return existingEvidence.some(ev => ev.field_id === fieldId && ev.uploaded);
  };

  const handleUploadSuccess = () => {
    router.refresh();
  };

  return (
    <div className="space-y-12">
      {categories.map((category, catIndex) => {
        const fields = getEvidenceFieldsByCategory(category);
        const requiredCount = fields.filter(f => f.required).length;
        const uploadedCount = fields.filter(f => hasEvidence(f.id)).length;
        const progress = Math.round((uploadedCount / fields.length) * 100);

        return (
          <div key={category} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${catIndex * 100}ms` }}>
            <Card className="bg-[#f3f5f9] border-0 rounded-none shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h2 className="text-xl font-light text-[#0e274e] mb-2">{category}</h2>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-40 bg-gray-200 rounded-none overflow-hidden">
                          <div 
                            className="h-full bg-[#71bc48] transition-all duration-1000" 
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-light text-gray-500">
                          {uploadedCount} of {fields.length} complete
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge 
                    className={cn(
                      "text-base font-light px-5 py-2 rounded-none border-0",
                      progress === 100 
                        ? "bg-[#71bc48] text-white" 
                        : "bg-[#f3f5f9] text-[#565656]"
                    )}
                  >
                    {progress}%
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {fields.map((field, fieldIndex) => {
                const IconComponent = EVIDENCE_TYPE_ICONS[field.evidence_type];
                const hasUploaded = hasEvidence(field.id);
                const isRequired = field.required;

                return (
                  <Card 
                    key={field.id}
                    className={cn(
                      "group transition-all duration-300 border-0 shadow-sm rounded-none overflow-hidden relative",
                      hasUploaded ? "bg-white border-[#71bc48]/30" : "bg-white"
                    )}
                  >
                    {hasUploaded && (
                      <div className="absolute top-0 right-0 p-2">
                        <CheckCircle2 className="h-5 w-5 text-[#71bc48] animate-in zoom-in duration-300" />
                      </div>
                    )}
                    
                    <CardHeader className="pb-3 pt-6 px-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={cn(
                          "p-2.5 rounded-none transition-colors",
                          hasUploaded ? "bg-[#71bc48]/10 text-[#71bc48]" : "bg-gray-100 text-gray-500 group-hover:bg-[#00bceb]/10 group-hover:text-[#00bceb]"
                        )}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <Badge 
                          className={cn(
                            "text-xs font-light px-2.5 py-0.5 rounded-none",
                            EVIDENCE_TYPE_COLORS[field.evidence_type]
                          )}
                        >
                          {field.evidence_type}
                        </Badge>
                      </div>
                      <CardTitle className="text-base font-light text-[#0e274e] leading-snug group-hover:text-[#00bceb] transition-colors line-clamp-2 mb-2">
                        {field.name}
                      </CardTitle>
                      {field.description && (
                        <CardDescription className="text-xs text-gray-400 line-clamp-2 leading-relaxed font-light">
                          {field.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    
                    <CardContent className="px-6 pb-6 space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {isRequired && (
                          <Badge 
                            className="text-xs font-light bg-[#00bceb]/5 text-[#00bceb] border-0 rounded-none px-2 py-1"
                          >
                            Required
                          </Badge>
                        )}
                        {field.frequency && (
                          <Badge 
                            className="text-xs font-light bg-[#f3f5f9] text-[#565656] border-0 rounded-none px-2 py-1"
                          >
                            {field.frequency.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-2 text-xs font-light">
                        <div className="flex items-start gap-2">
                          <span className="font-light text-[#565656] shrink-0">Policies:</span>
                          <span className="text-[#565656] line-clamp-1">{field.related_policies.join(', ')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-light text-[#565656]">Retention:</span>
                          <span className="text-[#565656]">{field.retention_years} years</span>
                        </div>
                      </div>

                      {/* Show saved documents with view/download options */}
                      {evidenceByFieldId[field.id] && evidenceByFieldId[field.id].length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-gray-100">
                          <p className="text-xs font-light text-[#565656] mb-2">Saved Documents:</p>
                          {evidenceByFieldId[field.id].map((ev) => (
                            <div 
                              key={ev.id} 
                              className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded-none border border-gray-200"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-[#0e274e] truncate">
                                  {ev.title}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                {ev.file_url && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0 hover:bg-gray-200 rounded-none"
                                      onClick={async () => {
                                        try {
                                          const bucket = ev.storage_bucket || 'evidence';
                                          const response = await fetch(
                                            `/api/compliance-evidence/view?file_url=${encodeURIComponent(ev.file_url || '')}&bucket=${encodeURIComponent(bucket)}`
                                          );
                                          
                                          if (!response.ok) {
                                            const errorData = await response.json();
                                            console.error('Failed to get view URL:', errorData);
                                            alert('Failed to open document. Please try downloading it instead.');
                                            return;
                                          }
                                          
                                          const data = await response.json();
                                          if (data.view_url) {
                                            window.open(data.view_url, '_blank');
                                          } else {
                                            alert('Failed to generate view URL. Please try downloading the document.');
                                          }
                                        } catch (error) {
                                          console.error('Error viewing document:', error);
                                          alert('An error occurred while trying to view the document. Please try downloading it instead.');
                                        }
                                      }}
                                      title="View Document"
                                    >
                                      <Eye className="h-3.5 w-3.5 text-gray-500" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0 hover:bg-gray-200 rounded-none"
                                      onClick={async () => {
                                        try {
                                          const bucket = ev.storage_bucket || 'evidence';
                                          const response = await fetch(
                                            `/api/compliance-evidence/download?file_url=${encodeURIComponent(ev.file_url || '')}&bucket=${encodeURIComponent(bucket)}`
                                          );
                                          
                                          if (!response.ok) {
                                            const errorData = await response.json();
                                            console.error('Failed to get download URL:', errorData);
                                            alert('Failed to download document.');
                                            return;
                                          }
                                          
                                          const data = await response.json();
                                          if (data.download_url) {
                                            window.open(data.download_url, '_blank');
                                          } else {
                                            alert('Failed to generate download URL.');
                                          }
                                        } catch (error) {
                                          console.error('Error downloading document:', error);
                                          alert('An error occurred while trying to download the document.');
                                        }
                                      }}
                                      title="Download Document"
                                    >
                                      <Download className="h-3.5 w-3.5 text-gray-500" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <EvidenceUploadModal
                        trigger={
                          <Button
                            variant={hasUploaded ? 'outline' : 'default'}
                            size="sm"
                            className={cn(
                              "w-full h-10 font-light transition-all rounded-none",
                              hasUploaded 
                                ? "border-[#0e274e] text-[#0e274e] hover:bg-[#0e274e] hover:text-white" 
                                : "bg-[#00bceb] text-white hover:bg-[#00bceb]/90"
                            )}
                          >
                            {hasUploaded ? (
                              <>
                                <Upload className="h-4 w-4 mr-2" />
                                Update Evidence
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Evidence
                              </>
                            )}
                          </Button>
                        }
                        fieldConfig={field}
                        onSuccess={handleUploadSuccess}
                      />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
