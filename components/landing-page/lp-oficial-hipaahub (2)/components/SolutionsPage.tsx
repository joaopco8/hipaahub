
import React from 'react';
import { 
  ChevronRight, 
  ShieldCheck, 
  Zap, 
  Activity, 
  ShieldAlert, 
  ArrowRight, 
  FileText, 
  Target, 
  Layers, 
  RefreshCw, 
  AlertCircle,
  Clock,
  CheckCircle2
} from 'lucide-react';

const SolutionSection: React.FC<{
  id?: string;
  title: string;
  subtitle: string;
  body: string;
  deliverables: string[];
  investment: string;
  timeline?: string;
  cta: string;
  image: string;
  reverse?: boolean;
}> = ({ id, title, subtitle, body, deliverables, investment, timeline, cta, image, reverse }) => (
  <section id={id} className={`py-24 border-b ${reverse ? 'bg-gray-50' : 'bg-white'}`}>
    <div className="max-w-7xl mx-auto px-4 md:px-12">
      <div className={`grid lg:grid-cols-2 gap-20 items-center ${reverse ? 'lg:flex-row-reverse' : ''}`}>
        <div className={reverse ? 'lg:order-2' : 'lg:order-1'}>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-cisco-blue text-[10px] font-bold mb-8">
            <ShieldCheck size={14} /> Institutional Service
          </div>
          <h2 className="text-3xl md:text-5xl font-light text-cisco-navy mb-4 leading-tight">
            {title}
          </h2>
          <h3 className="text-lg md:text-xl font-normal text-cisco-blue mb-8">
            {subtitle}
          </h3>
          <p className="text-gray-600 text-lg font-light leading-relaxed mb-10">
            {body}
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div>
              <h4 className="text-[10px] font-bold text-gray-400 mb-4 border-b pb-2">Deliverables</h4>
              <ul className="space-y-3">
                {deliverables.map((item, i) => (
                  <li key={i} className="flex items-start text-sm text-gray-500 font-light leading-snug">
                    <CheckCircle2 size={14} className="text-cisco-blue mr-3 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white/50 p-6 border border-gray-100 shadow-sm">
              <div className="mb-6">
                <h4 className="text-[10px] font-bold text-gray-400 mb-1">Investment</h4>
                <p className="text-xl font-light text-cisco-navy">{investment}</p>
              </div>
              {timeline && (
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 mb-1">Timeline</h4>
                  <p className="text-base font-light text-cisco-navy">{timeline}</p>
                </div>
              )}
            </div>
          </div>
          
          <button className="bg-cisco-navy text-white px-10 py-4 text-xs font-normal hover:bg-cisco-blue transition-all group flex items-center">
            {cta} <ArrowRight size={16} className="ml-3 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        
        <div className={`${reverse ? 'lg:order-1' : 'lg:order-2'} relative`}>
          <div className="aspect-[4/5] bg-gray-200 overflow-hidden shadow-2xl">
            <img src={image} alt={title} className="w-full h-full object-cover grayscale brightness-90 hover:grayscale-0 transition-all duration-1000" />
          </div>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-cisco-blue/5 -z-10"></div>
        </div>
      </div>
    </div>
  </section>
);

const SolutionsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="bg-white min-h-screen">
      {/* Sub-Nav / Breadcrumbs */}
      <div className="bg-white border-b py-3 px-4 md:px-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[10px] text-gray-400">
            <button onClick={onBack} className="hover:text-cisco-blue transition-colors">Healthcare Administration</button>
            <span className="text-gray-200">/</span>
            <span className="text-cisco-navy font-semibold">Implementation Solutions</span>
          </div>
          <div className="hidden md:flex space-x-8 text-[11px] font-normal text-gray-500">
            <a href="#sprint" className="hover:text-cisco-blue">7-Day Sprint</a>
            <a href="#full" className="hover:text-cisco-blue">Full Implementation</a>
            <a href="#oversight" className="hover:text-cisco-blue">Oversight</a>
            <a href="#incident" className="hover:text-cisco-blue">Incident Response</a>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative h-[650px] w-full bg-cisco-navy overflow-hidden flex items-center">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=2000" 
            alt="Medical Professional" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-cisco-navy via-cisco-navy/40 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-12 text-white">
          <div className="max-w-4xl">
            <p className="text-xs font-normal text-blue-400 mb-6">Consulting Portfolio</p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-light leading-tight mb-10">
              HIPAA Compliance <br /> Implementation for Small <br /> Healthcare Organizations
            </h1>
            <h3 className="text-xl md:text-2xl font-light text-gray-300 mb-10 border-l-2 border-cisco-blue pl-8">
              Structured compliance frameworks designed for organizations <br className="hidden md:block" /> without dedicated compliance infrastructure.
            </h3>
            <p className="text-gray-400 text-lg font-light leading-relaxed mb-12 max-w-2xl">
              Healthcare organizations face increasing regulatory scrutiny. OCR audit activity has increased 40% year-over-year. Yet most small clinics lack the resources, expertise, or infrastructure to maintain defensible compliance documentation.
              <br /><br />
              HIPAA Hub provides structured implementation services that transform compliance from reactive crisis management into operational infrastructure.
            </p>
            <button className="bg-cisco-blue text-white px-12 py-5 text-sm font-normal hover:bg-white hover:text-cisco-navy transition-all">
              Request Compliance Assessment
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 1: 7-DAY AUDIT READINESS SPRINT */}
      <SolutionSection 
        id="sprint"
        title="7-Day Audit Readiness Sprint"
        subtitle="Rapid implementation for organizations with existing documentation but lacking structure."
        body="Organizations often have compliance documentation scattered across multiple systems—Google Drive, email, paper files. When OCR requests documentation, retrieval takes weeks. Gaps emerge. Violations accumulate. The 7-Day Audit Readiness Sprint consolidates existing documentation, identifies gaps, and creates audit-defensible evidence packages."
        deliverables={[
          "Regulatory risk assessment",
          "9 customized HIPAA policies",
          "Security risk analysis",
          "Staff training documentation",
          "Audit export package",
          "30-day compliance support"
        ]}
        investment="$2,500–$3,500"
        timeline="7 business days"
        cta="Learn More"
        image="https://images.unsplash.com/photo-1454165833767-027ffea9e778?auto=format&fit=crop&q=80&w=800"
      />

      {/* SECTION 2: FULL COMPLIANCE IMPLEMENTATION */}
      <SolutionSection 
        id="full"
        reverse
        title="Full Compliance Implementation"
        subtitle="Comprehensive compliance framework for organizations requiring complete infrastructure build."
        body="Some organizations lack not just structure, but foundational compliance infrastructure. Policies don't exist. Risk assessments have never been conducted. Staff training is informal. Full Compliance Implementation builds compliance infrastructure from ground up—regulatory mapping, policy development, risk assessment, staff certification, and ongoing monitoring."
        deliverables={[
          "Regulatory mapping and gap analysis",
          "Complete policy framework (9+ policies)",
          "Comprehensive risk assessment",
          "Vulnerability classification",
          "Remediation roadmap",
          "Staff certification program",
          "Audit documentation package",
          "90-day compliance support"
        ]}
        investment="$5,000–$8,000"
        timeline="14–21 business days"
        cta="Learn More"
        image="https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=800"
      />

      {/* SECTION 3: ONGOING COMPLIANCE OVERSIGHT */}
      <SolutionSection 
        id="oversight"
        title="Ongoing Compliance Oversight"
        subtitle="Continuous monitoring and maintenance to sustain audit readiness."
        body="Compliance is not a one-time project. Regulations evolve. Staff changes. Systems update. Documentation becomes stale. Ongoing Compliance Oversight provides quarterly reviews, annual risk assessments, policy updates, staff refresher training, and audit readiness maintenance."
        deliverables={[
          "Quarterly compliance reviews",
          "Annual risk reassessment",
          "Policy updates and versioning",
          "Staff refresher training",
          "Regulatory update briefings",
          "Audit readiness verification",
          "Priority support"
        ]}
        investment="$299–$499 per month"
        cta="Learn More"
        image="https://images.unsplash.com/photo-1551288049-bbbda546697a?auto=format&fit=crop&q=80&w=800"
      />

      {/* SECTION 4: INCIDENT RESPONSE ADVISORY */}
      <SolutionSection 
        id="incident"
        reverse
        title="Incident Response Advisory"
        subtitle="Rapid response for breach notification, audit notices, and compliance emergencies."
        body="Breaches happen. Audits are initiated. Compliance emergencies emerge without warning. Incident Response Advisory provides immediate expert guidance on breach notification requirements, audit response protocols, evidence collection, and regulatory communication."
        deliverables={[
          "Breach notification letters (patient, HHS, media)",
          "Incident response protocol",
          "Evidence collection guidance",
          "Regulatory communication templates",
          "Audit response strategy",
          "48-hour turnaround"
        ]}
        investment="$2,500–$5,000"
        cta="Learn More"
        image="https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800"
      />

      {/* FINAL CTA SECTION */}
      <section className="bg-cisco-navy py-24 md:py-32 overflow-hidden text-center text-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-full mb-8">
            <Target size={32} className="text-cisco-blue" />
          </div>
          <h2 className="text-4xl md:text-6xl font-light mb-10">Determine Your <br /> Compliance Status.</h2>
          <p className="text-gray-400 text-lg md:text-xl font-light mb-12 leading-relaxed max-w-2xl mx-auto">
            Every organization's compliance posture is different. Some need rapid audit readiness. Others require comprehensive infrastructure build. Some need ongoing maintenance.
            <br /><br />
            Our compliance assessment identifies your current state, regulatory exposure, and recommended implementation path.
          </p>
          <button className="bg-cisco-blue text-white px-12 py-5 text-sm font-normal hover:bg-white hover:text-cisco-navy transition-all">
            Request Assessment
          </button>
        </div>
      </section>

      {/* Summary Footer for Solutions */}
      <section className="bg-white py-24 border-t">
        <div className="max-w-7xl mx-auto px-4 md:px-12 grid md:grid-cols-3 gap-16">
          <div className="space-y-4">
            <ShieldAlert className="text-cisco-blue mb-2" size={32} />
            <h4 className="text-xl font-light text-cisco-navy">Audit Defensibility</h4>
            <p className="text-gray-500 text-sm font-light leading-relaxed">
              We focus on building documented evidence trails that meet the specific reporting standards used by federal OCR auditors.
            </p>
          </div>
          <div className="space-y-4">
            <RefreshCw className="text-cisco-blue mb-2" size={32} />
            <h4 className="text-xl font-light text-cisco-navy">Clinical Continuity</h4>
            <p className="text-gray-500 text-sm font-light leading-relaxed">
              Our implementation framework is designed to wrap around your existing clinical workflows, ensuring zero disruption to patient care.
            </p>
          </div>
          <div className="space-y-4">
            <Layers className="text-cisco-blue mb-2" size={32} />
            <h4 className="text-xl font-light text-cisco-navy">Expert Advisory</h4>
            <p className="text-gray-500 text-sm font-light leading-relaxed">
              All engagements are led by consultants with institutional regulatory backgrounds, providing expert guidance throughout the process.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SolutionsPage;
