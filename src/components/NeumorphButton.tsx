
import React, { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type NeumorphButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'primary' | 'outlined' | 'floating';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
};

const NeumorphButton: React.FC<NeumorphButtonProps> = ({
  children,
  className,
  variant = 'default',
  size = 'md',
  icon,
  ...props
}) => {
  const baseStyles = "flex items-center justify-center transition-all duration-200 font-medium rounded-xl";
  
  const variantStyles = {
    default: "neumorph-btn bg-bell-background text-bell-foreground hover:text-bell-primary",
    primary: "neumorph-btn bg-bell-primary text-white hover:bg-opacity-90",
    outlined: "border-2 border-bell-primary text-bell-primary hover:bg-bell-primary hover:bg-opacity-10",
    floating: "shadow-neumorph bg-bell-card text-bell-foreground hover:shadow-neumorph-sm"
  };
  
  const sizeStyles = {
    sm: "text-sm px-3 py-1.5",
    md: "px-4 py-2",
    lg: "text-lg px-6 py-3"
  };
  
  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export default NeumorphButton;
