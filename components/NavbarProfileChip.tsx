"use client";

import { calculateLevel } from "@/lib/levelSystem";
import type { Profile } from "@/lib/supabase/profiles";
import Link from "next/link";

type NavbarProfileChipProps = {
  profile: Profile;
  className?: string;
};

function displayInitial(profile: Profile): string {
  const nick = profile.nick.trim();
  if (nick) return nick.charAt(0).toUpperCase();
  return "G";
}

export function NavbarProfileChip({ profile, className = "" }: NavbarProfileChipProps) {
  const level = calculateLevel(profile.xp);
  const initial = displayInitial(profile);
  const nick = profile.nick.trim() || "Profil";

  return (
    <Link
      href="/profil"
      title={`${nick} · poziom ${level}`}
      className={`inline-flex shrink-0 items-center gap-1 rounded-lg border border-surface-border bg-surface p-0.5 transition-colors hover:bg-surface-hover ${className}`}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-dark text-xs font-bold text-white">
        {initial}
      </span>
      <span className="hidden text-xs font-semibold tabular-nums text-foreground sm:inline">
        {level}
      </span>
      {profile.streak >= 2 ? (
        <span className="pr-1 text-[10px] font-medium text-muted" title="Seria dni">
          {profile.streak} d.
        </span>
      ) : null}
    </Link>
  );
}
