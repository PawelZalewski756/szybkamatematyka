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
      className={`inline-flex shrink-0 items-center rounded-lg border border-white/10 bg-white/[0.03] p-0.5 transition-colors hover:border-teal-500/25 hover:bg-teal-500/5 ${className}`}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-600/90 text-xs font-bold text-white">
        {initial}
      </span>
      <span className="hidden text-xs font-bold tabular-nums text-slate-300 sm:inline">
        {level}
      </span>
      {profile.streak >= 2 ? (
        <span className="text-[10px] font-bold text-amber-400/90" title="Seria dni">
          🔥{profile.streak}
        </span>
      ) : null}
    </Link>
  );
}
