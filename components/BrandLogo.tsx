import { LogoMark, type LogoMarkVariant } from "@/components/brand/LogoMarks";
import { BRAND_NAME, DEFAULT_LOGO_MARK } from "@/lib/brand/constants";
import Link from "next/link";

type BrandLogoProps = {
  className?: string;
  asLink?: boolean;
  mark?: LogoMarkVariant;
  /** Rozmiar znaku w px. */
  markSize?: number;
};

function Wordmark() {
  return (
    <span className="whitespace-nowrap text-[13px] font-bold tracking-tight sm:text-[15px] lg:text-[17px]">
      <span className="text-white">szybka</span>
      <span className="font-normal text-slate-600">·</span>
      <span className="font-semibold text-slate-300">matematyka</span>
    </span>
  );
}

export function BrandLogo({
  className = "",
  asLink = true,
  mark = DEFAULT_LOGO_MARK,
  markSize = 32,
}: BrandLogoProps) {
  const inner = (
    <span
      className={`group inline-flex min-w-0 items-center gap-2 ${className}`}
      title={BRAND_NAME}
    >
      <LogoMark
        variant={mark}
        size={markSize}
        className="shrink-0 transition-opacity group-hover:opacity-90"
      />
      <Wordmark />
    </span>
  );

  if (!asLink) return inner;

  return (
    <Link
      href="/"
      className="shrink-0 rounded-lg outline-offset-4 transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-teal-500/50"
      aria-label={BRAND_NAME}
    >
      {inner}
    </Link>
  );
}

export { LogoMark, type LogoMarkVariant } from "@/components/brand/LogoMarks";
