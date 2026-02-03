'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { updatePassword } from '@/utils/auth-helpers/server';
import { toast } from 'sonner';
import { Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  // Password strength validation
  const passwordRequirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Contains number', met: /\d/.test(password) },
    { label: 'Contains special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) }
  ];

  const passwordsMatch = password === passwordConfirm && password.length > 0;
  const allRequirementsMet = passwordRequirements.every(req => req.met);
  const isFormValid = allRequirementsMet && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!password || !passwordConfirm) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password !== passwordConfirm) {
      toast.error('Passwords do not match');
      return;
    }

    if (!allRequirementsMet) {
      toast.error('Password does not meet requirements');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('password', password);
      formData.append('passwordConfirm', passwordConfirm);
      
      const redirectPath = await updatePassword(formData);
      
      // Check if success or error based on redirect path
      if (redirectPath.includes('status=success')) {
        toast.success('Password updated successfully', {
          description: 'You can now sign in with your new password.'
        });
        
        // Clear the form
        setPassword('');
        setPasswordConfirm('');
        
        // Redirect to signin after success
        setTimeout(() => {
          router.push('/signin');
        }, 2000);
      } else if (redirectPath.includes('error=')) {
        // Extract error message from URL
        const url = new URL(redirectPath, window.location.origin);
        const errorMessage = url.searchParams.get('error_description') || 'Failed to update password';
        toast.error('Error', {
          description: errorMessage
        });
      }
    } catch (error) {
      console.error('Password update error:', error);
      toast.error('Something went wrong', {
        description: 'Please try again or request a new reset link.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/signin"
          className="rounded-md p-2 transition-colors hover:bg-muted"
          prefetch={false}
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Link>
        <div />
      </div>
      <div className="flex items-center justify-center flex-1">
        <Card className="w-full max-w-md">
          <CardContent className="grid gap-4 px-4 pb-4 my-10">
            <div className="space-y-1 text-center">
              <h2 className="text-2xl font-bold">Update Password</h2>
              <p className="text-muted-foreground my-2">
                Enter your new password below
              </p>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {password.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-zinc-700">Password requirements:</p>
                  <ul className="space-y-1">
                    {passwordRequirements.map((req, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        {req.met ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-zinc-400" />
                        )}
                        <span className={req.met ? 'text-green-600' : 'text-zinc-500'}>
                          {req.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="passwordConfirm">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="passwordConfirm"
                    type={showPasswordConfirm ? 'text' : 'password'}
                    placeholder="Confirm your new password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    disabled={isLoading}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPasswordConfirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {passwordConfirm.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    {passwordsMatch ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-green-600">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-red-600">Passwords do not match</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !isFormValid}
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
            <div className="text-center text-sm text-muted-foreground">
              <span>Your password will be securely updated</span>
            </div>
            <div className="flex justify-center">
              <Link
                href="/signin"
                className="text-sm font-medium hover:underline underline-offset-4"
                prefetch={false}
              >
                Back to Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ArrowLeftIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}
