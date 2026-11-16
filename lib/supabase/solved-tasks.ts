import { fetchAllPages } from "@/lib/supabase/fetch-all-pages";
import { getSupabase } from "@/lib/supabase";
import {
  isPostgrestUndefinedColumnError,
  isSchemaMissingError,
} from "@/lib/supabase/errors";
import type { ExamType } from "@/types/database";
import type { PostgrestError } from "@supabase/supabase-js";

const MISSING_TABLE_WARN_KEY = "sm_solved_tasks_table_warned";

/**
 * Ile identyfikatorów wysyłamy w jednym `.in()`. PostgREST buduje z tego URL,
 * więc zbyt długa lista kończy się błędem 414 przy uczniach z tysiącami zadań.
 */
const TASK_ID_CHUNK = 200;

function warnSolvedTasksTableMissingOnce(): void {
  if (typeof sessionStorage !== "undefined") {
    if (sessionStorage.getItem(MISSING_TABLE_WARN_KEY)) return;
    try {
      sessionStorage.setItem(MISSING_TABLE_WARN_KEY, "1");
    } catch {
      /* ignore */
    }
  }
  console.warn(
    "[szybka-matma] Tabela solved_tasks niedostępna - postęp areny nie jest zapisywany. " +
      "Uruchom w Supabase SQL Editor: supabase/migrations/init_solved_tasks.sql",
  );
}

/**
 * Tylko realny brak tabeli. Wcześniej wystarczyło słowo „solved_tasks” w
 * komunikacie, więc błąd RLS/uprawnień był raportowany jako brak migracji
 * i funkcja po cichu przechodziła w tryb lokalny.
 */
function isSolvedTasksUnavailable(error: PostgrestError | null): boolean {
  if (!error) return false;
  if (error.code === "42P01" || error.code === "PGRST205") return true;
  if (error.code === "42501") return false;
  const message = error.message ?? "";
  if (/permission denied/i.test(message)) return false;
  return isSchemaMissingError(message);
}

function isExamType(value: unknown): value is ExamType {
  return (
    value === "matura_podstawowa" ||
    value === "matura_rozszerzona" ||
    value === "8_klasa"
  );
}

export function topicProgressKey(
  examType: ExamType,
  category: string,
  topic: string,
): string {
  return `${examType}:${category}:${topic}`;
}

/**
 * Wszystkie rozwiązane zadania użytkownika. Stronicowanie jest konieczne:
 * PostgREST domyślnie zwraca maksymalnie 1000 wierszy, więc po przekroczeniu
 * tego progu licznik i postęp tematów przestawały rosnąć.
 */
export async function fetchSolvedTaskIds(userId: string): Promise<Set<string>> {
  const supabase = getSupabase();

  const { rows, error } = await fetchAllPages<{ task_id: string }>((from, to) =>
    supabase
      .from("solved_tasks")
      .select("task_id")
      .eq("user_id", userId)
      // Stabilna kolejność = brak duplikatów pomiędzy równoległymi stronami.
      .order("task_id", { ascending: true })
      .range(from, to),
  );

  if (error) {
    if (isSolvedTasksUnavailable(error)) {
      warnSolvedTasksTableMissingOnce();
      return new Set();
    }
    console.warn("[szybka-matma] fetchSolvedTaskIds:", error);
    return new Set();
  }

  return new Set(
    rows.map((row) => row.task_id).filter((id): id is string => Boolean(id)),
  );
}

export type RecentSolvedTopic = {
  examType: ExamType;
  category: string;
  topic: string;
  solvedAt: string;
};

/**
 * Ostatni temat, w którym zalogowany użytkownik rozwiązał zadanie.
 *
 * Dwa zapytania zamiast `tasks!inner`: po migracji
 * 20261116120000_solved_tasks_allow_cached_tasks.sql nie ma już klucza obcego
 * solved_tasks → tasks, więc osadzanie `tasks!inner` przestałoby działać.
 */
