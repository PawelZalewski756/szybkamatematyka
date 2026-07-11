"use client";

type AccountLevelBarProps = {
  level: number;
  xp: number;
  subtitle?: string;
};

export function AccountLevelBar({ level, xp, subtitle }: AccountLevelBarProps) {
  const xpInLevel = xp % 100;
  const pct = Math.min(100, Math.max(0, xpInLevel));

  return (
    <div className="game-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-accent px-2.5 py-1 text-sm font-black text-on-accent">
            Lv.{level}
          </span>
          <span className="text-sm font-semibold text-muted">{subtitle}</span>
        </div>
        <span className="text-sm font-bold tabular-nums text-accent">{xp} XP</span>
      </div>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-surface-hover">
        <div className="progress-accent" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
