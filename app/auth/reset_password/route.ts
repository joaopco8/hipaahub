import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getErrorRedirect, getStatusRedirect } from '@/utils/helpers';

export async function GET(request: NextRequest) {
  // The `/auth/reset_password` route handles the password reset flow.
  // It exchanges an auth code for the user's session and redirects to update_password page.
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Password reset auth error:', error);
      return NextResponse.redirect(
        getErrorRedirect(
          `${requestUrl.origin}/forgot_password`,
          error.name,
          "Sorry, we couldn't verify your reset link. Please request a new one."
        )
      );
    }
  }

  // Redirect to update_password page where user can set their new password
  return NextResponse.redirect(`${requestUrl.origin}/update_password`);
}
