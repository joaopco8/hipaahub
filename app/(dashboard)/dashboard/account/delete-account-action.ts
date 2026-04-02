'use server';

import { createClient } from '@/utils/supabase/server';
import { getErrorRedirect, getStatusRedirect } from '@/utils/helpers';
import { redirect } from 'next/navigation';

export async function deleteAccount(formData: FormData) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      getErrorRedirect(
        '/dashboard/account',
        'Authentication required',
        'You must be logged in to delete your account.'
      )
    );
  }

  // Validate DELETE confirmation word
  const deleteWord = String(formData.get('deleteWord')).trim();
  if (deleteWord !== 'DELETE') {
    return { error: 'You must type DELETE (in uppercase) to confirm account deletion.' };
  }

  const hasOAuthIdentity = user!.identities?.some(
    (identity: any) => identity.provider && identity.provider !== 'email'
  );
  const isOAuthUser =
    user!.app_metadata?.provider === 'google' || hasOAuthIdentity || false;

  if (isOAuthUser) {
    // For Google users: verify they re-authenticated recently (within last 10 minutes)
    const lastSignIn = user!.last_sign_in_at ? new Date(user!.last_sign_in_at) : null;
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    if (!lastSignIn || lastSignIn < tenMinutesAgo) {
      return {
        error:
          'Google verification expired. Please click "Verify with Google" again.',
      };
    }
  } else {
    // For password users: verify the password is correct
    const password = String(formData.get('password')).trim();

    if (!password) {
      return { error: 'Password is required to delete your account.' };
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user!.email!,
      password,
    });

    if (signInError) {
      return { error: 'The password you entered is incorrect. Please try again.' };
    }
  }

  // All checks passed — delete user data respecting FK constraints
  try {
    await supabase.from('action_items').delete().eq('user_id', user!.id);
    await supabase.from('risk_assessments').delete().eq('user_id', user!.id);
    // onboarding_risk_assessments deleted via CASCADE
    await supabase.from('staff_members').delete().eq('user_id', user!.id);
    await supabase.from('compliance_commitments').delete().eq('user_id', user!.id);
    await supabase.from('organizations').delete().eq('user_id', user!.id);
    await supabase.from('subscriptions').delete().eq('user_id', user!.id);
    await supabase.from('customers').delete().eq('id', user!.id);
    await supabase.from('users').delete().eq('id', user!.id);

    await supabase.auth.signOut();
  } catch (error: any) {
    // Re-throw Next.js redirect errors
    if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;

    console.error('Error deleting account:', error);
    return {
      error:
        'An error occurred while deleting your account. Please try again or contact support.',
    };
  }

  redirect(
    getStatusRedirect(
      '/signin',
      'Account deleted',
      "Your account has been successfully deleted. We're sorry to see you go.",
      true
    )
  );
}
