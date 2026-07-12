import { getSupabase } from "@/lib/supabase";
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
      const { data, error } = await supabase
        .from("tasks")
        .select(
          "id, exam_type, category, topic, difficulty, content, correct_answer, options, xp_reward",
        )
        .eq("exam_type", et)
        .eq("category", slug.category)
        .eq("topic", slug.topic)
        .order("difficulty", { ascending: true });

      if (error) throw error;
      const rows = (data as TaskRow[]) ?? [];
      if (rows.length > 0) return rows.map(mapTask);
    }
  }

  return [];
}

import {
  answersEquivalent,
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

  const { data, error } = await supabase
    .from("tasks")
    .select("id, category, topic")
    .in("exam_type", legacyExamTypesFor(examType));

  if (error) throw error;
  return (data as TaskTreeRow[]) ?? [];
}

/** Liczba zadań w bazie per temat (klucz: exam_type:category:topic). */
export async function fetchTaskCountsByTopic(
  examType?: ExamType,
): Promise<Map<string, number>> {
  const supabase = getSupabase();

  let query = supabase.from("tasks").select("exam_type, category, topic");
  if (examType) {
    query = query.eq("exam_type", examType);
  }

  const { data, error } = await query;

  if (error) throw error;

  const counts = new Map<string, number>();
  for (const row of (data as TopicTaskCountRow[]) ?? []) {
    const key = `${row.exam_type}:${row.category}:${row.topic}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}
