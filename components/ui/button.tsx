import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Spinner } from '@radix-ui/themes';

import { cn } from '@/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white btn-premium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1ad07a] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-[#1ad07a] text-[#0d1122] hover:bg-[#1ad07a]/90 font-medium',
        destructive:
          'bg-red-500 text-white hover:bg-red-500/90',
        outline:
          'border border-zinc-300 bg-white hover:bg-zinc-50 hover:border-zinc-400 text-zinc-900',
        secondary:
          'bg-zinc-100 text-zinc-900 hover:bg-zinc-200',
        ghost:
          'hover:bg-zinc-100 hover:text-zinc-900 text-zinc-700',
        link: 'text-zinc-900 underline-offset-4 hover:underline'
      },
      size: {
        default: 'h-10 px-4 py-2',
        xxs: 'h-7 rounded-sm px-1',
        xs: 'h-8 rounded-md px-2',
        sm: 'h-9 rounded-md px-3',
        md: 'h-10 rounded-md px-5',
        lg: 'h-11 rounded-md px-8',
        xl: 'h-12 rounded-md px-10',
        xxl: 'h-14 rounded-md px-12',
        xxxl: 'h-16 rounded-md px-14',
        icon: 'h-10 w-10',
        iconsmall: 'h-5 w-5'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    
    // When asChild is true, we can't add extra children (like Spinner)
    // because Slot expects exactly one child
    if (asChild) {
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }), {
            'opacity-50 pointer-events-none': loading || disabled
          })}
          ref={ref}
          disabled={disabled || loading}
          {...props}
        >
          {children}
        </Comp>
      );
    }
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }), {
          'opacity-50 pointer-events-none': loading || disabled
        })}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Spinner className="mr-2" />}
        {children}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
