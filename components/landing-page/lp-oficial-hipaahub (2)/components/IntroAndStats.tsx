import React from 'react';
import { FileText } from 'lucide-react';

const CircularProgress: React.FC<{ percentage: number; label: string }> = ({ percentage, label }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32 flex items-center justify-center mb-6">
        <svg className="w-32 h-32 -rotate-90 block" viewBox="0 0 128 128">
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="#f1f5f9"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="#00bceb"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-slate-800 leading-none">{percentage}%</span>
        </div>
      </div>
      <p className="text-center text-sm text-gray-600 max-w-[180px] leading-snug">{label}</p>
    </div>
  );
};

const IconStat: React.FC<{ value: string; label: string; bgColor: string }> = ({ value, label, bgColor }) => {
  return (
    <div className="flex flex-col items-center">
      <div className={`w-32 h-32 rounded-full ${bgColor} flex items-center justify-center mb-6 text-white text-3xl font-bold shadow-sm`}>
        {value}
      </div>
      <p className="text-center text-sm text-gray-600 max-w-[180px] leading-snug">{label}</p>
    </div>
  );
};

const IntroAndStats: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        {/* Intro Text */}
        <div className="grid md:grid-cols-2 gap-12 items-start mb-24">
          <h2 className="text-4xl font-light text-slate-800 leading-tight">
            Collaboration <br /> makes remote <br /> work possible
          </h2>
          <div className="flex space-x-6 items-start border-l border-gray-200 pl-8">
            <FileText className="text-gray-400 mt-1 flex-shrink-0" size={24} />
            <div>
              <p className="text-gray-600 mb-8 leading-relaxed font-light">
                Become the expert that enables teams to connect, communicate, and collaborate like 
                never before, seamlessly and securely.
              </p>
              <button className="border border-blue-500 text-blue-500 px-8 py-3 text-sm font-light hover:bg-blue-50 transition-colors">
                Why get certified?
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          <CircularProgress 
            percentage={58} 
            label="Cybersecurity job openings globally by 2025" 
          />
          <CircularProgress 
            percentage={96} 
            label="growth in the cybersecurity job market by 2031" 
          />
          <IconStat 
            value="$123k" 
            label="Certified cybersecurity pros earn 56% more than non-certified colleagues" 
            bgColor="bg-cisco-green" 
          />
          <IconStat 
            value="$12k" 
            label="of companies have a cybersecurity skills shortage" 
            bgColor="bg-cisco-green" 
          />
        </div>
      </div>
    </section>
  );
};

export default IntroAndStats;