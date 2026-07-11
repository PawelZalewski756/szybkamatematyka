"use client";

import { LevelBadge } from "@/components/gaming/LevelBadge";
import { formatCompactXp } from "@/lib/format/compact-number";
import type { MyLeaderboardRank } from "@/lib/supabase/leaderboard";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import Image from "next/image";

type MyRankBarProps = {
  myRank: MyLeaderboardRank;
};

export function MyRankBar({ myRank }: MyRankBarProps) {
  const { entry, rank } = myRank;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky bottom-0 z-20 -mx-4 border-t border-accent/30 bg-background/95 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="game-surface mx-auto flex w-full max-w-[1920px] items-center gap-3 border-accent/25 px-4 py-3 shadow-[0_0_24px_rgba(244,183,64,0.12)]">
        <TrendingUp className="h-5 w-5 shrink-0 text-accent" aria-hidden />
        <span className="text-lg font-black tabular-nums text-accent">
          #{rank}
        </span>
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-accent ring-2 ring-accent/40">
          {entry.avatarUrl ? (
            <Image
              src={entry.avatarUrl}
              alt=""
              fill
              className="object-cover"
              sizes="40px"
              unoptimized
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-sm font-black text-on-accent">
              {entry.nick.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-foreground">
            {entry.nick}
            <span className="ml-1 text-xs font-semibold text-muted">
              (Ty)
            </span>
          </p>
          <div className="mt-0.5 flex items-center gap-2">
            <LevelBadge level={entry.level} size="sm" />
            <span className="text-xs text-muted">
              {entry.subtitle ?? "Twoja pozycja"}
            </span>
          </div>
        </div>
        <span className="shrink-0 text-sm font-black tabular-nums text-accent">
          {formatCompactXp(entry.xp)}
        </span>
      </div>
    </motion.div>
  );
}
