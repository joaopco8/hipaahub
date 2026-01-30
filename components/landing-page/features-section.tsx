'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card-header';
import { Shield, HelpCircle, Gauge, FileText, Lock, CreditCard, TrendingUp, ArrowRight, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const features = [
  {
    title: 'Expert Advice and Support',
    description: 'Our dedicated team is here to help you in every step of the way, with expert guidance and tailored advice for HIPAA compliance.',
    icon: HelpCircle,
    bgColor: 'bg-white',
    textColor: 'text-[#0d1122]',
    iconColor: 'text-hipaa-green'
  },
  {
    title: 'Quick Compliance Setup',
    description: 'Get your HIPAA compliance documents generated and approved in as little as 24 hours with our AI-powered system.',
    icon: Gauge,
    bgColor: 'bg-white',
    textColor: 'text-[#0d1122]',
    iconColor: 'text-hipaa-green'
  },
  {
    title: 'Wide Range of Compliance Tools',
    description: 'Choose from a variety of compliance solutions, including document generation, risk assessment, and employee training.',
    icon: Wrench,
    bgColor: 'bg-white',
    textColor: 'text-[#0d1122]',
    iconColor: 'text-hipaa-green'
  },
  {
    title: 'Privacy and Security',
    description: 'Your data is protected with enterprise-grade security. We never store PHI and maintain strict compliance standards.',
    icon: Lock,
    bgColor: 'bg-[#0d1122]',
    textColor: 'text-white',
    iconColor: 'text-hipaa-green'
  },
  {
    title: 'Flexible Compliance Options',
    description: 'Choose a compliance plan that fits your practice size, with flexible and affordable options to choose from.',
    icon: CreditCard,
    bgColor: 'bg-white',
    textColor: 'text-[#0d1122]',
    iconColor: 'text-hipaa-green',
    hasButton: true
  },
  {
    title: 'Document Versioning',
    description: 'Track all changes to your compliance documents with complete version history and audit trails for regulatory requirements.',
    icon: FileText,
    bgColor: 'bg-white',
    textColor: 'text-[#0d1122]',
    iconColor: 'text-hipaa-green'
  },
  {
    title: 'Ongoing Compliance Monitoring',
    description: 'Stay compliant with automated monitoring, alerts for document renewals, and regular compliance status updates.',
    icon: TrendingUp,
    bgColor: 'bg-white',
    textColor: 'text-[#0d1122]',
    iconColor: 'text-hipaa-green'
  }
];

export default function FeaturesSection() {
  return (
    <section className="relative w-full bg-[#f3f5f9] py-24 md:py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-geologica font-light text-[#0d1122] leading-tight mb-4">
              Empower Your Business with Our Cutting-Edge{' '}
              <span className="text-hipaa-green font-normal">Features</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon || FileText;
              return (
                <Card
                  key={index}
                  className={cn(
                    'rounded-2xl border border-[#0d1122]/10 overflow-hidden transition-all hover:shadow-lg',
                    feature.bgColor,
                    feature.textColor
                  )}
                >
                  <CardContent className="p-6">
                    {feature.icon && typeof feature.icon !== 'undefined' && (
                      <div className="mb-4">
                        <div className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center',
                          feature.bgColor === 'bg-[#0d1122]' ? 'bg-hipaa-green/20' : 'bg-hipaa-green/10'
                        )}>
                          <Icon className={cn('w-6 h-6', feature.iconColor || 'text-hipaa-green')} />
                        </div>
                      </div>
                    )}
                    <CardTitle className={cn('text-xl font-geologica font-medium mb-3', feature.textColor)}>
                      {feature.title}
                    </CardTitle>
                    <p className={cn('text-sm font-geologica font-light leading-relaxed mb-4', feature.textColor === 'text-white' ? 'text-white/80' : 'text-[#0d1122]/70')}>
                      {feature.description}
                    </p>
                    {feature.hasButton && (
                      <Link href="/signup">
                        <Button className="w-full bg-white text-[#0d1122] border border-[#0d1122]/20 font-geologica font-medium hover:bg-gray-50 rounded-lg">
                          Learn More
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
