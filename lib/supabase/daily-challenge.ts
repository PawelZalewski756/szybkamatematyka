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
  if (isSchemaMissingError(error.message)) return true;
  if (error.code === "42P01") return true;
  return /daily_challenges/i.test(error.message ?? "");
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
 * Zapisuje ukończenie wyzwania. Zwraca true, gdy zapis się powiódł
 * (lub był już zapisany). Toleruje brak tabeli oraz duplikat (23505).
 */
export async function recordChallengeCompletion(
  userId: string,
  completion: DailyChallengeCompletion,
): Promise<boolean> {
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
    if (pgError.code === "23505") return true;
    if (isTableUnavailable(pgError)) {
      warnTableMissingOnce();
      return false;
    }
    console.warn("[szybka-matma] recordChallengeCompletion:", error);
    return false;
  }

  return true;
}
