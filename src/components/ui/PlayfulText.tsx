"use client";

import React, { useRef } from "react";

export interface PlayfulTextProps {
  /** Teks yang dipecah per huruf */
  text: string;
  /** Jeda awal sebelum huruf pertama jatuh (ms) */
  delay?: number;
  /** Jeda jatuh antar huruf (ms) */
  step?: number;
  /** Goyang gelombang terus-menerus — pakai hanya untuk judul hero dekoratif */
  wave?: boolean;
}

const FALL_DURATION_MS = 900;
const SPRING_BACK = "transform 900ms cubic-bezier(0.34, 1.8, 0.5, 1)";

/**
 * Huruf interaktif: jatuh saat muncul, melompat saat di-hover, dan bisa di-drag
 * lalu memantul kembali ke tempatnya. Goyang gelombang hanya bila `wave` aktif.
 * Style teks tetap diwarisi dari elemen induk.
 */
export function PlayfulText({ text, delay = 0, step = 25, wave = false }: PlayfulTextProps) {
  const drag = useRef<{ el: HTMLElement; x: number; y: number; moved: boolean } | null>(null);
  // true bila pointer terakhir benar-benar menggeser huruf → klik berikutnya dibatalkan
  const justDragged = useRef(false);

  const onPointerDown = (e: React.PointerEvent<HTMLSpanElement>) => {
    const el = e.currentTarget;
    // Cegah drag native link/seleksi teks saat huruf berada di dalam <a>
    e.preventDefault();
    el.setPointerCapture(e.pointerId);
    drag.current = { el, x: e.clientX, y: e.clientY, moved: false };
    justDragged.current = false;
    el.style.transition = "none";
    el.style.zIndex = "20";
    el.style.cursor = "grabbing";
  };

  const onPointerMove = (e: React.PointerEvent<HTMLSpanElement>) => {
    const d = drag.current;
    if (!d || d.el !== e.currentTarget) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true;
    const tilt = Math.max(-25, Math.min(25, dx * 0.15));
    d.el.style.transform = `translate(${dx}px, ${dy}px) rotate(${tilt}deg) scale(1.15)`;
  };

  const release = (e: React.PointerEvent<HTMLSpanElement>) => {
    const d = drag.current;
    if (!d || d.el !== e.currentTarget) return;
    drag.current = null;
    justDragged.current = d.moved;
    d.el.style.transition = SPRING_BACK;
    d.el.style.transform = "";
    d.el.style.cursor = "";
    setTimeout(() => {
      d.el.style.zIndex = "";
      d.el.style.transition = "";
    }, 900);
  };

  // Huruf di dalam link: selesai drag tidak boleh memicu navigasi
  const onClickCapture = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (!justDragged.current) return;
    justDragged.current = false;
    e.preventDefault();
    e.stopPropagation();
  };

  let letterIndex = 0;
  const words = text.trim().split(/\s+/);

  return (
    <>
      <span className="sr-only">{text}</span>
      {words.map((word, w) => (
        <React.Fragment key={w}>
          {/* Satu kata tidak terpotong ke baris berikutnya */}
          <span aria-hidden="true" className="inline-block whitespace-nowrap">
            {Array.from(word).map((char, c) => {
              const i = letterIndex++;
              const fallDelay = delay + i * step;
              return (
                <span
                  key={c}
                  className="sb-fall inline-block"
                  style={{ "--sb-delay": `${fallDelay}ms` } as React.CSSProperties}
                >
                  <span
                    className={wave ? "sb-wave" : "inline-block"}
                    style={
                      wave
                        ? ({
                            "--sb-wave-delay": `${fallDelay + FALL_DURATION_MS + i * 90}ms`,
                          } as React.CSSProperties)
                        : undefined
                    }
                  >
                    <span
                      className="sb-letter"
                      onPointerDown={onPointerDown}
                      onPointerMove={onPointerMove}
                      onPointerUp={release}
                      onPointerCancel={release}
                      onClickCapture={onClickCapture}
                    >
                      {char}
                    </span>
                  </span>
                </span>
              );
            })}
          </span>
          {w < words.length - 1 && " "}
        </React.Fragment>
      ))}
    </>
  );
}
