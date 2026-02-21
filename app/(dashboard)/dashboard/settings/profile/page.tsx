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
import { LogOutButton } from '@/app/(dashboard)/dashboard/account/logout-button';
import { requestPasswordReset } from '@/app/(dashboard)/dashboard/account/password-reset-action';
import { DeleteAccountForm } from '@/app/(dashboard)/dashboard/account/delete-account-form';
import { Phone, Key, Trash2, UserCircle, CreditCard, Shield, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default async function ProfilePage() {
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

  // Get phone number from multiple sources
  const phoneNumber = 
    user.user_metadata?.phone_number || 
    userDetails?.phone_number || 
    user.phone || 
    null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-thin text-[#0e274e]">User Account</h1>
        <p className="text-[#565656] text-base font-light">
          Manage your profile, subscription, and account settings
        </p>
      </div>

      {/* Profile Overview Card */}
      <Card className="border-0 shadow-sm rounded-none bg-white">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="bg-[#00bceb]/10 p-4 rounded-none">
              <UserCircle className="h-8 w-8 text-[#00bceb]" fill="currentColor" fillOpacity={0.3} strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl font-light text-[#0e274e]">Profile Information</CardTitle>
              <CardDescription className="text-[#565656] font-light">
                Your personal account details
              </CardDescription>
            </div>
            {isSubscribed && (
              <Badge className="bg-[#71bc48]/10 text-[#71bc48] border-[#71bc48]/20 rounded-none font-light">
                Active Subscription
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <form action={updateName} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-[#0e274e] font-light">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                defaultValue={user.user_metadata.full_name || ''}
                placeholder="Enter your full name"
                className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
              />
            </div>
            <Button
              type="submit"
              className="bg-[#00bceb] text-white hover:bg-[#00bceb]/90 rounded-none font-bold"
            >
              Update Name
            </Button>
          </form>
          
          <div className="border-t border-gray-200 pt-6">
            <form action={updateEmail} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newEmail" className="text-[#0e274e] font-light">Email Address</Label>
                <Input
                  id="newEmail"
                  name="newEmail"
                  type="email"
                  defaultValue={user.email}
                  placeholder="Enter your email address"
                  className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
                />
              </div>
              <Button
                type="submit"
                className="bg-[#00bceb] text-white hover:bg-[#00bceb]/90 rounded-none font-bold"
              >
                Update Email
              </Button>
            </form>
          </div>

          {/* Phone Number Display */}
          <div className="border-t border-gray-200 pt-6">
            <div className="space-y-2">
              <Label className="text-[#0e274e] font-light flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#00bceb]" />
                Phone Number
              </Label>
              {phoneNumber ? (
                <div className="text-base font-light text-[#0e274e] bg-[#f3f5f9] px-4 py-3 border border-gray-200 rounded-none">
                  {phoneNumber}
                </div>
              ) : (
                <div className="text-sm text-amber-600 bg-amber-50 px-4 py-3 border border-amber-200 rounded-none font-light">
                  No phone number found. Please update your profile.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Card */}
      <Card className="border-0 shadow-sm rounded-none bg-white">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="bg-[#00bceb]/10 p-4 rounded-none">
              <CreditCard className="h-8 w-8 text-[#00bceb]" fill="currentColor" fillOpacity={0.3} strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl font-light text-[#0e274e]">Subscription & Billing</CardTitle>
              <CardDescription className="text-[#565656] font-light">
                Your current plan and billing information
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {subscription ? (
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <Label className="text-sm text-[#565656] font-light">Plan</Label>
                <div className="text-base font-semibold text-[#0e274e]">
                  {subscription?.prices?.products?.name || 'N/A'}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-sm text-[#565656] font-light">Status</Label>
                <div className="text-base font-semibold text-[#0e274e] capitalize">
                  {subscription?.status || 'N/A'}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-sm text-[#565656] font-light">Next Renewal</Label>
                <div className="text-base font-semibold text-[#0e274e]">
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
                <Label className="text-sm text-[#565656] font-light">Amount</Label>
                <div className="text-base font-semibold text-[#0e274e]">
                  {subscription?.prices?.unit_amount
                    ? `$${(subscription.prices.unit_amount / 100).toFixed(2)} / ${subscription.prices.interval}`
                    : 'N/A'}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-base font-semibold text-[#0e274e]">No active subscription</div>
                <div className="text-sm text-[#565656] font-light">Choose a plan to access the dashboard.</div>
              </div>
              <Link href="/#pricing">
                <Button className="bg-[#00bceb] text-white hover:bg-[#00bceb]/90 rounded-none font-bold">
                  View Pricing
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
        {isSubscribed && (
          <CardFooter className="border-t border-gray-200">
            <Link href="/dashboard/account/subscription">
              <Button className="bg-[#00bceb] text-white hover:bg-[#00bceb]/90 rounded-none font-bold">
                Manage Subscription
              </Button>
            </Link>
          </CardFooter>
        )}
      </Card>

      {/* Security Card */}
      <Card className="border-0 shadow-sm rounded-none bg-white">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="bg-[#00bceb]/10 p-4 rounded-none">
              <Shield className="h-8 w-8 text-[#00bceb]" fill="currentColor" fillOpacity={0.3} strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl font-light text-[#0e274e] flex items-center gap-2">
                Password & Security
              </CardTitle>
              <CardDescription className="text-[#565656] font-light">
                Reset your password or update your security settings
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form action={requestPasswordReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resetEmail" className="text-[#0e274e] font-light">Email for Password Reset</Label>
              <Input
                id="resetEmail"
                name="email"
                type="email"
                defaultValue={user.email || ''}
                placeholder="Enter your email address"
                className="border-gray-300 focus:border-[#00bceb] focus:ring-[#00bceb] rounded-none font-light"
                readOnly
              />
              <p className="text-sm text-[#565656] font-light">
                We'll send a password reset link to this email address.
              </p>
            </div>
            <Button
              type="submit"
              className="bg-[#00bceb] text-white hover:bg-[#00bceb]/90 rounded-none font-bold"
            >
              Send Password Reset Email
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Compliance & Documents Card */}
      <Card className="border-0 shadow-sm rounded-none bg-white">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="bg-[#00bceb]/10 p-4 rounded-none">
              <FileText className="h-8 w-8 text-[#00bceb]" fill="currentColor" fillOpacity={0.3} strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl font-light text-[#0e274e]">Compliance & Attestations</CardTitle>
              <CardDescription className="text-[#565656] font-light">
                View your compliance status and signed documents
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#f3f5f9] border border-gray-200 rounded-none">
              <div>
                <div className="text-sm font-semibold text-[#0e274e]">HIPAA Compliance Status</div>
                <div className="text-xs text-[#565656] font-light mt-1">Last updated: {new Date().toLocaleDateString()}</div>
              </div>
              <Badge className="bg-[#71bc48]/10 text-[#71bc48] border-[#71bc48]/20 rounded-none font-light">
                Compliant
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-[#f3f5f9] border border-gray-200 rounded-none">
              <div>
                <div className="text-sm font-semibold text-[#0e274e]">Signed Documents</div>
                <div className="text-xs text-[#565656] font-light mt-1">View all signed policies and agreements</div>
              </div>
              <Link href="/dashboard/policies">
                <Button variant="outline" className="border-gray-300 hover:bg-gray-50 rounded-none font-light text-[#565656]">
                  View Documents
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logout Card */}
      <Card className="border-0 shadow-sm rounded-none bg-white">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-xl font-light text-[#0e274e]">Session Management</CardTitle>
          <CardDescription className="text-[#565656] font-light">
            End your current session on this device
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <LogOutButton />
        </CardContent>
      </Card>

      {/* Delete Account Card */}
      <Card className="border-l-4 border-red-400 shadow-sm rounded-none bg-white">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-xl font-light text-red-600 flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Delete Account
          </CardTitle>
          <CardDescription className="text-[#565656] font-light">
            Permanently delete your account and all associated data. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <DeleteAccountForm />
        </CardContent>
      </Card>
    </div>
  );
}
