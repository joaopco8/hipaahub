'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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
  UserCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { getQuestionsForSection, type TrainingQuestion } from './training-questions';

interface TrainingSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  quiz: {
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
}

export default function TakeTrainingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [hasStarted, setHasStarted] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [acknowledged, setAcknowledged] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('');
  const [trainingStartTime, setTrainingStartTime] = useState<Date | null>(null);

  useEffect(() => {
    async function getUserInfo() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || '');
        const { data: profile } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', user.id)
          .single();
        setUserName(profile?.full_name || user.email?.split('@')[0] || '');
      }
    }
    getUserInfo();
  }, [supabase]);

  const trainingSections: TrainingSection[] = [
    {
      id: 'introduction',
      title: 'Introduction to HIPAA',
      icon: <Shield className="h-6 w-6" />,
      content: (
        <div className="space-y-4 text-zinc-700">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">What is HIPAA?</h3>
            <p className="leading-relaxed">
              The Health Insurance Portability and Accountability Act (HIPAA) is a federal law that protects 
              the privacy and security of patients' health information. As a healthcare workforce member, you 
              have a legal and ethical responsibility to protect this information.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">Why HIPAA Matters</h3>
            <ul className="list-disc list-inside space-y-1 leading-relaxed">
              <li>Protects patient privacy and builds trust</li>
              <li>Prevents identity theft and fraud</li>
              <li>Ensures legal compliance for our organization</li>
              <li>Maintains professional standards in healthcare</li>
            </ul>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-zinc-700">
              <strong className="text-zinc-900">Remember:</strong> Violations of HIPAA can result in severe penalties, including fines 
              up to $1.5 million per year and potential criminal charges. Your compliance is essential.
            </p>
          </div>
        </div>
      ),
      quiz: getQuestionsForSection('introduction').map(q => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer
      }))
    },
    {
      id: 'phi',
      title: 'Understanding PHI and ePHI',
      icon: <FileText className="h-6 w-6" />,
      content: (
        <div className="space-y-4 text-zinc-700">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">What is PHI?</h3>
            <p className="leading-relaxed mb-3">
              Protected Health Information (PHI) is any information that can identify a patient and relates to:
            </p>
            <ul className="list-disc list-inside space-y-1 leading-relaxed mb-4">
              <li>Past, present, or future physical or mental health conditions</li>
              <li>Healthcare services provided</li>
              <li>Payment for healthcare services</li>
            </ul>
            <p className="leading-relaxed">
              <strong>Examples of PHI include:</strong> Names, addresses, phone numbers, email addresses, 
              Social Security numbers, medical record numbers, health plan beneficiary numbers, account numbers, 
              license numbers, vehicle identifiers, device identifiers, web URLs, IP addresses, biometric identifiers, 
              full-face photos, and any other unique identifying numbers or codes.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">What is ePHI?</h3>
            <p className="leading-relaxed">
              Electronic Protected Health Information (ePHI) is PHI that is created, stored, transmitted, or 
              received in electronic form. This includes information in:
            </p>
            <ul className="list-disc list-inside space-y-1 leading-relaxed mt-2">
              <li>Electronic health records (EHR)</li>
              <li>Email systems</li>
              <li>Cloud storage</li>
              <li>Mobile devices</li>
              <li>Computer systems and networks</li>
            </ul>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-zinc-700">
              <strong className="text-zinc-900">Critical Rule:</strong> Never access, use, or disclose PHI unless it is necessary to perform 
              your job duties. When in doubt, ask your supervisor or the Privacy Officer.
            </p>
          </div>
        </div>
      ),
      quiz: getQuestionsForSection('phi').map(q => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer
      }))
    },
    {
      id: 'minimum-necessary',
      title: 'Minimum Necessary Rule',
      icon: <Lock className="h-6 w-6" />,
      content: (
        <div className="space-y-4 text-zinc-700">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">The Minimum Necessary Standard</h3>
            <p className="leading-relaxed mb-3">
              The Minimum Necessary Rule requires that you access, use, or disclose only the minimum amount of 
              PHI necessary to accomplish your intended purpose. This is one of the most important HIPAA principles.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 my-4">
              <h4 className="font-semibold text-zinc-900 mb-2">✅ Good Practices:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-zinc-700">
                <li>Access only the patient records you need for your specific task</li>
                <li>Share only the minimum information required with colleagues</li>
                <li>Use de-identified data when possible for training or research</li>
                <li>Close patient records immediately after use</li>
              </ul>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-zinc-900 mb-2">❌ Prohibited Practices:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-zinc-700">
                <li>Browsing patient records out of curiosity</li>
                <li>Accessing records of friends, family, or celebrities</li>
                <li>Sharing more information than necessary</li>
                <li>Leaving patient records open on your screen</li>
              </ul>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">Applying Minimum Necessary</h3>
            <p className="leading-relaxed">
              Before accessing PHI, always ask yourself: <strong>"Do I really need this information to do my job?"</strong> 
              If the answer is no, don't access it. If you're unsure, ask your supervisor.
            </p>
          </div>
        </div>
      ),
      quiz: getQuestionsForSection('minimum-necessary').map(q => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer
      }))
    },
    {
      id: 'access-controls',
      title: 'Access Controls & Passwords',
      icon: <Lock className="h-6 w-6" />,
      content: (
        <div className="space-y-4 text-zinc-700">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">Password Security</h3>
            <p className="leading-relaxed mb-3">
              Strong passwords are your first line of defense against unauthorized access to PHI. Follow these 
              requirements:
            </p>
            <ul className="list-disc list-inside space-y-1 leading-relaxed">
              <li>Use at least 12 characters (longer is better)</li>
              <li>Include uppercase and lowercase letters, numbers, and special characters</li>
              <li>Never share your password with anyone, including colleagues</li>
              <li>Change passwords regularly (at least every 90 days)</li>
              <li>Don't reuse passwords across different systems</li>
              <li>Use a password manager to create and store strong passwords</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">Account Security</h3>
            <ul className="list-disc list-inside space-y-1 leading-relaxed">
              <li>Never leave your computer unlocked when unattended</li>
              <li>Log out of all systems when you're done working</li>
              <li>Enable multi-factor authentication (MFA) when available</li>
              <li>Report any suspicious activity immediately</li>
              <li>Don't write down passwords or store them in unsecured locations</li>
            </ul>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-zinc-700">
              <strong className="text-zinc-900">Remember:</strong> If someone uses your account to access PHI, you are responsible. 
              Protect your credentials as if they were your own identity.
            </p>
          </div>
        </div>
      ),
      quiz: getQuestionsForSection('access-controls').map(q => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer
      }))
    },
    {
      id: 'communication',
      title: 'Email & Communication Security',
      icon: <Mail className="h-6 w-6" />,
      content: (
        <div className="space-y-4 text-zinc-700">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">Secure Communication Practices</h3>
            <p className="leading-relaxed mb-3">
              PHI transmitted via email or other communication methods must be protected. Follow these guidelines:
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 my-4">
              <h4 className="font-semibold text-zinc-900 mb-2">✅ Secure Practices:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-zinc-700">
                <li>Use encrypted email systems approved by your organization</li>
                <li>Verify recipient email addresses before sending PHI</li>
                <li>Use secure messaging platforms for internal communication</li>
                <li>Double-check that you're sending to the correct recipient</li>
                <li>Use secure file transfer methods for large files</li>
              </ul>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-zinc-900 mb-2">❌ Prohibited Practices:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-zinc-700">
                <li>Never send PHI via personal email accounts (Gmail, Yahoo, etc.)</li>
                <li>Don't send PHI via unencrypted text messages</li>
                <li>Avoid discussing PHI in public areas or on social media</li>
                <li>Don't forward PHI to unauthorized recipients</li>
                <li>Never post PHI on social media platforms</li>
              </ul>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">Phone and In-Person Communication</h3>
            <ul className="list-disc list-inside space-y-1 leading-relaxed">
              <li>Verify the identity of callers before discussing PHI</li>
              <li>Speak quietly when discussing PHI in person</li>
              <li>Use private areas for sensitive conversations</li>
              <li>Don't leave voicemails with detailed PHI</li>
            </ul>
          </div>
        </div>
      ),
      quiz: getQuestionsForSection('communication').map(q => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer
      }))
    },
    {
      id: 'incident-reporting',
      title: 'Incident & Breach Reporting',
      icon: <AlertTriangle className="h-6 w-6" />,
      content: (
        <div className="space-y-4 text-zinc-700">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">What is a Breach?</h3>
            <p className="leading-relaxed mb-3">
              A breach is the acquisition, access, use, or disclosure of PHI in a manner not permitted by HIPAA, 
              which compromises the security or privacy of the PHI. Examples include:
            </p>
            <ul className="list-disc list-inside space-y-1 leading-relaxed">
              <li>Unauthorized access to patient records</li>
              <li>Loss or theft of devices containing PHI</li>
              <li>Sending PHI to the wrong recipient</li>
              <li>Hacking or malware attacks</li>
              <li>Physical theft of paper records</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">Your Reporting Obligation</h3>
            <p className="leading-relaxed mb-3">
              <strong>You must report any suspected breach immediately.</strong> Time is critical - the sooner 
              we know, the sooner we can contain the damage and comply with legal requirements.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-zinc-900 mb-2">Report Immediately To:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-zinc-700">
                <li>Your immediate supervisor</li>
                <li>Security Officer</li>
                <li>Privacy Officer</li>
                <li>Or use the incident reporting system</li>
              </ul>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">What Information to Report</h3>
            <ul className="list-disc list-inside space-y-1 leading-relaxed">
              <li>What happened (describe the incident)</li>
              <li>When it happened (date and time)</li>
              <li>Who was involved (if known)</li>
              <li>What PHI was involved</li>
              <li>How you discovered it</li>
            </ul>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-zinc-700">
              <strong className="text-zinc-900">Important:</strong> Reporting a potential breach is not an admission of wrongdoing. 
              Prompt reporting protects you and the organization. Failure to report can result in severe consequences.
            </p>
          </div>
        </div>
      ),
      quiz: getQuestionsForSection('incident-reporting').map(q => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer
      }))
    },
    {
      id: 'sanctions',
      title: 'Sanctions for Violations',
      icon: <AlertTriangle className="h-6 w-6" />,
      content: (
        <div className="space-y-4 text-zinc-700">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">Organizational Sanctions</h3>
            <p className="leading-relaxed mb-3">
              Our organization has a zero-tolerance policy for HIPAA violations. Violations may result in:
            </p>
            <ul className="list-disc list-inside space-y-1 leading-relaxed">
              <li>Verbal or written warnings</li>
              <li>Suspension</li>
              <li>Termination of employment</li>
              <li>Legal action</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">Federal Penalties</h3>
            <p className="leading-relaxed mb-3">
              HIPAA violations can result in severe federal penalties:
            </p>
            <ul className="list-disc list-inside space-y-1 leading-relaxed">
              <li><strong className="text-zinc-700">Civil penalties:</strong> $100 to $50,000 per violation, up to $1.5 million per year</li>
              <li><strong className="text-zinc-700">Criminal penalties:</strong> Up to $250,000 in fines and up to 10 years in prison</li>
              <li>Personal liability for individual workforce members</li>
            </ul>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-zinc-700">
              <strong className="text-zinc-900">Remember:</strong> Ignorance is not a defense. You are responsible for knowing and 
              following HIPAA rules. When in doubt, ask questions before acting.
            </p>
          </div>
        </div>
      ),
      quiz: getQuestionsForSection('sanctions').map(q => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer
      }))
    },
    {
      id: 'patient-rights',
      title: 'Privacy Rights of Patients',
      icon: <Users className="h-6 w-6" />,
      content: (
        <div className="space-y-4 text-zinc-700">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">Patient Rights Under HIPAA</h3>
            <p className="leading-relaxed mb-3">
              Patients have specific rights regarding their health information. You must respect and facilitate 
              these rights:
            </p>
            <ul className="list-disc list-inside space-y-1 leading-relaxed">
              <li><strong>Right to Access:</strong> Patients can request copies of their medical records</li>
              <li><strong>Right to Amend:</strong> Patients can request corrections to their records</li>
              <li><strong>Right to an Accounting:</strong> Patients can request a list of disclosures of their PHI</li>
              <li><strong>Right to Request Restrictions:</strong> Patients can request limits on how their PHI is used</li>
              <li><strong>Right to Confidential Communications:</strong> Patients can request alternative communication methods</li>
              <li><strong>Right to File a Complaint:</strong> Patients can file complaints about privacy violations</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">Your Responsibilities</h3>
            <ul className="list-disc list-inside space-y-1 leading-relaxed">
              <li>Treat all patient requests with respect and professionalism</li>
              <li>Direct patient requests to the Privacy Officer when appropriate</li>
              <li>Never deny a patient access to their own records without authorization</li>
              <li>Maintain confidentiality when discussing patient requests</li>
            </ul>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-zinc-700">
              <strong className="text-zinc-900">Remember:</strong> Patient rights are protected by law. Violating these rights can result 
              in severe penalties for both you and the organization.
            </p>
          </div>
        </div>
      ),
      quiz: getQuestionsForSection('patient-rights').map(q => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer
      }))
    }
  ];

  const progress = ((currentSection + 1) / (trainingSections.length + 1)) * 100;
  const currentSectionData = trainingSections[currentSection];
  const isLastSection = currentSection === trainingSections.length - 1;
  const allQuizzesAnswered = currentSectionData.quiz.every((q, idx) => 
    quizAnswers[`${currentSectionData.id}-${idx}`] !== undefined
  );
  const canProceed = allQuizzesAnswered && (!isLastSection || acknowledged);

  const handleQuizAnswer = (sectionId: string, questionIndex: number, answerIndex: number) => {
    setQuizAnswers(prev => ({
      ...prev,
      [`${sectionId}-${questionIndex}`]: answerIndex
    }));
  };

  const handleStartTraining = () => {
    if (!userName.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (!userRole.trim()) {
      toast.error('Please enter your job role/title');
      return;
    }
    setHasStarted(true);
    setTrainingStartTime(new Date());
  };

  const handleNext = () => {
    if (isLastSection) {
      // Submit training
      handleSubmit();
    } else {
      setCurrentSection(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    setCurrentSection(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const calculateQuizScore = () => {
    let correct = 0;
    let total = 0;
    
    trainingSections.forEach(section => {
      section.quiz.forEach((q, idx) => {
        total++;
        const answerKey = `${section.id}-${idx}`;
        if (quizAnswers[answerKey] === q.correctAnswer) {
          correct++;
        }
      });
    });
    
    return total > 0 ? Math.round((correct / total) * 100) : 0;
  };

  const handleSubmit = async () => {
    if (!acknowledged) {
      toast.error('Please acknowledge that you understand your responsibilities');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to complete training');
        return;
      }

      // Get organization_id
      const { data: org } = await supabase
        .from('organizations')
        .select('id')
        .eq('user_id', user.id)
        .single();

      // Get or create staff_member record
      let staffMemberId: string | null = null;
      const { data: staffMember } = await supabase
        .from('staff_members')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (staffMember) {
        staffMemberId = staffMember.id;
      } else {
        // Create staff member record
        const { data: newStaffMember, error: staffError } = await supabase
          .from('staff_members')
          .insert({
            user_id: user.id,
            organization_id: org?.id || null,
            email: userEmail,
            role: 'staff'
          })
          .select('id')
          .single();

        if (staffError) {
          throw staffError;
        }
        staffMemberId = newStaffMember.id;
      }

      // Mark any existing completed training of the same type as expired
      // This allows retaking training while maintaining history
      if (staffMemberId) {
        // NOTE: `training_records` is not currently present in `types/db.ts`.
        // Use an untyped query here to avoid TS build failures while still fetching real data.
        await (supabase as any)
          .from('training_records' as any)
          .update({ completion_status: 'expired' })
          .eq('staff_member_id', staffMemberId)
          .eq('training_type', 'initial')
          .eq('completion_status', 'completed');
      }

      const quizScore = calculateQuizScore();
      const trainingDate = new Date().toISOString();
      const expirationDate = new Date();
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);
      
      // Calculate training duration
      const durationMinutes = trainingStartTime 
        ? Math.round((new Date().getTime() - trainingStartTime.getTime()) / 60000)
        : null;

      // Prepare quiz answers for evidence (all questions with user responses)
      const quizAnswersEvidence: Record<string, any> = {};
      trainingSections.forEach(section => {
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
            is_correct: userAnswer === question.correctAnswer
          };
        });
      });

      // Generate unique certificate ID
      const certificateId = `HIPAA-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

      // Use API route to create training record (bypasses schema cache completely)
      const response = await fetch('/api/training/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organization_id: org?.id || null,
          staff_member_id: staffMemberId,
          full_name: userName,
          email: userEmail,
          role_title: userRole,
          training_type: 'initial',
          training_date: trainingDate,
          completion_status: 'completed',
          expiration_date: expirationDate.toISOString(),
          acknowledgement: true,
          acknowledgement_date: trainingDate,
          recorded_by: 'System (HIPAA Hub)',
          record_timestamp: trainingDate,
          training_content_version: '1.0',
          quiz_score: quizScore,
          quiz_answers: quizAnswersEvidence,
          certificate_id: certificateId,
          training_start_time: trainingStartTime?.toISOString() || null,
          training_duration_minutes: durationMinutes,
          user_agent: navigator.userAgent
        })
      });

      if (!response.ok) {
        let errorMessage = `Failed to create training record: HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      const trainingData = result.data;

      // Update staff_member training status
      if (staffMemberId) {
        await supabase
          .from('staff_members')
          .update({
            training_completed: true,
            training_completed_at: trainingDate
          })
          .eq('id', staffMemberId);
      }

      toast.success('Training completed successfully!');
      // Redirect to evidence page to show certificate
      router.push(`/dashboard/training/${trainingData.id}/evidence`);
    } catch (error: any) {
      console.error('Error submitting training:', error);
      toast.error(`Failed to complete training: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show pre-training form if not started
  if (!hasStarted) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center px-4 py-8">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-[#1ad07a]/10 rounded-lg">
                <Shield className="h-8 w-8 text-[#1ad07a]" />
              </div>
              <div>
                <CardTitle className="text-2xl text-[#0c0b1d]">HIPAA Employee Training</CardTitle>
                <CardDescription className="mt-1">
                  Before you begin, please provide your information
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-semibold text-zinc-700">
                  Full Name *
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name as it should appear on the certificate"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="h-11"
                />
                <p className="text-xs text-zinc-500">
                  This will appear on your training certificate
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobRole" className="text-sm font-semibold text-zinc-700">
                  Job Role / Title *
                </Label>
                <Input
                  id="jobRole"
                  type="text"
                  placeholder="e.g., Medical Assistant, Receptionist, Nurse, etc."
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="h-11"
                />
                <p className="text-xs text-zinc-500">
                  Your position/role within the organization
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-zinc-700">
                  Email Address
                </Label>
                <Input
                  type="email"
                  value={userEmail}
                  disabled
                  className="h-11 bg-zinc-50"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <BookOpen className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-sm text-zinc-700 space-y-2">
                  <p className="font-semibold text-zinc-900">What to expect:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>8 training sections covering HIPAA fundamentals</li>
                    <li>Knowledge check questions after each section</li>
                    <li>Final acknowledgement of responsibilities</li>
                    <li>Certificate issued upon successful completion</li>
                    <li>Estimated time: 30-45 minutes</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleStartTraining}
              className="w-full h-12 bg-[#1ad07a] text-[#0c0b1d] hover:bg-[#1ad07a]/90 font-semibold"
              size="lg"
            >
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Start HIPAA Training
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col gap-6 max-w-[1600px] mx-auto px-4 py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">HIPAA Employee Training</h1>
        <p className="text-zinc-600">
          Training for: <strong>{userName}</strong> ({userRole})
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-600">
            Section {currentSection + 1} of {trainingSections.length}
          </span>
          <span className="text-zinc-600">{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              {currentSectionData.icon}
            </div>
            <div>
              <CardTitle className="text-2xl">{currentSectionData.title}</CardTitle>
              <CardDescription className="mt-1">
                Read the content below and answer the quiz questions to proceed.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose max-w-none">
            {currentSectionData.content}
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              Knowledge Check
            </h3>
            <div className="space-y-6">
              {currentSectionData.quiz.map((question, qIdx) => {
                const answerKey = `${currentSectionData.id}-${qIdx}`;
                const selectedAnswer = quizAnswers[answerKey];
                const isCorrect = selectedAnswer === question.correctAnswer;
                const showFeedback = selectedAnswer !== undefined;

                return (
                  <div key={qIdx} className="space-y-3">
                    <p className="font-medium text-zinc-900">
                      {qIdx + 1}. {question.question}
                    </p>
                    <div className="space-y-2">
                      {question.options.map((option, oIdx) => {
                        const isSelected = selectedAnswer === oIdx;
                        const isRightAnswer = oIdx === question.correctAnswer;

                        return (
                          <div
                            key={oIdx}
                            className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all ${
                              showFeedback
                                ? isRightAnswer
                                  ? 'border-green-500 bg-green-50'
                                  : isSelected && !isRightAnswer
                                  ? 'border-red-500 bg-red-50'
                                  : 'border-zinc-200 bg-zinc-50'
                                : isSelected
                                ? 'border-primary bg-primary/5'
                                : 'border-zinc-200 hover:border-zinc-300 cursor-pointer'
                            }`}
                            onClick={() => !showFeedback && handleQuizAnswer(currentSectionData.id, qIdx, oIdx)}
                          >
                            <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isSelected
                                ? 'border-primary bg-primary'
                                : 'border-zinc-300'
                            }`}>
                              {isSelected && (
                                <div className="w-2 h-2 rounded-full bg-white" />
                              )}
                            </div>
                            <span className={`flex-1 ${isSelected ? 'font-medium' : ''}`}>
                              {option}
                            </span>
                            {showFeedback && isRightAnswer && (
                              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {showFeedback && !isCorrect && (
                      <p className="text-sm text-red-600 font-medium">
                        Incorrect. The correct answer is: {question.options[question.correctAnswer]}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {isLastSection && (
            <div className="border-t pt-6">
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Checkbox
                  id="acknowledgement"
                  checked={acknowledged}
                  onCheckedChange={(checked) => setAcknowledged(checked === true)}
                  className="mt-1"
                />
                <Label
                  htmlFor="acknowledgement"
                  className="text-sm leading-relaxed cursor-pointer"
                >
                  <strong>I acknowledge that I have completed HIPAA training and understand my responsibilities.</strong>{' '}
                  I understand that I must protect patient health information, follow all HIPAA policies and procedures, 
                  report any suspected breaches immediately, and that violations may result in disciplinary action, including 
                  termination and potential legal consequences.
                </Label>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentSection === 0}
          className="w-full sm:w-auto"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={!canProceed || isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? (
            'Submitting...'
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

