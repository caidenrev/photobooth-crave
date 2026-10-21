import React, { ViewTransition } from "react";

/**
 * Animasi perpindahan halaman memakai View Transitions API (React <ViewTransition>).
 * - nav-forward / nav-back (dari TransitionLink & useTransitionRouter) → slide berarah
 * - navigasi tanpa tipe (mis. tombol Back browser) → fade biasa
 * Browser tanpa dukungan tetap berpindah halaman normal tanpa animasi.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition
      enter={{
        "nav-forward": "nav-forward",
        "nav-back": "nav-back",
        default: "page-enter",
      }}
      exit={{
        "nav-forward": "nav-forward",
        "nav-back": "nav-back",
        default: "page-exit",
      }}
      default="none"
    >
      {children}
    </ViewTransition>
  );
}
