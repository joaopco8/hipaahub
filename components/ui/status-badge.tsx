'use client';

import { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'compliant' | 'partial' | 'at-risk';
  className?: string;
}

const statusConfig = {
  compliant: {
    label: 'Compliant',
    icon: CheckCircle2,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700',
    iconColor: 'text-green-600'
  },
  partial: {
    label: 'Partial Compliance',
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-700',
    iconColor: 'text-yellow-600'
  },
  'at-risk': {
    label: 'At Risk',
    icon: XCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    iconColor: 'text-red-600'
  }
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-md border status-transition',
        config.bgColor,
        config.borderColor,
        config.textColor,
        className
      )}
    >
      <Icon className={cn('h-4 w-4', config.iconColor)} />
      <span className="text-sm font-medium">{config.label}</span>
    </div>
  );
}








