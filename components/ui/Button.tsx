import { type ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

type Variant = "primary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-accent text-[#1a1108] hover:bg-accent-strong disabled:bg-accent/40 disabled:text-[#1a1108]/60",
  outline:
    "border border-border-strong text-text-primary hover:bg-hover disabled:opacity-40",
  ghost: "text-text-secondary hover:text-text-primary hover:bg-hover disabled:opacity-30",
  danger: "text-danger border border-danger/30 hover:bg-danger/10 disabled:opacity-40",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-xs px-2.5 py-1.5 gap-1.5",
  md: "text-sm px-3.5 py-2 gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "outline", size = "md", className, ...props }, ref) => (
    <button
      ref={ref}
      className={clsx(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors cursor-pointer disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
);

Button.displayName = "Button";
