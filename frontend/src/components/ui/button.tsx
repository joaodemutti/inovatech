import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'text-white shadow-md hover:shadow-purple-200/50 hover:opacity-90',
        destructive: 'bg-red-500 text-white shadow-sm hover:bg-red-600',
        outline: 'border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900',
        secondary: 'bg-slate-100 text-slate-800 shadow-sm hover:bg-slate-200',
        ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        link: 'text-purple-600 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-lg px-3 text-xs',
        lg: 'h-11 rounded-xl px-6',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, style, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    const isDefault = !variant || variant === 'default';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        style={
          isDefault
            ? { background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)', ...style }
            : style
        }
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
