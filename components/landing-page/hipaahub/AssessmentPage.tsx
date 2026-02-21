
import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  Lock, 
  ClipboardCheck, 
  FileText, 
  UserCheck, 
  ChevronRight,
  Info,
  CheckCircle2
} from 'lucide-react';

const FormField: React.FC<{ 
  label: string; 
  id: string; 
  type?: string; 
  placeholder?: string;
  options?: string[];
}> = ({ label, id, type = "text", placeholder, options }) => (
  <div className="space-y-2">
    <label htmlFor={id} className="text-[10px] font-bold text-gray-400">
      {label}
    </label>
    {options ? (
      <select 
        id={id} 
        className="w-full bg-transparent border-b border-gray-200 py-3 focus:outline-none focus:border-cisco-blue transition-colors text-sm appearance-none"
      >
        <option value="" disabled selected>{placeholder || "Select option"}</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    ) : (
      <input 
        id={id}
        type={type} 
        placeholder={placeholder}
        className="w-full bg-transparent border-b border-gray-200 py-3 focus:outline-none focus:border-cisco-blue transition-colors text-sm"
      />
    )}
  </div>
);

const AssessmentPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    window.scrollTo(0, 0);
  };

  if (formSubmitted) {
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center px-4 py-24">
        <div className="max-w-xl text-center">
          <div className="w-24 h-24 bg-blue-50 text-cisco-blue rounded-full flex items-center justify-center mx-auto mb-10">
            <CheckCircle2 size={48} strokeWidth={1} />
          </div>
          <h2 className="text-4xl font-thin text-cisco-navy mb-6">Assessment Request Received.</h2>
          <p className="text-gray-500 text-lg font-thin leading-relaxed mb-12">
            A regulatory specialist has been assigned to your case. We will contact you within 24 business hours 
            at the institutional email provided to schedule your 30-minute posture review.
          </p>
          <button 
            onClick={onBack}
            className="bg-cisco-navy text-white px-10 py-4 text-sm font-thin hover:bg-cisco-blue transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumbs */}
      <div className="bg-white border-b py-3 px-4 md:px-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[10px] text-gray-400">
            <button onClick={onBack} className="hover:text-cisco-blue transition-colors">Healthcare Administration</button>
            <span className="text-gray-200">/</span>
            <span className="text-cisco-navy font-semibold">Regulatory Exposure Assessment</span>
          </div>
          <div className="hidden md:flex items-center text-[10px] font-bold text-gray-400 gap-4">
             <span className="flex items-center gap-1.5"><Lock size={12} className="text-cisco-green" /> 256-bit Secure</span>
             <span className="flex items-center gap-1.5"><Info size={12} /> Confidential</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-white pt-24 pb-16 md:pt-32 md:pb-24 border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-thin text-cisco-navy leading-tight mb-8">
              Regulatory Exposure <br /> Assessment.
            </h1>
            <p className="text-gray-500 text-lg md:text-2xl font-thin leading-relaxed max-w-2xl">
              Professional evaluation for small practices and clinical groups. 
              Determine your audit defensibility score in 30 minutes.
            </p>
          </div>
        </div>
      </section>

      {/* Form Area */}
      <section className="py-24 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-12 grid lg:grid-cols-5 gap-20">
          
          {/* Left Column: Context & Trust */}
          <div className="lg:col-span-2 space-y-16">
            <div>
              <h3 className="text-2xl font-thin text-cisco-navy mb-8">What to expect.</h3>
              <div className="space-y-10">
                {[
                  { 
                    icon: <UserCheck size={20} />, 
                    title: "Specialist Assignment", 
                    desc: "An expert consultant with direct OCR audit experience reviews your application." 
                  },
                  { 
                    icon: <Clock size={20} />, 
                    title: "30-Minute Review", 
                    desc: "A brief, highly-focused call to identify critical regulatory gaps." 
                  },
                  { 
                    icon: <FileText size={20} />, 
                    title: "Exposure Score", 
                    desc: "Receive a preliminary defensibility score based on NIST standards." 
                  }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="flex-shrink-0 w-10 h-10 bg-white border border-gray-100 flex items-center justify-center text-cisco-blue shadow-sm">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-cisco-navy mb-1">{item.title}</h4>
                      <p className="text-gray-500 text-sm font-thin leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-cisco-navy p-10 text-white shadow-2xl relative">
              <ShieldCheck className="text-cisco-green mb-6" size={32} />
              <h4 className="text-xl font-thin mb-6 tracking-tight">Confidentiality Guarantee</h4>
              <p className="text-gray-400 text-xs font-thin leading-relaxed mb-8">
                All information submitted is protected under our master BAA protocol. 
                Your organizational data remains strictly confidential and is used solely 
                for regulatory posture evaluation.
              </p>
              <div className="flex items-center gap-4 border-t border-white/10 pt-8">
                 <div className="w-10 h-10 rounded-full bg-gray-400 overflow-hidden grayscale">
                    <img src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200" alt="Consultant" />
                 </div>
                 <div>
                    <p className="text-[10px] font-bold">Consultant Assigned</p>
                    <p className="text-xs text-blue-400">Audit Response Team</p>
                 </div>
              </div>
            </div>
          </div>

          {/* Right Column: The Qualified Form */}
          <div className="lg:col-span-3">
            <div className="bg-white p-10 md:p-16 shadow-xl border border-gray-100 relative">
              <div className="absolute top-0 right-0 p-10 hidden md:block opacity-5">
                 <ClipboardCheck size={120} />
              </div>

              <h3 className="text-2xl font-thin text-cisco-navy mb-12 tracking-tight">Organization Profile</h3>
              
              <form onSubmit={handleSubmit} className="space-y-12">
                {/* Section 1: Contact Info */}
                <div className="grid md:grid-cols-2 gap-10">
                  <FormField label="Full Name" id="name" placeholder="Dr. Jane Smith" />
                  <FormField label="Institutional Email" id="email" type="email" placeholder="jane.smith@clinic.com" />
                </div>

                {/* Section 2: Clinical Footprint */}
                <div className="grid md:grid-cols-2 gap-10">
                  <FormField 
                    label="Number of staff" 
                    id="staff" 
                    options={["1-5 Members", "6-15 Members", "16-50 Members", "50+ Members"]} 
                    placeholder="Select headcount"
                  />
                  <FormField 
                    label="EHR used" 
                    id="ehr" 
                    options={["Epic", "Cerner", "Athenahealth", "eClinicalWorks", "Allscripts", "NextGen", "Other/Legacy"]} 
                    placeholder="Select primary EHR"
                  />
                </div>

                {/* Section 3: IT & History */}
                <div className="grid md:grid-cols-2 gap-10">
                  <FormField 
                    label="IT provider" 
                    id="it" 
                    options={["Internal Team", "Managed Service Provider (MSP)", "Individual Contractor", "No Dedicated Support"]} 
                    placeholder="Select support type"
                  />
                  <FormField 
                    label="Last risk assessment" 
                    id="last_sra" 
                    options={["Within last 6 months", "Within last year", "2+ years ago", "Never conducted"]} 
                    placeholder="Select timeline"
                  />
                </div>

                {/* Section 4: Location */}
                <div className="grid md:grid-cols-2 gap-10">
                  <FormField label="Practice Location (State)" id="location" placeholder="e.g. California" />
                  <FormField label="Clinical Specialty" id="specialty" placeholder="e.g. Dental, Primary Care" />
                </div>

                <div className="pt-10 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-8">
                  <p className="text-[10px] text-gray-400 font-thin max-w-[200px] leading-relaxed">
                    By submitting, you agree to our institutional privacy framework.
                  </p>
                  <button 
                    type="submit"
                    className="w-full md:w-auto bg-cisco-blue text-white px-12 py-5 text-sm font-thin transition-all flex items-center justify-center gap-3"
                  >
                    Submit Assessment Request <ChevronRight size={18} />
                  </button>
                </div>
              </form>
            </div>
            
            <div className="mt-12 flex items-center justify-center gap-12 text-gray-400 opacity-60 grayscale filter">
               <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Health_and_Human_Services_Logo.svg/2000px-Health_and_Human_Services_Logo.svg.png" className="h-8 object-contain" alt="HHS" />
               <img src="https://www.hhs.gov/sites/default/files/ocr-logo-blue.png" className="h-6 object-contain" alt="OCR" />
               <div className="text-[10px] font-bold">NIST Benchmark Aligned</div>
            </div>
          </div>
        </div>
      </section>

      {/* Strategy Section */}
      <section className="py-24 bg-white border-t">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-thin text-cisco-navy mb-10">Institutional Response <br /> Methodology.</h2>
          <p className="text-gray-500 text-lg md:text-xl font-thin mb-12 leading-relaxed">
            Our assessment uses the same evaluation protocols utilized by federal auditors 
            to identify high-risk areas before they become liability vectors.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {["Technical", "Physical", "Administrative", "Organizational"].map(cat => (
              <div key={cat} className="p-6 bg-gray-50 border border-gray-100">
                <p className="text-[10px] font-bold text-cisco-blue">{cat}</p>
                <p className="text-xs text-cisco-navy mt-2 font-thin">Safeguard Audit</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AssessmentPage;
