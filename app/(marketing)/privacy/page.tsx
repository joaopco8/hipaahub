import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex-1">
        <div className="container mx-auto px-6 py-24 max-w-4xl">
          {/* Back Link */}
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-zinc-600 hover:text-[#1ad07a] transition-colors mb-8 font-extralight"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Header */}
          <div className="space-y-4 mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl text-[#0c0b1d] font-extralight leading-tight">
              Privacy Policy
            </h1>
            <p className="text-lg text-zinc-600 font-extralight">
              Last updated: January 23, 2026
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl text-[#0c0b1d] font-extralight mb-4">Introduction</h2>
              <p className="text-zinc-700 font-extralight leading-relaxed mb-4">
                HIPAA Hub ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our compliance management platform.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl text-[#0c0b1d] font-extralight mb-4">Information We Collect</h2>
              <h3 className="text-xl text-[#0c0b1d] font-extralight mb-3">Personal Information</h3>
              <p className="text-zinc-700 font-extralight leading-relaxed mb-4">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc pl-6 text-zinc-700 font-extralight space-y-2 mb-4">
                <li>Name and contact information (email, phone number)</li>
                <li>Organization details (name, address, EIN)</li>
                <li>Account credentials</li>
                <li>Payment information</li>
                <li>Compliance documentation and evidence</li>
              </ul>

              <h3 className="text-xl text-[#0c0b1d] font-extralight mb-3">Automatically Collected Information</h3>
              <p className="text-zinc-700 font-extralight leading-relaxed mb-4">
                When you access our platform, we automatically collect:
              </p>
              <ul className="list-disc pl-6 text-zinc-700 font-extralight space-y-2 mb-4">
                <li>Device and browser information</li>
                <li>IP address and location data</li>
                <li>Usage patterns and preferences</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl text-[#0c0b1d] font-extralight mb-4">How We Use Your Information</h2>
              <p className="text-zinc-700 font-extralight leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-zinc-700 font-extralight space-y-2 mb-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Monitor and analyze trends and usage</li>
                <li>Detect and prevent fraud and abuse</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl text-[#0c0b1d] font-extralight mb-4">Data Security</h2>
              <p className="text-zinc-700 font-extralight leading-relaxed mb-4">
                We implement appropriate technical and organizational measures to protect your information, including:
              </p>
              <ul className="list-disc pl-6 text-zinc-700 font-extralight space-y-2 mb-4">
                <li>AES-256 encryption for data at rest</li>
                <li>TLS 1.3 encryption for data in transit</li>
                <li>Regular security audits and assessments</li>
                <li>Access controls and authentication measures</li>
                <li>Employee training on data protection</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl text-[#0c0b1d] font-extralight mb-4">Data Retention</h2>
              <p className="text-zinc-700 font-extralight leading-relaxed mb-4">
                We retain your information for as long as necessary to provide our services and comply with legal obligations. Compliance documentation is retained for a minimum of 7 years in accordance with HIPAA requirements.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl text-[#0c0b1d] font-extralight mb-4">Your Rights</h2>
              <p className="text-zinc-700 font-extralight leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 text-zinc-700 font-extralight space-y-2 mb-4">
                <li>Access and update your personal information</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
                <li>Export your compliance data</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl text-[#0c0b1d] font-extralight mb-4">Third-Party Services</h2>
              <p className="text-zinc-700 font-extralight leading-relaxed mb-4">
                We use trusted third-party services for payment processing (Stripe), analytics, and infrastructure. These providers are contractually bound to protect your information and use it only for specified purposes.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl text-[#0c0b1d] font-extralight mb-4">Changes to This Policy</h2>
              <p className="text-zinc-700 font-extralight leading-relaxed mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl text-[#0c0b1d] font-extralight mb-4">Contact Us</h2>
              <p className="text-zinc-700 font-extralight leading-relaxed mb-4">
                If you have questions about this Privacy Policy, please contact us at:
              </p>
              <p className="text-zinc-700 font-extralight leading-relaxed">
                Email: <a href="mailto:hello@hipaahub.com" className="text-[#1ad07a] hover:underline">hello@hipaahub.com</a>
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
