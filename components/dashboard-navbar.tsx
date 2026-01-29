'use client';

import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage
} from '@/components/ui/breadcrumb';
import { Input } from '@/components/ui/input';

import { UserAccountNav } from '@/components/user-account-nav';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Settings, Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { NavItem, iconComponents } from '@/config/dashboard';

export function Navbar({
  userDetails,
  navConfig
}: {
  userDetails: any;
  navConfig: NavItem[];
}) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use pathname only after component is mounted to avoid hydration issues
  const currentPathname = mounted ? pathname : '/dashboard';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-zinc-200/60 bg-white/80 backdrop-blur-md px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-8">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden" aria-label="Toggle Menu">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="sm:max-w-xs p-0 bg-[#0c0b1d] text-white border-white/10"
        >
          {/* Mobile Sidebar Header (Logo) */}
          <div className="px-5 py-5 border-b border-white/10">
            <Link href="/dashboard" className="flex items-center gap-3" prefetch={false}>
              <Image
                src="/images/logohipa.png"
                alt="HIPAA Hub"
                width={150}
                height={50}
                className="object-contain"
                priority
              />
            </Link>
          </div>

          <nav className="grid gap-2 px-3 py-4 text-base font-medium">
            {navConfig.map(
              (
                item: {
                  icon: keyof typeof iconComponents;
                  href: string;
                  label: string;
                },
                index: number
              ) => {
                const IconComponent = iconComponents[item.icon];
                return (
                  <Link
                    key={index}
                    href={item.href}
                    className={[
                      'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors',
                      currentPathname === item.href ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white hover:bg-white/5',
                    ].join(' ')}
                    prefetch={false}
                  >
                    <IconComponent className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              }
            )}
            <Link
              href="/dashboard/account"
              className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2 text-white/70 hover:text-white hover:bg-white/5 transition-colors"
              prefetch={false}
            >
              <Settings className="h-5 w-5" />
              Settings
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard" prefetch={false} className="text-zinc-600 hover:text-zinc-900">
                <span>Dashboard</span>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {currentPathname
            .split('/')
            .filter(Boolean)
            .slice(1)
            .map((segment, index) => (
              <BreadcrumbItem key={index}>
                <BreadcrumbSeparator className="text-zinc-400" />
                <BreadcrumbLink asChild>
                  <Link
                    href={`/${currentPathname
                      .split('/')
                      .slice(0, index + 2)
                      .join('/')}`}
                    prefetch={false}
                    className="text-zinc-600 hover:text-zinc-900"
                  >
                    <span>{segment.charAt(0).toUpperCase() + segment.slice(1)}</span>
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            ))}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}
