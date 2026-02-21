'use client';

import { useState } from 'react';
import { HelpCircle, Mail, Copy, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { NavItem } from '@/config/dashboard';

interface NavbarProps {
  userDetails: any;
  navConfig: NavItem[];
  variant?: 'light' | 'dark';
}

export function Navbar({
  userDetails,
  navConfig,
  variant = 'light'
}: NavbarProps) {
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const contactEmail = 'contact@hipaahubhealth.com';

  const handleCopyEmail = async () => {
    await navigator.clipboard.writeText(contactEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="flex items-center gap-6 w-full justify-end">
        {/* Support Icon (Green Circle) */}
        <button
          onClick={() => setIsSupportOpen(true)}
          className="h-8 w-8 rounded-full bg-[#71bc48] flex items-center justify-center shadow-sm cursor-pointer hover:bg-[#71bc48]/90 transition-colors"
          aria-label="Contact Support"
        >
          <HelpCircle className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* Support Dialog */}
      <Dialog open={isSupportOpen} onOpenChange={setIsSupportOpen}>
        <DialogContent className="sm:max-w-md rounded-none border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-light text-[#0e274e]">
              Contact Support
            </DialogTitle>
            <DialogDescription className="text-[#565656] font-light">
              Get in touch with our support team
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="p-4 bg-[#f3f5f9] border border-gray-200 rounded-none">
              <p className="text-sm text-[#565656] font-light mb-2">Email address:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-base font-mono text-[#0e274e] bg-white px-3 py-2 rounded-none border border-gray-200 font-light">
                  {contactEmail}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyEmail}
                  className="shrink-0 border-gray-300 text-[#565656] hover:bg-gray-50 rounded-none font-light"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
            <a href={`mailto:${contactEmail}`}>
              <Button className="w-full bg-[#00bceb] text-white hover:bg-[#00bceb]/90 rounded-none font-bold">
                <Mail className="mr-2 h-4 w-4" />
                Open Email Client
              </Button>
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
