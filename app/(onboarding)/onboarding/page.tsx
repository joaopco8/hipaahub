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
          <h1 className="text-4xl font-thin text-[#0e274e]">
            Welcome to HIPAA Hub
          </h1>
          <p className="text-lg text-[#565656] max-w-2xl mx-auto font-light">
            Let's get your practice HIPAA compliant in just a few steps. This
            will take about 20-30 minutes, including time to upload evidence documents.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 mt-8">
          <Card className="border-0 shadow-sm bg-white rounded-none">
            <CardHeader>
              <Shield className="h-8 w-8 text-[#00bceb] mb-2" />
              <CardTitle className="text-[#0e274e] font-light">Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#565656] font-light">
                Quick questionnaire to identify your HIPAA compliance gaps
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white rounded-none">
            <CardHeader>
              <FileCheck className="h-8 w-8 text-[#00bceb] mb-2" />
              <CardTitle className="text-[#0e274e] font-light">Action Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#565656] font-light">
                Get a clear list of what you need to do to become compliant
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white rounded-none">
            <CardHeader>
              <FileCheck className="h-8 w-8 text-[#00bceb] mb-2" />
              <CardTitle className="text-[#0e274e] font-light">Ready Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#565656] font-light">
                Generate HIPAA policies and documents instantly
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white rounded-none">
            <CardHeader>
              <Users className="h-8 w-8 text-[#00bceb] mb-2" />
              <CardTitle className="text-[#0e274e] font-light">Staff Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#565656] font-light">
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
            className="inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-bold h-11 px-8 bg-[#00bceb] text-white hover:bg-[#00bceb]/90 transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00bceb] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-[1.01] active:scale-[0.98] cursor-pointer no-underline"
            style={{ pointerEvents: 'auto', position: 'relative', zIndex: 1000 }}
          >
            Get Started
          </Link>
        </div>
      </div>
    </OnboardingLayout>
  );
}
