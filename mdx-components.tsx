import type { MDXComponents } from 'mdx/types';
import { cn } from '@/lib/utils';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ className, ...props }) => (
      <h1 className={cn("text-4xl font-medium text-[#0c0b1d] mb-6", className)} {...props} />
    ),
    h2: ({ className, ...props }) => (
      <h2 className={cn("text-3xl font-medium text-[#0c0b1d] mt-12 mb-4", className)} {...props} />
    ),
    h3: ({ className, ...props }) => (
      <h3 className={cn("text-2xl font-medium text-[#0c0b1d] mt-8 mb-3", className)} {...props} />
    ),
    p: ({ className, ...props }) => (
      <p className={cn("text-zinc-700 font-light leading-relaxed mb-4", className)} {...props} />
    ),
    ul: ({ className, ...props }) => (
      <ul className={cn("list-disc list-inside space-y-2 mb-4 text-zinc-700", className)} {...props} />
    ),
    ol: ({ className, ...props }) => (
      <ol className={cn("list-decimal list-inside space-y-2 mb-4 text-zinc-700", className)} {...props} />
    ),
    li: ({ className, ...props }) => (
      <li className={cn("ml-4", className)} {...props} />
    ),
    code: ({ className, ...props }) => (
      <code className={cn("bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded text-sm font-mono", className)} {...props} />
    ),
    pre: ({ className, ...props }) => (
      <pre className={cn("bg-[#0c0b1d] text-zinc-100 p-4 rounded-lg overflow-x-auto mb-4", className)} {...props} />
    ),
    a: ({ className, ...props }) => (
      <a className={cn("text-[#1ad07a] hover:underline", className)} {...props} />
    ),
    ...components
  };
}
