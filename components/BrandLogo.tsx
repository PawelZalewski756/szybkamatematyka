import { LogoMark, type LogoMarkVariant } from "@/components/brand/LogoMarks";
import { BRAND_NAME } from "@/lib/brand/constants";
import Link from "next/link";

type BrandLogoProps = {
  className?: string;
  /** Krótszy układ w navbarze na mobile. */
  compact?: boolean;
  asLink?: boolean;
  /** Wariant znaku graficznego — domyślnie „bar” (obecny). */
  mark?: LogoMarkVariant;
};

function Wordmark({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <span className="truncate text-[15px] font-bold tracking-tight">
        <span className="text-white">szybka</span>
        <span className="text-slate-600">·</span>
        <span className="text-slate-300">mat</span>
      </span>
    );
  }

  return (
    <span className="whitespace-nowrap text-base font-bold tracking-tight lg:text-[17px]">
      <span className="text-white">szybka</span>
      <span className="font-normal text-slate-600">·</span>
      <span className="font-semibold text-slate-300">matematyka</span>
    </span>
  );
}

export function BrandLogo({
  className = "",
  compact = false,
  asLink = true,
  mark = "bar",
}: BrandLogoProps) {
  const inner = (
    <span
      className={`group inline-flex min-w-0 items-center gap-2 ${className}`}
      title={BRAND_NAME}
    >
      <LogoMark
        variant={mark}
        size={24}
        className="shrink-0 transition-opacity group-hover:opacity-90"
      />
      <Wordmark compact={compact} />
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

/** Eksport wariantów do podglądu / faviconów. */
export { LogoMark, type LogoMarkVariant } from "@/components/brand/LogoMarks";
