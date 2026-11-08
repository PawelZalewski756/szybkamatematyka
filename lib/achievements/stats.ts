/**
 * Zbieranie `PlayerStats` z już istniejących źródeł danych - bez nowej tabeli
 * Supabase i bez migracji. Część czysta (merge / budowanie statystyk) jest
 * testowalna, a część I/O czyta localStorage oraz rejestruje „flagi zachowań"
 * (nocny marek / ranny ptaszek / weekend) na podstawie czasu wizyty.
 */

import { calculateLevel } from "@/lib/levelSystem";
import { loadReviewFlaggedIds, loadSolvedTaskIds } from "@/lib/baza-zadan/solved-tasks";
import { loadChallengeProgress } from "@/lib/wyzwania/storage";
import { loadStoredChallenges } from "@/lib/pojedynki/duel-storage";
import type { Profile } from "@/lib/supabase/profiles";
import type { PlayerStats } from "@/lib/achievements/types";

/** Flagi zachowań zależne od czasu - kumulowane (raz zdobyte zostają). */
export type BehaviorFlags = {
  nightOwl: boolean;
  earlyBird: boolean;
  weekendWarrior: boolean;
};

const EMPTY_BEHAVIOR: BehaviorFlags = {
  nightOwl: false,
  earlyBird: false,
  weekendWarrior: false,
};

/** Pusta migawka - bezpieczny domyślny stan (SSR / brak danych). */
export function emptyPlayerStats(): PlayerStats {
  return {
    xp: 0,
    level: 1,
    streak: 0,
    minigryXp: 0,
    minigryLevel: 1,
    solvedCount: 0,
    reviewFlaggedCount: 0,
    challengesCompleted: 0,
    challengeBestStreak: 0,
    duelChallengesCreated: 0,
    nightOwl: false,
    earlyBird: false,
    weekendWarrior: false,
  };
}

/** Surowe liczniki zebrane z różnych źródeł (do czystego budowania statystyk). */
export type PlayerStatsSources = {
  profile: Profile | null;
  solvedCount: number;
  reviewFlaggedCount: number;
  challengesCompleted: number;
  challengeBestStreak: number;
  duelChallengesCreated: number;
  behavior: BehaviorFlags;
};

/**
 * Czysta funkcja budująca PlayerStats z surowych źródeł. Wyliczane pola
 * (poziom konta / poziom minigier) liczone są tą samą krzywą co reszta aplikacji.
 */
export function buildPlayerStats(sources: PlayerStatsSources): PlayerStats {
  const xp = Math.max(0, sources.profile?.xp ?? 0);
  const minigryXp = Math.max(0, sources.profile?.minigryXp ?? 0);
  return {
    xp,
    level: calculateLevel(xp),
    streak: Math.max(0, sources.profile?.streak ?? 0),
    minigryXp,
    minigryLevel: calculateLevel(minigryXp),
    solvedCount: Math.max(0, sources.solvedCount),
    reviewFlaggedCount: Math.max(0, sources.reviewFlaggedCount),
    challengesCompleted: Math.max(0, sources.challengesCompleted),
    challengeBestStreak: Math.max(0, sources.challengeBestStreak),
    duelChallengesCreated: Math.max(0, sources.duelChallengesCreated),
    nightOwl: sources.behavior.nightOwl,
    earlyBird: sources.behavior.earlyBird,
    weekendWarrior: sources.behavior.weekendWarrior,
  };
}

/* -------------------------------------------------------------------------- */
/*  Flagi zachowań (localStorage) - czas wizyty.                              */
/* -------------------------------------------------------------------------- */

const BEHAVIOR_PREFIX = "szybka-matma-achievements-behavior";

function behaviorKey(userId: string | null): string {
  return userId ? `${BEHAVIOR_PREFIX}:${userId}` : `${BEHAVIOR_PREFIX}:guest`;
}

function loadBehaviorFlags(userId: string | null): BehaviorFlags {
  if (typeof window === "undefined") return { ...EMPTY_BEHAVIOR };
  try {
    const raw = localStorage.getItem(behaviorKey(userId));
    if (!raw) return { ...EMPTY_BEHAVIOR };
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return {
      nightOwl: Boolean(parsed.nightOwl),
      earlyBird: Boolean(parsed.earlyBird),
      weekendWarrior: Boolean(parsed.weekendWarrior),
    };
  } catch {
    return { ...EMPTY_BEHAVIOR };
  }
}

