'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { FadeIn } from './animated-section';

const companyLogos = [
  {
    name: 'Valley Health System',
    logo: '/images/logos/Valley-Health-System-logo-300x137.webp',
    width: 300,
    height: 137
  },
  {
    name: 'AMBA',
    logo: '/images/logos/AMBA-logo-300x75.webp',
    width: 300,
    height: 75
  },
  {
    name: '4medica',
    logo: '/images/logos/4medica-Logo-300x82.webp',
    width: 300,
    height: 82
  },
  {
    name: 'NextGen',
    logo: '/images/logos/Nextgen-300x123.webp',
    width: 300,
    height: 123
  },
  {
    name: 'OHIP',
    logo: '/images/logos/OHIP-only-Coral-300x200.webp',
    width: 300,
    height: 200
  },
  {
    name: 'MeUCare',
    logo: '/images/logos/MeUCare.webp',
    width: 300,
    height: 100
  }
];

export default function TrustedBySection() {
  return (
    <section className="w-full relative bg-gradient-to-b from-white via-[#f3f5f9] to-white py-16 md:py-20 lg:py-24 font-extralight overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#1ad07a]/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          <FadeIn>
            <div className="space-y-12">
              
              {/* Header */}
              <motion.div 
                className="text-center space-y-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <p className="text-sm md:text-base text-zinc-500 font-extralight uppercase tracking-wider">
                  Trusted by Healthcare Organizations
                </p>
                <h2 className="text-2xl md:text-3xl lg:text-4xl text-[#0c0b1d] font-extralight leading-tight">
                  Used by leading healthcare systems<br />
                  <span className="text-zinc-600 font-extralight">across the United States</span>
                </h2>
              </motion.div>

              {/* Logos Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 md:gap-12 items-center">
                {companyLogos.map((company, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center justify-center p-4 md:p-6 bg-white rounded-xl border border-zinc-200 shadow-sm hover:shadow-md transition-all duration-300 group"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ y: -4, scale: 1.05 }}
                  >
                    <div className="relative w-full h-16 md:h-20 flex items-center justify-center grayscale group-hover:grayscale-0 transition-all duration-300 opacity-60 group-hover:opacity-100">
                      <Image
                        src={company.logo}
                        alt={company.name}
                        width={company.width}
                        height={company.height}
                        className="object-contain max-w-full max-h-full"
                        quality={90}
                        unoptimized={false}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Trust Message */}
              <motion.div 
                className="text-center pt-8"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <p className="text-sm md:text-base text-zinc-500 font-extralight">
                  Join hundreds of healthcare organizations that trust HIPAA Hub<br />
                  <span className="text-[#0c0b1d] font-normal">to keep their compliance documentation organized and audit-ready.</span>
                </p>
              </motion.div>

            </div>
          </FadeIn>
      </div>
    </section>
  );
}
