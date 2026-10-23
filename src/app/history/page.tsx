"use client";

import React, { useState } from "react";
import Link from "@/components/layout/TransitionLink";
import {
  Clock,
  Download,
  Camera,
  HeartHandshake,
  User,
  QrCode,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Layers,
  ArrowRight,
  Filter,
} from "lucide-react";
import {
  BrutalButton,
  BrutalCard,
  BrutalBadge,
  BrutalNotificationModal,
  PlayfulText,
} from "@/components/ui";
import { useAuthStore } from "@/store/useAuthStore";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function HistoryPage() {
  const { user, history, markHistoryPaid } = useAuthStore();
  const [filterMode, setFilterMode] = useState<"ALL" | "PAID" | "UNPAID">("ALL");
  const [downloadNotice, setDownloadNotice] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
  });

  const filteredHistory = history.filter((item) => {
    if (filterMode === "PAID") return item.isPaid;
    if (filterMode === "UNPAID") return !item.isPaid;
    return true;
  });

  const handleDownload = (item: (typeof history)[0]) => {
    const link = document.createElement("a");
    link.href = item.hdUrl || item.previewUrl;
    link.download = `SnapBond_${item.roomCode}_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadNotice({
      isOpen: true,
      title: "File Photostrip Sedang Diunduh!",
      message: `File photostrip resolusi tinggi untuk Room ${item.roomCode} sedang disimpan ke perangkatmu.`,
    });
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col gap-8 sb-stagger">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-zinc-900">
          <div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
              <BrutalBadge variant="rose" size="sm">
                Galeri Pribadi
              </BrutalBadge>
              <span className="text-xs font-mono font-bold text-zinc-500">
                {user ? `Akun: ${user.fullName}` : "Sesi Lokal"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              <PlayfulText text="Riwayat Photostrip Kamu" delay={150} />
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-zinc-600 mt-1">
              Koleksi momen manis photobooth bersama pasangan dan foto solo yang tersimpan.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/studio">
              <BrutalButton
                variant="primary"
                size="sm"
                icon={<Camera className="w-4 h-4" strokeWidth={2.25} />}
              >
                Mulai Foto Baru
              </BrutalButton>
            </Link>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "ALL", label: "Semua Foto" },
            { id: "PAID", label: "Lunas (HD 300 DPI)" },
            { id: "UNPAID", label: "Belum Ditebus" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterMode(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterMode === tab.id
                  ? "bg-amber-300 border-zinc-900 text-zinc-900 shadow-[2px_2px_0px_0px_#18181b]"
                  : "bg-white border-zinc-300 text-zinc-600 hover:bg-stone-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Photostrip History Grid */}
        {filteredHistory.length === 0 ? (
          /* Empty State */
          <div className="py-16 flex flex-col items-center justify-center text-center gap-4 bg-white rounded-3xl border-2 border-zinc-900 shadow-[6px_6px_0px_0px_#18181b] p-8 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 border-2 border-zinc-900 shadow-[3px_3px_0px_0px_#18181b] flex items-center justify-center">
              <Clock className="w-8 h-8 text-zinc-900" strokeWidth={2.25} />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-extrabold text-zinc-900">
                Belum Ada Riwayat Foto
              </h2>
              <p className="text-xs font-medium text-zinc-600 max-w-xs">
                Ajak pasangan LDR-mu atau foto solo sekarang di studio photobooth interaktif SnapBond!
              </p>
            </div>
            <Link href="/studio">
              <BrutalButton
                variant="primary"
                size="md"
                icon={<HeartHandshake className="w-4 h-4" strokeWidth={2.25} />}
              >
                Buka Studio Photobooth
              </BrutalButton>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sb-stagger">
            {filteredHistory.map((item) => (
              <BrutalCard
                key={item.id}
                variant="white"
                className="p-5 flex flex-col justify-between gap-4 relative overflow-hidden shadow-[4px_4px_0px_0px_#18181b]"
              >
                {/* Visual Photostrip Card Preview */}
                <div className="w-full h-64 bg-stone-100 rounded-2xl border-2 border-zinc-900 shadow-[2px_2px_0px_0px_#18181b] p-2 flex items-center justify-center overflow-hidden relative">
                  <img
                    src={item.previewUrl}
                    alt={item.frameName}
                    className="h-full w-auto object-contain rounded border border-zinc-300"
                  />
                  <div className="absolute top-3 right-3">
                    {item.isPaid ? (
                      <BrutalBadge variant="emerald" size="sm">
                        <ShieldCheck className="w-3 h-3 mr-1" strokeWidth={2.5} />
                        HD 300 DPI
                      </BrutalBadge>
                    ) : (
                      <BrutalBadge variant="amber" size="sm">
                        Watermark Preview
                      </BrutalBadge>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-base text-zinc-900">
                      {item.frameName}
                    </span>
                    <span className="px-2 py-0.5 bg-stone-100 border border-zinc-900 rounded font-mono text-[10px] font-bold text-zinc-800">
                      {item.roomCode}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
                    <Clock className="w-3.5 h-3.5" strokeWidth={2.25} />
                    <span>{item.createdAt}</span>
                    <span>•</span>
                    <span className="uppercase font-mono">{item.layout}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t-2 border-zinc-200 flex items-center gap-2">
                  {item.isPaid ? (
                    <BrutalButton
                      variant="emerald"
                      size="sm"
                      fullWidth
                      onClick={() => handleDownload(item)}
                      icon={<Download className="w-4 h-4" strokeWidth={2.25} />}
                    >
                      Unduh HD (PNG)
                    </BrutalButton>
                  ) : (
                    <Link href={`/studio?room=${item.roomCode}&role=host`} className="w-full">
                      <BrutalButton
                        variant="amber"
                        size="sm"
                        fullWidth
                        icon={<QrCode className="w-4 h-4" strokeWidth={2.25} />}
                      >
                        Tebus HD Rp15.000
                      </BrutalButton>
                    </Link>
                  )}
                </div>
              </BrutalCard>
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* Notification Modal */}
      <BrutalNotificationModal
        isOpen={downloadNotice.isOpen}
        onClose={() => setDownloadNotice((prev) => ({ ...prev, isOpen: false }))}
        type="success"
        title={downloadNotice.title}
        message={downloadNotice.message}
      />
    </div>
  );
}
