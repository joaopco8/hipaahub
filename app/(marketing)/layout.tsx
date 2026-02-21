import { AuthStatusHandler } from '@/components/auth-status-handler';
import React, { Suspense } from 'react';

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export default function MarketingLayout({
  children
}: MarketingLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col w-full bg-white">
      <Suspense fallback={null}>
        <AuthStatusHandler />
      </Suspense>
      {children}
    </div>
  );
}
