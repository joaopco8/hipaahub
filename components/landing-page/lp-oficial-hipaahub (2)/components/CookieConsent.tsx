import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] max-w-sm w-full transition-all duration-500 transform translate-y-0 opacity-100">
      <div className="bg-white border border-gray-200 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] p-8 relative">
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-cisco-navy transition-colors"
        >
          <X size={18} />
        </button>
        
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-2 h-2 bg-cisco-blue"></div>
          <span className="text-xs font-light text-cisco-navy tracking-widest">Privacy & Cookies</span>
        </div>

        <h4 className="text-xl font-light text-cisco-navy mb-3 tracking-tight">Your privacy is important</h4>
        
        <p className="text-gray-500 text-base leading-relaxed mb-8 font-light">
          We use cookies to enhance your experience, analyze site traffic, and serve targeted medical security insights. 
          By clicking "Accept", you agree to our privacy framework.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={handleAccept}
            className="flex-1 bg-cisco-blue text-white py-4 text-sm font-light hover:bg-cisco-navy transition-all rounded-none tracking-tight"
          >
            Accept
          </button>
          <button 
            onClick={handleDecline}
            className="flex-1 border border-gray-200 text-cisco-navy py-4 text-sm font-light hover:bg-gray-50 transition-all rounded-none tracking-tight"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;