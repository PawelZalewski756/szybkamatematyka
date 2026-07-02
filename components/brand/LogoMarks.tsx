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

const TEAL = "#14b8a6";
const TEAL_LIGHT = "#5eead4";
const SLATE = "#94a3b8";
const WHITE = "#f8fafc";
const BG = "#0a0f14";

/** Znak marki — czytelny stoper z „=” w jednym kolorze. */
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
      {/* górne ucho stopera */}
      <path
        d="M12 7.5C12 4.2 20 4.2 20 7.5"
        stroke={TEAL}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* przycisk startu */}
      <rect x="13.75" y="6.75" width="4.5" height="2.75" rx="1.375" fill={TEAL} />
      <path d="M16 9.5V11.25" stroke={TEAL} strokeWidth="2" strokeLinecap="round" />

      {/* koperta — grubsza obwódka jak stoper */}
      <circle cx="16" cy="20" r="11.75" fill="#121a24" stroke={TEAL} strokeWidth="2.25" />
      <circle
        cx="16"
        cy="20"
        r="9.25"
        stroke={SLATE}
        strokeOpacity="0.22"
        strokeWidth="0.75"
      />

      {/* boczne koronki */}
      <rect x="2.25" y="18.25" width="3.25" height="4" rx="1.25" fill={TEAL} />
      <rect x="26.5" y="18.25" width="3.25" height="4" rx="1.25" fill={TEAL} />

      {/* znaczniki 12 / 6 */}
      <path d="M16 10.5V12" stroke={SLATE} strokeOpacity="0.5" strokeWidth="1.25" strokeLinecap="round" />
      <path d="M16 28V29.5" stroke={SLATE} strokeOpacity="0.5" strokeWidth="1.25" strokeLinecap="round" />

      {/* środek: = w jednym kolorze */}
      <rect x="10.25" y="17.1" width="11.5" height="2.35" rx="1.175" fill={TEAL} />
      <rect x="10.25" y="21.15" width="11.5" height="2.35" rx="1.175" fill={TEAL} />
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
