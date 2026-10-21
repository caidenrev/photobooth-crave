"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  QrCode,
  Clock,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Copy,
  Check,
  RotateCw,
  AlertTriangle,
  RefreshCcw,
  Store,
  WifiOff,
} from "lucide-react";
import {
  BrutalModal,
  BrutalButton,
  BrutalBadge,
  BrutalCard,
} from "@/components/ui";
import {
  paymentService,
  ClientPaymentResponse,
  PaymentStatus,
} from "@/services/paymentService";
import { ldrSignalingService, LdrMessage } from "@/services/ldrSignalingService";
import { cn } from "@/lib/utils";

interface QrisCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId?: string;
  frameId?: string;
  frameName?: string;
  onPaymentSuccess: () => void;
}

export function QrisCheckoutModal({
  isOpen,
  onClose,
  roomId = "SOLO",
  frameId = "cream",
  frameName = "Warm Cream",
  onPaymentSuccess,
}: QrisCheckoutModalProps) {
  const [paymentData, setPaymentData] = useState<ClientPaymentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<PaymentStatus>("pending");
  const [timeLeft, setTimeLeft] = useState<number>(10 * 60); // 10 minutes default
  const [hasCopiedOrderId, setHasCopiedOrderId] = useState(false);
  const [attemptCount, setAttemptCount] = useState<number>(1);
  const [warningNotice, setWarningNotice] = useState<string | null>(null);
  const [isGatewayOffline, setIsGatewayOffline] = useState(false);

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Inisialisasi atau buat tagihan QRIS baru
  const createInvoice = useCallback(
    async (attempt: number = 1) => {
      setIsLoading(true);
      setErrorMessage(null);
      setWarningNotice(null);
      setIsGatewayOffline(false);
      setStatus("pending");

      try {
        const data = await paymentService.createPayment({
          roomId,
          packageId: "HD_WATERMARK_UNLOCK",
          attempt,
          frameName,
        });

        setPaymentData(data);
        setStatus("pending");

        // Hitung sisa detik berdasarkan expires_at
        if (data.expires_at) {
          const diff = Math.max(
            0,
            Math.floor((new Date(data.expires_at).getTime() - Date.now()) / 1000)
          );
          setTimeLeft(diff > 0 ? diff : 10 * 60);
        } else {
          setTimeLeft(10 * 60);
        }
      } catch (err: any) {
        console.error("Gagal membuat tagihan:", err);
        setErrorMessage(
          err?.message || "Pembayaran QRIS sedang tidak tersedia. Mohon coba sesaat lagi."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [roomId]
  );

  // Trigger buat invoice saat modal dibuka
  useEffect(() => {
    if (!isOpen) {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }

    createInvoice(attemptCount);

    // Listener sinkronisasi room jika pasangan di tab/HP lain yang membayar
    const unsubscribe = ldrSignalingService.subscribe((msg: LdrMessage) => {
      if (msg.type === "PAYMENT_SUCCESS") {
        setStatus("paid");
        setTimeout(() => {
          onPaymentSuccess();
          onClose();
        }, 1200);
      }
    });

    return () => {
      unsubscribe();
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isOpen, attemptCount, createInvoice, onPaymentSuccess, onClose]);

  // Timer hitung mundur 1 detik per detik sampai expires_at
  useEffect(() => {
    if (!isOpen || status !== "pending") return;

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          setStatus("expired");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isOpen, status]);

  // Polling status tiap 3 detik dari klien ke server, berhenti saat paid/expired
  useEffect(() => {
    if (!isOpen || !paymentData?.order_id || status !== "pending") return;

    const checkStatusNow = async () => {
      try {
        const res = await paymentService.checkStatus(paymentData.order_id);

        if (res.is_gateway_offline) {
          setIsGatewayOffline(true);
          return;
        } else {
          setIsGatewayOffline(false);
        }

        if (res.is_checking || res.warning) {
          // Warning: tagihan tetap pending, tampilkan "Sedang memeriksa pembayaran…" dan terus coba lagi
          setWarningNotice("Sedang memeriksa pembayaran…");
          return;
        } else {
          setWarningNotice(null);
        }

        if (res.status === "paid") {
          setStatus("paid");
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

          // Siarkan notifikasi pembayaran sukses ke room LDR
          paymentService.broadcastPaymentSuccess(paymentData.order_id, roomId);

          setTimeout(() => {
            onPaymentSuccess();
            onClose();
          }, 1400);
        } else if (res.status === "expired") {
          setStatus("expired");
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        }
      } catch (err: any) {
        console.warn("Polling warning:", err?.message);
      }
    };

    pollingIntervalRef.current = setInterval(checkStatusNow, 3000);

    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, [isOpen, paymentData?.order_id, status, roomId, onPaymentSuccess, onClose]);

  // Format MM:SS
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleCopyOrderId = () => {
    if (!paymentData?.order_id) return;
    navigator.clipboard?.writeText(paymentData.order_id);
    setHasCopiedOrderId(true);
    setTimeout(() => setHasCopiedOrderId(false), 2000);
  };

  // Buat QR Baru saat kedaluwarsa (pakai order_id baru dengan suffix attempt + 1)
  const handleRegenerateQr = () => {
    const nextAttempt = attemptCount + 1;
    setAttemptCount(nextAttempt);
    createInvoice(nextAttempt);
  };

  return (
    <BrutalModal
      isOpen={isOpen}
      onClose={onClose}
      title="Tebus Cetak HD via QRIS"
      description="Scan kode QRIS menggunakan m-Banking (BCA, Mandiri, BRI, BNI) atau e-Wallet (GoPay, OVO, Dana, ShopeePay)."
      icon={<QrCode className="w-5 h-5 text-zinc-900" strokeWidth={2.25} />}
      maxWidth="md"
    >
      <div className="flex flex-col gap-4 py-1">
        {/* Error Notification jika pembuatan tagihan gagal */}
        {errorMessage && (
          <div className="p-3 bg-rose-100 rounded-xl border-2 border-zinc-900 shadow-[2px_2px_0px_0px_#18181b] flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" strokeWidth={2.25} />
            <div className="flex flex-col gap-1">
              <span className="text-xs font-extrabold text-rose-950 uppercase tracking-tight">
                Gagal Memuat QRIS
              </span>
              <p className="text-xs text-rose-800 font-medium leading-relaxed">
                {errorMessage}
              </p>
              <button
                type="button"
                onClick={() => createInvoice(attemptCount)}
                className="mt-1 text-xs font-extrabold text-rose-900 underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCcw className="w-3 h-3" strokeWidth={2.25} />
                Coba Lagi
              </button>
            </div>
          </div>
        )}

        {/* Warning atau Status Offline Gateway (Pesan ramah, jangan anggap gagal) */}
        {(warningNotice || isGatewayOffline) && status === "pending" && (
          <div className="p-2.5 bg-amber-50 rounded-xl border-2 border-zinc-900 shadow-[2px_2px_0px_0px_#18181b] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RotateCw className="w-4 h-4 text-amber-700 animate-spin" strokeWidth={2.25} />
              <span className="text-xs font-bold text-amber-950">
                {warningNotice || "Sedang memeriksa pembayaran…"}
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-800">
              Tetap Terhubung
            </span>
          </div>
        )}

        {/* Top Header Card: Order ID & Countdown */}
        <div className="flex items-center justify-between p-3 bg-stone-100 rounded-xl border-2 border-zinc-900 shadow-[2px_2px_0px_0px_#18181b]">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-600">
              Order ID
            </span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-extrabold text-xs text-zinc-900">
                {paymentData?.order_id || "Membuat Transaksi..."}
              </span>
              {paymentData?.order_id && (
                <button
                  type="button"
                  onClick={handleCopyOrderId}
                  title="Salin Order ID"
                  className="p-1 hover:bg-stone-200 rounded text-zinc-700 cursor-pointer transition-colors"
                >
                  {hasCopiedOrderId ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2.5} />
                  ) : (
                    <Copy className="w-3.5 h-3.5" strokeWidth={2.25} />
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-600">
              Batas Waktu Bayar
            </span>
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-mono font-extrabold",
                status === "expired" ? "text-zinc-500" : "text-rose-600"
              )}
            >
              <Clock className={cn("w-3.5 h-3.5", status === "pending" && "animate-pulse")} strokeWidth={2.25} />
              <span>{status === "expired" ? "00:00 (Kedaluwarsa)" : formatTimer(timeLeft)}</span>
            </div>
          </div>
        </div>

        {/* QR Code Canvas Card */}
        <div className="relative p-5 bg-white border-2 border-zinc-900 rounded-2xl shadow-[4px_4px_0px_0px_#18181b] flex flex-col items-center justify-center">
          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            {status === "paid" ? (
              <BrutalBadge variant="emerald" size="sm">
                <CheckCircle2 className="w-3 h-3 mr-1" strokeWidth={2.5} />
                Lunas
              </BrutalBadge>
            ) : status === "expired" ? (
              <BrutalBadge variant="neutral" size="sm">
                Kedaluwarsa
              </BrutalBadge>
            ) : (
              <BrutalBadge variant="amber" size="sm">
                <RotateCw className="w-3 h-3 mr-1 animate-spin" strokeWidth={2.25} />
                Menunggu Pembayaran
              </BrutalBadge>
            )}
          </div>

          {/* QRIS Official Branding header */}
          <div className="w-full flex items-center justify-between pb-3 mb-2 border-b-2 border-zinc-200">
            <div className="flex items-center gap-1.5">
              <div className="px-2 py-0.5 bg-rose-500 text-white font-black text-[11px] rounded tracking-wider border border-zinc-900">
                QRIS
              </div>
              <span className="text-[11px] font-extrabold tracking-tight text-zinc-900 uppercase">
                GPN Nasional
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-zinc-800">
              <Store className="w-3.5 h-3.5 text-zinc-700" strokeWidth={2.25} />
              <span>SnapBond Studio</span>
            </div>
          </div>

          {/* QR Box Visual */}
          <div className="relative w-52 h-52 bg-white border-2 border-zinc-900 rounded-xl p-2.5 flex items-center justify-center shadow-[2px_2px_0px_0px_#18181b]">
            {isLoading ? (
              <div className="flex flex-col items-center gap-2 text-zinc-500">
                <RotateCw className="w-8 h-8 animate-spin text-zinc-800" strokeWidth={2.25} />
                <span className="text-xs font-bold font-mono">Memuat QRIS Gateway...</span>
              </div>
            ) : status === "paid" ? (
              <div className="flex flex-col items-center gap-2 text-center p-2 sb-pop-in">
                <div className="w-12 h-12 rounded-full bg-emerald-100 border-2 border-zinc-900 flex items-center justify-center shadow-[2px_2px_0px_0px_#18181b]">
                  <Check className="w-7 h-7 text-emerald-600" strokeWidth={3} />
                </div>
                <span className="text-sm font-black text-emerald-900 uppercase tracking-tight">
                  Pembayaran Berhasil!
                </span>
                <span className="text-[11px] font-semibold text-zinc-600">
                  Membuka photostrip HD untuk kedua pasangan...
                </span>
              </div>
            ) : status === "expired" ? (
              <div className="flex flex-col items-center gap-3 text-center p-3">
                <Clock className="w-8 h-8 text-rose-500" strokeWidth={2.25} />
                <span className="text-xs font-bold text-zinc-800">
                  Batas waktu pembayaran telah habis.
                </span>
                <BrutalButton
                  variant="amber"
                  size="sm"
                  onClick={handleRegenerateQr}
                  icon={<RefreshCcw className="w-3.5 h-3.5" strokeWidth={2.25} />}
                >
                  Buat QR Baru
                </BrutalButton>
              </div>
            ) : paymentData?.qris_image_base64 ? (
              // Jika gateway mengembalikan gambar QR base64
              <img
                src={paymentData.qris_image_base64}
                alt="QRIS SnapBond"
                className="w-full h-full object-contain sb-pop-in"
              />
            ) : (
              // Visual Matrix SVG QR Code tajam
              <div className="relative w-full h-full flex items-center justify-center">
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full text-zinc-900"
                  fill="currentColor"
                >
                  <rect x="0" y="0" width="28" height="28" rx="2" />
                  <rect x="4" y="4" width="20" height="20" fill="white" />
                  <rect x="8" y="8" width="12" height="12" rx="1" />

                  <rect x="72" y="0" width="28" height="28" rx="2" />
                  <rect x="76" y="4" width="20" height="20" fill="white" />
                  <rect x="80" y="8" width="12" height="12" rx="1" />

                  <rect x="0" y="72" width="28" height="28" rx="2" />
                  <rect x="4" y="76" width="20" height="20" fill="white" />
                  <rect x="8" y="80" width="12" height="12" rx="1" />

                  <rect x="34" y="4" width="6" height="6" />
                  <rect x="44" y="8" width="6" height="6" />
                  <rect x="54" y="4" width="6" height="6" />
                  <rect x="62" y="10" width="6" height="6" />
                  <rect x="32" y="18" width="6" height="6" />
                  <rect x="48" y="22" width="6" height="6" />
                  <rect x="58" y="18" width="6" height="6" />

                  <rect x="6" y="34" width="6" height="6" />
                  <rect x="18" y="38" width="6" height="6" />
                  <rect x="26" y="34" width="6" height="6" />
                  <rect x="34" y="34" width="6" height="6" />
                  <rect x="42" y="36" width="6" height="6" />
                  <rect x="52" y="34" width="6" height="6" />
                  <rect x="64" y="38" width="6" height="6" />
                  <rect x="74" y="34" width="6" height="6" />
                  <rect x="84" y="38" width="6" height="6" />

                  <rect x="34" y="44" width="8" height="8" />
                  <rect x="46" y="44" width="8" height="8" />
                  <rect x="58" y="44" width="8" height="8" />

                  <rect x="4" y="52" width="6" height="6" />
                  <rect x="16" y="56" width="6" height="6" />
                  <rect x="24" y="52" width="6" height="6" />
                  <rect x="34" y="56" width="6" height="6" />
                  <rect x="44" y="58" width="6" height="6" />
                  <rect x="56" y="54" width="6" height="6" />
                  <rect x="68" y="58" width="6" height="6" />
                  <rect x="78" y="52" width="6" height="6" />
                  <rect x="88" y="56" width="6" height="6" />

                  <rect x="34" y="66" width="6" height="6" />
                  <rect x="44" y="70" width="6" height="6" />
                  <rect x="54" y="66" width="6" height="6" />
                  <rect x="64" y="72" width="6" height="6" />

                  <rect x="34" y="80" width="6" height="6" />
                  <rect x="48" y="84" width="6" height="6" />
                  <rect x="62" y="80" width="6" height="6" />
                  <rect x="74" y="82" width="6" height="6" />
                  <rect x="86" y="80" width="6" height="6" />
                </svg>

                <div className="absolute inset-0 m-auto w-10 h-10 bg-amber-300 border-2 border-zinc-900 rounded-lg flex items-center justify-center shadow-[1.5px_1.5px_0px_0px_#18181b]">
                  <Sparkles className="w-5 h-5 text-zinc-900" strokeWidth={2.5} />
                </div>
              </div>
            )}
          </div>

          <span className="text-[11px] font-mono font-bold text-zinc-600 mt-2">
            Penyedia Layanan: Crave Payment Gateway
          </span>
        </div>

        {/* Pricing Breakdown: Nominal Besar */}
        <div className="p-3 bg-amber-50 rounded-xl border-2 border-zinc-900 shadow-[2px_2px_0px_0px_#18181b] flex flex-col gap-1.5 text-xs">
          <div className="flex justify-between items-center text-zinc-700">
            <span>Paket Cetak HD (300 DPI):</span>
            <span className="font-mono font-bold">Rp15.000</span>
          </div>
          <div className="flex justify-between items-center text-zinc-700">
            <span>Tema Frame:</span>
            <span className="font-bold text-zinc-900">{frameName}</span>
          </div>
          <div className="flex justify-between items-center text-zinc-700">
            <span>Akses Cetak Kedua Pasangan:</span>
            <span className="font-bold text-emerald-700 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2.25} />
              Otomatis Terbuka Berdua
            </span>
          </div>

          {/* Nominal Besar */}
          <div className="pt-2 border-t-2 border-zinc-900 flex justify-between items-baseline font-extrabold text-zinc-900">
            <span className="text-xs uppercase tracking-wider">Total Tagihan:</span>
            <span className="text-2xl font-mono text-zinc-900 font-black">
              Rp15.000
            </span>
          </div>
        </div>

        {/* Action Button: Tutup Modal */}
        <div className="flex justify-end pt-1">
          <BrutalButton variant="neutral" size="sm" onClick={onClose}>
            Tutup Modal
          </BrutalButton>
        </div>
      </div>
    </BrutalModal>
  );
}
