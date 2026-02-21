'use client';

import React from 'react';
import { ArrowLeft, Shield } from 'lucide-react';

interface Props {
  onBack: () => void;
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <div className="mb-12">
      <h2 className="text-xl font-thin text-[#0e274e] mb-4 pb-3 border-b border-gray-200 border-[0.5px]">{title}</h2>
      <div className="text-[#565656] font-thin text-sm leading-relaxed space-y-4">{children}</div>
    </div>
  );
}

export default function PrivacyPolicyPage({ onBack }: Props) {
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
              <Shield size={20} className="text-white" />
            </div>
            <span className="text-[11px] text-gray-400 font-thin">Legal Documentation</span>
          </div>
          <h1 className="text-4xl font-thin mb-4">Privacy Policy</h1>
          <p className="text-gray-400 font-thin text-sm">Effective Date: January 1, 2026 &nbsp;·&nbsp; Last Updated: January 15, 2026</p>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-16">

        {/* Notice box */}
        <div className="bg-[#f3f5f9] border-l-4 border-[#0175a2] p-6 mb-12">
          <p className="text-[#0e274e] text-sm font-thin leading-relaxed">
            HIPAA Hub Health, Inc. (&quot;HIPAA Hub,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting the privacy of our users.
            This Privacy Policy explains how we collect, use, disclose, and safeguard information when you visit our website at{' '}
            <span className="text-[#0175a2]">www.hipaahubhealth.com</span> and use our compliance platform services.
            Please read this policy carefully. If you disagree with its terms, please discontinue use of the platform.
          </p>
        </div>

        <Section title="1. Information We Collect">
          <p><strong className="text-[#0e274e] font-normal">1.1 Account and Identity Information.</strong> When you register for an account, we collect your name, email address, phone number, job title, and the name and type of your healthcare organization. This information is required to create and manage your account and deliver our services.</p>
          <p><strong className="text-[#0e274e] font-normal">1.2 Compliance and Operational Data.</strong> We collect the responses you provide during onboarding assessments, risk questionnaires, policy configurations, and training completions. This operational data is used exclusively to generate your compliance documentation, risk reports, and audit packages.</p>
          <p><strong className="text-[#0e274e] font-normal">1.3 Usage and Technical Data.</strong> We automatically collect browser type and version, IP address, pages visited, time spent on platform features, and clickstream data. This data is collected using cookies, web beacons, and server logs to improve platform performance and user experience.</p>
          <p><strong className="text-[#0e274e] font-normal">1.4 Payment Information.</strong> Billing data (credit card numbers, billing addresses) is collected and processed exclusively by our PCI DSS-compliant payment processor, Stripe, Inc. HIPAA Hub does not store raw payment card data.</p>
          <p><strong className="text-[#0e274e] font-normal">1.5 Communications.</strong> If you contact our support team, we retain a record of the correspondence, including email content, ticket information, and resolution notes.</p>
          <p><strong className="text-[#0e274e] font-normal">Important Notice on PHI:</strong> HIPAA Hub is a compliance management tool and is not designed to store, process, or transmit Protected Health Information (PHI) about patients. You must not enter patient health information into the platform under any circumstances.</p>
        </Section>

        <Section title="2. How We Use Your Information">
          <p>We use the information we collect for the following purposes:</p>
          <ul className="list-none space-y-3">
            {[
              'To provide, operate, and maintain the HIPAA Hub compliance platform',
              'To create and manage your organization\'s account and user profiles',
              'To generate personalized HIPAA compliance documentation, risk assessments, and training certificates',
              'To process billing transactions and manage subscription renewals',
              'To communicate with you about platform updates, security alerts, and compliance deadline reminders',
              'To analyze usage patterns and improve platform features and workflows',
              'To enforce our Terms of Service and investigate potential violations',
              'To comply with applicable laws, regulations, and legal processes',
              'To protect the security, integrity, and availability of our infrastructure',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-1 h-1 bg-[#0175a2] rounded-full mt-2 flex-shrink-0"></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p>We do not sell, rent, or trade your personal information to third parties for their own marketing purposes.</p>
        </Section>

        <Section title="3. Legal Basis for Processing (GDPR)">
          <p>For users in the European Economic Area (EEA) and the United Kingdom, we process personal data under the following legal bases:</p>
          <ul className="list-none space-y-3">
            {[
              'Contractual Necessity: Processing is required to fulfill our obligations under the service agreement.',
              'Legitimate Interests: We process data to improve our services, prevent fraud, and ensure platform security, provided these interests do not override your fundamental rights.',
              'Legal Obligation: Processing may be required to comply with applicable legal obligations.',
              'Consent: For optional communications such as marketing newsletters, we process data only with your explicit consent.',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-1 h-1 bg-[#0175a2] rounded-full mt-2 flex-shrink-0"></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="4. Disclosure of Your Information">
          <p><strong className="text-[#0e274e] font-normal">4.1 Service Providers.</strong> We share information with carefully vetted third-party vendors who assist us in operating the platform. These include cloud infrastructure providers (Amazon Web Services), database services (Supabase), payment processors (Stripe), and analytics platforms. All vendors are bound by data processing agreements that restrict how they may use your information.</p>
          <p><strong className="text-[#0e274e] font-normal">4.2 Business Transfers.</strong> In the event of a merger, acquisition, reorganization, or sale of assets, your information may be transferred as part of the transaction. We will notify you of any such change and provide you with the updated privacy practices.</p>
          <p><strong className="text-[#0e274e] font-normal">4.3 Legal Requirements.</strong> We may disclose your information when required by law, court order, subpoena, or other legal process, or when we believe disclosure is necessary to protect the rights, property, or safety of HIPAA Hub, our users, or the public.</p>
          <p><strong className="text-[#0e274e] font-normal">4.4 With Your Consent.</strong> We may disclose your information for any other purpose with your explicit prior consent.</p>
        </Section>

        <Section title="5. Data Retention">
          <p>We retain personal data for as long as your account is active or as needed to provide services. Upon account termination, we retain compliance documentation and audit logs for a minimum of six (6) years in accordance with HIPAA record retention requirements, unless a longer period is required by law.</p>
          <p>Usage logs, session data, and support tickets are retained for a period of twenty-four (24) months. Payment transaction records are retained for seven (7) years for tax and regulatory purposes.</p>
          <p>You may request deletion of your personal data by contacting us at <span className="text-[#0175a2]">privacy@hipaahubhealth.com</span>. Deletion requests are processed within thirty (30) days, subject to legal retention obligations.</p>
        </Section>

        <Section title="6. Data Security">
          <p>We implement a comprehensive set of administrative, technical, and physical safeguards to protect your information against unauthorized access, use, alteration, or destruction:</p>
          <ul className="list-none space-y-3">
            {[
              'AES-256 encryption at rest for all stored data',
              'TLS 1.3 encryption in transit for all communications',
              'Role-based access control (RBAC) with least-privilege enforcement',
              'Multi-factor authentication (MFA) for all administrative access',
              'Continuous vulnerability scanning and annual penetration testing',
              'SOC 2 Type II audited infrastructure through our cloud providers',
              'Immutable audit logging of all access and modification events',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-1 h-1 bg-[#0175a2] rounded-full mt-2 flex-shrink-0"></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p>No method of transmission or storage is 100% secure. In the event of a data breach that affects your rights or freedoms, we will notify you and applicable regulatory authorities in accordance with applicable law.</p>
        </Section>

        <Section title="7. Cookies and Tracking Technologies">
          <p><strong className="text-[#0e274e] font-normal">Essential Cookies:</strong> Required for the platform to function. These cannot be disabled and include session management, authentication tokens, and CSRF protection.</p>
          <p><strong className="text-[#0e274e] font-normal">Analytics Cookies:</strong> Used to understand how users interact with the platform. Data is aggregated and anonymized. You may opt out through our cookie consent banner.</p>
          <p><strong className="text-[#0e274e] font-normal">Preference Cookies:</strong> Store your display and language preferences. Disabling these may affect platform functionality.</p>
          <p>You can control cookie settings through your browser settings. Note that disabling non-essential cookies may limit certain platform features.</p>
        </Section>

        <Section title="8. Your Rights and Choices">
          <p>Depending on your jurisdiction, you may have the following rights regarding your personal data:</p>
          <ul className="list-none space-y-3">
            {[
              'Right of Access: Request a copy of the personal data we hold about you',
              'Right to Rectification: Request correction of inaccurate or incomplete data',
              'Right to Erasure: Request deletion of your personal data, subject to legal retention requirements',
              'Right to Restriction: Request that we limit our processing of your data in certain circumstances',
              'Right to Data Portability: Request your data in a structured, machine-readable format',
              'Right to Object: Object to processing based on legitimate interests or for direct marketing',
              'Right to Withdraw Consent: Where processing is based on consent, withdraw it at any time without affecting prior processing',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-1 h-1 bg-[#0175a2] rounded-full mt-2 flex-shrink-0"></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p>To exercise these rights, contact us at <span className="text-[#0175a2]">privacy@hipaahubhealth.com</span>. We will respond within thirty (30) days. We may require identity verification before processing your request.</p>
        </Section>

        <Section title="9. Children's Privacy">
          <p>The HIPAA Hub platform is intended for healthcare professionals and business administrators who are at least 18 years of age. We do not knowingly collect personal information from individuals under 18. If we become aware that a minor has provided us with personal information, we will take steps to delete that information promptly. If you believe we may have collected such information, contact us at <span className="text-[#0175a2]">privacy@hipaahubhealth.com</span>.</p>
        </Section>

        <Section title="10. International Data Transfers">
          <p>HIPAA Hub is headquartered in the United States. If you access the platform from outside the United States, your information may be transferred to, stored, and processed in the United States, where data protection laws may differ from those in your country. By using the platform, you consent to such transfers.</p>
          <p>For transfers from the EEA or United Kingdom, we rely on Standard Contractual Clauses (SCCs) approved by the European Commission, or other lawful transfer mechanisms, to ensure your data is protected.</p>
        </Section>

        <Section title="11. Changes to This Policy">
          <p>We may update this Privacy Policy periodically to reflect changes in our practices, technology, or applicable law. Material changes will be communicated via email or a prominent notice on the platform at least thirty (30) days before the effective date. Continued use of the platform after the effective date constitutes acceptance of the revised policy.</p>
        </Section>

        <Section title="12. Contact Information">
          <p>For privacy-related questions, concerns, or to exercise your rights, please contact:</p>
          <div className="bg-[#f3f5f9] p-6 mt-4 space-y-2">
            <p><strong className="text-[#0e274e] font-normal">HIPAA Hub Health, Inc.</strong></p>
            <p>Attn: Privacy Officer</p>
            <p>150 North First Street, Suite 300</p>
            <p>San Jose, CA 95113</p>
            <p>Email: <span className="text-[#0175a2]">privacy@hipaahubhealth.com</span></p>
            <p>Phone: +1-800-HIPAA-HUB</p>
            <p>Website: <span className="text-[#0175a2]">www.hipaahubhealth.com</span></p>
          </div>
        </Section>

        <div className="pt-8 border-t border-gray-200 border-[0.5px] mt-12">
          <p className="text-xs text-gray-400 font-thin">© 2026 HIPAA Hub Health, Inc. All rights reserved. This document does not constitute legal advice. Consult qualified legal counsel for compliance-specific guidance.</p>
        </div>
      </div>
    </div>
  );
}
