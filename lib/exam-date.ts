/** Data egzaminu wybrana przez ucznia (localStorage, bez synchronizacji z kontem). */
export const EXAM_DATE_STORAGE_KEY = "szybka-matma-exam-date";
export const EXAM_DATE_EVENT = "szybka-matma-exam-date-change";

/** Czy tekst jest poprawną datą w formacie YYYY-MM-DD (bez „2026-02-31”). */
export function isValidExamDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return false;
  const parsed = new Date(year, month - 1, day, 12, 0, 0, 0);
  return (
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day
  );
}

/**
 * Liczba dni do egzaminu (0 = dziś, ujemna = po terminie).
 * Liczymy po lokalnych datach, bez godzin - DST nie zmienia wyniku.
 */
export function daysUntilExam(date: string, now: Date = new Date()): number | null {
  if (!isValidExamDate(date)) return null;
  const [year, month, day] = date.split("-").map(Number);
  const target = Date.UTC(year, month - 1, day);
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target - today) / 86_400_000);
}

/** Czytelna data, np. „12 maja 2027”. */
export function examDateLabel(date: string): string {
  if (!isValidExamDate(date)) return date;
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day, 12, 0, 0, 0));
}

export function loadExamDate(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(EXAM_DATE_STORAGE_KEY);
    return stored && isValidExamDate(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function saveExamDate(date: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (date && isValidExamDate(date)) {
      window.localStorage.setItem(EXAM_DATE_STORAGE_KEY, date);
    } else {
      window.localStorage.removeItem(EXAM_DATE_STORAGE_KEY);
    }
    window.dispatchEvent(new Event(EXAM_DATE_EVENT));
  } catch {
    /* ignore */
  }
}

export function subscribeExamDate(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EXAM_DATE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EXAM_DATE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}
