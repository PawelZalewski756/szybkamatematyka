import { topicProgressKey } from "@/lib/supabase/solved-tasks";
import { buildTreningTreeFromCounts } from "@/lib/trening/dynamic-tree";
import {
  TRAINING_CURRICULUM,
  type TreningExamKey,
} from "@/lib/trening/curriculum";
import type {
  ExamType,
  TopicStatus,
  TrainingCategory,
  TrainingExam,
  TrainingTopic,
} from "@/types/database";

export type TopicProgress = {
  total: number;
  solved: number;
  percent: number;
  status: TopicStatus;
};

export type TrainingTopicWithProgress = TrainingTopic & TopicProgress;

export type CategoryWithProgress = Omit<TrainingCategory, "topics"> & {
  topics: TrainingTopicWithProgress[];
};

export type ExamWithProgress = Omit<TrainingExam, "categories"> & {
  categories: CategoryWithProgress[];
};

const TOPIC_STATUS_ORDER: Record<TopicStatus, number> = {
  available: 0,
  completed: 1,
  locked: 2,
  coming_soon: 3,
};

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

function deriveTopicStatus(total: number, solved: number): TopicStatus {
  if (total <= 0) return "coming_soon";
  if (solved >= total) return "completed";
  return "available";
}

function topicPercent(total: number, solved: number): number {
  if (total <= 0) return 0;
  return Math.round((Math.min(solved, total) / total) * 100);
}

function mergeCategoriesWithCounts(
  base: TrainingExam,
  taskCounts: Map<string, number>,
  solvedCounts: Map<string, number>,
): CategoryWithProgress[] {
  return base.categories.map((category) => {
    const topics = category.topics.map((topic) => {
      const key = topicProgressKey(
        base.examType,
        category.id,
        topic.id,
      );
      const total = taskCounts.get(key) ?? 0;
      const solved = Math.min(solvedCounts.get(key) ?? 0, total);
      const percent = topicPercent(total, solved);

      return {
        ...topic,
        total,
        solved,
        percent,
        status: deriveTopicStatus(total, solved),
      };
    });

    const taskTotal = topics.reduce((sum, t) => sum + t.total, 0);
    const taskSolved = topics.reduce((sum, t) => sum + t.solved, 0);
    const progressPercent =
      taskTotal > 0 ? Math.round((taskSolved / taskTotal) * 100) : 0;

    return {
      ...category,
      progressPercent,
      topics: sortTopicsByProgress(topics),
    };
  });
}

export function mergeExamProgress(
  examKey: TreningExamKey,
  taskCounts: Map<string, number>,
  solvedCounts: Map<string, number>,
): ExamWithProgress {
  const base = TRAINING_CURRICULUM[examKey];
  return {
    ...base,
    categories: mergeCategoriesWithCounts(base, taskCounts, solvedCounts),
  };
}

/** Postęp egzaminu - drzewo wyłącznie z liczników Supabase (bez statycznego CKE). */
export function mergeTrainingProgressForExam(
  examKey: TreningExamKey,
  taskCounts: Map<string, number>,
  solvedCounts: Map<string, number>,
): ExamWithProgress {
  const base = TRAINING_CURRICULUM[examKey];
  return buildTreningTreeFromCounts(
    base.examType,
    taskCounts,
    solvedCounts,
    base,
  );
}

export function mergeAllTrainingProgress(
  taskCounts: Map<string, number>,
  solvedCounts: Map<string, number>,
): Record<TreningExamKey, ExamWithProgress> {
  return {
    matura_podstawowa: mergeTrainingProgressForExam(
      "matura_podstawowa",
      taskCounts,
      solvedCounts,
    ),
    "8_klasa": mergeTrainingProgressForExam("8_klasa", taskCounts, solvedCounts),
  };
}

export function examTypeToTreningKey(examType: ExamType): TreningExamKey | null {
  if (examType === "matura_podstawowa") return "matura_podstawowa";
  if (examType === "8_klasa") return "8_klasa";
  return null;
}
