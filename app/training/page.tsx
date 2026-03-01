'use client';

// Public training page — accessed via token link from invite email
// No authentication required. Accessible at /training?token=xxx

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Shield,
  Lock,
  Mail,
  AlertTriangle,
  FileText,
  Users,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  ClipboardCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getQuestionsForSection } from '@/app/(dashboard)/dashboard/training/take/training-questions';

interface InviteData {
  id: string;
  name: string;
  email: string;
  role_title: string;
  organization_name: string;
}

interface TrainingSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  quiz: { question: string; options: string[]; correctAnswer: number }[];
}

function TrainingContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [pageState, setPageState] = useState<
    'validating' | 'invalid' | 'completed_already' | 'ready' | 'training' | 'done'
  >('validating');
  const [errorMessage, setErrorMessage] = useState('');
  const [inviteData, setInviteData] = useState<InviteData | null>(null);

  const [currentSection, setCurrentSection] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [acknowledged, setAcknowledged] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trainingStartTime, setTrainingStartTime] = useState<Date | null>(null);
  const [completionData, setCompletionData] = useState<{
    certificate_id: string;
    employee_name: string;
    organization_name: string;
    completed_at: string;
  } | null>(null);

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setErrorMessage('No training token found. Please use the link from your invitation email.');
      setPageState('invalid');
      return;
    }

    fetch(`/api/training/validate?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.completed) {
          setPageState('completed_already');
          return;
        }
        if (data.valid && data.invite) {
          setInviteData(data.invite);
          setPageState('ready');
        } else {
          setErrorMessage(data.error || 'Invalid training link.');
          setPageState('invalid');
        }
      })
      .catch(() => {
        setErrorMessage('Unable to validate your training link. Please try again.');
        setPageState('invalid');
      });
  }, [token]);

  const trainingSections: TrainingSection[] = [
    {
      id: 'introduction',
      title: 'Introduction to HIPAA',
      icon: <Shield className="h-6 w-6" />,
      content: (
        <div className="space-y-4 text-[#565656] font-light">
          <div>
            <h3 className="text-lg font-light text-[#0e274e] mb-2">What is HIPAA?</h3>
            <p className="leading-relaxed">
              The Health Insurance Portability and Accountability Act (HIPAA) is a federal law that protects the
              privacy and security of patients' health information. As a healthcare workforce member, you have a
              legal and ethical responsibility to protect this information.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-light text-[#0e274e] mb-2">Why HIPAA Matters</h3>
            <ul className="list-disc list-inside space-y-1 leading-relaxed">
              <li>Protects patient privacy and builds trust</li>
              <li>Prevents identity theft and fraud</li>
              <li>Ensures legal compliance for our organization</li>
              <li>Maintains professional standards in healthcare</li>
            </ul>
          </div>
          <div className="bg-blue-50 border border-blue-200 p-4">
            <p className="text-sm text-[#565656] font-light">
              <strong className="text-[#0e274e] font-medium">Remember:</strong> Violations of HIPAA can result
              in fines up to $1.5 million per year and potential criminal charges.
            </p>
          </div>
        </div>
      ),
      quiz: getQuestionsForSection('introduction').map((q) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
      })),
    },
    {
      id: 'phi',
      title: 'Understanding PHI and ePHI',
      icon: <FileText className="h-6 w-6" />,
      content: (
        <div className="space-y-4 text-[#565656] font-light">
          <div>
            <h3 className="text-lg font-light text-[#0e274e] mb-2">What is PHI?</h3>
            <p className="leading-relaxed mb-3">
              Protected Health Information (PHI) is any information that can identify a patient and relates to
              their health conditions, care provided, or payment for services.
            </p>
            <p className="leading-relaxed">
              <strong className="font-medium text-[#0e274e]">Examples of PHI:</strong> Names, addresses, phone
              numbers, email addresses, Social Security numbers, medical record numbers, and any other unique
              identifying information.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-light text-[#0e274e] mb-2">What is ePHI?</h3>
            <p className="leading-relaxed">
              Electronic Protected Health Information (ePHI) is PHI created, stored, transmitted, or received
              in electronic form — including EHR systems, email, cloud storage, and mobile devices.
            </p>
          </div>
          <div className="bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-[#565656] font-light">
              <strong className="text-[#0e274e] font-medium">Critical Rule:</strong> Never access, use, or
              disclose PHI unless it is necessary to perform your job duties.
            </p>
          </div>
        </div>
      ),
      quiz: getQuestionsForSection('phi').map((q) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
      })),
    },
    {
      id: 'minimum-necessary',
      title: 'Minimum Necessary Rule',
      icon: <Lock className="h-6 w-6" />,
      content: (
        <div className="space-y-4 text-[#565656] font-light">
          <div>
            <h3 className="text-lg font-light text-[#0e274e] mb-2">The Minimum Necessary Standard</h3>
            <p className="leading-relaxed mb-3">
              Access, use, or disclose only the minimum amount of PHI necessary to accomplish your intended
              purpose.
            </p>
            <div className="bg-green-50 border border-green-200 p-4 my-4">
              <h4 className="font-medium text-[#0e274e] mb-2">Good Practices</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-[#565656] font-light">
                <li>Access only the patient records you need for your specific task</li>
                <li>Share only the minimum information required with colleagues</li>
                <li>Close patient records immediately after use</li>
              </ul>
            </div>
            <div className="bg-red-50 border border-red-200 p-4">
              <h4 className="font-medium text-[#0e274e] mb-2">Prohibited Practices</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-[#565656] font-light">
                <li>Browsing patient records out of curiosity</li>
                <li>Accessing records of friends, family, or celebrities</li>
                <li>Leaving patient records open on your screen</li>
              </ul>
            </div>
          </div>
        </div>
      ),
      quiz: getQuestionsForSection('minimum-necessary').map((q) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
      })),
    },
    {
      id: 'access-controls',
      title: 'Access Controls & Passwords',
      icon: <Lock className="h-6 w-6" />,
      content: (
        <div className="space-y-4 text-[#565656] font-light">
          <div>
            <h3 className="text-lg font-light text-[#0e274e] mb-2">Password Security</h3>
            <ul className="list-disc list-inside space-y-1 leading-relaxed">
              <li>Use at least 12 characters with mixed uppercase, lowercase, numbers, and special characters</li>
              <li>Never share your password with anyone, including colleagues</li>
              <li>Change passwords every 90 days</li>
              <li>Do not reuse passwords across different systems</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-light text-[#0e274e] mb-2">Account Security</h3>
            <ul className="list-disc list-inside space-y-1 leading-relaxed">
              <li>Never leave your computer unlocked when unattended</li>
              <li>Log out of all systems when you're done working</li>
              <li>Enable multi-factor authentication (MFA) when available</li>
              <li>Report any suspicious activity immediately</li>
            </ul>
          </div>
          <div className="bg-amber-50 border border-amber-200 p-4">
            <p className="text-sm text-[#565656] font-light">
              <strong className="text-[#0e274e] font-medium">Remember:</strong> If someone uses your account to
              access PHI, you are responsible. Protect your credentials as if they were your own identity.
            </p>
          </div>
        </div>
      ),
      quiz: getQuestionsForSection('access-controls').map((q) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
      })),
    },
    {
      id: 'communication',
      title: 'Email & Communication Security',
      icon: <Mail className="h-6 w-6" />,
      content: (
        <div className="space-y-4 text-[#565656] font-light">
          <div>
            <h3 className="text-lg font-light text-[#0e274e] mb-2">Secure Communication Practices</h3>
            <div className="bg-green-50 border border-green-200 p-4 my-4">
              <h4 className="font-medium text-[#0e274e] mb-2">Secure Practices</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-[#565656] font-light">
                <li>Use encrypted email systems approved by your organization</li>
                <li>Verify recipient email addresses before sending PHI</li>
                <li>Double-check that you're sending to the correct recipient</li>
              </ul>
            </div>
            <div className="bg-red-50 border border-red-200 p-4">
              <h4 className="font-medium text-[#0e274e] mb-2">Prohibited Practices</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-[#565656] font-light">
                <li>Never send PHI via personal email accounts (Gmail, Yahoo, etc.)</li>
                <li>Don't send PHI via unencrypted text messages</li>
                <li>Never post PHI on social media platforms</li>
              </ul>
            </div>
          </div>
        </div>
      ),
      quiz: getQuestionsForSection('communication').map((q) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
      })),
    },
    {
      id: 'incident-reporting',
      title: 'Incident & Breach Reporting',
      icon: <AlertTriangle className="h-6 w-6" />,
      content: (
        <div className="space-y-4 text-[#565656] font-light">
          <div>
            <h3 className="text-lg font-light text-[#0e274e] mb-2">What is a Breach?</h3>
            <p className="leading-relaxed mb-3">
              A breach is any unauthorized access, use, or disclosure of PHI. Examples include: unauthorized
              access to records, loss or theft of devices, sending PHI to the wrong recipient, or ransomware attacks.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-light text-[#0e274e] mb-2">Your Reporting Obligation</h3>
            <p className="leading-relaxed mb-3">
              <strong className="font-medium text-[#0e274e]">You must report any suspected breach immediately.</strong>{' '}
              Report to your supervisor, Security Officer, or Privacy Officer.
            </p>
            <div className="bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-[#565656] font-light">
                Prompt reporting protects you and the organization. Failure to report can result in severe
                consequences including disciplinary action and regulatory fines.
              </p>
            </div>
          </div>
        </div>
      ),
      quiz: getQuestionsForSection('incident-reporting').map((q) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
      })),
    },
    {
      id: 'sanctions',
      title: 'Sanctions for Violations',
      icon: <AlertTriangle className="h-6 w-6" />,
      content: (
        <div className="space-y-4 text-[#565656] font-light">
          <div>
            <h3 className="text-lg font-light text-[#0e274e] mb-2">Organizational Sanctions</h3>
            <p className="leading-relaxed mb-3">
              Our organization has a zero-tolerance policy for HIPAA violations. Violations may result in verbal
              or written warnings, suspension, termination, or legal action.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-light text-[#0e274e] mb-2">Federal Penalties</h3>
            <ul className="list-disc list-inside space-y-1 leading-relaxed">
              <li>
                <strong className="text-[#565656] font-medium">Civil penalties:</strong> $100 to $50,000 per
                violation, up to $1.5 million per year
              </li>
              <li>
                <strong className="text-[#565656] font-medium">Criminal penalties:</strong> Up to $250,000 in
                fines and up to 10 years in prison
              </li>
            </ul>
          </div>
          <div className="bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-[#565656] font-light">
              <strong className="text-[#0e274e] font-medium">Remember:</strong> Ignorance is not a defense. You
              are responsible for knowing and following HIPAA rules.
            </p>
          </div>
        </div>
      ),
      quiz: getQuestionsForSection('sanctions').map((q) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
      })),
    },
    {
      id: 'patient-rights',
      title: 'Privacy Rights of Patients',
      icon: <Users className="h-6 w-6" />,
      content: (
        <div className="space-y-4 text-[#565656] font-light">
          <div>
            <h3 className="text-lg font-light text-[#0e274e] mb-2">Patient Rights Under HIPAA</h3>
            <ul className="list-disc list-inside space-y-1 leading-relaxed">
              <li>
                <strong className="text-[#565656] font-medium">Right to Access:</strong> Patients can request
                copies of their medical records
              </li>
              <li>
                <strong className="text-[#565656] font-medium">Right to Amend:</strong> Patients can request
                corrections to their records
              </li>
              <li>
                <strong className="text-[#565656] font-medium">Right to Request Restrictions:</strong> Patients
                can request limits on how their PHI is used
              </li>
              <li>
                <strong className="text-[#565656] font-medium">Right to File a Complaint:</strong> Patients can
                file complaints about privacy violations
              </li>
            </ul>
          </div>
          <div className="bg-blue-50 border border-blue-200 p-4">
            <p className="text-sm text-[#565656] font-light">
              <strong className="text-[#0e274e] font-medium">Remember:</strong> Patient rights are protected by
              law. Violating these rights can result in severe penalties for both you and the organization.
            </p>
          </div>
        </div>
      ),
      quiz: getQuestionsForSection('patient-rights').map((q) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
      })),
    },
  ];

  const progress = ((currentSection + 1) / (trainingSections.length + 1)) * 100;
  const currentSectionData = trainingSections[currentSection];
  const isLastSection = currentSection === trainingSections.length - 1;
  const allQuizzesAnswered = currentSectionData?.quiz.every(
    (_, idx) => quizAnswers[`${currentSectionData.id}-${idx}`] !== undefined
  );
  const canProceed = allQuizzesAnswered && (!isLastSection || acknowledged);

  const handleQuizAnswer = (sectionId: string, questionIndex: number, answerIndex: number) => {
    setQuizAnswers((prev) => ({ ...prev, [`${sectionId}-${questionIndex}`]: answerIndex }));
  };

  const handleStartTraining = () => {
    setPageState('training');
    setTrainingStartTime(new Date());
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleNext = () => {
    if (isLastSection) {
      handleSubmit();
    } else {
      setCurrentSection((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  const handlePrevious = () => {
    setCurrentSection((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const calculateQuizScore = () => {
    let correct = 0;
    let total = 0;
    trainingSections.forEach((section) => {
      section.quiz.forEach((q, idx) => {
        total++;
        if (quizAnswers[`${section.id}-${idx}`] === q.correctAnswer) correct++;
      });
    });
    return total > 0 ? Math.round((correct / total) * 100) : 0;
  };

  const handleSubmit = async () => {
    if (!acknowledged) {
      toast.error('Please acknowledge that you understand your responsibilities');
      return;
    }
    if (!token) return;

    setIsSubmitting(true);

    const quizAnswersEvidence: Record<string, any> = {};
    trainingSections.forEach((section) => {
      section.quiz.forEach((question, qIdx) => {
        const answerKey = `${section.id}-${qIdx}`;
        const userAnswer = quizAnswers[answerKey];
        quizAnswersEvidence[answerKey] = {
          section_id: section.id,
          section_title: section.title,
          question: question.question,
          options: question.options,
          correct_answer: question.correctAnswer,
          user_answer: userAnswer,
          is_correct: userAnswer === question.correctAnswer,
        };
      });
    });

    const durationMinutes = trainingStartTime
      ? Math.round((new Date().getTime() - trainingStartTime.getTime()) / 60000)
      : null;

    try {
      const response = await fetch('/api/training/employee-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          signature_name: inviteData?.name,
          quiz_answers: quizAnswersEvidence,
          quiz_score: calculateQuizScore(),
          training_start_time: trainingStartTime?.toISOString() || null,
          training_duration_minutes: durationMinutes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete training');
      }

      setCompletionData({
        certificate_id: data.certificate_id,
        employee_name: data.employee_name,
        organization_name: data.organization_name,
        completed_at: data.completed_at,
      });
      setPageState('done');
      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete training. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── States ───────────────────────────────────────────────────────────────

  if (pageState === 'validating') {
    return (
      <div className="min-h-screen bg-[#f3f5f9] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#1ad07a] mx-auto mb-4" />
          <p className="text-[#565656] font-light">Validating your training link…</p>
        </div>
      </div>
    );
  }

  if (pageState === 'invalid') {
    return (
      <div className="min-h-screen bg-[#f3f5f9] flex items-center justify-center px-4">
        <Card className="max-w-md w-full border-0 shadow-sm rounded-none bg-white">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-light text-[#0e274e] mb-2">Invalid Training Link</h2>
            <p className="text-[#565656] font-light text-sm">{errorMessage}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (pageState === 'completed_already') {
    return (
      <div className="min-h-screen bg-[#f3f5f9] flex items-center justify-center px-4">
        <Card className="max-w-md w-full border-0 shadow-sm rounded-none bg-white">
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-[#1ad07a] mx-auto mb-4" />
            <h2 className="text-xl font-light text-[#0e274e] mb-2">Training Already Completed</h2>
            <p className="text-[#565656] font-light text-sm">
              You have already completed HIPAA Awareness Training. Your certificate has been recorded.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (pageState === 'done' && completionData) {
    return (
      <div className="min-h-screen bg-[#f3f5f9] flex items-center justify-center px-4 py-12">
        <Card className="max-w-lg w-full border-0 shadow-sm rounded-none bg-white">
          <CardHeader className="border-b border-gray-100 bg-[#0c0b1d] p-8">
            <div className="text-center">
              <CheckCircle2 className="h-14 w-14 text-[#1ad07a] mx-auto mb-4" />
              <CardTitle className="text-2xl font-light text-white mb-1">Training Complete</CardTitle>
              <CardDescription className="text-gray-400 font-light">
                HIPAA Awareness Training Record
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400 font-light">Employee Name</span>
                <span className="text-[#0e274e] font-medium">{completionData.employee_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-light">Organization</span>
                <span className="text-[#0e274e] font-light">{completionData.organization_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-light">Completed On</span>
                <span className="text-[#0e274e] font-light">
                  {new Date(completionData.completed_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-light">Certificate ID</span>
                <span className="text-[#0e274e] font-mono text-xs">{completionData.certificate_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-light">Valid Until</span>
                <span className="text-[#0e274e] font-light">
                  {new Date(
                    new Date(completionData.completed_at).setFullYear(
                      new Date(completionData.completed_at).getFullYear() + 1
                    )
                  ).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>

            <div className="bg-[#1ad07a]/10 border border-[#1ad07a]/30 p-4">
              <p className="text-sm text-[#565656] font-light text-center">
                Your training record has been saved and will appear in your organization's compliance dashboard.
                You do not need to take any further action.
              </p>
            </div>

            <p className="text-xs text-gray-400 text-center font-light">
              HIPAA Awareness Training Record — Recorded by HIPAAGuard
              <br />
              This is a training awareness record, not a certification by a licensed HIPAA authority.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Pre-training welcome screen ─────────────────────────────────────────

  if (pageState === 'ready') {
    return (
      <div className="min-h-screen bg-[#f3f5f9] flex items-center justify-center px-4 py-12">
        <Card className="max-w-2xl w-full border-0 shadow-sm rounded-none bg-white">
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-[#0c0b1d] rounded-none">
                <Shield className="h-8 w-8 text-[#1ad07a]" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-light uppercase tracking-wider mb-1">
                  {inviteData?.organization_name}
                </p>
                <CardTitle className="text-2xl font-light text-[#0e274e]">
                  HIPAA Awareness Training
                </CardTitle>
                <CardDescription className="mt-1 text-[#565656] font-light">
                  Required for all staff members
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="bg-[#f3f5f9] p-4 space-y-2">
              <p className="text-sm font-light text-[#0e274e]">Training assigned to:</p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-[#0c0b1d] flex items-center justify-center">
                  <span className="text-[#1ad07a] font-light text-sm">
                    {inviteData?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-[#0e274e] text-sm">{inviteData?.name}</p>
                  <p className="text-xs text-gray-400">{inviteData?.role_title}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4">
              <div className="flex items-start gap-3">
                <BookOpen className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-sm text-[#565656] space-y-1.5 font-light">
                  <p className="font-medium text-[#0e274e]">What to expect:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>8 training sections covering HIPAA fundamentals</li>
                    <li>Knowledge check questions after each section</li>
                    <li>Final digital acknowledgement</li>
                    <li>Certificate recorded automatically upon completion</li>
                    <li>Estimated time: 30–45 minutes</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              onClick={handleStartTraining}
              className="w-full h-12 bg-[#1ad07a] text-[#0c0b1d] hover:bg-[#1ad07a]/90 rounded-none font-bold"
              size="lg"
            >
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Begin HIPAA Training
            </Button>

            <p className="text-xs text-gray-400 text-center font-light">
              Your completion will be automatically recorded in your organization's compliance dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Training in progress ────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen w-full flex-col gap-6 max-w-4xl mx-auto px-4 py-8 bg-[#f3f5f9]">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-[#1ad07a]" />
          <span className="text-xs text-gray-400 font-light uppercase tracking-wider">
            {inviteData?.organization_name} · HIPAA Awareness Training
          </span>
        </div>
        <p className="text-sm text-[#565656] font-light">
          Completing for: <strong className="text-[#0e274e] font-medium">{inviteData?.name}</strong> ·{' '}
          {inviteData?.role_title}
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#565656] font-light">
            Section {currentSection + 1} of {trainingSections.length}
          </span>
          <span className="text-[#565656] font-light">{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Section Card */}
      <Card className="border-0 shadow-sm bg-white rounded-none">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0c0b1d]/5 rounded-none text-[#0e274e]">
              {currentSectionData.icon}
            </div>
            <div>
              <CardTitle className="text-2xl font-light text-[#0e274e]">
                {currentSectionData.title}
              </CardTitle>
              <CardDescription className="mt-1 text-[#565656] font-light">
                Read the content below and answer the quiz questions to proceed.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div>{currentSectionData.content}</div>

          {/* Quiz */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-light text-[#0e274e] mb-4 flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              Knowledge Check
            </h3>
            <div className="space-y-6">
              {currentSectionData.quiz.map((question, qIdx) => {
                const answerKey = `${currentSectionData.id}-${qIdx}`;
                const selectedAnswer = quizAnswers[answerKey];
                const showFeedback = selectedAnswer !== undefined;

                return (
                  <div key={qIdx} className="space-y-3">
                    <p className="font-light text-[#0e274e]">
                      {qIdx + 1}. {question.question}
                    </p>
                    <div className="space-y-2">
                      {question.options.map((option, oIdx) => {
                        const isSelected = selectedAnswer === oIdx;
                        const isRightAnswer = oIdx === question.correctAnswer;

                        return (
                          <div
                            key={oIdx}
                            className={`flex items-start gap-3 p-3 border-2 transition-all ${
                              showFeedback
                                ? isRightAnswer
                                  ? 'border-[#1ad07a] bg-[#1ad07a]/10'
                                  : isSelected && !isRightAnswer
                                  ? 'border-red-500 bg-red-50'
                                  : 'border-gray-200 bg-[#f3f5f9]'
                                : isSelected
                                ? 'border-[#0c0b1d] bg-[#0c0b1d]/5'
                                : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                            }`}
                            onClick={() =>
                              !showFeedback && handleQuizAnswer(currentSectionData.id, qIdx, oIdx)
                            }
                          >
                            <div
                              className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                isSelected ? 'border-[#0c0b1d] bg-[#0c0b1d]' : 'border-gray-300'
                              }`}
                            >
                              {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                            <span
                              className={`flex-1 font-light ${
                                isSelected ? 'text-[#0e274e]' : 'text-[#565656]'
                              }`}
                            >
                              {option}
                            </span>
                            {showFeedback && isRightAnswer && (
                              <CheckCircle2 className="h-5 w-5 text-[#1ad07a] shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {showFeedback && selectedAnswer !== question.correctAnswer && (
                      <p className="text-sm text-red-600 font-light">
                        Incorrect. The correct answer is: {question.options[question.correctAnswer]}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Final acknowledgement */}
          {isLastSection && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-start gap-3 p-4 bg-[#1ad07a]/10 border border-[#1ad07a]/30">
                <Checkbox
                  id="acknowledgement"
                  checked={acknowledged}
                  onCheckedChange={(checked) => setAcknowledged(checked === true)}
                  className="mt-1"
                />
                <Label
                  htmlFor="acknowledgement"
                  className="text-sm leading-relaxed cursor-pointer font-light text-[#565656]"
                >
                  <strong className="font-medium text-[#0e274e]">
                    I, {inviteData?.name}, acknowledge that I have completed HIPAA Awareness Training and
                    understand my responsibilities.
                  </strong>{' '}
                  I understand that I must protect patient health information, follow all HIPAA policies, report
                  any suspected breaches immediately, and that violations may result in disciplinary action,
                  including termination and potential legal consequences.
                </Label>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentSection === 0}
          className="w-full sm:w-auto border-gray-300 text-[#565656] hover:bg-gray-50 rounded-none font-light"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={!canProceed || isSubmitting}
          className="w-full sm:w-auto bg-[#1ad07a] text-[#0c0b1d] hover:bg-[#1ad07a]/90 rounded-none font-bold"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : isLastSection ? (
            <>
              Complete Training
              <CheckCircle2 className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              Next Section
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default function TrainingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f3f5f9] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#1ad07a]" />
        </div>
      }
    >
      <TrainingContent />
    </Suspense>
  );
}
