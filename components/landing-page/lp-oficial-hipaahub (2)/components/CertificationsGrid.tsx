
import React from 'react';
import { ChevronRight } from 'lucide-react';

const CertCard: React.FC<{ title: string; desc: string }> = ({ title, desc }) => (
  <div className="bg-white p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full min-h-[250px]">
    <h4 className="text-xl font-medium mb-4 text-slate-800">{title}</h4>
    <p className="text-gray-600 text-sm mb-8 flex-grow leading-relaxed">{desc}</p>
    <a href="#" className="flex items-center text-blue-500 text-sm font-semibold group">
      Learn more <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
    </a>
  </div>
);

const CertificationsGrid: React.FC = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-12 text-center mb-16">
        <h2 className="text-3xl font-light text-slate-800 mb-4">Get certified in collaboration technologies</h2>
        <p className="text-gray-600">In today's fast-paced world, seamless collaboration is the key to driving business success. It all starts here.</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <CertCard 
            title="CCNP Collaboration"
            desc="The CCNP Collaboration certification proves you have what it takes to build the solutions that empower our evolving collaboration technologies."
          />
          <CertCard 
            title="CCIE Collaboration"
            desc="The CCIE Collaboration certification validates you as an expert in end-to-end lifecycle skills for complex collaboration solutions."
          />
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <CertCard 
            title="Cisco Certified Specialist certifications"
            desc="Showcase your expertise in key collaboration topics with five specialist certifications. You'll earn one for every exam you pass."
          />
          <div className="hidden md:block"></div>
        </div>
      </div>
    </section>
  );
};

export default CertificationsGrid;
