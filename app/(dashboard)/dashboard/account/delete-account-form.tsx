'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { Checkbox } from '@/components/ui/checkbox';
import { deleteAccount } from './delete-account-action';
import { Trash2, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export function DeleteAccountForm() {
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const [confirmationEmail2, setConfirmationEmail2] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOAuthUser, setIsOAuthUser] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Check if user is OAuth
    const checkAuthMethod = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || '');
        // Check if OAuth user (no password or has Google provider)
        const hasOAuthIdentity = user.identities?.some((identity: any) => 
          identity.provider && identity.provider !== 'email'
        );
        const oauthCheck = user.app_metadata?.provider === 'google' || hasOAuthIdentity || false;
        setIsOAuthUser(oauthCheck);
        if (oauthCheck) {
          // Pre-fill email for OAuth users
          setConfirmationEmail(user.email || '');
          setConfirmationEmail2(user.email || '');
        }
      }
    };
    checkAuthMethod();
  }, [supabase]);

  const handleSubmit = async () => {
    if (!confirmDelete) {
      return;
    }

    if (isOAuthUser) {
      if (!confirmationEmail || !confirmationEmail2) {
        return;
      }
      if (confirmationEmail !== confirmationEmail2) {
        return;
      }
    } else {
      if (!password1 || !password2) {
        return;
      }
      if (password1 !== password2) {
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      if (isOAuthUser) {
        formData.append('confirmationEmail', confirmationEmail);
        formData.append('confirmationEmail2', confirmationEmail2);
      } else {
        formData.append('password1', password1);
        formData.append('password2', password2);
      }
      
      const result = await deleteAccount(formData);
      
      // If result is a redirect, the server action will handle it
      if (typeof result === 'string' && result.startsWith('/')) {
        router.push(result);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      setIsSubmitting(false);
      setShowDialog(false);
    }
  };

  const passwordsMatch = password1 && password2 && password1 === password2;
  const passwordsDontMatch = password1 && password2 && password1 !== password2;
  const emailsMatch = confirmationEmail && confirmationEmail2 && confirmationEmail === confirmationEmail2;
  const emailsDontMatch = confirmationEmail && confirmationEmail2 && confirmationEmail !== confirmationEmail2;
  const emailMatchesAccount = confirmationEmail.toLowerCase() === userEmail.toLowerCase();

  const canDelete = isOAuthUser
    ? (emailsMatch && emailMatchesAccount && confirmDelete && confirmationEmail && confirmationEmail2)
    : (passwordsMatch && confirmDelete && password1 && password2);

  return (
    <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="destructive"
          className="w-full"
        >
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
          <AlertDialogDescription className="space-y-4 pt-4">
            <div className="space-y-3">
              <p className="text-base text-zinc-900 font-medium">
                Are you absolutely sure you want to delete your account? This action cannot be undone.
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
                This action is <strong>permanent and irreversible</strong>. Once deleted, you will not be able to recover any of your data.
              </p>
            </div>

            {/* Password/Email Confirmation */}
            <div className="space-y-4 pt-4 border-t border-zinc-200">
              {isOAuthUser ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="confirmationEmail" className="text-zinc-900">
                      Enter your email address
                    </Label>
                    <Input
                      id="confirmationEmail"
                      name="confirmationEmail"
                      type="email"
                      value={confirmationEmail}
                      onChange={(e) => setConfirmationEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="border-zinc-200 focus:border-red-500 focus:ring-red-500"
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-zinc-600">
                      Since you signed in with Google, please confirm your email address.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmationEmail2" className="text-zinc-900">
                      Confirm your email address
                    </Label>
                    <Input
                      id="confirmationEmail2"
                      name="confirmationEmail2"
                      type="email"
                      value={confirmationEmail2}
                      onChange={(e) => setConfirmationEmail2(e.target.value)}
                      placeholder="Confirm your email address"
                      className={`border-zinc-200 focus:border-red-500 focus:ring-red-500 ${
                        emailsDontMatch ? 'border-red-500' : ''
                      }`}
                      disabled={isSubmitting}
                    />
                    {emailsDontMatch && (
                      <p className="text-sm text-red-600">Email addresses do not match</p>
                    )}
                    {emailsMatch && !emailMatchesAccount && (
                      <p className="text-sm text-red-600">Email does not match your account email</p>
                    )}
                    {emailsMatch && emailMatchesAccount && (
                      <p className="text-sm text-green-600">Email addresses match</p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="password1" className="text-zinc-900">
                      Enter your password
                    </Label>
                    <Input
                      id="password1"
                      name="password1"
                      type="password"
                      value={password1}
                      onChange={(e) => setPassword1(e.target.value)}
                      placeholder="Enter your password"
                      className="border-zinc-200 focus:border-red-500 focus:ring-red-500"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password2" className="text-zinc-900">
                      Confirm your password
                    </Label>
                    <Input
                      id="password2"
                      name="password2"
                      type="password"
                      value={password2}
                      onChange={(e) => setPassword2(e.target.value)}
                      placeholder="Confirm your password"
                      className={`border-zinc-200 focus:border-red-500 focus:ring-red-500 ${
                        passwordsDontMatch ? 'border-red-500' : ''
                      }`}
                      disabled={isSubmitting}
                    />
                    {passwordsDontMatch && (
                      <p className="text-sm text-red-600">Passwords do not match</p>
                    )}
                    {passwordsMatch && (
                      <p className="text-sm text-green-600">Passwords match</p>
                    )}
                  </div>
                </>
              )}

              {/* Confirmation Checkbox */}
              <div className="flex items-start space-x-3 pt-2">
                <Checkbox
                  id="confirmDelete"
                  checked={confirmDelete}
                  onCheckedChange={(checked) => setConfirmDelete(checked === true)}
                  disabled={isSubmitting}
                  className="mt-1"
                />
                <Label
                  htmlFor="confirmDelete"
                  className="text-sm font-medium text-zinc-900 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  I understand that this action is permanent and cannot be undone. I confirm that I want to delete my account and all associated data.
                </Label>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-3">
          <AlertDialogCancel
            onClick={() => {
              setShowDialog(false);
              setPassword1('');
              setPassword2('');
              setConfirmationEmail('');
              setConfirmationEmail2('');
              setConfirmDelete(false);
            }}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            disabled={!canDelete || isSubmitting}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white focus:ring-red-500"
          >
            {isSubmitting ? (
              'Deleting Account...'
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account Permanently
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
