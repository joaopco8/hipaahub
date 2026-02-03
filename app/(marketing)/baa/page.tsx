import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function BAAPage() {
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
              Business Associate Agreement (BAA)
            </h1>
            <p className="text-lg text-zinc-600 font-extralight">
              Last updated: January 23, 2026
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none space-y-8 text-zinc-700 font-extralight leading-relaxed">
            <section>
              <h2 className="text-2xl font-medium text-[#0c0b1d] mb-4">1. Definitions</h2>
              <p>
                Terms used, but not otherwise defined, in this Agreement shall have the same meaning as those terms in the HIPAA Rules.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Business Associate:</strong> HIPAA Hub Inc. ("Covered Entity" as defined in HIPAA)</li>
                <li><strong>Covered Entity:</strong> The healthcare practice or organization using HIPAA Hub services</li>
                <li><strong>HIPAA Rules:</strong> The Health Insurance Portability and Accountability Act of 1996, the Health Information Technology for Economic and Clinical Health Act, and their implementing regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-medium text-[#0c0b1d] mb-4">2. Permitted Uses and Disclosures</h2>
              <p>
                Business Associate may use or disclose Protected Health Information (PHI) to perform functions, activities, or services for, or on behalf of, Covered Entity as specified in the Service Agreement, provided that such use or disclosure would not violate the HIPAA Rules if done by Covered Entity or the minimum necessary policies and procedures of the Covered Entity.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-medium text-[#0c0b1d] mb-4">3. Specific Obligations and Activities of Business Associate</h2>
              <p className="mb-4">Business Associate agrees to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Not use or disclose PHI other than as permitted or required by this Agreement or as required by law</li>
                <li>Use appropriate safeguards to prevent use or disclosure of PHI other than as provided for by this Agreement</li>
                <li>Implement administrative, physical, and technical safeguards that reasonably and appropriately protect the confidentiality, integrity, and availability of electronic PHI</li>
                <li>Report to Covered Entity any use or disclosure of PHI not provided for by this Agreement of which it becomes aware</li>
                <li>Ensure that any subcontractors that create, receive, maintain, or transmit PHI on behalf of Business Associate agree to the same restrictions and conditions that apply to Business Associate</li>
                <li>Make available PHI in accordance with 45 CFR § 164.524</li>
                <li>Make available PHI for amendment and incorporate any amendments to PHI in accordance with 45 CFR § 164.526</li>
                <li>Make available the information required to provide an accounting of disclosures in accordance with 45 CFR § 164.528</li>
                <li>Make its internal practices, books, and records relating to the use and disclosure of PHI available to the Secretary for purposes of determining Covered Entity's compliance with the HIPAA Rules</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-medium text-[#0c0b1d] mb-4">4. Important Note</h2>
              <p className="bg-[#f3f5f9] p-6 rounded-lg border-l-4 border-[#1ad07a]">
                <strong>HIPAA Hub does not store or process Protected Health Information (PHI).</strong> Our platform is designed exclusively for compliance documentation, risk assessments, policy management, and evidence storage. We maintain a "zero PHI architecture" to ensure we never handle patient health information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-medium text-[#0c0b1d] mb-4">5. Term and Termination</h2>
              <p>
                This Agreement shall remain in effect until terminated by either party. Upon termination, Business Associate shall return or destroy all PHI received from Covered Entity, or created or received by Business Associate on behalf of Covered Entity, if feasible. If return or destruction is not feasible, Business Associate shall extend the protections of this Agreement to such information and limit further uses and disclosures to those purposes that make the return or destruction infeasible.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-medium text-[#0c0b1d] mb-4">6. Contact Information</h2>
              <p>
                For questions about this BAA or HIPAA Hub's compliance practices, please contact:
              </p>
              <div className="bg-white p-6 rounded-lg border border-zinc-200 mt-4">
                <p className="mb-2"><strong>HIPAA Hub Inc.</strong></p>
                <p className="mb-2">Email: contact@hipaahubhealth.com</p>
                <p>Website: https://hipaahub.com</p>
              </div>
            </section>

            <section className="pt-8 border-t border-zinc-200">
              <p className="text-sm text-zinc-500 italic">
                <strong>Disclaimer:</strong> This BAA is a template agreement. Covered Entities should review this agreement with their legal counsel to ensure it meets their specific requirements and complies with applicable state and federal laws.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
