import LandingHeader from '@/components/landing-page/landing-header';
import FooterPrimary from '@/components/footer-primary';
import React from 'react';

interface BlogLayoutProps {
  children: React.ReactNode;
}

export default async function BlogLayout({
  children
}: BlogLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-[#0c0b1d]">
      <LandingHeader />
      <main className="flex-1 w-full bg-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-[#0c0b1d]">
            {children}
          </div>
        </div>
      </main>
      <FooterPrimary />
    </div>
  );
}
