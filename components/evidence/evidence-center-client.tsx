'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Download,
  Eye,
  Trash2,
  Search,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Archive,
  X,
} from 'lucide-react';
import { 
  type ComplianceEvidence,
  type EvidenceStatus,
  type EvidenceType,
  type HIPAACategory,
  deleteComplianceEvidence
} from '@/app/actions/compliance-evidence';
import { useRouter } from 'next/navigation';
import { formatFileSize } from '@/utils/helpers';

const STATUS_COLORS: Record<EvidenceStatus, string> = {
  VALID: 'bg-[#71bc48]/10 text-[#71bc48] border border-[#71bc48]/20',
  EXPIRED: 'bg-red-50 text-red-800 border border-red-200',
  MISSING: 'bg-gray-50 text-gray-800 border border-gray-200',
  REQUIRES_REVIEW: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
  ARCHIVED: 'bg-zinc-100 text-zinc-700 border border-zinc-200',
};

const STATUS_ICONS: Record<EvidenceStatus, React.ReactNode> = {
  VALID: <CheckCircle2 className="h-4 w-4" />,
  EXPIRED: <AlertCircle className="h-4 w-4" />,
  MISSING: <AlertCircle className="h-4 w-4" />,
  REQUIRES_REVIEW: <Clock className="h-4 w-4" />,
  ARCHIVED: <Archive className="h-4 w-4" />,
};

interface EvidenceCenterClientProps {
  initialEvidence: ComplianceEvidence[];
  userName: string;
}

