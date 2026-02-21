'use client';

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { signUp } from '@/utils/auth-helpers/server';
import { handleRequest } from '@/utils/auth-helpers/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { AuthStatusHandler } from '@/components/auth-status-handler';
import { OAuthErrorHandler } from '../oauth-error-handler';
import { CiscoStyleLogo } from '@/components/auth/cisco-style-logo';
import { Eye, EyeOff } from 'lucide-react';

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  useEffect(() => {
    const redirect = searchParams.get('redirect');
    if (redirect === 'checkout') {
      localStorage.setItem('signup_redirect', 'checkout');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    await handleRequest(e, signUp, router);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#e8ebf0] flex items-center justify-center px-4 py-12 relative">
      {/* White Card */}
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-8 md:p-10">
        {/* Header */}
        <div className="mb-10">
          <CiscoStyleLogo />
        </div>

        {/* Form Title */}
        <h1 className="text-2xl font-thin text-gray-800 mb-2">
          Create account
        </h1>
        <p className="text-xs text-gray-500 font-thin mb-6">
          * indicates required field
        </p>

        {/* Signup Form */}
        <form
          noValidate={true}
          className="space-y-5"
          onSubmit={(e) => handleSubmit(e)}
        >
          {searchParams.get('redirect') === 'checkout' && (
            <input type="hidden" name="redirect" value="checkout" />
          )}
          
          {/* Hidden fields for backend compatibility */}
          <input type="hidden" name="phone_number" value="" />
          <input type="hidden" name="name" value={`${firstName} ${lastName}`.trim()} />
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-thin text-gray-700">
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="Email *"
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
            <Label htmlFor="password" className="text-sm font-thin text-gray-700">
              Password *
            </Label>
            <div className="relative">
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                name="password" 
                placeholder="Password *"
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

          <div className="space-y-2">
            <Label htmlFor="first_name" className="text-sm font-thin text-gray-700">
              First name *
            </Label>
            <Input
              id="first_name"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name *"
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
            <Label htmlFor="last_name" className="text-sm font-thin text-gray-700">
              Last name *
            </Label>
            <Input
              id="last_name"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name *"
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


          {/* Terms and Conditions */}
          <p className="text-xs text-gray-600 font-thin leading-relaxed">
            By clicking Register, I confirm that I have read and agree to the{' '}
            <Link href="/privacy" className="underline" style={{ color: '#0175a2' }}>
              HIPAA Hub Online Privacy Statement
            </Link>{' '}
            and the{' '}
            <Link href="/terms" className="underline" style={{ color: '#0175a2' }}>
              Terms and Conditions of the HIPAA Hub website
            </Link>
            .
          </p>

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
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>
        </form>

        {/* Sign In Link */}
        <div className="mt-8 text-center text-sm">
          <Link
            href="/signin"
            className="font-thin hover:opacity-80"
            style={{ color: '#0175a2' }}
            prefetch={false}
          >
            Already have an account?
          </Link>
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

export default function SignUp() {
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
        <SignUpContent />
      </Suspense>
    </>
  );
}
