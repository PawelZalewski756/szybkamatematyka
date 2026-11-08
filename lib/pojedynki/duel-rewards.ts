import { gameScoreToXp } from "@/lib/minigry/account-progress";
import { saveProfileAfterGame, type Profile } from "@/lib/supabase/profiles";
import type { DuelOutcome, DuelResult } from "@/lib/pojedynki/duel-types";

/**
 * Premia do wyniku za rezultat pojedynku (przeliczana następnie na XP istniejącą
 * funkcją). Zwycięstwo daje bonus, remis mniejszy - wszystko addytywnie, bez
 * modyfikacji silnika profili.
 */
const OUTCOME_BONUS: Record<DuelOutcome, number> = {
  win: 40,
  draw: 15,
  loss: 0,
};

/** Efektywny wynik rundy do przeliczenia na XP (wynik gracza + bonus za rezultat). */
export function duelRoundScore(result: DuelResult, outcome: DuelOutcome): number {
  return Math.max(0, result.score + OUTCOME_BONUS[outcome]);
}

/** Podgląd XP do zdobycia (bez zapisu) - używane w UI wyniku. */
export function previewDuelXp(result: DuelResult, outcome: DuelOutcome): number {
  return gameScoreToXp(duelRoundScore(result, outcome));
}

export type DuelRewardSummary = {
  xpEarned: number;
  leveledUp: boolean;
  level: number;
  nick: string;
  /** Czy nagroda XP została zapisana w bazie (false = tylko lokalnie). */
  persisted: boolean;
};

/**
 * Zapisuje nagrodę XP po pojedynku, reużywając istniejącą, już eksportowaną
 * funkcję `saveProfileAfterGame` (NIE modyfikujemy lib/supabase/profiles.ts).
 * Działa tylko dla zalogowanego gracza z profilem; w innym wypadku zwraca null.
 */
export async function awardDuelXp(
  profile: Profile,
  result: DuelResult,
  outcome: DuelOutcome,
): Promise<DuelRewardSummary> {
  const roundScore = duelRoundScore(result, outcome);
  const saved = await saveProfileAfterGame(profile, roundScore);
  return {
    xpEarned: saved.xpEarned,
    leveledUp: saved.leveledUp,
    level: saved.level,
    nick: saved.nick,
    persisted: saved.persisted,
  };
}
