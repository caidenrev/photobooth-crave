"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTransitionRouter } from "@/components/layout/TransitionLink";
import Link from "@/components/layout/TransitionLink";
import {
  Camera,
  HeartHandshake,
  User,
  ArrowLeft,
  Copy,
  Radio,
  Image as ImageIcon,
  Check,
  QrCode,
  Sliders,
  RotateCcw,
} from "lucide-react";
import {
  BrutalButton,
  BrutalBadge,
  BrutalTabs,
  BrutalModal,
  BrutalCard,
  BrutalNotificationModal,
} from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { CameraStage } from "@/components/studio/CameraStage";
import { PhotostripPreview } from "@/components/studio/PhotostripPreview";
import { LdrRoomBar } from "@/components/studio/LdrRoomBar";
import { QrisCheckoutModal } from "@/components/studio/QrisCheckoutModal";
import { useStudioStore, FRAME_THEMES } from "@/store/useStudioStore";
import { cn } from "@/lib/utils";

function StudioContent() {
  const searchParams = useSearchParams();
  const router = useTransitionRouter();
  const roomParam = searchParams.get("room");
  const roleParam = searchParams.get("role");

  const {
    mode,
    setMode,
    roomId,
    setRoomId,
    setPartnerName,
  } = useAppStore();

  const {
    photos,
    activeSlotIndex,
    retakeSlot,
    layout,
    frameTheme,
    isPaid,
    setIsPaid,
  } = useStudioStore();

  // Sync query params with app store
  useEffect(() => {
    if (roomParam) {
      setMode("ldr");
      setRoomId(roomParam);
      if (roleParam === "host") {
        setPartnerName("Menunggu Pasangan...");
      } else {
        setPartnerName("Host Pasangan");
      }
    }
  }, [roomParam, roleParam, setMode, setRoomId, setPartnerName]);

  // Mobile adaptive view: "camera" vs "preview"
  const [mobileActiveView, setMobileActiveView] = useState<"camera" | "preview">("camera");

  // Modal dialog states
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Copy share link
  const handleCopyShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const currentRoomCode = roomId || roomParam || "SOLO-BOOTH";
  const maxSlots = layout === "1x3" ? 3 : 4;

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9]">
      {/* Studio Top Control Bar */}
      <header className="sticky top-0 z-30 w-full bg-[#FFFDF9]/95 backdrop-blur-md border-b-2 border-zinc-900 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Back & Mode Info */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/">
              <button
                aria-label="Kembali ke Beranda"
                className="p-2 rounded-xl border-2 border-zinc-900 bg-white hover:bg-stone-100 shadow-[2px_2px_0px_0px_#18181b] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-zinc-900" strokeWidth={2.25} />
              </button>
            </Link>

            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg text-zinc-900 hidden sm:inline">
                SnapBond Studio
              </span>
              {mode === "ldr" ? (
                <BrutalBadge
                  variant="rose"
                  size="sm"
                  icon={<HeartHandshake className="w-3.5 h-3.5" strokeWidth={2.25} />}
                >
                  Room: {currentRoomCode}
                </BrutalBadge>
              ) : (
                <BrutalBadge
                  variant="violet"
                  size="sm"
                  icon={<User className="w-3.5 h-3.5" strokeWidth={2.25} />}
                >
                  Mode Solo
                </BrutalBadge>
              )}
            </div>
          </div>

          {/* LDR Connection Status / Share */}
          {mode === "ldr" && (
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-100 border-2 border-zinc-900 shadow-[2px_2px_0px_0px_#18181b] text-xs font-bold text-emerald-900">
                <Radio className="w-3 h-3 text-emerald-600 animate-pulse" strokeWidth={2.25} />
                <span>Dual-Cam Aktif</span>
              </div>
              <BrutalButton
                variant="neutral"
                size="sm"
                onClick={handleCopyShareLink}
                icon={<Copy className="w-3.5 h-3.5" strokeWidth={2.25} />}
              >
                {isCopied ? "Tersalin" : "Undang Pasangan"}
              </BrutalButton>
            </div>
          )}

          {/* Mode Switcher Shortcut */}
          <div className="flex items-center gap-2">
            {mode === "ldr" ? (
              <BrutalButton
                variant="neutral"
                size="sm"
                onClick={() => {
                  setMode("solo");
                  setRoomId(null);
                  router.push("/studio");
                }}
                icon={<User className="w-3.5 h-3.5" strokeWidth={2.25} />}
              >
                Ganti ke Solo
              </BrutalButton>
            ) : (
              <BrutalButton
                variant="primary"
                size="sm"
                onClick={() => {
                  const newCode = "LDR-" + Math.random().toString(36).substring(2, 6).toUpperCase();
                  setMode("ldr");
                  setRoomId(newCode);
                  router.push(`/studio?room=${newCode}&role=host`);
                }}
                icon={<HeartHandshake className="w-3.5 h-3.5" strokeWidth={2.25} />}
              >
                Ajak Pasangan LDR
              </BrutalButton>
            )}
          </div>
        </div>

        {/* Mobile View Toggle Switcher */}
        <div className="lg:hidden mt-2 pt-2 border-t-2 border-zinc-900 flex justify-center">
          <BrutalTabs
            variant="amber"
            size="sm"
            items={[
              {
                id: "camera",
                label: "Panggung Kamera",
                icon: <Camera className="w-3.5 h-3.5" strokeWidth={2.25} />,
              },
              {
                id: "preview",
                label: "Live Photostrip",
                icon: <ImageIcon className="w-3.5 h-3.5" strokeWidth={2.25} />,
                badge: `${photos.filter(Boolean).length}/${maxSlots}`,
              },
            ]}
            activeId={mobileActiveView}
            onChange={(id) => setMobileActiveView(id as "camera" | "preview")}
          />
        </div>
      </header>

      {/* Main Studio Container: 12-Column Responsive Layout */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 flex flex-col gap-5 sb-stagger">
        {mode === "ldr" && currentRoomCode && (
          <LdrRoomBar roomId={currentRoomCode} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ========================================================= */}
          {/* LEFT 8 COLUMNS: CAMERA STAGE (Panggung Kamera)             */}
          {/* ========================================================= */}
          <div
            className={cn(
              "lg:col-span-8 flex flex-col gap-4",
              mobileActiveView === "preview" ? "hidden lg:flex" : "flex"
            )}
          >
            {/* Camera Component */}
            <CameraStage
              modeLabel={mode === "ldr" ? `LDR Stage: ${currentRoomCode}` : "Kamera Solo"}
            />

            {/* Quick Pose Slot Retake Strip */}
            <BrutalCard variant="white" className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-zinc-900" strokeWidth={2.25} />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-900">
                    Slot Pose ({photos.filter(Boolean).length} / {maxSlots} Terambil)
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-zinc-600">
                  Format {layout}
                </span>
              </div>

              <div className={cn("grid gap-2.5", maxSlots === 3 ? "grid-cols-3" : "grid-cols-4")}>
                {Array.from({ length: maxSlots }).map((_, idx) => {
                  const photoSrc = photos[idx];
                  const isCurrent = activeSlotIndex === idx;

                  return (
                    <div
                      key={idx}
                      className={cn(
                        "p-2 rounded-xl border-2 transition-all flex flex-col items-center justify-between gap-1.5 relative",
                        isCurrent
                          ? "bg-amber-100 border-zinc-900 shadow-[3px_3px_0px_0px_#18181b]"
                          : "bg-stone-50 border-zinc-300"
                      )}
                    >
                      <div className="w-full h-14 sm:h-20 rounded-lg bg-zinc-200 border border-zinc-400 overflow-hidden relative flex items-center justify-center">
                        {photoSrc ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={photoSrc}
                            alt={`Pose ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-0.5 text-zinc-400">
                            <ImageIcon className="w-4 h-4" strokeWidth={2} />
                            <span className="text-[10px] font-mono">Kosong</span>
                          </div>
                        )}

                        {isCurrent && (
                          <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
                        )}
                      </div>

                      <div className="w-full flex items-center justify-between text-[11px] font-bold">
                        <span className="font-mono text-zinc-900">#{idx + 1}</span>
                        {photoSrc && (
                          <button
                            onClick={() => retakeSlot(idx)}
                            title="Retake foto ini"
                            className="p-1 rounded-md bg-white border border-zinc-900 hover:bg-rose-100 text-zinc-800 flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3 text-rose-500" strokeWidth={2.25} />
                            <span className="text-[9px]">Ulang</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </BrutalCard>
          </div>

          {/* ========================================================= */}
          {/* RIGHT 4 COLUMNS: LIVE PHOTOSTRIP CANVAS & PAYWALL          */}
          {/* ========================================================= */}
          <div
            className={cn(
              "lg:col-span-4 flex flex-col gap-5",
              mobileActiveView === "camera" ? "hidden lg:flex" : "flex"
            )}
          >
            <PhotostripPreview
              onOpenCheckout={() => setIsCheckoutModalOpen(true)}
            />
          </div>
        </div>
      </main>

      {/* Real & Interactive QRIS Checkout Modal */}
      <QrisCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        roomId={currentRoomCode || "SOLO"}
        frameId={frameTheme}
        frameName={FRAME_THEMES[frameTheme]?.name || "Warm Cream"}
        onPaymentSuccess={() => {
          setIsPaid(true);
          setIsSuccessModalOpen(true);
        }}
      />

      {/* Soft Neo-Brutalism Success Popup Card Modal (No browser alert) */}
      <BrutalNotificationModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        type="success"
        title="Pembayaran QRIS Berhasil!"
        message="Mode simulasi pembayaran lunas! Lapisan watermark SNAPBOND PREVIEW telah dihilangkan dan file Photostrip HD 300 DPI siap diunduh."
        confirmText="Unduh Photostrip HD"
        cancelText="Tutup"
      />
    </div>
  );
}

export default function StudioPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FFFDF9]">
          <div className="p-6 bg-white border-2 border-zinc-900 rounded-3xl shadow-[4px_4px_0px_0px_#18181b] flex items-center gap-3">
            <Camera className="w-6 h-6 animate-spin text-zinc-900" strokeWidth={2.25} />
            <span className="font-extrabold text-sm text-zinc-900">
              Memuat Studio SnapBond...
            </span>
          </div>
        </div>
      }
    >
      <StudioContent />
    </Suspense>
  );
}
