"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from "lucide-react";
import { BrutalButton } from "./BrutalButton";
import { cn } from "@/lib/utils";

export type NotificationType = "success" | "warning" | "info" | "danger";

export interface BrutalNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: NotificationType;
  title: string;
  message: string;
  confirmText?: string;
  onConfirm?: () => void;
  cancelText?: string;
}

export function BrutalNotificationModal({
  isOpen,
  onClose,
  type = "success",
  title,
  message,
  confirmText = "OK, Mengerti",
  onConfirm,
  cancelText,
}: BrutalNotificationModalProps) {
  if (!isOpen) return null;

  const typeConfig = {
    success: {
      bg: "bg-emerald-300",
      icon: <CheckCircle2 className="w-8 h-8 text-zinc-900" strokeWidth={2.25} />,
      badge: "Berhasil",
      buttonVariant: "emerald" as const,
    },
    warning: {
      bg: "bg-amber-300",
      icon: <AlertTriangle className="w-8 h-8 text-zinc-900" strokeWidth={2.25} />,
      badge: "Perhatian",
      buttonVariant: "amber" as const,
    },
    info: {
      bg: "bg-violet-300",
      icon: <Info className="w-8 h-8 text-zinc-900" strokeWidth={2.25} />,
      badge: "Informasi",
      buttonVariant: "violet" as const,
    },
    danger: {
      bg: "bg-rose-400",
      icon: <XCircle className="w-8 h-8 text-zinc-900" strokeWidth={2.25} />,
      badge: "Peringatan",
      buttonVariant: "danger" as const,
    },
  };

  const current = typeConfig[type];

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs transition-opacity duration-150"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Pop-up Card */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-sm z-10 bg-[#FFFDF9] border-2 border-zinc-900 rounded-3xl p-6 shadow-[6px_6px_0px_0px_#18181b] animate-in fade-in-0 zoom-in-95 duration-150 ease-out flex flex-col items-center text-center"
      >
        {/* Top Close Button */}
        <button
          onClick={onClose}
          aria-label="Tutup"
          className="absolute top-4 right-4 p-1 rounded-xl border-2 border-zinc-900 bg-white hover:bg-stone-100 text-zinc-900 shadow-[2px_2px_0px_0px_#18181b] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer"
        >
          <X className="w-4 h-4" strokeWidth={2.25} />
        </button>

        {/* Large Rounded Cartoon Icon */}
        <div
          className={cn(
            "w-16 h-16 rounded-2xl border-2 border-zinc-900 shadow-[3px_3px_0px_0px_#18181b] flex items-center justify-center mb-4 mt-1",
            current.bg
          )}
        >
          {current.icon}
        </div>

        {/* Badge Indicator */}
        <span className="font-mono text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-stone-100 border-2 border-zinc-900 shadow-[1px_1px_0px_0px_#18181b] mb-2 text-zinc-800">
          {current.badge}
        </span>

        {/* Title */}
        <h3 className="text-lg font-extrabold text-zinc-900 tracking-tight mb-1.5">
          {title}
        </h3>

        {/* Message */}
        <p className="text-xs font-semibold text-zinc-600 leading-relaxed mb-6">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="w-full flex items-center justify-center gap-2.5">
          {cancelText && (
            <BrutalButton
              variant="neutral"
              size="md"
              onClick={onClose}
              className="flex-1"
            >
              {cancelText}
            </BrutalButton>
          )}

          <BrutalButton
            variant={current.buttonVariant}
            size="md"
            onClick={handleConfirm}
            className="flex-1"
          >
            {confirmText}
          </BrutalButton>
        </div>
      </div>
    </div>
  );
}
