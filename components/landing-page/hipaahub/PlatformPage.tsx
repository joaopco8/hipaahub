import React from 'react';
import {
  Cpu,
  FileText,
  Users,
  ShieldAlert,
  Archive,
  ArrowRight,
  Lock,
  CheckCircle2,
  BarChart3,
  FolderOpen,
} from 'lucide-react';

const Module: React.FC<{
  number: string;
  title: string;
  tagline: string;
  body: string;
  details: string[];
  icon: React.ReactNode;
}> = ({ number, title, tagline, body, details, icon }) => (
  <div className="grid md:grid-cols-[1fr_2fr] gap-0 border-b border-gray-100 py-16">
    {/* Left */}
    <div className="pr-12 mb-8 md:mb-0">
      <div className="flex items-start gap-4 mb-6">
        <span className="text-[11px] font-bold text-gray-300 tracking-[0.2em] mt-1">{number}</span>
        <div className="text-[#00bceb]">{icon}</div>
      </div>
      <h3 className="text-2xl font-light text-[#0e274e] leading-snug mb-3">{title}</h3>
      <p className="text-xs font-semibold text-[#00bceb] uppercase tracking-widest">{tagline}</p>
    </div>
    {/* Right */}
    <div>
      <p className="text-base text-gray-600 font-light leading-relaxed mb-8">{body}</p>
      <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
        {details.map((d, i) => (
          <div key={i} className="flex items-start gap-3">
            <CheckCircle2 className="text-[#00bceb] mt-0.5 shrink-0" size={14} strokeWidth={2} />
            <span className="text-sm text-gray-500 font-light leading-snug">{d}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const PlatformPage: React.FC<{
  onBack: () => void;
  onWatchDemo?: () => void;
  onAssessmentClick?: () => void;
}> = ({ onBack, onWatchDemo, onAssessmentClick }) => {
  return (
    <div className="bg-white min-h-screen">

      {/* Sub-Nav */}
      <div className="bg-white border-b py-3 px-4 md:px-12 sticky top-[73px] z-[90]">
        <div className="max-w-7xl mx-auto flex items-center space-x-2 text-[10px] text-gray-400">
          <button onClick={onBack} className="hover:text-[#00bceb] transition-colors">Home</button>
          <span className="text-gray-200">/</span>
          <span className="text-[#0e274e] font-semibold">Platform</span>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-white py-24 border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="max-w-5xl">
            <p className="text-[11px] font-bold text-[#00bceb] tracking-[0.25em] uppercase mb-8">
              HIPAA Hub Platform
            </p>
            <h1 className="text-4xl md:text-6xl lg:text-[5.5rem] font-thin text-[#0e274e] leading-[1.1] mb-10">
              Everything an auditor<br />will ask for.<br />
              <span className="text-gray-300">Already done.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 font-light leading-relaxed max-w-3xl mb-16">
              HIPAA Hub is a compliance infrastructure platform built for healthcare organizations.
              It does not give you checklists to fill out manually. It executes compliance —
              generating your policies, assessing your risks, tracking your staff training,
              managing your evidence, and producing a complete audit package on demand.
            </p>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-gray-100">
              {[
                { value: '150+', label: 'HIPAA controls assessed' },
                { value: '9', label: 'Required policies generated' },
                { value: '48', label: 'Evidence fields mapped' },
                { value: '45 CFR', label: 'Part 164 — fully covered' },
              ].map((s, i) => (
                <div key={i} className="p-6 border-r border-gray-100 last:border-r-0">
                  <div className="text-2xl md:text-3xl font-light text-[#0e274e] mb-1">{s.value}</div>
                  <div className="text-[11px] text-gray-400 font-light leading-snug">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works — methodology */}
      <section className="py-20 border-b bg-[#f9fafb]">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="grid md:grid-cols-[1fr_2fr] gap-16 items-start">
            <div>
              <p className="text-[11px] font-bold text-[#00bceb] tracking-[0.25em] uppercase mb-4">Methodology</p>
              <h2 className="text-3xl md:text-4xl font-thin text-[#0e274e] leading-snug">
                How the platform works
              </h2>
            </div>
            <div className="space-y-8 text-gray-600 font-light leading-relaxed text-base">
              <p>
                HIPAA compliance fails at most organizations for one reason: it is treated as a documentation exercise instead of an operational discipline. Forms are filled, binders are created, and then nothing is maintained. When an auditor or a breach arrives, the documentation is outdated, the evidence is missing, and the exposure is real.
              </p>
              <p>
                HIPAA Hub is built on a different premise. Compliance is a continuous system, not an annual event. The platform connects your organization data — your officers, your addresses, your risk posture, your staff — to every output it produces. When something changes, everything updates. When an auditor arrives, you export.
              </p>
              <p>
                Every module on the platform is mapped to a specific section of 45 CFR Part 164. We do not interpret the regulation loosely. The controls we assess, the policies we generate, the evidence we collect, and the logs we maintain are structured to match exactly what OCR auditors look for — because that is the only standard that matters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-12">

          <div className="pt-8 pb-4 border-b border-gray-100 mb-4">
            <p className="text-[11px] font-bold text-gray-400 tracking-[0.25em] uppercase">Platform Modules</p>
          </div>

          <Module
            number="01"
            icon={<Cpu size={28} strokeWidth={1} />}
            title="Risk Assessment Engine"
            tagline="45 CFR §164.308(a)(1) — Required Implementation"
            body="The risk assessment is the legal foundation of HIPAA compliance. Without a documented, thorough analysis of risks to electronic PHI, no other compliance work is defensible. Our engine walks your organization through 150+ structured questions mapped to the Administrative, Physical, and Technical Safeguards. Each answer is weighted by regulatory severity and operational impact. The system then computes a 0–100 risk score, identifies every gap by safeguard category, cites the specific regulatory standard, and generates a prioritized remediation plan with corrective actions. The methodology mirrors what an OCR auditor would apply during a compliance review — so there are no surprises when it matters."
            details={[
              '150+ controls mapped to 45 CFR §§164.308–164.318',
              'Weighted 0–100 risk score by safeguard category',
              'Gap analysis with specific regulatory citations',
              'Prioritized remediation roadmap with corrective actions',
              'Historical snapshots for trend analysis over time',
              'Annual reassessment tracking with change detection',
            ]}
          />

          <Module
            number="02"
            icon={<FileText size={28} strokeWidth={1} />}
            title="Policy Generator"
            tagline="45 CFR §164.316 — Documentation Standards"
            body="HIPAA requires covered entities to maintain written policies and procedures for every administrative and technical safeguard they implement. Generic templates are not enough — policies must reflect your organization's actual structure, officers, identifiers, and state. Our generator produces nine HIPAA-required policy documents by merging your organization data — legal name, NPI, EIN, state license, privacy officer, security officer, and authorized representative — into a complete, professionally formatted document set. Every document is versioned, with full change history preserved. Each policy update triggers a staff acknowledgment workflow, creating a timestamped electronic record of who received, read, and acknowledged each document — the exact evidence an auditor requests."
            details={[
              '9 required HIPAA policy documents generated from your org data',
              'Full version history with change tracking and timestamps',
              'Organization-specific: NPI, EIN, officers, and address embedded',
              'Staff acknowledgment workflow with electronic audit trail',
              'Annual review scheduling with automated reminders',
              'Policy status tracking: draft, in review, active, archived',
            ]}
          />

          <Module
            number="03"
            icon={<FolderOpen size={28} strokeWidth={1} />}
            title="Evidence Center"
            tagline="45 CFR §164.316(b) — Documentation and Retention"
            body="Policies describe what your organization does. Evidence proves that you actually do it. The Evidence Center is a structured repository with 48 upload fields, each mapped to a specific HIPAA safeguard requirement. For each requirement, you can upload documents, link external sources — EHR portals, cloud provider consoles, vendor platforms — or record attestations. Every item is categorized, timestamped, and access-logged. The system extracts text from PDFs for full-text search across your entire evidence vault. When an auditor requests evidence of MFA configuration, audit log retention, workforce training, or breach response procedures, you locate and produce it in seconds — not hours."
            details={[
              '48 evidence fields mapped to specific HIPAA safeguards',
              'Supports document upload, external links, and attestations',
              'Access logging: who viewed or downloaded each item and when',
              'Full-text search across all uploaded documents (PDF extraction)',
              'Evidence categorized by HIPAA section for instant retrieval',
              'Validity tracking with expiration alerts and review reminders',
            ]}
          />

          <Module
            number="04"
            icon={<Users size={28} strokeWidth={1} />}
            title="Employee Training"
            tagline="45 CFR §164.308(a)(5) — Security Awareness and Training"
            body="HIPAA requires that all workforce members receive security awareness training. OCR auditors will ask for training logs. They will ask who was trained, when, and whether certificates were issued. They will ask about renewal cycles. Our training module assigns role-based HIPAA modules to each employee, tracks completion at the individual level, and generates dated certificates upon completion. Expiration dates are tracked. The system maintains a historical record of every training event — not just current status, but every session, every employee, going back to day one. When the auditor asks, you show the full log."
            details={[
              'Role-based training modules aligned to HIPAA requirements',
              'Individual-level completion tracking with exact timestamps',
              'Dated training certificates generated automatically',
              'Expiration tracking and renewal reminders',
              'Full historical training log from onboarding forward',
              'Manager view with real-time compliance rates by team',
            ]}
          />

          <Module
            number="05"
            icon={<ShieldAlert size={28} strokeWidth={1} />}
            title="Breach Notification Builder"
            tagline="45 CFR §§164.400–414 — Breach Notification Rule"
            body="A breach is not the end of your compliance standing — a mishandled breach is. The Breach Notification Rule imposes strict timelines: 60 days from discovery to notify HHS, individual notifications without unreasonable delay, and media notification when more than 500 residents of a state are affected. Our builder walks you through a structured incident intake covering every element OCR requires: what PHI was involved, how many individuals are affected, whether encryption makes the breach legally reportable under §164.402, and the chain of custody for discovery and response. It then generates the three required letters — patient notification, HHS/OCR notification, and media notice — and tracks your 60-day filing deadline. The entire incident record is preserved as an immutable forensic log."
            details={[
              'Structured intake covering all 45 CFR §§164.400–414 elements',
              'Legal classification engine: reportable vs. not reportable under §164.402',
              'Auto-generates patient, HHS/OCR, and media notification letters',
              '60-day OCR filing deadline tracked from date of discovery',
              'Incident log with full chain-of-custody documentation',
              'Immutable forensic audit trail for legal defense',
            ]}
          />

          <Module
            number="06"
            icon={<Archive size={28} strokeWidth={1} />}
            title="Audit Export"
            tagline="OCR Compliance Review — Complete Package"
            body="When HHS initiates a compliance review or a cyber insurer requests documentation, you have a narrow window to produce everything they need. Our audit export assembles your complete compliance record — current policy set, risk assessment findings, remediation plan, training logs, evidence inventory, and an executive compliance summary — and packages it into a structured archive organized exactly as a regulator expects to receive it. The export is timestamped, formatted as a professional PDF bundle, and delivered as a ZIP archive with consistent file naming and section headers. There is nothing to compile, format, or explain. You download and deliver."
            details={[
              'One-click assembly of your full compliance record',
              'Includes policies, risk assessment, training logs, and evidence',
              'Professional PDF bundle with executive summary',
              'Organized by HIPAA section — immediately auditor-readable',
              'Timestamped ZIP archive for chain-of-custody purposes',
              'Accepted by OCR, cyber insurers, and legal counsel',
            ]}
          />

        </div>
      </section>

      {/* Architecture / Trust */}
      <section className="py-20 bg-[#f9fafb] border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="grid md:grid-cols-[1fr_2fr] gap-16 items-start mb-16">
            <div>
              <p className="text-[11px] font-bold text-[#00bceb] tracking-[0.25em] uppercase mb-4">Architecture</p>
              <h2 className="text-3xl md:text-4xl font-thin text-[#0e274e] leading-snug">
                Built to be defensible in court
              </h2>
            </div>
            <p className="text-base text-gray-500 font-light leading-relaxed">
              Every action taken on the platform is logged. Every document generated carries a version identifier, a timestamp, and the identity of the user who produced it. Every evidence upload records who uploaded it, from what IP address, and when it was subsequently accessed. This is not a logging afterthought — it is the core architecture. When you need to demonstrate to a regulator, an attorney, or an insurer that your organization followed a defined compliance process, the platform provides that record automatically.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200">
            {[
              {
                icon: <Lock size={20} strokeWidth={1.5} />,
                title: 'Row-Level Security',
                body: 'Every record is isolated by organization. No data is visible across accounts. Access is enforced at the database level, not the application layer.',
              },
              {
                icon: <BarChart3 size={20} strokeWidth={1.5} />,
                title: 'Immutable Audit Logs',
                body: 'All access events, document generations, and evidence interactions are recorded in append-only logs. Records cannot be altered retroactively.',
              },
              {
                icon: <CheckCircle2 size={20} strokeWidth={1.5} />,
                title: 'Continuous Monitoring',
                body: 'Validity windows, renewal dates, and review cycles are tracked in real time. Compliance degradation surfaces automatically — not during an audit.',
              },
              {
                icon: <Archive size={20} strokeWidth={1.5} />,
                title: 'Retention Compliance',
                body: 'HIPAA requires documentation to be retained for six years. Evidence and policy records are maintained with field-level retention tracking aligned to 45 CFR §164.316(b)(2).',
              },
            ].map((item, i) => (
              <div key={i} className="bg-white p-8">
                <div className="text-[#00bceb] mb-5">{item.icon}</div>
                <h4 className="text-sm font-semibold text-[#0e274e] mb-3">{item.title}</h4>
                <p className="text-xs text-gray-500 font-light leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0e274e] py-24 md:py-32 text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="max-w-4xl">
            <p className="text-[11px] font-bold text-[#00bceb] tracking-[0.25em] uppercase mb-8">Get Started</p>
            <h2 className="text-4xl md:text-6xl font-thin leading-[1.1] mb-10">
              The OCR does not warn you<br />before an audit.
            </h2>
            <p className="text-gray-400 text-lg font-light leading-relaxed max-w-2xl mb-12">
              Most healthcare organizations discover their compliance gaps when a complaint is filed
              or a breach occurs. HIPAA Hub shows you exactly where you stand, closes every gap before
              it becomes a liability, and keeps your documentation current without manual effort.
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <button
                onClick={() => onAssessmentClick?.()}
                className="bg-[#00bceb] text-white px-10 py-4 text-sm font-bold hover:bg-white hover:text-[#0e274e] transition-all group flex items-center gap-3"
              >
                Start free, no credit card
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={onWatchDemo}
                className="border border-white/20 text-white px-10 py-4 text-sm font-light hover:border-white/50 transition-all"
              >
                Watch 3-min demo
              </button>
            </div>
            <p className="text-gray-500 text-xs font-light mt-6">
              Set up in 1–3 hours. No credit card required.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default PlatformPage;
