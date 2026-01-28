'use client';

import { Shield, Database, Layers, Lock, GitBranch, FileCode2, Activity, Server, CheckCircle2, Zap, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { FadeIn, SlideIn } from './animated-section';

const complianceFeatures = [
  {
    icon: FileCode2,
    title: "HIPAA Policy Generation",
    description: "Complete set of required HIPAA policies automatically generated and customized to your practice type",
    specs: ["9 core HIPAA policies", "Practice-specific customization", "Version control built-in"],
    badge: "Documentation"
  },
  {
    icon: Shield,
    title: "Risk Assessment Engine",
    description: "Guided security risk analysis that meets the HIPAA Security Rule requirements for risk management",
    specs: ["Comprehensive risk evaluation", "Automatic risk scoring", "Remediation recommendations"],
    badge: "Risk Management"
  },
  {
    icon: GitBranch,
    title: "Evidence Management",
    description: "Centralized system to organize and track all compliance evidence, approvals, and training records",
    specs: ["Audit-ready documentation", "Complete chain of custody"],
    badge: "Audit Defense"
  },
  {
    icon: Activity,
    title: "Role Assignment System",
    description: "Clear designation of HIPAA Security and Privacy Officers with documented responsibilities",
    specs: ["Official role assignments", "Responsibility tracking", "Succession planning"],
    badge: "Accountability"
  }
];

const complianceMetrics = [
  { label: "HIPAA Policies Generated", value: "9", icon: FileCode2, color: "text-green-400" },
  { label: "Risk Assessment Questions", value: "100+", icon: Shield, color: "text-blue-400" },
  { label: "Training Certificates", value: "Unlimited", icon: CheckCircle2, color: "text-purple-400" }
];

export default function FeaturesGrid() {
  return (
    <section className="w-full bg-[#0c0b1d] py-24 md:py-32 relative overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(#1ad07a 1px, transparent 1px), linear-gradient(90deg, #1ad07a 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-7xl mx-auto space-y-16">
          
          {/* Section Header */}
          <FadeIn>
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1ad07a]/10 border border-[#1ad07a]/20">
                <Shield className="w-4 h-4 text-[#1ad07a]" />
                <span className="text-xs text-[#1ad07a] font-medium uppercase">Compliance Features</span>
              </div>
              <h3 className="text-4xl md:text-5xl lg:text-6xl font-extralight text-white leading-tight">
                Everything you need for HIPAA compliance.<br />
                <span className="text-zinc-400">Nothing you don't.</span>
              </h3>
              <p className="text-lg md:text-xl text-zinc-400 font-extralight max-w-3xl">
                Practical tools designed for clinic owners and administrators to achieve, maintain, and prove HIPAA compliance.
              </p>
            </div>
          </FadeIn>

          {/* Compliance Metrics Bar */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {complianceMetrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <motion.div
                  key={index}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-[#1ad07a]/30 transition-all duration-300 group"
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="space-y-3">
                    <Icon className={`w-5 h-5 ${metric.color} opacity-70 group-hover:opacity-100 transition-opacity`} />
                    <div className="space-y-1">
                      <p className="text-xs text-zinc-500 font-medium">{metric.label}</p>
                      <p className={`text-2xl font-light ${metric.color}`}>{metric.value}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Compliance Features Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {complianceFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  className="relative bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-[#1ad07a]/30 transition-all duration-300 group overflow-hidden"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 + (index * 0.1) }}
                  whileHover={{ y: -8 }}
                >
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1ad07a]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10 space-y-6">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-xl bg-[#1ad07a]/10 flex items-center justify-center text-[#1ad07a] group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-zinc-400 border border-white/10">
                        {feature.badge}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                      <h4 className="text-xl font-light text-white group-hover:text-[#1ad07a] transition-colors duration-300">
                        {feature.title}
                      </h4>
                      <p className="text-sm text-zinc-400 font-extralight leading-relaxed">
                        {feature.description}
                      </p>
                    </div>

                    {/* Specs */}
                    <div className="space-y-2 pt-4 border-t border-white/10">
                      {feature.specs.map((spec, specIndex) => (
                        <div key={specIndex} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#1ad07a] shrink-0" />
                          <span className="text-xs text-zinc-500 font-medium">{spec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Corner accent */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#1ad07a]/5 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </motion.div>
              );
            })}
          </div>

          {/* Compliance Workflow Visual */}
          <motion.div
            className="relative bg-[#0a0a0f] rounded-3xl p-8 md:p-12 border border-white/10 overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#1ad07a]/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#1ad07a]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">HIPAA Compliance Roadmap</p>
                  <p className="text-xs text-zinc-600">Your Organization</p>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full bg-[#1ad07a]/10 border border-[#1ad07a]/20">
                <span className="text-xs text-[#1ad07a] font-medium">85% Complete</span>
              </div>
            </div>

            {/* Workflow steps */}
            <div className="space-y-4">
              {[
                { label: "Privacy Policy", status: "completed", icon: CheckCircle2 },
                { label: "Security Policy", status: "completed", icon: CheckCircle2 },
                { label: "Risk Assessment", status: "in-progress", icon: Activity },
                { label: "BAA Templates", status: "pending", icon: Clock },
              ].map((step, index) => (
                <motion.div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#1ad07a]/30 transition-all group"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.6 + (index * 0.1) }}
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      step.status === 'completed' ? 'bg-[#1ad07a]/10 text-[#1ad07a]' :
                      step.status === 'in-progress' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-zinc-800 text-zinc-600'
                    }`}>
                      <step.icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm text-white font-light">{step.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {step.status === 'completed' && (
                      <span className="text-xs text-[#1ad07a]">Approved</span>
                    )}
                    {step.status === 'in-progress' && (
                      <span className="text-xs text-blue-400">In Progress</span>
                    )}
                    {step.status === 'pending' && (
                      <span className="text-xs text-zinc-600">Pending</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Floating badge */}
            <div className="absolute top-8 right-8 px-4 py-2 rounded-full bg-[#1ad07a]/10 border border-[#1ad07a]/20 backdrop-blur-sm">
              <span className="text-xs text-[#1ad07a] font-medium">Live Preview</span>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
