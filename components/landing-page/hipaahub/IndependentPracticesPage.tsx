import React from 'react';
import { Stethoscope, Users, Building, ShieldCheck, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

const PracticeType: React.FC<{
  title: string;
  icon: React.ReactNode;
  audience: string;
  challenges: string[];
  solution: string;
}> = ({ title, icon, audience, challenges, solution }) => (
  <div className="bg-white border border-gray-100 p-10 flex flex-col h-full hover:shadow-2xl transition-all duration-500 group">
    <div className="text-cisco-blue mb-8 group-hover:scale-110 transition-transform">{icon}</div>
    <h4 className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">{audience}</h4>
    <h3 className="text-2xl font-thin text-cisco-navy mb-8">{title}</h3>
    
    <div className="mb-8 flex-grow">
      <h5 className="text-[10px] font-bold text-red-400 mb-4 uppercase tracking-widest">Core Challenges</h5>
      <ul className="space-y-3 mb-8">
        {challenges.map((c, i) => (
          <li key={i} className="flex items-start text-sm text-gray-500 font-thin leading-snug">
            <AlertCircle size={14} className="text-gray-300 mr-3 mt-0.5 flex-shrink-0" />
            {c}
          </li>
        ))}
      </ul>
      <h5 className="text-[10px] font-bold text-cisco-blue mb-4 uppercase tracking-widest">Our Approach</h5>
      <p className="text-sm text-gray-600 font-thin leading-relaxed">{solution}</p>
    </div>

    <button className="flex items-center text-sm font-bold text-cisco-navy hover:text-cisco-blue transition-colors group/btn">
      View framework <ArrowRight size={16} className="ml-2 transition-transform group-hover/btn:translate-x-1" />
    </button>
  </div>
);

const IndependentPracticesPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="bg-white min-h-screen">
      <div className="bg-white border-b py-2 px-4 md:px-12 text-[10px] text-gray-400">
        <div className="max-w-7xl mx-auto flex items-center space-x-2">
          <button onClick={onBack} className="hover:text-cisco-blue">Solutions</button>
          <span>/</span>
          <span className="text-gray-900 font-bold">Independent Practices</span>
        </div>
      </div>

      <section className="bg-cisco-navy text-white py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-thin leading-tight mb-8">
              Compliance Architecture <br /> for the Independent Practice.
            </h1>
            <p className="text-gray-300 text-lg md:text-xl font-thin leading-relaxed mb-10 border-l-2 border-cisco-blue pl-8">
              Small and mid-sized clinics face the same regulatory scrutiny as hospital systems, 
              but often without the dedicated compliance staff. We bridge that gap.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="grid md:grid-cols-3 gap-8">
            <PracticeType 
              audience="Solo Practitioners"
              icon={<Stethoscope size={40} strokeWidth={1} />}
              title="Solo Practices"
              challenges={[
                "Limited administrative bandwidth",
                "High dependency on individual staff",
                "No formal security officer role"
              ]}
              solution="Automated documentation workflows that require less than 1 hour of monthly maintenance while ensuring 100% audit readiness."
            />
            <PracticeType 
              audience="Clinical Groups"
              icon={<Users size={40} strokeWidth={1} />}
              title="Group Clinics"
              challenges={[
                "Data fragmentation across staff",
                "Inconsistent training records",
                "Multiple EHR logins and access"
              ]}
              solution="Centralized compliance repository with automated staff training tracking and unified policy distribution."
            />
            <PracticeType 
              audience="Health Networks"
              icon={<Building size={40} strokeWidth={1} />}
              title="Multi-location Groups"
              challenges={[
                "Site-specific documentation gaps",
                "Centralized oversight difficulty",
                "BAA management complexity"
              ]}
              solution="Multi-site management dashboard providing a consolidated view of compliance posture across all locations."
            />
          </div>
        </div>
      </section>

      <section className="py-24 bg-white border-t">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <ShieldCheck size={64} className="text-cisco-blue mx-auto mb-10" />
          <h2 className="text-3xl md:text-5xl font-thin text-cisco-navy mb-8">Operational Defensibility.</h2>
          <p className="text-gray-500 text-lg font-thin leading-relaxed mb-12">
            We don't just provide a manual; we build the operational infrastructure that proves 
            your organization is actively managing its compliance obligations every single day.
          </p>
          <button className="bg-cisco-navy text-white px-12 py-5 text-sm font-bold hover:bg-cisco-blue transition-all">
            Start Your Practice Assessment
          </button>
        </div>
      </section>
    </div>
  );
};

export default IndependentPracticesPage;
