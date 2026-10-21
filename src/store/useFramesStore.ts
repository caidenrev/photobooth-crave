import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface FrameItem {
  id: string;
  name: string;
  bgHex: string;
  textHex: string;
  borderHex: string;
  subTextHex: string;
  isPremium: boolean;
  price: number;
  description: string;
  isActive: boolean;
  overlayUrl?: string; // URL gambar PNG transparan dari Canva (disimpan di Supabase/Local storage)
  designSource?: "canva" | "color";
}

export const INITIAL_FRAMES: FrameItem[] = [
  {
    id: "cream",
    name: "Warm Cream",
    bgHex: "#FFFDF9",
    textHex: "#18181B",
    borderHex: "#18181B",
    subTextHex: "#52525B",
    isPremium: false,
    price: 0,
    description: "Tema signature SnapBond dengan nuansa hangat dan lembut.",
    isActive: true,
    designSource: "color",
  },
  {
    id: "canva-romantic",
    name: "Canva Romantic LDR",
    bgHex: "#FFE4E6",
    textHex: "#9F1239",
    borderHex: "#18181B",
    subTextHex: "#BE123C",
    isPremium: true,
    price: 15000,
    description: "Template Canva bertema stiker cinta LDR dengan border hati dan cutout transparan.",
    isActive: true,
    designSource: "canva",
    overlayUrl: "/frames/canva_romantic_overlay.svg",
  },
  {
    id: "rose",
    name: "Pastel Rose",
    bgHex: "#FECDD3",
    textHex: "#18181B",
    borderHex: "#18181B",
    subTextHex: "#4C0519",
    isPremium: true,
    price: 15000,
    description: "Aksen merah muda manis untuk momen romantis pasangan LDR.",
    isActive: true,
    designSource: "color",
  },
  {
    id: "canva-retro-90s",
    name: "Canva Y2K Neo Cyber",
    bgHex: "#FEF08A",
    textHex: "#713F12",
    borderHex: "#18181B",
    subTextHex: "#854D0E",
    isPremium: true,
    price: 15000,
    description: "Desain Canva retro stiker bintang, sparkle, dan teks bold 90s.",
    isActive: true,
    designSource: "canva",
    overlayUrl: "/frames/canva_retro_overlay.svg",
  },
  {
    id: "amber",
    name: "Warm Amber",
    bgHex: "#FDE68A",
    textHex: "#18181B",
    borderHex: "#18181B",
    subTextHex: "#78350F",
    isPremium: true,
    price: 15000,
    description: "Warna kuning ceria bernuansa retro 90-an.",
    isActive: true,
    designSource: "color",
  },
  {
    id: "violet",
    name: "Soft Violet",
    bgHex: "#DDD6FE",
    textHex: "#18181B",
    borderHex: "#18181B",
    subTextHex: "#4C1D95",
    isPremium: true,
    price: 15000,
    description: "Warna ungu pastel modern yang estetik untuk photostrip.",
    isActive: true,
    designSource: "color",
  },
  {
    id: "emerald",
    name: "Mint Emerald",
    bgHex: "#A7F3D0",
    textHex: "#18181B",
    borderHex: "#18181B",
    subTextHex: "#064E3B",
    isPremium: true,
    price: 15000,
    description: "Warna hijau mint segar dan menenangkan.",
    isActive: true,
    designSource: "color",
  },
  {
    id: "noir",
    name: "Dark Noir",
    bgHex: "#18181B",
    textHex: "#FFFFFF",
    borderHex: "#18181B",
    subTextHex: "#A1A1AA",
    isPremium: true,
    price: 15000,
    description: "Gaya monokrom gelap elegan dan misterius.",
    isActive: true,
    designSource: "color",
  },
];

interface FramesState {
  frames: FrameItem[];
  addFrame: (frame: Omit<FrameItem, "id">) => void;
  updateFrame: (id: string, updates: Partial<FrameItem>) => void;
  toggleFrameActive: (id: string) => void;
  deleteFrame: (id: string) => void;
  resetFrames: () => void;
}

export const useFramesStore = create<FramesState>()(
  persist(
    (set) => ({
      frames: INITIAL_FRAMES,

      addFrame: (frameData) =>
        set((state) => {
          const newId =
            frameData.name.toLowerCase().replace(/[^a-z0-9]/g, "-") +
            "-" +
            Math.floor(100 + Math.random() * 900);
          const newFrame: FrameItem = {
            ...frameData,
            id: newId,
          };
          return { frames: [...state.frames, newFrame] };
        }),

      updateFrame: (id, updates) =>
        set((state) => ({
          frames: state.frames.map((f) =>
            f.id === id ? { ...f, ...updates } : f
          ),
        })),

      toggleFrameActive: (id) =>
        set((state) => ({
          frames: state.frames.map((f) =>
            f.id === id ? { ...f, isActive: !f.isActive } : f
          ),
        })),

      deleteFrame: (id) =>
        set((state) => ({
          frames: state.frames.filter((f) => f.id !== id),
        })),

      resetFrames: () => set({ frames: INITIAL_FRAMES }),
    }),
    {
      name: "snapbond_frames_catalog",
    }
  )
);

// Realtime antar-tab: perubahan katalog di /admin/frames langsung terlihat di studio
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === "snapbond_frames_catalog") useFramesStore.persist.rehydrate();
  });
}
