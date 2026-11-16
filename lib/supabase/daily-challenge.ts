import { getSupabase } from "@/lib/supabase";
import { isSchemaMissingError } from "@/lib/supabase/errors";
import type { PostgrestError } from "@supabase/supabase-js";

const MISSING_TABLE_WARN_KEY = "sm_daily_challenges_table_warned";

export type DailyChallengeCompletion = {
  date: string;
  correctCount: number;
  totalCount: number;
  xpAwarded: number;
  streakAfter: number;
};

type DailyChallengeRow = {
  challenge_date: string;
  correct_count: number | null;
  total_count: number | null;
  xp_awarded: number | null;
  streak_after: number | null;
};

function warnTableMissingOnce(): void {
  if (typeof sessionStorage !== "undefined") {
    if (sessionStorage.getItem(MISSING_TABLE_WARN_KEY)) return;
    try {
      sessionStorage.setItem(MISSING_TABLE_WARN_KEY, "1");
    } catch {
      /* ignore */
    }
  }
  console.warn(
    "[szybka-matma] Tabela daily_challenges niedostępna - dzienne wyzwanie zapisywane tylko lokalnie. " +
      "Uruchom w Supabase SQL Editor: supabase/migrations/20260529135000_add_daily_challenges.sql",
  );
}

function isTableUnavailable(error: PostgrestError | null): boolean {
  if (!error) return false;
  // Tylko brak tabeli; błąd RLS (42501) nie jest brakiem migracji.
  if (error.code === "42P01" || error.code === "PGRST205") return true;
  if (error.code === "42501") return false;
  return isSchemaMissingError(error.message);
}

function mapRow(row: DailyChallengeRow): DailyChallengeCompletion {
  return {
    date: row.challenge_date,
    correctCount: Number(row.correct_count) || 0,
    totalCount: Number(row.total_count) || 0,
    xpAwarded: Number(row.xp_awarded) || 0,
    streakAfter: Number(row.streak_after) || 0,
  };
}

/** Zwraca zapis ukończenia wyzwania dla danej daty lub null. */
export async function fetchChallengeCompletion(
  userId: string,
  date: string,
): Promise<DailyChallengeCompletion | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("daily_challenges")
    .select("challenge_date, correct_count, total_count, xp_awarded, streak_after")
    .eq("user_id", userId)
    .eq("challenge_date", date)
    .maybeSingle();

  if (error) {
    if (isTableUnavailable(error as PostgrestError)) {
      warnTableMissingOnce();
      return null;
    }
    console.warn("[szybka-matma] fetchChallengeCompletion:", error);
    return null;
  }

  return data ? mapRow(data as DailyChallengeRow) : null;
}

/**
 * Wynik próby zapisania ukończenia:
 * - `inserted` - to wywołanie zapisało dzisiejsze ukończenie (można nadać XP),
 * - `existing` - wpis już był (druga karta / powtórka) - nie nadawaj XP ponownie,
 * - `failed` - brak tabeli / błąd zapisu - nie udawaj ukończenia.
 */
export type ChallengeCompletionClaim = "inserted" | "existing" | "failed";

/**
 * Zapisuje ukończenie wyzwania jako „claim”. Unikalny klucz
 * (user_id, challenge_date) gwarantuje, że tylko jedno wywołanie dostanie
 * `inserted`, więc XP nie da się naliczyć dwa razy.
 */
export async function recordChallengeCompletion(
  userId: string,
  completion: DailyChallengeCompletion,
): Promise<ChallengeCompletionClaim> {
  const supabase = getSupabase();

  const { error } = await supabase.from("daily_challenges").insert({
    user_id: userId,
    challenge_date: completion.date,
    correct_count: completion.correctCount,
    total_count: completion.totalCount,
    xp_awarded: completion.xpAwarded,
    streak_after: completion.streakAfter,
  });

  if (error) {
    const pgError = error as PostgrestError;
    if (pgError.code === "23505") return "existing";
    if (isTableUnavailable(pgError)) {
      warnTableMissingOnce();
      return "failed";
    }
    console.warn("[szybka-matma] recordChallengeCompletion:", error);
    return "failed";
  }

  return "inserted";
}
