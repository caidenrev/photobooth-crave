import { useEffect } from "react";
import { create } from "zustand";
import { supabase } from "@/lib/supabaseClient";

export type AdminTxStatus = "pending" | "paid" | "expired" | "failed";

export interface AdminTransaction {
  order_id: string;
  room_id: string;
  mode: "LDR" | "Solo";
  frame_name: string;
  amount: number;
  status: AdminTxStatus;
  payment_type?: string;
  created_at: string;
  paid_at?: string;
  updated_at: string;
}

export interface AdminSummary {
  totalRevenueToday: number;
  revenueGrowthPct: number | null;
  photostripsRedeemed: number;
  avgPerHour: number;
  paidCount: number;
  totalSessions: number;
  paidConversionRate: number;
  pendingCount: number;
  activeLdrRooms: number;
}

export interface DayRevenue {
  day: string;
  date: string;
  revenue: number;
  count: number;
}

interface AdminLiveState {
  transactions: AdminTransaction[];
  summary: AdminSummary | null;
  weeklyTrend: DayRevenue[];
  serverTime: number | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  /** order_id yang baru berubah — dipakai untuk animasi highlight */
  changedIds: Record<string, true>;
  refresh: () => Promise<void>;
  manualUnlock: (orderId: string) => Promise<{ ok: boolean; message: string }>;
}

const POLL_INTERVAL_MS = 5000;
const FLASH_DURATION_MS = 1500;

let inFlight: Promise<void> | null = null;

export const useAdminLiveStore = create<AdminLiveState>((set, get) => ({
  transactions: [],
  summary: null,
  weeklyTrend: [],
  serverTime: null,
  isLoading: true,
  isRefreshing: false,
  error: null,
  changedIds: {},

  refresh: () => {
    if (inFlight) return inFlight;
    set({ isRefreshing: true });

    inFlight = (async () => {
      try {
        const res = await fetch("/api/admin/transactions", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Gagal memuat data transaksi.");
        }

        const prev = get();
        const changed: Record<string, true> = {};
        if (!prev.isLoading) {
          const prevById = new Map(prev.transactions.map((t) => [t.order_id, t]));
          for (const tx of data.transactions as AdminTransaction[]) {
            const old = prevById.get(tx.order_id);
            if (!old || old.status !== tx.status || old.updated_at !== tx.updated_at) {
              changed[tx.order_id] = true;
            }
          }
        }

        set({
          transactions: data.transactions,
          summary: data.summary,
          weeklyTrend: data.weeklyRevenueTrend,
          serverTime: new Date(data.serverTime).getTime(),
          isLoading: false,
          error: null,
          changedIds: { ...prev.changedIds, ...changed },
        });

        const changedKeys = Object.keys(changed);
        if (changedKeys.length > 0) {
          setTimeout(() => {
            const next = { ...get().changedIds };
            changedKeys.forEach((k) => delete next[k]);
            set({ changedIds: next });
          }, FLASH_DURATION_MS);
        }
      } catch (err) {
        set({
          isLoading: false,
          error: err instanceof Error ? err.message : "Koneksi ke server terputus.",
        });
      } finally {
        set({ isRefreshing: false });
        inFlight = null;
      }
    })();

    return inFlight;
  },

  manualUnlock: async (orderId) => {
    const snapshot = get().transactions;
    // Optimistic update: tombol langsung terasa responsif
    set({
      transactions: snapshot.map((t) =>
        t.order_id === orderId ? { ...t, status: "paid" } : t
      ),
    });

    try {
      const res = await fetch("/api/admin/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "manual_unlock", order_id: orderId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal membuka kunci pesanan.");
      }
      await get().refresh();
      return { ok: true, message: data.message as string };
    } catch (err) {
      set({ transactions: snapshot });
      get().refresh();
      return {
        ok: false,
        message: err instanceof Error ? err.message : "Gagal membuka kunci pesanan.",
      };
    }
  },
}));

// Ref-count supaya beberapa komponen (layout + halaman) berbagi satu polling
let subscribers = 0;
let stopLive: (() => void) | null = null;

function startLive(): () => void {
  const { refresh } = useAdminLiveStore.getState();
  refresh();

  const interval = setInterval(() => {
    if (document.visibilityState === "visible") refresh();
  }, POLL_INTERVAL_MS);

  const onVisible = () => {
    if (document.visibilityState === "visible") refresh();
  };
  document.addEventListener("visibilitychange", onVisible);
  window.addEventListener("focus", onVisible);

  // Push instan dari Supabase Realtime bila tabel payments tersedia;
  // polling di atas tetap jadi fallback.
  const channel = supabase
    ?.channel("admin-payments-live")
    .on("postgres_changes", { event: "*", schema: "public", table: "payments" }, () =>
      refresh()
    )
    .subscribe();

  return () => {
    clearInterval(interval);
    document.removeEventListener("visibilitychange", onVisible);
    window.removeEventListener("focus", onVisible);
    if (channel) supabase?.removeChannel(channel);
  };
}

/** Berlangganan data admin realtime selama komponen ter-mount. */
export function useAdminLiveData() {
  useEffect(() => {
    subscribers += 1;
    if (subscribers === 1) stopLive = startLive();
    return () => {
      subscribers -= 1;
      if (subscribers === 0) {
        stopLive?.();
        stopLive = null;
      }
    };
  }, []);

  return useAdminLiveStore();
}

export function formatRelativeTime(iso: string, now: number | null): string {
  const diffMs = (now ?? new Date(iso).getTime()) - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  return `${Math.floor(hours / 24)} hari lalu`;
}

export function formatClock(ts: number | null): string {
  if (!ts) return "--:--:--";
  return new Date(ts).toLocaleTimeString("id-ID", { hour12: false });
}
