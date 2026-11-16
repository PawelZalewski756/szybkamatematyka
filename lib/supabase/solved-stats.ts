import { fetchAllPages } from "@/lib/supabase/fetch-all-pages";
import { dateKeyInTimeZone, shiftDateKey } from "@/lib/format/date";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Statystyki rozwiązanych zadań (`public.solved_tasks`).
 *
 * Tabela ma RLS „tylko własne wiersze”, więc liczby dla całej platformy
 * (panel admina, bot Telegram) wymagają klienta z kluczem service_role.
 * Tutaj jest wspólna warstwa: pobranie wierszy + czyste funkcje agregujące,
 * żeby panel i bot liczyły dokładnie to samo.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/** Zabezpieczenie pamięci: powyżej tylu wierszy agregacja jest ucinana. */
export const SOLVED_STATS_MAX_ROWS = 200_000;

export type SolvedTaskRow = {
  user_id: string;
  solved_at: string;
};

export type SolvedStats = {
  /** Łącznie i w oknach 7/30 dni. */
  total: number;
  last7: number;
  last30: number;
  /** Uczniowie z co najmniej jednym rozwiązanym zadaniem. */
  students: number;
  /** user_id → liczba unikalnych rozwiązanych zadań. */
  perUser: Map<string, number>;
  /** Dni z aktywnością (ostatnie 30 dni, rosnąco). */
  daily: { date: string; count: number }[];
  /** true, gdy wierszy było więcej niż limit i pominięto najstarsze. */
  truncated: boolean;
};

export function emptySolvedStats(): SolvedStats {
  return {
    total: 0,
    last7: 0,
    last30: 0,
    students: 0,
    perUser: new Map(),
    daily: [],
    truncated: false,
  };
}

function parseTimestamp(value: unknown): number | null {
  if (typeof value !== "string" || !value) return null;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : null;
}

/**
 * Czysta agregacja - bez I/O, dzięki czemu pokrywa ją test jednostkowy.
 * `rows` mogą być nieposortowane i zawierać duplikaty (user_id, solved_at).
 */
export function summarizeSolvedTasks(
  rows: readonly SolvedTaskRow[],
  now: Date = new Date(),
  windowDays = 30,
): SolvedStats {
  const nowMs = now.getTime();
  const since7 = nowMs - 7 * DAY_MS;
  const since30 = nowMs - 30 * DAY_MS;

  const perUser = new Map<string, number>();
  const days = windowDays > 0 ? windowDays : 30;
  const dailyCounts = new Map<string, number>();
  for (let index = days - 1; index >= 0; index -= 1) {
    dailyCounts.set(shiftDateKey(dateKeyInTimeZone(now), -index), 0);
  }

  let total = 0;
  let last7 = 0;
  let last30 = 0;

  for (const row of rows) {
    const userId = typeof row.user_id === "string" ? row.user_id : "";
    if (!userId) continue;

    total += 1;
    perUser.set(userId, (perUser.get(userId) ?? 0) + 1);

    const solvedMs = parseTimestamp(row.solved_at);
    if (solvedMs === null) continue;
    if (solvedMs >= since7) last7 += 1;
    if (solvedMs >= since30) last30 += 1;

    const key = dateKeyInTimeZone(new Date(solvedMs));
    if (dailyCounts.has(key)) {
      dailyCounts.set(key, (dailyCounts.get(key) ?? 0) + 1);
    }
  }

  return {
    total,
    last7,
    last30,
    students: perUser.size,
    perUser,
    daily: [...dailyCounts.entries()].map(([date, count]) => ({ date, count })),
    truncated: false,
  };
}

/** Pobiera wiersze solved_tasks (service_role omija RLS; anon widzi tylko własne). */
export async function fetchSolvedTaskRows(
  supabase: SupabaseClient,
  options: { userIds?: readonly string[]; maxRows?: number } = {},
): Promise<{ rows: SolvedTaskRow[]; truncated: boolean; error: string | null }> {
  const maxRows = options.maxRows ?? SOLVED_STATS_MAX_ROWS;

  if (options.userIds && options.userIds.length === 0) {
    return { rows: [], truncated: false, error: null };
  }

  const loadWithTimestamp = () =>
    fetchAllPages<{ user_id: string; solved_at: string | null }>((from, to) => {
      let query = supabase
        .from("solved_tasks")
        .select("user_id, solved_at")
        // Stabilna kolejność jest konieczna przy równoległym stronicowaniu.
        .order("solved_at", { ascending: false })
        .order("user_id", { ascending: true })
        .range(from, to);

      if (options.userIds?.length) {
        query = query.in("user_id", [...options.userIds]);
      }

      return query;
    });

  const loadIdsOnly = () =>
    fetchAllPages<{ user_id: string }>((from, to) => {
      let query = supabase
        .from("solved_tasks")
        .select("user_id")
        .order("user_id", { ascending: true })
        .range(from, to);

      if (options.userIds?.length) {
        query = query.in("user_id", [...options.userIds]);
      }

      return query;
    });

  const result = await loadWithTimestamp();
  let rows: SolvedTaskRow[] = (result.rows ?? []).map((row) => ({
    user_id: String(row.user_id ?? ""),
    solved_at: row.solved_at ?? "",
  }));

  if (result.error && /solved_at/i.test(result.error.message)) {
    // Starsza instalacja bez kolumny solved_at - liczymy przynajmniej sumy
    // i uczniów, zamiast wywalać całą komendę.
    const fallback = await loadIdsOnly();
    if (fallback.error) {
      return { rows: [], truncated: false, error: fallback.error.message };
    }
    rows = (fallback.rows ?? []).map((row) => ({
      user_id: String(row.user_id ?? ""),
      solved_at: "",
    }));
  } else if (result.error) {
    return { rows: [], truncated: false, error: result.error.message };
  }

  const truncated = rows.length > maxRows;
  return {
    rows: truncated ? rows.slice(0, maxRows) : rows,
    truncated,
    error: null,
  };
}

/** Pełne statystyki; `userIds` zawęża zapytanie do wskazanych uczniów. */
export async function fetchSolvedStats(
  supabase: SupabaseClient,
  options: { userIds?: readonly string[]; now?: Date } = {},
): Promise<SolvedStats> {
  const { rows, truncated, error } = await fetchSolvedTaskRows(
    supabase,
    options,
  );
  if (error) throw new Error(`Nie udało się odczytać solved_tasks: ${error}`);

  const stats = summarizeSolvedTasks(rows, options.now ?? new Date());

  // Uczniowie bez rozwiązań też muszą mieć jawne 0 - inaczej UI pokazuje „?”.
  if (options.userIds?.length) {
    for (const id of options.userIds) {
      if (!stats.perUser.has(id)) stats.perUser.set(id, 0);
    }
  }

  return { ...stats, truncated };
}

/** Liczba rozwiązań per uczeń - wygodne dla listy użytkowników w bocie. */
export function solvedCountFor(stats: SolvedStats, userId: string): number {
  return stats.perUser.get(userId) ?? 0;
}
