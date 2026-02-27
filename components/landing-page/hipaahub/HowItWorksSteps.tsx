import React from 'react';
import { UserPlus, ClipboardCheck, LayoutGrid, Clock } from 'lucide-react';

const StepCard: React.FC<{ 
  number: string;
  title: string; 
  duration: string;
  list: string[];
  icon: React.ReactNode;
}> = ({ number, title, duration, list, icon }) => (
  <div className="bg-white p-10 border border-gray-100 flex flex-col h-full hover:shadow-lg transition-all duration-300 group">
    <div className="flex items-center justify-between mb-8">
      <div className="text-cisco-blue group-hover:scale-110 transition-transform">{icon}</div>
      <div className="text-4xl font-thin text-gray-100 group-hover:text-cisco-blue/10 transition-colors">0{number}</div>
    </div>
    <div className="text-xs font-thin text-cisco-blue mb-2">Step {number}</div>
    <h4 className="text-2xl font-thin mb-6 text-cisco-navy">{title}</h4>
    <ul className="space-y-3 mb-8 flex-grow">
      {list.map((item, i) => (
        <li key={i} className="flex items-start text-base text-gray-600 font-thin">
          <span className="w-1.5 h-1.5 bg-cisco-blue rounded-full mt-2.5 mr-3 flex-shrink-0 opacity-40"></span>
          {item}
        </li>
      ))}
    </ul>
    <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
       <span className="text-xs font-thin text-gray-400">Phase timeline</span>
       <span className="text-sm font-thin text-cisco-navy flex items-center gap-2"><Clock size={14} /> {duration}</span>
    </div>
  </div>
);

const HowItWorksSteps: React.FC = () => {
  return (
    <section id="how-it-works-steps" className="py-24 bg-white border-t border-b border-gray-200 border-[0.5px]">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-[54px] font-thin text-cisco-navy leading-[1.2] mb-6">
            Get Audit-Ready in 3 Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-100 border border-gray-100 overflow-hidden">
          <StepCard 
            number="1"
            icon={<UserPlus size={40} strokeWidth={1} />}
            title="Setup"
            duration="5 minutes"
            list={["Create account", "Verify organization", "Set up workspace", "Invite team"]}
          />
          <StepCard 
            number="2"
            icon={<ClipboardCheck size={40} strokeWidth={1} />}
            title="Assess"
            duration="1-2 hours"
            list={["Complete compliance questionnaire", "Risk Assessment Engine evaluation", "Receive risk score and recommendations"]}
          />
          <StepCard 
            number="3"
            icon={<LayoutGrid size={40} strokeWidth={1} />}
            title="Implement"
            duration="1-7 days"
            list={["Customize policies", "Upload documentation", "Schedule training", "Verify audit readiness"]}
          />
        </div>
        
        <div className="mt-20 text-center">
           <p className="text-xl font-thin text-cisco-navy">Timeline: Audit-ready within 7-14 days.</p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSteps;
