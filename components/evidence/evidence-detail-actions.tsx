'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Eye } from 'lucide-react';

interface EvidenceDetailActionsProps {
  evidenceId: string;
  fileUrl: string;
  fileName: string;
  evidenceTitle: string;
}

export function EvidenceDetailActions({
  evidenceId,
  fileUrl,
  fileName,
  evidenceTitle,
}: EvidenceDetailActionsProps) {
  const [loading, setLoading] = useState<'view' | 'download' | null>(null);

  const getSignedUrl = async (action: 'view' | 'download') => {
    setLoading(action);
    try {
      const endpoint = action === 'download'
        ? '/api/compliance-evidence/download'
        : '/api/compliance-evidence/view';
      const params = new URLSearchParams({
        file_url: fileUrl,
        evidence_id: evidenceId,
        evidence_title: evidenceTitle,
      });
      const response = await fetch(`${endpoint}?${params.toString()}`);
      const data = await response.json();
      return data.download_url || data.view_url;
    } catch {
      return null;
    } finally {
      setLoading(null);
    }
  };

  const handleView = async () => {
    const url = await getSignedUrl('view');
    if (url) window.open(url, '_blank');
  };

  const handleDownload = async () => {
    const url = await getSignedUrl('download');
    if (!url) return;
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      alert('Download failed');
    }
  };

  return (
    <div className="flex gap-2 shrink-0">
      <Button
        variant="outline"
        size="sm"
        onClick={handleView}
        disabled={loading !== null}
        className="h-9 text-xs font-light border-gray-200 text-gray-600 hover:bg-gray-50 rounded-none"
      >
        {loading === 'view' ? (
          <div className="h-3 w-3 border-2 border-gray-300 border-t-gray-600 animate-spin rounded-full mr-2" />
        ) : (
          <Eye className="h-3.5 w-3.5 mr-2 text-gray-400" />
        )}
        Preview
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownload}
        disabled={loading !== null}
        className="h-9 text-xs font-light border-[#00bceb] text-[#00bceb] hover:bg-[#00bceb]/5 rounded-none"
      >
        {loading === 'download' ? (
          <div className="h-3 w-3 border-2 border-[#00bceb]/30 border-t-[#00bceb] animate-spin rounded-full mr-2" />
        ) : (
          <Download className="h-3.5 w-3.5 mr-2" />
        )}
        Download
      </Button>
    </div>
  );
}
