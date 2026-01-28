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
    console.error('Marketing Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 bg-white">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-extralight">Something went wrong!</h2>
        <p className="text-zinc-600 font-extralight">
          {error.message || 'An unexpected error occurred'}
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={reset} variant="default" className="font-extralight">
            Try again
          </Button>
          <Button asChild variant="outline" className="font-extralight">
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
