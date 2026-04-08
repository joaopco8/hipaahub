'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DOMAINS, getQuestionsForDomain } from '@/app/(dashboard)/dashboard/risk-assessment/questions';
import { autoSaveV2Answers, completeV2Assessment, loadV2Assessment } from '@/app/actions/risk-assessment-v2';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ChevronRight, ChevronLeft, CheckCircle2, Clock, Info } from 'lucide-react';
import { toast } from 'sonner';

const DOMAIN_DESCRIPTIONS: Record<number, string> = {
  1: "Where does patient data live in your practice?",
  2: "Who can access patient data, and how is that access managed?",
  3: "Are the devices and physical spaces where PHI exists properly secured?",
  4: "Is data protected when moving between systems?",
  5: "Are all parties handling your patient data covered?",
  6: "Does the practice have the organizational infrastructure to sustain compliance?",
};

export default function RiskAssessmentWizardPage() {
  const router = useRouter();

  const [currentDomain, setCurrentDomain] = useState<number>(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [revealedExplanations, setRevealedExplanations] = useState<Set<string>>(new Set());
  const [naReasons, setNaReasons] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completedBy, setCompletedBy] = useState('');
  const [loadedSaved, setLoadedSaved] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load saved answers on mount
  useEffect(() => {
    async function load() {
      try {
        const saved = await loadV2Assessment();
        if (saved?.answers && Object.keys(saved.answers).length > 0) {
          setAnswers(saved.answers as Record<string, string>);
          // Reveal explanations for already-answered questions
          setRevealedExplanations(new Set(Object.keys(saved.answers)));
        }
        // Don't redirect — allow retakes even if a completed assessment exists
      } catch {
        // No saved assessment — start fresh
      }
      setLoadedSaved(true);
    }
    load();
  }, [router]);

  // Auto-save with 1500ms debounce
  useEffect(() => {
    if (!loadedSaved) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        await autoSaveV2Answers(answers);
      } catch {
        // Silent — auto-save failure should not interrupt the user
      } finally {
        setSaving(false);
      }
    }, 1500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [answers, loadedSaved]);

  // Scroll to top when navigating between domains
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentDomain]);

  const handleAnswer = useCallback((questionId: string, letter: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: letter }));
    setRevealedExplanations(prev => new Set(Array.from(prev).concat(questionId)));
    if (letter !== 'E') {
      setNaReasons(prev => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
    }
  }, []);

  const handleMultiAnswer = useCallback((questionId: string, letter: string, checked: boolean) => {
    setAnswers(prev => {
      const current = prev[questionId]?.split(',').filter(Boolean) || [];
      let updated: string[];
      if (checked) {
        updated = current.includes(letter) ? current : [...current, letter];
      } else {
        updated = current.filter(l => l !== letter);
      }
      const value = updated.join(',');
      return { ...prev, [questionId]: value };
    });
    setRevealedExplanations(prev => new Set(Array.from(prev).concat(questionId)));
  }, []);

  const isDomainComplete = useCallback((domain: number): boolean => {
    const questions = getQuestionsForDomain(domain);
    return questions.every(q => {
      const answer = answers[q.id];
      if (!answer) return false;
      if (q.isMulti) {
        return answer.split(',').filter(Boolean).length > 0;
      }
      return answer !== '';
    });
  }, [answers]);

  const getTotalAnswered = useCallback((): number => {
    return Object.values(answers).filter(v => v && v !== '').length;
  }, [answers]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await completeV2Assessment(answers, completedBy || 'Practice Administrator');
      toast.success('Risk assessment completed successfully.');
      router.push('/dashboard/risk-assessment');
    } catch (err) {
      toast.error('Failed to save the assessment. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-0">
      {/* Sticky progress header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-0 py-4 mb-6">
        {/* Title row */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-2xl font-light text-[#0e274e]">HIPAA Security Risk Assessment</h2>
            <p className="text-xs text-gray-400 font-light">
              Domain {currentDomain} of 6 — {getTotalAnswered()}/68 questions answered
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Clock className="h-3.5 w-3.5" />
            <span>~{Math.max(1, Math.round((68 - getTotalAnswered()) * 0.6))} min remaining</span>
          </div>
        </div>

        {/* Domain stepper */}
        <div className="flex gap-1 mb-3">
          {DOMAINS.map(d => (
            <button
              key={d.id}
              onClick={() => setCurrentDomain(d.id)}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                d.id < currentDomain
                  ? 'bg-[#71bc48]'
                  : d.id === currentDomain
                  ? 'bg-[#00bceb]'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Domain label */}
        <div className="flex items-center gap-2">
          {DOMAINS.filter(d => d.id === currentDomain).map(d => (
            <span key={d.id} className="text-sm font-normal text-[#0e274e]">
              {d.label}
            </span>
          ))}
          <span className="text-xs text-gray-400">— {DOMAIN_DESCRIPTIONS[currentDomain]}</span>
        </div>
      </div>

      {/* Questions for current domain */}
      <div className="space-y-6">
        {getQuestionsForDomain(currentDomain).map((question, qIndex) => {
          const answered = !!answers[question.id] && answers[question.id] !== '';
          const showExplanation = revealedExplanations.has(question.id);
          const prevQuestion = getQuestionsForDomain(currentDomain)[qIndex - 1];
          const prevAnswered = qIndex === 0 || (prevQuestion && !!answers[prevQuestion.id] && answers[prevQuestion.id] !== '');

          return (
            <Card
              key={question.id}
              className={`border-0 shadow-sm rounded-none transition-all bg-white ${
                !answered && qIndex > 0 && !prevAnswered ? 'opacity-60' : ''
              }`}
            >
              <CardContent className="p-6">
                {/* Question header */}
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0 mt-0.5 ${
                      answered ? 'bg-[#71bc48] text-white' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {answered ? '✓' : qIndex + 1}
                  </div>
                  <p className="text-sm font-normal text-[#0e274e] leading-relaxed">{question.text}</p>
                </div>

                {/* Answer options */}
                <div className="ml-9 space-y-2">
                  {question.isMulti ? (
                    // Checkboxes for multi-select question
                    <>
                      {question.options.map(option => {
                        const selectedLetters = answers[question.id]?.split(',').filter(Boolean) || [];
                        const isChecked = selectedLetters.includes(option.letter);
                        return (
                          <label
                            key={option.letter}
                            className={`flex items-start gap-3 p-3 cursor-pointer transition-colors ${
                              isChecked
                                ? 'bg-[#00bceb]/5 border border-[#00bceb]/30'
                                : 'bg-gray-50 border border-transparent hover:border-gray-200'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={e => handleMultiAnswer(question.id, option.letter, e.target.checked)}
                              className="mt-0.5 h-4 w-4 accent-[#00bceb]"
                            />
                            <div>
                              <span className="text-xs font-medium text-[#0e274e] mr-2">{option.letter}.</span>
                              <span className="text-sm text-[#565656]">{option.text}</span>
                            </div>
                          </label>
                        );
                      })}

                      {/* "See why this matters" trigger for multi-select */}
                      {(answers[question.id]?.split(',').filter(Boolean).length || 0) > 0 && !showExplanation && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs text-[#00bceb] rounded-none"
                          onClick={() =>
                            setRevealedExplanations(prev => new Set(Array.from(prev).concat(question.id)))
                          }
                        >
                          See why this matters →
                        </Button>
                      )}
                    </>
                  ) : (
                    // Radio buttons for single-select questions
                    question.options.map(option => {
                      const isSelected = answers[question.id] === option.letter;
                      return (
                        <label
                          key={option.letter}
                          className={`flex items-start gap-3 p-3 cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-[#00bceb]/5 border border-[#00bceb]/30'
                              : 'bg-gray-50 border border-transparent hover:border-gray-200'
                          }`}
                        >
                          <input
                            type="radio"
                            name={question.id}
                            value={option.letter}
                            checked={isSelected}
                            onChange={() => handleAnswer(question.id, option.letter)}
                            className="mt-0.5 h-4 w-4 accent-[#00bceb]"
                          />
                          <div className="flex-1">
                            <span className="text-xs font-medium text-[#0e274e] mr-2">{option.letter}.</span>
                            <span className="text-sm text-[#565656]">{option.text}</span>
                            {option.isNA && isSelected && (
                              <div className="mt-2">
                                <Textarea
                                  placeholder="Briefly explain why this does not apply to your practice..."
                                  value={naReasons[question.id] || ''}
                                  onChange={e =>
                                    setNaReasons(prev => ({ ...prev, [question.id]: e.target.value }))
                                  }
                                  className="text-xs rounded-none border-gray-200 resize-none"
                                  rows={2}
                                />
                              </div>
                            )}
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>

                {/* Explanation shown after answering */}
                {showExplanation && (
                  <div className="ml-9 mt-4 p-3 bg-[#f3f5f9] border-l-2 border-l-[#00bceb]">
                    <div className="flex items-start gap-2">
                      <Info className="h-3.5 w-3.5 text-[#00bceb] shrink-0 mt-0.5" />
                      <p className="text-xs text-[#565656] font-light leading-relaxed">
                        {question.explanation}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Last domain: completed by field */}
      {currentDomain === 6 && (
        <Card className="border-0 shadow-sm rounded-none mt-6">
          <CardContent className="p-6">
            <p className="text-sm font-normal text-[#0e274e] mb-3">Assessment completed by</p>
            <input
              type="text"
              placeholder="Your name and title (e.g., Jane Smith, Privacy Officer)"
              value={completedBy}
              onChange={e => setCompletedBy(e.target.value)}
              className="w-full border border-gray-200 rounded-none px-3 py-2 text-sm text-[#565656] outline-none focus:border-[#00bceb]"
            />
            <p className="text-xs text-gray-400 mt-2 font-light">
              This name will appear on the PDF export and certification statement.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pb-8">
        <Button
          variant="outline"
          onClick={() => setCurrentDomain(d => Math.max(1, d - 1))}
          disabled={currentDomain === 1}
          className="rounded-none border-gray-200 text-[#565656]"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous Domain
        </Button>

        <div className="text-xs text-gray-400">
          {isDomainComplete(currentDomain) ? (
            <span className="text-[#71bc48] flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Domain complete
            </span>
          ) : (
            `${getQuestionsForDomain(currentDomain).filter(q => answers[q.id]).length}/${getQuestionsForDomain(currentDomain).length} answered`
          )}
        </div>

        {currentDomain < 6 ? (
          <Button
            onClick={() => setCurrentDomain(d => Math.min(6, d + 1))}
            className="rounded-none bg-[#00bceb] text-white hover:bg-[#00bceb]/90"
          >
            Next Domain
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submitting || getTotalAnswered() < 60}
            className="rounded-none bg-[#0e274e] text-white hover:bg-[#0e274e]/90"
          >
            {submitting ? 'Saving...' : 'Complete Assessment'}
            <CheckCircle2 className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
