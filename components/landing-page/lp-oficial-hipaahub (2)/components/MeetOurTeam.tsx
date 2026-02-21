import React from 'react';
import { Linkedin, Mail } from 'lucide-react';

const TeamMember: React.FC<{
  name: string;
  role: string;
  image: string;
  bullets: string[];
}> = ({ name, role, image, bullets }) => (
  <div className="group bg-white border border-gray-100 p-0 hover:border-cisco-navy transition-all duration-300 hover:shadow-xl">
    <div className="h-80 overflow-hidden relative bg-gray-100">
      <img 
        src={image} 
        alt={name} 
        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-in-out transform group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute bottom-0 left-0 bg-cisco-navy text-white px-4 py-1.5 text-xs font-normal tracking-widest z-10">
        Expert
      </div>
    </div>
    <div className="p-8">
      <h4 className="text-xl font-light text-cisco-navy mb-1 tracking-tight">{name}</h4>
      <p className="text-gray-500 text-sm font-normal mb-6 tracking-tight">{role}</p>
      <ul className="space-y-3 mb-8">
        {bullets.map((bullet, idx) => (
          <li key={idx} className="flex items-start text-xs text-gray-600 font-normal leading-relaxed">
            <span className="w-1.5 h-1.5 bg-cisco-blue rounded-full mt-1.5 mr-3 flex-shrink-0 opacity-40"></span>
            {bullet}
          </li>
        ))}
      </ul>
      <div className="flex space-x-4 border-t border-gray-50 pt-6">
        <a href="#" className="text-gray-400 hover:text-cisco-navy transition-colors">
          <Linkedin size={18} />
        </a>
        <a href="#" className="text-gray-400 hover:text-cisco-navy transition-colors">
          <Mail size={18} />
        </a>
      </div>
    </div>
  </div>
);

const MeetOurTeam: React.FC = () => {
  const team = [
    {
      name: "Dr. Sarah Mitchell",
      role: "Chief Privacy Officer & Legal Counsel",
      bullets: [
        "Former OCR auditor (15+ years)",
        "Healthcare law and federal regulatory frameworks",
        "Leads your compliance consulting engagement"
      ],
      image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=800"
    },
    {
      name: "Marcus Thorne",
      role: "Director of HIPAA Auditing",
      bullets: [
        "Pre-audit readiness specialist",
        "Risk mitigation strategies",
        "Leads your audit defensibility review"
      ],
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800"
    },
    {
      name: "Elena Rodriguez",
      role: "Healthcare Systems Architect",
      bullets: [
        "Clinical network security",
        "Multi-site medical environments",
        "Ensures technical alignment"
      ],
      image: "https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?auto=format&fit=crop&q=80&w=800"
    },
    {
      name: "David Chen",
      role: "Compliance Training Lead",
      bullets: [
        "Staff training and certification",
        "Human-error prevention",
        "Leads your team training session"
      ],
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800"
    }
  ];

  return (
    <section className="py-24 bg-gray-50 border-t border-b">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <div className="mb-16">
          <p className="text-cisco-navy font-normal text-xs tracking-widest mb-4 uppercase">Our Expertise</p>
          <h2 className="text-4xl lg:text-[48px] font-light text-cisco-navy leading-tight tracking-tight mb-6">
            Expert-Led Consulting. <br /> Regulatory Expertise.
          </h2>
          <p className="text-gray-600 text-lg font-normal max-w-2xl leading-relaxed">
            Your consulting engagement is led by compliance specialists with direct OCR audit experience and healthcare regulatory expertise.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, idx) => (
            <TeamMember key={idx} {...member} />
          ))}
        </div>

        <div className="mt-20 p-10 bg-white border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="max-w-xl">
              <h3 className="text-2xl font-light text-cisco-navy mb-2 tracking-tight">Specialized Services Available</h3>
              <p className="text-gray-600 font-normal">For complex multi-site audits and unique clinical workflows, our experts are available for specialized consultation.</p>
           </div>
           <button className="bg-cisco-navy text-white px-10 py-4 font-normal text-sm hover:bg-cisco-blue transition-all rounded-none whitespace-nowrap">
             Request Expert Consultation
           </button>
        </div>
      </div>
    </section>
  );
};

export default MeetOurTeam;