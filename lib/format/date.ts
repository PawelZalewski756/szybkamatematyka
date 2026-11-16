/**
 * Spójne liczenie dni w aplikacji.
 *
 * Wcześniej `todayDateString()` korzystało z `toISOString()`, czyli daty UTC.
 * W Polsce między północą a 1:00/2:00 UTC pokazuje jeszcze wczoraj, przez co
 * seria nauki nie rosła, a dzisiejsza aktywność lądowała pod wczorajszą datą.
 */

export const APP_TIME_ZONE = "Europe/Warsaw";

/** Data w formacie YYYY-MM-DD w podanej strefie (domyślnie polskiej). */
export function dateKeyInTimeZone(
  date: Date = new Date(),
  timeZone: string = APP_TIME_ZONE,
): string {
  try {
    // formatToParts zamiast format(): wynik nie zależy od domyślnego układu
    // daty w locale (en-CA potrafi zwrócić MM/DD/YYYY w niektórych silnikach).
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(date);
    const value = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((part) => part.type === type)?.value ?? "";
    const year = value("year");
    const month = value("month");
    const day = value("day");
    if (!year || !month || !day) return localDateKey(date);
    return `${year}-${month}-${day}`;
  } catch {
    return localDateKey(date);
  }
}

/** Data YYYY-MM-DD według zegara urządzenia (bez konwersji do UTC). */
export function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Dzisiejsza data w polskiej strefie - jedno źródło prawdy dla serii i statystyk. */
export function todayDateKey(): string {
  return dateKeyInTimeZone(new Date());
}

/** Data YYYY-MM-DD przesunięta o `days` dni (ujemne = wstecz). */
export function shiftDateKey(dateKey: string, days: number): string {
  const base = new Date(`${dateKey}T12:00:00`);
  base.setDate(base.getDate() + days);
  return localDateKey(base);
}
