"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ReceiptText,
  Layers,
  Radio,
  Settings,
  Camera,
  ArrowUpRight,
  ShieldCheck,
  Bell,
  LogOut,
} from "lucide-react";
import { BrutalBadge, BrutalButton } from "@/components/ui";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/admin",
      label: "Overview",
      icon: <LayoutDashboard className="w-4 h-4" strokeWidth={2.25} />,
    },
    {
      href: "/admin/transactions",
      label: "Transaksi QRIS",
      icon: <ReceiptText className="w-4 h-4" strokeWidth={2.25} />,
      badge: "Live",
    },
    {
      href: "/admin/frames",
      label: "Katalog Frame",
      icon: <Layers className="w-4 h-4" strokeWidth={2.25} />,
    },
    {
      href: "/admin/rooms",
      label: "Room LDR Aktif",
      icon: <Radio className="w-4 h-4" strokeWidth={2.25} />,
      badge: "24",
    },
    {
      href: "/admin/settings",
      label: "Pengaturan",
      icon: <Settings className="w-4 h-4" strokeWidth={2.25} />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex flex-col md:flex-row pb-16 md:pb-0">
      {/* ======================================================== */}
      {/* DESKTOP FIXED SIDEBAR (>= 768px)                         */}
      {/* ======================================================== */}
      <aside className="hidden md:flex flex-col w-64 border-r-2 border-zinc-900 bg-white min-h-screen p-5 shrink-0 justify-between sticky top-0 h-screen overflow-y-auto">
        <div className="flex flex-col gap-6">
          {/* Admin Header Logo */}
          <div className="flex items-center gap-3 pb-4 border-b-2 border-zinc-900">
            <div className="w-10 h-10 rounded-2xl bg-amber-300 border-2 border-zinc-900 shadow-[2px_2px_0px_0px_#18181b] flex items-center justify-center">
              <Camera className="w-5 h-5 text-zinc-900" strokeWidth={2.25} />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-zinc-900 leading-none">
                SnapBond Admin
              </span>
              <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase mt-0.5">
                Monitoring & CMS
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono font-extrabold text-zinc-500 uppercase px-2 mb-1">
              Menu Utama
            </span>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer",
                    isActive
                      ? "bg-violet-300 border-zinc-900 text-zinc-900 shadow-[2px_2px_0px_0px_#18181b]"
                      : "border-transparent text-zinc-600 hover:text-zinc-900 hover:bg-stone-100"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={cn(
                        "px-1.5 py-0.2 rounded-md text-[10px] font-mono font-extrabold border border-zinc-900",
                        isActive ? "bg-white text-zinc-900" : "bg-stone-200 text-zinc-800"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t-2 border-zinc-900 flex flex-col gap-2.5">
          <Link href="/studio">
            <BrutalButton
              variant="neutral"
              size="sm"
              fullWidth
              icon={<ArrowUpRight className="w-4 h-4" strokeWidth={2.25} />}
              iconPosition="right"
            >
              Buka Studio Client
            </BrutalButton>
          </Link>
          <div className="flex items-center justify-between px-1 text-[11px] font-mono text-zinc-600 font-bold">
            <span>SaaS Server: Online</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200"></span>
          </div>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* MOBILE TOP BAR (< 768px)                                */}
      {/* ======================================================== */}
      <header className="md:hidden sticky top-0 z-30 w-full bg-white border-b-2 border-zinc-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-300 border-2 border-zinc-900 shadow-[2px_2px_0px_0px_#18181b] flex items-center justify-center">
            <Camera className="w-4 h-4 text-zinc-900" strokeWidth={2.25} />
          </div>
          <span className="font-extrabold text-sm text-zinc-900">
            SnapBond Admin
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/studio">
            <BrutalBadge variant="violet" size="sm">
              Studio
            </BrutalBadge>
          </Link>
        </div>
      </header>

      {/* ======================================================== */}
      {/* MAIN ADMIN CONTENT WRAPPER                               */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </div>

      {/* ======================================================== */}
      {/* MOBILE BOTTOM NAVIGATION BAR (< 768px)                   */}
      {/* ======================================================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-zinc-900 px-2 py-2 flex items-center justify-around shadow-[0px_-2px_10px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all",
                isActive
                  ? "bg-violet-300 border-2 border-zinc-900 shadow-[2px_2px_0px_0px_#18181b] text-zinc-900 font-extrabold"
                  : "text-zinc-600 font-bold"
              )}
            >
              <div className="[&>svg]:w-4 [&>svg]:h-4">{item.icon}</div>
              <span className="text-[10px] mt-0.5 tracking-tight">
                {item.label.split(" ")[0]}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
