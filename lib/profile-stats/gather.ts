import { ACHIEVEMENTS_TOTAL, evaluateAll } from "@/lib/achievements/catalog";
import type { PlayerStats } from "@/lib/achievements/types";
import { calculateLevel, calculateXpProgress } from "@/lib/levelSystem";
import {
  buildActivitySeries,
  hasAnyActivityData,
  type StoredActivityDay,
} from "@/lib/profile-stats/history";
import type { ProfileStatsSnapshot } from "@/lib/profile-stats/types";
import type { DuelStats } from "@/lib/supabase/duel-results";
import { emptyDuelStats } from "@/lib/supabase/duel-results";
import type { Profile } from "@/lib/supabase/profiles";

export type ProfileStatsSources = {
  profile: Profile;
  solvedCount: number;
  challengesCompleted: number;
  duelStats: DuelStats;
  activityDays: Record<string, StoredActivityDay>;
  /** Pełne statystyki gracza (do odznak) — z gatherClientStats. */
  playerStats: PlayerStats;
};

/**
 * Czysta funkcja budująca migawkę statystyk profilu — testowalna bez I/O.
 */
export function buildProfileStatsSnapshot(
  sources: ProfileStatsSources,
  today: string = new Date().toISOString().slice(0, 10),
): ProfileStatsSnapshot {
  const xp = Math.max(0, sources.profile.xp);
  const level = calculateLevel(xp);
  const { currentLevelXp, xpForNextLevel } = calculateXpProgress(xp);
  const lastPlayed = sources.profile.lastPlayedDate;

  const statuses = evaluateAll(sources.playerStats);
  const achievementsUnlocked = statuses.filter((s) => s.unlocked).length;

  const activity7 = buildActivitySeries(
    sources.activityDays,
    lastPlayed,
    7,
    today,
  );
  const activity14 = buildActivitySeries(
    sources.activityDays,
    lastPlayed,
    14,
    today,
  );

  return {
    solvedCount: Math.max(0, sources.solvedCount),
    xp,
    level,
    streak: Math.max(0, sources.profile.streak),
    challengesCompleted: Math.max(0, sources.challengesCompleted),
    duelStats: sources.duelStats ?? emptyDuelStats(),
    achievementsUnlocked,
    achievementsTotal: ACHIEVEMENTS_TOTAL,
    currentLevelXp,
    xpForNextLevel,
    activity7,
    activity14,
    hasActivityHistory: hasAnyActivityData(
      sources.activityDays,
      lastPlayed,
      14,
      today,
    ),
  };
}
