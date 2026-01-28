'use client';

import Link from 'next/link';
import { NavItem } from '@/config/dashboard';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { User, LogOut, ChevronRight, ChevronLeft, Mail } from 'lucide-react';
import { Navbar } from '@/components/dashboard-navbar';
import Sidebar from '@/components/dashboard-sidebar';
import { Suspense } from 'react';
import { useSidebar } from '@/contexts/sidebar-context';
import { cn } from '@/utils/cn';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
interface SidebarLayoutProps {
  children: React.ReactNode;
  userDetails: any;
  navConfig: NavItem[];
}

export default function SidebarLayout({
  children,
  userDetails,
  navConfig
}: SidebarLayoutProps) {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/signin');
    router.refresh();
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#f3f5f9]">
      <aside className={cn(
        "fixed inset-y-0 left-0 z-10 hidden flex-col border-r border-white/5 bg-[#0c0b1d] transition-all duration-150 ease-in-out sm:flex",
        isCollapsed ? "w-24" : "w-64"
      )}>
        {/* Expand/Collapse Button - Linguinha fixa na borda direita da sidebar */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggleSidebar}
                className={cn(
                  "absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-20",
                  "h-14 w-7 rounded-r-xl",
                  "bg-[#0c0b1d] border border-l-0 border-white/10",
                  "flex items-center justify-center",
                  "text-white/50 hover:text-white",
                  "hover:bg-[#1ad07a]/15 hover:border-[#1ad07a]/40",
                  "transition-all duration-300 ease-out",
                  "group shadow-lg hover:shadow-2xl hover:shadow-[#1ad07a]/20",
                  "hover:translate-x-3/4",
                  "active:scale-95",
                  "cursor-pointer",
                  "backdrop-blur-sm"
                )}
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4 transition-all duration-300 group-hover:scale-125 group-hover:translate-x-1" />
                ) : (
                  <ChevronLeft className="h-4 w-4 transition-all duration-300 group-hover:scale-125 group-hover:-translate-x-1" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-[#0c0b1d] text-white border-white/10">
              {isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Suspense fallback={<div className="flex flex-col items-center gap-4 px-2 sm:py-5" />}>
          <Sidebar navConfig={navConfig} />
        </Suspense>
        <nav className={cn(
          "mt-auto flex flex-col gap-2 px-3 pb-6 transition-all duration-300",
          isCollapsed ? "items-center" : "items-stretch"
        )}>
          {/* Contact Option */}
          <TooltipProvider>
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/dashboard/contact"
                    className={cn(
                      "flex items-center justify-center rounded-lg text-white/60 transition-all duration-200 hover:text-white hover:bg-white/10",
                      "h-12 w-12"
                    )}
                    aria-label="Contact"
                  >
                    <Mail className="h-6 w-6 shrink-0" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-[#0c0b1d] text-white border-white/10">
                  Contact
                </TooltipContent>
              </Tooltip>
            ) : (
              <Link
                href="/dashboard/contact"
                className={cn(
                  "flex items-center justify-start rounded-lg text-white/60 transition-all duration-200 hover:text-white hover:bg-white/10",
                  "h-9 w-full gap-3 px-3"
                )}
                aria-label="Contact"
              >
                <Mail className="h-5 w-5 shrink-0" />
                <span className="text-sm font-medium">Contact</span>
              </Link>
            )}
          </TooltipProvider>

          {/* Profile Option */}
          <TooltipProvider>
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={cn(
                          "flex items-center justify-center rounded-lg text-white/60 transition-all duration-200 hover:text-white hover:bg-white/10",
                          "h-12 w-12"
                        )}
                        aria-label="Profile"
                      >
                        <User className="h-6 w-6 shrink-0" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="end" className="w-48 bg-white border-zinc-200">
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/account" className="flex items-center gap-2 cursor-pointer">
                          <User className="h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={handleSignOut}
                        className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-[#0c0b1d] text-white border-white/10">
                  Profile
                </TooltipContent>
              </Tooltip>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "flex items-center justify-start rounded-lg text-white/60 transition-all duration-200 hover:text-white hover:bg-white/10",
                      "h-9 w-full gap-3 px-3"
                    )}
                    aria-label="Profile"
                  >
                    <User className="h-5 w-5 shrink-0" />
                    <span className="text-sm font-medium">Profile</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start" className="w-48 bg-white border-zinc-200">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/account" className="flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </TooltipProvider>
        </nav>
      </aside>
      <div className={cn(
        "flex flex-col sm:gap-4 sm:py-4 transition-all duration-150 ease-in-out",
        isCollapsed ? "sm:pl-24" : "sm:pl-64"
      )}>
        <Suspense fallback={<header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-white px-4" />}>
          <Navbar userDetails={userDetails} navConfig={navConfig} />
        </Suspense>
        <main className="flex-1 w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-8">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

