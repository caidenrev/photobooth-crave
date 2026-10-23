"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Check,
  Download,
  QrCode,
  Layers,
  RotateCcw,
  Palette,
} from "lucide-react";
import {
  BrutalButton,
  BrutalCard,
  BrutalBadge,
  BrutalTabs,
} from "@/components/ui";
import {
  useStudioStore,
  FRAME_THEMES,
  StripLayout,
} from "@/store/useStudioStore";
import { useAppStore } from "@/store/useAppStore";
import { useFramesStore } from "@/store/useFramesStore";
import { ldrSignalingService, LdrMessage } from "@/services/ldrSignalingService";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";

interface PhotostripPreviewProps {
  onOpenCheckout?: () => void;
  className?: string;
}

export function PhotostripPreview({ onOpenCheckout, className }: PhotostripPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { mode, roomId } = useAppStore();

  const {
    layout,
    setLayout,
    photos,
    frameTheme,
    setFrameTheme,
    stripTitle,
    stripDate,
    isPaid,
    setIsPaid,
    retakeSlot,
    activeSlotIndex,
    partnerName,
  } = useStudioStore();

  // Listen for payment completion from partner in LDR room
  useEffect(() => {
    const unsubscribe = ldrSignalingService.subscribe((msg: LdrMessage) => {
      if (msg.type === "PAYMENT_SUCCESS") {
        setIsPaid(true);
      }
    });
    return () => unsubscribe();
  }, [setIsPaid]);

  const { frames } = useFramesStore();
  const activeFrames = frames.filter((f) => f.isActive);
  const currentTheme =
    activeFrames.find((f) => f.id === frameTheme) ||
    activeFrames[0] ||
    FRAME_THEMES.cream;

  const [canvasDataUrl, setCanvasDataUrl] = useState<string | null>(null);

  // Render Photostrip onto HTML5 Canvas
  const renderCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const theme =
      activeFrames.find((f) => f.id === frameTheme) ||
      activeFrames[0] ||
      FRAME_THEMES.cream;

    // Dimensions based on layout
    let width = 600;
    let height = 1800;

    if (layout === "1x3") {
      width = 600;
      height = 1450;
    } else if (layout === "1x4") {
      width = 600;
      height = 1850;
    } else if (layout === "2x2") {
      width = 900;
      height = 1000;
    }

    canvas.width = width;
    canvas.height = height;

    // 1. Draw Frame Background
    ctx.fillStyle = theme.bgHex;
    ctx.fillRect(0, 0, width, height);

    // 2. Draw Frame Outer Border
    ctx.lineWidth = 12;
    ctx.strokeStyle = theme.borderHex;
    ctx.strokeRect(6, 6, width - 12, height - 12);

    // 3. Draw Header Title & Info
    ctx.fillStyle = theme.textHex;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const headerHeight = layout === "2x2" ? 90 : 100;
    ctx.font = "800 36px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(stripTitle, width / 2, 45);

    ctx.fillStyle = theme.subTextHex;
    ctx.font = "600 16px 'JetBrains Mono', monospace";
    const subTitleText =
      mode === "ldr"
        ? `• ${stripDate} • ROOM ${roomId || "LDR"} • ${layout} •`
        : `• ${stripDate} • ${layout} LAYOUT •`;
    ctx.fillText(subTitleText, width / 2, 78);

    // Helper to draw rounded rectangle
    const drawRoundedRect = (
      x: number,
      y: number,
      w: number,
      h: number,
      radius: number
    ) => {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + w - radius, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
      ctx.lineTo(x + w, y + h - radius);
      ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
      ctx.lineTo(x + radius, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    };

    // Helper to load image as Promise
    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    };

    // Calculate slots coordinates
    const marginX = 40;
    const padding = 24;

    if (layout === "1x3" || layout === "1x4") {
      const slotCount = layout === "1x3" ? 3 : 4;
      const photoWidth = width - marginX * 2;
      const photoHeight = (photoWidth * 3) / 4; // 4:3 ratio

      for (let i = 0; i < slotCount; i++) {
        const posX = marginX;
        const posY = headerHeight + i * (photoHeight + padding);

        // Draw photo slot container background
        ctx.save();
        drawRoundedRect(posX, posY, photoWidth, photoHeight, 20);
        ctx.fillStyle = "#E4E4E7";
        ctx.fill();
        ctx.lineWidth = 6;
        ctx.strokeStyle = theme.borderHex;
        ctx.stroke();
        ctx.clip();

        // Draw image or placeholder
        const photoData = photos[i];
        if (photoData) {
          try {
            const img = await loadImage(photoData);
            ctx.drawImage(img, posX, posY, photoWidth, photoHeight);
          } catch {
            drawSlotPlaceholder(ctx, posX, posY, photoWidth, photoHeight, i);
          }
        } else {
          drawSlotPlaceholder(ctx, posX, posY, photoWidth, photoHeight, i);
        }
        ctx.restore();
      }
    } else if (layout === "2x2") {
      // 2x2 Grid
      const gridMargin = 40;
      const cellW = (width - gridMargin * 2 - padding) / 2;
      const cellH = (cellW * 3) / 4;

      for (let i = 0; i < 4; i++) {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const posX = gridMargin + col * (cellW + padding);
        const posY = headerHeight + row * (cellH + padding);

        ctx.save();
        drawRoundedRect(posX, posY, cellW, cellH, 20);
        ctx.fillStyle = "#E4E4E7";
        ctx.fill();
        ctx.lineWidth = 6;
        ctx.strokeStyle = theme.borderHex;
        ctx.stroke();
        ctx.clip();

        const photoData = photos[i];
        if (photoData) {
          try {
            const img = await loadImage(photoData);
            ctx.drawImage(img, posX, posY, cellW, cellH);
          } catch {
            drawSlotPlaceholder(ctx, posX, posY, cellW, cellH, i);
          }
        } else {
          drawSlotPlaceholder(ctx, posX, posY, cellW, cellH, i);
        }
        ctx.restore();
      }
    }

    // 4. Draw Canva Transparent Frame Overlay (if provided)
    if (theme.overlayUrl) {
      try {
        const overlayImg = await loadImage(theme.overlayUrl);
        ctx.drawImage(overlayImg, 0, 0, width, height);
      } catch (err) {
        console.warn("Could not load Canva overlay image:", err);
      }
    }

    // 5. Draw Footer Stamp & Branding (for standard frames or subtle complement)
    const footerY = height - 50;
    ctx.fillStyle = theme.textHex;
    ctx.font = "700 18px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("SNAPBOND ONLINE PHOTOBOOTH", width / 2, footerY);

    ctx.fillStyle = theme.subTextHex;
    ctx.font = "600 13px 'JetBrains Mono', monospace";
    ctx.fillText("#MEMORYFORLIFETIME", width / 2, footerY + 22);

    // 6. Render Watermark Directly onto Pixel Canvas if NOT PAID
    if (!isPaid) {
      renderDiagonalCanvasWatermark(ctx, width, height);
    }

    setCanvasDataUrl(canvas.toDataURL("image/png"));
  }, [layout, photos, frameTheme, stripTitle, stripDate, isPaid, activeFrames]);

  // Placeholder renderer for empty photo slots
  const drawSlotPlaceholder = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    slotIndex: number
  ) => {
    if (mode === "ldr") {
      const halfW = w / 2;

      // Left half (User A)
      ctx.fillStyle = "#FFE4E6";
      ctx.fillRect(x, y, halfW, h);

      // Right half (User B)
      ctx.fillStyle = "#EDE9FE";
      ctx.fillRect(x + halfW, y, halfW, h);

      // Vertical separator line
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#18181B";
      ctx.beginPath();
      ctx.moveTo(x + halfW, y);
      ctx.lineTo(x + halfW, y + h);
      ctx.stroke();

      // Left Label
      ctx.fillStyle = "#18181B";
      ctx.font = "bold 22px 'Plus Jakarta Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Kamu", x + halfW / 2, y + h / 2 - 10);

      // Right Label
      ctx.fillText(partnerName || "Pasangan", x + halfW + halfW / 2, y + h / 2 - 10);

      // Subtitle
      ctx.font = "600 12px 'JetBrains Mono', monospace";
      ctx.fillStyle = "#71717A";
      ctx.fillText(`Pose #${slotIndex + 1}`, x + halfW / 2, y + h / 2 + 18);
      ctx.fillText("Sync", x + halfW + halfW / 2, y + h / 2 + 18);
    } else {
      ctx.fillStyle = "#F4F4F5";
      ctx.fillRect(x, y, w, h);

      ctx.fillStyle = "#A1A1AA";
      ctx.font = "bold 26px 'Plus Jakarta Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`POSE #${slotIndex + 1}`, x + w / 2, y + h / 2 - 10);

      ctx.font = "500 14px 'JetBrains Mono', monospace";
      ctx.fillText("Siap Ditangkap", x + w / 2, y + h / 2 + 24);
    }
  };

  // Render repetitive diagonal watermark pattern directly in canvas
  const renderDiagonalCanvasWatermark = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number
  ) => {
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(-0.55); // approx -32 degrees

    const stepY = 220;
    const count = Math.ceil(h / stepY) * 2;

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let i = -count; i <= count; i++) {
      const yPos = i * stepY;

      // Dark shadow background banner
      ctx.fillStyle = "rgba(24, 24, 27, 0.18)";
      ctx.fillRect(-w * 2, yPos - 28, w * 4, 56);

      // Solid outline and text
      ctx.font = "900 42px 'JetBrains Mono', monospace";
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(24, 24, 27, 0.45)";
      ctx.strokeText("SNAPBOND PREVIEW • UNPAID", 0, yPos);

      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.fillText("SNAPBOND PREVIEW • UNPAID", 0, yPos);
    }

    ctx.restore();
  };

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Download Trigger & History Recorder
  const handleDownload = (isHd: boolean) => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    const link = document.createElement("a");
    const roomTag = roomId ? `_${roomId}` : "";
    link.download = isHd
      ? `SnapBond_HD${roomTag}_${Date.now()}.png`
      : `SnapBond_Preview${roomTag}_${Date.now()}.png`;
    link.href = dataUrl;
    link.click();

    // Auto record into user photostrip history
    const dateFormatted = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    useAuthStore.getState().addHistory({
      id: "ps_" + Date.now().toString(36),
      roomCode: roomId || "SOLO-" + Math.random().toString(36).substring(2, 6).toUpperCase(),
      mode: mode === "ldr" ? "ldr" : "solo",
      frameName: currentTheme.name,
      layout,
      isPaid: isPaid || isHd,
      previewUrl: dataUrl,
      hdUrl: (isPaid || isHd) ? dataUrl : undefined,
      createdAt: dateFormatted,
    });
  };

  const maxSlots = layout === "1x3" ? 3 : 4;

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      {/* Canvas Photostrip Display Card */}
      <div className="bg-white border-2 border-zinc-900 rounded-3xl p-5 shadow-[6px_6px_0px_0px_#18181b] flex flex-col items-center">
        {/* Card Header Status */}
        <div className="w-full flex items-center justify-between pb-3 border-b-2 border-zinc-900 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" strokeWidth={2.25} />
            <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-900">
              Live Photostrip Canvas
            </span>
          </div>
          {isPaid ? (
            <BrutalBadge
              variant="emerald"
              size="sm"
              icon={<ShieldCheck className="w-3.5 h-3.5 text-emerald-900" strokeWidth={2.25} />}
            >
              HD Tanpa Watermark
            </BrutalBadge>
          ) : (
            <BrutalBadge
              variant="amber"
              size="sm"
              icon={<ShieldAlert className="w-3.5 h-3.5 text-amber-900" strokeWidth={2.25} />}
            >
              Watermark Aktif
            </BrutalBadge>
          )}
        </div>

        {/* Layout Switcher (1x3, 1x4, 2x2) */}
        <div className="w-full mb-4">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-700 mb-1.5 block">
            Pilih Format Tata Letak Strip:
          </span>
          <div className="grid grid-cols-3 gap-1.5 bg-stone-100 p-1 rounded-xl border-2 border-zinc-900">
            {(["1x3", "1x4", "2x2"] as StripLayout[]).map((l) => (
              <button
                key={l}
                onClick={() => setLayout(l)}
                className={cn(
                  "py-1.5 text-xs font-mono font-extrabold rounded-lg uppercase cursor-pointer transition-all",
                  layout === l
                    ? "bg-amber-300 text-zinc-900 border-2 border-zinc-900 shadow-[2px_2px_0px_0px_#18181b]"
                    : "text-zinc-600 hover:text-zinc-900"
                )}
              >
                {l} {l === "1x3" ? "(3 Pose)" : "(4 Pose)"}
              </button>
            ))}
          </div>
        </div>

        {/* Visible HTML5 Canvas Element */}
        <div className="p-2 bg-stone-100 rounded-2xl border-2 border-zinc-900 shadow-[4px_4px_0px_0px_#18181b] flex items-center justify-center max-w-full overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-48 sm:w-56 h-auto rounded-xl border border-zinc-400 shadow-xs transition-transform duration-200 sb-pop-in"
            style={{ maxHeight: "420px", objectFit: "contain" }}
          />
        </div>

        {/* Frame Theme Color Picker */}
        <div className="w-full mt-4 pt-3 border-t-2 border-zinc-900 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-800">
              Warna Frame: {currentTheme.name}
            </span>
            <Palette className="w-3.5 h-3.5 text-zinc-600" strokeWidth={2.25} />
          </div>

          <div className="flex items-center justify-center gap-2 flex-wrap">
            {activeFrames.map((theme) => {
              const isSelected = frameTheme === theme.id;
              const isDark = theme.bgHex.toLowerCase() === "#18181b" || theme.textHex === "#FFFFFF";
              return (
                <button
                  key={theme.id}
                  onClick={() => setFrameTheme(theme.id)}
                  title={`${theme.name} ${theme.isPremium ? `(Rp${theme.price.toLocaleString("id-ID")})` : "(Gratis)"}`}
                  aria-label={`Pilih frame ${theme.name}`}
                  style={{ backgroundColor: theme.bgHex }}
                  className={cn(
                    "w-8 h-8 rounded-xl border-2 border-zinc-900 transition-all cursor-pointer flex items-center justify-center relative",
                    isSelected
                      ? "scale-110 shadow-[2px_2px_0px_0px_#18181b] ring-2 ring-zinc-900"
                      : "opacity-80 hover:opacity-100 hover:scale-105"
                  )}
                >
                  {isSelected && (
                    <Check
                      className={cn("w-4 h-4", isDark ? "text-white" : "text-zinc-900")}
                      strokeWidth={2.5}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Retake Slot Buttons List */}
        <div className="w-full mt-4 pt-3 border-t-2 border-zinc-900 flex flex-col gap-1.5">
          <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-800">
            Pose Terambil ({photos.filter(Boolean).length} / {maxSlots})
          </span>
          <div className="grid grid-cols-2 gap-2">
            {photos.slice(0, maxSlots).map((p, idx) => (
              <div
                key={idx}
                className={cn(
                  "p-2 rounded-xl border-2 flex items-center justify-between text-xs font-bold",
                  activeSlotIndex === idx
                    ? "bg-amber-100 border-zinc-900 shadow-[2px_2px_0px_0px_#18181b]"
                    : "bg-stone-50 border-zinc-300"
                )}
              >
                <span>Pose #{idx + 1}</span>
                {p ? (
                  <button
                    onClick={() => retakeSlot(idx)}
                    title="Ulangi pose ini"
                    className="p-1 rounded-md bg-white border border-zinc-900 hover:bg-rose-100 text-zinc-800 flex items-center gap-1 text-[10px] cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3 text-rose-500" strokeWidth={2.25} />
                    <span>Retake</span>
                  </button>
                ) : (
                  <span className="text-[10px] text-zinc-400 font-mono">Kosong</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Checkout & Download Card */}
      <BrutalCard variant={isPaid ? "emerald" : "amber"} className="p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          {isPaid ? (
            <Check className="w-5 h-5 text-emerald-900" strokeWidth={2.25} />
          ) : (
            <QrCode className="w-5 h-5 text-zinc-900" strokeWidth={2.25} />
          )}
          <h3 className="font-extrabold text-sm text-zinc-900 uppercase tracking-tight">
            {isPaid ? "Status: Pembayaran Lunas!" : "Tebus Foto Tanpa Watermark"}
          </h3>
        </div>

        <p className="text-xs font-semibold text-zinc-700 leading-relaxed">
          {isPaid
            ? "Lapisan watermark telah dibuka! Silakan unduh file resolusi tinggi (HD 300 DPI) siap cetak."
            : "Buka watermark dan dapatkan file resolusi cetak HD (300 DPI) untuk diunduh langsung ke galeri HP/laptop."}
        </p>

        {!isPaid && (
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-xs font-mono font-bold text-zinc-800">Total Biaya Cetak:</span>
            <span className="text-lg font-mono font-extrabold text-zinc-900">Rp15.000</span>
          </div>
        )}

        {isPaid ? (
          <BrutalButton
            variant="emerald"
            size="md"
            fullWidth
            onClick={() => handleDownload(true)}
            icon={<Download className="w-4 h-4" strokeWidth={2.25} />}
            className="bg-emerald-300 hover:bg-emerald-200 border-zinc-900 shadow-[3px_3px_0px_0px_#18181b]"
          >
            Unduh Photostrip HD (PNG)
          </BrutalButton>
        ) : (
          <BrutalButton
            variant="amber"
            size="md"
            fullWidth
            onClick={onOpenCheckout}
            icon={<QrCode className="w-4 h-4" strokeWidth={2.25} />}
            className="bg-amber-300 hover:bg-amber-200 border-zinc-900 shadow-[3px_3px_0px_0px_#18181b]"
          >
            Tebus Foto HD via QRIS
          </BrutalButton>
        )}

        <BrutalButton
          variant="neutral"
          size="sm"
          fullWidth
          onClick={() => handleDownload(false)}
          icon={<Download className="w-4 h-4" strokeWidth={2.25} />}
        >
          Unduh Preview (Watermark Gratis)
        </BrutalButton>
      </BrutalCard>
    </div>
  );
}
