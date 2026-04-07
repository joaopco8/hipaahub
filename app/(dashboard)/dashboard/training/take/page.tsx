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
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { getQuestionsForSection } from './training-questions';

// ── Section content + quiz type ───────────────────────────────────────────────

interface QuizItem {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface TrainingSection {
  id: string;
  label: string;       // "Section A"
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  quiz: QuizItem[];
}

// ── Fail screen data ──────────────────────────────────────────────────────────

interface FailData {
  correctCount: number;
  totalCount: number;
  sectionResults: Array<{ id: string; label: string; title: string; correct: number; total: number }>;
}

export default function TakeTrainingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [hasStarted, setHasStarted]       = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [quizAnswers, setQuizAnswers]     = useState<Record<string, number>>({});
  const [acknowledged, setAcknowledged]   = useState(false);
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [showFailScreen, setShowFailScreen] = useState(false);
  const [failData, setFailData]           = useState<FailData | null>(null);
  const [userEmail, setUserEmail]         = useState('');
  const [userName, setUserName]           = useState('');
  const [userRole, setUserRole]           = useState('');
  const [trainingStartTime, setTrainingStartTime] = useState<Date | null>(null);

  // ── Restore progress from localStorage ───────────────────────────────────

  useEffect(() => {
    const savedAnswers   = localStorage.getItem('hipaa-training-answers');
    const savedSection   = localStorage.getItem('hipaa-training-section');
    const savedAck       = localStorage.getItem('hipaa-training-acknowledged');
    const savedStartTime = localStorage.getItem('hipaa-training-start-time');
    const savedUserName  = localStorage.getItem('hipaa-training-user-name');
    const savedUserRole  = localStorage.getItem('hipaa-training-user-role');
    const savedStarted   = localStorage.getItem('hipaa-training-has-started');

    let hasProgress = false;
    if (savedAnswers)  { setQuizAnswers(JSON.parse(savedAnswers)); hasProgress = true; }
    if (savedSection)  { setCurrentSection(parseInt(savedSection)); hasProgress = true; }
    if (savedAck === 'true') setAcknowledged(true);
    if (savedStartTime)     setTrainingStartTime(new Date(savedStartTime));
    if (savedUserName)      setUserName(savedUserName);
    if (savedUserRole)      setUserRole(savedUserRole);
    if (savedStarted === 'true') {
      setHasStarted(true);
      if (hasProgress) toast.success('Welcome back! Your progress has been restored.');
    }
  }, []);

  useEffect(() => {
    if (Object.keys(quizAnswers).length > 0)
      localStorage.setItem('hipaa-training-answers', JSON.stringify(quizAnswers));
  }, [quizAnswers]);

  useEffect(() => {
    if (hasStarted)
      localStorage.setItem('hipaa-training-section', currentSection.toString());
  }, [currentSection, hasStarted]);

  useEffect(() => {
    if (hasStarted) window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentSection, hasStarted]);

  useEffect(() => {
    localStorage.setItem('hipaa-training-acknowledged', acknowledged.toString());
  }, [acknowledged]);

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

  // ── Training sections ─────────────────────────────────────────────────────

