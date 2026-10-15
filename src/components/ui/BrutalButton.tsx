"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "amber" | "violet" | "emerald" | "neutral" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface BrutalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
}

export const BrutalButton = forwardRef<HTMLButtonElement, BrutalButtonProps>(
  (
    {
      children,
      className,
      variant = "primary",
      size = "md",
      icon,
      iconPosition = "left",
      fullWidth = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const variantStyles: Record<ButtonVariant, string> = {
      primary: "bg-rose-400 hover:bg-rose-300 text-zinc-900 shadow-[2px_2px_0px_0px_#18181b]",
      amber: "bg-amber-300 hover:bg-amber-200 text-zinc-900 shadow-[2px_2px_0px_0px_#18181b]",
      violet: "bg-violet-300 hover:bg-violet-200 text-zinc-900 shadow-[2px_2px_0px_0px_#18181b]",
      emerald: "bg-emerald-300 hover:bg-emerald-200 text-zinc-900 shadow-[2px_2px_0px_0px_#18181b]",
      neutral: "bg-white hover:bg-stone-50 text-zinc-900 shadow-[2px_2px_0px_0px_#18181b]",
      danger: "bg-red-400 hover:bg-red-300 text-zinc-900 shadow-[2px_2px_0px_0px_#18181b]",
      ghost: "bg-transparent hover:bg-stone-200/60 text-zinc-800 border-dashed border-2 border-zinc-900 shadow-none active:translate-x-0 active:translate-y-0",
    };

    const sizeStyles: Record<ButtonSize, string> = {
      sm: "px-3 py-1.5 text-xs font-bold gap-1.5",
      md: "px-4 py-2.5 text-sm font-bold gap-2",
      lg: "px-6 py-3.5 text-base font-extrabold gap-2.5",
    };

    const baseStyles =
      "inline-flex items-center justify-center rounded-xl border-2 border-zinc-900 select-none cursor-pointer font-bold tracking-tight transition-all duration-100 ease-out focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2";

    const tactileActive =
      variant !== "ghost"
        ? "active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:-translate-y-0.5 hover:-translate-x-0.5"
        : "";

    const disabledStyles = disabled
      ? "opacity-50 cursor-not-allowed pointer-events-none grayscale"
      : "";

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          tactileActive,
          disabledStyles,
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {icon && iconPosition === "left" && (
          <span className="inline-flex shrink-0 items-center justify-center [&>svg]:w-4 [&>svg]:h-4">
            {icon}
          </span>
        )}
        {children && <span>{children}</span>}
        {icon && iconPosition === "right" && (
          <span className="inline-flex shrink-0 items-center justify-center [&>svg]:w-4 [&>svg]:h-4">
            {icon}
          </span>
        )}
      </button>
    );
  }
);

BrutalButton.displayName = "BrutalButton";
