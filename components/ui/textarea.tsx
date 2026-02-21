import * as React from 'react';

import { cn } from '@/utils/cn';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-none border border-gray-300 bg-white px-3 py-2 text-sm text-[#0e274e] ring-offset-white placeholder:text-[#565656] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00bceb] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-light',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
