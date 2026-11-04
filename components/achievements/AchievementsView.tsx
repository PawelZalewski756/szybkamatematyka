"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { GamingBackground } from "@/components/gaming/GamingBackground";
import { AchievementCard } from "@/components/achievements/AchievementCard";
import { AchievementGlyph } from "@/components/achievements/achievement-icon";
import {
  ACHIEVEMENTS,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
} from "@/lib/achievements/catalog";
import { useAchievements } from "@/lib/achievements/use-achievements";
import type {
  AchievementCategory,
  AchievementStatus,
} from "@/lib/achievements/types";

type Filter = "all" | AchievementCategory;

function fireAchievementConfetti() {
  void import("canvas-confetti").then((mod) => {
    const confetti = mod.default;
    confetti({
      particleCount: 140,
      spread: 90,
      origin: { y: 0.5 },
      colors: ["#f4b740", "#e8a830", "#7dcea0", "#f6f1e7", "#a79d8a"],
      disableForReducedMotion: true,
    });
  });
}

export function AchievementsView() {
  const { ready, statuses, unlockedCount, total, newlyUnlocked, markSeen } =
    useAchievements();
  const [filter, setFilter] = useState<Filter>("all");

  const statusById = useMemo(() => {
    const map = new Map<string, AchievementStatus>();
    for (const s of statuses) map.set(s.id, s);
    return map;
  }, [statuses]);

  const newIds = useMemo(
    () => new Set(newlyUnlocked.map((a) => a.id)),
    [newlyUnlocked],
  );

  // Świeżo odblokowane: confetti + automatyczne oznaczenie jako zobaczone.
  useEffect(() => {
    if (newlyUnlocked.length === 0) return;
    fireAchievementConfetti();
    const timer = setTimeout(() => markSeen(), 6000);
    return () => clearTimeout(timer);
  }, [newlyUnlocked, markSeen]);

  const visible = useMemo(
    () =>
      ACHIEVEMENTS.filter(
        (a) => filter === "all" || a.category === filter,
      ),
    [filter],
  );

  const percent = total > 0 ? Math.round((unlockedCount / total) * 100) : 0;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-background">
      <GamingBackground />

      <div className="relative z-10 mx-auto w-full max-w-[1280px] flex-1 px-4 py-8 sm:py-12">
        <header className="flex flex-col items-center text-center">
          <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-accent/90">
            <Trophy className="h-3.5 w-3.5" aria-hidden />
            Osiągnięcia
          </div>
          <h1 className="text-2xl font-black text-foreground sm:text-3xl">
            Twoja gablota odznak
          </h1>
          <p className="mt-2 max-w-md text-sm text-muted">
            Zbieraj odznaki za rozwiązane zadania, serie, wyzwania i minigry.
          </p>

          <div className="mt-5 w-full max-w-md rounded-2xl border border-surface-border bg-foreground/5 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between text-sm font-bold">
              <span className="text-foreground">Zdobyte odznaki</span>
              <span className="tabular-nums text-accent">
                {unlockedCount} / {total}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-hover">
              <div
                className="progress-accent"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </header>

        <AnimatePresence>
          {newlyUnlocked.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mx-auto mt-6 flex max-w-xl flex-col gap-2 rounded-2xl border border-accent/40 bg-accent-soft p-4 backdrop-blur-xl"
            >
              <div className="flex items-center gap-2 text-sm font-black text-accent">
                <Trophy className="h-4 w-4" aria-hidden />
                Nowe odznaki odblokowane!
              </div>
              <div className="flex flex-wrap gap-2">
                {newlyUnlocked.map((a) => (
                  <span
                    key={a.id}
                    className="inline-flex items-center gap-1.5 rounded-full bg-foreground/10 px-3 py-1 text-xs font-bold text-foreground"
                  >
                    <AchievementGlyph icon={a.icon} className="h-3.5 w-3.5" />
                    {a.title}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => markSeen()}
                className="mt-1 self-start text-xs font-bold text-accent transition hover:text-accent"               >
                Super, dzięki!
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <FilterChip
            active={filter === "all"}
            onClick={() => setFilter("all")}
            label="Wszystkie"
          />
          {CATEGORY_ORDER.map((cat) => (
            <FilterChip
              key={cat}
              active={filter === cat}
              onClick={() => setFilter(cat)}
              label={CATEGORY_LABELS[cat]}
            />
          ))}
        </div>

        {!ready ? (
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-2xl border border-surface-border bg-foreground/[0.03]"
                aria-hidden
              />
            ))}
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((achievement) => {
              const status = statusById.get(achievement.id);
              if (!status) return null;
              return (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  status={status}
                  isNew={newIds.has(achievement.id)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`filter-chip ${active ? "filter-chip-active" : ""}`}
    >
      {label}
    </button>
  );
}
