'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getURL, getErrorRedirect, getStatusRedirect } from '@/utils/helpers';
import { getAuthTypes } from '@/utils/auth-helpers/settings';

function isValidEmail(email: string) {
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return regex.test(email);
}

export async function redirectToPath(path: string) {
  return redirect(path);
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return getErrorRedirect(
      '/',
      'Hmm... Something went wrong.',
      'You could not be signed out.'
    );
  }

  return '/signin';
}

export async function signInWithEmail(formData: FormData) {
  const cookieStore = cookies();
  const callbackURL = getURL('/auth/callback');

  const email = String(formData.get('email')).trim();
  let redirectPath: string;

  if (!isValidEmail(email)) {
    return getErrorRedirect(
      '/signin',
      'Invalid email address.',
      'Please try again.'
    );
  }

  const supabase = createClient();
  let options = {
    emailRedirectTo: callbackURL,
    shouldCreateUser: true
  };

  // If allowPassword is false, do not create a new user
  const { allowPassword } = getAuthTypes();
  if (allowPassword) options.shouldCreateUser = false;
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: options
  });

  if (error) {
    redirectPath = getErrorRedirect(
      '/signin',
      'You could not be signed in.',
      error.message
    );
  } else if (data) {
    cookieStore.set('preferredSignInView', 'email_signin', { path: '/' });
    redirectPath = getStatusRedirect(
      '/signin',
      'Success!',
      'Please check your email for a magic link. You may now close this tab.',
      true
    );
  } else {
    redirectPath = getErrorRedirect(
      '/signin',
      'Hmm... Something went wrong.',
      'You could not be signed in.'
    );
  }

  return redirectPath;
}

export async function requestPasswordUpdate(formData: FormData) {
  const callbackURL = getURL('/auth/reset_password');

  const email = String(formData.get('email')).trim();
  let redirectPath: string;

  if (!isValidEmail(email)) {
    return getErrorRedirect(
      '/forgot_password',
      'Invalid email address.',
      'Please try again.'
    );
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: callbackURL
  });

  if (error) {
    redirectPath = getErrorRedirect(
      '/forgot_password',
      error.message,
      'Please try again.'
    );
  } else if (data) {
    redirectPath = getStatusRedirect(
      '/forgot_password',
      'Success!',
      'Please check your email for a password reset link. You may now close this tab.',
      true
    );
  } else {
    redirectPath = getErrorRedirect(
      '/forgot_password',
      'Hmm... Something went wrong.',
      'Password reset email could not be sent.'
    );
  }

  return redirectPath;
}

