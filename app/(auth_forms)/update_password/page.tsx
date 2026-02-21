'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CiscoStyleLogo } from '@/components/auth/cisco-style-logo';
import { Globe, Eye, EyeOff, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { updatePassword } from '@/utils/auth-helpers/server';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [error, setError] = useState('');

  const requirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Number', met: /\d/.test(password) },
    { label: 'Special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  const allMet = requirements.every((r) => r.met);
  const passwordsMatch = password === passwordConfirm && password.length > 0;
  const isValid = allMet && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!isValid) {
      if (!allMet) setError('Password does not meet all requirements.');
      else setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('password', password);
      formData.append('passwordConfirm', passwordConfirm);
      const redirectPath = await updatePassword(formData);

      if (redirectPath.includes('status=success')) {
        router.push('/signin?status=Password updated successfully. Please sign in.');
      } else if (redirectPath.includes('error=')) {
        const url = new URL(redirectPath, window.location.origin);
        setError(url.searchParams.get('error_description') || 'Failed to update password.');
      }
    } catch {
      setError('Something went wrong. Please try again or request a new reset link.');
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

        {/* Title */}
        <h1 className="text-2xl font-thin text-gray-800 text-center mb-2">
          Create new password
        </h1>
        <p className="text-sm font-thin text-gray-500 text-center mb-10">
          Your new password must be different from your previous password.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-thin text-gray-700">
              New password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                className="h-11 border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-md font-thin focus:ring-1 pr-10"
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
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Requirements */}
          {password.length > 0 && (
            <div className="grid grid-cols-2 gap-1.5 pb-1">
              {requirements.map((req, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  {req.met
                    ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: '#0175a2' }} />
                    : <XCircle className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                  }
                  <span className={`text-xs font-thin ${req.met ? 'text-gray-700' : 'text-gray-400'}`}>
                    {req.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="passwordConfirm" className="text-sm font-thin text-gray-700">
              Confirm new password
            </Label>
            <div className="relative">
              <Input
                id="passwordConfirm"
                type={showPasswordConfirm ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                disabled={isLoading}
                required
                className="h-11 border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-md font-thin focus:ring-1 pr-10"
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
                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                tabIndex={-1}
              >
                {showPasswordConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordConfirm.length > 0 && (
              <div className="flex items-center gap-1.5">
                {passwordsMatch
                  ? <><CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: '#0175a2' }} /><span className="text-xs font-thin text-gray-700">Passwords match</span></>
                  : <><XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" /><span className="text-xs font-thin text-red-500">Passwords do not match</span></>
                }
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm font-thin text-red-600 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading || !isValid}
            className="w-full h-11 text-white font-thin rounded-md"
            style={{
              backgroundColor: '#0175a2',
              border: 'none',
              cursor: isLoading || !isValid ? 'not-allowed' : 'pointer',
              opacity: isLoading || !isValid ? 0.5 : 1,
            }}
          >
            {isLoading ? 'Updating...' : 'Update password'}
          </button>
        </form>

        {/* Back */}
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
