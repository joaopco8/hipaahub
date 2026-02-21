import React from 'react';
import { FileText } from 'lucide-react';

const CircularProgress: React.FC<{ percentage: number; label: string; valueDisplay?: string }> = ({ percentage, label, valueDisplay }) => {
  // Standardized size: 120px container (w-30 = 120px)
  const radius = 56;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[120px] h-[120px] flex items-center justify-center mb-8">
        <svg className="w-full h-full -rotate-90 block" viewBox="0 0 128 128">
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="#f8fafc"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="#00bceb"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-thin text-slate-800">{valueDisplay || `${percentage}%`}</span>
        </div>
      </div>
      <p className="text-center text-[13px] text-gray-500 max-w-[180px] leading-relaxed font-thin">{label}</p>
    </div>
  );
};

const SolidCircleStat: React.FC<{ value: string; label: string }> = ({ value, label }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="w-[120px] h-[120px] flex items-center justify-center mb-8">
        <div className="w-[112px] h-[112px] rounded-full bg-cisco-green flex items-center justify-center text-white shadow-sm overflow-hidden group">
          <span className="text-4xl font-thin">{value}</span>
        </div>
      </div>
      <p className="text-center text-[13px] text-gray-500 max-w-[180px] leading-relaxed font-thin">{label}</p>
    </div>
  );
};

const SolutionSection: React.FC = () => {
  return (
    <section id="solution" className="py-24 bg-white border-b border-gray-200 border-[0.5px]">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        
        {/* Intro Grid */}
        <div className="grid lg:grid-cols-12 gap-12 items-start mb-32">
          {/* Left: Main Heading */}
          <div className="lg:col-span-4">
            <h2 className="text-[42px] font-thin text-cisco-navy leading-[1.1]">
              Compliance <br /> Documentation is <br /> Fragmented. <br /> Audit Risk is High.
            </h2>
          </div>

          {/* Middle: Description with Icon and Divider */}
          <div className="lg:col-span-8 flex items-start gap-10">
            <div className="h-[140px] w-[1px] bg-gray-100 hidden md:block mt-2"></div>
            <div className="flex flex-col">
              <div className="mb-6 flex items-center justify-center w-10 h-10 border border-gray-100 bg-white shadow-sm">
                <FileText className="text-gray-400" size={18} strokeWidth={1.5} />
              </div>
              <p className="text-gray-500 text-[15px] font-thin leading-relaxed max-w-2xl">
                Become the expert that enables teams to connect, communicate, and collaborate like 
                never before -- seamlessly and securely.
                <br /><br />
                Healthcare organizations typically store compliance documentation across multiple systems. When OCR requests documentation, retrieval takes weeks. Gaps emerge. Violations accumulate.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid - All circles now standardized to the same visual scale */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-4 border-t border-gray-50 pt-20">
          <CircularProgress 
            percentage={72} 
            label="Healthcare organizations have documentation gaps" 
          />
          <CircularProgress 
            percentage={40} 
            valueDisplay="40%"
            label="OCR audit activity (2023-2024) - 40% Increase" 
          />
          <SolidCircleStat 
            value="$50k" 
            label="Average fine per violation: $50,000" 
          />
          <SolidCircleStat 
            value="4-8w" 
            label="Average time to retrieve audit documentation: 4-8 Weeks" 
          />
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
