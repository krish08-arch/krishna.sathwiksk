import React from 'react';
import { cn } from '../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'accent';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-bold transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none";
  
  const variants = {
    primary: "bg-civic-dark text-white border-2 border-civic-dark shadow-[4px_4px_0px_0px_rgba(245,158,11,1)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_0px_rgba(245,158,11,1)]",
    secondary: "bg-slate-100 text-slate-900 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]",
    accent: "bg-civic-accent text-civic-dark border-2 border-civic-dark shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]",
    outline: "border-2 border-slate-900 bg-white text-slate-900 hover:bg-slate-50",
    danger: "bg-red-600 text-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-700 font-medium",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs uppercase tracking-wider",
    md: "px-6 py-3 text-sm uppercase tracking-wider",
    lg: "px-8 py-4 text-base uppercase tracking-widest",
    icon: "h-12 w-12",
  };

  return (
    <button 
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string }> = ({ children, className = '', title }) => (
  <div className={cn("bg-white border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,0.05)] overflow-hidden transition-all hover:shadow-[8px_8px_0px_0px_rgba(245,158,11,0.1)]", className)}>
    {title && (
      <div className="bg-slate-900 px-4 py-2 border-b-2 border-slate-900">
        <span className="text-white font-mono text-[10px] font-bold uppercase tracking-[0.2em]">{title}</span>
      </div>
    )}
    <div className="p-1">{children}</div>
  </div>
);

export const Badge: React.FC<{ children: React.ReactNode; color?: string; className?: string }> = ({ children, color = 'blue', className = '' }) => {
  const colors: Record<string, string> = {
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    green: "bg-green-100 text-green-700 border-green-200",
    orange: "bg-civic-accent/20 text-orange-800 border-civic-accent/30",
    red: "bg-red-100 text-red-700 border-red-200",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
  };
  return (
    <span className={cn("px-3 py-1 border font-bold text-[10px] uppercase tracking-wider", colors[color] || colors.blue, className)}>
      {children}
    </span>
  );
};

