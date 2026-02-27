import React from 'react';
import Image from 'next/image';
import { 
  ShieldCheck, 
  Cpu, 
  FileText, 
  Database, 
  Users, 
  ShieldAlert, 
  Archive, 
  Activity, 
  CheckCircle2, 
  ArrowRight,
  Zap,
  Lock,
  Eye,
  RefreshCw
} from 'lucide-react';

const FeatureBlock: React.FC<{
  title: string;
  list: string[];
  icon: React.ReactNode;
  hasPhoto?: boolean;
  imageSrc?: string;
}> = ({ title, list, icon, hasPhoto, imageSrc }) => (
  <div className="bg-white border border-gray-100 hover:shadow-xl transition-all duration-500 group flex flex-col">
    <div className="p-8 pb-4">
        <div className="text-cisco-blue mb-6 group-hover:scale-110 transition-transform">{icon}</div>
        <h4 className="text-lg font-bold text-cisco-navy mb-6 border-b border-gray-200 pb-4">{title}</h4>
        <ul className="space-y-3 mb-6">
        {list.map((item, i) => (
            <li key={i} className="flex items-start text-sm text-gray-600 font-thin leading-snug">
            <span className="w-1.5 h-1.5 bg-cisco-blue rounded-full mt-1.5 mr-3 flex-shrink-0 opacity-40"></span>
            {item}
            </li>
        ))}
        </ul>
    </div>
    
    {hasPhoto && imageSrc && (
      <div className="mt-auto border-t border-gray-200 bg-gray-50/50 aspect-video overflow-hidden relative">
         <Image 
           src={imageSrc} 
           alt={title}
           fill
           className="object-cover"
           quality={95}
           sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
         />
      </div>
    )}
    {hasPhoto && !imageSrc && (
      <div className="mt-auto border-t border-gray-200 bg-gray-50/50 aspect-video flex flex-col items-center justify-center p-6 text-center">
         <div className="w-full h-full border border-dashed border-gray-300 rounded flex items-center justify-center bg-white/80">
            <span className="text-[10px] font-bold text-gray-400 leading-tight">Feature Screenshot <br /> Placeholder</span>
         </div>
      </div>
    )}
  </div>
);

const PlatformPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const handleGetStarted = () => {
    onBack();
    // Wait a bit for the page to render, then scroll to pricing
    setTimeout(() => {
      const pricingSection = document.getElementById('pricing');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Sub-Nav */}
      <div className="bg-white border-b py-3 px-4 md:px-12 sticky top-[73px] z-[90]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[10px] text-gray-400">
            <button onClick={onBack} className="hover:text-cisco-blue transition-colors">Healthcare Administration</button>
            <span className="text-gray-200">/</span>
            <span className="text-cisco-navy font-semibold">HIPAA Hub Platform</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-white py-24 border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-thin text-cisco-navy leading-[1.2] mb-8">
              Centralized <br /> Compliance <br /> Infrastructure.
            </h1>
            <h3 className="text-xl md:text-2xl font-thin text-gray-400 mb-10 border-l-2 border-gray-200 pl-8">
              One platform for policies, documentation, training records, and audit evidence.
            </h3>
            <p className="text-gray-600 text-lg md:text-xl font-thin leading-relaxed max-w-2xl mb-12">
              HIPAA Hub is a compliance platform designed specifically for healthcare organizations. It centralizes all compliance documentation, automates compliance monitoring, and maintains continuous audit readiness.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureBlock 
              title="Risk Assessment Engine"
              icon={<Cpu size={32} strokeWidth={1} />}
              hasPhoto
              imageSrc="/images/Risk Assessment Engine.jpg"
              list={[
                "Automated risk identification",
                "Organizational risk scoring (0-100)",
                "Vulnerability prioritization",
                "Remediation roadmap generation",
                "Quarterly risk reassessment"
              ]}
            />
            <FeatureBlock 
              title="Policy Generator"
              icon={<FileText size={32} strokeWidth={1} />}
              hasPhoto
              imageSrc="/images/Policy Generator.jpg"
              list={[
                "9 customizable HIPAA policies",
                "Versioning and change tracking",
                "Automated policy distribution",
                "Staff acknowledgment tracking",
                "Annual review scheduling"
              ]}
            />
            <FeatureBlock 
              title="Employee Training"
              icon={<Users size={32} strokeWidth={1} />}
              hasPhoto
              imageSrc="/images/Employee Training.jpg"
              list={[
                "HIPAA training program management",
                "Employee completion tracking",
                "Training certificate generation",
                "Renewal date monitoring",
                "Compliance training records"
              ]}
            />
            <FeatureBlock 
              title="Breach Notification Builder"
              icon={<ShieldAlert size={32} strokeWidth={1} />}
              hasPhoto
              imageSrc="/images/Breach Notification Builder.jpg"
              list={[
                "Notification letter templates",
                "Incident response protocols",
                "Regulatory timeline tracker",
                "Evidence collection vault",
                "48-hour response support"
              ]}
            />
            <FeatureBlock 
              title="Export Audit"
              icon={<Archive size={32} strokeWidth={1} />}
              hasPhoto
              imageSrc="/images/Export Audit.jpg"
              list={[
                "Structured audit package generation",
                "Professional PDF documentation",
                "Complete compliance evidence export",
                "Regulatory-ready ZIP archives",
                "One-click audit preparation"
              ]}
            />
            <FeatureBlock 
              title="Evidence Center"
              icon={<Archive size={32} strokeWidth={1} />}
              hasPhoto
              imageSrc="/images/Evidence Center.jpg"
              list={[
                "Centralized evidence repository",
                "Document upload and organization",
                "Evidence categorization by HIPAA requirement",
                "Version control and tracking",
                "Audit-ready evidence packages"
              ]}
            />
          </div>
          
          <div className="mt-8 bg-white border border-gray-200 p-8 flex flex-col md:flex-row items-center justify-between gap-8">
             <div className="flex items-center gap-6">
                <Activity className="text-cisco-blue" size={40} />
                <div>
                  <h4 className="text-sm font-bold text-cisco-navy">Compliance Monitoring</h4>
                  <p className="text-gray-500 text-xs font-thin mt-1">Quarterly reviews, annual assessments, and regulatory update alerts.</p>
                </div>
             </div>
             <button className="bg-cisco-navy text-white px-10 py-4 text-xs font-bold hover:bg-cisco-blue transition-all">
                Request Platform Demo
             </button>
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="bg-cisco-navy py-24 md:py-32 overflow-hidden text-center text-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center justify-center p-4 bg-white/10 rounded-full mb-8">
            <Cpu size={32} className="text-cisco-blue" />
          </div>
          <h2 className="text-4xl md:text-6xl font-thin mb-10 leading-[1.2]">Transform Your <br /> Compliance Posture.</h2>
          <p className="text-gray-400 text-lg md:text-xl font-thin mb-12 leading-relaxed max-w-2xl mx-auto">
            HIPAA Hub transforms compliance from reactive crisis management into continuous operational infrastructure. Join 500+ healthcare organizations that trust us.
          </p>
          <button 
            onClick={handleGetStarted}
            className="bg-cisco-blue text-white px-12 py-5 text-sm font-bold hover:bg-white hover:text-cisco-navy transition-all group flex items-center mx-auto"
          >
            Get Started <ArrowRight size={18} className="ml-3 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default PlatformPage;