/** Czysta reguła: które flagi wynikają z danej daty wizyty. */
export function behaviorFromDate(date: Date): BehaviorFlags {
  const hour = date.getHours();
  const day = date.getDay(); // 0 = niedziela, 6 = sobota
  return {
    nightOwl: hour >= 0 && hour < 5,
    earlyBird: hour >= 5 && hour < 8,
    weekendWarrior: day === 0 || day === 6,
  };
}

/** Łączy istniejące flagi z nowymi (raz zdobyta flaga pozostaje). */
export function mergeBehaviorFlags(
  prev: BehaviorFlags,
  next: BehaviorFlags,
): BehaviorFlags {
  return {
    nightOwl: prev.nightOwl || next.nightOwl,
    earlyBird: prev.earlyBird || next.earlyBird,
    weekendWarrior: prev.weekendWarrior || next.weekendWarrior,
  };
}

/**
 * Rejestruje aktualną wizytę: dolicza flagi czasowe i zapisuje je w localStorage.
 * Zwraca zaktualizowany zestaw flag. Bezpieczne na SSR (zwraca pusty zestaw).
 */
export function recordVisitBehavior(
  userId: string | null,
  now: Date = new Date(),
): BehaviorFlags {
  if (typeof window === "undefined") return { ...EMPTY_BEHAVIOR };
  const prev = loadBehaviorFlags(userId);
  const merged = mergeBehaviorFlags(prev, behaviorFromDate(now));
  try {
    localStorage.setItem(behaviorKey(userId), JSON.stringify(merged));
  } catch {
    /* ignore quota / private mode */
  }
  return merged;
}

/* -------------------------------------------------------------------------- */
/*  Zebranie pełnych statystyk po stronie klienta.                            */
/* -------------------------------------------------------------------------- */

/**
 * Zbiera kompletne PlayerStats z dostępnych źródeł klienckich. Czyta liczniki
 * z localStorage (rozwiązane zadania, powtórki, wyzwania, pojedynki) oraz
 * doczytuje/rejestruje flagi czasowe. Profil (XP, streak, minigry) podajemy
 * z zewnątrz - pochodzi z istniejącego łańcucha autoryzacji.
 */
export function gatherClientStats(
  profile: Profile | null,
  userId: string | null,
): PlayerStats {
  const challenge = loadChallengeProgress(userId);
  return buildPlayerStats({
    profile,
    solvedCount: loadSolvedTaskIds(userId).size,
    reviewFlaggedCount: loadReviewFlaggedIds(userId).size,
    challengesCompleted: challenge.totalCompleted,
    challengeBestStreak: challenge.bestStreak,
    duelChallengesCreated: loadStoredChallenges().length,
    behavior: recordVisitBehavior(userId),
  });
}

/* -------------------------------------------------------------------------- */
/*  Zbiór „zobaczonych" odznak (localStorage) - do wykrywania świeżo odblok.  */
/* -------------------------------------------------------------------------- */

const SEEN_PREFIX = "szybka-matma-achievements-seen";

function seenKey(userId: string | null): string {
  return userId ? `${SEEN_PREFIX}:${userId}` : `${SEEN_PREFIX}:guest`;
}

/**
 * Czy w localStorage istnieje już zapis „widzianych" odznak. Pozwala odróżnić
 * pierwszą w życiu wizytę (brak zapisu) od stanu „widziałem, nic nowego" -
 * dzięki temu przy pierwszym otwarciu nie świętujemy wszystkich naraz.
 */
export function hasSeenAchievementRecord(userId: string | null): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(seenKey(userId)) !== null;
  } catch {
    return false;
  }
}

/**
 * Łączy dwa zbiory „widzianych" odznak (unia). Źródłem prawdy między urządzeniami
 * jest suma - odznaka widziana na DOWOLNYM urządzeniu pozostaje „widziana", dzięki
 * czemu confetti nie pojawia się ponownie dla już zobaczonego osiągnięcia.
 */
export function mergeSeenIds(
  a: ReadonlySet<string>,
  b: ReadonlySet<string>,
): Set<string> {
  const merged = new Set<string>(a);
  for (const id of b) merged.add(id);
  return merged;
}

/** Wczytuje zbiór ID odznak, które gracz już „widział" jako odblokowane. */
export function loadSeenAchievementIds(userId: string | null): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(seenKey(userId));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === "string"));
  } catch {
    return new Set();
  }
}

/** Zapisuje zbiór „widzianych" odznak. */
export function saveSeenAchievementIds(
  userId: string | null,
  ids: ReadonlySet<string>,
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(seenKey(userId), JSON.stringify([...ids]));
  } catch {
    /* ignore quota / private mode */
  }
}
