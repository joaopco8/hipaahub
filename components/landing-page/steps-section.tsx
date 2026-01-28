'use client';

import { 
  ClipboardCheck, 
  Upload, 
  FileText, 
  ShieldCheck, 
  CheckCircle2,
  ArrowRight,
  Zap,
  Lock,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

const steps = [
  {
    number: "01",
    title: "Complete Your Security Risk Analysis",
    subtitle: "150 OCR-aligned questions in plain English",
    description: "Answer a comprehensive questionnaire designed by compliance experts. Each question maps directly to HIPAA requirements, helping you identify vulnerabilities across Administrative, Physical, and Technical Safeguards.",
    example: "Example: \"Do you encrypt PHI in transit?\" → Automatically maps to §164.312(e)(1)",
    icon: ClipboardCheck,
    features: [
      "Guided questionnaire (15-20 minutes)",
      "Auto-save progress",
      "Built-in explanations for each control",
      "Mobile-friendly interface"
    ],
    imagePlaceholder: "/images/telas/Complete Your Security Risk Analysis.png"
  },
  {
    number: "02",
    title: "Upload Evidence & Build Your Audit Defense",
    subtitle: "Link proof directly to HIPAA controls",
    description: "Upload screenshots, signed policies, system logs, training certificates, and vendor agreements. Each piece of evidence is automatically tagged to specific HIPAA controls, creating an auditable chain of compliance.",
    example: "Example: Upload \"Encryption Config Screenshot\" → Auto-links to Technical Safeguards §164.312(a)(2)(iv)",
    icon: Upload,
    features: [
      "Drag-and-drop file upload",
      "Automatic control mapping",
      "Version history tracking",
      "Secure encrypted storage"
    ],
    imagePlaceholder: "/images/telas/Upload Evidence.png"
  },
  {
    number: "03",
    title: "Generate HIPAA Master Policies",
    subtitle: "AI-powered, attorney-reviewed templates",
    description: "Click \"Generate\" and receive 9 fully customized HIPAA policies pre-filled with your clinic's information. Each document includes your uploaded evidence references, making them audit-ready from day one.",
    example: "Example: Master Security Policy auto-populates with your clinic name, officers, and references your uploaded encryption evidence",
    icon: FileText,
    features: [
      "9 mandatory HIPAA documents",
      "Auto-populated with your data",
      "Evidence references embedded",
      "Editable and version-controlled"
    ],
    imagePlaceholder: "/images/telas/tela2.jpg"
  },
  {
    number: "04",
    title: "Review Your Compliance Score & Risk Analysis",
    subtitle: "Real-time vulnerability dashboard",
    description: "See your compliance status at a glance. Our engine calculates your legal exposure score, highlights critical gaps, and provides a prioritized remediation roadmap with step-by-step guidance.",
    example: "Example: \"82% Compliant — 3 Critical Issues Detected\" with actionable fix recommendations",
    icon: Search,
    features: [
      "Visual compliance dashboard",
      "Risk-weighted scoring",
      "Prioritized action items",
      "Estimated remediation time"
    ],
    imagePlaceholder: "/images/telas/Review Your Compliance.png"
  }
];

export default function StepsSection() {
  return (
    <section className="w-full bg-[#0c0b1d] py-24 md:py-32" id="how-it-works">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-20 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1acb77]/10 text-[#1acb77] mb-4">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">HOW IT WORKS</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extralight text-white leading-tight">
              From zero to audit-ready<br />in 4 simple steps
            </h2>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto font-light">
              A structured, guided workflow that takes the complexity out of HIPAA compliance.
              No compliance background required.
            </p>
          </div>

          {/* Steps with alternating layout */}
          <div className="space-y-32">
            {steps.map((step, idx) => (
              <div 
                key={idx} 
                className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${
                  idx % 2 === 1 ? 'lg:grid-flow-dense' : ''
                }`}
              >
                {/* Content */}
                <div className={`space-y-8 ${idx % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                  {/* Step number badge */}
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-[#1acb77] text-white text-2xl font-light flex items-center justify-center shadow-lg">
                      {step.number}
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-[#0c0b1d] text-white flex items-center justify-center shadow-lg">
                      <step.icon className="w-8 h-8" />
                    </div>
                  </div>

                  {/* Title and description */}
                  <div className="space-y-4">
                    <h3 className="text-3xl md:text-4xl font-light text-white leading-tight">
                      {step.title}
                    </h3>
                    <p className="text-lg text-[#1acb77] font-medium">
                      {step.subtitle}
                    </p>
                    <p className="text-lg text-zinc-300 leading-relaxed font-light">
                      {step.description}
                    </p>
                  </div>

                  {/* Practical example */}
                  <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200">
                    <div className="flex items-start gap-3">
                      <Zap className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-900 mb-1">Practical Example</p>
                        <p className="text-sm text-amber-800 font-light">{step.example}</p>
                      </div>
                    </div>
                  </div>

                  {/* Features list */}
                  <div className="space-y-3">
                    {step.features.map((feature, fidx) => (
                      <div key={fidx} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#1acb77] shrink-0" />
                        <span className="text-zinc-300 font-light">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Image */}
                <div className={`relative ${idx % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 bg-white">
                    <Image 
                      src={step.imagePlaceholder} 
                      alt={step.title}
                      width={1200}
                      height={900}
                      quality={100}
                      unoptimized={true}
                      className="w-full h-full object-contain"
                      style={{ transform: 'scale(1.02)' }}
                      priority={idx < 2}
                    />
                  </div>
                  
                  {/* Decorative elements */}
                  <div className="absolute -z-10 top-8 -right-8 w-64 h-64 bg-[#1acb77]/10 rounded-full blur-3xl" />
                  <div className="absolute -z-10 -bottom-8 -left-8 w-64 h-64 bg-[#0c0b1d]/5 rounded-full blur-3xl" />
                </div>
              </div>
            ))}
          </div>

          {/* Final CTA Card */}
          <div className="mt-32 p-12 md:p-16 rounded-[3rem] bg-[#0c0b1d] text-white relative overflow-hidden group">
            {/* Background effect */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-[#1acb77]/10 blur-[120px] rounded-full translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-1/2 h-full bg-[#1acb77]/5 blur-[100px] rounded-full -translate-x-1/2" />
            
            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1acb77]/20 border border-[#1acb77]/30">
                  <ShieldCheck className="w-5 h-5 text-[#1acb77]" />
                  <span className="text-sm font-medium">Result</span>
                </div>
                <h3 className="text-4xl md:text-5xl font-extralight leading-tight">
                  You&apos;re 100% audit-ready and legally defensible
                </h3>
                <p className="text-xl text-white/70 font-light leading-relaxed">
                  Your entire compliance infrastructure — documented, evidenced, and ready for regulatory inspection.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link href="/signup">
                    <Button 
                      size="lg" 
                      className="bg-[#1acb77] text-[#0d0d1f] hover:bg-white hover:text-[#0d0d1f] rounded-xl h-14 px-8 text-lg font-light shadow-xl"
                    >
                      Get Started
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="relative">
                <div className="w-full aspect-square max-w-md mx-auto rounded-full bg-[#1acb77] flex items-center justify-center shadow-[0_0_100px_rgba(26,203,119,0.3)] group-hover:scale-105 transition-transform duration-700">
                  <ShieldCheck className="w-32 h-32 md:w-40 md:h-40 text-white" />
                </div>
                {/* Decorative rings */}
                <div className="absolute inset-0 rounded-full border-2 border-[#1acb77]/30 scale-110 animate-pulse" />
                <div className="absolute inset-0 rounded-full border-2 border-[#1acb77]/20 scale-125 animate-pulse delay-150" />
              </div>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Lock, label: "Bank-level encryption", value: "AES-256" },
              { icon: ShieldCheck, label: "HIPAA Compliant", value: "Certified" },
              { icon: CheckCircle2, label: "Uptime SLA", value: "99.9%" },
              { icon: Zap, label: "Avg. Setup Time", value: "< 2 hours" }
            ].map((stat, idx) => (
              <div key={idx} className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[#1acb77]/10 flex items-center justify-center mx-auto">
                  <stat.icon className="w-6 h-6 text-[#1acb77]" />
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-light text-[#0c0b1d]">{stat.value}</p>
                  <p className="text-sm text-zinc-600 font-light">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