  const trainingSections: TrainingSection[] = [
    {
      id: 'phi',
      label: 'Section A',
      title: 'What is PHI — Protected Health Information',
      icon: <FileText className="h-6 w-6" />,
      content: (
        <div className="space-y-5 text-[#565656] font-light">
          <p className="leading-relaxed">
            <strong className="text-[#0e274e] font-medium">Protected Health Information (PHI)</strong> is
            any information that can identify a patient AND relates to their health condition,
            treatment, or payment for healthcare.
          </p>

          <div>
            <h3 className="text-base font-medium text-[#0e274e] mb-2">The 18 HIPAA identifiers</h3>
            <p className="text-sm mb-2">PHI includes 18 specific identifiers defined by HIPAA:</p>
            <div className="bg-[#f3f5f9] border border-gray-200 p-4 text-sm leading-relaxed">
              Names · Geographic data smaller than a state · Dates (except year) related to an
              individual · Phone numbers · Fax numbers · Email addresses · Social Security numbers ·
              Medical record numbers · Health plan numbers · Account numbers ·
              Certificate/license numbers · Vehicle identifiers · Device identifiers · Web URLs ·
              IP addresses · Biometric identifiers · Full-face photographs · Any other unique
              identifying number or code
            </div>
          </div>

          <div>
            <h3 className="text-base font-medium text-[#0e274e] mb-2">In a therapy practice, PHI includes:</h3>
            <ul className="space-y-1 text-sm">
              {[
                'Patient names combined with appointment times',
                'Diagnoses, treatment notes, session content',
                'Insurance information and billing records',
                'Intake forms and consent documents',
                'Any communication that identifies a patient and relates to their care',
              ].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-[#00bceb] mt-1 flex-shrink-0">·</span>{item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#71bc48]/10 border border-[#71bc48]/30 p-4">
            <h4 className="text-sm font-medium text-[#0e274e] mb-1">What is NOT PHI:</h4>
            <ul className="text-sm space-y-1">
              <li>· Information with all 18 identifiers removed (de-identified data)</li>
              <li>· Employment records</li>
              <li>· Education records covered by FERPA</li>
            </ul>
          </div>
        </div>
      ),
      quiz: getQuestionsForSection('phi').map(q => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      })),
    },
    {
      id: 'secure-access',
      label: 'Section B',
      title: 'How to Access and Handle Data Securely',
      icon: <Lock className="h-6 w-6" />,
      content: (
        <div className="space-y-5 text-[#565656] font-light">
          <p className="leading-relaxed">
            The HIPAA Security Rule requires practices to implement safeguards that protect
            electronic PHI (ePHI). As a staff member, your responsibilities include:
          </p>

          <div>
            <h3 className="text-base font-medium text-[#0e274e] mb-2">Access controls</h3>
            <ul className="text-sm space-y-1.5">
              {[
                'Use your own unique login credentials for all systems — never share passwords with colleagues',
                'Lock your computer screen when stepping away, even briefly (Windows+L or CMD+Control+Q on Mac)',
                'Log out of systems at the end of your shift',
              ].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-[#0175a2] mt-1 flex-shrink-0">·</span>{item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-base font-medium text-[#0e274e] mb-2">Device security</h3>
            <ul className="text-sm space-y-1.5">
              {[
                'Never access patient records on personal devices unless explicitly authorized and properly secured',
                'Do not download patient data to USB drives or personal storage',
                'If you work remotely, use only approved systems and a secure internet connection',
              ].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-[#0175a2] mt-1 flex-shrink-0">·</span>{item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-base font-medium text-[#0e274e] mb-2">Email and communication</h3>
            <ul className="text-sm space-y-1.5">
              {[
                'Do not send PHI via personal email (Gmail, Yahoo, etc.)',
                'If using practice email, do not include detailed clinical information in subject lines',
                'Verify the recipient before sending any message containing PHI',
              ].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-[#0175a2] mt-1 flex-shrink-0">·</span>{item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-red-50 border border-red-200 p-4">
            <h4 className="text-sm font-medium text-[#0e274e] mb-1">Physical security</h4>
            <ul className="text-sm space-y-1">
              <li>· Do not leave patient files visible on your desk when away</li>
              <li>· Dispose of documents with PHI using the shredder — never the regular trash</li>
              <li>· Do not discuss patient information in public areas including elevators and waiting rooms</li>
            </ul>
          </div>
        </div>
      ),
      quiz: getQuestionsForSection('secure-access').map(q => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      })),
    },
    {
      id: 'breach-reporting',
      label: 'Section C',
      title: 'What to Do If You Suspect a Breach',
      icon: <AlertTriangle className="h-6 w-6" />,
      content: (
        <div className="space-y-5 text-[#565656] font-light">
          <p className="leading-relaxed">
            A <strong className="text-[#0e274e] font-medium">security incident</strong> is any event that
            puts PHI at risk, even if you are not sure a breach actually occurred. Examples include:
          </p>

          <ul className="text-sm space-y-1.5">
            {[
              'Sending a message or email to the wrong person',
              'Discovering that someone accessed records they should not have',
              'A lost or stolen device that contains patient data',
              'Ransomware or malware on a practice computer',
              'Finding patient records left in a public area',
              'A former employee whose access was not revoked',
            ].map(item => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-red-500 mt-1 flex-shrink-0">·</span>{item}
              </li>
            ))}
          </ul>

          <div>
            <h3 className="text-base font-medium text-[#0e274e] mb-2">What you must do:</h3>
            <ol className="text-sm space-y-2">
              {[
                'Stop the activity or secure the device immediately',
                'Do NOT try to fix it yourself or cover it up',
                'Report it to your supervisor or the designated Privacy Officer immediately — the same day',
                'Write down everything you remember: what happened, when you noticed it, what data may have been involved',
                'Preserve any evidence (do not delete emails, do not reformat devices)',
              ].map((item, i) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="font-medium text-[#0175a2] flex-shrink-0">{i + 1}.</span>{item}
                </li>
              ))}
            </ol>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-4">
            <h4 className="text-sm font-medium text-[#0e274e] mb-1">Why reporting quickly matters</h4>
            <p className="text-sm">
              HIPAA requires the practice to notify OCR within <strong>72 hours</strong> of discovering
              a breach affecting 500 or more patients. That clock starts the moment anyone at the practice
              becomes aware. If you delay reporting internally, you may make it impossible for the
              practice to meet its legal obligations.
            </p>
            <p className="text-sm mt-2 font-medium text-[#0e274e]">
              You will not get in trouble for reporting a mistake in good faith.
              You may face serious consequences for concealing one.
            </p>
          </div>
        </div>
      ),
      quiz: getQuestionsForSection('breach-reporting').map(q => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      })),
    },
    {
      id: 'penalties',
      label: 'Section D',
      title: 'Penalties and Why This Matters',
      icon: <Shield className="h-6 w-6" />,
      content: (
        <div className="space-y-5 text-[#565656] font-light">
          <p className="leading-relaxed">
            HIPAA violations carry real consequences for both the practice and, in serious cases,
            individual staff members.
          </p>

          <div>
            <h3 className="text-base font-medium text-[#0e274e] mb-2">Civil penalties (paid by the practice)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 border border-gray-200">
                    <th className="text-left p-2 font-medium text-[#0e274e]">Category</th>
                    <th className="text-left p-2 font-medium text-[#0e274e]">Per Violation</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Unknowing violation',              '$100 – $50,000'],
                    ['Reasonable cause',                 '$1,000 – $50,000'],
                    ['Willful neglect, corrected',       '$10,000 – $50,000'],
                    ['Willful neglect, not corrected',   '$50,000 (up to $1.9M/year)'],
                  ].map(([cat, pen]) => (
                    <tr key={cat} className="border border-gray-200">
                      <td className="p-2">{cat}</td>
                      <td className="p-2 text-red-600 font-medium">{pen}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-base font-medium text-[#0e274e] mb-2">Criminal penalties (can affect individuals)</h3>
            <ul className="text-sm space-y-1.5">
              <li className="flex items-start gap-2"><span className="text-red-500 mt-1">·</span>Knowingly obtaining or disclosing PHI: <strong>up to 1 year</strong></li>
              <li className="flex items-start gap-2"><span className="text-red-500 mt-1">·</span>Under false pretenses: <strong>up to 5 years</strong></li>
              <li className="flex items-start gap-2"><span className="text-red-500 mt-1">·</span>With intent to sell or cause harm: <strong>up to 10 years</strong></li>
            </ul>
          </div>

          <div className="bg-[#00bceb]/10 border border-[#00bceb]/20 p-4">
            <h4 className="text-sm font-medium text-[#0e274e] mb-1">What protects everyone</h4>
            <p className="text-sm">
              Documented training is one of the first things OCR requests during an audit.
              Your completion of this training — with this certificate — demonstrates that the
              practice takes compliance seriously and that you were properly informed of your
              obligations under 45&nbsp;CFR&nbsp;164.530(b) and 45&nbsp;CFR&nbsp;164.308(a)(5).
            </p>
          </div>
        </div>
      ),
      quiz: getQuestionsForSection('penalties').map(q => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      })),
    },
  ];

