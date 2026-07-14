"use client";

import Link from "next/link";

type NavbarProBadgeProps = {
  className?: string;
  linkToProfile?: boolean;
};

export function NavbarProBadge({
  className = "",
  linkToProfile = false,
}: NavbarProBadgeProps) {
  const badge = (
    <span
      className={`inline-flex shrink-0 items-center rounded-lg border border-orange-400/35 bg-gradient-to-r from-orange-500/20 to-amber-500/15 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-orange-200 sm:text-xs ${className}`}
      title="Plan Pro — pełny dostęp"
    >
      Pro
    </span>
  );

  if (linkToProfile) {
    return (
      <Link
        href="/profil#plan"
        className="shrink-0 transition hover:opacity-90"
        aria-label="Masz plan Pro. Szczegóły w profilu."
      >
        {badge}
      </Link>
    );
  }

  return badge;
}
