"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export type CardVariant = "white" | "cream" | "rose" | "amber" | "violet" | "emerald" | "stone";

export interface BrutalCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  interactive?: boolean;
  rounded?: "2xl" | "3xl" | "xl";
  elevation?: "sm" | "md" | "lg";
  /** Animasi masuk saat card terlihat di layar (default: aktif) */
  animate?: boolean;
}

export const BrutalCard = forwardRef<HTMLDivElement, BrutalCardProps>(
  (
    {
      children,
      className,
      variant = "white",
      interactive = false,
      rounded = "2xl",
      elevation = "md",
      animate = true,
      ...props
    },
    ref
  ) => {
    const variantStyles: Record<CardVariant, string> = {
      white: "bg-white text-zinc-900",
      cream: "bg-[#FFFDF9] text-zinc-900",
      rose: "bg-rose-50 border-rose-950 text-zinc-900",
      amber: "bg-amber-50 border-amber-950 text-zinc-900",
      violet: "bg-violet-50 border-violet-950 text-zinc-900",
      emerald: "bg-emerald-50 border-emerald-950 text-zinc-900",
      stone: "bg-stone-100 text-zinc-900",
    };

    const roundedStyles = {
      xl: "rounded-xl",
      "2xl": "rounded-2xl",
      "3xl": "rounded-3xl",
    };

    const elevationStyles = {
      sm: "shadow-[2px_2px_0px_0px_#18181b]",
      md: "shadow-[4px_4px_0px_0px_#18181b]",
      lg: "shadow-[6px_6px_0px_0px_#18181b]",
    };

    const interactiveStyles = interactive
      ? "transition-all duration-150 ease-out hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#18181b] cursor-pointer"
      : "";

    return (
      <div
        ref={ref}
        className={cn(
          "border-2 border-zinc-900 p-5 relative overflow-hidden",
          variantStyles[variant],
          roundedStyles[rounded],
          elevationStyles[elevation],
          interactiveStyles,
          animate && "sb-reveal",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

BrutalCard.displayName = "BrutalCard";
