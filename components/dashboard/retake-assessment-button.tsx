'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { retakeOnboarding } from '@/app/actions/retake-onboarding';

export function RetakeAssessmentButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await retakeOnboarding();
      // The redirect happens in the server action
    } catch (error) {
      console.error('Error retaking onboarding:', error);
      alert('Failed to reset assessment. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full border-zinc-300 hover:bg-zinc-50 text-zinc-700"
          disabled={isLoading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Resetting...' : 'Retake Risk Assessment'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md border-zinc-200 bg-white shadow-xl">
        <AlertDialogHeader className="text-left">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 shrink-0">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <AlertDialogTitle className="text-xl font-semibold text-zinc-900 mb-2">
                Warning: Data Will Be Lost
              </AlertDialogTitle>
              <AlertDialogDescription className="text-zinc-600 text-sm leading-relaxed">
                Retaking the assessment will permanently delete all previous onboarding data, including:
              </AlertDialogDescription>
            </div>
          </div>
          <div className="ml-16 space-y-2">
            <ul className="list-disc list-inside space-y-1.5 text-sm text-zinc-700">
              <li>Previous risk assessment answers</li>
              <li>All action items and their progress</li>
              <li>Staff member records</li>
              <li>Compliance commitment status</li>
            </ul>
            <div className="pt-3 mt-3 border-t border-zinc-200">
              <p className="text-sm font-medium text-zinc-900">
                This action cannot be undone. Are you sure you want to continue?
              </p>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row justify-end gap-3 sm:gap-3 mt-6">
          <AlertDialogCancel 
            disabled={isLoading}
            className="border-zinc-300 text-zinc-700 hover:bg-zinc-50"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-[#00bceb] hover:bg-[#00bceb]/90 text-white rounded-none font-bold"
          >
            {isLoading ? 'Resetting...' : 'Yes, Reset Assessment'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

