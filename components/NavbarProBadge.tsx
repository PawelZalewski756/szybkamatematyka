"use client";

import Link from "next/link";

type NavbarProBadgeProps = {
  className?: string;
  linkToProfile?: boolean;
  /** Wspólny styl z klasą w pasku meta. */
  inline?: boolean;
};

export function NavbarProBadge({
  className = "",
  linkToProfile = false,
  inline = false,
}: NavbarProBadgeProps) {
  const badge = (
    <span
      className={
        inline
          ? `inline-flex shrink-0 items-center px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-orange-300 ${className}`
          : `inline-flex shrink-0 items-center rounded-full border border-orange-400/30 bg-orange-500/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-orange-300 ${className}`
      }
      title="Plan Pro - pełny dostęp"
    >
      Pro
    </span>
  );

  if (linkToProfile) {
    return (
      <Link
        href="/profil#plan"
        className="shrink-0 rounded-full transition hover:bg-orange-500/10"
        aria-label="Masz plan Pro. Szczegóły w profilu."
      >
        {badge}
      </Link>
    );
  }

  return badge;
}
