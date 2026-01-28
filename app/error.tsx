'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-extralight">Something went wrong!</h2>
        <p className="text-muted-foreground">
          {error.message || 'An unexpected error occurred'}
        </p>
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-[#1ad07a] px-4 py-2 text-sm font-extralight text-[#0c0b1d]"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
