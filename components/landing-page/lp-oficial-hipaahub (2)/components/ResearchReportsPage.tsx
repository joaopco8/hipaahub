
import React from 'react';
import { 
  FileText, 
  Download, 
  ChevronRight, 
  BookOpen, 
  Shield, 
  BarChart3, 
  ArrowRight,
  Search,
  ExternalLink,
  Users,
  Clock,
  Layout,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';

const ReportFeature: React.FC<{
  id?: string;
  title: string;
  subtitle: string;
  body: string;
  listLabel: string;
  listItems: string[];
  format: string;
  audience?: string;
  cta: string;
  image: string;
  reverse?: boolean;
}> = ({ id, title, subtitle, body, listLabel, listItems, format, audience, cta, image, reverse }) => (
  <section id={id} className={`py-24 border-b scroll-mt-32 ${reverse ? 'bg-gray-50' : 'bg-white'}`}>
    <div className="max-w-7xl mx-auto px-4 md:px-12">
      <div className={`grid lg:grid-cols-2 gap-20 items-center ${reverse ? 'lg:flex-row-reverse' : ''}`}>
        <div className={reverse ? 'lg:order-2' : 'lg:order-1'}>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-cisco-blue text-[10px] font-bold mb-8">
            <FileText size={14} /> Intelligence Publication
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
          
          <div className="mb-12">
            <h4 className="text-[10px] font-bold text-gray-400 mb-4 border-b pb-2">{listLabel}</h4>
            <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
              {listItems.map((item, i) => (
                <li key={i} className="flex items-start text-sm text-gray-500 font-light leading-snug">
                  <span className="w-1.5 h-[1px] bg-cisco-blue mt-2.5 mr-3 flex-shrink-0 opacity-50"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-8 mb-12 py-6 border-y border-gray-100">
            <div>
              <h4 className="text-[10px] font-bold text-gray-400 mb-1">Format</h4>
              <p className="text-sm font-normal text-cisco-navy">{format}</p>
            </div>
            {audience && (
              <div>
                <h4 className="text-[10px] font-bold text-gray-400 mb-1">Target Audience</h4>
                <p className="text-sm font-normal text-cisco-navy">{audience}</p>
              </div>
            )}
          </div>
          
          <button className="bg-cisco-navy text-white px-10 py-4 text-xs font-normal hover:bg-cisco-blue transition-all group flex items-center">
            <Download size={16} className="mr-3" /> {cta}
          </button>
        </div>
        
        <div className={`${reverse ? 'lg:order-1' : 'lg:order-2'} relative`}>
          <div className="aspect-[3/4] bg-gray-200 overflow-hidden shadow-2xl border border-gray-100">
            <img src={image} alt={title} className="w-full h-full object-cover grayscale brightness-95" />
            <div className="absolute inset-0 bg-gradient-to-t from-cisco-navy/20 to-transparent"></div>
          </div>
          <div className="absolute -top-6 -left-6 w-32 h-32 bg-cisco-blue/5 -z-10"></div>
        </div>
      </div>
    </div>
  </section>
);

const ResearchReportsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 120; // Correct offset for sticky navs
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

  const researchNavItems = [
    { label: 'Exposure Report', id: 'exposure' },
    { label: 'Whitepapers', id: 'audit' },
    { label: 'Briefings', id: 'briefings' },
    { label: 'Analysis', id: 'articles' },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Sub-Nav / Breadcrumbs - Made Sticky for better functionality */}
      <div className="bg-white border-b py-3 px-4 md:px-12 sticky top-[73px] z-[90]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[10px] text-gray-400">
            <button onClick={onBack} className="hover:text-cisco-blue transition-colors">Healthcare Administration</button>
            <span className="text-gray-200">/</span>
            <span className="text-cisco-navy font-semibold">Research & Institutional Reports</span>
          </div>
          <div className="hidden md:flex space-x-8 text-[11px] font-normal text-gray-500">
            {researchNavItems.map((item) => (
              <button 
                key={item.id}
                onClick={() => scrollToSection(item.id)} 
                className="hover:text-cisco-blue transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-white pt-24 pb-16 md:pt-32 md:pb-24 border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="max-w-4xl">
            <p className="text-xs font-normal text-blue-400 mb-6">Intelligence Division</p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-light text-cisco-navy leading-tight mb-8">
              Research & <br /> Institutional Reports.
            </h1>
            <h3 className="text-xl md:text-2xl font-light text-gray-400 mb-10 border-l-2 border-cisco-blue pl-8">
              Regulatory analysis, compliance research, and industry briefings.
            </h3>
            <p className="text-gray-500 text-lg md:text-xl font-light leading-relaxed max-w-2xl">
              HIPAA Hub publishes original research on regulatory trends, compliance challenges, and industry developments. Our reports are designed for healthcare leadership, compliance professionals, and organizational decision-makers.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 1: 2026 REGULATORY EXPOSURE REPORT */}
      <ReportFeature 
        id="exposure"
        title="2026 Regulatory Exposure Report"
        subtitle="Comprehensive analysis of regulatory trends, audit activity, and compliance exposure for small healthcare organizations."
        body="OCR audit activity increased 40% in 2025. Regulatory focus has shifted toward documentation and evidence. Small organizations face disproportionate risk due to limited compliance resources."
        listLabel="This report analyzes:"
        listItems={[
          "OCR audit trends and patterns",
          "Regulatory focus areas",
          "Common violation categories",
          "Compliance exposure by organization size",
          "Risk mitigation strategies"
        ]}
        format="PDF Report (28 pages)"
        audience="Healthcare leadership, compliance professionals, practice managers"
        cta="Download Report"
        image="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800"
      />

      {/* SECTION 2: HIPAA AUDIT PREPAREDNESS WHITEPAPER */}
      <ReportFeature 
        id="audit"
        reverse
        title="HIPAA Audit Preparedness Whitepaper"
        subtitle="Structured framework for preparing healthcare organizations for regulatory audit."
        body="Audit preparation requires specific documentation, organization, and evidence. This whitepaper provides a structured framework for audit preparation—what OCR expects, how to organize documentation, and how to respond to audit requests."
        listLabel="Topics covered:"
        listItems={[
          "OCR audit process and timeline",
          "Documentation requirements",
          "Evidence organization standards",
          "Audit response protocols",
          "Common audit findings",
          "Remediation strategies"
        ]}
        format="PDF Whitepaper (16 pages)"
        audience="Compliance professionals, practice managers, organizational leadership"
        cta="Download Whitepaper"
        image="https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=800"
      />

      {/* SECTION 3: TECHNICAL BRIEFINGS */}
      <section id="briefings" className="py-24 bg-white border-b scroll-mt-32">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="grid lg:grid-cols-3 gap-24 items-start">
            <div className="lg:col-span-1">
              <div className="inline-flex items-center justify-center p-3 bg-blue-50 text-cisco-blue mb-8">
                <Shield size={24} />
              </div>
              <h2 className="text-3xl font-light text-cisco-navy mb-6">Technical Briefings.</h2>
              <h3 className="text-lg font-normal text-cisco-blue mb-8">
                In-depth analysis of specific compliance topics.
              </h3>
              <p className="text-gray-500 font-light leading-relaxed mb-10">
                Our technical briefings provide detailed analysis of specific compliance challenges faced by clinical teams and administrators.
              </p>
              <button className="text-cisco-navy flex items-center group text-xs font-bold border-b border-gray-100 pb-2">
                View All Briefings <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="lg:col-span-2 grid md:grid-cols-2 gap-8">
              {[
                { title: "HIPAA Security Rule: Technical Safeguards for Small Clinics", id: "01" },
                { title: "Breach Notification Requirements: State-by-State Analysis", id: "02" },
                { title: "Risk Assessment Methodology for Healthcare Organizations", id: "03" },
                { title: "Documentation Standards: What OCR Expects", id: "04" }
              ].map((brief, i) => (
                <div key={i} className="bg-gray-50 p-8 border border-gray-100 hover:border-cisco-blue transition-colors group cursor-pointer">
                  <div className="text-[10px] font-bold text-gray-400 mb-6 border-b pb-2 flex justify-between">
                    <span>Publication {brief.id}</span>
                    <span className="text-cisco-blue">PDF</span>
                  </div>
                  <h4 className="text-xl font-light text-cisco-navy mb-8 leading-tight group-hover:text-cisco-blue transition-colors">
                    {brief.title}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] font-normal mt-auto">
                    <span className="text-gray-400">8–12 pages</span>
                    <Download size={16} className="text-gray-300 group-hover:text-cisco-blue transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: ARTICLES & ANALYSIS */}
      <section id="articles" className="py-24 bg-gray-50 scroll-mt-32">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-light text-cisco-navy mb-6">Articles & Regulatory Analysis.</h2>
            <h3 className="text-lg md:text-xl font-normal text-cisco-blue mb-8">
              Regular analysis of compliance developments, regulatory changes, and industry trends.
            </h3>
            <p className="text-gray-500 font-light max-w-2xl mx-auto">
              HIPAA Hub publishes regular articles on regulatory updates, best practices, and emerging challenges in the clinical security landscape.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {[
              "Regulatory updates and changes",
              "Compliance best practices",
              "Industry case studies",
              "Emerging compliance challenges"
            ].map((topic, i) => (
              <div key={i} className="bg-white p-8 border border-gray-100 shadow-sm flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-cisco-blue mb-6">
                  {i === 0 ? <RefreshCw size={20} /> : i === 1 ? <CheckCircle2 size={20} /> : i === 2 ? <Layout size={20} /> : <AlertCircle size={20} />}
                </div>
                <h4 className="text-sm font-bold text-cisco-navy mb-4 leading-tight">{topic}</h4>
              </div>
            ))}
          </div>

          <div className="max-w-4xl mx-auto">
            <h4 className="text-[10px] font-bold text-gray-400 mb-8 border-b pb-2">Recent Analysis</h4>
            <div className="space-y-4">
              {[
                "OCR Enforcement Trends: What Small Clinics Need to Know",
                "Ransomware and HIPAA: Breach Notification Requirements",
                "Staff Training: Documentation Standards for Audit Defense",
                "Risk Assessment: Methodology and Documentation"
              ].map((article, i) => (
                <div key={i} className="bg-white p-6 border border-gray-100 flex items-center justify-between group hover:bg-white hover:shadow-lg transition-all cursor-pointer">
                  <h5 className="text-lg font-light text-cisco-navy group-hover:text-cisco-blue transition-colors">{article}</h5>
                  <ChevronRight size={18} className="text-gray-300 group-hover:text-cisco-blue group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <button className="bg-cisco-navy text-white px-10 py-4 text-xs font-normal hover:bg-cisco-blue transition-all">
                View All Articles
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="bg-cisco-navy py-24 md:py-32 overflow-hidden text-center text-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center justify-center p-4 bg-white/10 rounded-full mb-8">
            <Mail size={32} className="text-cisco-blue" />
          </div>
          <h2 className="text-4xl md:text-6xl font-light mb-10 leading-tight">Stay Informed on <br /> Regulatory Developments.</h2>
          <p className="text-gray-400 text-lg md:text-xl font-light mb-12 leading-relaxed max-w-2xl mx-auto">
            Regulatory landscape evolves continuously. HIPAA Hub publishes original research to keep healthcare organizations informed on compliance trends, regulatory changes, and industry developments.
            <br /><br />
            Subscribe to receive regulatory updates and research publications.
          </p>
          <div className="flex flex-col sm:flex-row max-w-lg mx-auto gap-4">
            <input 
              type="email" 
              placeholder="Institutional Email Address" 
              className="flex-grow bg-white/5 border border-white/10 px-6 py-4 text-sm focus:outline-none focus:border-cisco-blue transition-colors text-white"
            />
            <button className="bg-cisco-blue text-white px-8 py-4 text-xs font-semibold hover:bg-white hover:text-cisco-navy transition-all whitespace-nowrap">
              Subscribe to Updates
            </button>
          </div>
        </div>
      </section>

      {/* Summary Footer */}
      <section className="bg-white py-24 border-t">
        <div className="max-w-7xl mx-auto px-4 md:px-12 grid md:grid-cols-3 gap-16">
          <div className="space-y-4">
            <Users className="text-cisco-blue mb-2" size={32} />
            <h4 className="text-xl font-light text-cisco-navy">Institutional Access</h4>
            <p className="text-gray-500 text-sm font-light leading-relaxed">
              Reports are curated specifically for medical board reviews and administrative decision support.
            </p>
          </div>
          <div className="space-y-4">
            <BarChart3 className="text-cisco-blue mb-2" size={32} />
            <h4 className="text-xl font-light text-cisco-navy">Data Integrity</h4>
            <p className="text-gray-500 text-sm font-light leading-relaxed">
              All analysis is benchmarked against current HHS/OCR public settlement data and federal audit protocols.
            </p>
          </div>
          <div className="space-y-4">
            <Clock className="text-cisco-blue mb-2" size={32} />
            <h4 className="text-xl font-light text-cisco-navy">Rapid Briefings</h4>
            <p className="text-gray-500 text-sm font-light leading-relaxed">
              Designed for high-impact clinical consumption, providing essential summaries for busy healthcare executives.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

// Helper Icons
const Mail = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const AlertCircle = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" />
  </svg>
);

export default ResearchReportsPage;
