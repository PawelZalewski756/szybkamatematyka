"use client";

import { LevelBadge } from "@/components/gaming/LevelBadge";
import { formatCompactXp } from "@/lib/format/compact-number";
import type { LeaderboardEntry } from "@/lib/supabase/leaderboard";
import { motion } from "framer-motion";
import { Crown, Medal } from "lucide-react";
import Image from "next/image";

function PodiumAvatar({
  entry,
  sizeClass,
}: {
  entry: LeaderboardEntry;
  sizeClass: string;
}) {
  const initial = entry.nick.charAt(0).toUpperCase();
  return (
    <div
      className={`relative overflow-hidden rounded-full bg-gradient-to-br bg-brand-gradient ring-4 ${sizeClass}`}
    >
      {entry.avatarUrl ? (
        <Image
          src={entry.avatarUrl}
          alt=""
          fill
          className="object-cover"
          sizes="96px"
          unoptimized
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-2xl font-black text-white sm:text-3xl">
          {initial}
        </span>
      )}
    </div>
  );
}

const podiumConfig = [
  {
    place: 2,
    entryIndex: 1,
    height: "h-28 sm:h-32",
    avatar: "h-16 w-16 sm:h-20 sm:w-20 ring-amber-300/60",
    icon: Medal,
    iconClass: "text-zinc-300",
    glow: "shadow-[0_0_30px_rgba(161,161,170,0.25)]",
    delay: 0.15,
  },
  {
    place: 1,
    entryIndex: 0,
    height: "h-36 sm:h-44",
    avatar: "h-20 w-20 sm:h-24 sm:w-24 ring-amber-400/80",
    icon: Crown,
    iconClass: "text-amber-300",
    glow: "shadow-[0_0_40px_rgba(251,191,36,0.35)]",
    delay: 0,
  },
  {
    place: 3,
    entryIndex: 2,
    height: "h-24 sm:h-28",
    avatar: "h-14 w-14 sm:h-[4.5rem] sm:w-[4.5rem] ring-amber-700/60",
    icon: Medal,
    iconClass: "text-amber-700",
    glow: "shadow-[0_0_24px_rgba(180,83,9,0.2)]",
    delay: 0.25,
  },
] as const;

type LeaderboardPodiumProps = {
  topThree: LeaderboardEntry[];
};

export function LeaderboardPodium({ topThree }: LeaderboardPodiumProps) {
  if (topThree.length === 0) return null;

  return (
    <div className="grid grid-cols-3 items-end gap-2 px-1 sm:gap-4 sm:px-4">
      {podiumConfig.map((slot) => {
        const entry = topThree[slot.entryIndex];
        if (!entry) return <div key={slot.place} className="min-h-24" />;

        const Icon = slot.icon;

        return (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: slot.delay, duration: 0.45 }}
            className="flex flex-col items-center"
          >
            <div className="relative mb-2">
              <Icon
                className={`absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 sm:h-7 sm:w-7 ${slot.iconClass}`}
                aria-hidden
              />
              <PodiumAvatar entry={entry} sizeClass={slot.avatar} />
            </div>
            <p className="max-w-full truncate text-center text-xs font-black text-white sm:text-sm">
              {entry.nick}
            </p>
            <div className="mt-1 flex justify-center">
              <LevelBadge level={entry.level} size="sm" />
            </div>
            <p className="mt-0.5 text-[10px] font-bold tabular-nums text-orange-400 sm:text-xs">
              {formatCompactXp(entry.xp)}
            </p>
            <div
              className={`mt-3 w-full rounded-t-2xl border border-white/10 bg-gradient-to-t from-white/10 to-white/5 backdrop-blur-md ${slot.height} ${slot.glow} flex flex-col items-center justify-start pt-3`}
            >
              <span
                className={`text-2xl font-black sm:text-3xl ${slot.place === 1 ? "text-amber-300" : slot.place === 2 ? "text-zinc-300" : "text-amber-700"}`}
              >
                {slot.place}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                miejsce
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
