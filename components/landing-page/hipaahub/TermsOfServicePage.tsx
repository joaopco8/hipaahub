'use client';

import React from 'react';
import { ArrowLeft, FileText } from 'lucide-react';

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

function TermsOfServicePage({ onBack }: Props) {
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
          <h1 className="text-4xl font-thin mb-4">Terms of Service</h1>
          <p className="text-gray-400 font-thin text-sm">Effective Date: January 1, 2026 &nbsp;·&nbsp; Last Updated: January 15, 2026</p>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-16">

        <div className="bg-[#f3f5f9] border-l-4 border-[#0175a2] p-6 mb-12">
          <p className="text-[#0e274e] text-sm font-thin leading-relaxed">
            These Terms of Service ("Terms") constitute a legally binding agreement between HIPAA Hub Health, Inc. ("HIPAA Hub," "we," "us," or "our") and you or the organization you represent ("Customer," "you," or "your"). By accessing or using the HIPAA Hub platform at{' '}
            <span className="text-[#0175a2]">www.hipaahubhealth.com</span>, you confirm that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you are entering into these Terms on behalf of an organization, you represent and warrant that you have authority to do so.
          </p>
        </div>

        <Section title="1. Description of Services">
          <p>HIPAA Hub provides a software-as-a-service (SaaS) compliance management platform designed to help healthcare organizations and their administrative staff manage HIPAA compliance obligations. The platform includes, but is not limited to:</p>
          <ul className="list-none space-y-3">
            {[
              'Guided compliance onboarding and HIPAA roadmap generation',
              'AI-assisted policy and procedure document generation',
              'Security Risk Analysis (SRA) tools and risk scoring',
              'Employee HIPAA training modules and certificate issuance',
              'Evidence and document repository management',
              'Audit readiness checklists and export functionality',
              'Business Associate Agreement (BAA) templates',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-1 h-1 bg-[#0175a2] rounded-full mt-2 flex-shrink-0"></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p><strong className="text-[#0e274e] font-normal">Disclaimer:</strong> HIPAA Hub is a compliance support tool and does not provide legal advice, medical advice, or regulatory consulting. All generated documents are templates and starting points. You are solely responsible for reviewing, customizing, and implementing compliance measures appropriate for your organization. You should consult qualified legal counsel for compliance guidance specific to your situation.</p>
        </Section>

        <Section title="2. Account Registration and Access">
          <p><strong className="text-[#0e274e] font-normal">2.1 Eligibility.</strong> You must be at least 18 years of age and have the legal authority to enter into binding agreements to use this platform. The platform is intended for business use by healthcare organizations operating in the United States.</p>
          <p><strong className="text-[#0e274e] font-normal">2.2 Account Security.</strong> You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You agree to notify us immediately at <span className="text-[#0175a2]">security@hipaahubhealth.com</span> of any unauthorized access or suspected breach of your account. HIPAA Hub will not be liable for any losses arising from unauthorized use of your account due to your failure to safeguard your credentials.</p>
          <p><strong className="text-[#0e274e] font-normal">2.3 Account Types and Roles.</strong> Your subscription may include multiple user roles (Administrator, Staff). Administrators are responsible for managing user access and ensuring all users comply with these Terms. You are responsible for ensuring that any individuals you grant access to the platform comply with these Terms.</p>
          <p><strong className="text-[#0e274e] font-normal">2.4 Accurate Information.</strong> You agree to provide and maintain accurate, complete, and current account information. Providing false, inaccurate, or misleading information is grounds for immediate account termination.</p>
        </Section>

        <Section title="3. Subscription Plans and Billing">
          <p><strong className="text-[#0e274e] font-normal">3.1 Subscription Plans.</strong> HIPAA Hub offers subscription plans as described on our pricing page. Features and limits vary by plan. We reserve the right to modify plan offerings with thirty (30) days' advance notice.</p>
          <p><strong className="text-[#0e274e] font-normal">3.2 Payment.</strong> Subscriptions are billed monthly or annually in advance, depending on the plan selected. All fees are quoted and charged in US Dollars. Payment is due at the start of each billing cycle. By providing payment information, you authorize HIPAA Hub to charge your payment method for the applicable fees.</p>
          <p><strong className="text-[#0e274e] font-normal">3.3 Free Trial.</strong> We offer a 14-day free trial for new subscribers. No credit card is required during the trial period. At the end of the trial, your account will automatically convert to a paid subscription unless you cancel before the trial expires.</p>
          <p><strong className="text-[#0e274e] font-normal">3.4 Taxes.</strong> All fees are exclusive of applicable taxes, levies, or duties. You are responsible for paying all applicable taxes associated with your subscription.</p>
          <p><strong className="text-[#0e274e] font-normal">3.5 Refund Policy.</strong> All subscription fees are non-refundable except where required by applicable law. In the event of a billing dispute, you must notify us within sixty (60) days of the disputed charge at <span className="text-[#0175a2]">billing@hipaahubhealth.com</span>.</p>
          <p><strong className="text-[#0e274e] font-normal">3.6 Late Payment.</strong> If payment fails, we will attempt to process the charge up to three (3) times within a seven-day period. If payment remains outstanding, your account may be suspended until the balance is resolved.</p>
        </Section>

        <Section title="4. Acceptable Use">
          <p>You agree to use the platform only for lawful purposes and in accordance with these Terms. You expressly agree NOT to:</p>
          <ul className="list-none space-y-3">
            {[
              'Upload, store, or transmit any Protected Health Information (PHI) about patients or individuals',
              'Reverse engineer, decompile, or disassemble any part of the platform or its underlying technology',
              'Attempt to gain unauthorized access to any part of the platform, its servers, or connected systems',
              'Use the platform to distribute malware, viruses, or any malicious code',
              'Scrape, crawl, or extract data from the platform using automated means without prior written consent',
              'Resell, sublicense, or otherwise provide access to the platform to third parties outside your organization without authorization',
              'Use the platform to violate any applicable federal, state, or local law or regulation',
              'Impersonate any person or entity, or misrepresent your affiliation with any person or entity',
              'Interfere with or disrupt the platform\'s integrity, performance, or availability',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-1 h-1 bg-[#c0392b] rounded-full mt-2 flex-shrink-0"></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p>Violation of this section may result in immediate account suspension or termination without refund and may expose you to civil or criminal liability.</p>
        </Section>

        <Section title="5. Intellectual Property">
          <p><strong className="text-[#0e274e] font-normal">5.1 HIPAA Hub Ownership.</strong> The platform, including its software, design, architecture, text, graphics, logos, and all other content (excluding Customer Content), is owned by HIPAA Hub Health, Inc. and is protected by United States and international intellectual property laws. You are granted a limited, non-exclusive, non-transferable, revocable license to use the platform during your subscription period, solely for your internal business compliance purposes.</p>
          <p><strong className="text-[#0e274e] font-normal">5.2 Customer Content.</strong> You retain full ownership of all data, documents, and information you upload or create within the platform ("Customer Content"). By submitting Customer Content, you grant HIPAA Hub a limited license to store, process, and display it solely to provide the services. HIPAA Hub does not claim ownership of Customer Content.</p>
          <p><strong className="text-[#0e274e] font-normal">5.3 Feedback.</strong> If you provide us with feedback, suggestions, or ideas about the platform, you grant HIPAA Hub a perpetual, irrevocable, royalty-free license to use and incorporate such feedback into the platform without obligation or attribution.</p>
          <p><strong className="text-[#0e274e] font-normal">5.4 AI-Generated Content.</strong> Documents and reports generated by the platform's AI-assisted tools are provided as templates and starting points. HIPAA Hub grants you a non-exclusive license to use, modify, and adapt such generated content for your internal compliance purposes.</p>
        </Section>

        <Section title="6. Confidentiality">
          <p>Each party agrees to keep confidential the other party's non-public, proprietary, or confidential information ("Confidential Information") that is disclosed in connection with the use of the platform. Each party agrees to: (a) use the other's Confidential Information only as permitted under these Terms; (b) protect Confidential Information using the same degree of care as it uses to protect its own, but in no event less than reasonable care; and (c) not disclose Confidential Information to third parties without prior written consent. Confidential Information does not include information that becomes publicly available through no breach of these Terms, or information independently developed without reference to the disclosing party's Confidential Information.</p>
        </Section>

        <Section title="7. Disclaimer of Warranties">
          <p>THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. HIPAA HUB DOES NOT WARRANT THAT:</p>
          <ul className="list-none space-y-3">
            {[
              'The platform will meet your specific requirements or compliance objectives',
              'The platform will be uninterrupted, error-free, or available at any particular time',
              'Any generated documents will be legally sufficient or compliant with all applicable laws and regulations',
              'Results obtained from the platform will be accurate or reliable',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-1 h-1 bg-[#0175a2] rounded-full mt-2 flex-shrink-0"></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p>Use of the platform does not guarantee HIPAA compliance. You remain solely responsible for ensuring your organization meets all applicable regulatory requirements.</p>
        </Section>

        <Section title="8. Limitation of Liability">
          <p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, HIPAA HUB AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AND LICENSORS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES, INCLUDING BUT NOT LIMITED TO LOST PROFITS, LOSS OF DATA, LOSS OF GOODWILL, OR BUSINESS INTERRUPTION, ARISING FROM YOUR USE OF OR INABILITY TO USE THE PLATFORM, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.</p>
          <p>IN NO EVENT SHALL HIPAA HUB'S TOTAL CUMULATIVE LIABILITY ARISING OUT OF OR RELATED TO THESE TERMS OR THE PLATFORM EXCEED THE GREATER OF (A) THE TOTAL FEES PAID BY YOU IN THE TWELVE (12) MONTHS IMMEDIATELY PRECEDING THE CLAIM, OR (B) ONE HUNDRED US DOLLARS ($100.00).</p>
        </Section>

        <Section title="9. Indemnification">
          <p>You agree to indemnify, defend, and hold harmless HIPAA Hub, its affiliates, and their respective officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, costs, or expenses (including reasonable attorneys' fees) arising out of or in connection with: (a) your use of the platform; (b) your Customer Content; (c) your violation of these Terms; (d) your violation of any applicable law; or (e) any claim that your Customer Content infringes the intellectual property or other rights of any third party.</p>
        </Section>

        <Section title="10. Term and Termination">
          <p><strong className="text-[#0e274e] font-normal">10.1 Term.</strong> These Terms begin on the date you first access the platform and continue until terminated.</p>
          <p><strong className="text-[#0e274e] font-normal">10.2 Termination by Customer.</strong> You may cancel your subscription at any time through your account settings. Cancellation takes effect at the end of the current billing period. No refunds are issued for unused portions of a subscription term.</p>
          <p><strong className="text-[#0e274e] font-normal">10.3 Termination by HIPAA Hub.</strong> We may suspend or terminate your account immediately if: (a) you materially breach these Terms; (b) your payment is overdue by more than 14 days; (c) we reasonably suspect fraudulent or illegal activity; or (d) we are required to do so by law.</p>
          <p><strong className="text-[#0e274e] font-normal">10.4 Effect of Termination.</strong> Upon termination, your access to the platform ceases immediately. You may request an export of your Customer Content within thirty (30) days of termination. After this period, your data may be deleted in accordance with our data retention policy. All provisions of these Terms that by their nature should survive termination shall survive.</p>
        </Section>

        <Section title="11. Governing Law and Dispute Resolution">
          <p><strong className="text-[#0e274e] font-normal">11.1 Governing Law.</strong> These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions.</p>
          <p><strong className="text-[#0e274e] font-normal">11.2 Informal Resolution.</strong> Before initiating formal legal proceedings, you agree to contact us at <span className="text-[#0175a2]">legal@hipaahubhealth.com</span> to attempt informal resolution. Both parties will make good-faith efforts to resolve any dispute within thirty (30) days.</p>
          <p><strong className="text-[#0e274e] font-normal">11.3 Binding Arbitration.</strong> If informal resolution fails, all disputes shall be resolved through binding arbitration administered by the American Arbitration Association (AAA) under its Commercial Arbitration Rules. Arbitration shall occur in Santa Clara County, California. Judgment on the arbitration award may be entered in any court of competent jurisdiction.</p>
          <p><strong className="text-[#0e274e] font-normal">11.4 Class Action Waiver.</strong> You waive any right to participate in class action lawsuits or class-wide arbitrations against HIPAA Hub.</p>
        </Section>

        <Section title="12. Modifications to Terms">
          <p>We reserve the right to modify these Terms at any time. Material changes will be communicated via email or prominent notice on the platform at least thirty (30) days before the effective date. Your continued use of the platform after the effective date of the revised Terms constitutes your acceptance of the changes.</p>
        </Section>

        <Section title="13. General Provisions">
          <p><strong className="text-[#0e274e] font-normal">Entire Agreement.</strong> These Terms, together with our Privacy Policy and any executed Order Forms, constitute the entire agreement between you and HIPAA Hub and supersede all prior agreements.</p>
          <p><strong className="text-[#0e274e] font-normal">Severability.</strong> If any provision of these Terms is found to be unenforceable, the remaining provisions shall remain in full force and effect.</p>
          <p><strong className="text-[#0e274e] font-normal">Waiver.</strong> HIPAA Hub's failure to enforce any right or provision of these Terms shall not constitute a waiver of such right or provision.</p>
          <p><strong className="text-[#0e274e] font-normal">Assignment.</strong> You may not assign or transfer your rights or obligations under these Terms without our prior written consent. HIPAA Hub may assign these Terms without restriction.</p>
          <p><strong className="text-[#0e274e] font-normal">Force Majeure.</strong> Neither party will be liable for delays or failures in performance resulting from causes beyond their reasonable control, including natural disasters, government actions, or internet infrastructure failures.</p>
        </Section>

        <Section title="14. Contact">
          <div className="bg-[#f3f5f9] p-6 mt-4 space-y-2">
            <p><strong className="text-[#0e274e] font-normal">HIPAA Hub Health, Inc. — Legal Department</strong></p>
            <p>150 North First Street, Suite 300</p>
            <p>San Jose, CA 95113</p>
            <p>Email: <span className="text-[#0175a2]">legal@hipaahubhealth.com</span></p>
            <p>Phone: +1-800-HIPAA-HUB</p>
          </div>
        </Section>

        <div className="pt-8 border-t border-gray-200 border-[0.5px] mt-12">
          <p className="text-xs text-gray-400 font-thin">© 2026 HIPAA Hub Health, Inc. All rights reserved. These Terms of Service do not constitute legal advice. Consult qualified legal counsel for compliance-specific guidance.</p>
        </div>
      </div>
    </div>
  );
}

export default TermsOfServicePage;
