'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UploadZone } from '@/components/ui/upload-zone';
import { useState } from 'react';

interface EvidenceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (files: File[]) => Promise<void>;
  onSkip: () => void;
  title?: string;
  description?: string;
}

export function EvidenceModal({
  open,
  onOpenChange,
  onUpload,
  onSkip,
  title = 'Upload Evidence',
  description = 'Upload evidence to prove this requirement is implemented. You can skip this and upload later.'
}: EvidenceModalProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (files: File[]) => {
    setUploading(true);
    try {
      await onUpload(files);
      onOpenChange(false);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <UploadZone
            onUpload={handleUpload}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            maxSize={10}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onSkip();
              onOpenChange(false);
            }}
            disabled={uploading}
          >
            Skip for now
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            disabled={uploading}
            className="bg-[#1ad07a] text-[#0d1122]"
          >
            {uploading ? 'Uploading...' : 'Done'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}








