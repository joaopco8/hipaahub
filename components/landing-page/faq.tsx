'use client';

import { useState } from 'react';
import { Plus, Minus, ArrowUpRight } from 'lucide-react';
import { cn } from '@/utils/cn';

const categories = ["Platform", "Security", "Payments", "Training", "Legal"];

const faqs = [
  // Platform Questions
  {
    category: "Platform",
    question: "What exactly is the HIPAA Hub?",
    answer: "HIPAA Hub is an institutional-grade compliance management system that automates your HIPAA privacy and security requirements through risk assessments, policy generation, and evidence management. It's designed for small and mid-sized healthcare practices that need real audit defense, not theoretical compliance."
  },
  {
    category: "Platform",
    question: "Is this for small clinics?",
    answer: "Especially. HIPAA Hub is built for practices without in-house compliance teams. We make institutional-grade compliance accessible to clinics of all sizes, from solo practitioners to practices with up to 10 employees."
  },
  {
    category: "Platform",
    question: "What happens if I'm audited?",
    answer: "HIPAA Hub provides comprehensive compliance documentation including policies, risk assessments, evidence management, and training records. All your compliance data is organized, timestamped, and ready for regulatory inspection."
  },
  {
    category: "Platform",
    question: "How long does it take to get set up?",
    answer: "Most clinics complete their initial setup in 2-3 days. The onboarding process guides you through risk assessment, policy generation, and evidence upload. You can be audit-ready in days, not months."
  },
  {
    category: "Platform",
    question: "Can I integrate with my existing EHR system?",
    answer: "HIPAA Hub doesn't require direct EHR integration. We focus on compliance documentation and evidence management, not clinical data. You can export compliance reports and share them with your EHR vendor or IT team as needed."
  },
  {
    category: "Platform",
    question: "Do I need technical expertise to use HIPAA Hub?",
    answer: "No. HIPAA Hub is designed for clinic owners and practice managers without technical backgrounds. Our guided onboarding walks you through every step, and the interface is intuitive. If you can use email and basic software, you can use HIPAA Hub."
  },
  
  // Security Questions
  {
    category: "Security",
    question: "Do you store patient PHI?",
    answer: "No. We store compliance evidence, not medical records. Our 'zero PHI architecture' ensures we only handle your compliance documentation and operational evidence. We never see or store patient health information."
  },
  {
    category: "Security",
    question: "Is my data secure in the vault?",
    answer: "Yes. Every document and piece of evidence is encrypted with AES-256 military-grade encryption at rest and in transit. We follow NIST SP 800-53 security controls strictly and undergo regular security audits."
  },
  {
    category: "Security",
    question: "Where is my data stored?",
    answer: "All data is stored in SOC 2 Type II certified data centers within the United States. We use industry-leading cloud infrastructure with redundant backups and disaster recovery protocols."
  },
  {
    category: "Security",
    question: "How often is my data backed up?",
    answer: "All your compliance data is automatically backed up continuously in real-time. We maintain redundant backups across multiple secure data centers, ensuring your documentation is protected against data loss, hardware failures, or disasters."
  },
  {
    category: "Security",
    question: "What security certifications do you have?",
    answer: "We use SOC 2 Type II certified infrastructure and follow NIST SP 800-53 security controls. Our data centers are HIPAA-compliant and undergo regular third-party security audits. We maintain strict access controls and encryption standards to protect your compliance documentation."
  },
  {
    category: "Security",
    question: "Do you have a Business Associate Agreement (BAA)?",
    answer: "Yes. We provide a standard BAA that meets HIPAA requirements. It's automatically included when you sign up, and you can download it from your account settings at any time."
  },
  
  // Payments Questions
  {
    category: "Payments",
    question: "What is included in the $499/year plan?",
    answer: "Everything. Risk assessment, 9 master policies, evidence vault, staff training (up to 10 employees). No hidden fees, no per-document charges, no limits on document generation."
  },
  {
    category: "Payments",
    question: "Can I pay monthly instead of annually?",
    answer: "We offer annual billing only at $499/year. This ensures you have continuous compliance coverage and simplifies your budgeting. Annual plans also include priority support and early access to new features."
  },
  {
    category: "Payments",
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, Mastercard, American Express) and debit cards through our secure Stripe payment processor. All transactions are encrypted and PCI-DSS compliant."
  },
  {
    category: "Payments",
    question: "Can I get a refund if HIPAA Hub isn’t a fit?",
    answer: "We do not offer a free trial. However, we provide a 7-day money-back guarantee. If you're not satisfied within the first week, we'll refund your payment in full."
  },
  {
    category: "Payments",
    question: "What happens if I cancel my subscription?",
    answer: "You can cancel at any time. Your subscription will remain active until the end of your current billing period. You'll retain full access to export all your data, policies, and evidence before cancellation takes effect."
  },
  {
    category: "Payments",
    question: "Do you offer discounts for multiple locations?",
    answer: "Yes. If you operate multiple clinic locations, contact our sales team for volume pricing. We offer custom enterprise plans for healthcare organizations with multiple facilities."
  },
  
  // Training Questions
  {
    category: "Training",
    question: "Do staff certificates expire?",
    answer: "Yes. To maintain audit-readiness, we recommend annual HIPAA training. The system automatically alerts you when staff certificates are nearing their 365-day expiration. You can renew training at any time."
  },
  {
    category: "Training",
    question: "What training content is included?",
    answer: "Our training module covers all required HIPAA topics: Privacy Rule basics, Security Rule requirements, breach notification procedures, patient rights, and workforce responsibilities. Content is updated to reflect current OCR guidance."
  },
  {
    category: "Training",
    question: "Can I customize the training content?",
    answer: "The core training follows OCR-aligned curriculum, but you can add practice-specific scenarios and policies. Each staff member receives a personalized certificate with their name, completion date, and your organization's information."
  },
  {
    category: "Training",
    question: "How do I track who has completed training?",
    answer: "The dashboard shows a complete training roster with status (completed, in progress, not started), completion dates, and certificate expiration dates. All training records are stored securely and accessible for review."
  },
  {
    category: "Training",
    question: "What if a staff member fails the training quiz?",
    answer: "Staff can retake quizzes as many times as needed. The system tracks all attempts and only issues a certificate upon passing. This ensures everyone understands HIPAA requirements before being certified."
  },
  {
    category: "Training",
    question: "Is training available in languages other than English?",
    answer: "Currently, training is available in English only. However, you can supplement our training with your own translated materials and document completion in the Evidence Vault. Contact us if you need multi-language support."
  },
  
  // Legal Questions
  {
    category: "Legal",
    question: "Is this legal advice?",
    answer: "No. HIPAA Hub is a compliance management system aligned with federal requirements. We are not a law firm and do not provide legal advice. For specific legal questions about your situation, consult with a healthcare attorney."
  },
  {
    category: "Legal",
    question: "Will this guarantee I pass an OCR audit?",
    answer: "No system can guarantee audit outcomes. However, HIPAA Hub is built on OCR audit protocols and designed for real investigations. We help you build defensible evidence and documentation that demonstrates good-faith compliance efforts."
  },
  {
    category: "Legal",
    question: "What if I get a breach notification requirement?",
    answer: "HIPAA Hub includes breach notification templates and guidance. Our system helps you document the breach, assess risk, and generate required notifications. However, you should also consult legal counsel for breach-specific advice."
  },
  {
    category: "Legal",
    question: "Does this cover state-specific requirements?",
    answer: "HIPAA Hub focuses on federal HIPAA requirements. Some states have additional privacy laws (like California's CCPA). We provide guidance on common state requirements, but you should verify state-specific obligations with legal counsel."
  },
  {
    category: "Legal",
    question: "What if my practice is already under investigation?",
    answer: "HIPAA Hub can help organize existing evidence and generate missing documentation. However, if you're already under OCR investigation, you should immediately consult with a healthcare attorney who specializes in HIPAA enforcement."
  },
  {
    category: "Legal",
    question: "Are the generated policies legally binding?",
    answer: "The policies generated by HIPAA Hub are based on OCR requirements and industry best practices. Once you review, customize, and formally adopt them (with proper signatures and dates), they become your organization's official policies and are legally binding."
  }
];

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState("Platform");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // Filter FAQs by active category
  const filteredFaqs = faqs.filter(faq => faq.category === activeCategory);

  return (
    <section id="faq" className="w-full bg-[#0c0b1d] py-16 md:py-20 lg:py-24 font-extralight">
      <div className="max-w-7xl mx-auto px-6 font-extralight">
        <div className="space-y-20 font-extralight">
          
          {/* Header & Categories */}
          <div className="flex flex-col items-center space-y-12 font-extralight">
            <div className="text-center space-y-4 max-w-3xl font-extralight">
              <h2 className="text-sm text-[#1acb77] font-extralight">Support center</h2>
              <h3 className="text-4xl md:text-6xl font-extralight text-white">
                Frequently asked <span className="text-[#1acb77] font-extralight">questions</span>
              </h3>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap justify-center gap-3 font-extralight">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setOpenIndex(0); // Reset to first FAQ when changing category
                  }}
                  className={cn(
                    "px-8 py-3 rounded-full transition-all duration-300 text-sm border-2 font-extralight",
                    activeCategory === cat 
                      ? "bg-[#1acb77] border-[#1acb77] text-[#0d0d1f]" 
                      : "bg-transparent border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-white"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ 2-Column Accordion */}
          <div className="grid md:grid-cols-2 gap-8 items-start font-extralight">
            {filteredFaqs.map((faq, idx) => (
              <div 
                key={idx}
                className={cn(
                  "group rounded-[2rem] border-2 transition-all duration-500 overflow-hidden font-extralight",
                  openIndex === idx ? "bg-zinc-900/50 border-[#1acb77]/30" : "bg-zinc-900/30 border-zinc-700 hover:border-zinc-600"
                )}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                  className="w-full p-8 flex items-center justify-between text-left font-extralight"
                >
                  <span className="text-lg text-white pr-8 font-extralight">{faq.question}</span>
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 shrink-0 font-extralight",
                    openIndex === idx ? "bg-[#1acb77] text-[#0d0d1f] rotate-180" : "bg-[#1acb77] text-[#0d0d1f]"
                  )}>
                    {openIndex === idx ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </div>
                </button>
                
                <div className={cn(
                  "px-8 overflow-hidden transition-all duration-500 ease-in-out font-extralight",
                  openIndex === idx ? "max-h-96 pb-8" : "max-h-0"
                )}> 
                  <p className="text-zinc-300 leading-relaxed font-extralight">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Extra Help CTA */}
          <div className="flex justify-center pt-8 font-extralight">
            <div className="inline-flex items-center gap-4 bg-[#0d0d1f] text-white px-8 py-4 rounded-2xl shadow-2xl font-extralight">
              <span className="font-extralight">Still have questions?</span>
              <div className="w-px h-6 bg-white/20" />
              <button className="text-[#1acb77] text-xs flex items-center gap-2 hover:translate-x-1 transition-transform font-extralight">
                Contact our support
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
