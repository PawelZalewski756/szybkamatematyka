import { getSupabaseOrNull } from "@/lib/supabase";
import { isSchemaMissingError } from "@/lib/supabase/errors";
import type { PostgrestError } from "@supabase/supabase-js";

const TABLE = "user_achievements";
const MISSING_TABLE_WARN_KEY = "sm_user_achievements_table_warned";

/** Pojedynczy wiersz osiągnięcia gracza pobrany z Supabase. */
export type UnlockedAchievementRecord = {
  id: string;
  /** Czy gracz „widział" już tę odznakę jako odblokowaną (na którymkolwiek urządzeniu). */
  seen: boolean;
  unlockedAt: number | null;
};

type UserAchievementRow = {
  achievement_id: string;
  unlocked_at: string | null;
  seen: boolean | null;
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
    "[szybka-matma] Tabela user_achievements niedostępna — osiągnięcia zapisywane tylko lokalnie. " +
      "Uruchom w Supabase SQL Editor: supabase/migrations/20260529161000_add_achievements.sql",
  );
}

function isTableUnavailable(error: PostgrestError | null): boolean {
  if (!error) return false;
  if (isSchemaMissingError(error.message)) return true;
  if (error.code === "42P01") return true;
  return new RegExp(TABLE, "i").test(error.message ?? "");
}

function mapRow(row: UserAchievementRow): UnlockedAchievementRecord {
  return {
    id: row.achievement_id,
    seen: Boolean(row.seen),
    unlockedAt: row.unlocked_at ? new Date(row.unlocked_at).getTime() : null,
  };
}

/**
 * Pobiera odblokowane osiągnięcia gracza z Supabase (wraz z flagą „widziane").
 * Pusta lista przy braku Supabase / braku tabeli / błędzie — cichy fallback.
 */
export async function fetchUnlockedAchievements(
  userId: string,
): Promise<UnlockedAchievementRecord[]> {
  const supabase = getSupabaseOrNull();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from(TABLE)
    .select("achievement_id, unlocked_at, seen")
    .eq("user_id", userId);

  if (error) {
    if (isTableUnavailable(error as PostgrestError)) {
      warnTableMissingOnce();
      return [];
    }
    console.warn("[szybka-matma] fetchUnlockedAchievements:", error);
    return [];
  }

  return (data ?? []).map((row) => mapRow(row as UserAchievementRow));
}

/**
 * Zapisuje (insert) nowo odblokowane osiągnięcia. Istniejące wiersze są pomijane
 * (ignoreDuplicates) — dzięki temu NIE nadpisujemy flagi „seen" ani `unlocked_at`.
 * Best-effort: błędy nie blokują UI.
 */
export async function recordUnlockedAchievements(
  userId: string,
  ids: readonly string[],
): Promise<void> {
  const supabase = getSupabaseOrNull();
  if (!supabase || ids.length === 0) return;

  const rows = ids.map((id) => ({ user_id: userId, achievement_id: id }));
  const { error } = await supabase
    .from(TABLE)
    .upsert(rows, { onConflict: "user_id,achievement_id", ignoreDuplicates: true });

  if (error) {
    if (isTableUnavailable(error as PostgrestError)) {
      warnTableMissingOnce();
      return;
    }
    console.warn("[szybka-matma] recordUnlockedAchievements:", error);
  }
}

/**
 * Oznacza wskazane osiągnięcia jako „widziane" (seen = true). Best-effort —
 * aktualizuje tylko istniejące wiersze; brak wiersza/tabeli jest cicho ignorowany.
 */
export async function markAchievementsSeen(
  userId: string,
  ids: readonly string[],
): Promise<void> {
  const supabase = getSupabaseOrNull();
  if (!supabase || ids.length === 0) return;

  const { error } = await supabase
    .from(TABLE)
    .update({ seen: true })
    .eq("user_id", userId)
    .in("achievement_id", ids as string[]);

  if (error) {
    if (isTableUnavailable(error as PostgrestError)) {
      warnTableMissingOnce();
      return;
    }
    console.warn("[szybka-matma] markAchievementsSeen:", error);
  }
}
