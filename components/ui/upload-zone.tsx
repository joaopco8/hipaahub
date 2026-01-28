'use client';

import { useState, useCallback } from 'react';
import { Upload, Check, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';

interface UploadZoneProps {
  onUpload: (files: File[]) => Promise<void>;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
}

export function UploadZone({
  onUpload,
  accept,
  maxSize = 10,
  className
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        await handleFiles(files);
      }
    },
    []
  );

  const handleFileInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        await handleFiles(files);
      }
    },
    []
  );

  const handleFiles = async (files: File[]) => {
    setIsUploading(true);
    setUploaded(false);

    try {
      await onUpload(files);
      setUploaded(true);
      setTimeout(() => {
        setUploaded(false);
        setIsUploading(false);
      }, 2000);
    } catch (error) {
      setIsUploading(false);
      setUploaded(false);
    }
  };

  return (
    <div
      className={cn(
        'relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200',
        isDragging
          ? 'border-[#1ad07a] bg-[#1ad07a]/5'
          : 'border-zinc-300 bg-white hover:border-zinc-400 hover:bg-zinc-50',
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleFileInput}
        className="hidden"
        id="file-upload"
        multiple
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 text-[#1ad07a] animate-spin" />
            <p className="text-sm text-zinc-600">Uploading...</p>
          </div>
        ) : uploaded ? (
          <div className="flex flex-col items-center gap-3">
            <div
              className="rounded-full bg-[#1ad07a] p-2 checkmark-enter"
              style={{ animation: 'scaleIn 200ms ease-out' }}
            >
              <Check className="h-6 w-6 text-white" />
            </div>
            <p className="text-sm font-medium text-[#1ad07a]">
              Uploaded successfully
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload className="h-8 w-8 text-zinc-400" />
            <div>
              <p className="text-sm font-medium text-zinc-900">
                Drop files here or click to upload
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Max file size: {maxSize}MB
              </p>
            </div>
          </div>
        )}
      </label>
    </div>
  );
}