  // ── Derived state ─────────────────────────────────────────────────────────

  const TOTAL_QUESTIONS = trainingSections.reduce((n, s) => n + s.quiz.length, 0); // 14
  const PASS_COUNT      = 11; // 11 of 14 (~80%)

  const progress = ((currentSection + 1) / trainingSections.length) * 100;
  const currentSectionData = trainingSections[currentSection];
  const isLastSection      = currentSection === trainingSections.length - 1;

  const allQuizzesAnswered = currentSectionData.quiz.every(
    (_, idx) => quizAnswers[`${currentSectionData.id}-${idx}`] !== undefined
  );
  const canProceed = allQuizzesAnswered && (!isLastSection || acknowledged);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleQuizAnswer = (sectionId: string, qIdx: number, oIdx: number) => {
    setQuizAnswers(prev => ({ ...prev, [`${sectionId}-${qIdx}`]: oIdx }));
  };

  const handleStartTraining = () => {
    if (!userName.trim()) { toast.error('Please enter your full name'); return; }
    if (!userRole.trim())  { toast.error('Please enter your job role/title'); return; }
    const startTime = new Date();
    setHasStarted(true);
    setTrainingStartTime(startTime);
    localStorage.setItem('hipaa-training-has-started',  'true');
    localStorage.setItem('hipaa-training-start-time',   startTime.toISOString());
    localStorage.setItem('hipaa-training-user-name',    userName);
    localStorage.setItem('hipaa-training-user-role',    userRole);
  };

