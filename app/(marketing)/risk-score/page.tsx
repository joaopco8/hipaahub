/* eslint-disable react/no-unescaped-entities */
"use client";

import { useMemo, useState } from "react";

type RiskLevel = "low" | "moderate" | "high";

type Option = {
  text: string;
  sub: string;
  points: number;
  risk: "low" | "med" | "high";
};

type Question = {
  id: number;
  category: string;
  text: string;
  options: Option[];
};

type CategoryScore = {
  total: number;
  max: number;
};

const QUESTIONS: Question[] = [
  {
    id: 1,
    category: "Documentation",
    text: "Does your practice have written, signed HIPAA policies on file?",
    options: [
      {
        text: "Yes, all 9 required policies, up to date",
        sub: "Privacy, Security, Breach Notification, etc.",
        points: 0,
        risk: "low",
      },
      {
        text: "Some, we have a few but not all",
        sub: "Partial documentation in place",
        points: 8,
        risk: "med",
      },
      {
        text: "No, we rely on verbal agreements or informal processes",
        sub: "",
        points: 18,
        risk: "high",
      },
      {
        text: "I'm not sure what's required",
        sub: "Haven't reviewed HIPAA policy requirements",
        points: 20,
        risk: "high",
      },
    ],
  },
  {
    id: 2,
    category: "Risk Management",
    text: "When did your practice last complete a formal HIPAA Risk Assessment?",
    options: [
      {
        text: "Within the last 12 months",
        sub: "Documented and on file",
        points: 0,
        risk: "low",
      },
      {
        text: "1–3 years ago",
        sub: "May be outdated",
        points: 8,
        risk: "med",
      },
      {
        text: "More than 3 years ago",
        sub: "Significantly outdated",
        points: 15,
        risk: "high",
      },
      {
        text: "Never, we've never done one",
        sub: "Risk Assessment is federally required",
        points: 20,
        risk: "high",
      },
    ],
  },
  {
    id: 3,
    category: "Staff Training",
    text: "How does your practice handle HIPAA training for employees?",
    options: [
      {
        text: "Annual training with completion certificates on file",
        sub: "Documented compliance",
        points: 0,
        risk: "low",
      },
      {
        text: "Informal training, we talked through it once",
        sub: "No documentation",
        points: 10,
        risk: "med",
      },
      {
        text: "New hires only, no annual refreshers",
        sub: "Gaps in ongoing compliance",
        points: 14,
        risk: "med",
      },
      {
        text: "We haven't done formal HIPAA training",
        sub: "Significant compliance gap",
        points: 20,
        risk: "high",
      },
    ],
  },
  {
    id: 4,
    category: "Business Associates",
    text: "Do you have signed Business Associate Agreements (BAAs) with your vendors?",
    options: [
      {
        text: "Yes, all vendors have signed BAAs on file",
        sub: "EHR, billing, cloud storage, etc.",
        points: 0,
        risk: "low",
      },
      {
        text: "Some, but not all vendors have signed one",
        sub: "Partial coverage",
        points: 10,
        risk: "med",
      },
      {
        text: "I'm not sure, we haven't tracked this",
        sub: "Likely non-compliant",
        points: 16,
        risk: "high",
      },
      {
        text: "No, we haven't requested BAAs from vendors",
        sub: "Every vendor handling PHI needs a BAA",
        points: 20,
        risk: "high",
      },
    ],
  },
  {
    id: 5,
    category: "Data Security",
    text: "How do you store and transmit patient records (PHI)?",
    options: [
      {
        text: "Encrypted EHR system with access controls",
        sub: "HIPAA-compliant platform",
        points: 0,
        risk: "low",
      },
      {
        text: "Encrypted EHR but also email or paper",
        sub: "Mixed systems",
        points: 8,
        risk: "med",
      },
      {
        text: "Mostly paper records or unencrypted files",
        sub: "High exposure risk",
        points: 16,
        risk: "high",
      },
      {
        text: "Email or Google Drive without encryption",
        sub: "Direct HIPAA violation",
        points: 20,
        risk: "high",
      },
    ],
  },
  {
    id: 6,
    category: "Breach Response",
    text: "If a patient's records were exposed today, does your practice have a response plan?",
    options: [
      {
        text: "Yes, written plan with notification templates and timelines",
        sub: "72-hour OCR notification requirement covered",
        points: 0,
        risk: "low",
      },
      {
        text: "Partially, we know what to do but nothing is written down",
        sub: "Undocumented plan",
        points: 8,
        risk: "med",
      },
      {
        text: "No formal plan, we'd figure it out as we go",
        sub: "High risk during an incident",
        points: 16,
        risk: "high",
      },
      {
        text: "I'm not aware we need one",
        sub: "Breach response plan is federally required",
        points: 20,
        risk: "high",
      },
    ],
  },
  {
    id: 7,
    category: "Access Controls",
    text: "How do you manage who can access patient records in your practice?",
    options: [
      {
        text: "Role-based access, each person only sees what they need",
        sub: "Minimum necessary standard",
        points: 0,
        risk: "low",
      },
      {
        text: "Shared login for multiple staff members",
        sub: "Non-compliant, violates audit requirements",
        points: 14,
        risk: "high",
      },
      {
        text: "Everyone has full access to all records",
        sub: "No access controls in place",
        points: 18,
        risk: "high",
      },
      {
        text: "We haven't set up formal access controls",
        sub: "Required under HIPAA Security Rule",
        points: 16,
        risk: "high",
      },
    ],
  },
  {
    id: 8,
    category: "Telehealth & Technology",
    text: "Does your practice use telehealth or communicate with patients digitally?",
    options: [
      {
        text: "Yes, only HIPAA-compliant platforms with BAAs",
        sub: "Zoom for Healthcare, SimplePractice, etc.",
        points: 0,
        risk: "low",
      },
      {
        text: "Yes, mix of compliant and non-compliant tools",
        sub: "Some exposure",
        points: 10,
        risk: "med",
      },
      {
        text: "Yes, consumer platforms like FaceTime or regular email",
        sub: "Direct compliance violation",
        points: 18,
        risk: "high",
      },
      {
        text: "No telehealth, in-person only",
        sub: "",
        points: 2,
        risk: "low",
      },
    ],
  },
  {
    id: 9,
    category: "Incident History",
    text: "Has your practice ever experienced a potential HIPAA incident or patient complaint?",
    options: [
      {
        text: "No, no incidents or complaints to date",
        sub: "",
        points: 0,
        risk: "low",
      },
      {
        text: "One minor incident, documented and resolved",
        sub: "Properly handled",
        points: 4,
        risk: "low",
      },
      {
        text: "One or more incidents, not formally documented",
        sub: "Undocumented incidents increase audit risk",
        points: 14,
        risk: "high",
      },
      {
        text: "A patient complaint was filed with OCR",
        sub: "Active investigation risk",
        points: 20,
        risk: "high",
      },
    ],
  },
  {
    id: 10,
    category: "Audit Readiness",
    text: "If OCR requested your compliance documentation today, how long would it take to compile?",
    options: [
      {
        text: "A few hours, everything is organized and accessible",
        sub: "Audit ready",
        points: 0,
        risk: "low",
      },
      {
        text: "A few days, it's spread across multiple systems",
        sub: "Manageable but risky",
        points: 8,
        risk: "med",
      },
      {
        text: "Several weeks, I'd need to gather it from everywhere",
        sub: "High retrieval risk",
        points: 16,
        risk: "high",
      },
      {
        text: "I honestly don't know where to start",
        sub: "Significant compliance gap",
        points: 20,
        risk: "high",
      },
    ],
  },
];

