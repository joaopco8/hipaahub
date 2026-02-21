'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Onboarding Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 bg-[#f3f5f9]">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-light text-[#0e274e]">Something went wrong!</h2>
        <p className="text-[#565656] font-light">
          {error.message || 'An unexpected error occurred'}
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={reset} className="bg-[#00bceb] text-white hover:bg-[#00bceb]/90 rounded-none font-bold">
            Try again
          </Button>
          <Button asChild variant="outline" className="border-gray-300 hover:bg-gray-50 rounded-none font-light text-[#565656]">
            <Link href="/onboarding">Restart onboarding</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
