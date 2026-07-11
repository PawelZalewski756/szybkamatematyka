import fs from "fs";
import path from "path";
import { listCkeTopicsForExam } from "@/lib/trening/cke-curriculum";
import { isPhase3aTheoryLesson } from "@/lib/gemini/format-theory";
import type { ExamType } from "@/types/database";

export const THEORY_CACHE_DIR = path.resolve(process.cwd(), "data/theory-cache");

export type TheorySlot = {
  exam_type: ExamType;
  category: string;
  topic: string;
  categoryName: string;
  topicName: string;
};

export function theorySlotKey(slot: Pick<TheorySlot, "exam_type" | "category" | "topic">): string {
  return `${slot.exam_type}:${slot.category}:${slot.topic}`;
}

export function theoryCacheFileName(slot: Pick<TheorySlot, "exam_type" | "category" | "topic">): string {
  return `${slot.exam_type}__${slot.category}__${slot.topic}.json`;
}

export function theoryCachePath(slot: Pick<TheorySlot, "exam_type" | "category" | "topic">): string {
  return path.join(THEORY_CACHE_DIR, theoryCacheFileName(slot));
}

export function listAllTheorySlots(): TheorySlot[] {
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

export type CachedTheoryFile = {
  exam_type: ExamType;
  category: string;
  topic: string;
  title: string;
  content: string;
};

export function readTheoryCache(
  slot: Pick<TheorySlot, "exam_type" | "category" | "topic">,
): CachedTheoryFile | null {
  const file = theoryCachePath(slot);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as CachedTheoryFile;
  } catch {
    return null;
  }
}

export function isCompleteTheoryCache(entry: CachedTheoryFile | null): boolean {
  if (!entry?.content?.trim()) return false;
  return isPhase3aTheoryLesson(entry.content);
}

export function listIncompleteTheorySlots(): TheorySlot[] {
  return listAllTheorySlots().filter((slot) => !isCompleteTheoryCache(readTheoryCache(slot)));
}

export function countTheoryCacheProgress(): {
  total: number;
  complete: number;
  missing: number;
} {
  const slots = listAllTheorySlots();
  const complete = slots.filter((slot) =>
    isCompleteTheoryCache(readTheoryCache(slot)),
  ).length;
  return {
    total: slots.length,
    complete,
    missing: slots.length - complete,
  };
}
