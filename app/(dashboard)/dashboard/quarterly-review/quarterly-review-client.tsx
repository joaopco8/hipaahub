'use client';

import { useState } from 'react';
import { CheckCircle2, Circle, ChevronDown, ChevronUp, BarChart3 } from 'lucide-react';

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'] as const;
type Quarter = typeof QUARTERS[number];

const CHECKLIST: { category: string; items: string[] }[] = [
  {
    category: 'Risk Management',
    items: [
      'Review open action items from the risk assessment',
      'Assess any new risks or system changes since last review',
      'Verify mitigation tasks are progressing on schedule',
      'Confirm risk score has not materially deteriorated',
    ],
  },
  {
    category: 'Policy & Documentation',
    items: [
      'Confirm all 9 policies are active and version-current',
      'Review any policy updates required by regulatory changes',
      'Ensure new staff have acknowledged updated policies',
      'Check that Business Associate Agreements are current',
    ],
  },
  {
    category: 'Workforce Training',
    items: [
      'Verify training completion rates for all staff',
      'Identify staff with expired or expiring certificates',
      'Confirm new hires completed onboarding training',
      'Review any training-related incidents or complaints',
    ],
  },
  {
    category: 'Breach & Incident Review',
    items: [
      'Review all incidents logged in the current quarter',
      'Confirm all reportable breaches were filed with HHS within 60 days',
      'Verify corrective actions from prior incidents are closed',
      'Assess adequacy of current breach response procedures',
    ],
  },
  {
    category: 'Technical Safeguards',
    items: [
      'Review access control logs for anomalies',
      'Confirm MFA is enabled for all PHI-related systems',
      'Verify audit log retention is meeting 6-year requirement',
      'Check encryption status for devices and storage',
    ],
  },
  {
    category: 'Vendor Management',
    items: [
      'Review Business Associate list for completeness',
      'Confirm BAAs are signed with any new vendors',
      'Flag any BAAs expiring in the next 90 days',
      'Review any vendor security incidents or notifications',
    ],
  },
];

const STORAGE_KEY = 'hipaa_quarterly_reviews_v1';

function loadState(): Record<string, Record<string, boolean>> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function saveState(state: Record<string, Record<string, boolean>>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export default function QuarterlyReviewPage() {
  const currentQ = `Q${Math.ceil((new Date().getMonth() + 1) / 3)}` as Quarter;
  const [activeQ, setActiveQ] = useState<Quarter>(currentQ);
  const [checks, setChecks] = useState<Record<string, Record<string, boolean>>>(loadState);
  const [openSection, setOpenSection] = useState<string | null>(CHECKLIST[0].category);

  const key = (q: Quarter, cat: string, item: string) => `${q}::${cat}::${item}`;

  const toggle = (q: Quarter, cat: string, item: string) => {
    const k = key(q, cat, item);
    const next = {
      ...checks,
      [k]: { ...checks[k], checked: !checks[k]?.checked },
    };
    // store flat
    const flat: Record<string, Record<string, boolean>> = {};
    Object.entries(next).forEach(([kk, v]) => { flat[kk] = v; });
    setChecks(flat);
    saveState(flat);
  };

  const isChecked = (q: Quarter, cat: string, item: string) =>
    !!checks[key(q, cat, item)]?.checked;

  const totalItems = CHECKLIST.reduce((s, c) => s + c.items.length, 0);

  const completedForQ = (q: Quarter) =>
    CHECKLIST.reduce(
      (s, c) => s + c.items.filter((it) => isChecked(q, c.category, it)).length,
      0
    );

  const pct = (q: Quarter) => Math.round((completedForQ(q) / totalItems) * 100);

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 md:px-8 space-y-8">
      <div>
        <p className="text-xs font-medium text-[#00bceb] mb-1">Clinic Plan</p>
        <h1 className="text-3xl font-light text-[#0e274e]">Quarterly Compliance Reviews</h1>
        <p className="text-sm text-gray-500 mt-1 font-light">
          Structured review checklist for each quarter. Progress is saved in your browser.
        </p>
      </div>

      {/* Quarter tabs */}
      <div className="grid grid-cols-4 gap-px bg-gray-100 border border-gray-100">
        {QUARTERS.map((q) => {
          const done = completedForQ(q);
          const isActive = activeQ === q;
          const isCurrent = q === currentQ;
          return (
            <button
              key={q}
              onClick={() => setActiveQ(q)}
              className={`bg-white px-4 py-4 text-center transition-all ${isActive ? 'ring-1 ring-inset ring-[#00bceb]' : 'hover:bg-gray-50'}`}
            >
              <p className={`text-sm font-medium ${isActive ? 'text-[#00bceb]' : 'text-[#0e274e]'}`}>
                {q} {isCurrent && <span className="text-[10px] text-gray-400 font-light ml-1">current</span>}
              </p>
              <p className="text-xs text-gray-400 font-light mt-0.5">{done}/{totalItems}</p>
              <div className="w-full bg-gray-100 rounded-full h-1 mt-2">
                <div
                  className="h-1 rounded-full bg-[#00bceb] transition-all"
                  style={{ width: `${pct(q)}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Progress summary for active Q */}
      <div className="flex items-center justify-between px-5 py-3 bg-white border border-gray-100">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-4 w-4 text-[#00bceb]" />
          <span className="text-sm font-light text-[#0e274e]">{activeQ} Review Progress</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 font-light">{completedForQ(activeQ)}/{totalItems} items</span>
          <span className={`text-sm font-medium ${pct(activeQ) === 100 ? 'text-green-600' : pct(activeQ) >= 50 ? 'text-yellow-600' : 'text-gray-400'}`}>
            {pct(activeQ)}%
          </span>
        </div>
      </div>

      {/* Checklist sections */}
      <div className="space-y-2">
        {CHECKLIST.map((section) => {
          const sectionDone = section.items.filter((it) => isChecked(activeQ, section.category, it)).length;
          const isOpen = openSection === section.category;
          return (
            <div key={section.category} className="border border-gray-100 bg-white">
              <button
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                onClick={() => setOpenSection(isOpen ? null : section.category)}
              >
                <div className="flex items-center gap-3">
                  {sectionDone === section.items.length ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-gray-300 shrink-0" />
                  )}
                  <span className="text-sm font-medium text-[#0e274e]">{section.category}</span>
                  <span className="text-xs text-gray-400 font-light">{sectionDone}/{section.items.length}</span>
                </div>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </button>

              {isOpen && (
                <div className="px-5 pb-4 border-t border-gray-50 space-y-2 pt-3">
                  {section.items.map((item, idx) => {
                    const checked = isChecked(activeQ, section.category, item);
                    return (
                      <button
                        key={idx}
                        onClick={() => toggle(activeQ, section.category, item)}
                        className="w-full flex items-start gap-3 text-left py-1.5 group"
                      >
                        <div className={`mt-0.5 h-4 w-4 shrink-0 rounded border transition-colors ${checked ? 'bg-[#00bceb] border-[#00bceb]' : 'border-gray-300 group-hover:border-[#00bceb]'} flex items-center justify-center`}>
                          {checked && (
                            <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 12 12">
                              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-sm font-light leading-snug ${checked ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                          {item}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {pct(activeQ) === 100 && (
        <div className="flex items-center gap-3 px-5 py-4 bg-green-50 border border-green-100 text-green-700 text-sm font-light">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {activeQ} review complete. All {totalItems} items confirmed.
        </div>
      )}
    </div>
  );
}
