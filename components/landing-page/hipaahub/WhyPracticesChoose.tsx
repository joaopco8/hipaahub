import React from 'react';

const rows = [
  {
    label: 'Starting price',
    hipaaHub: '$79/mo',
    compliancyGroup: '$399/mo',
    manual: 'Your time + legal risk',
  },
  {
    label: 'Setup time',
    hipaaHub: '1-3 hours',
    compliancyGroup: '4–6 weeks',
    manual: 'Months',
  },
  {
    label: 'Pre-built HIPAA policies',
    hipaaHub: '✓ 9 included',
    compliancyGroup: '✓ included',
    manual: '✗ build yourself',
  },
  {
    label: 'Automated risk scoring',
    hipaaHub: '✓',
    compliancyGroup: '✓',
    manual: '✗',
  },
  {
    label: 'One-click audit export',
    hipaaHub: '✓',
    compliancyGroup: '✗',
    manual: '✗',
  },
  {
    label: 'Breach notification letters',
    hipaaHub: '✓',
    compliancyGroup: '✓',
    manual: '✗',
  },
  {
    label: 'Built for solo practices',
    hipaaHub: '✓',
    compliancyGroup: 'Partial',
    manual: '✗',
  },
  {
    label: 'No per-seat pricing',
    hipaaHub: '✓',
    compliancyGroup: '✗',
    manual: 'N/A',
  },
];

const isCheck = (value: string) => value.trim().startsWith('✓');
const isCross = (value: string) => value.trim().startsWith('✗');

const WhyPracticesChoose: React.FC = () => {
  return (
    <section className="py-24 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <div className="mb-10 md:mb-12 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-thin text-cisco-navy mb-4">
            Why practices choose HIPAA Hub
          </h2>
          <p className="text-sm md:text-base text-gray-500 font-thin">
            A clear comparison so you can decide how to run HIPAA compliance for your practice.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide pb-4 border-b border-gray-200">
                  Feature
                </th>
                <th className="text-left text-xs font-semibold text-cisco-navy uppercase tracking-wide pb-4 border-b-2 border-cisco-blue bg-cisco-blue/5 px-4">
                  HIPAA Hub
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide pb-4 border-b border-gray-200 px-4">
                  Compliancy Group
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide pb-4 border-b border-gray-200 px-4">
                  Spreadsheet / Manual
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-b border-gray-100 last:border-b-0">
                  <td className="py-4 pr-4 text-gray-900 text-sm font-medium">
                    {row.label}
                  </td>
                  <td className="py-4 px-4 bg-cisco-blue/5 border-x border-cisco-blue/20 text-sm text-cisco-navy font-semibold">
                    <span
                      className={
                        isCheck(row.hipaaHub)
                          ? 'text-emerald-600'
                          : isCross(row.hipaaHub)
                          ? 'text-red-500'
                          : ''
                      }
                    >
                      {row.hipaaHub}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-700">
                    <span
                      className={
                        isCheck(row.compliancyGroup)
                          ? 'text-emerald-600'
                          : isCross(row.compliancyGroup)
                          ? 'text-red-500'
                          : ''
                      }
                    >
                      {row.compliancyGroup}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-700">
                    <span
                      className={
                        isCheck(row.manual)
                          ? 'text-emerald-600'
                          : isCross(row.manual)
                          ? 'text-red-500'
                          : ''
                      }
                    >
                      {row.manual}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default WhyPracticesChoose;

