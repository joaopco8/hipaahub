'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronDown, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

const DropdownMenu: React.FC<{ 
  label: string; 
  items: { label: string; href?: string; id?: string }[];
  onItemClick: (id?: string) => void;
}> = ({ label, items, onItemClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="relative group h-full flex items-center"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="flex items-center space-x-1 text-gray-600 hover:text-cisco-blue transition-colors py-4">
        <span>{label}</span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      <div className={`
        absolute top-full left-0 w-64 bg-white border border-gray-100 shadow-xl py-4 z-[120] transition-all duration-200
        ${isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'}
      `}>
        {items.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onItemClick(item.id)}
            className="w-full text-left px-6 py-2.5 text-sm text-gray-500 hover:bg-gray-50 hover:text-cisco-blue transition-colors font-thin"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

const Navbar: React.FC<{ 
  onNavigate: (view: string) => void;
}> = ({ onNavigate }) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  const handleNavigation = (id?: string) => {
    setIsMenuOpen(false);
    if (!id) return;

    if (id === 'pricing-section') {
      // First ensure we are on home view
      onNavigate('home');
      // Small delay to allow react to render the home view before scrolling
      setTimeout(() => {
        const element = document.getElementById('pricing');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return;
    }

    onNavigate(id);
  };

  const menuStructure = [
    {
      label: 'Platform',
      id: 'platform',
      items: [
        { label: 'Risk Assessment Engine', id: 'risk-assessment' },
        { label: 'Policy Generator', id: 'policy-generator' },
        { label: 'Gap Analysis Dashboard', id: 'gap-analysis' },
        { label: 'Breach Notification Builder', id: 'breach-builder' },
        { label: 'Compliance Roadmap', id: 'roadmap' },
        { label: 'Reporting & Documentation', id: 'reporting' }
      ]
    },
    {
      label: 'Solutions',
      id: 'solutions',
      items: [
        { label: 'Independent Practices', id: 'independent-practices' },
        { label: 'Implementation Services', id: 'implementation-services' },
        { label: 'Compliance Assessment', id: 'compliance-assessment' }
      ]
    },
    {
      label: 'Research',
      id: 'research',
      items: [
        { label: 'Intelligence Reports', id: 'intelligence-reports' },
        { label: 'Regulatory Analysis', id: 'regulatory-analysis' },
        { label: 'Library Overview', id: 'research' }
      ]
    },
    {
      label: 'Company',
      id: 'company',
      items: [
        { label: 'Profile', id: 'company' },
        { label: 'Methodology', id: 'methodology' }
      ]
    }
  ];

  return (
    <nav className="w-full sticky top-0 z-[100] bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-12 h-[72px] flex items-center justify-between">
        <div className="flex items-center shrink-0">
          <button onClick={() => onNavigate('home')} className="flex items-center hover:opacity-80 transition-opacity">
            <Image 
              src="/logoescura.png" 
              alt="HIPAA Hub" 
              width={120}
              height={32}
              className="object-contain"
              priority
            />
          </button>
        </div>

        <div className="hidden xl:flex items-center space-x-8 h-full">
          {menuStructure.map((menu) => (
            <DropdownMenu 
              key={menu.label} 
              label={menu.label} 
              items={menu.items} 
              onItemClick={(id) => handleNavigation(id || menu.id)}
            />
          ))}
          
          {/* Direct link for Pricing */}
          <button 
            onClick={() => handleNavigation('pricing-section')}
            className="text-gray-600 hover:text-cisco-blue transition-colors py-4 h-full flex items-center"
          >
            Pricing
          </button>
        </div>

        <div className="flex items-center space-x-4 md:space-x-6 shrink-0">
          <Link 
            href="/signin"
            className="hidden sm:flex items-center space-x-2 text-gray-600 hover:text-cisco-blue transition-colors text-sm font-thin"
          >
            <User size={16} />
            <span>Login</span>
          </Link>

          <button 
            onClick={() => onNavigate('compliance-assessment')}
            className="bg-cisco-blue text-white px-4 md:px-6 py-3 text-xs md:text-sm font-thin hover:bg-cisco-navy transition-all shadow-md shadow-cisco-blue/10"
          >
            Request Demo
          </button>
          
          <button 
            className="xl:hidden text-gray-600 p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <div className={`
        xl:hidden fixed inset-0 top-[72px] bg-white z-[90] transition-all duration-300
        ${isMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}
      `}>
        <div className="h-full overflow-y-auto p-8 space-y-10">
          <div className="sm:hidden border-b border-gray-100 pb-6">
            <Link 
              href="/signin"
              className="flex items-center space-x-2 text-cisco-navy hover:text-cisco-blue transition-colors text-lg font-thin"
            >
              <User size={20} />
              <span>Account Login</span>
            </Link>
          </div>

          {menuStructure.map((menu) => (
            <div key={menu.label} className="space-y-4">
              <h4 className="text-xl font-thin text-cisco-navy border-b border-gray-50 pb-2">{menu.label}</h4>
              <div className="grid grid-cols-1 gap-3 pl-4">
                {menu.items.map((item, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleNavigation(item.id || menu.id)}
                    className="text-left text-sm text-gray-500 hover:text-cisco-blue"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
          
          <div className="space-y-4">
            <button 
              onClick={() => handleNavigation('pricing-section')}
              className="text-xl font-thin text-cisco-navy border-b border-gray-50 pb-2 w-full text-left"
            >
              Pricing
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
