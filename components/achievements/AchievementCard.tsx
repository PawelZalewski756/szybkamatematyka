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
  iconClass: string;
  cardRing: string;
  tierText: string;
};

const TIER_STYLES: Record<AchievementTier, TierStyle> = {
  braz: {
    iconClass: "bg-accent-soft text-accent",
    cardRing: "border-accent/25 shadow-[0_0_20px_rgba(244,183,64,0.12)]",
    tierText: "text-accent",
  },
  srebro: {
    iconClass: "bg-surface-hover text-muted",
    cardRing: "border-surface-border shadow-[0_0_16px_rgba(167,157,138,0.1)]",
    tierText: "text-muted",
  },
  zloto: {
    iconClass: "bg-accent text-on-accent",
    cardRing: "border-accent/40 shadow-[0_0_24px_rgba(244,183,64,0.2)]",
    tierText: "text-accent",
  },
  platyna: {
    iconClass: "bg-accent-strong text-on-accent",
    cardRing: "border-accent/50 shadow-[0_0_28px_rgba(244,183,64,0.28)]",
    tierText: "text-accent-strong",
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
      className={`card-raised relative flex flex-col gap-3 overflow-hidden p-4 sm:p-5 ${
        unlocked ? tier.cardRing : "opacity-90"
      }`}
    >
      {isNew && (
        <span className="absolute right-3 top-3 rounded-full bg-accent px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-on-accent shadow-md">
          Nowe!
        </span>
      )}

      <div className="flex items-center gap-3">
        <div
          className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl sm:h-14 sm:w-14 ${
            unlocked ? tier.iconClass : "bg-surface-hover text-muted"
          }`}
        >
          <AchievementGlyph
            icon={achievement.icon}
            className="h-6 w-6 sm:h-7 sm:w-7"
          />
          {!unlocked && (
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-surface-border bg-surface">
              <Lock className="h-3 w-3 text-muted" aria-hidden />
            </span>
          )}
        </div>

        <div className="min-w-0">
          <p
            className={`truncate text-sm font-black sm:text-base ${
              unlocked ? "text-foreground" : "text-muted"
            }`}
          >
            {achievement.title}
          </p>
          <p
            className={`text-[10px] font-bold uppercase tracking-wider ${
              unlocked ? tier.tierText : "text-muted"
            }`}
          >
            {TIER_LABELS[achievement.tier]}
          </p>
        </div>
      </div>

      <p
        className={`text-xs leading-relaxed sm:text-sm ${
          unlocked ? "text-muted" : "text-muted/80"
        }`}
      >
        {unlocked && achievement.unlockedHint
          ? achievement.unlockedHint
          : achievement.description}
      </p>

      {unlocked ? (
        <span className="mt-auto inline-flex w-fit items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 text-[11px] font-bold text-success">
          Zdobyte
        </span>
      ) : (
        <div className="mt-auto flex flex-col gap-1.5">
          {showProgressBar && (
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-hover">
              <div
                className="progress-accent"
                style={{ width: `${status.percent}%` }}
              />
            </div>
          )}
          <span className="text-[11px] font-bold tabular-nums text-muted">
            {status.target > 1
              ? `${status.current.toLocaleString("pl-PL")} / ${status.target.toLocaleString("pl-PL")}`
              : "Zablokowane"}
          </span>
        </div>
      )}
    </motion.div>
  );
}
