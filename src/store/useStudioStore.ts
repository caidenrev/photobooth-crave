import { create } from "zustand";

export type StripLayout = "1x3" | "1x4" | "2x2";
export type FilterType = "normal" | "retro" | "bw" | "pastel";
export type PartnerConnectionStatus = "waiting" | "connected" | "stable";

export interface FrameThemeConfig {
  id: string;
  name: string;
  bgHex: string;
  textHex: string;
  borderHex: string;
  subTextHex: string;
}

export const FRAME_THEMES: Record<string, FrameThemeConfig> = {
  cream: {
    id: "cream",
    name: "Warm Cream",
    bgHex: "#FFFDF9",
    textHex: "#18181B",
    borderHex: "#18181B",
    subTextHex: "#52525B",
  },
  rose: {
    id: "rose",
    name: "Pastel Rose",
    bgHex: "#FECDD3",
    textHex: "#18181B",
    borderHex: "#18181B",
    subTextHex: "#4C0519",
  },
  amber: {
    id: "amber",
    name: "Warm Amber",
    bgHex: "#FDE68A",
    textHex: "#18181B",
    borderHex: "#18181B",
    subTextHex: "#78350F",
  },
  violet: {
    id: "violet",
    name: "Soft Violet",
    bgHex: "#DDD6FE",
    textHex: "#18181B",
    borderHex: "#18181B",
    subTextHex: "#4C1D95",
  },
  emerald: {
    id: "emerald",
    name: "Mint Emerald",
    bgHex: "#A7F3D0",
    textHex: "#18181B",
    borderHex: "#18181B",
    subTextHex: "#064E3B",
  },
  noir: {
    id: "noir",
    name: "Dark Noir",
    bgHex: "#18181B",
    textHex: "#FFFFFF",
    borderHex: "#FFFFFF",
    subTextHex: "#A1A1AA",
  },
};

export interface LdrSlotPhoto {
  local: string | null;
  partner: string | null;
}

export interface StudioState {
  // Photos & Layout
  layout: StripLayout;
  photos: (string | null)[];
  ldrPhotos: LdrSlotPhoto[];
  activeSlotIndex: number;

  // LDR Peer Connection
  partnerStatus: PartnerConnectionStatus;
  partnerName: string | null;
  isSimulatedPartner: boolean;

  // Camera Settings
  selectedDeviceId: string;
  availableDevices: { deviceId: string; label: string }[];
  isMirrored: boolean;
  filter: FilterType;

  // Customization & Branding
  frameTheme: string;
  stripTitle: string;
  stripDate: string;
  selectedSticker: string | null;

  // Payment & Watermark
  isPaid: boolean;

  // Shutter & Countdown Animation
  isCountingDown: boolean;
  countdownValue: number | null;
  triggerFlash: boolean;

  // Actions
  setLayout: (layout: StripLayout) => void;
  setPhoto: (index: number, dataUrl: string) => void;
  setLdrPhoto: (index: number, payload: Partial<LdrSlotPhoto>) => void;
  setAllPhotos: (photos: (string | null)[]) => void;
  retakeSlot: (index: number) => void;
  clearAllPhotos: () => void;
  nextSlotAfterCapture: () => void;

  setPartnerStatus: (status: PartnerConnectionStatus) => void;
  setPartnerName: (name: string | null) => void;
  setIsSimulatedPartner: (simulated: boolean) => void;

  setSelectedDeviceId: (id: string) => void;
  setAvailableDevices: (devices: { deviceId: string; label: string }[]) => void;
  setIsMirrored: (mirrored: boolean) => void;
  setFilter: (filter: FilterType) => void;

  setFrameTheme: (theme: string) => void;
  setStripTitle: (title: string) => void;
  setSelectedSticker: (sticker: string | null) => void;

  setIsPaid: (paid: boolean) => void;

  setCountdown: (value: number | null) => void;
  setIsCountingDown: (counting: boolean) => void;
  setTriggerFlash: (flash: boolean) => void;
}

const getInitialSlots = (layout: StripLayout) => {
  const count = layout === "1x3" ? 3 : 4;
  return new Array(count).fill(null);
};

const getInitialLdrSlots = (layout: StripLayout): LdrSlotPhoto[] => {
  const count = layout === "1x3" ? 3 : 4;
  return Array.from({ length: count }, () => ({ local: null, partner: null }));
};

