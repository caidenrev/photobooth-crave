"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BrutalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export function BrutalModal({
  isOpen,
  onClose,
  title,
  description,
  icon,
  children,
  footer,
  maxWidth = "md",
}: BrutalModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative w-full z-10 bg-[#FFFDF9] border-2 border-zinc-900 rounded-3xl p-6 shadow-[6px_6px_0px_0px_#18181b] animate-in fade-in-0 zoom-in-95 duration-150 ease-out",
          maxWidthStyles[maxWidth]
        )}
      >
        {/* Header Bar */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b-2 border-zinc-900 mb-5">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="p-2.5 rounded-2xl bg-amber-300 border-2 border-zinc-900 shadow-[2px_2px_0px_0px_#18181b] shrink-0 text-zinc-900">
                {icon}
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-lg font-extrabold tracking-tight text-zinc-900 leading-tight">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs font-semibold text-zinc-600 mt-0.5">
                  {description}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Tutup modal"
            className="p-1.5 rounded-xl border-2 border-zinc-900 bg-white hover:bg-rose-100 text-zinc-900 shadow-[2px_2px_0px_0px_#18181b] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer"
          >
            <X className="w-4 h-4" strokeWidth={2.25} />
          </button>
        </div>

        {/* Content Body */}
        <div className="text-zinc-800 text-sm">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="mt-6 pt-4 border-t-2 border-zinc-900 flex items-center justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
