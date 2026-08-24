import type { ExamType } from "@/types/database";

export type TopicMasteryRecord = {
  examType: ExamType;
  category: string;
  topic: string;
  attempts: number;
  correct: number;
  lastDifficulty: number | null;
  lastResult: "correct" | "wrong" | null;
  lastActivityAt: number;
  streakCorrect: number;
  trendDelta: number;
};

export type MasteryBand = "weak" | "building" | "strong";

const DAY_MS = 24 * 60 * 60 * 1000;

export function masteryKey(
  examType: ExamType,
  category: string,
  topic: string,
): string {
  return `${examType}:${category}:${topic}`;
}

/**
 * 0–100. XP nie wchodzi do wzoru — tylko próby, skuteczność i świeżość.
 */
export function masteryScore(
  record: TopicMasteryRecord,
  now = Date.now(),
): number {
  if (record.attempts <= 0) return 0;
  const accuracy = record.correct / record.attempts;
  const volume = Math.min(1, record.attempts / 8);
  const days = Math.max(0, (now - record.lastActivityAt) / DAY_MS);
  const recency = Math.exp(-days / 21);
  const trend = Math.max(-0.08, Math.min(0.08, record.trendDelta));
  const lastWrong = record.lastResult === "wrong" ? 0.92 : 1;
  const raw = (0.62 * accuracy + 0.23 * volume + 0.15 * recency + trend) * 100 * lastWrong;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

export function masteryBand(
  score: number,
  attempts: number,
): MasteryBand {
  if (attempts < 3) return "building";
  if (score < 50) return "weak";
  if (score >= 75) return "strong";
  return "building";
}

export function applyAttempt(
  current: TopicMasteryRecord | undefined,
  input: {
    examType: ExamType;
    category: string;
    topic: string;
    correct: boolean;
    difficulty?: number | null;
    now?: number;
  },
): TopicMasteryRecord {
  const now = input.now ?? Date.now();
  const attempts = (current?.attempts ?? 0) + 1;
  const correct = (current?.correct ?? 0) + (input.correct ? 1 : 0);
  const oldAcc = current && current.attempts > 0 ? current.correct / current.attempts : 0;
  const newAcc = correct / attempts;
  return {
    examType: input.examType,
    category: input.category,
    topic: input.topic,
    attempts,
    correct,
    lastDifficulty: input.difficulty ?? current?.lastDifficulty ?? null,
    lastResult: input.correct ? "correct" : "wrong",
    lastActivityAt: now,
    streakCorrect: input.correct ? (current?.streakCorrect ?? 0) + 1 : 0,
    trendDelta: newAcc - oldAcc,
  };
}

export function averageMasteryScore(
  records: TopicMasteryRecord[],
  now = Date.now(),
): number {
  const active = records.filter((record) => record.attempts > 0);
  if (active.length === 0) return 0;
  const sum = active.reduce((total, record) => total + masteryScore(record, now), 0);
  return Math.round(sum / active.length);
}
