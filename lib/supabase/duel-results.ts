/**
 * Persystencja wyników i statystyk pojedynków 1v1.
 *
 * Strategia (spójna z resztą aplikacji): Supabase gdy dostępne + ZAWSZE fallback
 * localStorage, dzięki czemu tryby offline/gość mają lokalne statystyki, a
 * zalogowany gracz dodatkowo trafia do bazy (prywatna historia `duel_results`
 * + zagregowane liczniki w `profiles.duel_*`, które zasilają ranking).
 *
 * Część czysta (delty ratingu, agregacja statystyk, win rate) jest wydzielona,
 * deterministyczna i nadaje się do reużycia przez osiągnięcia bez I/O.
 *
 * UWAGA dot. integracji z osiągnięciami: ten moduł celowo wystawia czyste,
 * stabilne funkcje odczytu (`loadDuelStats`, `fetchDuelStats`) w lib/supabase/*,
 * których NIE edytuje agent od synchronizacji osiągnięć (lib/achievements/**).
 */

import { getSupabaseOrNull, isSupabaseConfigured } from "@/lib/supabase";
import { isPostgrestUndefinedColumnError } from "@/lib/supabase/errors";
import type {
  DuelDeliveryMode,
  DuelOutcome,
  DuelResult,
} from "@/lib/pojedynki/duel-types";
import type { PostgrestError } from "@supabase/supabase-js";

/** Tryb, w którym rozegrano pojedynek (reużywa typ dostawy z silnika). */
export type DuelMode = DuelDeliveryMode;

/** Zagregowane statystyki pojedynków gracza. */
export type DuelStats = {
  played: number;
  wins: number;
  losses: number;
  draws: number;
  /** Prosty „duel rating": punkty kumulowane za rezultaty (patrz RATING_DELTA). */
  rating: number;
  /** Procent wygranych 0–100 (zaokrąglony). Wyliczany z played/wins. */
  winRate: number;
};

/* -------------------------------------------------------------------------- */
/*  Część czysta — bez I/O (testowalna, reużywalna przez osiągnięcia).        */
/* -------------------------------------------------------------------------- */

/**
 * Przyrost ratingu za rezultat. Rating jest monotoniczny (każda rozgrywka
 * dokłada punkty), więc działa jak „ważone wygrane" — proste i czytelne, bez
 * mechaniki ELO. Wygrana waży najwięcej, porażka daje drobny punkt za udział.
 */
export const DUEL_RATING_DELTA: Record<DuelOutcome, number> = {
  win: 25,
  draw: 10,
  loss: 3,
};

export function duelRatingDelta(outcome: DuelOutcome): number {
  return DUEL_RATING_DELTA[outcome];
}

/** Win rate (0–100) z liczników; bezpieczne przy played = 0. */
export function computeWinRate(wins: number, played: number): number {
  if (played <= 0) return 0;
  return Math.round((wins / played) * 100);
}

/** Pusty, bezpieczny zestaw statystyk (SSR / brak danych). */
export function emptyDuelStats(): DuelStats {
  return { played: 0, wins: 0, losses: 0, draws: 0, rating: 0, winRate: 0 };
}

/** Czysto domyka liczniki (win rate liczony z played/wins). */
function normalizeStats(stats: Omit<DuelStats, "winRate">): DuelStats {
  const played = Math.max(0, Math.round(stats.played));
  const wins = Math.max(0, Math.round(stats.wins));
  return {
    played,
    wins,
    losses: Math.max(0, Math.round(stats.losses)),
    draws: Math.max(0, Math.round(stats.draws)),
    rating: Math.max(0, Math.round(stats.rating)),
    winRate: computeWinRate(wins, played),
  };
}

/** Czysta agregacja: dokłada jeden rezultat do istniejących statystyk. */
export function applyOutcomeToStats(
  stats: DuelStats,
  outcome: DuelOutcome,
): DuelStats {
  return normalizeStats({
    played: stats.played + 1,
    wins: stats.wins + (outcome === "win" ? 1 : 0),
    losses: stats.losses + (outcome === "loss" ? 1 : 0),
    draws: stats.draws + (outcome === "draw" ? 1 : 0),
    rating: stats.rating + duelRatingDelta(outcome),
  });
}

/* -------------------------------------------------------------------------- */
/*  Fallback localStorage (zawsze, także gość/offline).                       */
/* -------------------------------------------------------------------------- */

const STORAGE_PREFIX = "szybka-matma-duel-stats";

function statsKey(userId: string | null): string {
  return `${STORAGE_PREFIX}:${userId ?? "guest"}`;
}

