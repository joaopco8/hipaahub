'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle2 } from 'lucide-react';
import { autoCreateFromRiskGaps, type MitigationPriority } from '@/app/actions/mitigation';
import { toast } from 'sonner';
import Link from 'next/link';

interface Gap {
  title: string;
  description: string | null;
  priority: string;
}

interface Props {
  gaps: Gap[];
}

export function CreateMitigationButton({ gaps }: Props) {
  const [pending, startTransition] = useTransition();
  const [created, setCreated] = useState(0);

  const eligibleGaps = gaps.filter(
    (g) => g.priority === 'critical' || g.priority === 'high' || g.priority === 'medium'
  );

  if (eligibleGaps.length === 0) return null;

  const handleCreate = () => {
    startTransition(async () => {
      try {
        const mapped = eligibleGaps.map((g) => ({
          title: g.title,
          description: g.description ?? '',
          priority: (g.priority === 'critical' ? 'high' : g.priority) as MitigationPriority,
        }));
        const n = await autoCreateFromRiskGaps(mapped);
        setCreated(n);
        toast.success(`${n} mitigation item${n !== 1 ? 's' : ''} created`);
      } catch (err: any) {
        toast.error(err.message ?? 'Failed to create items');
      }
    });
  };

  if (created > 0) {
    return (
      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-none">
        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
        <span className="text-sm text-green-700 font-light">
          {created} mitigation item{created !== 1 ? 's' : ''} created —{' '}
          <Link href="/dashboard/mitigation" className="underline hover:text-green-900">
            view in Mitigation Workflow →
          </Link>
        </span>
      </div>
    );
  }

  return (
    <Button
      onClick={handleCreate}
      disabled={pending}
      size="sm"
      className="rounded-none bg-[#0e274e] text-white hover:bg-[#0e274e]/90 text-xs h-8"
    >
      <Shield className="h-3.5 w-3.5 mr-1.5" />
      {pending
        ? 'Creating…'
        : `Create ${eligibleGaps.length} mitigation task${eligibleGaps.length !== 1 ? 's' : ''} from gaps`}
    </Button>
  );
}
