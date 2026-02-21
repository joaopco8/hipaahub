'use client';

import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';

interface FormCheckmarkProps {
  checked: boolean;
  className?: string;
}

export function FormCheckmark({ checked, className }: FormCheckmarkProps) {
  if (!checked) return null;

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-[#00bceb] text-white checkmark-enter',
        className
      )}
      style={{ animation: 'scaleIn 200ms ease-out' }}
    >
      <Check className="h-3 w-3" />
    </div>
  );
}








