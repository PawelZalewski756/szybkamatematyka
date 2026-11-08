export function isValidCountedPath(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= 200 &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !/[?#\r\n]/.test(value)
  );
}

/** Ścieżki, których nie liczymy (panel, API, pliki techniczne). */
export function isCountablePath(path: string): boolean {
  return !(
    path.startsWith("/admin") ||
    path.startsWith("/api") ||
    path.startsWith("/_next")
  );
}

export type DailyViews = { day: string; views: number };

export function sumViews(rows: DailyViews[], lastDays: number, today: Date): number {
  const from = new Date(today);
  from.setDate(from.getDate() - (lastDays - 1));
  const fromKey = from.toISOString().slice(0, 10);
  return rows.reduce((sum, r) => (r.day >= fromKey ? sum + r.views : sum), 0);
}
