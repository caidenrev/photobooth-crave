"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface BrutalTabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface BrutalTabsProps {
  items: BrutalTabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
  variant?: "rose" | "amber" | "violet" | "emerald";
  size?: "sm" | "md";
}

export function BrutalTabs({
  items,
  activeId,
  onChange,
  className,
  variant = "amber",
  size = "md",
}: BrutalTabsProps) {
  const activeColorMap = {
    rose: "bg-rose-400 text-zinc-900",
    amber: "bg-amber-300 text-zinc-900",
    violet: "bg-violet-300 text-zinc-900",
    emerald: "bg-emerald-300 text-zinc-900",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs font-bold gap-1.5",
    md: "px-4 py-2 text-sm font-extrabold gap-2",
  };

  return (
    <div
      className={cn(
        "inline-flex p-1.5 bg-stone-100 rounded-2xl border-2 border-zinc-900 shadow-[2px_2px_0px_0px_#18181b] gap-1.5 max-w-full overflow-x-auto",
        className
      )}
      role="tablist"
    >
      {items.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center justify-center rounded-xl font-bold transition-all duration-100 select-none cursor-pointer whitespace-nowrap",
              sizeClasses[size],
              isActive
                ? cn(
                    "border-2 border-zinc-900 shadow-[2px_2px_0px_0px_#18181b]",
                    activeColorMap[variant]
                  )
                : "border-2 border-transparent text-zinc-600 hover:text-zinc-900 hover:bg-stone-200/50"
            )}
          >
            {tab.icon && (
              <span className="shrink-0 [&>svg]:w-4 [&>svg]:h-4">{tab.icon}</span>
            )}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  "ml-1 px-1.5 py-0.2 rounded-md text-[10px] font-mono border border-zinc-900 font-extrabold",
                  isActive ? "bg-white text-zinc-900" : "bg-stone-300 text-zinc-800"
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
