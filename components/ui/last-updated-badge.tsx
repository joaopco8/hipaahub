'use client';

import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle } from 'lucide-react';
import { formatLastUpdated, checkIfOutdated } from '@/lib/last-updated-tracking';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface LastUpdatedBadgeProps {
  lastUpdated: Date;
  itemType: 'policy' | 'evidence' | 'training' | 'sra' | 'baa';
  frequency?: 'annually' | 'quarterly' | 'monthly' | 'continuously' | 'on_event';
  className?: string;
}

export function LastUpdatedBadge({ 
  lastUpdated, 
  itemType, 
  frequency,
  className 
}: LastUpdatedBadgeProps) {
  const info = checkIfOutdated(lastUpdated, itemType, frequency);
  const formattedDate = formatLastUpdated(lastUpdated);

  const getBadgeStyle = () => {
    if (info.is_outdated) {
      return 'bg-red-100 text-red-700 border-red-300';
    } else if (info.days_since_update > 180) {
      return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    } else {
      return 'bg-green-100 text-green-700 border-green-300';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            className={`${getBadgeStyle()} cursor-help border ${className || ''}`}
          >
            {info.is_outdated ? (
              <AlertTriangle className="w-3 h-3 mr-1.5" />
            ) : (
              <Clock className="w-3 h-3 mr-1.5" />
            )}
            {formattedDate}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold">
              Last Updated: {lastUpdated.toLocaleDateString()}
            </p>
            <p className="text-xs">{info.days_since_update} days ago</p>
            {info.is_outdated && info.outdated_reason && (
              <p className="text-xs text-red-600 mt-2">
                ⚠ {info.outdated_reason}
              </p>
            )}
            {info.next_review_date && (
              <p className="text-xs text-zinc-600 mt-2">
                Next review: {info.next_review_date.toLocaleDateString()}
              </p>
            )}
            {!info.is_outdated && (
              <p className="text-xs text-green-600 mt-2">
                ✓ Current - OCR considers this recent
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
