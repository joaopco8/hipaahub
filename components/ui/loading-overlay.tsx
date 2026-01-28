'use client';

import { cn } from '@/utils/cn';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  className?: string;
}

export function LoadingOverlay({ isLoading, message, className }: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div className={cn('loading-overlay', className)}>
      <div className="flex flex-col items-center gap-4">
        <div className="loading-spinner-premium" />
        {message && (
          <p className="text-white/80 text-sm font-medium animate-pulse">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
