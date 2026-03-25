'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { restorePolicyVersion } from '@/app/actions/policy-documents';
import { toast } from 'sonner';

interface PolicyVersionRestoreProps {
  policyId: number;
  versionId: string;
  versionNumber: number;
}

export function PolicyVersionRestore({
  policyId,
  versionId,
  versionNumber,
}: PolicyVersionRestoreProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handleClick = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    doRestore();
  };

  const doRestore = async () => {
    setLoading(true);
    setConfirming(false);
    try {
      await restorePolicyVersion(policyId, versionId);
      toast.success('Version restored as new draft');
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error('Failed to restore version. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setConfirming(false);
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-xs text-[#0e274e] font-light">
          Restore v{versionNumber}? A new draft will be created.
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={doRestore}
          disabled={loading}
          className="h-7 px-2 rounded-none border-[#71bc48] text-[#71bc48] hover:bg-[#71bc48]/5 text-xs"
        >
          {loading ? 'Restoring...' : 'Confirm'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          className="h-7 px-2 rounded-none text-gray-400 hover:text-gray-600 text-xs"
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={loading}
      className="h-8 rounded-none border-gray-200 text-gray-600 hover:text-[#0e274e] shrink-0 text-xs"
    >
      <RotateCcw className="h-3.5 w-3.5 mr-1" />
      Restore
    </Button>
  );
}
