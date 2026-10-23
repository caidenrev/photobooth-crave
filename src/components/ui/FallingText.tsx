import React from "react";

export interface FallingTextProps {
  /** Teks yang dipecah per kata; tiap kata jatuh bergantian */
  text: string;
  /** Jeda awal sebelum kata pertama jatuh (ms) */
  delay?: number;
  /** Jeda antar kata (ms) */
  step?: number;
}

/**
 * Efek tulisan jatuh slow-motion per kata. Hanya menambah animasi —
 * style teks tetap diwarisi dari elemen induk.
 */
export function FallingText({ text, delay = 0, step = 70 }: FallingTextProps) {
  const words = text.trim().split(/\s+/);
  return (
    <>
      {words.map((word, i) => (
        <React.Fragment key={i}>
          <span
            className="sb-fall inline-block"
            style={{ "--sb-delay": `${delay + i * step}ms` } as React.CSSProperties}
          >
            {word}
          </span>
          {i < words.length - 1 && " "}
        </React.Fragment>
      ))}
    </>
  );
}

/** Style delay untuk elemen utuh yang memakai class `sb-fall` */
export function fallDelay(ms: number): React.CSSProperties {
  return { "--sb-delay": `${ms}ms` } as React.CSSProperties;
}
