'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { TrialActionModal } from '@/components/trial-action-modal';

interface PolicyEditButtonProps {
  policyId: number;
  isGenerated: boolean;
  isLocked: boolean;
}

export function PolicyEditButton({ policyId, isGenerated, isLocked }: PolicyEditButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const label = isGenerated ? 'Edit' : 'Open Editor';

  if (isLocked) {
    return (
      <>
        <Button
          size="sm"
          onClick={() => setShowModal(true)}
          className="h-8 rounded-none bg-[#00bceb] text-white hover:bg-[#00a0c9] font-light"
        >
          <Pencil className="mr-2 h-3.5 w-3.5" />
          {label}
        </Button>
        <TrialActionModal
          open={showModal}
          onClose={() => setShowModal(false)}
          documentType="policy editor"
          isExpired={false}
        />
      </>
    );
  }

  return (
    <Link href={`/dashboard/policies/${policyId}/edit`}>
      <Button
        size="sm"
        className="h-8 rounded-none bg-[#00bceb] text-white hover:bg-[#00a0c9] font-light"
      >
        <Pencil className="mr-2 h-3.5 w-3.5" />
        {label}
      </Button>
    </Link>
  );
}
