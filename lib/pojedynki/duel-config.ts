import type { LearningPath } from "@/lib/learning-path";
import type { DuelConfig } from "@/lib/pojedynki/duel-types";
import { randomSeed, roomCodeFromSeed } from "@/lib/pojedynki/duel-rng";

/** Dostępne długości pojedynku (liczba pytań). */
export const DUEL_LENGTH_OPTIONS = [10, 15, 20] as const;
export type DuelLength = (typeof DUEL_LENGTH_OPTIONS)[number];
export const DEFAULT_DUEL_LENGTH: DuelLength = 15;

/**
 * Feature-flag dla trybu realtime (Supabase Realtime broadcast). Włączony, bo
 * @supabase/supabase-js wspiera kanały; w runtime i tak dodatkowo sprawdzamy
 * `isSupabaseConfigured()` i degradujemy do trybu offline (kod/lokalny), gdy
 * backend jest niedostępny.
 */
export const DUEL_REALTIME_ENABLED = true;

/** Domyślny slug minigry dla pojedynku (gdy nic nie wybrano). */
export const DEFAULT_DUEL_SLUG = "mnozenie";

/** Tworzy świeżą konfigurację pojedynku z nowym losowym seedem. */
export function createDuelConfig(params: {
  slug: string;
  path: LearningPath;
  questionCount: number;
  seed?: number;
}): DuelConfig {
  return {
    slug: params.slug,
    path: params.path,
    questionCount: params.questionCount,
    seed: params.seed ?? randomSeed(),
  };
}

/** Kod pokoju powiązany z konfiguracją (deterministycznie z seeda). */
export function duelRoomCode(config: DuelConfig): string {
  return roomCodeFromSeed(config.seed);
}
