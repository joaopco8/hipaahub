import React from 'react';
import { 
  ArrowRight, 
  Map, 
  Search, 
  AlertTriangle, 
  Wrench, 
  FileCheck, 
  GraduationCap, 
  Eye, 
  CheckCircle2,
  Clock,
  ShieldCheck,
  ChevronRight,
  Target,
  Layers
} from 'lucide-react';

const PhaseSection: React.FC<{
  id?: string;
  number: string;
  title: string;
  subtitle: string;
  body: string;
  deliverables: string[];
  timeline: string;
  icon: React.ReactNode;
  reverse?: boolean;
}> = ({ id, number, title, subtitle, body, deliverables, timeline, icon, reverse }) => (
  <div id={id} className={`py-24 border-b scroll-mt-32 ${reverse ? 'bg-gray-50' : 'bg-white'}`}>
    <div className="max-w-7xl mx-auto px-4 md:px-12">
      <div className={`grid lg:grid-cols-2 gap-20 items-start ${reverse ? 'lg:flex-row-reverse' : ''}`}>
        <div className="animate-reveal">
          <div className="flex items-center gap-6 mb-10">
            <div className="w-14 h-14 bg-cisco-navy text-white flex items-center justify-center font-light text-2xl shadow-xl">
              {number}
            </div>
            <div className="text-cisco-blue opacity-80 group-hover:opacity-100 transition-opacity">
              {icon}
            </div>
          </div>
          <h2 className="text-3xl md:text-5xl font-light text-cisco-navy mb-6 leading-tight">
            {title}
          </h2>
          <h3 className="text-xl font-normal text-cisco-blue mb-8">
            {subtitle}
          </h3>
          <p className="text-gray-600 text-lg font-light leading-relaxed mb-10 border-l-2 border-gray-100 pl-8">
            {body}
          </p>
          
          <div className="bg-white border border-gray-100 p-10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <Layers size={64} />
            </div>
            <h4 className="text-[10px] font-bold text-gray-400 mb-8 border-b pb-4 uppercase tracking-widest">Phase Deliverables</h4>
            <ul className="grid sm:grid-cols-1 gap-y-4 mb-10">
              {deliverables.map((item, i) => (
                <li key={i} className="flex items-start text-sm text-gray-500 font-light leading-snug">
                  <CheckCircle2 size={16} className="text-cisco-blue mr-4 mt-0.5 flex-shrink-0 opacity-40" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between pt-8 border-t border-gray-50">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Stage Timeline</span>
              <div className="flex items-center text-cisco-navy font-bold text-xs uppercase tracking-widest">
                <Clock size={16} className="mr-3 text-cisco-blue" /> {timeline}
              </div>
            </div>
          </div>
        </div>
        
        <div className="hidden lg:block relative mt-16 group">
          <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden shadow-2xl border border-gray-100">
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03]">
               <div className="text-[250px] font-black group-hover:scale-110 transition-transform duration-1000">{number}</div>
            </div>
            <div className="absolute inset-0 border-[40px] border-white/40 m-12"></div>
            <div className="p-20 h-full flex flex-col justify-end">
                <div className="w-16 h-[3px] bg-cisco-blue mb-8"></div>
                <p className="text-cisco-navy text-sm font-bold uppercase tracking-widest">Institutional Methodology Protocol</p>
                <p className="text-gray-400 text-[10px] mt-2 font-bold uppercase tracking-widest">REF_ID: MDTH_{number}</p>
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-cisco-blue/5 -z-10 group-hover:translate-x-2 transition-transform"></div>
        </div>
      </div>
    </div>
  </div>
);

const MethodologyPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 120;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const navItems = [
    { label: 'Phases 1-3', id: 'p1' },
    { label: 'Phases 4-6', id: 'p4' },
    { label: 'Oversight', id: 'p7' },
    { label: 'Timeline', id: 'timeline' },
  ];

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-white border-b py-3 px-4 md:px-12 sticky top-[73px] z-[90]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[10px] text-gray-400">
            <button onClick={onBack} className="hover:text-cisco-blue transition-colors">Healthcare Administration</button>
            <span>/</span>
            <span className="text-gray-900 font-bold uppercase tracking-widest">Institutional Methodology</span>
          </div>
          <div className="hidden md:flex space-x-10 text-[11px] font-bold text-gray-400">
            {navItems.map((item) => (
              <button 
                key={item.id}
                onClick={() => scrollToSection(item.id)} 
                className="hover:text-cisco-blue transition-colors uppercase tracking-[0.15em]"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="relative h-[650px] w-full bg-cisco-navy overflow-hidden flex items-center">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1454165833767-027ffea9e778?auto=format&fit=crop&q=80&w=2000" 
            alt="Methodology planning" 
            className="w-full h-full object-cover opacity-20 grayscale brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-cisco-navy via-cisco-navy/80 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-12 text-white">
          <div className="max-w-4xl">
            <h4 className="text-xs font-bold text-cisco-blue mb-8 uppercase tracking-widest">Proprietary Pipeline</h4>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-light leading-tight mb-10">
              The Framework for <br /> Audit Defense.
            </h1>
            <p className="text-gray-300 text-lg md:text-2xl font-light leading-relaxed max-w-2xl border-l-2 border-cisco-blue pl-8 mb-12">
              Our 7-phase methodology is a structured, repeatable process engineered to 
              transform fragmented operations into integrated institutional infrastructure.
            </p>
            <button className="bg-cisco-blue text-white px-12 py-5 text-sm font-bold hover:bg-white hover:text-cisco-navy transition-all shadow-2xl shadow-cisco-blue/20">
              Request Implementation Roadmap
            </button>
          </div>
        </div>
      </section>

      <PhaseSection 
        id="p1"
        number="01"
        title="Regulatory Mapping"
        subtitle="Identifying institutional obligations."
        body="Compliance begins with high-fidelity mapping. We inventory all applicable federal regulations, state mandates, and specialized industry requirements unique to your clinical specialty."
        deliverables={[
          "Regulatory obligation inventory",
          "Requirement mapping by clinical workflow",
          "Institutional data tiering audit"
        ]}
        timeline="2–3 business days"
        icon={<Map size={32} strokeWidth={1} />}
      />

      <PhaseSection 
        number="02"
        reverse
        title="Risk Identification"
        subtitle="Quantifying organizational exposure."
        body="Using our Risk Assessment Engine, we evaluate your organization against 164 implementation specifications to identify critical documentation gaps and technical vulnerabilities."
        deliverables={[
          "NIST-aligned risk assessment report",
          "Gap analysis visualization",
          "Vulnerability classification matrix"
        ]}
        timeline="3–5 business days"
        icon={<Search size={32} strokeWidth={1} />}
      />

      <PhaseSection 
        number="03"
        title="Vulnerability Tiering"
        subtitle="Prioritizing remediation efforts."
        body="Not all gaps represent equal risk. We classify vulnerabilities based on regulatory exposure, audit likelihood, and implementation complexity to sequence remediation effectively."
        deliverables={[
          "Prioritized remediation action plan",
          "Critical vulnerability brief",
          "Resource allocation sequencing"
        ]}
        timeline="2–3 business days"
        icon={<AlertTriangle size={32} strokeWidth={1} />}
      />

      <PhaseSection 
        id="p4"
        number="04"
        reverse
        title="Remediation Framework"
        subtitle="Architecting clinical safeguards."
        body="The framework phase builds specific, actionable remediation protocols including customized policy development and technical safeguard mapping to your clinical EHR."
        deliverables={[
          "9 customized institutional policies",
          "Technical safeguard implementation guide",
          "Milestone tracking dashboard"
        ]}
        timeline="5–7 business days"
        icon={<Wrench size={32} strokeWidth={1} />}
      />

      <PhaseSection 
        number="05"
        title="Evidence Package"
        subtitle="Constructing the audit defense file."
        body="This phase compiles all policies, assessments, and verified safeguards into a centralized repository aligned with federal OCR reporting expectations for desk audits."
        deliverables={[
          "Centralized documentation repository",
          "One-click audit export package",
          "Timestamped evidence vault"
        ]}
        timeline="7–10 business days"
        icon={<FileCheck size={32} strokeWidth={1} />}
      />

      <PhaseSection 
        number="06"
        reverse
        title="Institutional Certification"
        subtitle="Staff competency & acknowledgment."
        body="Compliance is sustained by personnel. We implement staff training modules and formal acknowledgment tracking to certify institutional readiness."
        deliverables={[
          "Staff certification certificates",
          "Training participation logs",
          "Competency validation records"
        ]}
        timeline="2–3 business days"
        icon={<GraduationCap size={32} strokeWidth={1} />}
      />

      <PhaseSection 
        id="p7"
        number="07"
        title="Ongoing Oversight"
        subtitle="Continuous monitoring & maintenance."
        body="Methodology concludes with the transition to continuous oversight—quarterly reviews and annual reassessments to maintain absolute audit readiness as regulations evolve."
        deliverables={[
          "Quarterly compliance review schedule",
          "Annual reassessment protocol",
          "Regulatory monitoring alerts"
        ]}
        timeline="Continuous"
        icon={<Eye size={32} strokeWidth={1} />}
      />

      <section id="timeline" className="py-32 bg-gray-50 border-b overflow-hidden scroll-mt-32">
        <div className="max-w-7xl mx-auto px-4 md:px-12 text-center">
          <div className="mb-24">
            <h2 className="text-3xl md:text-5xl font-light text-cisco-navy mb-6 uppercase tracking-tight">Implementation Pipeline.</h2>
            <p className="text-gray-500 font-light max-w-2xl mx-auto text-lg leading-relaxed">
              Visualizing the transition from operational fragmentation to <br className="hidden md:block" /> integrated institutional infrastructure.
            </p>
          </div>

          <div className="relative">
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gray-200 -translate-y-1/2 hidden lg:block"></div>
            
            <div className="grid lg:grid-cols-7 gap-12 relative z-10">
              {[
                { n: "01", t: "Mapping", d: "2-3 Days" },
                { n: "02", t: "Risk ID", d: "3-5 Days" },
                { n: "03", t: "Tiering", d: "2-3 Days" },
                { n: "04", t: "Remediation", d: "5-7 Days" },
                { n: "05", t: "Evidence", d: "7-10 Days" },
                { n: "06", t: "Certification", d: "2-3 Days" },
                { n: "07", t: "Oversight", d: "Continuous" },
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center group">
                  <div className="w-16 h-16 bg-white border border-gray-200 flex items-center justify-center mb-8 shadow-sm group-hover:border-cisco-blue group-hover:shadow-xl transition-all duration-500">
                    <span className="text-sm font-bold text-gray-400 group-hover:text-cisco-blue transition-colors">{step.n}</span>
                  </div>
                  <h4 className="text-xs font-bold text-cisco-navy mb-2 uppercase tracking-widest">{step.t}</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{step.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-cisco-navy py-24 md:py-32 text-center text-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center justify-center p-5 bg-white/10 rounded-full mb-10">
            <ShieldCheck size={40} className="text-cisco-blue" />
          </div>
          <h2 className="text-4xl md:text-6xl font-light mb-10 leading-tight">Map Your Path to <br /> Compliance.</h2>
          <p className="text-gray-400 text-lg md:text-xl font-light mb-12 leading-relaxed max-w-2xl mx-auto">
            Every implementation follows our seven-phase institutional methodology, 
            customized to your specific clinical footprint and regulatory exposure.
          </p>
          <button className="bg-cisco-blue text-white px-12 py-5 text-sm font-bold hover:bg-white hover:text-cisco-navy transition-all group flex items-center mx-auto">
            Request Assessment Call <ArrowRight size={18} className="ml-3 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default MethodologyPage;