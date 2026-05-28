'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GradientButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'danger' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  className?: string;
}

export function GradientButton({
  children,
  variant = 'primary',
  loading,
  disabled,
  type = 'button',
  onClick,
  className,
}: GradientButtonProps) {
  const base =
    'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed';

  const variants = {
    primary: 'text-white shadow-md hover:shadow-purple-200',
    danger: 'text-white bg-red-500 hover:bg-red-600 shadow-md',
    outline: 'border border-slate-200 text-slate-700 bg-white hover:bg-slate-50',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(base, variants[variant], className)}
      style={
        variant === 'primary'
          ? { background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)' }
          : undefined
      }
    >
      {loading && (
        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {children}
    </motion.button>
  );
}
