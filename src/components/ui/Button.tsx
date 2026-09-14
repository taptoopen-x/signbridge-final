import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'md' | 'lg';
  icon?: ReactNode;
}

const variants: Record<string, string> = {
  primary: 'bg-signal-500 text-base-950 hover:bg-signal-400 shadow-glow',
  secondary: 'bg-white/10 text-white hover:bg-white/15 border border-white/15',
  ghost: 'bg-transparent text-mist hover:text-white hover:bg-white/5',
  danger: 'bg-coral-500/15 text-coral-400 hover:bg-coral-500/25 border border-coral-500/30',
};

const sizes: Record<string, string> = {
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`focus-ring inline-flex items-center justify-center gap-2 rounded-xl font-semibold
        transition-all duration-200 active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none
        ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
