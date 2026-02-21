import * as React from 'react';

import { cn } from '@/utils/cn';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-none border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-light placeholder:text-[#565656] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00bceb] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-light',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
