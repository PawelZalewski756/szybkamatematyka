"use client";

import { formatCompactXp } from "@/lib/format/compact-number";
import { calculateLevel, calculateXpProgress } from "@/lib/levelSystem";
import type { Profile } from "@/lib/supabase/profiles";

type NavbarProfileStatsProps = {
  profile: Profile;
  /** Zwarty układ na telefon — nick, lvl i pasek XP w jednym rzędzie navbara. */
  compact?: boolean;
  /** Zwarty blok w prawej kolumnie navbara (desktop), bez rozpychania linków. */
  dense?: boolean;
  className?: string;
};

function displayNick(profile: Profile): string {
  const nick = profile.nick.trim();
  return nick || "Profil";
}

export function NavbarProfileStats({
  profile,
  compact = false,
  dense = false,
  className = "",
}: NavbarProfileStatsProps) {
  const { currentLevelXp, xpForNextLevel } = calculateXpProgress(profile.xp);
  const level = calculateLevel(profile.xp);
  const xpPercent =
    xpForNextLevel > 0
      ? Math.min(100, (currentLevelXp / xpForNextLevel) * 100)
      : 100;
  const nick = displayNick(profile);
  const totalXpLabel = formatCompactXp(profile.xp);

  const levelBadge = (
    <span className="whitespace-nowrap flex-shrink-0 rounded-md bg-brand-dark px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
      Poz. {level}
    </span>
  );

  const streakBadge =
    profile.streak >= 2 ? (
      <span
        className="whitespace-nowrap flex-shrink-0 text-[10px] font-black text-orange-300"
        title="Seria dni nauki"
      >
        🔥{profile.streak}
      </span>
    ) : null;

  const xpTotalBadge = (
    <span
      className="whitespace-nowrap flex-shrink-0 text-[10px] font-bold tabular-nums text-emerald-400"
      title={`${profile.xp.toLocaleString("pl-PL")} XP łącznie`}
    >
      {totalXpLabel}
    </span>
  );

  const xpBar = (barClass: string) => (
    <div className="flex min-w-0 items-center gap-1.5">
      <div
        className={`min-w-[2.5rem] flex-1 overflow-hidden rounded-full bg-surface-border ${barClass}`}
      >
        <div
          className="h-full rounded-full bg-brand transition-[width] duration-500"
          style={{ width: `${xpPercent}%` }}
        />
      </div>
      {!compact && !dense && (
        <span className="whitespace-nowrap flex-shrink-0 text-[10px] font-medium tabular-nums text-muted">
          {currentLevelXp} / {xpForNextLevel} XP
        </span>
      )}
    </div>
  );

  if (compact) {
    return (
      <div
        className={`flex min-w-0 flex-1 flex-col justify-center gap-0.5 overflow-hidden ${className}`}
      >
        <div className="flex min-w-0 items-center gap-1.5 overflow-hidden">
          <span className="min-w-0 truncate text-xs font-semibold text-foreground">
            {nick}
          </span>
          {levelBadge}
          {xpTotalBadge}
          {streakBadge}
        </div>
        {xpBar("h-1")}
      </div>
    );
  }

  if (dense) {
    return (
      <div
        className={`flex w-[8.5rem] shrink-0 flex-col justify-center gap-0.5 overflow-hidden lg:w-[9rem] ${className}`}
        title={nick}
      >
        <div className="flex items-center gap-1 overflow-hidden">
          {levelBadge}
          {xpTotalBadge}
          {streakBadge}
        </div>
        {xpBar("h-1")}
      </div>
    );
  }

  return (
    <div
      className={`flex min-w-0 max-w-[min(100%,22rem)] flex-col gap-1 border-l border-surface-border pl-3 sm:pl-4 ${className}`}
    >
      <div className="flex min-w-0 items-center gap-2 overflow-hidden">
        <span className="min-w-0 truncate text-sm font-semibold text-foreground sm:text-base">
          {nick}
        </span>
        <span className="whitespace-nowrap flex-shrink-0 rounded-md bg-brand-dark px-2 py-0.5 text-xs font-semibold text-white">
          Poz. {level}
        </span>
        <span
          className="whitespace-nowrap flex-shrink-0 text-xs font-bold tabular-nums text-emerald-400"
          title={`${profile.xp.toLocaleString("pl-PL")} XP łącznie`}
        >
          {totalXpLabel}
        </span>
        {profile.streak >= 2 && (
          <span
            className="whitespace-nowrap flex-shrink-0 rounded-md border border-orange-500/40 bg-orange-500/15 px-2 py-0.5 text-xs font-black text-orange-300"
            title="Seria dni nauki"
          >
            🔥 {profile.streak}
          </span>
        )}
      </div>

      {xpBar("h-1.5")}
    </div>
  );
}
