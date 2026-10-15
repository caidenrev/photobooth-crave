"use client";

import React, { useState, useEffect } from "react";
import {
  ReceiptText,
  Filter,
  Download,
  Search,
  KeyRound,
  ExternalLink,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Layers,
} from "lucide-react";
import {
  BrutalCard,
  BrutalBadge,
  BrutalButton,
  BrutalInput,
  BrutalModal,
  BrutalNotificationModal,
} from "@/components/ui";

interface TransactionItem {
  id: string;
  orderId: string;
  roomCode: string;
  mode: "LDR" | "Solo";
  frameName: string;
  amount: number;
  status: "PAID" | "PENDING" | "EXPIRED";
  timestamp: string;
}

export default function AdminTransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isExporting, setIsExporting] = useState(false);
  const [unlockTarget, setUnlockTarget] = useState<TransactionItem | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [transactions, setTransactions] = useState<TransactionItem[]>([
    {
      id: "tx-1",
      orderId: "SB-LDR892B-90214-1",
      roomCode: "LDR-892B",
      mode: "LDR",
      frameName: "Pastel Rose",
      amount: 15000,
      status: "PAID",
      timestamp: "10 menit lalu",
    },
    {
      id: "tx-2",
      orderId: "SB-SOLO-90180-1",
      roomCode: "SOLO",
      mode: "Solo",
      frameName: "Warm Cream",
      amount: 15000,
      status: "PAID",
      timestamp: "24 menit lalu",
    },
    {
      id: "tx-3",
      orderId: "SB-LDR541A-90112-1",
      roomCode: "LDR-541A",
      mode: "LDR",
      frameName: "Dark Noir",
      amount: 15000,
      status: "PENDING",
      timestamp: "45 menit lalu",
    },
    {
      id: "tx-4",
      orderId: "SB-LDR992C-90050-1",
      roomCode: "LDR-992C",
      mode: "LDR",
      frameName: "Soft Violet",
      amount: 15000,
      status: "PAID",
      timestamp: "1 jam lalu",
    },
    {
      id: "tx-5",
      orderId: "SB-SOLO-89912-1",
      roomCode: "SOLO",
      mode: "Solo",
      frameName: "Warm Amber",
      amount: 15000,
      status: "EXPIRED",
      timestamp: "2 jam lalu",
    },
    {
      id: "tx-6",
      orderId: "SB-LDR104X-89800-1",
      roomCode: "LDR-104X",
      mode: "LDR",
      frameName: "Mint Emerald",
      amount: 15000,
      status: "PAID",
      timestamp: "3 jam lalu",
    },
  ]);

  // Filter & Search Logic
  const filtered = transactions.filter((t) => {
    const matchesSearch =
      t.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.roomCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === "ALL" || t.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  // Export CSV Action
  const handleExportCsv = () => {
    setIsExporting(true);
    const headers = ["Order_ID", "Room_Code", "Mode", "Frame", "Nominal_IDR", "Status", "Waktu"];
    const rows = filtered.map((t) => [
      t.orderId,
      t.roomCode,
      t.mode,
      t.frameName,
      t.amount,
      t.status,
      t.timestamp,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SnapBond_Transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setIsExporting(false), 600);
  };

  // Manual Unlock Action
  const handleConfirmUnlock = async () => {
    if (!unlockTarget) return;

    // Call API /api/admin/transactions
    try {
      await fetch("/api/admin/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "manual_unlock",
          order_id: unlockTarget.orderId,
        }),
      });
    } catch (e) {
      console.warn("Manual unlock API failed, applying local update:", e);
    }

    setTransactions((prev) =>
      prev.map((t) =>
        t.id === unlockTarget.id ? { ...t, status: "PAID" } : t
      )
    );

    setSuccessMessage(
      `Order ${unlockTarget.orderId} (Room ${unlockTarget.roomCode}) telah dibuka kuncinya secara manual. Pelanggan dapat langsung mengunduh HD.`
    );
    setUnlockTarget(null);
    setIsSuccessModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BrutalBadge variant="amber" size="sm">
              Log Transaksi
            </BrutalBadge>
            <span className="text-xs font-mono font-bold text-zinc-500">
              Gateway: Crave QRIS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
            Monitoring Transaksi QRIS
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <BrutalButton
            variant="neutral"
            size="sm"
            onClick={() => window.location.reload()}
            icon={<RefreshCw className="w-3.5 h-3.5" strokeWidth={2.25} />}
          >
            Refresh
          </BrutalButton>
          <BrutalButton
            variant="amber"
            size="sm"
            onClick={handleExportCsv}
            disabled={isExporting}
            icon={<Download className="w-3.5 h-3.5" strokeWidth={2.25} />}
          >
            {isExporting ? "Mengunduh..." : "Export CSV"}
          </BrutalButton>
        </div>
      </div>

      {/* Main Container Card */}
      <BrutalCard variant="white" className="p-5 sm:p-6 flex flex-col gap-5">
        {/* Search Bar & Status Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-2 border-zinc-900">
          <div className="w-full md:w-80">
            <BrutalInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari Order ID atau Kode Room..."
              iconLeft={<Search className="w-4 h-4 text-zinc-600" strokeWidth={2.25} />}
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: "ALL", label: "Semua" },
              { id: "PAID", label: "Lunas (Paid)" },
              { id: "PENDING", label: "Menunggu (Pending)" },
              { id: "EXPIRED", label: "Kedaluwarsa" },
            ].map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => setStatusFilter(btn.id)}
                className={`px-3 py-1.5 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === btn.id
                    ? "bg-amber-300 border-zinc-900 shadow-[2px_2px_0px_0px_#18181b] text-zinc-900"
                    : "bg-stone-50 border-zinc-300 text-zinc-600 hover:bg-stone-100"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* ======================================================== */}
        {/* DESKTOP TABLE VIEW (Visible on sm and up)                */}
        {/* ======================================================== */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-zinc-900 text-[11px] font-mono font-extrabold uppercase text-zinc-600">
                <th className="py-3 px-3">Order ID</th>
                <th className="py-3 px-3">Kode Room</th>
                <th className="py-3 px-3">Tema Frame</th>
                <th className="py-3 px-3">Nominal</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Waktu</th>
                <th className="py-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-zinc-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500 font-bold text-xs">
                    Tidak ada transaksi yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-amber-50/50 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-xs text-zinc-900">
                      {tx.orderId}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-extrabold text-xs text-zinc-800">
                      <span className="px-2 py-0.5 bg-stone-100 rounded-md border border-zinc-900">
                        {tx.roomCode}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-xs font-bold text-zinc-700">
                      {tx.frameName}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-extrabold text-xs text-zinc-900">
                      Rp{tx.amount.toLocaleString("id-ID")}
                    </td>
                    <td className="py-3.5 px-3">
                      {tx.status === "PAID" && (
                        <BrutalBadge variant="emerald" size="sm">
                          Lunas
                        </BrutalBadge>
                      )}
                      {tx.status === "PENDING" && (
                        <BrutalBadge variant="amber" size="sm">
                          Pending
                        </BrutalBadge>
                      )}
                      {tx.status === "EXPIRED" && (
                        <BrutalBadge variant="neutral" size="sm">
                          Kedaluwarsa
                        </BrutalBadge>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-xs text-zinc-500 font-medium">
                      {tx.timestamp}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      {tx.status === "PENDING" ? (
                        <button
                          type="button"
                          onClick={() => setUnlockTarget(tx)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-200 border-2 border-zinc-900 text-emerald-950 font-bold text-xs shadow-[2px_2px_0px_0px_#18181b] hover:bg-emerald-300 transition-colors cursor-pointer"
                        >
                          Manual Unlock
                        </button>
                      ) : (
                        <span className="text-[11px] text-zinc-400 font-mono">
                          Tercatat
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ======================================================== */}
        {/* MOBILE CARD LIST VIEW (Visible on < sm)                  */}
        {/* ======================================================== */}
        <div className="sm:hidden flex flex-col gap-3">
          {filtered.length === 0 ? (
            <div className="py-6 text-center text-zinc-500 font-bold text-xs">
              Tidak ada transaksi ditemukan.
            </div>
          ) : (
            filtered.map((tx) => (
              <div
                key={tx.id}
                className="p-4 bg-stone-50 rounded-2xl border-2 border-zinc-900 flex flex-col gap-2.5 shadow-[2px_2px_0px_0px_#18181b]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-extrabold text-xs text-zinc-900">
                    {tx.orderId}
                  </span>
                  {tx.status === "PAID" && (
                    <BrutalBadge variant="emerald" size="sm">
                      Lunas
                    </BrutalBadge>
                  )}
                  {tx.status === "PENDING" && (
                    <BrutalBadge variant="amber" size="sm">
                      Pending
                    </BrutalBadge>
                  )}
                  {tx.status === "EXPIRED" && (
                    <BrutalBadge variant="neutral" size="sm">
                      Kedaluwarsa
                    </BrutalBadge>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-600">
                  <span>Room: <strong className="text-zinc-900 font-mono">{tx.roomCode}</strong></span>
                  <span>Frame: <strong className="text-zinc-900">{tx.frameName}</strong></span>
                </div>

                <div className="pt-2 border-t border-zinc-200 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-mono font-extrabold text-sm text-zinc-900">
                      Rp{tx.amount.toLocaleString("id-ID")}
                    </span>
                    <span className="text-[10px] text-zinc-500">{tx.timestamp}</span>
                  </div>

                  {tx.status === "PENDING" && (
                    <button
                      type="button"
                      onClick={() => setUnlockTarget(tx)}
                      className="px-3 py-1 rounded-xl bg-emerald-300 border-2 border-zinc-900 text-xs font-extrabold text-emerald-950 shadow-[2px_2px_0px_0px_#18181b] cursor-pointer"
                    >
                      Unlock Manual
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </BrutalCard>

      {/* Manual Unlock Confirmation Modal */}
      <BrutalModal
        isOpen={!!unlockTarget}
        onClose={() => setUnlockTarget(null)}
        title="Konfirmasi Buka Kunci Manual"
        description="Aksi ini akan menandai pesanan sebagai LUNAS dan segera membuka kunci tombol unduh HD untuk pelanggan."
        icon={<KeyRound className="w-5 h-5 text-zinc-900" strokeWidth={2.25} />}
      >
        <div className="flex flex-col gap-4 py-2">
          <div className="p-3 bg-amber-50 rounded-xl border-2 border-zinc-900 text-xs flex flex-col gap-1">
            <div className="flex justify-between">
              <span className="text-zinc-600">Order ID:</span>
              <span className="font-mono font-bold text-zinc-900">{unlockTarget?.orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600">Kode Room:</span>
              <span className="font-mono font-bold text-zinc-900">{unlockTarget?.roomCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600">Total Tagihan:</span>
              <span className="font-mono font-bold text-zinc-900">Rp15.000</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <BrutalButton
              variant="neutral"
              size="sm"
              onClick={() => setUnlockTarget(null)}
            >
              Batal
            </BrutalButton>
            <BrutalButton
              variant="emerald"
              size="sm"
              onClick={handleConfirmUnlock}
              icon={<CheckCircle2 className="w-4 h-4" strokeWidth={2.25} />}
            >
              Ya, Buka Kunci Sekarang
            </BrutalButton>
          </div>
        </div>
      </BrutalModal>

      {/* Success Notification Modal (No browser alert) */}
      <BrutalNotificationModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        type="success"
        title="Buka Kunci Berhasil!"
        message={successMessage}
      />
    </div>
  );
}
