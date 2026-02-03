# Password Reset Flow - Setup Guide

## Overview
Complete password reset flow implementation for HIPAA Hub.

## Flow Diagram

```
User Forgot Password
        ↓
Enter Email (/forgot_password)
        ↓
Email Sent (Supabase Auth)
        ↓
User Clicks Link in Email
        ↓
Auth Callback (/auth/reset_password)
        ↓
Update Password Page (/update_password)
        ↓
New Password Set
        ↓
Redirect to Sign In
```

## Pages Implemented

### 1. Forgot Password Page
**Path:** `/forgot_password`
**File:** `app/(auth_forms)/forgot_password/page.tsx`

**Features:**
- Email input field
- Form validation
- Loading states
- Success/error toast notifications
- Auto-redirect to sign in after success

### 2. Update Password Page
**Path:** `/update_password`
**File:** `app/(auth_forms)/update_password/page.tsx`

**Features:**
- Password strength validation with real-time feedback
- Password confirmation with match validation
- Show/hide password toggle
- Visual indicators for requirements:
  - Minimum 8 characters
  - Uppercase letter
  - Lowercase letter
  - Number
  - Special character
- Form disabled until all requirements met
- Success/error handling

### 3. Auth Callback Route
**Path:** `/auth/reset_password`
**File:** `app/auth/reset_password/route.ts`

**Function:**
- Exchanges auth code for session
- Validates reset token
- Redirects to update_password page

## Server Actions

### requestPasswordUpdate
**File:** `utils/auth-helpers/server.ts` (lines 87-128)

**Function:**
- Validates email format
- Sends password reset email via Supabase Auth
- Returns redirect path with status

### updatePassword
**File:** `utils/auth-helpers/server.ts` (lines 358-397)

**Function:**
- Validates password match
- Updates user password in Supabase
- Returns success/error redirect

## Supabase Configuration Required

### 1. Email Templates
Go to: **Supabase Dashboard → Authentication → Email Templates**

#### Reset Password Template
- **Subject:** Reset Your Password
- **Body:** Should include `{{ .ConfirmationURL }}` link
- **Redirect URL:** `https://yourdomain.com/auth/reset_password`

### 2. URL Configuration
Go to: **Supabase Dashboard → Authentication → URL Configuration**

**Site URL:** `https://hipaahubhealth.com`

**Redirect URLs (Add these):**
- `https://hipaahubhealth.com/auth/reset_password`
- `https://hipaahubhealth.com/update_password`
- `http://localhost:3000/auth/reset_password` (for local testing)
- `http://localhost:3000/update_password` (for local testing)

### 3. Email Settings
Go to: **Supabase Dashboard → Project Settings → Auth**

**Enable Email Provider:** ✅ Checked

**SMTP Settings:** Configure or use Supabase default

### 4. Security Settings
**Password Requirements:**
- Minimum length: 8 characters
- Enable password strength validation: ✅ Recommended

## Environment Variables

No additional environment variables needed. Uses existing Supabase configuration:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Testing Checklist

### Local Testing
- [ ] Go to `/forgot_password`
- [ ] Enter valid email address
- [ ] Submit form
- [ ] Check email inbox for reset link
- [ ] Click link in email
- [ ] Verify redirect to `/update_password`
- [ ] Enter new password (test validation)
- [ ] Confirm new password
- [ ] Submit form
- [ ] Verify redirect to `/signin`
- [ ] Sign in with new password

### Production Testing
- [ ] Verify all redirect URLs are configured in Supabase
- [ ] Test with real email addresses
- [ ] Verify email delivery (check spam folder)
- [ ] Test expired reset links (links expire after 1 hour)
- [ ] Test already-used reset links (links are single-use)

## Security Features

1. **Single-use tokens:** Reset links can only be used once
2. **Time expiration:** Links expire after 1 hour
3. **Password requirements:** Strong password validation
4. **Session management:** Old sessions invalidated on password change
5. **HTTPS only:** All auth flows over secure connection
6. **No password in URL:** Password never transmitted in URL params

## User Experience

### Success Flow
1. User receives clear feedback at each step
2. Toast notifications for all actions
3. Auto-redirect after successful operations
4. Clear password requirements displayed
5. Real-time validation feedback

### Error Handling
- Invalid email format
- Email not found (silent - security best practice)
- Expired reset link
- Invalid reset link
- Password requirements not met
- Passwords don't match
- Network errors

## Common Issues & Solutions

### Issue: Email not received
**Solution:**
- Check spam/junk folder
- Verify SMTP settings in Supabase
- Check email template configuration
- Verify sender domain authentication

### Issue: Reset link doesn't work
**Solution:**
- Check redirect URLs in Supabase Dashboard
- Verify URL matches exactly (no trailing slash differences)
- Check if link expired (1 hour limit)
- Check if link already used (single-use)

### Issue: Password update fails
**Solution:**
- Verify user is authenticated (valid session from reset link)
- Check password meets all requirements
- Verify Supabase Auth is working
- Check network connectivity

## Maintenance

### Regular Checks
- Monitor email delivery rates
- Check for failed password reset attempts
- Review security logs
- Update email templates as needed
- Test flow quarterly

### Analytics to Track
- Password reset request rate
- Email delivery success rate
- Password update success rate
- Time from request to completion
- Failed attempts (may indicate attacks)

## Support

If users report issues:
1. Verify their email is registered
2. Check Supabase logs for errors
3. Verify redirect URLs are correct
4. Test flow yourself with test account
5. Check email provider logs

---

**Last Updated:** 2026-02-03
**Status:** ✅ Production Ready
