'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronDown, PenLine } from 'lucide-react';
import { updatePolicyStatus } from '@/app/actions/policy-documents';
import { useRouter } from 'next/navigation';
import {
  canTransition,
  getAllowedTransitions,
  requiresSignature,
  STATUS_LABELS,
  type PolicyStatus,
} from '@/lib/policy-transitions';

interface PolicyStatusActionsProps {
  policyId: number;
  currentStatus: string;
}

export function PolicyStatusActions({ policyId, currentStatus }: PolicyStatusActionsProps) {
  const router = useRouter();
  const [signatureOpen, setSignatureOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<PolicyStatus | null>(null);
  const [signatureName, setSignatureName] = useState('');
  const [nextReviewDate, setNextReviewDate] = useState(
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus: PolicyStatus) => {
    if (requiresSignature(currentStatus as PolicyStatus, newStatus)) {
      setPendingStatus(newStatus);
      setSignatureOpen(true);
      return;
    }
    setLoading(true);
    try {
      await updatePolicyStatus(policyId, newStatus);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    if (!signatureName.trim() || !pendingStatus) return;
    setLoading(true);
    try {
      await updatePolicyStatus(policyId, pendingStatus, signatureName.trim(), nextReviewDate);
      setSignatureOpen(false);
      setSignatureName('');
      setPendingStatus(null);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert('Failed to activate policy. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const availableStatuses = getAllowedTransitions(currentStatus as PolicyStatus);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-none border-gray-200 text-[#565656] hover:text-[#0e274e]"
            disabled={loading || availableStatuses.length === 0}
          >
            <PenLine className="mr-1.5 h-3.5 w-3.5" />
            Status
            <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-none">
          {availableStatuses.map(s => (
            <DropdownMenuItem
              key={s}
              onClick={() => handleStatusChange(s)}
              className="font-light text-sm cursor-pointer"
            >
              {requiresSignature(currentStatus as PolicyStatus, s) && (
                <span className="mr-2">✍️</span>
              )}
              Set as {STATUS_LABELS[s]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Electronic Signature Dialog */}
      <Dialog
        open={signatureOpen}
        onOpenChange={(open) => {
          setSignatureOpen(open);
          if (!open) {
            setSignatureName('');
            setPendingStatus(null);
          }
        }}
      >
        <DialogContent className="bg-white rounded-none max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#0e274e] font-light text-xl">
              Activate Policy — Electronic Signature
            </DialogTitle>
            <DialogDescription className="text-[#565656] font-light text-sm">
              By signing, you confirm this policy has been reviewed and approved.
              Your name will be recorded as the electronic signature.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-[#0e274e] font-light text-sm">
                Full Name (Electronic Signature) *
              </Label>
              <Input
                value={signatureName}
                onChange={e => setSignatureName(e.target.value)}
                placeholder="Enter your full name to sign"
                className="rounded-none"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#0e274e] font-light text-sm">
                Next Annual Review Date
              </Label>
              <Input
                type="date"
                value={nextReviewDate}
                onChange={e => setNextReviewDate(e.target.value)}
                className="rounded-none"
              />
            </div>

            <p className="text-xs text-gray-400 border-l-2 border-gray-200 pl-3">
              This constitutes a legally binding electronic signature under ESIGN Act.
              Timestamp and user identity will be recorded in the audit log.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSignatureOpen(false);
                  setSignatureName('');
                  setPendingStatus(null);
                }}
                className="rounded-none"
              >
                Cancel
              </Button>
              <Button
                onClick={handleActivate}
                disabled={!signatureName.trim() || loading}
                className="bg-[#71bc48] text-white hover:bg-[#5ea03a] rounded-none"
              >
                {loading ? 'Signing...' : 'Sign & Activate Policy'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
