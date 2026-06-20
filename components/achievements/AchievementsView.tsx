"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Trophy } from "lucide-react";
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
      colors: ["#facc15", "#22d3ee", "#d946ef", "#a78bfa", "#34d399"],
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
    <div className="relative flex min-h-0 flex-1 flex-col bg-zinc-950">
      <GamingBackground />

      <div className="relative z-10 mx-auto w-full max-w-[1280px] flex-1 px-4 py-8 sm:py-12">
        <header className="flex flex-col items-center text-center">
          <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-400/90">
            <Trophy className="h-3.5 w-3.5" aria-hidden />
            Osiągnięcia
          </div>
          <h1 className="text-2xl font-black text-white sm:text-3xl">
            Twoja gablota odznak
          </h1>
          <p className="mt-2 max-w-md text-sm text-zinc-400">
            Zbieraj odznaki za rozwiązane zadania, serie, wyzwania i minigry.
          </p>

          <div className="mt-5 w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between text-sm font-bold">
              <span className="text-zinc-300">Zdobyte odznaki</span>
              <span className="tabular-nums text-cyan-300">
                {unlockedCount} / {total}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-violet-500 transition-[width] duration-700"
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
              className="mx-auto mt-6 flex max-w-xl flex-col gap-2 rounded-2xl border border-fuchsia-400/40 bg-gradient-to-b from-fuchsia-500/10 to-zinc-900/70 p-4 backdrop-blur-xl"
            >
              <div className="flex items-center gap-2 text-sm font-black text-fuchsia-200">
                <Sparkles className="h-4 w-4" aria-hidden />
                Nowe odznaki odblokowane!
              </div>
              <div className="flex flex-wrap gap-2">
                {newlyUnlocked.map((a) => (
                  <span
                    key={a.id}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white"
                  >
                    <AchievementGlyph icon={a.icon} className="h-3.5 w-3.5" />
                    {a.title}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => markSeen()}
                className="mt-1 self-start text-xs font-bold text-cyan-300 transition hover:text-cyan-200"
              >
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
                className="h-40 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]"
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
      className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ${
        active
          ? "bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-md shadow-fuchsia-500/25"
          : "border border-white/15 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-cyan-300"
      }`}
    >
      {label}
    </button>
  );
}
