import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfServicePage() {
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
              Terms of Service
            </h1>
            <p className="text-lg text-zinc-600 font-extralight">
              Last updated: January 23, 2026
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl text-[#0c0b1d] font-extralight mb-4">Agreement to Terms</h2>
              <p className="text-zinc-700 font-extralight leading-relaxed mb-4">
                By accessing and using HIPAA Hub ("Service"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this Service.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl text-[#0c0b1d] font-extralight mb-4">Use License</h2>
              <p className="text-zinc-700 font-extralight leading-relaxed mb-4">
                Permission is granted to temporarily access and use HIPAA Hub for compliance management purposes. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc pl-6 text-zinc-700 font-extralight space-y-2 mb-4">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose outside your organization</li>
                <li>Attempt to reverse engineer any software contained on the platform</li>
                <li>Remove any copyright or proprietary notations</li>
                <li>Transfer the materials to another person or organization</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl text-[#0c0b1d] font-extralight mb-4">Account Responsibilities</h2>
              <p className="text-zinc-700 font-extralight leading-relaxed mb-4">
                You are responsible for:
              </p>
              <ul className="list-disc pl-6 text-zinc-700 font-extralight space-y-2 mb-4">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Ensuring all information provided is accurate and current</li>
                <li>Notifying us immediately of any unauthorized access</li>
                <li>Compliance with all applicable laws and regulations</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl text-[#0c0b1d] font-extralight mb-4">Service Description</h2>
              <p className="text-zinc-700 font-extralight leading-relaxed mb-4">
                HIPAA Hub provides compliance management tools including:
              </p>
              <ul className="list-disc pl-6 text-zinc-700 font-extralight space-y-2 mb-4">
                <li>Security Risk Analysis automation</li>
                <li>HIPAA policy generation</li>
                <li>Evidence and documentation management</li>
                <li>Workforce training tracking</li>
                <li>Audit preparation assistance</li>
              </ul>
              <p className="text-zinc-700 font-extralight leading-relaxed mb-4">
                We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time with reasonable notice.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl text-[#0c0b1d] font-extralight mb-4">Payment Terms</h2>
              <p className="text-zinc-700 font-extralight leading-relaxed mb-4">
                Subscription fees are billed annually in advance. All fees are non-refundable except as required by law. We reserve the right to change pricing with 30 days notice.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl text-[#0c0b1d] font-extralight mb-4">Disclaimer</h2>
              <p className="text-zinc-700 font-extralight leading-relaxed mb-4">
                The materials on HIPAA Hub are provided on an 'as is' basis. HIPAA Hub makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
              <p className="text-zinc-700 font-extralight leading-relaxed mb-4 font-medium text-[#0c0b1d]">
                Important: HIPAA Hub is a compliance management tool. While we help you organize and document your compliance efforts, ultimate responsibility for HIPAA compliance remains with your organization. We recommend consulting with qualified legal and compliance professionals.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl text-[#0c0b1d] font-extralight mb-4">Limitations of Liability</h2>
              <p className="text-zinc-700 font-extralight leading-relaxed mb-4">
                In no event shall HIPAA Hub or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the Service.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl text-[#0c0b1d] font-extralight mb-4">Data Protection</h2>
              <p className="text-zinc-700 font-extralight leading-relaxed mb-4">
                We implement industry-standard security measures to protect your data. However, no method of transmission over the Internet is 100% secure. You acknowledge that you provide information at your own risk.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl text-[#0c0b1d] font-extralight mb-4">Termination</h2>
              <p className="text-zinc-700 font-extralight leading-relaxed mb-4">
                Either party may terminate this agreement at any time with written notice. Upon termination, you will have 30 days to export your data before it is permanently deleted.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl text-[#0c0b1d] font-extralight mb-4">Governing Law</h2>
              <p className="text-zinc-700 font-extralight leading-relaxed mb-4">
                These terms shall be governed by and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law provisions.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl text-[#0c0b1d] font-extralight mb-4">Changes to Terms</h2>
              <p className="text-zinc-700 font-extralight leading-relaxed mb-4">
                We reserve the right to revise these terms at any time. Changes will be effective immediately upon posting. Your continued use of the Service constitutes acceptance of the revised terms.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl text-[#0c0b1d] font-extralight mb-4">Contact Information</h2>
              <p className="text-zinc-700 font-extralight leading-relaxed mb-4">
                Questions about the Terms of Service should be sent to:
              </p>
              <p className="text-zinc-700 font-extralight leading-relaxed">
                Email: <a href="mailto:contact@hipaahubhealth.com" className="text-[#1ad07a] hover:underline">contact@hipaahubhealth.com</a>
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
