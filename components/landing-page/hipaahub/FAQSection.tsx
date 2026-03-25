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
      question: "Do I really need this if it's just me and one assistant?",
      answer: "Yes. OCR audits sole proprietors and small practices at the same rate as large clinics. In fact, small practices are audited more frequently because they're less likely to have documentation ready. HIPAA Hub was built specifically for practices with 1–5 staff."
    },
    {
      question: "What happens if I get audited while using HIPAA Hub?",
      answer: "You'll have everything the OCR needs in one place. Our one-click Audit Export compiles your policies, risk assessments, training records, and incident logs into a structured evidence package, the exact format auditors expect. Most of our clients receive audit requests and respond within 24 hours."
    },
    {
      question: "Does this replace a HIPAA consultant?",
      answer: "For most small practices, yes. HIPAA Hub gives you the same policies, assessments, and documentation a consultant would produce, at a fraction of the cost. If you face an active OCR investigation, we recommend pairing our platform with legal counsel."
    },
    {
      question: "My EHR is HIPAA compliant — do I still need this?",
      answer: "Yes. Your EHR being HIPAA compliant means the vendor has secured their platform. It does not mean your organization is HIPAA compliant.\n\nAs a covered entity, you are independently responsible for: maintaining written HIPAA policies, conducting annual risk assessments, training your staff, managing Business Associate Agreements with every vendor (including your EHR), and having a documented breach response plan.\n\nNone of those obligations are fulfilled by your EHR. HIPAA Hub covers exactly what your EHR doesn't."
    },
    {
      question: "How long does setup actually take?",
      answer: "Most practices are fully configured in 1–3 hours. You create your account, complete the risk assessment questionnaire (about 45 minutes), customize your 9 policy templates, and add your team. Your compliance score updates in real time as you complete each step."
    },
    {
      question: "What if I already have HIPAA policies from somewhere else?",
      answer: "Upload them to your Evidence Center and we'll keep them versioned and audit-ready. Many clients start with existing policies and use HIPAA Hub to fill the gaps the Risk Assessment identifies."
    },
    {
      question: "Is my patient data stored in HIPAA Hub?",
      answer: "No. HIPAA Hub stores your compliance documentation: policies, training records, risk assessments, incident logs. No PHI (patient health information) is ever stored on our platform. We sign a Business Associate Agreement with every customer."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes. No contracts, no cancellation fees. If you cancel, you can export all your documentation before your account closes."
    },
    {
      question: "What support do you offer?",
      answer: "Solo plan includes email support with 48-hour response. Practice and Clinic plans include phone support and priority response times. Enterprise customers receive a dedicated compliance advisor with direct escalation."
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
