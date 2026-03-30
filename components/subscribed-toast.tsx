'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';

/**
 * Shows a one-time success toast when ?subscribed=true is in the URL,
 * then removes the param from the URL without a full page reload.
 */
export function SubscribedToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (searchParams.get('subscribed') === 'true') {
      toast.success('Subscription active. All features are now unlocked.', {
        duration: 6000,
      });
      // Remove the param from URL
      const params = new URLSearchParams(searchParams.toString());
      params.delete('subscribed');
      const newUrl = params.toString() ? `${pathname}?${params}` : pathname;
      router.replace(newUrl);
    }
  }, [searchParams, pathname, router]);

  return null;
}
