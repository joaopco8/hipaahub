'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/utils/cn';

interface SavingBarProps {
  isSaving: boolean;
  className?: string;
}

export function SavingBar({ isSaving, className }: SavingBarProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isSaving) {
      setShow(true);
    } else {
      const timer = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isSaving]);

  if (!show) return null;

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-50 h-1 bg-[#1ad07a] transition-opacity duration-300',
        isSaving ? 'opacity-100' : 'opacity-0',
        className
      )}
    >
      <div className="h-full w-full bg-[#1ad07a] animate-pulse" />
    </div>
  );
}








