import type { SprawdzianResult } from "@/lib/sprawdziany/types";

const STORAGE_KEY = "szybka-matma:sprawdziany-history";
const MAX_ENTRIES = 30;

function isResult(value: unknown): value is SprawdzianResult {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.date === "string" &&
    typeof v.total === "number" &&
    typeof v.correct === "number" &&
    typeof v.byTopic === "object" &&
    v.byTopic !== null
  );
}

export function loadSprawdzianHistory(): SprawdzianResult[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) ?? "[]",
    );
    return Array.isArray(parsed) ? parsed.filter(isResult) : [];
  } catch {
    return [];
  }
}

export function saveSprawdzianResult(result: SprawdzianResult): void {
  if (typeof window === "undefined") return;
  try {
    const next = [result, ...loadSprawdzianHistory()].slice(0, MAX_ENTRIES);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Brak miejsca / tryb prywatny — historia jest opcjonalna.
  }
}

/** Łączny wynik na temat ze wszystkich zapisanych sprawdzianów. */
export function aggregateByTopic(
  history: readonly SprawdzianResult[],
): Record<string, { correct: number; total: number }> {
  const acc: Record<string, { correct: number; total: number }> = {};
  for (const r of history) {
    for (const [id, v] of Object.entries(r.byTopic)) {
      const e = (acc[id] ??= { correct: 0, total: 0 });
      e.correct += v.correct;
      e.total += v.total;
    }
  }
  return acc;
}
