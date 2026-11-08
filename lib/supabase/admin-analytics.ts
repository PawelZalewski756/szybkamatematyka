import { calculateLevel } from "@/lib/levelSystem";
import { getSupabase } from "@/lib/supabase";
import { isPostgrestUndefinedColumnError } from "@/lib/supabase/errors";
import type { PostgrestError } from "@supabase/supabase-js";

/**
 * Analityka panelu admina.
 *
 * Liczymy WYŁĄCZNIE to, co da się odpytać klientem anon/sesją w granicach RLS:
 *  - `profiles` ma publiczny SELECT (profiles_select_public → anon, authenticated),
 *    więc agregacje po graczach (XP, poziomy, serie, aktywność) działają.
 *  - `arkusze`, `zadania`, `tasks`, `materials` mają publiczny SELECT, więc liczymy
 *    liczności i rozkłady działów/kategorii.
 *
 * Czego NIE liczymy (i dlaczego):
 *  - `solved_tasks`, `daily_challenges`, `review_schedule` mają politykę *_select_own
 *    (using auth.uid() = user_id), więc klient sesji widzi tylko własne wiersze.
 *    Platformowa liczba rozwiązanych zadań wymagałaby service_role/SQL po stronie
 *    serwera - nie wymyślamy sekretów, więc tę metrykę pomijamy i opisujemy w `notes`.
 */

const PAGE_SIZE = 1000;

/** Wiersz profilu zredukowany do pól potrzebnych do agregacji. */
export type ProfileAnalyticsRow = {
  xp: number;
  minigryXp: number;
  streak: number;
  lastPlayedDate: string | null;
  createdAt: string | null;
};

export type LevelBucket = { level: number; count: number };
export type DistributionItem = { label: string; count: number };

export type PlayerStats = {
  totalPlayers: number;
  active7d: number;
  active30d: number;
  new7d: number;
  new30d: number;
  totalXp: number;
  avgXp: number;
  maxXp: number;
  totalMinigryXp: number;
  maxStreak: number;
  avgStreak: number;
  streak7Plus: number;
  levelDistribution: LevelBucket[];
};

export type ContentStats = {
  arkusze: number | null;
  zadania: number | null;
  tasks: number | null;
  materials: number | null;
  zadaniaByDzial: DistributionItem[];
  tasksByExam: DistributionItem[];
  materialsByExam: DistributionItem[];
};

export type AdminAnalytics = {
  players: PlayerStats;
  content: ContentStats;
  /** Opis metryk, których nie dało się policzyć (np. przez RLS). */
  notes: string[];
  generatedAt: string;
};

// ---------------------------------------------------------------------------
// Czyste funkcje agregujące (bez I/O) - łatwe do testów i ponownego użycia.
// ---------------------------------------------------------------------------

/** Czy data (YYYY-MM-DD lub ISO) mieści się w ostatnich `days` dniach od `now`. */
export function isWithinDays(
  date: string | null,
  now: Date,
  days: number,
): boolean {
  if (!date) return false;
  const parsed = new Date(date.length <= 10 ? `${date}T12:00:00` : date);
  const time = parsed.getTime();
  if (Number.isNaN(time)) return false;
  if (time > now.getTime()) return true; // data „z przyszłości” traktujemy jako aktywną dziś
  const diffDays = (now.getTime() - time) / (1000 * 60 * 60 * 24);
  return diffDays <= days;
}

