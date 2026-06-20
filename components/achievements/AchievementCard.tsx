"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { AchievementGlyph } from "@/components/achievements/achievement-icon";
import { TIER_LABELS } from "@/lib/achievements/catalog";
import type {
  Achievement,
  AchievementStatus,
  AchievementTier,
} from "@/lib/achievements/types";

type TierStyle = {
  /** Gradient tła ikony odblokowanej odznaki. */
  iconBg: string;
  /** Obwódka/poświata karty odblokowanej. */
  cardRing: string;
  /** Kolor etykiety tieru. */
  tierText: string;
  /** Gradient paska postępu. */
  bar: string;
};

const TIER_STYLES: Record<AchievementTier, TierStyle> = {
  braz: {
    iconBg: "from-amber-700 to-orange-500",
    cardRing: "border-amber-500/40 shadow-[0_0_24px_rgba(180,83,9,0.18)]",
    tierText: "text-amber-400",
    bar: "from-amber-600 to-orange-400",
  },
  srebro: {
    iconBg: "from-slate-400 to-zinc-300",
    cardRing: "border-slate-300/40 shadow-[0_0_24px_rgba(148,163,184,0.18)]",
    tierText: "text-slate-300",
    bar: "from-slate-400 to-zinc-200",
  },
  zloto: {
    iconBg: "from-yellow-400 to-amber-500",
    cardRing: "border-yellow-400/50 shadow-[0_0_28px_rgba(250,204,21,0.22)]",
    tierText: "text-yellow-400",
    bar: "from-yellow-400 to-amber-400",
  },
  platyna: {
    iconBg: "from-orange-500 via-amber-400 to-orange-400",
    cardRing: "border-orange-500/50 shadow-[0_0_30px_rgba(232,112,42,0.25)]",
    tierText: "text-amber-400",
    bar: "from-orange-500 via-amber-400 to-orange-400",
  },
};

export function AchievementCard({
  achievement,
  status,
  isNew = false,
}: {
  achievement: Achievement;
  status: AchievementStatus;
  isNew?: boolean;
}) {
  const tier = TIER_STYLES[achievement.tier];
  const unlocked = status.unlocked;
  const showProgressBar = !unlocked && status.target > 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`relative flex flex-col gap-3 overflow-hidden rounded-2xl border p-4 backdrop-blur-md sm:p-5 ${
        unlocked
          ? `bg-white/10 ${tier.cardRing}`
          : "border-white/10 bg-white/[0.03]"
      }`}
    >
      {isNew && (
        <span className="absolute right-3 top-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
          Nowe!
        </span>
      )}

      <div className="flex items-center gap-3">
        <div
          className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl sm:h-14 sm:w-14 ${
            unlocked
              ? `bg-gradient-to-br ${tier.iconBg} text-white shadow-lg`
              : "bg-zinc-800 text-zinc-600"
          }`}
        >
          <AchievementGlyph
            icon={achievement.icon}
            className="h-6 w-6 sm:h-7 sm:w-7"
          />
          {!unlocked && (
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900">
              <Lock className="h-3 w-3 text-zinc-500" aria-hidden />
            </span>
          )}
        </div>

        <div className="min-w-0">
          <p
            className={`truncate text-sm font-black sm:text-base ${
              unlocked ? "text-white" : "text-zinc-400"
            }`}
          >
            {achievement.title}
          </p>
          <p
            className={`text-[10px] font-bold uppercase tracking-wider ${
              unlocked ? tier.tierText : "text-zinc-600"
            }`}
          >
            {TIER_LABELS[achievement.tier]}
          </p>
        </div>
      </div>

      <p
        className={`text-xs leading-relaxed sm:text-sm ${
          unlocked ? "text-zinc-300" : "text-zinc-500"
        }`}
      >
        {unlocked && achievement.unlockedHint
          ? achievement.unlockedHint
          : achievement.description}
      </p>

      {unlocked ? (
        <span className="mt-auto inline-flex w-fit items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold text-emerald-300">
          Zdobyte
        </span>
      ) : (
        <div className="mt-auto flex flex-col gap-1.5">
          {showProgressBar && (
            <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${tier.bar} transition-[width] duration-500`}
                style={{ width: `${status.percent}%` }}
              />
            </div>
          )}
          <span className="text-[11px] font-bold tabular-nums text-zinc-500">
            {status.target > 1
              ? `${status.current.toLocaleString("pl-PL")} / ${status.target.toLocaleString("pl-PL")}`
              : "Zablokowane"}
          </span>
        </div>
      )}
    </motion.div>
  );
}
