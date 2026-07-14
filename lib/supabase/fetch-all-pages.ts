import type { PostgrestError } from "@supabase/supabase-js";

const PAGE_SIZE = 1000;

type PageResult<T> = {
  data: T[] | null;
  error: PostgrestError | null;
};

/**
 * Pobiera wszystkie wiersze stronicowaniem (PostgREST domyślnie max 1000/stronę).
 */
export async function fetchAllPages<T>(
  fetchPage: (from: number, to: number) => PromiseLike<PageResult<T>>,
): Promise<{ rows: T[]; error: PostgrestError | null }> {
  const rows: T[] = [];
  let from = 0;

  for (;;) {
    const { data, error } = await fetchPage(from, from + PAGE_SIZE - 1);
    if (error) return { rows, error };

    const page = data ?? [];
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return { rows, error: null };
}
