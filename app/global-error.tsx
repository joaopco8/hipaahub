'use client';

import { useEffect } from 'react';

/**
 * Global error boundary for failures that happen in the root layout.
 * Keep this file dependency-free (no design-system imports) to avoid cascading failures.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('GlobalError:', error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: 'var(--font-geologica), system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
          background: '#0c0b1d',
          color: '#ffffff',
        }}
      >
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div style={{ maxWidth: 720, width: '100%' }}>
            <div style={{ fontSize: 20, fontWeight: 200, marginBottom: 8 }}>
              Something went wrong
            </div>
            <div style={{ fontSize: 14, fontWeight: 200, opacity: 0.8, marginBottom: 16 }}>
              {error?.message || 'An unexpected error occurred.'}
            </div>
            <button
              type="button"
              onClick={reset}
              style={{
                fontWeight: 200,
                background: '#1ad07a',
                color: '#0c0b1d',
                border: 'none',
                borderRadius: 10,
                padding: '10px 14px',
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

