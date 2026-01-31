'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { signInWithOAuth } from '@/utils/auth-helpers/client';
import { handleRequest } from '@/utils/auth-helpers/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { AuthStatusHandler } from '@/components/auth-status-handler';
import { OAuthErrorHandler } from '../oauth-error-handler';
import { GoogleLogo } from '@/components/google-logo';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    const { signInWithPassword } = await import('@/utils/auth-helpers/server');
    await handleRequest(e, signInWithPassword, router);
    setIsSubmitting(false);
  };

  const oAuthProviders = [
    {
      name: 'google',
      displayName: 'Google',
      icon: <GoogleLogo className="w-5 h-5" />
    }
  ];
  
  const handleOAuthSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    await signInWithOAuth(e);
    setIsSubmitting(false);
  };

  return (
    <div className="flex min-h-[100dvh] bg-[#f3f5f9]">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-8 lg:px-12 xl:px-16 bg-[#0d1122]">
        <div className="w-full max-w-md mx-auto space-y-8">
          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-geologica font-light mb-4"
            prefetch={false}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>

          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <Image
              src="/images/logohipa.png"
              alt="HIPAA Hub"
              width={120}
              height={120}
              className="object-contain"
            />
          </div>

          {/* Form Title */}
          <div className="space-y-2">
            <h2 className="text-3xl font-geologica font-light text-white">
              Welcome back
            </h2>
            <p className="text-zinc-400 font-geologica font-light text-base">
              Sign in to access your HIPAA compliance dashboard
            </p>
          </div>

          {/* Login Form */}
          <form
            noValidate={true}
            className="space-y-5"
            onSubmit={handleSubmit}
          >
            {searchParams.get('redirect') === 'checkout' && (
              <input type="hidden" name="redirect" value="checkout" />
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300 font-geologica font-light text-sm">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                required
                className="h-12 bg-white/10 border-zinc-600 text-white placeholder:text-zinc-500 rounded-lg font-geologica font-light focus:border-[#1ad07a] focus:ring-[#1ad07a] focus:bg-white/15"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300 font-geologica font-light text-sm">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  required
                  className="h-12 bg-white/10 border-zinc-600 text-white placeholder:text-zinc-500 rounded-lg font-geologica font-light focus:border-[#1ad07a] focus:ring-[#1ad07a] focus:bg-white/15 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <Link
                href="/forgot_password"
                className="text-[#1ad07a] hover:text-[#1ad07a]/80 font-geologica font-light transition-colors"
                prefetch={false}
              >
                Forgot password?
              </Link>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-[#1ad07a] text-[#0d1122] font-geologica font-medium hover:bg-[#1ad07a]/90 rounded-lg text-base"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : 'Sign in →'}
            </Button>
          </form>

          {/* OAuth Separator */}
          <div className="relative">
            <Separator className="my-6 bg-zinc-700" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-[#0d1122] px-4 text-sm text-zinc-400 font-geologica font-light">
                or
              </span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3">
            {oAuthProviders.map((provider) => (
              <form
                key={provider.name}
                onSubmit={(e) => handleOAuthSubmit(e)}
              >
                <input type="hidden" name="provider" value={provider.name} />
                {searchParams.get('redirect') === 'checkout' && (
                  <input type="hidden" name="redirect" value="checkout" />
                )}
                <Button
                  variant="outline"
                  type="submit"
                  className="w-full h-12 flex items-center justify-center gap-3 border-zinc-600 bg-white/5 hover:bg-white/10 text-white transition-colors rounded-lg font-geologica font-light"
                  disabled={isSubmitting}
                >
                  {provider.icon}
                  <span className="text-[15px]">
                    Continue with {provider.displayName}
                  </span>
                </Button>
              </form>
            ))}
          </div>

          {/* Sign Up Link */}
          <div className="text-center pt-4">
            <p className="text-zinc-400 font-geologica font-light text-sm">
              Don't have an account?{' '}
              <Link
                href="/signup"
                className="text-[#1ad07a] hover:text-[#1ad07a]/80 font-medium transition-colors"
                prefetch={false}
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="relative hidden md:block w-1/2">
        <img
          src="/seguro-rcp-enfermeiro-1920x0-c-default_upscayl_4x_ultramix-balanced-4x.png"
          alt="Healthcare professional using a laptop"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-black/10" />
      </div>
    </div>
  );
}


export default function SignIn() {
  return (
    <>
      <Suspense fallback={null}>
        <AuthStatusHandler />
        <OAuthErrorHandler />
      </Suspense>
      <Suspense fallback={<div className="flex min-h-[100dvh] bg-[#f3f5f9] items-center justify-center"><div className="text-white">Loading...</div></div>}>
        <SignInContent />
      </Suspense>
    </>
  );
}
