import type { HTMLAttributes } from 'react';

export default function Card({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`glass rounded-2xl shadow-card ${className}`} {...rest}>
      {children}
    </div>
  );
}
