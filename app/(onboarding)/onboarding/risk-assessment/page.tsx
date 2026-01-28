'use client';

import { useState, useEffect } from 'react';
import { useOnboarding } from '@/contexts/onboarding-context';
import { useRouter } from 'next/navigation';
import { OnboardingLayout } from '@/components/onboarding/onboarding-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { FormCheckmark } from '@/components/ui/form-checkmark';
import { Shield, Lock, Users, FileText, AlertTriangle } from 'lucide-react';
import { saveRiskAssessment, autoSaveRiskAssessmentAnswers, loadSavedRiskAssessmentAnswers } from '@/app/actions/onboarding';
import { calculateRiskScore } from '@/lib/risk-assessment-scoring';
import { QUESTIONS, type Question } from './questions';
import { createClient } from '@/utils/supabase/client';

const CATEGORY_ICONS = {
  administrative: Users,
  physical: Shield,
  technical: Lock
};

const CATEGORY_COLORS = {
  administrative: 'text-blue-600 bg-blue-50',
  physical: 'text-green-600 bg-green-50',
  technical: 'text-purple-600 bg-purple-50'
};

export default function RiskAssessmentPage() {
  const { setRiskAssessment, setRiskLevel, nextStep, markStepComplete } =
    useOnboarding();
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [riskAssessmentId, setRiskAssessmentId] = useState<string | null>(null);

  const visibleQuestions = QUESTIONS.filter((q) => {
    if (q.skipIf) {
      const skipAnswer = answers[q.skipIf.questionId];
      return skipAnswer !== q.skipIf.answer;
    }
    return true;
  });

  const currentQuestion = visibleQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / visibleQuestions.length) * 100;
  // Calculate estimated time left
  // Average 1.5 min per question
  const avgTimePerQuestion = 1.5;
  const questionsRemaining = visibleQuestions.length - currentQuestionIndex;
  const estimatedMinutes = Math.max(
    1,
    Math.round(questionsRemaining * avgTimePerQuestion)
  );
  
  // Format time nicely: show hours if > 60 minutes
  const formatTimeLeft = (minutes: number): string => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      if (mins === 0) {
        return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
      }
      return `${hours}h ${mins}m`;
    }
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  };
  
  const estimatedTimeLeft = formatTimeLeft(estimatedMinutes);

  // Get current category info
  const CategoryIcon = CATEGORY_ICONS[currentQuestion.category];
  const categoryColor = CATEGORY_COLORS[currentQuestion.category];

  // Load saved answers on mount and restore position
  useEffect(() => {
    const loadSavedAnswers = async () => {
      const saved = await loadSavedRiskAssessmentAnswers();
      if (saved && saved.answers && Object.keys(saved.answers).length > 0) {
        // Filter questions based on saved answers to handle skipIf logic
        const filteredQuestions = QUESTIONS.filter((q) => {
          if (q.skipIf) {
            const skipAnswer = saved.answers[q.skipIf.questionId];
            return skipAnswer !== q.skipIf.answer;
          }
          return true;
        });
        
        // Find first question without answer
        const firstUnansweredIndex = filteredQuestions.findIndex(
          (q) => !saved.answers[q.id]
        );
        
        // Set answers first
        setAnswers(saved.answers);
        setRiskAssessmentId(saved.id);
        
        // Then set the index to first unanswered question
        // If all questions are answered, go to last question
        if (firstUnansweredIndex !== -1) {
          setCurrentQuestionIndex(firstUnansweredIndex);
        } else if (filteredQuestions.length > 0) {
          // All answered, go to last question
          setCurrentQuestionIndex(filteredQuestions.length - 1);
        }
      }
    };

    loadSavedAnswers();
  }, []);

  // Get or create risk assessment ID
  useEffect(() => {
    const getRiskAssessmentId = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Try onboarding_risk_assessments first
      let assessment = null;
      // NOTE: `onboarding_risk_assessments` is not currently present in `types/db.ts`.
      // Use an untyped query here to avoid TS build failures while still fetching real data.
      const { data: onboardingData } = await (supabase as any)
        .from('onboarding_risk_assessments')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (onboardingData) {
        assessment = onboardingData;
      } else {
        // Fallback to risk_assessments
        const { data: regularData } = await supabase
          .from('risk_assessments')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (regularData) {
          assessment = regularData;
        }
      }

      if (assessment) {
        setRiskAssessmentId(assessment.id);
      }
    };

    getRiskAssessmentId();
  }, []);

  const handleAnswer = async (value: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);
    
    // Auto-save to database (non-blocking)
    autoSaveRiskAssessmentAnswers(newAnswers).catch((error) => {
      console.error('Failed to auto-save answer:', error);
    });
    
    // Auto-advance to next question immediately
    if (currentQuestionIndex < visibleQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Last question - complete the assessment
      // Don't await here to avoid blocking, but ensure isSaving is set
      handleComplete(newAnswers).catch((error) => {
        console.error('Error completing assessment:', error);
        setIsSaving(false);
      });
    }
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleComplete = async (finalAnswers: Record<string, string>) => {
    setIsSaving(true);

    try {
      // Calculate risk score using improved weighted scoring model
      const scoringResult = calculateRiskScore(finalAnswers, visibleQuestions);

      // Save to database
      await saveRiskAssessment({
        answers: finalAnswers,
        riskLevel: scoringResult.riskLevel,
        totalRiskScore: scoringResult.totalRiskScore,
        maxPossibleScore: scoringResult.maxPossibleScore,
        riskPercentage: scoringResult.riskPercentage
      });

      // Update context
      setRiskAssessment(finalAnswers);
      setRiskLevel(scoringResult.riskLevel);
      markStepComplete(3);
      nextStep();
      
      // Navigate to results - use replace to avoid back button issues
      router.replace('/onboarding/results');
    } catch (error) {
      console.error('Error saving risk assessment:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to save risk assessment. Please try again.';
      alert(errorMessage);
      setIsSaving(false);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < visibleQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleComplete(answers);
    }
  };

  const isAnswered = !!answers[currentQuestion.id];

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      router.push('/onboarding/risk-assessment-intro');
    }
  };

  return (
    <OnboardingLayout
      onNext={handleNext}
      onBack={handleBack}
      nextButtonLabel={
        currentQuestionIndex === visibleQuestions.length - 1
          ? isSaving ? 'Saving...' : 'Complete Assessment'
          : 'Next Question'
      }
      showNextButton={isAnswered}
      nextButtonDisabled={isSaving}
    >
      <div className="space-y-6 max-w-2xl mx-auto w-full">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extralight text-zinc-900">
            HIPAA Security Risk Assessment
          </h1>
          <p className="text-zinc-600">
            Answer questions about your security practices to identify compliance gaps
          </p>
        </div>

        {/* Category Badge */}
        <div className="flex items-center justify-center">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${categoryColor}`}>
            <CategoryIcon className="h-4 w-4" />
            <span className="text-sm font-extralight">{currentQuestion.categoryLabel}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-600">
              Question {currentQuestionIndex + 1} of {visibleQuestions.length}
            </span>
            <span className="text-zinc-600 font-extralight">{estimatedTimeLeft} remaining</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="card-premium-enter stagger-item">
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extralight text-zinc-900 mb-2">
                  {currentQuestion.text}
                </h2>
                {currentQuestion.helpText && (
                  <p className="text-sm text-zinc-500 mb-6 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    {currentQuestion.helpText}
                  </p>
                )}

                <RadioGroup
                  value={answers[currentQuestion.id] || ''}
                  onValueChange={handleAnswer}
                  className="space-y-3"
                >
                  {currentQuestion.options.map((option) => (
                    <div
                      key={option.value}
                      className="flex items-center space-x-3 p-4 rounded-lg border border-zinc-200 hover:border-[#1ad07a] hover:bg-zinc-50 transition-all cursor-pointer"
                      onClick={() => handleAnswer(option.value)}
                    >
                      <RadioGroupItem
                        value={option.value}
                        id={option.value}
                        className="mt-0.5"
                      />
                      <Label
                        htmlFor={option.value}
                        className="flex-1 cursor-pointer font-normal"
                      >
                        {option.label}
                      </Label>
                      {answers[currentQuestion.id] === option.value && (
                        <FormCheckmark checked={true} className="h-5 w-5" />
                      )}
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </OnboardingLayout>
  );
}
