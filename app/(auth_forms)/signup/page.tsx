'use client';

// Force dynamic rendering to prevent build-time prerendering errors with useSearchParams
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { signUp } from '@/utils/auth-helpers/server';
import { handleRequest } from '@/utils/auth-helpers/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { AuthStatusHandler } from '@/components/auth-status-handler';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Save redirect parameter to localStorage if present
  useEffect(() => {
    const redirect = searchParams.get('redirect');
    if (redirect === 'checkout') {
      localStorage.setItem('signup_redirect', 'checkout');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true); // Disable the button while the request is being handled
    await handleRequest(e, signUp, router);
    setIsSubmitting(false);
  };

  return (
    <div className="flex min-h-[100dvh] bg-[#f3f5f9]">
      {/* Left Side - Signup Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-8 lg:px-12 xl:px-16 bg-[#0d1122]">
        <div className="w-full max-w-md mx-auto space-y-8">
          {/* Back Button */}
          <Link
            href="/signin"
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
              Create your account
            </h2>
            <p className="text-zinc-400 font-geologica font-light text-base">
              Get started with HIPAA compliance in minutes
            </p>
          </div>

          {/* Signup Form */}
          <form
            noValidate={true}
            className="space-y-5"
            onSubmit={(e) => handleSubmit(e)}
          >
            {/* Hidden input to pass redirect parameter */}
            {searchParams.get('redirect') === 'checkout' && (
              <input type="hidden" name="redirect" value="checkout" />
            )}
            
            <div className="space-y-2">
              <Label htmlFor="name" className="text-zinc-300 font-geologica font-light text-sm">
                Full name
              </Label>
              <Input
                id="name"
                type="text"
                name="name"
                placeholder="John Doe"
                required
                className="h-12 bg-white/10 border-zinc-600 text-white placeholder:text-zinc-500 rounded-lg font-geologica font-light focus:border-[#1ad07a] focus:ring-[#1ad07a] focus:bg-white/15"
              />
            </div>
            
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
              <Label htmlFor="phone_number" className="text-zinc-300 font-geologica font-light text-sm">
                Phone Number
              </Label>
              <Input
                id="phone_number"
                type="tel"
                name="phone_number"
                placeholder="(555) 123-4567"
                autoComplete="tel"
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
                  placeholder="Create a strong password"
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

            <Button 
              type="submit" 
              className="w-full h-12 bg-[#1ad07a] text-[#0d1122] font-geologica font-medium hover:bg-[#1ad07a]/90 rounded-lg text-base"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating account...' : 'Create account →'}
            </Button>
          </form>

          {/* Sign In Link */}
          <div className="text-center pt-4">
            <p className="text-zinc-400 font-geologica font-light text-sm">
              Already have an account?{' '}
              <Link
                href="/signin"
                className="text-[#1ad07a] hover:text-[#1ad07a]/80 font-medium transition-colors"
                prefetch={false}
              >
                Sign in
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


export default function SignUp() {
  return (
    <>
      <Suspense fallback={null}>
        <AuthStatusHandler />
      </Suspense>
      <Suspense fallback={<div className="flex min-h-[100dvh] bg-[#f3f5f9] items-center justify-center"><div className="text-white">Loading...</div></div>}>
        <SignUpContent />
      </Suspense>
    </>
  );
}
