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
    <span className="min-w-0 truncate text-[11px] font-extrabold leading-tight tracking-tight text-foreground sm:text-xs lg:text-sm xl:text-[15px]">
      szybka
      <span className="font-bold text-accent"> · </span>
      <span className="font-semibold text-muted">matematyka</span>
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
      className={`group inline-flex min-w-0 max-w-full items-center gap-2 ${className}`}
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
      className="min-w-0 max-w-full shrink overflow-hidden rounded-lg outline-offset-4 transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-brand"
      aria-label={BRAND_NAME}
    >
      {inner}
    </Link>
  );
}

export { LogoMark, type LogoMarkVariant } from "@/components/brand/LogoMarks";
