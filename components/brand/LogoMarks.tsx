"use client";

import { useId, type SVGProps } from "react";

export type LogoMarkVariant =
  | "brand"
  | "bar"
  | "monogram"
  | "equal"
  | "rise"
  | "delta";

export type LogoMarkProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

const TEAL = "#f4b740";
const TEAL_LIGHT = "#ffd479";
const SLATE = "#a79d8a";
const WHITE = "#f6f1e7";
const BG = "#1a1712";
const ON_ACCENT = "#1a1200";

/** Znak marki — bursztynowy kafelek z pierwiastkiem. Czytelny „matematyczny” symbol. */
export function LogoMarkBrand({ size = 24, className, ...props }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden
      {...props}
    >
      <rect x="1" y="1" width="30" height="30" rx="8" fill={TEAL} />
      <rect
        x="1"
        y="1"
        width="30"
        height="30"
        rx="8"
        fill="none"
        stroke={TEAL_LIGHT}
        strokeOpacity="0.5"
        strokeWidth="1"
      />
      <path
        d="M6.5 16.5 L10 18 L13.5 24 L21 9 H26"
        stroke={ON_ACCENT}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LogoMarkBar({ size = 24, className, ...props }: LogoMarkProps) {
  const w = Math.round(size * (4 / 24));
  return (
    <svg
      width={w}
      height={size}
      viewBox="0 0 4 24"
      fill="none"
      className={className}
      aria-hidden
      {...props}
    >
      <rect width="4" height="24" rx="2" fill={TEAL} fillOpacity="0.85" />
    </svg>
  );
}

export function LogoMarkMonogram({
  size = 24,
  className,
  ...props
}: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden
      {...props}
    >
      <rect width="32" height="32" rx="8" fill={BG} stroke="rgba(255,255,255,0.08)" />
      <rect x="7" y="7" width="3" height="18" rx="1.5" fill={TEAL} />
      <text
        x="13"
        y="22"
        fontFamily="system-ui, Segoe UI, sans-serif"
        fontSize="14"
        fontWeight="700"
        fill={WHITE}
      >
        sm
      </text>
    </svg>
  );
}

export function LogoMarkEqual({ size = 24, className, ...props }: LogoMarkProps) {
  const gid = useId().replace(/:/g, "");
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden
      {...props}
    >
      <rect x="4" y="9" width="24" height="2.5" rx="1.25" fill={SLATE} fillOpacity="0.45" />
      <rect x="4" y="20.5" width="24" height="2.5" rx="1.25" fill={SLATE} fillOpacity="0.45" />
      <rect x="8" y="14.25" width="20" height="3" rx="1.5" fill={`url(#${gid})`} />
      <defs>
        <linearGradient id={gid} x1="8" y1="15" x2="28" y2="15">
          <stop stopColor={TEAL} />
          <stop offset="1" stopColor={TEAL_LIGHT} />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function LogoMarkRise({ size = 24, className, ...props }: LogoMarkProps) {
  const gid = useId().replace(/:/g, "");
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden
      {...props}
    >
      <path
        d="M8 24V12"
        stroke={SLATE}
        strokeOpacity="0.35"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M8 24H24"
        stroke={SLATE}
        strokeOpacity="0.35"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M10 20 L16 14 L20 17 L26 8"
        stroke={`url(#${gid})`}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="26" cy="8" r="2.5" fill={TEAL_LIGHT} />
      <defs>
        <linearGradient id={gid} x1="10" y1="20" x2="26" y2="8">
          <stop stopColor={TEAL} />
          <stop offset="1" stopColor={TEAL_LIGHT} />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function LogoMarkDelta({ size = 24, className, ...props }: LogoMarkProps) {
  const gid = useId().replace(/:/g, "");
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden
      {...props}
    >
      <path
        d="M16 6 L28 26 H4 Z"
        stroke={SLATE}
        strokeOpacity="0.25"
        strokeWidth="1.5"
        fill="none"
      />
      <path d="M16 9 L25 24 H7 Z" fill={`url(#${gid})`} />
      <path d="M16 14 L21 22 H11 Z" fill={BG} fillOpacity="0.65" />
      <defs>
        <linearGradient id={gid} x1="16" y1="9" x2="16" y2="24">
          <stop stopColor={TEAL} />
          <stop offset="1" stopColor={TEAL_LIGHT} />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function LogoMark({
  variant = "brand",
  ...props
}: LogoMarkProps & { variant?: LogoMarkVariant }) {
  switch (variant) {
    case "bar":
      return <LogoMarkBar {...props} />;
    case "monogram":
      return <LogoMarkMonogram {...props} />;
    case "equal":
      return <LogoMarkEqual {...props} />;
    case "rise":
      return <LogoMarkRise {...props} />;
    case "delta":
      return <LogoMarkDelta {...props} />;
    default:
      return <LogoMarkBrand {...props} />;
  }
}
