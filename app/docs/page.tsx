import Link from 'next/link';
import Image from 'next/image';
import { Book, Shield, FileText, Users, AlertTriangle, Download, CheckCircle2, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const quickLinks = [
  {
    title: 'Getting Started',
    description: 'Learn how to set up your account and complete your first steps',
    href: '/docs/getting-started',
    icon: Zap,
    color: 'bg-[#1ad07a]/10 text-[#1ad07a]'
  },
  {
    title: 'Dashboard Overview',
    description: 'Understand your compliance status and what the dashboard shows you',
    href: '/docs/dashboard',
    icon: Shield,
    color: 'bg-blue-50 text-blue-600'
  },
  {
    title: 'Risk Assessment',
    description: 'Complete your Security Risk Analysis and understand your risk level',
    href: '/docs/risk-assessment',
    icon: AlertTriangle,
    color: 'bg-orange-50 text-orange-600'
  },
  {
    title: 'Generate Policies',
    description: 'Create all 9 required HIPAA policies automatically',
    href: '/docs/policies',
    icon: FileText,
    color: 'bg-purple-50 text-purple-600'
  },
  {
    title: 'Upload Evidence',
    description: 'Connect evidence files to your policies for audit readiness',
    href: '/docs/evidence',
    icon: CheckCircle2,
    color: 'bg-green-50 text-green-600'
  },
  {
    title: 'Employee Training',
    description: 'Assign and track HIPAA training for your staff',
    href: '/docs/training',
    icon: Users,
    color: 'bg-indigo-50 text-indigo-600'
  },
  {
    title: 'Export Audit Package',
    description: 'Generate a complete audit-ready package with one click',
    href: '/docs/audit-export',
    icon: Download,
    color: 'bg-teal-50 text-teal-600'
  }
];

export default function DocsPage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="relative w-40 h-10">
            <Image 
              src="/logohipa.png" 
              alt="HIPAA Hub" 
              fill
              priority
              className="object-contain"
            />
          </div>
        </div>
        <div>
          <h1 className="text-4xl md:text-5xl font-geologica font-light text-white mb-3">
            HIPAA Hub User Guide
          </h1>
          <p className="text-lg text-white/70 font-geologica font-light">
            Learn how to use HIPAA Hub to achieve and maintain HIPAA compliance
          </p>
        </div>
      </div>

      {/* Quick Links Grid */}
      <div>
        <h2 className="text-2xl font-geologica font-light text-white mb-6">Essential Guides</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="group block p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-[#1ad07a]/50 hover:bg-white/10 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#1ad07a]/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-[#1ad07a]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-geologica font-medium text-white group-hover:text-[#1ad07a] transition-colors mb-1">
                      {link.title}
                    </h3>
                    <p className="text-sm text-white/60 font-geologica font-light">
                      {link.description}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-[#1ad07a] group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Introduction */}
      <div className="space-y-4 pt-8 border-t border-white/10">
        <h2 className="text-2xl font-geologica font-light text-white">Welcome to HIPAA Hub</h2>
        <div className="prose prose-invert max-w-none">
          <p className="text-white/70 font-geologica font-light leading-relaxed">
            HIPAA Hub is your complete compliance operating system. This guide will walk you through 
            every feature and show you exactly how to use the platform to achieve and maintain HIPAA compliance.
          </p>
          <p className="text-white/70 font-geologica font-light leading-relaxed">
            Whether you're just getting started or need help with a specific feature, you'll find 
            step-by-step instructions here, written in plain language—no technical jargon required.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-geologica font-medium text-white mb-2">New to HIPAA Hub?</h3>
            <p className="text-white/60 font-geologica font-light">
              Start with our getting started guide to set up your account and complete your first steps
            </p>
          </div>
          <Link href="/docs/getting-started">
            <Button
              size="lg"
              className="bg-[#1ad07a] text-[#0c0b1d] hover:bg-[#1ad07a]/90 font-geologica font-medium"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
