'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, ArrowLeft } from 'lucide-react';
import { Suspense } from 'react';
import { AuthStatusHandler } from '@/components/auth-status-handler';

function ConfirmEmailContent() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/signin"
          className="rounded-md p-2 transition-colors hover:bg-muted"
          prefetch={false}
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Link>
        <div />
      </div>
      <div className="flex items-center justify-center flex-1">
        <Card className="w-full max-w-md">
          <CardContent className="grid gap-4 px-4 pb-4 my-10">
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Check your email</h2>
                <p className="text-muted-foreground">
                  We've sent a confirmation link to your email address. Please check your inbox and click the link to verify your account.
                </p>
              </div>
              <div className="space-y-2 pt-4">
                <p className="text-sm text-muted-foreground">
                  Didn't receive the email? Check your spam folder or try signing up again.
                </p>
                <div className="flex flex-col gap-2">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/signin">Back to Sign In</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/signup">Try Again</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <>
      <Suspense fallback={null}>
        <AuthStatusHandler />
      </Suspense>
      <ConfirmEmailContent />
    </>
  );
}
