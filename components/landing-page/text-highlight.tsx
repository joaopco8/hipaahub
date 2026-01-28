'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface TextHighlightProps {
  children: ReactNode;
  variant?: 'semibold' | 'bold' | 'italic' | 'semibold-italic' | 'bold-italic';
  className?: string;
  delay?: number;
  showUnderline?: boolean;
  showCircle?: boolean;
  showArrow?: boolean;
  color?: 'default' | 'green' | 'red' | 'amber';
}

const colorMap = {
  default: '#0c0b1d',
  green: '#1ad07a',
  red: '#dc2626',
  amber: '#f59e0b',
};

export function TextHighlight({
  children,
  variant = 'semibold',
  className,
  delay = 0,
  showUnderline = false,
  showCircle = false,
  showArrow = false,
  color = 'default',
}: TextHighlightProps) {
  const variantClasses = {
    semibold: 'font-crimson-text font-semibold',
    bold: 'font-crimson-text font-bold',
    italic: 'font-crimson-text italic',
    'semibold-italic': 'font-crimson-text font-semibold italic',
    'bold-italic': 'font-crimson-text font-bold italic',
  };

  const textColorClass = {
    default: 'text-[#0c0b1d]',
    green: 'text-[#1ad07a]',
    red: 'text-[#dc2626]',
    amber: 'text-[#f59e0b]',
  }[color];

  return (
    <span className={cn("relative inline-block", variantClasses[variant], textColorClass, className)}>
      {children}
      
      {/* Sketchy Underline */}
      {showUnderline && (
        <motion.svg
          className="absolute -bottom-2 left-0 w-full"
          height="8"
          viewBox="0 0 200 8"
          fill="none"
          stroke={colorMap[color]}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay }}
        >
          <motion.path
            d="M5 4 Q50 2 100 4 T195 4"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: delay + 0.2, ease: 'easeOut' }}
            style={{ strokeDasharray: '8 4' }}
          />
        </motion.svg>
      )}

      {/* Sketchy Circle */}
      {showCircle && (
        <motion.svg
          className="absolute -left-1 -top-1 w-6 h-6 md:w-7 md:h-7 pointer-events-none"
          viewBox="0 0 28 28"
          fill="none"
          stroke={colorMap[color]}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay, duration: 0.5, type: 'spring' }}
        >
          <motion.circle
            cx="14"
            cy="14"
            r="12"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: delay + 0.2 }}
            style={{ strokeDasharray: '6 3' }}
          />
        </motion.svg>
      )}

      {/* Sketchy Arrow */}
      {showArrow && (
        <motion.svg
          className="absolute -right-6 md:-right-8 top-1/2 -translate-y-1/2 hidden sm:block"
          width="35"
          height="35"
          viewBox="0 0 35 35"
          fill="none"
          stroke={colorMap[color]}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ opacity: 0, x: -5 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay }}
        >
          <motion.path
            d="M8 17.5 L25 17.5 M20 12.5 L25 17.5 L20 22.5"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: delay + 0.2 }}
            style={{ strokeDasharray: '4 2' }}
          />
        </motion.svg>
      )}
    </span>
  );
}
