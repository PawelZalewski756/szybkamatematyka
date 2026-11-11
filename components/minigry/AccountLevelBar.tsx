"use client";

import { calculateXpProgress } from "@/lib/levelSystem";

type AccountLevelBarProps = {
  level: number;
  xp: number;
  subtitle?: string;
};

export function AccountLevelBar({ level, xp, subtitle }: AccountLevelBarProps) {
  const { currentLevelXp, xpForNextLevel } = calculateXpProgress(xp);
  const pct = Math.min(
    100,
    Math.max(0, (currentLevelXp / xpForNextLevel) * 100),
  );

  return (
    <div className="game-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 self-start rounded-lg bg-accent px-2.5 py-1 text-sm font-bold text-on-accent">
            Poz. {level}
          </span>
          {subtitle ? (
            <span className="min-w-0 break-words text-sm leading-tight text-muted">{subtitle}</span>
          ) : null}
        </div>
        <span className="shrink-0 text-sm tabular-nums text-muted">
          {currentLevelXp}/{xpForNextLevel} XP
        </span>
      </div>
      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-surface-hover"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Postęp do następnego poziomu"
      >
        <div className="progress-accent" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
