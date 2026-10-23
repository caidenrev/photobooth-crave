"use client";

import React, { useState } from "react";
import {
  Download,
  Search,
  KeyRound,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import {
  BrutalCard,
  BrutalBadge,
  BrutalButton,
  BrutalInput,
  BrutalModal,
  BrutalNotificationModal,
  PlayfulText,
} from "@/components/ui";
import {
  useAdminLiveData,
  formatRelativeTime,
  formatClock,
  type AdminTransaction,
} from "@/store/useAdminLiveStore";

type TxStatusLabel = "PAID" | "PENDING" | "EXPIRED";

interface TransactionItem {
  id: string;
  orderId: string;
  roomCode: string;
  mode: "LDR" | "Solo";
  frameName: string;
  amount: number;
  status: TxStatusLabel;
  timestamp: string;
}

function toTransactionItem(tx: AdminTransaction, now: number | null): TransactionItem {
  return {
    id: tx.order_id,
    orderId: tx.order_id,
    roomCode: tx.room_id,
    mode: tx.mode,
    frameName: tx.frame_name,
    amount: tx.amount,
    status: tx.status === "paid" ? "PAID" : tx.status === "pending" ? "PENDING" : "EXPIRED",
    timestamp: formatRelativeTime(tx.paid_at || tx.created_at, now),
  };
}

export default function AdminTransactionsPage() {
  const {
    transactions: liveTransactions,
    serverTime,
    isLoading,
    isRefreshing,
    error,
    changedIds,
    refresh,
    manualUnlock,
  } = useAdminLiveData();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isExporting, setIsExporting] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockTarget, setUnlockTarget] = useState<TransactionItem | null>(null);
  const [notice, setNotice] = useState<{
    isOpen: boolean;
    type: "success" | "danger";
    title: string;
    message: string;
  }>({ isOpen: false, type: "success", title: "", message: "" });

  const transactions = liveTransactions.map((tx) => toTransactionItem(tx, serverTime));

  // Filter & Search Logic
  const filtered = transactions.filter((t) => {
    const matchesSearch =
      t.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.roomCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === "ALL" || t.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const countByStatus = (status: string) =>
    status === "ALL" ? transactions.length : transactions.filter((t) => t.status === status).length;

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
    const target = unlockTarget;

    setIsUnlocking(true);
    const result = await manualUnlock(target.orderId);
    setIsUnlocking(false);
    setUnlockTarget(null);

    setNotice(
      result.ok
        ? {
            isOpen: true,
            type: "success",
            title: "Buka Kunci Berhasil!",
            message: `Order ${target.orderId} (Room ${target.roomCode}) telah dibuka kuncinya secara manual. Pelanggan dapat langsung mengunduh HD.`,
          }
        : {
            isOpen: true,
            type: "danger",
            title: "Buka Kunci Gagal",
            message: result.message,
          }
    );
  };

  const renderStatusBadge = (status: TxStatusLabel) => (
    <span key={status} className="inline-flex sb-pop">
      {status === "PAID" && (
        <BrutalBadge variant="emerald" size="sm">
          Lunas
        </BrutalBadge>
      )}
      {status === "PENDING" && (
        <BrutalBadge variant="amber" size="sm">
          Pending
        </BrutalBadge>
      )}
      {status === "EXPIRED" && (
        <BrutalBadge variant="neutral" size="sm">
          Kedaluwarsa
        </BrutalBadge>
      )}
    </span>
  );

  return (
    <div className="flex flex-col gap-6 sb-stagger">
      {/* Top Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
            <BrutalBadge variant="amber" size="sm">
              Log Transaksi
            </BrutalBadge>
            <span className="text-xs font-mono font-bold text-zinc-500">
              Gateway: Crave QRIS
            </span>
            <span
              className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-zinc-500"
              title="Data diperbarui otomatis setiap 5 detik"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  error ? "bg-red-500" : "bg-emerald-500 sb-live-dot"
                }`}
              ></span>
              {error ? "Offline" : `Live · ${formatClock(serverTime)}`}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
            <PlayfulText text="Monitoring Transaksi QRIS" delay={150} />
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <BrutalButton
            variant="neutral"
            size="sm"
            onClick={() => refresh()}
            icon={
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`}
                strokeWidth={2.25}
              />
            }
          >
            Refresh
          </BrutalButton>
          <BrutalButton
            variant="amber"
            size="sm"
            onClick={handleExportCsv}
            disabled={isExporting || isLoading}
            icon={<Download className="w-3.5 h-3.5" strokeWidth={2.25} />}
          >
            {isExporting ? "Mengunduh..." : "Export CSV"}
          </BrutalButton>
        </div>
      </div>

      {/* Main Container Card */}
      <BrutalCard variant="white" className="p-5 sm:p-6 flex flex-col gap-5">
        {/* Search Bar & Status Filters */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b-2 border-zinc-900">
          <div className="w-full xl:w-80 shrink-0">
            <BrutalInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari Order ID atau Kode Room..."
              iconLeft={<Search className="w-4 h-4 text-zinc-600" strokeWidth={2.25} />}
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
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
                className={`px-3 py-1.5 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:translate-x-[1px] active:translate-y-[1px] ${
                  statusFilter === btn.id
                    ? "bg-amber-300 border-zinc-900 shadow-[2px_2px_0px_0px_#18181b] text-zinc-900"
                    : "bg-stone-50 border-zinc-300 text-zinc-600 hover:bg-stone-100"
                }`}
              >
                {btn.label}
                {!isLoading && (
                  <span key={countByStatus(btn.id)} className="ml-1 font-mono sb-pop inline-block">
                    ({countByStatus(btn.id)})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ======================================================== */}
        {/* DESKTOP TABLE VIEW (Visible on sm and up)                */}
        {/* ======================================================== */}
        <div className="hidden xl:block overflow-x-auto">
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
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500 font-bold text-xs animate-pulse">
                    Memuat transaksi terbaru...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500 font-bold text-xs">
                    Tidak ada transaksi yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => (
                  <tr
                    key={tx.id}
                    className={`hover:bg-amber-50/50 transition-colors sb-reveal ${
                      changedIds[tx.id] ? "sb-flash" : ""
                    }`}
                  >
                    <td className="py-3.5 px-3 font-mono font-bold text-xs text-zinc-900">
                      {tx.orderId}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-extrabold text-xs text-zinc-800">
                      <span className="px-2 py-0.5 bg-stone-100 rounded-md border border-zinc-900 whitespace-nowrap">
                        {tx.roomCode}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-xs font-bold text-zinc-700">
                      {tx.frameName}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-extrabold text-xs text-zinc-900">
                      Rp{tx.amount.toLocaleString("id-ID")}
                    </td>
                    <td className="py-3.5 px-3">{renderStatusBadge(tx.status)}</td>
                    <td className="py-3.5 px-3 text-xs text-zinc-500 font-medium whitespace-nowrap">
                      {tx.timestamp}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      {tx.status === "PENDING" ? (
                        <button
                          type="button"
                          onClick={() => setUnlockTarget(tx)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-200 border-2 border-zinc-900 text-emerald-950 font-bold text-xs shadow-[2px_2px_0px_0px_#18181b] hover:bg-emerald-300 transition-all cursor-pointer active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
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
        <div className="xl:hidden flex flex-col gap-3 lg:grid lg:grid-cols-2">
          {isLoading ? (
            <div className="py-6 text-center text-zinc-500 font-bold text-xs animate-pulse">
              Memuat transaksi terbaru...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-6 text-center text-zinc-500 font-bold text-xs">
              Tidak ada transaksi ditemukan.
            </div>
          ) : (
            filtered.map((tx) => (
              <div
                key={tx.id}
                className={`p-4 bg-stone-50 rounded-2xl border-2 border-zinc-900 flex flex-col gap-2.5 shadow-[2px_2px_0px_0px_#18181b] sb-reveal ${
                  changedIds[tx.id] ? "sb-flash" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-extrabold text-xs text-zinc-900">
                    {tx.orderId}
                  </span>
                  {renderStatusBadge(tx.status)}
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
                      className="px-3 py-1 rounded-xl bg-emerald-300 border-2 border-zinc-900 text-xs font-extrabold text-emerald-950 shadow-[2px_2px_0px_0px_#18181b] cursor-pointer transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
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
        onClose={() => !isUnlocking && setUnlockTarget(null)}
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
              <span className="font-mono font-bold text-zinc-900">
                Rp{(unlockTarget?.amount ?? 0).toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <BrutalButton
              variant="neutral"
              size="sm"
              disabled={isUnlocking}
              onClick={() => setUnlockTarget(null)}
            >
              Batal
            </BrutalButton>
            <BrutalButton
              variant="emerald"
              size="sm"
              loading={isUnlocking}
              onClick={handleConfirmUnlock}
              icon={<CheckCircle2 className="w-4 h-4" strokeWidth={2.25} />}
            >
              {isUnlocking ? "Membuka Kunci..." : "Ya, Buka Kunci Sekarang"}
            </BrutalButton>
          </div>
        </div>
      </BrutalModal>

      {/* Result Notification Modal (No browser alert) */}
      <BrutalNotificationModal
        isOpen={notice.isOpen}
        onClose={() => setNotice((prev) => ({ ...prev, isOpen: false }))}
        type={notice.type}
        title={notice.title}
        message={notice.message}
      />
    </div>
  );
}
