
import React from 'react';
import Image from 'next/image';
import { Linkedin, Instagram, Youtube, Mail, MapPin } from 'lucide-react';

type LegalView = 'privacy-policy' | 'terms-of-service' | 'security' | 'hipaa-baa';

interface FooterProps {
  onNavigateLegal?: (view: LegalView) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigateLegal }) => {
  const legalLinks: { label: string; view: LegalView }[] = [
    { label: 'Privacy Policy', view: 'privacy-policy' },
    { label: 'Terms of Service', view: 'terms-of-service' },
    { label: 'Security', view: 'security' },
    { label: 'HIPAA BAA', view: 'hipaa-baa' },
  ];

  return (
    <footer className="bg-white pt-24 pb-12 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <div className="mb-16 border-b border-gray-200 border-[0.5px] pb-12">
          <h2 className="text-3xl font-thin text-cisco-navy mb-4">
            HIPAA Hub Compliance Platform
          </h2>
          <p className="text-gray-500 text-sm font-thin max-w-2xl leading-relaxed">
            HIPAA Hub is a compliance platform designed for healthcare organizations. 
            We provide centralized documentation, automated risk assessment, and continuous audit readiness.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div>
            <h4 className="text-[11px] font-thin text-cisco-blue mb-6">Quick Links</h4>
            <ul className="space-y-4">
              {["Solutions", "Platform", "Pricing", "Resources", "Contact"].map((item) => (
                <li key={item}><a href="#" className="text-sm text-gray-600 hover:text-cisco-blue transition-colors font-thin">{item}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-thin text-cisco-blue mb-6">Legal</h4>
            <ul className="space-y-4">
              {legalLinks.map(({ label, view }) => (
                <li key={view}>
                  <button
                    onClick={() => onNavigateLegal?.(view)}
                    className="text-sm text-gray-600 hover:text-cisco-blue transition-colors font-thin text-left"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-thin text-cisco-blue mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-center text-sm text-gray-600 font-thin">
                <Mail size={14} className="mr-3 text-cisco-blue" /> contact@hipaahubhealth.com
              </li>
              <li className="flex items-center text-sm text-gray-600 font-thin">
                <MapPin size={14} className="mr-3 text-cisco-blue" /> Austin, Texas, United States
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-thin text-cisco-blue mb-6">Trust</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-center">
                <Image
                  src="/yLWevTQjUl8ckOOua7U9HRkCY.png"
                  alt="SOC 2 Type 2"
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
              <div className="flex items-center justify-center">
                <Image
                  src="/XIpzXmr735QBrMd2zKW6qCBMBaQ.png"
                  alt="ISO 42001"
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
              <div className="flex items-center justify-center">
                <Image
                  src="/tBZpvW6AhYhkuyrCFWibAiSpA.png"
                  alt="GCP Certified"
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
              <div className="flex items-center justify-center">
                <Image
                  src="/rDLougW3lvlvBBNVWPnp7qm1AH8.png"
                  alt="21 CFR Part 11"
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-gray-400 font-thin">© 2026 HIPAA Hub LLC. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <a href="https://www.linkedin.com/company/hipaahub/" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-cisco-navy transition-colors"><Linkedin size={16} /></a>
            <a href="https://www.instagram.com/hipaahub/?hl=pt-br" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-cisco-navy transition-colors"><Instagram size={16} /></a>
            <a href="https://www.youtube.com/@hipaahub-health" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-cisco-navy transition-colors"><Youtube size={16} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
