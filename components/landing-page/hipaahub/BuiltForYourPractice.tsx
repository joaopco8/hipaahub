import React from 'react';
import { ShieldCheck, Activity, FileText, Users } from 'lucide-react';

const practices = [
  {
    icon: <ShieldCheck className="w-6 h-6 text-cisco-blue" />,
    title: 'Therapists & Counselors',
    text: 'Private practice LCSWs and psychologists who handle PHI daily and need audit-ready documentation without a compliance team.',
  },
  {
    icon: <FileText className="w-6 h-6 text-cisco-blue" />,
    title: 'Dental Practices',
    text: 'Independent dentists with 1–10 staff who need HIPAA policies, BAA management, and breach response without the enterprise price tag.',
  },
  {
    icon: <Activity className="w-6 h-6 text-cisco-blue" />,
    title: 'Physical Therapy',
    text: 'PT clinics that manage patient records across providers and need centralized compliance tracking that doesn\'t require an IT department.',
  },
  {
    icon: <Users className="w-6 h-6 text-cisco-blue" />,
    title: 'Specialty Clinics',
    text: 'Chiropractic, acupuncture, and other specialty practices with HIPAA obligations and no dedicated compliance staff.',
  },
];

const BuiltForYourPractice: React.FC = () => {
  return (
    <section className="py-20 md:py-24 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <h2 className="text-3xl md:text-4xl font-thin text-slate-900 mb-10 md:mb-12">
          Built for your practice
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {practices.map((item) => (
            <div
              key={item.title}
              className="bg-white border border-gray-200 rounded-none p-6 md:p-7 flex flex-col h-full hover:shadow-md transition-shadow"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-cisco-navy/5 mb-4">
                {item.icon}
              </div>
              <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-3">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed font-thin">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BuiltForYourPractice;

