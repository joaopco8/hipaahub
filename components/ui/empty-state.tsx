'use client';

import { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center animate-fadeIn',
        className
      )}
      style={{ animation: 'fadeIn 300ms ease-out' }}
    >
      {icon && (
        <div
          className="mb-4 text-zinc-400 animate-scaleIn"
          style={{ animation: 'scaleIn 200ms ease-out 100ms backwards' }}
        >
          {icon}
        </div>
      )}
      <h3
        className="text-lg font-semibold text-zinc-900 mb-2 animate-fadeIn"
        style={{ animation: 'fadeIn 300ms ease-out 150ms backwards' }}
      >
        {title}
      </h3>
      {description && (
        <p
          className="text-sm text-zinc-600 max-w-sm mb-6 animate-fadeIn"
          style={{ animation: 'fadeIn 300ms ease-out 200ms backwards' }}
        >
          {description}
        </p>
      )}
      {action && (
        <Button
          variant="default"
          size="sm"
          onClick={action.onClick}
          className="animate-fadeIn"
          style={{ animation: 'fadeIn 300ms ease-out 250ms backwards' }}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}








