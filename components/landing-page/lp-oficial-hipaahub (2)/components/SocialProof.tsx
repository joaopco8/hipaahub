import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';

interface Testimonial {
  id: number;
  subhead: string;
  quote: string;
  author: string;
  role: string;
  credentials: string;
  image: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    subhead: "Subhead_quote, lorem ipsum sit adipiscing tristiquei aliq.",
    quote: "Cisco Certifications and the material for certifications are of high quality. They are recognized by the market and IT community.",
    author: "Yasser Auda",
    role: "Network Security Architect",
    credentials: "CCNA, CCNP Enterprise, CCNP Security",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 2,
    subhead: "Quality training that transforms careers in healthcare technology.",
    quote: "The HIPAA Hub certification process was smooth and the materials provided were top-notch. It's truly a gold standard in the industry.",
    author: "Elena Rodriguez",
    role: "Clinical IT Specialist",
    credentials: "HISP, Security+, HIPAA Expert",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 3,
    subhead: "Bridging the gap between clinical care and data security.",
    quote: "Implementing these protocols reduced our documentation retrieval time by 80%. The expert support throughout the process was invaluable.",
    author: "Marcus Thorne",
    role: "Director of Auditing",
    credentials: "CISA, CISM, Clinical Architect",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800",
  }
];

const SocialProof: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  // Auto-advance carousel every 8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % testimonials.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const current = testimonials[activeTab];

  return (
    <section className="py-24 bg-gray-50 border-t border-b overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <div className="bg-white shadow-sm border border-gray-100 flex flex-col lg:flex-row min-h-[450px]">
          {/* Left Content Area (3/4) */}
          <div className="flex-grow p-10 md:p-16 lg:w-3/4 flex flex-col justify-center">
            <div className="animate-reveal key={current.id}">
              <h3 className="text-2xl md:text-[28px] font-light italic text-slate-700 mb-8 leading-tight">
                “{current.subhead}”
              </h3>
              <p className="text-gray-600 leading-relaxed mb-12 max-w-3xl text-base font-light">
                “{current.quote}”
              </p>
              
              <div className="mb-10">
                <p className="font-semibold text-slate-900 text-sm">
                  {current.author}, <span className="font-medium text-slate-700">{current.role}</span>
                </p>
                <p className="text-gray-400 text-xs mt-1 font-normal tracking-tight">
                  {current.credentials}
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-x-12 gap-y-4 text-sm font-normal">
                <a href="#" className="flex items-center text-cisco-blue hover:text-cisco-navy transition-colors group">
                  View {current.author.split(' ')[0]}’s story 
                  <ChevronRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
                </a>
                <a href="#" className="flex items-center text-cisco-blue hover:text-cisco-navy transition-colors group">
                  Additional Text CTA 
                  <ChevronRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </div>
          </div>
          
          {/* Right Image Area (1/4) */}
          <div className="lg:w-1/4 relative min-h-[300px] lg:min-h-full overflow-hidden border-l border-gray-50">
            <img 
              key={current.image}
              src={current.image} 
              alt={current.author} 
              className="absolute inset-0 w-full h-full object-cover grayscale brightness-95 animate-reveal"
            />
            {/* Branding Overlay */}
            <div className="absolute bottom-6 right-6 text-white font-bold opacity-70 tracking-[0.2em] text-[10px]">
              Hipaa Hub
            </div>
          </div>
        </div>

        {/* Carousel Indicators (Dots) */}
        <div className="flex justify-center mt-12 space-x-3">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === activeTab 
                  ? 'bg-cisco-blue w-2' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
          {/* Mock dots to match the 10 dots in the design screenshot */}
          {[...Array(7)].map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-gray-300 opacity-50 hidden md:block" />
          ))}
        </div>
        
        <div className="mt-16 flex flex-wrap gap-12 justify-center">
          <div className="text-center">
            <p className="text-[10px] font-semibold text-cisco-blue tracking-widest">Result</p>
            <p className="text-sm font-semibold text-cisco-navy mt-1">Audit readiness achieved</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-semibold text-cisco-blue tracking-widest">Timeline</p>
            <p className="text-sm font-semibold text-cisco-navy mt-1">7 business days</p>
          </div>
          <div className="text-center">
             <p className="text-[10px] font-semibold text-cisco-blue tracking-widest">Verified customer</p>
             <p className="text-sm font-semibold text-cisco-navy mt-1">Authenticated user</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;