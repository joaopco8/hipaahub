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
  AlertCircle
} from 'lucide-react';
import { 
  EVIDENCE_FIELDS, 
  getEvidenceFieldsByCategory,
  getEvidenceCategories,
  type EvidenceFieldConfig 
} from '@/lib/evidence-fields-config';
import { EvidenceUploadModal } from './evidence-upload-modal';
import { useRouter } from 'next/navigation';

const EVIDENCE_TYPE_ICONS = {
  document: FileText,
  screenshot: ImageIcon,
  log: FileCode,
  link: LinkIcon,
  attestation: CheckCircle2,
};

const EVIDENCE_TYPE_COLORS = {
  document: 'bg-blue-50 text-blue-700 border-blue-100',
  screenshot: 'bg-purple-50 text-purple-700 border-purple-100',
  log: 'bg-amber-50 text-amber-700 border-amber-100',
  link: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  attestation: 'bg-[#1ad07a]/10 text-[#0c0b1d] border-[#1ad07a]/20',
};

import { type ComplianceEvidence } from '@/app/actions/compliance-evidence';
import { Eye, Download } from 'lucide-react';

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
            <Card className="bg-[#f3f5f9] border-zinc-200">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-[#0c0b1d] mb-2">{category}</h2>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-40 bg-zinc-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#1ad07a] transition-all duration-1000" 
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-zinc-700">
                          {uploadedCount} of {fields.length} complete
                        </span>
                      </div>
                      {requiredCount > 0 && (
                        <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs font-semibold">
                          {fields.filter(f => f.required && hasEvidence(f.id)).length} / {requiredCount} required
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Badge 
                    className={cn(
                      "text-base font-bold px-5 py-2 rounded-lg",
                      progress === 100 
                        ? "bg-[#1ad07a] text-[#0c0b1d] border-[#1ad07a]" 
                        : "bg-white text-[#0c0b1d] border-zinc-300"
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
                      "group transition-all duration-300 border-zinc-200 hover:border-[#1ad07a] hover:shadow-xl hover:-translate-y-1 overflow-hidden relative",
                      hasUploaded ? "bg-white border-[#1ad07a]/30" : "bg-white"
                    )}
                  >
                    {hasUploaded && (
                      <div className="absolute top-0 right-0 p-2">
                        <CheckCircle2 className="h-5 w-5 text-[#1ad07a] animate-in zoom-in duration-300" />
                      </div>
                    )}
                    
                    <CardHeader className="pb-3 pt-6 px-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={cn(
                          "p-2.5 rounded-lg transition-colors",
                          hasUploaded ? "bg-[#1ad07a]/10 text-[#1ad07a]" : "bg-zinc-100 text-zinc-500 group-hover:bg-[#1ad07a]/10 group-hover:text-[#1ad07a]"
                        )}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <Badge 
                          className={cn(
                            "text-xs font-semibold px-2.5 py-0.5",
                            EVIDENCE_TYPE_COLORS[field.evidence_type]
                          )}
                        >
                          {field.evidence_type}
                        </Badge>
                      </div>
                      <CardTitle className="text-base font-bold text-[#0c0b1d] leading-snug group-hover:text-[#1ad07a] transition-colors line-clamp-2 mb-2">
                        {field.name}
                      </CardTitle>
                      {field.description && (
                        <CardDescription className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                          {field.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    
                    <CardContent className="px-6 pb-6 space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {isRequired && (
                          <Badge 
                            className="text-xs font-semibold bg-amber-50 text-amber-700 border-amber-200"
                          >
                            Required
                          </Badge>
                        )}
                        {field.frequency && (
                          <Badge 
                            className="text-xs font-semibold bg-zinc-100 text-zinc-700 border-zinc-200"
                          >
                            {field.frequency.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-start gap-2">
                          <span className="font-semibold text-zinc-500 shrink-0">Policies:</span>
                          <span className="text-zinc-700 font-medium line-clamp-1">{field.related_policies.join(', ')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-zinc-500">Retention:</span>
                          <span className="text-zinc-700 font-medium">{field.retention_years} years</span>
                        </div>
                      </div>

                      {/* Show saved documents with view/download options */}
                      {evidenceByFieldId[field.id] && evidenceByFieldId[field.id].length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-zinc-100">
                          <p className="text-xs font-semibold text-zinc-500 mb-2">Saved Documents:</p>
                          {evidenceByFieldId[field.id].map((ev) => (
                            <div 
                              key={ev.id} 
                              className="flex items-center justify-between gap-2 p-2 bg-zinc-50 rounded-md border border-zinc-200"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-zinc-800 truncate">
                                  {ev.title}
                                </p>
                                {ev.file_name && (
                                  <p className="text-[10px] text-zinc-500 truncate">
                                    {ev.file_name}
                                  </p>
                                )}
                                {(ev as any).external_link && (
                                  <p className="text-[10px] text-zinc-500 truncate">
                                    {(ev as any).external_link}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                {ev.file_url && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0 hover:bg-zinc-200"
                                      onClick={async () => {
                                        try {
                                          const fileUrl = ev.file_url!;
                                          const bucket = ev.storage_bucket || 'evidence';
                                          
                                          const response = await fetch(
                                            `/api/compliance-evidence/view?file_url=${encodeURIComponent(fileUrl)}&bucket=${encodeURIComponent(bucket)}`
                                          );
                                          
                                          if (!response.ok) {
                                            const errorData = await response.json();
                                            console.error('View API error:', errorData);
                                            
                                            if (response.status === 404) {
                                              alert(`File not found. The file may have been deleted.\n\nFile: ${ev.file_name || fileUrl}\n\nPlease re-upload the document.`);
                                            } else {
                                              alert(`Failed to view document: ${errorData.error || 'Unknown error'}`);
                                            }
                                            return;
                                          }
                                          
                                          const data = await response.json();
                                          if (data.view_url) {
                                            window.open(data.view_url, '_blank');
                                          } else {
                                            alert('Failed to generate view URL. Please try again.');
                                          }
                                        } catch (error: any) {
                                          console.error('Failed to view document:', error);
                                          alert(`Failed to view document: ${error.message || 'Network error'}`);
                                        }
                                      }}
                                      title="View Document"
                                    >
                                      <Eye className="h-3.5 w-3.5 text-zinc-600" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0 hover:bg-zinc-200"
                                      onClick={async () => {
                                        try {
                                          const fileUrl = ev.file_url!;
                                          const bucket = ev.storage_bucket || 'evidence';
                                          
                                          const response = await fetch(
                                            `/api/compliance-evidence/download?file_url=${encodeURIComponent(fileUrl)}&bucket=${encodeURIComponent(bucket)}`
                                          );
                                          
                                          if (!response.ok) {
                                            const errorData = await response.json();
                                            console.error('Download API error:', errorData);
                                            
                                            if (response.status === 404) {
                                              alert(`File not found. The file may have been deleted.\n\nFile: ${ev.file_name || fileUrl}\n\nPlease re-upload the document.`);
                                            } else {
                                              alert(`Failed to download document: ${errorData.error || 'Unknown error'}`);
                                            }
                                            return;
                                          }
                                          
                                          const data = await response.json();
                                          if (data.download_url) {
                                            // Fetch the file as blob and force download
                                            const fileResponse = await fetch(data.download_url);
                                            if (!fileResponse.ok) {
                                              throw new Error('Failed to fetch file');
                                            }
                                            
                                            const blob = await fileResponse.blob();
                                            const blobUrl = window.URL.createObjectURL(blob);
                                            
                                            // Create download link
                                            const link = document.createElement('a');
                                            link.href = blobUrl;
                                            link.download = ev.file_name || fileUrl.split('/').pop() || 'document';
                                            document.body.appendChild(link);
                                            link.click();
                                            
                                            // Cleanup
                                            document.body.removeChild(link);
                                            window.URL.revokeObjectURL(blobUrl);
                                          } else {
                                            alert('Failed to generate download URL. Please try again.');
                                          }
                                        } catch (error: any) {
                                          console.error('Failed to download document:', error);
                                          alert(`Failed to download document: ${error.message || 'Network error'}`);
                                        }
                                      }}
                                      title="Download Document"
                                    >
                                      <Download className="h-3.5 w-3.5 text-zinc-600" />
                                    </Button>
                                  </>
                                )}
                                {(ev as any).external_link && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 hover:bg-zinc-200"
                                    onClick={() => window.open((ev as any).external_link, '_blank')}
                                    title="Open Link"
                                  >
                                    <LinkIcon className="h-3.5 w-3.5 text-zinc-600" />
                                  </Button>
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
                              "w-full h-10 font-bold transition-all rounded-lg",
                              hasUploaded 
                                ? "border-[#0c0b1d] text-[#0c0b1d] hover:bg-[#0c0b1d] hover:text-white" 
                                : "bg-[#1ad07a] text-[#0c0b1d] hover:bg-[#1ad07a]/90"
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
