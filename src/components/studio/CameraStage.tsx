"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  Camera,
  FlipHorizontal,
  VideoOff,
  RefreshCw,
  Sparkles,
  HeartHandshake,
  User,
  Users,
  Radio,
  Zap,
} from "lucide-react";
import { BrutalButton, BrutalBadge, PlayfulText } from "@/components/ui";
import { useStudioStore, FilterType } from "@/store/useStudioStore";
import { useAppStore } from "@/store/useAppStore";
import { ldrSignaling, LdrMessage } from "@/services/ldrSignalingService";
import { cn } from "@/lib/utils";

const FILTER_CSS: Record<FilterType, string> = {
  normal: "none",
  retro: "sepia(0.4) contrast(1.1) brightness(0.95) saturate(1.2)",
  bw: "grayscale(1) contrast(1.25)",
  pastel: "brightness(1.05) saturate(0.85) hue-rotate(-10deg)",
};

interface CameraStageProps {
  onCaptureComplete?: (index: number) => void;
  className?: string;
  modeLabel?: string;
}

export function CameraStage({ onCaptureComplete, className, modeLabel }: CameraStageProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const partnerCanvasRef = useRef<HTMLCanvasElement>(null);

  const { mode, roomId } = useAppStore();

  const {
    activeSlotIndex,
    setPhoto,
    setLdrPhoto,
    nextSlotAfterCapture,
    selectedDeviceId,
    setSelectedDeviceId,
    availableDevices,
    setAvailableDevices,
    isMirrored,
    setIsMirrored,
    filter,
    setFilter,
    isCountingDown,
    setIsCountingDown,
    countdownValue,
    setCountdown,
    triggerFlash,
    setTriggerFlash,
    layout,
    partnerStatus,
    setPartnerStatus,
    partnerName,
    setPartnerName,
    isSimulatedPartner,
    setIsSimulatedPartner,
  } = useStudioStore();

  const [permissionState, setPermissionState] = useState<"prompt" | "granted" | "denied">("prompt");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDummyMode, setIsDummyMode] = useState<boolean>(false);

  // Initialize camera stream
  const startCamera = useCallback(async (deviceId?: string) => {
    try {
      setErrorMessage(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        audio: false,
        video: deviceId
          ? { deviceId: { exact: deviceId }, width: { ideal: 1280 }, height: { ideal: 960 } }
          : { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } },
      };

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Browser tidak mendukung API kamera (MediaDevices).");
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }

      setPermissionState("granted");
      setIsDummyMode(false);

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices
        .filter((d) => d.kind === "videoinput")
        .map((d, i) => ({
          deviceId: d.deviceId,
          label: d.label || `Kamera ${i + 1}`,
        }));
      setAvailableDevices(videoInputs);
      if (!selectedDeviceId && videoInputs.length > 0) {
        setSelectedDeviceId(videoInputs[0].deviceId);
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.warn("Gagal mengakses kamera:", error.message);
      setPermissionState("denied");
      setErrorMessage(error.message || "Akses kamera ditolak.");
    }
  }, [selectedDeviceId, setAvailableDevices, setSelectedDeviceId]);

  // Clean up stream on unmount
  useEffect(() => {
    startCamera(selectedDeviceId || undefined);
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [selectedDeviceId, startCamera]);

  // Draw simulated dynamic partner feed
  useEffect(() => {
    if (mode !== "ldr" || (!isSimulatedPartner && partnerStatus === "waiting")) return;

    let animId: number;
    let tick = 0;

    const renderPartnerFeed = () => {
      const canvas = partnerCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      tick += 0.04;
      const w = canvas.width;
      const h = canvas.height;

      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, "#FECDD3"); // Rose 200
      grad.addColorStop(1, "#C4B5FD"); // Violet 300
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Subtle room grid
      ctx.strokeStyle = "rgba(24, 24, 27, 0.08)";
      ctx.lineWidth = 2;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // Partner cartoon avatar silhouette
      const centerX = w / 2;
      const centerY = h / 2 + Math.sin(tick) * 8; // gentle float

      // Head
      ctx.fillStyle = "#18181B";
      ctx.beginPath();
      ctx.arc(centerX, centerY - 45, 55, 0, Math.PI * 2);
      ctx.fill();

      // Hair bun / detail
      ctx.beginPath();
      ctx.arc(centerX + 35, centerY - 75, 24, 0, Math.PI * 2);
      ctx.fill();

      // Shoulders
      ctx.beginPath();
      ctx.ellipse(centerX, centerY + 85, 95, 60, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cute blush cheeks on avatar
      ctx.fillStyle = "#FB7185";
      ctx.beginPath();
      ctx.arc(centerX - 22, centerY - 35, 10, 0, Math.PI * 2);
      ctx.arc(centerX + 22, centerY - 35, 10, 0, Math.PI * 2);
      ctx.fill();

      // Name label banner on partner stream
      ctx.fillStyle = "#FFFFFF";
      ctx.strokeStyle = "#18181B";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(centerX - 90, h - 50, 180, 36, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#18181B";
      ctx.font = "bold 13px 'Plus Jakarta Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(partnerName || "Pasangan LDR", centerX, h - 32);

      animId = requestAnimationFrame(renderPartnerFeed);
    };

    renderPartnerFeed();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [mode, isSimulatedPartner, partnerStatus, partnerName]);

  // Capture single photo or LDR dual photo
  const capturePhoto = useCallback(() => {
    const maxSlots = layout === "1x3" ? 3 : 4;
    const targetSlot = activeSlotIndex < maxSlots ? activeSlotIndex : 0;

    const width = 1200;
    const height = 900;

    // 1. Capture Local Frame
    const localCanvas = document.createElement("canvas");
    localCanvas.width = width;
    localCanvas.height = height;
    const localCtx = localCanvas.getContext("2d");

    if (localCtx) {
      if (isMirrored) {
        localCtx.translate(width, 0);
        localCtx.scale(-1, 1);
      }
      localCtx.filter = FILTER_CSS[filter];

      if (videoRef.current && permissionState === "granted" && !isDummyMode) {
        try {
          localCtx.drawImage(videoRef.current, 0, 0, width, height);
        } catch {
          drawFallbackPlaceholder(localCtx, width, height, targetSlot, "Kamu");
        }
      } else {
        drawFallbackPlaceholder(localCtx, width, height, targetSlot, "Kamu");
      }
    }
    const localDataUrl = localCanvas.toDataURL("image/jpeg", 0.92);

    // 2. If LDR mode, capture/generate partner photo and make 50:50 composite split
    if (mode === "ldr") {
      let partnerDataUrl: string;

      if (partnerCanvasRef.current && (isSimulatedPartner || partnerStatus !== "waiting")) {
        partnerDataUrl = partnerCanvasRef.current.toDataURL("image/jpeg", 0.92);
      } else {
        const dummyPartnerCanvas = document.createElement("canvas");
        dummyPartnerCanvas.width = width;
        dummyPartnerCanvas.height = height;
        const pCtx = dummyPartnerCanvas.getContext("2d");
        if (pCtx) {
          drawFallbackPlaceholder(pCtx, width, height, targetSlot, partnerName || "Pasangan");
        }
        partnerDataUrl = dummyPartnerCanvas.toDataURL("image/jpeg", 0.92);
      }

      // Store in LDR slot
      setLdrPhoto(targetSlot, { local: localDataUrl, partner: partnerDataUrl });

      // Generate composite split for photostrip canvas: Left User A, Right User B
      const splitCanvas = document.createElement("canvas");
      splitCanvas.width = width;
      splitCanvas.height = height;
      const sCtx = splitCanvas.getContext("2d");

      if (sCtx) {
        const halfW = width / 2;
        const imgA = new Image();
        const imgB = new Image();

        imgA.src = localDataUrl;
        imgB.src = partnerDataUrl;

        // Draw left half (crop center of local)
        sCtx.drawImage(imgA, width / 4, 0, halfW, height, 0, 0, halfW, height);
        // Draw right half (crop center of partner)
        sCtx.drawImage(imgB, width / 4, 0, halfW, height, halfW, 0, halfW, height);

        // Draw vertical divider
        sCtx.lineWidth = 6;
        sCtx.strokeStyle = "#18181B";
        sCtx.beginPath();
        sCtx.moveTo(halfW, 0);
        sCtx.lineTo(halfW, height);
        sCtx.stroke();

        const splitDataUrl = splitCanvas.toDataURL("image/jpeg", 0.92);
        setPhoto(targetSlot, splitDataUrl);
      }
    } else {
      // Solo mode
      setPhoto(targetSlot, localDataUrl);
    }

    nextSlotAfterCapture();

    if (onCaptureComplete) {
      onCaptureComplete(targetSlot);
    }
  }, [
    layout,
    activeSlotIndex,
    isMirrored,
    filter,
    permissionState,
    isDummyMode,
    mode,
    isSimulatedPartner,
    partnerStatus,
    partnerName,
    setPhoto,
    setLdrPhoto,
    nextSlotAfterCapture,
    onCaptureComplete,
  ]);

  // Execute countdown animation
  const runCountdownAnimation = useCallback(() => {
    setIsCountingDown(true);
    setCountdown(3);

    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(interval);
        setCountdown(null);
        setTriggerFlash(true);
        capturePhoto();
        setTimeout(() => {
          setTriggerFlash(false);
          setIsCountingDown(false);
        }, 300);
      }
    }, 900);
  }, [capturePhoto, setCountdown, setIsCountingDown, setTriggerFlash]);

  // Subscribe to LDR signaling messages
  useEffect(() => {
    if (!roomId) return;

    ldrSignaling.initRoom(roomId);
    const unsubscribe = ldrSignaling.subscribe((msg: LdrMessage) => {
      if (msg.type === "PEER_JOIN") {
        setPartnerStatus("connected");
        setPartnerName(msg.senderName || "Pasangan LDR");
      } else if (msg.type === "SYNC_SHUTTER") {
        if (!isCountingDown) {
          runCountdownAnimation();
        }
      } else if (msg.type === "PEER_LEAVE") {
        setPartnerStatus("waiting");
      }
    });

    return () => {
      unsubscribe();
    };
  }, [roomId, isCountingDown, runCountdownAnimation, setPartnerName, setPartnerStatus]);

  // Fallback drawing helper
  const drawFallbackPlaceholder = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    slot: number,
    label: string
  ) => {
    const gradients = [
      ["#FDE68A", "#F472B6"],
      ["#DDD6FE", "#38BDF8"],
      ["#A7F3D0", "#FBBF24"],
      ["#FECDD3", "#C084FC"],
    ];
    const pair = gradients[slot % gradients.length];
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, pair[0]);
    grad.addColorStop(1, pair[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "#18181B";
    ctx.beginPath();
    ctx.arc(w / 2, h / 2 - 40, 110, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 90px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${slot + 1}`, w / 2, h / 2 - 40);

    ctx.fillStyle = "#18181B";
    ctx.font = "bold 44px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(`${label} • Pose #${slot + 1}`, w / 2, h / 2 + 130);
  };

  // Trigger countdown button clicked
  const handleStartCaptureCountdown = () => {
    if (isCountingDown) return;

    // In LDR mode, broadcast to partner
    if (mode === "ldr") {
      ldrSignaling.triggerSyncShutter(activeSlotIndex);
    }

    runCountdownAnimation();
  };

  const maxSlots = layout === "1x3" ? 3 : 4;
  const isLdrConnected = mode === "ldr" && (isSimulatedPartner || partnerStatus !== "waiting");

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Video Viewport Container */}
      <div className="relative bg-zinc-950 rounded-3xl border-2 border-zinc-900 shadow-[6px_6px_0px_0px_#18181b] overflow-hidden flex flex-col items-center justify-center min-h-[380px] sm:min-h-[500px]">
        {/* Shutter Flash Animation Overlay */}
        {triggerFlash && (
          <div className="absolute inset-0 z-40 bg-white animate-out fade-out duration-300 pointer-events-none" />
        )}

        {/* Live Countdown Overlay */}
        {countdownValue !== null && (
          <div className="absolute inset-0 z-30 bg-rose-500/80 backdrop-blur-xs flex flex-col items-center justify-center animate-in zoom-in-75 duration-100">
            <span
              key={countdownValue}
              className="text-8xl sm:text-9xl font-extrabold text-white font-mono drop-shadow-[4px_4px_0px_#18181b] sb-pop-in"
            >
              {countdownValue}
            </span>
            <div className="flex items-center gap-2 mt-2 px-4 py-1.5 rounded-xl bg-white border-2 border-zinc-900 shadow-[2px_2px_0px_0px_#18181b]">
              <Sparkles className="w-4 h-4 text-amber-500" strokeWidth={2.25} />
              <span className="text-xs sm:text-sm font-extrabold text-zinc-900 uppercase tracking-widest">
                {mode === "ldr" ? "Foto Bersama Pasangan" : `Pose #${activeSlotIndex + 1}`}
              </span>
            </div>
          </div>
        )}

        {/* Top Floating Badge */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
          <BrutalBadge variant="violet" size="sm" icon={<Camera className="w-3.5 h-3.5" strokeWidth={2.25} />}>
            {modeLabel || (mode === "ldr" ? "Dual-Cam LDR" : "Kamera Solo")}
          </BrutalBadge>
          <BrutalBadge variant="amber" size="sm">
            Pose {activeSlotIndex + 1} / {maxSlots}
          </BrutalBadge>
        </div>

        {/* ======================================================== */}
        {/* DUAL STREAM (LDR MODE) vs SINGLE STREAM (SOLO MODE)      */}
        {/* ======================================================== */}
        {mode === "ldr" ? (
          <div className="w-full h-full grid grid-cols-1 sm:grid-cols-2 divide-y-2 sm:divide-y-0 sm:divide-x-2 divide-zinc-800 flex-1 min-h-[360px] sm:min-h-[440px]">
            {/* Stream User A (Local) */}
            <div className="relative bg-zinc-900 flex items-center justify-center overflow-hidden">
              <div className="absolute top-3 left-3 z-10">
                <BrutalBadge variant="rose" size="sm" icon={<User className="w-3 h-3" strokeWidth={2.25} />}>
                  Kamu (Kiri)
                </BrutalBadge>
              </div>

              {permissionState === "granted" && !isDummyMode ? (
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  autoPlay
                  style={{
                    filter: FILTER_CSS[filter],
                    transform: isMirrored ? "scaleX(-1)" : "none",
                  }}
                  className="w-full h-full object-cover aspect-[4/3]"
                />
              ) : (
                <div className="p-4 flex flex-col items-center justify-center text-zinc-400 gap-2">
                  <VideoOff className="w-8 h-8 text-amber-400" strokeWidth={2.25} />
                  <span className="text-xs font-bold text-center">Kamera Lokal Standby</span>
                  <BrutalButton
                    variant="amber"
                    size="sm"
                    onClick={() => startCamera(selectedDeviceId || undefined)}
                  >
                    Buka Kamera
                  </BrutalButton>
                </div>
              )}
            </div>

            {/* Stream User B (Partner Remote / Simulated Stream) */}
            <div className="relative bg-zinc-900 flex items-center justify-center overflow-hidden">
              <div className="absolute top-3 left-3 z-10">
                <BrutalBadge variant="violet" size="sm" icon={<HeartHandshake className="w-3 h-3" strokeWidth={2.25} />}>
                  {partnerName || "Pasangan (Kanan)"}
                </BrutalBadge>
              </div>

              {isLdrConnected ? (
                <>
                  <canvas
                    ref={partnerCanvasRef}
                    width={640}
                    height={480}
                    className="w-full h-full object-cover aspect-[4/3]"
                  />
                  <div className="absolute bottom-3 right-3 z-10">
                    <span className="text-[10px] font-mono text-emerald-300 bg-zinc-900/90 px-2 py-0.5 rounded-md border border-emerald-500 flex items-center gap-1 font-bold">
                      <Radio className="w-3 h-3 text-emerald-400 animate-pulse" strokeWidth={2.25} />
                      Sinyal Pasangan OK
                    </span>
                  </div>
                </>
              ) : (
                <div className="p-6 flex flex-col items-center justify-center text-center gap-3 text-zinc-300">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center">
                    <Users className="w-8 h-8 text-amber-300" strokeWidth={2.25} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white mb-0.5">
                      <PlayfulText text="Menunggu Pasangan Masuk" delay={100} step={30} />
                    </h4>
                    <p className="text-xs text-zinc-400 max-w-xs">
                      Bagikan kode room ke pasanganmu, atau klik tombol di bawah untuk simulasi langsung.
                    </p>
                  </div>
                  <BrutalButton
                    variant="violet"
                    size="sm"
                    onClick={() => {
                      setIsSimulatedPartner(true);
                      setPartnerName("Dinda (LDR)");
                      setPartnerStatus("stable");
                      ldrSignaling.simulatePartnerConnection("Dinda (LDR)");
                    }}
                    icon={<Sparkles className="w-3.5 h-3.5" strokeWidth={2.25} />}
                  >
                    Aktifkan Simulasi Pasangan
                  </BrutalButton>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Solo View */
          permissionState === "granted" && !isDummyMode ? (
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              style={{
                filter: FILTER_CSS[filter],
                transform: isMirrored ? "scaleX(-1)" : "none",
              }}
              className="w-full h-full object-cover rounded-3xl aspect-[4/3] sm:aspect-[16/10]"
            />
          ) : (
            <div className="w-full h-full p-8 flex flex-col items-center justify-center text-center gap-4 bg-zinc-900 text-zinc-300 min-h-[380px]">
              <div className="w-20 h-20 rounded-2xl bg-zinc-800 border-2 border-zinc-700 shadow-[4px_4px_0px_0px_#09090b] flex items-center justify-center">
                <VideoOff className="w-10 h-10 text-amber-400" strokeWidth={2.25} />
              </div>

              <div className="max-w-sm">
                <h3 className="font-extrabold text-base sm:text-lg text-white mb-1">
                  <PlayfulText
                    key={isDummyMode ? "dummy" : "permission"}
                    text={isDummyMode ? "Mode Simulasi Kamera Aktif" : "Izin Kamera Dibutuhkan"}
                    delay={100}
                    step={30}
                  />
                </h3>
                <p className="text-xs font-medium text-zinc-400 leading-relaxed">
                  {isDummyMode
                    ? "Menggunakan sensor grafis mockup. Anda tetap dapat mengambil 3-4 pose dan menguji photostrip sepenuhnya."
                    : errorMessage || "Izinkan peramban mengakses kamera agar Anda dapat melihat tampilan live stream."}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                <BrutalButton
                  variant="amber"
                  size="sm"
                  onClick={() => startCamera(selectedDeviceId || undefined)}
                  icon={<RefreshCw className="w-3.5 h-3.5" strokeWidth={2.25} />}
                >
                  Coba Hubungkan Kamera
                </BrutalButton>
                <BrutalButton
                  variant="violet"
                  size="sm"
                  onClick={() => setIsDummyMode(true)}
                  icon={<Sparkles className="w-3.5 h-3.5" strokeWidth={2.25} />}
                >
                  Gunakan Dummy Kamera
                </BrutalButton>
              </div>
            </div>
          )
        )}

        {/* Video Stage Controls Bar */}
        <div className="w-full bg-zinc-950/95 backdrop-blur-md border-t-2 border-zinc-800 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
          {/* Left tools: Mirror & Device selector */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMirrored(!isMirrored)}
              aria-label="Cerminkan kamera"
              className={cn(
                "px-3 py-2 rounded-xl border-2 transition-all text-xs font-extrabold flex items-center gap-1.5 cursor-pointer",
                isMirrored
                  ? "bg-amber-300 text-zinc-900 border-zinc-900 shadow-[2px_2px_0px_0px_#18181b]"
                  : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:text-white"
              )}
            >
              <FlipHorizontal className="w-4 h-4" strokeWidth={2.25} />
              <span className="hidden sm:inline">Mirror</span>
            </button>

            {/* Device Selector */}
            {availableDevices.length > 1 && (
              <select
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                className="bg-zinc-900 border-2 border-zinc-700 text-zinc-200 text-xs font-bold rounded-xl px-2.5 py-2 focus:outline-none focus:border-amber-300"
              >
                {availableDevices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Center: Big Shutter Trigger Button */}
          <BrutalButton
            variant="primary"
            size="lg"
            onClick={handleStartCaptureCountdown}
            disabled={isCountingDown}
            icon={mode === "ldr" ? <HeartHandshake className="w-5 h-5" strokeWidth={2.25} /> : <Camera className="w-5 h-5" strokeWidth={2.25} />}
            className="px-6 py-2.5 sm:px-10 text-sm sm:text-base font-extrabold shadow-[4px_4px_0px_0px_#18181b]"
          >
            {isCountingDown
              ? `Pose #${activeSlotIndex + 1}...`
              : mode === "ldr"
              ? "Foto Bersama (Sync)"
              : `Ambil Pose #${activeSlotIndex + 1}`}
          </BrutalButton>

          {/* Right: Filters pills */}
          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border-2 border-zinc-800">
            {(["normal", "retro", "bw", "pastel"] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg uppercase cursor-pointer transition-all",
                  filter === f
                    ? "bg-rose-400 text-zinc-900 border border-zinc-900 font-extrabold"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
