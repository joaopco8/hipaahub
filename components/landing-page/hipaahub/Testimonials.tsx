
import React from 'react';
import { ChevronRight } from 'lucide-react';

const Testimonials: React.FC = () => {
  return (
    <section className="py-24 bg-gray-50 border-t border-b overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <h2 className="text-3xl font-thin text-slate-800 mb-16">
          Cisco certifications gave Yasser the right information and background
        </h2>

        <div className="grid lg:grid-cols-4 gap-12 items-center bg-white p-0 shadow-sm border border-gray-100">
          <div className="lg:col-span-3 p-12">
            <h3 className="text-2xl font-thin italic mb-8 text-slate-700">
              “Subhead_quote, lorem ipsum sit adipiscing tristiquei aliq.”
            </h3>
            <p className="text-gray-600 leading-relaxed mb-10 max-w-2xl text-sm">
              “Cisco Certifications and the material for certifications are of high quality. 
              They are recognized by the market and IT community.”
            </p>
            <div>
              <p className="font-bold text-slate-900 text-sm">Yasser Auda, Network Security Architect</p>
              <p className="text-gray-500 text-xs mt-1">CCNA, CCNP Enterprise, CCNP Security</p>
            </div>
            
            <div className="mt-10 flex items-center space-x-10 text-sm font-semibold">
              <a href="#" className="flex items-center text-blue-500 group">
                View Yasser’s story <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="#" className="flex items-center text-blue-500 group">
                Additional Text CTA <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
          
          <div className="relative h-full min-h-[400px] lg:col-span-1">
            <img 
              src="https://picsum.photos/seed/yasser/500/600" 
              alt="Yasser Auda" 
              className="absolute inset-0 w-full h-full object-cover grayscale"
            />
            {/* DevNet Overlay decoration if needed */}
            <div className="absolute bottom-4 right-4 text-white font-bold opacity-80 tracking-widest text-xs">DEVNET</div>
          </div>
        </div>

        {/* Indicators */}
        <div className="flex justify-center mt-12 space-x-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
