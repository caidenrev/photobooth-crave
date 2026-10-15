"use client";

import React from "react";
import { Settings } from "lucide-react";
import { BrutalCard, BrutalBadge } from "@/components/ui";

export default function AdminSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <BrutalBadge variant="neutral" size="sm" className="mb-1">
          Konfigurasi Sistem
        </BrutalBadge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
          Pengaturan SaaS & Gateway QRIS
        </h1>
      </div>

      <BrutalCard variant="white">
        <p className="text-sm font-semibold text-zinc-600">
          Konfigurasi endpoint payment API, tarif dasar tebus, dan aturan room LDR.
        </p>
      </BrutalCard>
    </div>
  );
}
