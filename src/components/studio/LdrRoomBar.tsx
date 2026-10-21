"use client";

import React, { useState } from "react";
import {
  HeartHandshake,
  Copy,
  Radio,
  Users,
  Check,
  Sparkles,
  Link as LinkIcon,
  UserCheck,
} from "lucide-react";
import { BrutalBadge, BrutalButton } from "@/components/ui";
import { useStudioStore } from "@/store/useStudioStore";
import { ldrSignaling } from "@/services/ldrSignalingService";
import { cn } from "@/lib/utils";

interface LdrRoomBarProps {
  roomId: string;
  userName?: string;
  className?: string;
}

export function LdrRoomBar({ roomId, userName = "Kamu", className }: LdrRoomBarProps) {
  const {
    partnerStatus,
    setPartnerStatus,
    partnerName,
    setPartnerName,
    isSimulatedPartner,
    setIsSimulatedPartner,
  } = useStudioStore();

  const [isCopied, setIsCopied] = useState(false);

  // Copy invitation link to clipboard
  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      const inviteUrl = `${window.location.origin}/studio?room=${roomId}&role=partner`;
      navigator.clipboard.writeText(inviteUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Toggle simulated partner connection
  const handleToggleSimulatedPartner = () => {
    if (!isSimulatedPartner) {
      setIsSimulatedPartner(true);
      setPartnerName("Dinda (LDR)");
      setPartnerStatus("stable");
      ldrSignaling.simulatePartnerConnection("Dinda (LDR)");
    } else {
      setIsSimulatedPartner(false);
      setPartnerName(null);
      setPartnerStatus("waiting");
    }
  };

  return (
    <div
      className={cn(
        "w-full bg-white border-2 border-zinc-900 rounded-2xl p-3 sm:p-4 shadow-[4px_4px_0px_0px_#18181b] flex flex-col md:flex-row md:items-center justify-between gap-3 sb-reveal",
        className
      )}
    >
      {/* Left: Room ID & Connection Status */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-400 border-2 border-zinc-900 shadow-[2px_2px_0px_0px_#18181b] flex items-center justify-center">
            <HeartHandshake className="w-4 h-4 text-zinc-900" strokeWidth={2.25} />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase block leading-none">
              Kode Room LDR
            </span>
            <span className="text-base sm:text-lg font-mono font-extrabold text-zinc-900 tracking-wider">
              {roomId}
            </span>
          </div>
        </div>

        {/* Dynamic Partner Status Badge */}
        {partnerStatus === "waiting" && (
          <BrutalBadge
            variant="amber"
            size="sm"
            icon={<Users className="w-3.5 h-3.5 text-amber-900" strokeWidth={2.25} />}
          >
            Menunggu Pasangan
          </BrutalBadge>
        )}

        {partnerStatus === "connected" && (
          <BrutalBadge
            variant="emerald"
            size="sm"
            icon={<UserCheck className="w-3.5 h-3.5 text-emerald-900" strokeWidth={2.25} />}
          >
            Terhubung ({partnerName || "Pasangan"})
          </BrutalBadge>
        )}

        {partnerStatus === "stable" && (
          <BrutalBadge
            variant="emerald"
            size="sm"
            icon={<Radio className="w-3.5 h-3.5 text-emerald-900 animate-pulse" strokeWidth={2.25} />}
          >
            Sinyal Stabil ({partnerName || "Pasangan"})
          </BrutalBadge>
        )}
      </div>

      {/* Right: Actions (Copy Link & Toggle Simulated Partner) */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Toggle Simulated Partner Button */}
        <BrutalButton
          variant={isSimulatedPartner ? "neutral" : "violet"}
          size="sm"
          onClick={handleToggleSimulatedPartner}
          icon={<Sparkles className="w-3.5 h-3.5" strokeWidth={2.25} />}
        >
          {isSimulatedPartner ? "Putuskan Simulasi" : "Simulasi Pasangan"}
        </BrutalButton>

        {/* Copy Share Link Button */}
        <BrutalButton
          variant="amber"
          size="sm"
          onClick={handleCopyLink}
          icon={
            isCopied ? (
              <Check className="w-3.5 h-3.5 text-emerald-800" strokeWidth={2.25} />
            ) : (
              <Copy className="w-3.5 h-3.5" strokeWidth={2.25} />
            )
          }
        >
          {isCopied ? "Link Tersalin!" : "Salin Link Undangan"}
        </BrutalButton>
      </div>
    </div>
  );
}
