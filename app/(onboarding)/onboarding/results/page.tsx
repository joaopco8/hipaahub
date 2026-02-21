'use client';

import { useOnboarding } from '@/contexts/onboarding-context';
import { useRouter } from 'next/navigation';
import { OnboardingLayout } from '@/components/onboarding/onboarding-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';

export default function ResultsPage() {
  const { state, nextStep, markStepComplete } = useOnboarding();
  const router = useRouter();
  const { riskLevel, riskAssessment } = state;

  // Calculate gaps
  const totalQuestions = riskAssessment ? Object.keys(riskAssessment).length : 0;
  const gaps = riskAssessment
    ? Object.values(riskAssessment).filter(
        (answer) => !answer || answer === 'no' || answer === 'some' || answer === 'partial'
      ).length
    : 0;

  const getRiskConfig = () => {
    switch (riskLevel) {
      case 'low':
        return {
          icon: CheckCircle2,
          color: 'text-[#71bc48]',
          bgColor: 'bg-[#71bc48]/10',
          borderColor: 'border-[#71bc48]/20',
          title: 'Low Risk',
          message: 'You are mostly compliant, but there are a few areas to improve.',
          legalVerdict: 'Your organization shows strong HIPAA alignment, but documentation and evidence are still required.'
        };
      case 'medium':
        return {
          icon: AlertTriangle,
          color: 'text-amber-500',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          title: 'Medium Risk',
          message: 'You have some compliance gaps that need attention.',
          legalVerdict: 'Your organization has compliance gaps that could result in penalties if audited.'
        };
      case 'high':
        return {
          icon: XCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          title: 'High Risk',
          message: 'You are missing critical HIPAA requirements that need immediate action.',
          legalVerdict: 'Your organization is at significant risk of HIPAA violations and financial penalties.'
        };
      default:
        return {
          icon: AlertTriangle,
          color: 'text-[#565656]',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          title: 'Unknown',
          message: 'Unable to determine risk level.',
          legalVerdict: 'Unable to determine risk level.'
        };
    }
  };

  const config = getRiskConfig();
  const Icon = config.icon;

  const handleContinue = () => {
    markStepComplete(4);
    nextStep();
    // Navigate to action plan
    router.push('/onboarding/action-plan');
  };

  const handleBack = () => {
    router.push('/onboarding/risk-assessment');
  };

  return (
    <OnboardingLayout
      onNext={handleContinue}
      onBack={handleBack}
      nextButtonLabel="View Action Plan"
      showBackButton={true}
    >
      <div className="space-y-6 max-w-3xl mx-auto w-full">
        <div className="text-center space-y-4">
          <div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${config.bgColor} ${config.borderColor} border-2 mb-4`}
          >
            <Icon className={`h-10 w-10 ${config.color}`} />
          </div>
          <h1 className="text-4xl font-thin text-[#0e274e]">
            Your HIPAA Risk Assessment Results
          </h1>
          <p className="text-xl text-[#565656] font-light">{config.message}</p>
          <div className="mt-4 p-4 bg-white border border-gray-200 rounded-none shadow-sm">
            <p className="text-base font-light text-[#0e274e]">
              {config.legalVerdict}
            </p>
          </div>
        </div>

        <Card className={`card-premium-enter stagger-item ${config.bgColor} ${config.borderColor} border rounded-none`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-light text-[#0e274e]">Risk Status</CardTitle>
              {riskLevel && <StatusBadge status={riskLevel === 'low' ? 'compliant' : riskLevel === 'medium' ? 'partial' : 'at-risk'} className="rounded-none" />}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-4">
              <div className="text-5xl font-thin text-[#0e274e] mb-2">
                {gaps}
              </div>
              <div className="text-lg text-[#565656] font-light">
                {gaps === 1 ? 'Critical gap identified' : 'Critical gaps identified'}
              </div>
              <p className="text-sm text-gray-400 font-light mt-2">
                Out of {totalQuestions} requirements assessed
              </p>
            </div>

            <div className="bg-white p-6 space-y-4 rounded-none border border-gray-100 shadow-sm">
              <h3 className="font-light text-[#0e274e]">
                What this means:
              </h3>
              <ul className="space-y-2 text-sm text-[#565656] font-light">
                {riskLevel === 'high' && (
                  <>
                    <li className="flex items-start gap-2">
                      <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                      <span>
                        You are missing {gaps} critical HIPAA requirements that
                        could result in penalties up to $50,000 per violation.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                      <span>
                        Immediate action is required to protect your practice and
                        patients.
                      </span>
                    </li>
                  </>
                )}
                {riskLevel === 'medium' && (
                  <>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                      <span>
                        You have {gaps} compliance gaps that should be addressed
                        to reduce risk.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                      <span>
                        Following the action plan will help you achieve full
                        compliance.
                      </span>
                    </li>
                  </>
                )}
                {riskLevel === 'low' && (
                  <>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-[#71bc48] shrink-0 mt-0.5" />
                      <span>
                        You are in good shape, but there are {gaps} areas for
                        improvement.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-[#71bc48] shrink-0 mt-0.5" />
                      <span>
                        Completing the remaining items will ensure ongoing
                        compliance.
                      </span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </OnboardingLayout>
  );
}
