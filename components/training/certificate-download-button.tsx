'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Award, Loader2 } from 'lucide-react';
import { UpgradeModal } from '@/components/ui/upgrade-modal';

interface CertificateDownloadButtonProps {
  recordId: string;
  employeeName: string;
  isLocked?: boolean;
}

export function CertificateDownloadButton({ recordId, employeeName, isLocked = false }: CertificateDownloadButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleDownload = async () => {
    if (isLocked) {
      setShowUpgradeModal(true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/training/certificate?id=${encodeURIComponent(recordId)}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Download failed');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `HIPAA_Certificate_${employeeName.replace(/\s+/g, '_')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Failed to download certificate.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownload}
        disabled={loading}
        className="rounded-none border-[#71bc48]/40 text-[#71bc48] hover:bg-[#71bc48]/5"
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
        ) : (
          <Award className="h-3.5 w-3.5 mr-1" />
        )}
        Certificate
      </Button>
      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureName="Training certificates"
      />
    </>
  );
}
