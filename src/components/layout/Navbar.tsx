"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Camera,
  HeartHandshake,
  LayoutDashboard,
  Sparkles,
  Menu,
  X,
  ShieldCheck,
  User,
  LogOut,
  Clock,
  LogIn,
} from "lucide-react";
import { BrutalButton, BrutalBadge } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();

  const navLinks = [
    { href: "/", label: "Beranda", icon: <Sparkles className="w-4 h-4" strokeWidth={2.25} /> },
    { href: "/studio", label: "Studio Photobooth", icon: <Camera className="w-4 h-4" strokeWidth={2.25} /> },
    { href: "/history", label: "Riwayat Foto", icon: <Clock className="w-4 h-4" strokeWidth={2.25} /> },
    { href: "/admin", label: "Dashboard Admin", icon: <LayoutDashboard className="w-4 h-4" strokeWidth={2.25} /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FFFDF9]/95 backdrop-blur-md border-b-2 border-zinc-900 px-4 sm:px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-rose-400 border-2 border-zinc-900 shadow-[2px_2px_0px_0px_#18181b] flex items-center justify-center transition-transform group-hover:rotate-6">
            <Camera className="w-5 h-5 text-zinc-900" strokeWidth={2.25} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-zinc-900 leading-none">
                SnapBond
              </span>
              <BrutalBadge variant="amber" size="sm" className="hidden sm:inline-flex text-[10px] py-0">
                LDR & Solo
              </BrutalBadge>
            </div>
            <span className="text-[11px] font-semibold text-zinc-600 leading-tight">
              Online Photobooth SaaS
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border-2",
                  isActive
                    ? "bg-amber-300 border-zinc-900 text-zinc-900 shadow-[2px_2px_0px_0px_#18181b]"
                    : "border-transparent text-zinc-700 hover:text-zinc-900 hover:bg-stone-100"
                )}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* CTA Actions & User Profile */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/history"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border-2 border-zinc-900 shadow-[2px_2px_0px_0px_#18181b] hover:bg-stone-50 cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-violet-300 border border-zinc-900 flex items-center justify-center text-[10px] font-extrabold text-zinc-900">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-extrabold text-zinc-900 max-w-[120px] truncate">
                  {user.fullName}
                </span>
                {user.role === "admin" && (
                  <span className="px-1.5 py-0.2 bg-rose-200 border border-zinc-900 rounded text-[9px] font-mono font-extrabold text-rose-950 uppercase">
                    Admin
                  </span>
                )}
              </Link>

              <button
                onClick={() => logout()}
                title="Keluar Akun"
                className="p-2 rounded-xl bg-stone-100 border-2 border-zinc-900 shadow-[2px_2px_0px_0px_#18181b] hover:bg-rose-100 text-zinc-700 hover:text-rose-700 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" strokeWidth={2.25} />
              </button>
            </div>
          ) : (
            <Link href="/login">
              <BrutalButton
                variant="neutral"
                size="sm"
                icon={<LogIn className="w-3.5 h-3.5" strokeWidth={2.25} />}
              >
                Masuk / Daftar
              </BrutalButton>
            </Link>
          )}

          <Link href="/studio">
            <BrutalButton
              variant="primary"
              size="sm"
              icon={<HeartHandshake className="w-4 h-4" strokeWidth={2.25} />}
            >
              Mulai Foto
            </BrutalButton>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          {user ? (
            <Link
              href="/history"
              className="px-2.5 py-1 rounded-xl bg-white border-2 border-zinc-900 text-xs font-extrabold text-zinc-900 truncate max-w-[90px]"
            >
              {user.fullName.split(" ")[0]}
            </Link>
          ) : (
            <Link href="/login">
              <BrutalButton variant="neutral" size="sm">
                Masuk
              </BrutalButton>
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Buka Navigasi"
            className="p-2 rounded-xl border-2 border-zinc-900 bg-white shadow-[2px_2px_0px_0px_#18181b] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer text-zinc-900"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" strokeWidth={2.25} />
            ) : (
              <Menu className="w-5 h-5" strokeWidth={2.25} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t-2 border-zinc-900 flex flex-col gap-2 animate-in slide-in-from-top-2 duration-150">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl text-sm font-bold border-2 border-zinc-900",
                  isActive
                    ? "bg-amber-300 text-zinc-900 shadow-[2px_2px_0px_0px_#18181b]"
                    : "bg-white text-zinc-800"
                )}
              >
                <div className="flex items-center gap-2.5">
                  {link.icon}
                  <span>{link.label}</span>
                </div>
                {isActive && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-900 text-white font-bold uppercase">
                    Aktif
                  </span>
                )}
              </Link>
            );
          })}

          {user ? (
            <div className="p-3 rounded-xl bg-violet-100 border-2 border-zinc-900 flex items-center justify-between mt-1">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-zinc-900" strokeWidth={2.25} />
                <div className="flex flex-col">
                  <span className="text-xs font-extrabold text-zinc-900">{user.fullName}</span>
                  <span className="text-[10px] font-mono text-zinc-600">{user.email}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="px-2.5 py-1 rounded-lg bg-rose-200 border border-zinc-900 text-xs font-bold text-rose-950"
              >
                Keluar
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl bg-amber-200 border-2 border-zinc-900 text-center font-extrabold text-sm text-zinc-900"
            >
              Masuk atau Daftar Akun
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
