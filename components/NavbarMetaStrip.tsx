"use client";

import { NavbarClassBadge } from "@/components/NavbarClassBadge";
import { NavbarProBadge } from "@/components/NavbarProBadge";

type NavbarMetaStripProps = {
  showClass: boolean;
  showPro: boolean;
  className?: string;
};

/** Klasa + Pro w jednym spójnym kapsule. */
export function NavbarMetaStrip({
  showClass,
  showPro,
  className = "",
}: NavbarMetaStripProps) {
  if (!showClass && !showPro) return null;

  return (
    <div
      className={`hidden items-center rounded-full border border-surface-border bg-white/[0.03] p-0.5 sm:inline-flex ${className}`}
    >
      {showClass ? (
        <NavbarClassBadge linkToProfile inline />
      ) : null}
      {showClass && showPro ? (
        <span className="h-3.5 w-px shrink-0 bg-surface-border" aria-hidden />
      ) : null}
      {showPro ? <NavbarProBadge linkToProfile inline /> : null}
    </div>
  );
}
