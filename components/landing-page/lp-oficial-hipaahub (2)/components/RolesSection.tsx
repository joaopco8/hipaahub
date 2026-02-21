import React from 'react';
import { ChevronRight } from 'lucide-react';

const RoleCard: React.FC<{ title: string; desc: string }> = ({ title, desc }) => (
  <div className="bg-white p-8 border border-gray-200 flex flex-col h-full">
    <h4 className="font-semibold text-lg mb-6 text-slate-800">{title}</h4>
    <p className="text-gray-600 text-sm mb-12 flex-grow leading-relaxed font-light">{desc}</p>
    <div className="space-y-1">
        <a href="#" className="flex items-center text-blue-500 text-sm font-light group">
            Text CTA lorem ipsum sit <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
        </a>
        <a href="#" className="flex items-center text-blue-500 text-sm font-light group">
            adipiscing tris <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
        </a>
    </div>
  </div>
);

const RolesSection: React.FC = () => {
  return (
    <section className="py-24 bg-white">
      {/* Upper part with Image */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 grid md:grid-cols-2 gap-16 items-center mb-24">
        <div className="rounded-lg overflow-hidden shadow-lg h-[400px]">
          <img 
            src="https://picsum.photos/seed/collaboration/800/600" 
            alt="Collaborative work" 
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h2 className="text-4xl font-light text-slate-800 leading-tight mb-8">
            Be ready for roles that <br /> support collaboration
          </h2>
          <p className="text-gray-600 text-lg mb-10 leading-relaxed max-w-lg font-light">
            Collaboration professionals use their expertise to build and maintain the robust 
            networks that connect us all.
          </p>
          <button className="border border-blue-500 text-blue-500 px-8 py-3 text-sm font-light hover:bg-blue-50 transition-colors">
            Secondary CTA
          </button>
        </div>
      </div>

      {/* Roles Slider Part */}
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <h3 className="text-2xl font-light text-slate-800 mb-12">Potential roles</h3>
        <div className="grid md:grid-cols-3 gap-0 border-r border-t border-b border-l">
          <RoleCard 
            title="Collaboration Administrator"
            desc="Install, maintain, upgrade, and troubleshoot voice, video, and other collaboration technologies."
          />
          <RoleCard 
            title="Collaboration Solutions Engineer"
            desc="Define, support, and test new collaboration services and ensure they are always available."
          />
          <RoleCard 
            title="Collaboration Solutions Architect"
            desc="Design office space, technology, and corporate culture to remove the barriers to communication."
          />
        </div>
        {/* Carousel indicators */}
        <div className="flex justify-center mt-12 space-x-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
        </div>
      </div>
    </section>
  );
};

export default RolesSection;