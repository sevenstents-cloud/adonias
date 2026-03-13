import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function Button({ className, variant = 'default', size = 'default', ...props }) {
  const variants = {
    default: 'bg-zinc-900 text-slate-50 hover:bg-zinc-800 shadow-sm',
    outline: 'border border-slate-200 bg-transparent hover:bg-slate-50 text-slate-800',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-800',
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm',
  };
  
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-8 px-3 text-sm',
    lg: 'h-12 px-8 text-lg',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:opacity-50 disabled:pointer-events-none ring-offset-white',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
