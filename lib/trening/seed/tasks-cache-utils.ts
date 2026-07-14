import fs from "fs";
import path from "path";
import { listCkeTopicsForExam } from "@/lib/trening/cke-curriculum";
import type { ParsedGeminiTask } from "@/lib/gemini/format-tasks";
import type { ExamType } from "@/types/database";

export const TASKS_CACHE_DIR = path.resolve(process.cwd(), "data/tasks-cache");

export type TaskSlot = {
  exam_type: ExamType;
  category: string;
  topic: string;
  categoryName: string;
  topicName: string;
};

export type CachedGeminiTask = ParsedGeminiTask & {
  id: string;
  generatedAt: string;
  model: string;
};

export type CachedTaskBundle = {
  exam_type: ExamType;
  category: string;
  topic: string;
  categoryName: string;
  topicName: string;
  tasks: CachedGeminiTask[];
  updatedAt: string;
};

export function taskSlotKey(slot: Pick<TaskSlot, "exam_type" | "category" | "topic">): string {
  return `${slot.exam_type}:${slot.category}:${slot.topic}`;
}

export function taskCacheFileName(slot: Pick<TaskSlot, "exam_type" | "category" | "topic">): string {
  return `${slot.exam_type}__${slot.category}__${slot.topic}.json`;
}

export function taskCachePath(slot: Pick<TaskSlot, "exam_type" | "category" | "topic">): string {
  return path.join(TASKS_CACHE_DIR, taskCacheFileName(slot));
}

export function listAllTaskSlots(): TaskSlot[] {
  const exams: ExamType[] = ["matura_podstawowa", "8_klasa"];
  return exams.flatMap((exam_type) =>
    listCkeTopicsForExam(exam_type).map((t) => ({
      exam_type,
      category: t.category,
      topic: t.topic,
      categoryName: t.categoryName,
      topicName: t.topicName,
    })),
  );
}

export function readTaskCache(
  slot: Pick<TaskSlot, "exam_type" | "category" | "topic">,
): CachedTaskBundle | null {
  const file = taskCachePath(slot);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as CachedTaskBundle;
  } catch {
    return null;
  }
}

export function writeTaskCache(bundle: CachedTaskBundle): void {
  fs.mkdirSync(TASKS_CACHE_DIR, { recursive: true });
  fs.writeFileSync(taskCachePath(bundle), JSON.stringify(bundle, null, 2), "utf8");
}

export function appendTasksToCache(
  slot: TaskSlot,
  newTasks: CachedGeminiTask[],
): CachedTaskBundle {
  const existing = readTaskCache(slot);
  const bundle: CachedTaskBundle = existing ?? {
    exam_type: slot.exam_type,
    category: slot.category,
    topic: slot.topic,
    categoryName: slot.categoryName,
    topicName: slot.topicName,
    tasks: [],
    updatedAt: new Date().toISOString(),
  };

  bundle.tasks.push(...newTasks);
  bundle.updatedAt = new Date().toISOString();
  writeTaskCache(bundle);
  return bundle;
}

export function countOpenTasksInCache(
  slot: Pick<TaskSlot, "exam_type" | "category" | "topic">,
): number {
  const bundle = readTaskCache(slot);
  return (bundle?.tasks ?? []).filter((t) => t.options.length === 0).length;
}

export function listTaskSlotsNeedingMoreOpen(
  targetPerTopic: number,
  exam?: ExamType,
): TaskSlot[] {
  return listAllTaskSlots()
    .filter((slot) => !exam || slot.exam_type === exam)
    .filter((slot) => countOpenTasksInCache(slot) < targetPerTopic);
}

export function countTasksInCache(slot: Pick<TaskSlot, "exam_type" | "category" | "topic">): number {
  return readTaskCache(slot)?.tasks.length ?? 0;
}

export function countTaskCacheProgress(): {
  totalSlots: number;
  totalTasks: number;
  slotsWithTasks: number;
  byExam: Record<ExamType, { slots: number; tasks: number; filled: number }>;
} {
  const slots = listAllTaskSlots();
  let totalTasks = 0;
  let slotsWithTasks = 0;
  const byExam: Record<ExamType, { slots: number; tasks: number; filled: number }> = {
    matura_podstawowa: { slots: 0, tasks: 0, filled: 0 },
    matura_rozszerzona: { slots: 0, tasks: 0, filled: 0 },
    "8_klasa": { slots: 0, tasks: 0, filled: 0 },
  };

  for (const slot of slots) {
    const n = countTasksInCache(slot);
    byExam[slot.exam_type].slots += 1;
    byExam[slot.exam_type].tasks += n;
    if (n > 0) {
      byExam[slot.exam_type].filled += 1;
      slotsWithTasks += 1;
    }
    totalTasks += n;
  }

  return { totalSlots: slots.length, totalTasks, slotsWithTasks, byExam };
}

export function listTaskSlotsNeedingMore(targetPerTopic: number, exam?: ExamType): TaskSlot[] {
  return listAllTaskSlots()
    .filter((slot) => !exam || slot.exam_type === exam)
    .filter((slot) => countTasksInCache(slot) < targetPerTopic);
}

export function allTaskFingerprints(): Set<string> {
  const fps = new Set<string>();
  for (const slot of listAllTaskSlots()) {
    const bundle = readTaskCache(slot);
    for (const task of bundle?.tasks ?? []) {
      fps.add(task.content.trim().replace(/\s+/g, " ").toLowerCase().slice(0, 160));
    }
  }
  return fps;
}

export function listAllCachedTasks(): Array<CachedGeminiTask & Pick<TaskSlot, "exam_type" | "category" | "topic">> {
  const out: Array<CachedGeminiTask & Pick<TaskSlot, "exam_type" | "category" | "topic">> = [];
  for (const slot of listAllTaskSlots()) {
    const bundle = readTaskCache(slot);
    for (const task of bundle?.tasks ?? []) {
      out.push({
        ...task,
        exam_type: slot.exam_type,
        category: slot.category,
        topic: slot.topic,
      });
    }
  }
  return out;
}
