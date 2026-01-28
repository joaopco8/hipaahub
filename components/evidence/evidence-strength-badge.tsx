'use client';

import { Badge } from '@/components/ui/badge';
import { Shield, FileCheck, AlertTriangle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface EvidenceStrengthBadgeProps {
  evidenceType: 'document' | 'screenshot' | 'log' | 'link' | 'attestation';
  className?: string;
}

export function EvidenceStrengthBadge({ evidenceType, className }: EvidenceStrengthBadgeProps) {
  // Determine strength based on evidence type
  const getStrengthInfo = () => {
    switch (evidenceType) {
      case 'log':
        return {
          strength: 'strong',
          label: 'System-Generated',
          description: 'System-generated logs are the strongest form of evidence in OCR audits. They are tamper-resistant and automatically documented.',
          icon: Shield,
          badgeClass: 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200',
          iconColor: 'text-green-600'
        };
      case 'screenshot':
      case 'document':
        return {
          strength: 'acceptable',
          label: evidenceType === 'screenshot' ? 'Screenshot' : 'Document',
          description: `${evidenceType === 'screenshot' ? 'Screenshots' : 'Documents'} are acceptable evidence when they show clear technical proof with timestamps and organizational identifiers.`,
          icon: FileCheck,
          badgeClass: 'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200',
          iconColor: 'text-yellow-600'
        };
      case 'attestation':
      case 'link':
        return {
          strength: 'weak',
          label: evidenceType === 'attestation' ? 'Attestation Only' : 'External Link',
          description: 'Attestations and links are the weakest form of evidence. OCR prefers technical proof over written statements. Use with supporting documentation.',
          icon: AlertTriangle,
          badgeClass: 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200',
          iconColor: 'text-orange-600'
        };
      default:
        return {
          strength: 'acceptable',
          label: 'Document',
          description: 'Standard documentation evidence.',
          icon: FileCheck,
          badgeClass: 'bg-zinc-100 text-zinc-700 border-zinc-300 hover:bg-zinc-200',
          iconColor: 'text-zinc-600'
        };
    }
  };

  const info = getStrengthInfo();
  const Icon = info.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            className={`${info.badgeClass} cursor-help border ${className || ''}`}
          >
            <Icon className={`w-3 h-3 mr-1.5 ${info.iconColor}`} />
            {info.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="font-semibold mb-1">Evidence Strength: {info.strength.toUpperCase()}</p>
          <p className="text-sm">{info.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
