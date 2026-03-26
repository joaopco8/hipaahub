'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface TrialBannerProps {
  daysRemaining: number;
}

export function TrialBanner({ daysRemaining }: TrialBannerProps) {
  // Start hidden to prevent hydration flash, reveal after checking sessionStorage
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('trial_banner_dismissed') === 'true';
    if (!dismissed) setVisible(true);
  }, []);

  if (!visible) return null;

  const handleDismiss = () => {
    sessionStorage.setItem('trial_banner_dismissed', 'true');
    setVisible(false);
  };

  const message =
    daysRemaining <= 1
      ? 'Your free trial expires tomorrow. Upgrade now to keep your compliance work.'
      : `You're on a free trial — ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining. Exporting, downloading, and finalizing requires an active plan.`;

  return (
    <div className="bg-[#0e274e] text-white px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 shrink-0 z-10">
      <div className="flex items-center gap-3 min-w-0">
        <AlertTriangle className="h-4 w-4 text-[#00bceb] shrink-0" />
        <p className="text-xs sm:text-sm font-light truncate">{message}</p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <Link
          href="/select-plan"
          className="text-[#00bceb] hover:text-white text-xs sm:text-sm font-light flex items-center gap-1 transition-colors whitespace-nowrap"
        >
          Upgrade now
          <ArrowRight className="h-3 w-3" />
        </Link>
        <button
          onClick={handleDismiss}
          className="text-white/40 hover:text-white/80 transition-colors"
          aria-label="Dismiss trial banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
