"use client";

import { useState, type ComponentType } from "react";
import {
  Award,
  BarChart3,
  CalendarCheck,
  Flame,
  Loader2,
  Sparkles,
  Swords,
  Target,
  Trophy,
} from "lucide-react";
import { LevelBadge } from "@/components/gaming/LevelBadge";
import { useProfileStats } from "@/lib/profile-stats/use-profile-stats";
import type { ActivityPoint } from "@/lib/profile-stats/types";
import type { Profile } from "@/lib/supabase/profiles";

function streakLabel(days: number): string {
  if (days <= 0) return "0 dni";
  if (days === 1) return "1 dzień";
  return `${days} dni`;
}

function KpiTile({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: ComponentType<{ className?: string }>;
  accent: "amber" | "cyan" | "orange" | "emerald" | "yellow";
}) {
  const iconColor =
    accent === "amber"
      ? "text-accent"
      : accent === "cyan"
        ? "text-accent"
        : accent === "orange"
          ? "text-accent"
          : accent === "emerald"
            ? "text-success"
            : "text-yellow-400";

  return (
    <div className="rounded-2xl border border-surface-border bg-white/5 p-3 backdrop-blur-md sm:p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted sm:text-xs">
          {label}
        </p>
        <Icon className={`h-3.5 w-3.5 shrink-0 ${iconColor}`} aria-hidden />
      </div>
      <p className="mt-1.5 text-lg font-black text-white sm:text-xl">{value}</p>
      {sub && (
        <p className="mt-0.5 text-[10px] font-semibold text-muted sm:text-xs">
          {sub}
        </p>
      )}
    </div>
  );
}

