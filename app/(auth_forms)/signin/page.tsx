'use client';

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { handleRequest } from '@/utils/auth-helpers/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { AuthStatusHandler } from '@/components/auth-status-handler';
import { OAuthErrorHandler } from '../oauth-error-handler';
import { CiscoStyleLogo } from '@/components/auth/cisco-style-logo';
import { Globe, Eye, EyeOff } from 'lucide-react';
import { signInWithOAuth } from '@/utils/auth-helpers/client';
import { GoogleLogo } from '@/components/google-logo';

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const priceId = searchParams.get('priceId');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    const { signInWithPassword } = await import('@/utils/auth-helpers/server');
    await handleRequest(e, signInWithPassword, router);
    setIsSubmitting(false);
  };

  const handleGoogleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    await signInWithOAuth(e);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#e8ebf0] flex items-center justify-center px-4 py-12 relative">
      {/* White Card */}
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-8 md:p-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <CiscoStyleLogo />
          <div className="flex items-center gap-2 text-gray-600 text-sm font-thin cursor-pointer hover:text-gray-800 transition-colors">
            <Globe size={16} />
            <span>EN US</span>
          </div>
        </div>

        {/* Form Title */}
        <h1 className="text-2xl font-thin text-gray-800 text-center mb-10">
          Sign in
        </h1>

        {/* Login Form */}
        <form
          noValidate={true}
          className="space-y-6"
          onSubmit={handleSubmit}
        >
          {searchParams.get('redirect') === 'checkout' && (
            <input type="hidden" name="redirect" value="checkout" />
          )}
          {priceId && <input type="hidden" name="priceId" value={priceId} />}
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-thin text-gray-700">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="Email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              required
              className="h-11 border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-md font-thin focus:ring-1"
              style={{ 
                '--tw-ring-color': '#0175a2',
              } as React.CSSProperties}
              onFocus={(e) => {
                e.target.style.borderColor = '#0175a2';
                e.target.style.boxShadow = '0 0 0 1px #0175a2';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '';
                e.target.style.boxShadow = '';
              }}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-thin text-gray-700">
                Password
              </Label>
              <Link
                href="/forgot_password"
                className="text-sm font-thin hover:opacity-80 transition-opacity"
                style={{ color: '#0175a2' }}
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                required
                className="h-11 border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-md font-thin focus:ring-1 pr-10"
                style={{ 
                  '--tw-ring-color': '#0175a2',
                } as React.CSSProperties}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0175a2';
                  e.target.style.boxShadow = '0 0 0 1px #0175a2';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '';
                  e.target.style.boxShadow = '';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
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

          <button 
            type="submit" 
            className="w-full h-11 text-white font-thin rounded-md"
            style={{ 
              backgroundColor: '#0175a2', 
              border: 'none', 
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'none',
              transform: 'none',
              boxShadow: 'none'
            }}
            disabled={isSubmitting}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Google Sign In */}
        <div className="mt-6">
          <form onSubmit={handleGoogleSignIn}>
            {searchParams.get('redirect') === 'checkout' && (
              <input type="hidden" name="redirect" value="checkout" />
            )}
            {priceId && <input type="hidden" name="priceId" value={priceId} />}
            <input type="hidden" name="provider" value="google" />
            <button
              type="submit"
              className="w-full h-11 border border-gray-300 bg-white text-gray-700 font-thin rounded-md flex items-center justify-center gap-2"
              style={{ 
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'none',
                transform: 'none',
                boxShadow: 'none'
              }}
              disabled={isSubmitting}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.backgroundColor = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              <GoogleLogo className="w-5 h-5" />
              <span>Continue with Google</span>
            </button>
          </form>
        </div>

        {/* Links */}
        <div className="mt-8 space-y-5">
          <div className="flex items-center justify-center gap-4 text-sm">
            <Link
              href="#"
              className="font-thin hover:opacity-80"
              style={{ color: '#0175a2' }}
            >
              Help
            </Link>
          </div>

          <div className="text-center text-sm text-gray-600 font-thin">
            Don't have an account?{' '}
            <Link
              href={priceId ? `/signup?priceId=${priceId}` : searchParams.get('redirect') ? `/signup?redirect=${searchParams.get('redirect')}` : '/signup'}
              className="font-thin hover:opacity-80"
              style={{ color: '#0175a2' }}
              prefetch={false}
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-6 text-xs font-thin">
        <Link 
          href="#" 
          className="hover:opacity-80"
          style={{ color: '#0175a2' }}
        >
          Contact support
        </Link>
        <Link 
          href="/privacy" 
          className="hover:opacity-80"
          style={{ color: '#0175a2' }}
        >
          Privacy
        </Link>
        <Link 
          href="/terms" 
          className="hover:opacity-80"
          style={{ color: '#0175a2' }}
        >
          Terms and conditions
        </Link>
        <Link 
          href="/cookies" 
          className="hover:opacity-80"
          style={{ color: '#0175a2' }}
        >
          Cookie policy
        </Link>
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
      <Suspense fallback={
        <div className="min-h-screen bg-[#e8ebf0] flex items-center justify-center">
          <div className="text-gray-600">Loading...</div>
        </div>
      }>
        <SignInContent />
      </Suspense>
    </>
  );
}
