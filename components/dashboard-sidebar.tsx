'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Lock } from 'lucide-react';
import { NavItem, iconComponents } from '@/config/dashboard';
import { cn } from '@/utils/cn';

interface SidebarProps {
  navConfig: NavItem[];
  theme?: 'light' | 'dark' | 'blue';
  /** Current user plan tier, used to show 🔒 on items requiring a higher plan. */
  planTier?: string;
}

const PLAN_HIERARCHY: Record<string, number> = {
  unknown: 0,
  solo: 1,
  practice: 2,
  clinic: 3,
  enterprise: 4,
};

function isNavLocked(item: NavItem, planTier: string): boolean {
  if (!item.requiresPlan) return false;
  return (PLAN_HIERARCHY[planTier] ?? 0) < (PLAN_HIERARCHY[item.requiresPlan] ?? 0);
}

const Sidebar = ({ navConfig, theme = 'blue', planTier = 'unknown' }: SidebarProps) => {
  const pathname = usePathname();

  const visibleNavItems = navConfig.filter((item) => {
    const IconComponent = iconComponents[item.icon as keyof typeof iconComponents];
    return !!IconComponent;
  });

  return (
    <nav className="relative flex flex-col gap-1 px-0">
      {visibleNavItems.map((item, index) => {
        const IconComponent = iconComponents[item.icon as keyof typeof iconComponents]!;
        const isActive = pathname === item.href;
        const isDisabled = item.disabled;
        const locked = isNavLocked(item, planTier);

        let baseClasses = '';
        let iconClasses = '';

        if (theme === 'blue') {
          baseClasses = cn(
            'flex items-center w-full justify-start gap-4 px-6 py-4 transition-all duration-200 border-l-[6px]',
            isDisabled
              ? 'text-white/30 border-transparent cursor-not-allowed'
              : isActive
                ? 'bg-[#015a7a] border-white text-white !font-semibold'
                : 'border-transparent text-white/90 hover:text-white hover:bg-white/10 !font-semibold'
          );
          iconClasses = 'text-current';
        } else {
          baseClasses = cn(
            'flex items-center w-full justify-start gap-3 px-3 py-2 rounded-md transition-all duration-200',
            isDisabled
              ? 'text-gray-300 cursor-not-allowed'
              : isActive
                ? 'bg-gray-100 text-[#0e274e] font-medium'
                : 'text-gray-500 hover:text-[#0e274e] hover:bg-gray-50'
          );
          iconClasses = isActive ? 'text-[#00bceb]' : 'text-gray-400 group-hover:text-[#0e274e]';
        }

        if (isDisabled) {
          return (
            <div key={`${item.href}-${index}`} className={baseClasses}>
              <IconComponent className={cn('h-5 w-5 shrink-0', iconClasses)} strokeWidth={1.5} />
              <span className="text-sm tracking-wide !font-semibold">{item.label}</span>
            </div>
          );
        }

        return (
          <div key={`${item.href}-${index}`} className="w-full relative group">
            <Link
              href={item.href}
              className={baseClasses}
              prefetch={item.href !== '/docs'}
              aria-label={item.label}
              {...(item.href === '/docs' ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              <IconComponent
                className={cn('shrink-0 h-5 w-5 transition-colors', iconClasses)}
                strokeWidth={isActive ? 2 : 1.5}
              />
              <span className="text-sm tracking-wide truncate !font-semibold flex-1">
                {item.label}
              </span>

              {/* Lock icon for sections requiring a higher plan */}
              {locked && (
                <Lock
                  className="h-3.5 w-3.5 text-white/40 shrink-0"
                  strokeWidth={1.5}
                  aria-label={`Requires ${item.requiresPlan} plan`}
                />
              )}

              {isActive && !locked && (
                <span className="ml-auto text-xs font-bold opacity-80" />
              )}
            </Link>
          </div>
        );
      })}
    </nav>
  );
};

export default Sidebar;
