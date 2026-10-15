"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, HeartHandshake, LayoutDashboard, Sparkles, Menu, X, ShieldCheck } from "lucide-react";
import { BrutalButton, BrutalBadge } from "@/components/ui";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Beranda", icon: <Sparkles className="w-4 h-4" strokeWidth={2.25} /> },
    { href: "/studio", label: "Studio Photobooth", icon: <Camera className="w-4 h-4" strokeWidth={2.25} /> },
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

        {/* CTA Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-100 border-2 border-zinc-900 shadow-[2px_2px_0px_0px_#18181b]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" strokeWidth={2.25} />
            <span className="text-[11px] font-extrabold text-emerald-950 uppercase tracking-wider">
              QRIS Instant
            </span>
          </div>
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
          <Link href="/studio">
            <BrutalButton variant="primary" size="sm">
              Mulai
            </BrutalButton>
          </Link>
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
        </div>
      )}
    </header>
  );
}
