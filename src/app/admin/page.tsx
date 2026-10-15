"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Wallet,
  CheckCircle2,
  TrendingUp,
  Radio,
  Download,
  Clock,
  Sparkles,
  RefreshCw,
  ArrowUpRight,
  ReceiptText,
  Layers,
  ChevronRight,
  BarChart3,
  Calendar,
} from "lucide-react";
import {
  BrutalButton,
  BrutalCard,
  BrutalBadge,
} from "@/components/ui";

interface DayRevenue {
  day: string;
  revenue: number;
  count: number;
}

const WEEKLY_DATA: DayRevenue[] = [
  { day: "Sen", revenue: 840000, count: 56 },
  { day: "Sel", revenue: 990000, count: 66 },
  { day: "Rab", revenue: 1125000, count: 75 },
  { day: "Kam", revenue: 1260000, count: 84 },
  { day: "Jum", revenue: 1680000, count: 112 },
  { day: "Sab", revenue: 2250000, count: 150 },
  { day: "Min", revenue: 1455000, count: 97 },
];

export default function AdminOverviewPage() {
  const [selectedDay, setSelectedDay] = useState<DayRevenue>(WEEKLY_DATA[6]);
  const [isExporting, setIsExporting] = useState(false);

  const maxRevenue = Math.max(...WEEKLY_DATA.map((d) => d.revenue));

  const handleExportCsv = () => {
    setIsExporting(true);
    const headers = ["Hari", "Jumlah_Transaksi", "Total_Pendapatan_Rupiah"];
    const rows = WEEKLY_DATA.map((d) => [d.day, d.count, d.revenue]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SnapBond_Revenue_Trend_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setIsExporting(false), 800);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Top Title & Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BrutalBadge variant="violet" size="sm">
              SaaS Admin Center
            </BrutalBadge>
            <span className="text-xs font-mono font-bold text-zinc-500">
              Live Monitoring
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
            Ringkasan Bisnis & Analytics
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
            {isExporting ? "Mengunduh..." : "Export Laporan"}
          </BrutalButton>
        </div>
      </div>

      {/* 4 KPI Metrics Summary Cards (Soft Neo-Brutalism) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Pendapatan QRIS Hari Ini */}
        <BrutalCard variant="amber" className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-extrabold text-zinc-800 uppercase tracking-wider">
              Pendapatan Hari Ini
            </span>
            <div className="w-9 h-9 rounded-xl bg-white border-2 border-zinc-900 shadow-[2px_2px_0px_0px_#18181b] flex items-center justify-center">
              <Wallet className="w-4 h-4 text-zinc-900" strokeWidth={2.25} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-zinc-900">
              Rp1.455.000
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-800">
              <TrendingUp className="w-3.5 h-3.5" strokeWidth={2.25} />
              <span>+24.5% dari kemarin</span>
            </div>
          </div>
        </BrutalCard>

        {/* KPI 2: Jumlah Photostrip Ditebus */}
        <BrutalCard variant="emerald" className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-extrabold text-zinc-800 uppercase tracking-wider">
              Photostrip Ditebus
            </span>
            <div className="w-9 h-9 rounded-xl bg-white border-2 border-zinc-900 shadow-[2px_2px_0px_0px_#18181b] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-zinc-900" strokeWidth={2.25} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-zinc-900">
              97 Strip
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-zinc-700">
              <Clock className="w-3.5 h-3.5" strokeWidth={2.25} />
              <span>Rata-rata 8 per jam</span>
            </div>
          </div>
        </BrutalCard>

        {/* KPI 3: Rasio Konversi Paid */}
        <BrutalCard variant="rose" className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-extrabold text-zinc-800 uppercase tracking-wider">
              Paid Conversion
            </span>
            <div className="w-9 h-9 rounded-xl bg-white border-2 border-zinc-900 shadow-[2px_2px_0px_0px_#18181b] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-zinc-900" strokeWidth={2.25} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-zinc-900">
              38.4%
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-zinc-700">
              <span>97 Paid dari 252 Sesi</span>
            </div>
          </div>
        </BrutalCard>

        {/* KPI 4: Jumlah Room LDR Aktif */}
        <BrutalCard variant="violet" className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-extrabold text-zinc-800 uppercase tracking-wider">
              Room LDR Aktif
            </span>
            <div className="w-9 h-9 rounded-xl bg-white border-2 border-zinc-900 shadow-[2px_2px_0px_0px_#18181b] flex items-center justify-center">
              <Radio className="w-4 h-4 text-zinc-900" strokeWidth={2.25} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-zinc-900">
              24 Room
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <span>48 User Terkoneksi</span>
            </div>
          </div>
        </BrutalCard>
      </div>

      {/* Visual Revenue Trend Chart (Neo-Brutalist Responsive Interactive Chart) */}
      <BrutalCard variant="white" className="p-5 sm:p-6 flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-zinc-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-300 border-2 border-zinc-900 shadow-[2px_2px_0px_0px_#18181b] flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-zinc-900" strokeWidth={2.25} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-zinc-900 tracking-tight">
                Tren Pendapatan Mingguan
              </h2>
              <p className="text-xs font-semibold text-zinc-600">
                Statistik volume tebusan foto 7 hari terakhir
              </p>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="p-2.5 bg-stone-100 rounded-xl border-2 border-zinc-900 flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-zinc-500">Terpilih: </span>
              <span className="font-extrabold text-zinc-900">
                {selectedDay.day}
              </span>
            </div>
            <div>
              <span className="text-zinc-500">Pendapatan: </span>
              <span className="font-extrabold text-emerald-800">
                Rp{selectedDay.revenue.toLocaleString("id-ID")}
              </span>
            </div>
            <div>
              <span className="text-zinc-500">Volume: </span>
              <span className="font-extrabold text-zinc-900">
                {selectedDay.count}x
              </span>
            </div>
          </div>
        </div>

        {/* Bar Chart Visual */}
        <div className="pt-4">
          <div className="h-56 flex items-end justify-between gap-2 sm:gap-4 px-2">
            {WEEKLY_DATA.map((item, idx) => {
              const heightPercent = Math.round((item.revenue / maxRevenue) * 100);
              const isSelected = selectedDay.day === item.day;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDay(item)}
                  className="flex-1 flex flex-col items-center gap-2 group cursor-pointer"
                >
                  {/* Tooltip on hover */}
                  <div
                    className={`transition-opacity text-[11px] font-mono font-bold px-2 py-0.5 rounded border border-zinc-900 whitespace-nowrap shadow-[1.5px_1.5px_0px_0px_#18181b] ${
                      isSelected
                        ? "bg-amber-300 text-zinc-900 opacity-100"
                        : "bg-white text-zinc-700 opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    Rp{(item.revenue / 1000).toFixed(0)}k
                  </div>

                  {/* The Bar */}
                  <div className="w-full max-w-[48px] h-44 bg-stone-100 rounded-t-xl border-2 border-zinc-900 flex items-end overflow-hidden shadow-[2px_2px_0px_0px_#18181b]">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full transition-all duration-500 rounded-t-md border-t-2 border-zinc-900 ${
                        isSelected
                          ? "bg-amber-400"
                          : idx === 5
                          ? "bg-emerald-400"
                          : "bg-violet-300 group-hover:bg-amber-300"
                      }`}
                    ></div>
                  </div>

                  {/* Day Label */}
                  <span
                    className={`text-xs font-mono font-extrabold ${
                      isSelected ? "text-zinc-900 underline" : "text-zinc-600"
                    }`}
                  >
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </BrutalCard>

      {/* Bottom 2 Columns: Live Recent Activity & Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Activity Feed */}
        <BrutalCard variant="white" className="lg:col-span-2 p-5 sm:p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-zinc-900">
            <div className="flex items-center gap-2">
              <ReceiptText className="w-4 h-4 text-zinc-900" strokeWidth={2.25} />
              <h3 className="font-extrabold text-base text-zinc-900 tracking-tight">
                Aktivitas Tebus Foto Terakhir
              </h3>
            </div>
            <Link
              href="/admin/transactions"
              className="text-xs font-bold text-zinc-700 hover:text-zinc-950 flex items-center gap-1 underline"
            >
              Lihat Semua
              <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.25} />
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {[
              {
                orderId: "SB-LDR892B-90214-1",
                room: "LDR-892B",
                frame: "Pastel Rose",
                time: "10 menit lalu",
                status: "PAID",
                amount: 15000,
              },
              {
                orderId: "SB-SOLO-90180-1",
                room: "SOLO",
                frame: "Warm Cream",
                time: "24 menit lalu",
                status: "PAID",
                amount: 15000,
              },
              {
                orderId: "SB-LDR541A-90112-1",
                room: "LDR-541A",
                frame: "Dark Noir",
                time: "45 menit lalu",
                status: "PENDING",
                amount: 15000,
              },
            ].map((tx, idx) => (
              <div
                key={idx}
                className="p-3 bg-stone-50 rounded-xl border-2 border-zinc-900 flex items-center justify-between shadow-[2px_2px_0px_0px_#18181b]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-200 border-2 border-zinc-900 flex items-center justify-center font-mono font-extrabold text-xs">
                    #{idx + 1}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-mono font-bold text-xs text-zinc-900">
                      {tx.orderId}
                    </span>
                    <span className="text-[11px] text-zinc-500 font-medium">
                      Room: {tx.room} • Frame {tx.frame}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-zinc-900">
                      Rp{tx.amount.toLocaleString("id-ID")}
                    </div>
                    <div className="text-[10px] text-zinc-500">{tx.time}</div>
                  </div>
                  {tx.status === "PAID" ? (
                    <BrutalBadge variant="emerald" size="sm">
                      Lunas
                    </BrutalBadge>
                  ) : (
                    <BrutalBadge variant="amber" size="sm">
                      Pending
                    </BrutalBadge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </BrutalCard>

        {/* Right 1 Col: Quick Action Shortcuts */}
        <BrutalCard variant="cream" className="p-5 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-zinc-900" strokeWidth={2.25} />
              <h3 className="font-extrabold text-sm text-zinc-900 uppercase tracking-tight">
                Akses Cepat Pengelolaan
              </h3>
            </div>
            <p className="text-xs text-zinc-700 leading-relaxed font-medium">
              Akses cepat modul manajemen frame studio dan monitoring ruangan aktif pengguna.
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            <Link href="/admin/frames">
              <BrutalButton
                variant="violet"
                size="sm"
                fullWidth
                icon={<Layers className="w-3.5 h-3.5" strokeWidth={2.25} />}
              >
                Kelola Katalog Frame
              </BrutalButton>
            </Link>
            <Link href="/admin/transactions">
              <BrutalButton
                variant="amber"
                size="sm"
                fullWidth
                icon={<ReceiptText className="w-3.5 h-3.5" strokeWidth={2.25} />}
              >
                Buka Log Transaksi Lengkap
              </BrutalButton>
            </Link>
            <Link href="/studio">
              <BrutalButton
                variant="neutral"
                size="sm"
                fullWidth
                icon={<ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2.25} />}
              >
                Buka Studio Photobooth
              </BrutalButton>
            </Link>
          </div>
        </BrutalCard>
      </div>
    </div>
  );
}
