"use client";

import React from "react";
import Link from "@/components/layout/TransitionLink";
import { Camera, Heart, QrCode, ShieldCheck, Sparkles } from "lucide-react";
import { BrutalBadge, PlayfulText } from "@/components/ui";

export function Footer() {
  return (
    <footer className="w-full bg-[#FFFDF9] border-t-2 border-zinc-900 mt-auto py-10 px-4 sm:px-6 sb-reveal">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Brand Description */}
        <div className="flex flex-col gap-2 max-w-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-400 border-2 border-zinc-900 shadow-[2px_2px_0px_0px_#18181b] flex items-center justify-center">
              <Camera className="w-4 h-4 text-zinc-900" strokeWidth={2.25} />
            </div>
            <span className="font-extrabold text-base tracking-tight text-zinc-900">
              <PlayfulText text="SnapBond SaaS" delay={100} />
            </span>
            <BrutalBadge variant="emerald" size="sm" className="text-[10px]">
              V1.0
            </BrutalBadge>
          </div>
          <p className="text-xs font-medium text-zinc-600 leading-relaxed">
            Platform photobooth online estetik untuk pasangan LDR dan kreator solo. Ambil foto berdua secara sinkron dan unduh photostrip HD via QRIS instan.
          </p>
        </div>

        {/* Feature Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border-2 border-zinc-900 shadow-[2px_2px_0px_0px_#18181b] text-xs font-bold text-zinc-800">
            <QrCode className="w-4 h-4 text-amber-600" strokeWidth={2.25} />
            <span>
              <PlayfulText text="QRIS All Payment" delay={300} step={30} />
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border-2 border-zinc-900 shadow-[2px_2px_0px_0px_#18181b] text-xs font-bold text-zinc-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600" strokeWidth={2.25} />
            <span>
              <PlayfulText text="Watermark Engine" delay={450} step={30} />
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border-2 border-zinc-900 shadow-[2px_2px_0px_0px_#18181b] text-xs font-bold text-zinc-800">
            <Sparkles className="w-4 h-4 text-violet-600" strokeWidth={2.25} />
            <span>
              <PlayfulText text="Dual-Cam Sync" delay={600} step={30} />
            </span>
          </div>
        </div>

        {/* Copyright & Links */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs font-semibold text-zinc-600">
          <div className="flex items-center gap-1">
            <span>
              <PlayfulText text="Dibuat dengan" delay={700} step={30} />
            </span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" strokeWidth={2.25} />
            <span>
              <PlayfulText text="untuk LDR & Solo" delay={1100} step={30} />
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/studio" className="hover:text-zinc-900 hover:underline">
              Studio
            </Link>
            <Link href="/admin" className="hover:text-zinc-900 hover:underline">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
