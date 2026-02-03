'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { requestPasswordUpdate } from '@/utils/auth-helpers/server';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email || !email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('email', email.trim());
      
      const redirectPath = await requestPasswordUpdate(formData);
      
      // Check if success or error based on redirect path
      if (redirectPath.includes('status=success')) {
        toast.success('Password reset email sent', {
          description: 'Please check your email for a password reset link.'
        });
        
        // Clear the form
        setEmail('');
        
        // Optionally redirect after a delay
        setTimeout(() => {
          router.push('/signin');
        }, 3000);
      } else if (redirectPath.includes('error=')) {
        // Extract error message from URL
        const url = new URL(redirectPath, window.location.origin);
        const errorMessage = url.searchParams.get('error_description') || 'Failed to send reset email';
        toast.error('Error', {
          description: errorMessage
        });
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('Something went wrong', {
        description: 'Please try again later.'
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
              <h2 className="text-2xl font-bold">Forgot Password</h2>
              <p className="text-muted-foreground my-2">
                Enter your email to reset your password
              </p>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Reset Password'}
              </Button>
            </form>
            <div className="text-center text-sm text-muted-foreground">
              <span>We&apos;ll send you a password reset link</span>
            </div>
            <div className="flex justify-center">
              <Link
                href="/signin"
                className="text-sm font-medium hover:underline underline-offset-4"
                prefetch={false}
              >
                Remember your password? Sign in
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
