import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { createClient } from '@/utils/supabase/server';
import {
  getUser,
  getUserDetails,
  getSubscription
} from '@/utils/supabase/queries';
import { updateName, updateEmail } from '@/utils/auth-helpers/server';
import { redirect } from 'next/navigation';
import { LogOutButton } from './logout-button';
import { requestPasswordReset } from './password-reset-action';
import { DeleteAccountForm } from './delete-account-form';
import { Phone, Key, Trash2 } from 'lucide-react';

export default async function AccountPage() {
  const supabase = createClient();
  const [user, userDetails] = await Promise.all([
    getUser(supabase),
    getUserDetails(supabase),
  ]);

  if (!user) {
    return redirect('/signin');
  }

  const subscription = await getSubscription(supabase, user.id);
  const isSubscribed = subscription?.status === 'active' || subscription?.status === 'trialing';

  // Get phone number from multiple sources (user_metadata, users table, or auth.phone)
  // Phone is required, so we check all possible locations
  const phoneNumber = 
    user.user_metadata?.phone_number || 
    userDetails?.phone_number || 
    user.phone || 
    null;

  return (
    <div className="flex min-h-screen w-full flex-col gap-6 max-w-7xl mx-auto page-transition-premium">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Account Settings</h1>
        <p className="text-zinc-600 text-base">
          Manage your account information and subscription.
        </p>
      </div>

      {/* Personal Information */}
      <Card className="border-zinc-200 card-premium-enter stagger-item">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-zinc-900">Personal Information</CardTitle>
          <CardDescription className="text-zinc-600">
            Update your name and email address.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form action={updateName} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-zinc-900">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                defaultValue={user.user_metadata.full_name || ''}
                placeholder="Enter your full name"
                className="border-zinc-200 focus:border-[#1ad07a] focus:ring-[#1ad07a]"
              />
            </div>
            <Button
              type="submit"
              className="bg-[#1ad07a] text-[#0d1122] hover:bg-[#1ad07a]/90"
            >
              Update Name
            </Button>
          </form>
          
          <div className="border-t border-zinc-200 pt-6">
            <form action={updateEmail} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newEmail" className="text-zinc-900">Email Address</Label>
                <Input
                  id="newEmail"
                  name="newEmail"
                  type="email"
                  defaultValue={user.email}
                  placeholder="Enter your email address"
                  className="border-zinc-200 focus:border-[#1ad07a] focus:ring-[#1ad07a]"
                />
              </div>
              <Button
                type="submit"
                className="bg-[#1ad07a] text-[#0d1122] hover:bg-[#1ad07a]/90"
              >
                Update Email
              </Button>
            </form>
          </div>

          {/* Phone Number Display - Always show since it's required */}
          <div className="border-t border-zinc-200 pt-6">
            <div className="space-y-2">
              <Label className="text-zinc-900 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </Label>
              {phoneNumber ? (
                <>
                  <div className="text-base font-medium text-zinc-900 bg-zinc-50 px-4 py-2 rounded-lg border border-zinc-200">
                    {phoneNumber}
                  </div>
                </>
              ) : (
                <div className="text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-lg border border-amber-200">
                  No phone number found. Please update your profile.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Reset */}
      <Card className="border-zinc-200 card-premium-enter stagger-item" style={{ animationDelay: '100ms' }}>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-zinc-900 flex items-center gap-2">
            <Key className="h-5 w-5 text-[#1ad07a]" />
            Password & Security
          </CardTitle>
          <CardDescription className="text-zinc-600">
            Reset your password or update your security settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={requestPasswordReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resetEmail" className="text-zinc-900">Email for Password Reset</Label>
              <Input
                id="resetEmail"
                name="email"
                type="email"
                defaultValue={user.email || ''}
                placeholder="Enter your email address"
                className="border-zinc-200 focus:border-[#1ad07a] focus:ring-[#1ad07a]"
                readOnly
              />
              <p className="text-sm text-zinc-600">
                We'll send a password reset link to this email address.
              </p>
            </div>
            <Button
              type="submit"
              className="bg-[#1ad07a] text-[#0d1122] hover:bg-[#1ad07a]/90"
            >
              Send Password Reset Email
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card className="border-zinc-200 card-premium-enter stagger-item" style={{ animationDelay: '50ms' }}>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-zinc-900">Subscription</CardTitle>
          <CardDescription className="text-zinc-600">
            Your current plan and billing status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscription ? (
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <Label className="text-sm text-zinc-600">Plan</Label>
                <div className="text-base font-semibold text-zinc-900">
                  {subscription?.prices?.products?.name || 'N/A'}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-sm text-zinc-600">Status</Label>
                <div className="text-base font-semibold text-zinc-900 capitalize">
                  {subscription?.status || 'N/A'}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-sm text-zinc-600">Next Renewal</Label>
                <div className="text-base font-semibold text-zinc-900">
                  {subscription?.current_period_end
                    ? new Date(subscription.current_period_end).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })
                    : 'N/A'}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-sm text-zinc-600">Amount</Label>
                <div className="text-base font-semibold text-zinc-900">
                  {subscription?.prices?.unit_amount
                    ? `$${(subscription.prices.unit_amount / 100).toFixed(2)} / ${subscription.prices.interval}`
                    : 'N/A'}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-base font-semibold text-zinc-900">No active subscription</div>
                <div className="text-sm text-zinc-600">Choose a plan to access the dashboard.</div>
              </div>
              <Link href="/#pricing">
                <Button className="bg-[#1ad07a] text-[#0d1122] hover:bg-[#1ad07a]/90">
                  View Pricing
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
        {isSubscribed && (
          <CardFooter>
            <Link href="/dashboard/account/subscription">
              <Button className="bg-[#1ad07a] text-[#0d1122] hover:bg-[#1ad07a]/90">
                Manage Subscription
              </Button>
            </Link>
          </CardFooter>
        )}
      </Card>

      <Card className="border-zinc-200 card-premium-enter stagger-item">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-zinc-900">Log out</CardTitle>
          <CardDescription className="text-zinc-600">
            End your current session on this device.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LogOutButton />
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="border-red-200 card-premium-enter stagger-item" style={{ animationDelay: '150ms' }}>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-red-600 flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Delete Account
          </CardTitle>
          <CardDescription className="text-zinc-600">
            Permanently delete your account and all associated data. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteAccountForm />
        </CardContent>
      </Card>
    </div>
  );
}
