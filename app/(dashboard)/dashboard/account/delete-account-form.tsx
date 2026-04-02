'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { deleteAccount } from './delete-account-action';
import { Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

function DeleteAccountFormInner() {
  const [password, setPassword] = useState('');
  const [deleteWord, setDeleteWord] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOAuthUser, setIsOAuthUser] = useState(false);
  const [googleVerified, setGoogleVerified] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuthMethod = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const hasOAuthIdentity = user.identities?.some(
          (identity: any) => identity.provider && identity.provider !== 'email'
        );
        const isOAuth =
          user.app_metadata?.provider === 'google' || hasOAuthIdentity || false;
        setIsOAuthUser(isOAuth);
      }
    };
    checkAuthMethod();
  }, [supabase]);

  useEffect(() => {
    if (searchParams.get('confirm_delete') === 'true') {
      setGoogleVerified(true);
      setShowDialog(true);
      router.replace('/dashboard/account');
    }
  }, [searchParams, router]);

  const handleGoogleVerify = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard/account?confirm_delete=true`,
      },
    });
  };

  const handleSubmit = async () => {
    if (deleteWord !== 'DELETE') return;
    if (isOAuthUser && !googleVerified) return;
    if (!isOAuthUser && !password) return;

    setIsSubmitting(true);
    setPasswordError('');

    try {
      const formData = new FormData();
      formData.append('deleteWord', deleteWord);
      if (isOAuthUser) {
        formData.append('googleVerified', 'true');
      } else {
        formData.append('password', password);
      }

      const result = await deleteAccount(formData);

      if (result && typeof result === 'object' && 'error' in result) {
        setPasswordError(String(result.error));
        setIsSubmitting(false);
      }
      // If redirect, Next.js handles navigation automatically
    } catch {
      setIsSubmitting(false);
    }
  };

  const deleteWordCorrect = deleteWord === 'DELETE';
  const canDelete =
    deleteWordCorrect && (isOAuthUser ? googleVerified : !!password);

  return (
    <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="destructive" className="w-full">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Account
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-semibold text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6" />
            Delete Account Permanently?
          </AlertDialogTitle>

          <AlertDialogDescription asChild>
            <div className="space-y-4 pt-4">
              {/* Warning */}
              <div className="space-y-3">
                <p className="text-base text-zinc-900 font-medium">
                  Are you absolutely sure? This action cannot be undone.
                </p>
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <strong>Warning:</strong> This will permanently delete:
                  </AlertDescription>
                </Alert>
                <ul className="list-disc list-inside space-y-2 text-sm text-zinc-700 ml-4">
                  <li>All your organization data and settings</li>
                  <li>All HIPAA policies and documents</li>
                  <li>All risk assessments and compliance records</li>
                  <li>All evidence files and uploads</li>
                  <li>All staff member records and training certificates</li>
                  <li>All action items and compliance commitments</li>
                  <li>Your subscription and billing information</li>
                  <li>Your account and all associated data</li>
                </ul>
                <p className="text-sm text-zinc-600 pt-2">
                  This action is <strong>permanent and irreversible</strong>.
                </p>
              </div>

              {/* Verification section */}
              <div className="space-y-4 pt-4 border-t border-zinc-200">
                {isOAuthUser ? (
                  /* Google users — re-authenticate with Google */
                  <div className="space-y-3">
                    <Label className="text-zinc-900 font-medium">
                      Step 1 — Verify your Google account
                    </Label>
                    <p className="text-xs text-zinc-500">
                      Since your account uses Google login, you must re-verify
                      with Google before deleting.
                    </p>
                    {googleVerified ? (
                      <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                        <CheckCircle2 className="h-4 w-4" />
                        Google account verified
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGoogleVerify}
                        className="w-full border-zinc-300 gap-2"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Verify with Google
                      </Button>
                    )}
                  </div>
                ) : (
                  /* Password users — enter current password */
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-zinc-900 font-medium">
                      Step 1 — Enter your password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordError('');
                      }}
                      placeholder="Enter your account password"
                      className={`border-zinc-200 focus:border-red-500 ${
                        passwordError ? 'border-red-500' : ''
                      }`}
                      disabled={isSubmitting}
                    />
                    {passwordError && (
                      <p className="text-sm text-red-600">{passwordError}</p>
                    )}
                  </div>
                )}

                {/* Type DELETE */}
                <div className="space-y-2">
                  <Label htmlFor="deleteWord" className="text-zinc-900 font-medium">
                    {isOAuthUser ? 'Step 2' : 'Step 2'} — Type{' '}
                    <span className="font-mono bg-zinc-100 px-1 py-0.5 rounded text-red-600">
                      DELETE
                    </span>{' '}
                    to confirm
                  </Label>
                  <Input
                    id="deleteWord"
                    type="text"
                    value={deleteWord}
                    onChange={(e) => setDeleteWord(e.target.value)}
                    placeholder="Type DELETE"
                    className={`font-mono tracking-widest border-zinc-200 ${
                      deleteWordCorrect
                        ? 'border-green-500 focus:border-green-500'
                        : ''
                    }`}
                    disabled={isSubmitting || (isOAuthUser && !googleVerified)}
                    autoComplete="off"
                  />
                  {deleteWord && !deleteWordCorrect && (
                    <p className="text-sm text-red-600">
                      Type DELETE in uppercase to confirm
                    </p>
                  )}
                  {deleteWordCorrect && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Confirmed
                    </p>
                  )}
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex-col sm:flex-row gap-3">
          <AlertDialogCancel
            onClick={() => {
              setShowDialog(false);
              setPassword('');
              setDeleteWord('');
              setPasswordError('');
              if (!searchParams.get('confirm_delete')) setGoogleVerified(false);
            }}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Cancel
          </AlertDialogCancel>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!canDelete || isSubmitting}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
          >
            {isSubmitting ? (
              'Deleting Account...'
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account Permanently
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function DeleteAccountForm() {
  return (
    <Suspense fallback={null}>
      <DeleteAccountFormInner />
    </Suspense>
  );
}
