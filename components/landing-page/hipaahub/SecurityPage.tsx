'use client';

import React from 'react';
import { ArrowLeft, Lock, Shield, Server, Eye, RefreshCw, CheckCircle2 } from 'lucide-react';

interface Props {
  onBack: () => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  return (
    <div className="mb-12">
      <h2 className="text-xl font-thin text-[#0e274e] mb-4 pb-3 border-b border-gray-200 border-[0.5px]">{title}</h2>
      <div className="text-[#565656] font-thin text-sm leading-relaxed space-y-4">{children}</div>
    </div>
  );
};

const ControlCard: React.FC<{ icon: React.ReactNode; title: string; items: string[] }> = ({ icon, title, items }) => (
  <div className="bg-[#f3f5f9] p-6">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 bg-[#0175a2] flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <h3 className="text-sm font-thin text-[#0e274e]">{title}</h3>
    </div>
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-xs text-[#565656] font-thin">
          <CheckCircle2 size={12} className="text-[#0175a2] mt-0.5 flex-shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

function SecurityPage({ onBack }: Props) {
  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-[#0e274e] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center text-gray-300 text-sm font-thin mb-8 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" /> Back to HIPAA Hub
          </button>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-[#0175a2] flex items-center justify-center">
              <Lock size={20} className="text-white" />
            </div>
            <span className="text-[11px] text-gray-400 font-thin">Legal Documentation</span>
          </div>
          <h1 className="text-4xl font-thin mb-4">Security Overview</h1>
          <p className="text-gray-400 font-thin text-sm">Last Updated: January 15, 2026 &nbsp;·&nbsp; HIPAA Hub Health, Inc.</p>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="bg-[#f3f5f9] border-b border-gray-200 border-[0.5px]">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
          <div className="flex flex-wrap gap-6 items-center">
            {[
              'HIPAA Compliant Infrastructure',
              'SOC 2 Type II Aligned',
              'NIST SP 800-66 Rev. 2',
              'AES-256 Encryption',
              'TLS 1.3 In Transit',
              'Annual Penetration Testing',
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-2">
                <Shield size={14} className="text-[#0175a2]" />
                <span className="text-xs text-[#565656] font-thin">{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-16">

        <div className="bg-[#f3f5f9] border-l-4 border-[#0175a2] p-6 mb-12">
          <p className="text-[#0e274e] text-sm font-thin leading-relaxed">
            At HIPAA Hub, security is foundational — not a feature. As a compliance platform serving the healthcare sector,
            we hold ourselves to the same stringent security standards we help our customers achieve. This document describes
            our technical, administrative, and physical security controls, frameworks, and practices as of the last updated date above.
          </p>
        </div>

        {/* Control Cards Grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-16">
          <ControlCard
            icon={<Lock size={16} className="text-white" />}
            title="Encryption"
            items={[
              'AES-256 encryption at rest for all stored data',
              'TLS 1.3 for all data in transit',
              'Encrypted database backups with independent key management',
              'HTTPS enforced across all platform endpoints',
              'End-to-end encryption for document export packages',
            ]}
          />
          <ControlCard
            icon={<Eye size={16} className="text-white" />}
            title="Access Control"
            items={[
              'Role-Based Access Control (RBAC) with least-privilege enforcement',
              'Multi-factor authentication (MFA) required for all internal staff',
              'MFA available for all customer accounts',
              'Automated session expiration and token rotation',
              'Privileged access reviewed quarterly',
            ]}
          />
          <ControlCard
            icon={<Server size={16} className="text-white" />}
            title="Infrastructure"
            items={[
              'Hosted on Amazon Web Services (AWS) — us-east-1 and us-west-2',
              'SOC 2 Type II audited cloud infrastructure',
              'Network segmentation with VPC isolation',
              'Web Application Firewall (WAF) on all public endpoints',
              'DDoS protection via AWS Shield Standard',
            ]}
          />
          <ControlCard
            icon={<RefreshCw size={16} className="text-white" />}
            title="Availability and Recovery"
            items={[
              '99.9% uptime SLA for production environment',
              'Automated daily backups with 30-day retention',
              'Point-in-time recovery capability',
              'Multi-region redundancy for critical services',
              'Documented Disaster Recovery Plan (DRP) tested annually',
            ]}
          />
        </div>

        <Section title="1. Security Governance">
          <p><strong className="text-[#0e274e] font-normal">1.1 Security Program.</strong> HIPAA Hub maintains a formal Information Security Management Program (ISMP) aligned with NIST SP 800-66 Rev. 2 (Implementing HIPAA Security Rule) and the NIST Cybersecurity Framework (CSF) 2.0. The program is reviewed and updated annually and after significant organizational or technical changes.</p>
          <p><strong className="text-[#0e274e] font-normal">1.2 Security Officer.</strong> A designated Security Officer is responsible for overseeing the development, implementation, and maintenance of all security policies and procedures. The Security Officer conducts quarterly security reviews and oversees the response to security incidents.</p>
          <p><strong className="text-[#0e274e] font-normal">1.3 Security Policies.</strong> We maintain a comprehensive set of internal security policies covering: acceptable use, access management, change management, data classification, encryption, incident response, business continuity, vendor management, and vulnerability management.</p>
          <p><strong className="text-[#0e274e] font-normal">1.4 Employee Training.</strong> All employees receive mandatory security awareness training upon onboarding and annually thereafter. Role-specific training is provided for engineering, operations, and support staff. HIPAA-specific training is mandatory for all employees with access to customer data.</p>
        </Section>

        <Section title="2. Application Security">
          <p><strong className="text-[#0e274e] font-normal">2.1 Secure Development Lifecycle (SDLC).</strong> All code undergoes peer review before merging into production. We follow OWASP Top 10 guidelines and conduct threat modeling for significant new features. Automated static analysis (SAST) and dependency vulnerability scanning run on every code commit.</p>
          <p><strong className="text-[#0e274e] font-normal">2.2 Penetration Testing.</strong> We conduct annual third-party penetration tests covering our web application, API layer, and network infrastructure. Critical and high-severity findings are remediated within 30 and 60 days, respectively. Summaries of penetration test results are available to Enterprise customers under NDA.</p>
          <p><strong className="text-[#0e274e] font-normal">2.3 Vulnerability Management.</strong> Continuous automated scanning identifies vulnerabilities in our infrastructure and application dependencies. We subscribe to security advisories for all major software components and apply security patches within the following SLAs: Critical — 24 hours, High — 7 days, Medium — 30 days.</p>
          <p><strong className="text-[#0e274e] font-normal">2.4 API Security.</strong> All API endpoints require authenticated sessions with short-lived JWT tokens. Rate limiting is enforced on all endpoints. Input validation and output encoding are applied to prevent injection attacks. All API activity is logged with correlation IDs.</p>
        </Section>

        <Section title="3. Data Protection">
          <p><strong className="text-[#0e274e] font-normal">3.1 Data Classification.</strong> All data is classified into four tiers: Public, Internal, Confidential, and Restricted. Customer compliance data is classified as Confidential and subject to the most stringent controls. Access to Confidential data by HIPAA Hub staff is strictly limited and requires explicit authorization.</p>
          <p><strong className="text-[#0e274e] font-normal">3.2 Data Isolation.</strong> Each customer organization's data is logically isolated using organization-scoped database partitioning. Cross-tenant data access is architecturally prevented through enforced row-level security (RLS) policies at the database layer.</p>
          <p><strong className="text-[#0e274e] font-normal">3.3 No PHI Storage Policy.</strong> HIPAA Hub's platform architecture explicitly prohibits the storage of Protected Health Information (PHI). Input validation on all data ingestion points is configured to reject content patterns associated with PHI. All customer terms prohibit submission of PHI to the platform.</p>
          <p><strong className="text-[#0e274e] font-normal">3.4 Data Residency.</strong> All customer data is stored in the United States. We do not transfer customer data to servers located outside the United States without explicit consent.</p>
        </Section>

        <Section title="4. Audit Logging and Monitoring">
          <p><strong className="text-[#0e274e] font-normal">4.1 Comprehensive Audit Logs.</strong> All user actions within the platform, including login events, document creation and modification, role changes, configuration changes, and data exports, are logged with immutable, append-only audit records that include: event type, user identity, organization ID, timestamp, source IP address, and request ID.</p>
          <p><strong className="text-[#0e274e] font-normal">4.2 Security Monitoring.</strong> We operate a 24/7 security monitoring system that analyzes logs and generates alerts for anomalous activity, including: multiple failed authentication attempts, access from unusual geographic locations, privilege escalation events, and unusually large data exports.</p>
          <p><strong className="text-[#0e274e] font-normal">4.3 Log Retention.</strong> Security and audit logs are retained for a minimum of seven (7) years in accordance with HIPAA requirements. Logs are stored in a separate, hardened storage environment with independent access controls and are protected against modification or deletion.</p>
        </Section>

        <Section title="5. Incident Response">
          <p><strong className="text-[#0e274e] font-normal">5.1 Incident Response Plan.</strong> HIPAA Hub maintains a documented Incident Response Plan (IRP) reviewed and tested annually through tabletop exercises. The IRP defines roles, responsibilities, communication protocols, and escalation procedures for security incidents.</p>
          <p><strong className="text-[#0e274e] font-normal">5.2 Breach Notification.</strong> In the event of a confirmed data breach affecting customer data, HIPAA Hub will notify affected customers without undue delay, and no later than seventy-two (72) hours after becoming aware of the breach, as required by applicable law. Our notification will include the nature of the breach, data affected, steps taken, and recommended actions for customers.</p>
          <p><strong className="text-[#0e274e] font-normal">5.3 Reporting Security Issues.</strong> We encourage responsible disclosure of security vulnerabilities. If you discover a potential security issue, please report it immediately to our security team at <span className="text-[#0175a2]">security@hipaahubhealth.com</span>. We will acknowledge receipt within 24 hours and provide a status update within 5 business days. We ask that you do not publicly disclose vulnerabilities before we have had the opportunity to investigate and remediate.</p>
        </Section>

        <Section title="6. Physical Security">
          <p><strong className="text-[#0e274e] font-normal">6.1 Cloud Infrastructure.</strong> All production infrastructure is hosted in AWS data centers, which maintain SOC 2 Type II, ISO 27001, and PCI DSS compliance. Physical access to AWS facilities is controlled through multi-layer authentication including biometric verification and 24/7 security personnel.</p>
          <p><strong className="text-[#0e274e] font-normal">6.2 Office Security.</strong> HIPAA Hub offices are secured with keycard access systems. Visitor access is logged and escorted. All employee workstations are encrypted with full-disk encryption. Clean desk policies are enforced in all office environments.</p>
          <p><strong className="text-[#0e274e] font-normal">6.3 Remote Work Controls.</strong> Remote employees are required to use VPN access for internal systems, maintain up-to-date endpoint security software, and use company-managed devices. Mobile device management (MDM) is enforced for all company-issued devices.</p>
        </Section>

        <Section title="7. Vendor and Third-Party Security">
          <p><strong className="text-[#0e274e] font-normal">7.1 Vendor Assessment.</strong> All third-party vendors with access to customer data or our production environment undergo a security review prior to engagement. Reviews include examination of SOC 2 reports, security policies, and data processing agreements.</p>
          <p><strong className="text-[#0e274e] font-normal">7.2 Data Processing Agreements.</strong> We execute Data Processing Agreements (DPAs) with all sub-processors handling customer data. Our current sub-processors include: Amazon Web Services (infrastructure), Supabase (database), Stripe (payments), and OpenAI (AI document generation — processed without customer PII).</p>
          <p><strong className="text-[#0e274e] font-normal">7.3 Annual Review.</strong> Third-party vendor relationships are reviewed annually, including reassessment of their security posture and compliance status.</p>
        </Section>

        <Section title="8. Customer Security Controls">
          <p>We provide customers with controls to enhance the security of their own accounts and data:</p>
          <ul className="list-none space-y-3">
            {[
              'Multi-factor authentication (MFA) available for all user accounts',
              'Role-based access control with granular permission assignment',
              'Audit log export for internal compliance and investigation purposes',
              'Session management with configurable inactivity timeouts',
              'User activity monitoring accessible by account administrators',
              'Secure document export with access-controlled download links',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-1 h-1 bg-[#0175a2] rounded-full mt-2 flex-shrink-0"></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="9. Compliance Certifications and Frameworks">
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: 'HIPAA Security Rule', desc: 'Platform architecture and controls are aligned with 45 CFR Part 164 Security Standards, including all required and addressable implementation specifications.' },
              { title: 'NIST SP 800-66 Rev. 2', desc: 'Our security program follows the NIST guidelines for implementing the HIPAA Security Rule, including risk analysis and risk management frameworks.' },
              { title: 'NIST CSF 2.0', desc: 'Security controls map to the five NIST CSF functions: Identify, Protect, Detect, Respond, and Recover.' },
              { title: 'SOC 2 Type II (In Progress)', desc: 'We are currently pursuing SOC 2 Type II certification. Trust Services Criteria reports will be available to Enterprise customers upon completion.' },
            ].map((cert, i) => (
              <div key={i} className="bg-[#f3f5f9] p-5">
                <h4 className="text-sm font-thin text-[#0e274e] mb-2">{cert.title}</h4>
                <p className="text-xs text-[#565656] font-thin leading-relaxed">{cert.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="10. Contact and Security Reporting">
          <div className="bg-[#f3f5f9] p-6 mt-4 space-y-2">
            <p><strong className="text-[#0e274e] font-normal">HIPAA Hub Health, Inc. — Security Team</strong></p>
            <p>Email: <span className="text-[#0175a2]">security@hipaahubhealth.com</span></p>
            <p>For urgent security incidents: <span className="text-[#0175a2]">+1-800-HIPAA-HUB</span> (24/7)</p>
            <p>General inquiries: <span className="text-[#0175a2]">support@hipaahubhealth.com</span></p>
            <p>Website: <span className="text-[#0175a2]">www.hipaahubhealth.com</span></p>
          </div>
        </Section>

        <div className="pt-8 border-t border-gray-200 border-[0.5px] mt-12">
          <p className="text-xs text-gray-400 font-thin">© 2026 HIPAA Hub Health, Inc. All rights reserved. Security controls and certifications are subject to change. Contact us for the most current security posture documentation under NDA.</p>
        </div>
      </div>
    </div>
  );
}

export default SecurityPage;
