"use client";

import { LevelBadge } from "@/components/gaming/LevelBadge";
import { formatCompactXp } from "@/lib/format/compact-number";
import type { LeaderboardEntry } from "@/lib/supabase/leaderboard";
import { motion } from "framer-motion";
import Image from "next/image";

type LeaderboardListProps = {
  entries: LeaderboardEntry[];
};

export function LeaderboardList({ entries }: LeaderboardListProps) {
  if (entries.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-zinc-500">
        Brak graczy na liście.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {entries.map((entry, index) => (
        <motion.li
          key={entry.id}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 * index, duration: 0.35 }}
          className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 backdrop-blur-md sm:gap-4 sm:px-4 sm:py-3"
        >
          <span className="w-8 shrink-0 text-center text-sm font-black tabular-nums text-zinc-400 sm:w-10 sm:text-base">
            {entry.rank}
          </span>
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 ring-2 ring-white/10 sm:h-11 sm:w-11">
            {entry.avatarUrl ? (
              <Image
                src={entry.avatarUrl}
                alt=""
                fill
                className="object-cover"
                sizes="44px"
                unoptimized
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-sm font-black text-white">
                {entry.nick.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black text-white sm:text-base">
              {entry.nick}
            </p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <LevelBadge level={entry.level} size="sm" />
              {entry.subtitle && (
                <span className="truncate text-xs font-semibold text-zinc-400">
                  {entry.subtitle}
                </span>
              )}
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-0.5">
            <span className="text-sm font-black tabular-nums text-cyan-400 sm:text-base">
              {formatCompactXp(entry.xp)}
            </span>
          </div>
        </motion.li>
      ))}
    </ul>
  );
}