export const useStudioStore = create<StudioState>((set, get) => ({
  layout: "1x4",
  photos: getInitialSlots("1x4"),
  ldrPhotos: getInitialLdrSlots("1x4"),
  activeSlotIndex: 0,

  partnerStatus: "waiting",
  partnerName: null,
  isSimulatedPartner: false,

  selectedDeviceId: "",
  availableDevices: [],
  isMirrored: true,
  filter: "normal",

  frameTheme: "cream",
  stripTitle: "SNAPBOND",
  stripDate: "OCT 2026",
  selectedSticker: null,

  isPaid: false,

  isCountingDown: false,
  countdownValue: null,
  triggerFlash: false,

  setLayout: (layout) => {
    const currentPhotos = get().photos;
    const currentLdr = get().ldrPhotos;
    const targetCount = layout === "1x3" ? 3 : 4;

    let newPhotos: (string | null)[] = [];
    if (currentPhotos.length >= targetCount) {
      newPhotos = currentPhotos.slice(0, targetCount);
    } else {
      newPhotos = [...currentPhotos, ...new Array(targetCount - currentPhotos.length).fill(null)];
    }

    let newLdr: LdrSlotPhoto[] = [];
    if (currentLdr.length >= targetCount) {
      newLdr = currentLdr.slice(0, targetCount);
    } else {
      const extra = Array.from({ length: targetCount - currentLdr.length }, () => ({
        local: null,
        partner: null,
      }));
      newLdr = [...currentLdr, ...extra];
    }

    set({
      layout,
      photos: newPhotos,
      ldrPhotos: newLdr,
      activeSlotIndex: Math.min(get().activeSlotIndex, targetCount - 1),
    });
  },

  setPhoto: (index, dataUrl) => {
    const photos = [...get().photos];
    photos[index] = dataUrl;
    set({ photos });
  },

  setLdrPhoto: (index, payload) => {
    const ldrPhotos = [...get().ldrPhotos];
    const currentSlot = ldrPhotos[index] || { local: null, partner: null };
    ldrPhotos[index] = {
      local: payload.local !== undefined ? payload.local : currentSlot.local,
      partner: payload.partner !== undefined ? payload.partner : currentSlot.partner,
    };
    set({ ldrPhotos });
  },

  setAllPhotos: (photos) => set({ photos }),

  retakeSlot: (index) => {
    const photos = [...get().photos];
    photos[index] = null;

    const ldrPhotos = [...get().ldrPhotos];
    if (ldrPhotos[index]) {
      ldrPhotos[index] = { local: null, partner: null };
    }

    set({ photos, ldrPhotos, activeSlotIndex: index });
  },

  clearAllPhotos: () => {
    const targetCount = get().layout === "1x3" ? 3 : 4;
    set({
      photos: new Array(targetCount).fill(null),
      ldrPhotos: getInitialLdrSlots(get().layout),
      activeSlotIndex: 0,
    });
  },

  nextSlotAfterCapture: () => {
    const maxSlots = get().layout === "1x3" ? 3 : 4;
    const current = get().activeSlotIndex;
    const photos = get().photos;
    let nextIdx = -1;
    for (let i = 0; i < maxSlots; i++) {
      if (!photos[i]) {
        nextIdx = i;
        break;
      }
    }
    if (nextIdx !== -1) {
      set({ activeSlotIndex: nextIdx });
    } else if (current + 1 < maxSlots) {
      set({ activeSlotIndex: current + 1 });
    }
  },

  setPartnerStatus: (partnerStatus) => set({ partnerStatus }),
  setPartnerName: (partnerName) => set({ partnerName }),
  setIsSimulatedPartner: (isSimulatedPartner) => set({ isSimulatedPartner }),

  setSelectedDeviceId: (selectedDeviceId) => set({ selectedDeviceId }),
  setAvailableDevices: (availableDevices) => set({ availableDevices }),
  setIsMirrored: (isMirrored) => set({ isMirrored }),
  setFilter: (filter) => set({ filter }),

  setFrameTheme: (frameTheme) => set({ frameTheme }),
  setStripTitle: (stripTitle) => set({ stripTitle }),
  setSelectedSticker: (selectedSticker) => set({ selectedSticker }),

  setIsPaid: (isPaid) => set({ isPaid }),

  setCountdown: (countdownValue) => set({ countdownValue }),
  setIsCountingDown: (isCountingDown) => set({ isCountingDown }),
  setTriggerFlash: (triggerFlash) => set({ triggerFlash }),
}));
