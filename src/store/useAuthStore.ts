import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getCurrentProfile, signOut as supabaseSignOut } from "@/lib/supabaseAuth";

export interface UserSession {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: "user" | "admin";
}

export interface PhotostripHistoryItem {
  id: string;
  orderId?: string;
  roomCode: string;
  mode: "ldr" | "solo";
  layout: "1x3" | "1x4" | "2x2";
  frameName: string;
  previewUrl: string;
  hdUrl?: string;
  isPaid: boolean;
  createdAt: string;
}

interface AuthState {
  user: UserSession | null;
  history: PhotostripHistoryItem[];
  setUser: (user: UserSession | null) => void;
  logout: () => Promise<void>;
  addHistory: (item: PhotostripHistoryItem) => void;
  markHistoryPaid: (idOrOrderId: string, hdUrl?: string) => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: {
        id: "usr_demo_01",
        email: "dinda.rama@snapbond.com",
        fullName: "Rama & Dinda",
        role: "admin",
      },
      history: [
        {
          id: "hist_1",
          orderId: "SB-LDR892B-90214-1",
          roomCode: "LDR-892B",
          mode: "ldr",
          layout: "1x4",
          frameName: "Canva Romantic LDR",
          previewUrl: "/frames/canva_romantic_overlay.svg",
          hdUrl: "/frames/canva_romantic_overlay.svg",
          isPaid: true,
          createdAt: "Hari ini, 10:15 WIB",
        },
        {
          id: "hist_2",
          orderId: "SB-SOLO-90180-1",
          roomCode: "SOLO",
          mode: "solo",
          layout: "1x3",
          frameName: "Warm Cream",
          previewUrl: "/frames/canva_retro_overlay.svg",
          isPaid: false,
          createdAt: "Kemarin, 19:30 WIB",
        },
      ],

      setUser: (user) => set({ user }),

      logout: async () => {
        try {
          await supabaseSignOut();
        } catch (e) {
          console.warn("Supabase signout warning:", e);
        }
        set({ user: null });
      },

      addHistory: (item) =>
        set((state) => ({
          history: [item, ...state.history],
        })),

      markHistoryPaid: (idOrOrderId, hdUrl) =>
        set((state) => ({
          history: state.history.map((h) =>
            h.id === idOrOrderId || h.orderId === idOrOrderId
              ? { ...h, isPaid: true, hdUrl: hdUrl || h.previewUrl }
              : h
          ),
        })),

      fetchUser: async () => {
        try {
          const profile = await getCurrentProfile();
          if (profile) {
            set({
              user: {
                id: profile.id,
                email: profile.email,
                fullName: profile.full_name || profile.email.split("@")[0],
                avatarUrl: profile.avatar_url,
                role: profile.role,
              },
            });
          }
        } catch (e) {
          console.warn("Fetch profile warning:", e);
        }
      },
    }),
    {
      name: "snapbond_user_auth",
    }
  )
);

// Realtime antar-tab: login/logout & riwayat photostrip tersinkron di semua tab
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === "snapbond_user_auth") useAuthStore.persist.rehydrate();
  });
}