function ActivityBarChart({ points }: { points: ActivityPoint[] }) {
  const activeCount = points.filter((p) => p.active).length;

  return (
    <div className="mt-3">
      <div
        className="flex h-28 items-end justify-between gap-1 sm:gap-1.5"
        role="img"
        aria-label={`Aktywność: ${activeCount} z ${points.length} dni aktywnych`}
      >
        {points.map((point) => (
          <div
            key={point.date}
            className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
            title={`${point.label}${point.active ? " — aktywny" : " — brak aktywności"}`}
          >
            <div className="flex h-20 w-full items-end justify-center">
              {point.active ? (
                <div className="w-full max-w-[2rem] rounded-t-md bg-accent shadow-[0_0_12px_rgba(244,183,64,0.25)] transition-[height] duration-500 sm:max-w-none" style={{ height: "100%" }} />
              ) : (
                <div className="h-2 w-full max-w-[2rem] rounded-full bg-surface-hover sm:max-w-none" />
              )}
            </div>
            <span className="w-full truncate text-center text-[8px] font-semibold text-muted sm:text-[9px]">
              {point.label.split(" ")[0]}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-center text-xs font-semibold text-muted">
        {activeCount} / {points.length} dni aktywnych
      </p>
    </div>
  );
}

export type ProfileStatsSectionProps = {
  profile: Profile;
  userId: string;
  solvedCount: number;
};

/**
 * Sekcja „Twój postęp" — KPI + wykres aktywności. Additywna, nie dotyka planu
 * ani osiągnięć.
 */
export function ProfileStatsSection({
  profile,
  userId,
  solvedCount,
}: ProfileStatsSectionProps) {
  const { ready, stats } = useProfileStats(profile, userId, solvedCount);
  const [range, setRange] = useState<7 | 14>(7);

  const xpPercent =
    stats && stats.xpForNextLevel > 0
      ? Math.round((stats.currentLevelXp / stats.xpForNextLevel) * 100)
      : 0;

  const activityPoints =
    stats && range === 14 ? stats.activity14 : stats?.activity7;

  return (
    <section className="mt-8" aria-labelledby="profile-stats-heading">
      <div className="rounded-3xl border border-surface-border bg-white/5 p-5 backdrop-blur-xl sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
            <BarChart3 className="h-4 w-4 text-accent" aria-hidden />
            <span id="profile-stats-heading">Twój postęp</span>
          </div>
          {!ready && (
            <Loader2
              className="h-4 w-4 animate-spin text-muted"
              aria-label="Ładowanie statystyk"
            />
          )}
        </div>

        {!ready ? (
          <div className="mt-6 flex flex-col items-center gap-3 py-8 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
            <p className="text-sm font-semibold text-muted">
              Ładowanie statystyk…
            </p>
          </div>
        ) : stats ? (
          <>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
              <KpiTile
                label="Zadania"
                value={String(stats.solvedCount)}
                sub="rozwiązane"
                icon={Target}
                accent="emerald"
              />
              <KpiTile
                label="XP"
                value={stats.xp.toLocaleString("pl-PL")}
                sub="łącznie"
                icon={Sparkles}
                accent="cyan"
              />
              <KpiTile
                label="Poziom"
                value={`Poziom ${stats.level}`}
                sub="na koncie"
                icon={Trophy}
                accent="amber"
              />
              <KpiTile
                label="Seria"
                value={streakLabel(stats.streak)}
                sub={
                  stats.streak >= 2 ? "🔥 seria nauki" : "ćwicz dziś, aby podtrzymać serię"
                }
                icon={Flame}
                accent="orange"
              />
              <KpiTile
                label="Wyzwania"
                value={String(stats.challengesCompleted)}
                sub="ukończone dziennie"
                icon={CalendarCheck}
                accent="orange"
              />
              <KpiTile
                label="Pojedynki"
                value={`${stats.duelStats.wins} / ${stats.duelStats.played}`}
                sub={
                  stats.duelStats.played > 0
                    ? `${stats.duelStats.winRate}% wygranych`
                    : "wygrane / rozegrane"
                }
                icon={Swords}
                accent="emerald"
              />
              <KpiTile
                label="Odznaki"
                value={`${stats.achievementsUnlocked} / ${stats.achievementsTotal}`}
                sub="zdobyte"
                icon={Award}
                accent="yellow"
              />
            </div>

            <div className="mt-5 rounded-2xl border border-surface-border bg-white/5 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-wider text-muted">
                  Postęp do poziomu {stats.level + 1}
                </p>
                <LevelBadge level={stats.level} />
              </div>
              <div className="mt-2 flex items-center justify-between text-sm font-bold tabular-nums">
                <span className="text-muted">
                  {stats.currentLevelXp} / {stats.xpForNextLevel} XP
                </span>
                <span className="text-accent">{xpPercent}%</span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-surface-hover">
                <div
                  className="progress-accent"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-surface-border bg-white/5 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-wider text-muted">
                  Aktywność
                </p>
                <div className="flex gap-1 rounded-xl bg-surface/80 p-0.5">
                  <button
                    type="button"
                    onClick={() => setRange(7)}
                    className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wide transition sm:text-xs ${
                      range === 7
                        ? "filter-chip-active"
                        : "filter-chip"
                    }`}
                  >
                    7 dni
                  </button>
                  <button
                    type="button"
                    onClick={() => setRange(14)}
                    className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wide transition sm:text-xs ${
                      range === 14
                        ? "filter-chip-active"
                        : "filter-chip"
                    }`}
                  >
                    14 dni
                  </button>
                </div>
              </div>

              {activityPoints && activityPoints.length > 0 ? (
                stats.hasActivityHistory ? (
                  <ActivityBarChart points={activityPoints} />
                ) : (
                  <div className="mt-4 rounded-xl border border-dashed border-surface-border bg-surface/40 px-4 py-6 text-center">
                    <p className="text-sm font-semibold text-muted">
                      Historia aktywności buduje się od pierwszych wizyt
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      XP, seria i rozwiązane zadania są już widoczne powyżej.
                      Wykres wypełni się, gdy zaczniesz regularnie grać.
                    </p>
                  </div>
                )
              ) : null}
            </div>
          </>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-surface-border px-4 py-6 text-center">
            <p className="text-sm font-semibold text-muted">
              Brak danych statystycznych
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
