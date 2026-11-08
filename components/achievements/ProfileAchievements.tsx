"use client";

import Link from "next/link";
import { Trophy } from "lucide-react";
import { AchievementGlyph } from "@/components/achievements/achievement-icon";
import { ACHIEVEMENTS } from "@/lib/achievements/catalog";
import { useAchievements } from "@/lib/achievements/use-achievements";

const MAX_PREVIEW = 8;

/**
 * Zwięzła sekcja „Osiągnięcia" do dashboardu profilu. Additywna - korzysta z
 * własnego hooka (te same źródła co strona /osiagniecia), nie dotyka istniejących
 * danych profilu.
 */
export function ProfileAchievements() {
  const { ready, statuses, unlockedCount, total } = useAchievements();

  const unlockedSet = new Set(
    statuses.filter((s) => s.unlocked).map((s) => s.id),
  );

  // Najpierw odblokowane (w kolejności katalogu), potem najbliższe do zdobycia.
  const preview = [...ACHIEVEMENTS]
    .sort((a, b) => {
      const au = unlockedSet.has(a.id) ? 0 : 1;
      const bu = unlockedSet.has(b.id) ? 0 : 1;
      if (au !== bu) return au - bu;
      const ap = statuses.find((s) => s.id === a.id)?.percent ?? 0;
      const bp = statuses.find((s) => s.id === b.id)?.percent ?? 0;
      return bp - ap;
    })
    .slice(0, MAX_PREVIEW);

  const percent = total > 0 ? Math.round((unlockedCount / total) * 100) : 0;

  return (
    <section className="mt-8">
      <div className="rounded-3xl border border-surface-border bg-foreground/5 p-5 backdrop-blur-xl sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
            <Trophy className="h-4 w-4 text-yellow-400" aria-hidden />
            Osiągnięcia
          </div>
          <Link
            href="/osiagniecia"
            className="text-xs font-bold text-accent transition hover:text-accent"
          >
            Zobacz wszystkie →
          </Link>
        </div>

        <div className="mt-3 flex items-center justify-between text-sm font-bold">
          <span className="text-foreground">
            {ready ? `${unlockedCount} / ${total} zdobytych` : "Ładowanie…"}
          </span>
          <span className="tabular-nums text-accent">{percent}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-hover">
          <div
            className="progress-accent"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {preview.map((a) => {
            const unlocked = unlockedSet.has(a.id);
            return (
              <div
                key={a.id}
                title={`${a.title} - ${unlocked ? "zdobyte" : a.description}`}
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  unlocked
                    ? "bg-accent text-on-accent shadow-md"
                    : "bg-surface-hover text-muted"
                }`}
              >
                <AchievementGlyph icon={a.icon} className="h-5 w-5" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
