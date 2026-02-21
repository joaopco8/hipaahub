'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingLayout } from '@/components/onboarding/onboarding-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, FileText, Clock, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { QUESTIONS } from '../risk-assessment/questions';

const TOTAL_QUESTIONS = QUESTIONS.length; // Approximately 150 questions

export default function RiskAssessmentIntroPage() {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = () => {
    setIsStarting(true);
    router.push('/onboarding/risk-assessment');
  };

  const handleBack = () => {
    router.push('/onboarding/organization');
  };

  return (
    <OnboardingLayout
      onNext={handleStart}
      onBack={handleBack}
      nextButtonLabel={isStarting ? 'Starting...' : 'Start Assessment'}
      showNextButton={true}
      nextButtonDisabled={isStarting}
    >
      <div className="space-y-6 max-w-3xl mx-auto w-full">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-[#00bceb]/10 p-4">
              <Shield className="h-12 w-12 text-[#00bceb]" />
            </div>
          </div>
          <h1 className="text-3xl font-thin text-[#0e274e]">
            HIPAA Security Risk Assessment
          </h1>
          <p className="text-lg text-[#565656] max-w-2xl mx-auto font-light">
            Your answers will be used to generate compliance documents and streamline your legal processes
          </p>
        </div>

        <Card className="border-0 shadow-sm card-premium-enter stagger-item rounded-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#0e274e] font-light">
              <Info className="h-5 w-5 text-[#00bceb]" />
              Important Information
            </CardTitle>
            <CardDescription className="text-[#565656] font-light">
              Please read carefully before starting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="bg-[#00bceb]/10 p-3">
                    <FileText className="h-6 w-6 text-[#00bceb]" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-light text-[#0e274e] mb-1">
                    Document Generation
                  </h3>
                  <p className="text-sm text-[#565656] font-light">
                    Your responses will be used to automatically generate HIPAA compliance documents, including policies, procedures, and risk assessment reports. Accurate answers ensure legally sound documentation.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="bg-[#71bc48]/10 p-3">
                    <CheckCircle2 className="h-6 w-6 text-[#71bc48]" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-light text-[#0e274e] mb-1">
                    Legal Compliance Made Simple
                  </h3>
                  <p className="text-sm text-[#565656] font-light">
                    This assessment helps you meet HIPAA requirements and simplifies your legal compliance process. The information you provide will be used to create audit-ready documentation.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="bg-[#0e274e]/10 p-3">
                    <Clock className="h-6 w-6 text-[#0e274e]" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-light text-[#0e274e] mb-1">
                    {TOTAL_QUESTIONS} Questions - One Time Assessment
                  </h3>
                  <p className="text-sm text-[#565656] font-light">
                    This comprehensive assessment covers all HIPAA Security Rule requirements. While you can update your answers later, we recommend completing it carefully in one session. Your responses will be used to generate all compliance documents.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="bg-amber-50 p-3">
                    <AlertCircle className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-light text-[#0e274e] mb-1">
                    Take Your Time
                  </h3>
                  <p className="text-sm text-[#565656] font-light">
                    These questions are important for your compliance. Please answer carefully and accurately. Your progress is automatically saved, so you can take breaks and return anytime.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="bg-[#f3f5f9] p-4 space-y-2">
                <p className="text-sm font-light text-[#0e274e]">
                  Remember:
                </p>
                <ul className="text-sm text-[#565656] space-y-1 list-disc list-inside font-light">
                  <li>Your answers are automatically saved as you progress</li>
                  <li>You can return and update your responses later</li>
                  <li>Accurate answers ensure better compliance documentation</li>
                  <li>This assessment typically takes 20-30 minutes to complete</li>
                  <li>Your answers are used to generate HIPAA compliance documents automatically</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center pt-4">
          <Button
            onClick={handleStart}
            disabled={isStarting}
            className="bg-[#00bceb] text-white hover:bg-[#00bceb]/90 px-8 py-6 text-lg font-bold rounded-none"
            size="lg"
          >
            {isStarting ? 'Starting Assessment...' : `Start Assessment (${TOTAL_QUESTIONS} Questions)`}
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
