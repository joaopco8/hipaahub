'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CiscoStyleLogo } from '@/components/auth/cisco-style-logo';
import { Globe, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { requestPasswordUpdate } from '@/utils/auth-helpers/server';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('email', email.trim());
      const redirectPath = await requestPasswordUpdate(formData);

      if (redirectPath.includes('status=success') || redirectPath.includes('forgot_password')) {
        setSent(true);
      } else if (redirectPath.includes('error=')) {
        const url = new URL(redirectPath, window.location.origin);
        setError(url.searchParams.get('error_description') || 'Failed to send reset email. Please try again.');
      } else {
        setSent(true);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e8ebf0] flex items-center justify-center px-4 py-12 relative">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-8 md:p-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <CiscoStyleLogo />
          <div className="flex items-center gap-2 text-gray-600 text-sm font-thin cursor-pointer hover:text-gray-800 transition-colors">
            <Globe size={16} />
            <span>EN US</span>
          </div>
        </div>

        {!sent ? (
          <>
            {/* Title */}
            <h1 className="text-2xl font-thin text-gray-800 text-center mb-2">
              Reset password
            </h1>
            <p className="text-sm font-thin text-gray-500 text-center mb-10">
              Enter your account email and we'll send you a link to reset your password.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="h-11 border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-md font-thin focus:ring-1"
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

              {error && (
                <p className="text-sm font-thin text-red-600 text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 text-white font-thin rounded-md"
                style={{
                  backgroundColor: '#0175a2',
                  border: 'none',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1,
                }}
              >
                {isLoading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>

            {/* Back to sign in */}
            <div className="mt-8 flex items-center justify-center">
              <Link
                href="/signin"
                className="flex items-center gap-1.5 text-sm font-thin hover:opacity-80 transition-opacity"
                style={{ color: '#0175a2' }}
              >
                <ArrowLeft size={14} />
                Back to sign in
              </Link>
            </div>
          </>
        ) : (
          <>
            {/* Success State */}
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-[#0175a2]/10 flex items-center justify-center mb-6">
                <Mail className="w-7 h-7" style={{ color: '#0175a2' }} />
              </div>
              <h1 className="text-2xl font-thin text-gray-800 mb-2">Check your email</h1>
              <p className="text-sm font-thin text-gray-500 mb-1">
                We sent a password reset link to
              </p>
              <p className="text-sm font-thin text-gray-800 mb-8">{email}</p>

              <div className="w-full border border-gray-100 rounded-md bg-gray-50 p-4 mb-8 text-left space-y-2">
                {[
                  'Open the email from HIPAA Hub',
                  'Click the "Reset password" button',
                  'Create your new password',
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0175a2] shrink-0" />
                    <span className="text-sm font-thin text-gray-600">{step}</span>
                  </div>
                ))}
              </div>

              <p className="text-sm font-thin text-gray-500 mb-6">
                Didn't receive the email?{' '}
                <button
                  onClick={() => { setSent(false); setError(''); }}
                  className="font-thin hover:opacity-80"
                  style={{ color: '#0175a2' }}
                >
                  Try again
                </button>
              </p>

              <Link
                href="/signin"
                className="flex items-center gap-1.5 text-sm font-thin hover:opacity-80 transition-opacity"
                style={{ color: '#0175a2' }}
              >
                <ArrowLeft size={14} />
                Back to sign in
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Footer Links */}
      <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-6 text-xs font-thin">
        <Link href="#" className="hover:opacity-80" style={{ color: '#0175a2' }}>Contact support</Link>
        <Link href="/privacy" className="hover:opacity-80" style={{ color: '#0175a2' }}>Privacy</Link>
        <Link href="/terms" className="hover:opacity-80" style={{ color: '#0175a2' }}>Terms and conditions</Link>
      </div>
    </div>
  );
}
