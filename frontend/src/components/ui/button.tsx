import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-400 disabled:opacity-60 disabled:cursor-not-allowed";
    const variants: Record<string, string> = {
      primary:
        "bg-sage-500 text-white hover:bg-sage-600 shadow-md hover:shadow-lg",
      ghost:
        "bg-transparent hover:bg-sage-100/60 dark:hover:bg-slate-800 text-sage-700 dark:text-sage-200",
      outline:
        "border border-sage-300 dark:border-sage-700 bg-transparent hover:bg-sage-100/40 dark:hover:bg-slate-900/50 text-sage-700 dark:text-sage-100"
    };
    const sizes: Record<string, string> = {
      sm: "text-xs px-3 py-1.5",
      md: "text-sm px-4 py-2",
      lg: "text-base px-5 py-2.5"
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

