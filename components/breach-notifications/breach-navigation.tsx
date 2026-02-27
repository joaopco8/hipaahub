'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Mail, AlertCircle, History } from 'lucide-react';
import { cn } from '@/utils/cn';

export function BreachNavigation() {
  const pathname = usePathname();
  const isLettersPage = pathname === '/dashboard/breach-notifications';
  const isIncidentsPage = pathname?.startsWith('/dashboard/breach-notifications/incidents');
  const isHistoryPage = pathname?.startsWith('/dashboard/breach-notifications/history');

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="flex gap-0">
        <Link
          href="/dashboard/breach-notifications"
          className={cn(
            "flex items-center gap-2 px-6 py-3 border-b-2 transition-colors font-light text-sm",
            isLettersPage
              ? "border-[#00bceb] text-[#00bceb]"
              : "border-transparent text-gray-600 hover:text-[#00bceb] hover:border-gray-300"
          )}
        >
          <Mail className="h-4 w-4" />
          Notification Letters
        </Link>
        <Link
          href="/dashboard/breach-notifications/incidents"
          className={cn(
            "flex items-center gap-2 px-6 py-3 border-b-2 transition-colors font-light text-sm",
            isIncidentsPage
              ? "border-[#00bceb] text-[#00bceb]"
              : "border-transparent text-gray-600 hover:text-[#00bceb] hover:border-gray-300"
          )}
        >
          <AlertCircle className="h-4 w-4" />
          Incident Log
        </Link>
        <Link
          href="/dashboard/breach-notifications/history"
          className={cn(
            "flex items-center gap-2 px-6 py-3 border-b-2 transition-colors font-light text-sm",
            isHistoryPage
              ? "border-[#00bceb] text-[#00bceb]"
              : "border-transparent text-gray-600 hover:text-[#00bceb] hover:border-gray-300"
          )}
        >
          <History className="h-4 w-4" />
          History
        </Link>
      </nav>
    </div>
  );
}
