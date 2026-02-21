import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button 
        className="w-full py-6 md:py-8 flex justify-between items-center text-left focus:outline-none group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`text-slate-800 text-base md:text-xl transition-colors ${isOpen ? 'text-cisco-blue font-thin' : 'font-thin hover:text-cisco-blue'}`}>
          {question}
        </span>
        {isOpen ? <ChevronUp size={20} className="text-cisco-blue" /> : <ChevronDown size={20} className="text-gray-300" />}
      </button>
      {isOpen && (
        <div className="pb-8 text-gray-500 text-sm md:text-base font-thin leading-relaxed whitespace-pre-wrap animate-reveal">
          {answer}
        </div>
      )}
    </div>
  );
};

const FAQSection: React.FC = () => {
  const faqs = [
    {
      question: "How does the Risk Assessment Engine work?",
      answer: "The Risk Assessment Engine evaluates your organization against HIPAA regulatory requirements. It identifies gaps, quantifies compliance risk, and produces a risk score (0-100). The assessment takes 1-2 hours and provides a prioritized remediation roadmap."
    },
    {
      question: "Can I customize the 9 policies to my organization?",
      answer: "Yes. All 9 policies are fully customizable to your organization's specific workflows, staff structure, and operational requirements. You can edit policies directly in the platform."
    },
    {
      question: "What if I already have HIPAA policies?",
      answer: "You can upload your existing policies into HIPAA Hub. The platform will compare them against regulatory requirements and identify gaps. You can then customize or replace policies as needed."
    },
    {
      question: "How long does it take to get audit-ready?",
      answer: "Most organizations are audit-ready within 7-14 days. The timeline depends on your starting compliance posture and how quickly you implement recommendations. The Risk Assessment Engine prioritizes critical gaps first."
    },
    {
      question: "Does HIPAA Hub integrate with my EHR?",
      answer: "Yes. HIPAA Hub integrates with major EHR systems (Epic, Cerner, etc.) and other healthcare software. We also support integration with Google Drive, Dropbox, email, and other common tools."
    },
    {
      question: "What happens if we're audited?",
      answer: "HIPAA Hub provides one-click audit export. All required documentation is compiled, organized, and ready for OCR. We also provide audit support (included in Professional and Enterprise plans)."
    },
    {
      question: "Is my data secure?",
      answer: "Yes. HIPAA Hub uses AES-256 encryption, role-based access controls, multi-factor authentication, and SOC 2 Type II compliance. We maintain a HIPAA Business Associate Agreement with all customers."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes. You can cancel your subscription anytime with no penalty. Your data remains accessible for 30 days after cancellation."
    },
    {
      question: "Do you offer a free trial?",
      answer: "Yes. All plans include a 14-day free trial with full access to all features. No credit card required."
    },
    {
      question: "What support do you offer?",
      answer: "Starter plan includes email support. Professional and Enterprise plans include phone support and priority response times. Enterprise customers receive a dedicated compliance advisor."
    }
  ];

  return (
    <section id="support" className="py-24 bg-white border-b border-gray-200 border-[0.5px]">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-[48px] font-thin text-slate-800 leading-tight">Frequently Asked Questions</h2>
          <h3 className="text-xl font-thin text-cisco-blue mt-4">Everything you need to know about HIPAA Hub.</h3>
        </div>
        <div className="bg-gray-50 px-10 border border-gray-100 shadow-sm">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