/** Rozkład poziomów (z XP) - posortowany rosnąco po numerze poziomu. */
export function computeLevelDistribution(
  rows: ProfileAnalyticsRow[],
): LevelBucket[] {
  const counts = new Map<number, number>();
  for (const row of rows) {
    const level = calculateLevel(row.xp);
    counts.set(level, (counts.get(level) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([level, count]) => ({ level, count }))
    .sort((a, b) => a.level - b.level);
}

/** Rozkład wartości tekstowych (np. działów) - posortowany malejąco po liczbie. */
export function buildDistribution(values: string[]): DistributionItem[] {
  const counts = new Map<string, number>();
  for (const raw of values) {
    const label = (raw ?? "").trim() || "Nieprzypisane";
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "pl"));
}

export function computePlayerStats(
  rows: ProfileAnalyticsRow[],
  now: Date = new Date(),
): PlayerStats {
  const totalPlayers = rows.length;

  let active7d = 0;
  let active30d = 0;
  let new7d = 0;
  let new30d = 0;
  let totalXp = 0;
  let maxXp = 0;
  let totalMinigryXp = 0;
  let maxStreak = 0;
  let totalStreak = 0;
  let streak7Plus = 0;

  for (const row of rows) {
    if (isWithinDays(row.lastPlayedDate, now, 7)) active7d += 1;
    if (isWithinDays(row.lastPlayedDate, now, 30)) active30d += 1;
    if (isWithinDays(row.createdAt, now, 7)) new7d += 1;
    if (isWithinDays(row.createdAt, now, 30)) new30d += 1;

    totalXp += row.xp;
    if (row.xp > maxXp) maxXp = row.xp;
    totalMinigryXp += row.minigryXp;

    if (row.streak > maxStreak) maxStreak = row.streak;
    totalStreak += row.streak;
    if (row.streak >= 7) streak7Plus += 1;
  }

  return {
    totalPlayers,
    active7d,
    active30d,
    new7d,
    new30d,
    totalXp,
    avgXp: totalPlayers > 0 ? Math.round(totalXp / totalPlayers) : 0,
    maxXp,
    totalMinigryXp,
    maxStreak,
    avgStreak:
      totalPlayers > 0
        ? Math.round((totalStreak / totalPlayers) * 10) / 10
        : 0,
    streak7Plus,
    levelDistribution: computeLevelDistribution(rows),
  };
}

// ---------------------------------------------------------------------------
// Warstwa I/O (Supabase, klient anon/sesja).
// ---------------------------------------------------------------------------

/** Łańcuch SELECT-ów profili z degradacją, gdy część kolumn nie istnieje. */
const PROFILE_SELECT_CHAIN = [
  "xp, minigry_xp, streak, last_played_date, created_at",
  "xp, streak, last_played_date, created_at",
  "xp, last_played_date, created_at",
  "xp, created_at",
  "xp",
] as const;

type RawProfileRow = {
  xp?: number | null;
  minigry_xp?: number | null;
  streak?: number | null;
  last_played_date?: string | null;
  created_at?: string | null;
};

function mapProfileRow(row: RawProfileRow): ProfileAnalyticsRow {
  return {
    xp: Number(row.xp) || 0,
    minigryXp: Number(row.minigry_xp) || 0,
    streak: Number(row.streak) || 0,
    lastPlayedDate: row.last_played_date ?? null,
    createdAt: row.created_at ?? null,
  };
}

/** Pobiera wszystkie wiersze danej kolumny/-n stronicowaniem (limit RLS 1000/stronę). */
async function fetchAllPages<T>(
  table: string,
  select: string,
): Promise<{ rows: T[]; error: PostgrestError | null }> {
  const supabase = getSupabase();
  const rows: T[] = [];
  let from = 0;

  for (;;) {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .range(from, from + PAGE_SIZE - 1);

    if (error) return { rows, error: error as PostgrestError };

    const page = (data ?? []) as T[];
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return { rows, error: null };
}

async function fetchProfileRows(): Promise<ProfileAnalyticsRow[]> {
  let lastError: PostgrestError | null = null;

  for (const select of PROFILE_SELECT_CHAIN) {
    const { rows, error } = await fetchAllPages<RawProfileRow>(
      "profiles",
      select,
    );
    if (!error) return rows.map(mapProfileRow);
    if (!isPostgrestUndefinedColumnError(error)) {
      throw error;
    }
    lastError = error;
  }

  // Wszystkie warianty SELECT zawiodły na brakujących kolumnach.
  if (lastError) throw lastError;
  return [];
}

/** Liczy wiersze tabeli (head + count exact). Zwraca null przy błędzie/braku tabeli. */
async function countRows(table: string): Promise<number | null> {
  const supabase = getSupabase();
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });
  if (error) return null;
  return count ?? 0;
}

/** Pobiera pojedynczą kolumnę tekstową ze wszystkich wierszy (best-effort). */
async function fetchColumnValues(
  table: string,
  column: string,
): Promise<string[]> {
  const { rows, error } = await fetchAllPages<Record<string, unknown>>(
    table,
    column,
  );
  if (error) return [];
  return rows.map((row) => String(row[column] ?? ""));
}

const EXAM_TYPE_LABELS: Record<string, string> = {
  matura_podstawowa: "Matura podstawowa",
  matura_rozszerzona: "Matura rozszerzona",
  "8_klasa": "Egzamin 8-klasisty",
};

function labelExamType(value: string): string {
  return EXAM_TYPE_LABELS[value] ?? (value || "Nieprzypisane");
}

async function fetchContentStats(notes: string[]): Promise<ContentStats> {
  const [arkusze, zadania, tasks, materials] = await Promise.all([
    countRows("arkusze"),
    countRows("zadania"),
    countRows("tasks"),
    countRows("materials"),
  ]);

  const [dzialValues, taskExamValues, materialExamValues] = await Promise.all([
    fetchColumnValues("zadania", "dzial"),
    fetchColumnValues("tasks", "exam_type"),
    fetchColumnValues("materials", "exam_type"),
  ]);

  if (arkusze === null) notes.push("Nie udało się policzyć arkuszy (Supabase).");
  if (zadania === null) notes.push("Nie udało się policzyć zadań (Supabase).");
  if (tasks === null)
    notes.push("Nie udało się policzyć zadań treningowych (Supabase).");
  if (materials === null)
    notes.push("Nie udało się policzyć materiałów (Supabase).");

  return {
    arkusze,
    zadania,
    tasks,
    materials,
    zadaniaByDzial: buildDistribution(dzialValues),
    tasksByExam: buildDistribution(taskExamValues.map(labelExamType)),
    materialsByExam: buildDistribution(materialExamValues.map(labelExamType)),
  };
}

/**
 * Pobiera i agreguje wszystkie metryki panelu analityki.
 *
 * Rzuca tylko gdy nie da się odczytać profili (rdzeń analityki). Braki w
 * sekcji treści degradują łagodnie (null + wpis w `notes`).
 */
export async function fetchAdminAnalytics(): Promise<AdminAnalytics> {
  const notes: string[] = [
    "Liczba rozwiązanych zadań w skali platformy nie jest liczona - tabele " +
      "solved_tasks / daily_challenges / review_schedule mają RLS „tylko własne " +
      "wiersze”, więc klient sesji nie widzi danych innych graczy (wymagałoby to " +
      "service_role po stronie serwera).",
  ];

  const profileRows = await fetchProfileRows();
  const players = computePlayerStats(profileRows);
  const content = await fetchContentStats(notes);

  return {
    players,
    content,
    notes,
    generatedAt: new Date().toISOString(),
  };
}
