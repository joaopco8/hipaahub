'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

export function AuthStatusHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const status = searchParams.get('status');
    const statusDescription = searchParams.get('status_description');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    const redirect = searchParams.get('redirect');

    if (status || error) {
      // Show toast notification
      if (status) {
        toast({
          title: status,
          description: statusDescription || undefined
        });
      } else if (error) {
        toast({
          title: error,
          description: errorDescription || undefined,
          variant: 'destructive'
        });
      }

      // Clean up URL by removing toast parameters but preserve redirect
      let newUrl = window.location.pathname;
      if (redirect) {
        newUrl += `?redirect=${redirect}`;
      }
      router.replace(newUrl);
    }
  }, [searchParams, router, toast]);

  return null;
}

