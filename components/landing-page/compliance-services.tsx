'use client';

import { useState } from 'react';
import { ArrowUpRight, FileText, Shield, ClipboardCheck, FileCheck, Users, Lock, Hand, Coins, PiggyBank } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';

const services = [
  {
    id: 'document-generation',
    title: 'Document Generation',
    description: 'A flexible and convenient way to access all required HIPAA documents. Use it as you need it and generate documents tailored to your practice. Perfect for compliance requirements.',
    icon: FileText,
    features: [
      { icon: Hand, text: 'Easy access to documents as and when needed' },
      { icon: Coins, text: 'Flexible editing and approval options' },
      { icon: PiggyBank, text: 'Version control and audit trail included' }
    ]
  },
  {
    id: 'risk-assessment',
    title: 'Risk Assessment',
    description: 'Comprehensive risk analysis to identify vulnerabilities and ensure your practice meets all HIPAA requirements. Get actionable recommendations tailored to your needs.',
    icon: Shield,
    features: [
      { icon: Hand, text: 'Automated risk identification' },
      { icon: Coins, text: 'Prioritized remediation steps' },
      { icon: PiggyBank, text: 'Ongoing compliance monitoring' }
    ]
  },
  {
    id: 'employee-training',
    title: 'Employee Training',
    description: 'Comprehensive HIPAA training modules for your staff. Track completion, issue certificates, and maintain compliance records for audit readiness.',
    icon: Users,
    features: [
      { icon: Hand, text: 'Interactive training modules' },
      { icon: Coins, text: 'Automated certification' },
      { icon: PiggyBank, text: 'Complete training records' }
    ]
  }
];

export default function ComplianceServices() {
  const [activeService, setActiveService] = useState(services[0]);

  return (
    <section className="relative w-full bg-white py-24 md:py-32">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-5xl md:text-6xl font-geologica font-light text-[#0d1122] leading-tight">
            Compliance{' '}
            <span className="relative inline-block font-normal">
              Freedom
              <ArrowUpRight className="absolute -top-1 -right-8 w-8 h-8 text-hipaa-green" />
            </span>{' '}
            with HIPAA Hub
          </h2>
          <p className="text-lg md:text-xl text-[#0d1122]/70 font-geologica font-light max-w-3xl mx-auto leading-relaxed">
            Our offerings are tailored to meet the unique needs and challenges of each healthcare practice, and are designed to provide the compliance and support necessary to help businesses reach their full potential.
          </p>
        </div>

        {/* Service Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <button
                key={service.id}
                onClick={() => setActiveService(service)}
                className={cn(
                  'px-6 py-4 rounded-xl font-geologica font-light transition-all duration-300 text-sm',
                  activeService.id === service.id
                    ? 'bg-hipaa-green text-hipaa-dark border-2 border-hipaa-green'
                    : 'bg-white text-[#0d1122]/70 border-2 border-[#0d1122]/10 hover:border-hipaa-green/30 hover:text-[#0d1122]'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{service.title}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Service Details */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Panel - Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-4xl md:text-5xl font-geologica font-light text-[#0d1122] leading-tight">
                {activeService.title}
              </h3>
              <p className="text-lg text-[#0d1122]/70 font-geologica font-light leading-relaxed">
                {activeService.description}
              </p>
            </div>

            {/* Benefits List */}
            <div className="space-y-4 pt-4">
              <h4 className="text-lg font-geologica font-light text-[#0d1122] mb-2">Benefits</h4>
              {activeService.features.map((feature, index) => {
                const FeatureIcon = feature.icon;
                return (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-hipaa-green/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FeatureIcon className="w-4 h-4 text-hipaa-green" />
                    </div>
                    <span className="text-[#0d1122]/80 font-geologica text-base font-light pt-1">
                      {feature.text}
                    </span>
                  </div>
                );
              })}
            </div>

            <Link
              href="/signup"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'bg-hipaa-green text-hipaa-dark font-geologica font-medium hover:bg-hipaa-green/90 rounded-lg px-8 py-6 text-base inline-flex items-center gap-2 mt-6'
              )}
            >
              GET STARTED
              <ArrowUpRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Right Panel - Image Placeholder */}
          <div className="relative">
            <div className="relative w-full h-[450px] rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 bg-white/50 rounded-full flex items-center justify-center border border-gray-300">
                  <activeService.icon className="w-24 h-24 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
