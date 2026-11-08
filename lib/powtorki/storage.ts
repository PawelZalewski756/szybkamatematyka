import type { ReviewItem, ReviewSchedule } from "@/lib/powtorki/types";

const STORAGE_PREFIX = "szybka-matma-powtorki";

export const REVIEW_SCHEDULE_UPDATED_EVENT =
  "szybka-matma-powtorki-updated";

export type ReviewScheduleUpdatedDetail = {
  userId: string | null;
};

function storageKey(userId: string | null): string {
  return userId ? `${STORAGE_PREFIX}:${userId}` : `${STORAGE_PREFIX}:guest`;
}

function isReviewItem(value: unknown): value is ReviewItem {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.taskId === "string" &&
    typeof v.repetitions === "number" &&
    typeof v.intervalDays === "number" &&
    typeof v.easiness === "number" &&
    typeof v.nextReviewAt === "number" &&
    typeof v.addedAt === "number"
  );
}

export function loadSchedule(userId: string | null = null): ReviewSchedule {
  if (typeof window === "undefined") return {};

  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return {};
    const schedule: ReviewSchedule = {};
    for (const entry of parsed) {
      if (isReviewItem(entry)) {
        schedule[entry.taskId] = entry;
      }
    }
    return schedule;
  } catch {
    return {};
  }
}

export function saveSchedule(
  schedule: ReviewSchedule,
  userId: string | null = null,
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      storageKey(userId),
      JSON.stringify(Object.values(schedule)),
    );
  } catch {
    /* localStorage pełny/niedostępny - ignorujemy, stan w pamięci pozostaje */
  }
}

export function notifyScheduleUpdated(userId: string | null): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<ReviewScheduleUpdatedDetail>(
      REVIEW_SCHEDULE_UPDATED_EVENT,
      { detail: { userId } },
    ),
  );
}
