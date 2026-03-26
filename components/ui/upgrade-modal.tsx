'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lock, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  featureName?: string;
}

export function UpgradeModal({ open, onClose, featureName = 'this feature' }: UpgradeModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md rounded-none border-0 shadow-xl">
        <DialogHeader className="text-center items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0e274e]/10">
            <Lock className="h-5 w-5 text-[#0e274e]" />
          </div>
          <DialogTitle className="text-[#0e274e] font-normal text-xl">
            Export requires an active plan
          </DialogTitle>
          <DialogDescription className="text-center text-gray-500 font-light">
            Everything you&apos;ve built in HIPAA Hub is ready to download. Activate a plan to
            export PDFs, certificates, and your full audit package.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-4">
          <Link href="/select-plan" onClick={onClose}>
            <Button className="w-full bg-[#0e274e] text-white hover:bg-[#0e274e]/90 rounded-none font-light h-10">
              <Sparkles className="h-4 w-4 mr-2" />
              See plans →
            </Button>
          </Link>
          <Button
            variant="ghost"
            className="w-full rounded-none font-light text-gray-500 h-10"
            onClick={onClose}
          >
            Continue trial
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