/** Wczytuje lokalne statystyki pojedynków (per użytkownik / gość). */
export function loadDuelStats(userId: string | null = null): DuelStats {
  if (typeof window === "undefined") return emptyDuelStats();
  try {
    const raw = localStorage.getItem(statsKey(userId));
    if (!raw) return emptyDuelStats();
    const parsed = JSON.parse(raw) as Partial<DuelStats>;
    return normalizeStats({
      played: Number(parsed.played) || 0,
      wins: Number(parsed.wins) || 0,
      losses: Number(parsed.losses) || 0,
      draws: Number(parsed.draws) || 0,
      rating: Number(parsed.rating) || 0,
    });
  } catch {
    return emptyDuelStats();
  }
}

function saveDuelStatsLocal(userId: string | null, stats: DuelStats): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(statsKey(userId), JSON.stringify(stats));
  } catch {
    /* ignore quota / private mode */
  }
}

/* -------------------------------------------------------------------------- */
/*  Zapis i odczyt Supabase.                                                  */
/* -------------------------------------------------------------------------- */

const DUEL_PROFILE_COLUMNS =
  "duel_played, duel_wins, duel_losses, duel_draws, duel_rating";

export type DuelOutcomeInput = {
  /** Id zalogowanego gracza lub null (gość — tylko zapis lokalny). */
  userId: string | null;
  outcome: DuelOutcome;
  myResult: DuelResult;
  opponentResult: DuelResult;
  mode: DuelMode;
  slug: string;
  /** Stabilny identyfikator jednego zakończenia — chroni przed podwójną nagrodą. */
  eventId: string;
};

export type RecordDuelResult = {
  /** Zaktualizowane statystyki (lokalne; po udanym zapisie zsynchronizowane z DB). */
  stats: DuelStats;
  /** Czy zagregowane liczniki trafiły do bazy (false = tylko lokalnie). */
  persisted: boolean;
};

/**
 * Rejestruje zakończony pojedynek: ZAWSZE aktualizuje lokalne statystyki, a dla
 * zalogowanego gracza z dostępnym Supabase dodatkowo zapisuje wiersz historii
 * (`duel_results`) oraz inkrementuje zagregowane liczniki w `profiles.duel_*`
 * (źródło rankingu pojedynków). Toleruje brak tabeli/kolumn (fallback lokalny).
 */
export async function recordDuelOutcome(
  input: DuelOutcomeInput,
): Promise<RecordDuelResult> {
  const { userId, outcome, myResult, opponentResult, mode, slug, eventId } =
    input;

  // 1) Lokalny fallback — zawsze (gość, offline, brak kolumn).
  const localNext = applyOutcomeToStats(loadDuelStats(userId), outcome);
  saveDuelStatsLocal(userId, localNext);

  if (!userId || !isSupabaseConfigured()) {
    return { stats: localNext, persisted: false };
  }

  const supabase = getSupabaseOrNull();
  if (!supabase) return { stats: localNext, persisted: false };

  try {
    const { data, error } = await supabase.rpc("record_duel_result", {
      p_event_id: eventId,
      p_outcome: outcome,
      p_mode: mode,
      p_slug: slug,
      p_score: myResult.score,
      p_opponent_score: opponentResult.score,
      p_correct: myResult.correct,
      p_total: myResult.total,
      p_duration_ms: myResult.durationMs,
    });
    if (error) {
      console.warn("[szybka-matma] record_duel_result:", error);
      return { stats: localNext, persisted: false };
    }
    return { stats: localNext, persisted: Boolean(data) };
  } catch (err) {
    console.warn("[szybka-matma] record_duel_result (wyjątek):", err);
    return { stats: localNext, persisted: false };
  }
}

/**
 * Odczyt zagregowanych statystyk pojedynków zalogowanego gracza z `profiles`.
 * Zwraca null, gdy Supabase niedostępne, brak kolumn lub brak profilu — wówczas
 * wołający może użyć lokalnego `loadDuelStats`. Czysty punkt odczytu m.in. dla
 * osiągnięć (poza lib/achievements/**).
 */
export async function fetchDuelStats(
  userId: string,
): Promise<DuelStats | null> {
  const supabase = getSupabaseOrNull();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select(DUEL_PROFILE_COLUMNS)
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    if (!isPostgrestUndefinedColumnError(error as PostgrestError)) {
      console.warn("[szybka-matma] fetchDuelStats:", error);
    }
    return null;
  }
  if (!data) return null;

  const row = data as Record<string, unknown>;
  return normalizeStats({
    played: Number(row.duel_played) || 0,
    wins: Number(row.duel_wins) || 0,
    losses: Number(row.duel_losses) || 0,
    draws: Number(row.duel_draws) || 0,
    rating: Number(row.duel_rating) || 0,
  });
}
