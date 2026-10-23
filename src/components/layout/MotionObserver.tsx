"use client";

import { useEffect } from "react";

const SELECTOR = ".sb-stagger > *, .sb-reveal, .sb-fall";

/** Lanjutkan animasi masuk yang ditahan CSS (paused) milik elemen ini saja. */
function playEntrance(el: Element) {
  el.getAnimations().forEach((animation) => {
    if (animation.playState === "paused") animation.play();
  });
}

/**
 * Menjalankan animasi masuk (.sb-reveal / .sb-stagger / .sb-fall) saat elemen terlihat di layar,
 * termasuk elemen yang baru di-mount (pindah halaman, data realtime, modal).
 *
 * Sengaja TIDAK mengubah className/atribut elemen: halaman yang belum selesai
 * hydrate akan mismatch dengan HTML server. Animasi diputar lewat Web Animations
 * API, yang mengesampingkan `animation-play-state: paused` dari CSS.
 */
export function MotionObserver() {
  useEffect(() => {
    const root = document.documentElement;
    if (typeof IntersectionObserver === "undefined" || !("getAnimations" in Element.prototype)) {
      root.classList.remove("sb-motion");
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        // Tidak di-unobserve: elemen yang di-display:none lalu tampil lagi
        // mendapat animasi baru (paused) yang juga harus diputar.
        for (const entry of entries) {
          if (entry.isIntersecting) playEntrance(entry.target);
        }
      },
      { rootMargin: "0px 0px -6% 0px" }
    );

    const observeWithin = (node: ParentNode) => {
      node.querySelectorAll(SELECTOR).forEach((el) => io.observe(el));
    };

    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches(SELECTOR)) io.observe(node);
          observeWithin(node);
        });
      }
    });

    observeWithin(document);
    mo.observe(document.body, { childList: true, subtree: true });
    root.classList.add("sb-motion", "sb-motion-ready");

    return () => {
      io.disconnect();
      mo.disconnect();
      root.classList.remove("sb-motion", "sb-motion-ready");
    };
  }, []);

  return null;
}
