import {
  applyAttempt,
  masteryKey,
  type TopicMasteryRecord,
} from "@/lib/learning/mastery";
import { getSupabaseOrNull } from "@/lib/supabase";
import type { ExamType } from "@/types/database";

const STORAGE_PREFIX = "szybka-matma-topic-mastery";
export const MASTERY_UPDATED_EVENT = "szybka-matma-mastery-updated";

function storageKey(userId: string | null): string {
  return `${STORAGE_PREFIX}:${userId ?? "guest"}`;
}

function isExamType(value: unknown): value is ExamType {
  return (
    value === "matura_podstawowa" ||
    value === "matura_rozszerzona" ||
    value === "8_klasa"
  );
}

function parseRecord(raw: unknown): TopicMasteryRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  if (!isExamType(row.examType)) return null;
  if (typeof row.category !== "string" || typeof row.topic !== "string") return null;
  return {
    examType: row.examType,
    category: row.category,
    topic: row.topic,
    attempts: Math.max(0, Number(row.attempts) || 0),
    correct: Math.max(0, Number(row.correct) || 0),
    lastDifficulty:
      typeof row.lastDifficulty === "number" ? row.lastDifficulty : null,
    lastResult:
      row.lastResult === "correct" || row.lastResult === "wrong"
        ? row.lastResult
        : null,
    lastActivityAt: Number(row.lastActivityAt) || Date.now(),
    streakCorrect: Math.max(0, Number(row.streakCorrect) || 0),
    trendDelta: Number(row.trendDelta) || 0,
  };
}

export function loadLocalMastery(userId: string | null): TopicMasteryRecord[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(parseRecord).filter((row): row is TopicMasteryRecord => row !== null);
  } catch {
    return [];
  }
}

export function saveLocalMastery(
  userId: string | null,
  records: TopicMasteryRecord[],
): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(records));
    window.dispatchEvent(new Event(MASTERY_UPDATED_EVENT));
  } catch {
    /* ignore quota */
  }
}

function upsertLocal(
  userId: string | null,
  next: TopicMasteryRecord,
): TopicMasteryRecord[] {
  const current = loadLocalMastery(userId);
  const key = masteryKey(next.examType, next.category, next.topic);
  const records = current.filter(
    (row) => masteryKey(row.examType, row.category, row.topic) !== key,
  );
  records.push(next);
  saveLocalMastery(userId, records);
  return records;
}

export async function recordTopicAttempt(input: {
  userId: string | null;
  examType: ExamType;
  category: string;
  topic: string;
  correct: boolean;
  difficulty?: number | null;
}): Promise<void> {
  const current = loadLocalMastery(input.userId).find(
    (row) =>
      row.examType === input.examType &&
      row.category === input.category &&
      row.topic === input.topic,
  );
  upsertLocal(
    input.userId,
    applyAttempt(current, {
      examType: input.examType,
      category: input.category,
      topic: input.topic,
      correct: input.correct,
      difficulty: input.difficulty,
    }),
  );

  if (!input.userId) return;
  const supabase = getSupabaseOrNull();
  if (!supabase) return;
  try {
    await supabase.rpc("record_topic_attempt", {
      p_exam_type: input.examType,
      p_category: input.category,
      p_topic: input.topic,
      p_correct: input.correct,
      p_difficulty: input.difficulty ?? null,
    });
  } catch {
    /* local copy remains */
  }
}

type RemoteMasteryRow = {
  exam_type?: string;
  category?: string;
  topic?: string;
  attempts?: number;
  correct?: number;
  last_difficulty?: number | null;
  last_result?: string | null;
  last_activity_at?: string;
  streak_correct?: number;
  trend_delta?: number;
};

export async function fetchRemoteMastery(
  userId: string,
): Promise<TopicMasteryRecord[]> {
  const supabase = getSupabaseOrNull();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("topic_mastery")
    .select(
      "exam_type, category, topic, attempts, correct, last_difficulty, last_result, last_activity_at, streak_correct, trend_delta",
    )
    .eq("user_id", userId);

  if (error || !data) return [];

  const records: TopicMasteryRecord[] = [];
  for (const row of data as RemoteMasteryRow[]) {
    if (!isExamType(row.exam_type) || !row.category || !row.topic) continue;
    records.push({
      examType: row.exam_type,
      category: row.category,
      topic: row.topic,
      attempts: Number(row.attempts) || 0,
      correct: Number(row.correct) || 0,
      lastDifficulty:
        typeof row.last_difficulty === "number" ? row.last_difficulty : null,
      lastResult:
        row.last_result === "correct" || row.last_result === "wrong"
          ? row.last_result
          : null,
      lastActivityAt: row.last_activity_at
        ? Date.parse(row.last_activity_at) || Date.now()
        : Date.now(),
      streakCorrect: Number(row.streak_correct) || 0,
      trendDelta: Number(row.trend_delta) || 0,
    });
  }
  return records;
}

export function mergeMastery(
  local: TopicMasteryRecord[],
  remote: TopicMasteryRecord[],
): TopicMasteryRecord[] {
  const map = new Map<string, TopicMasteryRecord>();
  for (const row of [...local, ...remote]) {
    const key = masteryKey(row.examType, row.category, row.topic);
    const previous = map.get(key);
    if (!previous || row.lastActivityAt >= previous.lastActivityAt) {
      map.set(key, row);
    }
  }
  return [...map.values()];
}
