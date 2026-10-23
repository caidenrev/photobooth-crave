"use client";

import React from "react";
import { Radio } from "lucide-react";
import { BrutalCard, BrutalBadge, PlayfulText } from "@/components/ui";

export default function AdminRoomsPage() {
  return (
    <div className="flex flex-col gap-6 sb-stagger">
      <div>
        <BrutalBadge variant="emerald" size="sm" className="mb-1">
          WebRTC Signaling
        </BrutalBadge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
          <PlayfulText text="Monitor Room LDR Aktif" delay={150} />
        </h1>
      </div>

      <BrutalCard variant="white">
        <p className="text-sm font-semibold text-zinc-600">
          Modul monitoring koneksi WebRTC live room antara pasangan LDR secara real-time.
        </p>
      </BrutalCard>
    </div>
  );
}
