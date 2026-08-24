import type { PostgrestError } from "@supabase/supabase-js";

/**
 * PostgreSQL 42703 lub PostgREST PGRST204 — brakująca kolumna (nie ogólne „column” w treści).
 * Gdy podasz `column`, dopasowanie jest węższe (np. tylko avatar_url).
 */
export function isPostgrestUndefinedColumnError(
  error: PostgrestError | null,
  column?: string,
): boolean {
  if (!error) return false;

  if (error.code === "42703") {
    if (!column) return true;
    return error.message.toLowerCase().includes(column.toLowerCase());
  }

  if (error.code === "PGRST204") {
    if (!column) return true;
    const col = column.toLowerCase();
    const msg = error.message.toLowerCase();
    return (
      msg.includes(`'${col}'`) ||
      msg.includes(`column '${col}'`) ||
      msg.includes(`.${col} `) ||
      msg.includes(`.${col} does not exist`)
    );
  }

  return false;
}

/** Błąd Supabase: tabele nie zostały utworzone (brak migracji SQL). */
export function isSchemaMissingError(message: string | null | undefined): boolean {
  if (!message) return false;
  return /could not find the table|relation .* does not exist|schema cache/i.test(
    message,
  );
}

/** PostgreSQL 42703 / PostgREST — brakująca kolumna w treści błędu. */
export function isPostgrestColumnMissingMessage(
  message: string | null | undefined,
): boolean {
  if (!message) return false;
  return /column\s+[\w.]+\s+does not exist|PGRST204/i.test(message);
}

export function formatSupabaseErrorForUser(message: string): string {
  if (isSchemaMissingError(message)) {
    return "Tabele arkusze i zadania nie istnieją w Supabase. Uruchom migrację SQL (instrukcja poniżej).";
  }
  if (isPostgrestColumnMissingMessage(message)) {
    return "Baza profilu wymaga aktualizacji — uruchom migrację SQL w Supabase (supabase/migrations/add_profile_streak_columns.sql).";
  }
  if (/typeerror:\s*fetch failed|failed to fetch|networkerror/i.test(message)) {
    return "Nie udało się połączyć z bazą. Spróbuj ponownie za chwilę.";
  }
  return "Nie udało się wczytać danych. Spróbuj ponownie za chwilę.";
}
