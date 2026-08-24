import { getSupabase } from "@/lib/supabase";
import { isPostgrestUndefinedColumnError } from "@/lib/supabase/errors";
import { fetchAllPages } from "@/lib/supabase/fetch-all-pages";
import { legacyDbSlugsForCkeTopic, legacyExamTypesFor } from "@/lib/trening/cke-slug-normalize";
import type { ExamType, Task } from "@/types/database";

export type TaskRow = {
  id: string;
  exam_type: ExamType;
  category: string;
  topic: string;
  difficulty: number;
  content: string;
  correct_answer: string;
  options: unknown;
  xp_reward: number;
  source_id?: string | null;
  explanation?: string | null;
  solution_steps?: unknown;
};

function parseOptions(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is string => typeof item === "string")
    .map((s) => s.trim())
    .filter(Boolean);
}

function mapTask(row: TaskRow): Task & { options: string[] } {
  return {
    id: row.id,
    exam_type: row.exam_type,
    category: row.category,
    topic: row.topic,
    difficulty: (row.difficulty === 2 || row.difficulty === 3
      ? row.difficulty
      : 1) as Task["difficulty"],
    content: row.content,
    correct_answer: row.correct_answer,
    xp_reward: Number(row.xp_reward) || 0,
    options: parseOptions(row.options),
    source_id: row.source_id ?? null,
    explanation: row.explanation?.trim() || null,
    solution_steps: parseOptions(row.solution_steps),
  };
}

export async function fetchTasksByTopic(
  examType: ExamType,
  category: string,
  topic: string,
): Promise<(Task & { options: string[] })[]> {
  const supabase = getSupabase();
  const slugVariants = legacyDbSlugsForCkeTopic(examType, category, topic);
  const examTypes = legacyExamTypesFor(examType);

  for (const et of examTypes) {
    for (const slug of slugVariants) {
      let result = await supabase
        .from("tasks")
        .select(
          "id, exam_type, category, topic, difficulty, content, correct_answer, options, xp_reward, source_id, explanation, solution_steps",
        )
        .eq("exam_type", et)
        .eq("category", slug.category)
        .eq("topic", slug.topic)
        .order("difficulty", { ascending: true });

      if (
        result.error &&
        isPostgrestUndefinedColumnError(result.error)
      ) {
        result = (await supabase
          .from("tasks")
          .select(
            "id, exam_type, category, topic, difficulty, content, correct_answer, options, xp_reward",
          )
          .eq("exam_type", et)
          .eq("category", slug.category)
          .eq("topic", slug.topic)
          .order("difficulty", { ascending: true })) as typeof result;
      }

      if (result.error) throw result.error;
      const rows = (result.data as TaskRow[]) ?? [];
      if (rows.length > 0) return rows.map(mapTask);
    }
  }

  return [];
}

import {
  checkAnswerMatch,
  normalizeAnswer,
} from "@/lib/math/answer-equiv";

export { normalizeAnswer, checkAnswerMatch };

export type TopicTaskCountRow = {
  exam_type: ExamType;
  category: string;
  topic: string;
};

export type TaskTreeRow = Pick<TaskRow, "id" | "category" | "topic">;

/** Lekka lista zadań do budowy drzewa treningu (bez treści). */
export async function fetchTasksForTree(
  examType: ExamType,
): Promise<TaskTreeRow[]> {
  const supabase = getSupabase();
  const examTypes = legacyExamTypesFor(examType);

  const { rows, error } = await fetchAllPages<TaskTreeRow>((from, to) =>
    supabase
      .from("tasks")
      .select("id, category, topic")
      .in("exam_type", examTypes)
      .range(from, to),
  );

  if (error) throw error;
  return rows;
}

/** Liczba zadań w bazie per temat (klucz: exam_type:category:topic). */
export async function fetchTaskCountsByTopic(
  examType?: ExamType,
): Promise<Map<string, number>> {
  const supabase = getSupabase();

  const { rows, error } = await fetchAllPages<TopicTaskCountRow>((from, to) => {
    let query = supabase
      .from("tasks")
      .select("exam_type, category, topic")
      .range(from, to);
    if (examType) {
      query = query.eq("exam_type", examType);
    }
    return query;
  });

  if (error) throw error;

  const counts = new Map<string, number>();
  for (const row of rows) {
    const key = `${row.exam_type}:${row.category}:${row.topic}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}
