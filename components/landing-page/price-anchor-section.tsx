'use client';

import { DollarSign, AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';

const comparisons = [
  {
    icon: DollarSign,
    label: "HIPAA consultants",
    price: "$10,000+",
    period: "Per assessment",
    color: "text-zinc-400"
  },
  {
    icon: AlertCircle,
    label: "Manual audit cost",
    price: "$5,000+",
    period: "In lost billable hours",
    color: "text-amber-500"
  },
  {
    icon: ShieldAlert,
    label: "OCR breach fines",
    price: "$1.5M",
    period: "Annual maximum penalty",
    color: "text-red-500"
  }
];

export default function PriceAnchorSection() {
  return (
    <section id="pricing" className="w-full bg-[#f3f5f9] py-24 md:py-48 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-sm font-medium text-[#1acb77]">The investment</h2>
            <h3 className="text-4xl md:text-6xl font-extralight text-[#0d0d1f] leading-tight">
              A fraction of the cost <br /> of non-compliance
            </h3>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-stretch">
            {/* Comparison Column */}
            <div className="lg:col-span-2 grid md:grid-cols-3 gap-6">
              {comparisons.map((item, idx) => (
                <div key={idx} className="bg-white rounded-[2rem] p-8 border border-zinc-100 flex flex-col justify-between group hover:border-[#0d0d1f] transition-all duration-500">
                  <div className="space-y-6">
                    <div className="w-12 h-12 rounded-xl bg-[#f3f5f9] flex items-center justify-center">
                      <item.icon className={item.color} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-zinc-400">{item.label}</p>
                      <p className="text-3xl font-light text-[#0d0d1f]">{item.price}</p>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500 font-medium mt-8">{item.period}</p>
                </div>
              ))}
            </div>

            {/* HIPAA Hub Column */}
            <div className="bg-[#0d0d1f] rounded-[2.5rem] p-10 text-white flex flex-col justify-between relative overflow-hidden group shadow-2xl">
              {/* Decorative background */}
              <div className="absolute top-0 right-0 w-full h-full bg-[#1acb77]/10 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2" />
              
              <div className="relative z-10 space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1acb77] text-[#0d0d1f]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-xs font-medium">The best choice</span>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-white/60">HIPAA Hub Unlimited</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-light">$500</span>
                    <span className="text-xl text-white/40 font-medium">/year</span>
                  </div>
                </div>

                <ul className="space-y-4 pt-4">
                  {[
                    "Complete risk assessment",
                    "Automated policy engine",
                    "Evidence vault & logs",
                    "Staff training & quizzes"
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-medium text-white/80">
                      <CheckCircle2 className="w-4 h-4 text-[#1acb77]" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative z-10 pt-12">
                <p className="text-xs text-white/40 font-medium leading-relaxed italic">
                  * Pricing designed for clinics with up to 10 employees. Larger organizations contact us.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
