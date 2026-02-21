import React from 'react';
import { Check, X, Shield, Cpu, Archive, Users, FileText, ArrowRight } from 'lucide-react';

const WhyChooseUs: React.FC = () => {
  const comparison = [
    { feature: "Risk Assessment Engine", hub: "✓ Automated", generic: "✗ Manual", diy: "✗ Not available" },
    { feature: "9 Customizable Policies", hub: "✓ Included", generic: "✗ Generic templates", diy: "✗ Not included" },
    { feature: "Documentation Repository", hub: "✓ Centralized", generic: "✓ Available", diy: "✗ Fragmented" },
    { feature: "Training Management", hub: "✓ Automated tracking", generic: "✗ Manual", diy: "✗ Not available" },
    { feature: "Breach Response", hub: "✓ Templates + support", generic: "✗ Templates only", diy: "✗ Not available" },
    { feature: "Audit Export", hub: "✓ One-click", generic: "✗ Manual compilation", diy: "✗ Manual" },
    { feature: "Compliance Monitoring", hub: "✓ Quarterly reviews", generic: "✗ Not available", diy: "✗ Not available" },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-[54px] font-thin text-cisco-navy leading-tight mb-6">How HIPAA Hub Compares.</h2>
          <h3 className="text-xl font-thin text-cisco-blue mb-6">See why healthcare organizations choose HIPAA Hub.</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-100">
                <th className="p-6 text-[10px] font-thin text-gray-400">Feature</th>
                <th className="p-6 text-[10px] font-thin text-cisco-navy border-x border-gray-100 bg-blue-50/50">HIPAA Hub</th>
                <th className="p-6 text-[10px] font-thin text-gray-400">Generic Software</th>
                <th className="p-6 text-[10px] font-thin text-gray-400">DIY Spreadsheets</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {comparison.map((row, i) => (
                <tr key={i} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="p-6 text-sm font-thin text-cisco-navy">{row.feature}</td>
                  <td className="p-6 text-sm font-thin text-cisco-blue border-x border-gray-100 bg-blue-50/30">{row.hub}</td>
                  <td className="p-6 text-sm font-thin text-gray-400">{row.generic}</td>
                  <td className="p-6 text-sm font-thin text-gray-400">{row.diy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-20 p-12 bg-gray-50 border border-gray-100 text-center flex flex-col items-center">
           <p className="text-gray-500 text-lg font-thin mb-10 max-w-2xl">
             DIY spreadsheets cost $0 in licensing, but require 40+ hours of labor and leave critical gaps in your compliance posture.
           </p>
           <button className="bg-cisco-blue text-white px-12 py-5 text-sm font-thin hover:bg-cisco-navy transition-all flex items-center gap-3">
             Start 14-day free trial <ArrowRight size={18} />
           </button>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
