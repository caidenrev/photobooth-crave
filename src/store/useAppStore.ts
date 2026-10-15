import { create } from "zustand";

export type PhotoboothMode = "solo" | "ldr";
export type ConnectionStatus = "idle" | "waiting" | "connected" | "error";

export interface AppState {
  // Session & Room
  mode: PhotoboothMode;
  roomId: string | null;
  partnerName: string | null;
  userName: string;
  connectionStatus: ConnectionStatus;

  // Actions
  setMode: (mode: PhotoboothMode) => void;
  setRoomId: (roomId: string | null) => void;
  setUserName: (name: string) => void;
  setPartnerName: (name: string | null) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  resetSession: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  mode: "solo",
  roomId: null,
  partnerName: null,
  userName: "Kamu",
  connectionStatus: "idle",

  setMode: (mode) => set({ mode }),
  setRoomId: (roomId) => set({ roomId }),
  setUserName: (userName) => set({ userName }),
  setPartnerName: (partnerName) => set({ partnerName }),
  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
  resetSession: () =>
    set({
      mode: "solo",
      roomId: null,
      partnerName: null,
      connectionStatus: "idle",
    }),
}));
