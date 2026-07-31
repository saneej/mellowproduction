import React from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-mono font-bold uppercase tracking-wider transition-all rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/50 disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const variants = {
    primary: "bg-brand-red text-white hover:bg-brand-red/90 active:scale-[0.98] shadow-lg shadow-brand-red/20 border border-brand-red",
    secondary: "bg-white/10 text-white hover:bg-white/20 active:scale-[0.98] border border-white/10",
    outline: "bg-transparent text-white/90 border border-white/20 hover:bg-white/10 hover:border-white/40",
    ghost: "bg-transparent text-white/70 hover:text-white hover:bg-white/5",
    danger: "bg-red-600 text-white hover:bg-red-700 border border-red-500 shadow-lg shadow-red-600/20"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-[11px] gap-1.5 min-h-[36px]",
    md: "px-4 py-2.5 text-xs gap-2 min-h-[44px]",
    lg: "px-6 py-3.5 text-xs sm:text-sm gap-2.5 min-h-[48px]"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="animate-spin text-current" size={size === "sm" ? 14 : 16} />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
