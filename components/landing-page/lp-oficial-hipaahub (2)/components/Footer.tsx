
import React from 'react';
import { Linkedin, Twitter, Globe, Mail, Phone, MapPin, Check } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white pt-24 pb-12 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <div className="mb-16 border-b border-gray-50 pb-12">
          <h2 className="text-3xl font-light text-cisco-navy tracking-tight mb-4">
            HIPAA HUB COMPLIANCE PLATFORM
          </h2>
          <p className="text-gray-500 text-sm font-light max-w-2xl leading-relaxed">
            HIPAA Hub is a compliance platform designed for healthcare organizations. 
            We provide centralized documentation, automated risk assessment, and continuous audit readiness.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div>
            <h4 className="text-[11px] font-bold text-cisco-blue mb-6">Quick Links</h4>
            <ul className="space-y-4">
              {["Solutions", "Platform", "Pricing", "Resources", "Contact"].map((item) => (
                <li key={item}><a href="#" className="text-sm text-gray-600 hover:text-cisco-blue transition-colors font-normal">{item}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-bold text-cisco-blue mb-6">Legal</h4>
            <ul className="space-y-4">
              {["Privacy Policy", "Terms of Service", "Security", "HIPAA BAA"].map((item) => (
                <li key={item}><a href="#" className="text-sm text-gray-600 hover:text-cisco-blue transition-colors font-normal">{item}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-bold text-cisco-blue mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-center text-sm text-gray-600 font-normal">
                <Mail size={14} className="mr-3 text-cisco-blue" /> support@hipaahub.com
              </li>
              <li className="flex items-center text-sm text-gray-600 font-normal">
                <Phone size={14} className="mr-3 text-cisco-blue" /> +1-800-HIPAA-HUB
              </li>
              <li className="flex items-center text-sm text-gray-600 font-normal">
                <MapPin size={14} className="mr-3 text-cisco-blue" /> San Jose, CA 95113
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-bold text-cisco-blue mb-6">Trust</h4>
            <ul className="space-y-3">
              {["HIPAA Compliant", "SOC 2 Type II", "NIST Aligned", "HITRUST CSF"].map((item) => (
                <li key={item} className="flex items-center text-[12px] text-gray-500 font-normal">
                  <Check size={14} className="text-cisco-green mr-3 flex-shrink-0" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-gray-400 font-normal">© 2026 HIPAA Hub Systems. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <a href="#" className="text-xs text-gray-500 hover:text-cisco-navy transition-colors"><Linkedin size={16} /></a>
            <a href="#" className="text-xs text-gray-500 hover:text-cisco-navy transition-colors"><Twitter size={16} /></a>
            <a href="#" className="text-xs text-gray-500 hover:text-cisco-navy transition-colors"><Globe size={16} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