export async function signInWithPassword(formData: FormData) {
  const cookieStore = cookies();
  const email = String(formData.get('email')).trim();
  const password = String(formData.get('password')).trim();
  const redirectParam = formData.get('redirect') as string | null;
  let redirectPath: string;

  const supabase = createClient();
  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    redirectPath = getErrorRedirect(
      '/signin',
      'Sign in failed.',
      error.message
    );
  } else if (data.user) {
    cookieStore.set('preferredSignInView', 'password_signin', { path: '/' });
    
    // Check if redirect is checkout
    if (redirectParam === 'checkout') {
      // Verify subscription status BEFORE redirecting to checkout
      const { getSubscription } = await import('@/utils/supabase/queries');
      const subscription = await getSubscription(supabase, data.user.id);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('signInWithPassword: Checking subscription for user:', data.user.id);
        console.log('signInWithPassword: Subscription found:', subscription ? 'YES' : 'NO');
      }
      
      if (subscription) {
        // User has active subscription, redirect to dashboard
        if (process.env.NODE_ENV === 'development') {
          console.log('signInWithPassword: User has subscription, redirecting to dashboard');
        }
        redirectPath = getStatusRedirect('/dashboard', 'Success!', 'You are now signed in.');
      } else {
        // User doesn't have subscription, proceed to checkout
        if (process.env.NODE_ENV === 'development') {
          console.log('signInWithPassword: User does NOT have subscription, redirecting to checkout');
        }
        redirectPath = '/checkout';
      }
    } else {
      // ALWAYS verify subscription status FIRST before allowing any access
      const { getSubscription } = await import('@/utils/supabase/queries');
      const subscription = await getSubscription(supabase, data.user.id);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('signInWithPassword: Checking subscription for user:', data.user.id);
        console.log('signInWithPassword: Subscription found:', subscription ? 'YES' : 'NO');
      }
      
      if (!subscription) {
        // User doesn't have subscription, redirect to checkout
        if (process.env.NODE_ENV === 'development') {
          console.log('signInWithPassword: User does NOT have subscription, redirecting to checkout');
        }
        redirectPath = '/checkout';
      } else {
        // User has subscription, check onboarding status
        const { getOrganization, getComplianceCommitment } = await import('@/utils/supabase/queries');
        const [organization, commitment] = await Promise.all([
          getOrganization(supabase, data.user.id),
          getComplianceCommitment(supabase, data.user.id)
        ]);

        // If onboarding is complete, go to dashboard
        if (organization && commitment) {
          redirectPath = getStatusRedirect('/dashboard', 'Success!', 'You are now signed in.');
        } else {
          // Otherwise, redirect to onboarding
          redirectPath = getStatusRedirect('/onboarding/expectation', 'Success!', 'You are now signed in.');
        }
      }
    }
  } else {
    redirectPath = getErrorRedirect(
      '/signin',
      'Hmm... Something went wrong.',
      'You could not be signed in.'
    );
  }

  return redirectPath;
}

export async function signUp(formData: FormData) {
  // Check if redirect parameter is present (for checkout flow)
  const redirectParam = formData.get('redirect') as string | null;
  const callbackURL = redirectParam === 'checkout' 
    ? getURL('/auth/callback?redirect=checkout')
    : getURL('/auth/callback');

  const email = String(formData.get('email')).trim();
  const password = String(formData.get('password')).trim();
  const phoneNumber = String(formData.get('phone_number')).trim();
  const fullName = String(formData.get('name')).trim();
  let redirectPath: string;

  if (!isValidEmail(email)) {
    return getErrorRedirect(
      '/signup',
      'Invalid email address.',
      'Please try again.'
    );
  }

  const supabase = createClient();
  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: callbackURL,
      data: {
        full_name: fullName,
        phone_number: phoneNumber
      }
    }
  });

  if (error) {
    redirectPath = getErrorRedirect(
      '/signup',
      'Sign up failed.',
      error.message
    );
  } else if (data.session) {
    // User is immediately signed in (email confirmation disabled)
    // Update user phone number in users table
    if (phoneNumber && data.user) {
      await supabase
        .from('users')
        .update({ phone_number: phoneNumber, full_name: fullName })
        .eq('id', data.user.id);
    }
    // Check if redirect is checkout
    if (redirectParam === 'checkout') {
      // Verify subscription status BEFORE redirecting to checkout
      const { getSubscription } = await import('@/utils/supabase/queries');
      const subscription = await getSubscription(supabase, data.user.id);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('signUp: Checking subscription for user:', data.user.id);
        console.log('signUp: Subscription found:', subscription ? 'YES' : 'NO');
      }
      
      if (subscription) {
        // User has active subscription, redirect to dashboard
        if (process.env.NODE_ENV === 'development') {
          console.log('signUp: User has subscription, redirecting to dashboard');
        }
        redirectPath = '/dashboard';
      } else {
        // User doesn't have subscription, proceed to checkout
        if (process.env.NODE_ENV === 'development') {
          console.log('signUp: User does NOT have subscription, redirecting to checkout');
        }
        redirectPath = '/checkout';
      }
    } else {
      // ALWAYS verify subscription status FIRST before allowing any access
      const { getSubscription } = await import('@/utils/supabase/queries');
      const subscription = await getSubscription(supabase, data.user.id);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('signUp: Checking subscription for user:', data.user.id);
        console.log('signUp: Subscription found:', subscription ? 'YES' : 'NO');
      }
      
      if (!subscription) {
        // User doesn't have subscription, redirect to checkout
        if (process.env.NODE_ENV === 'development') {
          console.log('signUp: User does NOT have subscription, redirecting to checkout');
        }
        redirectPath = '/checkout';
      } else {
        // User has subscription, redirect to onboarding
        redirectPath = '/onboarding/expectation';
      }
    }
  } else if (
    data.user &&
    data.user.identities &&
    data.user.identities.length == 0
  ) {
    redirectPath = getErrorRedirect(
      '/signup',
      'Sign up failed.',
      'There is already an account associated with this email address. Try resetting your password.'
    );
  } else if (data.user) {
    // User created but needs to confirm email - save phone number if provided
    if (phoneNumber) {
      await supabase
        .from('users')
        .update({ phone_number: phoneNumber, full_name: fullName })
        .eq('id', data.user.id);
    }
    // User created but needs to confirm email - redirect to confirmation page
    redirectPath = '/confirm-email';
  } else {
    redirectPath = getErrorRedirect(
      '/signup',
      'Hmm... Something went wrong.',
      'You could not be signed up.'
    );
  }

  return redirectPath;
}

