
import React from 'react';
import { 
  ChevronRight, 
  ShieldCheck, 
  Stethoscope, 
  Activity, 
  Brain, 
  Lock, 
  ArrowRight, 
  Target,
  FileWarning,
  AlertCircle,
  Clock,
  CheckCircle2
} from 'lucide-react';

const IndustrySection: React.FC<{
  id?: string;
  title: string;
  subtitle: string;
  body: string;
  risks: string[];
  vulnerabilities: string[];
  approach: string;
  investment: string;
  timeline: string;
  cta: string;
  image: string;
  icon: React.ReactNode;
  reverse?: boolean;
}> = ({ id, title, subtitle, body, risks, vulnerabilities, approach, investment, timeline, cta, image, icon, reverse }) => (
  <section id={id} className={`py-24 border-b scroll-mt-32 ${reverse ? 'bg-gray-50' : 'bg-white'}`}>
    <div className="max-w-7xl mx-auto px-4 md:px-12">
      <div className={`grid lg:grid-cols-2 gap-20 items-start ${reverse ? 'lg:flex-row-reverse' : ''}`}>
        <div className={reverse ? 'lg:order-2' : 'lg:order-1'}>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-cisco-blue text-[10px] font-bold mb-8">
            {icon} Segment Solution
          </div>
          <h2 className="text-3xl md:text-5xl font-thin text-cisco-navy mb-4 leading-tight">
            {title}
          </h2>
          <h3 className="text-lg md:text-xl font-thin text-cisco-blue mb-8">
            {subtitle}
          </h3>
          <p className="text-gray-600 text-lg font-thin leading-relaxed mb-10">
            {body}
          </p>
          
          <div className="grid md:grid-cols-2 gap-10 mb-10">
            <div>
              <h4 className="text-[10px] font-bold text-gray-400 mb-4 border-b pb-2">Specific Risks</h4>
              <ul className="space-y-3">
                {risks.map((item, i) => (
                  <li key={i} className="flex items-start text-sm text-gray-500 font-thin leading-snug">
                    <span className="w-1.5 h-1.5 bg-cisco-blue rounded-full mt-1.5 mr-3 flex-shrink-0 opacity-40"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-gray-400 mb-4 border-b pb-2">Common Vulnerabilities</h4>
              <ul className="space-y-3">
                {vulnerabilities.map((item, i) => (
                  <li key={i} className="flex items-start text-sm text-gray-500 font-thin leading-snug">
                    <AlertCircle size={14} className="text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white/50 p-8 border border-gray-100 shadow-sm mb-10">
            <h4 className="text-[10px] font-bold text-cisco-blue mb-4">Our Approach</h4>
            <p className="text-gray-600 text-sm font-thin leading-relaxed mb-8">
              {approach}
            </p>
            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-gray-50">
               <div>
                  <h4 className="text-[10px] font-bold text-gray-400 mb-1">Investment</h4>
                  <p className="text-base font-thin text-cisco-navy">{investment}</p>
               </div>
               <div>
                  <h4 className="text-[10px] font-bold text-gray-400 mb-1">Timeline</h4>
                  <p className="text-base font-thin text-cisco-navy">{timeline}</p>
               </div>
            </div>
          </div>
          
          <button className="bg-cisco-navy text-white px-10 py-4 text-xs font-thin hover:bg-cisco-blue transition-all group flex items-center">
            {cta} <ArrowRight size={16} className="ml-3 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        
        <div className={`${reverse ? 'lg:order-1' : 'lg:order-2'} relative mt-12 lg:mt-0`}>
          <div className="aspect-[4/5] bg-gray-200 overflow-hidden shadow-2xl">
            <img src={image} alt={title} className="w-full h-full object-cover grayscale brightness-90 hover:grayscale-0 transition-all duration-1000" />
          </div>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-cisco-blue/5 -z-10"></div>
        </div>
      </div>
    </div>
  </section>
);

const IndustriesPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 120; // Accounts for sticky navbar and breadcrumbs
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

  const industryNavItems = [
    { label: 'Private Medical', id: 'medical' },
    { label: 'Dental', id: 'dental' },
    { label: 'Behavioral Health', id: 'behavioral' },
    { label: 'Specialty Care', id: 'specialty' },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Sub-Nav / Breadcrumbs - Made sticky for functionality */}
      <div className="bg-white border-b py-3 px-4 md:px-12 sticky top-[73px] z-[90]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[10px] text-gray-400">
            <button onClick={onBack} className="hover:text-cisco-blue transition-colors">Healthcare Administration</button>
            <span className="text-gray-200">/</span>
            <span className="text-cisco-navy font-semibold">Industry-Specific Solutions</span>
          </div>
          <div className="hidden md:flex space-x-8 text-[11px] font-thin text-gray-500">
            {industryNavItems.map((item) => (
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
            <p className="text-xs font-thin text-blue-400 mb-6">Sector Specialization</p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-thin text-cisco-navy leading-tight mb-10">
              Industry-Specific <br /> Compliance Solutions.
            </h1>
            <h3 className="text-xl md:text-2xl font-thin text-gray-400 mb-10 border-l-2 border-cisco-blue pl-8">
              Compliance frameworks tailored to <br className="hidden md:block" /> specific healthcare segments.
            </h3>
            <p className="text-gray-500 text-lg md:text-xl font-thin leading-relaxed max-w-2xl mb-12">
              Compliance requirements vary by healthcare segment. A dental clinic faces different regulatory requirements than a behavioral health practice. A specialty care clinic has different documentation needs than a primary care practice.
              <br /><br />
              HIPAA Hub provides industry-specific compliance solutions that address segment-specific risks, vulnerabilities, and regulatory requirements.
            </p>
            <button className="bg-cisco-navy text-white px-12 py-5 text-sm font-thin hover:bg-cisco-blue transition-all">
              Request Industry Assessment
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 1: PRIVATE MEDICAL PRACTICES */}
      <IndustrySection 
        id="medical"
        title="Private Medical Practices"
        subtitle="Compliance solutions for independent medical practices."
        body="Private medical practices face specific compliance challenges ranging from multi-system data fragmentation to physician burnout affecting documentation accuracy. Our solutions consolidate these silos into a unified audit trail."
        risks={[
          "Patient data across multiple systems (EHR, email, paper)",
          "Limited compliance resources",
          "Staff turnover and training gaps",
          "Telehealth and remote access documentation",
          "Medication management and controlled substance documentation"
        ]}
        vulnerabilities={[
          "Scattered documentation",
          "Incomplete risk assessments",
          "Informal staff training",
          "Inadequate access controls",
          "Missing incident response protocols"
        ]}
        approach="We implement a centralized documentation framework, conduct comprehensive risk assessments, and establish structured staff training programs with robust access control monitoring."
        investment="$3,500–$5,000"
        timeline="7–14 business days"
        cta="Learn More"
        image="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800"
        icon={<Stethoscope size={18} />}
      />

      {/* SECTION 2: DENTAL CLINICS */}
      <IndustrySection 
        id="dental"
        reverse
        title="Dental Clinics"
        subtitle="Compliance solutions for dental practices."
        body="Dental clinics manage a high volume of imaging data and high patient throughput. Compliance must address the unique storage requirements for X-rays and scans alongside occupational safety protocols."
        risks={[
          "Patient imaging data (X-rays, scans)",
          "Anesthesia and medication documentation",
          "Infection control and sterilization records",
          "Radiography safety documentation",
          "Occupational safety compliance"
        ]}
        vulnerabilities={[
          "Imaging data storage and security",
          "Medication management documentation",
          "Staff training on infection control",
          "Access control for sensitive areas",
          "Incident response for data breaches"
        ]}
        approach="Implementation focuses on an imaging data security framework, infection control compliance programs, and staff-wide certification on specialized dental safety standards."
        investment="$3,000–$4,500"
        timeline="7–14 business days"
        cta="Learn More"
        image="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=800"
        icon={<Activity size={18} />}
      />

      {/* SECTION 3: BEHAVIORAL HEALTH */}
      <IndustrySection 
        id="behavioral"
        title="Behavioral Health Practices"
        subtitle="Compliance solutions for mental health and substance abuse treatment."
        body="Heightened privacy sensitivity and specialized 42 CFR Part 2 requirements make behavioral health compliance uniquely complex. We build layers of privacy that exceed standard HIPAA requirements."
        risks={[
          "Mental health records (heightened privacy sensitivity)",
          "Substance abuse treatment records (42 CFR Part 2 requirements)",
          "Crisis intervention documentation",
          "Suicide risk assessment documentation",
          "Controlled substance management"
        ]}
        vulnerabilities={[
          "42 CFR Part 2 compliance gaps",
          "Inadequate mental health record security",
          "Crisis documentation inconsistencies",
          "Staff training on sensitive data handling",
          "Incident response for sensitive breaches"
        ]}
        approach="Deployment of a specialized 42 CFR Part 2 framework, mental health record security protocols, and crisis documentation standards aligned with the most stringent federal privacy tiers."
        investment="$4,000–$6,000"
        timeline="10–21 business days"
        cta="Learn More"
        image="https://images.unsplash.com/photo-1527137342181-19aab11a8ee1?auto=format&fit=crop&q=80&w=800"
        icon={<Brain size={18} />}
      />

      {/* SECTION 4: SPECIALTY CARE */}
      <IndustrySection 
        id="specialty"
        reverse
        title="Specialty Care Clinics"
        subtitle="Compliance solutions for specialty healthcare practices."
        body="Specialty care requires coordination across labs, diagnostic centers, and referring providers. We secure the entire data coordination pipeline to ensure multi-provider documentation is auditable and complete."
        risks={[
          "Complex patient data (imaging, lab results, specialist records)",
          "Multi-provider coordination documentation",
          "Referral and authorization tracking",
          "Diagnostic testing documentation",
          "Treatment protocol documentation"
        ]}
        vulnerabilities={[
          "Fragmented documentation across providers",
          "Incomplete referral tracking",
          "Authorization documentation gaps",
          "Test result management inconsistencies",
          "Multi-provider coordination documentation"
        ]}
        approach="Construction of a multi-provider documentation framework, establishing referral and authorization tracking protocols, and coordination documentation standards for specialist networks."
        investment="$4,500–$7,000"
        timeline="10–21 business days"
        cta="Learn More"
        image="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800"
        icon={<Lock size={18} />}
      />

      {/* FINAL CTA SECTION */}
      <section className="bg-cisco-navy py-24 md:py-32 overflow-hidden text-center text-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center justify-center p-4 bg-white/10 rounded-full mb-8">
            <Target size={32} className="text-cisco-blue" />
          </div>
          <h2 className="text-4xl md:text-6xl font-thin mb-10">Find Your <br /> Industry Solution.</h2>
          <p className="text-gray-400 text-lg md:text-xl font-thin mb-12 leading-relaxed max-w-2xl mx-auto">
            Compliance requirements are specific to your healthcare segment. Our industry-specific solutions address your segment's unique risks, vulnerabilities, and regulatory requirements.
            <br /><br />
            Identify your healthcare segment and explore compliance solutions tailored to your practice.
          </p>
          <button className="bg-cisco-blue text-white px-12 py-5 text-sm font-thin hover:bg-white hover:text-cisco-navy transition-all group flex items-center mx-auto">
            Request Industry Assessment <ArrowRight size={18} className="ml-3 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Summary Footer */}
      <section className="bg-white py-24 border-t">
        <div className="max-w-7xl mx-auto px-4 md:px-12 grid md:grid-cols-3 gap-16">
          <div className="space-y-4">
            <ShieldCheck className="text-cisco-blue mb-2" size={32} />
            <h4 className="text-xl font-thin text-cisco-navy">Institutional Depth</h4>
            <p className="text-gray-500 text-sm font-thin leading-relaxed">
              Every vertical framework is developed with direct input from consultants specializing in that clinical field's regulatory nuances.
            </p>
          </div>
          <div className="space-y-4">
            <Clock className="text-cisco-blue mb-2" size={32} />
            <h4 className="text-xl font-thin text-cisco-navy">Rapid Verticalization</h4>
            <p className="text-gray-500 text-sm font-thin leading-relaxed">
              We move clinics from high-risk fragmentation to segmented clinical security within an institutional 14-day window.
            </p>
          </div>
          <div className="space-y-4">
            <CheckCircle2 className="text-cisco-blue mb-2" size={32} />
            <h4 className="text-xl font-thin text-cisco-navy">Audit Defensibility</h4>
            <p className="text-gray-500 text-sm font-thin leading-relaxed">
              Frameworks are mapped directly to the specific NIST and OCR protocols used to audit each respective healthcare segment.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default IndustriesPage;
