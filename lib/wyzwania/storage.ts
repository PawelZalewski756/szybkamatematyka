import { calculateStreak, todayDateString } from "@/lib/supabase/profiles";
import { challengeXpReward } from "@/lib/wyzwania/daily-challenge";
import type { ChallengeProgress, ChallengeReward } from "@/lib/wyzwania/types";

const STORAGE_PREFIX = "szybka-matma-wyzwania";

const EMPTY_PROGRESS: ChallengeProgress = {
  lastCompletedDate: null,
  streak: 0,
  bestStreak: 0,
  totalCompleted: 0,
  lastReward: null,
};

function storageKey(userId: string | null): string {
  return userId ? `${STORAGE_PREFIX}:${userId}` : `${STORAGE_PREFIX}:guest`;
}

function isReward(value: unknown): value is ChallengeReward {
  if (!value || typeof value !== "object") return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.xp === "number" &&
    typeof r.correct === "number" &&
    typeof r.total === "number" &&
    typeof r.streak === "number"
  );
}

export function loadChallengeProgress(
  userId: string | null = null,
): ChallengeProgress {
  if (typeof window === "undefined") return { ...EMPTY_PROGRESS };

  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return { ...EMPTY_PROGRESS };
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return {
      lastCompletedDate:
        typeof parsed.lastCompletedDate === "string"
          ? parsed.lastCompletedDate
          : null,
      streak: Number(parsed.streak) || 0,
      bestStreak: Number(parsed.bestStreak) || 0,
      totalCompleted: Number(parsed.totalCompleted) || 0,
      lastReward: isReward(parsed.lastReward)
        ? { ...parsed.lastReward, leveledUp: Boolean(parsed.lastReward.leveledUp) }
        : null,
    };
  } catch {
    return { ...EMPTY_PROGRESS };
  }
}

export function saveChallengeProgress(
  progress: ChallengeProgress,
  userId: string | null = null,
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(progress));
  } catch {
    /* ignore quota / private mode */
  }
}

export function isCompletedToday(progress: ChallengeProgress): boolean {
  return progress.lastCompletedDate === todayDateString();
}

/**
 * Seria „na żywo”: jeśli ostatnie ukończenie było dziś lub wczoraj - seria
 * jest aktywna; w innym wypadku została przerwana (efektywnie 0).
 */
export function effectiveStreak(
  lastDate: string | null,
  streak: number,
): number {
  if (!lastDate || streak <= 0) return 0;
  const today = todayDateString();
  if (lastDate === today) return streak;

  const last = new Date(`${lastDate}T12:00:00`);
  const now = new Date(`${today}T12:00:00`);
  const diffDays = Math.round(
    (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24),
  );
  return diffDays === 1 ? streak : 0;
}

/**
 * Zapisuje ukończenie dzisiejszego wyzwania lokalnie (fallback / gość).
 * Idempotentne w obrębie dnia - drugie wywołanie nie podbija serii ani XP.
 */
export function applyLocalCompletion(
  userId: string | null,
  correct: number,
  total: number,
): ChallengeProgress {
  const prev = loadChallengeProgress(userId);
  if (isCompletedToday(prev)) return prev;

  const { streak, lastPlayedDate } = calculateStreak(
    prev.lastCompletedDate,
    prev.streak,
  );
  const xp = challengeXpReward(correct, streak);

  const next: ChallengeProgress = {
    lastCompletedDate: lastPlayedDate,
    streak,
    bestStreak: Math.max(prev.bestStreak, streak),
    totalCompleted: prev.totalCompleted + 1,
    lastReward: { xp, correct, total, streak, leveledUp: false },
  };
  saveChallengeProgress(next, userId);
  return next;
}

/**
 * Zapisuje lokalne odbicie ukończenia dla zalogowanego gracza (gdy źródłem
 * prawdy jest Supabase) - by po reloadzie offline dało się pokazać nagrodę.
 */
export function mirrorCloudCompletion(
  userId: string,
  reward: ChallengeReward,
): void {
  const prev = loadChallengeProgress(userId);
  const today = todayDateString();
  if (prev.lastCompletedDate === today) return;

  saveChallengeProgress(
    {
      lastCompletedDate: today,
      streak: reward.streak,
      bestStreak: Math.max(prev.bestStreak, reward.streak),
      totalCompleted: prev.totalCompleted + 1,
      lastReward: reward,
    },
    userId,
  );
}
