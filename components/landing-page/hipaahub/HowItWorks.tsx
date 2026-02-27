import React from 'react';
import { FileText, FolderOpen, GraduationCap, AlertTriangle, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

const FeatureCard: React.FC<{ 
  title: string;
  subtitle: string;
  description: string;
  items?: string[];
  icon: React.ReactNode;
}> = ({ title, subtitle, description, items, icon }) => (
  <div className="bg-white/5 backdrop-blur-md border border-white/10 p-10 flex flex-col h-full hover:bg-white/10 transition-all duration-300 group">
    <div className="mb-6">
      <div className="text-cisco-blue mb-4 group-hover:scale-110 transition-transform inline-block">
        {icon}
      </div>
      <h3 className="text-xl font-thin text-white mb-2">{title}</h3>
      <p className="text-sm font-thin text-cisco-blue mb-4">{subtitle}</p>
    </div>
    <p className="text-gray-300 text-[15px] font-thin leading-relaxed mb-6 flex-grow">
      {description}
    </p>
    {items && items.length > 0 && (
      <div className="pt-6 border-t border-white/10">
        <p className="text-xs font-thin text-gray-400 mb-3">Policies:</p>
        <div className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <span key={i} className="text-xs font-thin text-gray-300 bg-white/5 px-3 py-1.5 border border-white/10">
              {item}
            </span>
          ))}
        </div>
      </div>
    )}
  </div>
);

const CTACard: React.FC<{ 
  title: string;
  description: string;
  ctaText: string;
  icon: React.ReactNode;
}> = ({ title, description, ctaText, icon }) => (
  <div className="bg-white/5 backdrop-blur-md border border-white/10 p-10 flex flex-col h-full hover:bg-white/10 transition-all duration-300 group">
    <div className="mb-6">
      <div className="text-cisco-green mb-4 group-hover:scale-110 transition-transform inline-block">
        {icon}
      </div>
      <h3 className="text-xl font-thin text-white mb-4">{title}</h3>
    </div>
    <p className="text-gray-300 text-[15px] font-thin leading-relaxed mb-8 flex-grow">
      {description}
    </p>
    <button className="bg-cisco-green text-cisco-navy px-8 py-4 text-sm font-thin hover:bg-white hover:text-cisco-navy transition-all flex items-center justify-center gap-3 group-hover:shadow-lg shadow-cisco-green/20">
      {ctaText}
      <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
    </button>
  </div>
);

const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-24 bg-cisco-navy border-t border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-[54px] font-thin text-white leading-[1.2] mb-6">
            Complete Compliance Infrastructure
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard 
            icon={<FileText size={32} strokeWidth={1} />}
            title="Policy Management"
            subtitle="9 Customizable HIPAA Policies"
            description="Pre-built templates aligned with OCR guidance. Customizable to your workflows. Version control included."
            items={[
              "Privacy",
              "Security",
              "Breach Notification",
              "Access Control",
              "Audit & Accountability",
              "Encryption",
              "Incident Response",
              "Business Associate Agreement",
              "Workforce Security"
            ]}
          />
          <FeatureCard 
            icon={<FolderOpen size={32} strokeWidth={1} />}
            title="Centralized Documentation"
            subtitle="Secure Documentation Repository"
            description="Upload and organize all compliance documentation. Full-text search. One-click evidence package export."
          />
          <FeatureCard 
            icon={<GraduationCap size={32} strokeWidth={1} />}
            title="Training Management"
            subtitle="Workforce Training & Certification"
            description="Pre-built modules. Track completion. Automated annual refresher reminders. Compliance reports."
          />
          <FeatureCard 
            icon={<AlertTriangle size={32} strokeWidth={1} />}
            title="Breach Response"
            subtitle="Incident Response & Breach Notification"
            description="Breach response templates. 72-hour notification guidance. Incident documentation. Priority support."
          />
          <FeatureCard 
            icon={<ShieldCheck size={32} strokeWidth={1} />}
            title="Audit Readiness"
            subtitle="One-Click Audit Evidence Export"
            description="Compile all evidence into organized package. Export to PDF. Auditors receive comprehensive documentation within hours."
          />
          <CTACard 
            icon={<CheckCircle2 size={32} strokeWidth={1} />}
            title="Ready to Get Started?"
            description="Join 500+ healthcare organizations that trust HIPAA Hub for continuous compliance. Transform your compliance posture today."
            ctaText="Get Started"
          />
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
