'use client';

import { useMemo } from 'react';
import { useOnboarding } from '@/contexts/onboarding-context';
import { useRouter } from 'next/navigation';
import { OnboardingLayout } from '@/components/onboarding/onboarding-layout';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, AlertCircle, FileText, Shield, Users, Lock, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium';
  category: string;
  icon: React.ReactNode;
}

export default function ActionPlanPage() {
  const { state, nextStep, markStepComplete } = useOnboarding();
  const router = useRouter();
  const { riskAssessment } = state;

  const actionItems = useMemo<ActionItem[]>(() => {
    const items: ActionItem[] = [];

    if (!riskAssessment) return items;

    // Generate action items based on assessment answers
    if (riskAssessment['security-policy'] !== 'yes') {
      items.push({
        id: 'security-policy',
        title: 'Create Security Policy',
        description:
          'A written HIPAA Security Policy is required to document your security measures.',
        priority: 'critical',
        category: 'Policies',
        icon: <FileText className="h-5 w-5" />
      });
    }

    if (riskAssessment['privacy-policy'] !== 'yes') {
      items.push({
        id: 'privacy-policy',
        title: 'Create Privacy Policy',
        description:
          'A HIPAA Privacy Policy is required to inform patients of their rights.',
        priority: 'critical',
        category: 'Policies',
        icon: <FileText className="h-5 w-5" />
      });
    }

    if (riskAssessment['cloud-baa'] === 'no' || riskAssessment['cloud-baa'] === 'some') {
      items.push({
        id: 'cloud-baa',
        title: 'Sign BAA with Cloud Provider',
        description:
          'Business Associate Agreements are required with any vendor handling PHI.',
        priority: 'critical',
        category: 'Contracts',
        icon: <Shield className="h-5 w-5" />
      });
    }

    if (riskAssessment['employee-training'] !== 'yes') {
      items.push({
        id: 'employee-training',
        title: 'Train Staff on HIPAA',
        description:
          'All employees must complete HIPAA training and sign attestations.',
        priority: 'high',
        category: 'Training',
        icon: <Users className="h-5 w-5" />
      });
    }

    if (riskAssessment['encryption'] !== 'yes') {
      items.push({
        id: 'encryption',
        title: 'Implement Data Encryption',
        description:
          'Encrypt electronic Protected Health Information (ePHI) at rest and in transit.',
        priority: 'high',
        category: 'Security',
        icon: <Lock className="h-5 w-5" />
      });
    }

    if (riskAssessment['incident-plan'] !== 'yes') {
      items.push({
        id: 'incident-plan',
        title: 'Create Incident Response Plan',
        description:
          'A plan for responding to data breaches is required by HIPAA.',
        priority: 'high',
        category: 'Policies',
        icon: <AlertCircle className="h-5 w-5" />
      });
    }

    if (riskAssessment['access-controls'] !== 'yes') {
      items.push({
        id: 'access-controls',
        title: 'Implement Access Controls',
        description:
          'Limit access to PHI to only authorized personnel who need it.',
        priority: 'medium',
        category: 'Security',
        icon: <Lock className="h-5 w-5" />
      });
    }

    if (riskAssessment['physical-security'] !== 'yes') {
      items.push({
        id: 'physical-security',
        title: 'Strengthen Physical Security',
        description:
          'Ensure physical safeguards like locked files and restricted access areas.',
        priority: 'medium',
        category: 'Security',
        icon: <Shield className="h-5 w-5" />
      });
    }

    // Sort by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2 };
    return items.sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
    );
  }, [riskAssessment]);

  const handleContinue = () => {
    markStepComplete(7); // Step 7 (skipping documents and staff pages)
    nextStep();
    // Skip documents and staff pages - navigate directly to commitment
    router.push('/onboarding/commitment');
  };

  const handleBack = () => {
    router.push('/onboarding/results');
  };

  return (
    <OnboardingLayout
      onNext={handleContinue}
      onBack={handleBack}
      nextButtonLabel="Continue"
      showBackButton={true}
    >
      <div className="space-y-8 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-thin text-[#0e274e]">
            Your HIPAA Action Plan
          </h1>
          <p className="text-xl text-[#565656] font-light">
            Here's what you need to do to become compliant
          </p>
        </div>

        {/* Action Items Grid */}
        {actionItems.length === 0 ? (
          <Card className="border-zinc-200 bg-gradient-to-br from-green-50 to-white rounded-none">
            <CardContent className="py-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#71bc48]/10 mb-6">
                <CheckCircle2 className="h-8 w-8 text-[#71bc48]" />
              </div>
              <h3 className="text-2xl font-light text-[#0e274e] mb-3">
                You're all set!
              </h3>
              <p className="text-[#565656] font-light">
                No critical action items identified.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {actionItems.map((item, index) => {
              const priorityConfig = {
                critical: {
                  bg: 'bg-red-50',
                  border: 'border-red-200',
                  iconBg: 'bg-red-100',
                  iconColor: 'text-red-600',
                  badge: 'bg-red-100 text-red-700 border-red-300'
                },
                high: {
                  bg: 'bg-yellow-50',
                  border: 'border-yellow-200',
                  iconBg: 'bg-yellow-100',
                  iconColor: 'text-yellow-600',
                  badge: 'bg-yellow-100 text-yellow-700 border-yellow-300'
                },
                medium: {
                  bg: 'bg-blue-50',
                  border: 'border-blue-200',
                  iconBg: 'bg-blue-100',
                  iconColor: 'text-[#00bceb]',
                  badge: 'bg-blue-100 text-blue-700 border-blue-300'
                }
              };

              const config = priorityConfig[item.priority] || priorityConfig.medium;

              return (
                <Card
                  key={item.id}
                  className={`${config.bg} ${config.border} border hover:shadow-md transition-all duration-300 rounded-none`}
                >
                  <CardContent className="p-8">
                    <div className="flex items-start gap-6">
                      {/* Icon */}
                      <div className={`p-4 rounded-none ${config.iconBg} ${config.iconColor} shrink-0`}>
                        <div className="w-8 h-8">
                          {item.icon}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-light text-[#0e274e] mb-2">
                              {item.title}
                            </h3>
                            <p className="text-base text-[#565656] font-light leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                          <Badge
                            className={`${config.badge} border capitalize font-light px-3 py-1 text-sm rounded-none`}
                          >
                            {item.priority}
                          </Badge>
                        </div>

                        {/* Category */}
                        <div className="flex items-center gap-2 pt-2 border-t border-zinc-200/50">
                          <span className="text-xs font-light text-gray-500 uppercase tracking-wider">
                            {item.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Next Steps Info */}
        {actionItems.length > 0 && (
          <Card className="bg-white border border-gray-200 rounded-none shadow-sm">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#00bceb]/10 shrink-0">
                  <Info className="h-6 w-6 text-[#00bceb]" />
                </div>
                <div className="flex-1 space-y-2">
                  <h4 className="text-lg font-light text-[#0e274e]">
                    Next Steps
                  </h4>
                  <p className="text-base text-[#565656] font-light leading-relaxed">
                    Start with the critical items first. You can mark items as complete and upload evidence as you go. Don't worry - you can always come back to finish later.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </OnboardingLayout>
  );
}
