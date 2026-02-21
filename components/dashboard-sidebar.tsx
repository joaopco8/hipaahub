'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavItem, iconComponents } from '@/config/dashboard';
import { cn } from '@/utils/cn';

interface SidebarProps {
  navConfig: NavItem[];
  theme?: 'light' | 'dark' | 'blue';
}

const Sidebar = ({ navConfig, theme = 'blue' }: SidebarProps) => {
  const pathname = usePathname();
  const currentPathname = pathname;

  // Filter visible items
  const visibleNavItems = navConfig.filter((item) => {
    const IconComponent = iconComponents[item.icon as keyof typeof iconComponents];
    return !!IconComponent;
  });

  return (
    <nav className="relative flex flex-col gap-1 px-0">
      {visibleNavItems.map((item, index) => {
        const IconComponent = iconComponents[item.icon as keyof typeof iconComponents]!;
        const isActive = currentPathname === item.href;
        const isDisabled = item.disabled;
        
        // Theme Styles
        let baseClasses = "";
        let iconClasses = "";
        
        if (theme === 'blue') {
           // Cisco MSX Blue Style - Updated
           baseClasses = cn(
             "flex items-center w-full justify-start gap-4 px-6 py-4 transition-all duration-200 border-l-[6px]", // Increased padding/gap, thicker border
             isDisabled
               ? "text-white/30 border-transparent cursor-not-allowed"
               : isActive
                 ? "bg-[#015a7a] border-white text-white !font-semibold" // Darker blue background for active (darker than #0175a2), !font-semibold to override global thin
                 : "border-transparent text-white/90 hover:text-white hover:bg-white/10 !font-semibold" // !font-semibold weight for inactive (same as User Account)
           );
           iconClasses = "text-current"; 
        } else {
           // Fallback
           baseClasses = cn(
             "flex items-center w-full justify-start gap-3 px-3 py-2 rounded-md transition-all duration-200",
             isDisabled
               ? "text-gray-300 cursor-not-allowed"
               : isActive
                 ? "bg-gray-100 text-[#0e274e] font-medium"
                 : "text-gray-500 hover:text-[#0e274e] hover:bg-gray-50"
           );
           iconClasses = isActive ? "text-[#00bceb]" : "text-gray-400 group-hover:text-[#0e274e]";
        }

        if (isDisabled) {
          return (
            <div key={`${item.href}-${index}`} className={baseClasses}>
               <IconComponent className={cn("h-5 w-5 shrink-0", iconClasses)} strokeWidth={1.5} />
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
                className={cn(
                  "shrink-0 h-5 w-5 transition-colors",
                  iconClasses
                )} 
                strokeWidth={isActive ? 2 : 1.5}
              />
              <span className="text-sm tracking-wide truncate !font-semibold">{item.label}</span>
              
              {/* Optional: Right Indicator number like in print (1, 2, 9) - static for now or could come from config */}
              {isActive && (
                 <span className="ml-auto text-xs font-bold opacity-80"></span> 
              )}
            </Link>
          </div>
        );
      })}
    </nav>
  );
};

export default Sidebar;
