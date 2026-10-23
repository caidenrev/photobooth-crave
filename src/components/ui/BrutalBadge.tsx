"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "rose" | "amber" | "violet" | "emerald" | "neutral" | "dark";
export type BadgeSize = "sm" | "md";

export interface BrutalBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
}

export function BrutalBadge({
  children,
  className,
  variant = "neutral",
  size = "md",
  icon,
  ...props
}: BrutalBadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    rose: "bg-rose-300 text-zinc-900",
    amber: "bg-amber-300 text-zinc-900",
    violet: "bg-violet-300 text-zinc-900",
    emerald: "bg-emerald-300 text-zinc-900",
    neutral: "bg-stone-100 text-zinc-900",
    dark: "bg-zinc-900 text-white",
  };

  const sizeStyles: Record<BadgeSize, string> = {
    sm: "px-2 py-0.5 text-xs font-bold gap-1",
    md: "px-2.5 py-1 text-xs font-extrabold gap-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-xl border-2 border-zinc-900 shadow-[2px_2px_0px_0px_#18181b] font-mono tracking-tight select-none uppercase whitespace-nowrap",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {icon && (
        <span className="inline-flex shrink-0 items-center justify-center [&>svg]:w-3.5 [&>svg]:h-3.5">
          {icon}
        </span>
      )}
      {children && <span>{children}</span>}
    </span>
  );
}
