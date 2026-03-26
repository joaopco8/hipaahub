'use client';

import { Lock, ArrowRight, X } from 'lucide-react';
import Link from 'next/link';

interface TrialActionModalProps {
  open: boolean;
  onClose: () => void;
  documentType?: string;
  /** When true, hides "Continue trial" (used when subscription is expired, not actively trialing). */
  isExpired?: boolean;
}

export function TrialActionModal({ open, onClose, documentType, isExpired = false }: TrialActionModalProps) {
  if (!open) return null;

  const body = isExpired
    ? documentType
      ? `Your ${documentType} was built during your trial. Subscribe to download it and reactivate your compliance infrastructure.`
      : 'Your trial has ended. Subscribe to regain access to exports and finalization.'
    : documentType
      ? `Your ${documentType} is ready — you built it during your trial. Subscribe to download it and keep your compliance infrastructure active after the trial ends.`
      : 'This action requires an active HIPAA Hub subscription.';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white border border-gray-200 shadow-2xl w-full max-w-md mx-4 p-8 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#0e274e]/10">
          <Lock className="h-7 w-7 text-[#0e274e]" />
        </div>

        <h3 className="text-xl font-light text-[#0e274e] mb-3">
          This requires an active plan
        </h3>
        <p className="text-sm text-gray-500 font-light leading-relaxed mb-6">{body}</p>

        <div className="flex flex-col gap-3">
          <Link href="/select-plan" onClick={onClose}>
            <button className="w-full bg-[#00bceb] hover:bg-[#00a8d4] text-white text-sm font-light px-5 py-3 flex items-center justify-center gap-2 transition-colors">
              See plans
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
          {!isExpired && (
            <button
              onClick={onClose}
              className="text-sm text-gray-400 hover:text-gray-600 font-light transition-colors"
            >
              Continue trial
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
