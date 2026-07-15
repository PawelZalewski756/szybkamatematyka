"use client";

import { NavbarClassBadge } from "@/components/NavbarClassBadge";
import { NavbarProBadge } from "@/components/NavbarProBadge";

type NavbarMetaStripProps = {
  showClass: boolean;
  showPro: boolean;
  className?: string;
  compact?: boolean;
};

/** Klasa + Pro w jednym spójnym kapsule. */
export function NavbarMetaStrip({
  showClass,
  showPro,
  className = "",
  compact = false,
}: NavbarMetaStripProps) {
  if (!showClass && !showPro) return null;

  return (
    <div
      className={`inline-flex min-w-0 shrink-0 items-center rounded-full border border-surface-border bg-white/[0.03] ${
        compact ? "p-0" : "p-0.5"
      } ${className}`}
    >
      {showClass ? (
        <NavbarClassBadge
          linkToProfile
          inline
          className={compact ? "!px-2 !py-0.5 !text-[10px]" : undefined}
        />
      ) : null}
      {showClass && showPro ? (
        <span className="h-3 w-px shrink-0 bg-surface-border" aria-hidden />
      ) : null}
      {showPro ? (
        <NavbarProBadge
          linkToProfile
          inline
          className={compact ? "!px-2 !py-0.5 !text-[10px]" : undefined}
        />
      ) : null}
    </div>
  );
}
