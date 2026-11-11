"use client";

import { useState } from "react";

type ContentImageProps = {
  src: string;
  alt?: string;
  className?: string;
};

const FIGURE_RE = /^(\/cke-matura\/[^/]+\/z\d+)-fig(\d+)\.(?:png|svg)$/;
const MAX_SCANS = 4;

/** Ilustracja z arkusza CKE - bez rozciągania małych rysunków na pełną szerokość. */
export function ContentImage({ src, alt = "", className = "" }: ContentImageProps) {
  const [darkMissing, setDarkMissing] = useState(false);
  const [figureMissing, setFigureMissing] = useState(false);
  const [scanCount, setScanCount] = useState(1);
  const [scansEnded, setScansEnded] = useState(false);

  const rawAlt = alt.trim();
  const caption =
    /^(Rysunek do zadania|Zadanie \d+|Rysunek \d+|Ilustracja do zadania)$/i.test(rawAlt)
      ? ""
      : rawAlt;
  const isFigure = /-fig\d+\.png$/.test(src);
  const imgClass =
    "mx-auto max-h-[min(360px,55vh)] w-auto max-w-full object-contain";
  const figureMatch = FIGURE_RE.exec(src);

  // Brak pliku rysunku: pokazujemy skan zadania (przy rysunku 1), kolejne rysunki ukrywamy.
  if (figureMissing && figureMatch) {
    if (figureMatch[2] !== "1") return null;
    const base = figureMatch[1]!;
    const scans = Array.from({ length: scanCount }, (_, i) => `${base}-${i + 1}.png`);
    return (
      <figure
        className={`my-3 flex flex-col items-center gap-2 rounded-xl border border-surface-border bg-white p-2 ${className}`}
      >
        {scans.map((scan, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={scan}
            src={scan}
            alt="Skan zadania z arkusza CKE"
            loading="lazy"
            decoding="async"
            className="mx-auto h-auto w-auto max-w-full"
            onLoad={() => {
              if (i === scanCount - 1 && !scansEnded && scanCount < MAX_SCANS) {
                setScanCount(scanCount + 1);
              }
            }}
            onError={() => {
              if (i === scanCount - 1 && i > 0) {
                setScansEnded(true);
                setScanCount(scanCount - 1);
              }
            }}
          />
        ))}
      </figure>
    );
  }

  const darkSrc = darkMissing ? src : src.replace(/\.png$/, "-dark.png");

  return (
    <figure
      className={`my-3 flex flex-col items-center rounded-xl border border-surface-border bg-surface p-2 ${className}`}
    >
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        title="Otwórz obrazek w pełnej wielkości"
        className="flex max-w-full justify-center"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={isFigure ? darkSrc : src}
          alt={caption || "Ilustracja do zadania"}
          loading="lazy"
          decoding="async"
          className={isFigure ? `fig-dark ${imgClass}` : imgClass}
          onError={() => {
            if (isFigure && !darkMissing) setDarkMissing(true);
            else setFigureMissing(true);
          }}
        />
        {isFigure ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={caption || "Ilustracja do zadania"}
            loading="lazy"
            decoding="async"
            className={`fig-light hidden ${imgClass}`}
            onError={() => setFigureMissing(true)}
          />
        ) : null}
      </a>
      {caption ? (
        <figcaption className="mt-1.5 max-w-prose text-center text-xs text-muted">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
