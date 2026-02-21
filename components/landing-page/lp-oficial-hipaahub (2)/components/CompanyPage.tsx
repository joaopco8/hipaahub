import React from 'react';
import { 
  Building2, 
  Users2, 
  Scale, 
  Mail, 
  ChevronRight, 
  Linkedin, 
  ShieldCheck, 
  Globe, 
  ArrowRight,
  Target,
  Eye,
  Briefcase,
  Phone,
  Clock,
  MapPin,
  BarChart3,
  CheckCircle2
} from 'lucide-react';

const LeadershipMember: React.FC<{
  name: string;
  role: string;
  image: string;
  desc: string;
}> = ({ name, role, image, desc }) => (
  <div className="flex flex-col group">
    <div className="aspect-[4/5] bg-gray-100 mb-6 overflow-hidden relative border border-gray-100 shadow-sm transition-all duration-500 group-hover:shadow-xl">
      <img 
        src={image} 
        alt={name} 
        className="w-full h-full object-cover grayscale brightness-95 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
      />
      <div className="absolute bottom-0 left-0 bg-cisco-navy text-white p-3 hover:bg-cisco-blue transition-colors cursor-pointer">
        <Linkedin size={16} />
      </div>
    </div>
    <h4 className="text-xl font-light text-cisco-navy group-hover:text-cisco-blue transition-colors">{name}</h4>
    <p className="text-cisco-blue text-[10px] font-bold mb-4 uppercase tracking-widest">{role}</p>
    <p className="text-gray-500 text-sm font-light leading-relaxed">{desc}</p>
  </div>
);

const CompanyPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
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
    { label: 'Mission', id: 'mission' },
    { label: 'Philosophy', id: 'philosophy' },
    { label: 'Team', id: 'team' },
    { label: 'Track Record', id: 'results' },
    { label: 'Contact', id: 'contact' },
  ];

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-white border-b py-2 px-4 md:px-12 text-[10px] text-gray-400">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button onClick={onBack} className="hover:text-cisco-blue transition-colors">Healthcare Administration</button>
            <span>/</span>
            <span className="text-gray-900 font-bold uppercase tracking-widest">Institutional Profile</span>
          </div>
          <div className="hidden md:flex space-x-8 text-[11px] font-normal text-gray-500">
            {navItems.map((item) => (
              <button 
                key={item.id}
                onClick={() => scrollToSection(item.id)} 
                className="hover:text-cisco-blue transition-colors uppercase tracking-widest"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="bg-cisco-navy text-white py-24 md:py-32 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-cisco-blue/10 to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 md:px-12 relative z-10">
          <div className="max-w-4xl">
            <h4 className="text-xs font-bold text-cisco-blue mb-8 uppercase tracking-widest">Institutional Oversight</h4>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-light leading-tight mb-8">
              Infrastructure for <br /> Regulatory Continuity.
            </h1>
            <p className="text-gray-300 text-lg md:text-2xl font-light leading-relaxed max-w-2xl border-l-2 border-cisco-blue pl-8">
              HIPAA Hub provides the specialized advisory and platform architecture 
              necessary to sustain enterprise-grade compliance in clinical environments.
            </p>
          </div>
        </div>
      </section>

      <section id="mission" className="py-24 bg-white border-b scroll-mt-32">
        <div className="max-w-7xl mx-auto px-4 md:px-12 grid lg:grid-cols-2 gap-24 items-center">
          <div>
            <div className="inline-flex items-center justify-center p-4 bg-blue-50 text-cisco-blue mb-10">
              <Target size={28} strokeWidth={1.5} />
            </div>
            <h2 className="text-3xl md:text-5xl font-light text-cisco-navy mb-8 leading-tight">Institutional Mission.</h2>
            <p className="text-gray-600 text-lg md:text-xl font-light leading-relaxed mb-10">
              We exist to transform healthcare compliance from reactive crisis management 
              into proactive operational infrastructure. We believe that clinical security 
              is a strategic asset for providers and a foundational right for patients.
            </p>
            <div className="grid sm:grid-cols-1 gap-y-6">
              {[
                { t: "Compliance is systematic", s: "Not ad-hoc" },
                { t: "Documentation is evidence", s: "Not paperwork" },
                { t: "Defensibility is proactive", s: "Not reactive" }
              ].map((item, i) => (
                <div key={i} className="flex items-center text-sm font-bold text-cisco-navy">
                  <CheckCircle2 size={18} className="text-cisco-green mr-4 shrink-0" />
                  <span>{item.t} — <span className="text-gray-400 font-normal">{item.s}</span></span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative group">
            <div className="aspect-square bg-gray-100 overflow-hidden shadow-2xl relative border border-gray-100">
              <img 
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200" 
                alt="Institutional environment" 
                className="w-full h-full object-cover grayscale brightness-90 group-hover:grayscale-0 transition-all duration-1000"
              />
              <div className="absolute inset-0 border-[30px] border-white/10 m-8"></div>
            </div>
            <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-cisco-blue/5 -z-10"></div>
          </div>
        </div>
      </section>

      <section id="philosophy" className="py-24 bg-gray-50 border-b scroll-mt-32">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="mb-20 text-center">
            <h2 className="text-3xl md:text-5xl font-light text-cisco-navy mb-6">Foundational Philosophy.</h2>
            <p className="text-gray-500 font-light max-w-2xl mx-auto text-lg leading-relaxed">
              Our implementation methodology is guided by five institutional principles 
              designed to sustain long-term regulatory health.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-100 border border-gray-100">
            {[
              {
                title: "01 Systemic Frameworks",
                desc: "Compliance requires structured processes, not heroic effort. We provide a systematic methodology that is repeatable and measurable."
              },
              {
                title: "02 Documentation as Infrastructure",
                desc: "Documentation is not a burden—it is clinical infrastructure. Well-organized evidence protects organizations and proves active management."
              },
              {
                title: "03 Regulatory Defensibility",
                desc: "All platform artifacts are engineered for defensibility in federal audits, aligning directly with OCR and NIST reporting expectations."
              },
              {
                title: "04 Continuous Oversight",
                desc: "Compliance is not a project; it is an ongoing state of operation. We enforce continuous monitoring through quarterly assessment cycles."
              },
              {
                title: "05 Institutional Expertise",
                desc: "We bring high-fidelity regulatory knowledge and audit experience to every engagement, ensuring clinical reality meets legal requirements."
              }
            ].map((item, i) => (
              <div key={i} className="bg-white p-12 hover:bg-gray-50 transition-colors group">
                <h4 className="text-lg font-bold text-cisco-navy mb-6 group-hover:text-cisco-blue transition-colors uppercase tracking-tight">{item.title}</h4>
                <p className="text-gray-500 text-sm font-light leading-relaxed">{item.desc}</p>
              </div>
            ))}
            <div className="bg-cisco-navy p-12 flex flex-col justify-center items-center text-center">
               <Scale size={48} className="text-cisco-blue mb-6" strokeWidth={1} />
               <p className="text-white text-[10px] font-bold uppercase tracking-[0.2em]">Operational Integrity</p>
            </div>
          </div>
        </div>
      </section>

      <section id="team" className="py-24 bg-white border-b scroll-mt-32">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="grid lg:grid-cols-3 gap-24 items-start">
            <div className="lg:col-span-1">
              <div className="inline-flex items-center justify-center p-4 bg-blue-50 text-cisco-blue mb-10">
                <Users2 size={28} strokeWidth={1.5} />
              </div>
              <h2 className="text-3xl font-light text-cisco-navy mb-8 leading-tight">Leadership & <br /> Expertise.</h2>
              <p className="text-gray-600 text-lg font-light leading-relaxed mb-10">
                Our team is composed of regulatory specialists, former auditors, and 
                healthcare IT architects who have specialized in the operationalization 
                of HIPAA requirements for over two decades.
              </p>
              <div className="space-y-4 mb-10 pt-8 border-t border-gray-50">
                <h4 className="text-[10px] font-bold text-gray-400 mb-6 uppercase tracking-widest">Active Specializations</h4>
                <ul className="space-y-4">
                  {[
                    "Federal OCR Audit Desk Support",
                    "NIST 800-66 Implementation",
                    "42 CFR Part 2 Data Privacy",
                    "Clinical Network Security Architecture"
                  ].map((role, i) => (
                    <li key={i} className="flex items-center text-sm text-cisco-navy font-bold">
                      <span className="w-2 h-[2px] bg-cisco-blue mr-4"></span>
                      {role}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="lg:col-span-2 grid md:grid-cols-2 gap-12 lg:gap-16">
              <LeadershipMember 
                name="Dr. Sarah Mitchell"
                role="Chief Privacy Officer"
                image="https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=600"
                desc="Former federal compliance auditor with 15+ years experience in institutional healthcare law and data governance."
              />
              <LeadershipMember 
                name="Marcus Thorne"
                role="Director of Auditing"
                image="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600"
                desc="Audit readiness specialist who has led over 500 successful implementation cycles for independent practices."
              />
            </div>
          </div>
        </div>
      </section>

      <section id="results" className="py-24 bg-gray-50 border-b scroll-mt-32">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div>
              <div className="inline-flex items-center justify-center p-4 bg-blue-50 text-cisco-blue mb-10">
                <BarChart3 size={28} strokeWidth={1.5} />
              </div>
              <h2 className="text-3xl md:text-5xl font-light text-cisco-navy mb-8 leading-tight">Track Record of <br /> Operational Success.</h2>
              <p className="text-gray-600 text-lg font-light leading-relaxed mb-10">
                Since inception, HIPAA Hub has maintained a zero-failure rate in OCR audit 
                remediation for our institutional clients.
              </p>
              
              <div className="grid grid-cols-2 gap-8 mb-12">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-widest">Audit Success Rate</h4>
                    <p className="text-4xl font-light text-cisco-navy">100%</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-widest">Implementation Speed</h4>
                    <p className="text-xl font-light text-cisco-navy">7–21 Days</p>
                  </div>
                </div>
                <div className="bg-white p-8 border border-gray-100 shadow-sm">
                   <h4 className="text-[10px] font-bold text-gray-400 mb-4 uppercase tracking-widest">Global Clinical Footprint</h4>
                   <p className="text-2xl font-light text-cisco-blue mb-2">500+</p>
                   <p className="text-xs text-gray-500 font-light leading-relaxed">Secure clinics across 42 states and 14 clinical specialties.</p>
                </div>
              </div>
            </div>
            
            <div className="relative group">
              <div className="bg-cisco-navy p-12 md:p-20 text-white relative z-10 overflow-hidden shadow-2xl">
                 <Globe size={100} className="absolute -bottom-10 -right-10 text-white/5 group-hover:text-cisco-blue/10 transition-colors duration-1000" />
                 <h3 className="text-3xl font-light mb-8 leading-tight">Institutional <br /> Scalability.</h3>
                 <p className="text-gray-400 font-light mb-12 leading-relaxed text-lg">
                   "We provide the structural stability required for healthcare groups to 
                   expand while maintaining absolute regulatory integrity at every location."
                 </p>
                 <div className="w-12 h-1 bg-cisco-blue"></div>
              </div>
              <div className="absolute -top-10 -right-10 w-full h-full border border-gray-200 -z-10 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform duration-700"></div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="py-32 bg-white overflow-hidden scroll-mt-32">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="grid lg:grid-cols-3 gap-24 items-start">
            <div className="lg:col-span-1">
              <h2 className="text-3xl md:text-5xl font-light text-cisco-navy mb-8 leading-tight">Contact & <br /> Inquiries.</h2>
              <p className="text-gray-500 font-light leading-relaxed mb-12">
                For institutional evaluations, BAA requests, or expert consulting inquiries.
              </p>
              
              <div className="space-y-10">
                <div className="flex items-start gap-4">
                  <Mail className="text-cisco-blue mt-1" size={20} />
                  <div>
                    <h5 className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-widest">Institutional Email</h5>
                    <p className="text-cisco-navy text-sm font-bold">compliance@hipaahub.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="text-cisco-blue mt-1" size={20} />
                  <div>
                    <h5 className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-widest">Global Support</h5>
                    <p className="text-cisco-navy text-sm font-bold">+1-800-HIPAA-HUB</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin className="text-cisco-blue mt-1" size={20} />
                  <div>
                    <h5 className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-widest">Headquarters</h5>
                    <p className="text-cisco-navy text-sm font-light leading-relaxed">Regulatory District, Ste 402<br />San Jose, CA 95113</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-gray-50 p-12 md:p-16 border border-gray-100 shadow-sm">
                <h3 className="text-2xl font-light text-cisco-navy mb-10 tracking-tight">Institutional Inquiry Form</h3>
                <form className="space-y-10" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Principal Name</label>
                      <input type="text" className="w-full bg-transparent border-b border-gray-200 py-3 focus:outline-none focus:border-cisco-blue transition-colors text-sm" placeholder="Dr. Jane Smith" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Institutional Email</label>
                      <input type="email" className="w-full bg-transparent border-b border-gray-200 py-3 focus:outline-none focus:border-cisco-blue transition-colors text-sm" placeholder="jane.smith@clinic.org" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Organizational Profile</label>
                    <select className="w-full bg-transparent border-b border-gray-200 py-3 focus:outline-none focus:border-cisco-blue transition-colors text-sm appearance-none cursor-pointer">
                      <option>Solo Practice / Small Clinic</option>
                      <option>Multi-Specialty Medical Group</option>
                      <option>Behavioral Health Network</option>
                      <option>Specialty Surgery Center</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Inquiry Brief</label>
                    <textarea className="w-full bg-transparent border-b border-gray-200 py-3 focus:outline-none focus:border-cisco-blue transition-colors text-sm resize-none h-32" placeholder="Describe your compliance or implementation requirements..."></textarea>
                  </div>
                  <button className="bg-cisco-navy text-white px-12 py-5 text-sm font-bold w-full md:w-auto flex items-center justify-center group hover:bg-cisco-blue transition-all">
                    Request Professional Evaluation <ArrowRight size={18} className="ml-3 group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CompanyPage;