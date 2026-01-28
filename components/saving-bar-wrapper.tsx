'use client';

import { SavingBar } from '@/components/ui/saving-bar';
import { useSavingState } from '@/hooks/use-saving-state';

export function SavingBarWrapper() {
  const { isSaving } = useSavingState();
  return <SavingBar isSaving={isSaving} />;
}








