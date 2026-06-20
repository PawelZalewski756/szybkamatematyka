"use client";

import { useCallback, useEffect, useState } from "react";
import { gatherClientStats } from "@/lib/achievements/stats";
import { buildProfileStatsSnapshot } from "@/lib/profile-stats/gather";
import {
  loadActivityDays,
  recordDailySnapshot,
} from "@/lib/profile-stats/history";
import type { ProfileStatsSnapshot } from "@/lib/profile-stats/types";
import {
  PROFILE_UPDATED_EVENT,
  type ProfileUpdatedDetail,
} from "@/lib/profile-sync";
import { SOLVED_TASKS_UPDATED_EVENT } from "@/lib/baza-zadan/solved-tasks";
import { loadChallengeProgress } from "@/lib/wyzwania/storage";
import {
  emptyDuelStats,
  fetchDuelStats,
  loadDuelStats,
  type DuelStats,
} from "@/lib/supabase/duel-results";
import type { Profile } from "@/lib/supabase/profiles";

function mergeDuelStats(
  remote: DuelStats | null,
  local: DuelStats,
): DuelStats {
  if (!remote) return local;
  if (remote.played >= local.played) return remote;
  return local.played > remote.played ? local : remote;
}

export type UseProfileStatsResult = {
  ready: boolean;
  stats: ProfileStatsSnapshot | null;
};

/**
 * Zbiera statystyki profilu z istniejących źródeł, rejestruje dzisiejszą
 * aktywność w localStorage (history.ts) i odświeża po zmianach profilu/zadań.
 */
export function useProfileStats(
  profile: Profile | null,
  userId: string | null,
  solvedCount: number,
): UseProfileStatsResult {
  const [ready, setReady] = useState(false);
  const [stats, setStats] = useState<ProfileStatsSnapshot | null>(null);

  const recompute = useCallback(async () => {
    if (!profile || !userId) {
      setStats(null);
      setReady(true);
      return;
    }

    const activityDays = recordDailySnapshot(userId, {
      solvedCount,
      xp: profile.xp,
      lastPlayedDate: profile.lastPlayedDate,
    });

    const challenge = loadChallengeProgress(userId);
    const localDuel = loadDuelStats(userId);
    let duelStats = localDuel;

    try {
      const remoteDuel = await fetchDuelStats(userId);
      duelStats = mergeDuelStats(remoteDuel, localDuel);
    } catch {
      duelStats = localDuel;
    }

    const baseStats = gatherClientStats(profile, userId);
    const playerStats = {
      ...baseStats,
      solvedCount: Math.max(solvedCount, baseStats.solvedCount),
    };

    const snapshot = buildProfileStatsSnapshot({
      profile,
      solvedCount: playerStats.solvedCount,
      challengesCompleted: challenge.totalCompleted,
      duelStats: duelStats ?? emptyDuelStats(),
      activityDays: activityDays ?? loadActivityDays(userId),
      playerStats,
    });

    setStats(snapshot);
    setReady(true);
  }, [profile, userId, solvedCount]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void recompute();
  }, [recompute]);

  useEffect(() => {
    const onProfile = (e: Event) => {
      const detail = (e as CustomEvent<ProfileUpdatedDetail>).detail;
      if (detail?.profile?.id === userId) void recompute();
    };
    const onSolved = () => {
      if (userId) void recompute();
    };

    window.addEventListener(PROFILE_UPDATED_EVENT, onProfile);
    window.addEventListener(SOLVED_TASKS_UPDATED_EVENT, onSolved);
    return () => {
      window.removeEventListener(PROFILE_UPDATED_EVENT, onProfile);
      window.removeEventListener(SOLVED_TASKS_UPDATED_EVENT, onSolved);
    };
  }, [recompute, userId]);

  return { ready, stats };
}
