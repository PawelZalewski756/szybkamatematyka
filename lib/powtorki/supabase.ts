import { getSupabaseOrNull } from "@/lib/supabase";
import { isSchemaMissingError } from "@/lib/supabase/errors";
import type { ReviewItem } from "@/lib/powtorki/types";
import type { PostgrestError } from "@supabase/supabase-js";

const TABLE = "review_schedule";
const MISSING_TABLE_WARN_KEY = "sm_review_schedule_table_warned";

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
    "[szybka-matma] Tabela review_schedule niedostępna — powtórki zapisywane tylko lokalnie. " +
      "Uruchom w Supabase SQL Editor: supabase/migrations/20260529140000_add_review_schedule.sql",
  );
}

function isTableUnavailable(error: PostgrestError | null): boolean {
  if (!error) return false;
  if (isSchemaMissingError(error.message)) return true;
  if (error.code === "42P01") return true;
  return new RegExp(TABLE, "i").test(error.message ?? "");
}

type ReviewRow = {
  task_id: string;
  repetitions: number;
  interval_days: number;
  easiness: number;
  next_review_at: string;
  last_result: string | null;
  last_reviewed_at: string | null;
  added_at: string;
};

function rowToItem(row: ReviewRow): ReviewItem {
  const lastResult =
    row.last_result === "correct" || row.last_result === "wrong"
      ? row.last_result
      : null;
  return {
    taskId: row.task_id,
    repetitions: row.repetitions ?? 0,
    intervalDays: row.interval_days ?? 0,
    easiness: row.easiness ?? 2.5,
    nextReviewAt: new Date(row.next_review_at).getTime(),
    lastResult,
    lastReviewedAt: row.last_reviewed_at
      ? new Date(row.last_reviewed_at).getTime()
      : null,
    addedAt: new Date(row.added_at).getTime(),
  };
}

function itemToRow(userId: string, item: ReviewItem) {
  return {
    user_id: userId,
    task_id: item.taskId,
    repetitions: item.repetitions,
    interval_days: item.intervalDays,
    easiness: item.easiness,
    next_review_at: new Date(item.nextReviewAt).toISOString(),
    last_result: item.lastResult,
    last_reviewed_at:
      item.lastReviewedAt != null
        ? new Date(item.lastReviewedAt).toISOString()
        : null,
    added_at: new Date(item.addedAt).toISOString(),
  };
}

/** Pobiera harmonogram powtórek z Supabase. Pusta lista, gdy brak tabeli/błąd. */
export async function fetchReviewSchedule(
  userId: string,
): Promise<ReviewItem[]> {
  const supabase = getSupabaseOrNull();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from(TABLE)
    .select(
      "task_id, repetitions, interval_days, easiness, next_review_at, last_result, last_reviewed_at, added_at",
    )
    .eq("user_id", userId);

  if (error) {
    if (isTableUnavailable(error as PostgrestError)) {
      warnTableMissingOnce();
      return [];
    }
    console.warn("[szybka-matma] fetchReviewSchedule:", error);
    return [];
  }

  return (data ?? []).map((row) => rowToItem(row as ReviewRow));
}

/** Zapisuje (upsert) pojedynczy wpis. Best-effort — błędy nie blokują UI. */
export async function upsertReviewItem(
  userId: string,
  item: ReviewItem,
): Promise<void> {
  const supabase = getSupabaseOrNull();
  if (!supabase) return;

  const { error } = await supabase
    .from(TABLE)
    .upsert(itemToRow(userId, item), { onConflict: "user_id,task_id" });

  if (error && !isTableUnavailable(error as PostgrestError)) {
    console.warn("[szybka-matma] upsertReviewItem:", error);
  } else if (error) {
    warnTableMissingOnce();
  }
}

/** Usuwa wpis powtórki. Best-effort. */
export async function deleteReviewItem(
  userId: string,
  taskId: string,
): Promise<void> {
  const supabase = getSupabaseOrNull();
  if (!supabase) return;

  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("user_id", userId)
    .eq("task_id", taskId);

  if (error && !isTableUnavailable(error as PostgrestError)) {
    console.warn("[szybka-matma] deleteReviewItem:", error);
  }
}
