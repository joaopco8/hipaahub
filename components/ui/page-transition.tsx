'use client';

import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: React.ReactNode;
}

/**
 * Simple page transition wrapper
 * Removed complex state management to avoid React DOM errors
 * The transition is now handled purely by CSS
 */
export function PageTransition({ children }: PageTransitionProps) {
  // Just track pathname for key-based remounting if needed
  const pathname = usePathname();

  return (
    <div key={pathname} className="page-transition">
      {children}
    </div>
  );
}








