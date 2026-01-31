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
import { ArrowLeft } from 'lucide-react';
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
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-8 lg:px-12 xl:px-16 bg-[#0d1122]">
        <div className="w-full max-w-md mx-auto space-y-8">
          {/* Back Button */}
          <Link
            href="/signin"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-geologica font-light mb-4"
            prefetch={false}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>

          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <Image
              src="/images/logohipa.png"
              alt="HIPAA Hub"
              width={120}
              height={120}
              className="object-contain"
            />
          </div>

          {/* Form Title */}
          <div className="space-y-2">
            <h2 className="text-3xl font-geologica font-light text-white">
              Complete your profile
            </h2>
            <p className="text-zinc-400 font-geologica font-light text-base">
              We need your phone number to complete your account setup
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="phone_number" className="text-zinc-300 font-geologica font-light text-sm">
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
                className="h-12 bg-white/10 border-zinc-600 text-white placeholder:text-zinc-500 rounded-lg font-geologica font-light focus:border-[#1ad07a] focus:ring-[#1ad07a] focus:bg-white/15"
              />
              <p className="text-xs text-zinc-400 font-geologica font-light">
                This will be used for account verification and important communications
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-[#1ad07a] text-[#0d1122] font-geologica font-medium hover:bg-[#1ad07a]/90 rounded-lg text-base"
              disabled={isSubmitting || !phoneNumber.trim()}
            >
              {isSubmitting ? 'Saving...' : 'Continue →'}
            </Button>
          </form>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="relative hidden md:block w-1/2">
        <img
          src="/seguro-rcp-enfermeiro-1920x0-c-default_upscayl_4x_ultramix-balanced-4x.png"
          alt="Healthcare professional using a laptop"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-black/10" />
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
