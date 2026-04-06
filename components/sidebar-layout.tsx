'use client';

import Link from 'next/link';
import Image from 'next/image';
import { NavItem } from '@/config/dashboard';
import { Navbar } from '@/components/dashboard-navbar';
import Sidebar from '@/components/dashboard-sidebar';
import { TrialBanner } from '@/components/trial-banner';
import { Suspense, useState } from 'react';
import { Menu, X, UserCircle } from 'lucide-react';

interface SidebarLayoutProps {
  children: React.ReactNode;
  userDetails: any;
  organization?: {
    name?: string | null;
    legal_name?: string | null;
  } | null;
  navConfig: NavItem[];
  planTier?: string;
  isTrialing?: boolean;
  trialDaysRemaining?: number | null;
}

export default function SidebarLayout({
  children,
  userDetails,
  organization,
  navConfig,
  planTier = 'unknown',
  isTrialing = false,
  trialDaysRemaining = null,
}: SidebarLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <>
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-white/20 shrink-0">
        <Link href="/dashboard" className="flex items-center" onClick={() => setMobileOpen(false)}>
          <div className="relative h-8 w-auto">
            <Image
              src="/logoescura.png"
              alt="HIPAA Hub"
              width={150}
              height={32}
              className="object-contain brightness-0 invert"
              priority
            />
          </div>
        </Link>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto py-2">
        <Suspense fallback={<div className="px-4 py-4">Loading...</div>}>
          <Sidebar navConfig={navConfig} theme="blue" planTier={planTier} />
        </Suspense>
      </div>

      {/* Bottom Section: Profile/Account */}
      <div className="p-4 border-t border-white/20 bg-[#016a94]/30 shrink-0">
        <Link
          href="/dashboard/settings/profile"
          className="flex items-center gap-3 px-2 py-2 rounded-none hover:bg-white/10 transition-colors group"
          onClick={() => setMobileOpen(false)}
        >
          {userDetails?.avatar_url || userDetails?.user_metadata?.avatar_url ? (
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30 flex-shrink-0">
              <Image
                src={`${userDetails?.avatar_url || userDetails?.user_metadata?.avatar_url}?t=${Date.now()}`}
                alt="Profile"
                width={40}
                height={40}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
          ) : (
            <UserCircle className="h-10 w-10 text-white flex-shrink-0" strokeWidth={1.5} />
          )}
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-white truncate">{userDetails?.full_name || 'User Account'}</span>
            <span className="text-xs text-white/80 font-light">View Profile & Plan</span>
          </div>
        </Link>
        <p className="text-[10px] text-white/30 font-light text-center mt-2">v3.2.1</p>
      </div>
    </>
  );

  return (
    <div className="flex h-screen w-full bg-[#f3f5f9] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col bg-[#0175a2] text-white sm:flex h-full shrink-0 shadow-xl z-[60]">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex sm:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <aside className="relative flex w-72 max-w-[85vw] flex-col bg-[#0175a2] text-white h-full shadow-2xl z-50">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white z-10"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Right Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden h-full relative">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-8 shadow-sm shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="sm:hidden text-[#565656] hover:text-[#0e274e] p-1"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-extralight text-[#0e274e] hidden sm:block">
              Welcome
            </h1>
            <span className="text-sm text-gray-400 font-light hidden sm:block border-l border-gray-300 pl-4 ml-4">
              {organization?.name || organization?.legal_name || 'Organization'} Workspace
            </span>
            {/* Mobile: org name */}
            <span className="text-sm text-[#0e274e] font-light sm:hidden truncate max-w-[160px]">
              {organization?.name || organization?.legal_name || 'HIPAA Hub'}
            </span>
          </div>

          <div className="flex items-center">
            <Suspense fallback={<div className="h-10 w-20" />}>
              <Navbar userDetails={userDetails} navConfig={navConfig} variant="light" />
            </Suspense>
          </div>
        </header>

        {/* Trial Banner — shown during active trial */}
        {isTrialing && trialDaysRemaining !== null && (
          <TrialBanner daysRemaining={trialDaysRemaining} />
        )}

        {/* Main Content */}
        <main className="flex-1 w-full overflow-y-auto bg-[#f3f5f9] p-4 sm:p-8 scroll-smooth">
          <div className="max-w-[1800px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
