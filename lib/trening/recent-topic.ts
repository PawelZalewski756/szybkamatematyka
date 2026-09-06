import type { TreningExamKey } from "@/lib/trening/curriculum";

export type RecentTrainingTopic = {
  examKey: TreningExamKey;
  category: string;
  topic: string;
  visitedAt: number;
};

const STORAGE_PREFIX = "szybka-matma-last-training-topic";

function storageKey(userId: string | null): string {
  return `${STORAGE_PREFIX}:${userId ?? "guest"}`;
}

function isExamKey(value: unknown): value is TreningExamKey {
  return value === "matura_podstawowa" || value === "8_klasa";
}

function parseTopic(raw: string | null): RecentTrainingTopic | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (
      !isExamKey(parsed.examKey) ||
      typeof parsed.category !== "string" ||
      !parsed.category ||
      typeof parsed.topic !== "string" ||
      !parsed.topic
    ) {
      return null;
    }

    return {
      examKey: parsed.examKey,
      category: parsed.category,
      topic: parsed.topic,
      visitedAt:
        typeof parsed.visitedAt === "number" && Number.isFinite(parsed.visitedAt)
          ? parsed.visitedAt
          : Date.now(),
    };
  } catch {
    return null;
  }
}

export function loadRecentTrainingTopic(
  userId: string | null = null,
): RecentTrainingTopic | null {
  if (typeof window === "undefined") return null;

  try {
    return parseTopic(localStorage.getItem(storageKey(userId)));
  } catch {
    return null;
  }
}

export function saveRecentTrainingTopic(
  topic: Omit<RecentTrainingTopic, "visitedAt">,
  userId: string | null = null,
): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(
      storageKey(userId),
      JSON.stringify({ ...topic, visitedAt: Date.now() }),
    );
  } catch {
    // Local progress is an enhancement; a blocked storage must not break a lesson.
  }
}