function getRiskTier(pct: number): RiskLevel {
  if (pct <= 20) return "low";
  if (pct <= 45) return "moderate";
  return "high";
}

export default function RiskScorePage() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Array<number | undefined>>(
    () => new Array(QUESTIONS.length)
  );
  const [stage, setStage] = useState<"quiz" | "email" | "results">("quiz");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const [categoryScores, totalScore] = useMemo(() => {
    const scores: Record<string, CategoryScore> = {};
    let total = 0;
    answers.forEach((ansIdx, index) => {
      if (typeof ansIdx !== "number") return;
      const q = QUESTIONS[index];
      const opt = q.options[ansIdx];
      total += opt.points;
      if (!scores[q.category]) scores[q.category] = { total: 0, max: 20 };
      scores[q.category].total += opt.points;
    });
    QUESTIONS.forEach((q) => {
      if (!scores[q.category]) scores[q.category] = { total: 0, max: 20 };
    });
    return [scores, total] as [Record<string, CategoryScore>, number];
  }, [answers]);

  const riskPct = useMemo(
    () => Math.round((totalScore / 200) * 100),
    [totalScore]
  );
  const riskTier = useMemo(() => getRiskTier(riskPct), [riskPct]);

  const currentQuestion = QUESTIONS[currentQ];
  const selectedIdx = answers[currentQ];

  const progressPct = useMemo(
    () => Math.round(((currentQ + 1) / QUESTIONS.length) * 100),
    [currentQ]
  );

  const tierCopy = useMemo(() => {
    const displayName = name || "Your practice";
    if (riskTier === "low") {
      return {
        title: `${displayName}, you're in good shape, but gaps remain`,
        subtitle:
          "Your practice has solid fundamentals. A few areas still need attention to maintain full compliance.",
      };
    }
    if (riskTier === "moderate") {
      return {
        title: `${displayName}, your practice has real exposure`,
        subtitle:
          "You have some processes in place, but critical gaps could result in significant fines if OCR comes knocking.",
      };
    }
    return {
      title: `${displayName}, your practice is significantly exposed`,
      subtitle:
        "Multiple critical gaps identified. OCR fines for your risk profile range from $50,000–$250,000.",
    };
  }, [riskTier, riskPct, name]);

  function handleSelect(idx: number) {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentQ] = idx;
      return next;
    });
  }

  function handleNext() {
    if (typeof answers[currentQ] !== "number") return;
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ((q) => q + 1);
    } else {
      setStage("email");
    }
  }

  function handleBack() {
    if (currentQ > 0) setCurrentQ((q) => q - 1);
  }

  function handleSubmitEmail(e: React.FormEvent) {
    e.preventDefault();
    setEmailError("");
    if (!name.trim() || !email.includes("@")) {
      setEmailError("Enter a valid name and email to view your score.");
      return;
    }
    setStage("results");
  }

  const breakdownEntries = Object.entries(categoryScores);

  return (
    <div className="min-h-screen bg-cisco-navy text-white flex flex-col">
      {/* Top ticker */}
      <div className="bg-red-900 px-4 py-2 text-[11px] text-red-100">
        <div className="mx-auto max-w-5xl text-center tracking-[0.03em]">
          Federal regulators opened hundreds of HIPAA investigations in 2024, small
          practices are a primary target segment.
        </div>
      </div>

      {/* Hero aligned with landing */}
      <header className="relative w-full overflow-hidden bg-cisco-navy px-4 pb-10 pt-10 md:pb-16 md:pt-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -right-24 h-72 w-72 rounded-full bg-cisco-blue/10 blur-[110px]" />
          <div className="absolute -bottom-40 -left-28 h-72 w-72 rounded-full bg-purple-900/20 blur-[110px]" />
        </div>
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:px-8">
          <div className="relative flex-1">
            <div className="mb-4">
              <span className="inline-flex items-center rounded-none border border-cisco-blue px-3 py-1 text-[11px] font-thin uppercase tracking-[0.18em] text-cisco-blue">
                Free assessment · three minutes · instant results
              </span>
            </div>
            <h1 className="mb-4 text-3xl font-thin leading-tight text-white md:text-4xl lg:text-5xl">
              What is your practice&apos;s real HIPAA risk?
            </h1>
            <p className="mb-5 max-w-xl text-sm font-thin text-gray-300 md:text-base">
              Ten focused questions. Instant score. See exactly where you are exposed,
              before auditors and insurers do.
            </p>
            <div className="flex flex-wrap gap-2 text-[11px] font-thin text-gray-100">
              <span className="rounded-none border border-white/20 bg-white/5 px-3 py-1">
                $50,000 average fine per violation
              </span>
              <span className="rounded-none border border-white/20 bg-white/5 px-3 py-1">
                40% increase in audits in 2024
              </span>
              <span className="rounded-none border border-white/20 bg-white/5 px-3 py-1">
                Three minutes to get your score
              </span>
            </div>
          </div>

          <aside className="relative flex-1 rounded-2xl border border-white/10 bg-slate-950/80 px-5 py-5 shadow-2xl shadow-black/50 backdrop-blur">
            <div className="mb-3 text-[11px] font-thin uppercase tracking-[0.16em] text-cisco-blue">
              HIPAA Hub · Risk Score Tool
            </div>
            <p className="mb-3 text-[13px] font-thin text-gray-100">
              Built specifically for private practices, therapists, dentists, and
              independent clinics that cannot afford a full‑time compliance officer.
            </p>
            <p className="text-[12px] font-thin text-gray-300">
              No patient information is collected. Your answers remain in this browser
              session only; you can optionally receive a score summary by email.
            </p>
          </aside>
        </div>
      </header>

      {/* Trust bar */}
      <section className="border-y border-slate-800 bg-cisco-navy px-4 py-2.5 text-[11px] text-slate-100">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-3">
          <div className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-cisco-blue" />
            <span>No patient health information stored</span>
          </div>
          <div className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-cisco-blue" />
            <span>Designed by HIPAA compliance specialists</span>
          </div>
          <div className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-cisco-blue" />
            <span>Instant score and structured breakdown</span>
          </div>
          <div className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-cisco-blue" />
            <span>Optimized for independent and small practices</span>
          </div>
        </div>
      </section>

      {/* Main content */}
      <main className="flex-1 bg-cisco-navy px-4 py-6 pb-8 text-white md:py-8">
        <div className="mx-auto max-w-[700px] space-y-5">
          {/* QUIZ */}
          {stage === "quiz" && (
            <section id="quiz-section" className="rounded-2xl border border-slate-700/80 bg-slate-950/80 px-4 py-5 shadow-2xl shadow-black/40 backdrop-blur md:px-6 md:py-6">
              <div className="mb-3">
                <div className="mb-1 flex items-baseline justify-between text-[11px] text-slate-300">
                  <span>
                    Question{" "}
                    <span className="font-semibold text-slate-50">
                      {currentQ + 1}
                    </span>{" "}
                    of {QUESTIONS.length}
                  </span>
                  <span>{progressPct}% complete</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full border border-slate-800 bg-slate-950">
                  <div
                    className="h-full rounded-full bg-cisco-blue transition-[width] duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              <div className="mt-2 mb-4 flex items-center gap-1.5">
                {QUESTIONS.map((_, idx) => (
                  <span
                    key={idx}
                    className={[
                      "h-2.5 w-2.5 rounded-full border border-slate-600",
                      idx < currentQ && typeof answers[idx] === "number"
                        ? "bg-cisco-blue border-cisco-blue"
                        : "",
                      idx === currentQ ? "border-cisco-blue" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  />
                ))}
              </div>

              <div className="rounded-2xl border border-slate-700/80 bg-slate-950 px-4 py-4 shadow-xl shadow-black/50 md:px-5 md:py-5">
                <div className="mb-2 flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.16em] text-slate-300">
                  <span className="rounded-full border border-cisco-blue/80 bg-cisco-blue/10 px-2 py-0.5 text-[10px] text-cisco-blue">
                    {currentQuestion.category}
                  </span>
                  <span className="text-slate-400">
                    Question {currentQ + 1} of {QUESTIONS.length}
                  </span>
                </div>
                <h2 className="mb-3 text-[19px] leading-snug text-slate-50 md:text-[21px] font-thin">
                  {currentQuestion.text}
                </h2>
                <div className="flex flex-col gap-2.5">
                  {currentQuestion.options.map((opt, idx) => {
                    const isSelected = selectedIdx === idx;
                    const riskClass =
                      opt.risk === "high"
                        ? "bg-red-100 text-red-700"
                        : opt.risk === "med"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700";
                    const riskText =
                      opt.risk === "high"
                        ? "High risk"
                        : opt.risk === "med"
                        ? "Medium"
                        : "Protected";
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelect(idx)}
                        className={[
                          "grid w-full grid-cols-[auto,minmax(0,1fr),auto] items-center gap-2 rounded-xl border px-3.5 py-2.5 text-left text-sm transition-all",
                          "bg-slate-950/80 border-slate-700 hover:border-slate-500 hover:bg-slate-900/80",
                          isSelected
                            ? "border-cisco-blue bg-slate-950 shadow-[0_0_0_1px_rgba(0,188,235,0.6)]"
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        <span
                          className={[
                            "mr-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-slate-500",
                            isSelected ? "border-cisco-blue bg-cisco-blue" : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-950" />
                        </span>
                        <span className="flex flex-col gap-0.5 pr-1">
                          <span className="text-[13px] text-slate-50">
                            {opt.text}
                          </span>
                          {opt.sub && (
                            <span className="text-[11px] text-slate-400">
                              {opt.sub}
                            </span>
                          )}
                        </span>
                        <span
                          className={[
                            "ml-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                            riskClass,
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          {riskText}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentQ === 0}
                  className="inline-flex items-center justify-center rounded-none border border-slate-600 bg-slate-950 px-4 py-2 text-xs font-light text-slate-200 shadow-sm shadow-black/30 transition hover:bg-slate-900 disabled:opacity-40"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={typeof selectedIdx !== "number"}
                  className="inline-flex items-center justify-center rounded-none bg-cisco-blue px-5 py-2.5 text-xs font-medium text-white shadow-lg shadow-cisco-blue/30 transition hover:bg-white hover:text-cisco-navy disabled:cursor-default disabled:opacity-40"
                >
                  Continue →
                </button>
              </div>
            </section>
          )}

          {/* EMAIL GATE */}
          {stage === "email" && (
            <section
              id="email-section"
              className="mx-auto max-w-md rounded-2xl border border-slate-700/80 bg-slate-950/80 px-5 py-6 shadow-2xl shadow-black/50 backdrop-blur"
            >
              <h2 className="mb-1 text-[22px] font-thin text-slate-50">
                Your score is ready
              </h2>
              <p className="mb-4 text-[13px] text-slate-200">
                We&apos;ve calculated your HIPAA risk score and identified your top
                vulnerabilities. Enter your details to see your results and receive your
                free PDF-ready report.
              </p>
              <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-dashed border-slate-600 bg-slate-950 px-3.5 py-2.5">
                <div>
                  <div className="text-xs text-slate-400">Your Risk Score</div>
                  <div className="text-xs text-slate-500">
                    Enter your email to reveal the full assessment
                  </div>
                </div>
                <div className="select-none text-2xl font-semibold text-slate-100 blur-sm">
                  {riskPct}%
                </div>
              </div>
              <form
                id="email-form"
                onSubmit={handleSubmitEmail}
                className="space-y-3"
                noValidate
              >
                <div className="space-y-2">
                  <div>
                    <label className="mb-1 block text-xs text-slate-200">
                      First name
                    </label>
                    <input
                      id="user-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-9 w-full rounded-none border border-slate-600 bg-slate-950 px-2.5 text-xs text-slate-100 outline-none ring-0 transition focus:border-cisco-blue focus:ring-1 focus:ring-cisco-blue"
                      placeholder="Your first name"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-200">
                      Work email
                    </label>
                    <input
                      id="user-email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-9 w-full rounded-none border border-slate-600 bg-slate-950 px-2.5 text-xs text-slate-100 outline-none ring-0 transition focus:border-cisco-blue focus:ring-1 focus:ring-cisco-blue"
                      placeholder="your.name@yourpractice.com"
                      required
                    />
                  </div>
                </div>
                {emailError && (
                  <p className="text-[11px] text-amber-400">{emailError}</p>
                )}
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center rounded-none bg-cisco-blue px-4 py-2.5 text-xs font-medium text-white shadow-lg shadow-cisco-blue/25 transition hover:bg-white hover:text-cisco-navy"
                >
                  Reveal my HIPAA Risk Score →
                </button>
              </form>
              <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
                No spam. We&apos;ll send your PDF report and occasional HIPAA compliance
                tips. Unsubscribe anytime.
              </p>
            </section>
          )}

          {/* RESULTS */}
          {stage === "results" && (
            <section
              id="result-section"
              className="overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-950 shadow-2xl shadow-black/50"
            >
              <div
                id="result-header"
                data-tier={riskTier}
                className="border-b border-slate-800 bg-gradient-to-br from-slate-950 via-slate-950 to-cisco-blue/10 px-5 py-5 md:px-6 md:py-6"
              >
                <p className="mb-3 text-[11px] text-slate-300">
                  HIPAA Hub · Risk Assessment ·{" "}
                  {new Date().toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <div className="grid items-center gap-4 md:grid-cols-[auto,minmax(0,1fr)]">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      id="result-score-circle"
                      data-tier={riskTier}
                      className="flex h-[110px] w-[110px] items-center justify-center rounded-full border-[3px] border-cisco-blue"
                    >
                      <div className="flex h-[84px] w-[84px] items-center justify-center rounded-full bg-slate-950 text-[26px] font-semibold text-cisco-blue">
                        {riskPct}%
                      </div>
                    </div>
                    <div className="text-[9px] uppercase tracking-[0.18em] text-slate-400">
                      Risk Score
                    </div>
                  </div>
                  <div>
                    <h2 className="mb-1 text-[21px] font-thin text-slate-50">
                      {tierCopy.title}
                    </h2>
                    <p className="text-[13px] text-slate-200">
                      {tierCopy.subtitle}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 bg-slate-950 px-5 py-5 md:px-6 md:py-6">
                {/* breakdown */}
                <section className="space-y-2">
                  <h3 className="text-sm font-semibold text-slate-100">
                    Score breakdown by category
                  </h3>
                  <div className="space-y-2">
                    {breakdownEntries.map(([cat, score]) => {
                      const frac = score.total / score.max;
                      const pctCat = Math.round(frac * 100);
                      let barColor = "bg-emerald-400";
                      if (score.total > 12) barColor = "bg-red-500";
                      else if (score.total > 4) barColor = "bg-amber-400";
                      return (
                        <div
                          key={cat}
                          className="flex flex-col gap-1 text-[12px] text-slate-200 md:flex-row md:items-center md:gap-3"
                        >
                          <span className="w-40 flex-none text-slate-100">
                            {cat}
                          </span>
                          <div className="flex-1">
                            <div className="h-1.5 w-full overflow-hidden rounded-full border border-slate-800 bg-slate-950">
                              <div
                                className={`${barColor} h-full rounded-full transition-[width] duration-300`}
                                style={{ width: `${pctCat}%` }}
                              />
                            </div>
                          </div>
                          <span className="w-20 flex-none text-right text-[11px] text-slate-400">
                            {score.total} / {score.max} pts
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* findings */}
                <section className="space-y-2">
                  <h3 className="text-sm font-semibold text-slate-100">
                    Your key findings
                  </h3>
                  <div className="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-950">
                    {breakdownEntries.filter(([, s]) => s.total > 8).length === 0 ? (
                      <p className="px-4 py-3 text-[12px] text-slate-300">
                        No high-priority findings were identified based on your responses.
                        Maintaining documentation and monitoring remains essential.
                      </p>
                    ) : (
                      breakdownEntries
                        .filter(([, s]) => s.total > 8)
                        .map(([cat, score]) => (
                          <div
                            key={cat}
                            className="grid grid-cols-[auto,minmax(0,1fr)] gap-3 px-4 py-3 text-[13px] text-slate-100"
                          >
                            <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-[10px] text-slate-950">
                              !
                            </div>
                            <div>
                              <p className="text-[13px] font-semibold">
                                {cat}: risk identified
                              </p>
                              <p className="text-[12px] text-slate-300">
                                {/* Simplified copy – full legal copy can be added here */}
                                This category shows elevated risk based on your responses.
                              </p>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </section>

                {/* CTA */}
                <section className="space-y-2">
                  <h3 className="text-[17px] font-thin text-slate-50">
                    Protect your practice starting today
                  </h3>
                  <p className="text-[13px] text-slate-200">
                    HIPAA Hub can move you from your current score to an audit-ready posture
                    in roughly a week. You receive all nine HIPAA policies, automated risk
                    tracking, breach notification workflows, and one-click audit export
                    without hiring a consultant.
                  </p>
                  <div className="mt-2 flex flex-col gap-2">
                    <a
                      href="https://hipaahubhealth.com/signup"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex w-full items-center justify-center rounded-none bg-cisco-blue px-4 py-2.5 text-xs font-medium text-white shadow-lg shadow-cisco-blue/25 transition hover:bg-white hover:text-cisco-navy"
                    >
                      Start my free 14-day trial, no credit card →
                    </a>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="inline-flex w-full items-center justify-center rounded-none border border-slate-600 bg-slate-950 px-4 py-2.5 text-xs font-light text-slate-200 shadow-sm shadow-black/30 transition hover:bg-slate-900"
                    >
                      Download my PDF report
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Free trial includes all 9 HIPAA policies, risk assessment, breach
                    notification tools, and audit export.
                  </p>
                </section>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-black px-4 py-4 text-[11px] text-slate-400">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            © 2026 HIPAA Hub LLC · Austin, Texas · contact@hipaahubhealth.com
          </div>
          <div className="flex flex-wrap gap-3">
            <span>Privacy Policy</span>
            <span>HIPAA BAA</span>
            <span>
              This tool does not store or collect any patient health information (PHI).
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
