'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { createClient } from '@/utils/supabase/client';

export function LogOutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogOut = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/signin');
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-center border-zinc-300 text-zinc-700 hover:bg-zinc-50"
          disabled={isLoading}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isLoading ? 'Signing out…' : 'Log out'}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="max-w-md border-zinc-200 bg-white">
        <AlertDialogHeader>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-yellow-50 border border-yellow-200 shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <AlertDialogTitle className="text-zinc-900">Log out?</AlertDialogTitle>
              <AlertDialogDescription className="text-zinc-600">
                You will be signed out of HIPAA Hub on this device.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row justify-end gap-3 sm:gap-3">
          <AlertDialogCancel
            disabled={isLoading}
            className="border-zinc-300 text-zinc-700 hover:bg-zinc-50"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleLogOut}
            disabled={isLoading}
            className="bg-[#1ad07a] hover:bg-[#1ad07a]/90 text-[#0c0b1d]"
          >
            {isLoading ? 'Signing out…' : 'Log out'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

