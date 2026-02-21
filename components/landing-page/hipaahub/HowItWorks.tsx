import React from 'react';
import { UserPlus, ClipboardCheck, LayoutGrid, CheckCircle2, ArrowRight, Clock } from 'lucide-react';

const StepCard: React.FC<{ 
  number: string;
  title: string; 
  duration: string;
  list: string[];
  icon: React.ReactNode;
}> = ({ number, title, duration, list, icon }) => (
  <div className="bg-white p-10 border border-gray-100 flex flex-col h-full hover:shadow-2xl transition-all duration-500 group">
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

const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-24 bg-white border-t border-b border-gray-200 border-[0.5px]">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <div className="text-center mb-24">
          <h2 className="text-4xl lg:text-[54px] font-thin text-cisco-navy leading-[1.2] mb-6">
            Get Started <br /> in 3 Steps.
          </h2>
          <p className="text-gray-500 text-lg md:text-xl font-thin max-w-3xl mx-auto">
            From signup to audit-ready in days.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-100 border border-gray-100 overflow-hidden">
          <StepCard 
            number="1"
            icon={<UserPlus size={40} strokeWidth={1} />}
            title="Sign Up"
            duration="5 minutes"
            list={["Create account", "Verify organization details", "Set up workspace", "Invite team members"]}
          />
          <StepCard 
            number="2"
            icon={<ClipboardCheck size={40} strokeWidth={1} />}
            title="Assess"
            duration="1-2 hours"
            list={["Complete compliance questionnaire", "Risk Assessment Engine evaluation", "Receive risk score and report", "Review recommendations"]}
          />
          <StepCard 
            number="3"
            icon={<LayoutGrid size={40} strokeWidth={1} />}
            title="Implement"
            duration="1-7 days"
            list={["Customize policies", "Upload documentation", "Schedule staff training", "Organize evidence", "Verify audit readiness"]}
          />
        </div>
        
        <div className="mt-20 bg-cisco-navy p-12 text-center text-white flex flex-col items-center">
           <CheckCircle2 size={48} className="text-cisco-green mb-8" />
           <h3 className="text-3xl font-thin mb-10">Timeline: Audit-ready within 2 weeks.</h3>
           <button className="bg-cisco-blue text-white px-12 py-5 text-sm font-thin hover:bg-white hover:text-cisco-navy transition-all flex items-center gap-3">
             Start 14-day free trial <ArrowRight size={18} />
           </button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