  const handleNext = () => {
    if (isLastSection) { handleSubmit(); }
    else { setCurrentSection(prev => prev + 1); window.scrollTo({ top: 0, behavior: 'instant' }); }
  };

  const handlePrevious = () => {
    setCurrentSection(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleRetake = () => {
    setShowFailScreen(false);
    setFailData(null);
    setCurrentSection(0);
    setQuizAnswers({});
    setAcknowledged(false);
    localStorage.removeItem('hipaa-training-answers');
    localStorage.removeItem('hipaa-training-section');
    localStorage.removeItem('hipaa-training-acknowledged');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleSubmit = async () => {
    if (!acknowledged) {
      toast.error('Please acknowledge that you understand your responsibilities');
      return;
    }

    // ── Score calculation ────────────────────────────────────────────────────
    let correctCount = 0;
    trainingSections.forEach(section => {
      section.quiz.forEach((q, idx) => {
        if (quizAnswers[`${section.id}-${idx}`] === q.correctAnswer) correctCount++;
      });
    });
    const quizScore = Math.round((correctCount / TOTAL_QUESTIONS) * 100);

    // ── Pass / fail check ────────────────────────────────────────────────────
    if (correctCount < PASS_COUNT) {
      const sectionResults = trainingSections.map(section => ({
        id:      section.id,
        label:   section.label,
        title:   section.title,
        total:   section.quiz.length,
        correct: section.quiz.filter(
          (q, idx) => quizAnswers[`${section.id}-${idx}`] === q.correctAnswer
        ).length,
      }));
      setFailData({ correctCount, totalCount: TOTAL_QUESTIONS, sectionResults });
      setShowFailScreen(true);
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }

    // ── Submit to server ─────────────────────────────────────────────────────
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error('You must be logged in to complete training'); return; }

      const { data: org } = await supabase
        .from('organizations').select('id').eq('user_id', user.id).single();

      let staffMemberId: string | null = null;
      const { data: staffMember } = await supabase
        .from('staff_members').select('id').eq('user_id', user.id).single();

      if (staffMember) {
        staffMemberId = staffMember.id;
      } else {
        const { data: newStaff, error: staffErr } = await supabase
          .from('staff_members')
          .insert({ user_id: user.id, organization_id: org?.id || null, email: userEmail, role: 'staff' })
          .select('id').single();
        if (staffErr) throw staffErr;
        staffMemberId = newStaff.id;
      }

      if (staffMemberId) {
        await (supabase as any)
          .from('training_records' as any)
          .update({ completion_status: 'expired' })
          .eq('staff_member_id', staffMemberId)
          .eq('training_type', 'initial')
          .eq('completion_status', 'completed');
      }

      const trainingDate    = new Date().toISOString();
      const expirationDate  = new Date();
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);
      const durationMinutes = trainingStartTime
        ? Math.round((new Date().getTime() - trainingStartTime.getTime()) / 60000)
        : null;

      // Build evidence payload
      const quizAnswersEvidence: Record<string, any> = {};
      trainingSections.forEach(section => {
        section.quiz.forEach((q, idx) => {
          const key       = `${section.id}-${idx}`;
          const userAnswer = quizAnswers[key];
          quizAnswersEvidence[key] = {
            section_id:     section.id,
            section_label:  section.label,
            section_title:  section.title,
            question:       q.question,
            options:        q.options,
            correct_answer: q.correctAnswer,
            user_answer:    userAnswer,
            is_correct:     userAnswer === q.correctAnswer,
          };
        });
      });

      const certificateId = `HIPAA-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

      const response = await fetch('/api/training/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id:           org?.id || null,
          staff_member_id:           staffMemberId,
          full_name:                 userName,
          email:                     userEmail,
          role_title:                userRole,
          training_type:             'initial',
          training_date:             trainingDate,
          completion_status:         'completed',
          expiration_date:           expirationDate.toISOString(),
          acknowledgement:           true,
          acknowledgement_date:      trainingDate,
          recorded_by:               'System (HIPAA Hub)',
          record_timestamp:          trainingDate,
          training_content_version:  '2.0',
          quiz_score:                quizScore,
          quiz_answers:              quizAnswersEvidence,
          certificate_id:            certificateId,
          training_start_time:       trainingStartTime?.toISOString() || null,
          training_duration_minutes: durationMinutes,
          user_agent:                navigator.userAgent,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();

      if (staffMemberId) {
        await supabase.from('staff_members')
          .update({ training_completed: true, training_completed_at: trainingDate })
          .eq('id', staffMemberId);
      }

      toast.success('Training completed successfully!');

      // Clear localStorage
      ['hipaa-training-answers','hipaa-training-section','hipaa-training-acknowledged',
       'hipaa-training-start-time','hipaa-training-user-name','hipaa-training-user-role',
       'hipaa-training-has-started'].forEach(k => localStorage.removeItem(k));

      router.push(`/dashboard/training/${result.data.id}/evidence`);
    } catch (err: any) {
      console.error('Training submit error:', err);
      toast.error(`Failed to complete training: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Pre-training form ─────────────────────────────────────────────────────

  if (!hasStarted) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center px-4 py-8 bg-[#f3f5f9]">
        <Card className="max-w-2xl w-full border-0 shadow-sm bg-white rounded-none">
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-[#00bceb]/10 rounded-none">
                <Shield className="h-8 w-8 text-[#00bceb]" />
              </div>
              <div>
                <CardTitle className="text-2xl font-light text-[#0e274e]">
                  HIPAA Fundamentals for Healthcare Staff
                </CardTitle>
                <CardDescription className="mt-1 text-[#565656] font-light">
                  Before you begin, please confirm your information
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-light text-[#0e274e]">Full Name *</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name as it should appear on the certificate"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  className="h-11 border-gray-300 focus:border-[#00bceb] rounded-none font-light"
                />
                <p className="text-xs text-[#565656] font-light">This will appear on your training certificate</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobRole" className="text-sm font-light text-[#0e274e]">Job Role / Title *</Label>
                <Input
                  id="jobRole"
                  type="text"
                  placeholder="e.g., Medical Assistant, Receptionist, Therapist"
                  value={userRole}
                  onChange={e => setUserRole(e.target.value)}
                  className="h-11 border-gray-300 focus:border-[#00bceb] rounded-none font-light"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-light text-[#0e274e]">Email Address</Label>
                <Input
                  type="email"
                  value={userEmail}
                  disabled
                  className="h-11 bg-[#f3f5f9] border-gray-300 rounded-none font-light"
                />
              </div>
            </div>

            <div className="bg-[#00bceb]/10 border border-[#00bceb]/20 p-4">
              <div className="flex items-start gap-3">
                <BookOpen className="h-5 w-5 text-[#00bceb] shrink-0 mt-0.5" />
                <div className="text-sm text-[#565656] space-y-1.5 font-light">
                  <p className="font-medium text-[#0e274e]">What to expect:</p>
                  <ul className="space-y-1 text-sm">
                    <li>· 4 sections covering HIPAA fundamentals (A through D)</li>
                    <li>· 3–4 scenario-based questions after each section</li>
                    <li>· Immediate feedback and explanation for every answer</li>
                    <li>· Passing score: 80% — 11 of 14 questions correct</li>
                    <li>· Unlimited retakes if you do not pass</li>
                    <li>· Certificate issued immediately upon passing</li>
                    <li>· Estimated time: 25–30 minutes</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              onClick={handleStartTraining}
              className="w-full h-12 bg-[#00bceb] text-white hover:bg-[#00bceb]/90 rounded-none font-bold"
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

  // ── Fail screen ──────────────────────────────────────────────────────────

  if (showFailScreen && failData) {
    return (
      <div className="flex min-h-screen w-full flex-col gap-6 max-w-3xl mx-auto px-4 py-8 bg-[#f3f5f9]">
        <Card className="border-0 shadow-sm bg-white rounded-none border-t-4 border-t-red-500">
          <CardContent className="p-8 space-y-6">
            {/* Score summary */}
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-50 rounded-none">
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
              <div>
                <h2 className="text-xl font-light text-[#0e274e]">You did not pass this time</h2>
                <p className="text-sm text-gray-500 font-light">Retakes are unlimited — review the explanations and try again.</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-[#f3f5f9] p-4">
                <p className="text-3xl font-light text-red-600">{failData.correctCount}/{failData.totalCount}</p>
                <p className="text-xs text-gray-500 mt-1">Your score</p>
              </div>
              <div className="bg-[#f3f5f9] p-4">
                <p className="text-3xl font-light text-[#0e274e]">{PASS_COUNT}/{failData.totalCount}</p>
                <p className="text-xs text-gray-500 mt-1">Required to pass</p>
              </div>
              <div className="bg-[#f3f5f9] p-4">
                <p className="text-3xl font-light text-gray-600">80%</p>
                <p className="text-xs text-gray-500 mt-1">Passing score</p>
              </div>
            </div>

            {/* Section breakdown */}
            <div>
              <h3 className="text-sm font-medium text-[#0e274e] mb-3">Section breakdown</h3>
              <div className="space-y-2">
                {failData.sectionResults.map(s => {
                  const pct = Math.round((s.correct / s.total) * 100);
                  const ok  = s.correct === s.total;
                  return (
                    <div key={s.id} className="flex items-center gap-3 p-3 border border-gray-100 bg-gray-50">
                      <div className={`flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center ${ok ? 'bg-green-100' : 'bg-red-100'}`}>
                        {ok
                          ? <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                          : <XCircle className="h-3.5 w-3.5 text-red-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#0e274e]">
                          <span className="font-medium">{s.label}:</span> {s.title}
                        </p>
                      </div>
                      <span className={`text-sm font-medium flex-shrink-0 ${ok ? 'text-green-600' : 'text-red-600'}`}>
                        {s.correct}/{s.total}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
              <strong>Tip:</strong> Re-read the content for any section where you missed a question.
              The explanations shown after each answer will tell you exactly what to focus on.
            </div>

            <Button
              onClick={handleRetake}
              className="w-full h-12 bg-[#00bceb] text-white hover:bg-[#00bceb]/90 rounded-none font-bold"
              size="lg"
            >
              <RefreshCw className="mr-2 h-5 w-5" />
              Retake Training
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Main training UI ──────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen w-full flex-col gap-6 max-w-[1600px] mx-auto px-4 py-8 bg-[#f3f5f9]">
      <div className="space-y-1">
        <h1 className="text-3xl font-light text-[#0e274e]">HIPAA Fundamentals for Healthcare Staff</h1>
        <p className="text-[#565656] font-light">
          Training for:{' '}
          <strong className="font-light text-[#0e274e]">{userName}</strong>
          {userRole && ` · ${userRole}`}
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#565656] font-light">
            {currentSectionData.label} of {trainingSections.length} — {currentSectionData.title}
          </span>
          <span className="text-[#565656] font-light">{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Section card */}
      <Card className="border-0 shadow-sm bg-white rounded-none">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00bceb]/10 rounded-none text-[#00bceb]">
              {currentSectionData.icon}
            </div>
            <div>
              <p className="text-xs font-medium text-[#00bceb] mb-0.5">{currentSectionData.label}</p>
              <CardTitle className="text-2xl font-light text-[#0e274e]">
                {currentSectionData.title}
              </CardTitle>
              <CardDescription className="mt-1 text-[#565656] font-light">
                Read the content below, then answer the knowledge-check questions to continue.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 pt-6">
          {/* Section content */}
          <div className="prose max-w-none">
            {currentSectionData.content}
          </div>

          {/* Knowledge check */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-light text-[#0e274e] mb-5 flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              Knowledge Check — {currentSectionData.label}
            </h3>

            <div className="space-y-8">
              {currentSectionData.quiz.map((question, qIdx) => {
                const answerKey     = `${currentSectionData.id}-${qIdx}`;
                const selectedAnswer = quizAnswers[answerKey];
                const showFeedback  = selectedAnswer !== undefined;
                const isCorrect     = selectedAnswer === question.correctAnswer;

                return (
                  <div key={qIdx} className="space-y-3">
                    <p className="font-medium text-[#0e274e]">
                      Q{qIdx + 1}. {question.question}
                    </p>

                    <div className="space-y-2">
                      {question.options.map((option, oIdx) => {
                        const isSelected     = selectedAnswer === oIdx;
                        const isRightAnswer  = oIdx === question.correctAnswer;

                        let borderCls = 'border-gray-200 hover:border-gray-300 cursor-pointer';
                        let bgCls     = '';
                        if (showFeedback) {
                          if (isRightAnswer)               { borderCls = 'border-green-500'; bgCls = 'bg-green-50'; }
                          else if (isSelected && !isRightAnswer) { borderCls = 'border-red-400'; bgCls = 'bg-red-50'; }
                          else                             { borderCls = 'border-gray-200'; bgCls = 'bg-[#f3f5f9]'; }
                        } else if (isSelected) {
                          borderCls = 'border-[#00bceb]'; bgCls = 'bg-[#00bceb]/5';
                        }

                        return (
                          <div
                            key={oIdx}
                            className={`flex items-start gap-3 p-3 rounded-none border-2 transition-all ${borderCls} ${bgCls}`}
                            onClick={() => !showFeedback && handleQuizAnswer(currentSectionData.id, qIdx, oIdx)}
                          >
                            <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              isSelected ? 'border-[#00bceb] bg-[#00bceb]' : 'border-gray-300'
                            }`}>
                              {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                            <span className={`flex-1 font-light ${isSelected ? 'text-[#0e274e]' : 'text-[#565656]'}`}>
                              {option}
                            </span>
                            {showFeedback && isRightAnswer && (
                              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation — shown for ALL answered questions */}
                    {showFeedback && (
                      <div className={`text-sm p-4 border-l-4 ${
                        isCorrect
                          ? 'bg-green-50 border-l-green-500 text-green-900'
                          : 'bg-red-50   border-l-red-500   text-red-900'
                      }`}>
                        <p className="font-medium mb-1.5">
                          {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                          {!isCorrect && (
                            <span className="font-normal ml-1">
                              The correct answer is: <strong>{question.options[question.correctAnswer]}</strong>
                            </span>
                          )}
                        </p>
                        <p className="text-gray-700 font-light">{question.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Final acknowledgement */}
          {isLastSection && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-start gap-3 p-4 bg-[#00bceb]/10 border border-[#00bceb]/20">
                <Checkbox
                  id="acknowledgement"
                  checked={acknowledged}
                  onCheckedChange={c => setAcknowledged(c === true)}
                  className="mt-1"
                />
                <Label
                  htmlFor="acknowledgement"
                  className="text-sm leading-relaxed cursor-pointer font-light text-[#565656]"
                >
                  <strong className="font-medium text-[#0e274e]">
                    I acknowledge that I have completed this HIPAA training and understand my responsibilities.
                  </strong>{' '}
                  I understand that I must protect patient health information, follow all HIPAA policies and
                  procedures, report any suspected breaches immediately, and that violations may result in
                  disciplinary action, including termination and potential legal consequences.
                </Label>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-8">
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
          className="w-full sm:w-auto bg-[#00bceb] text-white hover:bg-[#00bceb]/90 rounded-none font-bold"
        >
          {isSubmitting ? (
            'Submitting…'
          ) : isLastSection ? (
            <><CheckCircle2 className="mr-2 h-4 w-4" />Submit Training</>
          ) : (
            <>Next Section<ArrowRight className="ml-2 h-4 w-4" /></>
          )}
        </Button>
      </div>
    </div>
  );
}
