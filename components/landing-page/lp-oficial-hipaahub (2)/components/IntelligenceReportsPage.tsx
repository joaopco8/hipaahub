import React from 'react';
import { FileText, Download, BarChart3, ShieldAlert, Zap, Globe, ArrowRight, BookOpen, Search } from 'lucide-react';

const ReportCard: React.FC<{
  title: string;
  category: string;
  date: string;
  pages: number;
  image: string;
  desc: string;
}> = ({ title, category, date, pages, image, desc }) => (
  <div className="bg-white border border-gray-100 group overflow-hidden flex flex-col h-full hover:shadow-2xl transition-all duration-500">
    <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
      <img src={image} alt={title} className="w-full h-full object-cover grayscale brightness-90 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
      <div className="absolute top-0 left-0 bg-cisco-blue text-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest">
        {category}
      </div>
    </div>
    <div className="p-8 flex-grow flex flex-col">
      <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 mb-4">
        <span>{date}</span>
        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
        <span>{pages} PAGES</span>
      </div>
      <h4 className="text-xl font-light text-cisco-navy mb-4 leading-tight group-hover:text-cisco-blue transition-colors">{title}</h4>
      <p className="text-gray-500 text-sm font-light leading-relaxed mb-8">{desc}</p>
      <button className="mt-auto flex items-center text-[11px] font-bold text-cisco-navy hover:text-cisco-blue transition-colors group/btn">
        <Download size={14} className="mr-2" /> DOWNLOAD PUBLICATION <ArrowRight size={14} className="ml-2 opacity-0 group-hover/btn:opacity-100 transition-all translate-x-[-10px] group-hover/btn:translate-x-0" />
      </button>
    </div>
  </div>
);

const IntelligenceReportsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="bg-white min-h-screen">
      <div className="bg-white border-b py-2 px-4 md:px-12 text-[10px] text-gray-400">
        <div className="max-w-7xl mx-auto flex items-center space-x-2">
          <button onClick={onBack} className="hover:text-cisco-blue">Research</button>
          <span>/</span>
          <span className="text-gray-900 font-bold">Intelligence Reports</span>
        </div>
      </div>

      <section className="bg-cisco-navy text-white py-24 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50/10 text-cisco-blue text-[10px] font-bold mb-8 uppercase tracking-widest border border-cisco-blue/20">
                <Globe size={14} /> Market Intelligence
              </div>
              <h1 className="text-4xl md:text-6xl font-light leading-tight mb-8">
                Clinical Security <br /> Intelligence.
              </h1>
              <p className="text-gray-300 text-lg md:text-xl font-light leading-relaxed mb-10 border-l-2 border-cisco-blue pl-8">
                High-fidelity research on healthcare market exposure, 
                cybersecurity threat vectors, and institutional risk patterns.
              </p>
              <div className="flex flex-wrap gap-8 py-8 border-t border-white/10">
                 <div>
                   <p className="text-3xl font-light text-cisco-blue">140+</p>
                   <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">Breaches Analyzed</p>
                 </div>
                 <div>
                   <p className="text-3xl font-light text-cisco-blue">$1.2B</p>
                   <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">Liability Quantified</p>
                 </div>
                 <div>
                   <p className="text-3xl font-light text-cisco-blue">2026</p>
                   <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">Projection Cycle</p>
                 </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-12 shadow-2xl overflow-hidden group">
                 <Search className="absolute -bottom-10 -right-10 w-48 h-48 text-white/5 group-hover:text-cisco-blue/5 transition-colors" />
                 <h4 className="text-xs font-bold text-cisco-blue uppercase tracking-widest mb-10">Current Priority Report</h4>
                 <h3 className="text-3xl font-light mb-6">2026 Healthcare Threat Landscape</h3>
                 <p className="text-gray-400 font-light text-base leading-relaxed mb-12">
                   Our annual flagship report analyzing the evolution of ransomware, 
                   third-party risk, and federal enforcement strategies for the next 24 months.
                 </p>
                 <button className="bg-cisco-blue text-white px-10 py-5 text-sm font-bold hover:bg-white hover:text-cisco-navy transition-all">
                   Access Exclusive Report
                 </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="flex justify-between items-end mb-16 border-b pb-12 border-gray-200">
            <div>
              <h2 className="text-3xl font-light text-cisco-navy">Intelligence Publication Library</h2>
              <p className="text-gray-500 font-light mt-2">Specialized research curated for medical boards and clinical directors.</p>
            </div>
            <div className="hidden md:flex gap-4">
              <button className="px-6 py-2 bg-white border border-gray-100 text-xs font-bold text-gray-400 hover:text-cisco-blue transition-colors">ALL TOPICS</button>
              <button className="px-6 py-2 bg-white border border-gray-100 text-xs font-bold text-gray-400 hover:text-cisco-blue transition-colors">SECURITY</button>
              <button className="px-6 py-2 bg-white border border-gray-100 text-xs font-bold text-gray-400 hover:text-cisco-blue transition-colors">MARKET</button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ReportCard 
              category="CYBERSECURITY"
              date="OCT 2025"
              pages={42}
              image="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800"
              title="Ransomware Vectors in Private Practice"
              desc="Analysis of the top 5 entry points utilized by threat actors targeting clinics with < 50 staff."
            />
            <ReportCard 
              category="MARKET RESEARCH"
              date="SEP 2025"
              pages={28}
              image="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800"
              title="State of HIPAA SaaS 2026"
              desc="Comparison of platform adoption rates and compliance success metrics across healthcare verticals."
            />
            <ReportCard 
              category="AUDIT INTELLIGENCE"
              date="AUG 2025"
              pages={36}
              image="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800"
              title="OCR Settlement Trends Analysis"
              desc="Deep dive into federal settlement data to identify the cost of non-compliance in the current era."
            />
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
           <Zap className="text-amber-500 mx-auto mb-8" size={48} strokeWidth={1} />
           <h2 className="text-3xl md:text-5xl font-light text-cisco-navy mb-8">Actionable Briefings.</h2>
           <p className="text-gray-500 text-lg font-light leading-relaxed mb-12">
             Our intelligence division doesn't just provide data; we provide institutional clarity 
             that allows leadership to allocate security resources with surgical precision.
           </p>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: "Data Integrity", val: "Verified" },
                { label: "Source Bias", val: "Neutral" },
                { label: "Methodology", val: "Audit-Grade" },
                { label: "Frequency", val: "Monthly" }
              ].map((item, i) => (
                <div key={i} className="p-6 border border-gray-50">
                  <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">{item.label}</p>
                  <p className="text-base font-bold text-cisco-navy">{item.val}</p>
                </div>
              ))}
           </div>
        </div>
      </section>
    </div>
  );
};

export default IntelligenceReportsPage;