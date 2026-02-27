import React, { useState } from 'react';
import { ArrowLeft, Download, FileText, Lock, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';

const ResearchPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [formState, setFormState] = useState({ name: '', email: '', organization: '', role: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.email || !formState.organization) return;
    setLoading(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 900));
    setLoading(false);
    setSubmitted(true);
  };

  const tocItems = [
    'Executive Summary',
    'The 2026 HIPAA Enforcement Landscape',
    'Financial Impact of Non-Compliance',
    'The Most Common Structural Failures in Healthcare Compliance',
    'Risk Assessment in 2026',
    'Vendor and Third-Party Risk Exposure',
    'Incident Response and Breach Management Evolution',
    'Building a Continuous Compliance Infrastructure',
    'The Structured Compliance Framework™',
    'Recommendations for Healthcare Leaders in 2026',
    'Conclusion'
  ];

  const keyFindings = [
    {
      stat: '67%',
      label: 'of investigated organizations had no current Security Risk Analysis on file at the time of OCR inquiry.'
    },
    {
      stat: '$2.1M',
      label: 'average total cost of a healthcare data breach in 2025, including OCR penalties, legal fees, and remediation.'
    },
    {
      stat: '40%',
      label: 'increase in OCR desk audit activity targeting practices with fewer than 20 providers (2023–2025).'
    },
    {
      stat: '3.4x',
      label: 'higher likelihood of repeat violation for organizations without structured compliance documentation systems.'
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b py-2 px-4 md:px-12 text-[10px] text-gray-400">
        <div className="max-w-7xl mx-auto flex items-center space-x-2 font-thin">
          <button onClick={onBack} className="hover:text-[#0175a2] transition-colors">Home</button>
          <span className="text-gray-200">/</span>
          <span className="text-[#0e274e]">Research</span>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-[#0e274e] text-white py-24 px-4 md:px-12">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center text-[#0175a2] text-sm font-thin mb-10 hover:text-white transition-colors group"
          >
            <ArrowLeft size={16} className="mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </button>
          <p className="text-xs font-thin tracking-[0.2em] uppercase text-[#0175a2] mb-4">Research & Intelligence</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-thin leading-tight max-w-4xl mb-8">
            HIPAA Compliance Intelligence Report 2026
          </h1>
          <p className="text-gray-300 font-thin text-lg max-w-2xl leading-relaxed">
            Enforcement trends, vulnerability analysis, and regulatory outlook for healthcare compliance officers, practice administrators, and clinical leadership.
          </p>
          <div className="flex flex-wrap gap-6 mt-10 text-xs font-thin text-gray-400">
            <span className="flex items-center gap-2"><FileText size={14} className="text-[#0175a2]" /> 48 pages</span>
            <span className="flex items-center gap-2"><CheckCircle size={14} className="text-[#1ad07a]" /> Published Q1 2026</span>
            <span className="flex items-center gap-2"><Lock size={14} className="text-gray-400" /> Complimentary — registration required</span>
          </div>
        </div>
      </div>

      {/* Key Findings */}
      <section className="py-20 px-4 md:px-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="mb-14">
            <p className="text-xs font-thin tracking-[0.2em] uppercase text-[#0175a2] mb-4">Key Findings</p>
            <h2 className="text-3xl font-thin text-[#0e274e] leading-tight max-w-xl">
              What the data reveals about HIPAA compliance in 2025–2026.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {keyFindings.map((f, idx) => (
              <div key={idx} className="border border-gray-100 p-8">
                <div className="text-4xl font-thin text-[#0175a2] mb-4">{f.stat}</div>
                <p className="text-gray-500 font-thin text-sm leading-relaxed">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Report preview + download form */}
      <section className="py-20 px-4 md:px-12">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20">
          {/* Table of contents */}
          <div>
            <p className="text-xs font-thin tracking-[0.2em] uppercase text-[#0175a2] mb-6">Report Contents</p>
            <h2 className="text-2xl font-thin text-[#0e274e] mb-10 leading-tight">
              What this report covers.
            </h2>
            <ol className="space-y-4">
              {tocItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-4 py-4 border-b border-gray-50">
                  <span className="text-[#0175a2] font-thin text-xs mt-0.5 w-5 flex-shrink-0">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="text-gray-600 font-thin text-sm">{item}</span>
                  <ChevronRight size={14} className="text-gray-200 ml-auto mt-0.5 flex-shrink-0" />
                </li>
              ))}
            </ol>

            {/* Audience */}
            <div className="mt-12 bg-gray-50 border border-gray-100 p-8">
              <p className="text-xs font-thin tracking-[0.2em] uppercase text-[#0175a2] mb-4">Intended Audience</p>
              <ul className="space-y-2 text-sm text-gray-500 font-thin">
                {[
                  'Chief Compliance Officers and Privacy Officers',
                  'Practice Administrators and Operations Directors',
                  'IT and Security Leaders in healthcare settings',
                  'Risk Management and Legal Counsel',
                  'Clinical leadership evaluating compliance posture'
                ].map((a, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-[#0175a2] rounded-full flex-shrink-0" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Download form */}
          <div>
            <div className="bg-white border border-gray-100 p-10 sticky top-24 shadow-sm">
              {!submitted ? (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <FileText size={20} className="text-[#0175a2]" strokeWidth={1.5} />
                    <p className="text-xs font-thin tracking-[0.2em] uppercase text-[#0175a2]">Download Report</p>
                  </div>
                  <h3 className="text-2xl font-thin text-[#0e274e] mb-2 leading-tight">
                    HIPAA Compliance Intelligence Report 2026
                  </h3>
                  <p className="text-gray-400 font-thin text-sm mb-8">
                    Complete the form below to receive your complimentary copy. PDF delivered instantly.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-xs font-thin text-[#0e274e] mb-1.5 tracking-wide uppercase">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Dr. Sarah Mitchell"
                        value={formState.name}
                        onChange={e => setFormState({ ...formState, name: e.target.value })}
                        className="w-full px-4 py-3 text-sm font-thin border border-gray-200 focus:outline-none focus:border-[#0175a2] text-[#0e274e] bg-white placeholder:text-[#565656]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-thin text-[#0e274e] mb-1.5 tracking-wide uppercase">
                        Work Email <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="compliance@clinic.com"
                        value={formState.email}
                        onChange={e => setFormState({ ...formState, email: e.target.value })}
                        className="w-full px-4 py-3 text-sm font-thin border border-gray-200 focus:outline-none focus:border-[#0175a2] text-[#0e274e] bg-white placeholder:text-[#565656]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-thin text-[#0e274e] mb-1.5 tracking-wide uppercase">
                        Organization <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Westside Medical Group"
                        value={formState.organization}
                        onChange={e => setFormState({ ...formState, organization: e.target.value })}
                        className="w-full px-4 py-3 text-sm font-thin border border-gray-200 focus:outline-none focus:border-[#0175a2] text-[#0e274e] bg-white placeholder:text-[#565656]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-thin text-[#0e274e] mb-1.5 tracking-wide uppercase">
                        Your Role
                      </label>
                      <select
                        value={formState.role}
                        onChange={e => setFormState({ ...formState, role: e.target.value })}
                        className="w-full px-4 py-3 text-sm font-thin border border-gray-200 focus:outline-none focus:border-[#0175a2] text-[#0e274e] bg-white appearance-none placeholder:text-[#565656]"
                      >
                        <option value="">Select your role</option>
                        <option>Chief Compliance Officer</option>
                        <option>Privacy Officer</option>
                        <option>Practice Administrator</option>
                        <option>IT / Security Lead</option>
                        <option>Physician / Clinical Lead</option>
                        <option>Legal Counsel</option>
                        <option>Other</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#0175a2] text-white py-4 text-sm font-thin hover:bg-[#0e274e] transition-all flex items-center justify-center gap-3 disabled:opacity-60"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        <>
                          <Download size={16} />
                          Download Report — Free
                        </>
                      )}
                    </button>

                    <p className="text-[11px] text-gray-400 font-thin text-center leading-relaxed">
                      By submitting, you agree to receive occasional compliance updates from HIPAA Hub. Unsubscribe at any time.
                    </p>
                  </form>
                </>
              ) : (
                <div className="py-12 text-center">
                  <CheckCircle size={40} className="text-[#1ad07a] mx-auto mb-6" strokeWidth={1} />
                  <h3 className="text-2xl font-thin text-[#0e274e] mb-4">Report access confirmed.</h3>
                  <p className="text-gray-500 font-thin text-sm leading-relaxed mb-8">
                    A download link has been sent to <span className="text-[#0175a2]">{formState.email}</span>. Check your inbox within a few minutes.
                  </p>
                  <div className="bg-gray-50 border border-gray-200 p-6 text-left">
                    <p className="text-xs font-thin tracking-wide uppercase text-[#0175a2] mb-3">While you wait</p>
                    <p className="text-sm font-thin leading-relaxed text-[#0e274e]">
                      HIPAA Hub's platform delivers automated compliance infrastructure aligned to the findings in this report. Request a demo to see it in action.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-6 justify-center text-xs text-gray-400 font-thin">
                    <AlertCircle size={13} className="text-gray-300" />
                    Check your spam folder if the email does not arrive within 5 minutes.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Previous reports */}
      <section className="py-20 px-4 md:px-12 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-thin tracking-[0.2em] uppercase text-[#0175a2] mb-6">Previous Reports</p>
          <h2 className="text-2xl font-thin text-[#0e274e] mb-10">Research archive.</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                year: '2025',
                title: 'HIPAA Compliance Intelligence Report 2025',
                pages: '42 pages',
                desc: 'Full analysis of 2024 OCR enforcement, ransomware trends in healthcare, and the impact of HITECH amendments.'
              },
              {
                year: '2024',
                title: 'State of Healthcare Cybersecurity 2024',
                pages: '38 pages',
                desc: 'Comprehensive review of data breach patterns, vulnerability classifications, and emerging threat actors targeting healthcare organizations.'
              },
              {
                year: '2023',
                title: 'HIPAA Risk Assessment Benchmarks 2023',
                pages: '29 pages',
                desc: 'Benchmark data from 600+ risk assessments. Identifies the most commonly incomplete security controls across practice types.'
              }
            ].map((r, idx) => (
              <div key={idx} className="bg-white border border-gray-100 p-8">
                <p className="text-[#0175a2] text-xs font-thin tracking-widest uppercase mb-3">{r.year}</p>
                <h3 className="text-base font-thin text-[#0e274e] mb-2 leading-tight">{r.title}</h3>
                <p className="text-xs text-gray-400 font-thin mb-4">{r.pages}</p>
                <p className="text-gray-500 font-thin text-sm leading-relaxed mb-6">{r.desc}</p>
                <button className="text-sm font-thin text-[#0175a2] flex items-center gap-2 hover:text-[#0e274e] transition-colors">
                  <Lock size={13} />
                  Available on request
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ResearchPage;
