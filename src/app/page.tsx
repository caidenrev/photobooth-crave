"use client";

import React, { useState } from "react";
import { useTransitionRouter } from "@/components/layout/TransitionLink";
import {
  Camera,
  HeartHandshake,
  User,
  Users,
  QrCode,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Layers,
  Zap,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  BrutalButton,
  BrutalCard,
  BrutalBadge,
  BrutalModal,
  BrutalInput,
  FallingText,
  PlayfulText,
} from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";

export default function HomePage() {
  const router = useTransitionRouter();
  const { setMode, setRoomId, setUserName } = useAppStore();

  // State for LDR Room Modal
  const [isLdrModalOpen, setIsLdrModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"create" | "join">("create");
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [userNameInput, setUserNameInput] = useState("Kamu");
  const [generatedRoomCode, setGeneratedRoomCode] = useState("");
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Handle Solo Mode
  const handleStartSolo = () => {
    setMode("solo");
    setRoomId(null);
    router.push("/studio");
  };

  // Open LDR Modal & generate initial room code
  const handleOpenLdrModal = () => {
    const randomCode = "LDR-" + Math.random().toString(36).substring(2, 6).toUpperCase();
    setGeneratedRoomCode(randomCode);
    setIsLdrModalOpen(true);
  };

  // Confirm Create Room
  const handleConfirmCreateRoom = () => {
    setMode("ldr");
    setRoomId(generatedRoomCode);
    setUserName(userNameInput || "Host");
    setIsLdrModalOpen(false);
    router.push(`/studio?room=${generatedRoomCode}&role=host`);
  };

  // Confirm Join Room
  const handleConfirmJoinRoom = () => {
    if (!joinCodeInput.trim()) return;
    const cleanCode = joinCodeInput.trim().toUpperCase();
    setMode("ldr");
    setRoomId(cleanCode);
    setUserName(userNameInput || "Partner");
    setIsLdrModalOpen(false);
    router.push(`/studio?room=${cleanCode}&role=partner`);
  };

  // Copy invitation link
  const handleCopyLink = () => {
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/studio?room=${generatedRoomCode}`;
    navigator.clipboard.writeText(url);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-14 flex flex-col gap-12 sm:gap-16 sb-stagger">
        {/* Hero Section */}
        <section className="text-center flex flex-col items-center max-w-3xl mx-auto sb-stagger">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            <BrutalBadge variant="rose" size="md" icon={<HeartHandshake className="w-3.5 h-3.5" strokeWidth={2.25} />}>
              Special LDR & Solo
            </BrutalBadge>
            <BrutalBadge variant="amber" size="md" icon={<QrCode className="w-3.5 h-3.5" strokeWidth={2.25} />}>
              QRIS Semi-Premium
            </BrutalBadge>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-900 leading-[1.1] mb-5">
            <PlayfulText text="Photobooth Estetik untuk" delay={150} wave />{" "}
            <span className="inline-block bg-rose-400 px-3 py-1 rounded-2xl border-2 border-zinc-900 shadow-[3px_3px_0px_0px_#18181b] rotate-[-1deg] sb-float">
              <PlayfulText text="Pasangan LDR" delay={600} wave />
            </span>{" "}
            <PlayfulText text="dan Solo" delay={900} wave />
          </h1>

          <p className="text-base sm:text-lg font-medium text-zinc-700 max-w-2xl leading-relaxed mb-8">
            Abadikan momen intim bersama pasanganmu dari dua tempat berbeda secara sinkron dalam satu lembar photostrip. Coba gratis dengan preview, buka watermark HD via QRIS instan.
          </p>

          {/* Quick Choice Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full text-left sb-stagger">
            {/* Solo Photobooth Card */}
            <BrutalCard
              variant="white"
              interactive
              onClick={handleStartSolo}
              className="group flex flex-col justify-between hover:bg-rose-50/40"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-violet-300 border-2 border-zinc-900 shadow-[2px_2px_0px_0px_#18181b] flex items-center justify-center">
                    <User className="w-6 h-6 text-zinc-900" strokeWidth={2.25} />
                  </div>
                  <BrutalBadge variant="violet" size="sm">
                    Mode Mandiri
                  </BrutalBadge>
                </div>

                <h2 className="text-xl font-extrabold text-zinc-900 mb-2">
                  Mulai Solo Photobooth
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-zinc-600 mb-6">
                  Foto seru sendiri atau bareng teman di satu perangkat. Pilih filter retro, frame estetik, dan ambil 3-4 pose favorit.
                </p>
              </div>

              <div className="pt-4 border-t-2 border-zinc-900 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-zinc-700">
                  Tanpa Registrasi
                </span>
                <BrutalButton
                  variant="violet"
                  size="sm"
                  icon={<ArrowRight className="w-4 h-4" strokeWidth={2.25} />}
                  iconPosition="right"
                >
                  Buka Studio Solo
                </BrutalButton>
              </div>
            </BrutalCard>

            {/* LDR Couple Room Card */}
            <BrutalCard
              variant="white"
              interactive
              onClick={handleOpenLdrModal}
              className="group flex flex-col justify-between hover:bg-rose-50/50 relative overflow-hidden"
            >
              {/* Decorative Accent Ribbon */}
              <div className="absolute top-0 right-0 bg-rose-400 border-b-2 border-l-2 border-zinc-900 px-3 py-0.5 rounded-bl-xl font-mono text-[10px] font-extrabold text-zinc-900 uppercase">
                Paling Favorit
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-400 border-2 border-zinc-900 shadow-[2px_2px_0px_0px_#18181b] flex items-center justify-center">
                    <HeartHandshake className="w-6 h-6 text-zinc-900" strokeWidth={2.25} />
                  </div>
                  <BrutalBadge variant="rose" size="sm">
                    Real-Time Sync
                  </BrutalBadge>
                </div>

                <h2 className="text-xl font-extrabold text-zinc-900 mb-2">
                  Buat / Gabung Room LDR
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-zinc-600 mb-6">
                  Hubungkan 2 kamera dari kota atau negara berbeda. Shutter hitung mundur berjalan serentak, foto langsung menyatu berdampingan.
                </p>
              </div>

              <div className="pt-4 border-t-2 border-zinc-900 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-zinc-700">
                  Kode Room 6 Digit
                </span>
                <BrutalButton
                  variant="primary"
                  size="sm"
                  icon={<Users className="w-4 h-4" strokeWidth={2.25} />}
                  iconPosition="right"
                >
                  Buka Room Berdua
                </BrutalButton>
              </div>
            </BrutalCard>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <BrutalBadge variant="emerald" size="sm" className="mb-2">
                Teknologi Photobooth
              </BrutalBadge>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900">
                <FallingText text="Fitur Unggulan SnapBond" />
              </h2>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-zinc-600 max-w-md">
              Didesain khusus untuk interaksi jarak jauh yang mulus tanpa mengurangi kualitas foto asli.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sb-stagger">
            <BrutalCard variant="cream" className="flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-300 border-2 border-zinc-900 shadow-[2px_2px_0px_0px_#18181b] flex items-center justify-center">
                <Zap className="w-5 h-5 text-zinc-900" strokeWidth={2.25} />
              </div>
              <h3 className="font-extrabold text-base text-zinc-900">
                Synchronized Shutter
              </h3>
              <p className="text-xs font-medium text-zinc-700 leading-relaxed">
                Countdown 3-2-1 dan shutter flash terpicu secara bersamaan di kedua layar tanpa delay.
              </p>
            </BrutalCard>

            <BrutalCard variant="cream" className="flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-400 border-2 border-zinc-900 shadow-[2px_2px_0px_0px_#18181b] flex items-center justify-center">
                <Camera className="w-5 h-5 text-zinc-900" strokeWidth={2.25} />
              </div>
              <h3 className="font-extrabold text-base text-zinc-900">
                High-Res Local Capture
              </h3>
              <p className="text-xs font-medium text-zinc-700 leading-relaxed">
                Tangkapan foto diambil dari sensor kamera lokal langsung, bukan hasil kompresi video call.
              </p>
            </BrutalCard>

            <BrutalCard variant="cream" className="flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-300 border-2 border-zinc-900 shadow-[2px_2px_0px_0px_#18181b] flex items-center justify-center">
                <Layers className="w-5 h-5 text-zinc-900" strokeWidth={2.25} />
              </div>
              <h3 className="font-extrabold text-base text-zinc-900">
                Canvas Watermark
              </h3>
              <p className="text-xs font-medium text-zinc-700 leading-relaxed">
                Pratinjau canvas terenkripsi watermark. Lakukan pembayaran QRIS untuk membuka versi HD murni.
              </p>
            </BrutalCard>

            <BrutalCard variant="cream" className="flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-300 border-2 border-zinc-900 shadow-[2px_2px_0px_0px_#18181b] flex items-center justify-center">
                <QrCode className="w-5 h-5 text-zinc-900" strokeWidth={2.25} />
              </div>
              <h3 className="font-extrabold text-base text-zinc-900">
                QRIS Auto-Unlock
              </h3>
              <p className="text-xs font-medium text-zinc-700 leading-relaxed">
                Scan QRIS dari aplikasi bank/e-wallet apa saja. Kunci foto HD otomatis terbuka untuk kedua pasangan.
              </p>
            </BrutalCard>
          </div>
        </section>

        {/* Pricing & Value Proposition */}
        <section className="bg-white border-2 border-zinc-900 rounded-3xl p-6 sm:p-10 shadow-[6px_6px_0px_0px_#18181b]">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-xl flex flex-col gap-3 text-left">
              <BrutalBadge variant="amber" size="sm" className="w-fit">
                Skema Semi-Premium Transparan
              </BrutalBadge>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
                <FallingText text="Bayar Hanya Saat Puas dengan Hasilnya" />
              </h2>
              <p className="text-sm font-semibold text-zinc-600 leading-relaxed">
                Coba pose berkali-kali bersama pasangan tanpa dipungut biaya. Anda hanya membayar satu kali saat ingin mengunduh photostrip cetak resolusi tinggi tanpa watermark.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={2.25} />
                  <span>Gratis Coba Studio & Preview</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={2.25} />
                  <span>Retake Pose Tidak Terbatas</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={2.25} />
                  <span>QRIS Otomatis Terhubung</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={2.25} />
                  <span>Download HD Tanpa Watermark</span>
                </div>
              </div>
            </div>

            {/* Price Box */}
            <div className="w-full sm:w-auto min-w-[280px] bg-amber-50 border-2 border-zinc-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_#18181b] flex flex-col items-center text-center gap-3">
              <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-zinc-600">
                Tarif Cetak Digital
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-extrabold text-zinc-900">Rp</span>
                <span className="text-4xl sm:text-5xl font-extrabold text-zinc-900 font-mono tracking-tight">
                  15.000
                </span>
              </div>
              <span className="text-xs font-bold text-zinc-700">
                per lembar photostrip (HD)
              </span>

              <BrutalButton
                variant="amber"
                size="md"
                fullWidth
                onClick={handleStartSolo}
                icon={<Camera className="w-4 h-4" strokeWidth={2.25} />}
              >
                Coba Sekarang Gratis
              </BrutalButton>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Modal Buat / Gabung Room LDR */}
      <BrutalModal
        isOpen={isLdrModalOpen}
        onClose={() => setIsLdrModalOpen(false)}
        title="Room Photobooth Pasangan LDR"
        description="Hubungkan dua kamera dari lokasi berbeda secara real-time"
        icon={<HeartHandshake className="w-5 h-5 text-zinc-900" strokeWidth={2.25} />}
      >
        <div className="flex flex-col gap-5 pt-2">
          {/* Sub-tabs Buat vs Gabung */}
          <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-xl border-2 border-zinc-900 gap-1">
            <button
              onClick={() => setModalTab("create")}
              className={`py-2 text-xs font-extrabold rounded-lg transition-all ${
                modalTab === "create"
                  ? "bg-rose-400 text-zinc-900 border-2 border-zinc-900 shadow-[2px_2px_0px_0px_#18181b]"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Buat Room Baru
            </button>
            <button
              onClick={() => setModalTab("join")}
              className={`py-2 text-xs font-extrabold rounded-lg transition-all ${
                modalTab === "join"
                  ? "bg-rose-400 text-zinc-900 border-2 border-zinc-900 shadow-[2px_2px_0px_0px_#18181b]"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Gabung Kode Room
            </button>
          </div>

          <BrutalInput
            label="Nama Panggilan Kamu"
            placeholder="Contoh: Alex, Dinda"
            value={userNameInput}
            onChange={(e) => setUserNameInput(e.target.value)}
          />

          {modalTab === "create" ? (
            <div className="flex flex-col gap-4">
              <div className="p-4 bg-amber-50 rounded-2xl border-2 border-zinc-900 shadow-[2px_2px_0px_0px_#18181b] flex flex-col gap-2">
                <span className="text-xs font-mono font-extrabold text-zinc-600 uppercase">
                  Kode Room Unik Kamu
                </span>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-2xl font-mono font-extrabold tracking-widest text-zinc-900">
                    {generatedRoomCode}
                  </span>
                  <BrutalButton
                    variant="neutral"
                    size="sm"
                    onClick={handleCopyLink}
                    icon={<Copy className="w-3.5 h-3.5" strokeWidth={2.25} />}
                  >
                    {copiedNotification ? "Tersalin" : "Salin Link"}
                  </BrutalButton>
                </div>
                <p className="text-[11px] font-semibold text-zinc-600 mt-1">
                  Kirimkan kode atau tautan ini ke pasanganmu agar bisa masuk ke panggung kamera yang sama.
                </p>
              </div>

              <BrutalButton
                variant="primary"
                size="md"
                fullWidth
                onClick={handleConfirmCreateRoom}
                icon={<ArrowRight className="w-4 h-4" strokeWidth={2.25} />}
                iconPosition="right"
              >
                Masuk ke Studio Room
              </BrutalButton>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <BrutalInput
                label="Masukkan Kode Room (6 Digit)"
                placeholder="Contoh: LDR-892B"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                iconLeft={<Users className="w-4 h-4" strokeWidth={2.25} />}
              />

              <BrutalButton
                variant="primary"
                size="md"
                fullWidth
                onClick={handleConfirmJoinRoom}
                disabled={!joinCodeInput.trim()}
                icon={<ArrowRight className="w-4 h-4" strokeWidth={2.25} />}
                iconPosition="right"
              >
                Gabung ke Room Pasangan
              </BrutalButton>
            </div>
          )}
        </div>
      </BrutalModal>
    </div>
  );
}
