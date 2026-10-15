"use client";

import React, { useState, useRef } from "react";
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Check,
  Palette,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Tag,
  ToggleLeft,
  ToggleRight,
  Upload,
  Image as ImageIcon,
  HelpCircle,
  FileUp,
} from "lucide-react";
import {
  BrutalCard,
  BrutalBadge,
  BrutalButton,
  BrutalInput,
  BrutalModal,
  BrutalNotificationModal,
} from "@/components/ui";
import { useFramesStore, FrameItem } from "@/store/useFramesStore";

export default function AdminFramesPage() {
  const {
    frames,
    addFrame,
    updateFrame,
    toggleFrameActive,
    deleteFrame,
    resetFrames,
  } = useFramesStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFrameId, setEditingFrameId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [designSource, setDesignSource] = useState<"canva" | "color">("canva");
  const [overlayUrl, setOverlayUrl] = useState<string>("");
  const [bgHex, setBgHex] = useState("#FFFDF9");
  const [textHex, setTextHex] = useState("#18181B");
  const [borderHex, setBorderHex] = useState("#18181B");
  const [subTextHex, setSubTextHex] = useState("#52525B");
  const [isPremium, setIsPremium] = useState(true);
  const [price, setPrice] = useState(15000);
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notification State
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
  });

  const handleOpenAddModal = () => {
    setEditingFrameId(null);
    setName("");
    setDesignSource("canva");
    setOverlayUrl("");
    setBgHex("#FFF1F2");
    setTextHex("#18181B");
    setBorderHex("#18181B");
    setSubTextHex("#52525B");
    setIsPremium(true);
    setPrice(15000);
    setDescription("");
    setUploadError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (frame: FrameItem) => {
    setEditingFrameId(frame.id);
    setName(frame.name);
    setDesignSource(frame.overlayUrl ? "canva" : "color");
    setOverlayUrl(frame.overlayUrl || "");
    setBgHex(frame.bgHex);
    setTextHex(frame.textHex);
    setBorderHex(frame.borderHex);
    setSubTextHex(frame.subTextHex);
    setIsPremium(frame.isPremium);
    setPrice(frame.price);
    setDescription(frame.description);
    setUploadError(null);
    setIsModalOpen(true);
  };

  // Upload handler ke /api/frames/upload (Supabase / Local public storage)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("frame_id", editingFrameId || "custom");

    try {
      const res = await fetch("/api/frames/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal mengunggah file frame.");
      }

      setOverlayUrl(data.url);
      setDesignSource("canva");
      if (!name) {
        setName(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
      }
    } catch (err: any) {
      setUploadError(err?.message || "Gagal mengunggah gambar frame.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveFrame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const frameData = {
      name,
      bgHex,
      textHex,
      borderHex,
      subTextHex,
      isPremium,
      price: isPremium ? price : 0,
      description: description || "Tema photostrip kustom SnapBond.",
      overlayUrl: designSource === "canva" && overlayUrl ? overlayUrl : undefined,
      designSource,
    };

    if (editingFrameId) {
      updateFrame(editingFrameId, frameData);
      setNotification({
        isOpen: true,
        title: "Frame Berhasil Diperbarui!",
        message: `Katalog frame "${name}" telah diperbarui dan langsung tersinkronisasi ke studio client.`,
      });
    } else {
      addFrame({
        ...frameData,
        isActive: true,
      });
      setNotification({
        isOpen: true,
        title: "Frame Baru Ditambahkan!",
        message: `Frame "${name}" kini aktif dan dapat langsung dipilih oleh pengguna di studio.`,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BrutalBadge variant="violet" size="sm">
              Katalog & CMS
            </BrutalBadge>
            <span className="text-xs font-mono font-bold text-zinc-500">
              Sinkron ke /studio & Supabase
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
            Katalog Frame & Manajemen Desain Canva
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <BrutalButton
            variant="neutral"
            size="sm"
            onClick={resetFrames}
            icon={<RotateCcw className="w-3.5 h-3.5" strokeWidth={2.25} />}
          >
            Reset Default
          </BrutalButton>
          <BrutalButton
            variant="violet"
            size="sm"
            onClick={handleOpenAddModal}
            icon={<Plus className="w-3.5 h-3.5" strokeWidth={2.25} />}
          >
            Tambah Frame Canva Baru
          </BrutalButton>
        </div>
      </div>

      {/* Canva Design Guide Info Banner */}
      <div className="p-4 bg-amber-100 rounded-2xl border-2 border-zinc-900 shadow-[3px_3px_0px_0px_#18181b] flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-white border-2 border-zinc-900 flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#18181b]">
          <FileUp className="w-5 h-5 text-zinc-900" strokeWidth={2.25} />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-tight text-zinc-900">
              Panduan Format Desain Canva
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-300 border border-zinc-900 text-[10px] font-mono font-bold text-zinc-900">
              PNG Transparan
            </span>
          </div>
          <p className="text-xs text-zinc-700 font-medium leading-relaxed">
            Buat desain bingkai di Canva dengan ukuran kanvas <strong>600 × 1850 px</strong> (untuk strip 1x4) atau <strong>600 × 1450 px</strong> (untuk strip 1x3). Biarkan area tempat foto transparan/kosong, lalu unduh dengan opsi <strong>&quot;Transparent background&quot; (PNG)</strong> sebelum mengunggahnya ke sini.
          </p>
        </div>
      </div>

      {/* Frame Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {frames.map((frame) => {
          const isCanva = frame.overlayUrl || frame.designSource === "canva";
          return (
            <BrutalCard
              key={frame.id}
              variant="white"
              className="p-5 flex flex-col justify-between gap-4 relative overflow-hidden"
            >
              {/* Top Frame Preview Card Box */}
              <div className="flex flex-col gap-3">
                <div
                  style={{ backgroundColor: frame.bgHex }}
                  className="w-full h-36 rounded-2xl border-2 border-zinc-900 shadow-[3px_3px_0px_0px_#18181b] p-3 flex flex-col justify-between relative overflow-hidden transition-transform hover:scale-[1.02]"
                >
                  {/* If Canva overlay exists, show the overlay graphic */}
                  {frame.overlayUrl && (
                    <img
                      src={frame.overlayUrl}
                      alt={frame.name}
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
                    />
                  )}

                  {/* Header Strip inside preview */}
                  <div className="flex items-center justify-between relative z-0">
                    <span
                      style={{ color: frame.textHex }}
                      className="font-extrabold text-xs tracking-tight uppercase"
                    >
                      SNAPBOND
                    </span>
                    <div
                      style={{ backgroundColor: frame.textHex, color: frame.bgHex }}
                      className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold"
                    >
                      {isCanva ? "CANVA" : "COLOR"}
                    </div>
                  </div>

                  {/* Simulated photo slots in preview */}
                  <div className="grid grid-cols-2 gap-1.5 opacity-60 relative z-0">
                    <div className="h-12 rounded border border-zinc-900 bg-white/70"></div>
                    <div className="h-12 rounded border border-zinc-900 bg-white/70"></div>
                  </div>

                  {/* Footer Strip in preview */}
                  <div
                    style={{ color: frame.subTextHex }}
                    className="text-[9px] font-mono font-bold text-center relative z-0"
                  >
                    {frame.name}
                  </div>
                </div>

                {/* Frame Info & Badges */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-extrabold text-base text-zinc-900 tracking-tight">
                        {frame.name}
                      </h3>
                      {isCanva && (
                        <BrutalBadge variant="violet" size="sm">
                          Canva
                        </BrutalBadge>
                      )}
                    </div>
                    <span className="text-[11px] font-mono font-bold text-zinc-500">
                      ID: {frame.id}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {frame.isPremium ? (
                      <BrutalBadge variant="amber" size="sm">
                        <Sparkles className="w-3 h-3 mr-1" strokeWidth={2.25} />
                        Rp{frame.price.toLocaleString("id-ID")}
                      </BrutalBadge>
                    ) : (
                      <BrutalBadge variant="emerald" size="sm">
                        Gratis
                      </BrutalBadge>
                    )}
                    {frame.isActive ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Aktif di Studio"></span>
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-zinc-300" title="Nonaktif"></span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed font-medium">
                  {frame.description}
                </p>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t-2 border-zinc-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => toggleFrameActive(frame.id)}
                  className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 hover:text-zinc-950 cursor-pointer"
                >
                  {frame.isActive ? (
                    <ToggleRight className="w-4 h-4 text-emerald-600" strokeWidth={2.25} />
                  ) : (
                    <ToggleLeft className="w-4 h-4 text-zinc-400" strokeWidth={2.25} />
                  )}
                  <span>{frame.isActive ? "Tampil di Studio" : "Disembunyikan"}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(frame)}
                    title="Edit Frame"
                    className="p-1.5 bg-stone-100 hover:bg-stone-200 rounded-lg border border-zinc-900 text-zinc-800 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" strokeWidth={2.25} />
                  </button>
                  {!["cream", "rose", "amber"].includes(frame.id) && (
                    <button
                      type="button"
                      onClick={() => deleteFrame(frame.id)}
                      title="Hapus Frame"
                      className="p-1.5 bg-rose-100 hover:bg-rose-200 rounded-lg border border-zinc-900 text-rose-800 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={2.25} />
                    </button>
                  )}
                </div>
              </div>
            </BrutalCard>
          );
        })}
      </div>

      {/* Modal Tambah / Edit Frame Canva */}
      <BrutalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFrameId ? "Edit Konfigurasi Frame" : "Tambah Frame Desain Canva"}
        description="Unggah file desain PNG transparan dari Canva atau konfigurasikan warna tema photostrip."
        icon={<Palette className="w-5 h-5 text-zinc-900" strokeWidth={2.25} />}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveFrame} className="flex flex-col gap-4 py-2">
          {/* Tipe Sumber Desain (Canva vs Warna Polos) */}
          <div className="flex items-center justify-between p-2.5 bg-stone-100 rounded-xl border-2 border-zinc-900">
            <span className="text-xs font-extrabold uppercase text-zinc-800">
              Format Desain:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDesignSource("canva")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all cursor-pointer ${
                  designSource === "canva"
                    ? "bg-violet-300 border-zinc-900 text-zinc-950 shadow-[2px_2px_0px_0px_#18181b]"
                    : "bg-white border-zinc-300 text-zinc-600"
                }`}
              >
                Upload Desain Canva (PNG)
              </button>
              <button
                type="button"
                onClick={() => setDesignSource("color")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all cursor-pointer ${
                  designSource === "color"
                    ? "bg-amber-300 border-zinc-900 text-zinc-950 shadow-[2px_2px_0px_0px_#18181b]"
                    : "bg-white border-zinc-300 text-zinc-600"
                }`}
              >
                Warna Polos / Solid
              </button>
            </div>
          </div>

          {/* Area Upload File Canva */}
          {designSource === "canva" && (
            <div className="p-4 bg-violet-50 rounded-2xl border-2 border-zinc-900 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-violet-800" strokeWidth={2.25} />
                  <span className="text-xs font-extrabold uppercase text-violet-950">
                    File Desain Canva (PNG Transparan)
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-violet-700">
                  Cloud Storage
                </span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/webp,image/svg+xml"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-4 border-2 border-dashed border-violet-400 bg-white rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-violet-100/50 transition-colors"
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2 py-2">
                    <span className="text-xs font-bold font-mono text-zinc-700 animate-pulse">
                      Mengunggah ke Storage...
                    </span>
                  </div>
                ) : overlayUrl ? (
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-12 h-16 bg-stone-100 rounded border border-zinc-900 overflow-hidden flex items-center justify-center shrink-0">
                      <img src={overlayUrl} alt="Preview" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex flex-col flex-1 overflow-hidden">
                      <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2.5} />
                        File Canva Siap Digunakan
                      </span>
                      <span className="text-[11px] font-mono text-zinc-500 truncate">
                        {overlayUrl}
                      </span>
                      <span className="text-[10px] text-zinc-600 font-semibold underline mt-1">
                        Klik untuk mengganti file
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-center py-2">
                    <div className="w-10 h-10 rounded-xl bg-violet-200 border-2 border-zinc-900 flex items-center justify-center shadow-[1.5px_1.5px_0px_0px_#18181b]">
                      <Upload className="w-5 h-5 text-violet-900" strokeWidth={2.25} />
                    </div>
                    <span className="text-xs font-bold text-zinc-800">
                      Klik untuk memilih file PNG dari Canva
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      Mendukung PNG transparan, WebP, SVG (Maks. 10MB)
                    </span>
                  </div>
                )}
              </div>

              {uploadError && (
                <p className="text-xs font-bold text-rose-600">{uploadError}</p>
              )}
            </div>
          )}

          {/* Nama Frame */}
          <div>
            <label className="block text-xs font-extrabold uppercase text-zinc-800 mb-1">
              Nama Frame
            </label>
            <BrutalInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Canva Y2K Retro, Canva Pink Romantic..."
              required
            />
          </div>

          {/* Color Palettes Selection (Background & Text) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-extrabold uppercase text-zinc-800 mb-1">
                Warna Dasar Latar (Hex)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgHex}
                  onChange={(e) => setBgHex(e.target.value)}
                  className="w-10 h-10 rounded-lg border-2 border-zinc-900 cursor-pointer p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={bgHex}
                  onChange={(e) => setBgHex(e.target.value)}
                  className="w-full px-2.5 py-1.5 font-mono text-xs border-2 border-zinc-900 rounded-lg bg-stone-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase text-zinc-800 mb-1">
                Warna Teks & Border (Hex)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={textHex}
                  onChange={(e) => {
                    setTextHex(e.target.value);
                    setBorderHex(e.target.value);
                  }}
                  className="w-10 h-10 rounded-lg border-2 border-zinc-900 cursor-pointer p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={textHex}
                  onChange={(e) => {
                    setTextHex(e.target.value);
                    setBorderHex(e.target.value);
                  }}
                  className="w-full px-2.5 py-1.5 font-mono text-xs border-2 border-zinc-900 rounded-lg bg-stone-50"
                />
              </div>
            </div>
          </div>

          {/* Tipe Frame & Harga */}
          <div className="p-3 bg-amber-50 rounded-xl border-2 border-zinc-900 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-800">Tipe Paket:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPremium(false)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border-2 cursor-pointer ${
                    !isPremium
                      ? "bg-emerald-300 border-zinc-900 text-zinc-900 shadow-[1.5px_1.5px_0px_0px_#18181b]"
                      : "bg-white border-zinc-300 text-zinc-600"
                  }`}
                >
                  Gratis
                </button>
                <button
                  type="button"
                  onClick={() => setIsPremium(true)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border-2 cursor-pointer ${
                    isPremium
                      ? "bg-amber-300 border-zinc-900 text-zinc-900 shadow-[1.5px_1.5px_0px_0px_#18181b]"
                      : "bg-white border-zinc-300 text-zinc-600"
                  }`}
                >
                  Semi-Premium
                </button>
              </div>
            </div>

            {isPremium && (
              <div className="flex items-center justify-between pt-2 border-t border-zinc-300">
                <span className="text-xs font-bold text-zinc-800">
                  Harga Tebus Cetak HD (Rupiah):
                </span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  min={1000}
                  step={1000}
                  className="w-28 px-2 py-1 font-mono font-bold text-xs border-2 border-zinc-900 rounded-lg bg-white text-right"
                />
              </div>
            )}
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-xs font-extrabold uppercase text-zinc-800 mb-1">
              Deskripsi Tema
            </label>
            <BrutalInput
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi tema untuk ditampilkan di studio..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <BrutalButton
              variant="neutral"
              size="sm"
              type="button"
              onClick={() => setIsModalOpen(false)}
            >
              Batal
            </BrutalButton>
            <BrutalButton
              variant="violet"
              size="sm"
              type="submit"
              disabled={isUploading}
              icon={<Check className="w-4 h-4" strokeWidth={2.25} />}
            >
              Simpan Frame
            </BrutalButton>
          </div>
        </form>
      </BrutalModal>

      {/* Success Notification Modal */}
      <BrutalNotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification((prev) => ({ ...prev, isOpen: false }))}
        type="success"
        title={notification.title}
        message={notification.message}
      />
    </div>
  );
}
