'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { OnboardingLayout } from '@/components/onboarding/onboarding-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, FileCheck, Users } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();

  // Redirect to expectation if first time
  useEffect(() => {
    // Check if user has seen expectation page
    const hasSeenExpectation = sessionStorage.getItem('hasSeenExpectation');
    if (!hasSeenExpectation) {
      router.push('/onboarding/expectation');
      sessionStorage.setItem('hasSeenExpectation', 'true');
    }
  }, [router]);

  const handleGetStarted = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push('/onboarding/organization');
  };

  return (
    <OnboardingLayout showNextButton={false} showBackButton={false}>
      <div className="space-y-6 relative" style={{ zIndex: 1 }}>
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extralight text-zinc-900">
            Welcome to HIPAA Hub
          </h1>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
            Let's get your practice HIPAA compliant in just a few steps. This
            will take about 20-30 minutes, including time to upload evidence documents.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 mt-8">
          <Card className="card-premium-enter stagger-item">
            <CardHeader>
              <Shield className="h-8 w-8 text-[#1ad07a] mb-2" />
              <CardTitle>Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600">
                Quick questionnaire to identify your HIPAA compliance gaps
              </p>
            </CardContent>
          </Card>

          <Card className="card-premium-enter stagger-item" style={{ animationDelay: '50ms' }}>
            <CardHeader>
              <FileCheck className="h-8 w-8 text-[#1ad07a] mb-2" />
              <CardTitle>Action Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600">
                Get a clear list of what you need to do to become compliant
              </p>
            </CardContent>
          </Card>

          <Card className="card-premium-enter stagger-item" style={{ animationDelay: '100ms' }}>
            <CardHeader>
              <FileCheck className="h-8 w-8 text-[#1ad07a] mb-2" />
              <CardTitle>Ready Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600">
                Generate HIPAA policies and documents instantly
              </p>
            </CardContent>
          </Card>

          <Card className="card-premium-enter stagger-item" style={{ animationDelay: '150ms' }}>
            <CardHeader>
              <Users className="h-8 w-8 text-[#1ad07a] mb-2" />
              <CardTitle>Staff Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600">
                Track employee training and compliance
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center mt-8 relative" style={{ zIndex: 100 }}>
          <Link
            href="/onboarding/organization"
            onClick={(e) => {
              console.log('Link clicked!');
              handleGetStarted(e);
            }}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-11 px-8 bg-[#1ad07a] text-[#0d1122] hover:bg-[#1ad07a]/90 transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1ad07a] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-[1.01] active:scale-[0.98] cursor-pointer no-underline"
            style={{ pointerEvents: 'auto', position: 'relative', zIndex: 1000 }}
          >
            Get Started
          </Link>
        </div>
      </div>
    </OnboardingLayout>
  );
}
