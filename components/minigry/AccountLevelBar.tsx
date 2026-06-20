"use client";

import { calculateLevel, calculateXpProgress } from "@/lib/levelSystem";

type AccountLevelBarProps = {
  level: number;
  xp: number;
  subtitle?: string;
};

export function AccountLevelBar({
  xp,
  subtitle = "Konto",
}: AccountLevelBarProps) {
  const level = calculateLevel(xp);
  const { currentLevelXp, xpForNextLevel } = calculateXpProgress(xp);
  const percent =
    xpForNextLevel > 0
      ? Math.min(100, (currentLevelXp / xpForNextLevel) * 100)
      : 100;

  return (
    <div className="rounded-2xl border border-orange-500/30 bg-zinc-900/80 p-4 shadow-lg shadow-amber-500/10 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-gradient-to-br bg-brand-gradient px-2.5 py-1 text-sm font-black text-white shadow-md shadow-orange-500/30">
            LVL {level}
          </span>
          <span className="text-sm font-semibold text-zinc-400">{subtitle}</span>
        </div>
        <span className="text-sm font-bold tabular-nums text-emerald-400">
          {currentLevelXp} / {xpForNextLevel} XP
        </span>
      </div>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-amber-500 transition-[width] duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
