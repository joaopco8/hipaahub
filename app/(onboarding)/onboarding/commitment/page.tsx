'use client';

import { useState } from 'react';
import { useOnboarding } from '@/contexts/onboarding-context';
import { useRouter } from 'next/navigation';
import { OnboardingLayout } from '@/components/onboarding/onboarding-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#1ad07a]/10 mb-4">
            <Shield className="h-10 w-10 text-[#1ad07a]" />
          </div>
          <h1 className="text-3xl font-extralight text-zinc-900">
            Compliance Commitment
          </h1>
          <p className="text-lg text-zinc-600">
            HIPAA compliance is an ongoing responsibility
          </p>
        </div>

        <Card className="card-premium-enter stagger-item">
          <CardHeader>
            <CardTitle>Your Commitment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-zinc-50 border border-zinc-200">
                <CheckCircle2 className="h-5 w-5 text-[#1ad07a] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-zinc-900 leading-relaxed">
                    I understand that HIPAA compliance is an ongoing responsibility and commit to maintaining the safeguards identified in this assessment.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 rounded-lg border border-zinc-200 hover:border-[#1ad07a] transition-colors cursor-pointer"
                onClick={() => setCommitted(!committed)}
              >
                <Checkbox
                  id="commitment"
                  checked={committed}
                  onCheckedChange={(checked) => setCommitted(checked === true)}
                  className="mt-1"
                />
                <Label
                  htmlFor="commitment"
                  className="flex-1 cursor-pointer text-sm leading-relaxed"
                >
                  I acknowledge and accept this commitment to ongoing HIPAA compliance.
                </Label>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-200">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-extralight text-blue-900 mb-2 text-sm">
                  Why this matters:
                </h4>
                <ul className="space-y-1 text-xs text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Demonstrates good faith effort in compliance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Provides legal protection during audits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
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

