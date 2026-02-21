'use client';

import { useState } from 'react';
import { useOnboarding } from '@/contexts/onboarding-context';
import { useRouter } from 'next/navigation';
import { OnboardingLayout } from '@/components/onboarding/onboarding-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Shield, CheckCircle2 } from 'lucide-react';
import { saveComplianceCommitment, generateAndSaveActionItems } from '@/app/actions/onboarding';

export default function CommitmentPage() {
  const { markStepComplete } = useOnboarding();
  const router = useRouter();
  const [committed, setCommitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleActivate = async () => {
    if (!committed) {
      return;
    }

    setIsSaving(true);
    try {
      // Save commitment to database
      await saveComplianceCommitment();
      
      // Generate and save action items from risk assessment
      await generateAndSaveActionItems();
      
      markStepComplete(9);
      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving commitment:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to save commitment. Please try again.';
      alert(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <OnboardingLayout
      showNextButton={true}
      showBackButton={true}
      nextButtonLabel={isSaving ? 'Saving...' : 'Activate Compliance Dashboard'}
      nextButtonDisabled={!committed || isSaving}
      onNext={handleActivate}
      onBack={() => router.push('/onboarding/action-plan')}
    >
      <div className="space-y-6 max-w-2xl mx-auto w-full">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#00bceb]/10 mb-4">
            <Shield className="h-10 w-10 text-[#00bceb]" />
          </div>
          <h1 className="text-3xl font-thin text-[#0e274e]">
            Compliance Commitment
          </h1>
          <p className="text-lg text-[#565656] font-light">
            HIPAA compliance is an ongoing responsibility
          </p>
        </div>

        <Card className="card-premium-enter stagger-item rounded-none border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-[#0e274e] font-light">Your Commitment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-[#f3f5f9] border border-gray-200 rounded-none">
                <CheckCircle2 className="h-5 w-5 text-[#00bceb] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-[#0e274e] leading-relaxed font-light">
                    I understand that HIPAA compliance is an ongoing responsibility and commit to maintaining the safeguards identified in this assessment.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 border border-gray-200 hover:border-[#00bceb] transition-colors cursor-pointer rounded-none"
                onClick={() => setCommitted(!committed)}
              >
                <Checkbox
                  id="commitment"
                  checked={committed}
                  onCheckedChange={(checked) => setCommitted(checked === true)}
                  className="mt-1 rounded-none data-[state=checked]:bg-[#00bceb] data-[state=checked]:border-[#00bceb]"
                />
                <Label
                  htmlFor="commitment"
                  className="flex-1 cursor-pointer text-sm leading-relaxed text-[#565656] font-light"
                >
                  I acknowledge and accept this commitment to ongoing HIPAA compliance.
                </Label>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="bg-[#00bceb]/5 border border-[#00bceb]/20 p-4 rounded-none">
                <h4 className="font-light text-[#0e274e] mb-2 text-sm">
                  Why this matters:
                </h4>
                <ul className="space-y-1 text-xs text-[#565656] font-light">
                  <li className="flex items-start gap-2">
                    <span className="text-[#00bceb] mt-0.5">•</span>
                    <span>Demonstrates good faith effort in compliance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#00bceb] mt-0.5">•</span>
                    <span>Provides legal protection during audits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#00bceb] mt-0.5">•</span>
                    <span>Shows commitment to patient privacy and security</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </OnboardingLayout>
  );
}
