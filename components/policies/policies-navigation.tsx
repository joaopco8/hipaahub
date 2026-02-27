'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FileText, Building2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export function PoliciesNavigation() {
  const pathname = usePathname();
  const isPoliciesPage = pathname === '/dashboard/policies';
  const isVendorsPage = pathname?.startsWith('/dashboard/policies/vendors');

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="flex gap-0">
        <Link
          href="/dashboard/policies"
          className={cn(
            "flex items-center gap-2 px-6 py-3 border-b-2 transition-colors font-light text-sm",
            isPoliciesPage
              ? "border-[#00bceb] text-[#00bceb]"
              : "border-transparent text-gray-600 hover:text-[#00bceb] hover:border-gray-300"
          )}
        >
          <FileText className="h-4 w-4" />
          Policies
        </Link>
        <Link
          href="/dashboard/policies/vendors"
          className={cn(
            "flex items-center gap-2 px-6 py-3 border-b-2 transition-colors font-light text-sm",
            isVendorsPage
              ? "border-[#00bceb] text-[#00bceb]"
              : "border-transparent text-gray-600 hover:text-[#00bceb] hover:border-gray-300"
          )}
        >
          <Building2 className="h-4 w-4" />
          Vendor & BAA
        </Link>
      </nav>
    </div>
  );
}
