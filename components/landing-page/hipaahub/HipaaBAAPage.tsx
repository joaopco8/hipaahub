'use client';

import React from 'react';
import { ArrowLeft, FileText, AlertTriangle } from 'lucide-react';

interface Props {
  onBack: () => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-thin text-[#0e274e] mb-4 pb-3 border-b border-gray-200 border-[0.5px]">{title}</h2>
      <div className="text-[#565656] font-thin text-sm leading-relaxed space-y-4">{children}</div>
    </div>
  );
};

function HipaaBAAPage({ onBack }: Props) {
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
              <FileText size={20} className="text-white" />
            </div>
            <span className="text-[11px] text-gray-400 font-thin">Legal Documentation</span>
          </div>
          <h1 className="text-4xl font-thin mb-4">Business Associate Agreement</h1>
          <p className="text-gray-400 font-thin text-sm">Effective Date: January 1, 2026 &nbsp;·&nbsp; HIPAA Hub Health, Inc.</p>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-16">

        {/* Legal Notice */}
        <div className="flex gap-4 bg-amber-50 border border-amber-200 p-6 mb-8">
          <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-amber-800 text-sm font-thin leading-relaxed">
            <strong className="font-normal">Important Notice:</strong> This Business Associate Agreement (BAA) governs the relationship between HIPAA Hub Health, Inc. and Covered Entities that use the HIPAA Hub platform. By subscribing to any paid plan, you agree that this BAA is incorporated into and made part of your service agreement. Please review this document carefully and consult your legal counsel as needed. This BAA is effective as of the date of your account activation.
          </p>
        </div>

        <div className="bg-[#f3f5f9] border-l-4 border-[#0175a2] p-6 mb-12">
          <p className="text-[#0e274e] text-sm font-thin leading-relaxed">
            This Business Associate Agreement ("BAA") is entered into between <strong className="font-normal">HIPAA Hub Health, Inc.</strong>, a Delaware corporation ("Business Associate" or "HIPAA Hub"), and the organization activating a HIPAA Hub account ("Covered Entity"). This BAA is incorporated into and made part of the HIPAA Hub Terms of Service (the "Agreement"). Capitalized terms not defined herein shall have the meanings set forth in the Health Insurance Portability and Accountability Act of 1996 (HIPAA), the Health Information Technology for Economic and Clinical Health Act (HITECH), and their implementing regulations at 45 CFR Parts 160 and 164 (collectively, "HIPAA Rules").
          </p>
        </div>

        <Section title="Recitals">
          <p>WHEREAS, the Covered Entity is a "covered entity" as defined under the HIPAA Rules, or operates on behalf of a covered entity; and</p>
          <p>WHEREAS, HIPAA Hub provides compliance management software and related services (the "Services") to the Covered Entity; and</p>
          <p>WHEREAS, in the course of providing the Services, HIPAA Hub may receive, create, maintain, transmit, or have access to Protected Health Information (PHI) on behalf of the Covered Entity;</p>
          <p>NOW, THEREFORE, in consideration of the mutual promises and covenants contained herein, and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the parties agree as follows:</p>
        </Section>

        <Section title="Article I — Definitions">
          <p><strong className="text-[#0e274e] font-normal">1.1 "Business Associate"</strong> means HIPAA Hub Health, Inc., which performs functions or activities, or provides services, on behalf of a Covered Entity that involve the use or disclosure of PHI.</p>
          <p><strong className="text-[#0e274e] font-normal">1.2 "Covered Entity"</strong> means the organization subscribing to the HIPAA Hub platform, which is a covered entity as defined under 45 CFR § 160.103.</p>
          <p><strong className="text-[#0e274e] font-normal">1.3 "Protected Health Information" or "PHI"</strong> has the meaning set forth in 45 CFR § 160.103, and is limited to PHI received from, or created, maintained, or transmitted on behalf of, the Covered Entity.</p>
          <p><strong className="text-[#0e274e] font-normal">1.4 "Electronic Protected Health Information" or "ePHI"</strong> means PHI that is created, received, maintained, or transmitted in electronic form, as defined in 45 CFR § 160.103.</p>
          <p><strong className="text-[#0e274e] font-normal">1.5 "Breach"</strong> has the meaning set forth in 45 CFR § 164.402: the acquisition, access, use, or disclosure of PHI in a manner not permitted under the HIPAA Rules that compromises the security or privacy of the PHI.</p>
          <p><strong className="text-[#0e274e] font-normal">1.6 "Security Incident"</strong> has the meaning set forth in 45 CFR § 164.304: the attempted or successful unauthorized access, use, disclosure, modification, or destruction of information or interference with system operations in an information system.</p>
          <p><strong className="text-[#0e274e] font-normal">1.7 "Services"</strong> means the HIPAA compliance management software and associated services provided by HIPAA Hub pursuant to the Agreement, including but not limited to document generation, risk assessment, training, and audit readiness tools.</p>
          <p><strong className="text-[#0e274e] font-normal">Note on PHI:</strong> HIPAA Hub's platform is architected to operate without storing PHI. This BAA covers any incidental or inadvertent access to PHI that may occur in the course of providing compliance support services. Covered Entities must not submit PHI to the platform except as necessary and minimally as required for generating compliant policy documentation.</p>
        </Section>

        <Section title="Article II — Obligations and Activities of Business Associate">
          <p><strong className="text-[#0e274e] font-normal">2.1 Use and Disclosure Limitations.</strong> Business Associate agrees to not use or disclose PHI other than as permitted or required by this BAA, the Agreement, or as required by applicable law. Business Associate shall use and disclose PHI only: (a) as necessary to perform the Services; (b) as required by applicable law; or (c) as otherwise permitted under this BAA.</p>
          <p><strong className="text-[#0e274e] font-normal">2.2 Safeguards.</strong> Business Associate agrees to implement and maintain appropriate administrative, technical, and physical safeguards to prevent use or disclosure of PHI other than as provided in this BAA, in accordance with 45 CFR Part 164 Subpart C. These safeguards include, but are not limited to:</p>
          <ul className="list-none space-y-3">
            {[
              'AES-256 encryption at rest for all data, including any PHI',
              'TLS 1.3 encryption for all data transmitted over public networks',
              'Role-based access controls restricting PHI access to authorized personnel only',
              'Multi-factor authentication for all systems that access or process PHI',
              'Continuous monitoring and anomaly detection on all PHI-related systems',
              'Annual Security Risk Analysis and implementation of identified safeguards',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-1 h-1 bg-[#0175a2] rounded-full mt-2 flex-shrink-0"></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p><strong className="text-[#0e274e] font-normal">2.3 Reporting.</strong> Business Associate agrees to report to Covered Entity: (a) any use or disclosure of PHI not provided for by this BAA of which it becomes aware, without unreasonable delay; (b) any Security Incident of which it becomes aware, within five (5) business days; and (c) any Breach of Unsecured PHI as defined in 45 CFR § 164.410, without unreasonable delay and in no case later than sixty (60) days after discovery of the Breach.</p>
          <p><strong className="text-[#0e274e] font-normal">2.4 Subcontractors.</strong> Business Associate agrees to ensure that any subcontractors or agents that create, receive, maintain, or transmit PHI on behalf of Business Associate agree to the same restrictions and conditions that apply to Business Associate under this BAA by executing written agreements with such subcontractors that provide equivalent protections.</p>
          <p><strong className="text-[#0e274e] font-normal">2.5 Access to PHI.</strong> Business Associate agrees to provide access to PHI in a designated record set to the Covered Entity, or, as directed by the Covered Entity, to an Individual, in a reasonable time and manner, as necessary to satisfy Covered Entity's obligations under 45 CFR § 164.524.</p>
          <p><strong className="text-[#0e274e] font-normal">2.6 Amendment of PHI.</strong> Business Associate agrees to make any amendment(s) to PHI in a designated record set as directed by or agreed to by the Covered Entity, pursuant to 45 CFR § 164.526.</p>
          <p><strong className="text-[#0e274e] font-normal">2.7 Accounting of Disclosures.</strong> Business Associate agrees to document such disclosures of PHI and information related to such disclosures as would be required for the Covered Entity to respond to a request by an Individual for an accounting of disclosures of PHI in accordance with 45 CFR § 164.528.</p>
          <p><strong className="text-[#0e274e] font-normal">2.8 Compliance with Privacy Rule.</strong> To the extent Business Associate carries out a Covered Entity's obligation under the Privacy Rule, Business Associate agrees to comply with the requirements of the Privacy Rule that apply to the Covered Entity in the performance of such obligation.</p>
          <p><strong className="text-[#0e274e] font-normal">2.9 Governmental Access.</strong> Business Associate agrees to make internal practices, books, and records relating to the use and disclosure of PHI received from, or created or received by, Business Associate on behalf of the Covered Entity, available to the Secretary of HHS for purposes of determining the Covered Entity's or Business Associate's compliance with the HIPAA Rules.</p>
        </Section>

        <Section title="Article III — Permitted Uses and Disclosures">
          <p><strong className="text-[#0e274e] font-normal">3.1 Permitted Uses.</strong> Except as otherwise limited in this BAA, Business Associate is permitted to use PHI for the proper management and administration of the Services, provided that: (a) such uses are necessary; and (b) Business Associate obtains reasonable assurances from the person to whom PHI is disclosed that the PHI will be held confidentially and used or further disclosed only as required by law or for the purposes for which it was disclosed to the person.</p>
          <p><strong className="text-[#0e274e] font-normal">3.2 Permitted Disclosures.</strong> Business Associate is permitted to disclose PHI for the following purposes: (a) as necessary to provide the Services to Covered Entity; (b) for Business Associate's proper management and administration; (c) to carry out its legal responsibilities; and (d) as required by law.</p>
          <p><strong className="text-[#0e274e] font-normal">3.3 Minimum Necessary.</strong> Business Associate agrees to use, disclose, or request only the minimum necessary PHI to accomplish the intended purpose, in accordance with 45 CFR § 164.502(b) and § 164.514(d).</p>
          <p><strong className="text-[#0e274e] font-normal">3.4 De-Identification.</strong> Business Associate may de-identify PHI in accordance with 45 CFR § 164.514 and use such de-identified data for service improvement and analytics purposes. De-identified data is not considered PHI under the HIPAA Rules.</p>
        </Section>

        <Section title="Article IV — Obligations of Covered Entity">
          <p><strong className="text-[#0e274e] font-normal">4.1 Notifications.</strong> Covered Entity shall notify Business Associate of any restriction on the use or disclosure of PHI agreed to by the Covered Entity, to the extent that such restriction may affect Business Associate's use or disclosure of PHI.</p>
          <p><strong className="text-[#0e274e] font-normal">4.2 Permissible Requests.</strong> Covered Entity shall not request Business Associate to use or disclose PHI in any manner that would not be permissible under the HIPAA Rules if done by the Covered Entity.</p>
          <p><strong className="text-[#0e274e] font-normal">4.3 PHI Submission.</strong> Covered Entity acknowledges that HIPAA Hub's platform is not designed or intended as a repository for PHI. Covered Entity shall minimize the inclusion of PHI in platform inputs and agrees to use de-identified information wherever possible. Covered Entity is solely responsible for any PHI submitted to the platform.</p>
          <p><strong className="text-[#0e274e] font-normal">4.4 Authorization.</strong> Covered Entity represents and warrants that it has obtained all required authorizations, consents, and approvals necessary to share any PHI with Business Associate under this BAA.</p>
        </Section>

        <Section title="Article V — Term and Termination">
          <p><strong className="text-[#0e274e] font-normal">5.1 Term.</strong> This BAA shall become effective on the date the Covered Entity activates a HIPAA Hub account and shall remain in effect until the termination of the Agreement, unless earlier terminated in accordance with this Article.</p>
          <p><strong className="text-[#0e274e] font-normal">5.2 Termination for Cause.</strong> Either party may terminate this BAA and the underlying Agreement upon thirty (30) days written notice if the other party materially breaches a provision of this BAA and does not cure the breach within the notice period. A material breach of this BAA shall be deemed a material breach of the Agreement.</p>
          <p><strong className="text-[#0e274e] font-normal">5.3 Effect of Termination.</strong> Upon termination of this BAA for any reason, Business Associate shall return or destroy all PHI received from, or created or received on behalf of, the Covered Entity that Business Associate still maintains in any form. If return or destruction of PHI is not feasible, protections shall be extended to such PHI, and uses and disclosures shall be limited to those purposes that make the return or destruction of the PHI infeasible.</p>
          <p><strong className="text-[#0e274e] font-normal">5.4 Survival.</strong> The provisions of this BAA shall survive the termination of the Agreement to the extent necessary to ensure compliance with applicable law, including the HIPAA Rules.</p>
        </Section>

        <Section title="Article VI — General Provisions">
          <p><strong className="text-[#0e274e] font-normal">6.1 Amendment.</strong> This BAA may be modified by HIPAA Hub to ensure compliance with applicable law, including changes to the HIPAA Rules. HIPAA Hub will provide thirty (30) days written notice of material amendments. Continued use of the Services after the effective date of the amendment constitutes acceptance.</p>
          <p><strong className="text-[#0e274e] font-normal">6.2 Interpretation.</strong> Any ambiguity in this BAA shall be resolved to permit the parties to comply with the HIPAA Rules. The parties agree to take such action as is necessary to implement the standards and requirements of the HIPAA Rules.</p>
          <p><strong className="text-[#0e274e] font-normal">6.3 No Third-Party Beneficiaries.</strong> Nothing in this BAA shall confer any rights or remedies upon any person other than the parties hereto and their respective successors and permitted assigns.</p>
          <p><strong className="text-[#0e274e] font-normal">6.4 Regulatory References.</strong> A reference in this BAA to a section in the HIPAA Rules means the section currently in effect and as it may be amended from time to time.</p>
          <p><strong className="text-[#0e274e] font-normal">6.5 Governing Law.</strong> This BAA shall be governed by the laws of the State of California and applicable federal law, including the HIPAA Rules.</p>
          <p><strong className="text-[#0e274e] font-normal">6.6 Entire Agreement.</strong> This BAA, together with the Agreement and all exhibits and addenda thereto, constitutes the entire agreement between the parties with respect to the subject matter hereof, and supersedes all prior and contemporaneous agreements and understandings, whether written or oral.</p>
        </Section>

        <Section title="Article VII — Liability and Indemnification">
          <p><strong className="text-[#0e274e] font-normal">7.1 HIPAA Hub Indemnification.</strong> Business Associate shall indemnify, defend, and hold harmless Covered Entity and its officers, directors, employees, and agents from and against any claims, damages, penalties, fines, or expenses (including reasonable attorneys' fees) arising from Business Associate's material breach of this BAA or its failure to comply with applicable HIPAA Rules, except to the extent caused by Covered Entity's acts or omissions.</p>
          <p><strong className="text-[#0e274e] font-normal">7.2 Covered Entity Indemnification.</strong> Covered Entity shall indemnify, defend, and hold harmless Business Associate and its officers, directors, employees, and agents from and against any claims, damages, penalties, fines, or expenses (including reasonable attorneys' fees) arising from Covered Entity's material breach of this BAA, Covered Entity's violation of applicable HIPAA Rules, or Covered Entity's submission of PHI to the platform in a manner contrary to the terms of this BAA.</p>
          <p><strong className="text-[#0e274e] font-normal">7.3 Limitation of Liability.</strong> The limitation of liability provisions in the Agreement shall apply to this BAA, except to the extent prohibited by applicable law.</p>
        </Section>

        <Section title="Contact for BAA Inquiries">
          <div className="bg-[#f3f5f9] p-6 mt-4 space-y-2">
            <p><strong className="text-[#0e274e] font-normal">HIPAA Hub Health, Inc. — Compliance Officer</strong></p>
            <p>150 North First Street, Suite 300</p>
            <p>San Jose, CA 95113</p>
            <p>Email: <span className="text-[#0175a2]">compliance@hipaahubhealth.com</span></p>
            <p>Phone: +1-800-HIPAA-HUB</p>
            <p>For executed BAA requests (Enterprise): <span className="text-[#0175a2]">legal@hipaahubhealth.com</span></p>
          </div>
          <div className="mt-4 text-xs text-[#565656] font-thin bg-[#f3f5f9] p-4">
            <p><strong className="text-[#0e274e] font-normal">Note for Enterprise Customers:</strong> If your organization requires a countersigned, executed copy of this BAA with specific amendments for your compliance program, please contact our Enterprise team at <span className="text-[#0175a2]">enterprise@hipaahubhealth.com</span>. Our compliance team will work with you to accommodate reasonable requests.</p>
          </div>
        </Section>

        <div className="pt-8 border-t border-gray-200 border-[0.5px] mt-12">
          <p className="text-xs text-gray-400 font-thin">© 2026 HIPAA Hub Health, Inc. All rights reserved. This Business Associate Agreement is a legally binding document. Consult qualified healthcare legal counsel before executing. Nothing in this document constitutes legal advice.</p>
        </div>
      </div>
    </div>
  );
}

export default HipaaBAAPage;
