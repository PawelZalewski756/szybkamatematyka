import { getSupabase } from "@/lib/supabase";
import {
  isPostgrestUndefinedColumnError,
  isSchemaMissingError,
} from "@/lib/supabase/errors";
import type { ExamType } from "@/types/database";
import type { PostgrestError } from "@supabase/supabase-js";

const MISSING_TABLE_WARN_KEY = "sm_solved_tasks_table_warned";

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
    "[szybka-matma] Tabela solved_tasks niedostępna — postęp areny nie jest zapisywany. " +
      "Uruchom w Supabase SQL Editor: supabase/migrations/init_solved_tasks.sql",
  );
}

function isSolvedTasksUnavailable(error: PostgrestError | null): boolean {
  if (!error) return false;
  if (isSchemaMissingError(error.message)) return true;
  if (error.code === "42P01") return true;
  return /solved_tasks/i.test(error.message ?? "");
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

export async function fetchSolvedTaskIds(userId: string): Promise<Set<string>> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("solved_tasks")
    .select("task_id")
    .eq("user_id", userId)
    .retry(false);

  if (error) {
    if (isSolvedTasksUnavailable(error as PostgrestError)) {
      warnSolvedTasksTableMissingOnce();
      return new Set();
    }
    console.warn("[szybka-matma] fetchSolvedTaskIds:", error);
    return new Set();
  }

  return new Set(
    (data ?? [])
      .map((row) => row.task_id as string)
      .filter(Boolean),
  );
}

export type RecentSolvedTopic = {
  examType: ExamType;
  category: string;
  topic: string;
  solvedAt: string;
};

/** Ostatni temat, w którym zalogowany użytkownik rozwiązał zadanie. */
export async function fetchLatestSolvedTopic(
  userId: string,
): Promise<RecentSolvedTopic | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("solved_tasks")
    .select("solved_at, tasks!inner(exam_type, category, topic)")
    .eq("user_id", userId)
    .order("solved_at", { ascending: false })
    .limit(1)
    .maybeSingle()
    .retry(false);

  if (error) {
    if (!isSolvedTasksUnavailable(error as PostgrestError)) {
      console.warn("[szybka-matma] fetchLatestSolvedTopic:", error);
    }
    return null;
  }

  const rawTask = data?.tasks as unknown;
  const task = (Array.isArray(rawTask) ? rawTask[0] : rawTask) as {
    exam_type?: unknown;
    category?: unknown;
    topic?: unknown;
  } | null;

  if (
    !task ||
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
      typeof data?.solved_at === "string" ? data.solved_at : new Date().toISOString(),
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

export async function fetchSolvedCountsByTopic(
  userId: string,
  examType?: ExamType,
): Promise<Map<string, number>> {
  const supabase = getSupabase();

  let query = supabase
    .from("solved_tasks")
    .select("task_id, tasks!inner(exam_type, category, topic)")
    .eq("user_id", userId)
    .retry(false);

  if (examType) {
    query = query.eq("tasks.exam_type", examType);
  }

  const { data, error } = await query;

  if (error) {
    if (isSolvedTasksUnavailable(error as PostgrestError)) {
      warnSolvedTasksTableMissingOnce();
      return new Map();
    }
    if (isPostgrestUndefinedColumnError(error as PostgrestError)) {
      return fetchSolvedCountsByTopicFallback(userId, examType);
    }
    console.warn("[szybka-matma] fetchSolvedCountsByTopic:", error);
    return new Map();
  }

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const raw = row.tasks as unknown;
    const task = (Array.isArray(raw) ? raw[0] : raw) as {
      exam_type: ExamType;
      category: string;
      topic: string;
    } | null;
    if (!task?.exam_type) continue;
    const key = topicProgressKey(task.exam_type, task.category, task.topic);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

async function fetchSolvedCountsByTopicFallback(
  userId: string,
  examType?: ExamType,
): Promise<Map<string, number>> {
  const solvedIds = await fetchSolvedTaskIds(userId);
  if (solvedIds.size === 0) return new Map();

  const supabase = getSupabase();
  let query = supabase
    .from("tasks")
    .select("id, exam_type, category, topic")
    .in("id", [...solvedIds])
    .retry(false);

  if (examType) {
    query = query.eq("exam_type", examType);
  }

  const { data, error } = await query;

  if (error) {
    console.warn("[szybka-matma] fetchSolvedCountsByTopicFallback:", error);
    return new Map();
  }

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const key = topicProgressKey(
      row.exam_type as ExamType,
      row.category,
      row.topic,
    );
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}
