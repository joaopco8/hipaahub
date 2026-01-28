'use client';

import { SavingBar } from '@/components/ui/saving-bar';
import { useSavingState } from '@/hooks/use-saving-state';

export function SavingBarGlobal() {
  try {
    const { isSaving } = useSavingState();
    return <SavingBar isSaving={isSaving} />;
  } catch {
    // Provider not available, return null
    return null;
  }
}








