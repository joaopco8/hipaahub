import React from 'react';
import { ChevronRight } from 'lucide-react';

const CiscoUSection: React.FC = () => {
  return (
    <section className="bg-cisco-navy py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-12 grid lg:grid-cols-2 gap-16 items-center">
        <div className="text-white">
          <p className="text-sm font-medium text-blue-400 mb-4">Eyebrow, lorem ipsum dolorsitu</p>
          <h2 className="text-5xl font-thin mb-8 leading-tight">
            Train for your <br /> certification with <br /> Cisco U.
          </h2>
          <p className="text-gray-300 text-lg font-thin leading-relaxed mb-10 max-w-lg">
            Cisco U. provides personalized learning to help you meet your career goals. 
            Create a free account to access tutorials, videos, podcasts and more - and 
            when you're ready to take your learning to the next level, you can upgrade to 
            unlock even more courses.
          </p>
          <div className="flex items-center space-x-6">
            <button className="bg-white text-cisco-navy px-8 py-3 font-thin hover:bg-gray-100 transition-colors">
              Start for free
            </button>
            <a href="#" className="flex items-center text-white font-thin group">
              Text CTA <ChevronRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        <div className="relative">
          {/* Monitor Mockup */}
          <div className="relative z-10 w-full max-w-2xl mx-auto">
             <div className="bg-gray-800 rounded-t-lg p-2 border-b-8 border-gray-900 shadow-2xl overflow-hidden aspect-[16/10]">
                <img 
                    src="https://picsum.photos/seed/dashboard/800/500" 
                    alt="Cisco U Dashboard" 
                    className="w-full h-full object-cover rounded-sm"
                />
             </div>
             {/* Stand */}
             <div className="mx-auto w-32 h-16 bg-gray-700 relative -top-1"></div>
             <div className="mx-auto w-48 h-2 bg-gray-600 rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CiscoUSection;
