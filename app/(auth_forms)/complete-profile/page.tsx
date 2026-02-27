'use client';

// Force dynamic rendering to prevent build-time prerendering errors with useSearchParams
export const dynamic = 'force-dynamic';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

function CompleteProfilePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const redirectParam = searchParams.get('redirect') || '';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!phoneNumber.trim()) {
      toast.error('Please enter your phone number');
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error('You must be signed in to complete your profile');
        router.push('/signin');
        return;
      }

      // Update user phone number
      const { error } = await supabase
        .from('users')
        .update({ phone_number: phoneNumber.trim() })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating phone number:', error);
        toast.error('Failed to save phone number. Please try again.');
        return;
      }

      // Also update in auth metadata
      await supabase.auth.updateUser({
        data: { phone_number: phoneNumber.trim() }
      });

      toast.success('Phone number saved successfully');

      // Redirect based on redirect parameter or default flow
      if (redirectParam === 'checkout') {
        router.push('/checkout');
      } else {
        // Check subscription status and redirect accordingly
        const { getSubscription } = await import('@/utils/supabase/queries');
        const subscription = await getSubscription(supabase, user.id);
        
        if (subscription) {
          // Check onboarding status
          const { getOrganization, getComplianceCommitment } = await import('@/utils/supabase/queries');
          const [organization, commitment] = await Promise.all([
            getOrganization(supabase, user.id),
            getComplianceCommitment(supabase, user.id)
          ]);

          if (organization && commitment) {
            router.push('/dashboard');
          } else {
            router.push('/onboarding/expectation');
          }
        } else {
          router.push('/checkout');
        }
      }
    } catch (error) {
      console.error('Error completing profile:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] bg-[#f3f5f9]">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-8 lg:px-12 xl:px-16 bg-white">
        <div className="w-full max-w-md mx-auto space-y-8">
          {/* Back Button */}
          <Link
            href="/signin"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-cisco-navy transition-colors text-sm font-thin mb-4"
            prefetch={false}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>

          {/* Logo */}
          <div className="flex items-center justify-start mb-8">
            <Image
              src="/logoescura.png"
              alt="HIPAA Hub"
              width={140}
              height={40}
              className="object-contain"
              priority
            />
          </div>

          {/* Form Title */}
          <div className="space-y-3">
            <h2 className="text-3xl md:text-4xl font-thin text-cisco-navy leading-tight">
              Complete your profile
            </h2>
            <p className="text-gray-600 font-thin text-base leading-relaxed">
              We need your phone number to complete your account setup
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-6 mt-8"
          >
            <div className="space-y-2">
              <Label htmlFor="phone_number" className="text-gray-700 font-thin text-sm">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone_number"
                type="tel"
                name="phone_number"
                placeholder="(555) 123-4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                autoComplete="tel"
                required
                className="h-12 bg-white border-gray-300 text-cisco-navy placeholder:text-gray-400 rounded-none font-thin focus:border-cisco-blue focus:ring-cisco-blue focus:ring-1"
              />
              <p className="text-xs text-gray-500 font-thin mt-2">
                This will be used for account verification and important communications
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-cisco-blue text-white font-thin hover:bg-cisco-navy transition-all rounded-none text-sm shadow-md shadow-cisco-blue/10"
              disabled={isSubmitting || !phoneNumber.trim()}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                <>
                  Continue <ArrowRight className="w-4 h-4 ml-2 inline" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Right Side - Clean Background */}
      <div className="relative hidden lg:block w-1/2 bg-cisco-navy">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-cisco-blue/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/10 blur-[100px] rounded-full"></div>
        </div>
        <div className="relative z-10 h-full flex items-center justify-center p-12">
          <div className="max-w-md text-white">
            <h3 className="text-2xl md:text-3xl font-thin mb-4 leading-tight">
              Secure. Compliant. Ready.
            </h3>
            <p className="text-gray-300 font-thin text-base leading-relaxed">
              Complete your profile to access HIPAA compliance tools and start your journey to continuous compliance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CompleteProfilePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[100dvh] bg-[#f3f5f9] items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <CompleteProfilePageContent />
    </Suspense>
  );
}
