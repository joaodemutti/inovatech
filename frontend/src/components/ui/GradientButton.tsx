'use client';

import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GradientButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'primary' | 'outline' | 'danger';
  loading?: boolean;
}

export function GradientButton({
  variant = 'primary',
  loading,
  children,
  disabled,
  className,
  ...props
}: GradientButtonProps) {
  const shadcnVariant =
    variant === 'outline' ? 'outline' :
    variant === 'danger'  ? 'destructive' :
    'default';

  return (
    <Button
      variant={shadcnVariant}
      disabled={disabled || loading}
      className={cn(className)}
      {...props}
    >
      {loading && (
        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {children}
    </Button>
  );
}
