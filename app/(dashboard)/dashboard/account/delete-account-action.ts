'use server';

import { createClient } from '@/utils/supabase/server';
import { getErrorRedirect, getStatusRedirect } from '@/utils/helpers';
import { redirect } from 'next/navigation';

export async function deleteAccount(formData: FormData) {
  const supabase = createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return getErrorRedirect(
      '/dashboard/account',
      'Authentication required',
      'You must be logged in to delete your account.'
    );
  }

  // Check if user is authenticated via OAuth (Google, etc.)
  // OAuth users don't have passwords, so we check identities or app_metadata
  const hasOAuthIdentity = user.identities?.some((identity: any) => 
    identity.provider && identity.provider !== 'email'
  );
  const isOAuthUser = user.app_metadata?.provider === 'google' || hasOAuthIdentity || false;

  if (isOAuthUser) {
    // For OAuth users, we use email confirmation instead of password
    const confirmationEmail = String(formData.get('confirmationEmail')).trim();
    const confirmationEmail2 = String(formData.get('confirmationEmail2')).trim();
    
    // Validate emails are provided
    if (!confirmationEmail || !confirmationEmail2) {
      return getErrorRedirect(
        '/dashboard/account',
        'Email confirmation required',
        'Please enter your email address in both fields to confirm account deletion.'
      );
    }

    // Validate emails match
    if (confirmationEmail !== confirmationEmail2) {
      return getErrorRedirect(
        '/dashboard/account',
        'Emails do not match',
        'The email addresses you entered do not match. Please try again.'
      );
    }

    // Validate email matches user's email
    if (confirmationEmail.toLowerCase() !== user.email?.toLowerCase()) {
      return getErrorRedirect(
        '/dashboard/account',
        'Invalid email',
        'The email address you entered does not match your account email. Please enter your account email address.'
      );
    }
  } else {
    // For email/password users, validate password
    const password1 = String(formData.get('password1')).trim();
    const password2 = String(formData.get('password2')).trim();
    
    // Validate passwords are provided
    if (!password1 || !password2) {
      return getErrorRedirect(
        '/dashboard/account',
        'Passwords required',
        'Please enter your password in both fields to confirm account deletion.'
      );
    }

    // Validate passwords match
    if (password1 !== password2) {
      return getErrorRedirect(
        '/dashboard/account',
        'Passwords do not match',
        'The passwords you entered do not match. Please try again.'
      );
    }

    // Verify password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: password1
    });

    if (signInError) {
      return getErrorRedirect(
        '/dashboard/account',
        'Invalid password',
        'The password you entered is incorrect. Please try again.'
      );
    }
  }

  // Confirmation successful, proceed with account deletion
  try {
    // Delete user data in order to respect foreign key constraints
    // 1. Delete action items
    await supabase.from('action_items').delete().eq('user_id', user.id);
    
    // 2. Delete risk assessments
    await supabase.from('risk_assessments').delete().eq('user_id', user.id);
    // Note: onboarding_risk_assessments will be deleted automatically via CASCADE when user is deleted
    
    // 3. Delete staff members
    await supabase.from('staff_members').delete().eq('user_id', user.id);
    
    // 4. Delete compliance commitments
    await supabase.from('compliance_commitments').delete().eq('user_id', user.id);
    
    // 5. Delete organizations (this may have cascading deletes)
    await supabase.from('organizations').delete().eq('user_id', user.id);
    
    // 6. Delete subscriptions (if any)
    await supabase.from('subscriptions').delete().eq('user_id', user.id);
    
    // 7. Delete customers (Stripe)
    await supabase.from('customers').delete().eq('id', user.id);
    
    // 8. Delete user from users table
    await supabase.from('users').delete().eq('id', user.id);

    // 9. Sign out the user
    await supabase.auth.signOut();

    // Redirect to sign in with success message
    return redirect(
      getStatusRedirect(
        '/signin',
        'Account deleted',
        'Your account has been successfully deleted. We\'re sorry to see you go.',
        true
      )
    );
  } catch (error) {
    console.error('Error deleting account:', error);
    return getErrorRedirect(
      '/dashboard/account',
      'Deletion failed',
      'An error occurred while deleting your account. Please try again or contact support.'
    );
  }
}
