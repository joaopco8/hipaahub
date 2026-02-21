import React from 'react';
import { ChevronRight, CheckCircle2, Shield, Zap, FileText, Users, Search, Archive, Activity } from 'lucide-react';

const WhatsIncluded: React.FC = () => {
  const policies = [
    "Privacy Policy", "Security Policy", "Breach Notification Policy",
    "Access Control Policy", "Audit & Accountability Policy", "Encryption Policy",
    "Incident Response Policy", "Business Associate Agreement", "Workforce Security Policy"
  ];

  const features = [
    { title: "Automated Documentation", icon: <FileText size={18} />, text: "Policy versioning, tracking, and compliance audit trail." },
    { title: "Training Management", icon: <Users size={18} />, text: "Pre-built modules, certification tracking, and reminders." },
    { title: "Breach Response", icon: <Shield size={18} />, text: "Templates, incident protocols, and 48-hour support." },
    { title: "Audit Readiness", icon: <Archive size={18} />, text: "One-click export and evidence package compilation." },
  ];

  return (
    <section id="features" className="relative bg-cisco-navy py-20 md:py-32 overflow-hidden border-t border-white/5">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=2000" 
          alt="Healthcare background" 
          className="w-full h-full object-cover opacity-[0.05] mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-cisco-navy via-transparent to-cisco-navy"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-12">
        <div className="text-center max-w-4xl mx-auto mb-16 md:mb-24">
          <h2 className="text-4xl lg:text-[56px] font-thin mb-8 leading-[1.25] text-white">
            Everything You Need for <br /> Audit Readiness.
          </h2>
          <p className="text-gray-300 text-lg md:text-xl font-thin leading-relaxed">
            Complete compliance infrastructure in one platform.
          </p>
        </div>

        {/* Large Platform Overview Photo */}
        <div className="mb-20 bg-white/5 border border-white/10 aspect-[21/9] overflow-hidden rounded-none">
          <img 
            src="/Sem Título-1_upscayl_2x_ultramix-balanced-4x.png" 
            alt="HIPAA Hub Platform Overview" 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-16 md:gap-24">
          {/* Policy List */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-10">
            <div className="flex items-center gap-4 mb-10 border-b border-white/10 pb-6">
              <Zap className="text-cisco-blue" />
              <h4 className="text-base font-thin text-white">9 Customizable HIPAA Policies</h4>
            </div>
            <p className="text-gray-400 text-base mb-8 font-thin">Pre-built policy templates customized to your organization:</p>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
              {policies.map((p, i) => (
                <div key={i} className="flex items-center text-gray-300 font-thin group">
                  <CheckCircle2 size={16} className="text-cisco-blue mr-3 opacity-60 group-hover:opacity-100" />
                  <span className="text-base">{p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Feature Blocks */}
          <div className="grid sm:grid-cols-1 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 p-8 flex gap-6 group hover:bg-white/10 transition-all">
                <div className="text-cisco-blue mt-1 group-hover:scale-110 transition-transform">{f.icon}</div>
                <div>
                  <h4 className="text-base font-thin text-white mb-2">{f.title}</h4>
                  <p className="text-gray-400 text-sm font-thin leading-relaxed">{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 pt-10 border-t border-white/10 flex flex-col md:flex-row items-center justify-center gap-10">
           <button className="bg-cisco-blue text-white px-10 py-5 text-sm font-thin hover:bg-white hover:text-cisco-navy transition-all">
             Request Platform Demo
           </button>
           <div className="flex items-center gap-4 text-gray-400 text-xs font-thin">
             <Activity className="text-cisco-blue" size={20} /> Continuous Compliance Monitoring Included
           </div>
        </div>
      </div>
    </section>
  );
};

export default WhatsIncluded;
