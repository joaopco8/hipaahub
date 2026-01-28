'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface SavingStateContextType {
  isSaving: boolean;
  setIsSaving: (saving: boolean) => void;
}

const SavingStateContext = createContext<SavingStateContextType | undefined>(
  undefined
);

export function SavingStateProvider({ children }: { children: ReactNode }) {
  const [isSaving, setIsSaving] = useState(false);

  return (
    <SavingStateContext.Provider value={{ isSaving, setIsSaving }}>
      {children}
    </SavingStateContext.Provider>
  );
}

export function useSavingState() {
  const context = useContext(SavingStateContext);
  if (context === undefined) {
    throw new Error('useSavingState must be used within SavingStateProvider');
  }
  return context;
}