export async function updatePassword(formData: FormData) {
  const password = String(formData.get('password')).trim();
  const passwordConfirm = String(formData.get('passwordConfirm')).trim();
  let redirectPath: string;

  if (password !== passwordConfirm) {
    return getErrorRedirect(
      '/update_password',
      'Your password could not be updated.',
      'Passwords do not match.'
    );
  }

  const supabase = createClient();
  const { error, data } = await supabase.auth.updateUser({
    password
  });

  if (error) {
    redirectPath = getErrorRedirect(
      '/update_password',
      'Your password could not be updated.',
      error.message
    );
  } else if (data.user) {
    redirectPath = getStatusRedirect(
      '/',
      'Success!',
      'Your password has been updated.'
    );
  } else {
    redirectPath = getErrorRedirect(
      '/update_password',
      'Hmm... Something went wrong.',
      'Your password could not be updated.'
    );
  }

  return redirectPath;
}

export async function updateEmail(formData: FormData) {
  const newEmail = String(formData.get('newEmail')).trim();

  if (!isValidEmail(newEmail)) {
    return getErrorRedirect(
      '/dashboard/account',
      'Your email could not be updated.',
      'Invalid email address.'
    );
  }

  const supabase = createClient();

  const callbackUrl = getURL(
    getStatusRedirect(
      '/dashboard/account',
      'Success!',
      `Your email has been updated.`
    )
  );

  const { error } = await supabase.auth.updateUser(
    { email: newEmail },
    {
      emailRedirectTo: callbackUrl
    }
  );

  if (error) {
    return getErrorRedirect(
      '/dashboard/account',
      'Your email could not be updated.',
      error.message
    );
  } else {
    return getStatusRedirect(
      '/dashboard/account',
      'Confirmation emails sent.',
      `You will need to confirm the update by clicking the links sent to both the old and new email addresses.`
    );
  }
}

export async function updateName(formData: FormData) {
  const fullName = String(formData.get('fullName')).trim();

  const supabase = createClient();
  const { error, data } = await supabase.auth.updateUser({
    data: { full_name: fullName }
  });

  if (error) {
    return getErrorRedirect(
      '/dashboard/account',
      'Your name could not be updated.',
      error.message
    );
  } else if (data.user) {
    return getStatusRedirect(
      '/dashboard/account',
      'Success!',
      'Your name has been updated.'
    );
  } else {
    return getErrorRedirect(
      '/dashboard/account',
      'Hmm... Something went wrong.',
      'Your name could not be updated.'
    );
  }
}
