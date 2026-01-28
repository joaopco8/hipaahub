'use client';

import { cn } from '@/utils/cn';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <Loader2 
        className={cn(
          'animate-spin text-[#1ad07a]',
          sizeClasses[size]
        )}
        style={{
          filter: 'drop-shadow(0 0 8px rgba(26, 208, 122, 0.4))'
        }}
      />
      {text && (
        <p className="text-sm text-zinc-600 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}
