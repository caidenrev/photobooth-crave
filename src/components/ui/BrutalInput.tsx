"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface BrutalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const BrutalInput = forwardRef<HTMLInputElement, BrutalInputProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      iconLeft,
      iconRight,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-extrabold uppercase tracking-wider text-zinc-900 select-none flex items-center justify-between"
          >
            <span>{label}</span>
          </label>
        )}

        <div className="relative flex items-center w-full">
          {iconLeft && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-zinc-700 [&>svg]:w-4 [&>svg]:h-4">
              {iconLeft}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={cn(
              "w-full rounded-xl border-2 border-zinc-900 bg-white px-3.5 py-2.5 text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 shadow-[2px_2px_0px_0px_#18181b] transition-all duration-100 ease-out focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:shadow-[4px_4px_0px_0px_#18181b]",
              iconLeft && "pl-10",
              iconRight && "pr-10",
              error && "border-red-500 focus:ring-red-500 bg-red-50/50",
              disabled && "bg-stone-100 opacity-60 cursor-not-allowed",
              className
            )}
            {...props}
          />

          {iconRight && (
            <div className="absolute right-3.5 flex items-center pointer-events-none text-zinc-700 [&>svg]:w-4 [&>svg]:h-4">
              {iconRight}
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs font-bold text-red-600 mt-0.5 tracking-tight">
            {error}
          </p>
        )}

        {!error && helperText && (
          <p className="text-xs font-medium text-zinc-600 mt-0.5">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

BrutalInput.displayName = "BrutalInput";
