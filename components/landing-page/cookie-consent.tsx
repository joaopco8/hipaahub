'use client';

import { useState, useEffect } from 'react';
import { X, Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const cookieConsent = localStorage.getItem('cookie-consent');
    if (!cookieConsent) {
      // Show after a small delay to not interfere with initial page load
      setTimeout(() => {
        setIsVisible(true);
      }, 1000);
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
    <div className="fixed bottom-6 left-6 z-50 pointer-events-none max-w-md">
      <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 p-6 flex flex-col gap-4 pointer-events-auto font-extralight">
        {/* Cookie Icon & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1ad07a]/10 flex items-center justify-center shrink-0">
            <Cookie className="w-5 h-5 text-[#1ad07a]" />
          </div>
          <h3 className="text-base font-extralight text-[#0c0b1d]">
            We use cookies
          </h3>
        </div>

        {/* Text Content */}
        <p className="text-sm text-zinc-600 font-extralight leading-relaxed">
          We use cookies to enhance your browsing experience, analyze site traffic, and personalize content.{' '}
          <a 
            href="/privacy" 
            className="text-[#1ad07a] hover:underline font-extralight"
          >
            Learn more
          </a>
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleDecline}
            variant="outline"
            className="border border-zinc-300 text-zinc-700 hover:bg-zinc-100 font-extralight px-4 py-2 text-xs flex-1"
          >
            Decline
          </Button>
          <Button
            onClick={handleAccept}
            className="bg-[#1ad07a] text-[#0c0b1d] hover:bg-[#1ad07a]/90 font-extralight px-4 py-2 text-xs flex-1"
          >
            Accept All
          </Button>
        </div>
      </div>
    </div>
  );
}
