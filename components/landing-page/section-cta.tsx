'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SectionCTAProps {
  label?: string;
  href?: string;
  className?: string;
}

export function SectionCTA({
  label = 'Get Audit-Ready Now',
  href = '/signup',
  className,
}: SectionCTAProps) {
  return (
    <div className={cn('flex justify-center mt-10 md:mt-12', className)}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
      >
        <Link href={href}>
          <Button
            className={cn(
              'group relative inline-flex items-center gap-3 px-7 py-4 bg-[#1ad07a] text-[#0c0b1d] font-medium text-base rounded-lg hover:bg-[#1ad07a]/90 transition-all duration-300 shadow-lg hover:shadow-xl',
            )}
          >
            <span>{label}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}

