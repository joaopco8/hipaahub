'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { NavItem, iconComponents } from '@/config/dashboard';
import { useSidebar } from '@/contexts/sidebar-context';
import { cn } from '@/utils/cn';

const Sidebar = ({ navConfig }: { navConfig: NavItem[] }) => {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebar();

  // Use pathname directly - Next.js handles hydration
  const currentPathname = pathname;

  const visibleNavItems = navConfig.filter((item) => {
    const IconComponent = iconComponents[item.icon as keyof typeof iconComponents];
    if (!IconComponent) {
      console.warn(`Icon "${item.icon}" not found in iconComponents`);
      return false;
    }
    return true;
  });

  return (
    <nav className={cn(
      "relative flex flex-col gap-4 px-4 py-6 transition-all duration-150 ease-in-out",
      isCollapsed ? "w-24" : "w-64"
    )}>
      <div className={cn(
        "flex items-center w-full mb-4 transition-all duration-150",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {!isCollapsed && (
          <Link
            href="/"
            className="group flex items-center justify-center rounded-lg px-3 py-2 text-white transition-all hover:opacity-90"
            prefetch={true}
          >
            <Image
              src="/images/logohipa.png"
              alt="HIPAA Hub"
              width={156}
              height={52}
              className="transition-all group-hover:scale-105 object-contain"
            />
          </Link>
        )}
        {isCollapsed && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/"
                  className="group flex h-14 w-14 shrink-0 items-center justify-center rounded-lg transition-all hover:opacity-90 mb-2"
                  prefetch={true}
                  aria-label="HIPAA Hub"
                >
                  <Image
                    src="/logoicon.png"
                    alt="HIPAA Hub"
                    width={48}
                    height={48}
                    className="transition-all group-hover:scale-110 object-contain"
                  />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-[#0c0b1d] text-white border-white/10">
                HIPAA Hub
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <TooltipProvider>
        <div className={cn("w-full", isCollapsed ? "space-y-2" : "space-y-1")}>
          {visibleNavItems.map((item, index) => {
            const IconComponent =
              iconComponents[item.icon as keyof typeof iconComponents]!;
            const isActive = currentPathname === item.href;
            const isDisabled = item.disabled;
            const previousGroup = index > 0 ? visibleNavItems[index - 1]?.group : undefined;
            const shouldRenderDivider = index > 0 && item.group && previousGroup && item.group !== previousGroup;
            
            const baseClasses = cn(
              "flex items-center rounded-lg transition-all duration-100",
              isCollapsed 
                ? "h-12 w-12 justify-center" 
                : "h-9 w-full justify-start gap-3 px-3",
              isDisabled
                ? "text-white/30 bg-white/0 cursor-not-allowed"
                : isActive
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
            );
            
            if (isDisabled) {
              return (
                <Tooltip key={`${item.href}-${index}`}>
                  <TooltipTrigger className={baseClasses} disabled>
                    <IconComponent className={cn(
                      "shrink-0",
                      isCollapsed ? "h-6 w-6" : "h-5 w-5",
                      "opacity-30"
                    )} />
                    {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-[#0c0b1d] text-white border-white/10">
                    {item.label} (Disabled)
                  </TooltipContent>
                </Tooltip>
              );
            }

            return (
              <div key={`${item.href}-${index}`} className="w-full">
                {shouldRenderDivider && (
                  <div
                    aria-hidden="true"
                    className={cn(
                      "my-2 h-px bg-white/10",
                      isCollapsed ? "mx-auto w-12" : "w-full"
                    )}
                  />
                )}
                <div className={cn(isCollapsed ? "flex justify-center" : "")}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={baseClasses}
                        prefetch={item.href !== '/docs'}
                        aria-label={item.label}
                        {...(item.href === '/docs' ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      >
                        <IconComponent className={cn(
                          "shrink-0 transition-colors",
                          isCollapsed ? "h-6 w-6" : "h-5 w-5"
                        )} />
                        {!isCollapsed && (
                          <span className="text-sm font-medium truncate">{item.label}</span>
                        )}
                      </Link>
                    </TooltipTrigger>
                    {isCollapsed && (
                      <TooltipContent side="right" className="bg-[#0c0b1d] text-white border-white/10">
                        {item.label}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </div>
              </div>
            );
          })}
        </div>
      </TooltipProvider>
    </nav>
  );
};

export default Sidebar;
