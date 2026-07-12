import { topicProgressKey } from "@/lib/supabase/solved-tasks";
import { normalizeCkeTopicSlug } from "@/lib/trening/cke-slug-normalize";
import type { TaskRow } from "@/lib/supabase/tasks";
import type {
  ExamType,
  TopicStatus,
  TrainingExam,
} from "@/types/database";
import type {
  CategoryWithProgress,
  ExamWithProgress,
  TrainingTopicWithProgress,
} from "@/lib/trening/progress";

export type TaskTreeRow = Pick<TaskRow, "id" | "category" | "topic">;

const TOPIC_STATUS_ORDER: Record<TopicStatus, number> = {
  available: 0,
  completed: 1,
  locked: 2,
  coming_soon: 3,
};

/** Etykieta UI z slugu bazy (category / topic). */
export function formatTreningLabel(slug: string): string {
  if (!slug) return slug;

  const hasSpaces = slug.includes(" ");
  const hasMixedCase =
    /[A-ZĄĆĘŁŃÓŚŹŻ]/.test(slug) && /[a-ząćęłńóśźż]/.test(slug);

  if (hasSpaces && (hasMixedCase || !slug.includes("_"))) {
    return slug;
  }

  if (!slug.includes("_")) {
    return slug.charAt(0).toUpperCase() + slug.slice(1);
  }

  return slug
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function deriveTopicStatus(total: number, solved: number): TopicStatus {
  if (total <= 0) return "coming_soon";
  if (solved >= total) return "completed";
  return "available";
}

function topicPercent(total: number, solved: number): number {
  if (total <= 0) return 0;
  return Math.round((Math.min(solved, total) / total) * 100);
}

function sortTopicsByProgress(
  topics: TrainingTopicWithProgress[],
): TrainingTopicWithProgress[] {
  return [...topics].sort((a, b) => {
    const statusDiff =
      TOPIC_STATUS_ORDER[a.status] - TOPIC_STATUS_ORDER[b.status];
    if (statusDiff !== 0) return statusDiff;
    if (a.status === "available" && b.status === "available") {
      const aDone = a.solved >= a.total;
      const bDone = b.solved >= b.total;
      if (aDone !== bDone) return aDone ? 1 : -1;
      return a.percent - b.percent;
    }
    return a.name.localeCompare(b.name, "pl");
  });
}

function compareLabels(a: string, b: string): number {
  return formatTreningLabel(a).localeCompare(formatTreningLabel(b), "pl");
}

/**
 * Drzewo treningu wyłącznie z wierszy Supabase (category / topic z bazy).
 * Linki używają surowych id (category, topic); nazwy — po formatTreningLabel.
 */
export function buildTreningTreeFromTasks(
  tasks: TaskTreeRow[],
  solvedIds: Set<string>,
  meta: Pick<TrainingExam, "examType" | "label" | "shortLabel">,
): ExamWithProgress {
  const byCategory = new Map<
    string,
    Map<string, { total: number; solved: number }>
  >();

  for (const task of tasks) {
    let topics = byCategory.get(task.category);
    if (!topics) {
      topics = new Map();
      byCategory.set(task.category, topics);
    }
    const entry = topics.get(task.topic) ?? { total: 0, solved: 0 };
    entry.total += 1;
    if (solvedIds.has(task.id)) {
      entry.solved += 1;
    }
    topics.set(task.topic, entry);
  }

  return {
    examType: meta.examType,
    label: meta.label,
    shortLabel: meta.shortLabel,
    categories: buildCategoriesFromTopicMaps(byCategory),
  };
}

function buildCategoriesFromTopicMaps(
  byCategory: Map<string, Map<string, { total: number; solved: number }>>,
): CategoryWithProgress[] {
  const categories: CategoryWithProgress[] = [];

  for (const categoryId of [...byCategory.keys()].sort(compareLabels)) {
    const topicMap = byCategory.get(categoryId)!;
    const topics: TrainingTopicWithProgress[] = [];

    for (const topicId of [...topicMap.keys()].sort(compareLabels)) {
      const { total, solved: rawSolved } = topicMap.get(topicId)!;
      const solved = Math.min(rawSolved, total);
      const percent = topicPercent(total, solved);
      const status = deriveTopicStatus(total, solved);
      topics.push({
        id: topicId,
        name: formatTreningLabel(topicId),
        status,
        total,
        solved,
        percent,
      });
    }

    const taskTotal = topics.reduce((sum, t) => sum + t.total, 0);
    const taskSolved = topics.reduce((sum, t) => sum + t.solved, 0);
    const progressPercent =
      taskTotal > 0 ? Math.round((taskSolved / taskTotal) * 100) : 0;

    categories.push({
      id: categoryId,
      name: formatTreningLabel(categoryId),
      progressPercent,
      topics: sortTopicsByProgress(topics),
    });
  }

  return categories;
}

/** Drzewo z map liczników (klucz: exam_type:category:topic). */
export function buildTreningTreeFromCounts(
  examType: ExamType,
  taskCounts: Map<string, number>,
  solvedCounts: Map<string, number>,
  meta: Pick<TrainingExam, "examType" | "label" | "shortLabel">,
): ExamWithProgress {
  const byCategory = new Map<
    string,
    Map<string, { total: number; solved: number }>
  >();

  for (const [key, total] of taskCounts) {
    if (total <= 0) continue;
    const parts = key.split(":");
    if (parts.length !== 3 || parts[0] !== examType) continue;
    const [, category, topic] = parts;
    if (!category || !topic) continue;

    let topics = byCategory.get(category);
    if (!topics) {
      topics = new Map();
      byCategory.set(category, topics);
    }
    const solved = Math.min(solvedCounts.get(key) ?? 0, total);
    topics.set(topic, { total, solved });
  }

  return {
    examType: meta.examType,
    label: meta.label,
    shortLabel: meta.shortLabel,
    categories: buildCategoriesFromTopicMaps(byCategory),
  };
}

export function countsFromTasks(
  tasks: TaskTreeRow[],
  examType: ExamType,
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const task of tasks) {
    const { category, topic } = normalizeCkeTopicSlug(
      examType,
      task.category,
      task.topic,
    );
    const key = topicProgressKey(examType, category, topic);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

export function solvedCountsFromTasks(
  tasks: TaskTreeRow[],
  solvedIds: Set<string>,
  examType: ExamType,
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const task of tasks) {
    if (!solvedIds.has(task.id)) continue;
    const { category, topic } = normalizeCkeTopicSlug(
      examType,
      task.category,
      task.topic,
    );
    const key = topicProgressKey(examType, category, topic);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}