export async function fetchLatestSolvedTopic(
  userId: string,
): Promise<RecentSolvedTopic | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("solved_tasks")
    .select("task_id, solved_at")
    .eq("user_id", userId)
    .order("solved_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    if (!isSolvedTasksUnavailable(error as PostgrestError)) {
      console.warn("[szybka-matma] fetchLatestSolvedTopic:", error);
    }
    return null;
  }
  if (!data?.task_id) return null;

  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .select("exam_type, category, topic")
    .eq("id", data.task_id)
    .maybeSingle();

  if (taskError || !task) {
    // Zadanie istnieje tylko w cache treningu - brak metadanych tematu.
    return null;
  }

  if (
    !isExamType(task.exam_type) ||
    typeof task.category !== "string" ||
    typeof task.topic !== "string"
  ) {
    return null;
  }

  return {
    examType: task.exam_type,
    category: task.category,
    topic: task.topic,
    solvedAt:
      typeof data.solved_at === "string"
        ? data.solved_at
        : new Date().toISOString(),
  };
}

/** Zwraca true, gdy zadanie zostało zapisane po raz pierwszy. */
export async function markTaskSolved(
  userId: string,
  taskId: string,
): Promise<boolean> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("solved_tasks")
    .insert({ user_id: userId, task_id: taskId })
    .select("task_id")
    .maybeSingle()
    .retry(false);

  if (error) {
    const pgError = error as PostgrestError;
    if (pgError.code === "23505") return false;
    if (pgError.code === "23503") {
      // Klucz obcy do public.tasks - zadanie istnieje tylko w cache zadań.
      const taskMissingError = new Error(
        "Zadanie nie jest zapisane w tabeli tasks, więc jego postęp nie może trafić do solved_tasks. " +
          "Uruchom w Supabase SQL Editor: supabase/migrations/20261116120000_solved_tasks_allow_cached_tasks.sql",
      );
      console.warn("[szybka-matma] markTaskSolved:", taskMissingError.message);
      throw taskMissingError;
    }
    if (isSolvedTasksUnavailable(pgError)) {
      warnSolvedTasksTableMissingOnce();
      return false;
    }
    console.warn("[szybka-matma] markTaskSolved:", error);
    throw error;
  }

  return Boolean(data?.task_id);
}

export type SolvedTopicCount = {
  examType: ExamType;
  category: string;
  topic: string;
  solved: number;
};

/** Liczba rozwiązanych zadań per temat (bez osadzania FK). */
export async function fetchSolvedCountsByTopic(
  userId: string,
  examType?: ExamType,
): Promise<Map<string, number>> {
  const supabase = getSupabase();

  const { rows: solvedRows, error } = await fetchAllPages<{ task_id: string }>(
    (from, to) =>
      supabase
        .from("solved_tasks")
        .select("task_id")
        .eq("user_id", userId)
        .order("task_id", { ascending: true })
        .range(from, to),
  );

  if (error) {
    if (isSolvedTasksUnavailable(error)) {
      warnSolvedTasksTableMissingOnce();
      return new Map();
    }
    if (isPostgrestUndefinedColumnError(error)) {
      return new Map();
    }
    console.warn("[szybka-matma] fetchSolvedCountsByTopic:", error);
    return new Map();
  }

  const ids = solvedRows
    .map((row) => row.task_id)
    .filter((id): id is string => Boolean(id));

  const counts = new Map<string, number>();
  for (let index = 0; index < ids.length; index += TASK_ID_CHUNK) {
    const chunk = ids.slice(index, index + TASK_ID_CHUNK);
    let query = supabase
      .from("tasks")
      .select("id, exam_type, category, topic")
      .in("id", chunk);

    if (examType) {
      query = query.eq("exam_type", examType);
    }

    const { data, error: tasksError } = await query;
    if (tasksError) {
      console.warn("[szybka-matma] fetchSolvedCountsByTopic tasks:", tasksError);
      continue;
    }

    for (const row of data ?? []) {
      if (!isExamType(row.exam_type)) continue;
      const key = topicProgressKey(row.exam_type, row.category, row.topic);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  return counts;
}
