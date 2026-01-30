'use client';

import { createClient } from '@/utils/supabase/client';
import { type Provider } from '@supabase/supabase-js';
import { getURL } from '@/utils/helpers';
import { redirectToPath } from './server';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export async function handleRequest(
  e: React.FormEvent<HTMLFormElement>,
  requestFunc: (formData: FormData) => Promise<string>,
  router: AppRouterInstance | null = null
): Promise<boolean | void> {
  // Prevent default form submission refresh
  e.preventDefault();

  // Ensure we have a valid form element
  const form = e.currentTarget instanceof HTMLFormElement 
    ? e.currentTarget 
    : (e.target instanceof HTMLFormElement 
        ? e.target 
        : (e.target as HTMLElement)?.closest('form') as HTMLFormElement);

  if (!form || !(form instanceof HTMLFormElement)) {
    console.error('Form element not found in event');
    throw new Error('Form submission failed: form element not found');
  }

  const formData = new FormData(form);
  const redirectUrl: string = await requestFunc(formData);

  if (router) {
    // If client-side router is provided, use it to redirect
    return router.push(redirectUrl);
  } else {
    // Otherwise, redirect server-side
    return await redirectToPath(redirectUrl);
  }
}

export async function signInWithOAuth(e: React.FormEvent<HTMLFormElement>) {
  // Prevent default form submission refresh
  e.preventDefault();
  
  // Ensure we have a valid form element
  const form = e.currentTarget instanceof HTMLFormElement 
    ? e.currentTarget 
    : (e.target instanceof HTMLFormElement 
        ? e.target 
        : (e.target as HTMLElement)?.closest('form') as HTMLFormElement);

  if (!form || !(form instanceof HTMLFormElement)) {
    console.error('Form element not found in OAuth event');
    const currentPath = window.location.pathname;
    const errorMessage = 'Form submission failed. Please try again.';
    const errorUrl = `${currentPath}?error=${encodeURIComponent('Sign in failed')}&error_description=${encodeURIComponent(errorMessage)}`;
    window.location.href = errorUrl;
    return;
  }

  const formData = new FormData(form);
  const provider = String(formData.get('provider')).trim() as Provider;
  const redirectParam = formData.get('redirect') as string | null;

  const currentPath = window.location.pathname;
  
  // Validate provider
  if (!provider) {
    console.error('Provider is missing or empty');
    const errorMessage = 'Provider is required. Please try again.';
    const errorUrl = redirectParam === 'checkout'
      ? `${currentPath}?error=${encodeURIComponent('Sign in failed')}&error_description=${encodeURIComponent(errorMessage)}&redirect=checkout`
      : `${currentPath}?error=${encodeURIComponent('Sign in failed')}&error_description=${encodeURIComponent(errorMessage)}`;
    window.location.href = errorUrl;
    return;
  }

  // Validate provider name (must be lowercase)
  const normalizedProvider = provider.toLowerCase() as Provider;
  if (normalizedProvider !== provider) {
    console.warn(`Provider name was not lowercase: ${provider}, normalizing to: ${normalizedProvider}`);
  }
  
  // Create client-side supabase client and call signInWithOAuth
  const supabase = createClient();
  const redirectURL = redirectParam === 'checkout'
    ? getURL('/auth/callback?redirect=checkout')
    : getURL('/auth/callback');
  
  // Debug logging
  console.log('OAuth sign-in attempt:', {
    provider: normalizedProvider,
    redirectURL,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
  });
  
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: normalizedProvider,
      options: {
        redirectTo: redirectURL,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    });

    if (error) {
      // Handle OAuth errors
      console.error('OAuth error:', {
        error,
        message: error.message,
        status: error.status,
        provider: normalizedProvider
      });
      
      const currentPath = window.location.pathname;
      let errorMessage = error.message || 'An error occurred during sign in.';
      
      // Provide user-friendly error messages with instructions
      if (error.message?.includes('provider is not enabled') || 
          error.message?.includes('Unsupported provider') ||
          error.message?.includes('validation_failed') ||
          error.status === 400) {
        errorMessage = `Google sign-in is not enabled in your Supabase project. Please verify: 1) Go to Authentication → Providers in your Supabase dashboard, 2) Enable Google provider, 3) Enter your Client ID and Secret, 4) Click "Save" button, 5) Wait a few seconds for changes to propagate.`;
      }
      
      // Redirect to current page with error
      const errorUrl = redirectParam === 'checkout'
        ? `${currentPath}?error=${encodeURIComponent('Sign in failed')}&error_description=${encodeURIComponent(errorMessage)}&redirect=checkout`
        : `${currentPath}?error=${encodeURIComponent('Sign in failed')}&error_description=${encodeURIComponent(errorMessage)}`;
      
      window.location.href = errorUrl;
      return;
    }

    // Check if data.url exists (OAuth redirect URL)
    // If not, there might be an issue - this can happen if provider is not enabled
    if (!data?.url) {
      console.error('OAuth sign-in returned no URL:', { data, provider: normalizedProvider });
      const currentPath = window.location.pathname;
      const errorMessage = `Google sign-in is not enabled in your Supabase project. Please verify: 1) Go to Authentication → Providers in your Supabase dashboard, 2) Enable Google provider, 3) Enter your Client ID and Secret, 4) Click "Save" button, 5) Wait a few seconds for changes to propagate.`;
      const errorUrl = redirectParam === 'checkout'
        ? `${currentPath}?error=${encodeURIComponent('Sign in failed')}&error_description=${encodeURIComponent(errorMessage)}&redirect=checkout`
        : `${currentPath}?error=${encodeURIComponent('Sign in failed')}&error_description=${encodeURIComponent(errorMessage)}`;
      
      window.location.href = errorUrl;
      return;
    }

    // Log success
    console.log('OAuth sign-in successful, redirecting to:', data.url);

    // If successful, the OAuth flow will redirect automatically
    // No need to do anything else here
  } catch (err: any) {
    // Handle unexpected errors
    console.error('Unexpected OAuth error:', {
      err,
      message: err?.message,
      response: err?.response,
      data: err?.data,
      provider: normalizedProvider
    });
    
    const currentPath = window.location.pathname;
    let errorMessage = 'An unexpected error occurred. Please try again.';
    
    // Try to extract error message from caught error
    if (err?.message) {
      if (err.message.includes('provider is not enabled') || 
          err.message.includes('Unsupported provider') ||
          err.message.includes('validation_failed') ||
          err.message.includes('400')) {
        errorMessage = `Google sign-in is not enabled in your Supabase project. Please verify: 1) Go to Authentication → Providers in your Supabase dashboard, 2) Enable Google provider, 3) Enter your Client ID and Secret, 4) Click "Save" button, 5) Wait a few seconds for changes to propagate.`;
      } else {
        errorMessage = err.message;
      }
    }
    
    // Check if error is a response object with JSON
    if (err?.response || err?.data) {
      const responseData = err.response?.data || err.data;
      console.error('Error response data:', responseData);
      if (responseData?.msg?.includes('provider is not enabled') || 
          responseData?.error_code === 'validation_failed' ||
          responseData?.msg?.includes('Unsupported provider')) {
        errorMessage = `Google sign-in is not enabled in your Supabase project. Please verify: 1) Go to Authentication → Providers in your Supabase dashboard, 2) Enable Google provider, 3) Enter your Client ID and Secret, 4) Click "Save" button, 5) Wait a few seconds for changes to propagate.`;
      }
    }
    
    const errorUrl = redirectParam === 'checkout'
      ? `${currentPath}?error=${encodeURIComponent('Sign in failed')}&error_description=${encodeURIComponent(errorMessage)}&redirect=checkout`
      : `${currentPath}?error=${encodeURIComponent('Sign in failed')}&error_description=${encodeURIComponent(errorMessage)}`;
    
    window.location.href = errorUrl;
  }
}
