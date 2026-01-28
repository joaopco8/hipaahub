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
  Edit,
  Trash2,
  Filter,
  Search,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  File as GenericFileIcon,
  Calendar,
  User,
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
  VALID: 'bg-[#1ad07a]/10 text-[#0c0b1d] border border-[#1ad07a]/20',
  EXPIRED: 'bg-amber-50 text-amber-800 border border-amber-200',
  MISSING: 'bg-red-50 text-red-800 border border-red-200',
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
      return <ImageIcon className="h-5 w-5 text-blue-500" />;
    }
    if (evidenceType.includes('log') || evidenceType.includes('audit')) {
      return <FileText className="h-5 w-5 text-purple-500" />;
    }
    if (evidenceType.includes('link') || evidenceType.includes('url')) {
      return <LinkIcon className="h-5 w-5 text-purple-500" />;
    }
    return <FileText className="h-5 w-5 text-[#1ad07a]" />;
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
        // Fetch the file as blob and force download
        const fileResponse = await fetch(downloadUrl);
        if (!fileResponse.ok) {
          throw new Error('Failed to fetch file');
        }
        
        const blob = await fileResponse.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        
        // Create download link
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = evidence.file_name || evidence.title || 'document';
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
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
      <Card className="card-premium-enter stagger-item">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-zinc-400 mb-4" />
          <CardTitle className="mb-2 text-zinc-900">No evidence uploaded yet</CardTitle>
          <p className="text-sm text-zinc-600 mb-4 text-center max-w-md">
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
      <Card className="card-premium-enter stagger-item">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  placeholder="Search evidence..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as EvidenceStatus | 'ALL')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="VALID">Valid</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
                <SelectItem value="REQUIRES_REVIEW">Requires Review</SelectItem>
                <SelectItem value="MISSING">Missing</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as EvidenceType | 'ALL')}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
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
        <Card className="card-premium-enter stagger-item">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-zinc-400 mb-4" />
            <CardTitle className="mb-2 text-zinc-900">No evidence found</CardTitle>
            <p className="text-sm text-zinc-600">
              Try adjusting your filters or search query
            </p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedEvidence).map(([category, items], catIndex) => (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-zinc-800">{category}</h2>
              <Badge 
                variant="secondary"
                className="px-2 py-0.5 text-xs font-bold bg-zinc-100 text-zinc-500 border-zinc-200"
              >
                {items.length}
              </Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item, itemIndex) => (
                <Card 
                  key={item.id} 
                  className="hover:shadow-md transition-all duration-200 border-zinc-200 bg-white card-premium-enter stagger-item"
                  style={{ animationDelay: `${(catIndex * 100) + (itemIndex * 50)}ms` }}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2 flex-1">
                        <div className="bg-zinc-50 p-1.5 rounded-md border border-zinc-100">
                          {getFileIcon(item.evidence_type)}
                        </div>
                        <CardTitle className="text-base font-semibold text-zinc-800 line-clamp-2">{item.title}</CardTitle>
                      </div>
                      <Badge 
                        variant="outline"
                        className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 ${STATUS_COLORS[item.status]}`}
                      >
                        <span className="flex items-center gap-1">
                          {STATUS_ICONS[item.status]}
                          {item.status.replace('_', ' ')}
                        </span>
                      </Badge>
                    </div>

                    {item.description && (
                      <p className="text-sm text-zinc-500 mb-4 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}

                    <div className="space-y-2 text-[11px] text-zinc-400 mb-4">
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

                    {item.related_document_ids && item.related_document_ids.length > 0 && (
                      <div className="mb-5 bg-zinc-50/50 p-2 rounded-md border border-zinc-100">
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight mb-1.5 px-1">Mapped to Policies:</p>
                        <div className="flex flex-wrap gap-1">
                          {item.related_document_ids.slice(0, 3).map((docId) => (
                            <Badge 
                              key={docId} 
                              variant="outline"
                              className="text-[10px] font-bold bg-white text-zinc-500 border-zinc-200 px-1.5 py-0"
                            >
                              {docId}
                            </Badge>
                          ))}
                          {item.related_document_ids.length > 3 && (
                            <Badge 
                              variant="secondary"
                              className="text-[10px] font-bold bg-zinc-100 text-zinc-400 border-zinc-200 px-1.5 py-0"
                            >
                              +{item.related_document_ids.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {item.file_url && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownload(item)}
                          className="flex-1 h-9 text-xs font-semibold border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                        >
                          <Download className="h-3.5 w-3.5 mr-2 text-zinc-400" />
                          Download
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        className="h-9 px-3 border-zinc-200 text-zinc-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
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