export function EvidenceCenterClient({ initialEvidence, userName }: EvidenceCenterClientProps) {
  const router = useRouter();
  const [evidence, setEvidence] = useState(initialEvidence);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<EvidenceStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<EvidenceType | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<HIPAACategory | 'ALL'>('ALL');

  const filteredEvidence = useMemo(() => {
    return evidence.filter((ev) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          ev.title.toLowerCase().includes(query) ||
          ev.description?.toLowerCase().includes(query) ||
          ev.file_name?.toLowerCase().includes(query) ||
          ev.related_document_ids?.some(id => id.toLowerCase().includes(query)) ||
          ev.related_question_ids?.some(id => id.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== 'ALL' && ev.status !== statusFilter) {
        return false;
      }

      // Type filter
      if (typeFilter !== 'ALL' && ev.evidence_type !== typeFilter) {
        return false;
      }

      // Category filter
      if (categoryFilter !== 'ALL' && !ev.hipaa_category?.includes(categoryFilter)) {
        return false;
      }

      return true;
    });
  }, [evidence, searchQuery, statusFilter, typeFilter, categoryFilter]);

  const handleDelete = async (evidenceId: string) => {
    if (!confirm('Are you sure you want to delete this evidence? This action cannot be undone.')) {
      return;
    }

    const result = await deleteComplianceEvidence(evidenceId);
    if (result.success) {
      setEvidence(prev => prev.filter(ev => ev.id !== evidenceId));
      router.refresh();
    } else {
      alert(result.error || 'Failed to delete evidence');
    }
  };

  const getFileIcon = (evidenceType: EvidenceType) => {
    if (evidenceType.includes('screenshot') || evidenceType.includes('image')) {
      return <ImageIcon className="h-5 w-5 text-[#00bceb]" />;
    }
    if (evidenceType.includes('log') || evidenceType.includes('audit')) {
      return <FileText className="h-5 w-5 text-[#0e274e]" />;
    }
    if (evidenceType.includes('link') || evidenceType.includes('url')) {
      return <LinkIcon className="h-5 w-5 text-[#00bceb]" />;
    }
    return <FileText className="h-5 w-5 text-[#71bc48]" />;
  };

  const getDownloadUrl = async (evidence: ComplianceEvidence) => {
    if (!evidence.file_url) return null;
    try {
      const response = await fetch(`/api/compliance-evidence/download?file_url=${encodeURIComponent(evidence.file_url)}`);
      const data = await response.json();
      return data.download_url;
    } catch (error) {
      console.error('Failed to generate download URL:', error);
      return null;
    }
  };

  const handleDownload = async (evidence: ComplianceEvidence) => {
    const downloadUrl = await getDownloadUrl(evidence);
    if (downloadUrl) {
      try {
        const fileResponse = await fetch(downloadUrl);
        if (!fileResponse.ok) throw new Error('Failed to fetch file');
        
        const blob = await fileResponse.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = evidence.file_name || evidence.title || 'document';
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      } catch (error: any) {
        console.error('Failed to download file:', error);
        alert(`Failed to download file: ${error.message || 'Unknown error'}`);
      }
    } else {
      alert('Failed to generate download URL');
    }
  };

  // Group by category
  const groupedEvidence = useMemo(() => {
    const groups: Record<string, ComplianceEvidence[]> = {};
    filteredEvidence.forEach((ev) => {
      const categories = ev.hipaa_category || ['Uncategorized'];
      categories.forEach((cat) => {
        if (!groups[cat]) {
          groups[cat] = [];
        }
        groups[cat].push(ev);
      });
    });
    return groups;
  }, [filteredEvidence]);

  if (evidence.length === 0) {
    return (
      <Card className="border-0 shadow-sm bg-white rounded-none">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-zinc-300 mb-4" />
          <CardTitle className="mb-2 text-[#0e274e] font-light">No evidence uploaded yet</CardTitle>
          <p className="text-sm text-gray-400 mb-4 text-center max-w-md font-light">
            Start building your compliance evidence library by uploading documents, 
            screenshots, logs, and other proof of your HIPAA compliance efforts.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="border-0 shadow-sm bg-white rounded-none">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search evidence..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 rounded-none border-gray-200 focus:border-[#00bceb]"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as EvidenceStatus | 'ALL')}>
              <SelectTrigger className="w-[180px] rounded-none border-gray-200">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-none">
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="VALID">Valid</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
                <SelectItem value="REQUIRES_REVIEW">Requires Review</SelectItem>
                <SelectItem value="MISSING">Missing</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as EvidenceType | 'ALL')}>
              <SelectTrigger className="w-[200px] rounded-none border-gray-200">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="rounded-none">
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="security_risk_analysis">Security Risk Analysis</SelectItem>
                <SelectItem value="policy_procedure">Policy & Procedure</SelectItem>
                <SelectItem value="audit_log">Audit Log</SelectItem>
                <SelectItem value="business_associate_agreement">BAA</SelectItem>
                <SelectItem value="workforce_training_log">Training Log</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            {(searchQuery || statusFilter !== 'ALL' || typeFilter !== 'ALL' || categoryFilter !== 'ALL') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                  setTypeFilter('ALL');
                  setCategoryFilter('ALL');
                }}
                className="rounded-none border-gray-200 text-gray-500 hover:text-[#00bceb]"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Evidence List */}
      {Object.keys(groupedEvidence).length === 0 ? (
        <Card className="border-0 shadow-sm bg-white rounded-none">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-zinc-300 mb-4" />
            <CardTitle className="mb-2 text-[#0e274e] font-light">No evidence found</CardTitle>
            <p className="text-sm text-gray-400 font-light">
              Try adjusting your filters or search query
            </p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedEvidence).map(([category, items], catIndex) => (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-light text-[#0e274e]">{category}</h2>
              <Badge 
                variant="secondary"
                className="px-2 py-0.5 text-xs font-light bg-[#f3f5f9] text-[#565656] border-gray-200 rounded-none"
              >
                {items.length}
              </Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item, itemIndex) => (
                <Card 
                  key={item.id} 
                  className="hover:shadow-md transition-all duration-200 border-0 shadow-sm bg-white rounded-none"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2 flex-1">
                        <div className="bg-gray-50 p-1.5 border border-gray-100 rounded-none">
                          {getFileIcon(item.evidence_type)}
                        </div>
                        <CardTitle className="text-base font-light text-[#0e274e] line-clamp-2">{item.title}</CardTitle>
                      </div>
                      <Badge 
                        variant="outline"
                        className={`text-[10px] font-light px-2 py-0.5 rounded-none ${STATUS_COLORS[item.status]}`}
                      >
                        <span className="flex items-center gap-1">
                          {STATUS_ICONS[item.status]}
                          {item.status.replace('_', ' ')}
                        </span>
                      </Badge>
                    </div>

                    {item.description && (
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed font-light">
                        {item.description}
                      </p>
                    )}

                    <div className="space-y-2 text-[11px] text-gray-400 mb-4 font-light">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Uploaded: {new Date(item.upload_date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                      {item.file_size && (
                        <div className="flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5" />
                          <span>{formatFileSize(item.file_size)}</span>
                        </div>
                      )}
                      {item.validity_end_date && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5" />
                          <span className={item.status === 'EXPIRED' ? 'text-red-500 font-semibold' : ''}>
                            Expires: {new Date(item.validity_end_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {item.file_url && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownload(item)}
                          className="flex-1 h-9 text-xs font-light border-gray-200 text-gray-600 hover:bg-gray-50 rounded-none"
                        >
                          <Download className="h-3.5 w-3.5 mr-2 text-gray-400" />
                          Download
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        className="h-9 px-3 border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors rounded-none"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
