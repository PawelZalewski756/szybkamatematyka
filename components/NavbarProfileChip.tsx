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
      className={`inline-flex min-w-0 max-w-[9.5rem] shrink-0 items-center gap-2 rounded-full px-1.5 py-1 transition-colors hover:bg-white/[0.06] sm:max-w-[11rem] ${className}`}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent ring-1 ring-accent/25">
        {initial}
      </span>
      <span className="hidden min-w-0 flex-col leading-tight md:flex">
        <span className="truncate text-xs font-semibold text-foreground">{nick}</span>
        <span className="text-[10px] font-medium text-muted">Poziom {level}</span>
      </span>
      <span className="rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-foreground md:hidden">
        {level}
      </span>
    </Link>
  );
}
