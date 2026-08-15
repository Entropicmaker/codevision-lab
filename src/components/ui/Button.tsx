import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-accent text-white hover:-translate-y-0.5 hover:brightness-105 disabled:hover:translate-y-0 disabled:hover:brightness-100 glow-accent',
  secondary:
    'bg-surface/80 text-text border border-border hover:-translate-y-0.5 hover:border-borderstrong hover:bg-surface2',
  ghost: 'bg-transparent text-muted hover:text-text hover:bg-surface2',
  danger: 'bg-danger/10 text-danger border border-danger/40 hover:bg-danger/20',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-9 px-3 text-xs gap-1.5 rounded-xl',
  md: 'h-11 px-4 text-sm gap-2 rounded-full',
};

export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex select-none items-center justify-center font-semibold transition-all',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        'disabled:cursor-not-allowed disabled:opacity-40',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
