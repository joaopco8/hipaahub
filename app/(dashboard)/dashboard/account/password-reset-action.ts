'use server';

import { createClient } from '@/utils/supabase/server';
import { getErrorRedirect, getStatusRedirect, getURL } from '@/utils/helpers';

// Email validation helper
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function requestPasswordReset(formData: FormData) {
  const supabase = createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return getErrorRedirect(
      '/dashboard/account',
      'Authentication required',
      'You must be logged in to reset your password.'
    );
  }

  const email = String(formData.get('email')).trim() || user.email;
  
  if (!email || !isValidEmail(email)) {
    return getErrorRedirect(
      '/dashboard/account',
      'Invalid email address',
      'Please provide a valid email address.'
    );
  }

  const callbackURL = getURL('/auth/reset_password');

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: callbackURL
  });

  if (error) {
    return getErrorRedirect(
      '/dashboard/account',
      'Password reset failed',
      error.message
    );
  }

  if (data) {
    return getStatusRedirect(
      '/dashboard/account',
      'Password reset email sent',
      'Please check your email for a password reset link. You may now close this tab.',
      true
    );
  }

  return getErrorRedirect(
    '/dashboard/account',
    'Something went wrong',
    'Password reset email could not be sent.'
  );
}
