import { BlogNavbar } from '@/components/blog/blog-navbar';
import Footer from '@/components/landing-page/hipaahub/Footer';
import React from 'react';

interface BlogLayoutProps {
  children: React.ReactNode;
}

export default async function BlogLayout({ children }: BlogLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-[#0e274e]">
      <BlogNavbar />
      <main className="flex-1 w-full bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-12 py-12">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
