import { calculateLevel } from "@/lib/levelSystem";
import type { Profile } from "@/lib/supabase/profiles";

export type GameAccountState = {
  profile: Profile | null;
  isLoggedIn: boolean;
};

/** Konwersja punktów rundy → XP (między starym 1:1 a poprzednim nerfedem). */
const SCORE_TO_XP_MULT = 10;
/**
 * Symboliczna nagroda za uczestnictwo (kilka XP), zamiast dawnego sztywnego
 * floora 25 XP, który przy znikomych wynikach zawyżał ranking. W praktyce krzywa
 * jest w pełni proporcjonalna do wyniku: dla najniższego realnego wyniku rundy
 * (BASE_POINTS = 10 za jedną poprawną odpowiedź) converted ≈ 31 XP, więc ten
 * floor dotyczy wyłącznie skrajnie niskich wyników (1–6 pkt) i nie zmienia
 * balansu dla średnich/wysokich wyników.
 */
const SCORE_TO_XP_MIN = 5;
const SCORE_TO_XP_MAX = 320;

/**
 * Punkty z rundy (combo, czas) → XP na konto.
 * Ogranicza skoki poziomów po jednej minigrze.
 */
export function gameScoreToXp(roundScore: number): number {
  if (roundScore <= 0) return 0;
  const converted = Math.floor(Math.sqrt(roundScore) * SCORE_TO_XP_MULT);
  return Math.min(Math.max(converted, SCORE_TO_XP_MIN), SCORE_TO_XP_MAX);
}

export function getDisplayProgress(state: GameAccountState): {
  level: number;
  xp: number;
} {
  if (state.profile) {
    return {
      level: calculateLevel(state.profile.xp),
      xp: state.profile.xp,
    };
  }

  return { level: 1, xp: 0 };
}
