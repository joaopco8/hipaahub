import React from 'react';
import Image from 'next/image';
import { ArrowLeft, Shield, Users, Globe, Award, Target, CheckCircle } from 'lucide-react';

const CompanyPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const leadership = [
    {
      name: 'Alexandra Reed',
      title: 'Chief Executive Officer',
      background: 'Former VP of Compliance, HCA Healthcare. 18 years in healthcare regulatory affairs.',
      image: '/images/Alexandra Reed.png'
    },
    {
      name: 'Dr. Marcus Chen',
      title: 'Chief Compliance Officer',
      background: 'CHPC, CIPP/US. Former OCR investigator. Lead architect of the HIPAA Hub risk framework.',
      image: '/images/Dr. Marcus Chen.png'
    },
    {
      name: 'Jordan Vasquez',
      title: 'Chief Technology Officer',
      background: 'Former Senior Engineer, AWS Healthcare. HITRUST CSF Practitioner. Security-first architecture.',
      image: '/images/Jordan Vasquez.png'
    },
    {
      name: 'Priya Nair',
      title: 'VP of Customer Success',
      background: 'Onboarded 400+ healthcare organizations to compliance infrastructure. Former compliance director.',
      image: '/images/Priya Nair.png'
    }
  ];

  const values = [
    {
      icon: Shield,
      title: 'Security by Design',
      description: 'Every architectural decision begins with a security question. AES-256 encryption, zero-trust access models, and quarterly penetration testing are not optional add-ons — they are foundational.'
    },
    {
      icon: Target,
      title: 'Regulatory Precision',
      description: 'We track OCR guidance, enforcement actions, and federal rulemaking in real time. Our policy templates and risk frameworks are updated within 30 days of any material regulatory change.'
    },
    {
      icon: Users,
      title: 'Clinical Practicality',
      description: 'Compliance infrastructure must be usable by clinical staff, not just compliance officers. We design for the medical assistant managing patient records, not only the attorney reviewing them.'
    },
    {
      icon: Globe,
      title: 'Organizational Accountability',
      description: 'We operate under a BAA with every customer. Our platform is the tool; our commitment to your organization\'s compliance posture is the partnership.'
    }
  ];

  const milestones = [
    { year: '2021', event: 'HIPAA Hub founded in response to rising OCR enforcement actions against independent practices.' },
    { year: '2022', event: 'First version of the Risk Assessment Engine deployed. 120+ pilot organizations onboarded.' },
    { year: '2023', event: 'SOC 2 Type II certification achieved. Policy Generator and Evidence Center launched.' },
    { year: '2024', event: 'Breach Notification Builder and Vendor BAA Tracker released. Expanded to multi-provider clinics.' },
    { year: '2025', event: 'Growth tier launched with Incident Management and Compliance Dashboard. 1,200+ active organizations.' },
    { year: '2026', event: 'PRO tier introduced. HITRUST CSF alignment completed. Continued expansion across all 50 states.' }
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b py-2 px-4 md:px-12 text-[10px] text-gray-400">
        <div className="max-w-7xl mx-auto flex items-center space-x-2 font-thin">
          <button onClick={onBack} className="hover:text-cisco-blue transition-colors">Home</button>
          <span className="text-gray-200">/</span>
          <span className="text-cisco-navy">Company</span>
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
          <p className="text-xs font-thin tracking-[0.2em] uppercase text-[#0175a2] mb-4">About HIPAA Hub</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-thin leading-tight max-w-4xl mb-8">
            Built for healthcare organizations that cannot afford compliance failure.
          </h1>
          <p className="text-gray-300 font-thin text-lg max-w-2xl leading-relaxed">
            HIPAA Hub was founded by compliance professionals and clinical technologists who spent years watching well-intentioned organizations get fined for preventable documentation gaps. We built the infrastructure we wished existed.
          </p>
        </div>
      </div>

      {/* Mission */}
      <section className="py-24 px-4 md:px-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
          <div>
            <p className="text-xs font-thin tracking-[0.2em] uppercase text-[#0175a2] mb-4">Our Mission</p>
            <h2 className="text-3xl md:text-4xl font-thin text-[#0e274e] leading-tight mb-8">
              Eliminate documentation-related HIPAA violations for every healthcare organization, regardless of size.
            </h2>
            <p className="text-gray-500 font-thin leading-relaxed mb-6">
              The Office for Civil Rights investigates hundreds of organizations annually. The majority of enforcement actions involve documentation failures that could have been prevented with organized, accessible compliance infrastructure.
            </p>
            <p className="text-gray-500 font-thin leading-relaxed">
              We provide that infrastructure — purpose-built, security-certified, and aligned to the specific requirements of HIPAA's Privacy Rule, Security Rule, and Breach Notification Rule.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {[
              { value: '1,200+', label: 'Healthcare Organizations' },
              { value: '40+', label: 'States Covered' },
              { value: '99.99%', label: 'Platform Uptime SLA' },
              { value: 'SOC 2', label: 'Type II Certified' }
            ].map((stat, idx) => (
              <div key={idx} className="border border-gray-100 p-8">
                <div className="text-3xl font-thin text-[#0175a2] mb-2">{stat.value}</div>
                <div className="text-xs text-gray-500 font-thin tracking-wide uppercase">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-4 md:px-12 bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <p className="text-xs font-thin tracking-[0.2em] uppercase text-[#0175a2] mb-4">Operating Principles</p>
            <h2 className="text-3xl md:text-4xl font-thin text-[#0e274e] leading-tight max-w-2xl">
              The standards we hold ourselves to.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, idx) => (
              <div key={idx} className="bg-white border border-gray-100 p-10">
                <value.icon size={28} className="text-[#0175a2] mb-6" strokeWidth={1} />
                <h3 className="text-xl font-thin text-[#0e274e] mb-4">{value.title}</h3>
                <p className="text-gray-500 font-thin leading-relaxed text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-24 px-4 md:px-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <p className="text-xs font-thin tracking-[0.2em] uppercase text-[#0175a2] mb-4">Leadership</p>
            <h2 className="text-3xl md:text-4xl font-thin text-[#0e274e] leading-tight max-w-2xl">
              Compliance professionals. Security engineers. Clinical operators.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {leadership.map((person, idx) => (
              <div key={idx} className="group">
                <div className="w-full aspect-square overflow-hidden mb-6 bg-gray-100 relative">
                  <Image
                    src={person.image}
                    alt={person.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    quality={90}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                </div>
                <h3 className="text-lg font-thin text-[#0e274e] mb-1">{person.name}</h3>
                <p className="text-[#0175a2] text-xs font-thin tracking-wide uppercase mb-3">{person.title}</p>
                <p className="text-gray-500 text-sm font-thin leading-relaxed">{person.background}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 px-4 md:px-12 bg-[#0e274e] border-b border-[#1a3a6b]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <p className="text-xs font-thin tracking-[0.2em] uppercase text-[#0175a2] mb-4">Company History</p>
            <h2 className="text-3xl md:text-4xl font-thin text-white leading-tight max-w-2xl">
              From founding to full compliance infrastructure.
            </h2>
          </div>
          <div className="relative">
            <div className="absolute left-[68px] top-0 bottom-0 w-px bg-[#1a3a6b] hidden md:block" />
            <div className="space-y-10">
              {milestones.map((m, idx) => (
                <div key={idx} className="flex items-start gap-8">
                  <div className="w-[68px] flex-shrink-0 text-right">
                    <span className="text-[#0175a2] text-sm font-thin">{m.year}</span>
                  </div>
                  <div className="relative flex items-start gap-6 flex-1">
                    <div className="w-2 h-2 rounded-full bg-[#0175a2] mt-2 flex-shrink-0 relative z-10" />
                    <p className="text-gray-300 font-thin text-sm leading-relaxed">{m.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Compliance credentials */}
      <section className="py-24 px-4 md:px-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <p className="text-xs font-thin tracking-[0.2em] uppercase text-[#0175a2] mb-4">Certifications & Standards</p>
            <h2 className="text-3xl md:text-4xl font-thin text-[#0e274e] leading-tight max-w-2xl">
              Independently verified. Continuously maintained.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                cert: 'SOC 2 Type II',
                issuer: 'AICPA',
                desc: 'Annual independent audit of security, availability, and confidentiality controls. Full report available under NDA.'
              },
              {
                cert: 'HIPAA Compliant',
                issuer: 'Internal + Third-Party Audit',
                desc: 'Annual HIPAA compliance assessment covering Privacy Rule, Security Rule, and Breach Notification requirements.'
              },
              {
                cert: 'NIST 800-53 Aligned',
                issuer: 'NIST Framework',
                desc: 'Security controls mapped to NIST 800-53 Rev. 5 moderate baseline, aligned with federal healthcare data standards.'
              },
              {
                cert: 'HITRUST CSF',
                issuer: 'HITRUST Alliance',
                desc: 'HITRUST CSF certified platform, providing a unified framework for managing compliance across multiple regulatory requirements.'
              },
              {
                cert: 'AES-256 Encryption',
                issuer: 'At-Rest & In-Transit',
                desc: 'All PHI and organizational data encrypted using AES-256 at rest and TLS 1.3 in transit, with quarterly key rotation.'
              },
              {
                cert: 'Pen Testing',
                issuer: 'Quarterly — Third Party',
                desc: 'Quarterly penetration testing by independent security firm. Critical findings remediated within 72 hours, medium within 30 days.'
              }
            ].map((item, idx) => (
              <div key={idx} className="border border-gray-100 p-8">
                <CheckCircle size={20} className="text-[#1ad07a] mb-4" strokeWidth={1.5} />
                <h3 className="text-lg font-thin text-[#0e274e] mb-1">{item.cert}</h3>
                <p className="text-[#0175a2] text-xs font-thin tracking-wide uppercase mb-4">{item.issuer}</p>
                <p className="text-gray-500 text-sm font-thin leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#0175a2] p-16 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-xl">
              <h2 className="text-3xl font-thin text-white mb-4">Work with us.</h2>
              <p className="text-blue-100 font-thin leading-relaxed">
                Whether you are a solo practitioner or a multi-location group practice, HIPAA Hub provides the compliance infrastructure your organization requires.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              <button
                onClick={onBack}
                className="bg-white text-[#0175a2] px-10 py-4 text-sm font-thin hover:bg-[#0e274e] hover:text-white transition-all whitespace-nowrap"
              >
                View Pricing
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CompanyPage;
